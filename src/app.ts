import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import authRoutes from './modules/auth/auth.routes';
import bookRoutes from './modules/books/books.routes';
import pageRoutes from './modules/pages/pages.routes';
import reactionRoutes from './modules/reactions/reactions.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/books/:bookId/pages', pageRoutes);
app.use('/api/reactions', reactionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);
export default app;