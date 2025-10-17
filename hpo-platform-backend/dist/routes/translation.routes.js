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
// Base validation schema (used for partial updates)
const translationSchemaBase = zod_1.z.object({
    termId: zod_1.z.string().optional(), // Accept both UUID and HP:XXXXXX
    hpoId: zod_1.z.string().optional(), // ALIAS for termId - also accepts HP:XXXXXX
    labelPt: zod_1.z.string().min(1).optional(),
    translatedText: zod_1.z.string().min(1).optional(), // ALIAS for labelPt
    definitionPt: zod_1.z.string().optional(),
    synonymsPt: zod_1.z.array(zod_1.z.string()).optional(),
    confidence: zod_1.z.number().min(1).max(5).optional().default(3),
    comments: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(), // ALIAS for comments
    language: zod_1.z.string().optional() // Ignored but accepted
});
// Full schema with required field checks (for POST)
const translationSchema = translationSchemaBase.refine(data => data.termId || data.hpoId, {
    message: 'Either termId or hpoId is required',
    path: ['termId']
}).refine(data => data.labelPt || data.translatedText, {
    message: 'Either labelPt or translatedText is required',
    path: ['labelPt']
});
// POST /api/translations - Create new translation
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        // Normalize request body (support both old and new field names)
        const normalizedBody = {
            ...req.body,
            termId: req.body.termId || req.body.hpoId,
            labelPt: req.body.labelPt || req.body.translatedText,
            comments: req.body.comments || req.body.notes,
            confidence: req.body.confidence || 3
        };
        // Validate request body
        const validation = translationSchema.safeParse(normalizedBody);
        if (!validation.success) {
            const errors = validation.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        const data = validation.data;
        // Get normalized termId (either termId or hpoId)
        let actualTermId = data.termId || data.hpoId;
        const actualLabelPt = data.labelPt || data.translatedText;
        const actualComments = data.comments || data.notes;
        // If actualTermId looks like hpoId (HP:XXXXX), convert to UUID
        const isHpoId = actualTermId && actualTermId.startsWith('HP:');
        // Check if term exists and get UUID if needed
        const term = await database_1.default.hpoTerm.findFirst({
            where: isHpoId ? { hpoId: actualTermId } : { id: actualTermId }
        });
        if (!term) {
            return res.status(400).json({
                error: 'Invalid term ID',
                message: `The specified HPO term does not exist: ${actualTermId}`
            });
        }
        // Use the term's actual UUID for database operations
        actualTermId = term.id;
        // Check for duplicate translation (same user + same term)
        const existingTranslation = await database_1.default.translation.findFirst({
            where: {
                userId: req.user.id,
                termId: actualTermId
            }
        });
        if (existingTranslation) {
            return res.status(400).json({
                error: 'Duplicate translation',
                message: 'You have already created a translation for this term'
            });
        }
        // Create translation
        const translation = await database_1.default.translation.create({
            data: {
                termId: actualTermId,
                userId: req.user.id,
                labelPt: actualLabelPt,
                definitionPt: data.definitionPt,
                synonymsPt: data.synonymsPt || [],
                notes: actualComments, // Save notes field
                confidence: data.confidence || 3,
                status: 'PENDING_REVIEW',
                source: 'MANUAL'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        specialty: true
                    }
                }
            }
        });
        // Update term status
        await database_1.default.hpoTerm.update({
            where: { id: actualTermId },
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
        // Add backward compatibility aliases
        const responseTranslation = {
            ...translation,
            translatedText: translation.labelPt, // Alias for labelPt
            notes: translation.notes, // Return notes field from database
            hpoId: term.hpoId // Add hpoId from term
        };
        res.status(201).json({
            message: 'Translation created successfully',
            translation: responseTranslation,
            pointsEarned
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/translations/my-history - Get user's translation history
// NOTE: Must be BEFORE /:id route to avoid conflict
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
                        email: true,
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
                                name: true,
                                email: true
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
        // Add backward compatibility aliases
        const responseTranslation = {
            ...translation,
            translatedText: translation.labelPt, // Alias for labelPt
            // notes field is already in translation from database
            hpoId: translation.term?.hpoId, // Add hpoId from term
            hpoTerm: translation.term // Alias for term
        };
        res.json({ translation: responseTranslation });
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
        console.log('🔍 PUT /api/translations/:id - Request body:', JSON.stringify(req.body, null, 2));
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
        // Use base schema for partial updates (without refine checks)
        console.log('🔍 Parsing with Zod schema...');
        const data = translationSchemaBase.partial().parse(req.body);
        console.log('✅ Zod parse successful:', JSON.stringify(data, null, 2));
        // Normalize field names (support both old and new names)
        const updateData = {};
        if (data.labelPt || data.translatedText) {
            updateData.labelPt = data.labelPt || data.translatedText;
        }
        if (data.definitionPt !== undefined)
            updateData.definitionPt = data.definitionPt;
        if (data.synonymsPt !== undefined)
            updateData.synonymsPt = data.synonymsPt;
        if (data.confidence !== undefined)
            updateData.confidence = data.confidence;
        // Handle notes field (accept both 'comments' and 'notes' alias)
        const notesValue = data.notes || data.comments;
        if (notesValue !== undefined) {
            updateData.notes = notesValue;
        }
        const updatedTranslation = await database_1.default.translation.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                term: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        specialty: true
                    }
                }
            }
        });
        // Add backward compatibility aliases
        const responseTranslation = {
            ...updatedTranslation,
            translatedText: updatedTranslation.labelPt,
            notes: updatedTranslation.notes, // Return notes field directly
            hpoId: updatedTranslation.term?.hpoId,
            hpoTerm: updatedTranslation.term
        };
        console.log('✅ Translation updated successfully');
        res.json({
            message: 'Translation updated successfully',
            translation: responseTranslation
        });
    }
    catch (error) {
        console.error('❌ PUT /api/translations/:id ERROR:', error);
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
// POST /api/translations/:id/validate - Validate/vote on translation
router.post('/:id/validate', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const translationId = req.params.id;
        const { isValid, feedback } = req.body;
        // Check if translation exists
        const translation = await database_1.default.translation.findUnique({
            where: { id: translationId },
            include: { term: true }
        });
        if (!translation) {
            return res.status(404).json({ error: 'Translation not found' });
        }
        // Can't validate own translation
        if (translation.userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot validate your own translation' });
        }
        // Check if already validated
        const existingValidation = await database_1.default.validation.findUnique({
            where: {
                translationId_validatorId: {
                    translationId,
                    validatorId: req.user.id
                }
            }
        });
        if (existingValidation) {
            return res.status(400).json({ error: 'You have already validated this translation' });
        }
        // Create validation
        const validation = await database_1.default.validation.create({
            data: {
                translationId,
                validatorId: req.user.id,
                comments: feedback,
                rating: isValid ? 5 : 2,
                decision: isValid ? 'APPROVED' : 'NEEDS_REVISION'
            },
            include: {
                validator: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true
                    }
                }
            }
        });
        // Add isValid to response for backward compatibility
        const responseValidation = {
            ...validation,
            isValid,
            feedback
        };
        // Update translation counts
        if (isValid) {
            await database_1.default.translation.update({
                where: { id: translationId },
                data: {
                    approvalCount: { increment: 1 },
                    status: 'APPROVED' // Auto-approve with one validation for now
                }
            });
        }
        else {
            await database_1.default.translation.update({
                where: { id: translationId },
                data: {
                    rejectionCount: { increment: 1 },
                    status: 'NEEDS_REVISION'
                }
            });
        }
        // Award points to validator
        await database_1.default.user.update({
            where: { id: req.user.id },
            data: { points: { increment: 10 } }
        });
        res.status(201).json({
            message: 'Validation created successfully',
            validation: responseValidation
        });
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
                            email: true,
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
// GET /api/translations/user/:id - Get user's translations history
router.get('/user/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [translations, total] = await Promise.all([
            database_1.default.translation.findMany({
                where: { userId },
                include: {
                    term: {
                        select: {
                            hpoId: true,
                            labelEn: true
                        }
                    },
                    _count: {
                        select: {
                            validations: true,
                            comments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            database_1.default.translation.count({ where: { userId } })
        ]);
        // Add backward compatibility aliases to each translation
        const translationsWithAliases = translations.map(t => ({
            ...t,
            translatedText: t.labelPt,
            hpoId: t.term?.hpoId,
            hpoTerm: t.term
        }));
        res.json({
            translations: translationsWithAliases,
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
// GET /api/translations/term/:termId - Get all translations for a specific term
router.get('/term/:termId', auth_1.authenticate, async (req, res, next) => {
    try {
        const { termId } = req.params;
        // Accept both UUID (id) and HPO ID (hpoId like "HP:0000001")
        const isHpoId = termId.startsWith('HP:');
        // First, find the term to get its UUID if needed
        let actualTermId = termId;
        if (isHpoId) {
            const term = await database_1.default.hpoTerm.findFirst({
                where: { hpoId: termId },
                select: { id: true }
            });
            if (!term) {
                return res.status(404).json({ error: 'Term not found' });
            }
            actualTermId = term.id;
        }
        const translations = await database_1.default.translation.findMany({
            where: { termId: actualTermId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        specialty: true,
                        points: true,
                        level: true
                    }
                },
                term: {
                    select: {
                        id: true,
                        hpoId: true,
                        labelEn: true
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
                comments: true,
                _count: {
                    select: {
                        validations: true,
                        comments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Add backward compatibility aliases to each translation
        const translationsWithAliases = translations.map(t => ({
            ...t,
            translatedText: t.labelPt,
            hpoId: t.term?.hpoId,
            hpoTerm: t.term
        }));
        res.json({ translations: translationsWithAliases });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=translation.routes.js.map