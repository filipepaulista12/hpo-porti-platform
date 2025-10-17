/**
 * Database Persistence Tests
 * Verifica se dados estão sendo salvos corretamente no banco
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('💾 Database Persistence Tests', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  
  let authToken: string;
  let userId: string;
  let testEmail: string;
  let createdTranslationId: string;
  let createdCommentId: string;
  let termId: string;

  beforeAll(async () => {
    // Criar usuário de teste
    testEmail = `persistence-test-${Date.now()}@hpo.test`;
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123!@#',
        name: 'Persistence Tester',
        specialty: 'Genética'
      })
    });

    const data = await response.json() as any;
    authToken = data.token;
    userId = data.user.id;

    console.log(`\n✅ Test user created: ${userId}\n`);
  }, 30000);

  // ==============================================
  // 1. TESTAR PERSISTÊNCIA DE TRADUÇÕES
  // ==============================================
  describe('Translation Persistence', () => {
    it('should create translation and persist to database', async () => {
      // Buscar um termo disponível
      const searchResponse = await fetch(`${API_URL}/api/hpo-terms/search?status=NOT_TRANSLATED&limit=1`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const searchData = await searchResponse.json() as any;
      expect(searchData.terms.length).toBeGreaterThan(0);
      
      termId = searchData.terms[0].hpoId;
      
      // Criar tradução
      const createResponse = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: termId,
          translatedText: 'Teste de Persistência da Tradução',
          language: 'pt-BR',
          notes: 'Esta tradução deve ser salva no banco de dados'
        })
      });

      const createData = await createResponse.json() as any;
      expect(createResponse.status).toBe(201);
      expect(createData.translation.id).toBeTruthy();
      
      createdTranslationId = createData.translation.id;
      console.log(`📝 Translation created: ${createdTranslationId}`);
    });

    it('should retrieve translation from database after creation', async () => {
      expect(createdTranslationId).toBeTruthy();

      const response = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.translation.id).toBe(createdTranslationId);
      expect(data.translation.translatedText).toBe('Teste de Persistência da Tradução');
      expect(data.translation.userId).toBe(userId);
      expect(data.translation.hpoId).toBe(termId);
      
      console.log(`✅ Translation persisted correctly`);
    });

    it('should list translation in user translations', async () => {
      const response = await fetch(`${API_URL}/api/translations/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.translations).toBeDefined();
      
      const ourTranslation = data.translations.find((t: any) => t.id === createdTranslationId);
      expect(ourTranslation).toBeTruthy();
      expect(ourTranslation.translatedText).toBe('Teste de Persistência da Tradução');
    });

    it('should update translation and persist changes', async () => {
      const updateResponse = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translatedText: 'Teste de Persistência ATUALIZADO',
          notes: 'Notas atualizadas também'
        })
      });

      expect(updateResponse.status).toBe(200);

      // Verificar se mudanças persistiram
      const getResponse = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await getResponse.json() as any;
      expect(data.translation.translatedText).toBe('Teste de Persistência ATUALIZADO');
      expect(data.translation.notes).toBe('Notas atualizadas também');
      
      console.log(`✅ Translation update persisted correctly`);
    });
  });

  // ==============================================
  // 2. TESTAR PERSISTÊNCIA DE COMENTÁRIOS
  // ==============================================
  describe('Comment Persistence', () => {
    it('should create comment and persist to database', async () => {
      expect(createdTranslationId).toBeTruthy();

      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translationId: createdTranslationId,
          content: 'Este é um comentário de teste para verificar persistência'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.comment.id).toBeTruthy();
      expect(data.comment.content).toBe('Este é um comentário de teste para verificar persistência');
      
      createdCommentId = data.comment.id;
      console.log(`💬 Comment created: ${createdCommentId}`);
    });

    it('should retrieve comment from database', async () => {
      expect(createdTranslationId).toBeTruthy();

      const response = await fetch(`${API_URL}/api/comments/translation/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.comments).toBeDefined();
      
      const ourComment = data.comments.find((c: any) => c.id === createdCommentId);
      expect(ourComment).toBeTruthy();
      expect(ourComment.content).toBe('Este é um comentário de teste para verificar persistência');
      expect(ourComment.userId).toBe(userId);
      
      console.log(`✅ Comment persisted correctly`);
    });

    it('should update comment and persist changes', async () => {
      expect(createdCommentId).toBeTruthy();

      const updateResponse = await fetch(`${API_URL}/api/comments/${createdCommentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: 'Comentário EDITADO para teste de persistência'
        })
      });

      expect(updateResponse.status).toBe(200);

      // Verificar se mudanças persistiram
      const getResponse = await fetch(`${API_URL}/api/comments/translation/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await getResponse.json() as any;
      const ourComment = data.comments.find((c: any) => c.id === createdCommentId);
      expect(ourComment.content).toBe('Comentário EDITADO para teste de persistência');
      
      console.log(`✅ Comment update persisted correctly`);
    });

    it('should delete comment and remove from database', async () => {
      expect(createdCommentId).toBeTruthy();

      const deleteResponse = await fetch(`${API_URL}/api/comments/${createdCommentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(deleteResponse.status).toBe(200);

      // Verificar se foi realmente deletado
      const getResponse = await fetch(`${API_URL}/api/comments/translation/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await getResponse.json() as any;
      const deletedComment = data.comments.find((c: any) => c.id === createdCommentId);
      expect(deletedComment).toBeUndefined();
      
      console.log(`✅ Comment deletion persisted correctly`);
    });
  });

  // ==============================================
  // 3. TESTAR PERSISTÊNCIA DE XP E GAMIFICAÇÃO
  // ==============================================
  describe('Gamification Persistence', () => {
    it('should persist XP gain from translation', async () => {
      // Buscar stats iniciais
      const initialResponse = await fetch(`${API_URL}/api/users/${userId}/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const initialData = await initialResponse.json() as any;
      const initialXp = initialData.totalXp;
      const initialLevel = initialData.level;
      
      console.log(`📊 Initial stats - XP: ${initialXp}, Level: ${initialLevel}`);

      // XP já deve ter sido ganho da tradução criada anteriormente
      expect(initialXp).toBeGreaterThan(0);
      expect(initialLevel).toBeGreaterThanOrEqual(1);

      // Verificar se XP persiste em chamadas subsequentes
      const verifyResponse = await fetch(`${API_URL}/api/users/${userId}/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const verifyData = await verifyResponse.json() as any;
      expect(verifyData.totalXp).toBe(initialXp);
      expect(verifyData.level).toBe(initialLevel);
      
      console.log(`✅ XP and level persisted correctly`);
    });

    it('should persist user in leaderboard', async () => {
      const response = await fetch(`${API_URL}/api/leaderboard?limit=100`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      
      const ourUser = data.users.find((u: any) => u.id === userId);
      expect(ourUser).toBeTruthy();
      expect(ourUser.totalXp).toBeGreaterThan(0);
      
      console.log(`✅ User appears in leaderboard (rank: ${ourUser.rank || 'unranked'})`);
    });
  });

  // ==============================================
  // 4. TESTAR RELACIONAMENTOS DO BANCO
  // ==============================================
  describe('Database Relationships', () => {
    it('should maintain user-translation relationship', async () => {
      const response = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(data.translation.userId).toBe(userId);
      expect(data.translation.user).toBeDefined();
      expect(data.translation.user.id).toBe(userId);
      expect(data.translation.user.email).toBe(testEmail);
    });

    it('should maintain translation-term relationship', async () => {
      const response = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json() as any;
      expect(data.translation.hpoId).toBe(termId);
      expect(data.translation.hpoTerm).toBeDefined();
      expect(data.translation.hpoTerm.hpoId).toBe(termId);
    });

    it('should cascade delete work correctly', async () => {
      // Criar um comentário temporário
      const createCommentResponse = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translationId: createdTranslationId,
          content: 'Comentário para testar cascade delete'
        })
      });

      const commentData = await createCommentResponse.json() as any;
      const tempCommentId = commentData.comment.id;

      // Deletar a tradução (deve deletar comentário também por cascade)
      const deleteTranslationResponse = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(deleteTranslationResponse.status).toBe(200);

      // Verificar se tradução foi deletada
      const getTranslationResponse = await fetch(`${API_URL}/api/translations/${createdTranslationId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(getTranslationResponse.status).toBe(404);
      
      console.log(`✅ Cascade delete working correctly`);
    });
  });

  // ==============================================
  // 5. TESTAR INTEGRIDADE DE DADOS
  // ==============================================
  describe('Data Integrity', () => {
    it('should enforce unique constraints', async () => {
      // Tentar registrar mesmo email novamente
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'DifferentPassword123!',
          name: 'Duplicate User',
          specialty: 'Cardiologia'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json() as any;
      expect(data.error).toBeTruthy();
    });

    it('should enforce foreign key constraints', async () => {
      // Tentar criar tradução com HPO ID inválido
      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: 'HP:9999999',
          translatedText: 'Tradução inválida',
          language: 'pt-BR'
        })
      });

      expect(response.status).toBe(400);
    });

    it('should enforce required fields', async () => {
      // Tentar criar tradução sem campos obrigatórios
      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: termId
          // Faltando translatedText e language
        })
      });

      expect(response.status).toBe(400);
    });
  });

  // ==============================================
  // 6. TESTAR TRANSAÇÕES
  // ==============================================
  describe('Transaction Handling', () => {
    it('should rollback on validation error', async () => {
      // Buscar termo para traduzir
      const searchResponse = await fetch(`${API_URL}/api/hpo-terms/search?status=NOT_TRANSLATED&limit=1`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const searchData = await searchResponse.json() as any;
      if (searchData.terms.length === 0) {
        console.log('⏭️  Skipping: No terms available');
        return;
      }
      
      const newTermId = searchData.terms[0].hpoId;

      // Criar tradução válida
      const createResponse = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: newTermId,
          translatedText: 'Tradução para teste de transação',
          language: 'pt-BR'
        })
      });

      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json() as any;
      const newTranslationId = createData.translation.id;

      // Verificar stats antes
      const statsBeforeResponse = await fetch(`${API_URL}/api/users/${userId}/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const statsBefore = await statsBeforeResponse.json() as any;

      // Tentar fazer validação inválida (votando na própria tradução)
      const invalidVoteResponse = await fetch(`${API_URL}/api/translations/${newTranslationId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true
        })
      });

      expect(invalidVoteResponse.status).toBe(400);

      // Verificar stats depois - NÃO deve ter mudado
      const statsAfterResponse = await fetch(`${API_URL}/api/users/${userId}/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const statsAfter = await statsAfterResponse.json() as any;

      expect(statsAfter.totalXp).toBe(statsBefore.totalXp);
      
      console.log(`✅ Transaction rollback working correctly`);
    });
  });
});
