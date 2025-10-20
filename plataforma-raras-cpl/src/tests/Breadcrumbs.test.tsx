import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock do Breadcrumbs
interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  separator?: string;
  maxItems?: number;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  separator = '/',
  maxItems
}) => {
  const displayItems = maxItems && items.length > maxItems
    ? [...items.slice(0, 1), { label: '...', path: undefined }, ...items.slice(-(maxItems - 1))]
    : items;

  return (
    <nav data-testid="breadcrumbs" aria-label="Breadcrumb">
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '8px', alignItems: 'center' }}>
        {displayItems.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.path && onNavigate && !item.active ? (
              <button
                onClick={() => onNavigate(item.path!)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
                data-testid={`breadcrumb-${index}`}
              >
                {item.label}
              </button>
            ) : (
              <span
                style={{
                  color: item.active ? '#1f2937' : '#6b7280',
                  fontWeight: item.active ? 'bold' : 'normal'
                }}
                data-testid={`breadcrumb-${index}`}
              >
                {item.label}
              </span>
            )}
            {index < displayItems.length - 1 && (
              <span style={{ color: '#d1d5db' }} data-testid={`separator-${index}`}>
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

describe('Breadcrumbs', () => {
  it('should render breadcrumb items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Profile', active: true }
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should render separators between items', () => {
    const items = [
      { label: 'A', path: '/a' },
      { label: 'B', path: '/b' },
      { label: 'C', active: true }
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByTestId('separator-0')).toHaveTextContent('/');
    expect(screen.getByTestId('separator-1')).toHaveTextContent('/');
    expect(screen.queryByTestId('separator-2')).not.toBeInTheDocument();
  });

  it('should use custom separator', () => {
    const items = [
      { label: 'First', path: '/first' },
      { label: 'Second', active: true }
    ];

    render(<Breadcrumbs items={items} separator=">" />);

    expect(screen.getByTestId('separator-0')).toHaveTextContent('>');
  });

  it('should call onNavigate when clickable item is clicked', () => {
    const onNavigate = vi.fn();
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Settings', path: '/settings' },
      { label: 'Account', active: true }
    ];

    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    const homeLink = screen.getByTestId('breadcrumb-0');
    fireEvent.click(homeLink);

    expect(onNavigate).toHaveBeenCalledWith('/');
  });

  it('should not make active item clickable', () => {
    const onNavigate = vi.fn();
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Current', path: '/current', active: true }
    ];

    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    const activeItem = screen.getByTestId('breadcrumb-1');
    expect(activeItem.tagName).toBe('SPAN');
  });

  it('should render truncated breadcrumbs when maxItems is set', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Level 1', path: '/l1' },
      { label: 'Level 2', path: '/l2' },
      { label: 'Level 3', path: '/l3' },
      { label: 'Current', active: true }
    ];

    render(<Breadcrumbs items={items} maxItems={3} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
  });

  it('should style active item differently', () => {
    const items = [
      { label: 'Inactive', path: '/inactive' },
      { label: 'Active', path: '/active', active: true }
    ];

    render(<Breadcrumbs items={items} />);

    const activeItem = screen.getByTestId('breadcrumb-1');
    expect(activeItem).toHaveStyle({
      color: '#1f2937',
      fontWeight: 'bold'
    });
  });

  it('should render single item breadcrumb', () => {
    const items = [{ label: 'Only Item', active: true }];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Only Item')).toBeInTheDocument();
    expect(screen.queryByTestId('separator-0')).not.toBeInTheDocument();
  });

  it('should handle items without paths', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Static Label' },
      { label: 'Current', active: true }
    ];

    render(<Breadcrumbs items={items} onNavigate={vi.fn()} />);

    const staticItem = screen.getByTestId('breadcrumb-1');
    expect(staticItem.tagName).toBe('SPAN');
  });

  it('should work without onNavigate callback', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Page', active: true }
    ];

    render(<Breadcrumbs items={items} />);

    const firstItem = screen.getByTestId('breadcrumb-0');
    expect(firstItem.tagName).toBe('SPAN'); // Sem onNavigate, não é clicável
  });

  it('should have proper accessibility attributes', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Current', active: true }
    ];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByTestId('breadcrumbs');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});
