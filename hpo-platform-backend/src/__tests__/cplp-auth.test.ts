/**
 * CPLP Authentication Tests
 * Testa registro e login com campos CPLP (país, variante nativa, etc)
 */

import { describe, it, expect } from '@jest/globals';

describe('CPLP Authentication', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';

  describe('POST /api/auth/register - CPLP Fields', () => {
    it('should register user with country and native variant', async () => {
      const testEmail = `cplp-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'CPLP Test User',
          specialty: 'Neurologia',
          countryCode: 'BR',
          nativeVariant: 'PT_BR'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.countryCode).toBe('BR');
      expect(data.user.nativeVariant).toBe('PT_BR');
      expect(data.token).toBeDefined();
    });

    it('should register user with secondary variants', async () => {
      const testEmail = `cplp-secondary-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Multi-Variant User',
          specialty: 'Pediatria',
          countryCode: 'PT',
          nativeVariant: 'PT_PT',
          secondaryVariants: ['PT_BR', 'PT_AO']
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.countryCode).toBe('PT');
      expect(data.user.nativeVariant).toBe('PT_PT');
      expect(data.user.secondaryVariants).toEqual(['PT_BR', 'PT_AO']);
    });

    it('should register user from all 9 CPLP countries', async () => {
      const countries = [
        { code: 'BR', variant: 'PT_BR' },
        { code: 'PT', variant: 'PT_PT' },
        { code: 'AO', variant: 'PT_AO' },
        { code: 'MZ', variant: 'PT_MZ' },
        { code: 'GW', variant: 'PT_GW' },
        { code: 'CV', variant: 'PT_CV' },
        { code: 'ST', variant: 'PT_ST' },
        { code: 'TL', variant: 'PT_TL' },
        { code: 'GQ', variant: 'PT_GQ' }
      ];

      for (const country of countries) {
        const testEmail = `${country.code.toLowerCase()}-${Date.now()}@hpo.com`;
        
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: 'Test123!@#',
            name: `User from ${country.code}`,
            specialty: 'Medicina Geral',
            countryCode: country.code,
            nativeVariant: country.variant
          })
        });

        const data = await response.json() as any;

        expect(response.status).toBe(201);
        expect(data.user.countryCode).toBe(country.code);
        expect(data.user.nativeVariant).toBe(country.variant);
      }
    });

    it('should accept registration without CPLP fields (backward compatibility)', async () => {
      const testEmail = `no-cplp-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'No CPLP User',
          specialty: 'Cardiologia'
          // Sem countryCode, nativeVariant
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.countryCode).toBeNull();
      expect(data.user.nativeVariant).toBeNull();
    });

    it('should reject invalid variant code', async () => {
      const testEmail = `invalid-variant-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Invalid Variant User',
          specialty: 'Neurologia',
          countryCode: 'BR',
          nativeVariant: 'INVALID_VARIANT'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid country code', async () => {
      const testEmail = `invalid-country-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Invalid Country User',
          specialty: 'Pediatria',
          countryCode: 'XX', // Invalid
          nativeVariant: 'PT_BR'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should auto-fill preferredVariants from native + secondary', async () => {
      const testEmail = `preferred-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Preferred Variants User',
          specialty: 'Neurologia',
          countryCode: 'BR',
          nativeVariant: 'PT_BR',
          secondaryVariants: ['PT_PT', 'PT_AO']
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.preferredVariants).toEqual(['PT_BR', 'PT_PT', 'PT_AO']);
    });
  });

  describe('GET /api/auth/me - CPLP Data', () => {
    it('should return CPLP fields for authenticated user', async () => {
      // Registrar usuário
      const testEmail = `me-cplp-${Date.now()}@hpo.com`;
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Me CPLP User',
          specialty: 'Cardiologia',
          countryCode: 'AO',
          nativeVariant: 'PT_AO',
          secondaryVariants: ['PT_PT']
        })
      });

      const registerData = await registerResponse.json() as any;
      const authToken = registerData.token;

      // Buscar dados do usuário
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const meData = await meResponse.json() as any;

      expect(meResponse.status).toBe(200);
      expect(meData.countryCode).toBe('AO');
      expect(meData.nativeVariant).toBe('PT_AO');
      expect(meData.secondaryVariants).toEqual(['PT_PT']);
      expect(meData.preferredVariants).toEqual(['PT_AO', 'PT_PT']);
    });
  });

  describe('PATCH /api/users/profile - Update CPLP Fields', () => {
    it('should update user CPLP preferences', async () => {
      // Registrar usuário
      const testEmail = `update-cplp-${Date.now()}@hpo.com`;
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Update CPLP User',
          specialty: 'Pediatria',
          countryCode: 'BR',
          nativeVariant: 'PT_BR'
        })
      });

      const registerData = await registerResponse.json() as any;
      const authToken = registerData.token;

      // Atualizar preferências CPLP
      const updateResponse = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          secondaryVariants: ['PT_PT', 'PT_AO', 'PT_MZ']
        })
      });

      const updateData = await updateResponse.json() as any;

      expect(updateResponse.status).toBe(200);
      expect(updateData.secondaryVariants).toEqual(['PT_PT', 'PT_AO', 'PT_MZ']);
      expect(updateData.preferredVariants).toEqual(['PT_BR', 'PT_PT', 'PT_AO', 'PT_MZ']);
    });

    it('should allow changing native variant', async () => {
      // Registrar usuário
      const testEmail = `change-native-${Date.now()}@hpo.com`;
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Change Native User',
          specialty: 'Neurologia',
          countryCode: 'BR',
          nativeVariant: 'PT_BR'
        })
      });

      const registerData = await registerResponse.json() as any;
      const authToken = registerData.token;

      // Mudar variante nativa (ex: usuário mudou de país)
      const updateResponse = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          countryCode: 'PT',
          nativeVariant: 'PT_PT'
        })
      });

      const updateData = await updateResponse.json() as any;

      expect(updateResponse.status).toBe(200);
      expect(updateData.countryCode).toBe('PT');
      expect(updateData.nativeVariant).toBe('PT_PT');
    });
  });

  describe('Validation Rules', () => {
    it('should allow nativeVariant without countryCode', async () => {
      const testEmail = `variant-only-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Variant Only User',
          specialty: 'Medicina Geral',
          nativeVariant: 'PT_BR'
          // Sem countryCode
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.nativeVariant).toBe('PT_BR');
      expect(data.user.countryCode).toBeNull();
    });

    it('should allow countryCode without nativeVariant', async () => {
      const testEmail = `country-only-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Country Only User',
          specialty: 'Cardiologia',
          countryCode: 'BR'
          // Sem nativeVariant
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.countryCode).toBe('BR');
      expect(data.user.nativeVariant).toBeNull();
    });

    it('should reject secondaryVariants containing nativeVariant', async () => {
      const testEmail = `duplicate-variant-${Date.now()}@hpo.com`;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Duplicate Variant User',
          specialty: 'Pediatria',
          countryCode: 'BR',
          nativeVariant: 'PT_BR',
          secondaryVariants: ['PT_BR', 'PT_PT'] // PT_BR duplicado
        })
      });

      expect(response.status).toBe(400);
    });
  });
});
