import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

// Mock do Tooltip (extraído do ProductionHPOApp)
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      data-testid="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span data-testid="tooltip-content" data-position={position}>
          {text}
        </span>
      )}
    </span>
  );
};

describe('Tooltip', () => {
  it('should render children without tooltip initially', () => {
    render(
      <Tooltip text="Help text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter', async () => {
    render(
      <Tooltip text="This is a helpful tooltip">
        <button>Button</button>
      </Tooltip>
    );

    const wrapper = screen.getByTestId('tooltip-wrapper');
    fireEvent.mouseEnter(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(screen.getByText('This is a helpful tooltip')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip text="Tooltip text">
        <span>Trigger</span>
      </Tooltip>
    );

    const wrapper = screen.getByTestId('tooltip-wrapper');
    
    // Show tooltip
    fireEvent.mouseEnter(wrapper);
    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    // Hide tooltip
    fireEvent.mouseLeave(wrapper);
    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });
  });

  it('should support different positions', async () => {
    const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

    for (const position of positions) {
      const { unmount } = render(
        <Tooltip text="Positioned tooltip" position={position}>
          <div>Content</div>
        </Tooltip>
      );

      const wrapper = screen.getByTestId('tooltip-wrapper');
      fireEvent.mouseEnter(wrapper);

      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip-content');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute('data-position', position);
      });

      unmount();
    }
  });

  it('should default to top position', async () => {
    render(
      <Tooltip text="Default position">
        <span>Element</span>
      </Tooltip>
    );

    const wrapper = screen.getByTestId('tooltip-wrapper');
    fireEvent.mouseEnter(wrapper);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip-content');
      expect(tooltip).toHaveAttribute('data-position', 'top');
    });
  });

  it('should handle long text', async () => {
    const longText = 'This is a very long tooltip text that should wrap properly and maintain readability even when it exceeds the maximum width constraint.';

    render(
      <Tooltip text={longText}>
        <button>Info</button>
      </Tooltip>
    );

    const wrapper = screen.getByTestId('tooltip-wrapper');
    fireEvent.mouseEnter(wrapper);

    await waitFor(() => {
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  it('should handle rapid mouse enter/leave', async () => {
    render(
      <Tooltip text="Quick tooltip">
        <div>Target</div>
      </Tooltip>
    );

    const wrapper = screen.getByTestId('tooltip-wrapper');

    // Rapid hovering
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    fireEvent.mouseEnter(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(wrapper);

    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });
  });
});
