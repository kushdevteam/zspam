import { Router } from 'express';
import { db } from '../db';
import { campaignSchedules, campaigns, recipients } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { emailAutomationService } from '../services/emailAutomation';

const router = Router();

// Schedule a campaign
router.post('/campaigns/:id/schedule', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { scheduledAt, batchSize = 50, delayBetweenBatches = 5 } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }

    // Verify campaign exists
    const campaign = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Schedule the campaign
    await emailAutomationService.scheduleCampaign(campaignId, new Date(scheduledAt), {
      batchSize,
      delayBetweenBatches
    });

    res.json({
      success: true,
      message: 'Campaign scheduled successfully',
      scheduledAt: new Date(scheduledAt).toISOString()
    });
  } catch (error) {
    console.error('Failed to schedule campaign:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
});

// Get scheduled campaigns
router.get('/campaigns/scheduled', async (req, res) => {
  try {
    const { status } = req.query;

    let conditions = [];
    if (status) {
      conditions.push(eq(campaignSchedules.status, status as string));
    }

    const scheduledCampaigns = await db.select()
      .from(campaignSchedules)
      .leftJoin(campaigns, eq(campaignSchedules.campaignId, campaigns.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(campaignSchedules.scheduledAt);

    const formattedCampaigns = scheduledCampaigns.map(row => ({
      id: row.campaign_schedules.id,
      campaignId: row.campaign_schedules.campaignId,
      campaignName: row.campaigns?.name || 'Unknown',
      campaignType: row.campaigns?.type || 'Unknown',
      scheduledAt: row.campaign_schedules.scheduledAt,
      executedAt: row.campaign_schedules.executedAt,
      status: row.campaign_schedules.status,
      batchSize: row.campaign_schedules.batchSize,
      delayBetweenBatches: row.campaign_schedules.delayBetweenBatches,
      totalRecipients: row.campaign_schedules.totalRecipients,
      sentCount: row.campaign_schedules.sentCount,
      failedCount: row.campaign_schedules.failedCount,
      errorMessage: row.campaign_schedules.errorMessage
    }));

    res.json(formattedCampaigns);
  } catch (error) {
    console.error('Failed to get scheduled campaigns:', error);
    res.status(500).json({ error: 'Failed to get scheduled campaigns' });
  }
});

// Cancel a scheduled campaign
router.delete('/campaigns/:scheduleId', async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;

    // Check if schedule exists and is cancellable
    const schedule = await db.select()
      .from(campaignSchedules)
      .where(eq(campaignSchedules.id, scheduleId))
      .limit(1);

    if (!schedule.length) {
      return res.status(404).json({ error: 'Scheduled campaign not found' });
    }

    if (schedule[0].status === 'executing') {
      return res.status(400).json({ error: 'Cannot cancel campaign that is currently executing' });
    }

    if (schedule[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed campaign' });
    }

    // Cancel the schedule
    await db.update(campaignSchedules)
      .set({
        status: 'cancelled',
        errorMessage: 'Cancelled by user',
        updatedAt: new Date()
      })
      .where(eq(campaignSchedules.id, scheduleId));

    // Update campaign status back to draft
    if (schedule[0].campaignId) {
      await db.update(campaigns)
        .set({
          status: 'draft',
          updatedAt: new Date()
        })
        .where(eq(campaigns.id, schedule[0].campaignId));
    }

    res.json({ success: true, message: 'Scheduled campaign cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel scheduled campaign:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled campaign' });
  }
});

// Get campaign scheduling status
router.get('/campaigns/:id/status', async (req, res) => {
  try {
    const campaignId = req.params.id;

    const schedule = await db.select()
      .from(campaignSchedules)
      .leftJoin(campaigns, eq(campaignSchedules.campaignId, campaigns.id))
      .where(eq(campaignSchedules.campaignId, campaignId))
      .orderBy(campaignSchedules.createdAt)
      .limit(1);

    if (!schedule.length) {
      return res.status(404).json({ error: 'No schedule found for this campaign' });
    }

    const scheduleData = schedule[0].campaign_schedules;
    const campaignData = schedule[0].campaigns;

    res.json({
      id: scheduleData.id,
      campaignId: scheduleData.campaignId,
      campaignName: campaignData?.name,
      scheduledAt: scheduleData.scheduledAt,
      executedAt: scheduleData.executedAt,
      status: scheduleData.status,
      progress: {
        totalRecipients: scheduleData.totalRecipients || 0,
        sentCount: scheduleData.sentCount || 0,
        failedCount: scheduleData.failedCount || 0,
        percentage: scheduleData.totalRecipients ? 
          Math.round(((scheduleData.sentCount || 0) / scheduleData.totalRecipients) * 100) : 0
      },
      settings: {
        batchSize: scheduleData.batchSize,
        delayBetweenBatches: scheduleData.delayBetweenBatches
      },
      errorMessage: scheduleData.errorMessage
    });
  } catch (error) {
    console.error('Failed to get campaign status:', error);
    res.status(500).json({ error: 'Failed to get campaign status' });
  }
});

// Reschedule a campaign
router.put('/campaigns/:scheduleId/reschedule', async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    const { scheduledAt, batchSize, delayBetweenBatches } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }

    // Check if schedule exists and can be rescheduled
    const schedule = await db.select()
      .from(campaignSchedules)
      .where(eq(campaignSchedules.id, scheduleId))
      .limit(1);

    if (!schedule.length) {
      return res.status(404).json({ error: 'Scheduled campaign not found' });
    }

    if (schedule[0].status === 'executing') {
      return res.status(400).json({ error: 'Cannot reschedule campaign that is currently executing' });
    }

    if (schedule[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot reschedule completed campaign' });
    }

    // Update the schedule
    const updates: any = {
      scheduledAt: new Date(scheduledAt),
      updatedAt: new Date(),
      status: 'pending',
      errorMessage: null
    };

    if (batchSize) updates.batchSize = batchSize;
    if (delayBetweenBatches) updates.delayBetweenBatches = delayBetweenBatches;

    await db.update(campaignSchedules)
      .set(updates)
      .where(eq(campaignSchedules.id, scheduleId));

    res.json({
      success: true,
      message: 'Campaign rescheduled successfully',
      newScheduledAt: new Date(scheduledAt).toISOString()
    });
  } catch (error) {
    console.error('Failed to reschedule campaign:', error);
    res.status(500).json({ error: 'Failed to reschedule campaign' });
  }
});

// Get scheduling statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await db.select({
      status: campaignSchedules.status,
      count: db.$count()
    })
    .from(campaignSchedules)
    .groupBy(campaignSchedules.status);

    const formattedStats = {
      pending: 0,
      executing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      if (stat.status) {
        formattedStats[stat.status as keyof typeof formattedStats] = stat.count;
      }
    });

    // Get upcoming schedules (next 24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcoming = await db.select()
      .from(campaignSchedules)
      .leftJoin(campaigns, eq(campaignSchedules.campaignId, campaigns.id))
      .where(and(
        gte(campaignSchedules.scheduledAt, new Date()),
        lte(campaignSchedules.scheduledAt, tomorrow),
        eq(campaignSchedules.status, 'pending')
      ))
      .orderBy(campaignSchedules.scheduledAt)
      .limit(5);

    const upcomingFormatted = upcoming.map(row => ({
      id: row.campaign_schedules.id,
      campaignName: row.campaigns?.name || 'Unknown',
      scheduledAt: row.campaign_schedules.scheduledAt,
      totalRecipients: row.campaign_schedules.totalRecipients
    }));

    res.json({
      statusCounts: formattedStats,
      totalScheduled: Object.values(formattedStats).reduce((sum, count) => sum + count, 0),
      upcoming: upcomingFormatted
    });
  } catch (error) {
    console.error('Failed to get scheduling statistics:', error);
    res.status(500).json({ error: 'Failed to get scheduling statistics' });
  }
});

export default router;