/**
 * Authentication Tests
 * Testa fluxo de registro e login
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Authentication API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  const testEmail = `test-${Date.now()}@hpo.com`;
  const testPassword = 'Test123!@#';
  let authToken: string;

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
          specialty: 'Neurologia'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.name).toBe('Test User');
      
      authToken = data.token;
    });

    it('should reject duplicate email registration', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User 2',
          specialty: 'Cardiologia'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: testPassword,
          name: 'Test User',
          specialty: 'Neurologia'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should reject weak password', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `weak-${Date.now()}@hpo.com`,
          password: '123',
          name: 'Test User',
          specialty: 'Neurologia'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
    });

    it('should reject incorrect password', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@hpo.com',
          password: testPassword
        })
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.email).toBe(testEmail);
      expect(data.points).toBeDefined();
      expect(data.level).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`);

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': 'Bearer invalid-token-123' }
      });

      expect(response.status).toBe(401);
    });
  });
});
