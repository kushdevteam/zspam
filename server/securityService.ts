import { Session, Campaign } from '@shared/schema';
import { storage } from './storage';
import { monitoringService } from './monitoringService';

export interface SecurityHardeningConfiguration {
  // Access control
  accessControl: {
    enforcePasswordPolicy: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number; // days
      preventReuse: number; // number of previous passwords
    };
    mfaRequired: boolean;
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    accountLockout: {
      enabled: boolean;
      maxAttempts: number;
      lockoutDuration: number; // minutes
    };
  };

  // Network security
  networkSecurity: {
    ipWhitelist: string[];
    geoBlocking: {
      enabled: boolean;
      allowedCountries: string[];
      blockedCountries: string[];
    };
    rateLimiting: {
      globalRateLimit: number; // requests per minute
      perIPRateLimit: number;
      perUserRateLimit: number;
      burstAllowance: number;
    };
    ddosProtection: {
      enabled: boolean;
      threshold: number; // requests per second
      blockDuration: number; // minutes
    };
  };

  // Data protection
  dataProtection: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    dataAnonymization: boolean;
    piiDetection: boolean;
    dataLossPrevention: {
      enabled: boolean;
      scanEmails: boolean;
      scanUploads: boolean;
      blockedPatterns: string[];
    };
  };

  // Monitoring and detection
  monitoring: {
    suspiciousActivityDetection: boolean;
    anomalyDetection: boolean;
    realTimeAlerts: boolean;
    securityEventLogging: boolean;
    intrusionDetection: {
      enabled: boolean;
      sensitivity: 'low' | 'medium' | 'high';
      autoBlock: boolean;
    };
  };

  // Compliance
  compliance: {
    gdprCompliance: boolean;
    hipaaCompliance: boolean;
    soxCompliance: boolean;
    iso27001Compliance: boolean;
    auditTrails: boolean;
    dataRetentionPolicies: {
      emailData: number; // days
      sessionData: number;
      auditLogs: number;
      campaignData: number;
    };
  };
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_exposure' | 'injection' | 'configuration' | 'cryptography';
  title: string;
  description: string;
  affected_components: string[];
  cve_id?: string;
  discovery_date: Date;
  status: 'open' | 'investigating' | 'patched' | 'mitigated' | 'false_positive';
  remediation_steps: string[];
  impact_assessment: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
  };
}

export interface SecurityAuditResult {
  audit_id: string;
  timestamp: Date;
  audit_type: 'automated' | 'manual' | 'penetration_test' | 'compliance_check';
  overall_score: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  compliance_status: {
    gdpr: boolean;
    hipaa: boolean;
    sox: boolean;
    iso27001: boolean;
  };
  recommendations: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
}

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'unauthorized_access' | 'data_breach' | 'malware' | 'phishing_attack' | 'ddos' | 'insider_threat';
  description: string;
  affected_systems: string[];
  affected_users: string[];
  source_ip?: string;
  indicators_of_compromise: string[];
  containment_actions: string[];
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  assigned_to?: string;
  resolution_time?: Date;
}

export class SecurityService {
  private hardeningConfig: SecurityHardeningConfiguration;
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivities: Map<string, number> = new Map();
  private activeIncidents: Map<string, SecurityIncident> = new Map();

  constructor() {
    this.hardeningConfig = this.loadDefaultConfiguration();
    this.startSecurityMonitoring();
  }

  private loadDefaultConfiguration(): SecurityHardeningConfiguration {
    return {
      accessControl: {
        enforcePasswordPolicy: true,
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90,
          preventReuse: 5
        },
        mfaRequired: true,
        sessionTimeout: 30,
        maxConcurrentSessions: 3,
        accountLockout: {
          enabled: true,
          maxAttempts: 5,
          lockoutDuration: 15
        }
      },
      networkSecurity: {
        ipWhitelist: [],
        geoBlocking: {
          enabled: false,
          allowedCountries: ['US', 'CA', 'GB', 'AU'],
          blockedCountries: ['RU', 'CN', 'KP', 'IR']
        },
        rateLimiting: {
          globalRateLimit: 1000,
          perIPRateLimit: 100,
          perUserRateLimit: 200,
          burstAllowance: 10
        },
        ddosProtection: {
          enabled: true,
          threshold: 100,
          blockDuration: 60
        }
      },
      dataProtection: {
        encryptionAtRest: true,
        encryptionInTransit: true,
        dataAnonymization: true,
        piiDetection: true,
        dataLossPrevention: {
          enabled: true,
          scanEmails: true,
          scanUploads: true,
          blockedPatterns: [
            '\\d{3}-\\d{2}-\\d{4}', // SSN
            '\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}', // Credit card
            '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' // Email patterns in content
          ]
        }
      },
      monitoring: {
        suspiciousActivityDetection: true,
        anomalyDetection: true,
        realTimeAlerts: true,
        securityEventLogging: true,
        intrusionDetection: {
          enabled: true,
          sensitivity: 'medium',
          autoBlock: true
        }
      },
      compliance: {
        gdprCompliance: true,
        hipaaCompliance: false,
        soxCompliance: false,
        iso27001Compliance: true,
        auditTrails: true,
        dataRetentionPolicies: {
          emailData: 365,
          sessionData: 90,
          auditLogs: 2555, // 7 years
          campaignData: 1095 // 3 years
        }
      }
    };
  }

  private startSecurityMonitoring(): void {
    // Monitor suspicious activities every 30 seconds
    setInterval(() => {
      this.detectSuspiciousActivities();
    }, 30000);

    // Perform security scans every hour
    setInterval(() => {
      this.performAutomatedSecurityScan();
    }, 3600000);

    // Clean up old security data daily
    setInterval(() => {
      this.cleanupSecurityData();
    }, 86400000);

    console.log('Security monitoring started');
  }

  async detectSuspiciousActivities(): Promise<void> {
    try {
      const recentSessions = await storage.getSessions();
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Analyze recent sessions for suspicious patterns
      const suspiciousPatterns = this.analyzeSuspiciousPatterns(
        recentSessions.filter(s => s.createdAt && new Date(s.createdAt) > oneHourAgo)
      );

      for (const pattern of suspiciousPatterns) {
        await this.handleSuspiciousActivity(pattern);
      }
    } catch (error) {
      console.error('Error detecting suspicious activities:', error);
    }
  }

  private analyzeSuspiciousPatterns(sessions: Session[]): any[] {
    const patterns = [];

    // High-frequency requests from single IP
    const ipCounts: { [ip: string]: number } = {};
    sessions.forEach(session => {
      ipCounts[session.ipAddress] = (ipCounts[session.ipAddress] || 0) + 1;
    });

    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > this.hardeningConfig.networkSecurity.rateLimiting.perIPRateLimit) {
        patterns.push({
          type: 'high_frequency_requests',
          severity: 'medium',
          details: { ip, count },
          description: `High frequency requests detected from IP ${ip}: ${count} requests in 1 hour`
        });
      }
    });

    // Multiple failed login attempts
    const failedLogins = sessions.filter(s => s.status === 'failed' || s.riskLevel === 'high');
    if (failedLogins.length > 10) {
      patterns.push({
        type: 'multiple_failed_logins',
        severity: 'high',
        details: { count: failedLogins.length },
        description: `Multiple failed login attempts detected: ${failedLogins.length} failures`
      });
    }

    // Unusual geographic patterns
    const geographicAnomalies = this.detectGeographicAnomalies(sessions);
    patterns.push(...geographicAnomalies);

    // Bot-like behavior patterns
    const botPatterns = this.detectBotPatterns(sessions);
    patterns.push(...botPatterns);

    return patterns;
  }

  private detectGeographicAnomalies(sessions: Session[]): any[] {
    const patterns = [];
    const countryCounts: { [country: string]: number } = {};

    sessions.forEach(session => {
      if (session.geolocation) {
        const geo = session.geolocation as any;
        const country = geo.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    // Check for blocked countries
    Object.entries(countryCounts).forEach(([country, count]) => {
      if (this.hardeningConfig.networkSecurity.geoBlocking.enabled &&
          this.hardeningConfig.networkSecurity.geoBlocking.blockedCountries.includes(country)) {
        patterns.push({
          type: 'blocked_country_access',
          severity: 'high',
          details: { country, count },
          description: `Access attempts from blocked country: ${country} (${count} attempts)`
        });
      }
    });

    return patterns;
  }

  private detectBotPatterns(sessions: Session[]): any[] {
    const patterns = [];
    const highBotScoreSessions = sessions.filter(s => (s.botScore || 0) > 80);

    if (highBotScoreSessions.length > 5) {
      patterns.push({
        type: 'bot_attack',
        severity: 'medium',
        details: { count: highBotScoreSessions.length },
        description: `Potential bot attack detected: ${highBotScoreSessions.length} high bot score sessions`
      });
    }

    return patterns;
  }

  private async handleSuspiciousActivity(pattern: any): Promise<void> {
    console.log(`Suspicious activity detected: ${pattern.type}`);

    // Create security incident
    const incident = await this.createSecurityIncident({
      type: 'unauthorized_access',
      severity: pattern.severity,
      description: pattern.description,
      indicators_of_compromise: [JSON.stringify(pattern.details)]
    });

    // Take automated response actions
    if (this.hardeningConfig.monitoring.intrusionDetection.autoBlock) {
      await this.executeAutomatedResponse(pattern);
    }

    // Send real-time alerts
    if (this.hardeningConfig.monitoring.realTimeAlerts) {
      await this.sendSecurityAlert(incident);
    }
  }

  private async executeAutomatedResponse(pattern: any): Promise<void> {
    switch (pattern.type) {
      case 'high_frequency_requests':
        await this.blockIP(pattern.details.ip, 'Automated block: High frequency requests');
        break;
      case 'blocked_country_access':
        await this.blockCountry(pattern.details.country);
        break;
      case 'bot_attack':
        await this.enableEnhancedBotProtection();
        break;
    }
  }

  async blockIP(ip: string, reason: string): Promise<void> {
    this.blockedIPs.add(ip);
    console.log(`Blocked IP ${ip}: ${reason}`);
    
    // In production, would integrate with firewall/WAF
    // await firewallService.blockIP(ip);
  }

  async blockCountry(country: string): Promise<void> {
    if (!this.hardeningConfig.networkSecurity.geoBlocking.blockedCountries.includes(country)) {
      this.hardeningConfig.networkSecurity.geoBlocking.blockedCountries.push(country);
      console.log(`Blocked country: ${country}`);
    }
  }

  async enableEnhancedBotProtection(): Promise<void> {
    console.log('Enhanced bot protection enabled');
    // Implementation would enable stricter bot detection
  }

  async createSecurityIncident(incidentData: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: `incident_${Date.now()}`,
      timestamp: new Date(),
      severity: incidentData.severity || 'medium',
      type: incidentData.type || 'unauthorized_access',
      description: incidentData.description || 'Security incident detected',
      affected_systems: incidentData.affected_systems || ['web_application'],
      affected_users: incidentData.affected_users || [],
      source_ip: incidentData.source_ip,
      indicators_of_compromise: incidentData.indicators_of_compromise || [],
      containment_actions: [],
      status: 'detected',
      assigned_to: 'security_team'
    };

    this.activeIncidents.set(incident.id, incident);
    console.log(`Security incident created: ${incident.id}`);
    
    return incident;
  }

  private async sendSecurityAlert(incident: SecurityIncident): Promise<void> {
    // Integration with monitoring service
    await monitoringService.triggerAlert({
      configId: 'security-incident',
      timestamp: incident.timestamp,
      severity: incident.severity as any,
      status: 'new',
      metric: 'security_incident',
      currentValue: 1,
      threshold: 0,
      context: {
        description: `Security Incident: ${incident.description}`,
        affectedEntities: incident.affected_systems,
        recommendations: ['Investigate immediately', 'Review security logs', 'Check for additional indicators']
      },
      escalationLevel: 0,
      id: incident.id
    } as any);
  }

  async performAutomatedSecurityScan(): Promise<SecurityAuditResult> {
    console.log('Performing automated security scan...');

    const vulnerabilities: SecurityVulnerability[] = [];
    let overallScore = 100;

    // Check password policy compliance
    const passwordVulns = await this.checkPasswordPolicy();
    vulnerabilities.push(...passwordVulns);

    // Check network security configuration
    const networkVulns = await this.checkNetworkSecurity();
    vulnerabilities.push(...networkVulns);

    // Check data protection measures
    const dataVulns = await this.checkDataProtection();
    vulnerabilities.push(...dataVulns);

    // Check access controls
    const accessVulns = await this.checkAccessControls();
    vulnerabilities.push(...accessVulns);

    // Calculate overall score
    overallScore -= vulnerabilities.length * 5; // Each vulnerability reduces score by 5
    overallScore = Math.max(0, overallScore);

    const auditResult: SecurityAuditResult = {
      audit_id: `audit_${Date.now()}`,
      timestamp: new Date(),
      audit_type: 'automated',
      overall_score: overallScore,
      vulnerabilities,
      compliance_status: {
        gdpr: this.hardeningConfig.compliance.gdprCompliance && vulnerabilities.filter(v => v.category === 'data_exposure').length === 0,
        hipaa: this.hardeningConfig.compliance.hipaaCompliance,
        sox: this.hardeningConfig.compliance.soxCompliance,
        iso27001: this.hardeningConfig.compliance.iso27001Compliance
      },
      recommendations: this.generateSecurityRecommendations(vulnerabilities)
    };

    console.log(`Security scan completed. Overall score: ${overallScore}/100`);
    return auditResult;
  }

  private async checkPasswordPolicy(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (!this.hardeningConfig.accessControl.enforcePasswordPolicy) {
      vulnerabilities.push({
        id: 'pwd_policy_disabled',
        severity: 'high',
        category: 'authentication',
        title: 'Password Policy Not Enforced',
        description: 'Password policy enforcement is disabled, allowing weak passwords',
        affected_components: ['authentication_system'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Enable password policy enforcement', 'Configure strong password requirements'],
        impact_assessment: {
          confidentiality: 'high',
          integrity: 'medium',
          availability: 'low'
        }
      });
    }

    if (this.hardeningConfig.accessControl.passwordPolicy.minLength < 12) {
      vulnerabilities.push({
        id: 'weak_password_length',
        severity: 'medium',
        category: 'authentication',
        title: 'Weak Password Length Requirement',
        description: 'Minimum password length is less than 12 characters',
        affected_components: ['password_validation'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Increase minimum password length to 12+ characters'],
        impact_assessment: {
          confidentiality: 'medium',
          integrity: 'low',
          availability: 'none'
        }
      });
    }

    return vulnerabilities;
  }

  private async checkNetworkSecurity(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (!this.hardeningConfig.networkSecurity.ddosProtection.enabled) {
      vulnerabilities.push({
        id: 'ddos_protection_disabled',
        severity: 'medium',
        category: 'configuration',
        title: 'DDoS Protection Disabled',
        description: 'DDoS protection is not enabled',
        affected_components: ['network_layer'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Enable DDoS protection', 'Configure appropriate thresholds'],
        impact_assessment: {
          confidentiality: 'none',
          integrity: 'none',
          availability: 'high'
        }
      });
    }

    if (this.hardeningConfig.networkSecurity.rateLimiting.globalRateLimit > 10000) {
      vulnerabilities.push({
        id: 'high_rate_limit',
        severity: 'low',
        category: 'configuration',
        title: 'High Rate Limit Configuration',
        description: 'Global rate limit is set very high, may allow abuse',
        affected_components: ['rate_limiter'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Review and reduce global rate limit'],
        impact_assessment: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'medium'
        }
      });
    }

    return vulnerabilities;
  }

  private async checkDataProtection(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (!this.hardeningConfig.dataProtection.encryptionAtRest) {
      vulnerabilities.push({
        id: 'no_encryption_at_rest',
        severity: 'critical',
        category: 'cryptography',
        title: 'Data Not Encrypted at Rest',
        description: 'Sensitive data is stored without encryption',
        affected_components: ['database', 'file_storage'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Enable database encryption', 'Implement file system encryption'],
        impact_assessment: {
          confidentiality: 'high',
          integrity: 'medium',
          availability: 'none'
        }
      });
    }

    if (!this.hardeningConfig.dataProtection.piiDetection) {
      vulnerabilities.push({
        id: 'no_pii_detection',
        severity: 'medium',
        category: 'data_exposure',
        title: 'PII Detection Disabled',
        description: 'No automatic detection of personally identifiable information',
        affected_components: ['data_processing'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Enable PII detection', 'Implement data classification'],
        impact_assessment: {
          confidentiality: 'medium',
          integrity: 'low',
          availability: 'none'
        }
      });
    }

    return vulnerabilities;
  }

  private async checkAccessControls(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (!this.hardeningConfig.accessControl.mfaRequired) {
      vulnerabilities.push({
        id: 'mfa_not_required',
        severity: 'high',
        category: 'authentication',
        title: 'Multi-Factor Authentication Not Required',
        description: 'MFA is not mandatory for user authentication',
        affected_components: ['authentication_system'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Enable mandatory MFA', 'Configure TOTP or SMS-based MFA'],
        impact_assessment: {
          confidentiality: 'high',
          integrity: 'medium',
          availability: 'low'
        }
      });
    }

    if (this.hardeningConfig.accessControl.sessionTimeout > 60) {
      vulnerabilities.push({
        id: 'long_session_timeout',
        severity: 'low',
        category: 'authorization',
        title: 'Long Session Timeout',
        description: 'Session timeout is longer than recommended (>60 minutes)',
        affected_components: ['session_management'],
        discovery_date: new Date(),
        status: 'open',
        remediation_steps: ['Reduce session timeout to 30-60 minutes'],
        impact_assessment: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'none'
        }
      });
    }

    return vulnerabilities;
  }

  private generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[]): any {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];

    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium');

    // Immediate actions for critical and high severity
    criticalVulns.forEach(vuln => {
      immediate.push(`CRITICAL: ${vuln.title} - ${vuln.remediation_steps[0]}`);
    });

    highVulns.forEach(vuln => {
      immediate.push(`HIGH: ${vuln.title} - ${vuln.remediation_steps[0]}`);
    });

    // Short-term actions for medium severity
    mediumVulns.forEach(vuln => {
      shortTerm.push(`${vuln.title} - ${vuln.remediation_steps[0]}`);
    });

    // Long-term recommendations
    longTerm.push('Implement regular security audits');
    longTerm.push('Conduct penetration testing quarterly');
    longTerm.push('Review and update security policies');
    longTerm.push('Provide security awareness training');

    return { immediate, short_term: shortTerm, long_term: longTerm };
  }

  private cleanupSecurityData(): void {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

    // Clean up old incidents
    for (const [incidentId, incident] of this.activeIncidents.entries()) {
      if (incident.timestamp < cutoff && incident.status === 'resolved') {
        this.activeIncidents.delete(incidentId);
      }
    }

    // Clean up old suspicious activity records
    this.suspiciousActivities.clear();

    console.log('Security data cleanup completed');
  }

  // Public API methods
  getSecurityConfiguration(): SecurityHardeningConfiguration {
    return this.hardeningConfig;
  }

  async updateSecurityConfiguration(updates: Partial<SecurityHardeningConfiguration>): Promise<void> {
    this.hardeningConfig = { ...this.hardeningConfig, ...updates };
    console.log('Security configuration updated');
  }

  async getActiveIncidents(): Promise<SecurityIncident[]> {
    return Array.from(this.activeIncidents.values());
  }

  async resolveIncident(incidentId: string, resolution: string): Promise<boolean> {
    const incident = this.activeIncidents.get(incidentId);
    if (incident) {
      incident.status = 'resolved';
      incident.resolution_time = new Date();
      console.log(`Incident ${incidentId} resolved: ${resolution}`);
      return true;
    }
    return false;
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  async unblockIP(ip: string): Promise<void> {
    this.blockedIPs.delete(ip);
    console.log(`IP ${ip} unblocked`);
  }

  async getSecurityMetrics(): Promise<any> {
    return {
      blockedIPs: this.blockedIPs.size,
      activeIncidents: this.activeIncidents.size,
      lastScanTime: new Date(),
      complianceStatus: this.hardeningConfig.compliance
    };
  }
}

export const securityService = new SecurityService();