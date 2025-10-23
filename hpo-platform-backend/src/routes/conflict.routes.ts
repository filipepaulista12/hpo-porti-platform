import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// All conflict routes require authentication
router.use(authenticate);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createConflictSchema = z.object({
  hpoTermId: z.string().uuid(),
  type: z.enum(['MULTIPLE_TRANSLATIONS', 'QUALITY_DISPUTE', 'TERMINOLOGY_CONFLICT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

const voteSchema = z.object({
  translationId: z.string().uuid().optional(),
  voteType: z.enum(['APPROVE_THIS', 'CREATE_NEW', 'ABSTAIN']),
  comment: z.string().max(1000).optional()
});

const resolveConflictSchema = z.object({
  winningTranslationId: z.string().uuid().optional(),
  resolution: z.string().max(2000)
});

// ============================================
// GET ALL CONFLICTS
// ============================================

// GET /api/conflicts - List conflicts (with filters)
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, priority, type, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (status && typeof status === 'string') {
      // Validate status against ConflictStatus enum
      const validStatuses = ['PENDING_COMMITTEE', 'IN_VOTING', 'RESOLVED', 'ESCALATED'];
      if (validStatuses.includes(status)) {
        where.status = status;
      } else {
        // Invalid status, use default
        where.status = { in: ['PENDING_COMMITTEE', 'IN_VOTING'] };
      }
    } else {
      // Default: only show pending/in-voting conflicts
      where.status = { in: ['PENDING_COMMITTEE', 'IN_VOTING'] };
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    try {
      const [conflicts, total] = await Promise.all([
        prisma.conflictReview.findMany({
          where,
          include: {
            hpoTerm: {
              select: {
                id: true,
                hpoId: true,
                labelEn: true,
                definitionEn: true,
                category: true
              }
            },
            translations: {
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
                validations: {
                  select: {
                    decision: true,
                    rating: true
                  }
                }
              }
            },
            committeeVotes: {
              include: {
                voter: {
                  select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.conflictReview.count({ where })
    ]);

      res.json({
        conflicts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (dbError) {
      console.error('Database error in conflicts listing:', dbError);
      // Return empty results instead of throwing
      res.json({
        conflicts: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET CONFLICTS BY TERM
// ============================================

// GET /api/conflicts/term/:termId - Get conflicts for a specific term
router.get('/term/:termId', async (req: AuthRequest, res, next) => {
  try {
    const { termId } = req.params;
    
    // Find term by hpoId or UUID
    let term = await prisma.hpoTerm.findUnique({
      where: { hpoId: termId }
    });
    
    if (!term) {
      term = await prisma.hpoTerm.findUnique({
        where: { id: termId }
      });
    }
    
    if (!term) {
      return res.status(404).json({ 
        error: 'Term not found',
        conflicts: []
      });
    }
    
    const conflicts = await prisma.conflictReview.findMany({
      where: { hpoTermId: term.id },
      include: {
        hpoTerm: {
          select: {
            id: true,
            hpoId: true,
            labelEn: true,
            definitionEn: true
          }
        },
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        committeeVotes: {
          include: {
            voter: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            translation: {
              select: {
                id: true,
                labelPt: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      conflicts,
      total: conflicts.length
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET SINGLE CONFLICT
// ============================================

// GET /api/conflicts/:id - Get conflict details
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const conflict = await prisma.conflictReview.findUnique({
      where: { id },
      include: {
        hpoTerm: {
          select: {
            id: true,
            hpoId: true,
            labelEn: true,
            definitionEn: true,
            synonymsEn: true,
            category: true
          }
        },
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                level: true,
                points: true
              }
            },
            validations: {
              include: {
                validator: {
                  select: {
                    id: true,
                    name: true,
                    role: true
                  }
                }
              }
            }
          }
        },
        committeeVotes: {
          include: {
            voter: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            translation: {
              select: {
                id: true,
                labelPt: true
              }
            }
          },
          orderBy: {
            votedAt: 'desc'
          }
        },
        resolver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!conflict) {
      throw new AppError('Conflito não encontrado', 404);
    }

    res.json(conflict);
  } catch (error) {
    next(error);
  }
});

// ============================================
// CREATE CONFLICT
// ============================================

// POST /api/conflicts - Create a new conflict (Admin/Moderator only)
router.post('/', requireRole('MODERATOR' as any), async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createConflictSchema.parse(req.body);

    // Check if HPO term exists
    const hpoTerm = await prisma.hpoTerm.findUnique({
      where: { id: validatedData.hpoTermId }
    });

    if (!hpoTerm) {
      throw new AppError('Termo HPO não encontrado', 404);
    }

    // Get translations for this term
    const translations = await prisma.translation.findMany({
      where: {
        termId: validatedData.hpoTermId,
        status: { in: ['PENDING_REVIEW', 'APPROVED'] }
      }
    });

    if (translations.length < 2 && validatedData.type === 'MULTIPLE_TRANSLATIONS') {
      throw new AppError('Conflito de múltiplas traduções requer pelo menos 2 traduções', 400);
    }

    // Create conflict
    const conflict = await prisma.conflictReview.create({
      data: {
        hpoTermId: validatedData.hpoTermId,
        type: validatedData.type,
        priority: validatedData.priority || 'MEDIUM',
        status: 'PENDING_COMMITTEE'
      },
      include: {
        hpoTerm: true,
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Notify committee members
    const committeeMembers = await prisma.user.findMany({
      where: {
        role: { in: ['COMMITTEE_MEMBER', 'ADMIN', 'SUPER_ADMIN'] },
        isActive: true
      }
    });

    await Promise.all(
      committeeMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.id,
            type: 'CONFLICT_VOTE_NEEDED',
            title: 'Novo conflito requer votação',
            message: `Conflito criado para o termo "${hpoTerm.labelEn}" (${hpoTerm.hpoId})`,
            link: `/conflicts/${conflict.id}`
          }
        })
      )
    );

    res.status(201).json(conflict);
  } catch (error) {
    next(error);
  }
});

// ============================================
// VOTE ON CONFLICT
// ============================================

// POST /api/conflicts/:id/vote - Committee members vote
router.post('/:id/vote', requireRole('COMMITTEE_MEMBER' as any), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = voteSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if conflict exists and is in voting status
    const conflict = await prisma.conflictReview.findUnique({
      where: { id },
      include: {
        translations: true,
        committeeVotes: true
      }
    });

    if (!conflict) {
      throw new AppError('Conflito não encontrado', 404);
    }

    if (!['PENDING_COMMITTEE', 'IN_VOTING'].includes(conflict.status)) {
      throw new AppError('Conflito já foi resolvido ou não está em votação', 400);
    }

    // Check if user already voted
    const existingVote = conflict.committeeVotes.find(v => v.voterId === userId);
    if (existingVote) {
      throw new AppError('Você já votou neste conflito', 400);
    }

    // If voting for a specific translation, validate it belongs to this conflict
    if (validatedData.voteType === 'APPROVE_THIS' && validatedData.translationId) {
      const translationExists = conflict.translations.some(t => t.id === validatedData.translationId);
      if (!translationExists) {
        throw new AppError('Tradução não faz parte deste conflito', 400);
      }
    }

    // Create vote
    const vote = await prisma.committeeVote.create({
      data: {
        conflictReviewId: id,
        voterId: userId,
        translationId: validatedData.translationId,
        voteType: validatedData.voteType,
        comment: validatedData.comment
      },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Update conflict status to IN_VOTING if first vote
    if (conflict.committeeVotes.length === 0) {
      await prisma.conflictReview.update({
        where: { id },
        data: { status: 'IN_VOTING' }
      });
    }

    // Check if we have enough votes to auto-resolve (need at least 3 votes)
    const updatedConflict = await prisma.conflictReview.findUnique({
      where: { id },
      include: { committeeVotes: true }
    });

    if (updatedConflict && updatedConflict.committeeVotes.length >= 3) {
      await checkAndAutoResolve(updatedConflict);
    }

    res.status(201).json(vote);
  } catch (error) {
    next(error);
  }
});

// ============================================
// RESOLVE CONFLICT (ADMIN)
// ============================================

// POST /api/conflicts/:id/resolve - Admin resolves conflict manually
router.post('/:id/resolve', requireRole('ADMIN' as any), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = resolveConflictSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if conflict exists
    const conflict = await prisma.conflictReview.findUnique({
      where: { id },
      include: {
        translations: {
          include: { user: true }
        },
        hpoTerm: true
      }
    });

    if (!conflict) {
      throw new AppError('Conflito não encontrado', 404);
    }

    if (conflict.status === 'RESOLVED') {
      throw new AppError('Conflito já foi resolvido', 400);
    }

    // If a winning translation is selected, update its status
    if (validatedData.winningTranslationId) {
      const winningTranslation = conflict.translations.find(
        t => t.id === validatedData.winningTranslationId
      );

      if (!winningTranslation) {
        throw new AppError('Tradução vencedora não encontrada', 404);
      }

      // Approve winning translation
      await prisma.translation.update({
        where: { id: validatedData.winningTranslationId },
        data: {
          status: 'APPROVED',
          approvedBy: userId,
          approvedAt: new Date()
        }
      });

      // Reject other translations
      const otherTranslations = conflict.translations.filter(
        t => t.id !== validatedData.winningTranslationId
      );

      await Promise.all(
        otherTranslations.map(t =>
          prisma.translation.update({
            where: { id: t.id },
            data: {
              status: 'REJECTED',
              rejectedBy: userId
            }
          })
        )
      );

      // Award points to winner
      await prisma.user.update({
        where: { id: winningTranslation.userId },
        data: {
          points: { increment: 150 } // Bonus points for winning conflict
        }
      });

      // Notify winner
      await prisma.notification.create({
        data: {
          userId: winningTranslation.userId,
          type: 'CONFLICT_RESOLVED',
          title: '🏆 Sua tradução foi escolhida!',
          message: `Sua tradução de "${conflict.hpoTerm.labelEn}" foi aprovada pelo comitê. +150 pontos!`,
          link: `/translation/${validatedData.winningTranslationId}`
        }
      });
    }

    // Update conflict status
    const resolvedConflict = await prisma.conflictReview.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        winningTranslationId: validatedData.winningTranslationId,
        resolution: validatedData.resolution,
        resolvedBy: userId,
        resolvedAt: new Date()
      },
      include: {
        hpoTerm: true,
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(resolvedConflict);
  } catch (error) {
    next(error);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkAndAutoResolve(conflict: any) {
  const votes = conflict.committeeVotes;
  
  // Count votes by type
  const voteCounts: Record<string, number> = {};
  const translationVotes: Record<string, number> = {};

  votes.forEach((vote: any) => {
    voteCounts[vote.voteType] = (voteCounts[vote.voteType] || 0) + 1;
    
    if (vote.translationId) {
      translationVotes[vote.translationId] = (translationVotes[vote.translationId] || 0) + 1;
    }
  });

  // If majority votes for same translation, auto-approve
  const totalVotes = votes.length;
  const majorityThreshold = Math.ceil(totalVotes / 2);

  for (const [translationId, count] of Object.entries(translationVotes)) {
    if (count >= majorityThreshold) {
      // Auto-resolve with this translation as winner
      await prisma.conflictReview.update({
        where: { id: conflict.id },
        data: {
          status: 'RESOLVED',
          winningTranslationId: translationId,
          resolution: `Resolução automática: ${count}/${totalVotes} votos do comitê`,
          resolvedAt: new Date()
        }
      });

      // Approve winning translation
      await prisma.translation.update({
        where: { id: translationId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        }
      });

      return true;
    }
  }

  return false;
}

export default router;
