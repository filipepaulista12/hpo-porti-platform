import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket/socket';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import termRoutes from './routes/term.routes';
import translationRoutes from './routes/translation.routes';
import validationRoutes from './routes/validation.routes';
import statsRoutes from './routes/stats.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import exportRoutes from './routes/export.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import inviteRoutes from './routes/invite.routes';
import commentRoutes from './routes/comment.routes';
import conflictRoutes from './routes/conflict.routes';
// NOTE: analytics routes not implemented yet - pending for future sprint

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Trust proxy (we're behind Apache reverse proxy)
app.set('trust proxy', true);

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/conflicts', conflictRoutes);
// NOTE: analytics routes not implemented yet - pending for future sprint

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler (deve ser o último)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Add error handlers BEFORE starting server
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
      process.exit(1);
    });

    // Create HTTP server (needed for WebSocket)
    const httpServer = http.createServer(app);

    // Initialize WebSocket
    const wsServer = initializeWebSocket(httpServer);
    logger.info('🔌 WebSocket server initialized');

    // Start listening
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}/socket.io/`);
      logger.info(`✅ Server started successfully!`);
    });

    // Handle server errors
    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

export default app;
