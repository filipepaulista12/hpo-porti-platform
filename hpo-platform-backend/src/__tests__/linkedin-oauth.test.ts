/**
 * 🔗 LinkedIn OAuth Integration Tests
 * 
 * Testa o fluxo completo de autenticação via LinkedIn
 */

import { describe, it, expect } from '@jest/globals';

describe('LinkedIn OAuth', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';

  describe('GET /api/auth/linkedin', () => {
    it('should redirect to LinkedIn authorization page or return error', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin`, {
        redirect: 'manual'
      });

      // Se o LinkedIn está configurado, deve redirecionar (302)
      // Se não está configurado, deve retornar erro (500)
      expect([302, 500]).toContain(response.status);

      if (response.status === 302) {
        const location = response.headers.get('location');
        expect(location).toContain('linkedin.com/oauth');
        expect(location).toContain('client_id=');
        expect(location).toContain('state=');
        expect(location).toContain('scope=');
      } else {
        const data = await response.json() as any;
        expect(data.error).toContain('LinkedIn OAuth not configured');
      }
    });

    it('should include CSRF state parameter if configured', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin`, {
        redirect: 'manual'
      });

      if (response.status === 302) {
        const location = response.headers.get('location');
        const locationUrl = new URL(location!);
        const state = locationUrl.searchParams.get('state');

        expect(state).toBeTruthy();
        expect(state!.length).toBeGreaterThan(16); // Estado aleatório de 16+ caracteres
      }
    });

    it('should have route registered (not 404)', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin`, {
        redirect: 'manual'
      });

      expect(response.status).not.toBe(404);
    });
  });

  describe('GET /api/auth/linkedin/callback', () => {
    it('should return error if code is missing', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin/callback`);

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error).toBeDefined();
    });

    it('should return error if state is missing', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin/callback?code=test123`);

      // Aceitar 400 ou 500 (dependendo da implementação)
      expect([400, 500]).toContain(response.status);
      const data = await response.json() as any;
      expect(data.error).toBeDefined();
    });

    it('should handle invalid authorization code', async () => {
      const response = await fetch(
        `${API_URL}/api/auth/linkedin/callback?code=invalid&state=test123`
      );

      // Deve retornar erro (400 ou 500)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should have callback route registered (not 404)', async () => {
      const response = await fetch(`${API_URL}/api/auth/linkedin/callback`);

      expect(response.status).not.toBe(404);
    });
  });

  describe('LinkedIn OAuth Flow', () => {
    it('should have LinkedIn routes available', async () => {
      // Verificar que as rotas existem
      const authResponse = await fetch(`${API_URL}/api/auth/linkedin`, {
        redirect: 'manual'
      });
      expect(authResponse.status).not.toBe(404);

      const callbackResponse = await fetch(`${API_URL}/api/auth/linkedin/callback`);
      expect(callbackResponse.status).not.toBe(404);
    });
  });
});
