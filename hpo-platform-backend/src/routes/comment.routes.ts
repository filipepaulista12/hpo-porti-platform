import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// All comment routes require authentication
router.use(authenticate);

// ============================================
// COMMENT VALIDATION SCHEMAS
// ============================================

const createCommentSchema = z.object({
  translationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional()
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000)
});

// ============================================
// CREATE COMMENT
// ============================================

// POST /api/comments - Create a new comment
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createCommentSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if translation exists
    const translation = await prisma.translation.findUnique({
      where: { id: validatedData.translationId },
      include: { 
        user: true,
        term: true 
      }
    });

    if (!translation) {
      throw new AppError('Tradução não encontrada', 404);
    }

    // If replying to a comment, check if parent exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId }
      });

      if (!parentComment) {
        throw new AppError('Comentário pai não encontrado', 404);
      }

      if (parentComment.translationId !== validatedData.translationId) {
        throw new AppError('Comentário pai pertence a outra tradução', 400);
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        translationId: validatedData.translationId,
        userId,
        parentId: validatedData.parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true
          }
        }
      }
    });

    // Create notification for translation author (if not commenting on own translation)
    if (translation.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: translation.userId,
          type: 'COMMENT_RECEIVED',
          title: 'Novo comentário na sua tradução',
          message: `${req.user!.name} comentou na tradução de "${translation.term.labelEn}"`,
          link: `/translation/${translation.id}`
        }
      });
    }

    // If replying to someone, notify them too
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        include: { user: true }
      });

      if (parentComment && parentComment.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'COMMENT_RECEIVED',
            title: 'Nova resposta no seu comentário',
            message: `${req.user!.name} respondeu ao seu comentário`,
            link: `/translation/${translation.id}`
          }
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET COMMENTS
// ============================================

// GET /api/comments?translationId=xxx - Get comments for a translation
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { translationId } = req.query;

    if (!translationId || typeof translationId !== 'string') {
      throw new AppError('translationId é obrigatório', 400);
    }

    // Get all comments for this translation (including replies)
    const comments = await prisma.comment.findMany({
      where: { translationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                level: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET SINGLE COMMENT
// ============================================

// GET /api/comments/:id - Get a specific comment
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                level: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!comment) {
      throw new AppError('Comentário não encontrado', 404);
    }

    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// ============================================
// UPDATE COMMENT
// ============================================

// PATCH /api/comments/:id - Update a comment
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateCommentSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!existingComment) {
      throw new AppError('Comentário não encontrado', 404);
    }

    if (existingComment.userId !== userId) {
      throw new AppError('Você só pode editar seus próprios comentários', 403);
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content: validatedData.content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true
          }
        }
      }
    });

    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE COMMENT
// ============================================

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!existingComment) {
      throw new AppError('Comentário não encontrado', 404);
    }

    // Only owner or admins can delete
    const isOwner = existingComment.userId === userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(userRole);

    if (!isOwner && !isAdmin) {
      throw new AppError('Você não tem permissão para deletar este comentário', 403);
    }

    // Delete comment (cascade will delete replies)
    await prisma.comment.delete({
      where: { id }
    });

    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    next(error);
  }
});

export default router;
