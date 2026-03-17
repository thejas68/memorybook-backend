import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const reactionSchema = z.object({
  pageId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

// POST /api/reactions
export const addReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { pageId, emoji } = parsed.data;

  // Verify user is member of the book this page belongs to
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }

  const member = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId: page.bookId, userId: req.userId! } },
  });

  if (!member) {
    res.status(403).json({ error: 'Not a member of this book' });
    return;
  }

  // Upsert — prevent duplicate reactions
  const reaction = await prisma.reaction.upsert({
    where: { pageId_userId_emoji: { pageId, userId: req.userId!, emoji } },
    update: {},
    create: { pageId, userId: req.userId!, emoji },
  });

  res.status(201).json(reaction);
};

// DELETE /api/reactions/:reactionId
export const removeReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reactionId } = req.params;

  const reaction = await prisma.reaction.findUnique({ where: { id: reactionId } });

  if (!reaction) {
    res.status(404).json({ error: 'Reaction not found' });
    return;
  }

  if (reaction.userId !== req.userId) {
    res.status(403).json({ error: 'Cannot remove someone else\'s reaction' });
    return;
  }

  await prisma.reaction.delete({ where: { id: reactionId } });

  res.json({ message: 'Reaction removed' });
};