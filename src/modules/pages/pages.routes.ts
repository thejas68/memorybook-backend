import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getPages, createPage, updatePage, deletePage } from './pages.controller';

const router = Router({ mergeParams: true }); // mergeParams to access :bookId

router.get('/', requireAuth, getPages);
router.post('/', requireAuth, createPage);
router.patch('/:pageId', requireAuth, updatePage);
router.delete('/:pageId', requireAuth, deletePage);

export default router;