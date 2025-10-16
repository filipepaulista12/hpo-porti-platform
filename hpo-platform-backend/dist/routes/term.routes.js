"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation schemas
const querySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    difficulty: zod_1.z.string().optional()
});
// GET /api/terms - List HPO terms
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const query = querySchema.parse(req.query);
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        const skip = (page - 1) * limit;
        // Build filters
        const where = {};
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
            database_1.default.hpoTerm.findMany({
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
            database_1.default.hpoTerm.count({ where })
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/terms/:id - Get single term
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const term = await database_1.default.hpoTerm.findUnique({
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
            throw new errorHandler_1.AppError('Term not found', 404);
        }
        res.json({ term });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/terms/recommended - Get recommended terms for user
router.get('/recommended/for-me', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { specialty: true, level: true }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        // Get terms that match user's specialty and level
        const recommendedTerms = await database_1.default.hpoTerm.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/terms/categories - Get all unique categories
router.get('/categories', auth_1.authenticate, async (req, res, next) => {
    try {
        const categories = await database_1.default.hpoTerm.findMany({
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
            .filter(c => c !== null);
        res.json({ categories: categoryList });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=term.routes.js.map