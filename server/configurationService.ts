import { SmtpServer } from '@shared/schema';
import { storage } from './storage';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { webhookService } from './webhookService';

export interface SmtpTestResult {
  success: boolean;
  error?: string;
  details: {
    connectionTime: number;
    authenticationTime: number;
    sendTime?: number;
  };
}

export interface SmsTestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime: number;
}

export interface WebhookTestResult {
  success: boolean;
  responseCode?: number;
  responseTime: number;
  error?: string;
}

export class ConfigurationService {
  
  // SMTP Configuration and Testing
  async testSmtpConfiguration(smtpConfig: Omit<SmtpServer, 'id' | 'userId' | 'createdAt'>): Promise<SmtpTestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Testing SMTP configuration for ${smtpConfig.host}:${smtpConfig.port}`);
      
      // Connection test
      const connectionStart = Date.now();
      const isConnected = await emailService.testSmtpConnection(smtpConfig);
      const connectionTime = Date.now() - connectionStart;
      
      if (!isConnected) {
        return {
          success: false,
          error: 'Failed to connect to SMTP server',
          details: { connectionTime, authenticationTime: 0 }
        };
      }
      
      // Authentication test
      const authStart = Date.now();
      const isAuthenticated = await emailService.testSmtpAuthentication(smtpConfig);
      const authenticationTime = Date.now() - authStart;
      
      if (!isAuthenticated) {
        return {
          success: false,
          error: 'SMTP authentication failed',
          details: { connectionTime, authenticationTime }
        };
      }
      
      // Send test email - use existing sendTestEmail method
      const sendStart = Date.now();
      const testResult = await emailService.sendTestEmail(smtpConfig as any, smtpConfig.fromEmail);
      const sendTime = Date.now() - sendStart;
      
      return {
        success: testResult.success,
        error: testResult.error,
        details: { connectionTime, authenticationTime, sendTime }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { connectionTime: Date.now() - startTime, authenticationTime: 0 }
      };
    }
  }
  
  async saveSmtpConfiguration(userId: string, smtpConfig: Omit<SmtpServer, 'id' | 'userId' | 'createdAt'>): Promise<SmtpServer> {
    // Test configuration before saving
    const testResult = await this.testSmtpConfiguration(smtpConfig);
    
    if (!testResult.success) {
      throw new Error(`SMTP configuration test failed: ${testResult.error}`);
    }
    
    // Deactivate all other SMTP servers for this user if this one is being set as active
    if (smtpConfig.isActive) {
      const userSmtpServers = await storage.getSmtpServersByUserId(userId);
      for (const server of userSmtpServers) {
        if (server.isActive) {
          await storage.updateSmtpServer(server.id!, { ...server, isActive: false });
        }
      }
    }
    
    return await storage.createSmtpServer({
      ...smtpConfig,
      userId
    });
  }
  
  // SMS Configuration and Testing
  async testSmsConfiguration(provider: string, apiKey: string, apiSecret: string, fromNumber: string, testNumber: string): Promise<SmsTestResult> {
    const startTime = Date.now();
    
    try {
      const testResult = await smsService.sendTestSms({
        name: provider,
        apiKey,
        apiSecret,
        fromNumber
      }, testNumber);
      
      return {
        success: testResult.success,
        messageId: testResult.messageId,
        error: testResult.error,
        deliveryTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        deliveryTime: Date.now() - startTime
      };
    }
  }
  
  // Webhook Configuration and Testing
  async testWebhookConfiguration(url: string, secret?: string): Promise<WebhookTestResult> {
    const startTime = Date.now();
    
    try {
      const endpoint = {
        url,
        secret,
        events: ['test.webhook'],
        isActive: true
      };
      
      const success = await webhookService.testWebhook(endpoint);
      
      return {
        success,
        responseCode: success ? 200 : 500,
        responseTime: Date.now() - startTime,
        error: success ? undefined : 'Webhook test failed'
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // Environment Configuration
  async getEnvironmentConfiguration(): Promise<{
    environment: string;
    database: boolean;
    smtp: boolean;
    sms: boolean;
    webhooks: boolean;
    features: string[];
  }> {
    const environment = process.env.NODE_ENV || 'development';
    
    // Check service availability
    const database = await this.checkDatabaseConnection();
    const smtp = await this.checkSmtpAvailability();
    const sms = await this.checkSmsAvailability();
    const webhooks = await this.checkWebhookAvailability();
    
    const features = [
      'email_campaigns',
      'sms_campaigns',
      'webhook_integrations',
      'real_time_analytics',
      'ab_testing',
      'scheduled_campaigns',
      'risk_scoring',
      'compliance_reporting'
    ];
    
    return {
      environment,
      database,
      smtp,
      sms,
      webhooks,
      features
    };
  }
  
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      // Try to perform a simple database operation
      await storage.getUserByUsername('test-connection-check');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private async checkSmtpAvailability(): Promise<boolean> {
    // Check if any SMTP servers are configured
    try {
      const smtpServers = await storage.getSmtpServers();
      return smtpServers.length > 0;
    } catch (error) {
      return false;
    }
  }
  
  private async checkSmsAvailability(): Promise<boolean> {
    // Check if SMS environment variables are set
    return !!(process.env.TWILIO_ACCOUNT_SID || process.env.AWS_ACCESS_KEY_ID);
  }
  
  private async checkWebhookAvailability(): Promise<boolean> {
    // Webhooks are always available as they don't require external dependencies
    return true;
  }
  
  // Security Configuration
  async getSecurityConfiguration(): Promise<{
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    authentication: {
      tokenExpiration: number;
      refreshExpiration: number;
      passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
      };
    };
    encryption: {
      algorithm: string;
      keyDerivation: string;
    };
  }> {
    return {
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5 // 5 login attempts per window
      },
      authentication: {
        tokenExpiration: 15 * 60, // 15 minutes
        refreshExpiration: 7 * 24 * 60 * 60, // 7 days
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      },
      encryption: {
        algorithm: 'bcrypt',
        keyDerivation: 'PBKDF2'
      }
    };
  }
  
  // System Health Check
  async performSystemHealthCheck(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    services: {
      database: 'healthy' | 'warning' | 'critical';
      email: 'healthy' | 'warning' | 'critical';
      sms: 'healthy' | 'warning' | 'critical';
      webhooks: 'healthy' | 'warning' | 'critical';
    };
    metrics: {
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage;
      activeConnections: number;
    };
  }> {
    const services = {
      database: await this.checkDatabaseConnection() ? 'healthy' as const : 'critical' as const,
      email: await this.checkSmtpAvailability() ? 'healthy' as const : 'warning' as const,
      sms: await this.checkSmsAvailability() ? 'healthy' as const : 'warning' as const,
      webhooks: 'healthy' as const
    };
    
    const criticalServices = Object.values(services).filter(status => status === 'critical').length;
    const warningServices = Object.values(services).filter(status => status === 'warning').length;
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalServices > 0) {
      overall = 'critical';
    } else if (warningServices > 0) {
      overall = 'warning';
    }
    
    return {
      overall,
      services,
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        activeConnections: 0 // Could be implemented with actual connection tracking
      }
    };
  }
}

export const configurationService = new ConfigurationService();