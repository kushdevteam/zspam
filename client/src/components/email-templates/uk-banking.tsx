// UK Banking Email Templates for phishing campaigns

export const ukBankingTemplates = {
  barclays: {
    name: "Barclays Security Alert",
    subject: "Urgent: Suspicious Activity Detected on Your Barclays Account",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Barclays Security Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #00AEEF; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Barclays</h1>
    </div>
    
    <div style="background: #f8f8f8; padding: 20px; border-left: 4px solid #ff6b6b;">
        <h2 style="color: #d63031; margin-top: 0;">Security Alert: Immediate Action Required</h2>
        <p><strong>Dear Valued Customer,</strong></p>
        <p>We have detected unusual activity on your Barclays Online Banking account. For your security, we have temporarily limited access to your account.</p>
        
        <div style="background: white; padding: 15px; margin: 20px 0; border: 1px solid #ddd;">
            <h3 style="color: #d63031; margin-top: 0;">Suspicious Activities Detected:</h3>
            <ul>
                <li>Login attempt from unknown device (IP: 192.168.1.***)</li>
                <li>Multiple failed authentication attempts</li>
                <li>Unusual transaction patterns detected</li>
            </ul>
        </div>
        
        <p>To restore full access to your account and ensure your security, please verify your identity immediately:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{CAMPAIGN_URL}}" style="background: #00AEEF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Account Now</a>
        </div>
        
        <p><strong>Important:</strong> If you do not verify your account within 24 hours, it will be permanently suspended for security reasons.</p>
        
        <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border: 1px solid #74b9ff;">
            <p style="margin: 0;"><strong>Security Tip:</strong> Barclays will never ask for your full passcode or PIN in an email. Always log in through our official website.</p>
        </div>
    </div>
    
    <div style="background: #2d3436; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p>© 2024 Barclays Bank UK PLC. All rights reserved.</p>
        <p>Barclays Bank UK PLC is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority.</p>
    </div>
    
</body>
</html>
    `,
    textContent: `BARCLAYS SECURITY ALERT

Dear Valued Customer,

We have detected unusual activity on your Barclays Online Banking account. For your security, we have temporarily limited access to your account.

SUSPICIOUS ACTIVITIES DETECTED:
- Login attempt from unknown device
- Multiple failed authentication attempts  
- Unusual transaction patterns detected

To restore full access to your account, please verify your identity immediately at: {{CAMPAIGN_URL}}

IMPORTANT: If you do not verify your account within 24 hours, it will be permanently suspended for security reasons.

© 2024 Barclays Bank UK PLC. All rights reserved.`
  },

  hsbc: {
    name: "HSBC Account Verification Required",
    subject: "Action Required: Verify Your HSBC Online Banking Details",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HSBC Account Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #DB0011; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">HSBC</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px;">The world's local bank</p>
    </div>
    
    <div style="padding: 30px 20px; background: white;">
        <h2 style="color: #DB0011; margin-top: 0;">Account Verification Required</h2>
        
        <p><strong>Dear HSBC Customer,</strong></p>
        
        <p>As part of our ongoing commitment to protect your account, we regularly review customer accounts for security purposes.</p>
        
        <div style="background: #fff5f5; border: 2px solid #DB0011; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #DB0011; margin-top: 0;">⚠️ Action Required</h3>
            <p>Your account requires immediate verification due to recent security updates. Failure to complete verification within 48 hours may result in temporary account restrictions.</p>
        </div>
        
        <h3 style="color: #333;">Why is this necessary?</h3>
        <ul>
            <li>Enhanced security measures implementation</li>
            <li>Compliance with new regulatory requirements</li>
            <li>Protection against unauthorized access</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{CAMPAIGN_URL}}" style="background: #DB0011; color: white; padding: 15px 40px; text-decoration: none; border-radius: 3px; font-weight: bold; display: inline-block; font-size: 16px;">Complete Verification</a>
        </div>
        
        <p>This process takes less than 2 minutes and ensures your account remains fully protected.</p>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px;">
            <h4 style="color: #DB0011;">Security Reminder</h4>
            <p style="font-size: 14px; color: #666;">HSBC will never ask you to confirm your Online Banking details by email. This verification process is conducted through our secure servers.</p>
        </div>
    </div>
    
    <div style="background: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>HSBC Bank plc. Head Office: 8 Canada Square, London E14 5HQ, United Kingdom</p>
        <p>Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority.</p>
    </div>
    
</body>
</html>
    `,
    textContent: `HSBC ACCOUNT VERIFICATION REQUIRED

Dear HSBC Customer,

As part of our ongoing commitment to protect your account, we regularly review customer accounts for security purposes.

ACTION REQUIRED: Your account requires immediate verification due to recent security updates. Failure to complete verification within 48 hours may result in temporary account restrictions.

Please complete verification at: {{CAMPAIGN_URL}}

This process takes less than 2 minutes and ensures your account remains fully protected.

HSBC Bank plc. Authorised by the Prudential Regulation Authority.`
  },

  lloyds: {
    name: "Lloyds Banking Security Update",
    subject: "Lloyds Bank: Confirm Your Account Details - Urgent",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Lloyds Banking Security Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #006A4D; color: white; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Lloyds Bank</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">By your side</p>
    </div>
    
    <div style="padding: 25px; background: white;">
        <h2 style="color: #006A4D; margin-top: 0; font-size: 20px;">Important Security Update</h2>
        
        <p><strong>Dear Customer,</strong></p>
        
        <p>We're writing to inform you of an important security update to our Internet Banking system that requires your immediate attention.</p>
        
        <div style="background: #f0f8f4; border-left: 4px solid #006A4D; padding: 20px; margin: 25px 0;">
            <h3 style="color: #006A4D; margin-top: 0; font-size: 16px;">🔐 Enhanced Security Measures</h3>
            <p style="margin-bottom: 0;">To comply with new banking regulations and enhance your account security, we need to verify your current banking details.</p>
        </div>
        
        <h3 style="color: #333; font-size: 16px;">What you need to do:</h3>
        <div style="background: white; border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
            <ol style="margin: 0; padding-left: 20px;">
                <li>Click the secure link below</li>
                <li>Log in with your existing User ID and Password</li>
                <li>Confirm your account details</li>
                <li>Your account will be updated automatically</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{CAMPAIGN_URL}}" style="background: #006A4D; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 15px;">Update My Account</a>
        </div>
        
        <p><strong>Time sensitive:</strong> Please complete this security update within 72 hours to avoid any interruption to your banking services.</p>
        
        <div style="background: #e8f6f0; padding: 15px; margin: 25px 0; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px;"><strong>Remember:</strong> Lloyds Bank will never ask you to give us your Internet Banking details in an email, over the phone or by text message.</p>
        </div>
    </div>
    
    <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 11px; color: #666;">
        <p style="margin: 0 0 10px 0;">Lloyds Bank plc. Registered Office: 25 Gresham Street, London EC2V 7HN</p>
        <p style="margin: 0;">Registered in England and Wales No. 2065. Authorised by the Prudential Regulation Authority.</p>
    </div>
    
</body>
</html>
    `,
    textContent: `LLOYDS BANK SECURITY UPDATE

Dear Customer,

We're writing to inform you of an important security update to our Internet Banking system that requires your immediate attention.

ENHANCED SECURITY MEASURES: To comply with new banking regulations and enhance your account security, we need to verify your current banking details.

What you need to do:
1. Visit the secure link: {{CAMPAIGN_URL}}
2. Log in with your existing User ID and Password
3. Confirm your account details
4. Your account will be updated automatically

TIME SENSITIVE: Please complete this security update within 72 hours to avoid any interruption to your banking services.

Lloyds Bank plc. Registered in England and Wales No. 2065.`
  }
};

export default ukBankingTemplates;