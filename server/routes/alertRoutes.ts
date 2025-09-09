import { Router } from 'express';
import { db } from '../db';
import { alertSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { alertService } from '../services/alertService';

const router = Router();

// Get user's alert settings
router.get('/settings', async (req, res) => {
  try {
    const userId = 'default-user'; // In real app, get from session

    const settings = await db.select()
      .from(alertSettings)
      .where(eq(alertSettings.userId, userId))
      .limit(1);

    if (!settings.length) {
      // Create default settings
      const defaultSettings = await db.insert(alertSettings)
        .values({
          userId,
          emailEnabled: true,
          alertOnCredentialCapture: true,
          alertOnCampaignStart: true,
          alertOnCampaignEnd: true,
          alertOnHighRiskSession: true
        })
        .returning();

      res.json(defaultSettings[0]);
    } else {
      res.json(settings[0]);
    }
  } catch (error) {
    console.error('Failed to get alert settings:', error);
    res.status(500).json({ error: 'Failed to get alert settings' });
  }
});

// Update alert settings
router.put('/settings', async (req, res) => {
  try {
    const userId = 'default-user'; // In real app, get from session
    const updates = req.body;

    // Update settings
    const updated = await db.update(alertSettings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(alertSettings.userId, userId))
      .returning();

    if (!updated.length) {
      // Create if doesn't exist
      const created = await db.insert(alertSettings)
        .values({
          userId,
          ...updates
        })
        .returning();

      res.json(created[0]);
    } else {
      res.json(updated[0]);
    }
  } catch (error) {
    console.error('Failed to update alert settings:', error);
    res.status(500).json({ error: 'Failed to update alert settings' });
  }
});

// Test alert configuration
router.post('/test', async (req, res) => {
  try {
    const { alertType } = req.body;
    const userId = 'default-user'; // In real app, get from session

    const testAlertData = {
      title: '🧪 Test Alert',
      message: `This is a test ${alertType} alert from zSPAM`,
      type: 'info' as const,
      metadata: {
        testType: alertType,
        timestamp: new Date().toISOString(),
        source: 'Manual Test'
      }
    };

    // Send test alert based on type
    if (alertType === 'email') {
      const settings = await db.select()
        .from(alertSettings)
        .where(eq(alertSettings.userId, userId))
        .limit(1);

      if (settings.length && settings[0].emailEnabled && settings[0].emailAddress) {
        await alertService['sendEmailAlert'](settings[0].emailAddress, testAlertData);
      }
    } else if (alertType === 'slack') {
      const settings = await db.select()
        .from(alertSettings)
        .where(eq(alertSettings.userId, userId))
        .limit(1);

      if (settings.length && settings[0].slackEnabled && settings[0].slackWebhookUrl) {
        await alertService['sendSlackAlert'](
          settings[0].slackWebhookUrl,
          settings[0].slackChannel,
          testAlertData
        );
      }
    } else if (alertType === 'telegram') {
      const settings = await db.select()
        .from(alertSettings)
        .where(eq(alertSettings.userId, userId))
        .limit(1);

      if (settings.length && settings[0].telegramEnabled && settings[0].telegramBotToken && settings[0].telegramChatId) {
        await alertService['sendTelegramAlert'](
          settings[0].telegramBotToken,
          settings[0].telegramChatId,
          testAlertData
        );
      }
    }

    res.json({ success: true, message: 'Test alert sent successfully' });
  } catch (error) {
    console.error('Failed to send test alert:', error);
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

// Get alert history/logs (for future implementation)
router.get('/history', async (req, res) => {
  try {
    // This would fetch alert history from a logs table
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Failed to get alert history:', error);
    res.status(500).json({ error: 'Failed to get alert history' });
  }
});

export default router;