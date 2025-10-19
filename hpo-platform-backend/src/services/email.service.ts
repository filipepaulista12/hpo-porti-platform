import nodemailer, { Transporter } from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private enabled: boolean = false;
  private from: string = '';
  private fromName: string = '';
  private logPath: string = path.join(__dirname, '../logs/email.log');

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with SMTP config from environment
   */
  private initializeTransporter(): void {
    try {
      // Check if email is enabled
      this.enabled = process.env.EMAIL_ENABLED === 'true';
      
      if (!this.enabled) {
        console.log('📧 [EMAIL] Email notifications disabled (EMAIL_ENABLED=false)');
        return;
      }

      // Validate required environment variables
      const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'];
      const missing = requiredVars.filter(v => !process.env[v]);
      
      if (missing.length > 0) {
        console.error(`❌ [EMAIL] Missing environment variables: ${missing.join(', ')}`);
        this.enabled = false;
        return;
      }

      const config: EmailConfig = {
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASSWORD!
        }
      };

      // Parse EMAIL_FROM if it contains name (e.g., "CPLP Raras <cplp@raras.org.br>")
      const emailFromMatch = process.env.EMAIL_FROM!.match(/^(.+?)\s*<(.+?)>$/);
      if (emailFromMatch) {
        this.fromName = emailFromMatch[1].trim();
        this.from = emailFromMatch[2].trim();
      } else {
        this.from = process.env.EMAIL_FROM!;
        this.fromName = 'PORTI-HPO';
      }

      this.transporter = nodemailer.createTransport(config);

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ [EMAIL] SMTP connection failed:', error.message);
          this.enabled = false;
        } else {
          console.log('✅ [EMAIL] SMTP connection established successfully');
          console.log(`📧 [EMAIL] Sending from: ${this.fromName} <${this.from}>`);
        }
      });

      // Ensure logs directory exists
      const logsDir = path.dirname(this.logPath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    } catch (error: any) {
      console.error('❌ [EMAIL] Failed to initialize email service:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Log email activity
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logPath, logMessage);
    } catch (error) {
      console.error('Failed to write email log:', error);
    }
  }

  /**
   * Send generic email
   */
  private async sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      console.log(`⚠️ [EMAIL] Email not sent (disabled): ${subject} to ${to}`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.from}>`,
        to,
        subject,
        text,
        html
      });

      console.log(`✅ [EMAIL] Sent: ${subject} to ${to} (MessageID: ${info.messageId})`);
      this.log(`✅ Email sent to ${to} - ${subject}`);
      return true;
    } catch (error: any) {
      console.error(`❌ [EMAIL] Failed to send to ${to}:`, error.message);
      this.log(`❌ Failed to send email to ${to} - ${subject} - Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Send translation approved notification
   */
  async sendTranslationApprovedEmail(options: {
    to: string;
    translatorName: string;
    termLabel: string;
    termId: string;
    points?: number;
  }): Promise<boolean> {
    const { to, translatorName, termLabel, termId, points = 10 } = options;

    const subject = `✅ Tradução Aprovada - ${termLabel}`;
    
    const text = `
Olá ${translatorName},

Boa notícia! Sua tradução foi aprovada.

Termo HPO: ${termLabel} (${termId})
Pontos ganhos: +${points}

Continue contribuindo para a plataforma!

---
PORTI-HPO
Por ti, pela ciência, em português
https://hpo.raras-cplp.org
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
    .term { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
    .term-id { color: #6b7280; font-size: 14px; }
    .points { background: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; margin-top: 12px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Tradução Aprovada!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${translatorName}</strong>,</p>
      <p>Boa notícia! Sua tradução foi aprovada por um revisor.</p>
      
      <div class="card">
        <div class="term">${termLabel}</div>
        <div class="term-id">${termId}</div>
        <div class="points">+${points} pontos</div>
      </div>
      
      <p>Continue contribuindo para a plataforma e ajudando a comunidade CPLP!</p>
      
      <a href="https://hpo.raras-cplp.org/dashboard" class="button">Ver Dashboard</a>
      
      <div class="footer">
        <p><strong>PORTI-HPO</strong></p>
        <p>Portuguese Open Research & Translation Initiative</p>
        <p><a href="https://hpo.raras-cplp.org">hpo.raras-cplp.org</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send translation rejected notification
   */
  async sendTranslationRejectedEmail(options: {
    to: string;
    translatorName: string;
    termLabel: string;
    termId: string;
    reason?: string;
  }): Promise<boolean> {
    const { to, translatorName, termLabel, termId, reason } = options;

    const subject = `❌ Tradução Rejeitada - ${termLabel}`;
    
    const text = `
Olá ${translatorName},

Sua tradução foi rejeitada por um revisor.

Termo HPO: ${termLabel} (${termId})
${reason ? `Motivo: ${reason}` : ''}

Revise as diretrizes de tradução e tente novamente!

---
PORTI-HPO
Por ti, pela ciência, em português
https://hpo.raras-cplp.org
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
    .term { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
    .term-id { color: #6b7280; font-size: 14px; }
    .reason { background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 14px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Tradução Rejeitada</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${translatorName}</strong>,</p>
      <p>Sua tradução foi rejeitada por um revisor.</p>
      
      <div class="card">
        <div class="term">${termLabel}</div>
        <div class="term-id">${termId}</div>
        ${reason ? `<div class="reason"><strong>Motivo:</strong> ${reason}</div>` : ''}
      </div>
      
      <p>Não desanime! Revise as <strong>Diretrizes de Tradução</strong> e tente novamente.</p>
      
      <a href="https://hpo.raras-cplp.org/guidelines" class="button">Ver Diretrizes</a>
      
      <div class="footer">
        <p><strong>PORTI-HPO</strong></p>
        <p>Portuguese Open Research & Translation Initiative</p>
        <p><a href="https://hpo.raras-cplp.org">hpo.raras-cplp.org</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send conflict assigned notification
   */
  async sendConflictAssignedEmail(options: {
    to: string;
    reviewerName: string;
    termLabel: string;
    termId: string;
    conflictUrl: string;
  }): Promise<boolean> {
    const { to, reviewerName, termLabel, termId, conflictUrl } = options;

    const subject = `⚠️ Novo Conflito Atribuído - ${termLabel}`;
    
    const text = `
Olá ${reviewerName},

Um novo conflito foi atribuído a você.

Termo HPO: ${termLabel} (${termId})
Link: ${conflictUrl}

Por favor, analise as traduções conflitantes e tome uma decisão.

---
PORTI-HPO
Por ti, pela ciência, em português
https://hpo.raras-cplp.org
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: #1f2937; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .term { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
    .term-id { color: #6b7280; font-size: 14px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Novo Conflito Atribuído</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${reviewerName}</strong>,</p>
      <p>Um novo conflito foi atribuído a você para resolução.</p>
      
      <div class="card">
        <div class="term">${termLabel}</div>
        <div class="term-id">${termId}</div>
      </div>
      
      <p>Por favor, analise as traduções conflitantes e tome uma decisão.</p>
      
      <a href="${conflictUrl}" class="button">Resolver Conflito</a>
      
      <div class="footer">
        <p><strong>PORTI-HPO</strong></p>
        <p>Portuguese Open Research & Translation Initiative</p>
        <p><a href="https://hpo.raras-cplp.org">hpo.raras-cplp.org</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send comment mention notification
   */
  async sendCommentMentionEmail(options: {
    to: string;
    mentionedName: string;
    authorName: string;
    commentText: string;
    commentUrl: string;
  }): Promise<boolean> {
    const { to, mentionedName, authorName, commentText, commentUrl } = options;

    const subject = `💬 Você foi mencionado em um comentário`;
    
    const text = `
Olá ${mentionedName},

${authorName} mencionou você em um comentário:

"${commentText}"

Link: ${commentUrl}

---
PORTI-HPO
Por ti, pela ciência, em português
https://hpo.raras-cplp.org
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
    .comment { background: #faf5ff; padding: 12px; border-radius: 6px; font-style: italic; color: #6b21a8; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 Você foi mencionado</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${mentionedName}</strong>,</p>
      <p><strong>${authorName}</strong> mencionou você em um comentário:</p>
      
      <div class="card">
        <div class="comment">"${commentText}"</div>
      </div>
      
      <a href="${commentUrl}" class="button">Ver Comentário</a>
      
      <div class="footer">
        <p><strong>PORTI-HPO</strong></p>
        <p>Portuguese Open Research & Translation Initiative</p>
        <p><a href="https://hpo.raras-cplp.org">hpo.raras-cplp.org</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send level up notification
   */
  async sendLevelUpEmail(options: {
    to: string;
    userName: string;
    newLevel: number;
    totalPoints: number;
  }): Promise<boolean> {
    const { to, userName, newLevel, totalPoints } = options;

    const subject = `🎉 Parabéns! Você subiu para o Nível ${newLevel}`;
    
    const text = `
Parabéns ${userName}!

Você subiu para o Nível ${newLevel}!
Pontos totais: ${totalPoints}

Continue contribuindo e alcançe níveis ainda mais altos!

---
PORTI-HPO
Por ti, pela ciência, em português
https://hpo.raras-cplp.org
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: #1f2937; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .level-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1f2937; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .level-number { font-size: 48px; font-weight: 700; }
    .points { font-size: 18px; color: #78350f; margin-top: 8px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Parabéns!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Você alcançou um novo nível na plataforma!</p>
      
      <div class="level-badge">
        <div class="level-number">Nível ${newLevel}</div>
        <div class="points">${totalPoints} pontos totais</div>
      </div>
      
      <p>Continue contribuindo e alcançe níveis ainda mais altos!</p>
      
      <a href="https://hpo.raras-cplp.org/leaderboard" class="button">Ver Ranking</a>
      
      <div class="footer">
        <p><strong>PORTI-HPO</strong></p>
        <p>Portuguese Open Research & Translation Initiative</p>
        <p><a href="https://hpo.raras-cplp.org">hpo.raras-cplp.org</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Test email connection (for debugging)
   */
  async sendTestEmail(to: string): Promise<boolean> {
    const subject = '✅ Teste de Email - PORTI-HPO';
    const text = 'Este é um email de teste. Se você recebeu esta mensagem, o serviço de email PORTI está funcionando corretamente!';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .success { background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; color: #166534; }
  </style>
</head>
<body>
  <div class="success">
    <h2>✅ Teste de Email Bem-Sucedido!</h2>
    <p>Se você recebeu esta mensagem, o serviço de email está funcionando corretamente.</p>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Get service status
   */
  getStatus(): { enabled: boolean; from: string; fromName: string } {
    return {
      enabled: this.enabled,
      from: this.from,
      fromName: this.fromName
    };
  }
}

// Export singleton instance
export default new EmailService();
