import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // DEBUG: Log authentication attempt
    console.log('🔐 [AUTH DEBUG] Authentication attempt:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20)
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH DEBUG] No token provided');
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    // DEBUG: Log JWT_SECRET info (NOT the actual secret!)
    console.log('🔑 [AUTH DEBUG] JWT Config:', {
      secretExists: !!secret,
      secretLength: secret?.length,
      secretPrefix: secret?.substring(0, 10) + '...',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });

    if (!secret) {
      console.log('❌ [AUTH DEBUG] JWT secret not configured');
      throw new AppError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: UserRole;
    };
    
    console.log('✅ [AUTH DEBUG] Token verified successfully:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    });

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBanned: true,
        bannedReason: true
      }
    });

    if (!user) {
      console.log('❌ [AUTH DEBUG] User not found in database:', decoded.id);
      throw new AppError('User not found', 401);
    }

    if (user.isBanned) {
      console.log('⛔ [AUTH DEBUG] User is banned:', user.email);
      throw new AppError(
        `Account suspended. Reason: ${user.bannedReason || 'Violation of terms'}`,
        403
      );
    }
    
    console.log('✅ [AUTH DEBUG] Authentication successful:', user.email);

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [AUTH DEBUG] Invalid token:', error.message);
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ [AUTH DEBUG] Token expired:', error.message);
      return next(new AppError('Token expired', 401));
    }
    console.log('❌ [AUTH DEBUG] Unexpected error:', error);
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};
