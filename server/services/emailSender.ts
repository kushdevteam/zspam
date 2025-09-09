import { db } from '../db';
import { smtpServers } from '@shared/schema';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: any[];
}

// Send email using configured SMTP server
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Get active SMTP server
    const activeServers = await db.select()
      .from(smtpServers)
      .where(eq(smtpServers.isActive, true))
      .limit(1);

    if (!activeServers.length) {
      throw new Error('No active SMTP server configured');
    }

    const smtp = activeServers[0];

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.username,
        pass: smtp.password
      }
    });

    // Send email
    await transporter.sendMail({
      from: options.from || smtp.username,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}