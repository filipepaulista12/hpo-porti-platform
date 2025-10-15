import * as nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// ============================================
// EMAIL SERVICE
// ============================================
// Sistema de envio de emails usando Nodemailer
// Suporta desenvolvimento (Ethereal) e produção (Gmail/SMTP)
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const emailEnabled = process.env.EMAIL_ENABLED === 'true';
      
      if (!emailEnabled) {
        logger.info('📧 Email service DISABLED (EMAIL_ENABLED=false)');
        this.enabled = false;
        return;
      }

      const emailProvider = process.env.EMAIL_PROVIDER || 'ethereal';

      // ========================================
      // DEVELOPMENT: Ethereal (Fake SMTP)
      // ========================================
      if (emailProvider === 'ethereal') {
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });

        this.enabled = true;
        logger.info('📧 Email service ENABLED (Ethereal - Development Mode)');
        logger.info(`📩 Preview emails at: ${testAccount.web}`);
      }
      
      // ========================================
      // PRODUCTION: Gmail
      // ========================================
      else if (emailProvider === 'gmail') {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPassword = process.env.GMAIL_APP_PASSWORD;

        if (!gmailUser || !gmailPassword) {
          throw new Error('Gmail credentials missing (GMAIL_USER, GMAIL_APP_PASSWORD)');
        }

        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPassword
          }
        });

        this.enabled = true;
        logger.info('📧 Email service ENABLED (Gmail - Production Mode)');
      }
      
      // ========================================
      // PRODUCTION: SMTP Custom
      // ========================================
      else if (emailProvider === 'smtp') {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');
        const smtpUser = process.env.SMTP_USER;
        const smtpPassword = process.env.SMTP_PASSWORD;
        const smtpSecure = process.env.SMTP_SECURE === 'true';

        if (!smtpHost || !smtpUser || !smtpPassword) {
          throw new Error('SMTP credentials missing');
        }

        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPassword
          }
        });

        this.enabled = true;
        logger.info('📧 Email service ENABLED (Custom SMTP - Production Mode)');
      }
      
      else {
        logger.warn(`📧 Unknown EMAIL_PROVIDER: ${emailProvider}. Email service DISABLED.`);
        this.enabled = false;
      }

      // Verify connection
      if (this.transporter && this.enabled) {
        await this.transporter.verify();
        logger.info('✅ Email service connection verified');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize email service:', error);
      this.enabled = false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('📧 Email sending skipped (service disabled)');
      return false;
    }

    try {
      const fromEmail = process.env.EMAIL_FROM || 'noreply@hpo-translation.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'HPO Translation Platform';

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || this.htmlToText(options.html),
        html: options.html
      });

      logger.info(`📨 Email sent to ${options.to}: ${options.subject}`);
      
      // Log preview URL for Ethereal
      if (process.env.EMAIL_PROVIDER === 'ethereal') {
        logger.info(`📩 Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return true;
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Convert HTML to plain text (basic)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  /**
   * Send translation approved email
   */
  async sendTranslationApproved(
    to: string,
    userName: string,
    termHpoId: string,
    termLabel: string,
    pointsEarned: number
  ): Promise<boolean> {
    const subject = `✅ Sua tradução foi aprovada! (+${pointsEarned} pontos)`;
    const html = this.getTranslationApprovedTemplate(userName, termHpoId, termLabel, pointsEarned);
    
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send translation rejected email
   */
  async sendTranslationRejected(
    to: string,
    userName: string,
    termHpoId: string,
    termLabel: string,
    reasons: string[],
    comment?: string
  ): Promise<boolean> {
    const subject = `❌ Sua tradução precisa de revisão`;
    const html = this.getTranslationRejectedTemplate(userName, termHpoId, termLabel, reasons, comment);
    
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send comment received email
   */
  async sendCommentReceived(
    to: string,
    userName: string,
    commenterName: string,
    termHpoId: string,
    commentPreview: string,
    translationId: string
  ): Promise<boolean> {
    const subject = `💬 ${commenterName} comentou na sua tradução`;
    const html = this.getCommentReceivedTemplate(userName, commenterName, termHpoId, commentPreview, translationId);
    
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send warning email
   */
  async sendWarningEmail(
    to: string,
    userName: string,
    warningCount: number,
    consecutiveRejections: number
  ): Promise<boolean> {
    const subject = `⚠️ Aviso: ${consecutiveRejections} traduções consecutivas rejeitadas`;
    const html = this.getWarningTemplate(userName, warningCount, consecutiveRejections);
    
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send ban notification email
   */
  async sendBanEmail(
    to: string,
    userName: string,
    reason: string
  ): Promise<boolean> {
    const subject = `🚫 Sua conta foi suspensa`;
    const html = this.getBanTemplate(userName, reason);
    
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send achievement/badge earned email
   */
  async sendAchievementEmail(
    to: string,
    userName: string,
    achievementName: string,
    achievementDescription: string
  ): Promise<boolean> {
    const subject = `🏆 Conquista desbloqueada: ${achievementName}!`;
    const html = this.getAchievementTemplate(userName, achievementName, achievementDescription);
    
    return this.sendEmail({ to, subject, html });
  }

  // ========================================
  // EMAIL TEMPLATES
  // ========================================

  private getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 12px 12px; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>Plataforma de Tradução HPO para Português</p>
      <p>Esta é uma mensagem automática. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getTranslationApprovedTemplate(userName: string, termHpoId: string, termLabel: string, points: number): string {
    const content = `
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">✅ Tradução Aprovada!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Ótimas notícias! Sua tradução foi aprovada pela comunidade:</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Termo:</strong> ${termHpoId} - ${termLabel}</p>
        <p style="margin: 10px 0 0 0;"><span class="badge badge-success">+${points} pontos</span></p>
      </div>
      <p>Continue contribuindo para ajudar a comunidade médica de língua portuguesa!</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/history" class="button">Ver Meu Histórico</a></p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  private getTranslationRejectedTemplate(userName: string, termHpoId: string, termLabel: string, reasons: string[], comment?: string): string {
    const reasonsList = reasons.length > 0 
      ? `<ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>`
      : '<p>Nenhuma razão específica fornecida.</p>';
    
    const content = `
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🔄 Revisão Necessária</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Sua tradução precisa de revisão:</p>
      <div style="background: #fef9c3; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>Termo:</strong> ${termHpoId} - ${termLabel}</p>
        <p style="margin: 10px 0 0 0;"><strong>Motivos:</strong></p>
        ${reasonsList}
        ${comment ? `<p><strong>Comentário:</strong> ${comment}</p>` : ''}
      </div>
      <p>Por favor, revise e submeta uma nova tradução com as correções necessárias.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/translate" class="button">Ir para Tradução</a></p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  private getCommentReceivedTemplate(userName: string, commenterName: string, termHpoId: string, commentPreview: string, translationId: string): string {
    const content = `
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">💬 Novo Comentário</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p><strong>${commenterName}</strong> comentou na sua tradução do termo <strong>${termHpoId}</strong>:</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; font-style: italic;">"${commentPreview}"</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/history/${translationId}" class="button">Ver Comentário Completo</a></p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  private getWarningTemplate(userName: string, warningCount: number, consecutiveRejections: number): string {
    const content = `
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);">
      <h1 style="margin: 0; font-size: 32px;">⚠️ Aviso de Qualidade</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Detectamos que você teve <strong>${consecutiveRejections} traduções consecutivas rejeitadas</strong>.</p>
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>Avisos acumulados:</strong> ${warningCount}/3</p>
        <p style="margin: 10px 0 0 0;">⚠️ Ao atingir 3 avisos, sua conta será suspensa temporariamente.</p>
      </div>
      <p><strong>Dicas para melhorar:</strong></p>
      <ul>
        <li>Revise o guia de tradução</li>
        <li>Consulte a terminologia médica adequada</li>
        <li>Peça ajuda em comentários se tiver dúvidas</li>
        <li>Traduza termos mais simples primeiro</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/guidelines" class="button">Ver Guia de Tradução</a></p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  private getBanTemplate(userName: string, reason: string): string {
    const content = `
    <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
      <h1 style="margin: 0; font-size: 32px;">🚫 Conta Suspensa</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Sua conta foi suspensa devido a violações das regras da plataforma:</p>
      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="margin: 0;"><strong>Motivo:</strong> ${reason}</p>
      </div>
      <p>Se você acredita que isso é um erro, entre em contato com a equipe de administração.</p>
      <p><strong>Email de contato:</strong> admin@hpo-translation.com</p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  private getAchievementTemplate(userName: string, achievementName: string, achievementDescription: string): string {
    const content = `
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      <h1 style="margin: 0; font-size: 32px;">🏆 Conquista Desbloqueada!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Parabéns! Você desbloqueou uma nova conquista:</p>
      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #10b981;">
        <h2 style="margin: 0; color: #059669; font-size: 24px;">🏆 ${achievementName}</h2>
        <p style="margin: 10px 0 0 0; color: #065f46;">${achievementDescription}</p>
      </div>
      <p>Continue contribuindo para desbloquear mais conquistas!</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button" style="background: #10b981;">Ver Meu Perfil</a></p>
    </div>
    `;
    return this.getBaseTemplate(content);
  }

  /**
   * Check if email service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const emailService = new EmailService();
