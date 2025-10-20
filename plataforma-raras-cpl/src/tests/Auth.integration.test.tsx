import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';

// Mock do TokenStorage
class TokenStorage {
  private static readonly TOKEN_KEY = 'hpo_auth_token';
  private static readonly EXPIRY_KEY = 'hpo_token_expiry';

  static saveToken(token: string, expiresInHours: number = 24): void {
    const expiryTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
  }

  static getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry, 10)) {
      this.clearToken();
      return null;
    }

    return token;
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static hasToken(): boolean {
    return this.getToken() !== null;
  }

  static isExpired(): boolean {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  }
}

// Mock do AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock da aplicação de autenticação
const MockAuthApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar token ao montar
    if (TokenStorage.hasToken() && !TokenStorage.isExpired()) {
      setIsAuthenticated(true);
      setUser({ email: 'user@test.com', role: 'TRANSLATOR' });
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError('');

    if (email === 'admin@test.com' && password === 'admin123') {
      const mockToken = 'mock-jwt-token-12345';
      TokenStorage.saveToken(mockToken, 24);
      setIsAuthenticated(true);
      setUser({ email, role: 'ADMIN' });
    } else {
      setError('Credenciais inválidas');
      throw new Error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    TokenStorage.clearToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <div data-testid="login-page">
        <h1>Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            handleLogin(email, password);
          }}
        >
          <input
            data-testid="email-input"
            name="email"
            type="email"
            placeholder="Email"
          />
          <input
            data-testid="password-input"
            name="password"
            type="password"
            placeholder="Password"
          />
          <button data-testid="login-button" type="submit">
            Entrar
          </button>
        </form>
        {error && <div data-testid="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <h1>Dashboard</h1>
      <div data-testid="user-info">
        {user?.email} - {user?.role}
      </div>
      <button data-testid="logout-button" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
};

describe('Auth Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should show login page when not authenticated', () => {
      render(<MockAuthApp />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('should login successfully with valid credentials', async () => {
      render(<MockAuthApp />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.getByTestId('user-info')).toHaveTextContent('admin@test.com - ADMIN');
      });
    });

    it('should show error message with invalid credentials', async () => {
      render(<MockAuthApp />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
      });

      // Deve permanecer na página de login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should save token to localStorage on successful login', async () => {
      render(<MockAuthApp />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(TokenStorage.getToken()).toBe('mock-jwt-token-12345');
        expect(localStorage.getItem('hpo_auth_token')).toBe('mock-jwt-token-12345');
        expect(localStorage.getItem('hpo_token_expiry')).toBeTruthy();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout and clear token', async () => {
      // Pre-set authentication
      TokenStorage.saveToken('existing-token', 24);

      render(<MockAuthApp />);

      // Deve mostrar dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Clicar em logout
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(TokenStorage.getToken()).toBeNull();
        expect(localStorage.getItem('hpo_auth_token')).toBeNull();
      });
    });

    it('should redirect to login after logout', async () => {
      TokenStorage.saveToken('token', 24);
      render(<MockAuthApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Token Persistence', () => {
    it('should restore session from localStorage on mount', async () => {
      TokenStorage.saveToken('existing-token', 24);

      render(<MockAuthApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });

    it('should show login if token is expired', async () => {
      // Salvar token expirado (no passado)
      const pastTime = Date.now() - 1000;
      localStorage.setItem('hpo_auth_token', 'expired-token');
      localStorage.setItem('hpo_token_expiry', pastTime.toString());

      render(<MockAuthApp />);

      // Deve mostrar login imediatamente
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(TokenStorage.getToken()).toBeNull();
    });

    it('should show login if no token exists', () => {
      render(<MockAuthApp />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(TokenStorage.hasToken()).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to dashboard when authenticated', async () => {
      TokenStorage.saveToken('valid-token', 24);

      render(<MockAuthApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should deny access to dashboard when not authenticated', () => {
      render(<MockAuthApp />);

      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should maintain session across component re-renders', async () => {
      TokenStorage.saveToken('token', 24);

      const { rerender } = render(<MockAuthApp />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Re-render
      rerender(<MockAuthApp />);

      // Deve manter autenticação
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(TokenStorage.hasToken()).toBe(true);
    });

    it('should handle multiple login attempts', async () => {
      render(<MockAuthApp />);

      // Primeira tentativa (falha)
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@test.com' } });
      fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Segunda tentativa (sucesso)
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'admin@test.com' } });
      fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'admin123' } });
      fireEvent.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });
});
