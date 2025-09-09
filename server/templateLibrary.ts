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
      id: 'banking',
      name: 'Banking & Financial Services',
      description: 'Phishing templates targeting UK banks and financial institutions',
      templates: [
        {
          name: 'Barclays Security Alert',
          subject: 'Urgent: Suspicious Activity Detected on Your Account',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Barclays Security Alert</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd;">
                    <div style="background-color: #00AEEF; padding: 20px; text-align: center;">
                        <img src="https://via.placeholder.com/150x50/00AEEF/FFFFFF?text=Barclays" alt="Barclays" style="height: 40px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="color: #d32f2f; margin-bottom: 20px;">Security Alert: Immediate Action Required</h1>
                        <p>Dear {{name}},</p>
                        <p>We have detected suspicious activity on your account ending in <strong>****{{last_four_digits}}</strong>.</p>
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <strong>Suspicious Activity:</strong><br>
                            • Login attempt from unrecognized device<br>
                            • Location: {{suspicious_location}}<br>
                            • Time: {{time}}<br>
                        </div>
                        <p>To secure your account, please verify your identity immediately:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #00AEEF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account Now</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">This security measure expires in 24 hours. Failure to verify may result in account suspension.</p>
                        <p>Best regards,<br>Barclays Security Team</p>
                    </div>
                    <div style="background-color: #f0f0f0; padding: 15px; font-size: 12px; color: #666;">
                        This email was sent from a notification-only address. Please do not reply to this email.
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Security Alert: Suspicious activity detected on your Barclays account. Please verify your identity at the provided link.',
          campaignType: 'barclays',
          category: 'banking',
          difficulty: 'intermediate',
          industry: ['banking', 'financial'],
          effectiveness: 85,
          tags: ['security', 'urgent', 'verification', 'uk-banking'],
          previewText: 'Urgent security alert - verify your account now',
          personalizations: ['name', 'last_four_digits', 'suspicious_location', 'time'],
          mobileOptimized: true
        },
        {
          name: 'HSBC Payment Confirmation',
          subject: 'Payment Confirmation Required - £{{amount}}',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HSBC Payment Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <div style="background-color: #DB0011; padding: 20px; text-align: center;">
                        <img src="https://via.placeholder.com/150x50/DB0011/FFFFFF?text=HSBC" alt="HSBC" style="height: 40px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="color: #DB0011;">Payment Authorization Required</h1>
                        <p>Dear {{first_name}} {{last_name}},</p>
                        <p>A payment of <strong>£{{amount}}</strong> is pending confirmation from your HSBC account.</p>
                        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
                            <h3>Transaction Details:</h3>
                            <p><strong>Amount:</strong> £{{amount}}<br>
                            <strong>Recipient:</strong> {{recipient}}<br>
                            <strong>Reference:</strong> {{reference}}<br>
                            <strong>Date:</strong> {{date}}</p>
                        </div>
                        <p>To authorize this payment, please confirm your details:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #DB0011; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Payment</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">If you did not initiate this payment, please cancel it immediately using the link above.</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Payment confirmation required for £{{amount}}. Please confirm or cancel this transaction.',
          campaignType: 'hsbc',
          category: 'banking',
          difficulty: 'advanced',
          industry: ['banking', 'financial'],
          effectiveness: 78,
          tags: ['payment', 'confirmation', 'transaction', 'hsbc'],
          previewText: 'Payment of £{{amount}} requires your confirmation',
          personalizations: ['first_name', 'last_name', 'amount', 'recipient', 'reference', 'date'],
          mobileOptimized: true
        }
      ]
    },
    {
      id: 'social_media',
      name: 'Social Media & Tech',
      description: 'Templates targeting social media platforms and tech services',
      templates: [
        {
          name: 'LinkedIn Security Notice',
          subject: 'LinkedIn: Someone tried to access your account',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LinkedIn Security Notice</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f2ef;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #e6e6e6;">
                    <div style="background-color: #0A66C2; padding: 20px; text-align: center;">
                        <img src="https://via.placeholder.com/150x50/0A66C2/FFFFFF?text=LinkedIn" alt="LinkedIn" style="height: 40px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="color: #0A66C2;">Security Alert</h1>
                        <p>Hi {{first_name}},</p>
                        <p>We noticed someone tried to sign in to your LinkedIn account from a device we don't recognize.</p>
                        <div style="background: #fff4e6; border-left: 4px solid #ff9500; padding: 15px; margin: 20px 0;">
                            <strong>Sign-in attempt details:</strong><br>
                            Device: {{device}}<br>
                            Location: {{location}}<br>
                            Time: {{timestamp}}
                        </div>
                        <p>If this was you, you can ignore this email. If not, we recommend securing your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #0A66C2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Secure My Account</a>
                        </div>
                        <p>Thanks for helping keep LinkedIn secure.</p>
                        <p>The LinkedIn Team</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Someone tried to access your LinkedIn account. Please secure your account if this wasn\'t you.',
          campaignType: 'linkedin',
          category: 'social_media',
          difficulty: 'beginner',
          industry: ['technology', 'professional', 'social'],
          effectiveness: 72,
          tags: ['security', 'linkedin', 'professional', 'account'],
          previewText: 'Unusual sign-in attempt detected',
          personalizations: ['first_name', 'device', 'location', 'timestamp'],
          mobileOptimized: true
        },
        {
          name: 'Microsoft 365 Subscription Renewal',
          subject: 'Action Required: Your Microsoft 365 subscription expires tomorrow',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Microsoft 365 Renewal</title>
            </head>
            <body style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <div style="background: linear-gradient(90deg, #0078d4 0%, #1890f2 100%); padding: 20px; text-align: center;">
                        <img src="https://via.placeholder.com/150x50/0078d4/FFFFFF?text=Microsoft" alt="Microsoft" style="height: 40px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="color: #0078d4;">Subscription Renewal Required</h1>
                        <p>Hello {{name}},</p>
                        <p>Your Microsoft 365 Business subscription will expire <strong>tomorrow</strong>.</p>
                        <div style="background: #fef7e0; border: 1px solid #fadb14; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <strong>⚠️ Important:</strong> Your access to Office applications, OneDrive, and email will be suspended if not renewed within 24 hours.
                        </div>
                        <p><strong>Your Subscription Details:</strong></p>
                        <ul>
                            <li>Plan: Microsoft 365 Business Standard</li>
                            <li>Users: {{user_count}}</li>
                            <li>Expires: {{expiry_date}}</li>
                            <li>Renewal Cost: £{{renewal_cost}}/month</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #0078d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Renew Subscription</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">Renew now to avoid service interruption and potential data loss.</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Your Microsoft 365 subscription expires tomorrow. Renew now to avoid service interruption.',
          campaignType: 'office365',
          category: 'social_media',
          difficulty: 'intermediate',
          industry: ['technology', 'business', 'productivity'],
          effectiveness: 80,
          tags: ['microsoft', 'subscription', 'renewal', 'business'],
          previewText: 'Subscription expires tomorrow - renew now',
          personalizations: ['name', 'user_count', 'expiry_date', 'renewal_cost'],
          mobileOptimized: true
        }
      ]
    },
    {
      id: 'government',
      name: 'Government & Public Services',
      description: 'Templates impersonating UK government services',
      templates: [
        {
          name: 'HMRC Tax Refund',
          subject: 'HMRC: You are entitled to a tax refund of £{{amount}}',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HMRC Tax Refund</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #bbb;">
                    <div style="background-color: #003d6b; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 18px;">HM Revenue & Customs</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #003d6b;">Tax Refund Notification</h2>
                        <p>Dear {{title}} {{surname}},</p>
                        <p>Following a review of your tax records, we have determined that you are entitled to a refund.</p>
                        <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
                            <strong>Refund Amount: £{{amount}}</strong><br>
                            Tax Year: {{tax_year}}<br>
                            Reference: {{reference}}
                        </div>
                        <p>To claim your refund, please verify your details and provide your bank account information:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #00823b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 3px; font-weight: bold;">Claim Refund</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">This refund will expire in 30 days if not claimed.</p>
                        <p>Yours sincerely,<br>HM Revenue and Customs</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'You are entitled to a tax refund of £{{amount}}. Please claim your refund using the provided link.',
          campaignType: 'hmrc',
          category: 'government',
          difficulty: 'advanced',
          industry: ['government', 'taxation', 'public'],
          effectiveness: 88,
          tags: ['hmrc', 'tax', 'refund', 'government', 'uk'],
          previewText: 'Tax refund of £{{amount}} awaiting claim',
          personalizations: ['title', 'surname', 'amount', 'tax_year', 'reference'],
          mobileOptimized: true
        }
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-commerce & Retail',
      description: 'Templates targeting popular online shopping platforms',
      templates: [
        {
          name: 'Amazon Account Suspension',
          subject: 'Amazon: Your account has been temporarily suspended',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Amazon Account Notice</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <div style="background-color: #232f3e; padding: 20px; text-align: center;">
                        <img src="https://via.placeholder.com/150x50/232f3e/FFFFFF?text=amazon" alt="Amazon" style="height: 40px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="color: #c7131f;">Account Suspension Notice</h1>
                        <p>Dear {{first_name}},</p>
                        <p>We have temporarily suspended your Amazon account due to unusual activity.</p>
                        <div style="background: #ffedef; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <strong>Reason for suspension:</strong><br>
                            • Multiple failed payment attempts<br>
                            • Suspicious order patterns<br>
                            • Account verification required
                        </div>
                        <p>To restore your account access, please verify your identity and payment information:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{phishing_url}}" style="background-color: #ff9900; color: black; padding: 15px 30px; text-decoration: none; border-radius: 3px; font-weight: bold;">Restore Account</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">Account will be permanently closed if not verified within 48 hours.</p>
                        <p>Thank you,<br>Amazon Customer Service</p>
                    </div>
                </div>
            </body>
            </html>`,
          textContent: 'Your Amazon account has been suspended. Please verify your account to restore access.',
          campaignType: 'amazon',
          category: 'ecommerce',
          difficulty: 'intermediate',
          industry: ['retail', 'ecommerce', 'shopping'],
          effectiveness: 75,
          tags: ['amazon', 'suspension', 'ecommerce', 'account'],
          previewText: 'Account temporarily suspended - action required',
          personalizations: ['first_name'],
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
    
    // Collect all templates
    this.templates.forEach(category => {
      results.push(...category.templates);
    });

    // Apply text search
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(template => template.category === filters.category);
      }
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