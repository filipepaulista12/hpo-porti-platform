/**
 * UnauthorizedAccess.test.tsx
 * 
 * Testes para o componente de feedback de acesso não autorizado.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnauthorizedAccess from '../components/UnauthorizedAccess';

describe('UnauthorizedAccess Component', () => {
  const defaultProps = {
    requiredRole: 'ADMIN',
    userRole: 'TRANSLATOR',
    message: 'Você não tem permissão para acessar esta área.'
  };

  it('deve renderizar sem erros', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
  });

  it('deve exibir a mensagem customizada', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('deve exibir o role do usuário em português', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText('Tradutor')).toBeInTheDocument();
  });

  it('deve exibir o role necessário em português', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText(/Administrador ou superior/i)).toBeInTheDocument();
  });

  it('deve exibir emoji de cadeado', () => {
    const { container } = render(<UnauthorizedAccess {...defaultProps} />);
    expect(container.textContent).toContain('🔒');
  });

  it('deve ter botão "Voltar"', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText('← Voltar')).toBeInTheDocument();
  });

  it('deve ter botão "Início"', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText('🏠 Início')).toBeInTheDocument();
  });

  it('deve chamar history.back() ao clicar em Voltar', () => {
    const mockBack = vi.fn();
    window.history.back = mockBack;

    render(<UnauthorizedAccess {...defaultProps} />);
    const backButton = screen.getByText('← Voltar');
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('deve redirecionar para home ao clicar em Início', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<UnauthorizedAccess {...defaultProps} />);
    const homeButton = screen.getByText('🏠 Início');
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  it('deve exibir dica de contato com administrador', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    expect(screen.getByText(/Entre em contato com um administrador/i)).toBeInTheDocument();
  });

  it('deve renderizar com diferentes roles', () => {
    const { rerender } = render(
      <UnauthorizedAccess 
        requiredRole="MODERATOR"
        userRole="TRANSLATOR"
        message="Teste"
      />
    );
    expect(screen.getByText('Tradutor')).toBeInTheDocument();
    expect(screen.getByText(/Moderador ou superior/i)).toBeInTheDocument();

    rerender(
      <UnauthorizedAccess 
        requiredRole="ADMIN"
        userRole="MODERATOR"
        message="Teste"
      />
    );
    expect(screen.getByText('Moderador')).toBeInTheDocument();
  });

  it('deve ter estilos responsivos aplicados', () => {
    const { container } = render(<UnauthorizedAccess {...defaultProps} />);
    const mainDiv = container.firstChild as HTMLElement;
    
    expect(mainDiv.style.display).toBe('flex');
    expect(mainDiv.style.flexDirection).toBe('column');
    expect(mainDiv.style.textAlign).toBe('center');
  });

  it('deve exibir separador visual entre informações', () => {
    const { container } = render(<UnauthorizedAccess {...defaultProps} />);
    const separators = container.querySelectorAll('[style*="height: 1px"]');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('deve ter acessibilidade adequada', () => {
    render(<UnauthorizedAccess {...defaultProps} />);
    
    // Verifica se tem heading
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Acesso Restrito');
    
    // Verifica se botões são acessíveis
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  describe('Cenários de Uso Real', () => {
    it('cenário: TRANSLATOR tenta acessar Admin Dashboard', () => {
      render(
        <UnauthorizedAccess 
          requiredRole="MODERATOR"
          userRole="TRANSLATOR"
          message="Apenas moderadores e administradores podem acessar o painel administrativo."
        />
      );
      
      expect(screen.getByText('Tradutor')).toBeInTheDocument();
      expect(screen.getByText(/Moderador ou superior/i)).toBeInTheDocument();
      expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument();
    });

    it('cenário: MODERATOR tenta aprovar tradução', () => {
      render(
        <UnauthorizedAccess 
          requiredRole="ADMIN"
          userRole="MODERATOR"
          message="Apenas administradores podem aprovar traduções."
        />
      );
      
      expect(screen.getByText('Moderador')).toBeInTheDocument();
      expect(screen.getByText(/Administrador ou superior/i)).toBeInTheDocument();
      expect(screen.getByText(/aprovar traduções/i)).toBeInTheDocument();
    });

    it('cenário: TRANSLATOR tenta banir usuário', () => {
      render(
        <UnauthorizedAccess 
          requiredRole="ADMIN"
          userRole="TRANSLATOR"
          message="Apenas administradores podem gerenciar usuários."
        />
      );
      
      expect(screen.getByText(/gerenciar usuários/i)).toBeInTheDocument();
    });
  });

  describe('Interações do Usuário', () => {
    it('deve ter efeito hover nos botões', () => {
      const { container } = render(<UnauthorizedAccess {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        expect(button).toHaveStyle({ cursor: 'pointer' });
      });
    });

    it('deve ter cores distintas para cada botão', () => {
      const { container } = render(<UnauthorizedAccess {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      
      expect(buttons[0]).toHaveStyle({ backgroundColor: '#3b82f6' }); // Azul - Voltar
      expect(buttons[1]).toHaveStyle({ backgroundColor: '#f3f4f6' }); // Cinza - Início
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com role desconhecido', () => {
      render(
        <UnauthorizedAccess 
          requiredRole="UNKNOWN_ROLE"
          userRole="ALSO_UNKNOWN"
          message="Teste"
        />
      );
      
      // Deve renderizar o próprio role se não encontrar tradução
      expect(screen.getByText('ALSO_UNKNOWN')).toBeInTheDocument();
    });

    it('deve lidar com mensagem muito longa', () => {
      const longMessage = 'A'.repeat(500);
      render(
        <UnauthorizedAccess 
          requiredRole="ADMIN"
          userRole="TRANSLATOR"
          message={longMessage}
        />
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('deve lidar com mensagem vazia', () => {
      render(
        <UnauthorizedAccess 
          requiredRole="ADMIN"
          userRole="TRANSLATOR"
          message=""
        />
      );
      
      expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    });
  });
});
