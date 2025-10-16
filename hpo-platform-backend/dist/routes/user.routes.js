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
exports.default = router;
//# sourceMappingURL=user.routes.js.map