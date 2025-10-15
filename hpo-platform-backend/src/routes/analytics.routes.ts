import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';
import * as fs from 'fs';
import * as path from 'path';
import { notifySyncCompleted } from '../utils/websocket-notifier';

const router = Router();

// GET /api/analytics - Advanced analytics dashboard
router.get('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Translation velocity (translations per day)
    const translationsOverTime = await prisma.translation.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Quality trends (average confidence over time)
    const qualityTrends = await prisma.translation.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _avg: {
        confidence: true
      }
    });

    // User retention (active users per day)
    const userActivities = await prisma.userActivity.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        userId: true
      }
    });

    // Translation status distribution
    const statusDistribution = await prisma.translation.groupBy({
      by: ['status'],
      _count: true
    });

    // Top contributors (last period)
    const topContributors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        approvedCount: true,
        _count: {
          select: {
            translations: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        points: 'desc'
      },
      take: 10
    });

    // Categories breakdown
    const categoriesBreakdown = await prisma.hpoTerm.groupBy({
      by: ['category'],
      where: {
        translationStatus: 'APPROVED'
      },
      _count: true
    });

    // Validation stats
    const validationStats = await prisma.validation.groupBy({
      by: ['approved'],
      _count: true
    });

    // Average time to approval
    const approvedTranslationsForAvg = await prisma.translation.findMany({
      where: {
        status: 'APPROVED',
        approvedAt: { not: null }
      },
      select: {
        createdAt: true,
        approvedAt: true
      },
      take: 100
    });

    const avgTimeToApproval = approvedTranslationsForAvg.length > 0
      ? approvedTranslationsForAvg.reduce((sum, t) => {
          const diff = t.approvedAt!.getTime() - t.createdAt.getTime();
          return sum + diff;
        }, 0) / approvedTranslationsForAvg.length / (1000 * 60 * 60 * 24) // days
      : 0;

    // Overall stats
    const [totalTerms, translatedTerms, pendingTranslations, approvedTranslations, totalUsers, activeUsers] = await Promise.all([
      prisma.hpoTerm.count(),
      prisma.hpoTerm.count({ where: { translationStatus: 'APPROVED' } }),
      prisma.translation.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.translation.count({ where: { status: 'APPROVED' } }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: { gte: startDate }
        }
      })
    ]);

    const progress = totalTerms > 0 ? (translatedTerms / totalTerms) * 100 : 0;

    res.json({
      period: days,
      overview: {
        totalTerms,
        translatedTerms,
        pendingTranslations,
        approvedTranslations,
        totalUsers,
        activeUsers,
        progress: Math.round(progress * 100) / 100,
        avgTimeToApproval: Math.round(avgTimeToApproval * 100) / 100
      },
      velocity: {
        translationsPerDay: translationsOverTime.map(t => ({
          date: t.createdAt.toISOString().split('T')[0],
          count: t._count
        }))
      },
      quality: {
        confidenceTrends: qualityTrends.map(q => ({
          date: q.createdAt.toISOString().split('T')[0],
          avgConfidence: q._avg.confidence
        }))
      },
      retention: {
        activeUsersPerDay: userActivities.map(a => ({
          date: a.createdAt.toISOString().split('T')[0],
          count: a._count.userId
        }))
      },
      statusDistribution: statusDistribution.map(s => ({
        status: s.status,
        count: s._count
      })),
      topContributors: topContributors.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
        level: u.level,
        approvedCount: u.approvedCount,
        recentTranslations: u._count.translations
      })),
      categoriesBreakdown: categoriesBreakdown.map(c => ({
        category: c.category,
        count: c._count
      })),
      validationStats: validationStats.map(v => ({
        approved: v.approved,
        count: v._count
      }))
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/sync - Trigger HPO sync
router.post('/sync', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Get all approved translations not yet synced
    const readyTranslations = await prisma.translation.findMany({
      where: {
        status: 'APPROVED',
        syncedToHpo: false
      },
      include: {
        term: true,
        user: {
          select: {
            email: true,
            orcidId: true
          }
        }
      },
      orderBy: {
        approvedAt: 'asc'
      }
    });

    if (readyTranslations.length === 0) {
      throw new AppError('No translations ready for sync', 400);
    }

    // Generate Babelon TSV format
    const babelonLines = [
      'subject_id\tsubject_label\tpredicate_id\tobject_id\tobject_label\ttranslator\ttranslation_provider\tsource\ttranslation_status\ttranslation_type'
    ];

    for (const translation of readyTranslations) {
      const translator = translation.user.orcidId || translation.user.email;
      const line = [
        translation.term.hpoId,
        translation.term.label,
        'rdfs:label',
        '',
        translation.labelPt,
        translator,
        'HPO-PT Platform',
        `https://hpo-pt.platform/translations/${translation.id}`,
        'OFFICIAL',
        'translation'
      ].join('\t');
      babelonLines.push(line);

      // Add synonyms if exist
      if (translation.synonymsPt && translation.synonymsPt.length > 0) {
        for (const synonym of translation.synonymsPt) {
          const synLine = [
            translation.term.hpoId,
            translation.term.label,
            'oboInOwl:hasExactSynonym',
            '',
            synonym,
            translator,
            'HPO-PT Platform',
            `https://hpo-pt.platform/translations/${translation.id}`,
            'OFFICIAL',
            'synonym'
          ].join('\t');
          babelonLines.push(synLine);
        }
      }
    }

    const babelonContent = babelonLines.join('\n');

    // Save file
    const syncDate = new Date().toISOString().split('T')[0];
    const filename = `hp-pt.babelon.${syncDate}.tsv`;
    const dirPath = path.join(process.cwd(), 'exports', 'sync');
    const filePath = path.join(dirPath, filename);

    // Create directory if doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, babelonContent, 'utf-8');

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        syncDate: new Date(),
        adminId: req.user.id,
        translationsCount: readyTranslations.length,
        babelonFilePath: filePath,
        status: 'COMPLETED',
        metadata: {
          filename,
          translationIds: readyTranslations.map(t => t.id),
          categories: [...new Set(readyTranslations.map(t => t.term.category))]
        }
      }
    });

    // Mark translations as synced
    await prisma.translation.updateMany({
      where: {
        id: { in: readyTranslations.map(t => t.id) }
      },
      data: {
        syncedToHpo: true,
        syncedAt: new Date()
      }
    });

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'SYNC_TO_HPO',
        targetType: 'SYNC',
        targetId: syncLog.id,
        changes: {
          translationsCount: readyTranslations.length,
          filename,
          filePath
        }
      }
    });

    // Notify all translators whose work was synced
    const uniqueUserIds = [...new Set(readyTranslations.map(t => t.userId))];
    await prisma.notification.createMany({
      data: uniqueUserIds.map(userId => ({
        userId,
        type: 'SYNC_COMPLETED',
        title: '🎉 Suas Traduções Foram Sincronizadas!',
        message: `Suas traduções foram incluídas no sync oficial do HPO! Parabéns pela contribuição.`,
        link: `/history`,
        read: false
      }))
    });

    // Send real-time WebSocket notification to translators
    notifySyncCompleted(uniqueUserIds, {
      id: syncLog.id,
      translationsCount: readyTranslations.length,
      filename,
      downloadUrl: `/api/analytics/sync/${syncLog.id}/download`
    });

    res.json({
      message: 'Sync completed successfully',
      syncLog: {
        id: syncLog.id,
        translationsCount: readyTranslations.length,
        filename,
        filePath,
        downloadUrl: `/api/analytics/sync/${syncLog.id}/download`
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/sync/history - Get sync history
router.get('/sync/history', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [syncLogs, total] = await Promise.all([
      prisma.syncLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          syncDate: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.syncLog.count()
    ]);

    res.json({
      syncLogs,
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

// GET /api/analytics/sync/:id/download - Download sync file
router.get('/sync/:id/download', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const syncLog = await prisma.syncLog.findUnique({
      where: { id: req.params.id }
    });

    if (!syncLog) {
      throw new AppError('Sync log not found', 404);
    }

    if (!syncLog.babelonFilePath || !fs.existsSync(syncLog.babelonFilePath)) {
      throw new AppError('File not found', 404);
    }

    const filename = path.basename(syncLog.babelonFilePath);
    
    res.download(syncLog.babelonFilePath, filename, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/ready-for-sync - Count translations ready for sync
router.get('/ready-for-sync', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const count = await prisma.translation.count({
      where: {
        status: 'APPROVED',
        syncedToHpo: false
      }
    });

    res.json({ readyForSync: count });
  } catch (error) {
    next(error);
  }
});

export default router;
