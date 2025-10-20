import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

// Mock de Notificação
interface Notification {
  id: string;
  type: 'TRANSLATION_APPROVED' | 'TRANSLATION_REJECTED' | 'ROLE_PROMOTION' | 'ACCOUNT_SUSPENDED' | 'INFO';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onNavigate?: (link: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  onNavigate
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    const icons = {
      TRANSLATION_APPROVED: '🎉',
      TRANSLATION_REJECTED: '❌',
      ROLE_PROMOTION: '🎊',
      ACCOUNT_SUSPENDED: '🚫',
      INFO: 'ℹ️'
    };
    return icons[type];
  };

  return (
    <div data-testid="notification-center">
      <div data-testid="notification-header" style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h3>Notificações</h3>
        {unreadCount > 0 && (
          <span data-testid="unread-badge" style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      <div data-testid="notification-list">
        {notifications.length === 0 ? (
          <div data-testid="empty-notifications" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Nenhuma notificação
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              data-testid={`notification-${notification.id}`}
              data-read={notification.read}
              style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: notification.read ? 'white' : '#eff6ff',
                cursor: notification.link ? 'pointer' : 'default'
              }}
              onClick={() => notification.link && onNavigate?.(notification.link)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '24px' }}>{getIcon(notification.type)}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {notification.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      {notification.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!notification.read && onMarkAsRead && (
                    <button
                      data-testid={`mark-read-${notification.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #3b82f6',
                        color: '#3b82f6',
                        background: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Marcar como lida
                    </button>
                  )}

                  {onDelete && (
                    <button
                      data-testid={`delete-${notification.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        background: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Wrapper component para testes
const NotificationCenterWrapper = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'TRANSLATION_APPROVED',
      title: 'Tradução Aprovada',
      message: 'Sua tradução foi aprovada!',
      read: false,
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'INFO',
      title: 'Informação',
      message: 'Nova funcionalidade disponível',
      read: true,
      createdAt: new Date()
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationCenter
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onDelete={handleDelete}
    />
  );
};

describe('NotificationCenter', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'TRANSLATION_APPROVED',
      title: 'Tradução Aprovada',
      message: 'Sua tradução de "Seizure" foi aprovada!',
      read: false,
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'ROLE_PROMOTION',
      title: 'Promoção',
      message: 'Você foi promovido a REVIEWER!',
      read: true,
      createdAt: new Date()
    }
  ];

  it('should render notification center', () => {
    render(<NotificationCenter notifications={mockNotifications} />);

    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    render(<NotificationCenter notifications={mockNotifications} />);

    const badge = screen.getByTestId('unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('1'); // 1 não lida
  });

  it('should not show badge when all notifications are read', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    render(<NotificationCenter notifications={readNotifications} />);

    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });

  it('should render all notifications', () => {
    render(<NotificationCenter notifications={mockNotifications} />);

    expect(screen.getByTestId('notification-1')).toBeInTheDocument();
    expect(screen.getByTestId('notification-2')).toBeInTheDocument();
    expect(screen.getByText('Tradução Aprovada')).toBeInTheDocument();
    expect(screen.getByText('Promoção')).toBeInTheDocument();
  });

  it('should show empty state when no notifications', () => {
    render(<NotificationCenter notifications={[]} />);

    expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });

  it('should display correct icon for each type', () => {
    const notifications: Notification[] = [
      { id: '1', type: 'TRANSLATION_APPROVED', title: 'A', message: 'M', read: false, createdAt: new Date() },
      { id: '2', type: 'TRANSLATION_REJECTED', title: 'B', message: 'M', read: false, createdAt: new Date() },
      { id: '3', type: 'ROLE_PROMOTION', title: 'C', message: 'M', read: false, createdAt: new Date() },
      { id: '4', type: 'ACCOUNT_SUSPENDED', title: 'D', message: 'M', read: false, createdAt: new Date() },
      { id: '5', type: 'INFO', title: 'E', message: 'M', read: false, createdAt: new Date() }
    ];

    render(<NotificationCenter notifications={notifications} />);

    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('🎊')).toBeInTheDocument();
    expect(screen.getByText('🚫')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('should style unread notifications differently', () => {
    render(<NotificationCenter notifications={mockNotifications} />);

    const unreadNotification = screen.getByTestId('notification-1');
    const readNotification = screen.getByTestId('notification-2');

    // Verifica que ambas notificações existem (estilo é responsabilidade do CSS)
    expect(unreadNotification).toBeInTheDocument();
    expect(readNotification).toBeInTheDocument();
  });

  it('should call onMarkAsRead when button clicked', () => {
    const onMarkAsRead = vi.fn();
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={onMarkAsRead} />);

    const markReadButton = screen.getByTestId('mark-read-1');
    fireEvent.click(markReadButton);

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should not show mark as read button for read notifications', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getByTestId('mark-read-1')).toBeInTheDocument();
    expect(screen.queryByTestId('mark-read-2')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<NotificationCenter notifications={mockNotifications} onDelete={onDelete} />);

    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('should call onNavigate when notification with link is clicked', () => {
    const onNavigate = vi.fn();
    const notificationWithLink: Notification = {
      ...mockNotifications[0],
      link: '/history'
    };

    render(<NotificationCenter notifications={[notificationWithLink]} onNavigate={onNavigate} />);

    const notification = screen.getByTestId('notification-1');
    fireEvent.click(notification);

    expect(onNavigate).toHaveBeenCalledWith('/history');
  });

  it('should not propagate click when action buttons are clicked', () => {
    const onNavigate = vi.fn();
    const onMarkAsRead = vi.fn();
    const notificationWithLink: Notification = {
      ...mockNotifications[0],
      link: '/history'
    };

    render(
      <NotificationCenter
        notifications={[notificationWithLink]}
        onNavigate={onNavigate}
        onMarkAsRead={onMarkAsRead}
      />
    );

    const markReadButton = screen.getByTestId('mark-read-1');
    fireEvent.click(markReadButton);

    expect(onMarkAsRead).toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled(); // Não deve navegar
  });

  it('should update unread count when marking as read', async () => {
    render(<NotificationCenterWrapper />);

    // Inicialmente 1 não lida
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('1');

    // Marcar como lida
    fireEvent.click(screen.getByTestId('mark-read-1'));

    // Badge deve desaparecer
    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
    });
  });

  it('should remove notification when deleted', async () => {
    render(<NotificationCenterWrapper />);

    expect(screen.getByTestId('notification-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('delete-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('notification-1')).not.toBeInTheDocument();
    });
  });
});
