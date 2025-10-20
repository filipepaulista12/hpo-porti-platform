import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface WebSocketHookReturn {
  isConnected: boolean;
  socket: Socket | null;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data?: any) => void;
}

/**
 * Custom hook for WebSocket connection
 * Automatically connects when user is authenticated
 */
export const useWebSocket = (token: string | null): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't connect if no token
    if (!token) {
      if (socketRef.current) {
        console.log('🔌 WebSocket: Disconnecting (no token)');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    console.log('🔌 WebSocket: Connecting to', BACKEND_URL);
    
    const socket = io(BACKEND_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket: Connected', socket.id);
      setIsConnected(true);
    });

    socket.on('connected', (data) => {
      console.log('✅ WebSocket: Server confirmed connection', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket: Disconnected', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket: Connection error', error.message);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket: Error', error);
    });

    // Ping/pong for connection health
    socket.on('pong', () => {
      console.log('🏓 WebSocket: Pong received');
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 WebSocket: Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  // Helper methods
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket: Cannot emit, not connected');
    }
  };

  return {
    isConnected,
    socket: socketRef.current,
    on,
    off,
    emit
  };
};
