import api from './api';
import { mockUser, delay } from './mock';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  institution?: string;
  specialty?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'TRANSLATOR' | 'REVIEWER' | 'VALIDATOR' | 'ADMIN';
  points: number;
  level: number;
  streak: number;
  institution?: string;
  specialty?: string;
  country?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      // Salvar token e usuário no localStorage
      localStorage.setItem('hpo_token', response.data.token);
      localStorage.setItem('hpo_user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      // Se backend não responder, usar mock
      console.warn('Backend não disponível, usando dados mock');
      await delay(500);
      
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        user: { ...mockUser, email: data.email, name: data.name }
      };
      
      localStorage.setItem('hpo_token', mockResponse.token);
      localStorage.setItem('hpo_user', JSON.stringify(mockResponse.user));
      
      return mockResponse;
    }
  }

  /**
   * Fazer login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      // Salvar token e usuário no localStorage
      localStorage.setItem('hpo_token', response.data.token);
      localStorage.setItem('hpo_user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      // Se backend não responder, usar mock
      console.warn('Backend não disponível, usando dados mock');
      await delay(500);
      
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        user: { ...mockUser, email: data.email }
      };
      
      localStorage.setItem('hpo_token', mockResponse.token);
      localStorage.setItem('hpo_user', JSON.stringify(mockResponse.user));
      
      return mockResponse;
    }
  }

  /**
   * Fazer logout
   */
  logout(): void {
    localStorage.removeItem('hpo_token');
    localStorage.removeItem('hpo_user');
  }

  /**
   * Obter dados do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    
    // Atualizar localStorage
    localStorage.setItem('hpo_user', JSON.stringify(response.data));
    
    return response.data;
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('hpo_token');
  }

  /**
   * Obter usuário do localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('hpo_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Obter token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('hpo_token');
  }
}

export default new AuthService();
