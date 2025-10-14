import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// Validation schemas
const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  difficulty: z.string().optional()
});

// GET /api/terms - List HPO terms
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;
    
    // Build filters
    const where: any = {};
    
    if (query.search) {
      where.OR = [
        { hpoId: { contains: query.search, mode: 'insensitive' } },
        { labelEn: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.status) {
      where.translationStatus = query.status;
    }
    
    if (query.difficulty) {
      where.difficulty = parseInt(query.difficulty);
    }
    
    // Get terms with pagination
    const [terms, total] = await Promise.all([
      prisma.hpoTerm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { hpoId: 'asc' },
        include: {
          translations: {
            where: { status: 'APPROVED' },
            take: 1,
            orderBy: { approvedAt: 'desc' }
          },
          _count: {
            select: { translations: true }
          }
        }
      }),
      prisma.hpoTerm.count({ where })
    ]);
    
    res.json({
      terms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/terms/:id - Get single term
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const term = await prisma.hpoTerm.findUnique({
      where: { id: req.params.id },
      include: {
        translations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                specialty: true,
                points: true,
                level: true
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!term) {
      throw new AppError('Term not found', 404);
    }
    
    res.json({ term });
  } catch (error) {
    next(error);
  }
});

// GET /api/terms/recommended - Get recommended terms for user
router.get('/recommended/for-me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { specialty: true, level: true }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get terms that match user's specialty and level
    const recommendedTerms = await prisma.hpoTerm.findMany({
      where: {
        translationStatus: {
          in: ['NOT_TRANSLATED', 'PENDING_REVIEW', 'LEGACY_PENDING']
        },
        category: user.specialty || undefined,
        difficulty: {
          lte: Math.min(user.level + 1, 5) // Slightly above user level
        }
      },
      take: 10,
      orderBy: { difficulty: 'asc' },
      include: {
        _count: {
          select: { translations: true }
        }
      }
    });
    
    res.json({ terms: recommendedTerms });
  } catch (error) {
    next(error);
  }
});

// GET /api/terms/categories - Get all unique categories
router.get('/categories', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categories = await prisma.hpoTerm.findMany({
      select: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    });

    const categoryList = categories
      .map(t => t.category)
      .filter(c => c !== null) as string[];

    res.json({ categories: categoryList });
  } catch (error) {
    next(error);
  }
});

export default router;
