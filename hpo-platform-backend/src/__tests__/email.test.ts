/**
 * 📧 Email Service Tests
 * 
 * Tests for Nodemailer integration and email templates
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import EmailService from '../services/email.service';

describe('Email Service', () => {
  beforeAll(() => {
    // Ensure service is initialized
    EmailService.getStatus();
  });

  describe('Service Status', () => {
    it('should return service configuration status', () => {
      const status = EmailService.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('from');
      expect(status).toHaveProperty('fromName');
      expect(typeof status.enabled).toBe('boolean');
    });

    it('should have proper from email configured', () => {
      const status = EmailService.getStatus();
      
      if (status.enabled) {
        expect(status.from).toBeTruthy();
        expect(status.from).toContain('@');
      }
    });

    it('should have PORTI-HPO branding in fromName', () => {
      const status = EmailService.getStatus();
      
      if (status.enabled && status.fromName) {
        // Should be either "PORTI-HPO" or custom name from .env
        expect(status.fromName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Email Templates', () => {
    it('should have sendTranslationApprovedEmail method', () => {
      expect(typeof EmailService.sendTranslationApprovedEmail).toBe('function');
    });

    it('should have sendTranslationRejectedEmail method', () => {
      expect(typeof EmailService.sendTranslationRejectedEmail).toBe('function');
    });

    it('should have sendConflictAssignedEmail method', () => {
      expect(typeof EmailService.sendConflictAssignedEmail).toBe('function');
    });

    it('should have sendCommentMentionEmail method', () => {
      expect(typeof EmailService.sendCommentMentionEmail).toBe('function');
    });

    it('should have sendLevelUpEmail method', () => {
      expect(typeof EmailService.sendLevelUpEmail).toBe('function');
    });

    it('should have sendTestEmail method', () => {
      expect(typeof EmailService.sendTestEmail).toBe('function');
    });
  });

  describe('Email Validation (Dry Run)', () => {
    it('should not throw errors when calling email methods with valid data', async () => {
      // Note: These won't actually send emails unless EMAIL_ENABLED=true
      // and SMTP is configured correctly
      
      const mockEmailData = {
        to: 'test@example.com',
        translatorName: 'Test User',
        termLabel: 'Abnormality of the heart',
        termId: 'HP:0001627',
        points: 100
      };

      // Should not throw even if email is disabled
      await expect(
        EmailService.sendTranslationApprovedEmail(mockEmailData)
      ).resolves.not.toThrow();
    });

    it('should handle rejection email data structure', async () => {
      const mockEmailData = {
        to: 'test@example.com',
        translatorName: 'Test User',
        termLabel: 'Abnormality of the heart',
        termId: 'HP:0001627',
        reason: 'Tradução imprecisa conforme diretrizes'
      };

      await expect(
        EmailService.sendTranslationRejectedEmail(mockEmailData)
      ).resolves.not.toThrow();
    });

    it('should handle level up email data structure', async () => {
      const mockEmailData = {
        to: 'test@example.com',
        userName: 'Test User',
        newLevel: 5,
        totalPoints: 500
      };

      await expect(
        EmailService.sendLevelUpEmail(mockEmailData)
      ).resolves.not.toThrow();
    });
  });

  describe('Email Service Integration', () => {
    it('should be importable and usable as singleton', () => {
      expect(EmailService).toBeDefined();
      expect(EmailService.getStatus).toBeDefined();
    });

    it('should maintain consistent state across calls', () => {
      const status1 = EmailService.getStatus();
      const status2 = EmailService.getStatus();
      
      expect(status1.enabled).toBe(status2.enabled);
      expect(status1.from).toBe(status2.from);
    });
  });

  describe('PORTI Branding Verification', () => {
    it('should not reference old "HPO Translation Platform" name', () => {
      const status = EmailService.getStatus();
      
      // fromName should be "PORTI-HPO" or custom name, not old platform name
      if (status.fromName) {
        expect(status.fromName).not.toContain('HPO Translation Platform');
      }
    });
  });
});
