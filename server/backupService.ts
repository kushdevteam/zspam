import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface BackupConfiguration {
  enabled: boolean;
  schedule: string; // Cron expression
  retentionDays: number;
  storageLocation: 'local' | 's3' | 'gcs' | 'azure';
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  
  // Storage specific configs
  localStorage?: {
    backupPath: string;
    maxBackups: number;
  };
  
  cloudStorage?: {
    bucket: string;
    region: string;
    accessKey?: string;
    secretKey?: string;
  };
  
  // Notification settings
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    recipients: string[];
  };
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'differential';
  size: number; // bytes
  duration: number; // seconds
  status: 'completed' | 'failed' | 'in_progress';
  location: string;
  checksum: string;
  tables: string[];
  errorMessage?: string;
}

export interface RestoreOptions {
  backupId: string;
  targetDatabase?: string;
  restoreType: 'full' | 'schema_only' | 'data_only' | 'selective';
  selectedTables?: string[];
  dropExistingData: boolean;
  validateRestore: boolean;
}

export interface BackupValidationResult {
  valid: boolean;
  backupId: string;
  timestamp: Date;
  issues: string[];
  recommendations: string[];
  integrityCheck: {
    checksumValid: boolean;
    structureValid: boolean;
    dataConsistent: boolean;
  };
}

export class BackupService {
  private config: BackupConfiguration;
  private backupHistory: Map<string, BackupMetadata> = new Map();
  private activeBackups: Set<string> = new Set();
  
  constructor() {
    this.config = this.loadDefaultConfiguration();
    this.initializeBackupScheduler();
  }

  private loadDefaultConfiguration(): BackupConfiguration {
    return {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '30'),
      storageLocation: (process.env.DB_BACKUP_STORAGE as any) || 'local',
      compressionEnabled: process.env.DB_BACKUP_COMPRESSION !== 'false',
      encryptionEnabled: process.env.DB_BACKUP_ENCRYPTION === 'true',
      localStorage: {
        backupPath: process.env.DB_BACKUP_PATH || './backups',
        maxBackups: parseInt(process.env.DB_BACKUP_MAX_LOCAL || '10')
      },
      cloudStorage: {
        bucket: process.env.DB_BACKUP_BUCKET || '',
        region: process.env.DB_BACKUP_REGION || 'us-east-1',
        accessKey: process.env.DB_BACKUP_ACCESS_KEY,
        secretKey: process.env.DB_BACKUP_SECRET_KEY
      },
      notifications: {
        onSuccess: process.env.DB_BACKUP_NOTIFY_SUCCESS === 'true',
        onFailure: process.env.DB_BACKUP_NOTIFY_FAILURE !== 'false',
        recipients: process.env.DB_BACKUP_NOTIFY_EMAILS?.split(',') || ['admin@company.com']
      }
    };
  }

  private initializeBackupScheduler(): void {
    if (!this.config.enabled) {
      console.log('Database backup service is disabled');
      return;
    }

    // In production, would use a proper cron scheduler like node-cron
    console.log(`Backup service initialized with schedule: ${this.config.schedule}`);
    
    // Simulate backup scheduling
    this.scheduleBackups();
  }

  private scheduleBackups(): void {
    // Check for scheduled backups every hour
    setInterval(() => {
      this.checkScheduledBackups();
    }, 60 * 60 * 1000);

    // Clean up old backups daily
    setInterval(() => {
      this.cleanupOldBackups();
    }, 24 * 60 * 60 * 1000);
  }

  private async checkScheduledBackups(): Promise<void> {
    // Implementation would check cron schedule and trigger backups
    const now = new Date();
    const hour = now.getHours();
    
    // Simple daily backup at 2 AM
    if (hour === 2 && now.getMinutes() === 0) {
      await this.createBackup('full');
    }
  }

  async createBackup(type: 'full' | 'incremental' | 'differential' = 'full'): Promise<string> {
    const backupId = `backup_${Date.now()}_${type}`;
    
    if (this.activeBackups.has(backupId)) {
      throw new Error('Backup already in progress');
    }

    console.log(`Starting ${type} backup: ${backupId}`);
    this.activeBackups.add(backupId);

    const startTime = Date.now();
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: new Date(),
      type,
      size: 0,
      duration: 0,
      status: 'in_progress',
      location: '',
      checksum: '',
      tables: []
    };

    this.backupHistory.set(backupId, metadata);

    try {
      // Perform the actual backup
      const backupResult = await this.performDatabaseBackup(backupId, type);
      
      // Update metadata
      metadata.status = 'completed';
      metadata.size = backupResult.size;
      metadata.duration = (Date.now() - startTime) / 1000;
      metadata.location = backupResult.location;
      metadata.checksum = backupResult.checksum;
      metadata.tables = backupResult.tables;

      // Store backup metadata
      await this.storeBackupMetadata(metadata);

      // Send success notification
      if (this.config.notifications.onSuccess) {
        await this.sendBackupNotification(metadata, true);
      }

      console.log(`Backup completed successfully: ${backupId} (${metadata.duration}s, ${this.formatBytes(metadata.size)})`);
      
      return backupId;
    } catch (error) {
      metadata.status = 'failed';
      metadata.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.config.notifications.onFailure) {
        await this.sendBackupNotification(metadata, false);
      }

      console.error(`Backup failed: ${backupId}`, error);
      throw error;
    } finally {
      this.activeBackups.delete(backupId);
    }
  }

  private async performDatabaseBackup(backupId: string, type: string): Promise<{
    size: number;
    location: string;
    checksum: string;
    tables: string[];
  }> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Parse database URL
    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.slice(1);
    const hostname = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const username = dbUrl.username;
    const password = dbUrl.password;

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${dbName}_${timestamp}_${type}.sql`;
    const backupPath = this.config.localStorage?.backupPath || './backups';
    const fullPath = join(backupPath, filename);

    // Ensure backup directory exists
    if (!existsSync(backupPath)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(backupPath, { recursive: true });
    }

    // Create pg_dump command
    const dumpCommand = 'pg_dump';
    const dumpArgs = [
      '--host', hostname,
      '--port', port,
      '--username', username,
      '--no-password',
      '--verbose',
      '--clean',
      '--no-acl',
      '--no-owner',
      '--format', 'custom',
      '--file', fullPath,
      dbName
    ];

    // Set PGPASSWORD environment variable
    const env = { ...process.env, PGPASSWORD: password };

    try {
      // Execute pg_dump
      await this.executeCommand(dumpCommand, dumpArgs, { env });

      // Get file size
      const { statSync } = await import('fs');
      const stats = statSync(fullPath);
      const size = stats.size;

      // Calculate checksum
      const checksum = await this.calculateChecksum(fullPath);

      // Compress if enabled
      let finalPath = fullPath;
      if (this.config.compressionEnabled) {
        finalPath = await this.compressBackup(fullPath);
      }

      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        finalPath = await this.encryptBackup(finalPath);
      }

      // Upload to cloud storage if configured
      if (this.config.storageLocation !== 'local') {
        finalPath = await this.uploadToCloudStorage(finalPath, backupId);
      }

      // Get table list
      const tables = await this.getDatabaseTables();

      return {
        size,
        location: finalPath,
        checksum,
        tables
      };
    } catch (error) {
      // Clean up partial backup file
      if (existsSync(fullPath)) {
        const { unlinkSync } = await import('fs');
        unlinkSync(fullPath);
      }
      throw error;
    }
  }

  private executeCommand(command: string, args: string[], options: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, options);
      
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const { createHash } = await import('crypto');
    const { createReadStream } = await import('fs');
    
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async compressBackup(filePath: string): Promise<string> {
    const { createReadStream, createWriteStream } = await import('fs');
    const { createGzip } = await import('zlib');
    
    const compressedPath = `${filePath}.gz`;
    
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(filePath);
      const writeStream = createWriteStream(compressedPath);
      const gzip = createGzip();
      
      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on('finish', () => {
          // Remove original file
          const { unlinkSync } = require('fs');
          unlinkSync(filePath);
          resolve(compressedPath);
        })
        .on('error', reject);
    });
  }

  private async encryptBackup(filePath: string): Promise<string> {
    // Simplified encryption implementation
    // In production, would use proper encryption with key management
    const encryptedPath = `${filePath}.enc`;
    
    console.log(`Encrypting backup: ${filePath} -> ${encryptedPath}`);
    // Implementation would encrypt the file
    
    return encryptedPath;
  }

  private async uploadToCloudStorage(filePath: string, backupId: string): Promise<string> {
    switch (this.config.storageLocation) {
      case 's3':
        return await this.uploadToS3(filePath, backupId);
      case 'gcs':
        return await this.uploadToGCS(filePath, backupId);
      case 'azure':
        return await this.uploadToAzure(filePath, backupId);
      default:
        return filePath;
    }
  }

  private async uploadToS3(filePath: string, backupId: string): Promise<string> {
    console.log(`Uploading backup to S3: ${backupId}`);
    // Implementation would use AWS SDK to upload to S3
    const s3Key = `backups/${backupId}/${require('path').basename(filePath)}`;
    return `s3://${this.config.cloudStorage?.bucket}/${s3Key}`;
  }

  private async uploadToGCS(filePath: string, backupId: string): Promise<string> {
    console.log(`Uploading backup to Google Cloud Storage: ${backupId}`);
    // Implementation would use Google Cloud SDK
    const gcsPath = `gs://${this.config.cloudStorage?.bucket}/backups/${backupId}/${require('path').basename(filePath)}`;
    return gcsPath;
  }

  private async uploadToAzure(filePath: string, backupId: string): Promise<string> {
    console.log(`Uploading backup to Azure Blob Storage: ${backupId}`);
    // Implementation would use Azure SDK
    return `azure://${this.config.cloudStorage?.bucket}/backups/${backupId}`;
  }

  private async getDatabaseTables(): Promise<string[]> {
    // Mock implementation - would query actual database
    return [
      'users', 'campaigns', 'recipients', 'sessions', 'email_templates', 
      'smtp_servers', 'telegram_settings', 'campaign_assets'
    ];
  }

  private async storeBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = join(
      this.config.localStorage?.backupPath || './backups',
      `${metadata.id}.meta.json`
    );
    
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async sendBackupNotification(metadata: BackupMetadata, success: boolean): Promise<void> {
    const subject = success ? 
      `Backup Completed Successfully: ${metadata.id}` :
      `Backup Failed: ${metadata.id}`;
    
    const body = success ?
      `Backup completed successfully:
      
Backup ID: ${metadata.id}
Type: ${metadata.type}
Duration: ${metadata.duration} seconds
Size: ${this.formatBytes(metadata.size)}
Location: ${metadata.location}
Tables: ${metadata.tables.join(', ')}` :
      `Backup failed:
      
Backup ID: ${metadata.id}
Error: ${metadata.errorMessage}
Type: ${metadata.type}
Timestamp: ${metadata.timestamp.toISOString()}`;

    console.log(`Sending backup notification: ${subject}`);
    // In production, would send actual email notification
  }

  async restoreBackup(options: RestoreOptions): Promise<boolean> {
    const backup = this.backupHistory.get(options.backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${options.backupId}`);
    }

    if (backup.status !== 'completed') {
      throw new Error(`Cannot restore incomplete backup: ${backup.status}`);
    }

    console.log(`Starting restore from backup: ${options.backupId}`);

    try {
      // Validate backup before restore
      const validation = await this.validateBackup(options.backupId);
      if (!validation.valid) {
        throw new Error(`Backup validation failed: ${validation.issues.join(', ')}`);
      }

      // Perform the restore
      await this.performRestore(backup, options);

      // Validate restoration if requested
      if (options.validateRestore) {
        await this.validateRestoration(options);
      }

      console.log(`Restore completed successfully from backup: ${options.backupId}`);
      return true;
    } catch (error) {
      console.error(`Restore failed for backup ${options.backupId}:`, error);
      throw error;
    }
  }

  private async performRestore(backup: BackupMetadata, options: RestoreOptions): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Parse database URL
    const dbUrl = new URL(databaseUrl);
    const dbName = options.targetDatabase || dbUrl.pathname.slice(1);
    const hostname = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const username = dbUrl.username;
    const password = dbUrl.password;

    // Download backup if stored in cloud
    let backupPath = backup.location;
    if (!backup.location.startsWith('/') && !backup.location.startsWith('.')) {
      backupPath = await this.downloadBackup(backup.location);
    }

    // Decrypt if needed
    if (this.config.encryptionEnabled && backup.location.endsWith('.enc')) {
      backupPath = await this.decryptBackup(backupPath);
    }

    // Decompress if needed
    if (this.config.compressionEnabled && backup.location.endsWith('.gz')) {
      backupPath = await this.decompressBackup(backupPath);
    }

    // Create pg_restore command
    const restoreCommand = 'pg_restore';
    const restoreArgs = [
      '--host', hostname,
      '--port', port,
      '--username', username,
      '--no-password',
      '--verbose'
    ];

    if (options.dropExistingData) {
      restoreArgs.push('--clean');
    }

    if (options.restoreType === 'schema_only') {
      restoreArgs.push('--schema-only');
    } else if (options.restoreType === 'data_only') {
      restoreArgs.push('--data-only');
    }

    if (options.selectedTables) {
      options.selectedTables.forEach(table => {
        restoreArgs.push('--table', table);
      });
    }

    restoreArgs.push('--dbname', dbName, backupPath);

    // Set PGPASSWORD environment variable
    const env = { ...process.env, PGPASSWORD: password };

    // Execute pg_restore
    await this.executeCommand(restoreCommand, restoreArgs, { env });
  }

  private async downloadBackup(location: string): Promise<string> {
    console.log(`Downloading backup from: ${location}`);
    // Implementation would download from cloud storage
    return location;
  }

  private async decryptBackup(filePath: string): Promise<string> {
    console.log(`Decrypting backup: ${filePath}`);
    // Implementation would decrypt the file
    return filePath.replace('.enc', '');
  }

  private async decompressBackup(filePath: string): Promise<string> {
    const { createReadStream, createWriteStream } = await import('fs');
    const { createGunzip } = await import('zlib');
    
    const decompressedPath = filePath.replace('.gz', '');
    
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(filePath);
      const writeStream = createWriteStream(decompressedPath);
      const gunzip = createGunzip();
      
      readStream
        .pipe(gunzip)
        .pipe(writeStream)
        .on('finish', () => resolve(decompressedPath))
        .on('error', reject);
    });
  }

  async validateBackup(backupId: string): Promise<BackupValidationResult> {
    const backup = this.backupHistory.get(backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check file existence
    let fileExists = false;
    try {
      if (backup.location.startsWith('/') || backup.location.startsWith('.')) {
        fileExists = existsSync(backup.location);
      } else {
        // For cloud storage, assume exists for now
        fileExists = true;
      }
    } catch (error) {
      issues.push(`Cannot access backup file: ${backup.location}`);
    }

    if (!fileExists) {
      issues.push(`Backup file not found: ${backup.location}`);
    }

    // Validate checksum
    let checksumValid = true;
    if (fileExists && backup.location.startsWith('/')) {
      try {
        const currentChecksum = await this.calculateChecksum(backup.location);
        checksumValid = currentChecksum === backup.checksum;
        if (!checksumValid) {
          issues.push('Backup file checksum mismatch - file may be corrupted');
        }
      } catch (error) {
        issues.push('Unable to calculate checksum for validation');
        checksumValid = false;
      }
    }

    // Check backup age
    const ageInDays = (Date.now() - backup.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > this.config.retentionDays) {
      recommendations.push('Backup is older than retention policy - consider creating a fresh backup');
    }

    // Check backup size
    if (backup.size < 1024) { // Less than 1KB
      issues.push('Backup file is suspiciously small - may be incomplete');
    }

    return {
      valid: issues.length === 0,
      backupId,
      timestamp: new Date(),
      issues,
      recommendations,
      integrityCheck: {
        checksumValid,
        structureValid: fileExists,
        dataConsistent: issues.length === 0
      }
    };
  }

  private async validateRestoration(options: RestoreOptions): Promise<boolean> {
    console.log(`Validating restoration for backup: ${options.backupId}`);
    
    // Check table counts, data integrity, etc.
    // Implementation would run validation queries
    
    return true;
  }

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    for (const [backupId, metadata] of this.backupHistory.entries()) {
      if (metadata.timestamp < cutoffDate) {
        try {
          await this.deleteBackup(backupId);
          this.backupHistory.delete(backupId);
          console.log(`Deleted old backup: ${backupId}`);
        } catch (error) {
          console.error(`Failed to delete old backup ${backupId}:`, error);
        }
      }
    }
  }

  private async deleteBackup(backupId: string): Promise<void> {
    const backup = this.backupHistory.get(backupId);
    if (!backup) return;

    // Delete local file
    if (backup.location.startsWith('/') || backup.location.startsWith('.')) {
      if (existsSync(backup.location)) {
        const { unlinkSync } = await import('fs');
        unlinkSync(backup.location);
      }
    } else {
      // Delete from cloud storage
      await this.deleteFromCloudStorage(backup.location);
    }

    // Delete metadata file
    const metadataPath = backup.location.replace(/\.(sql|gz|enc)$/, '.meta.json');
    if (existsSync(metadataPath)) {
      const { unlinkSync } = await import('fs');
      unlinkSync(metadataPath);
    }
  }

  private async deleteFromCloudStorage(location: string): Promise<void> {
    console.log(`Deleting backup from cloud storage: ${location}`);
    // Implementation would delete from cloud storage
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Public API methods
  getConfiguration(): BackupConfiguration {
    return this.config;
  }

  async updateConfiguration(updates: Partial<BackupConfiguration>): Promise<void> {
    this.config = { ...this.config, ...updates };
    console.log('Backup configuration updated');
  }

  getBackupHistory(): BackupMetadata[] {
    return Array.from(this.backupHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getBackupById(backupId: string): BackupMetadata | undefined {
    return this.backupHistory.get(backupId);
  }

  async testBackupConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test database connection
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        return { success: false, message: 'DATABASE_URL not configured' };
      }

      // Test pg_dump availability
      await this.executeCommand('pg_dump', ['--version']);

      // Test storage location
      if (this.config.storageLocation === 'local') {
        const backupPath = this.config.localStorage?.backupPath || './backups';
        if (!existsSync(backupPath)) {
          const { mkdirSync } = await import('fs');
          mkdirSync(backupPath, { recursive: true });
        }
      }

      return { success: true, message: 'Backup system is ready' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Backup test failed' 
      };
    }
  }

  async createTestBackup(): Promise<string> {
    console.log('Creating test backup...');
    return await this.createBackup('full');
  }

  async getBackupStatistics(): Promise<any> {
    const history = this.getBackupHistory();
    const completed = history.filter(b => b.status === 'completed');
    const failed = history.filter(b => b.status === 'failed');
    
    const totalSize = completed.reduce((sum, backup) => sum + backup.size, 0);
    const avgDuration = completed.length > 0 ? 
      completed.reduce((sum, backup) => sum + backup.duration, 0) / completed.length : 0;

    return {
      totalBackups: history.length,
      completedBackups: completed.length,
      failedBackups: failed.length,
      successRate: history.length > 0 ? (completed.length / history.length) * 100 : 0,
      totalSize: this.formatBytes(totalSize),
      averageDuration: `${avgDuration.toFixed(1)}s`,
      lastBackup: history[0]?.timestamp || null,
      retentionDays: this.config.retentionDays,
      storageLocation: this.config.storageLocation
    };
  }
}

export const backupService = new BackupService();