import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from './auth';

// ✅ helper
const getString = (value: any): string => {
  return Array.isArray(value) ? value[0] : value;
};

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;                    // ← cast here
    const bookId = getString(authReq.params['bookId']);
    const userId = getString(authReq.userId);

    if (!bookId) {
      next();
      return;
    }

    const member = await prisma.bookMember.findUnique({
      where: {
        bookId_userId: {
          bookId,
          userId,
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