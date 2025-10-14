import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';

const router = Router();

// Validation schema
const validationSchema = z.object({
  translationId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  decision: z.enum(['APPROVED', 'NEEDS_REVISION', 'REJECTED']),
  comments: z.string().optional(),
  suggestions: z.string().optional(),
  accuracyScore: z.number().min(1).max(5).optional(),
  clarityScore: z.number().min(1).max(5).optional(),
  consistencyScore: z.number().min(1).max(5).optional()
});

// POST /api/validations - Create validation
router.post('/', authenticate, authorize('REVIEWER', 'VALIDATOR', 'ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const data = validationSchema.parse(req.body);
    
    // Check if translation exists
    const translation = await prisma.translation.findUnique({
      where: { id: data.translationId },
      include: { term: true }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    // Can't validate own translation
    if (translation.userId === req.user.id) {
      throw new AppError('Cannot validate your own translation', 400);
    }
    
    // Check if already validated
    const existingValidation = await prisma.validation.findUnique({
      where: {
        translationId_validatorId: {
          translationId: data.translationId,
          validatorId: req.user.id
        }
      }
    });
    
    if (existingValidation) {
      throw new AppError('You have already validated this translation', 400);
    }
    
    // Create validation
    const validation = await prisma.validation.create({
      data: {
        translationId: data.translationId,
        validatorId: req.user.id,
        rating: data.rating,
        decision: data.decision,
        comments: data.comments,
        suggestions: data.suggestions,
        accuracyScore: data.accuracyScore,
        clarityScore: data.clarityScore,
        consistencyScore: data.consistencyScore
      }
    });
    
    // Update translation counts
    if (data.decision === 'APPROVED') {
      await prisma.translation.update({
        where: { id: data.translationId },
        data: { approvalCount: { increment: 1 } }
      });
    } else if (data.decision === 'REJECTED') {
      await prisma.translation.update({
        where: { id: data.translationId },
        data: { rejectionCount: { increment: 1 } }
      });
    }
    
    // Check if translation reached consensus (3+ validations)
    const validationCount = await prisma.validation.count({
      where: { translationId: data.translationId }
    });
    
    if (validationCount >= 3) {
      const approvals = await prisma.validation.count({
        where: {
          translationId: data.translationId,
          decision: 'APPROVED'
        }
      });
      
      // If 70%+ approved, mark as pending validation by expert
      if (approvals / validationCount >= 0.7) {
        await prisma.translation.update({
          where: { id: data.translationId },
          data: { status: 'PENDING_VALIDATION' }
        });
      }
    }
    
    // Give points to validator
    const pointsEarned = 5;
    await Promise.all([
      prisma.userActivity.create({
        data: {
          userId: req.user.id,
          type: 'VALIDATION_COMPLETED',
          points: pointsEarned,
          metadata: {
            validationId: validation.id,
            translationId: data.translationId
          }
        }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          points: { increment: pointsEarned },
          lastActiveAt: new Date()
        }
      })
    ]);
    
    res.status(201).json({
      message: 'Validation submitted successfully',
      validation,
      pointsEarned
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/validations/pending - Get translations pending validation
router.get('/pending', authenticate, authorize('REVIEWER', 'VALIDATOR', 'ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const translations = await prisma.translation.findMany({
      where: {
        status: { in: ['PENDING_REVIEW', 'LEGACY_PENDING'] },
        userId: { not: req.user.id }, // Exclude own translations
        validations: {
          none: { validatorId: req.user.id } // Not already validated by this user
        }
      },
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        term: true,
        user: {
          select: {
            id: true,
            name: true,
            specialty: true,
            level: true
          }
        },
        _count: {
          select: { validations: true }
        }
      }
    });
    
    res.json({ translations });
  } catch (error) {
    next(error);
  }
});

export default router;
