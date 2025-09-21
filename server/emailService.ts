import nodemailer from 'nodemailer';
import { SmtpServer, Recipient, Campaign, EmailTemplate } from '@shared/schema';
import { storage } from './storage';

export interface EmailContent {
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    cid?: string;
  }>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initializeTransporter(smtpServer: SmtpServer): Promise<void> {
    this.transporter = nodemailer.createTransport({
      host: smtpServer.host,
      port: smtpServer.port,
      secure: smtpServer.secure,
      auth: {
        user: smtpServer.username,
        pass: smtpServer.password,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    } as any);

    // Verify the connection
    try {
      if (this.transporter) {
        await this.transporter.verify();
        console.log('SMTP connection verified successfully');
      }
    } catch (error) {
      console.error('SMTP verification failed:', error);
      throw new Error('Failed to verify SMTP connection');
    }
  }

  async sendEmail(
    to: string,
    from: string,
    content: EmailContent,
    trackingData?: {
      campaignId: string;
      recipientId: string;
      domain: string;
    }
  ): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email transporter not initialized',
        recipient: to,
      };
    }

    try {
      // Add tracking pixels and links if tracking data provided
      let htmlContent = content.html;
      if (trackingData) {
        htmlContent = this.addEmailTracking(content.html, trackingData);
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to,
        subject: content.subject,
        html: htmlContent,
        text: content.text,
        attachments: content.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: to,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipient: to,
      };
    }
  }

  private addEmailTracking(html: string, trackingData: {
    campaignId: string;
    recipientId: string;
    domain: string;
  }): string {
    const { campaignId, recipientId, domain } = trackingData;
    
    // Add tracking pixel for open tracking
    const trackingPixel = `<img src="https://${domain}/track/open/${campaignId}/${recipientId}" width="1" height="1" style="display:none;" />`;
    
    // Replace all links with tracking links
    const trackedHtml = html.replace(
      /href=["']([^"']+)["']/g,
      `href="https://${domain}/track/click/${campaignId}/${recipientId}?url=$1"`
    );
    
    // Add tracking pixel before closing body tag
    return trackedHtml.replace('</body>', `${trackingPixel}</body>`);
  }

  async testSmtpConnection(smtpConfig: any): Promise<boolean> {
    try {
      const transporter = this.createTransporter(smtpConfig);
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }

  async testSmtpAuthentication(smtpConfig: any): Promise<boolean> {
    try {
      const transporter = this.createTransporter(smtpConfig);
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP authentication test failed:', error);
      return false;
    }
  }

  private createTransporter(smtpConfig: any): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });
  }

  async sendTestEmail(smtpServer: SmtpServer, testEmail: string): Promise<EmailSendResult> {
    await this.initializeTransporter(smtpServer);
    
    const testContent: EmailContent = {
      subject: 'zSPAM - SMTP Test Email',
      html: `
        <h2>SMTP Configuration Test</h2>
        <p>If you receive this email, your SMTP server configuration is working correctly.</p>
        <p><strong>Server:</strong> ${smtpServer.host}:${smtpServer.port}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      text: 'SMTP configuration test successful',
    };

    return await this.sendEmail(testEmail, smtpServer.fromEmail, testContent);
  }

  async personalizeEmailContent(
    template: EmailTemplate,
    recipient: Recipient,
    campaign: Campaign
  ): Promise<EmailContent> {
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent || '';

    // Basic personalization variables
    const personalizations = {
      '{{name}}': recipient.name || recipient.firstName || 'User',
      '{{first_name}}': recipient.firstName || 'User',
      '{{last_name}}': recipient.lastName || '',
      '{{email}}': recipient.email,
      '{{company}}': recipient.company || '',
      '{{position}}': recipient.position || '',
      '{{department}}': recipient.department || '',
    };

    // Apply personalizations
    for (const [placeholder, value] of Object.entries(personalizations)) {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
      text = text.replace(regex, value);
    }

    return {
      subject,
      html,
      text,
    };
  }

  close(): void {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}

export const emailService = new EmailService();