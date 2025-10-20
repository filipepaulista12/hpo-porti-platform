import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock do TokenStorage (extraído do ProductionHPOApp)
interface StoredToken {
  token: string;
  expiresAt: number;
}

class TokenStorage {
  private static readonly TOKEN_KEY = 'hpo_auth_token';
  private static readonly EXPIRY_KEY = 'hpo_token_expiry';

  static saveToken(token: string, expiresInHours: number = 24): void {
    const expiryTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
    
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  static getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const expiry = localStorage.getItem(this.EXPIRY_KEY);

      if (!token || !expiry) {
        return null;
      }

      if (this.isExpired()) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static isExpired(): boolean {
    try {
      const expiry = localStorage.getItem(this.EXPIRY_KEY);
      
      if (!expiry) {
        return true;
      }

      return Date.now() > parseInt(expiry, 10);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  static hasToken(): boolean {
    return this.getToken() !== null;
  }
}

describe('TokenStorage', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token and expiry time to localStorage', () => {
      const token = 'test-token-123';
      
      TokenStorage.saveToken(token, 24);

      expect(localStorage.getItem('hpo_auth_token')).toBe(token);
      expect(localStorage.getItem('hpo_token_expiry')).toBeTruthy();
    });

    it('should set expiry time correctly', () => {
      const token = 'test-token';
      const hours = 12;
      const beforeTime = Date.now() + (hours * 60 * 60 * 1000);

      TokenStorage.saveToken(token, hours);

      const savedExpiry = parseInt(localStorage.getItem('hpo_token_expiry') || '0', 10);
      const afterTime = Date.now() + (hours * 60 * 60 * 1000);

      // A diferença deve ser pequena (< 1 segundo)
      expect(savedExpiry).toBeGreaterThanOrEqual(beforeTime - 1000);
      expect(savedExpiry).toBeLessThanOrEqual(afterTime + 1000);
    });
  });

  describe('getToken', () => {
    it('should return token if not expired', () => {
      const token = 'valid-token';
      TokenStorage.saveToken(token, 24);

      expect(TokenStorage.getToken()).toBe(token);
    });

    it('should return null if token does not exist', () => {
      expect(TokenStorage.getToken()).toBeNull();
    });

    it('should return null and clear token if expired', () => {
      const token = 'expired-token';
      const pastTime = Date.now() - 1000; // 1 segundo no passado

      localStorage.setItem('hpo_auth_token', token);
      localStorage.setItem('hpo_token_expiry', pastTime.toString());

      expect(TokenStorage.getToken()).toBeNull();
      expect(localStorage.getItem('hpo_auth_token')).toBeNull();
      expect(localStorage.getItem('hpo_token_expiry')).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('should return false for valid token', () => {
      TokenStorage.saveToken('test-token', 24);
      expect(TokenStorage.isExpired()).toBe(false);
    });

    it('should return true if no expiry is set', () => {
      expect(TokenStorage.isExpired()).toBe(true);
    });

    it('should return true if token is expired', () => {
      const pastTime = Date.now() - 1000;
      localStorage.setItem('hpo_token_expiry', pastTime.toString());

      expect(TokenStorage.isExpired()).toBe(true);
    });
  });

  describe('clearToken', () => {
    it('should remove token and expiry from localStorage', () => {
      TokenStorage.saveToken('test-token', 24);
      
      expect(localStorage.getItem('hpo_auth_token')).toBeTruthy();
      expect(localStorage.getItem('hpo_token_expiry')).toBeTruthy();

      TokenStorage.clearToken();

      expect(localStorage.getItem('hpo_auth_token')).toBeNull();
      expect(localStorage.getItem('hpo_token_expiry')).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('should return true if valid token exists', () => {
      TokenStorage.saveToken('test-token', 24);
      expect(TokenStorage.hasToken()).toBe(true);
    });

    it('should return false if no token exists', () => {
      expect(TokenStorage.hasToken()).toBe(false);
    });

    it('should return false if token is expired', () => {
      const pastTime = Date.now() - 1000;
      localStorage.setItem('hpo_auth_token', 'expired-token');
      localStorage.setItem('hpo_token_expiry', pastTime.toString());

      expect(TokenStorage.hasToken()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Simular erro no localStorage
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Não deve lançar erro
      expect(() => TokenStorage.saveToken('test', 24)).not.toThrow();

      // Restaurar
      Storage.prototype.setItem = originalSetItem;
    });
  });
});
