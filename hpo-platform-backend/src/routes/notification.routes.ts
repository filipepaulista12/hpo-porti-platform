import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/notifications
 * Get user's notifications with pagination and filters
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - unreadOnly: boolean (default false)
 * - type: NotificationType (optional filter)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }
    if (type) {
      where.type = type;
    }

    // Get notifications with pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, read: false }
      })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + notifications.length < totalCount
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications (lightweight endpoint for badge)
 */
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all user's notifications as read
 */
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/delete-all-read
 * Delete all read notifications for the user
 */
router.delete('/delete-all-read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        read: true
      }
    });

    res.json({
      success: true,
      message: `Deleted ${result.count} read notifications`,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
});

export default router;
