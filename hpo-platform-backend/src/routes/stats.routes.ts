import { Router } from 'express';
import prisma from '../config/database';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/stats/overview - Global stats
router.get('/overview', async (req, res, next) => {
  try {
    const [
      totalTerms,
      translatedTerms,
      totalUsers,
      totalTranslations,
      approvedTranslations
    ] = await Promise.all([
      prisma.hpoTerm.count(),
      prisma.hpoTerm.count({
        where: { translationStatus: { not: 'NOT_TRANSLATED' } }
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.translation.count(),
      prisma.translation.count({ where: { status: 'APPROVED' } })
    ]);
    
    res.json({
      totalTerms,
      translatedTerms,
      translationProgress: (translatedTerms / totalTerms) * 100,
      totalUsers,
      totalTranslations,
      approvedTranslations,
      approvalRate: (approvedTranslations / totalTranslations) * 100
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const topUsers = await prisma.user.findMany({
      take: 100,
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        specialty: true,
        points: true,
        level: true,
        _count: {
          select: {
            translations: true,
            validations: true
          }
        }
      }
    });
    
    res.json({ leaderboard: topUsers });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/my-stats - User's personal stats
router.get('/my-stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            translations: true,
            validations: true,
            badges: true
          }
        }
      }
    });
    
    const approvedTranslations = await prisma.translation.count({
      where: {
        userId: req.user.id,
        status: 'APPROVED'
      }
    });
    
    res.json({
      points: user?.points,
      level: user?.level,
      streak: user?.streak,
      totalTranslations: user?._count.translations,
      approvedTranslations,
      totalValidations: user?._count.validations,
      totalBadges: user?._count.badges,
      approvalRate: user?._count.translations 
        ? (approvedTranslations / user._count.translations) * 100 
        : 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
