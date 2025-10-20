import api from './api';
import { HPOTerm } from './term.service';
import { User } from './auth.service';

export interface Translation {
  id: string;
  hpoTermId: string;
  translatorId: string;
  label: string;
  definition?: string;
  synonyms: string[];
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED';
  isLegacy: boolean;
  source: 'USER' | 'LEGACY' | 'AI_ASSISTED';
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relações
  hpoTerm?: HPOTerm;
  translator?: User;
  validations?: Validation[];
  comments?: Comment[];
}

export interface Validation {
  id: string;
  translationId: string;
  validatorId: string;
  rating: number;
  decision: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
  feedback?: string;
  createdAt: string;
  
  validator?: User;
}

export interface Comment {
  id: string;
  translationId: string;
  userId: string;
  content: string;
  createdAt: string;
  
  user?: User;
}

export interface CreateTranslationData {
  hpoTermId: string;
  label: string;
  definition?: string;
  synonyms?: string[];
  source?: 'USER' | 'AI_ASSISTED';
}

export interface UpdateTranslationData {
  label?: string;
  definition?: string;
  synonyms?: string[];
}

class TranslationService {
  /**
   * Criar nova tradução
   */
  async createTranslation(data: CreateTranslationData): Promise<Translation> {
    const response = await api.post<Translation>('/translations', data);
    return response.data;
  }

  /**
   * Obter tradução por ID
   */
  async getTranslation(id: string): Promise<Translation> {
    const response = await api.get<Translation>(`/translations/${id}`);
    return response.data;
  }

  /**
   * Atualizar tradução (apenas próprias, status DRAFT)
   */
  async updateTranslation(id: string, data: UpdateTranslationData): Promise<Translation> {
    const response = await api.put<Translation>(`/translations/${id}`, data);
    return response.data;
  }

  /**
   * Deletar tradução (apenas próprias, status DRAFT)
   */
  async deleteTranslation(id: string): Promise<void> {
    await api.delete(`/translations/${id}`);
  }

  /**
   * Obter minhas traduções
   */
  async getMyTranslations(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get<{ data: Translation[]; pagination: any }>('/translations/my-translations', { params });
    return response.data;
  }

  /**
   * Obter traduções de um termo específico
   */
  async getTermTranslations(termId: string): Promise<Translation[]> {
    const response = await api.get<Translation[]>(`/terms/${termId}/translations`);
    return response.data;
  }

  /**
   * Adicionar comentário a uma tradução
   */
  async addComment(translationId: string, content: string): Promise<Comment> {
    const response = await api.post<Comment>(`/translations/${translationId}/comments`, { content });
    return response.data;
  }
}

export default new TranslationService();
