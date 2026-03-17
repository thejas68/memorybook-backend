import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { addReaction, removeReaction } from './reactions.controller';

const router = Router();

router.post('/', requireAuth, addReaction);
router.delete('/:reactionId', requireAuth, removeReaction);

export default router;