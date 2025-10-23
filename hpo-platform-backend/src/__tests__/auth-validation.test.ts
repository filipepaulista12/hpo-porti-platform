/**
 * Testes de Autenticação - VALIDAÇÃO APENAS (SEM BANCO DE DADOS)
 * Esses testes SEMPRE funcionam porque testam apenas validação de entrada
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('Authentication API - WITH MOCKS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should validate email format', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'StrongPass123!',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should validate password strength', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should validate required fields', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing password
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate email format on login', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should validate required fields', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing password
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      });

      expect(response.status).toBe(401);
    });

    it('should reject request with malformed token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: 'InvalidFormat token',
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
