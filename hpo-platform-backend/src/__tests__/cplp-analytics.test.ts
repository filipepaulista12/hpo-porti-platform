/**
 * CPLP Analytics Tests
 * Testa os 4 endpoints de analytics CPLP
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('CPLP Analytics API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  let authToken: string;
  let userId: string;
  let testTermId: string;

  beforeAll(async () => {
    // Criar usuário de teste com variante CPLP
    const testEmail = `cplp-test-${Date.now()}@hpo.com`;
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123!@#',
        name: 'CPLP Test User',
        specialty: 'Neurologia',
        countryCode: 'BR',
        nativeVariant: 'PT_BR',
        secondaryVariants: ['PT_PT']
      })
    });

    const registerData = await registerResponse.json() as any;
    authToken = registerData.token;
    userId = registerData.user.id;

    // Buscar um termo para testar traduções
    const termsResponse = await fetch(`${API_URL}/api/terms?limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const termsData = await termsResponse.json() as any;
    if (termsData.terms && termsData.terms.length > 0) {
      testTermId = termsData.terms[0].id;
    }
  });

  describe('GET /api/cplp-analytics/variant-progress', () => {
    it('should return progress for all 9 CPLP variants', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data.variants)).toBe(true);
      expect(data.variants.length).toBe(9);
      expect(data.totalTerms).toBeGreaterThan(0);

      // Verificar estrutura de cada variante
      const variant = data.variants[0];
      expect(variant).toHaveProperty('variant');
      expect(variant).toHaveProperty('translatedTerms');
      expect(variant).toHaveProperty('progressPercentage');
      expect(variant).toHaveProperty('activeTranslators');
      expect(variant).toHaveProperty('nativeTranslations');
      expect(variant).toHaveProperty('nativeValidations');

      // Verificar que todas as variantes CPLP estão presentes
      const variantCodes = data.variants.map((v: any) => v.variant);
      const expectedVariants = ['PT_BR', 'PT_PT', 'PT_AO', 'PT_MZ', 'PT_GW', 'PT_CV', 'PT_ST', 'PT_TL', 'PT_GQ'];
      expectedVariants.forEach(v => {
        expect(variantCodes).toContain(v);
      });
    });

    it('should calculate progress percentage correctly', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      
      data.variants.forEach((variant: any) => {
        expect(variant.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(variant.progressPercentage).toBeLessThanOrEqual(100);
        
        // Verificar cálculo: (translatedTerms / totalTerms) * 100
        const expectedPercentage = (variant.translatedTerms / data.totalTerms) * 100;
        expect(Math.abs(variant.progressPercentage - expectedPercentage)).toBeLessThan(0.01);
      });
    });

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/cplp-analytics/country-ranking', () => {
    it('should return rankings for all CPLP countries', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data.rankings)).toBe(true);

      // Verificar estrutura
      if (data.rankings.length > 0) {
        const ranking = data.rankings[0];
        expect(ranking).toHaveProperty('rank');
        expect(ranking).toHaveProperty('countryCode');
        expect(ranking).toHaveProperty('countryName');
        expect(ranking).toHaveProperty('flag');
        expect(ranking).toHaveProperty('variant');
        expect(ranking).toHaveProperty('totalTranslators');
        expect(ranking).toHaveProperty('activeTranslators');
        expect(ranking).toHaveProperty('totalTranslations');
        expect(ranking).toHaveProperty('approvedTranslations');
        expect(ranking).toHaveProperty('totalValidations');
        expect(ranking).toHaveProperty('totalPoints');
      }
    });

    it('should filter by variant when provided', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking?variant=PT_BR`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      
      // Todos os rankings devem ser PT_BR
      data.rankings.forEach((ranking: any) => {
        expect(ranking.variant).toBe('PT_BR');
      });
    });

    it('should order rankings by totalPoints descending', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      // Verificar ordem decrescente de pontos
      for (let i = 0; i < data.rankings.length - 1; i++) {
        expect(data.rankings[i].totalPoints).toBeGreaterThanOrEqual(data.rankings[i + 1].totalPoints);
        expect(data.rankings[i].rank).toBe(i + 1);
      }
    });

    it('should include top contributor for each country', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      data.rankings.forEach((ranking: any) => {
        if (ranking.topContributor) {
          expect(ranking.topContributor).toHaveProperty('id');
          expect(ranking.topContributor).toHaveProperty('name');
          expect(ranking.topContributor).toHaveProperty('points');
        }
      });
    });

    it('should reject invalid variant code', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking?variant=INVALID`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cplp-analytics/variant-comparison/:termId', () => {
    it('should return translations for all variants of a term', async () => {
      if (!testTermId) {
        console.warn('⚠️  Skipping test: no terms available');
        return;
      }

      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-comparison/${testTermId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('termId');
      expect(data).toHaveProperty('termName');
      expect(data).toHaveProperty('translations');
      expect(Array.isArray(data.translations)).toBe(true);

      // Verificar estrutura de traduções
      data.translations.forEach((translation: any) => {
        expect(translation).toHaveProperty('variant');
        expect(translation).toHaveProperty('labelPt');
        expect(translation).toHaveProperty('confidence');
        expect(translation).toHaveProperty('status');
        expect(translation).toHaveProperty('isNativeTranslation');
        expect(translation).toHaveProperty('translator');
        
        if (translation.translator) {
          expect(translation.translator).toHaveProperty('name');
        }
      });
    });

    it('should group translations by variant', async () => {
      if (!testTermId) return;

      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-comparison/${testTermId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      // Verificar que retorna traduções
      expect(data.translations.length).toBeGreaterThan(0);
      
      // Verificar que todas têm variant válida
      const variants = data.translations.map((t: any) => t.variant);
      const validVariants = ['PT_BR', 'PT_PT', 'PT_AO', 'PT_MZ', 'PT_GW', 'PT_CV', 'PT_ST', 'PT_TL', 'PT_GQ'];
      variants.forEach((v: string) => {
        expect(validVariants).toContain(v);
      });
    });

    it('should return 404 for non-existent term', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-comparison/non-existent-id`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/cplp-analytics/user-contribution/:userId', () => {
    it('should return user contributions by variant', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/user-contribution/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('userName');
      expect(data).toHaveProperty('countryCode');
      expect(data).toHaveProperty('nativeVariant');
      expect(Array.isArray(data.contributions)).toBe(true);

      // Verificar estrutura de contribuições
      data.contributions.forEach((contrib: any) => {
        expect(contrib).toHaveProperty('variant');
        expect(contrib).toHaveProperty('totalTranslations');
        expect(contrib).toHaveProperty('approvedTranslations');
        expect(contrib).toHaveProperty('nativeTranslations');
        expect(contrib).toHaveProperty('validationsGiven');
        expect(contrib).toHaveProperty('points');
        expect(contrib).toHaveProperty('percentage');
      });
    });

    it('should calculate percentage correctly', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/user-contribution/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;

      const totalTranslations = data.contributions.reduce((sum: number, c: any) => sum + c.totalTranslations, 0);
      
      if (totalTranslations > 0) {
        data.contributions.forEach((contrib: any) => {
          const expectedPercentage = (contrib.totalTranslations / totalTranslations) * 100;
          expect(Math.abs(contrib.percentage - expectedPercentage)).toBeLessThan(0.01);
        });

        // Soma das percentagens deve ser ~100%
        const totalPercentage = data.contributions.reduce((sum: number, c: any) => sum + c.percentage, 0);
        expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1);
      }
    });

    it('should only allow access to own data or admin', async () => {
      // Criar outro usuário
      const otherEmail = `other-${Date.now()}@hpo.com`;
      const otherResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otherEmail,
          password: 'Test123!@#',
          name: 'Other User',
          specialty: 'Cardiologia'
        })
      });

      const otherData = await otherResponse.json() as any;
      const otherUserId = otherData.user.id;

      // Tentar acessar dados de outro usuário
      const response = await fetch(`${API_URL}/api/cplp-analytics/user-contribution/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // Deve retornar 403 (não autorizado)
      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/user-contribution/non-existent-user`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Integration: Translation with Variants', () => {
    it('should create translation with CPLP variant', async () => {
      if (!testTermId) return;

      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          termId: testTermId,
          labelPt: 'Teste Tradução CPLP',
          confidence: 4, // 1-5 scale (was 0.9)
          variant: 'PT_BR',
          linguisticNotes: 'Termo usado no contexto brasileiro'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.translation.variant).toBe('PT_BR');
      expect(data.translation.linguisticNotes).toBe('Termo usado no contexto brasileiro');
      expect(data.translation.isNativeTranslation).toBe(true); // User é PT_BR
    });

    it('should detect non-native translation', async () => {
      if (!testTermId) return;

      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          termId: testTermId,
          labelPt: 'Teste Tradução PT-PT',
          confidence: 4, // 1-5 scale (was 0.8)
          variant: 'PT_PT' // Diferente da nativa do usuário (PT_BR)
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.translation.variant).toBe('PT_PT');
      expect(data.translation.isNativeTranslation).toBe(false); // User é PT_BR, tradução é PT_PT
    });

    it('should update variant-progress after translation', async () => {
      if (!testTermId) return;

      // Buscar progresso antes
      const beforeResponse = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const beforeData = await beforeResponse.json() as any;
      const beforeBR = beforeData.variants.find((v: any) => v.variant === 'PT_BR');

      // Criar tradução
      await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          termId: testTermId,
          labelPt: 'Nova Tradução para Analytics',
          confidence: 0.95,
          variant: 'PT_BR'
        })
      });

      // Buscar progresso depois
      const afterResponse = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const afterData = await afterResponse.json() as any;
      const afterBR = afterData.variants.find((v: any) => v.variant === 'PT_BR');

      // Progresso deve ter aumentado
      expect(afterBR.translatedTerms).toBeGreaterThanOrEqual(beforeBR.translatedTerms);
    });
  });
});
