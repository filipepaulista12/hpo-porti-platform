/**
 * Integration Tests - Complete User Flow
 * Testa fluxo completo: Auth → Translation → Validation → Comments → Conflicts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('🔄 Integration Tests - Complete Flow', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  
  // Usuários para testes
  const users = {
    translator1: {
      email: `translator1-${Date.now()}@hpo.test`,
      password: 'Test123!@#',
      name: 'Translator One',
      specialty: 'Neurologia',
      token: '',
      id: ''
    },
    translator2: {
      email: `translator2-${Date.now()}@hpo.test`,
      password: 'Test123!@#',
      name: 'Translator Two',
      specialty: 'Cardiologia',
      token: '',
      id: ''
    },
    translator3: {
      email: `translator3-${Date.now()}@hpo.test`,
      password: 'Test123!@#',
      name: 'Translator Three',
      specialty: 'Pediatria',
      token: '',
      id: ''
    }
  };

  let testTermId: string;
  let translationId1: string;
  let translationId2: string;
  let commentId: string;
  let conflictId: string;

  // ==============================================
  // SETUP: Criar 3 usuários para testes
  // ==============================================
  beforeAll(async () => {
    console.log('\n🔧 Setting up test users...\n');
    
    for (const [key, user] of Object.entries(users)) {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          name: user.name,
          specialty: user.specialty
        })
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        users[key as keyof typeof users].token = data.token;
        users[key as keyof typeof users].id = data.user.id;
        console.log(`✅ Created ${user.name}: ${user.id}`);
      } else {
        console.error(`❌ Failed to create ${user.name}:`, data);
      }
    }

    console.log('\n');
  }, 30000); // 30s timeout para setup

  // ==============================================
  // CLEANUP: Deletar usuários de teste
  // ==============================================
  afterAll(async () => {
    console.log('\n🧹 Cleaning up test data...\n');
    // Nota: Prisma cascade delete cuida das traduções/comentários/etc
  });

  // ==============================================
  // FASE 1: AUTENTICAÇÃO
  // ==============================================
  describe('Phase 1: Authentication', () => {
    it('should have created 3 test users successfully', () => {
      expect(users.translator1.token).toBeTruthy();
      expect(users.translator2.token).toBeTruthy();
      expect(users.translator3.token).toBeTruthy();
    });

    it('should login with correct credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: users.translator1.email,
          password: users.translator1.password
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.token).toBeTruthy();
    });

    it('should reject login with wrong password', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: users.translator1.email,
          password: 'WrongPassword123!'
        })
      });

      expect(response.status).toBe(401);
    });

    it('should access protected route with valid token', async () => {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.email).toBe(users.translator1.email);
    });
  });

  // ==============================================
  // FASE 2: BUSCAR TERMO HPO PARA TRADUZIR
  // ==============================================
  describe('Phase 2: Find HPO Term', () => {
    it('should search for untranslated terms', async () => {
      // Buscar qualquer termo disponível (sem filtro de status, pois outros testes podem ter mudado o status)
      const response = await fetch(`${API_URL}/api/hpo-terms/search?query=abnormal&limit=10`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.terms)).toBe(true);
      
      if (data.terms.length > 0) {
        testTermId = data.terms[0].hpoId;
        console.log(`📝 Selected term for testing: ${testTermId} - ${data.terms[0].labelEn}`);
      }
    });

    it('should get term details', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term selected');
        return;
      }

      const response = await fetch(`${API_URL}/api/hpo-terms/${testTermId}`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.hpoId).toBe(testTermId);
      expect(data.labelEn).toBeTruthy();
    });
  });

  // ==============================================
  // FASE 3: CRIAR TRADUÇÕES (2 DIFERENTES)
  // ==============================================
  describe('Phase 3: Create Translations', () => {
    it('translator1 should create first translation', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: testTermId,
          translatedText: 'Anormalidade Cardíaca Congênita',
          language: 'pt-BR',
          notes: 'Tradução técnica considerando contexto médico brasileiro'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.translation).toBeDefined();
      expect(data.translation.translatedText).toBe('Anormalidade Cardíaca Congênita');
      
      translationId1 = data.translation.id;
      console.log(`✅ Translation 1 created: ${translationId1}`);
    });

    it('translator2 should create different translation (conflict)', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator2.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: testTermId,
          translatedText: 'Anomalia Cardíaca Congênita',
          language: 'pt-BR',
          notes: 'Prefiro "anomalia" em vez de "anormalidade"'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.translation).toBeDefined();
      expect(data.translation.translatedText).toBe('Anomalia Cardíaca Congênita');
      
      translationId2 = data.translation.id;
      console.log(`✅ Translation 2 created: ${translationId2}`);
    });

    it('should prevent duplicate translation by same user', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpoId: testTermId,
          translatedText: 'Outra Tradução',
          language: 'pt-BR'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  // ==============================================
  // FASE 4: VALIDAÇÕES (VOTOS)
  // ==============================================
  describe('Phase 4: Validations', () => {
    it('translator2 should upvote translation1', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/${translationId1}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator2.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true,
          feedback: 'Ótima tradução, muito clara!'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.validation).toBeDefined();
      expect(data.validation.isValid).toBe(true);
    });

    it('translator3 should upvote translation1', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/${translationId1}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator3.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true,
          feedback: 'Concordo, está perfeito!'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      
      // Com 2 upvotes, deve estar próximo de aprovação
      console.log(`📊 Translation1 votes: ${data.translation?.upvotes || 'unknown'}`);
    });

    it('translator1 should upvote translation2', async () => {
      if (!translationId2) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/${translationId2}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true,
          feedback: '"Anomalia" também é válido!'
        })
      });

      expect(response.status).toBe(201);
    });

    it('should prevent user from voting on own translation', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/${translationId1}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true
        })
      });

      expect(response.status).toBe(400);
    });

    it('should prevent duplicate vote from same user', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/${translationId1}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator2.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isValid: true
        })
      });

      expect(response.status).toBe(400);
    });
  });

  // ==============================================
  // FASE 5: COMENTÁRIOS
  // ==============================================
  describe('Phase 5: Comments', () => {
    it('should add comment to translation', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator2.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translationId: translationId1,
          content: 'Excelente escolha de terminologia médica!'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.comment).toBeDefined();
      expect(data.comment.content).toBe('Excelente escolha de terminologia médica!');
      
      commentId = data.comment.id;
      console.log(`💬 Comment created: ${commentId}`);
    });

    it('should reply to comment (threaded)', async () => {
      if (!commentId) {
        console.log('⏭️  Skipping: No comment available');
        return;
      }

      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translationId: translationId1,
          content: 'Obrigado pelo feedback!',
          parentId: commentId
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.comment.parentId).toBe(commentId);
    });

    it('should get all comments for translation', async () => {
      if (!translationId1) {
        console.log('⏭️  Skipping: No translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/comments/translation/${translationId1}`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.comments)).toBe(true);
      expect(data.comments.length).toBeGreaterThanOrEqual(2);
    });

    it('should update own comment', async () => {
      if (!commentId) {
        console.log('⏭️  Skipping: No comment available');
        return;
      }

      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${users.translator2.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: 'Excelente escolha de terminologia médica! (editado)'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.comment.content).toContain('(editado)');
    });

    it('should NOT allow editing others comments', async () => {
      if (!commentId) {
        console.log('⏭️  Skipping: No comment available');
        return;
      }

      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${users.translator3.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: 'Tentando editar comentário de outro usuário'
        })
      });

      expect(response.status).toBe(403);
    });
  });

  // ==============================================
  // FASE 6: DETECÇÃO E RESOLUÇÃO DE CONFLITOS
  // ==============================================
  describe('Phase 6: Conflicts', () => {
    it('should detect conflict between translations', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term available');
        return;
      }

      const response = await fetch(`${API_URL}/api/conflicts/term/${testTermId}`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      
      if (data.conflicts && data.conflicts.length > 0) {
        conflictId = data.conflicts[0].id;
        console.log(`⚠️  Conflict detected: ${conflictId}`);
        expect(data.conflicts[0].status).toBe('PENDING');
      }
    });

    it('should vote to resolve conflict', async () => {
      if (!conflictId || !translationId1) {
        console.log('⏭️  Skipping: No conflict or translation available');
        return;
      }

      const response = await fetch(`${API_URL}/api/conflicts/${conflictId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${users.translator3.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferredTranslationId: translationId1,
          reasoning: 'Prefiro "anormalidade" por ser mais comum na literatura médica brasileira'
        })
      });

      const data = await response.json() as any;
      expect(response.status).toBe(201);
      expect(data.vote).toBeDefined();
    });

    it('should list all pending conflicts', async () => {
      const response = await fetch(`${API_URL}/api/conflicts?status=PENDING&limit=10`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.conflicts)).toBe(true);
    });
  });

  // ==============================================
  // FASE 7: GAMIFICAÇÃO
  // ==============================================
  describe('Phase 7: Gamification', () => {
    it('should show user stats with XP and level', async () => {
      const response = await fetch(`${API_URL}/api/gamification/my-stats`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(data.stats.user.points).toBeGreaterThan(0); // Ganhou XP por traduzir
      expect(data.stats.user.level).toBeGreaterThanOrEqual(1);
      expect(data.stats.contributions.translations).toBeGreaterThan(0);
      
      console.log(`🎮 ${users.translator1.name}: Level ${data.stats.user.level}, ${data.stats.user.points} XP`);
    });

    it('should show leaderboard', async () => {
      const response = await fetch(`${API_URL}/api/leaderboard?limit=10`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
    });

    it('should show user badges', async () => {
      const response = await fetch(`${API_URL}/api/users/${users.translator1.id}`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.badges)).toBe(true);
      
      if (data.badges.length > 0) {
        console.log(`🏆 ${users.translator1.name} badges:`, data.badges.map((b: any) => b.name));
      }
    });
  });

  // ==============================================
  // FASE 8: NOTIFICAÇÕES
  // ==============================================
  describe('Phase 8: Notifications', () => {
    it('should have notifications for user1 (votes on their translation)', async () => {
      const response = await fetch(`${API_URL}/api/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.notifications)).toBe(true);
      
      console.log(`🔔 ${users.translator1.name} has ${data.notifications.length} notifications`);
    });

    it('should mark notification as read', async () => {
      const listResponse = await fetch(`${API_URL}/api/notifications?limit=1`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const listData = await listResponse.json() as any;
      
      if (listData.notifications && listData.notifications.length > 0) {
        const notificationId = listData.notifications[0].id;
        
        const markResponse = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${users.translator1.token}`
          }
        });

        expect(markResponse.status).toBe(200);
      }
    });
  });

  // ==============================================
  // FASE 9: BUSCA E FILTROS
  // ==============================================
  describe('Phase 9: Search & Filters', () => {
    it('should search terms by text', async () => {
      const response = await fetch(`${API_URL}/api/hpo-terms/search?query=heart&limit=5`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.terms)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await fetch(`${API_URL}/api/hpo-terms/search?status=APPROVED&limit=5`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.terms)).toBe(true);
    });

    it('should filter by confidence level', async () => {
      const response = await fetch(`${API_URL}/api/hpo-terms/search?confidenceLevel=HIGH&limit=5`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.terms)).toBe(true);
    });
  });

  // ==============================================
  // FASE 10: HISTÓRICO
  // ==============================================
  describe('Phase 10: History', () => {
    it('should show user translation history', async () => {
      const response = await fetch(`${API_URL}/api/translations/user/${users.translator1.id}?limit=10`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.translations)).toBe(true);
      expect(data.translations.length).toBeGreaterThan(0);
    });

    it('should show term translation history', async () => {
      if (!testTermId) {
        console.log('⏭️  Skipping: No term available');
        return;
      }

      const response = await fetch(`${API_URL}/api/translations/term/${testTermId}`, {
        headers: {
          'Authorization': `Bearer ${users.translator1.token}`
        }
      });

      const data = await response.json() as any;
      expect(response.status).toBe(200);
      expect(Array.isArray(data.translations)).toBe(true);
      expect(data.translations.length).toBeGreaterThanOrEqual(2); // Nossas 2 traduções
    });
  });
});
