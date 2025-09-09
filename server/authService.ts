import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { storage } from './storage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'zspam-secret-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zspam-refresh-secret-change-in-production';
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

  private refreshTokens: Set<string> = new Set();

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens } | null> {
    try {
      const { username, password } = credentials;

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store refresh token
      this.refreshTokens.add(tokens.refreshToken);

      console.log(`User ${username} logged in successfully`);

      return {
        user: { ...user, password: '' }, // Don't return password
        tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async register(registerData: RegisterData): Promise<{ user: User; tokens: AuthTokens } | { error: string }> {
    try {
      const { username, password, confirmPassword } = registerData;

      // Validate input
      if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
      }

      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long' };
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return { error: 'Username already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store refresh token
      this.refreshTokens.add(tokens.refreshToken);

      console.log(`User ${username} registered successfully`);

      return {
        user: { ...user, password: '' }, // Don't return password
        tokens,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Registration failed' };
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      // Check if refresh token exists in our store
      if (!this.refreshTokens.has(refreshToken)) {
        return null;
      }

      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      // Get user
      const user = await storage.getUser(payload.userId);
      if (!user) {
        this.refreshTokens.delete(refreshToken);
        return null;
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(user);

      // Replace old refresh token with new one
      this.refreshTokens.delete(refreshToken);
      this.refreshTokens.add(newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.refreshTokens.delete(refreshToken);
      return null;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    this.refreshTokens.delete(refreshToken);
  }

  async verifyAccessToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      const user = await storage.getUser(payload.userId);
      
      if (!user) {
        return null;
      }

      return { ...user, password: '' }; // Don't return password
    } catch (error) {
      return null;
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const tokenPayload = {
      userId: user.id!,
      username: user.username,
      role: 'user', // Could be expanded for role-based access
    };

    const accessToken = jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(tokenPayload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters long' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUserPassword(userId, hashedPassword);

      console.log(`Password changed for user ${user.username}`);

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Rate limiting helper
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  isRateLimited(identifier: string): boolean {
    const attempts = this.loginAttempts.get(identifier);
    if (!attempts) return false;

    const now = Date.now();
    if (now - attempts.lastAttempt > this.LOCKOUT_TIME) {
      this.loginAttempts.delete(identifier);
      return false;
    }

    return attempts.count >= this.MAX_LOGIN_ATTEMPTS;
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier);
      return;
    }

    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(identifier, attempts);
  }

  // Session management
  private activeSessions: Map<string, { userId: string; createdAt: number }> = new Map();

  createSession(userId: string): string {
    const sessionId = jwt.sign({ userId, type: 'session' }, this.JWT_SECRET, { expiresIn: '24h' });
    this.activeSessions.set(sessionId, { userId, createdAt: Date.now() });
    return sessionId;
  }

  validateSession(sessionId: string): string | null {
    try {
      const payload = jwt.verify(sessionId, this.JWT_SECRET) as any;
      if (payload.type !== 'session') return null;

      const session = this.activeSessions.get(sessionId);
      if (!session) return null;

      return session.userId;
    } catch {
      return null;
    }
  }

  destroySession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // Cleanup old sessions
  cleanupSessions(): void {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.createdAt > ONE_DAY) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export const authService = new AuthService();

// Clean up sessions every hour
setInterval(() => {
  authService.cleanupSessions();
}, 60 * 60 * 1000);