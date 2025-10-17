"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const promotion_service_1 = require("../services/promotion.service");
const router = (0, express_1.Router)();
// GET /api/users/profile/:id
router.get('/profile/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                institution: true,
                specialty: true,
                country: true,
                bio: true,
                avatarUrl: true,
                points: true,
                level: true,
                streak: true,
                createdAt: true,
                _count: {
                    select: {
                        translations: true,
                        validations: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/users/promotion-progress - Get user's promotion progress
router.get('/promotion-progress', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const progress = await (0, promotion_service_1.getPromotionProgress)(req.user.id);
        if (!progress) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            data: progress
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/users/:id/stats - Get user stats
router.get('/:id/stats', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                points: true,
                level: true,
                streak: true,
                _count: {
                    select: {
                        translations: true,
                        validations: true,
                        comments: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Calculate level from points
        const calculatedLevel = Math.floor(user.points / 100) + 1;
        res.json({
            totalXp: user.points,
            level: calculatedLevel,
            streak: user.streak,
            translationsCount: user._count.translations,
            validationsCount: user._count.validations,
            commentsCount: user._count.comments
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/users/me - Get current user (alias for /api/auth/me)
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                points: true,
                level: true,
                institution: true,
                specialty: true,
                country: true,
                orcidId: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        translations: true,
                        validations: true,
                        comments: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Calculate level from points
        const calculatedLevel = Math.floor(user.points / 100) + 1;
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            points: user.points,
            level: calculatedLevel,
            institution: user.institution,
            specialty: user.specialty,
            country: user.country,
            orcidId: user.orcidId,
            isActive: user.isActive,
            createdAt: user.createdAt,
            stats: {
                translationsCount: user._count.translations,
                validationsCount: user._count.validations,
                commentsCount: user._count.comments
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/users/:id - Get user by ID (alias for /api/users/profile/:id)
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                institution: true,
                specialty: true,
                country: true,
                bio: true,
                avatarUrl: true,
                points: true,
                level: true,
                streak: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        translations: true,
                        validations: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch user badges
        const userBadges = await database_1.default.userBadge.findMany({
            where: { userId: req.params.id },
            include: {
                badge: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        iconUrl: true,
                        rarity: true,
                        points: true
                    }
                }
            },
            orderBy: {
                earnedAt: 'desc'
            }
        });
        // Transform badges to expected format
        const badges = userBadges.map(ub => ({
            id: ub.badge.id,
            name: ub.badge.name,
            description: ub.badge.description,
            iconUrl: ub.badge.iconUrl,
            rarity: ub.badge.rarity,
            points: ub.badge.points,
            earnedAt: ub.earnedAt
        }));
        res.json({
            ...user,
            badges // Add badges to response
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/users/:id/badges - Get user badges
router.get('/:id/badges', auth_1.authenticate, async (req, res, next) => {
    try {
        const userBadges = await database_1.default.userBadge.findMany({
            where: { userId: req.params.id },
            include: {
                badge: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        iconUrl: true,
                        rarity: true,
                        points: true
                    }
                }
            },
            orderBy: {
                earnedAt: 'desc'
            }
        });
        // Transform to expected format
        const badges = userBadges.map(ub => ({
            id: ub.badge.id,
            name: ub.badge.name,
            description: ub.badge.description,
            iconUrl: ub.badge.iconUrl,
            rarity: ub.badge.rarity,
            points: ub.badge.points,
            earnedAt: ub.earnedAt
        }));
        res.json({
            badges
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map