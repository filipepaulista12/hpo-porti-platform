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
const logger_1 = require("../utils/logger");
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
// ============================================
// ORCID OAuth Integration
// ============================================
/**
 * GET /api/auth/orcid
 * Redirect user to ORCID authorization page
 */
router.get('/orcid', (req, res) => {
    const clientId = process.env.ORCID_CLIENT_ID;
    const redirectUri = process.env.ORCID_REDIRECT_URI || 'http://localhost:3001/api/auth/orcid/callback';
    const scope = '/authenticate';
    const responseType = 'code';
    // Use sandbox for development, production for live
    const orcidBaseUrl = process.env.NODE_ENV === 'production'
        ? 'https://orcid.org'
        : 'https://sandbox.orcid.org';
    if (!clientId) {
        return res.status(500).json({
            error: 'ORCID not configured',
            message: 'ORCID_CLIENT_ID not set in environment variables'
        });
    }
    // Build authorization URL
    const authUrl = `${orcidBaseUrl}/oauth/authorize?` +
        `client_id=${clientId}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({
        authUrl,
        message: 'Redirect user to this URL for ORCID authentication'
    });
});
/**
 * GET /api/auth/orcid/callback
 * Handle ORCID OAuth callback and create/login user
 */
router.get('/orcid/callback', async (req, res, next) => {
    try {
        const { code, error } = req.query;
        if (error) {
            throw new errorHandler_1.AppError(`ORCID authorization failed: ${error}`, 400);
        }
        if (!code || typeof code !== 'string') {
            throw new errorHandler_1.AppError('Authorization code not provided', 400);
        }
        const clientId = process.env.ORCID_CLIENT_ID;
        const clientSecret = process.env.ORCID_CLIENT_SECRET;
        const redirectUri = process.env.ORCID_REDIRECT_URI || 'http://localhost:3001/api/auth/orcid/callback';
        if (!clientId || !clientSecret) {
            throw new errorHandler_1.AppError('ORCID credentials not configured', 500);
        }
        // Exchange authorization code for access token
        const orcidBaseUrl = process.env.NODE_ENV === 'production'
            ? 'https://orcid.org'
            : 'https://sandbox.orcid.org';
        logger_1.logger.info(`ORCID: Exchanging code for token at ${orcidBaseUrl}/oauth/token`);
        logger_1.logger.info(`ORCID: Client ID: ${clientId}`);
        logger_1.logger.info(`ORCID: Redirect URI: ${redirectUri}`);
        const tokenResponse = await fetch(`${orcidBaseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });
        logger_1.logger.info(`ORCID: Token response status: ${tokenResponse.status}`);
        logger_1.logger.info(`ORCID: Response headers: ${JSON.stringify(Object.fromEntries(tokenResponse.headers.entries()))}`);
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            logger_1.logger.error(`ORCID: Token error response: ${errorData}`);
            throw new errorHandler_1.AppError(`Failed to exchange code for token: ${errorData}`, 400);
        }
        // Get response as text first to log it
        const responseText = await tokenResponse.text();
        logger_1.logger.info(`ORCID: Token response body: ${responseText}`);
        let tokenData;
        try {
            tokenData = JSON.parse(responseText);
        }
        catch (parseError) {
            logger_1.logger.error(`ORCID: Failed to parse token response as JSON. Response was: ${responseText}`);
            throw new errorHandler_1.AppError('Invalid response from ORCID - expected JSON but got HTML', 500);
        }
        const { access_token, orcid, name } = tokenData;
        if (!orcid) {
            throw new errorHandler_1.AppError('ORCID iD not returned', 400);
        }
        // Use data from token response (name and orcid are already available)
        // Note: ORCID /authenticate scope doesn't provide email, so we use orcid@orcid.org
        const email = `${orcid}@orcid.org`;
        const fullName = name || 'ORCID User';
        logger_1.logger.info(`ORCID: User authenticated - ORCID: ${orcid}, Name: ${fullName}`);
        // Check if user exists with this ORCID
        let user = await database_1.default.user.findUnique({
            where: { orcidId: orcid }
        });
        if (!user) {
            // Check if user exists with this email
            user = await database_1.default.user.findUnique({
                where: { email }
            });
            if (user) {
                // Link ORCID to existing account
                user = await database_1.default.user.update({
                    where: { id: user.id },
                    data: { orcidId: orcid }
                });
            }
            else {
                // Create new user
                user = await database_1.default.user.create({
                    data: {
                        email,
                        name: fullName,
                        orcidId: orcid,
                        password: '', // No password for ORCID users
                        role: 'TRANSLATOR',
                        isActive: true
                    }
                });
            }
        }
        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);
        // Calculate level
        const level = Math.floor(user.points / 100) + 1;
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}?orcid_token=${token}&orcid_success=true`);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map