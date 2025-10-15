/**
 * Promotion Service
 * Handles automatic user role promotions based on performance metrics
 */

import prisma from '../config/database';
import { PrismaClient, UserRole } from '@prisma/client';

// Promotion thresholds
const PROMOTION_THRESHOLDS = {
  REVIEWER: {
    minApprovedTranslations: 50,
    minApprovalRate: 85, // 85%
    minLevel: 3,
    requiredRole: 'TRANSLATOR' as UserRole
  },
  COMMITTEE_MEMBER: {
    minApprovedTranslations: 200,
    minApprovalRate: 90, // 90%
    minLevel: 8,
    minValidations: 100,
    requiredRole: 'REVIEWER' as UserRole
  }
};

/**
 * Check if user is eligible for REVIEWER promotion
 */
export async function checkReviewerPromotion(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        level: true,
        _count: {
          select: {
            translations: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!user) return false;

    // Only promote TRANSLATOR to REVIEWER
    if (user.role !== 'TRANSLATOR') return false;

    const threshold = PROMOTION_THRESHOLDS.REVIEWER;

    // Check level requirement
    if (user.level < threshold.minLevel) return false;

    // Count approved translations
    const approvedCount = user._count.translations;
    
    if (approvedCount < threshold.minApprovedTranslations) return false;

    // Calculate approval rate
    const totalTranslations = await prisma.translation.count({
      where: { userId: user.id }
    });

    const approvalRate = (approvedCount / totalTranslations) * 100;

    if (approvalRate < threshold.minApprovalRate) return false;

    // All criteria met - promote user
    await promoteToReviewer(userId);

    return true;
  } catch (error) {
    console.error('Error checking REVIEWER promotion:', error);
    return false;
  }
}

/**
 * Promote user to REVIEWER role
 */
async function promoteToReviewer(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  if (!user) return;

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'REVIEWER',
      promotedAt: new Date()
    }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'ROLE_PROMOTION',
      title: '🎊 Promoção para REVIEWER!',
      message: `Parabéns! Você foi promovido a REVIEWER por suas excelentes traduções. Agora você pode revisar traduções de outros usuários.`,
      link: '/profile'
    }
  });

  // Create activity log
  await prisma.userActivity.create({
    data: {
      userId,
      type: 'ROLE_PROMOTION',
      points: 500, // Bonus points for promotion
      metadata: {
        fromRole: 'TRANSLATOR',
        toRole: 'REVIEWER',
        reason: 'auto_promotion',
        criteria: {
          approvedTranslations: await prisma.translation.count({
            where: { userId, status: 'APPROVED' }
          }),
          approvalRate: await calculateApprovalRate(userId)
        }
      }
    }
  });

  // Award bonus points
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: 500 }
    }
  });

  console.log(`✅ User ${user.email} promoted to REVIEWER`);
}

/**
 * Check if user is eligible for COMMITTEE_MEMBER promotion
 */
export async function checkCommitteeMemberPromotion(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        level: true,
        _count: {
          select: {
            translations: {
              where: { status: 'APPROVED' }
            },
            validations: true
          }
        }
      }
    });

    if (!user) return false;

    // Only promote REVIEWER to COMMITTEE_MEMBER
    if (user.role !== 'REVIEWER') return false;

    const threshold = PROMOTION_THRESHOLDS.COMMITTEE_MEMBER;

    // Check all requirements
    if (user.level < threshold.minLevel) return false;

    const approvedCount = user._count.translations;
    if (approvedCount < threshold.minApprovedTranslations) return false;

    const validationCount = user._count.validations;
    if (validationCount < threshold.minValidations) return false;

    // Calculate approval rate
    const totalTranslations = await prisma.translation.count({
      where: { userId: user.id }
    });

    const approvalRate = (approvedCount / totalTranslations) * 100;
    if (approvalRate < threshold.minApprovalRate) return false;

    // All criteria met - promote user
    await promoteToCommitteeMember(userId);

    return true;
  } catch (error) {
    console.error('Error checking COMMITTEE_MEMBER promotion:', error);
    return false;
  }
}

/**
 * Promote user to COMMITTEE_MEMBER role
 */
async function promoteToCommitteeMember(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  if (!user) return;

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'COMMITTEE_MEMBER',
      promotedAt: new Date()
    }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'ROLE_PROMOTION',
      title: '🏆 Promoção para COMMITTEE MEMBER!',
      message: `Excelente trabalho! Você foi promovido a COMMITTEE MEMBER. Você agora faz parte do comitê de tradução oficial do HPO.`,
      link: '/profile'
    }
  });

  // Create activity log
  await prisma.userActivity.create({
    data: {
      userId,
      type: 'ROLE_PROMOTION',
      points: 1000, // Higher bonus for committee member
      metadata: {
        fromRole: 'REVIEWER',
        toRole: 'COMMITTEE_MEMBER',
        reason: 'auto_promotion',
        criteria: {
          approvedTranslations: await prisma.translation.count({
            where: { userId, status: 'APPROVED' }
          }),
          validations: await prisma.validation.count({
            where: { validatorId: userId }
          }),
          approvalRate: await calculateApprovalRate(userId)
        }
      }
    }
  });

  // Award bonus points
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: 1000 }
    }
  });

  console.log(`✅ User ${user.email} promoted to COMMITTEE_MEMBER`);
}

/**
 * Calculate user's approval rate
 */
async function calculateApprovalRate(userId: string): Promise<number> {
  const [approved, total] = await Promise.all([
    prisma.translation.count({
      where: { userId, status: 'APPROVED' }
    }),
    prisma.translation.count({
      where: { userId }
    })
  ]);

  return total > 0 ? Math.round((approved / total) * 100) : 0;
}

/**
 * Check all promotions for a user (triggered after translation approval)
 */
export async function checkUserPromotions(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) return;

    // Check promotions based on current role
    if (user.role === 'TRANSLATOR') {
      await checkReviewerPromotion(userId);
    } else if (user.role === 'REVIEWER') {
      await checkCommitteeMemberPromotion(userId);
    }
  } catch (error) {
    console.error('Error checking user promotions:', error);
  }
}

/**
 * Get promotion progress for a user
 */
export async function getPromotionProgress(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        level: true,
        _count: {
          select: {
            translations: {
              where: { status: 'APPROVED' }
            },
            validations: true
          }
        }
      }
    });

    if (!user) return null;

    const totalTranslations = await prisma.translation.count({
      where: { userId }
    });

    const approvedCount = user._count.translations;
    const approvalRate = totalTranslations > 0 
      ? Math.round((approvedCount / totalTranslations) * 100) 
      : 0;

    // Get target thresholds based on current role
    let nextRole: UserRole | null = null;
    let threshold: any = null;

    if (user.role === 'TRANSLATOR') {
      nextRole = 'REVIEWER';
      threshold = PROMOTION_THRESHOLDS.REVIEWER;
    } else if (user.role === 'REVIEWER') {
      nextRole = 'COMMITTEE_MEMBER';
      threshold = PROMOTION_THRESHOLDS.COMMITTEE_MEMBER;
    }

    if (!threshold) {
      return {
        currentRole: user.role,
        canBePromoted: false,
        message: 'You have reached the maximum role level'
      };
    }

    // Calculate progress percentages
    const progress = {
      translations: {
        current: approvedCount,
        required: threshold.minApprovedTranslations,
        percentage: Math.min(100, Math.round((approvedCount / threshold.minApprovedTranslations) * 100))
      },
      approvalRate: {
        current: approvalRate,
        required: threshold.minApprovalRate,
        percentage: Math.min(100, Math.round((approvalRate / threshold.minApprovalRate) * 100))
      },
      level: {
        current: user.level,
        required: threshold.minLevel,
        percentage: Math.min(100, Math.round((user.level / threshold.minLevel) * 100))
      }
    };

    // Add validations for COMMITTEE_MEMBER
    if (nextRole === 'COMMITTEE_MEMBER') {
      (progress as any).validations = {
        current: user._count.validations,
        required: threshold.minValidations,
        percentage: Math.min(100, Math.round((user._count.validations / threshold.minValidations) * 100))
      };
    }

    // Check if eligible
    const isEligible = 
      approvedCount >= threshold.minApprovedTranslations &&
      approvalRate >= threshold.minApprovalRate &&
      user.level >= threshold.minLevel &&
      (nextRole !== 'COMMITTEE_MEMBER' || user._count.validations >= threshold.minValidations);

    return {
      currentRole: user.role,
      nextRole,
      progress,
      isEligible,
      canBePromoted: isEligible
    };
  } catch (error) {
    console.error('Error getting promotion progress:', error);
    return null;
  }
}

export default {
  checkReviewerPromotion,
  checkCommitteeMemberPromotion,
  checkUserPromotions,
  getPromotionProgress,
  PROMOTION_THRESHOLDS
};
