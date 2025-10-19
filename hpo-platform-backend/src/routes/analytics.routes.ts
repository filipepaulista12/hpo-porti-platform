import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { requireRole, UserRole } from '../middleware/permissions';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/dashboard
 * Dashboard geral de analytics para administradores
 * Requer: ADMIN role
 */
router.get('/dashboard', 
  authenticate, 
  requireRole(UserRole.ADMIN), 
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate 
        ? new Date(startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate 
        ? new Date(endDate as string) 
        : new Date();
      
      // 1. Active Users (últimas 24h)
      const activeUsers24h = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });
      
      // 2. Translations per day
      const translationsPerDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM translations
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
      
      // Converter BigInt para Number
      const translationsData = translationsPerDay.map(row => ({
        date: row.date,
        count: Number(row.count)
      }));
      
      // 3. Users by country (Top 10)
      const usersByCountry = await prisma.sessionLog.groupBy({
        by: ['country'],
        where: {
          sessionStart: {
            gte: start,
            lte: end
          },
          country: {
            not: null
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });
      
      // 4. Device distribution
      const deviceDistribution = await prisma.sessionLog.groupBy({
        by: ['device'],
        where: {
          sessionStart: {
            gte: start,
            lte: end
          },
          device: {
            not: null
          }
        },
        _count: {
          id: true
        }
      });
      
      // 5. Average session duration
      const avgSessionDuration = await prisma.sessionLog.aggregate({
        where: {
          sessionStart: {
            gte: start,
            lte: end
          },
          duration: { not: null }
        },
        _avg: {
          duration: true
        }
      });
      
      // 6. Top 10 translators
      const topTranslators = await prisma.user.findMany({
        where: {
          role: {
            in: ['TRANSLATOR', 'REVIEWER', 'VALIDATOR']
          }
        },
        orderBy: {
          points: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          points: true,
          level: true,
          email: true,
          _count: {
            select: {
              translations: true,
              validations: true
            }
          }
        }
      });
      
      // 7. Average API response time
      const avgResponseTime = await prisma.apiMetrics.aggregate({
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        },
        _avg: {
          responseTime: true
        }
      });
      
      // 8. User level distribution
      const levelDistribution = await prisma.user.groupBy({
        by: ['level'],
        _count: {
          id: true
        },
        orderBy: {
          level: 'asc'
        }
      });
      
      // 9. Retention rate (users who came back in last 7 days)
      const totalUsers = await prisma.user.count();
      const oldUsers = await prisma.user.count({
        where: {
          createdAt: {
            lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });
      const returningUsers = await prisma.user.count({
        where: {
          AND: [
            {
              createdAt: {
                lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            {
              lastLoginAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          ]
        }
      });
      
      const retentionRate = oldUsers > 0 ? (returningUsers / oldUsers) * 100 : 0;
      
      // 10. Browser distribution
      const browserDistribution = await prisma.sessionLog.groupBy({
        by: ['browser'],
        where: {
          sessionStart: {
            gte: start,
            lte: end
          },
          browser: {
            not: null
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      });
      
      // 11. Total translations by status
      const translationsByStatus = await prisma.translation.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });
      
      res.json({
        success: true,
        data: {
          // KPIs
          activeUsers24h,
          totalUsers,
          returningUsers,
          retentionRate: retentionRate.toFixed(2),
          avgSessionDuration: avgSessionDuration._avg.duration,
          avgResponseTime: avgResponseTime._avg.responseTime,
          
          // Charts data
          translationsPerDay: translationsData,
          usersByCountry,
          deviceDistribution,
          browserDistribution,
          levelDistribution,
          translationsByStatus,
          topTranslators,
          
          // Date range
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/analytics/heatmap
 * Heatmap de atividade por hora e dia da semana
 * Requer: ADMIN role
 */
router.get('/heatmap',
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const daysAgo = parseInt(days as string);
      
      const heatmapData = await prisma.$queryRaw<Array<{
        day_of_week: number;
        hour: number;
        activity_count: bigint;
      }>>`
        SELECT 
          EXTRACT(DOW FROM session_start)::int as day_of_week,
          EXTRACT(HOUR FROM session_start)::int as hour,
          COUNT(*)::bigint as activity_count
        FROM session_logs
        WHERE session_start >= NOW() - INTERVAL '${daysAgo} days'
        GROUP BY day_of_week, hour
        ORDER BY day_of_week, hour
      `;
      
      // Converter BigInt para Number
      const heatmapDataConverted = heatmapData.map(row => ({
        dayOfWeek: row.day_of_week,
        hour: row.hour,
        activityCount: Number(row.activity_count)
      }));
      
      res.json({ 
        success: true, 
        data: heatmapDataConverted 
      });
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
);

/**
 * GET /api/analytics/user/:userId
 * Analytics detalhados de um usuário específico
 * Requer: ADMIN role
 */
router.get('/user/:userId',
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const userAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              points: true,
              level: true,
              role: true,
              createdAt: true,
              lastLoginAt: true
            }
          }
        }
      });
      
      if (!userAnalytics) {
        return res.status(404).json({
          success: false,
          error: 'User analytics not found'
        });
      }
      
      // Buscar sessões recentes
      const recentSessions = await prisma.sessionLog.findMany({
        where: { userId },
        orderBy: { sessionStart: 'desc' },
        take: 10,
        select: {
          id: true,
          sessionStart: true,
          sessionEnd: true,
          duration: true,
          country: true,
          city: true,
          device: true,
          browser: true,
          pagesVisited: true,
          actionsCount: true
        }
      });
      
      res.json({
        success: true,
        data: {
          analytics: userAnalytics,
          recentSessions
        }
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
);

export default router;
