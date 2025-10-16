"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const socket_1 = require("./websocket/socket");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const term_routes_1 = __importDefault(require("./routes/term.routes"));
const translation_routes_1 = __importDefault(require("./routes/translation.routes"));
const validation_routes_1 = __importDefault(require("./routes/validation.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const invite_routes_1 = __importDefault(require("./routes/invite.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const conflict_routes_1 = __importDefault(require("./routes/conflict.routes"));
// NOTE: analytics routes not implemented yet - pending for future sprint
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ============================================
// MIDDLEWARE
// ============================================
// Trust proxy (we're behind Apache reverse proxy)
app.set('trust proxy', true);
// Security
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    // Use X-Forwarded-For header from trusted proxy
    standardHeaders: true,
    legacyHeaders: false,
    // Skip failed requests (don't count them)
    skipFailedRequests: false,
    skipSuccessfulRequests: false
});
app.use('/api/', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, _res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});
// ============================================
// ROUTES
// ============================================
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/terms', term_routes_1.default);
app.use('/api/translations', translation_routes_1.default);
app.use('/api/validations', validation_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/export', export_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/invite', invite_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/conflicts', conflict_routes_1.default);
// NOTE: analytics routes not implemented yet - pending for future sprint
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});
// Error handler (deve ser o último)
app.use(errorHandler_1.errorHandler);
// ============================================
// START SERVER
// ============================================
const startServer = async () => {
    try {
        // Add error handlers BEFORE starting server
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('Unhandled Rejection at:', { promise, reason });
            process.exit(1);
        });
        // Create HTTP server (needed for WebSocket)
        const httpServer = http_1.default.createServer(app);
        // Initialize WebSocket
        const wsServer = (0, socket_1.initializeWebSocket)(httpServer);
        logger_1.logger.info('🔌 WebSocket server initialized');
        // Start listening
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`);
            logger_1.logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            logger_1.logger.info(`🔌 WebSocket: ws://localhost:${PORT}/socket.io/`);
            logger_1.logger.info(`✅ Server started successfully!`);
        });
        // Handle server errors
        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger_1.logger.error(`Port ${PORT} is already in use`);
            }
            else {
                logger_1.logger.error('Server error:', error);
            }
            process.exit(1);
        });
        // Graceful shutdown
        const gracefulShutdown = () => {
            logger_1.logger.info('Shutting down gracefully...');
            httpServer.close(() => {
                logger_1.logger.info('Server closed');
                process.exit(0);
            });
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer().catch((error) => {
    logger_1.logger.error('Fatal error:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map