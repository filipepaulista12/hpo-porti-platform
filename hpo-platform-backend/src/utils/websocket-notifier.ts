import { getWebSocketServer } from '../websocket/socket';
import { logger } from './logger';

/**
 * WebSocket notification utilities
 * Wrapper around WebSocket server for easy notifications
 */

export const notifySyncCompleted = (userId: string, data: any) => {
  try {
    const wsServer = getWebSocketServer();
    wsServer.notifyUser(userId, 'sync:completed', data);
  } catch (error) {
    logger.warn('WebSocket not initialized, skipping notification');
  }
};

export const notifyNewConflict = (userIds: string[], data: any) => {
  try {
    const wsServer = getWebSocketServer();
    wsServer.notifyUsers(userIds, 'conflict:created', data);
  } catch (error) {
    logger.warn('WebSocket not initialized, skipping notification');
  }
};

export const notifyConflictResolved = (userIds: string[], data: any) => {
  try {
    const wsServer = getWebSocketServer();
    wsServer.notifyUsers(userIds, 'conflict:resolved', data);
  } catch (error) {
    logger.warn('WebSocket not initialized, skipping notification');
  }
};

export const notifyRole = (role: 'admin' | 'committee' | 'all', event: string, data: any) => {
  try {
    const wsServer = getWebSocketServer();
    wsServer.notifyRole(role, event, data);
  } catch (error) {
    logger.warn('WebSocket not initialized, skipping notification');
  }
};
