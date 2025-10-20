import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import toast, { Toaster } from 'react-hot-toast';

interface WebSocketProviderProps {
  token: string | null;
  onNotificationCountUpdate?: (increment: number) => void;
  onNotificationReceived?: () => void;
}

/**
 * WebSocket Provider Component
 * Handles real-time events and displays toast notifications
 */
export const WebSocketProvider = ({ 
  token, 
  onNotificationCountUpdate,
  onNotificationReceived 
}: WebSocketProviderProps) => {
  const { isConnected, on, off } = useWebSocket(token);

  useEffect(() => {
    if (!isConnected) return;

    console.log('🎧 WebSocket: Setting up event listeners');

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================

    const handleNotificationNew = (data: any) => {
      console.log('🔔 New notification:', data);
      
      const notification = data.notification;
      
      // Show toast with dark mode support
      toast.success(notification.title, {
        duration: 5000,
        position: 'top-right',
        icon: '🔔',
        className: 'dark:bg-gray-800 dark:text-white',
      });

      // Update badge count
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate(1);
      }

      // Trigger refresh of notifications list
      if (onNotificationReceived) {
        onNotificationReceived();
      }
    };

    const handleNotificationRead = (data: any) => {
      console.log('✅ Notification marked as read:', data.notificationId);
      
      // Update badge count (decrement)
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate(-1);
      }
    };

    const handleNotificationCount = (data: any) => {
      console.log('🔢 Notification count update:', data);
      
      if (data.increment && onNotificationCountUpdate) {
        onNotificationCountUpdate(data.increment);
      }
    };

    // ============================================
    // TRANSLATION EVENTS
    // ============================================

    const handleTranslationApproved = (data: any) => {
      console.log('✅ Translation approved:', data);
      
      toast.success(
        `🎉 ${data.message || 'Sua tradução foi aprovada!'}`,
        {
          duration: 6000,
          position: 'top-right',
          className: 'dark:bg-green-800 dark:text-white',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        }
      );
    };

    const handleTranslationRejected = (data: any) => {
      console.log('❌ Translation rejected:', data);
      
      toast.error(
        `📝 ${data.message || 'Sua tradução foi rejeitada'}`,
        {
          duration: 6000,
          position: 'top-right',
          className: 'dark:bg-red-800 dark:text-white',
        }
      );
    };

    const handleTranslationCreated = (data: any) => {
      console.log('➕ Translation created:', data);
      
      toast.success('Tradução criada com sucesso!', {
        duration: 3000,
        position: 'top-right',
        className: 'dark:bg-gray-800 dark:text-white',
      });
    };

    const handleTranslationUpdated = (data: any) => {
      console.log('🔄 Translation updated:', data);
    };

    // ============================================
    // CONFLICT EVENTS
    // ============================================

    const handleConflictCreated = (data: any) => {
      console.log('🔀 Conflict created:', data);
      
      toast(
        `🔀 ${data.message || 'Novo conflito detectado'}`,
        {
          duration: 5000,
          position: 'top-right',
          icon: '⚠️',
          className: 'dark:bg-yellow-800 dark:text-white',
          style: {
            background: '#F59E0B',
            color: '#fff',
          },
        }
      );
    };

    const handleConflictResolved = (data: any) => {
      console.log('✅ Conflict resolved:', data);
      
      toast.success(
        `✅ ${data.message || 'Conflito resolvido'}`,
        {
          duration: 5000,
          position: 'top-right',
          className: 'dark:bg-gray-800 dark:text-white',
        }
      );
    };

    const handleConflictVoteAdded = (data: any) => {
      console.log('🗳️ Vote added to conflict:', data);
    };

    // ============================================
    // SYNC EVENTS
    // ============================================

    const handleSyncStarted = (data: any) => {
      console.log('⏳ Sync started:', data);
      
      toast.loading('Sincronização iniciada...', {
        duration: 3000,
        position: 'top-right',
        className: 'dark:bg-gray-800 dark:text-white',
      });
    };

    const handleSyncCompleted = (data: any) => {
      console.log('🎉 Sync completed:', data);
      
      toast.success(
        `🎉 ${data.message || 'Suas traduções foram sincronizadas!'}`,
        {
          duration: 7000,
          position: 'top-right',
          className: 'dark:bg-purple-800 dark:text-white',
          style: {
            background: '#8B5CF6',
            color: '#fff',
          },
        }
      );
    };

    const handleSyncFailed = (data: any) => {
      console.log('❌ Sync failed:', data);
      
      toast.error('Erro na sincronização', {
        duration: 5000,
        position: 'top-right',
        className: 'dark:bg-gray-800 dark:text-white',
      });
    };

    // ============================================
    // VALIDATION EVENTS
    // ============================================

    const handleValidationReceived = (data: any) => {
      console.log('✅ Validation received:', data);
      
      toast.success('Nova validação recebida!', {
        duration: 3000,
        position: 'top-right',
        className: 'dark:bg-gray-800 dark:text-white',
      });
    };

    // ============================================
    // SYSTEM EVENTS
    // ============================================

    const handleSystemAnnouncement = (data: any) => {
      console.log('📢 System announcement:', data);
      
      toast(data.message, {
        duration: 8000,
        position: 'top-center',
        icon: '📢',
        className: 'dark:bg-blue-800 dark:text-white',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });
    };

    // Register all event listeners
    on('notification:new', handleNotificationNew);
    on('notification:read', handleNotificationRead);
    on('notification:count', handleNotificationCount);
    
    on('translation:created', handleTranslationCreated);
    on('translation:approved', handleTranslationApproved);
    on('translation:rejected', handleTranslationRejected);
    on('translation:updated', handleTranslationUpdated);
    
    on('conflict:created', handleConflictCreated);
    on('conflict:resolved', handleConflictResolved);
    on('conflict:vote_added', handleConflictVoteAdded);
    
    on('sync:started', handleSyncStarted);
    on('sync:completed', handleSyncCompleted);
    on('sync:failed', handleSyncFailed);
    
    on('validation:received', handleValidationReceived);
    
    on('system:announcement', handleSystemAnnouncement);

    // Cleanup listeners on unmount
    return () => {
      console.log('🎧 WebSocket: Cleaning up event listeners');
      
      off('notification:new', handleNotificationNew);
      off('notification:read', handleNotificationRead);
      off('notification:count', handleNotificationCount);
      
      off('translation:created', handleTranslationCreated);
      off('translation:approved', handleTranslationApproved);
      off('translation:rejected', handleTranslationRejected);
      off('translation:updated', handleTranslationUpdated);
      
      off('conflict:created', handleConflictCreated);
      off('conflict:resolved', handleConflictResolved);
      off('conflict:vote_added', handleConflictVoteAdded);
      
      off('sync:started', handleSyncStarted);
      off('sync:completed', handleSyncCompleted);
      off('sync:failed', handleSyncFailed);
      
      off('validation:received', handleValidationReceived);
      
      off('system:announcement', handleSystemAnnouncement);
    };
  }, [isConnected, on, off, onNotificationCountUpdate, onNotificationReceived]);

  return (
    <>
      {/* Toast Container with dark mode support */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: '#fff',
            color: '#1F2937',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Connection Status Indicator (only in dev) */}
      {import.meta.env.DEV && (
        <div 
          className="fixed bottom-5 right-5 px-3 py-2 rounded-md shadow-lg z-[9999] text-xs font-semibold text-white"
          style={{
            background: isConnected ? '#10B981' : '#EF4444',
          }}
        >
          {isConnected ? '🟢 WebSocket Conectado' : '🔴 WebSocket Desconectado'}
        </div>
      )}
    </>
  );
};
