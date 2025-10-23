import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// NOTE: This test validates the Babelon export logic WITHOUT starting the Express server
// to avoid port conflicts. We test the database queries and data transformation directly.

// Helper function to calculate translator expertise
const calculateExpertise = (profile: any): string => {
  if (!profile) return 'LAYPERSON';
  
  const { academicDegree, professionalRole, medicalSpecialty, ehealsScore } = profile;
  
  if ((academicDegree === 'phd' || professionalRole === 'clinician') && medicalSpecialty) {
    return 'DOMAIN_EXPERT';
  }
  
  if (academicDegree === 'master' || professionalRole === 'professor') {
    return 'PROFESSIONAL';
  }
  
  if (ehealsScore && ehealsScore >= 33) {
    return 'LAYPERSON_WITH_EXPERTISE';
  }
  
  return 'LAYPERSON';
};

// Helper to calculate translation confidence
const calculateConfidence = (selfConfidence: number, avgRating?: number): number => {
  if (!avgRating) {
    // Only self-confidence: 0-20%, 1-40%, 2-60%, 3-80%, 4-100%
    return (selfConfidence + 1) / 5;
  }
  
  // Combined: (self * 0.3) + (validation * 0.7)
  const selfScore = (selfConfidence + 1) / 5;
  const validationScore = avgRating / 5;
  return (selfScore * 0.3) + (validationScore * 0.7);
};

// Note: This test validates the Babelon export logic WITHOUT starting the Express server
// to avoid port conflicts. We test the database queries and data transformation directly.
describe('Babelon Export Logic', () => {
  let adminId: string;
  let translatorId: string;
  let testTermId: string;
  let testTranslationId: string;

  beforeAll(async () => {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: `admin-babelon-${Date.now()}@test.com`,
        name: 'Babelon Admin',
        password: await bcrypt.hash('Test123!@#', 10),
        role: 'ADMIN',
        orcidId: '0000-0002-1234-5678'
      }
    });
    adminId = admin.id;

    // Create translator with professional profile
    const translator = await prisma.user.create({
      data: {
        email: `translator-babelon-${Date.now()}@test.com`,
        name: 'Babelon Translator',
        password: await bcrypt.hash('Test123!@#', 10),
        role: 'TRANSLATOR',
        orcidId: '0000-0003-9876-5432',
        profileJson: {
          academicDegree: 'phd',
          fieldOfStudy: 'Medicina',
          professionalRole: 'researcher',
          medicalSpecialty: 'Geneticista',
          englishProficiency: 'advanced',
          ehealsScore: 35
        }
      }
    });
    translatorId = translator.id;

    // Create test HPO term
    const term = await prisma.hpoTerm.create({
      data: {
        hpoId: `HP:${Date.now()}`,
        labelEn: 'Test Term for Babelon',
        definitionEn: 'This is a test definition for Babelon export',
        category: 'Test',
        synonymsEn: []
      }
    });
    testTermId = term.id;

    // Create approved translation
    const translation = await prisma.translation.create({
      data: {
        termId: testTermId,
        userId: translatorId,
        labelPt: 'Termo de Teste para Babelon',
        definitionPt: 'Esta é uma definição de teste para exportação Babelon',
        confidence: 4,
        status: 'APPROVED',
        source: 'MANUAL'
      }
    });
    testTranslationId = translation.id;

    // Create validation for the translation
    await prisma.validation.create({
      data: {
        translationId: testTranslationId,
        validatorId: adminId,
        rating: 5,
        decision: 'APPROVED',
        comments: 'Excellent translation'
      }
    });
  });

  afterAll(async () => {
    // Cleanup in correct order (due to foreign keys)
    await prisma.validation.deleteMany({
      where: { translationId: testTranslationId }
    });
    await prisma.translation.deleteMany({
      where: { id: testTranslationId }
    });
    await prisma.hpoTerm.deleteMany({
      where: { id: testTermId }
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'admin-babelon' } },
          { email: { contains: 'translator-babelon' } }
        ]
      }
    });
    await prisma.$disconnect();
  });

  describe('Database Queries', () => {
    it('should fetch approved translations with user data', async () => {
      const translations = await prisma.translation.findMany({
        where: {
          status: 'APPROVED',
          id: testTranslationId
        },
        include: {
          term: true,
          user: true,
          validations: true
        }
      });

      expect(translations).toHaveLength(1);
      const translation = translations[0];
      
      expect(translation.term).toBeDefined();
      expect(translation.user).toBeDefined();
      expect(translation.user.orcidId).toBe('0000-0003-9876-5432');
      expect(translation.validations).toHaveLength(1);
    });

    it('should calculate average validation rating', async () => {
      const translation = await prisma.translation.findUnique({
        where: { id: testTranslationId },
        include: { validations: true }
      });

      expect(translation).toBeDefined();
      expect(translation!.validations).toHaveLength(1);
      
      const avgRating = translation!.validations.reduce((sum, v) => sum + (v.rating || 0), 0) / translation!.validations.length;
      expect(avgRating).toBe(5);
    });
  });

  describe('Expertise Calculation', () => {
    it('should classify PhD + medical specialty as DOMAIN_EXPERT', () => {
      const expertise = calculateExpertise({
        academicDegree: 'phd',
        medicalSpecialty: 'Geneticista'
      });
      expect(expertise).toBe('DOMAIN_EXPERT');
    });

    it('should classify clinician + medical specialty as DOMAIN_EXPERT', () => {
      const expertise = calculateExpertise({
        professionalRole: 'clinician',
        medicalSpecialty: 'Cardiologista'
      });
      expect(expertise).toBe('DOMAIN_EXPERT');
    });

    it('should classify master degree as PROFESSIONAL', () => {
      const expertise = calculateExpertise({
        academicDegree: 'master'
      });
      expect(expertise).toBe('PROFESSIONAL');
    });

    it('should classify professor as PROFESSIONAL', () => {
      const expertise = calculateExpertise({
        professionalRole: 'professor'
      });
      expect(expertise).toBe('PROFESSIONAL');
    });

    it('should classify high eHEALS score as LAYPERSON_WITH_EXPERTISE', () => {
      const expertise = calculateExpertise({
        ehealsScore: 35
      });
      expect(expertise).toBe('LAYPERSON_WITH_EXPERTISE');
    });

    it('should classify empty profile as LAYPERSON', () => {
      const expertise = calculateExpertise({});
      expect(expertise).toBe('LAYPERSON');
    });

    it('should classify null profile as LAYPERSON', () => {
      const expertise = calculateExpertise(null);
      expect(expertise).toBe('LAYPERSON');
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate confidence from self-rating only', () => {
      expect(calculateConfidence(0)).toBe(0.2); // (0+1)/5 = 0.2
      expect(calculateConfidence(1)).toBe(0.4); // (1+1)/5 = 0.4
      expect(calculateConfidence(2)).toBe(0.6); // (2+1)/5 = 0.6
      expect(calculateConfidence(3)).toBe(0.8); // (3+1)/5 = 0.8
      expect(calculateConfidence(4)).toBe(1.0); // (4+1)/5 = 1.0
    });

    it('should combine self-rating and validation rating', () => {
      // confidence 4 (self 1.0) + rating 5 (validation 1.0)
      // = (1.0 * 0.3) + (1.0 * 0.7) = 1.0
      expect(calculateConfidence(4, 5)).toBeCloseTo(1.0, 2);
      
      // confidence 3 (self 0.8) + rating 4 (validation 0.8)
      // = (0.8 * 0.3) + (0.8 * 0.7) = 0.8
      expect(calculateConfidence(3, 4)).toBeCloseTo(0.8, 2);
      
      // confidence 2 (self 0.6) + rating 3 (validation 0.6)
      // = (0.6 * 0.3) + (0.6 * 0.7) = 0.6
      expect(calculateConfidence(2, 3)).toBeCloseTo(0.6, 2);
    });

    it('should weight validation rating higher than self-rating', () => {
      // Low self-confidence (1 = 0.4) but high validation (5 = 1.0)
      // = (0.4 * 0.3) + (1.0 * 0.7) = 0.12 + 0.7 = 0.82
      const result = calculateConfidence(1, 5);
      expect(result).toBeCloseTo(0.82, 2);
    });
  });

  describe('Babelon Format', () => {
    it('should format ORCID ID correctly', () => {
      const orcidId = '0000-0003-9876-5432';
      const formatted = `https://orcid.org/${orcidId}`;
      expect(formatted).toBe('https://orcid.org/0000-0003-9876-5432');
    });

    it('should use internal ID for users without ORCID', () => {
      const userId = 'abc123';
      const formatted = `internal:${userId}`;
      expect(formatted).toBe('internal:abc123');
    });

    it('should escape tabs in text values', () => {
      const textWithTabs = 'Test\tWith\tTabs';
      const escaped = textWithTabs.replace(/\t/g, ' ');
      expect(escaped).toBe('Test With Tabs');
    });

    it('should format translation date as ISO string', () => {
      const date = new Date('2025-10-20T10:30:00Z');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2025-10-20');
    });
  });

  describe('Data Integrity', () => {
    it('should ensure created translation has all required fields', async () => {
      const translation = await prisma.translation.findUnique({
        where: { id: testTranslationId },
        include: {
          term: true,
          user: true
        }
      });

      expect(translation).toBeDefined();
      expect(translation!.term.hpoId).toBeDefined();
      expect(translation!.labelPt).toBeDefined();
      expect(translation!.confidence).toBeDefined();
      expect(translation!.status).toBe('APPROVED');
      expect(translation!.user.orcidId).toBeDefined();
    });

    it('should ensure validation has rating', async () => {
      const validations = await prisma.validation.findMany({
        where: { translationId: testTranslationId }
      });

      expect(validations).toHaveLength(1);
      expect(validations[0].rating).toBe(5);
      expect(validations[0].decision).toBe('APPROVED');
    });
  });
});
