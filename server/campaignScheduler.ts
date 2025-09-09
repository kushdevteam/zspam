import { Campaign, Recipient } from '@shared/schema';
import { storage } from './storage';
import { campaignExecutor } from './campaignExecutor';
import { analyticsService } from './analyticsService';
import { webhookService } from './webhookService';

export interface ScheduleConfiguration {
  scheduleId: string;
  campaignId: string;
  scheduleType: 'immediate' | 'delayed' | 'recurring' | 'conditional' | 'optimal';
  
  // Basic scheduling
  startTime?: Date;
  endTime?: Date;
  timezone: string;
  
  // Recurring schedule
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    interval: number; // Every N days/weeks/months
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // For monthly schedules
    endDate?: Date;
    maxOccurrences?: number;
  };
  
  // Conditional scheduling
  conditions?: {
    triggerType: 'time_based' | 'event_based' | 'metric_based';
    threshold?: number;
    metric?: 'open_rate' | 'click_rate' | 'submission_rate';
    comparison?: 'greater_than' | 'less_than' | 'equals';
    dependsOnCampaign?: string;
  };
  
  // Optimal timing
  optimization?: {
    enabled: boolean;
    optimizeFor: 'opens' | 'clicks' | 'submissions';
    useHistoricalData: boolean;
    respectRecipientTimezones: boolean;
    avoidHolidays: boolean;
    businessHoursOnly: boolean;
  };
  
  // Batch configuration
  batchSettings: {
    batchSize: number;
    delayBetweenBatches: number; // minutes
    maxConcurrentBatches: number;
    retryFailedEmails: boolean;
    retryAttempts: number;
    retryDelay: number; // minutes
  };
  
  // Follow-up automation
  followUpSequence?: {
    enabled: boolean;
    sequences: FollowUpStep[];
  };
}

export interface FollowUpStep {
  stepId: string;
  name: string;
  trigger: 'no_open' | 'no_click' | 'no_submission' | 'time_delay';
  delayHours: number;
  templateId: string;
  conditions?: {
    onlyIfNotOpened?: boolean;
    onlyIfNotClicked?: boolean;
    onlyIfNotSubmitted?: boolean;
    maxFollowUps?: number;
  };
}

export interface ScheduledExecution {
  executionId: string;
  scheduleId: string;
  campaignId: string;
  plannedTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  batchesProcessed: number;
  totalBatches: number;
  emailsSent: number;
  emailsFailed: number;
  errorMessage?: string;
  metrics?: {
    openRate: number;
    clickRate: number;
    submissionRate: number;
  };
}

export class CampaignScheduler {
  private schedules: Map<string, ScheduleConfiguration> = new Map();
  private executions: Map<string, ScheduledExecution> = new Map();
  private runningExecutions: Set<string> = new Set();
  
  constructor() {
    // Start the scheduler
    this.startSchedulerEngine();
  }

  async createSchedule(config: ScheduleConfiguration): Promise<string> {
    // Validate configuration
    await this.validateScheduleConfiguration(config);
    
    // Store schedule
    this.schedules.set(config.scheduleId, config);
    
    // If immediate or specific time, create execution
    if (config.scheduleType === 'immediate') {
      await this.scheduleExecution(config, new Date());
    } else if (config.scheduleType === 'delayed' && config.startTime) {
      await this.scheduleExecution(config, config.startTime);
    } else if (config.scheduleType === 'recurring' && config.recurrencePattern) {
      await this.scheduleRecurringExecutions(config);
    } else if (config.scheduleType === 'optimal') {
      const optimalTime = await this.calculateOptimalSendTime(config);
      await this.scheduleExecution(config, optimalTime);
    }
    
    console.log(`Campaign schedule created: ${config.scheduleId}`);
    return config.scheduleId;
  }

  private async validateScheduleConfiguration(config: ScheduleConfiguration): Promise<void> {
    // Check campaign exists
    const campaign = await storage.getCampaign(config.campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${config.campaignId} not found`);
    }

    // Check recipients exist
    const recipients = await storage.getRecipients(config.campaignId);
    if (recipients.length === 0) {
      throw new Error(`Campaign ${config.campaignId} has no recipients`);
    }

    // Validate time settings
    if (config.startTime && config.startTime < new Date()) {
      throw new Error('Start time cannot be in the past');
    }

    if (config.endTime && config.startTime && config.endTime <= config.startTime) {
      throw new Error('End time must be after start time');
    }

    // Validate batch settings
    if (config.batchSettings.batchSize <= 0) {
      throw new Error('Batch size must be greater than 0');
    }

    if (config.batchSettings.maxConcurrentBatches <= 0) {
      throw new Error('Max concurrent batches must be greater than 0');
    }
  }

  private async scheduleExecution(config: ScheduleConfiguration, plannedTime: Date): Promise<string> {
    const executionId = `exec_${config.scheduleId}_${Date.now()}`;
    
    const execution: ScheduledExecution = {
      executionId,
      scheduleId: config.scheduleId,
      campaignId: config.campaignId,
      plannedTime,
      status: 'pending',
      batchesProcessed: 0,
      totalBatches: 0,
      emailsSent: 0,
      emailsFailed: 0
    };

    this.executions.set(executionId, execution);
    console.log(`Execution scheduled: ${executionId} for ${plannedTime.toISOString()}`);
    
    return executionId;
  }

  private async scheduleRecurringExecutions(config: ScheduleConfiguration): Promise<void> {
    if (!config.recurrencePattern || !config.startTime) return;

    const pattern = config.recurrencePattern;
    let currentDate = new Date(config.startTime);
    let occurrenceCount = 0;

    while (true) {
      // Check end conditions
      if (pattern.endDate && currentDate > pattern.endDate) break;
      if (pattern.maxOccurrences && occurrenceCount >= pattern.maxOccurrences) break;

      // Schedule execution for current date
      await this.scheduleExecution(config, new Date(currentDate));
      occurrenceCount++;

      // Calculate next occurrence
      currentDate = this.calculateNextRecurrence(currentDate, pattern);
    }
  }

  private calculateNextRecurrence(currentDate: Date, pattern: any): Date {
    const next = new Date(currentDate);

    switch (pattern.frequency) {
      case 'daily':
        next.setDate(next.getDate() + pattern.interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * pattern.interval));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + pattern.interval);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + (3 * pattern.interval));
        break;
    }

    return next;
  }

  private async calculateOptimalSendTime(config: ScheduleConfiguration): Promise<Date> {
    if (!config.optimization?.enabled) {
      return config.startTime || new Date();
    }

    // Get analytics for optimal timing
    const analytics = await analyticsService.getPredictiveAnalytics(config.campaignId);
    
    // Find best day and time
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const optimalHours = analytics.optimalSendTimes[dayName] || [9, 14, 16]; // Default business hours
    
    // Select the first optimal hour that's in the future
    let optimalTime = new Date(today);
    optimalTime.setHours(optimalHours[0], 0, 0, 0);
    
    if (optimalTime <= today) {
      // Move to next day
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    // Apply business hours constraint
    if (config.optimization.businessHoursOnly) {
      const hour = optimalTime.getHours();
      if (hour < 9) {
        optimalTime.setHours(9, 0, 0, 0);
      } else if (hour > 17) {
        optimalTime.setDate(optimalTime.getDate() + 1);
        optimalTime.setHours(9, 0, 0, 0);
      }
    }

    console.log(`Optimal send time calculated: ${optimalTime.toISOString()}`);
    return optimalTime;
  }

  private startSchedulerEngine(): void {
    // Check for pending executions every minute
    setInterval(() => {
      this.processScheduledExecutions();
    }, 60000);

    // Monitor running executions every 30 seconds
    setInterval(() => {
      this.monitorRunningExecutions();
    }, 30000);
    
    console.log('Campaign scheduler engine started');
  }

  private async processScheduledExecutions(): Promise<void> {
    const now = new Date();
    
    for (const [executionId, execution] of this.executions.entries()) {
      if (execution.status === 'pending' && execution.plannedTime <= now) {
        console.log(`Starting execution: ${executionId}`);
        await this.executeScheduledCampaign(execution);
      }
    }
  }

  private async executeScheduledCampaign(execution: ScheduledExecution): Promise<void> {
    try {
      // Update execution status
      execution.status = 'running';
      execution.actualStartTime = new Date();
      this.runningExecutions.add(execution.executionId);

      // Get schedule configuration
      const config = this.schedules.get(execution.scheduleId);
      if (!config) {
        throw new Error(`Schedule configuration not found: ${execution.scheduleId}`);
      }

      // Get campaign and recipients
      const campaign = await storage.getCampaign(execution.campaignId);
      const recipients = await storage.getRecipients(execution.campaignId);

      if (!campaign || recipients.length === 0) {
        throw new Error('Campaign or recipients not found');
      }

      // Calculate batches
      const batchSize = config.batchSettings.batchSize;
      execution.totalBatches = Math.ceil(recipients.length / batchSize);

      // Send webhook notification
      await webhookService.onCampaignStarted(campaign);

      // Execute campaign in batches
      await this.executeCampaignInBatches(execution, config, campaign, recipients);

      // Mark as completed
      execution.status = 'completed';
      execution.actualEndTime = new Date();
      
      // Calculate final metrics
      execution.metrics = await this.calculateExecutionMetrics(execution.campaignId);

      // Send completion webhook
      await webhookService.onCampaignCompleted(campaign, execution.metrics);

      console.log(`Execution completed: ${execution.executionId}`);

    } catch (error) {
      execution.status = 'failed';
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Execution failed: ${execution.executionId}`, error);
    } finally {
      this.runningExecutions.delete(execution.executionId);
    }
  }

  private async executeCampaignInBatches(
    execution: ScheduledExecution,
    config: ScheduleConfiguration,
    campaign: Campaign,
    recipients: Recipient[]
  ): Promise<void> {
    const batchSize = config.batchSettings.batchSize;
    const delayBetweenBatches = config.batchSettings.delayBetweenBatches * 60 * 1000; // Convert to ms
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        // Execute batch
        const result = await campaignExecutor.executeCampaignBatch(campaign, batch);
        
        // Update execution metrics
        execution.batchesProcessed++;
        execution.emailsSent += result.sentCount;
        execution.emailsFailed += result.failedCount;

        console.log(`Batch ${execution.batchesProcessed}/${execution.totalBatches} completed`);

        // Delay between batches (except for last batch)
        if (i + batchSize < recipients.length) {
          await this.delay(delayBetweenBatches);
        }

      } catch (error) {
        console.error(`Batch execution failed:`, error);
        execution.emailsFailed += batch.length;
        
        // Retry logic
        if (config.batchSettings.retryFailedEmails) {
          await this.retryFailedBatch(batch, config, campaign);
        }
      }
    }
  }

  private async retryFailedBatch(
    batch: Recipient[],
    config: ScheduleConfiguration,
    campaign: Campaign
  ): Promise<void> {
    const retryDelay = config.batchSettings.retryDelay * 60 * 1000;
    
    for (let attempt = 1; attempt <= config.batchSettings.retryAttempts; attempt++) {
      console.log(`Retrying batch, attempt ${attempt}/${config.batchSettings.retryAttempts}`);
      
      await this.delay(retryDelay);
      
      try {
        await campaignExecutor.executeCampaignBatch(campaign, batch);
        console.log(`Retry attempt ${attempt} successful`);
        break;
      } catch (error) {
        console.error(`Retry attempt ${attempt} failed:`, error);
        if (attempt === config.batchSettings.retryAttempts) {
          console.error('All retry attempts exhausted');
        }
      }
    }
  }

  private async calculateExecutionMetrics(campaignId: string): Promise<any> {
    const metrics = await analyticsService.getCampaignMetrics(campaignId);
    return {
      openRate: metrics.openRate,
      clickRate: metrics.clickRate,
      submissionRate: metrics.conversionRate
    };
  }

  private async monitorRunningExecutions(): Promise<void> {
    for (const executionId of this.runningExecutions) {
      const execution = this.executions.get(executionId);
      if (execution && execution.actualStartTime) {
        const runtimeMs = Date.now() - execution.actualStartTime.getTime();
        const runtimeHours = runtimeMs / (1000 * 60 * 60);
        
        // Check for stuck executions (running longer than 24 hours)
        if (runtimeHours > 24) {
          console.warn(`Long-running execution detected: ${executionId} (${runtimeHours.toFixed(1)} hours)`);
          // Could implement automatic termination logic here
        }
      }
    }
  }

  // Follow-up automation
  async scheduleFollowUpSequence(campaignId: string, sequence: FollowUpStep[]): Promise<void> {
    const recipients = await storage.getRecipients(campaignId);
    
    for (const step of sequence) {
      const eligibleRecipients = recipients.filter(recipient => {
        // Apply conditions to determine eligibility
        if (step.conditions?.onlyIfNotOpened && recipient.openedAt) return false;
        if (step.conditions?.onlyIfNotClicked && recipient.clickedAt) return false;
        if (step.conditions?.onlyIfNotSubmitted && recipient.submittedAt) return false;
        
        return true;
      });

      if (eligibleRecipients.length > 0) {
        // Schedule follow-up execution
        const followUpTime = new Date(Date.now() + step.delayHours * 60 * 60 * 1000);
        
        console.log(`Scheduling follow-up "${step.name}" for ${eligibleRecipients.length} recipients at ${followUpTime.toISOString()}`);
        
        // This would create a new campaign execution for the follow-up
        // Implementation would involve creating a new campaign or execution entry
      }
    }
  }

  // Management methods
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'pending') {
      execution.status = 'cancelled';
      console.log(`Execution cancelled: ${executionId}`);
    }
  }

  async pauseExecution(executionId: string): Promise<void> {
    // Implementation would pause ongoing batch processing
    console.log(`Execution paused: ${executionId}`);
  }

  async resumeExecution(executionId: string): Promise<void> {
    // Implementation would resume paused execution
    console.log(`Execution resumed: ${executionId}`);
  }

  getExecutionStatus(executionId: string): ScheduledExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): ScheduledExecution[] {
    return Array.from(this.executions.values());
  }

  getScheduleConfiguration(scheduleId: string): ScheduleConfiguration | undefined {
    return this.schedules.get(scheduleId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Advanced scheduling features
  async optimizeScheduleForRecipientTimezones(config: ScheduleConfiguration): Promise<ScheduleConfiguration> {
    if (!config.optimization?.respectRecipientTimezones) {
      return config;
    }

    // Group recipients by timezone and create separate executions
    const recipients = await storage.getRecipients(config.campaignId);
    const timezoneGroups: { [timezone: string]: Recipient[] } = {};

    recipients.forEach(recipient => {
      // Get recipient timezone (would be stored in recipient data)
      const timezone = 'UTC'; // Default fallback
      if (!timezoneGroups[timezone]) {
        timezoneGroups[timezone] = [];
      }
      timezoneGroups[timezone].push(recipient);
    });

    // Create optimized schedule for each timezone
    const optimizedConfig = { ...config };
    
    // This would create multiple sub-executions optimized for each timezone
    console.log(`Optimized schedule for ${Object.keys(timezoneGroups).length} timezones`);
    
    return optimizedConfig;
  }

  async analyzeSchedulePerformance(scheduleId: string): Promise<any> {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.scheduleId === scheduleId);

    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(exec => exec.status === 'completed').length;
    const failedExecutions = executions.filter(exec => exec.status === 'failed').length;
    
    const avgOpenRate = executions
      .filter(exec => exec.metrics)
      .reduce((sum, exec) => sum + (exec.metrics?.openRate || 0), 0) / completedExecutions;

    return {
      scheduleId,
      totalExecutions,
      completedExecutions,
      failedExecutions,
      successRate: (completedExecutions / totalExecutions) * 100,
      avgOpenRate,
      avgClickRate: 0, // Would calculate from actual data
      avgConversionRate: 0 // Would calculate from actual data
    };
  }
}

export const campaignScheduler = new CampaignScheduler();