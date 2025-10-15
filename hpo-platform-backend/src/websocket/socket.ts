import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const prisma = new PrismaClient();

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io/'
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('🔌 WebSocket server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          logger.warn('WebSocket connection attempt without token');
          return next(new Error('Authentication required'));
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, name: true }
        });

        if (!user) {
          logger.warn(`WebSocket: User not found for token: ${decoded.id}`);
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.userId = user.id;
        socket.userEmail = user.email;
        socket.userRole = user.role;

        logger.info(`WebSocket authenticated: ${user.email} (${user.role})`);
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const userEmail = socket.userEmail!;

      logger.info(`WebSocket connected: ${userEmail} (Socket ID: ${socket.id})`);

      // Track user socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Join role-specific rooms
      if (socket.userRole === 'ADMIN' || socket.userRole === 'SUPER_ADMIN') {
        socket.join('role:admin');
      }
      if (socket.userRole === 'COMMITTEE_MEMBER' || socket.userRole === 'ADMIN' || socket.userRole === 'SUPER_ADMIN') {
        socket.join('role:committee');
      }
      socket.join('role:all');

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`WebSocket disconnected: ${userEmail} (Socket ID: ${socket.id})`);
        
        const sockets = this.userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'WebSocket conectado com sucesso!',
        userId,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Send notification to specific user
   */
  public notifyUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`;
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    logger.info(`WebSocket event sent to user ${userId}: ${event}`);
  }

  /**
   * Send notification to multiple users
   */
  public notifyUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => this.notifyUser(userId, event, data));
  }

  /**
   * Broadcast to all users with specific role
   */
  public notifyRole(role: 'admin' | 'committee' | 'all', event: string, data: any) {
    const room = `role:${role}`;
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    logger.info(`WebSocket event broadcast to role ${role}: ${event}`);
  }

  /**
   * Broadcast to all connected users
   */
  public broadcast(event: string, data: any) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    logger.info(`WebSocket event broadcast to all: ${event}`);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get Socket.IO instance (for advanced usage)
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance (will be initialized in server.ts)
let wsServer: WebSocketServer;

export const initializeWebSocket = (httpServer: HttpServer): WebSocketServer => {
  wsServer = new WebSocketServer(httpServer);
  return wsServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return wsServer;
};
