import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import translationService, { CreateTranslationData, UpdateTranslationData } from '../services/translation.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para criar tradução
 */
export const useCreateTranslation = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (data: CreateTranslationData) => translationService.createTranslation(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      // Atualizar dados do usuário (pontos, nível)
      refreshUser();
    },
  });
};

/**
 * Hook para obter minhas traduções
 */
export const useMyTranslations = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['translations', 'my', params],
    queryFn: () => translationService.getMyTranslations(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook para obter uma tradução específica
 */
export const useTranslation = (id: string) => {
  return useQuery({
    queryKey: ['translation', id],
    queryFn: () => translationService.getTranslation(id),
    enabled: !!id,
  });
};

/**
 * Hook para atualizar tradução
 */
export const useUpdateTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTranslationData }) =>
      translationService.updateTranslation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['translation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    },
  });
};

/**
 * Hook para deletar tradução
 */
export const useDeleteTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => translationService.deleteTranslation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    },
  });
};

/**
 * Hook para adicionar comentário
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ translationId, content }: { translationId: string; content: string }) =>
      translationService.addComment(translationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['translation', variables.translationId] });
    },
  });
};

/**
 * Hook para obter traduções de um termo
 */
export const useTermTranslations = (termId: string) => {
  return useQuery({
    queryKey: ['translations', 'term', termId],
    queryFn: () => translationService.getTermTranslations(termId),
    enabled: !!termId,
  });
};
