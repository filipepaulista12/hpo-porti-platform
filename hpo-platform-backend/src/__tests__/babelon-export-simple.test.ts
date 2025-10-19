/**
 * 📦 Babelon Export API Tests (Simplified)
 * 
 * Testa endpoint de exportação Babelon TSV
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Babelon Export API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  let adminToken: string;
  let translatorToken: string;
  let adminUserId: string;
  let translatorUserId: string;

  beforeAll(async () => {
    // Criar usuário ADMIN diretamente no database
    const adminUser = await prisma.user.create({
      data: {
        email: `admin-babelon-${Date.now()}@hpo.test`,
        password: await bcrypt.hash('Test123!@#', 10),
        name: 'Babelon Admin',
        role: 'ADMIN'
      }
    });
    adminUserId = adminUser.id;

    // Gerar token JWT para ADMIN
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Criar usuário TRANSLATOR
    const translatorUser = await prisma.user.create({
      data: {
        email: `translator-babelon-${Date.now()}@hpo.test`,
        password: await bcrypt.hash('Test123!@#', 10),
        name: 'Babelon Translator',
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

  describe('GET /api/export/release/babelon-with-orcid', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/export/release/babelon-with-orcid`);

      expect(response.status).toBe(401);
    });

    it('should require ADMIN role', async () => {
      const response = await fetch(`${API_URL}/api/export/release/babelon-with-orcid`, {
        headers: {
          'Authorization': `Bearer ${translatorToken}`
        }
      });

      expect(response.status).toBe(403);
    });

    it('should return TSV file for ADMIN', async () => {
      const response = await fetch(`${API_URL}/api/export/release/babelon-with-orcid`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      expect(response.status).toBe(200);
      
      // Verificar content-type
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/tab-separated-values');

      // Verificar content-disposition
      const contentDisposition = response.headers.get('content-disposition');
      expect(contentDisposition).toContain('attachment');
      expect(contentDisposition).toContain('.babelon.tsv');

      // Verificar conteúdo
      const text = await response.text();
      expect(text.length).toBeGreaterThan(0);
      
      // Verificar que tem header TSV
      const lines = text.split('\n');
      expect(lines.length).toBeGreaterThan(0);
      
      const header = lines[0];
      expect(header).toContain('subject_id');
      expect(header).toContain('predicate_id');
      expect(header).toContain('translation_value');
      expect(header).toContain('translator');
    });

    it('should filter by date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      const response = await fetch(
        `${API_URL}/api/export/release/babelon-with-orcid?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/tab-separated-values');
    });

    it('should have required Babelon columns', async () => {
      const response = await fetch(`${API_URL}/api/export/release/babelon-with-orcid`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const text = await response.text();
      const header = text.split('\n')[0];

      // Verificar colunas obrigatórias do formato Babelon
      const requiredColumns = [
        'subject_id',
        'predicate_id',
        'source_language',
        'source_value',
        'translation_language',
        'translation_value',
        'translator',
        'translator_expertise',
        'translation_date',
        'translation_confidence',
        'translation_precision',
        'translation_status',
        'source',
        'source_version'
      ];

      for (const column of requiredColumns) {
        expect(header).toContain(column);
      }
    });

    it('should return valid TSV format', async () => {
      const response = await fetch(`${API_URL}/api/export/release/babelon-with-orcid`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const text = await response.text();
      const lines = text.split('\n');

      // Verificar que cada linha tem o mesmo número de colunas
      if (lines.length > 1) {
        const headerColumns = lines[0].split('\t').length;
        
        for (let i = 1; i < Math.min(lines.length, 10); i++) {
          if (lines[i].trim()) {
            const dataColumns = lines[i].split('\t').length;
            expect(dataColumns).toBe(headerColumns);
          }
        }
      }
    });
  });
});
