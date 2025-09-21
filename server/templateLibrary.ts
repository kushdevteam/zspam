import { EmailTemplate } from '@shared/schema';

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: EnhancedEmailTemplate[];
}

export interface EnhancedEmailTemplate extends Omit<EmailTemplate, 'id' | 'userId' | 'createdAt'> {
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  industry: string[];
  effectiveness: number; // 1-100 based on historical data
  tags: string[];
  previewText: string;
  personalizations: string[];
  mobileOptimized: boolean;
  attachments?: { name: string; description: string }[];
}

export class TemplateLibrary {
  
  private templates: TemplateCategory[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Cryptocurrency Exchange',
      description: 'Phishing templates targeting Coinbase cryptocurrency exchange users',
      templates: [
        {
          name: 'Coinbase Security Alert',
          subject: 'URGENT: Security Alert - Immediate Action Required',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Coinbase Security Alert</title>
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #e2e8f0;">
                    <div style="background-color: #0052ff; padding: 24px; text-align: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTYgMEMxNi44ODM3IDAgMTcuNzQxMyAwLjM1MTI1IDE4LjM4ODcgMC45NzYyNUwyNy43MjUgMTAuMzEyNUM0My4xIDI1LjY4NzUgNDMuMSA1MC4zMTI1IDI3LjcyNSA2NS42ODc1TDE4LjM4ODcgNzUuMDIzOEMxNy43NDEzIDc1LjY0ODggMTYuODgzNyA3NiAxNiA3NkMxNS4xMTYzIDc2IDE0LjI1ODggNzUuNjQ4OCAxMy42MTEzIDc1LjAyMzhMNC4yNzUgNjUuNjg3NUMtMTEuMSA1MC4zMTI1IC0xMS4xIDI1LjY4NzUgNC4yNzUgMTAuMzEyNUwxMy42MTEzIDAuOTc2MjVDMTQuMjU4OCAwLjM1MTI1IDE1LjExNjMgMCAxNiAwWiIgZmlsbD0iIzAwNTJGRiIvPgo8L3N2Zz4K" alt="Coinbase" style="height: 32px;">
                    </div>
                    <div style="padding: 32px;">
                        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px;">
                            <h1 style="color: #dc2626; margin: 0 0 8px 0; font-size: 18px;">🚨 Security Alert: Unauthorized Access Detected</h1>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #374151;">Hello {{user_name}},</p>
                        <p style="margin: 0 0 16px 0; color: #374151;">We have detected suspicious activity on your Coinbase account. For your security, we have temporarily restricted access.</p>
                        <div style="background: #fff3cd; border: 1px solid #fbbf24; padding: 16px; margin: 20px 0; border-radius: 6px;">
                            <strong style="color: #92400e;">Suspicious Activity Details:</strong><br>
                            • Login attempt from {{suspicious_location}}<br>
                            • Device: {{device_info}}<br>
                            • Time: {{detection_time}}<br>
                            • IP Address: {{ip_address}}
                        </div>
                        <p style="margin: 0 0 16px 0; color: #374151;">To restore full access to your account and secure your crypto assets, please verify your identity immediately:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{verification_link}}" style="background-color: #0052ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Account Now</a>
                        </div>
                        <p style="margin: 0 0 8px 0; color: #dc2626; font-weight: 600;">⚠️ Important: This security verification expires in 24 hours.</p>
                        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Failure to verify may result in permanent account suspension and potential loss of access to your cryptocurrency holdings.</p>
                        <p style="margin: 0 0 4px 0; color: #374151;">Best regards,<br>Coinbase Security Team</p>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 16px; font-size: 12px; color: #6b7280; text-align: center;">
                        This is an automated security alert. Please do not reply to this email.
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'URGENT: Security Alert - Suspicious activity detected on your Coinbase account. Please verify your identity immediately using the provided link to restore access.',
          campaignType: 'coinbase',
          category: 'coinbase',
          difficulty: 'intermediate',
          industry: ['cryptocurrency', 'financial', 'trading'],
          effectiveness: 89,
          tags: ['security', 'urgent', 'verification', 'crypto', 'coinbase'],
          previewText: 'Unauthorized access detected - verify immediately',
          personalizations: ['user_name', 'suspicious_location', 'device_info', 'detection_time', 'ip_address', 'verification_link'],
          mobileOptimized: true
        },
        {
          name: 'Coinbase Account Suspension',
          subject: 'Action Required: Verify Your Identity to Restore Account Access',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Coinbase Account Verification</title>
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <div style="background-color: #0052ff; padding: 24px; text-align: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTYgMEMxNi44ODM3IDAgMTcuNzQxMyAwLjM1MTI1IDE4LjM4ODcgMC45NzYyNUwyNy43MjUgMTAuMzEyNUM0My4xIDI1LjY4NzUgNDMuMSA1MC4zMTI1IDI3LjcyNSA2NS42ODc1TDE4LjM4ODcgNzUuMDIzOEMxNy43NDEzIDc1LjY0ODggMTYuODgzNyA3NiAxNiA3NkMxNS4xMTYzIDc2IDE0LjI1ODggNzUuNjQ4OCAxMy42MTEzIDc1LjAyMzhMNC4yNzUgNjUuNjg3NUMtMTEuMSA1MC4zMTI1IC0xMS4xIDI1LjY4NzUgNC4yNzUgMTAuMzEyNUwxMy42MTEzIDAuOTc2MjVDMTQuMjU4OCAwLjM1MTI1IDE1LjExNjMgMCAxNiAwWiIgZmlsbD0iIzAwNTJGRiIvPgo8L3N2Zz4K" alt="Coinbase" style="height: 32px;">
                    </div>
                    <div style="padding: 32px;">
                        <h1 style="color: #0052ff; margin: 0 0 16px 0;">Account Verification Required</h1>
                        <p style="margin: 0 0 16px 0; color: #374151;">Dear {{user_name}},</p>
                        <p style="margin: 0 0 16px 0; color: #374151;">Your Coinbase account has been temporarily suspended due to incomplete identity verification required by regulatory compliance.</p>
                        <div style="border: 1px solid #e5e7eb; padding: 20px; margin: 24px 0; background: #f9fafb; border-radius: 6px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Account Details:</h3>
                            <p style="margin: 0; color: #6b7280;"><strong>Account ID:</strong> {{account_id}}<br>
                            <strong>Suspension Date:</strong> {{suspension_date}}<br>
                            <strong>Verification Deadline:</strong> {{deadline_date}}</p>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #374151;">To restore full access to your account and resume trading, please complete the verification process:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{verification_link}}" style="background-color: #0052ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Complete Verification</a>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #dc2626; font-weight: 600;">⚠️ Account will be permanently closed if verification is not completed within 72 hours.</p>
                        <p style="margin: 0 0 24px 0; color: #374151;">Thank you for your understanding,<br>Coinbase Compliance Team</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Your Coinbase account has been suspended due to incomplete verification. Please complete the verification process within 72 hours to restore access.',
          campaignType: 'coinbase',
          category: 'coinbase',
          difficulty: 'advanced',
          industry: ['cryptocurrency', 'financial', 'compliance'],
          effectiveness: 86,
          tags: ['compliance', 'verification', 'suspension', 'coinbase', 'deadline'],
          previewText: 'Account suspended - verification required',
          personalizations: ['user_name', 'account_id', 'suspension_date', 'deadline_date', 'verification_link'],
          mobileOptimized: true
        },
        {
          name: 'Coinbase Earn Opportunity',
          subject: 'New High-Yield Earn Opportunity: Up to 12% APY 🚀',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Coinbase Earn Opportunity</title>
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <div style="background: linear-gradient(135deg, #0052ff 0%, #00d4aa 100%); padding: 24px; text-align: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTYgMEMxNi44ODM3IDAgMTcuNzQxMyAwLjM1MTI1IDE4LjM4ODcgMC45NzYyNUwyNy43MjUgMTAuMzEyNUM0My4xIDI1LjY4NzUgNDMuMSA1MC4zMTI1IDI3LjcyNSA2NS42ODc1TDE4LjM4ODcgNzUuMDIzOEMxNy43NDEzIDc1LjY0ODggMTYuODgzNyA3NiAxNiA3NkMxNS4xMTYzIDc2IDE0LjI1ODggNzUuNjQ4OCAxMy42MTEzIDc1LjAyMzhMNC4yNzUgNjUuNjg3NUMtMTEuMSA1MC4zMTI1IC0xMS4xIDI1LjY4NzUgNC4yNzUgMTAuMzEyNUwxMy42MTEzIDAuOTc2MjVDMTQuMjU4OCAwLjM1MTI1IDE1LjExNjMgMCAxNiAwWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4K" alt="Coinbase" style="height: 32px;">
                        <h1 style="color: white; margin: 16px 0 0 0; font-size: 24px;">🚀 Exclusive Earn Opportunity</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="margin: 0 0 16px 0; color: #374151;">Hi {{user_name}},</p>
                        <p style="margin: 0 0 16px 0; color: #374151;">You've been selected for early access to our highest-yield earning opportunity yet!</p>
                        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #00d4aa; padding: 20px; margin: 24px 0; border-radius: 6px;">
                            <h3 style="margin: 0 0 12px 0; color: #0369a1;">💰 New Staking Pool: USDC Pro Earn</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                <li><strong>APY:</strong> Up to 12% annually</li>
                                <li><strong>Minimum:</strong> $100 USDC</li>
                                <li><strong>Duration:</strong> Flexible (withdraw anytime)</li>
                                <li><strong>Risk Level:</strong> Low (institutional grade)</li>
                            </ul>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #dc2626; font-weight: 600;">⏰ Limited Time: Only 48 hours to secure your spot</p>
                        <p style="margin: 0 0 16px 0; color: #374151;">Early access participants who deposit within 48 hours receive a 2% bonus APY for the first 3 months.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{earn_link}}" style="background: linear-gradient(135deg, #0052ff 0%, #00d4aa 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Start Earning Now</a>
                        </div>
                        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; text-align: center;">This offer expires on {{expiry_date}} at 11:59 PM UTC</p>
                        <p style="margin: 0 0 4px 0; color: #374151;">Happy earning,<br>The Coinbase Earn Team</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Exclusive high-yield earning opportunity: Up to 12% APY on USDC. Limited time offer - secure your spot within 48 hours.',
          campaignType: 'coinbase',
          category: 'coinbase',
          difficulty: 'beginner',
          industry: ['cryptocurrency', 'investment', 'earning'],
          effectiveness: 78,
          tags: ['earn', 'staking', 'apy', 'promotion', 'coinbase'],
          previewText: 'Exclusive 12% APY earning opportunity',
          personalizations: ['user_name', 'earn_link', 'expiry_date'],
          mobileOptimized: true
        }
      ]
    }
  ];

  getCategories(): TemplateCategory[] {
    return this.templates;
  }

  getCategory(categoryId: string): TemplateCategory | undefined {
    return this.templates.find(cat => cat.id === categoryId);
  }

  getTemplate(categoryId: string, templateName: string): EnhancedEmailTemplate | undefined {
    const category = this.getCategory(categoryId);
    return category?.templates.find(template => template.name === templateName);
  }

  searchTemplates(query: string, filters?: {
    category?: string;
    difficulty?: string;
    industry?: string;
    minEffectiveness?: number;
  }): EnhancedEmailTemplate[] {
    let results: EnhancedEmailTemplate[] = [];
    
    // Collect all Coinbase templates
    const coinbaseCategory = this.templates.find(cat => cat.id === 'coinbase');
    if (coinbaseCategory) {
      results.push(...coinbaseCategory.templates);
    }

    // Apply text search
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters (simplified for Coinbase-only)
    if (filters) {
      if (filters.difficulty) {
        results = results.filter(template => template.difficulty === filters.difficulty);
      }
      if (filters.industry) {
        results = results.filter(template => template.industry.includes(filters.industry));
      }
      if (filters.minEffectiveness) {
        results = results.filter(template => template.effectiveness >= filters.minEffectiveness);
      }
    }

    return results.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  getPersonalizationFields(templateName: string): string[] {
    for (const category of this.templates) {
      const template = category.templates.find(t => t.name === templateName);
      if (template) {
        return template.personalizations;
      }
    }
    return [];
  }

  generateVariant(template: EnhancedEmailTemplate, variantType: 'urgent' | 'friendly' | 'formal'): EnhancedEmailTemplate {
    const variant = { ...template };
    
    switch (variantType) {
      case 'urgent':
        variant.subject = `URGENT: ${template.subject}`;
        variant.name = `${template.name} (Urgent Variant)`;
        break;
      case 'friendly':
        variant.subject = template.subject.replace(/Urgent:|URGENT:|Action Required:/gi, '');
        variant.name = `${template.name} (Friendly Variant)`;
        break;
      case 'formal':
        variant.subject = `Official Notice: ${template.subject}`;
        variant.name = `${template.name} (Formal Variant)`;
        break;
    }
    
    return variant;
  }
}

export const templateLibrary = new TemplateLibrary();