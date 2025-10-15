"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/stats/overview - Global stats
router.get('/overview', async (req, res, next) => {
    try {
        const [totalTerms, translatedTerms, totalUsers, totalTranslations, approvedTranslations] = await Promise.all([
            database_1.default.hpoTerm.count(),
            database_1.default.hpoTerm.count({
                where: { translationStatus: { not: 'NOT_TRANSLATED' } }
            }),
            database_1.default.user.count({ where: { isActive: true } }),
            database_1.default.translation.count(),
            database_1.default.translation.count({ where: { status: 'APPROVED' } })
        ]);
        res.json({
            totalTerms,
            translatedTerms,
            translationProgress: (translatedTerms / totalTerms) * 100,
            totalUsers,
            totalTranslations,
            approvedTranslations,
            approvalRate: (approvedTranslations / totalTranslations) * 100
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/stats/leaderboard
router.get('/leaderboard', async (req, res, next) => {
    try {
        const topUsers = await database_1.default.user.findMany({
            take: 100,
            orderBy: { points: 'desc' },
            select: {
                id: true,
                name: true,
                specialty: true,
                points: true,
                level: true,
                _count: {
                    select: {
                        translations: true,
                        validations: true
                    }
                }
            }
        });
        res.json({ leaderboard: topUsers });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/stats/my-stats - User's personal stats
router.get('/my-stats', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                _count: {
                    select: {
                        translations: true,
                        validations: true,
                        badges: true
                    }
                }
            }
        });
        const approvedTranslations = await database_1.default.translation.count({
            where: {
                userId: req.user.id,
                status: 'APPROVED'
            }
        });
        res.json({
            points: user?.points,
            level: user?.level,
            streak: user?.streak,
            totalTranslations: user?._count.translations,
            approvedTranslations,
            totalValidations: user?._count.validations,
            totalBadges: user?._count.badges,
            approvalRate: user?._count.translations
                ? (approvedTranslations / user._count.translations) * 100
                : 0
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=stats.routes.js.map