import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/gamification/rules
 * Get all gamification rules and point system
 */
router.get('/rules', authenticate, async (req: Request, res: Response) => {
  try {
    const pointRules = [
      {
        id: 1,
        action: 'TRANSLATE_TERM',
        actionName: 'Traduzir Termo',
        points: 10,
        icon: '📝',
        description: 'Submeter uma nova tradução para review',
        frequency: 'Por tradução',
        color: '#3b82f6'
      },
      {
        id: 2,
        action: 'TRANSLATION_APPROVED',
        actionName: 'Tradução Aprovada',
        points: 25,
        icon: '✅',
        description: 'Sua tradução foi aprovada por revisores',
        frequency: 'Por aprovação',
        color: '#10b981'
      },
      {
        id: 3,
        action: 'REVIEW_TRANSLATION',
        actionName: 'Revisar Tradução',
        points: 15,
        icon: '🔍',
        description: 'Revisar e votar em traduções pendentes (REVIEWER+)',
        frequency: 'Por revisão',
        color: '#8b5cf6'
      },
      {
        id: 4,
        action: 'HIGH_QUALITY_TRANSLATION',
        actionName: 'Tradução de Alta Qualidade',
        points: 50,
        icon: '⭐',
        description: 'Tradução aprovada com nota média ≥ 4.5',
        frequency: 'Bônus',
        color: '#fbbf24'
      },
      {
        id: 5,
        action: 'COMPLETE_PROFILE',
        actionName: 'Preencher Perfil Completo',
        points: 100,
        icon: '📋',
        description: 'Completar 100% do perfil (dados pessoais + profissionais + eHEALS)',
        frequency: 'Uma vez',
        color: '#f59e0b'
      },
      {
        id: 6,
        action: 'CONNECT_ORCID',
        actionName: 'Conectar ORCID',
        points: 50,
        icon: '🔗',
        description: 'Vincular conta ORCID para autenticidade científica',
        frequency: 'Uma vez',
        color: '#06b6d4'
      },
      {
        id: 7,
        action: 'DAILY_LOGIN',
        actionName: 'Login Diário',
        points: 5,
        icon: '📅',
        description: 'Fazer login consecutivo por dia',
        frequency: 'Diário',
        color: '#6366f1'
      },
      {
        id: 8,
        action: 'STREAK_7_DAYS',
        actionName: 'Streak 7 dias',
        points: 50,
        icon: '🔥',
        description: 'Contribuir por 7 dias consecutivos',
        frequency: 'Bônus',
        color: '#ef4444'
      },
      {
        id: 9,
        action: 'STREAK_30_DAYS',
        actionName: 'Streak 30 dias',
        points: 200,
        icon: '🏆',
        description: 'Contribuir por 30 dias consecutivos',
        frequency: 'Bônus',
        color: '#dc2626'
      },
      {
        id: 10,
        action: 'REFER_FRIEND',
        actionName: 'Convidar Amigo',
        points: 75,
        icon: '💌',
        description: 'Amigo aceita convite e faz primeira contribuição',
        frequency: 'Por convite aceito',
        color: '#ec4899'
      },
      {
        id: 11,
        action: 'COMMENT_TRANSLATION',
        actionName: 'Comentar Tradução',
        points: 5,
        icon: '💬',
        description: 'Adicionar comentário construtivo em tradução',
        frequency: 'Por comentário',
        color: '#14b8a6'
      },
      {
        id: 12,
        action: 'TOP_10_MONTHLY',
        actionName: 'Top 10 no Ranking Mensal',
        points: 300,
        icon: '🥇',
        description: 'Ficar entre os 10 melhores do mês',
        frequency: 'Mensal',
        color: '#f59e0b'
      }
    ];

    const levels = [
      { 
        level: 1, 
        minPoints: 0, 
        maxPoints: 99, 
        title: 'Iniciante', 
        icon: '🌱', 
        color: '#94a3b8',
        benefits: ['Acesso à plataforma', 'Traduzir termos']
      },
      { 
        level: 2, 
        minPoints: 100, 
        maxPoints: 249, 
        title: 'Aprendiz', 
        icon: '📚', 
        color: '#60a5fa',
        benefits: ['Badge de Aprendiz', '+5% velocidade de aprovação']
      },
      { 
        level: 3, 
        minPoints: 250, 
        maxPoints: 499, 
        title: 'Colaborador', 
        icon: '🤝', 
        color: '#34d399',
        benefits: ['Badge de Colaborador', 'Acesso a recursos avançados']
      },
      { 
        level: 4, 
        minPoints: 500, 
        maxPoints: 999, 
        title: 'Especialista', 
        icon: '⭐', 
        color: '#fbbf24',
        benefits: ['Badge de Especialista', 'Poder de revisão expandido']
      },
      { 
        level: 5, 
        minPoints: 1000, 
        maxPoints: 2499, 
        title: 'Mestre', 
        icon: '🎓', 
        color: '#f59e0b',
        benefits: ['Badge de Mestre', 'Certificado de Contribuição']
      },
      { 
        level: 6, 
        minPoints: 2500, 
        maxPoints: 4999, 
        title: 'Veterano', 
        icon: '🏅', 
        color: '#8b5cf6',
        benefits: ['Badge de Veterano', 'Menção em publicações']
      },
      { 
        level: 7, 
        minPoints: 5000, 
        maxPoints: 9999, 
        title: 'Lenda', 
        icon: '👑', 
        color: '#ec4899',
        benefits: ['Badge de Lenda', 'Co-autoria em papers']
      },
      { 
        level: 8, 
        minPoints: 10000, 
        maxPoints: Number.MAX_SAFE_INTEGER, 
        title: 'Mestre HPO', 
        icon: '🔮', 
        color: '#dc2626',
        benefits: ['Badge Mestre HPO', 'Reconhecimento internacional', 'Convite para comitê editorial']
      }
    ];

    res.json({
      success: true,
      rules: pointRules,
      levels,
      version: '1.0.0',
      lastUpdated: '2025-10-20'
    });

  } catch (error) {
    logger.error('[GAMIFICATION] Error fetching rules:', error);
    res.status(500).json({
      error: 'Erro ao carregar regras de gamificação'
    });
  }
});

/**
 * GET /api/gamification/profile-completion
 * Get user's profile completion status
 */
router.get('/profile-completion', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get user with professional profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professionalProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Define required fields
    const requiredFields = {
      // Basic Profile (30% weight)
      name: !!user.name,
      email: !!user.email,
      institution: !!user.professionalProfile?.institution,
      
      // Professional Profile (50% weight)
      academicDegree: !!user.professionalProfile?.academicDegree,
      fieldOfStudy: !!user.professionalProfile?.fieldOfStudy,
      professionalRole: !!user.professionalProfile?.professionalRole,
      researchArea: !!user.professionalProfile?.researchArea,
      englishProficiency: !!user.professionalProfile?.englishProficiency,
      
      // eHEALS Score (20% weight)
      ehealsScore: (user.professionalProfile?.ehealsScore || 0) > 0
    };

    const totalFields = Object.keys(requiredFields).length;
    const completedFields = Object.values(requiredFields).filter(Boolean).length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => {
        // Map field names to Portuguese labels
        const fieldLabels: Record<string, string> = {
          name: 'Nome completo',
          email: 'Email',
          institution: 'Instituição',
          academicDegree: 'Grau acadêmico',
          fieldOfStudy: 'Área de estudo',
          professionalRole: 'Função profissional',
          researchArea: 'Área de pesquisa',
          englishProficiency: 'Proficiência em inglês',
          ehealsScore: 'Questionário eHEALS'
        };
        return {
          field: key,
          label: fieldLabels[key] || key
        };
      });

    const isComplete = percentage === 100;

    // Check if user already received completion bonus
    const hasReceivedBonus = user.profileCompletedAt !== null;

    res.json({
      success: true,
      completion: {
        percentage,
        completed: completedFields,
        total: totalFields,
        isComplete,
        missingFields,
        hasReceivedBonus,
        pointsToEarn: isComplete && !hasReceivedBonus ? 100 : 0
      }
    });

  } catch (error) {
    logger.error('[GAMIFICATION] Error calculating profile completion:', error);
    res.status(500).json({
      error: 'Erro ao calcular completude do perfil'
    });
  }
});

/**
 * POST /api/gamification/award-profile-completion
 * Award points for completing profile (called from user.routes.ts)
 */
router.post('/award-profile-completion', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professionalProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if already received bonus
    if (user.profileCompletedAt) {
      return res.status(400).json({
        error: 'Bônus de perfil completo já foi creditado'
      });
    }

    // Verify profile is actually 100% complete
    const requiredFields = {
      name: !!user.name,
      email: !!user.email,
      institution: !!user.professionalProfile?.institution,
      academicDegree: !!user.professionalProfile?.academicDegree,
      fieldOfStudy: !!user.professionalProfile?.fieldOfStudy,
      professionalRole: !!user.professionalProfile?.professionalRole,
      researchArea: !!user.professionalProfile?.researchArea,
      englishProficiency: !!user.professionalProfile?.englishProficiency,
      ehealsScore: (user.professionalProfile?.ehealsScore || 0) > 0
    };

    const completedFields = Object.values(requiredFields).filter(Boolean).length;
    const totalFields = Object.keys(requiredFields).length;

    if (completedFields < totalFields) {
      return res.status(400).json({
        error: 'Perfil ainda não está 100% completo',
        completion: {
          completed: completedFields,
          total: totalFields,
          percentage: Math.round((completedFields / totalFields) * 100)
        }
      });
    }

    // Award 100 points
    const PROFILE_COMPLETION_POINTS = 100;

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: PROFILE_COMPLETION_POINTS },
        profileCompletedAt: new Date()
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT',
        title: '🎉 Perfil 100% Completo!',
        message: `Parabéns! Você ganhou ${PROFILE_COMPLETION_POINTS} pontos por completar seu perfil.`,
        read: false
      }
    });

    logger.info('[GAMIFICATION] Profile completion bonus awarded', {
      userId,
      pointsAwarded: PROFILE_COMPLETION_POINTS
    });

    res.json({
      success: true,
      message: `Parabéns! Você ganhou +${PROFILE_COMPLETION_POINTS} pontos!`,
      pointsAwarded: PROFILE_COMPLETION_POINTS
    });

  } catch (error) {
    logger.error('[GAMIFICATION] Error awarding profile completion:', error);
    res.status(500).json({
      error: 'Erro ao creditar pontos de perfil completo'
    });
  }
});

/**
 * GET /api/gamification/my-stats
 * Get detailed gamification statistics for current user
 */
router.get('/my-stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        createdAt: true,
        orcidId: true,
        profileCompletedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Count translations
    const translationsCount = await prisma.translation.count({
      where: { userId }
    });

    const approvedTranslations = await prisma.translation.count({
      where: {
        userId,
        status: 'APPROVED'
      }
    });

    // Count reviews
    const reviewsCount = await prisma.review.count({
      where: { userId }
    });

    // Count referrals
    const referralsCount = await prisma.referral.count({
      where: {
        referrerId: userId,
        status: 'ACCEPTED'
      }
    });

    // Calculate approval rate
    const approvalRate = translationsCount > 0 
      ? Math.round((approvedTranslations / translationsCount) * 100)
      : 0;

    // Determine current level
    const levels = [
      { level: 1, minPoints: 0, maxPoints: 99, title: 'Iniciante' },
      { level: 2, minPoints: 100, maxPoints: 249, title: 'Aprendiz' },
      { level: 3, minPoints: 250, maxPoints: 499, title: 'Colaborador' },
      { level: 4, minPoints: 500, maxPoints: 999, title: 'Especialista' },
      { level: 5, minPoints: 1000, maxPoints: 2499, title: 'Mestre' },
      { level: 6, minPoints: 2500, maxPoints: 4999, title: 'Veterano' },
      { level: 7, minPoints: 5000, maxPoints: 9999, title: 'Lenda' },
      { level: 8, minPoints: 10000, maxPoints: Number.MAX_SAFE_INTEGER, title: 'Mestre HPO' }
    ];

    const currentLevel = levels.find(l => 
      user.points >= l.minPoints && user.points <= l.maxPoints
    ) || levels[0];

    const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
    const pointsToNextLevel = nextLevel ? nextLevel.minPoints - user.points : 0;
    const progressToNext = nextLevel
      ? Math.round(((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
      : 100;

    res.json({
      success: true,
      stats: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points,
          level: user.level,
          memberSince: user.createdAt,
          hasOrcid: !!user.orcidId,
          profileCompleted: !!user.profileCompletedAt
        },
        contributions: {
          translations: translationsCount,
          approved: approvedTranslations,
          reviews: reviewsCount,
          referrals: referralsCount,
          approvalRate
        },
        progression: {
          currentLevel: {
            number: currentLevel.level,
            title: currentLevel.title,
            minPoints: currentLevel.minPoints,
            maxPoints: currentLevel.maxPoints
          },
          nextLevel: nextLevel ? {
            number: nextLevel.level,
            title: nextLevel.title,
            minPoints: nextLevel.minPoints
          } : null,
          pointsToNextLevel,
          progressPercentage: progressToNext
        }
      }
    });

  } catch (error) {
    logger.error('[GAMIFICATION] Error fetching user stats:', error);
    res.status(500).json({
      error: 'Erro ao carregar estatísticas'
    });
  }
});

export default router;
