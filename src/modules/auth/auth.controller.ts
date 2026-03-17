import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { signToken } from '../../utils/jwt';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password, displayName } = parsed.data;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // Hash password with cost factor 12
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user and profile in one transaction
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      profile: {
        create: { displayName },
      },
    },
    include: { profile: true },
  });

  const token = signToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email or password format' });
    return;
  }

  const { email, password } = parsed.data;

  // Find user with profile
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  // Use same error for both wrong email and wrong password (security)
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName,
      avatarUrl: user.profile?.avatarUrl,
    },
  });
};

export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { profile: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.profile?.displayName,
    avatarUrl: user.profile?.avatarUrl,
  });
};