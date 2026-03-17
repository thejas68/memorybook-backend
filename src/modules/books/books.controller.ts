import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(['classic', 'travel', 'family', 'friendship', 'romantic']).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['contributor', 'viewer']).default('viewer'),
});

// GET /api/books
export const getMyBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  const books = await prisma.memoryBook.findMany({
    where: {
      members: { some: { userId: req.userId } },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
          },
        },
      },
      _count: { select: { pages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json(books);
};

// GET /api/books/:bookId
export const getBook = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookId } = req.params;

  // Verify user is a member
  const member = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId: req.userId! } },
  });

  if (!member) {
    res.status(403).json({ error: 'Not a member of this book' });
    return;
  }

  const book = await prisma.memoryBook.findUnique({
    where: { id: bookId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
          },
        },
      },
      _count: { select: { pages: true } },
    },
  });

  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }

  res.json(book);
};

// POST /api/books
export const createBook = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createBookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, description, theme } = parsed.data;

  const book = await prisma.memoryBook.create({
    data: {
      title,
      description,
      theme: theme || 'classic',
      createdBy: req.userId!,
      // Auto-add creator as owner
      members: {
        create: { userId: req.userId!, role: 'owner' },
      },
    },
    include: {
      _count: { select: { pages: true } },
      members: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      bookId: book.id,
      userId: req.userId!,
      action: 'book_created',
      details: { title },
    },
  });

  res.status(201).json(book);
};

// PATCH /api/books/:bookId
export const updateBook = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookId } = req.params;
  const { title, description, theme, coverImageUrl } = req.body;

  const book = await prisma.memoryBook.update({
    where: { id: bookId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(theme && { theme }),
      ...(coverImageUrl && { coverImageUrl }),
    },
  });

  res.json(book);
};

// DELETE /api/books/:bookId
export const deleteBook = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookId } = req.params;

  await prisma.memoryBook.delete({ where: { id: bookId } });

  res.json({ message: 'Book deleted successfully' });
};

// POST /api/books/:bookId/members
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookId } = req.params;

  const parsed = inviteMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, role } = parsed.data;

  // Find user by email
  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    res.status(404).json({ error: 'No user found with that email' });
    return;
  }

  // Check if already a member
  const existing = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId: invitedUser.id } },
  });
  if (existing) {
    res.status(409).json({ error: 'User is already a member' });
    return;
  }

  const member = await prisma.bookMember.create({
    data: { bookId, userId: invitedUser.id, role },
    include: {
      user: { select: { id: true, email: true, profile: true } },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      bookId,
      userId: req.userId!,
      action: 'member_invited',
      details: { invitedEmail: email, role },
    },
  });

  res.status(201).json(member);
};

// DELETE /api/books/:bookId/members/:userId
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookId, userId } = req.params;

  await prisma.bookMember.delete({
    where: { bookId_userId: { bookId, userId } },
  });

  res.json({ message: 'Member removed successfully' });
};