import { Campaign, Session } from '@shared/schema';
import { storage } from './storage';
import { analyticsService } from './analyticsService';
import { webhookService } from './webhookService';

export interface AlertConfiguration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Alert conditions
  conditions: {
    metric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'bot_score' | 'failed_emails' | 'session_count' | 'risk_score';
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
    threshold: number;
    timeWindow: number; // minutes
    campaignSpecific?: boolean;
    campaignId?: string;
  };
  
  // Alert frequency
  frequency: {
    maxAlertsPerHour: number;
    suppressDuplicates: boolean;
    suppressionWindow: number; // minutes
    escalationThreshold: number; // trigger count before escalation
  };
  
  // Notification channels
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
      subject?: string;
      includeDetails: boolean;
    };
    webhook: {
      enabled: boolean;
      url?: string;
      secret?: string;
    };
    slack: {
      enabled: boolean;
      channel?: string;
      mentionUsers?: string[];
    };
    sms: {
      enabled: boolean;
      numbers?: string[];
    };
  };
  
  // Auto-response actions
  autoResponse: {
    enabled: boolean;
    actions: ('pause_campaign' | 'send_notification' | 'create_incident' | 'block_ips' | 'quarantine_emails')[];
  };
}

export interface Alert {
  id: string;
  configId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved' | 'suppressed';
  
  // Alert details
  metric: string;
  currentValue: number;
  threshold: number;
  campaignId?: string;
  campaignName?: string;
  
  // Context
  context: {
    description: string;
    affectedEntities: string[];
    recommendations: string[];
    additionalData?: any;
  };
  
  // Tracking
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalationLevel: number;
}

export interface SystemHealthMetrics {
  timestamp: Date;
  
  // Application metrics
  application: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    requestsPerMinute: number;
    errorRate: number;
    responseTime: number;
  };
  
  // Database metrics
  database: {
    connectionCount: number;
    queryLatency: number;
    slowQueries: number;
    lockWaits: number;
    tableSizes: { [table: string]: number };
  };
  
  // Campaign metrics
  campaigns: {
    activeCampaigns: number;
    emailsInQueue: number;
    deliveryRate: number;
    bounceRate: number;
    avgResponseTime: number;
  };
  
  // Security metrics
  security: {
    suspiciousSessions: number;
    botDetections: number;
    riskScoreAverage: number;
    blockedIPs: number;
  };
}

export interface MonitoringDashboard {
  overview: {
    systemStatus: 'healthy' | 'warning' | 'critical';
    activeAlerts: number;
    uptime: string;
    lastUpdate: Date;
  };
  
  realTimeMetrics: {
    emailsSentLastHour: number;
    activeSessionsCount: number;
    currentThroughput: number;
    errorRateLastHour: number;
  };
  
  trendData: {
    hourlyActivity: { [hour: string]: number };
    dailyMetrics: { [date: string]: any };
    weeklyTrends: { [week: string]: any };
  };
  
  topAlerts: Alert[];
  systemHealth: SystemHealthMetrics;
}

export class MonitoringService {
  private alerts: Map<string, Alert> = new Map();
  private alertConfigs: Map<string, AlertConfiguration> = new Map();
  private systemMetrics: SystemHealthMetrics[] = [];
  private suppressedAlerts: Set<string> = new Set();
  
  constructor() {
    this.initializeDefaultAlerts();
    this.startMonitoring();
  }

  private initializeDefaultAlerts(): void {
    const defaultAlerts: AlertConfiguration[] = [
      {
        id: 'high-conversion-rate',
        name: 'High Conversion Rate Alert',
        description: 'Triggers when conversion rate exceeds threshold',
        enabled: true,
        conditions: {
          metric: 'conversion_rate',
          operator: 'greater_than',
          threshold: 15,
          timeWindow: 60,
          campaignSpecific: false
        },
        frequency: {
          maxAlertsPerHour: 2,
          suppressDuplicates: true,
          suppressionWindow: 30,
          escalationThreshold: 3
        },
        notifications: {
          email: {
            enabled: true,
            recipients: ['security@company.com', 'admin@company.com'],
            subject: 'Security Alert: High Phishing Susceptibility Detected',
            includeDetails: true
          },
          webhook: { enabled: false },
          slack: { enabled: false },
          sms: { enabled: false }
        },
        autoResponse: {
          enabled: true,
          actions: ['send_notification', 'create_incident']
        }
      },
      {
        id: 'bot-detection-spike',
        name: 'Bot Detection Spike',
        description: 'Triggers when bot detections increase significantly',
        enabled: true,
        conditions: {
          metric: 'bot_score',
          operator: 'greater_than',
          threshold: 80,
          timeWindow: 30,
          campaignSpecific: false
        },
        frequency: {
          maxAlertsPerHour: 5,
          suppressDuplicates: true,
          suppressionWindow: 15,
          escalationThreshold: 2
        },
        notifications: {
          email: {
            enabled: true,
            recipients: ['tech@company.com'],
            subject: 'Technical Alert: High Bot Activity Detected',
            includeDetails: true
          },
          webhook: { enabled: false },
          slack: { enabled: false },
          sms: { enabled: false }
        },
        autoResponse: {
          enabled: false,
          actions: []
        }
      },
      {
        id: 'campaign-failure-rate',
        name: 'Campaign Failure Rate Alert',
        description: 'Triggers when email delivery failures exceed threshold',
        enabled: true,
        conditions: {
          metric: 'failed_emails',
          operator: 'greater_than',
          threshold: 10,
          timeWindow: 60,
          campaignSpecific: true
        },
        frequency: {
          maxAlertsPerHour: 3,
          suppressDuplicates: true,
          suppressionWindow: 45,
          escalationThreshold: 2
        },
        notifications: {
          email: {
            enabled: true,
            recipients: ['operations@company.com'],
            subject: 'Operations Alert: Campaign Delivery Issues',
            includeDetails: true
          },
          webhook: { enabled: false },
          slack: { enabled: false },
          sms: { enabled: false }
        },
        autoResponse: {
          enabled: true,
          actions: ['pause_campaign', 'send_notification']
        }
      }
    ];

    defaultAlerts.forEach(config => {
      this.alertConfigs.set(config.id, config);
    });
  }

  private startMonitoring(): void {
    // Check metrics and evaluate alerts every 2 minutes
    setInterval(() => {
      this.evaluateAlerts();
    }, 2 * 60 * 1000);

    // Collect system metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60 * 1000);

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);

    console.log('Monitoring service started');
  }

  private async evaluateAlerts(): Promise<void> {
    for (const [configId, config] of this.alertConfigs.entries()) {
      if (!config.enabled) continue;

      try {
        await this.evaluateAlertCondition(config);
      } catch (error) {
        console.error(`Failed to evaluate alert ${configId}:`, error);
      }
    }
  }

  private async evaluateAlertCondition(config: AlertConfiguration): Promise<void> {
    const currentValue = await this.getMetricValue(config.conditions.metric, config.conditions.timeWindow, config.conditions.campaignId);
    
    let shouldTrigger = false;

    switch (config.conditions.operator) {
      case 'greater_than':
        shouldTrigger = currentValue > config.conditions.threshold;
        break;
      case 'less_than':
        shouldTrigger = currentValue < config.conditions.threshold;
        break;
      case 'equals':
        shouldTrigger = Math.abs(currentValue - config.conditions.threshold) < 0.01;
        break;
      case 'not_equals':
        shouldTrigger = Math.abs(currentValue - config.conditions.threshold) >= 0.01;
        break;
      case 'percentage_change':
        const previousValue = await this.getMetricValue(config.conditions.metric, config.conditions.timeWindow * 2, config.conditions.campaignId);
        const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
        shouldTrigger = Math.abs(percentChange) > config.conditions.threshold;
        break;
    }

    if (shouldTrigger && !this.isAlertSuppressed(config.id)) {
      await this.triggerAlert(config, currentValue);
    }
  }

  private async getMetricValue(metric: string, timeWindowMinutes: number, campaignId?: string): Promise<number> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindowMinutes * 60 * 1000);

    switch (metric) {
      case 'open_rate':
      case 'click_rate':
      case 'conversion_rate':
        if (campaignId) {
          const campaignMetrics = await analyticsService.getCampaignMetrics(campaignId);
          return {
            'open_rate': campaignMetrics.openRate,
            'click_rate': campaignMetrics.clickRate,
            'conversion_rate': campaignMetrics.conversionRate
          }[metric] || 0;
        } else {
          const realTimeMetrics = await analyticsService.getRealTimeMetrics();
          return {
            'open_rate': realTimeMetrics.overallOpenRate,
            'click_rate': realTimeMetrics.overallClickRate,
            'conversion_rate': realTimeMetrics.overallConversionRate
          }[metric] || 0;
        }

      case 'bot_score':
        const sessions = campaignId ? 
          await storage.getSessions(undefined, campaignId) : 
          await storage.getSessions();
        
        const recentSessions = sessions.filter(s => 
          s.createdAt && new Date(s.createdAt) >= startTime
        );
        
        return recentSessions.length > 0 ? 
          recentSessions.reduce((sum, s) => sum + (s.botScore || 0), 0) / recentSessions.length : 0;

      case 'failed_emails':
        // Would track failed email deliveries
        return Math.floor(Math.random() * 20); // Mock value

      case 'session_count':
        const allSessions = campaignId ? 
          await storage.getSessions(undefined, campaignId) : 
          await storage.getSessions();
        
        return allSessions.filter(s => 
          s.createdAt && new Date(s.createdAt) >= startTime
        ).length;

      case 'risk_score':
        if (campaignId) {
          const campaignMetrics = await analyticsService.getCampaignMetrics(campaignId);
          return campaignMetrics.riskScore;
        } else {
          const securityAnalytics = await analyticsService.getSecurityAnalytics();
          return securityAnalytics.suspiciousActivities;
        }

      default:
        return 0;
    }
  }

  private async triggerAlert(config: AlertConfiguration, currentValue: number): Promise<void> {
    const alertId = `alert_${config.id}_${Date.now()}`;
    
    const alert: Alert = {
      id: alertId,
      configId: config.id,
      timestamp: new Date(),
      severity: this.calculateSeverity(config, currentValue),
      status: 'new',
      metric: config.conditions.metric,
      currentValue,
      threshold: config.conditions.threshold,
      campaignId: config.conditions.campaignId,
      campaignName: config.conditions.campaignId ? await this.getCampaignName(config.conditions.campaignId) : undefined,
      context: {
        description: this.generateAlertDescription(config, currentValue),
        affectedEntities: await this.getAffectedEntities(config),
        recommendations: this.generateRecommendations(config, currentValue)
      },
      escalationLevel: 0
    };

    this.alerts.set(alertId, alert);

    // Send notifications
    await this.sendAlertNotifications(alert, config);

    // Execute auto-response actions
    if (config.autoResponse.enabled) {
      await this.executeAutoResponse(alert, config);
    }

    // Apply suppression
    this.suppressAlert(config.id, config.frequency.suppressionWindow);

    console.log(`Alert triggered: ${config.name} (${alertId})`);
  }

  private calculateSeverity(config: AlertConfiguration, currentValue: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = currentValue / config.conditions.threshold;
    
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  private generateAlertDescription(config: AlertConfiguration, currentValue: number): string {
    return `${config.name}: ${config.conditions.metric} is ${currentValue.toFixed(2)} (threshold: ${config.conditions.threshold})`;
  }

  private async getAffectedEntities(config: AlertConfiguration): Promise<string[]> {
    const entities = [];
    
    if (config.conditions.campaignId) {
      entities.push(`Campaign: ${config.conditions.campaignId}`);
    } else {
      entities.push('System-wide');
    }
    
    return entities;
  }

  private generateRecommendations(config: AlertConfiguration, currentValue: number): string[] {
    const recommendations = [];
    
    switch (config.conditions.metric) {
      case 'conversion_rate':
        if (currentValue > 20) {
          recommendations.push('Immediate security awareness training required');
          recommendations.push('Review and strengthen email security policies');
          recommendations.push('Consider additional phishing protection measures');
        }
        break;
      case 'bot_score':
        recommendations.push('Investigate suspicious session patterns');
        recommendations.push('Review bot detection algorithms');
        recommendations.push('Consider implementing additional verification');
        break;
      case 'failed_emails':
        recommendations.push('Check SMTP server configuration');
        recommendations.push('Review email delivery logs');
        recommendations.push('Verify recipient email addresses');
        break;
    }
    
    return recommendations;
  }

  private async sendAlertNotifications(alert: Alert, config: AlertConfiguration): Promise<void> {
    // Email notifications
    if (config.notifications.email.enabled && config.notifications.email.recipients.length > 0) {
      await this.sendEmailNotification(alert, config);
    }

    // Webhook notifications
    if (config.notifications.webhook.enabled && config.notifications.webhook.url) {
      await this.sendWebhookNotification(alert, config);
    }

    // Slack notifications
    if (config.notifications.slack.enabled && config.notifications.slack.channel) {
      await this.sendSlackNotification(alert, config);
    }

    // SMS notifications
    if (config.notifications.sms.enabled && config.notifications.sms.numbers) {
      await this.sendSMSNotification(alert, config);
    }
  }

  private async sendEmailNotification(alert: Alert, config: AlertConfiguration): Promise<void> {
    const subject = config.notifications.email.subject || `Alert: ${config.name}`;
    const body = `
Alert: ${config.name}
Severity: ${alert.severity.toUpperCase()}
Time: ${alert.timestamp.toLocaleString()}

Description: ${alert.context.description}

Current Value: ${alert.currentValue}
Threshold: ${alert.threshold}

Recommendations:
${alert.context.recommendations.map(rec => `• ${rec}`).join('\n')}

Campaign: ${alert.campaignName || 'System-wide'}
Alert ID: ${alert.id}
    `;

    console.log(`Sending email alert to: ${config.notifications.email.recipients.join(', ')}`);
    console.log(`Subject: ${subject}`);
    // In production, would use actual email service
  }

  private async sendWebhookNotification(alert: Alert, config: AlertConfiguration): Promise<void> {
    try {
      const payload = {
        alert_id: alert.id,
        config_name: config.name,
        severity: alert.severity,
        timestamp: alert.timestamp.toISOString(),
        metric: alert.metric,
        current_value: alert.currentValue,
        threshold: alert.threshold,
        description: alert.context.description,
        recommendations: alert.context.recommendations
      };

      console.log(`Sending webhook notification to: ${config.notifications.webhook.url}`);
      // In production: await fetch(config.notifications.webhook.url, { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  private async sendSlackNotification(alert: Alert, config: AlertConfiguration): Promise<void> {
    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff4500',
      critical: '#ff0000'
    }[alert.severity];

    console.log(`Sending Slack notification to: ${config.notifications.slack.channel}`);
    // In production, would use Slack API
  }

  private async sendSMSNotification(alert: Alert, config: AlertConfiguration): Promise<void> {
    const message = `ALERT: ${config.name} - ${alert.context.description}`;
    console.log(`Sending SMS to: ${config.notifications.sms.numbers?.join(', ')}`);
    // In production, would use SMS service like Twilio
  }

  private async executeAutoResponse(alert: Alert, config: AlertConfiguration): Promise<void> {
    for (const action of config.autoResponse.actions) {
      try {
        switch (action) {
          case 'pause_campaign':
            if (alert.campaignId) {
              await this.pauseCampaign(alert.campaignId);
            }
            break;
          case 'send_notification':
            // Already handled in notifications
            break;
          case 'create_incident':
            await this.createIncident(alert);
            break;
          case 'block_ips':
            await this.blockSuspiciousIPs(alert);
            break;
          case 'quarantine_emails':
            await this.quarantineEmails(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute auto-response action ${action}:`, error);
      }
    }
  }

  private async pauseCampaign(campaignId: string): Promise<void> {
    console.log(`Auto-pausing campaign: ${campaignId}`);
    // Implementation would pause campaign execution
  }

  private async createIncident(alert: Alert): Promise<void> {
    console.log(`Creating incident for alert: ${alert.id}`);
    // Implementation would create incident in ticketing system
  }

  private async blockSuspiciousIPs(alert: Alert): Promise<void> {
    console.log(`Blocking suspicious IPs related to alert: ${alert.id}`);
    // Implementation would block IPs in firewall/security system
  }

  private async quarantineEmails(alert: Alert): Promise<void> {
    console.log(`Quarantining emails for alert: ${alert.id}`);
    // Implementation would quarantine related emails
  }

  private async getCampaignName(campaignId: string): Promise<string> {
    const campaign = await storage.getCampaign(campaignId);
    return campaign?.name || 'Unknown Campaign';
  }

  private isAlertSuppressed(configId: string): boolean {
    return this.suppressedAlerts.has(configId);
  }

  private suppressAlert(configId: string, suppressionWindowMinutes: number): void {
    this.suppressedAlerts.add(configId);
    setTimeout(() => {
      this.suppressedAlerts.delete(configId);
    }, suppressionWindowMinutes * 60 * 1000);
  }

  private async collectSystemMetrics(): Promise<void> {
    const metrics: SystemHealthMetrics = {
      timestamp: new Date(),
      application: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: 0, // Would use actual CPU monitoring
        activeConnections: 0, // Would track actual connections
        requestsPerMinute: 0, // Would track actual requests
        errorRate: 0, // Would track actual errors
        responseTime: 0 // Would track actual response times
      },
      database: {
        connectionCount: 10, // Mock value
        queryLatency: 50, // Mock value
        slowQueries: 0,
        lockWaits: 0,
        tableSizes: {
          'campaigns': 1024,
          'recipients': 2048,
          'sessions': 4096
        }
      },
      campaigns: {
        activeCampaigns: (await storage.getCampaigns('')).filter(c => c.status === 'active').length,
        emailsInQueue: 0, // Would track actual queue
        deliveryRate: 95.5, // Mock value
        bounceRate: 2.1, // Mock value
        avgResponseTime: 1.2 // Mock value
      },
      security: {
        suspiciousSessions: (await analyticsService.getSecurityAnalytics()).suspiciousActivities,
        botDetections: (await analyticsService.getSecurityAnalytics()).botDetections,
        riskScoreAverage: 25, // Mock value
        blockedIPs: 0 // Mock value
      }
    };

    this.systemMetrics.push(metrics);
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp >= cutoff);

    // Clean up old alerts (keep for 7 days)
    const alertCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.timestamp < alertCutoff) {
        this.alerts.delete(alertId);
      }
    }
  }

  // Public API methods
  async getAlerts(status?: string): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    return status ? alerts.filter(a => a.status === status) : alerts;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === 'new') {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  async resolveAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status !== 'resolved') {
      alert.status = 'resolved';
      alert.resolvedBy = userId;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  async getDashboard(): Promise<MonitoringDashboard> {
    const latestMetrics = this.systemMetrics[this.systemMetrics.length - 1];
    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'new' || a.status === 'acknowledged');

    return {
      overview: {
        systemStatus: activeAlerts.some(a => a.severity === 'critical') ? 'critical' :
                    activeAlerts.some(a => a.severity === 'high') ? 'warning' : 'healthy',
        activeAlerts: activeAlerts.length,
        uptime: this.formatUptime(process.uptime()),
        lastUpdate: new Date()
      },
      realTimeMetrics: {
        emailsSentLastHour: await this.getMetricValue('session_count', 60),
        activeSessionsCount: (await storage.getSessions()).length,
        currentThroughput: 50, // Mock value
        errorRateLastHour: 0.1 // Mock value
      },
      trendData: {
        hourlyActivity: {},
        dailyMetrics: {},
        weeklyTrends: {}
      },
      topAlerts: activeAlerts.slice(0, 10).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      systemHealth: latestMetrics || {
        timestamp: new Date(),
        application: { uptime: 0, memoryUsage: 0, cpuUsage: 0, activeConnections: 0, requestsPerMinute: 0, errorRate: 0, responseTime: 0 },
        database: { connectionCount: 0, queryLatency: 0, slowQueries: 0, lockWaits: 0, tableSizes: {} },
        campaigns: { activeCampaigns: 0, emailsInQueue: 0, deliveryRate: 0, bounceRate: 0, avgResponseTime: 0 },
        security: { suspiciousSessions: 0, botDetections: 0, riskScoreAverage: 0, blockedIPs: 0 }
      }
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  async configureAlert(config: AlertConfiguration): Promise<void> {
    this.alertConfigs.set(config.id, config);
    console.log(`Alert configuration updated: ${config.name}`);
  }

  async getAlertConfigurations(): Promise<AlertConfiguration[]> {
    return Array.from(this.alertConfigs.values());
  }
}

export const monitoringService = new MonitoringService();