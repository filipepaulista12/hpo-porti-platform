import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require at least MODERATOR role
router.use(authenticate);
router.use(requireRole('MODERATOR' as any));

// ============================================
// DASHBOARD & STATS
// ============================================

// GET /api/admin/dashboard - Admin dashboard overview
router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    // Pending translations count
    const pendingCount = await prisma.translation.count({
      where: { status: 'PENDING_REVIEW' }
    });

    // Conflicts pending resolution
    const conflictsCount = await prisma.conflictReview.count({
      where: { status: { in: ['PENDING_COMMITTEE', 'IN_VOTING'] } }
    });

    // Low quality translations (confidence < 3 or rejectionCount > 0)
    const lowQualityCount = await prisma.translation.count({
      where: {
        OR: [
          { confidence: { lt: 3 } },
          { rejectionCount: { gt: 0 } }
        ],
        status: 'PENDING_REVIEW'
      }
    });

    // Recent admin actions (last 24h)
    const recentActions = await prisma.adminAuditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Urgent items
    const urgentItems = [];

    // Check for high priority conflicts
    const highPriorityConflicts = await prisma.conflictReview.findMany({
      where: {
        priority: 'HIGH',
        status: { in: ['PENDING_COMMITTEE', 'IN_VOTING'] }
      },
      include: {
        hpoTerm: true,
        translations: { include: { user: true } }
      },
      take: 5
    });

    urgentItems.push(...highPriorityConflicts.map(conflict => ({
      type: 'CONFLICT',
      priority: 'HIGH',
      message: `Termo ${conflict.hpoTerm.hpoId} tem ${conflict.translations.length} traduções conflitantes`,
      link: `/admin/conflicts/${conflict.id}`,
      data: conflict
    })));

    // Check for users with warnings
    const suspendedUsers = await prisma.user.count({
      where: { isActive: false }
    });

    if (suspendedUsers > 0) {
      urgentItems.push({
        type: 'USER_MANAGEMENT',
        priority: 'MEDIUM',
        message: `${suspendedUsers} usuário(s) suspenso(s)`,
        link: '/admin/users?status=suspended'
      });
    }

    // Check for pending sync
    const approvedForSync = await prisma.translation.count({
      where: {
        status: 'APPROVED',
        // Add field to track if synced: syncedToHpo: false
      }
    });

    // Recent activity stats (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentStats = {
      translationsCreated: await prisma.translation.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      translationsApproved: await prisma.translation.count({
        where: { 
          status: 'APPROVED',
          approvedAt: { gte: sevenDaysAgo }
        }
      }),
      validationsCompleted: await prisma.validation.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      newUsers: await prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      })
    };

    res.json({
      summary: {
        pendingTranslations: pendingCount,
        conflictsPending: conflictsCount,
        lowQualityItems: lowQualityCount,
        recentActions24h: recentActions,
        suspendedUsers,
        approvedForSync
      },
      urgentItems,
      recentStats
    });

  } catch (error) {
    next(error);
  }
});

// ============================================
// MODERATION QUEUE
// ============================================

// GET /api/admin/translations/pending - Get translations pending review
router.get('/translations/pending', async (req: AuthRequest, res, next) => {
  try {
    const { 
      page = '1', 
      limit = '20',
      priority,
      minConfidence,
      maxConfidence,
      category
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'PENDING_REVIEW'
    };

    if (minConfidence) {
      where.confidence = { ...where.confidence, gte: parseInt(minConfidence as string) };
    }

    if (maxConfidence) {
      where.confidence = { ...where.confidence, lte: parseInt(maxConfidence as string) };
    }

    if (category) {
      where.term = { category };
    }

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        include: {
          term: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              points: true,
              level: true
            }
          },
          validations: {
            include: {
              validator: {
                select: {
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: [
          { confidence: 'desc' }, // Higher confidence first
          { createdAt: 'asc' }    // Older first
        ]
      }),
      prisma.translation.count({ where })
    ]);

    res.json({
      translations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================
// APPROVAL & REJECTION
// ============================================

// POST /api/admin/translations/:id/approve - Approve translation
router.post('/translations/:id/approve', requireRole('ADMIN' as any), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      comment: z.string().optional(),
      syncToHpo: z.boolean().optional().default(true)
    });

    const { comment, syncToHpo } = schema.parse(req.body);

    // Get translation with relations
    const translation = await prisma.translation.findUnique({
      where: { id },
      include: {
        term: true,
        user: true
      }
    });

    if (!translation) {
      throw new AppError('Translation not found', 404);
    }

    if (translation.status === 'APPROVED') {
      throw new AppError('Translation already approved', 400);
    }

    // Update translation status
    const updated = await prisma.translation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvalCount: { increment: 1 }
      }
    });

    // Update HPO term status
    await prisma.hpoTerm.update({
      where: { id: translation.termId },
      data: {
        translationStatus: 'APPROVED'
      }
    });

    // Award points to translator
    await prisma.user.update({
      where: { id: translation.userId },
      data: {
        points: { increment: 100 }
      }
    });

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'APPROVE_TRANSLATION',
        targetType: 'Translation',
        targetId: id,
        reason: comment,
        changes: {
          before: { status: translation.status },
          after: { status: 'APPROVED' }
        }
      }
    });

    // Create notification for translator
    await prisma.notification.create({
      data: {
        userId: translation.userId,
        type: 'TRANSLATION_APPROVED',
        title: '🎉 Tradução Aprovada!',
        message: `Sua tradução de "${translation.term.labelEn}" foi aprovada! +100 pontos`,
        link: `/history`
      }
    });

    // Create activity log
    await prisma.userActivity.create({
      data: {
        userId: translation.userId,
        type: 'TRANSLATION_APPROVED',
        points: 100,
        metadata: {
          translationId: id,
          termId: translation.termId,
          approvedBy: req.user!.id
        }
      }
    });

    res.json({
      success: true,
      translation: updated,
      message: 'Translation approved successfully'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin/translations/:id/reject - Reject translation
router.post('/translations/:id/reject', requireRole('MODERATOR' as any), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      reasonCode: z.enum([
        'INCORRECT_TRANSLATION',
        'POOR_GRAMMAR',
        'NOT_MEDICAL_TERM',
        'DUPLICATE',
        'OFFENSIVE_CONTENT',
        'SPAM',
        'INCONSISTENT',
        'OTHER'
      ]),
      detailedReason: z.string().min(10, 'Detailed reason required (min 10 characters)'),
      suggestions: z.string().optional(),
      canResubmit: z.boolean().default(true)
    });

    const { reasonCode, detailedReason, suggestions, canResubmit } = schema.parse(req.body);

    // Get translation
    const translation = await prisma.translation.findUnique({
      where: { id },
      include: {
        term: true,
        user: true
      }
    });

    if (!translation) {
      throw new AppError('Translation not found', 404);
    }

    // Update translation status
    await prisma.translation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionCount: { increment: 1 }
      }
    });

    // Create rejection record
    await prisma.rejection.create({
      data: {
        translationId: id,
        rejectedBy: req.user!.id,
        reasonCode: reasonCode as any,
        detailedReason,
        suggestions,
        canResubmit
      }
    });

    // Impact on translator (if spam or offensive)
    if (['SPAM', 'OFFENSIVE_CONTENT'].includes(reasonCode)) {
      await prisma.user.update({
        where: { id: translation.userId },
        data: {
          points: { decrement: 10 }
        }
      });
    }

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'REJECT_TRANSLATION',
        targetType: 'Translation',
        targetId: id,
        reason: detailedReason,
        changes: {
          before: { status: translation.status },
          after: { status: 'REJECTED' },
          reasonCode,
          suggestions
        }
      }
    });

    // Create notification for translator
    await prisma.notification.create({
      data: {
        userId: translation.userId,
        type: 'TRANSLATION_REJECTED',
        title: '❌ Tradução Rejeitada',
        message: `Sua tradução de "${translation.term.labelEn}" precisa revisão.\nMotivo: ${detailedReason}`,
        link: `/history`
      }
    });

    res.json({
      success: true,
      message: 'Translation rejected successfully',
      rejection: {
        reasonCode,
        canResubmit
      }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================
// BULK OPERATIONS
// ============================================

// POST /api/admin/translations/bulk-approve - Bulk approve translations
router.post('/translations/bulk-approve', requireRole('ADMIN' as any), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      translationIds: z.array(z.string()).min(1).max(50), // Max 50 at once
      comment: z.string().optional()
    });

    const { translationIds, comment } = schema.parse(req.body);

    const results = {
      approved: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const id of translationIds) {
      try {
        const translation = await prisma.translation.findUnique({
          where: { id },
          include: { term: true, user: true }
        });

        if (!translation || translation.status === 'APPROVED') {
          results.failed++;
          results.errors.push(`${id}: Not found or already approved`);
          continue;
        }

        // Approve
        await prisma.translation.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvalCount: { increment: 1 }
          }
        });

        // Award points
        await prisma.user.update({
          where: { id: translation.userId },
          data: { points: { increment: 100 } }
        });

        // Notification
        await prisma.notification.create({
          data: {
            userId: translation.userId,
            type: 'TRANSLATION_APPROVED',
            title: '🎉 Tradução Aprovada!',
            message: `Sua tradução de "${translation.term.labelEn}" foi aprovada! +100 pontos`,
            link: `/history`
          }
        });

        results.approved++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${id}: ${error}`);
      }
    }

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'BULK_APPROVE',
        targetType: 'Translation',
        reason: comment,
        changes: {
          translationIds,
          results
        }
      }
    });

    res.json({
      success: true,
      results,
      message: `Bulk approval completed: ${results.approved} approved, ${results.failed} failed`
    });

  } catch (error) {
    next(error);
  }
});

export default router;
