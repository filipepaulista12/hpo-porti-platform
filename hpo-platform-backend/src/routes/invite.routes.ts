import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/invite
 * Send invitation email to colleague
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email and name are required' 
      });
    }

    // Get inviter details
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!inviter) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if invitee is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Este usuário já está registrado na plataforma' 
      });
    }

    // Generate invitation link
    const inviteToken = Buffer.from(`${email}:${userId}:${Date.now()}`).toString('base64');
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?invite=${inviteToken}`;

    // Send invitation email
    const emailSent = await emailService.sendEmail({
      to: email,
      subject: `${inviter.name} convidou você para colaborar na Plataforma HPO-PT`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 Convite para HPO-PT</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p><strong>${inviter.name}</strong> (${inviter.email}) convidou você para contribuir com a tradução de termos médicos da Human Phenotype Ontology para português.</p>
              
              <p>A plataforma HPO-PT é uma iniciativa colaborativa para tornar a terminologia médica mais acessível para profissionais de saúde de língua portuguesa.</p>
              
              <p style="margin: 30px 0; text-align: center;">
                <a href="${inviteLink}" class="button">Aceitar Convite</a>
              </p>
              
              <p>Ao se registrar através deste convite, você e ${inviter.name} receberão pontos de gamificação!</p>
              
              <p>Caso não consiga clicar no botão, copie e cole este link no seu navegador:<br>
              <code style="background: #f3f4f6; padding: 8px; display: inline-block; margin-top: 10px; border-radius: 4px;">${inviteLink}</code></p>
            </div>
            <div class="footer">
              <p>Este é um email automático da Plataforma HPO-PT</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (!emailSent) {
      logger.error('[INVITE] Failed to send invitation email', { to: email });
      return res.status(500).json({ 
        error: 'Falha ao enviar email de convite' 
      });
    }

    // Award points to inviter (50 points for sending invite)
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 50 },
        updatedAt: new Date()
      }
    });

    logger.info('[INVITE] Invitation sent successfully', {
      inviter: inviter.email,
      invitee: email
    });

    res.json({
      success: true,
      message: 'Convite enviado com sucesso',
      pointsAwarded: 50
    });

  } catch (error) {
    logger.error('[INVITE] Error sending invitation:', error);
    res.status(500).json({ 
      error: 'Erro ao processar convite' 
    });
  }
});

export default router;
