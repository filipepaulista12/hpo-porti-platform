import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

// User roles enum
export enum UserRole {
  TRANSLATOR = 'TRANSLATOR',
  REVIEWER = 'REVIEWER',
  VALIDATOR = 'VALIDATOR',
  MODERATOR = 'MODERATOR',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  TRANSLATOR: 1,
  REVIEWER: 2,
  VALIDATOR: 3,
  MODERATOR: 4,
  COMMITTEE_MEMBER: 5,
  ADMIN: 6,
  SUPER_ADMIN: 7
};

// Check if user has minimum required role
export function requireRole(minimumRole: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role as UserRole];
    const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new AppError(
        `Access denied. Required role: ${minimumRole}, your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}

// Check if user has specific role (exact match)
export function requireExactRole(requiredRole: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== requiredRole) {
      throw new AppError(
        `Access denied. Required role: ${requiredRole}`,
        403
      );
    }

    next();
  };
}

// Check if user has any of the specified roles
export function requireAnyRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError(
        `Access denied. Allowed roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
}

// Verify if user is admin (ADMIN or SUPER_ADMIN)
export function isAdmin(req: AuthRequest): boolean {
  if (!req.user) return false;
  return ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
}

// Verify if user is super admin
export function isSuperAdmin(req: AuthRequest): boolean {
  if (!req.user) return false;
  return req.user.role === 'SUPER_ADMIN';
}

// Verify if user is committee member or higher
export function isCommitteeMember(req: AuthRequest): boolean {
  if (!req.user) return false;
  const roleLevel = ROLE_HIERARCHY[req.user.role as UserRole];
  return roleLevel >= ROLE_HIERARCHY.COMMITTEE_MEMBER;
}

// Verify if user is moderator or higher
export function isModerator(req: AuthRequest): boolean {
  if (!req.user) return false;
  const roleLevel = ROLE_HIERARCHY[req.user.role as UserRole];
  return roleLevel >= ROLE_HIERARCHY.MODERATOR;
}

// Check permissions for specific actions
export function canApproveTranslation(req: AuthRequest): boolean {
  return isAdmin(req) || isCommitteeMember(req);
}

export function canRejectTranslation(req: AuthRequest): boolean {
  return isAdmin(req) || isModerator(req);
}

export function canManageUsers(req: AuthRequest): boolean {
  return isAdmin(req);
}

export function canVoteOnConflict(req: AuthRequest): boolean {
  return isCommitteeMember(req);
}

export function canSyncToHPO(req: AuthRequest): boolean {
  return isAdmin(req);
}

export function canAccessAdminDashboard(req: AuthRequest): boolean {
  return isModerator(req);
}

// Export all at once
export const permissions = {
  requireRole,
  requireExactRole,
  requireAnyRole,
  isAdmin,
  isSuperAdmin,
  isCommitteeMember,
  isModerator,
  canApproveTranslation,
  canRejectTranslation,
  canManageUsers,
  canVoteOnConflict,
  canSyncToHPO,
  canAccessAdminDashboard
};
