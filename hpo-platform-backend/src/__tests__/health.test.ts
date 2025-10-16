/**
 * Health Check Tests
 * Testes básicos de smoke test para verificar se o servidor está funcionando
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Health Check Endpoint', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';

  it('should return 200 and status ok', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json() as any;

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.environment).toBeDefined();
  });

  it('should include uptime as a number', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json() as any;

    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThan(0);
  });

  it('should include environment variable', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json() as any;

    expect(['development', 'production', 'test']).toContain(data.environment);
  });
});
