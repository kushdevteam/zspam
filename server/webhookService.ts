import crypto from 'crypto';
import { Campaign, Session, Recipient } from '@shared/schema';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  signature?: string;
}

export interface WebhookEndpoint {
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
}

export class WebhookService {
  private endpoints: WebhookEndpoint[] = [];

  addEndpoint(endpoint: WebhookEndpoint): void {
    this.endpoints.push(endpoint);
  }

  removeEndpoint(url: string): void {
    this.endpoints = this.endpoints.filter(endpoint => endpoint.url !== url);
  }

  async sendWebhook(event: string, data: any): Promise<void> {
    const activeEndpoints = this.endpoints.filter(
      endpoint => endpoint.isActive && endpoint.events.includes(event)
    );

    if (activeEndpoints.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const promises = activeEndpoints.map(endpoint => 
      this.sendToEndpoint(endpoint, payload)
    );

    await Promise.allSettled(promises);
  }

  private async sendToEndpoint(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    try {
      const body = JSON.stringify(payload);
      
      // Generate signature if secret is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'zSPAM-Webhook/1.0',
      };

      if (endpoint.secret) {
        const signature = this.generateSignature(body, endpoint.secret);
        headers['X-zSPAM-Signature'] = signature;
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Webhook sent successfully to ${endpoint.url} for event ${payload.event}`);
    } catch (error) {
      console.error(`Failed to send webhook to ${endpoint.url}:`, error);
    }
  }

  private generateSignature(body: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  // Event handlers for different campaign events
  async onCampaignStarted(campaign: Campaign): Promise<void> {
    await this.sendWebhook('campaign.started', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignType: campaign.type,
      status: campaign.status,
      createdAt: campaign.createdAt,
    });
  }

  async onCampaignCompleted(campaign: Campaign, stats: any): Promise<void> {
    await this.sendWebhook('campaign.completed', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignType: campaign.type,
      status: campaign.status,
      completedAt: new Date().toISOString(),
      stats,
    });
  }

  async onEmailSent(campaign: Campaign, recipient: Recipient): Promise<void> {
    await this.sendWebhook('email.sent', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      sentAt: recipient.sentAt,
    });
  }

  async onEmailOpened(campaign: Campaign, recipient: Recipient): Promise<void> {
    await this.sendWebhook('email.opened', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      openedAt: recipient.openedAt,
      openCount: recipient.openCount,
    });
  }

  async onLinkClicked(campaign: Campaign, recipient: Recipient, url: string): Promise<void> {
    await this.sendWebhook('link.clicked', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      clickedUrl: url,
      clickedAt: recipient.clickedAt,
      clickCount: recipient.clickCount,
    });
  }

  async onCredentialsCaptured(campaign: Campaign, session: Session): Promise<void> {
    await this.sendWebhook('credentials.captured', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      sessionId: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      username: session.username,
      capturedAt: session.completedAt,
      deviceType: session.deviceType,
      geolocation: session.geolocation,
    });
  }

  async onSuspiciousActivity(campaign: Campaign, session: Session, reason: string): Promise<void> {
    await this.sendWebhook('suspicious.activity', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      sessionId: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      reason,
      riskLevel: session.riskLevel,
      botScore: session.botScore,
      detectedAt: new Date().toISOString(),
    });
  }

  // Slack integration helper
  async sendSlackNotification(webhookUrl: string, message: string, channel?: string): Promise<void> {
    try {
      const payload = {
        text: message,
        channel: channel || '#security',
        username: 'zSPAM',
        icon_emoji: ':shield:',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log('Slack notification sent successfully');
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  // Teams integration helper
  async sendTeamsNotification(webhookUrl: string, title: string, text: string): Promise<void> {
    try {
      const payload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: title,
        themeColor: 'FF6B35',
        sections: [{
          activityTitle: title,
          activitySubtitle: 'zSPAM Security Awareness Platform',
          text: text,
          markdown: true,
        }],
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Teams API error: ${response.status}`);
      }

      console.log('Teams notification sent successfully');
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
    }
  }

  // Discord integration helper
  async sendDiscordNotification(webhookUrl: string, message: string): Promise<void> {
    try {
      const payload = {
        content: message,
        username: 'zSPAM',
        avatar_url: 'https://example.com/zspam-logo.png',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      console.log('Discord notification sent successfully');
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  // Test webhook endpoint
  async testWebhook(endpoint: WebhookEndpoint): Promise<boolean> {
    try {
      const testPayload: WebhookPayload = {
        event: 'test.webhook',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from zSPAM',
          platform: 'zSPAM Security Awareness Platform',
        },
      };

      await this.sendToEndpoint(endpoint, testPayload);
      return true;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();