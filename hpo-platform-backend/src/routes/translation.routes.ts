import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// Validation schema
const translationSchema = z.object({
  termId: z.string().uuid(),
  labelPt: z.string().min(1),
  definitionPt: z.string().optional(),
  synonymsPt: z.array(z.string()).optional(),
  confidence: z.number().min(1).max(5),
  comments: z.string().optional()
});

// POST /api/translations - Create new translation
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const data = translationSchema.parse(req.body);
    
    // Check if term exists
    const term = await prisma.hpoTerm.findUnique({
      where: { id: data.termId }
    });
    
    if (!term) {
      throw new AppError('Term not found', 404);
    }
    
    // Create translation
    const translation = await prisma.translation.create({
      data: {
        termId: data.termId,
        userId: req.user.id,
        labelPt: data.labelPt,
        definitionPt: data.definitionPt,
        synonymsPt: data.synonymsPt || [],
        confidence: data.confidence,
        status: 'PENDING_REVIEW',
        source: 'MANUAL'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });
    
    // Update term status
    await prisma.hpoTerm.update({
      where: { id: data.termId },
      data: { translationStatus: 'PENDING_REVIEW' }
    });
    
    // Add activity and points
    const pointsEarned = term.difficulty * 10;
    
    await Promise.all([
      prisma.userActivity.create({
        data: {
          userId: req.user.id,
          type: 'TRANSLATION_CREATED',
          points: pointsEarned,
          metadata: {
            translationId: translation.id,
            termId: data.termId,
            hpoId: term.hpoId
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
      message: 'Translation created successfully',
      translation,
      pointsEarned
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/translations/:id - Get translation details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id },
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
        validations: {
          include: {
            validator: {
              select: {
                id: true,
                name: true,
                specialty: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    res.json({ translation });
  } catch (error) {
    next(error);
  }
});

// PUT /api/translations/:id - Update translation
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    // Only owner can update (unless admin)
    if (translation.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to update this translation', 403);
    }
    
    const data = translationSchema.partial().parse(req.body);
    
    const updatedTranslation = await prisma.translation.update({
      where: { id: req.params.id },
      data: {
        labelPt: data.labelPt,
        definitionPt: data.definitionPt,
        synonymsPt: data.synonymsPt,
        confidence: data.confidence
      }
    });
    
    res.json({
      message: 'Translation updated successfully',
      translation: updatedTranslation
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/translations/:id - Delete translation
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    // Only owner or admin can delete
    if (translation.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to delete this translation', 403);
    }
    
    await prisma.translation.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/translations/my-history - Get user's translation history
router.get('/my-history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Query params for filtering
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: req.user.id
    };

    if (status && ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(status)) {
      where.status = status;
    }

    // Get translations with pagination
    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        include: {
          term: {
            select: {
              hpoId: true,
              labelEn: true,
              definitionEn: true,
              category: true
            }
          },
          validations: {
            select: {
              id: true,
              decision: true,
              rating: true,
              comments: true,
              createdAt: true,
              validator: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.translation.count({ where })
    ]);

    // Get user stats
    const [totalTranslations, approvedCount, pendingCount, rejectedCount, needsRevisionCount] = await Promise.all([
      prisma.translation.count({ where: { userId: req.user.id } }),
      prisma.translation.count({ where: { userId: req.user.id, status: 'APPROVED' } }),
      prisma.translation.count({ where: { userId: req.user.id, status: 'PENDING_REVIEW' } }),
      prisma.translation.count({ where: { userId: req.user.id, status: 'REJECTED' } }),
      prisma.translation.count({ where: { userId: req.user.id, status: 'NEEDS_REVISION' } })
    ]);

    const stats = {
      total: totalTranslations,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      needsRevision: needsRevisionCount,
      approvalRate: totalTranslations > 0 ? Math.round((approvedCount / totalTranslations) * 100) : 0
    };

    res.json({
      success: true,
      translations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
