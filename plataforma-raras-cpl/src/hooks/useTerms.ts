import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import termService, { GetTermsParams, HPOTerm } from '../services/term.service';

/**
 * Hook para listar termos com paginação e filtros
 */
export const useTerms = (params?: GetTermsParams) => {
  return useQuery({
    queryKey: ['terms', params],
    queryFn: () => termService.getTerms(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obter detalhes de um termo específico
 */
export const useTerm = (id: string) => {
  return useQuery({
    queryKey: ['term', id],
    queryFn: () => termService.getTerm(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obter termos recomendados
 */
export const useRecommendedTerms = () => {
  return useQuery({
    queryKey: ['terms', 'recommended'],
    queryFn: () => termService.getRecommendedTerms(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para buscar termos
 */
export const useSearchTerms = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['terms', 'search', query],
    queryFn: () => termService.searchTerms(query),
    enabled: enabled && query.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};
