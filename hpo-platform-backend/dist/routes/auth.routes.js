"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(2),
    institution: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    country: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
// Helper: Generate JWT
const generateToken = (userId, email, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new errorHandler_1.AppError('JWT secret not configured', 500);
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // @ts-ignore - JWT types are conflicting
    return jsonwebtoken_1.default.sign({ id: userId, email, role }, secret, { expiresIn: expiresIn });
};
// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('Email already registered', 400);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                institution: data.institution,
                specialty: data.specialty,
                country: data.country,
                role: 'TRANSLATOR'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                points: true,
                level: true
            }
        });
        // Generate token
        const token = generateToken(user.id, user.email, user.role);
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (!user || !user.password) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Update last active
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() }
        });
        // Generate token
        const token = generateToken(user.id, user.email, user.role);
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                points: user.points,
                level: user.level,
                specialty: user.specialty
            },
            token
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                institution: true,
                specialty: true,
                country: true,
                points: true,
                level: true,
                streak: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map