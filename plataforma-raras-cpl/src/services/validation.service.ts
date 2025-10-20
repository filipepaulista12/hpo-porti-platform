import api from './api';
import { Translation, Validation } from './translation.service';

export interface CreateValidationData {
  translationId: string;
  rating: number; // 1-5 (Likert)
  decision: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
  feedback?: string;
}

class ValidationService {
  /**
   * Validar uma tradução (apenas REVIEWER ou superior)
   */
  async validateTranslation(data: CreateValidationData): Promise<Validation> {
    const response = await api.post<Validation>('/validations', data);
    return response.data;
  }

  /**
   * Obter fila de traduções pendentes de validação
   */
  async getPendingValidations(params?: { page?: number; limit?: number }) {
    const response = await api.get<{ data: Translation[]; pagination: any }>('/validations/pending', { params });
    return response.data;
  }

  /**
   * Obter minhas validações
   */
  async getMyValidations(params?: { page?: number; limit?: number }) {
    const response = await api.get<{ data: Validation[]; pagination: any }>('/validations/my-validations', { params });
    return response.data;
  }

  /**
   * Obter validações de uma tradução específica
   */
  async getTranslationValidations(translationId: string): Promise<Validation[]> {
    const response = await api.get<Validation[]>(`/translations/${translationId}/validations`);
    return response.data;
  }
}

export default new ValidationService();
