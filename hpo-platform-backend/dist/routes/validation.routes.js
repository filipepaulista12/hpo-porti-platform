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
const validationSchema = zod_1.z.object({
    translationId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().min(1).max(5),
    decision: zod_1.z.enum(['APPROVED', 'NEEDS_REVISION', 'REJECTED']),
    comments: zod_1.z.string().optional(),
    suggestions: zod_1.z.string().optional(),
    accuracyScore: zod_1.z.number().min(1).max(5).optional(),
    clarityScore: zod_1.z.number().min(1).max(5).optional(),
    consistencyScore: zod_1.z.number().min(1).max(5).optional()
});
// POST /api/validations - Create validation
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('REVIEWER', 'VALIDATOR', 'ADMIN'), async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const data = validationSchema.parse(req.body);
        // Check if translation exists
        const translation = await database_1.default.translation.findUnique({
            where: { id: data.translationId },
            include: { term: true }
        });
        if (!translation) {
            throw new errorHandler_1.AppError('Translation not found', 404);
        }
        // Can't validate own translation
        if (translation.userId === req.user.id) {
            throw new errorHandler_1.AppError('Cannot validate your own translation', 400);
        }
        // Check if already validated
        const existingValidation = await database_1.default.validation.findUnique({
            where: {
                translationId_validatorId: {
                    translationId: data.translationId,
                    validatorId: req.user.id
                }
            }
        });
        if (existingValidation) {
            throw new errorHandler_1.AppError('You have already validated this translation', 400);
        }
        // Create validation
        const validation = await database_1.default.validation.create({
            data: {
                translationId: data.translationId,
                validatorId: req.user.id,
                rating: data.rating,
                decision: data.decision,
                comments: data.comments,
                suggestions: data.suggestions,
                accuracyScore: data.accuracyScore,
                clarityScore: data.clarityScore,
                consistencyScore: data.consistencyScore
            }
        });
        // Update translation counts
        if (data.decision === 'APPROVED') {
            await database_1.default.translation.update({
                where: { id: data.translationId },
                data: { approvalCount: { increment: 1 } }
            });
        }
        else if (data.decision === 'REJECTED') {
            await database_1.default.translation.update({
                where: { id: data.translationId },
                data: { rejectionCount: { increment: 1 } }
            });
        }
        // Check if translation reached consensus (3+ validations)
        const validationCount = await database_1.default.validation.count({
            where: { translationId: data.translationId }
        });
        if (validationCount >= 3) {
            const approvals = await database_1.default.validation.count({
                where: {
                    translationId: data.translationId,
                    decision: 'APPROVED'
                }
            });
            // If 70%+ approved, mark as pending validation by expert
            if (approvals / validationCount >= 0.7) {
                await database_1.default.translation.update({
                    where: { id: data.translationId },
                    data: { status: 'PENDING_VALIDATION' }
                });
            }
        }
        // Give points to validator
        const pointsEarned = 5;
        await Promise.all([
            database_1.default.userActivity.create({
                data: {
                    userId: req.user.id,
                    type: 'VALIDATION_COMPLETED',
                    points: pointsEarned,
                    metadata: {
                        validationId: validation.id,
                        translationId: data.translationId
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
            message: 'Validation submitted successfully',
            validation,
            pointsEarned
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/validations/pending - Get translations pending validation
router.get('/pending', auth_1.authenticate, (0, auth_1.authorize)('REVIEWER', 'VALIDATOR', 'ADMIN'), async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const translations = await database_1.default.translation.findMany({
            where: {
                status: { in: ['PENDING_REVIEW', 'LEGACY_PENDING'] },
                userId: { not: req.user.id }, // Exclude own translations
                validations: {
                    none: { validatorId: req.user.id } // Not already validated by this user
                }
            },
            take: 20,
            orderBy: { createdAt: 'asc' },
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
                _count: {
                    select: { validations: true }
                }
            }
        });
        res.json({ translations });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=validation.routes.js.map