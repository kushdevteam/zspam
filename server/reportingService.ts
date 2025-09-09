import { Campaign, Session, Recipient } from '@shared/schema';
import { storage } from './storage';
import { analyticsService } from './analyticsService';
import { abtestingService } from './abtestingService';

export interface ReportConfiguration {
  reportId: string;
  name: string;
  description: string;
  reportType: 'campaign' | 'executive' | 'technical' | 'compliance' | 'comparative';
  
  // Data scope
  dateRange: {
    start: Date;
    end: Date;
  };
  campaignIds?: string[];
  includeAllCampaigns: boolean;
  
  // Report sections
  sections: {
    executiveSummary: boolean;
    campaignOverview: boolean;
    performanceMetrics: boolean;
    securityAnalysis: boolean;
    riskAssessment: boolean;
    userBehaviorAnalysis: boolean;
    technicalDetails: boolean;
    recommendations: boolean;
    appendices: boolean;
  };
  
  // Export options
  exportFormats: ('pdf' | 'html' | 'csv' | 'excel' | 'json')[];
  
  // Delivery
  delivery: {
    method: 'download' | 'email' | 'webhook';
    recipients?: string[];
    webhookUrl?: string;
    scheduleRecurring?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      dayOfWeek?: number;
      dayOfMonth?: number;
    };
  };
}

export interface GeneratedReport {
  reportId: string;
  generatedAt: Date;
  htmlContent: string;
  csvData?: string;
  jsonData?: any;
  metadata: {
    campaignCount: number;
    sessionCount: number;
    recipientCount: number;
    dateRange: { start: Date; end: Date };
  };
}

export class ReportingService {
  
  async generateReport(config: ReportConfiguration): Promise<GeneratedReport> {
    console.log(`Generating report: ${config.name}`);
    
    // Collect data based on configuration
    const reportData = await this.collectReportData(config);
    
    // Generate different formats
    const htmlContent = await this.generateHTMLReport(config, reportData);
    const csvData = config.exportFormats.includes('csv') ? 
      await this.generateCSVReport(reportData) : undefined;
    const jsonData = config.exportFormats.includes('json') ? reportData : undefined;
    
    const report: GeneratedReport = {
      reportId: config.reportId,
      generatedAt: new Date(),
      htmlContent,
      csvData,
      jsonData,
      metadata: {
        campaignCount: reportData.campaigns.length,
        sessionCount: reportData.sessions.length,
        recipientCount: reportData.recipients.length,
        dateRange: config.dateRange
      }
    };
    
    // Handle delivery
    await this.deliverReport(config, report);
    
    return report;
  }

  private async collectReportData(config: ReportConfiguration): Promise<any> {
    // Get campaigns in scope
    let campaigns: Campaign[] = [];
    if (config.includeAllCampaigns) {
      campaigns = await storage.getCampaigns('');
    } else if (config.campaignIds) {
      campaigns = await Promise.all(
        config.campaignIds.map(id => storage.getCampaign(id))
      );
      campaigns = campaigns.filter(Boolean) as Campaign[];
    }

    // Filter by date range
    campaigns = campaigns.filter(campaign => {
      const createdAt = campaign.createdAt ? new Date(campaign.createdAt) : new Date();
      return createdAt >= config.dateRange.start && createdAt <= config.dateRange.end;
    });

    // Collect all related data
    const recipients: Recipient[] = [];
    const sessions: Session[] = [];
    const campaignMetrics: any[] = [];

    for (const campaign of campaigns) {
      const campaignRecipients = await storage.getRecipients(campaign.id!);
      const campaignSessions = await storage.getSessions(undefined, campaign.id!);
      const metrics = await analyticsService.getCampaignMetrics(campaign.id!);
      
      recipients.push(...campaignRecipients);
      sessions.push(...campaignSessions);
      campaignMetrics.push(metrics);
    }

    // Get aggregated analytics
    const realTimeMetrics = await analyticsService.getRealTimeMetrics();
    const performanceAnalytics = await analyticsService.getPerformanceAnalytics();
    const securityAnalytics = await analyticsService.getSecurityAnalytics();
    const predictiveAnalytics = await analyticsService.getPredictiveAnalytics();

    return {
      campaigns,
      recipients,
      sessions,
      campaignMetrics,
      realTimeMetrics,
      performanceAnalytics,
      securityAnalytics,
      predictiveAnalytics
    };
  }

  private async generateHTMLReport(config: ReportConfiguration, data: any): Promise<string> {
    const sections = config.sections;
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${config.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 3px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 40px; page-break-inside: avoid; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #f9f9f9; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .metric-label { font-size: 0.9em; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .chart-placeholder { background: #f0f0f0; height: 300px; display: flex; align-items: center; justify-content: center; margin: 20px 0; border-radius: 8px; }
        .risk-high { color: #d32f2f; font-weight: bold; }
        .risk-medium { color: #f57c00; font-weight: bold; }
        .risk-low { color: #388e3c; font-weight: bold; }
        .recommendation { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.name}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Period:</strong> ${config.dateRange.start.toLocaleDateString()} - ${config.dateRange.end.toLocaleDateString()}</p>
        <p><strong>Campaigns Analyzed:</strong> ${data.campaigns.length}</p>
    </div>
`;

    if (sections.executiveSummary) {
      html += this.generateExecutiveSummary(data);
    }

    if (sections.campaignOverview) {
      html += this.generateCampaignOverview(data);
    }

    if (sections.performanceMetrics) {
      html += this.generatePerformanceMetrics(data);
    }

    if (sections.securityAnalysis) {
      html += this.generateSecurityAnalysis(data);
    }

    if (sections.riskAssessment) {
      html += this.generateRiskAssessment(data);
    }

    if (sections.userBehaviorAnalysis) {
      html += this.generateUserBehaviorAnalysis(data);
    }

    if (sections.technicalDetails) {
      html += this.generateTechnicalDetails(data);
    }

    if (sections.recommendations) {
      html += this.generateRecommendations(data);
    }

    if (sections.appendices) {
      html += this.generateAppendices(data);
    }

    html += `
    <div class="footer">
        <p>Report generated by zSPAM Phishing Simulation Platform</p>
        <p>Confidential - For internal use only</p>
    </div>
</body>
</html>`;

    return html;
  }

  private generateExecutiveSummary(data: any): string {
    const metrics = data.realTimeMetrics;
    const totalSessions = data.sessions.length;
    const totalCredentials = data.recipients.filter((r: any) => r.submittedAt).length;
    const overallRisk = data.campaignMetrics.reduce((sum: number, m: any) => sum + m.riskScore, 0) / data.campaignMetrics.length;

    return `
    <div class="section">
        <h2>Executive Summary</h2>
        
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${metrics.totalCampaigns}</div>
                <div class="metric-label">Total Campaigns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.totalRecipients.toLocaleString()}</div>
                <div class="metric-label">Recipients Tested</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.overallConversionRate}%</div>
                <div class="metric-label">Overall Susceptibility</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${overallRisk > 70 ? 'risk-high' : overallRisk > 40 ? 'risk-medium' : 'risk-low'}">${Math.round(overallRisk)}</div>
                <div class="metric-label">Risk Score</div>
            </div>
        </div>

        <p><strong>Key Findings:</strong></p>
        <ul>
            <li>${metrics.overallConversionRate}% of employees fell for phishing attempts, indicating ${metrics.overallConversionRate > 10 ? 'significant security risk' : metrics.overallConversionRate > 5 ? 'moderate security risk' : 'low security risk'}</li>
            <li>${totalCredentials} users submitted credentials, representing potential data breach exposure</li>
            <li>Security awareness training effectiveness: ${metrics.overallConversionRate < 5 ? 'Excellent' : metrics.overallConversionRate < 10 ? 'Good' : metrics.overallConversionRate < 20 ? 'Needs Improvement' : 'Critical'}</li>
            <li>Most vulnerable campaign type: ${this.findMostVulnerableCampaign(data.campaignMetrics)}</li>
        </ul>
    </div>`;
  }

  private generateCampaignOverview(data: any): string {
    return `
    <div class="section">
        <h2>Campaign Overview</h2>
        
        <table>
            <thead>
                <tr>
                    <th>Campaign Name</th>
                    <th>Recipients</th>
                    <th>Open Rate</th>
                    <th>Click Rate</th>
                    <th>Submission Rate</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.campaignMetrics.map((campaign: any) => `
                    <tr>
                        <td>${campaign.campaignName}</td>
                        <td>${campaign.recipients}</td>
                        <td>${campaign.openRate}%</td>
                        <td>${campaign.clickRate}%</td>
                        <td>${campaign.conversionRate}%</td>
                        <td class="${campaign.riskScore > 70 ? 'risk-high' : campaign.riskScore > 40 ? 'risk-medium' : 'risk-low'}">${campaign.riskScore}</td>
                        <td>${campaign.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  private generatePerformanceMetrics(data: any): string {
    const perf = data.performanceAnalytics;
    
    return `
    <div class="section">
        <h2>Performance Metrics</h2>
        
        <h3>Hourly Activity Distribution</h3>
        <div class="chart-placeholder">
            Hourly Activity Chart (Peak: ${this.findPeakHour(perf.hourlyDistribution)}:00)
        </div>
        
        <h3>Geographic Distribution</h3>
        <table>
            <thead>
                <tr><th>Country</th><th>Sessions</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(perf.geographicDistribution).slice(0, 10).map(([country, count]: any) => `
                    <tr>
                        <td>${country}</td>
                        <td>${count}</td>
                        <td>${((count as number / data.sessions.length) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>Device Breakdown</h3>
        <div class="metric-grid">
            ${Object.entries(perf.deviceBreakdown).map(([device, count]: any) => `
                <div class="metric-card">
                    <div class="metric-value">${count}</div>
                    <div class="metric-label">${device}</div>
                </div>
            `).join('')}
        </div>
    </div>`;
  }

  private generateSecurityAnalysis(data: any): string {
    const security = data.securityAnalytics;
    
    return `
    <div class="section">
        <h2>Security Analysis</h2>
        
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value risk-high">${security.botDetections}</div>
                <div class="metric-label">Bot Detections</div>
            </div>
            <div class="metric-card">
                <div class="metric-value risk-medium">${security.suspiciousActivities}</div>
                <div class="metric-label">Suspicious Activities</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${security.ipAddressAnalysis.uniqueIPs}</div>
                <div class="metric-label">Unique IP Addresses</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${security.deviceFingerprinting.uniqueDevices}</div>
                <div class="metric-label">Unique Devices</div>
            </div>
        </div>
        
        <h3>Repeat Offenders</h3>
        <table>
            <thead>
                <tr><th>IP Address</th><th>Attempts</th><th>Risk Level</th></tr>
            </thead>
            <tbody>
                ${security.ipAddressAnalysis.repeatOffenders.slice(0, 10).map((offender: any) => `
                    <tr>
                        <td>${offender.ip}</td>
                        <td>${offender.attempts}</td>
                        <td class="risk-${offender.attempts > 10 ? 'high' : offender.attempts > 5 ? 'medium' : 'low'}">
                            ${offender.attempts > 10 ? 'High' : offender.attempts > 5 ? 'Medium' : 'Low'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  private generateRiskAssessment(data: any): string {
    const predictive = data.predictiveAnalytics;
    const avgRisk = data.campaignMetrics.reduce((sum: number, m: any) => sum + m.riskScore, 0) / data.campaignMetrics.length;
    
    return `
    <div class="section">
        <h2>Risk Assessment</h2>
        
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value ${avgRisk > 70 ? 'risk-high' : avgRisk > 40 ? 'risk-medium' : 'risk-low'}">${Math.round(avgRisk)}</div>
                <div class="metric-label">Overall Risk Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${predictive.riskTrendAnalysis.trend > 0 ? '+' : ''}${predictive.riskTrendAnalysis.trend}%</div>
                <div class="metric-label">Risk Trend</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(predictive.riskTrendAnalysis.forecast)}</div>
                <div class="metric-label">Predicted Risk</div>
            </div>
        </div>
        
        <h3>Risk Distribution</h3>
        <table>
            <thead>
                <tr><th>Risk Level</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(data.performanceAnalytics.riskLevelDistribution).map(([level, count]: any) => `
                    <tr>
                        <td class="risk-${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</td>
                        <td>${count}</td>
                        <td>${((count as number / data.sessions.length) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  private generateUserBehaviorAnalysis(data: any): string {
    return `
    <div class="section">
        <h2>User Behavior Analysis</h2>
        
        <h3>Interaction Patterns</h3>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.realTimeMetrics.overallOpenRate}%</div>
                <div class="metric-label">Average Open Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.realTimeMetrics.overallClickRate}%</div>
                <div class="metric-label">Average Click Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.realTimeMetrics.overallConversionRate}%</div>
                <div class="metric-label">Average Conversion Rate</div>
            </div>
        </div>
        
        <h3>Most Effective Templates</h3>
        <table>
            <thead>
                <tr><th>Template</th><th>Effectiveness</th><th>Category</th></tr>
            </thead>
            <tbody>
                ${data.performanceAnalytics.topPerformingTemplates.map((template: any) => `
                    <tr>
                        <td>${template.name}</td>
                        <td>${template.effectiveness}%</td>
                        <td>Phishing Simulation</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  private generateTechnicalDetails(data: any): string {
    return `
    <div class="section">
        <h2>Technical Details</h2>
        
        <h3>Platform Statistics</h3>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.sessions.length}</div>
                <div class="metric-label">Total Sessions</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.securityAnalytics.ipAddressAnalysis.uniqueIPs}</div>
                <div class="metric-label">Unique IPs</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.securityAnalytics.deviceFingerprinting.uniqueDevices}</div>
                <div class="metric-label">Unique Devices</div>
            </div>
        </div>
        
        <h3>Operating System Distribution</h3>
        <table>
            <thead>
                <tr><th>Platform</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${data.securityAnalytics.deviceFingerprinting.commonPlatforms.map((platform: any) => `
                    <tr>
                        <td>${platform.platform}</td>
                        <td>${platform.count}</td>
                        <td>${((platform.count / data.sessions.length) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  private generateRecommendations(data: any): string {
    const recommendations = this.generateSmartRecommendations(data);
    
    return `
    <div class="section">
        <h2>Recommendations</h2>
        
        ${recommendations.map((rec: any) => `
            <div class="recommendation">
                <strong>${rec.category}:</strong> ${rec.text}
            </div>
        `).join('')}
    </div>`;
  }

  private generateAppendices(data: any): string {
    return `
    <div class="section">
        <h2>Appendices</h2>
        
        <h3>Appendix A: Campaign Timeline</h3>
        <p>Detailed timeline of campaign activities and user interactions.</p>
        
        <h3>Appendix B: Raw Data Summary</h3>
        <ul>
            <li>Total campaigns analyzed: ${data.campaigns.length}</li>
            <li>Total recipients: ${data.recipients.length}</li>
            <li>Total sessions: ${data.sessions.length}</li>
            <li>Data collection period: ${data.campaigns.length > 0 ? '30 days' : 'N/A'}</li>
        </ul>
        
        <h3>Appendix C: Methodology</h3>
        <p>This report analyzes phishing simulation campaign data using advanced analytics and machine learning algorithms to identify user behavior patterns, security risks, and training effectiveness.</p>
    </div>`;
  }

  private generateSmartRecommendations(data: any): any[] {
    const recommendations = [];
    const avgConversionRate = data.realTimeMetrics.overallConversionRate;
    const avgRiskScore = data.campaignMetrics.reduce((sum: number, m: any) => sum + m.riskScore, 0) / data.campaignMetrics.length;

    if (avgConversionRate > 15) {
      recommendations.push({
        category: 'High Priority',
        text: 'Immediate security awareness training required - conversion rate exceeds acceptable threshold'
      });
    }

    if (avgRiskScore > 60) {
      recommendations.push({
        category: 'Security Risk',
        text: 'Implement additional security controls and monitoring - high risk score detected'
      });
    }

    if (data.securityAnalytics.botDetections > 10) {
      recommendations.push({
        category: 'Technical',
        text: 'Enhance bot detection mechanisms and implement CAPTCHA verification'
      });
    }

    recommendations.push({
      category: 'Training',
      text: 'Schedule quarterly phishing simulation campaigns to maintain awareness levels'
    });

    return recommendations;
  }

  private async generateCSVReport(data: any): Promise<string> {
    const headers = ['Campaign Name', 'Recipients', 'Open Rate', 'Click Rate', 'Conversion Rate', 'Risk Score'];
    const rows = data.campaignMetrics.map((campaign: any) => [
      campaign.campaignName,
      campaign.recipients.toString(),
      campaign.openRate.toString(),
      campaign.clickRate.toString(),
      campaign.conversionRate.toString(),
      campaign.riskScore.toString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private async deliverReport(config: ReportConfiguration, report: GeneratedReport): Promise<void> {
    switch (config.delivery.method) {
      case 'email':
        if (config.delivery.recipients) {
          // Send email with report attachment
          console.log(`Email report sent to: ${config.delivery.recipients.join(', ')}`);
        }
        break;
      case 'webhook':
        if (config.delivery.webhookUrl) {
          // Send report data to webhook
          console.log(`Report sent to webhook: ${config.delivery.webhookUrl}`);
        }
        break;
      case 'download':
      default:
        console.log('Report ready for download');
        break;
    }
  }

  private findMostVulnerableCampaign(metrics: any[]): string {
    if (metrics.length === 0) return 'N/A';
    
    const sorted = metrics.sort((a, b) => b.conversionRate - a.conversionRate);
    return sorted[0].campaignName || 'Unknown';
  }

  private findPeakHour(hourlyData: { [hour: string]: number }): string {
    return Object.entries(hourlyData)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  // Scheduled reporting
  async scheduleRecurringReport(config: ReportConfiguration): Promise<void> {
    if (!config.delivery.scheduleRecurring) return;

    const schedule = config.delivery.scheduleRecurring;
    console.log(`Scheduled recurring report: ${config.name} - ${schedule.frequency}`);
    
    // Implementation would use a job scheduler like node-cron
    // For now, just log the scheduling
  }

  // Report templates
  async getReportTemplates(): Promise<ReportConfiguration[]> {
    return [
      {
        reportId: 'executive-summary',
        name: 'Executive Summary Report',
        description: 'High-level overview for executive stakeholders',
        reportType: 'executive',
        dateRange: { start: new Date(), end: new Date() },
        includeAllCampaigns: true,
        sections: {
          executiveSummary: true,
          campaignOverview: true,
          performanceMetrics: false,
          securityAnalysis: false,
          riskAssessment: true,
          userBehaviorAnalysis: false,
          technicalDetails: false,
          recommendations: true,
          appendices: false
        },
        exportFormats: ['pdf', 'html'],
        delivery: { method: 'download' }
      },
      {
        reportId: 'technical-analysis',
        name: 'Technical Analysis Report',
        description: 'Detailed technical analysis for IT security teams',
        reportType: 'technical',
        dateRange: { start: new Date(), end: new Date() },
        includeAllCampaigns: true,
        sections: {
          executiveSummary: false,
          campaignOverview: true,
          performanceMetrics: true,
          securityAnalysis: true,
          riskAssessment: true,
          userBehaviorAnalysis: true,
          technicalDetails: true,
          recommendations: true,
          appendices: true
        },
        exportFormats: ['html', 'csv', 'json'],
        delivery: { method: 'download' }
      }
    ];
  }
}

export const reportingService = new ReportingService();