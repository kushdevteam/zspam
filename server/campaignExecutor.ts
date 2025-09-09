import { Campaign, Recipient, EmailTemplate, SmtpServer } from '@shared/schema';
import { storage } from './storage';
import { emailService, EmailSendResult } from './emailService';

export interface CampaignExecutionOptions {
  batchSize?: number;
  delayBetweenBatches?: number; // in milliseconds
  delayBetweenEmails?: number; // in milliseconds
}

export interface CampaignExecutionResult {
  campaignId: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  errors: string[];
}

export class CampaignExecutor {
  private runningCampaigns = new Map<string, boolean>();

  async executeCampaign(
    campaignId: string,
    templateId: string,
    options: CampaignExecutionOptions = {}
  ): Promise<CampaignExecutionResult> {
    if (this.runningCampaigns.has(campaignId)) {
      throw new Error('Campaign is already running');
    }

    this.runningCampaigns.set(campaignId, true);

    const {
      batchSize = 50,
      delayBetweenBatches = 5000, // 5 seconds
      delayBetweenEmails = 1000, // 1 second
    } = options;

    const result: CampaignExecutionResult = {
      campaignId,
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      startTime: new Date(),
      status: 'running',
      errors: [],
    };

    try {
      // Get campaign data
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get email template
      const template = await storage.getEmailTemplate(templateId);
      if (!template) {
        throw new Error('Email template not found');
      }

      // Get active SMTP server
      const smtpServer = await storage.getActiveSmtpServer(campaign.userId!);
      if (!smtpServer) {
        throw new Error('No active SMTP server configured');
      }

      // Get recipients
      const recipients = await storage.getRecipients(campaignId);
      if (recipients.length === 0) {
        throw new Error('No recipients found for campaign');
      }

      result.totalRecipients = recipients.length;

      // Initialize email service
      await emailService.initializeTransporter(smtpServer);

      // Update campaign status to active
      await storage.updateCampaign(campaignId, { status: 'active' });

      // Send emails in batches
      await this.sendEmailsInBatches(
        campaign,
        template,
        smtpServer,
        recipients,
        result,
        { batchSize, delayBetweenBatches, delayBetweenEmails }
      );

      result.status = 'completed';
      result.endTime = new Date();

      // Update campaign status
      await storage.updateCampaign(campaignId, { 
        status: 'completed',
        endAt: result.endTime 
      });

      console.log(`Campaign ${campaignId} completed. Sent: ${result.sentCount}, Failed: ${result.failedCount}`);

    } catch (error) {
      result.status = 'failed';
      result.endTime = new Date();
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      await storage.updateCampaign(campaignId, { status: 'failed' });
      console.error(`Campaign ${campaignId} failed:`, error);
    } finally {
      this.runningCampaigns.delete(campaignId);
      emailService.close();
    }

    return result;
  }

  private async sendEmailsInBatches(
    campaign: Campaign,
    template: EmailTemplate,
    smtpServer: SmtpServer,
    recipients: Recipient[],
    result: CampaignExecutionResult,
    options: Required<CampaignExecutionOptions>
  ): Promise<void> {
    const { batchSize, delayBetweenBatches, delayBetweenEmails } = options;

    for (let i = 0; i < recipients.length; i += batchSize) {
      if (!this.runningCampaigns.get(campaign.id!)) {
        throw new Error('Campaign execution was stopped');
      }

      const batch = recipients.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)}`);

      for (const recipient of batch) {
        try {
          await this.sendEmailToRecipient(campaign, template, smtpServer, recipient);
          result.sentCount++;
          
          // Update recipient status
          await storage.updateRecipient(recipient.id!, {
            status: 'sent',
            sentAt: new Date(),
          });

          // Delay between emails to avoid rate limiting
          if (delayBetweenEmails > 0) {
            await this.delay(delayBetweenEmails);
          }

        } catch (error) {
          result.failedCount++;
          result.errors.push(`Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Update recipient status
          await storage.updateRecipient(recipient.id!, {
            status: 'bounced',
          });
        }
      }

      // Delay between batches
      if (i + batchSize < recipients.length && delayBetweenBatches > 0) {
        await this.delay(delayBetweenBatches);
      }
    }
  }

  private async sendEmailToRecipient(
    campaign: Campaign,
    template: EmailTemplate,
    smtpServer: SmtpServer,
    recipient: Recipient
  ): Promise<EmailSendResult> {
    // Personalize email content
    const personalizedContent = await emailService.personalizeEmailContent(template, recipient, campaign);

    // Add tracking data if domain is configured
    const trackingData = campaign.domain ? {
      campaignId: campaign.id!,
      recipientId: recipient.id!,
      domain: campaign.domain,
    } : undefined;

    // Send email
    const result = await emailService.sendEmail(
      recipient.email,
      smtpServer.username,
      personalizedContent,
      trackingData
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  }

  async stopCampaign(campaignId: string): Promise<void> {
    this.runningCampaigns.set(campaignId, false);
    await storage.updateCampaign(campaignId, { status: 'paused' });
  }

  isCampaignRunning(campaignId: string): boolean {
    return this.runningCampaigns.has(campaignId);
  }

  getRunningCampaigns(): string[] {
    return Array.from(this.runningCampaigns.keys());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const campaignExecutor = new CampaignExecutor();