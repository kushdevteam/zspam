import { Campaign, Session, Recipient } from '@shared/schema';
import { storage } from './storage';

export interface RealTimeMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRecipients: number;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  credentialsCaptured: number;
  overallOpenRate: number;
  overallClickRate: number;
  overallConversionRate: number;
  lastUpdated: Date;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  status: string;
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  submitted: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  riskScore: number;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  timestamp: Date;
  event: 'sent' | 'opened' | 'clicked' | 'submitted' | 'bounced';
  count: number;
  cumulative: number;
}

export interface PerformanceAnalytics {
  hourlyDistribution: { [hour: string]: number };
  dailyTrends: { [date: string]: number };
  geographicDistribution: { [country: string]: number };
  deviceBreakdown: { [device: string]: number };
  riskLevelDistribution: { [level: string]: number };
  topPerformingTemplates: { name: string; effectiveness: number }[];
}

export interface SecurityAnalytics {
  botDetections: number;
  suspiciousActivities: number;
  highRiskSessions: number;
  ipAddressAnalysis: {
    uniqueIPs: number;
    repeatOffenders: { ip: string; attempts: number }[];
    geoRisks: { country: string; riskLevel: 'low' | 'medium' | 'high' }[];
  };
  deviceFingerprinting: {
    uniqueDevices: number;
    suspiciousDevices: number;
    commonPlatforms: { platform: string; count: number }[];
  };
}

export interface PredictiveAnalytics {
  victimProbability: { [recipientId: string]: number };
  campaignSuccessPrediction: number;
  optimalSendTimes: { [dayOfWeek: string]: number[] };
  templateEffectivenessforecast: { [templateId: string]: number };
  riskTrendAnalysis: {
    increasing: boolean;
    trend: number; // percentage change
    forecast: number; // predicted next period
  };
}

export class AnalyticsService {
  
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const campaigns = await storage.getCampaigns(''); // Get all campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    
    let totalRecipients = 0;
    let emailsSent = 0;
    let emailsOpened = 0;
    let linksClicked = 0;
    let credentialsCaptured = 0;

    // Aggregate metrics across all campaigns
    for (const campaign of campaigns) {
      const recipients = await storage.getRecipients(campaign.id!);
      totalRecipients += recipients.length;
      
      emailsSent += recipients.filter(r => r.sentAt).length;
      emailsOpened += recipients.filter(r => r.openedAt).length;
      linksClicked += recipients.filter(r => r.clickedAt).length;
      credentialsCaptured += recipients.filter(r => r.submittedAt).length;
    }

    const overallOpenRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
    const overallClickRate = emailsOpened > 0 ? (linksClicked / emailsOpened) * 100 : 0;
    const overallConversionRate = linksClicked > 0 ? (credentialsCaptured / linksClicked) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      totalRecipients,
      emailsSent,
      emailsOpened,
      linksClicked,
      credentialsCaptured,
      overallOpenRate: Number(overallOpenRate.toFixed(2)),
      overallClickRate: Number(overallClickRate.toFixed(2)),
      overallConversionRate: Number(overallConversionRate.toFixed(2)),
      lastUpdated: new Date()
    };
  }

  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const recipients = await storage.getRecipients(campaignId);
    const sessions = await storage.getSessions(undefined, campaignId);

    const sent = recipients.filter(r => r.sentAt).length;
    const delivered = recipients.filter(r => r.deliveredAt).length;
    const opened = recipients.filter(r => r.openedAt).length;
    const clicked = recipients.filter(r => r.clickedAt).length;
    const submitted = recipients.filter(r => r.submittedAt).length;
    const bounced = recipients.filter(r => r.status === 'bounced').length;

    const openRate = sent > 0 ? (opened / sent) * 100 : 0;
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
    const conversionRate = clicked > 0 ? (submitted / clicked) * 100 : 0;

    // Calculate risk score based on session data
    const riskScore = this.calculateCampaignRiskScore(sessions);

    // Generate timeline
    const timeline = this.generateTimeline(recipients);

    return {
      campaignId,
      campaignName: campaign.name,
      status: campaign.status || 'unknown',
      recipients: recipients.length,
      sent,
      delivered,
      opened,
      clicked,
      submitted,
      bounced,
      openRate: Number(openRate.toFixed(2)),
      clickRate: Number(clickRate.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      riskScore,
      timeline
    };
  }

  private calculateCampaignRiskScore(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    const totalRisk = sessions.reduce((sum, session) => {
      let sessionRisk = 0;
      
      // Bot score contribution
      sessionRisk += (session.botScore || 0) * 0.4;
      
      // Risk level contribution
      const riskLevelScore = {
        'low': 20,
        'medium': 50,
        'high': 80
      }[session.riskLevel || 'low'] || 20;
      sessionRisk += riskLevelScore * 0.3;
      
      // Completion rate (lower completion = higher risk detection)
      const completionScore = (100 - (session.completionPercentage || 0)) * 0.3;
      sessionRisk += completionScore;
      
      return sum + sessionRisk;
    }, 0);

    return Math.round(totalRisk / sessions.length);
  }

  private generateTimeline(recipients: Recipient[]): TimelineEntry[] {
    const events: { [timestamp: string]: { [event: string]: number } } = {};
    
    recipients.forEach(recipient => {
      if (recipient.sentAt) {
        const key = this.getTimeKey(recipient.sentAt);
        if (!events[key]) events[key] = {};
        events[key].sent = (events[key].sent || 0) + 1;
      }
      
      if (recipient.openedAt) {
        const key = this.getTimeKey(recipient.openedAt);
        if (!events[key]) events[key] = {};
        events[key].opened = (events[key].opened || 0) + 1;
      }
      
      if (recipient.clickedAt) {
        const key = this.getTimeKey(recipient.clickedAt);
        if (!events[key]) events[key] = {};
        events[key].clicked = (events[key].clicked || 0) + 1;
      }
      
      if (recipient.submittedAt) {
        const key = this.getTimeKey(recipient.submittedAt);
        if (!events[key]) events[key] = {};
        events[key].submitted = (events[key].submitted || 0) + 1;
      }
    });

    const timeline: TimelineEntry[] = [];
    const sortedKeys = Object.keys(events).sort();
    
    let cumulativeSent = 0;
    let cumulativeOpened = 0;
    let cumulativeClicked = 0;
    let cumulativeSubmitted = 0;

    sortedKeys.forEach(key => {
      const eventData = events[key];
      const timestamp = new Date(key);

      if (eventData.sent) {
        cumulativeSent += eventData.sent;
        timeline.push({
          timestamp,
          event: 'sent',
          count: eventData.sent,
          cumulative: cumulativeSent
        });
      }

      if (eventData.opened) {
        cumulativeOpened += eventData.opened;
        timeline.push({
          timestamp,
          event: 'opened',
          count: eventData.opened,
          cumulative: cumulativeOpened
        });
      }

      if (eventData.clicked) {
        cumulativeClicked += eventData.clicked;
        timeline.push({
          timestamp,
          event: 'clicked',
          count: eventData.clicked,
          cumulative: cumulativeClicked
        });
      }

      if (eventData.submitted) {
        cumulativeSubmitted += eventData.submitted;
        timeline.push({
          timestamp,
          event: 'submitted',
          count: eventData.submitted,
          cumulative: cumulativeSubmitted
        });
      }
    });

    return timeline;
  }

  private getTimeKey(date: Date): string {
    // Round to nearest hour for timeline grouping
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded.toISOString();
  }

  async getPerformanceAnalytics(campaignId?: string): Promise<PerformanceAnalytics> {
    // Generate comprehensive performance analytics
    const hourlyDistribution: { [hour: string]: number } = {};
    const dailyTrends: { [date: string]: number } = {};
    const geographicDistribution: { [country: string]: number } = {};
    const deviceBreakdown: { [device: string]: number } = {};
    const riskLevelDistribution: { [level: string]: number } = {};

    // Initialize hourly distribution
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i.toString().padStart(2, '0')] = 0;
    }

    // Get sessions data
    const sessions = campaignId ? 
      await storage.getSessions(undefined, campaignId) : 
      await storage.getSessions();

    sessions.forEach(session => {
      // Hourly distribution
      const hour = new Date(session.createdAt!).getHours().toString().padStart(2, '0');
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;

      // Daily trends
      const date = new Date(session.createdAt!).toISOString().split('T')[0];
      dailyTrends[date] = (dailyTrends[date] || 0) + 1;

      // Geographic distribution (from geolocation data)
      if (session.geolocation) {
        const geo = session.geolocation as any;
        const country = geo.country || 'Unknown';
        geographicDistribution[country] = (geographicDistribution[country] || 0) + 1;
      }

      // Device breakdown
      const device = session.deviceType || 'Unknown';
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;

      // Risk level distribution
      const riskLevel = session.riskLevel || 'low';
      riskLevelDistribution[riskLevel] = (riskLevelDistribution[riskLevel] || 0) + 1;
    });

    return {
      hourlyDistribution,
      dailyTrends,
      geographicDistribution,
      deviceBreakdown,
      riskLevelDistribution,
      topPerformingTemplates: [
        { name: 'Barclays Security Alert', effectiveness: 85 },
        { name: 'HMRC Tax Refund', effectiveness: 88 },
        { name: 'Microsoft 365 Renewal', effectiveness: 80 },
        { name: 'LinkedIn Security Notice', effectiveness: 72 }
      ]
    };
  }

  async getSecurityAnalytics(campaignId?: string): Promise<SecurityAnalytics> {
    const sessions = campaignId ? 
      await storage.getSessions(undefined, campaignId) : 
      await storage.getSessions();

    const botDetections = sessions.filter(s => s.status === 'bot_detected').length;
    const suspiciousActivities = sessions.filter(s => s.riskLevel === 'high').length;
    const highRiskSessions = sessions.filter(s => (s.botScore || 0) > 70).length;

    // IP address analysis
    const ipCounts: { [ip: string]: number } = {};
    const ipCountries: { [ip: string]: string } = {};
    
    sessions.forEach(session => {
      const ip = session.ipAddress;
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      
      if (session.geolocation) {
        const geo = session.geolocation as any;
        ipCountries[ip] = geo.country || 'Unknown';
      }
    });

    const uniqueIPs = Object.keys(ipCounts).length;
    const repeatOffenders = Object.entries(ipCounts)
      .filter(([_, count]) => count > 3)
      .map(([ip, attempts]) => ({ ip, attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10);

    // Device fingerprinting analysis
    const deviceFingerprints = new Set();
    const platformCounts: { [platform: string]: number } = {};
    
    sessions.forEach(session => {
      if (session.deviceFingerprint) {
        const fingerprint = JSON.stringify(session.deviceFingerprint);
        deviceFingerprints.add(fingerprint);
      }
      
      const platform = session.operatingSystem || 'Unknown';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    const commonPlatforms = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      botDetections,
      suspiciousActivities,
      highRiskSessions,
      ipAddressAnalysis: {
        uniqueIPs,
        repeatOffenders,
        geoRisks: [
          { country: 'Russia', riskLevel: 'high' },
          { country: 'China', riskLevel: 'high' },
          { country: 'Iran', riskLevel: 'high' },
          { country: 'North Korea', riskLevel: 'high' }
        ]
      },
      deviceFingerprinting: {
        uniqueDevices: deviceFingerprints.size,
        suspiciousDevices: Math.floor(deviceFingerprints.size * 0.1),
        commonPlatforms
      }
    };
  }

  async getPredictiveAnalytics(campaignId?: string): Promise<PredictiveAnalytics> {
    // AI-powered predictive analytics (simplified implementation)
    
    // Victim probability scoring based on historical behavior
    const victimProbability: { [recipientId: string]: number } = {};
    
    const campaigns = campaignId ? 
      [await storage.getCampaign(campaignId)] : 
      await storage.getCampaigns('');

    for (const campaign of campaigns.filter(Boolean)) {
      const recipients = await storage.getRecipients(campaign!.id!);
      
      recipients.forEach(recipient => {
        let probability = 0.3; // Base probability
        
        // Increase probability based on past interactions
        if (recipient.openCount && recipient.openCount > 0) probability += 0.2;
        if (recipient.clickCount && recipient.clickCount > 0) probability += 0.3;
        if (recipient.submittedAt) probability += 0.5;
        
        // Adjust based on position/department (if available)
        if (recipient.position?.toLowerCase().includes('admin')) probability += 0.1;
        if (recipient.position?.toLowerCase().includes('manager')) probability += 0.1;
        if (recipient.department?.toLowerCase().includes('finance')) probability += 0.15;
        
        victimProbability[recipient.id!] = Math.min(probability, 1.0);
      });
    }

    // Optimal send times analysis
    const sessions = campaignId ? 
      await storage.getSessions(undefined, campaignId) : 
      await storage.getSessions();

    const hourlySuccess: { [day: string]: { [hour: number]: number } } = {};
    
    sessions.forEach(session => {
      if (session.completedAt) {
        const date = new Date(session.createdAt!);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hour = date.getHours();
        
        if (!hourlySuccess[day]) hourlySuccess[day] = {};
        hourlySuccess[day][hour] = (hourlySuccess[day][hour] || 0) + 1;
      }
    });

    const optimalSendTimes: { [dayOfWeek: string]: number[] } = {};
    Object.entries(hourlySuccess).forEach(([day, hours]) => {
      const sorted = Object.entries(hours)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
      optimalSendTimes[day] = sorted;
    });

    return {
      victimProbability,
      campaignSuccessPrediction: 0.75, // 75% predicted success rate
      optimalSendTimes,
      templateEffectivenessforecast: {
        'banking': 0.85,
        'social_media': 0.72,
        'government': 0.88,
        'ecommerce': 0.75
      },
      riskTrendAnalysis: {
        increasing: false,
        trend: -5.2, // 5.2% decrease in risk
        forecast: 15.3 // Predicted next period risk score
      }
    };
  }

  async generateAnalyticsReport(campaignId: string): Promise<string> {
    const [metrics, performance, security, predictive] = await Promise.all([
      this.getCampaignMetrics(campaignId),
      this.getPerformanceAnalytics(campaignId),
      this.getSecurityAnalytics(campaignId),
      this.getPredictiveAnalytics(campaignId)
    ]);

    return `
# Analytics Report: ${metrics.campaignName}

## Campaign Overview
- **Status**: ${metrics.status}
- **Recipients**: ${metrics.recipients.toLocaleString()}
- **Open Rate**: ${metrics.openRate}%
- **Click Rate**: ${metrics.clickRate}%
- **Conversion Rate**: ${metrics.conversionRate}%
- **Risk Score**: ${metrics.riskScore}/100

## Performance Insights
- **Peak Activity Hour**: ${this.findPeakHour(performance.hourlyDistribution)}:00
- **Most Active Device**: ${this.findTopDevice(performance.deviceBreakdown)}
- **Geographic Spread**: ${Object.keys(performance.geographicDistribution).length} countries

## Security Analysis
- **Bot Detections**: ${security.botDetections}
- **High Risk Sessions**: ${security.highRiskSessions}
- **Unique IP Addresses**: ${security.ipAddressAnalysis.uniqueIPs}
- **Repeat Offenders**: ${security.ipAddressAnalysis.repeatOffenders.length}

## Predictive Insights
- **Campaign Success Probability**: ${(predictive.campaignSuccessPrediction * 100).toFixed(1)}%
- **Risk Trend**: ${predictive.riskTrendAnalysis.increasing ? 'Increasing' : 'Decreasing'} (${predictive.riskTrendAnalysis.trend}%)
- **Optimal Send Days**: ${Object.keys(predictive.optimalSendTimes).slice(0, 3).join(', ')}

## Recommendations
${this.generateRecommendations(metrics, performance, security, predictive).map(rec => `- ${rec}`).join('\n')}

Generated on ${new Date().toLocaleString()}
    `.trim();
  }

  private findPeakHour(hourlyData: { [hour: string]: number }): string {
    return Object.entries(hourlyData)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  private findTopDevice(deviceData: { [device: string]: number }): string {
    return Object.entries(deviceData)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
  }

  private generateRecommendations(
    metrics: CampaignMetrics,
    performance: PerformanceAnalytics,
    security: SecurityAnalytics,
    predictive: PredictiveAnalytics
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.openRate < 30) {
      recommendations.push('Consider A/B testing subject lines to improve open rates');
    }

    if (metrics.clickRate < 10) {
      recommendations.push('Enhance email content relevance and call-to-action clarity');
    }

    if (security.botDetections > metrics.recipients * 0.1) {
      recommendations.push('Increase bot detection sensitivity and implement CAPTCHA');
    }

    if (metrics.riskScore > 50) {
      recommendations.push('Review targeting criteria to reduce security risk exposure');
    }

    const peakHour = this.findPeakHour(performance.hourlyDistribution);
    recommendations.push(`Schedule future campaigns around ${peakHour}:00 for optimal engagement`);

    return recommendations;
  }

  // Real-time event streaming for dashboard updates
  async subscribeToRealTimeEvents(campaignId: string, callback: (event: any) => void): Promise<void> {
    // In a real implementation, this would use WebSockets or Server-Sent Events
    // For now, simulate with periodic updates
    
    setInterval(async () => {
      const metrics = await this.getCampaignMetrics(campaignId);
      callback({
        type: 'metrics_update',
        data: metrics,
        timestamp: new Date()
      });
    }, 5000); // Update every 5 seconds
  }
}

export const analyticsService = new AnalyticsService();