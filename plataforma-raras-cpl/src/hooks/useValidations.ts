import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import validationService, { CreateValidationData } from '../services/validation.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para validar tradução
 */
export const useValidateTranslation = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (data: CreateValidationData) => validationService.validateTranslation(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['validations'] });
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      // Atualizar dados do usuário (pontos)
      refreshUser();
    },
  });
};

/**
 * Hook para obter traduções pendentes de validação
 */
export const usePendingValidations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['validations', 'pending', params],
    queryFn: () => validationService.getPendingValidations(params),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

/**
 * Hook para obter minhas validações
 */
export const useMyValidations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['validations', 'my', params],
    queryFn: () => validationService.getMyValidations(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook para obter validações de uma tradução
 */
export const useTranslationValidations = (translationId: string) => {
  return useQuery({
    queryKey: ['validations', 'translation', translationId],
    queryFn: () => validationService.getTranslationValidations(translationId),
    enabled: !!translationId,
  });
};
