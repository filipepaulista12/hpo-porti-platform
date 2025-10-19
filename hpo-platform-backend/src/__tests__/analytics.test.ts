/**
 * 📊 Analytics Dashboard Tests
 * 
 * Testa o endpoint de analytics (ADMIN only)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Analytics Dashboard (ADMIN)', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  let adminToken: string;
  let translatorToken: string;
  let adminUserId: string;
  let translatorUserId: string;

  beforeAll(async () => {
    // Criar usuário ADMIN diretamente no database
    const adminUser = await prisma.user.create({
      data: {
        email: `admin-analytics-${Date.now()}@hpo.test`,
        password: await bcrypt.hash('Test123!@#', 10),
        name: 'Admin Test',
        role: 'ADMIN'
      }
    });
    adminUserId = adminUser.id;

    // Gerar token JWT para ADMIN
    const jwtSecret = process.env.JWT_SECRET;
    
    // DEBUG: Log JWT_SECRET info
    console.log('🧪 [TEST DEBUG - analytics.test.ts] JWT Config:', {
      secretExists: !!jwtSecret,
      secretLength: jwtSecret?.length,
      secretPrefix: jwtSecret?.substring(0, 10) + '...',
      userId: adminUser.id,
      userEmail: adminUser.email
    });
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('✅ [TEST DEBUG] Admin token generated:', {
      tokenLength: adminToken.length,
      tokenPrefix: adminToken.substring(0, 20) + '...'
    });

    // Criar usuário TRANSLATOR
    const translatorUser = await prisma.user.create({
      data: {
        email: `translator-analytics-${Date.now()}@hpo.test`,
        password: await bcrypt.hash('Test123!@#', 10),
        name: 'Translator Test',
        role: 'TRANSLATOR'
      }
    });
    translatorUserId = translatorUser.id;

    // Gerar token JWT para TRANSLATOR
    translatorToken = jwt.sign(
      { id: translatorUser.id, email: translatorUser.email, role: 'TRANSLATOR' },
      jwtSecret,
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUserId, translatorUserId] }
      }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      
      expect(response.status).toBe(401);
      const data = await response.json() as any;
      expect(data.error).toBeDefined();
    });

    it('should return 403 if not ADMIN', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${translatorToken}`
        }
      });
      
      expect(response.status).toBe(403);
      const data = await response.json() as any;
      expect(data.error).toBeDefined();
    });

    it('should return analytics data for ADMIN', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;

      // Verificar KPIs retornados pelo endpoint REAL
      expect(data.activeUsers24h).toBeDefined();
      expect(data.totalUsers).toBeDefined();
      expect(data.returningUsers).toBeDefined();
      expect(data.retentionRate).toBeDefined();
      expect(data.avgSessionDuration).toBeDefined();
      expect(data.avgResponseTime).toBeDefined();
      
      // Verificar charts data
      expect(data.translationsPerDay).toBeDefined();
      expect(data.usersByCountry).toBeDefined();
      expect(data.deviceDistribution).toBeDefined();
      expect(data.browserDistribution).toBeDefined();
      expect(data.levelDistribution).toBeDefined();
      expect(data.translationsByStatus).toBeDefined();
      expect(data.topTranslators).toBeDefined();
      
      // Verificar date range
      expect(data.dateRange).toBeDefined();
      expect(data.dateRange.start).toBeDefined();
      expect(data.dateRange.end).toBeDefined();

      // Verificar tipos
      expect(typeof data.totalUsers).toBe('number');
      expect(typeof data.activeUsers24h).toBe('number');
      expect(Array.isArray(data.topTranslators)).toBe(true);
      expect(Array.isArray(data.translationsPerDay)).toBe(true);
    });

    it('should filter analytics by date range', async () => {
      const startDate = new Date('2025-01-01').toISOString();
      const endDate = new Date('2025-12-31').toISOString();

      const response = await fetch(
        `${API_URL}/api/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;
      expect(data.totalUsers).toBeDefined();
    });

    it('should return valid structure even with minimal data', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;

      expect(data.totalUsers).toBeGreaterThanOrEqual(0);
      expect(data.activeUsers24h).toBeGreaterThanOrEqual(0);
      expect(data.returningUsers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analytics Data Quality', () => {
    it('should return correct user count', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;

      // Verificar que temos pelo menos os 2 usuários de teste
      expect(data.totalUsers).toBeGreaterThanOrEqual(2);
    });

    it('should return top contributors ordered by count', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;
      const { topTranslators } = data;

      expect(Array.isArray(topTranslators)).toBe(true);
      
      if (topTranslators.length > 1) {
        // Verificar ordenação decrescente por pontos
        for (let i = 0; i < topTranslators.length - 1; i++) {
          expect(topTranslators[i].points).toBeGreaterThanOrEqual(
            topTranslators[i + 1].points
          );
        }
      }
    });

    it('should return translations per day with valid dates', async () => {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const responseData = await response.json() as any;
      const data = responseData.data;
      const { translationsPerDay } = data;

      expect(Array.isArray(translationsPerDay)).toBe(true);

      for (const entry of translationsPerDay) {
        // Verificar que cada entrada tem data e count válidos
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('count');
        expect(typeof entry.count).toBe('number');
        
        // Verificar que a data é válida
        const date = new Date(entry.date);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });
  });
});
