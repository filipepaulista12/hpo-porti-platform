import { Router } from 'express';
import prisma from '../config/database';
import { AuthRequest, authenticate } from '../middleware/auth';
import { getPromotionProgress } from '../services/promotion.service';

const router = Router();

// GET /api/users/profile/:id
router.get('/profile/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        institution: true,
        specialty: true,
        country: true,
        bio: true,
        avatarUrl: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            translations: true,
            validations: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/promotion-progress - Get user's promotion progress
router.get('/promotion-progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const progress = await getPromotionProgress(req.user.id);

    if (!progress) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
});

export default router;
