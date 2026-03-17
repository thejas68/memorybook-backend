import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  — requires valid JWT
router.get('/me', requireAuth, getMe);

export default router;