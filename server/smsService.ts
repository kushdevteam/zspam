import { Campaign, Recipient } from '@shared/schema';

export interface SmsContent {
  message: string;
  from?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}

export interface SmsProvider {
  name: string;
  apiKey: string;
  apiSecret?: string;
  fromNumber: string;
}

export class SmsService {
  private provider: SmsProvider | null = null;

  setProvider(provider: SmsProvider): void {
    this.provider = provider;
  }

  async sendSms(to: string, content: SmsContent): Promise<SmsSendResult> {
    if (!this.provider) {
      return {
        success: false,
        error: 'SMS provider not configured',
        recipient: to,
      };
    }

    try {
      // For now, we'll simulate SMS sending
      // In production, integrate with actual SMS providers like Twilio, AWS SNS, etc.
      
      if (this.provider.name === 'twilio') {
        return await this.sendViaTwilio(to, content);
      } else if (this.provider.name === 'aws-sns') {
        return await this.sendViaAwsSns(to, content);
      } else {
        return await this.simulateSms(to, content);
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipient: to,
      };
    }
  }

  private async sendViaTwilio(to: string, content: SmsContent): Promise<SmsSendResult> {
    // TODO: Implement actual Twilio integration
    // const twilio = require('twilio');
    // const client = twilio(this.provider!.apiKey, this.provider!.apiSecret);
    
    console.log(`[TWILIO SIMULATION] SMS to ${to}: ${content.message}`);
    
    return {
      success: true,
      messageId: `twilio_${Date.now()}`,
      recipient: to,
    };
  }

  private async sendViaAwsSns(to: string, content: SmsContent): Promise<SmsSendResult> {
    // TODO: Implement actual AWS SNS integration
    console.log(`[AWS SNS SIMULATION] SMS to ${to}: ${content.message}`);
    
    return {
      success: true,
      messageId: `sns_${Date.now()}`,
      recipient: to,
    };
  }

  private async simulateSms(to: string, content: SmsContent): Promise<SmsSendResult> {
    // Simulate SMS sending for demo purposes
    console.log(`[SMS SIMULATION] To: ${to}, From: ${content.from || this.provider!.fromNumber}, Message: ${content.message}`);
    
    // Simulate random success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    if (isSuccess) {
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        recipient: to,
      };
    } else {
      return {
        success: false,
        error: 'Simulated delivery failure',
        recipient: to,
      };
    }
  }

  async sendSmsCampaign(
    campaign: Campaign,
    recipients: Recipient[],
    messageTemplate: string,
    options: {
      batchSize?: number;
      delayBetweenBatches?: number; // milliseconds
      delayBetweenSms?: number; // milliseconds
    } = {}
  ): Promise<{
    sentCount: number;
    failedCount: number;
    results: SmsSendResult[];
  }> {
    const {
      batchSize = 20,
      delayBetweenBatches = 10000, // 10 seconds
      delayBetweenSms = 2000, // 2 seconds
    } = options;

    const results: SmsSendResult[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const personalizedMessage = this.personalizeMessage(messageTemplate, recipient, campaign);
          const result = await this.sendSms(recipient.phone || recipient.email, {
            message: personalizedMessage,
            from: this.provider?.fromNumber,
          });

          results.push(result);
          
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }

          // Delay between SMS messages
          if (delayBetweenSms > 0) {
            await this.delay(delayBetweenSms);
          }

        } catch (error) {
          failedCount++;
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            recipient: recipient.phone || recipient.email,
          });
        }
      }

      // Delay between batches
      if (i + batchSize < recipients.length && delayBetweenBatches > 0) {
        await this.delay(delayBetweenBatches);
      }
    }

    return { sentCount, failedCount, results };
  }

  private personalizeMessage(template: string, recipient: Recipient, campaign: Campaign): string {
    let message = template;

    // Basic personalization
    const personalizations = {
      '{{name}}': recipient.name || recipient.firstName || 'User',
      '{{first_name}}': recipient.firstName || 'User',
      '{{last_name}}': recipient.lastName || '',
      '{{email}}': recipient.email,
      '{{company}}': recipient.company || '',
      '{{phone}}': recipient.phone || '',
    };

    for (const [placeholder, value] of Object.entries(personalizations)) {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      message = message.replace(regex, value);
    }

    return message;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test SMS functionality
  async sendTestSms(provider: SmsProvider, testNumber: string): Promise<SmsSendResult> {
    this.setProvider(provider);
    
    const testMessage = `zSPAM SMS Test - ${new Date().toISOString()}`;
    
    return await this.sendSms(testNumber, {
      message: testMessage,
      from: provider.fromNumber,
    });
  }

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Format phone number for SMS sending
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Add + if not present and starts with country code
    if (!formatted.startsWith('+') && formatted.length > 10) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}

export const smsService = new SmsService();