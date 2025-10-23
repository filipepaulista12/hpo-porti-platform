import { Router, Request, Response } from 'express';
import { PrismaClient, ReferralStatus } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

const REFERRAL_POINTS = 75; // Points awarded when referral accepts and makes first contribution

/**
 * POST /api/referrals/invite
 * Send referral invitation to friend
 */
router.post('/invite', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Email válido é obrigatório' 
      });
    }

    // Get referrer details
    const referrer = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true, 
        email: true,
        orcidId: true 
      }
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if invitee is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Este usuário já está registrado na plataforma' 
      });
    }

    // Check for duplicate pending invite
    const existingInvite = await prisma.referral.findFirst({
      where: {
        referrerId: userId,
        email: email.toLowerCase(),
        status: { in: ['PENDING', 'REGISTERED'] }
      }
    });

    if (existingInvite) {
      return res.status(400).json({
        error: 'Você já enviou um convite para este email'
      });
    }

    // Generate unique referral code
    const referralCode = crypto.randomBytes(16).toString('hex');
    
    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        email: email.toLowerCase(),
        referralCode,
        status: 'PENDING'
      }
    });

    // Generate invitation link with referral code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/register?ref=${referralCode}`;

    // Send invitation email
    const emailSent = await emailService.sendEmail({
      to: email,
      subject: `${referrer.name} convidou você para a Plataforma HPO-PT! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content p {
              margin: 0 0 16px 0;
              color: #4b5563;
              font-size: 16px;
            }
            .highlight-box {
              background: #fef3c7;
              border-left: 4px solid #fbbf24;
              padding: 16px;
              margin: 24px 0;
              border-radius: 6px;
            }
            .highlight-box strong {
              color: #92400e;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
              color: white; 
              padding: 14px 40px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .features {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .features ul {
              margin: 12px 0;
              padding-left: 20px;
            }
            .features li {
              margin: 8px 0;
              color: #4b5563;
            }
            .link-box {
              background: #f3f4f6; 
              padding: 12px; 
              border-radius: 6px;
              word-break: break-all;
              font-family: monospace;
              font-size: 13px;
              color: #6b7280;
              margin-top: 16px;
            }
            .footer { 
              text-align: center; 
              padding: 24px; 
              background: #f9fafb;
              color: #6b7280; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .footer a {
              color: #ec4899;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💌 Você Recebeu um Convite!</h1>
            </div>
            <div class="content">
              <p>Olá!</p>
              
              <p><strong>${referrer.name}</strong> ${referrer.orcidId ? `(ORCID: ${referrer.orcidId})` : ''} convidou você para fazer parte da <strong>Plataforma HPO-PT</strong> - uma comunidade colaborativa de tradução de termos médicos da Human Phenotype Ontology.</p>
              
              <div class="highlight-box">
                <strong>🎁 Bônus de Convite:</strong> Ao se registrar e fazer sua primeira contribuição, você ganha pontos iniciais e ${referrer.name} ganha <strong>+${REFERRAL_POINTS} pontos</strong>!
              </div>

              <div class="features">
                <strong>✨ Por que participar?</strong>
                <ul>
                  <li><strong>Impacto científico:</strong> Suas traduções ajudam profissionais de saúde em todo o mundo lusófono</li>
                  <li><strong>Gamificação:</strong> Sistema de pontos, níveis e ranking mensal</li>
                  <li><strong>Créditos ORCID:</strong> Suas contribuições são rastreadas com seu ORCID iD</li>
                  <li><strong>Comunidade ativa:</strong> Colabore com especialistas e pesquisadores</li>
                  <li><strong>Certificado:</strong> Receba reconhecimento oficial por suas contribuições</li>
                </ul>
              </div>

              <div class="button-container">
                <a href="${inviteLink}" class="button">🚀 Aceitar Convite e Começar</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">Caso o botão não funcione, copie e cole este link no navegador:</p>
              <div class="link-box">${inviteLink}</div>

              <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
                Este convite é pessoal e expira em 30 dias. Ao se cadastrar, você concorda com os termos de uso da plataforma.
              </p>
            </div>
            <div class="footer">
              <p><strong>Plataforma HPO-PT</strong> | PORTI (Portuguese Translations Initiative)</p>
              <p>Por ti, pela ciência, em português 🇵🇹🇧🇷🇦🇴🇲🇿</p>
              <p style="margin-top: 12px;">
                Problemas? <a href="mailto:${referrer.email}">Contacte ${referrer.name}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (!emailSent) {
      // Rollback referral creation if email fails
      await prisma.referral.delete({
        where: { id: referral.id }
      });
      
      logger.error('[REFERRAL] Failed to send invitation email', { to: email });
      return res.status(500).json({ 
        error: 'Falha ao enviar email de convite. Tente novamente.' 
      });
    }

    logger.info('[REFERRAL] Referral invitation sent', {
      referrerId: userId,
      email,
      referralCode
    });

    res.json({
      success: true,
      message: `Convite enviado para ${email}!`,
      invite: {
        id: referral.id,
        email: referral.email,
        status: referral.status,
        createdAt: referral.createdAt,
        referralCode
      }
    });

  } catch (error) {
    logger.error('[REFERRAL] Error sending invitation:', error);
    res.status(500).json({ 
      error: 'Erro ao processar convite' 
    });
  }
});

/**
 * GET /api/referrals/my-invites
 * Get user's referral history
 */
router.get('/my-invites', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        referee: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'PENDING').length,
      registered: referrals.filter(r => r.status === 'REGISTERED').length,
      accepted: referrals.filter(r => r.status === 'ACCEPTED').length,
      pointsEarned: referrals.filter(r => r.status === 'ACCEPTED').length * REFERRAL_POINTS
    };

    res.json({
      success: true,
      invites: referrals.map(r => ({
        id: r.id,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
        acceptedAt: r.acceptedAt,
        referee: r.referee ? {
          id: r.referee.id,
          name: r.referee.name,
          joinedAt: r.referee.createdAt
        } : null
      })),
      stats
    });

  } catch (error) {
    logger.error('[REFERRAL] Error loading referral history:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar histórico de convites' 
    });
  }
});

/**
 * POST /api/referrals/accept/:code
 * Accept a referral invitation (called during registration)
 */
router.post('/accept/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { userId } = req.body; // User ID of the newly registered user

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    // Find referral by code
    const referral = await prisma.referral.findFirst({
      where: {
        referralCode: code,
        status: 'PENDING'
      },
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!referral) {
      return res.status(404).json({
        error: 'Convite não encontrado ou já foi aceito'
      });
    }

    // Update referral status to REGISTERED
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'REGISTERED',
        refereeId: userId,
        acceptedAt: new Date()
      }
    });

    // Give welcome bonus to referee (new user)
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 50 } // Welcome bonus for joining via referral
      }
    });

    // Create notification for referrer
    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: 'REFERRAL_REGISTERED',
        title: '🎉 Amigo Aceitou Convite!',
        message: `Alguém se registrou usando seu convite! Eles receberão +${REFERRAL_POINTS} pontos quando fizerem a primeira contribuição.`,
        read: false
      }
    });

    logger.info('[REFERRAL] Referral accepted', {
      referralId: referral.id,
      referrerId: referral.referrerId,
      refereeId: userId
    });

    res.json({
      success: true,
      message: 'Convite aceito! Você ganhou +50 pontos de bônus.',
      referrer: {
        name: referral.referrer.name
      }
    });

  } catch (error) {
    logger.error('[REFERRAL] Error accepting referral:', error);
    res.status(500).json({
      error: 'Erro ao aceitar convite'
    });
  }
});

/**
 * Internal function: Mark referral as fully accepted after first contribution
 * Called from translation.routes.ts when user makes first contribution
 */
export async function completeReferral(userId: string): Promise<void> {
  try {
    // Find referral where this user is the referee and status is REGISTERED
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId: userId,
        status: 'REGISTERED'
      }
    });

    if (!referral) {
      return; // No pending referral for this user
    }

    // Update referral status to ACCEPTED
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'ACCEPTED'
      }
    });

    // Award points to referrer
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        points: { increment: REFERRAL_POINTS }
      }
    });

    // Create notification for referrer
    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: 'REFERRAL_COMPLETED',
        title: `🏆 +${REFERRAL_POINTS} Pontos de Referral!`,
        message: `Seu amigo fez a primeira contribuição! Você ganhou ${REFERRAL_POINTS} pontos.`,
        read: false
      }
    });

    logger.info('[REFERRAL] Referral completed', {
      referralId: referral.id,
      referrerId: referral.referrerId,
      pointsAwarded: REFERRAL_POINTS
    });

  } catch (error) {
    logger.error('[REFERRAL] Error completing referral:', error);
  }
}

export default router;
