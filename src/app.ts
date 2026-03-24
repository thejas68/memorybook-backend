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

// ✅ CORS — allows local dev + Vercel production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL,        // set in Render env vars
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
});

// ✅ Health check — Render uses this to verify service is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
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