import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend Express Request to carry userId
export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};