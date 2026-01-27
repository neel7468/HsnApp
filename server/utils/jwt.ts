import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'free' | 'premium' | 'admin';
  planTier: 'free' | 'basic' | 'business';
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
