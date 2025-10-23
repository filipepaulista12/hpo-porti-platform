/**
 * CPLP E2E Tests
 * Testa o fluxo completo de CPLP features do início ao fim
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('CPLP E2E Flow', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  
  let brUserToken: string;
  let brUserId: string;
  let ptUserToken: string;
  let ptUserId: string;
  let termId: string;
  let translationId: string;

  beforeAll(async () => {
    // Setup: Buscar um termo para usar nos testes
    const setupUser = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `setup-${Date.now()}@hpo.com`,
        password: 'Test123!@#',
        name: 'Setup User',
        specialty: 'Medicina'
      })
    });
    
    const setupData = await setupUser.json() as any;
    const setupToken = setupData.token;

    // Get a random term from the list (avoid always using term[0] which may have translations)
    const randomOffset = Math.floor(Math.random() * 20); // Random term from first 20
    const termsResponse = await fetch(`${API_URL}/api/terms?limit=1&offset=${randomOffset}`, {
      headers: { 'Authorization': `Bearer ${setupToken}` }
    });
    const termsData = await termsResponse.json() as any;
    
    if (!termsData.terms || termsData.terms.length === 0) {
      throw new Error('No terms available for E2E testing. Please run seed.');
    }
    
    termId = termsData.terms[0].id;
  });

  describe('Scenario: Brazilian and Portuguese users collaborate', () => {
    it('Step 1: Brazilian user registers with PT_BR variant', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `br-user-${Date.now()}@hpo.com`,
          password: 'Test123!@#',
          name: 'Brazilian Translator',
          specialty: 'Genética',
          countryCode: 'BR',
          nativeVariant: 'PT_BR',
          secondaryVariants: ['PT_AO']
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.user.countryCode).toBe('BR');
      expect(data.user.nativeVariant).toBe('PT_BR');
      expect(data.user.preferredVariants).toContain('PT_BR');
      expect(data.user.preferredVariants).toContain('PT_AO');

      brUserToken = data.token;
      brUserId = data.user.id;
    });

    it('Step 2: Portuguese user registers with PT_PT variant', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `pt-user-${Date.now()}@hpo.com`,
          password: 'Test123!@#',
          name: 'Portuguese Translator',
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

      ptUserToken = data.token;
      ptUserId = data.user.id;
    });

    it('Step 3: Brazilian user creates PT_BR translation', async () => {
      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${brUserToken}` 
        },
        body: JSON.stringify({
          termId: termId,
          labelPt: 'Tradução Brasileira',
          confidence: 4, // Changed from 0.9 to 4 (scale 1-5)
          variant: 'PT_BR',
          linguisticNotes: 'Termo comum no Brasil, usado em contexto médico'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.translation.variant).toBe('PT_BR');
      expect(data.translation.isNativeTranslation).toBe(true);
      expect(data.translation.linguisticNotes).toBe('Termo comum no Brasil, usado em contexto médico');

      translationId = data.translation.id;
    });

    it('Step 4: Portuguese user creates PT_PT translation', async () => {
      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ptUserToken}` 
        },
        body: JSON.stringify({
          termId: termId,
          labelPt: 'Tradução Portuguesa',
          confidence: 5, // Changed from 0.95 to 5 (scale 1-5)
          variant: 'PT_PT',
          linguisticNotes: 'Terminologia europeia, conforme normas portuguesas'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.translation.variant).toBe('PT_PT');
      expect(data.translation.isNativeTranslation).toBe(true);
    });

    it('Step 5: Brazilian user creates non-native PT_AO translation', async () => {
      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${brUserToken}` 
        },
        body: JSON.stringify({
          termId: termId,
          labelPt: 'Tradução Angolana',
          confidence: 3, // Changed from 0.7 to 3 (scale 1-5)
          variant: 'PT_AO',
          linguisticNotes: 'Adaptação para variante angolana baseada em pesquisa'
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(201);
      expect(data.translation.variant).toBe('PT_AO');
      expect(data.translation.isNativeTranslation).toBe(false); // BR traduzindo AO
    });

    it('Step 6: Verify variant comparison shows all translations', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-comparison/${termId}`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.translations.length).toBeGreaterThanOrEqual(3);

      // Verificar presença das 3 variantes
      const variants = data.translations.map((t: any) => t.variant);
      expect(variants).toContain('PT_BR');
      expect(variants).toContain('PT_PT');
      expect(variants).toContain('PT_AO');

      // Verificar traduções nativas
      const brTranslation = data.translations.find((t: any) => t.variant === 'PT_BR');
      expect(brTranslation?.isNativeTranslation).toBe(true);

      const aoTranslation = data.translations.find((t: any) => t.variant === 'PT_AO');
      expect(aoTranslation?.isNativeTranslation).toBe(false);
    });

    it('Step 7: Check variant progress reflects new translations', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });

      const data = await response.json() as any;

      const brVariant = data.variants.find((v: any) => v.variant === 'PT_BR');
      const ptVariant = data.variants.find((v: any) => v.variant === 'PT_PT');
      const aoVariant = data.variants.find((v: any) => v.variant === 'PT_AO');

      expect(brVariant.translatedTerms).toBeGreaterThan(0);
      expect(ptVariant.translatedTerms).toBeGreaterThan(0);
      expect(aoVariant.translatedTerms).toBeGreaterThan(0);

      expect(brVariant.nativeTranslations).toBeGreaterThan(0);
      expect(aoVariant.nativeTranslations).toBe(0); // Tradução não-nativa
    });

    it('Step 8: Verify country ranking includes both users', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/country-ranking`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });

      const data = await response.json() as any;

      const brRanking = data.rankings.find((r: any) => r.countryCode === 'BR');
      const ptRanking = data.rankings.find((r: any) => r.countryCode === 'PT');

      expect(brRanking).toBeDefined();
      expect(brRanking.totalTranslators).toBeGreaterThan(0);

      expect(ptRanking).toBeDefined();
      expect(ptRanking.totalTranslators).toBeGreaterThan(0);
    });

    it('Step 9: Check user contribution analytics', async () => {
      const response = await fetch(`${API_URL}/api/cplp-analytics/user-contribution/${brUserId}`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.userId).toBe(brUserId);
      expect(data.countryCode).toBe('BR');
      expect(data.nativeVariant).toBe('PT_BR');

      // Verificar contribuições por variante
      const brContrib = data.contributions.find((c: any) => c.variant === 'PT_BR');
      expect(brContrib).toBeDefined();
      expect(brContrib.total).toBeGreaterThanOrEqual(1); // Changed from totalTranslations
      expect(brContrib.native).toBeGreaterThanOrEqual(1); // Changed from nativeTranslations

      const aoContrib = data.contributions.find((c: any) => c.variant === 'PT_AO');
      expect(aoContrib).toBeDefined();
      expect(aoContrib.total).toBeGreaterThanOrEqual(1); // Changed from totalTranslations
      expect(aoContrib.native).toBe(0); // Non-native (already correct field name)
    });

    it('Step 10: Update user CPLP preferences', async () => {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${brUserToken}` 
        },
        body: JSON.stringify({
          secondaryVariants: ['PT_PT', 'PT_AO', 'PT_MZ']
        })
      });

      const data = await response.json() as any;

      expect(response.status).toBe(200);
      expect(data.secondaryVariants).toEqual(['PT_PT', 'PT_AO', 'PT_MZ']);
      expect(data.preferredVariants).toContain('PT_BR');
      expect(data.preferredVariants).toContain('PT_PT');
      expect(data.preferredVariants).toContain('PT_AO');
      expect(data.preferredVariants).toContain('PT_MZ');
    });
  });

  describe('Scenario: Analytics and rankings reflect real-time data', () => {
    it('should update variant progress after multiple translations', async () => {
      // Buscar progresso inicial
      const before = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });
      const beforeData = await before.json() as any;
      const beforeBR = beforeData.variants.find((v: any) => v.variant === 'PT_BR');

      // Criar mais traduções
      await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${brUserToken}` 
        },
        body: JSON.stringify({
          termId: termId,
          labelPt: 'Outra Tradução BR',
          confidence: 0.85,
          variant: 'PT_BR'
        })
      });

      // Buscar progresso atualizado
      const after = await fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
        headers: { 'Authorization': `Bearer ${brUserToken}` }
      });
      const afterData = await after.json() as any;
      const afterBR = afterData.variants.find((v: any) => v.variant === 'PT_BR');

      expect(afterBR.translatedTerms).toBeGreaterThanOrEqual(beforeBR.translatedTerms);
    });

    it('should maintain consistency across all analytics endpoints', async () => {
      // Buscar dados de múltiplos endpoints
      const [progress, ranking, comparison] = await Promise.all([
        fetch(`${API_URL}/api/cplp-analytics/variant-progress`, {
          headers: { 'Authorization': `Bearer ${brUserToken}` }
        }).then(r => r.json()),
        fetch(`${API_URL}/api/cplp-analytics/country-ranking`, {
          headers: { 'Authorization': `Bearer ${brUserToken}` }
        }).then(r => r.json()),
        fetch(`${API_URL}/api/cplp-analytics/variant-comparison/${termId}`, {
          headers: { 'Authorization': `Bearer ${brUserToken}` }
        }).then(r => r.json())
      ]);

      // Verificar consistência (cast to any to avoid TS2339)
      expect((progress as any).variants.length).toBe(9);
      expect((ranking as any).rankings.length).toBeGreaterThan(0);
      expect((comparison as any).translations.length).toBeGreaterThan(0);
    });
  });
});
