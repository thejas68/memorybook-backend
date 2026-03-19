import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';

const getString = (value: any): string => {
  return Array.isArray(value) ? value[0] : value;
};

// GET pages of a book
export const getPages = async (req: AuthRequest, res: Response) => {
  const bookId = getString(req.params.bookId);
  const userId = getString(req.userId);

  const member = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const pages = await prisma.page.findMany({
    where: { bookId },
    orderBy: { pageNumber: 'asc' },
  });

  res.json(pages);
};

// CREATE page
export const createPage = async (req: AuthRequest, res: Response) => {
  const bookId = getString(req.params.bookId);
  const userId = getString(req.userId);

  const { title, content, pageNumber } = req.body;

  const member = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const page = await prisma.page.create({
    data: {
      bookId,
      authorId: userId,
      title,
      content,
      pageNumber,
    },
  });

  await prisma.activityLog.create({
    data: {
      bookId,
      userId,
      action: 'page_created',
      details: { title },
    },
  });

  res.status(201).json(page);
};

// GET single page
export const getPage = async (req: AuthRequest, res: Response) => {
  const pageId = getString(req.params.pageId);

  const page = await prisma.page.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.json(page);
};

// UPDATE page
export const updatePage = async (req: AuthRequest, res: Response) => {
  const pageId = getString(req.params.pageId);

  const { title, content } = req.body;

  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(title && { title }),
      ...(content && { content }),
    },
  });

  res.json(page);
};

// DELETE page
export const deletePage = async (req: AuthRequest, res: Response) => {
  const pageId = getString(req.params.pageId);

  await prisma.page.delete({
    where: { id: pageId },
  });

  res.json({ message: 'Page deleted successfully' });
};