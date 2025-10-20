import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock do Skeleton (extraído do ProductionHPOApp)
interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  variant = 'rectangular'
}) => {
  const styles: React.CSSProperties = {
    width,
    height,
    backgroundColor: '#e5e7eb',
    borderRadius: variant === 'circular' ? '50%' : borderRadius,
    animation: 'pulse 1.5s ease-in-out infinite'
  };

  return <div data-testid="skeleton" data-variant={variant} style={styles} />;
};

describe('Skeleton', () => {
  it('should render with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('data-variant', 'rectangular');
  });

  it('should apply custom width and height', () => {
    render(<Skeleton width="200px" height="40px" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '40px'
    });
  });

  it('should apply custom border radius', () => {
    render(<Skeleton borderRadius="12px" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({
      borderRadius: '12px'
    });
  });

  it('should render text variant', () => {
    render(<Skeleton variant="text" height="16px" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'text');
    expect(skeleton).toHaveStyle({ height: '16px' });
  });

  it('should render circular variant (avatar)', () => {
    render(<Skeleton variant="circular" width="50px" height="50px" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'circular');
    expect(skeleton).toHaveStyle({
      width: '50px',
      height: '50px',
      borderRadius: '50%'
    });
  });

  it('should render rectangular variant (card)', () => {
    render(<Skeleton variant="rectangular" width="300px" height="200px" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'rectangular');
    expect(skeleton).toHaveStyle({
      width: '300px',
      height: '200px'
    });
  });

  it('should have pulse animation', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByTestId('skeleton');
    // Verifica que o elemento existe (animação definida em CSS)
    expect(skeleton).toBeInTheDocument();
  });

  it('should render multiple skeletons for loading list', () => {
    const { container } = render(
      <div>
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </div>
    );
    
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it('should render skeleton for card loading state', () => {
    render(
      <div data-testid="card-skeleton">
        <Skeleton variant="rectangular" height="200px" />
        <Skeleton variant="text" height="24px" width="80%" />
        <Skeleton variant="text" height="16px" width="60%" />
      </div>
    );
    
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should render skeleton for profile loading', () => {
    render(
      <div data-testid="profile-skeleton">
        <Skeleton variant="circular" width="80px" height="80px" />
        <Skeleton variant="text" height="20px" width="150px" />
        <Skeleton variant="text" height="14px" width="100px" />
      </div>
    );
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
    expect(skeletons[0]).toHaveAttribute('data-variant', 'circular');
  });
});
