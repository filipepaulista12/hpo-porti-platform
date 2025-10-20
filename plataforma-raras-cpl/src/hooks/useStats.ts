import { useQuery } from '@tanstack/react-query';
import statsService from '../services/stats.service';

/**
 * Hook para obter estatísticas gerais
 */
export const useStatsOverview = () => {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => statsService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obter leaderboard
 */
export const useLeaderboard = (limit = 100) => {
  return useQuery({
    queryKey: ['stats', 'leaderboard', limit],
    queryFn: () => statsService.getLeaderboard(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obter minhas estatísticas
 */
export const useMyStats = () => {
  return useQuery({
    queryKey: ['stats', 'my'],
    queryFn: () => statsService.getMyStats(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

/**
 * Hook para obter estatísticas de outro usuário
 */
export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['stats', 'user', userId],
    queryFn: () => statsService.getUserStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
