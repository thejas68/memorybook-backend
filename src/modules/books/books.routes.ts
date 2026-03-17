import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleGuard';
import {
  getMyBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  inviteMember,
  removeMember,
} from './books.controller';

const router = Router();

router.get('/', requireAuth, getMyBooks);
router.post('/', requireAuth, createBook);
router.get('/:bookId', requireAuth, getBook);
router.patch('/:bookId', requireAuth, requireRole('owner'), updateBook);
router.delete('/:bookId', requireAuth, requireRole('owner'), deleteBook);
router.post('/:bookId/members', requireAuth, requireRole('owner'), inviteMember);
router.delete('/:bookId/members/:userId', requireAuth, requireRole('owner'), removeMember);

export default router;