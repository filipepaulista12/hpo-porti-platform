import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

// Mock do StarRating (extraído do ProductionHPOApp)
interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  readonly = false,
  size = 'medium'
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div data-testid="star-rating" data-readonly={readonly} style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <span
            key={index}
            data-testid={`star-${starValue}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            style={{
              fontSize: sizeMap[size],
              cursor: readonly ? 'default' : 'pointer',
              color: isFilled ? '#fbbf24' : '#d1d5db',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

// Wrapper component para testar mudanças controladas
const ControlledStarRating: React.FC<{ initialValue?: number }> = ({ initialValue = 0 }) => {
  const [rating, setRating] = useState(initialValue);

  return (
    <div>
      <StarRating value={rating} onChange={setRating} />
      <div data-testid="current-rating">{rating}</div>
    </div>
  );
};

describe('StarRating', () => {
  it('should render 5 stars by default', () => {
    render(<StarRating value={0} />);

    expect(screen.getByTestId('star-rating')).toBeInTheDocument();
    expect(screen.getAllByText('★')).toHaveLength(5);
  });

  it('should render custom number of stars', () => {
    render(<StarRating value={0} max={10} />);

    expect(screen.getAllByText('★')).toHaveLength(10);
  });

  it('should display initial rating', () => {
    render(<StarRating value={3} />);

    // Verificar que 3 estrelas estão preenchidas (amarelas)
    const stars = screen.getAllByText('★');
    expect(stars[0]).toHaveStyle({ color: '#fbbf24' });
    expect(stars[1]).toHaveStyle({ color: '#fbbf24' });
    expect(stars[2]).toHaveStyle({ color: '#fbbf24' });
    expect(stars[3]).toHaveStyle({ color: '#d1d5db' });
    expect(stars[4]).toHaveStyle({ color: '#d1d5db' });
  });

  it('should call onChange when star is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    const thirdStar = screen.getByTestId('star-3');
    fireEvent.click(thirdStar);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('should update rating on click', () => {
    render(<ControlledStarRating initialValue={0} />);

    expect(screen.getByTestId('current-rating')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('star-4'));

    expect(screen.getByTestId('current-rating')).toHaveTextContent('4');
  });

  it('should not change rating in readonly mode', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} readonly />);

    expect(screen.getByTestId('star-rating')).toHaveAttribute('data-readonly', 'true');

    fireEvent.click(screen.getByTestId('star-5'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should show hover effect on mouse enter', () => {
    render(<StarRating value={2} onChange={vi.fn()} />);

    const fourthStar = screen.getByTestId('star-4');
    fireEvent.mouseEnter(fourthStar);

    // Durante hover, 4 estrelas devem estar preenchidas
    const stars = screen.getAllByText('★');
    expect(stars[3]).toHaveStyle({ color: '#fbbf24' });
  });

  it('should reset hover effect on mouse leave', () => {
    render(<StarRating value={2} onChange={vi.fn()} />);

    const fourthStar = screen.getByTestId('star-4');
    
    fireEvent.mouseEnter(fourthStar);
    fireEvent.mouseLeave(fourthStar);

    // Deve voltar para o valor original (2 estrelas)
    const stars = screen.getAllByText('★');
    expect(stars[1]).toHaveStyle({ color: '#fbbf24' });
    expect(stars[3]).toHaveStyle({ color: '#d1d5db' });
  });

  it('should not show hover effect in readonly mode', () => {
    render(<StarRating value={2} onChange={vi.fn()} readonly />);

    const fourthStar = screen.getByTestId('star-4');
    fireEvent.mouseEnter(fourthStar);

    // Deve manter as 2 estrelas originais
    const stars = screen.getAllByText('★');
    expect(stars[1]).toHaveStyle({ color: '#fbbf24' });
    expect(stars[3]).toHaveStyle({ color: '#d1d5db' });
  });

  it('should support small size', () => {
    render(<StarRating value={3} size="small" />);

    const stars = screen.getAllByText('★');
    expect(stars[0]).toHaveStyle({ fontSize: '16px' });
  });

  it('should support medium size (default)', () => {
    render(<StarRating value={3} />);

    const stars = screen.getAllByText('★');
    expect(stars[0]).toHaveStyle({ fontSize: '24px' });
  });

  it('should support large size', () => {
    render(<StarRating value={3} size="large" />);

    const stars = screen.getAllByText('★');
    expect(stars[0]).toHaveStyle({ fontSize: '32px' });
  });

  it('should have pointer cursor for interactive stars', () => {
    render(<StarRating value={2} onChange={vi.fn()} />);

    const star = screen.getByTestId('star-1');
    expect(star).toHaveStyle({ cursor: 'pointer' });
  });

  it('should have default cursor for readonly stars', () => {
    render(<StarRating value={2} readonly />);

    const star = screen.getByTestId('star-1');
    expect(star).toHaveStyle({ cursor: 'default' });
  });

  it('should allow changing from high to low rating', () => {
    render(<ControlledStarRating initialValue={5} />);

    expect(screen.getByTestId('current-rating')).toHaveTextContent('5');

    fireEvent.click(screen.getByTestId('star-2'));

    expect(screen.getByTestId('current-rating')).toHaveTextContent('2');
  });

  it('should work without onChange callback', () => {
    render(<StarRating value={3} />);

    const star = screen.getByTestId('star-4');
    
    // Não deve lançar erro
    expect(() => fireEvent.click(star)).not.toThrow();
  });
});
