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
  query: z.string().optional(), // Alias for search
  category: z.string().optional(),
  status: z.string().optional(),
  difficulty: z.string().optional(),
  confidenceLevel: z.string().optional() // For filtering
});

// Shared search logic
const searchTermsHandler = async (req: AuthRequest, res: any, next: any) => {
  try {
    const queryData = querySchema.parse(req.query);
    const page = parseInt(queryData.page);
    const limit = parseInt(queryData.limit);
    const skip = (page - 1) * limit;
    
    // Build filters
    const where: any = {};
    
    // Use either 'search' or 'query' parameter
    const searchTerm = queryData.search || queryData.query;
    if (searchTerm) {
      where.OR = [
        { hpoId: { contains: searchTerm, mode: 'insensitive' } },
        { labelEn: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (queryData.category) {
      where.category = queryData.category;
    }
    
    if (queryData.status) {
      where.translationStatus = queryData.status;
    }
    
    if (queryData.difficulty) {
      where.difficulty = parseInt(queryData.difficulty);
    }
    
    // Get terms with pagination - OPTIMIZED for performance
    const [terms, total] = await Promise.all([
      prisma.hpoTerm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { hpoId: 'asc' },
        select: {
          id: true,
          hpoId: true,
          labelEn: true,
          definitionEn: true,
          category: true,
          difficulty: true,
          translationStatus: true,
          synonymsEn: true,
          // Only get count, not the actual translations (much faster)
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
};

// GET /api/terms/search - Search HPO terms (alias)
router.get('/search', authenticate, searchTermsHandler);

// GET /api/terms - List HPO terms (use shared handler)
router.get('/', authenticate, searchTermsHandler);

// GET /api/terms/:id - Get single term
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Accept both UUID (id) and HPO ID (hpoId like "HP:0000001")
    const searchId = req.params.id;
    const isHpoId = searchId.startsWith('HP:');
    
    const term = await prisma.hpoTerm.findFirst({
      where: isHpoId ? { hpoId: searchId } : { id: searchId },
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
    
    // Backward compatibility: return both wrapped and flat fields
    res.json({ 
      term,
      ...term // Spread term fields at root level for old tests
    });
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
