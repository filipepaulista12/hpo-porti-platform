import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService'; // 🆕 Feature #10

const router = Router();

// ============================================
// SISTEMA DE COMENTÁRIOS [Feature #9]
// ============================================
// Permite discussões e feedback em traduções
// Suporta threads (replies) e notificações
// ============================================

// GET /api/comments/translation/:translationId - Get all comments for a translation
router.get('/translation/:translationId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { translationId } = req.params;
    
    // Verificar se a tradução existe
    const translation = await prisma.translation.findUnique({
      where: { id: translationId },
      include: {
        user: {
          select: { id: true, name: true }
        },
        term: {
          select: { hpoId: true, labelEn: true }
        }
      }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    // Buscar comentários com thread hierarchy
    const comments = await prisma.comment.findMany({
      where: {
        translationId,
        parentId: null // Apenas comentários principais (não replies)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            specialty: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                specialty: true
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
    
    res.json({
      translation: {
        id: translation.id,
        labelPt: translation.labelPt,
        term: translation.term,
        translator: translation.user
      },
      comments,
      totalComments: comments.length,
      totalReplies: comments.reduce((sum, c) => sum + c.replies.length, 0)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/comments - Create a new comment or reply
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { translationId, content, parentId } = req.body;
    
    if (!translationId || !content) {
      throw new AppError('translationId and content are required', 400);
    }
    
    if (content.trim().length < 3) {
      throw new AppError('Comment must be at least 3 characters', 400);
    }
    
    if (content.length > 2000) {
      throw new AppError('Comment cannot exceed 2000 characters', 400);
    }
    
    // Verificar se a tradução existe
    const translation = await prisma.translation.findUnique({
      where: { id: translationId },
      include: {
        user: true,
        term: {
          select: { hpoId: true, labelEn: true }
        }
      }
    });
    
    if (!translation) {
      throw new AppError('Translation not found', 404);
    }
    
    // Se for reply, verificar se o parent existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });
      
      if (!parentComment) {
        throw new AppError('Parent comment not found', 404);
      }
      
      // Verificar se o parent pertence à mesma tradução
      if (parentComment.translationId !== translationId) {
        throw new AppError('Parent comment does not belong to this translation', 400);
      }
    }
    
    // Criar comentário
    const comment = await prisma.comment.create({
      data: {
        translationId,
        userId: req.user!.id,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            specialty: true
          }
        }
      }
    });
    
    // ========================================
    // NOTIFICAÇÕES
    // ========================================
    
    // Notificar o tradutor (se não for ele mesmo comentando)
    if (translation.userId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: translation.userId,
          type: 'COMMENT_RECEIVED',
          title: parentId ? '💬 Nova resposta no seu comentário' : '💬 Novo comentário na sua tradução',
          message: parentId 
            ? `${comment.user.name} respondeu seu comentário em ${translation.term.hpoId}`
            : `${comment.user.name} comentou na sua tradução de ${translation.term.hpoId}`,
          link: `/history/${translation.id}`,
          read: false
        }
      });

      // 🆕 Send comment email
      await emailService.sendCommentReceived(
        translation.user.email,
        translation.user.name,
        comment.user.name,
        translation.term.hpoId,
        comment.content.substring(0, 100), // Preview (first 100 chars)
        translation.id
      );
    }
    
    // Se for reply, notificar o autor do comentário pai
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true }
      });
      
      if (parentComment && parentComment.userId !== req.user!.id && parentComment.userId !== translation.userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'COMMENT_RECEIVED',
            title: '💬 Nova resposta no seu comentário',
            message: `${comment.user.name} respondeu seu comentário em ${translation.term.hpoId}`,
            link: `/history/${translation.id}`,
            read: false
          }
        });
      }
    }
    
    res.status(201).json({
      comment,
      message: parentId ? 'Reply posted successfully' : 'Comment posted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/comments/:id - Update a comment (only by author)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length < 3) {
      throw new AppError('Content must be at least 3 characters', 400);
    }
    
    if (content.length > 2000) {
      throw new AppError('Comment cannot exceed 2000 characters', 400);
    }
    
    // Verificar se o comentário existe e pertence ao usuário
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!existingComment) {
      throw new AppError('Comment not found', 404);
    }
    
    if (existingComment.userId !== req.user!.id) {
      throw new AppError('You can only edit your own comments', 403);
    }
    
    // Atualizar comentário
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            specialty: true
          }
        }
      }
    });
    
    res.json({
      comment: updatedComment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id - Delete a comment (only by author)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o comentário existe e pertence ao usuário
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        replies: true
      }
    });
    
    if (!existingComment) {
      throw new AppError('Comment not found', 404);
    }
    
    if (existingComment.userId !== req.user!.id) {
      throw new AppError('You can only delete your own comments', 403);
    }
    
    // Deletar comentário (CASCADE deletará as replies também)
    await prisma.comment.delete({
      where: { id }
    });
    
    res.json({
      message: 'Comment deleted successfully',
      deletedReplies: existingComment.replies.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/comments/user/:userId - Get all comments by a user
router.get('/user/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    
    const comments = await prisma.comment.findMany({
      where: { userId },
      include: {
        translation: {
          include: {
            term: {
              select: {
                hpoId: true,
                labelEn: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        replies: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    res.json({
      comments,
      total: comments.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
