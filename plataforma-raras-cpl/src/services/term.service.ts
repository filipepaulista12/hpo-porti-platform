import api from './api';

export interface HPOTerm {
  id: string;
  hpoId: string;
  label: string;
  definition?: string;
  synonyms: string[];
  category?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  translationStatus: 'NOT_TRANSLATED' | 'LEGACY_PENDING' | 'PENDING_REVIEW' | 'PENDING_VALIDATION' | 'APPROVED';
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTermsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  difficulty?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class TermService {
  /**
   * Listar termos HPO com filtros e paginação
   */
  async getTerms(params?: GetTermsParams): Promise<PaginatedResponse<HPOTerm>> {
    const response = await api.get<PaginatedResponse<HPOTerm>>('/terms', { params });
    return response.data;
  }

  /**
   * Obter detalhes de um termo específico
   */
  async getTerm(id: string): Promise<HPOTerm> {
    const response = await api.get<HPOTerm>(`/terms/${id}`);
    return response.data;
  }

  /**
   * Obter termos recomendados baseado no perfil do usuário
   */
  async getRecommendedTerms(): Promise<HPOTerm[]> {
    const response = await api.get<HPOTerm[]>('/terms/recommended/for-me');
    return response.data;
  }

  /**
   * Buscar termos por texto
   */
  async searchTerms(query: string, limit = 10): Promise<HPOTerm[]> {
    const response = await this.getTerms({ search: query, limit });
    return response.data;
  }

  /**
   * Obter termos por categoria
   */
  async getTermsByCategory(category: string): Promise<PaginatedResponse<HPOTerm>> {
    return this.getTerms({ category });
  }

  /**
   * Obter termos por status de tradução
   */
  async getTermsByStatus(status: string): Promise<PaginatedResponse<HPOTerm>> {
    return this.getTerms({ status });
  }

  /**
   * Obter termos por dificuldade
   */
  async getTermsByDifficulty(difficulty: string): Promise<PaginatedResponse<HPOTerm>> {
    return this.getTerms({ difficulty });
  }
}

export default new TermService();
