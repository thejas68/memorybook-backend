import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const createPageSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.any().optional(),
});

// GET /api/books/:bookId/pages
export const getPages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;

    const member = await prisma.bookMember.findUnique({
      where: { bookId_userId: { bookId, userId: req.userId! } },
    });

    if (!member) {
      res.status(403).json({ error: 'Not a member of this book' });
      return;
    }

    const pages = await prisma.page.findMany({
      where: { bookId },
      include: {
        author: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        reactions: {
          include: {
            user: { select: { id: true, profile: { select: { displayName: true } } } },
          },
        },
      },
      orderBy: { pageNumber: 'asc' },
    });

    res.json(pages);
  } catch (error: any) {
    console.error('GET PAGES ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/books/:bookId/pages
export const createPage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;

    const parsed = createPageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const { title, content } = parsed.data;

    const member = await prisma.bookMember.findUnique({
      where: { bookId_userId: { bookId, userId: req.userId! } },
    });

    if (!member || member.role === 'viewer') {
      res.status(403).json({ error: 'Viewers cannot add pages' });
      return;
    }

    const lastPage = await prisma.page.findFirst({
      where: { bookId },
      orderBy: { pageNumber: 'desc' },
    });

    const page = await prisma.page.create({
      data: {
        bookId,
        authorId: req.userId!,
        title: title || 'Untitled Memory',
        content: content ?? {},
        pageNumber: (lastPage?.pageNumber ?? 0) + 1,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        reactions: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        bookId,
        userId: req.userId!,
        action: 'page_created',
        details: { pageId: page.id, title: page.title },
      },
    });

    res.status(201).json(page);

  } catch (error: any) {
    console.error('CREATE PAGE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/books/:bookId/pages/:pageId
export const updatePage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;
    const { title, content } = req.body;

    const page = await prisma.page.findUnique({ where: { id: pageId } });

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    if (page.authorId !== req.userId) {
      res.status(403).json({ error: 'Only the author can edit this page' });
      return;
    }

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('UPDATE PAGE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/books/:bookId/pages/:pageId
export const deletePage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;

    const page = await prisma.page.findUnique({ where: { id: pageId } });

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    if (page.authorId !== req.userId) {
      res.status(403).json({ error: 'Only the author can delete this page' });
      return;
    }

    await prisma.page.delete({ where: { id: pageId } });

    res.json({ message: 'Page deleted successfully' });
  } catch (error: any) {
    console.error('DELETE PAGE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
};