"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const database_1 = __importDefault(require("../config/database"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // DEBUG: Log authentication attempt
        console.log('🔐 [AUTH DEBUG] Authentication attempt:', {
            path: req.path,
            method: req.method,
            hasAuthHeader: !!authHeader,
            authHeaderPrefix: authHeader?.substring(0, 20)
        });
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ [AUTH DEBUG] No token provided');
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        // DEBUG: Log JWT_SECRET info (NOT the actual secret!)
        console.log('🔑 [AUTH DEBUG] JWT Config:', {
            secretExists: !!secret,
            secretLength: secret?.length,
            secretPrefix: secret?.substring(0, 10) + '...',
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + '...'
        });
        if (!secret) {
            console.log('❌ [AUTH DEBUG] JWT secret not configured');
            throw new errorHandler_1.AppError('JWT secret not configured', 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log('✅ [AUTH DEBUG] Token verified successfully:', {
            userId: decoded.id,
            email: decoded.email,
            role: decoded.role
        });
        // Check if user is banned
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isBanned: true,
                bannedReason: true
            }
        });
        if (!user) {
            console.log('❌ [AUTH DEBUG] User not found in database:', decoded.id);
            throw new errorHandler_1.AppError('User not found', 401);
        }
        if (user.isBanned) {
            console.log('⛔ [AUTH DEBUG] User is banned:', user.email);
            throw new errorHandler_1.AppError(`Account suspended. Reason: ${user.bannedReason || 'Violation of terms'}`, 403);
        }
        console.log('✅ [AUTH DEBUG] Authentication successful:', user.email);
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            console.log('❌ [AUTH DEBUG] Invalid token:', error.message);
            return next(new errorHandler_1.AppError('Invalid token', 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            console.log('❌ [AUTH DEBUG] Token expired:', error.message);
            return next(new errorHandler_1.AppError('Token expired', 401));
        }
        console.log('❌ [AUTH DEBUG] Unexpected error:', error);
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Not authenticated', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Insufficient permissions', 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map