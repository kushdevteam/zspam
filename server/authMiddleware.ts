import { Request, Response, NextFunction } from 'express';
import { authService } from './authService';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const user = await authService.verifyAccessToken(token);
    if (!user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id!,
      username: user.username,
      role: 'user', // Could be expanded for RBAC
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await authService.verifyAccessToken(token);
      if (user) {
        (req as AuthenticatedRequest).user = {
          id: user.id!,
          username: user.username,
          role: 'user',
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

export const rateLimitByIP = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (authService.isRateLimited(clientIP)) {
    res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.' 
    });
    return;
  }

  next();
};