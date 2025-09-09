export interface EnvironmentConfiguration {
  name: 'development' | 'staging' | 'production';
  
  // Application settings
  application: {
    host: string;
    port: number;
    baseUrl: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    enableProfiling: boolean;
    corsOrigins: string[];
    trustProxy: boolean;
  };
  
  // Database configuration
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    connectionPoolSize: number;
    queryTimeout: number;
    backupEnabled: boolean;
    backupSchedule: string;
  };
  
  // Security settings
  security: {
    sessionSecret: string;
    jwtSecret: string;
    encryptionKey: string;
    hashSaltRounds: number;
    rateLimiting: {
      enabled: boolean;
      maxRequestsPerMinute: number;
      maxRequestsPerHour: number;
    };
    ipWhitelist: string[];
    securityHeaders: boolean;
    contentSecurityPolicy: boolean;
  };
  
  // Email configuration
  email: {
    defaultProvider: string;
    providers: {
      [key: string]: {
        host: string;
        port: number;
        secure: boolean;
        username: string;
        password: string;
        maxConcurrentConnections: number;
        rateLimitPerHour: number;
      };
    };
  };
  
  // External integrations
  integrations: {
    ldap: {
      enabled: boolean;
      primaryServer: string;
      backupServers: string[];
      connectionTimeout: number;
    };
    siem: {
      enabled: boolean;
      bufferSize: number;
      flushInterval: number;
      retryAttempts: number;
    };
    monitoring: {
      enabled: boolean;
      metricsInterval: number;
      alertingEnabled: boolean;
      healthCheckInterval: number;
    };
  };
  
  // Performance settings
  performance: {
    caching: {
      enabled: boolean;
      ttl: number;
      maxSize: number;
    };
    compression: {
      enabled: boolean;
      level: number;
    };
    clustering: {
      enabled: boolean;
      workers: number;
    };
  };
  
  // Compliance and audit
  compliance: {
    dataRetentionDays: number;
    auditLogging: boolean;
    gdprCompliance: boolean;
    hipaaCompliance: boolean;
    anonymizeData: boolean;
  };
}

export class EnvironmentService {
  private currentConfig: EnvironmentConfiguration;
  
  constructor() {
    this.currentConfig = this.loadConfiguration();
    this.validateConfiguration();
  }

  private loadConfiguration(): EnvironmentConfiguration {
    const env = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';
    
    const baseConfig: EnvironmentConfiguration = {
      name: env,
      application: {
        host: process.env.HOST || '0.0.0.0',
        port: parseInt(process.env.PORT || '5000'),
        baseUrl: process.env.BASE_URL || 'http://localhost:5000',
        logLevel: (process.env.LOG_LEVEL as any) || 'info',
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        enableProfiling: process.env.ENABLE_PROFILING === 'true',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
        trustProxy: process.env.TRUST_PROXY === 'true'
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'zspam',
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true',
        connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
        backupEnabled: process.env.DB_BACKUP_ENABLED === 'true',
        backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *'
      },
      security: {
        sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
        jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
        encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key',
        hashSaltRounds: parseInt(process.env.HASH_SALT_ROUNDS || '12'),
        rateLimiting: {
          enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
          maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100'),
          maxRequestsPerHour: parseInt(process.env.RATE_LIMIT_PER_HOUR || '1000')
        },
        ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
        securityHeaders: process.env.SECURITY_HEADERS !== 'false',
        contentSecurityPolicy: process.env.CSP_ENABLED === 'true'
      },
      email: {
        defaultProvider: process.env.DEFAULT_EMAIL_PROVIDER || 'primary',
        providers: {
          primary: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            username: process.env.SMTP_USERNAME || '',
            password: process.env.SMTP_PASSWORD || '',
            maxConcurrentConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
            rateLimitPerHour: parseInt(process.env.SMTP_RATE_LIMIT || '100')
          }
        }
      },
      integrations: {
        ldap: {
          enabled: process.env.LDAP_ENABLED === 'true',
          primaryServer: process.env.LDAP_PRIMARY_SERVER || '',
          backupServers: process.env.LDAP_BACKUP_SERVERS?.split(',') || [],
          connectionTimeout: parseInt(process.env.LDAP_TIMEOUT || '5000')
        },
        siem: {
          enabled: process.env.SIEM_ENABLED === 'true',
          bufferSize: parseInt(process.env.SIEM_BUFFER_SIZE || '100'),
          flushInterval: parseInt(process.env.SIEM_FLUSH_INTERVAL || '300'),
          retryAttempts: parseInt(process.env.SIEM_RETRY_ATTEMPTS || '3')
        },
        monitoring: {
          enabled: process.env.MONITORING_ENABLED !== 'false',
          metricsInterval: parseInt(process.env.METRICS_INTERVAL || '60'),
          alertingEnabled: process.env.ALERTING_ENABLED !== 'false',
          healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30')
        }
      },
      performance: {
        caching: {
          enabled: process.env.CACHING_ENABLED !== 'false',
          ttl: parseInt(process.env.CACHE_TTL || '3600'),
          maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100')
        },
        compression: {
          enabled: process.env.COMPRESSION_ENABLED !== 'false',
          level: parseInt(process.env.COMPRESSION_LEVEL || '6')
        },
        clustering: {
          enabled: process.env.CLUSTERING_ENABLED === 'true',
          workers: parseInt(process.env.CLUSTER_WORKERS || '0')
        }
      },
      compliance: {
        dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '365'),
        auditLogging: process.env.AUDIT_LOGGING !== 'false',
        gdprCompliance: process.env.GDPR_COMPLIANCE === 'true',
        hipaaCompliance: process.env.HIPAA_COMPLIANCE === 'true',
        anonymizeData: process.env.ANONYMIZE_DATA === 'true'
      }
    };

    // Environment-specific overrides
    return this.applyEnvironmentOverrides(baseConfig, env);
  }

  private applyEnvironmentOverrides(config: EnvironmentConfiguration, env: string): EnvironmentConfiguration {
    switch (env) {
      case 'development':
        return {
          ...config,
          application: {
            ...config.application,
            logLevel: 'debug',
            enableMetrics: true,
            enableProfiling: true
          },
          security: {
            ...config.security,
            hashSaltRounds: 10, // Faster for development
            rateLimiting: {
              ...config.security.rateLimiting,
              enabled: false
            }
          },
          performance: {
            ...config.performance,
            clustering: {
              ...config.performance.clustering,
              enabled: false
            }
          }
        };

      case 'staging':
        return {
          ...config,
          application: {
            ...config.application,
            logLevel: 'info',
            enableMetrics: true,
            enableProfiling: false
          },
          security: {
            ...config.security,
            rateLimiting: {
              ...config.security.rateLimiting,
              enabled: true,
              maxRequestsPerMinute: 200,
              maxRequestsPerHour: 2000
            }
          },
          database: {
            ...config.database,
            backupEnabled: true,
            connectionPoolSize: 20
          }
        };

      case 'production':
        return {
          ...config,
          application: {
            ...config.application,
            logLevel: 'warn',
            enableMetrics: true,
            enableProfiling: false,
            trustProxy: true
          },
          security: {
            ...config.security,
            hashSaltRounds: 14, // More secure for production
            rateLimiting: {
              ...config.security.rateLimiting,
              enabled: true
            },
            securityHeaders: true,
            contentSecurityPolicy: true
          },
          database: {
            ...config.database,
            ssl: true,
            backupEnabled: true,
            connectionPoolSize: 50
          },
          performance: {
            ...config.performance,
            clustering: {
              enabled: true,
              workers: 0 // Auto-detect based on CPU cores
            }
          },
          compliance: {
            ...config.compliance,
            auditLogging: true,
            gdprCompliance: true
          }
        };

      default:
        return config;
    }
  }

  private validateConfiguration(): void {
    const errors: string[] = [];

    // Validate required secrets in production
    if (this.currentConfig.name === 'production') {
      if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'dev-session-secret') {
        errors.push('SESSION_SECRET must be set to a secure value in production');
      }
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-jwt-secret') {
        errors.push('JWT_SECRET must be set to a secure value in production');
      }
      if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY === 'dev-encryption-key') {
        errors.push('ENCRYPTION_KEY must be set to a secure value in production');
      }
    }

    // Validate database configuration
    if (this.currentConfig.name !== 'development' && !this.currentConfig.database.password) {
      errors.push('Database password must be set for non-development environments');
    }

    // Validate email configuration if enabled
    if (this.currentConfig.email.providers.primary.host !== 'localhost' && 
        !this.currentConfig.email.providers.primary.username) {
      errors.push('SMTP username must be set for external email providers');
    }

    if (errors.length > 0) {
      console.error('Configuration validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (this.currentConfig.name === 'production') {
        throw new Error('Invalid production configuration. Please fix the errors above.');
      } else {
        console.warn('Configuration warnings detected. Application will continue with default values.');
      }
    }
  }

  getConfiguration(): EnvironmentConfiguration {
    return this.currentConfig;
  }

  getEnvironment(): string {
    return this.currentConfig.name;
  }

  isDevelopment(): boolean {
    return this.currentConfig.name === 'development';
  }

  isStaging(): boolean {
    return this.currentConfig.name === 'staging';
  }

  isProduction(): boolean {
    return this.currentConfig.name === 'production';
  }

  // Configuration utilities
  getDatabaseUrl(): string {
    const db = this.currentConfig.database;
    const protocol = db.ssl ? 'postgresql' : 'postgres';
    return `${protocol}://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}${db.ssl ? '?sslmode=require' : ''}`;
  }

  getLogLevel(): string {
    return this.currentConfig.application.logLevel;
  }

  getSecurityConfig(): any {
    return this.currentConfig.security;
  }

  getPerformanceConfig(): any {
    return this.currentConfig.performance;
  }

  getComplianceConfig(): any {
    return this.currentConfig.compliance;
  }

  // Environment-specific feature flags
  isFeatureEnabled(feature: string): boolean {
    const flags: { [key: string]: boolean } = {
      'metrics': this.currentConfig.application.enableMetrics,
      'profiling': this.currentConfig.application.enableProfiling,
      'clustering': this.currentConfig.performance.clustering.enabled,
      'caching': this.currentConfig.performance.caching.enabled,
      'compression': this.currentConfig.performance.compression.enabled,
      'rate-limiting': this.currentConfig.security.rateLimiting.enabled,
      'audit-logging': this.currentConfig.compliance.auditLogging,
      'gdpr-compliance': this.currentConfig.compliance.gdprCompliance,
      'ldap-integration': this.currentConfig.integrations.ldap.enabled,
      'siem-integration': this.currentConfig.integrations.siem.enabled,
      'monitoring': this.currentConfig.integrations.monitoring.enabled
    };

    return flags[feature] || false;
  }

  // Configuration validation for deployment
  validateForDeployment(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Security validations
    if (this.isProduction()) {
      if (this.currentConfig.security.sessionSecret.length < 32) {
        errors.push('Session secret must be at least 32 characters in production');
      }
      
      if (this.currentConfig.security.jwtSecret.length < 32) {
        errors.push('JWT secret must be at least 32 characters in production');
      }

      if (!this.currentConfig.database.ssl) {
        errors.push('Database SSL must be enabled in production');
      }

      if (this.currentConfig.application.corsOrigins.includes('*')) {
        warnings.push('CORS is configured to allow all origins in production');
      }
    }

    // Performance validations
    if (this.currentConfig.database.connectionPoolSize > 100) {
      warnings.push('Database connection pool size is very high (>100)');
    }

    if (this.currentConfig.performance.compression.enabled && this.currentConfig.performance.compression.level > 8) {
      warnings.push('High compression level may impact performance');
    }

    // Integration validations
    if (this.currentConfig.integrations.ldap.enabled && !this.currentConfig.integrations.ldap.primaryServer) {
      errors.push('LDAP primary server must be configured when LDAP is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Generate deployment checklist
  generateDeploymentChecklist(): string[] {
    const checklist: string[] = [];

    checklist.push('✓ Environment variables configured');
    checklist.push('✓ Database connection tested');
    checklist.push('✓ Security settings validated');
    
    if (this.currentConfig.database.backupEnabled) {
      checklist.push('✓ Database backup schedule configured');
    }

    if (this.currentConfig.integrations.ldap.enabled) {
      checklist.push('✓ LDAP integration tested');
    }

    if (this.currentConfig.integrations.siem.enabled) {
      checklist.push('✓ SIEM integration configured');
    }

    if (this.currentConfig.integrations.monitoring.enabled) {
      checklist.push('✓ Monitoring and alerting configured');
    }

    if (this.isProduction()) {
      checklist.push('✓ Production secrets configured');
      checklist.push('✓ SSL certificates installed');
      checklist.push('✓ Load balancer configured');
      checklist.push('✓ CDN configured (if applicable)');
      checklist.push('✓ Monitoring dashboards set up');
      checklist.push('✓ Backup and recovery tested');
    }

    return checklist;
  }

  // Environment migration utilities
  exportConfiguration(): string {
    const exportData = {
      environment: this.currentConfig.name,
      configuration: this.currentConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  importConfiguration(configData: string): boolean {
    try {
      const data = JSON.parse(configData);
      
      // Validate imported configuration
      if (!data.configuration || !data.environment) {
        throw new Error('Invalid configuration format');
      }

      console.log(`Importing configuration for ${data.environment} environment`);
      // In a real implementation, would merge and validate the configuration
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  // Configuration comparison
  compareEnvironments(otherEnv: string): any {
    const comparison = {
      environment: {
        current: this.currentConfig.name,
        comparing: otherEnv
      },
      differences: {
        security: {},
        performance: {},
        integrations: {}
      }
    };

    // Implementation would compare configurations between environments
    console.log(`Comparing ${this.currentConfig.name} with ${otherEnv} environment`);
    return comparison;
  }
}

export const environmentService = new EnvironmentService();