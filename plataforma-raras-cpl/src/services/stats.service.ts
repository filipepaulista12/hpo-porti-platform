import api from './api';
import { User } from './auth.service';
import { mockStats, mockLeaderboard, delay } from './mock';

export interface StatsOverview {
  totalTerms: number;
  translatedTerms: number;
  approvedTerms: number;
  pendingTerms: number;
  activeUsers: number;
  averageApprovalRate: number;
  progressPercentage: number;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  points: number;
  translationsCount: number;
  validationsCount: number;
  approvalRate: number;
}

export interface MyStats {
  translationsCount: number;
  validationsCount: number;
  approvedTranslations: number;
  rejectedTranslations: number;
  pendingTranslations: number;
  approvalRate: number;
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt?: string;
}

class StatsService {
  /**
   * Obter visão geral das estatísticas (público)
   */
  async getOverview(): Promise<StatsOverview> {
    try {
      const response = await api.get<StatsOverview>('/stats/overview');
      return response.data;
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock');
      await delay(300);
      return {
        totalTerms: mockStats.totalTerms,
        translatedTerms: mockStats.translatedTerms,
        approvedTerms: mockStats.translatedTerms - mockStats.pendingValidation,
        pendingTerms: mockStats.pendingValidation,
        activeUsers: mockStats.activeTranslators,
        averageApprovalRate: 85.5,
        progressPercentage: (mockStats.translatedTerms / mockStats.totalTerms) * 100
      };
    }
  }

  /**
   * Obter leaderboard (público)
   */
  async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get<LeaderboardEntry[]>('/stats/leaderboard', { params: { limit } });
      return response.data;
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock');
      await delay(300);
      return mockLeaderboard.map((entry, index) => ({
        user: { 
          id: entry.id, 
          name: entry.name, 
          email: '', 
          role: 'TRANSLATOR' as const,
          points: entry.points,
          level: Math.floor(entry.points / 500) + 1,
          streak: 0
        },
        rank: index + 1,
        points: entry.points,
        translationsCount: entry.translations,
        validationsCount: 0,
        approvalRate: 90 + Math.random() * 10
      }));
    }
  }

  /**
   * Obter minhas estatísticas (autenticado)
   */
  async getMyStats(): Promise<MyStats> {
    const response = await api.get<MyStats>('/stats/my-stats');
    return response.data;
  }

  /**
   * Obter estatísticas de um usuário específico
   */
  async getUserStats(userId: string): Promise<MyStats> {
    const response = await api.get<MyStats>(`/stats/user/${userId}`);
    return response.data;
  }
}

export default new StatsService();
