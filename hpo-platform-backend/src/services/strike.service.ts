import { PrismaClient, StrikeReason, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Three-Strike System Service
 * 
 * Sistema de moderação com 3 strikes:
 * - 1 strike: Warning
 * - 2 strikes: Warning + notification
 * - 3 strikes: Automatic ban for 7 days
 */

interface CreateStrikeParams {
  userId: string;
  adminId: string;
  reason: StrikeReason;
  detailedReason: string;
  translationId?: string;
  severity?: number; // 1-3
  expiresAt?: Date;
}

/**
 * Create a new strike for a user
 */
export async function createStrike(params: CreateStrikeParams): Promise<any> {
  const { userId, adminId, reason, detailedReason, translationId, severity = 1, expiresAt } = params;

  // Get current active strikes
  const activeStrikes = await getActiveStrikes(userId);
  const strikeCount = activeStrikes.length;

  // Create the strike
  const strike = await prisma.strike.create({
    data: {
      userId,
      adminId,
      reason,
      detailedReason,
      translationId,
      severity,
      expiresAt,
      isActive: true
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      admin: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const newStrikeCount = strikeCount + 1;

  // Create notification
  const notificationMessage = getStrikeNotificationMessage(newStrikeCount, reason, detailedReason);
  await prisma.notification.create({
    data: {
      userId,
      type: newStrikeCount >= 3 ? 'USER_SUSPENDED' : 'STRIKE_RECEIVED',
      title: newStrikeCount >= 3 ? '🚫 Conta Suspensa' : '⚠️ Strike Recebido',
      message: notificationMessage,
      link: '/profile'
    }
  });

  // If this is the 3rd strike, ban the user for 7 days
  if (newStrikeCount >= 3) {
    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + 7); // 7 days ban

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: `Automatic ban: 3 strikes received. Reason: ${reason}. ${detailedReason}`,
        isActive: false
      }
    });

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'BAN_USER',
        targetType: 'USER',
        targetId: userId,
        details: `Automatic ban for 7 days due to 3 strikes. Latest strike: ${reason}`,
        ipAddress: 'system',
        userAgent: 'strike-system'
      }
    });

    console.log(`🚫 User ${userId} automatically banned for 7 days due to 3 strikes`);
  } else if (newStrikeCount === 2) {
    // Send warning notification for 2nd strike
    await prisma.notification.create({
      data: {
        userId,
        type: 'STRIKE_WARNING',
        title: '⚠️ Aviso: 2 Strikes',
        message: 'Você recebeu seu segundo strike. Um terceiro strike resultará em suspensão automática de 7 dias.',
        link: '/profile'
      }
    });
  }

  return {
    strike,
    totalActiveStrikes: newStrikeCount,
    isUserBanned: newStrikeCount >= 3,
    banDuration: newStrikeCount >= 3 ? '7 days' : null
  };
}

/**
 * Get all active strikes for a user
 */
export async function getActiveStrikes(userId: string) {
  return await prisma.strike.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      translation: {
        select: {
          id: true,
          labelPt: true,
          term: {
            select: {
              hpoId: true,
              labelEn: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Get all strikes (including inactive) for a user
 */
export async function getAllStrikes(userId: string) {
  return await prisma.strike.findMany({
    where: { userId },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      translation: {
        select: {
          id: true,
          labelPt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Deactivate a strike (e.g., if appealed successfully)
 */
export async function deactivateStrike(strikeId: string, adminId: string): Promise<any> {
  const strike = await prisma.strike.update({
    where: { id: strikeId },
    data: { isActive: false }
  });

  // Log admin action
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action: 'DEACTIVATE_STRIKE',
      targetType: 'STRIKE',
      targetId: strikeId,
      details: `Strike deactivated for user ${strike.userId}`,
      ipAddress: 'system',
      userAgent: 'admin-action'
    }
  });

  // Check if user can be unbanned
  const activeStrikes = await getActiveStrikes(strike.userId);
  if (activeStrikes.length < 3) {
    const user = await prisma.user.findUnique({ where: { id: strike.userId } });
    if (user?.isBanned) {
      await prisma.user.update({
        where: { id: strike.userId },
        data: {
          isBanned: false,
          isActive: true,
          bannedAt: null,
          bannedReason: null
        }
      });

      await prisma.notification.create({
        data: {
          userId: strike.userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: '✅ Conta Reativada',
          message: 'Um strike foi removido e sua conta foi reativada.',
          link: '/profile'
        }
      });

      console.log(`✅ User ${strike.userId} unbanned after strike deactivation`);
    }
  }

  return strike;
}

/**
 * Get strike statistics for admin dashboard
 */
export async function getStrikeStatistics() {
  const totalStrikes = await prisma.strike.count();
  const activeStrikes = await prisma.strike.count({ where: { isActive: true } });
  
  const strikesByReason = await prisma.strike.groupBy({
    by: ['reason'],
    _count: true,
    where: { isActive: true }
  });

  const usersWithStrikes = await prisma.user.count({
    where: {
      strikes: {
        some: {
          isActive: true
        }
      }
    }
  });

  const bannedDueToStrikes = await prisma.user.count({
    where: {
      isBanned: true,
      bannedReason: {
        contains: '3 strikes'
      }
    }
  });

  return {
    totalStrikes,
    activeStrikes,
    strikesByReason,
    usersWithStrikes,
    bannedDueToStrikes
  };
}

/**
 * Get users at risk (2 active strikes)
 */
export async function getUsersAtRisk() {
  const users = await prisma.user.findMany({
    where: {
      strikes: {
        some: {
          isActive: true
        }
      }
    },
    include: {
      strikes: {
        where: { isActive: true },
        include: {
          admin: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  return users.filter(u => u.strikes.length === 2);
}

/**
 * Helper function to generate notification message
 */
function getStrikeNotificationMessage(strikeCount: number, reason: StrikeReason, details: string): string {
  const reasonTranslations: Record<StrikeReason, string> = {
    LOW_QUALITY_TRANSLATION: 'Tradução de baixa qualidade',
    SPAM_SUBMISSIONS: 'Envios em massa sem qualidade',
    INAPPROPRIATE_CONTENT: 'Conteúdo inapropriado',
    PLAGIARISM: 'Plágio detectado',
    MANIPULATION_SYSTEM: 'Tentativa de manipulação do sistema',
    DISRESPECTFUL_BEHAVIOR: 'Comportamento desrespeitoso',
    VIOLATION_GUIDELINES: 'Violação das diretrizes',
    OTHER: 'Outro motivo'
  };

  const reasonText = reasonTranslations[reason] || reason;

  if (strikeCount >= 3) {
    return `Você recebeu seu terceiro strike e sua conta foi suspensa por 7 dias.\n\n` +
           `Motivo: ${reasonText}\n` +
           `Detalhes: ${details}\n\n` +
           `Sua conta será reativada automaticamente após o período de suspensão.`;
  } else if (strikeCount === 2) {
    return `Você recebeu seu segundo strike (${strikeCount}/3).\n\n` +
           `Motivo: ${reasonText}\n` +
           `Detalhes: ${details}\n\n` +
           `⚠️ ATENÇÃO: Um terceiro strike resultará em suspensão automática de 7 dias.`;
  } else {
    return `Você recebeu um strike (${strikeCount}/3).\n\n` +
           `Motivo: ${reasonText}\n` +
           `Detalhes: ${details}\n\n` +
           `Por favor, revise as diretrizes da plataforma para evitar futuros strikes.`;
  }
}

/**
 * Expire old strikes automatically (if expiration date is set)
 */
export async function expireOldStrikes() {
  const expiredStrikes = await prisma.strike.updateMany({
    where: {
      isActive: true,
      expiresAt: {
        lte: new Date()
      }
    },
    data: {
      isActive: false
    }
  });

  console.log(`⏰ Expired ${expiredStrikes.count} old strikes`);
  return expiredStrikes;
}
