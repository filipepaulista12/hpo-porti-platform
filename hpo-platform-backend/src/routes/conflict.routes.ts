import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';
import { notifyNewConflict, notifyConflictResolved, notifyRole } from '../utils/websocket-notifier';

const router = Router();

// Validation schema
const voteSchema = z.object({
  voteType: z.enum(['APPROVE_THIS', 'CREATE_NEW', 'ABSTAIN']),
  translationId: z.string().uuid().optional(),
  comment: z.string().optional()
});

// GET /api/conflicts - List all pending conflicts
router.get('/', authenticate, requireRole('COMMITTEE_MEMBER'), async (req: AuthRequest, res, next) => {
  try {
    const { status = 'PENDING_COMMITTEE', page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [conflicts, total] = await Promise.all([
      prisma.conflictReview.findMany({
        where: {
          status: status as any
        },
        include: {
          term: true,
          translations: {
            include: {
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
                      name: true
                    }
                  }
                }
              }
            }
          },
          votes: {
            include: {
              voter: {
                select: {
                  id: true,
                  name: true,
                  specialty: true
                }
              }
            }
          },
          resolver: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.conflictReview.count({
        where: {
          status: status as any
        }
      })
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
  } catch (error) {
    next(error);
  }
});

// GET /api/conflicts/:id - Get conflict details
router.get('/:id', authenticate, requireRole('COMMITTEE_MEMBER'), async (req: AuthRequest, res, next) => {
  try {
    const conflict = await prisma.conflictReview.findUnique({
      where: { id: req.params.id },
      include: {
        term: true,
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                specialty: true,
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
                    specialty: true
                  }
                }
              }
            }
          }
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                name: true,
                specialty: true
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
        winningTranslation: true,
        resolver: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!conflict) {
      throw new AppError('Conflict not found', 404);
    }
    
    // Check if current user has already voted
    const userVote = conflict.votes.find(v => v.voterId === req.user?.id);
    
    res.json({
      conflict,
      userHasVoted: !!userVote,
      userVote
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/conflicts/:id/vote - Submit vote on conflict
router.post('/:id/vote', authenticate, requireRole('COMMITTEE_MEMBER'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const data = voteSchema.parse(req.body);
    
    // Get conflict
    const conflict = await prisma.conflictReview.findUnique({
      where: { id: req.params.id },
      include: {
        votes: true,
        translations: true,
        term: true
      }
    });
    
    if (!conflict) {
      throw new AppError('Conflict not found', 404);
    }
    
    if (conflict.status !== 'PENDING_COMMITTEE' && conflict.status !== 'IN_REVIEW') {
      throw new AppError('This conflict is no longer accepting votes', 400);
    }
    
    // Check if user already voted
    const existingVote = await prisma.committeeVote.findFirst({
      where: {
        conflictId: req.params.id,
        voterId: req.user.id
      }
    });
    
    if (existingVote) {
      throw new AppError('You have already voted on this conflict', 400);
    }
    
    // Validate translationId if voteType is APPROVE_THIS
    if (data.voteType === 'APPROVE_THIS') {
      if (!data.translationId) {
        throw new AppError('translationId is required when voting APPROVE_THIS', 400);
      }
      
      const translationExists = conflict.translations.some(t => t.id === data.translationId);
      if (!translationExists) {
        throw new AppError('Translation not part of this conflict', 400);
      }
    }
    
    // Create vote
    const vote = await prisma.committeeVote.create({
      data: {
        conflictId: req.params.id,
        voterId: req.user.id,
        voteType: data.voteType,
        translationId: data.translationId,
        comment: data.comment
      },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });
    
    // Update conflict status to IN_REVIEW if first vote
    if (conflict.votes.length === 0) {
      await prisma.conflictReview.update({
        where: { id: req.params.id },
        data: { status: 'IN_REVIEW' }
      });
    }
    
    // Check if quorum is reached (need at least 3 votes)
    const totalVotes = conflict.votes.length + 1;
    
    if (totalVotes >= 3) {
      await checkQuorumAndResolve(req.params.id, req.user.id);
    }
    
    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'VOTE_ON_CONFLICT',
        targetType: 'CONFLICT',
        targetId: req.params.id,
        changes: {
          voteType: data.voteType,
          translationId: data.translationId,
          comment: data.comment
        }
      }
    });
    
    res.json({
      message: 'Vote submitted successfully',
      vote,
      totalVotes
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to check quorum and resolve conflict
async function checkQuorumAndResolve(conflictId: string, resolverId: string) {
  const conflict = await prisma.conflictReview.findUnique({
    where: { id: conflictId },
    include: {
      votes: true,
      translations: true,
      term: true
    }
  });
  
  if (!conflict) return;
  
  const votes = conflict.votes;
  const totalVotes = votes.length;
  
  // Count votes by type
  const votesByType = {
    APPROVE_THIS: votes.filter(v => v.voteType === 'APPROVE_THIS').length,
    CREATE_NEW: votes.filter(v => v.voteType === 'CREATE_NEW').length,
    ABSTAIN: votes.filter(v => v.voteType === 'ABSTAIN').length
  };
  
  // Count votes by translation
  const votesByTranslation: Record<string, number> = {};
  votes.forEach(vote => {
    if (vote.translationId) {
      votesByTranslation[vote.translationId] = (votesByTranslation[vote.translationId] || 0) + 1;
    }
  });
  
  // Determine if we have a winner (>50% of votes)
  const quorum = Math.ceil(totalVotes / 2);
  
  let winningTranslationId: string | null = null;
  let resolution = '';
  
  // Check if CREATE_NEW wins
  if (votesByType.CREATE_NEW >= quorum) {
    resolution = 'REQUIRES_NEW_TRANSLATION';
    
    // Notify all translators of the conflict
    const translators = conflict.translations.map(t => t.userId);
    await prisma.notification.createMany({
      data: translators.map(userId => ({
        userId,
        type: 'CONFLICT_RESOLVED',
        title: '📝 Conflito Resolvido - Nova Tradução Necessária',
        message: `O comitê decidiu que o termo ${conflict.term.hpoId} precisa de uma nova tradução. Considere submeter uma versão melhorada.`,
        link: `/translate/${conflict.term.id}`,
        read: false
      }))
    });
  }
  // Check if a specific translation wins
  else {
    for (const [translationId, count] of Object.entries(votesByTranslation)) {
      if (count >= quorum) {
        winningTranslationId = translationId;
        resolution = 'TRANSLATION_SELECTED';
        break;
      }
    }
    
    if (winningTranslationId) {
      // Approve winning translation
      const winningTranslation = await prisma.translation.update({
        where: { id: winningTranslationId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        },
        include: {
          user: true
        }
      });
      
      // Reject other translations
      const losingTranslationIds = conflict.translations
        .filter(t => t.id !== winningTranslationId)
        .map(t => t.id);
      
      await prisma.translation.updateMany({
        where: {
          id: { in: losingTranslationIds }
        },
        data: {
          status: 'REJECTED'
        }
      });
      
      // Update HPO term
      await prisma.hpoTerm.update({
        where: { id: conflict.termId },
        data: {
          translationStatus: 'APPROVED',
          labelPt: winningTranslation.labelPt,
          definitionPt: winningTranslation.definitionPt,
          synonymsPt: winningTranslation.synonymsPt
        }
      });
      
      // Award points to winner
      await prisma.user.update({
        where: { id: winningTranslation.userId },
        data: {
          points: { increment: 150 }, // Bonus for winning committee vote
          approvedCount: { increment: 1 }
        }
      });
      
      // Notify winner
      await prisma.notification.create({
        data: {
          userId: winningTranslation.userId,
          type: 'CONFLICT_RESOLVED',
          title: '🏆 Sua Tradução Venceu!',
          message: `Parabéns! Sua tradução do termo ${conflict.term.hpoId} foi escolhida pelo comitê. +150 pontos!`,
          link: `/history`,
          read: false
        }
      });
      
      // Notify losers
      const losers = conflict.translations.filter(t => t.id !== winningTranslationId);
      await prisma.notification.createMany({
        data: losers.map(t => ({
          userId: t.userId,
          type: 'CONFLICT_RESOLVED',
          title: '📊 Conflito Resolvido',
          message: `O comitê escolheu outra tradução para o termo ${conflict.term.hpoId}. Continue contribuindo!`,
          link: `/history`,
          read: false
        }))
      });
    }
  }
  
  // Only resolve if we have a clear decision
  if (resolution) {
    await prisma.conflictReview.update({
      where: { id: conflictId },
      data: {
        status: 'RESOLVED',
        resolution,
        winningTranslationId,
        resolvedById: resolverId,
        resolvedAt: new Date()
      }
    });
  }
}

// GET /api/conflicts/stats - Get conflict statistics
router.get('/admin/stats', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const [pending, inReview, resolved, total] = await Promise.all([
      prisma.conflictReview.count({ where: { status: 'PENDING_COMMITTEE' } }),
      prisma.conflictReview.count({ where: { status: 'IN_REVIEW' } }),
      prisma.conflictReview.count({ where: { status: 'RESOLVED' } }),
      prisma.conflictReview.count()
    ]);
    
    res.json({
      pending,
      inReview,
      resolved,
      total
    });
  } catch (error) {
    next(error);
  }
});

export default router;
