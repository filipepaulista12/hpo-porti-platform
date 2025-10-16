/**
 * HPO Terms Tests
 * Testa endpoints de listagem e busca de termos HPO
 */

import { describe, it, expect } from '@jest/globals';

describe('HPO Terms API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  let authToken: string;

  beforeAll(async () => {
    // Criar usuário de teste e fazer login
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `terms-test-${Date.now()}@hpo.com`,
        password: 'Test123!@#',
        name: 'Terms Test User',
        specialty: 'Genética'
      })
    });

    const data = await registerResponse.json() as any;
    authToken = data.token;
  });

  describe('GET /api/terms', () => {
    it('should return paginated terms list', async () => {
      const response = await fetch(`${API_URL}/api/terms?page=1&limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.terms).toBeDefined();
      expect(Array.isArray(data.terms)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it('should return terms with correct structure', async () => {
      const response = await fetch(`${API_URL}/api/terms?page=1&limit=1`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      const term = data.terms[0];

      expect(term.id).toBeDefined();
      expect(term.hpoId).toBeDefined();
      expect(term.labelEn).toBeDefined();
      expect(term.translationStatus).toBeDefined();
      expect(term.hpoId).toMatch(/^HP:\d+$/); // Format HP:0000001
    });

    it('should filter by translation status', async () => {
      const response = await fetch(`${API_URL}/api/terms?status=NOT_TRANSLATED&limit=5`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.terms).toBeDefined();
      
      if (data.terms.length > 0) {
        data.terms.forEach((term: any) => {
          expect(term.translationStatus).toBe('NOT_TRANSLATED');
        });
      }
    });

    it('should search by term label', async () => {
      const response = await fetch(`${API_URL}/api/terms?search=abnormal&limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.terms).toBeDefined();
      
      if (data.terms.length > 0) {
        const hasSearchTerm = data.terms.some((term: any) => 
          term.labelEn.toLowerCase().includes('abnormal')
        );
        expect(hasSearchTerm).toBe(true);
      }
    });

    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/terms?page=1&limit=10`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/terms/:id', () => {
    it('should return single term by ID', async () => {
      // Primeiro, pegar um termo da lista
      const listResponse = await fetch(`${API_URL}/api/terms?page=1&limit=1`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const listData = await listResponse.json() as any;
      const termId = listData.terms[0].id;

      // Agora buscar esse termo específico
      const response = await fetch(`${API_URL}/api/terms/${termId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.id).toBe(termId);
      expect(data.hpoId).toBeDefined();
      expect(data.labelEn).toBeDefined();
    });

    it('should return 404 for non-existent term', async () => {
      const response = await fetch(`${API_URL}/api/terms/00000000-0000-0000-0000-000000000000`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status).toBe(404);
    });
  });
});
