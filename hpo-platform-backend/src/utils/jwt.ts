import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';

/**
 * Generate JWT token for user authentication
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT secret not configured', 500);
  
  const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
  // @ts-ignore - JWT types are conflicting
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: expiresIn }
  );
};

/**
 * Generate JWT token for user authentication (legacy signature for backward compatibility)
 */
export const generateTokenLegacy = (userId: string, email: string, role: string): string => {
  return generateToken({ id: userId, email, role });
};
