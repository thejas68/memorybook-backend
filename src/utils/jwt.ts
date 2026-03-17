import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

// Generate a token that expires in 7 days
export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, SECRET, { expiresIn: '7d' });
};

// Verify and decode a token
export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, SECRET) as { userId: string };
};