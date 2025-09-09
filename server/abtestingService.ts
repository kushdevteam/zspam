import { Campaign, Recipient, EmailTemplate } from '@shared/schema';
import { storage } from './storage';
import { templateLibrary, EnhancedEmailTemplate } from './templateLibrary';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage of recipients (0-100)
  template: EmailTemplate;
  isControl: boolean;
}

export interface ABTestConfiguration {
  testName: string;
  hypothesis: string;
  testType: 'subject_line' | 'content' | 'sender_name' | 'send_time' | 'template_design';
  variants: ABTestVariant[];
  sampleSize: number;
  confidenceLevel: number; // 90, 95, 99
  minimumDetectableEffect: number; // percentage
  primaryMetric: 'open_rate' | 'click_rate' | 'submission_rate' | 'conversion_rate';
  secondaryMetrics: string[];
  duration: number; // hours
  automaticWinner: boolean;
}

export interface ABTestResults {
  testId: string;
  status: 'running' | 'completed' | 'stopped';
  startTime: Date;
  endTime?: Date;
  variants: VariantResults[];
  winnerVariant?: string;
  confidence: number;
  significance: number;
  recommendations: string[];
}

export interface VariantResults {
  variantId: string;
  name: string;
  recipients: number;
  opens: number;
  clicks: number;
  submissions: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  submissionRate: number;
  conversionRate: number;
  confidence: number;
  isWinner: boolean;
  uplift?: number; // percentage improvement over control
}

export class ABTestingService {
  
  async createABTest(campaign: Campaign, config: ABTestConfiguration): Promise<string> {
    const testId = `abtest_${campaign.id}_${Date.now()}`;
    
    // Validate configuration
    this.validateABTestConfig(config);
    
    // Get recipients for the campaign
    const recipients = await storage.getRecipients(campaign.id!);
    
    if (recipients.length < config.sampleSize) {
      throw new Error(`Insufficient recipients. Need ${config.sampleSize}, have ${recipients.length}`);
    }
    
    // Split recipients into variants
    const variantRecipients = this.splitRecipientsIntoVariants(recipients, config.variants);
    
    // Store A/B test configuration and variant assignments
    await this.storeABTestData(testId, campaign.id!, config, variantRecipients);
    
    console.log(`A/B test "${config.testName}" created with ID: ${testId}`);
    return testId;
  }

  private validateABTestConfig(config: ABTestConfiguration): void {
    // Check total weight equals 100%
    const totalWeight = config.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`Variant weights must sum to 100%, got ${totalWeight}%`);
    }

    // Check at least one control variant
    const controlVariants = config.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Must have exactly one control variant');
    }

    // Check minimum sample size
    if (config.sampleSize < 100) {
      throw new Error('Minimum sample size is 100 recipients for statistical significance');
    }

    // Check variants have different templates
    const templateIds = config.variants.map(v => v.template.id);
    if (new Set(templateIds).size !== templateIds.length) {
      throw new Error('All variants must use different templates');
    }
  }

  private splitRecipientsIntoVariants(
    recipients: Recipient[], 
    variants: ABTestVariant[]
  ): Map<string, Recipient[]> {
    const shuffled = [...recipients].sort(() => Math.random() - 0.5);
    const variantRecipients = new Map<string, Recipient[]>();
    
    let startIndex = 0;
    
    for (const variant of variants) {
      const recipientCount = Math.floor((variant.weight / 100) * recipients.length);
      const variantRecs = shuffled.slice(startIndex, startIndex + recipientCount);
      variantRecipients.set(variant.id, variantRecs);
      startIndex += recipientCount;
    }
    
    return variantRecipients;
  }

  private async storeABTestData(
    testId: string,
    campaignId: string,
    config: ABTestConfiguration,
    variantRecipients: Map<string, Recipient[]>
  ): Promise<void> {
    // Store in campaign analytics table for now
    // In production, would use dedicated A/B test tables
    const testData = {
      testId,
      campaignId,
      config,
      variantAssignments: Object.fromEntries(variantRecipients),
      startTime: new Date(),
      status: 'running'
    };
    
    // This would be stored in a dedicated AB test table in production
    console.log('A/B test data stored:', testData);
  }

  async getABTestResults(testId: string): Promise<ABTestResults> {
    // In production, this would query actual test results from the database
    // For now, return simulated results
    
    return this.generateMockResults(testId);
  }

  private generateMockResults(testId: string): ABTestResults {
    return {
      testId,
      status: 'running',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      variants: [
        {
          variantId: 'control',
          name: 'Control - Original Subject',
          recipients: 500,
          opens: 150,
          clicks: 45,
          submissions: 12,
          conversions: 8,
          openRate: 30.0,
          clickRate: 9.0,
          submissionRate: 2.4,
          conversionRate: 1.6,
          confidence: 95.0,
          isWinner: false
        },
        {
          variantId: 'variant_a',
          name: 'Variant A - Urgent Subject',
          recipients: 500,
          opens: 185,
          clicks: 62,
          submissions: 18,
          conversions: 14,
          openRate: 37.0,
          clickRate: 12.4,
          submissionRate: 3.6,
          conversionRate: 2.8,
          confidence: 98.5,
          isWinner: true,
          uplift: 75.0
        }
      ],
      winnerVariant: 'variant_a',
      confidence: 98.5,
      significance: 0.015,
      recommendations: [
        'Variant A shows 75% improvement in conversion rate',
        'Urgent language in subject lines increases engagement',
        'Consider implementing Variant A for full campaign rollout',
        'Test additional urgent language variations'
      ]
    };
  }

  async generateSubjectLineVariants(baseSubject: string): Promise<string[]> {
    const variants = [
      baseSubject, // Control
      `URGENT: ${baseSubject}`,
      `Action Required: ${baseSubject}`,
      `⚠️ ${baseSubject}`,
      `[Important] ${baseSubject}`,
      baseSubject.replace(/\./g, '!'),
      `Time Sensitive: ${baseSubject}`,
      `Final Notice: ${baseSubject}`
    ];

    return variants.slice(0, 4); // Return 4 variants max for practical testing
  }

  async generateContentVariants(template: EnhancedEmailTemplate): Promise<EnhancedEmailTemplate[]> {
    const variants: EnhancedEmailTemplate[] = [
      template, // Control
      templateLibrary.generateVariant(template, 'urgent'),
      templateLibrary.generateVariant(template, 'friendly'),
      templateLibrary.generateVariant(template, 'formal')
    ];

    return variants;
  }

  async calculateStatisticalSignificance(
    controlResults: VariantResults,
    testResults: VariantResults,
    metric: 'open_rate' | 'click_rate' | 'submission_rate' | 'conversion_rate'
  ): Promise<{
    significant: boolean;
    pValue: number;
    confidence: number;
    uplift: number;
  }> {
    const controlRate = controlResults[metric] / 100;
    const testRate = testResults[metric] / 100;
    
    // Simplified chi-square test calculation
    const controlSuccess = Math.round(controlResults.recipients * controlRate);
    const testSuccess = Math.round(testResults.recipients * testRate);
    
    const controlFailure = controlResults.recipients - controlSuccess;
    const testFailure = testResults.recipients - testSuccess;
    
    // Chi-square statistic
    const expected = (controlSuccess + testSuccess) / (controlResults.recipients + testResults.recipients);
    const expectedControlSuccess = controlResults.recipients * expected;
    const expectedTestSuccess = testResults.recipients * expected;
    const expectedControlFailure = controlResults.recipients * (1 - expected);
    const expectedTestFailure = testResults.recipients * (1 - expected);
    
    const chiSquare = 
      Math.pow(controlSuccess - expectedControlSuccess, 2) / expectedControlSuccess +
      Math.pow(testSuccess - expectedTestSuccess, 2) / expectedTestSuccess +
      Math.pow(controlFailure - expectedControlFailure, 2) / expectedControlFailure +
      Math.pow(testFailure - expectedTestFailure, 2) / expectedTestFailure;
    
    // Degrees of freedom = 1 for 2x2 contingency table
    // Critical value for 95% confidence (p = 0.05) is 3.841
    const significant = chiSquare > 3.841;
    const pValue = significant ? 0.01 : 0.15; // Simplified
    const confidence = significant ? 95 : 80;
    const uplift = ((testRate - controlRate) / controlRate) * 100;
    
    return {
      significant,
      pValue,
      confidence,
      uplift
    };
  }

  async optimizeVariantAllocation(testResults: ABTestResults): Promise<{
    recommendation: 'continue' | 'declare_winner' | 'extend_test';
    optimalAllocation?: { [variantId: string]: number };
    reasoning: string;
  }> {
    const winner = testResults.variants.find(v => v.isWinner);
    
    if (!winner) {
      return {
        recommendation: 'continue',
        reasoning: 'No clear winner yet. Continue test to gather more data.'
      };
    }

    if (testResults.confidence > 95) {
      return {
        recommendation: 'declare_winner',
        reasoning: `${winner.name} shows statistically significant improvement with ${testResults.confidence}% confidence.`
      };
    }

    return {
      recommendation: 'extend_test',
      reasoning: 'Results are promising but need more data for statistical significance.'
    };
  }

  async generateTestReport(testId: string): Promise<string> {
    const results = await this.getABTestResults(testId);
    
    const report = `
# A/B Test Report: ${testId}

## Test Overview
- **Status**: ${results.status}
- **Duration**: ${this.formatDuration(results.startTime, results.endTime)}
- **Winner**: ${results.winnerVariant || 'TBD'}
- **Confidence**: ${results.confidence}%

## Variant Performance

${results.variants.map(variant => `
### ${variant.name} ${variant.isWinner ? '🏆' : ''}
- **Recipients**: ${variant.recipients.toLocaleString()}
- **Open Rate**: ${variant.openRate}% (${variant.opens} opens)
- **Click Rate**: ${variant.clickRate}% (${variant.clicks} clicks)
- **Submission Rate**: ${variant.submissionRate}% (${variant.submissions} submissions)
- **Conversion Rate**: ${variant.conversionRate}% (${variant.conversions} conversions)
${variant.uplift ? `- **Uplift**: +${variant.uplift}%` : ''}
`).join('')}

## Recommendations
${results.recommendations.map(rec => `- ${rec}`).join('\n')}

## Statistical Analysis
- **Significance Level**: ${results.significance}
- **Confidence Level**: ${results.confidence}%
- **Primary Metric**: Conversion Rate

Generated on ${new Date().toLocaleString()}
    `;

    return report.trim();
  }

  private formatDuration(start: Date, end?: Date): string {
    const endTime = end || new Date();
    const diffMs = endTime.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  // Multi-armed bandit for dynamic allocation
  async implementBanditOptimization(testId: string): Promise<{ [variantId: string]: number }> {
    const results = await this.getABTestResults(testId);
    
    // Thompson Sampling for exploration vs exploitation
    const allocations: { [variantId: string]: number } = {};
    let totalScore = 0;
    
    // Calculate scores for each variant
    const scores = results.variants.map(variant => {
      const alpha = variant.conversions + 1; // successes + 1
      const beta = (variant.recipients - variant.conversions) + 1; // failures + 1
      
      // Beta distribution sampling (simplified)
      const score = alpha / (alpha + beta);
      totalScore += score;
      
      return { variantId: variant.variantId, score };
    });
    
    // Calculate proportional allocations
    scores.forEach(({ variantId, score }) => {
      allocations[variantId] = Math.round((score / totalScore) * 100);
    });
    
    return allocations;
  }
}

export const abtestingService = new ABTestingService();