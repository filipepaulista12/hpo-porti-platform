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
// Validation schema
const translationSchema = zod_1.z.object({
    termId: zod_1.z.string().uuid(),
    labelPt: zod_1.z.string().min(1),
    definitionPt: zod_1.z.string().optional(),
    synonymsPt: zod_1.z.array(zod_1.z.string()).optional(),
    confidence: zod_1.z.number().min(1).max(5),
    comments: zod_1.z.string().optional()
});
// POST /api/translations - Create new translation
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const data = translationSchema.parse(req.body);
        // Check if term exists
        const term = await database_1.default.hpoTerm.findUnique({
            where: { id: data.termId }
        });
        if (!term) {
            throw new errorHandler_1.AppError('Term not found', 404);
        }
        // Create translation
        const translation = await database_1.default.translation.create({
            data: {
                termId: data.termId,
                userId: req.user.id,
                labelPt: data.labelPt,
                definitionPt: data.definitionPt,
                synonymsPt: data.synonymsPt || [],
                confidence: data.confidence,
                status: 'PENDING_REVIEW',
                source: 'MANUAL'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true
                    }
                }
            }
        });
        // Update term status
        await database_1.default.hpoTerm.update({
            where: { id: data.termId },
            data: { translationStatus: 'PENDING_REVIEW' }
        });
        // Add activity and points
        const pointsEarned = term.difficulty * 10;
        await Promise.all([
            database_1.default.userActivity.create({
                data: {
                    userId: req.user.id,
                    type: 'TRANSLATION_CREATED',
                    points: pointsEarned,
                    metadata: {
                        translationId: translation.id,
                        termId: data.termId,
                        hpoId: term.hpoId
                    }
                }
            }),
            database_1.default.user.update({
                where: { id: req.user.id },
                data: {
                    points: { increment: pointsEarned },
                    lastActiveAt: new Date()
                }
            })
        ]);
        res.status(201).json({
            message: 'Translation created successfully',
            translation,
            pointsEarned
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/translations/:id - Get translation details
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const translation = await database_1.default.translation.findUnique({
            where: { id: req.params.id },
            include: {
                term: true,
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
                                name: true,
                                specialty: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
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
            }
        });
        if (!translation) {
            throw new errorHandler_1.AppError('Translation not found', 404);
        }
        res.json({ translation });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/translations/:id - Update translation
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const translation = await database_1.default.translation.findUnique({
            where: { id: req.params.id }
        });
        if (!translation) {
            throw new errorHandler_1.AppError('Translation not found', 404);
        }
        // Only owner can update (unless admin)
        if (translation.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new errorHandler_1.AppError('Not authorized to update this translation', 403);
        }
        const data = translationSchema.partial().parse(req.body);
        const updatedTranslation = await database_1.default.translation.update({
            where: { id: req.params.id },
            data: {
                labelPt: data.labelPt,
                definitionPt: data.definitionPt,
                synonymsPt: data.synonymsPt,
                confidence: data.confidence
            }
        });
        res.json({
            message: 'Translation updated successfully',
            translation: updatedTranslation
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/translations/:id - Delete translation
router.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const translation = await database_1.default.translation.findUnique({
            where: { id: req.params.id }
        });
        if (!translation) {
            throw new errorHandler_1.AppError('Translation not found', 404);
        }
        // Only owner or admin can delete
        if (translation.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new errorHandler_1.AppError('Not authorized to delete this translation', 403);
        }
        await database_1.default.translation.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Translation deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/translations - Get translations for review (with filters)
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        // Query params for filtering
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        // Filter by status
        if (status && ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(status)) {
            where.status = status;
        }
        // Exclude user's own translations from review list
        if (status === 'PENDING_REVIEW') {
            where.userId = { not: req.user.id };
        }
        // Get translations with pagination
        const [translations, total] = await Promise.all([
            database_1.default.translation.findMany({
                where,
                include: {
                    term: {
                        select: {
                            hpoId: true,
                            labelEn: true,
                            definitionEn: true,
                            synonymsEn: true,
                            category: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            specialty: true
                        }
                    },
                    validations: {
                        select: {
                            id: true,
                            decision: true,
                            rating: true,
                            comments: true,
                            createdAt: true,
                            validator: {
                                select: {
                                    name: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            database_1.default.translation.count({ where })
        ]);
        res.json({
            success: true,
            translations,
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
// GET /api/translations/my-history - Get user's translation history
router.get('/my-history', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        // Query params for filtering
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            userId: req.user.id
        };
        if (status && ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(status)) {
            where.status = status;
        }
        // Get translations with pagination
        const [translations, total] = await Promise.all([
            database_1.default.translation.findMany({
                where,
                include: {
                    term: {
                        select: {
                            hpoId: true,
                            labelEn: true,
                            definitionEn: true,
                            category: true
                        }
                    },
                    validations: {
                        select: {
                            id: true,
                            decision: true,
                            rating: true,
                            comments: true,
                            createdAt: true,
                            validator: {
                                select: {
                                    name: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            database_1.default.translation.count({ where })
        ]);
        // Get user stats
        const [totalTranslations, approvedCount, pendingCount, rejectedCount, needsRevisionCount] = await Promise.all([
            database_1.default.translation.count({ where: { userId: req.user.id } }),
            database_1.default.translation.count({ where: { userId: req.user.id, status: 'APPROVED' } }),
            database_1.default.translation.count({ where: { userId: req.user.id, status: 'PENDING_REVIEW' } }),
            database_1.default.translation.count({ where: { userId: req.user.id, status: 'REJECTED' } }),
            database_1.default.translation.count({ where: { userId: req.user.id, status: 'NEEDS_REVISION' } })
        ]);
        const stats = {
            total: totalTranslations,
            approved: approvedCount,
            pending: pendingCount,
            rejected: rejectedCount,
            needsRevision: needsRevisionCount,
            approvalRate: totalTranslations > 0 ? Math.round((approvedCount / totalTranslations) * 100) : 0
        };
        res.json({
            success: true,
            translations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=translation.routes.js.map