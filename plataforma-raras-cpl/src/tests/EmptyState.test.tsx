import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock do EmptyState (extraído do ProductionHPOApp)
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div data-testid="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

describe('EmptyState', () => {
  it('should render with title only', () => {
    render(<EmptyState title="No items found" />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    render(<EmptyState icon="🔍" title="Search results" />);

    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('should render with default icon', () => {
    render(<EmptyState title="Empty" />);

    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <EmptyState
        title="No translations yet"
        description="Start translating HPO terms to earn points and badges."
      />
    );

    expect(screen.getByText('No translations yet')).toBeInTheDocument();
    expect(screen.getByText('Start translating HPO terms to earn points and badges.')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onAction = vi.fn();

    render(
      <EmptyState
        title="No data"
        actionLabel="Create New"
        onAction={onAction}
      />
    );

    const button = screen.getByText('Create New');
    expect(button).toBeInTheDocument();
  });

  it('should call onAction when button clicked', () => {
    const onAction = vi.fn();

    render(
      <EmptyState
        title="Empty list"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );

    const button = screen.getByText('Add Item');
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render button without onAction', () => {
    render(
      <EmptyState
        title="No items"
        actionLabel="Add"
      />
    );

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('should not render button without actionLabel', () => {
    render(
      <EmptyState
        title="No items"
        onAction={vi.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render complete empty state with all props', () => {
    const onAction = vi.fn();

    render(
      <EmptyState
        icon="🎯"
        title="No translations pending"
        description="All translations have been reviewed. Great job!"
        actionLabel="Translate More"
        onAction={onAction}
      />
    );

    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('No translations pending')).toBeInTheDocument();
    expect(screen.getByText('All translations have been reviewed. Great job!')).toBeInTheDocument();
    expect(screen.getByText('Translate More')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Translate More'));
    expect(onAction).toHaveBeenCalled();
  });

  it('should handle multiple empty states on same page', () => {
    const { container } = render(
      <div>
        <EmptyState title="No notifications" icon="🔔" />
        <EmptyState title="No messages" icon="💬" />
        <EmptyState title="No tasks" icon="✅" />
      </div>
    );

    const emptyStates = container.querySelectorAll('[data-testid="empty-state"]');
    expect(emptyStates).toHaveLength(3);
  });
});
