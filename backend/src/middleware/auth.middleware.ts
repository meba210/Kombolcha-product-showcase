import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    role: string;
    email: string;
  };
}

/**
 * Verifies JWT token and attaches user payload to request.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user_id: number;
      role: string;
      email: string;
    };
    prisma.user.findUnique({ where: { user_id: decoded.user_id }, select: { account_status: true } })
      .then((user) => {
        if (!user || user.account_status === 'DISABLED') {
          res.status(403).json({ success: false, message: 'This account has been disabled.' });
          return;
        }
        req.user = decoded;
        next();
      })
      .catch(next);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware factory.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
      return;
    }
    next();
  };
};
