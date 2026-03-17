import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from './auth';

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const bookId = req.params.bookId;

    if (!bookId) {
      next();
      return;
    }

    const member = await prisma.bookMember.findUnique({
      where: {
        bookId_userId: {
          bookId,
          userId: req.userId!,
        },
      },
    });

    if (!member || !roles.includes(member.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}