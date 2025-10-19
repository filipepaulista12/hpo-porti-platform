import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import EmailService from '../services/email.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/test/send-email
 * Test email sending (authenticated users)
 * Body: { to: string }
 */
router.post('/send-email', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email recipient (to) is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const success = await EmailService.sendTestEmail(to);

    res.json({
      success,
      message: success 
        ? `Test email sent successfully to ${to}` 
        : 'Failed to send test email (check logs and SMTP configuration)',
      emailService: EmailService.getStatus()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test/send-translation-approved
 * Test translation approved email
 */
router.post('/send-translation-approved', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { to } = req.body;

    const success = await EmailService.sendTranslationApprovedEmail({
      to: to || req.user!.email,
      translatorName: req.user!.name,
      termLabel: 'Abnormal nervous system morphology',
      termId: 'HP:0012443',
      points: 15
    });

    res.json({
      success,
      message: success ? 'Email sent' : 'Failed to send email'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test/send-translation-rejected
 * Test translation rejected email
 */
router.post('/send-translation-rejected', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { to } = req.body;

    const success = await EmailService.sendTranslationRejectedEmail({
      to: to || req.user!.email,
      translatorName: req.user!.name,
      termLabel: 'Seizure',
      termId: 'HP:0001250',
      reason: 'A tradução não está de acordo com as diretrizes. Por favor, revise a terminologia médica utilizada.'
    });

    res.json({
      success,
      message: success ? 'Email sent' : 'Failed to send email'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test/send-conflict-assigned
 * Test conflict assigned email
 */
router.post('/send-conflict-assigned', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { to } = req.body;

    const success = await EmailService.sendConflictAssignedEmail({
      to: to || req.user!.email,
      reviewerName: req.user!.name,
      termLabel: 'Ataxia',
      termId: 'HP:0001251',
      conflictUrl: 'http://localhost:5173/conflicts/abc123'
    });

    res.json({
      success,
      message: success ? 'Email sent' : 'Failed to send email'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test/send-level-up
 * Test level up email
 */
router.post('/send-level-up', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { to } = req.body;
    
    // Get full user data with points and level
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const success = await EmailService.sendLevelUpEmail({
      to: to || req.user!.email,
      userName: req.user!.name,
      newLevel: fullUser.level + 1,
      totalPoints: fullUser.points + 100
    });

    res.json({
      success,
      message: success ? 'Email sent' : 'Failed to send email'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test/email-status
 * Get email service status
 */
router.get('/email-status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const status = EmailService.getStatus();

    res.json({
      success: true,
      status,
      instructions: status.enabled 
        ? 'Email service is running. Use POST /api/test/send-email to send a test email.'
        : 'Email service is disabled. Set EMAIL_ENABLED=true and configure SMTP variables in .env file.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
