import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/leaderboard
 * Get top users by points with rankings and statistics
 * Query params:
 *   - limit: number of users to return (default: 10, max: 100)
 *   - period: 'all' | 'month' | 'week' (default: 'all')
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const period = (req.query.period as string) || 'all';

    // Calculate date filter based on period
    let dateFilter = {};
    if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { gte: oneMonthAgo } };
    } else if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: oneWeekAgo } };
    }

    // Get top users with their stats
    const topUsers = await prisma.user.findMany({
      take: limit,
      orderBy: {
        points: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            translations: period === 'all' ? true : { where: dateFilter },
            validations: period === 'all' ? true : { where: dateFilter }
          }
        }
      }
    });

    // Calculate additional stats and format response
    const leaderboard = await Promise.all(
      topUsers.map(async (user, index) => {
        // Get approved translations count
        const approvedTranslations = await prisma.translation.count({
          where: {
            userId: user.id,
            status: 'APPROVED',
            ...(period !== 'all' ? dateFilter : {})
          }
        });

        // Calculate badges based on achievements
        const badges: string[] = [];
        if (user.points >= 1000) badges.push('🏆 Master Translator');
        if (user.points >= 500) badges.push('⭐ Expert');
        if (user.points >= 100) badges.push('🌟 Contributor');
        if (user._count.translations >= 100) badges.push('📚 Prolific');
        if (user._count.validations >= 50) badges.push('✅ Reliable Reviewer');
        if (approvedTranslations >= 50) badges.push('💎 Quality Expert');

        // Calculate level (every 100 points = 1 level)
        const level = Math.floor(user.points / 100) + 1;

        return {
          rank: index + 1,
          userId: user.id,
          id: user.id, // Alias for userId
          name: user.name,
          email: user.email,
          points: user.points,
          totalXp: user.points, // Alias for points
          level,
          role: user.role,
          stats: {
            totalTranslations: user._count.translations,
            totalValidations: user._count.validations,
            approvedTranslations,
            approvalRate: user._count.translations > 0 
              ? Math.round((approvedTranslations / user._count.translations) * 100) 
              : 0
          },
          badges,
          memberSince: user.createdAt
        };
      })
    );

    // Get current user's rank if not in top list
    const currentUserId = (req as any).user.id;
    const currentUserInTop = leaderboard.find(u => u.userId === currentUserId);
    
    let currentUserRank = null;
    if (!currentUserInTop) {
      const usersAbove = await prisma.user.count({
        where: {
          points: {
            gt: (req as any).user.points
          }
        }
      });
      
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          name: true,
          email: true,
          points: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              translations: period === 'all' ? true : { where: dateFilter },
              validations: period === 'all' ? true : { where: dateFilter }
            }
          }
        }
      });

      if (currentUser) {
        const approvedTranslations = await prisma.translation.count({
          where: {
            userId: currentUser.id,
            status: 'APPROVED',
            ...(period !== 'all' ? dateFilter : {})
          }
        });

        const badges: string[] = [];
        if (currentUser.points >= 1000) badges.push('🏆 Master Translator');
        if (currentUser.points >= 500) badges.push('⭐ Expert');
        if (currentUser.points >= 100) badges.push('🌟 Contributor');
        if (currentUser._count.translations >= 100) badges.push('📚 Prolific');
        if (currentUser._count.validations >= 50) badges.push('✅ Reliable Reviewer');
        if (approvedTranslations >= 50) badges.push('💎 Quality Expert');

        const level = Math.floor(currentUser.points / 100) + 1;

        currentUserRank = {
          rank: usersAbove + 1,
          userId: currentUser.id,
          id: currentUser.id, // Alias for userId
          name: currentUser.name,
          email: currentUser.email,
          points: currentUser.points,
          totalXp: currentUser.points, // Alias for points
          level,
          role: currentUser.role,
          stats: {
            totalTranslations: currentUser._count.translations,
            totalValidations: currentUser._count.validations,
            approvedTranslations,
            approvalRate: currentUser._count.translations > 0 
              ? Math.round((approvedTranslations / currentUser._count.translations) * 100) 
              : 0
          },
          badges,
          memberSince: currentUser.createdAt
        };
      }
    }

    res.json({
      success: true,
      users: leaderboard, // Alias for compatibility
      leaderboard,
      currentUser: currentUserInTop || currentUserRank,
      period,
      totalUsers: await prisma.user.count()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
