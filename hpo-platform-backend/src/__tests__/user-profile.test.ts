/**
 * User Profile API Tests
 * Tests professional profile endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('User Profile API Endpoints', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  let translatorToken: string;
  let translatorId: string;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Clean up any existing test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['profile-translator@test.com', 'profile-admin@test.com']
        }
      }
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Create test translator
    const translator = await prisma.user.create({
      data: {
        email: 'profile-translator@test.com',
        name: 'Test Translator Profile',
        password: await bcrypt.hash('Test123!@#', 10),
        role: 'TRANSLATOR',
        orcidId: '0000-0001-2345-6789'
      }
    });
    translatorId = translator.id;
    translatorToken = jwt.sign(
      { id: translator.id, email: translator.email, role: 'TRANSLATOR' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Create test admin
    const admin = await prisma.user.create({
      data: {
        email: 'profile-admin@test.com',
        name: 'Test Admin Profile',
        password: await bcrypt.hash('Test123!@#', 10),
        role: 'ADMIN'
      }
    });
    adminId = admin.id;
    adminToken = jwt.sign(
      { id: admin.id, email: admin.email, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['profile-translator@test.com', 'profile-admin@test.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/users/profile/complete', () => {
    it('should return complete user profile with professional data', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/complete`, {
        headers: {
          'Authorization': `Bearer ${translatorToken}`
        }
      });

      expect(response.status).toBe(200);
      const body: any = await response.json();
      
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id', translatorId);
      expect(body.user).toHaveProperty('email', 'profile-translator@test.com');
      expect(body.user).toHaveProperty('orcidId', '0000-0001-2345-6789');
      expect(body.user).toHaveProperty('profileJson');
    });

    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/complete`);
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile/professional', () => {
    it('should update professional profile with valid data', async () => {
      const profileData = {
        academicDegree: 'phd',
        fieldOfStudy: 'Medicina',
        professionalRole: 'researcher',
        yearsOfExperience: 5,
        institution: 'USP',
        medicalSpecialty: 'Geneticista',
        researchArea: 'Doenças Raras',
        englishProficiency: 'advanced'
      };

      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify(profileData)
      });

      expect(response.status).toBe(200);
      const body: any = await response.json();

      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message', 'Professional profile updated successfully');
      expect(body.user).toHaveProperty('profileJson');
      
      // Verify data was saved
      const profileJson: any = body.user.profileJson;
      expect(profileJson.academicDegree).toBe('phd');
      expect(profileJson.fieldOfStudy).toBe('Medicina');
      expect(profileJson.professionalRole).toBe('researcher');
      expect(profileJson.englishProficiency).toBe('advanced');
    });

    it('should update eHEALS score and answers', async () => {
      const ehealsData = {
        ehealsScore: 35,
        ehealsAnswers: [5, 4, 5, 4, 5, 4, 4, 4]
      };

      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify(ehealsData)
      });

      expect(response.status).toBe(200);
      const body: any = await response.json();

      const profileJson: any = body.user.profileJson;
      expect(profileJson.ehealsScore).toBe(35);
      expect(profileJson.ehealsAnswers).toEqual([5, 4, 5, 4, 5, 4, 4, 4]);
    });

    it('should reject invalid academicDegree', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ academicDegree: 'invalid_degree' })
      });

      expect(response.status).toBe(400);
      const body: any = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid academic degree');
    });

    it('should reject invalid professionalRole', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ professionalRole: 'invalid_role' })
      });

      expect(response.status).toBe(400);
      const body: any = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid professional role');
    });

    it('should reject invalid englishProficiency', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ englishProficiency: 'invalid_level' })
      });

      expect(response.status).toBe(400);
      const body: any = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid English proficiency');
    });

    it('should reject invalid eHEALS score (too high)', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ ehealsScore: 50 })
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid eHEALS score (too low)', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ ehealsScore: 5 })
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid eHEALS answers array (wrong length)', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ ehealsAnswers: [5, 4, 3] })
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid eHEALS answers array (values out of range)', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({ ehealsAnswers: [5, 4, 6, 4, 5, 4, 4, 4] })
      });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ academicDegree: 'phd' })
      });

      expect(response.status).toBe(401);
    });

    it('should allow partial updates', async () => {
      // First set some data
      await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({
          academicDegree: 'phd',
          fieldOfStudy: 'Medicina'
        })
      });

      // Then update only one field
      const response = await fetch(`${API_URL}/api/users/profile/professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${translatorToken}`
        },
        body: JSON.stringify({
          englishProficiency: 'fluent'
        })
      });

      expect(response.status).toBe(200);
      const body: any = await response.json();

      const profileJson: any = body.user.profileJson;
      expect(profileJson.englishProficiency).toBe('fluent');
      // Previous fields should still be there
      expect(profileJson.academicDegree).toBe('phd');
      expect(profileJson.fieldOfStudy).toBe('Medicina');
    });
  });

  describe('Profile Security', () => {
    it('should not expose password in profile response', async () => {
      const response = await fetch(`${API_URL}/api/users/profile/complete`, {
        headers: {
          'Authorization': `Bearer ${translatorToken}`
        }
      });

      expect(response.status).toBe(200);
      const body: any = await response.json();
      expect(body.user).not.toHaveProperty('password');
    });
  });
});
