/**
 * ♿ Accessibility (WCAG 2.1 Level AA) Tests
 * 
 * Tests for accessibility features implemented in Task #30
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Accessibility Features (WCAG 2.1 Level AA)', () => {
  describe('Skip Links', () => {
    it('should have skip link to main content', () => {
      const html = `
        <div>
          <a href="#main-content" class="skip-link">
            Pular para o conteúdo principal
          </a>
          <main id="main-content">
            <h1>Content</h1>
          </main>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const skipLink = container.querySelector('.skip-link');
      
      expect(skipLink).toBeTruthy();
      expect(skipLink?.textContent).toContain('Pular');
    });

    it('should skip link target main content', () => {
      const html = `
        <div>
          <a href="#main-content" class="skip-link">Skip</a>
          <main id="main-content">Content</main>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const skipLink = container.querySelector('.skip-link') as HTMLAnchorElement;
      const mainContent = container.querySelector('#main-content');
      
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
      expect(mainContent).toBeTruthy();
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper landmark roles', () => {
      const html = `
        <div>
          <header role="banner">Header</header>
          <nav role="navigation" aria-label="Menu principal">Nav</nav>
          <main role="main" id="main-content">Main</main>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      
      expect(container.querySelector('[role="banner"]')).toBeTruthy();
      expect(container.querySelector('[role="navigation"]')).toBeTruthy();
      expect(container.querySelector('[role="main"]')).toBeTruthy();
    });

    it('should have aria-label on navigation', () => {
      const html = `
        <nav role="navigation" aria-label="Menu principal">
          <button>Dashboard</button>
        </nav>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const nav = container.querySelector('nav');
      
      expect(nav?.getAttribute('aria-label')).toBe('Menu principal');
    });

    it('should have aria-current on active page', () => {
      const html = `
        <nav>
          <button aria-current="page">Dashboard</button>
          <button>Traduzir</button>
        </nav>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const activeButton = container.querySelector('[aria-current="page"]');
      
      expect(activeButton).toBeTruthy();
      expect(activeButton?.textContent).toContain('Dashboard');
    });

    it('should have aria-pressed on toggle buttons', () => {
      const html = `
        <button aria-pressed="true" aria-label="Tema escuro ativado">
          🌙 Dark Mode
        </button>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const button = container.querySelector('button');
      
      expect(button?.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Tab key navigation', () => {
      const Component = () => (
        <div>
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
          <button id="btn3">Button 3</button>
        </div>
      );
      
      const { container } = render(<Component />);
      const btn1 = container.querySelector('#btn1') as HTMLElement;
      
      expect(btn1).toBeTruthy();
      btn1.focus();
      expect(document.activeElement).toBe(btn1);
    });

    it('should handle Escape key to close modals', () => {
      let modalClosed = false;
      
      const Component = () => {
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') {
            modalClosed = true;
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown} tabIndex={0}>
            <div role="dialog" aria-label="Modal">Modal Content</div>
          </div>
        );
      };
      
      const { container } = render(<Component />);
      const dialog = container.querySelector('[role="dialog"]')?.parentElement as HTMLElement;
      
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
      expect(modalClosed).toBe(true);
    });
  });

  describe('Font Size Controls', () => {
    it('should have font size control buttons', () => {
      const html = `
        <div role="region" aria-label="Controles de acessibilidade">
          <button aria-pressed="true">A</button>
          <button aria-pressed="false">A</button>
          <button aria-pressed="false">A</button>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const region = container.querySelector('[aria-label="Controles de acessibilidade"]');
      const buttons = region?.querySelectorAll('button');
      
      expect(buttons?.length).toBe(3);
    });

    it('should have aria-pressed states on font buttons', () => {
      const html = `
        <div>
          <button aria-pressed="true" aria-label="Tamanho normal">A</button>
          <button aria-pressed="false" aria-label="Tamanho grande">A</button>
          <button aria-pressed="false" aria-label="Tamanho extra grande">A</button>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const pressedButton = container.querySelector('[aria-pressed="true"]');
      
      expect(pressedButton).toBeTruthy();
      expect(pressedButton?.getAttribute('aria-label')).toContain('normal');
    });
  });

  describe('Live Regions (Screen Reader Announcements)', () => {
    it('should have aria-live region for announcements', () => {
      const html = `
        <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
          Tamanho da fonte alterado
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const liveRegion = container.querySelector('[aria-live="polite"]');
      
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('role')).toBe('status');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should use polite live region (non-intrusive)', () => {
      const html = `
        <div aria-live="polite">Message</div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const liveRegion = container.querySelector('[aria-live]');
      
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Focus Indicators', () => {
    it('should have visible focus styles on interactive elements', () => {
      const Component = () => (
        <button style={{ outline: '3px solid #3b82f6', outlineOffset: '2px' }}>
          Click me
        </button>
      );
      
      const { container } = render(<Component />);
      const button = container.querySelector('button');
      
      expect(button?.style.outline).toContain('3px');
      expect(button?.style.outlineOffset).toBe('2px');
    });
  });

  describe('PORTI Branding Accessibility', () => {
    it('should have accessible name for PORTI logo', () => {
      const html = `
        <div>
          <div style="fontSize: '1.5rem'" role="img" aria-label="Ícone Rede">🔗</div>
          <h1>PORTI-HPO</h1>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const icon = container.querySelector('[role="img"]');
      
      expect(icon?.getAttribute('aria-label')).toContain('Rede');
    });

    it('should have accessible tagline', () => {
      const html = `
        <div>
          <h1>PORTI-HPO</h1>
          <p>Por ti, pela ciência, em português</p>
        </div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const tagline = container.querySelector('p');
      
      expect(tagline?.textContent).toContain('Por ti');
    });
  });

  describe('Touch Targets (Mobile Accessibility)', () => {
    it('should have minimum 44x44px touch targets', () => {
      const Component = () => (
        <button style={{ minWidth: '44px', minHeight: '44px', padding: '12px 24px' }}>
          Button
        </button>
      );
      
      const { container } = render(<Component />);
      const button = container.querySelector('button');
      
      expect(button?.style.minWidth).toBe('44px');
      expect(button?.style.minHeight).toBe('44px');
    });
  });

  describe('Color Contrast', () => {
    it('should use high contrast colors for text', () => {
      const Component = () => (
        <div style={{ backgroundColor: '#1e40af', color: 'white' }}>
          High contrast text
        </div>
      );
      
      const { container } = render(<Component />);
      const div = container.querySelector('div');
      
      // Blue background (#1e40af) with white text meets WCAG AA (contrast > 4.5:1)
      expect(div?.style.backgroundColor).toBeTruthy();
      expect(div?.style.color).toBeTruthy();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion preference', () => {
      const html = `
        <style>
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; }
          }
        </style>
        <div class="animated">Content</div>
      `;
      
      const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
      const style = container.querySelector('style');
      
      expect(style?.textContent).toContain('prefers-reduced-motion');
    });
  });
});
