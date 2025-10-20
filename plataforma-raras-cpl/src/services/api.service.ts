// API Service para comunicação com backend HPO
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface HPOTerm {
  id: string;
  hpoId: string;
  name: string;
  definition?: string;
  synonyms?: string[];
  isObsolete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Translation {
  id: string;
  termId: string;
  userId: string;
  translation: string;
  confidence: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'LEGACY_PENDING';
  isLegacy: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'TRANSLATOR' | 'REVIEWER' | 'VALIDATOR' | 'ADMIN';
  points: number;
  level: number;
  createdAt: string;
}

export interface StatsOverview {
  totalTerms: number;
  translatedTerms: number;
  pendingTerms: number;
  validatedTerms: number;
  totalUsers: number;
  activeTranslators: number;
}

class APIService {
  private async fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    return this.fetch('/health');
  }

  // Statistics
  async getStatsOverview(): Promise<StatsOverview> {
    return this.fetch('/api/stats/overview');
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: { email: string; password: string; name: string }) {
    const response = await this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // HPO Terms
  async getTerms(options?: {
    page?: number;
    limit?: number;
    search?: string;
    hasTranslation?: boolean;
    status?: string;
  }): Promise<{ terms: HPOTerm[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.hasTranslation !== undefined) {
      params.append('hasTranslation', options.hasTranslation.toString());
    }
    if (options?.status) params.append('status', options.status);

    const query = params.toString();
    return this.fetch(`/api/terms${query ? `?${query}` : ''}`);
  }

  async getTerm(hpoId: string): Promise<HPOTerm> {
    return this.fetch(`/api/terms/${hpoId}`);
  }

  // Translations
  async getTranslations(termId?: string): Promise<Translation[]> {
    const endpoint = termId ? `/api/translations?termId=${termId}` : '/api/translations';
    return this.fetch(endpoint);
  }

  async createTranslation(data: {
    termId: string;
    translation: string;
    confidence: number;
  }): Promise<Translation> {
    return this.fetch('/api/translations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTranslation(id: string, data: {
    translation?: string;
    confidence?: number;
  }): Promise<Translation> {
    return this.fetch(`/api/translations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Validations
  async validateTranslation(translationId: string, rating: number, comment?: string) {
    return this.fetch('/api/validations', {
      method: 'POST',
      body: JSON.stringify({
        translationId,
        rating,
        comment,
      }),
    });
  }

  // User Progress
  async getUserStats(userId?: string) {
    const endpoint = userId ? `/api/users/${userId}/stats` : '/api/users/me/stats';
    return this.fetch(endpoint);
  }

  async getUserRanking() {
    return this.fetch('/api/users/ranking');
  }
}

export const apiService = new APIService();
export default apiService;