# 🔍 COMPARAÇÃO DETALHADA: Monorepo VS Projeto Atual

**Data**: 15 de Outubro de 2025  
**Objetivo**: Identificar features do monorepo/ que FALTAM no projeto atual SEM perder funcionalidades novas

---

## 📊 **BACKEND: Rotas Comparadas**

### ✅ **ROTAS QUE AMBOS TÊM** (Já portadas)
| Rota | Monorepo | Projeto Atual | Status |
|------|----------|---------------|--------|
| **admin.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** (atual tem strikes) |
| **auth.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** (OAuth ORCID em ambos) |
| **export.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **leaderboard.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **notification.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **stats.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **term.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **translation.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **user.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **validation.routes.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |

### ⚠️ **ROTAS QUE FALTAM NO PROJETO ATUAL**
| Rota | Monorepo | Projeto Atual | Ação Necessária |
|------|----------|---------------|-----------------|
| **analytics.routes.ts** | ✅ Sim (441 linhas) | ❌ **FALTA** | 🔴 **PORTAR** |
| **comment.routes.ts** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** |
| **conflict.routes.ts** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** |

---

## 📊 **BACKEND: Services Comparados**

### ✅ **SERVICES QUE AMBOS TÊM**
| Service | Monorepo | Projeto Atual | Status |
|---------|----------|---------------|--------|
| **promotion.service.ts** | ❌ Não | ✅ Sim (420 linhas) | ✅ **NOVO (projeto atual tem)** |
| **strike.service.ts** | ❌ Não | ✅ Sim (370 linhas) | ✅ **NOVO (projeto atual tem)** |

### ⚠️ **SERVICES QUE FALTAM NO PROJETO ATUAL**
| Service | Monorepo | Projeto Atual | Ação Necessária |
|---------|----------|---------------|-----------------|
| **emailService.ts** | ✅ Sim (438 linhas) | ❌ **FALTA** | 🔴 **PORTAR** (templates HTML emails) |

---

## 📊 **BACKEND: WebSocket**

| Feature | Monorepo | Projeto Atual | Ação Necessária |
|---------|----------|---------------|-----------------|
| **WebSocket Server** | ✅ Sim (`websocket/socket.ts`, 208 linhas) | ❌ **FALTA** | 🔴 **PORTAR COMPLETO** |
| **Real-time notifications** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** |
| **Socket authentication** | ✅ Sim (JWT middleware) | ❌ **FALTA** | 🔴 **PORTAR** |
| **User presence tracking** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** |

---

## 📊 **BACKEND: Middleware**

### ✅ **MIDDLEWARE QUE AMBOS TÊM**
| Middleware | Monorepo | Projeto Atual | Status |
|------------|----------|---------------|--------|
| **auth.ts** | ✅ Sim | ✅ Sim | ⚠️ **DIFERENTE** (monorepo tem `checkBan()`) |
| **permissions.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| **errorHandler.ts** | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |

### 🔍 **DIFERENÇAS CRÍTICAS**

#### **auth.ts**
```diff
MONOREPO:
+ export const checkBan = async (req, res, next) => {
+   // Middleware que BLOQUEIA login de usuários banidos
+ }

PROJETO ATUAL:
- NÃO TEM checkBan middleware
```

**AÇÃO**: ✅ Adicionar `checkBan()` middleware no projeto atual

---

## 📊 **FRONTEND: Componentes Comparados**

### ✅ **COMPONENTES QUE AMBOS TÊM**
| Componente | Monorepo | Projeto Atual | Status |
|------------|----------|---------------|--------|
| **ProductionHPOApp.tsx** | ✅ Sim | ✅ Sim | ⚠️ **DIFERENTE** (atual tem dark mode) |
| **GuidelinesPage** | ❌ Não | ✅ Sim (350+ linhas) | ✅ **NOVO (projeto atual tem)** |

### ⚠️ **COMPONENTES QUE FALTAM NO PROJETO ATUAL**
| Componente | Monorepo | Projeto Atual | Ação Necessária |
|------------|----------|---------------|-----------------|
| **InfiniteTermsList.tsx** | ✅ Sim (254 linhas) | ❌ **FALTA** | 🔴 **PORTAR** (scroll infinito) |
| **WebSocketProvider.tsx** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** (context real-time) |
| **CommentsSection.tsx** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** (UI comentários) |
| **onboarding/** (pasta) | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** (tour guiado) |
| **ConflictReview pages** | ✅ Sim | ❌ **FALTA** | 🔴 **PORTAR** (votação comitê) |

---

## 📊 **FRONTEND: Services**

| Service | Monorepo | Projeto Atual | Status |
|---------|----------|---------------|--------|
| **toast.service.ts** | ❌ Não | ✅ Sim (170 linhas) | ✅ **NOVO (projeto atual tem)** |

---

## 📊 **DATABASE: Schema**

### ✅ **MODELS QUE AMBOS TÊM**
| Model | Monorepo | Projeto Atual | Status |
|-------|----------|---------------|--------|
| User | ✅ Sim | ✅ Sim | ⚠️ **DIFERENTE** |
| HpoTerm | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Translation | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Validation | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Comment | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Badge | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| UserBadge | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| UserActivity | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| ConflictReview | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| CommitteeVote | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Rejection | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| AdminAuditLog | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| SyncLog | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| Notification | ✅ Sim | ✅ Sim | ✅ **EQUIVALENTE** |
| SystemConfig | ✅ Sim | ❌ **FALTA** | ⚠️ **PODE ADICIONAR** (não crítico) |

### ✅ **MODELS NOVOS NO PROJETO ATUAL**
| Model | Monorepo | Projeto Atual | Status |
|-------|----------|---------------|--------|
| **Strike** | ❌ Não | ✅ Sim (com StrikeReason enum) | ✅ **NOVO (mantém!)** |

### 🔍 **DIFERENÇAS NO MODEL USER**

```diff
MONOREPO:
  hasCompletedOnboarding Boolean @default(false)  // ✅ TEM
  warningCount  Int       @default(0)              // ✅ TEM
  lastWarningAt DateTime?                          // ✅ TEM
  bannedBy      String?                            // ✅ TEM (quem baniu)

PROJETO ATUAL:
- NÃO TEM hasCompletedOnboarding                    // ❌ FALTA
- NÃO TEM warningCount                              // ❌ FALTA  
- NÃO TEM lastWarningAt                             // ❌ FALTA
- NÃO TEM bannedBy                                  // ❌ FALTA
```

**AÇÃO**: ✅ Adicionar campos faltantes no User model

---

## 📊 **PRISMA: Seeds**

| Seed Script | Monorepo | Projeto Atual | Ação Necessária |
|-------------|----------|---------------|-----------------|
| **import-all-terms.ts** | ✅ Sim (180 linhas) | ❌ **FALTA** | 🔴 **COPIAR** (17.020 termos) |
| **seed.ts** | ✅ Sim | ✅ Sim | ⚠️ **COMPARAR** (verificar diferenças) |
| **seed-test-users.ts** | ✅ Sim | ❌ **FALTA** | ⚠️ **OPCIONAL** (pode portar) |

---

## 🎯 **RESUMO EXECUTIVO: O QUE FALTA**

### 🔴 **CRÍTICO - DEVE SER PORTADO**

#### **1. Backend - Rotas**
- ❌ `analytics.routes.ts` (441 linhas) - Análises, exportação Babelon, sync GitHub
- ❌ `comment.routes.ts` - CRUD comentários
- ❌ `conflict.routes.ts` - Votação comitê

#### **2. Backend - Services**
- ❌ `emailService.ts` (438 linhas) - Templates HTML emails (aprovado, rejeitado, warning, ban, badges)

#### **3. Backend - WebSocket**
- ❌ `websocket/socket.ts` (208 linhas) - Server completo
- ❌ Real-time notifications broadcasting

#### **4. Backend - Middleware**
- ❌ `checkBan()` no `auth.ts` - Bloqueia login de banidos

#### **5. Frontend - Componentes**
- ❌ `InfiniteTermsList.tsx` (254 linhas) - Scroll infinito (crucial para 17.020 termos)
- ❌ `WebSocketProvider.tsx` - Context real-time
- ❌ `CommentsSection.tsx` - UI comentários
- ❌ `onboarding/` - Tour guiado (Intro.js)
- ❌ Conflict resolution pages - Votação comitê

#### **6. Database**
- ❌ Campos faltantes em `User`: `hasCompletedOnboarding`, `warningCount`, `lastWarningAt`, `bannedBy`
- ❌ Model `SystemConfig` (não crítico)

#### **7. Seeds**
- ❌ `import-all-terms.ts` (180 linhas) - **CRÍTICO**: Importa 17.020 termos

---

### ✅ **FEATURES NOVAS NO PROJETO ATUAL (MANTER!)**

#### **1. Three-Strike System** (P2.4)
- ✅ Model `Strike` + enum `StrikeReason`
- ✅ Service `strike.service.ts` (370 linhas)
- ✅ 4 endpoints no `admin.routes.ts`
- ✅ Auto-ban ao 3º strike

#### **2. Auto-Promotion System** (P1.2)
- ✅ Service `promotion.service.ts` (420 linhas)
- ✅ TRANSLATOR → REVIEWER (50+ aprovadas, 85%+)
- ✅ REVIEWER → COMMITTEE_MEMBER (200+ aprovadas, 90%+)

#### **3. UI/UX Improvements** (P2)
- ✅ Dark mode completo (`index.css` + toggle)
- ✅ Toast notifications (`toast.service.ts`, 170 linhas)
- ✅ Guidelines page (350+ linhas)

#### **4. Testing Suite** (P1.6)
- ✅ 103 test cases (Vitest + Testing Library)
- ✅ 10 test files

---

## 📋 **PLANO DE MIGRAÇÃO SEGURA**

### **FASE 1: Preparação (30 min)**
✅ Criar branch `feature/merge-monorepo`
✅ Backup completo do projeto atual
✅ Documentar estado atual

### **FASE 2: Backend - Rotas (2 horas)**
1. ✅ Copiar `analytics.routes.ts` → Adicionar endpoints ao `stats.routes.ts` atual
2. ✅ Copiar `comment.routes.ts` → Criar novo arquivo
3. ✅ Copiar `conflict.routes.ts` → Criar novo arquivo
4. ✅ Testar cada rota individualmente

### **FASE 3: Backend - Services (1 hora)**
5. ✅ Copiar `emailService.ts` → Criar novo arquivo
6. ✅ Testar envio de emails (test account Ethereal)

### **FASE 4: Backend - WebSocket (2 horas)**
7. ✅ Copiar `websocket/socket.ts` → Criar pasta + arquivo
8. ✅ Modificar `server.ts` para inicializar WebSocket
9. ✅ Instalar `socket.io` e `@types/socket.io`
10. ✅ Testar conexão WebSocket

### **FASE 5: Backend - Middleware (30 min)**
11. ✅ Adicionar `checkBan()` em `auth.ts`
12. ✅ Aplicar middleware em rotas de login

### **FASE 6: Database (1 hora)**
13. ✅ Adicionar campos faltantes em `User` model
14. ✅ Criar migration
15. ✅ Executar migration
16. ✅ Testar schema atualizado

### **FASE 7: Seeds (1 hora)**
17. ✅ Copiar `import-all-terms.ts`
18. ✅ Executar seed (importar 17.020 termos)
19. ✅ Validar que termos foram importados

### **FASE 8: Frontend - Infinite Scroll (2 horas)**
20. ✅ Copiar `InfiniteTermsList.tsx`
21. ✅ Substituir componente de lista atual
22. ✅ Testar scroll infinito com 17.020 termos

### **FASE 9: Frontend - WebSocket (1 hora)**
23. ✅ Copiar `WebSocketProvider.tsx`
24. ✅ Adicionar context no App
25. ✅ Testar notificações real-time

### **FASE 10: Frontend - Componentes (3 horas)**
26. ✅ Copiar `CommentsSection.tsx`
27. ✅ Copiar `onboarding/` (tour guiado)
28. ✅ Copiar conflict resolution pages
29. ✅ Testar cada componente

### **FASE 11: Testes End-to-End (2 horas)**
30. ✅ Testar TODAS features migradas
31. ✅ Testar features antigas (garantir que não quebraram)
32. ✅ Rodar test suite (103 tests)
33. ✅ Smoke test completo

### **FASE 12: Cleanup (1 hora)**
34. ✅ Validar que TUDO funciona
35. ✅ Deletar pasta `monorepo/`
36. ✅ Atualizar documentação
37. ✅ Merge para `main`

---

## ⏱️ **ESTIMATIVA TOTAL**

| Fase | Tempo | Risco |
|------|-------|-------|
| Preparação | 30 min | ✅ Baixo |
| Backend - Rotas | 2 horas | ⚠️ Médio |
| Backend - Services | 1 hora | ✅ Baixo |
| Backend - WebSocket | 2 horas | 🔴 Alto |
| Backend - Middleware | 30 min | ✅ Baixo |
| Database | 1 hora | ⚠️ Médio |
| Seeds | 1 hora | ✅ Baixo |
| Frontend - Infinite Scroll | 2 horas | ⚠️ Médio |
| Frontend - WebSocket | 1 hora | ⚠️ Médio |
| Frontend - Componentes | 3 horas | ⚠️ Médio |
| Testes End-to-End | 2 horas | 🔴 Alto |
| Cleanup | 1 hora | ✅ Baixo |
| **TOTAL** | **~17 horas** | **⚠️ Médio/Alto** |

---

## 🚨 **RISCOS IDENTIFICADOS**

### **1. WebSocket Integration** 🔴 ALTO
- **Risco**: Conflito com Express server atual
- **Mitigação**: Criar WebSocket em porta separada (3002) para testes
- **Rollback**: Desabilitar WebSocket se quebrar

### **2. InfiniteTermsList** ⚠️ MÉDIO
- **Risco**: Performance com 17.020 termos
- **Mitigação**: Testar com subset (1.000 termos) primeiro
- **Rollback**: Manter componente antigo se não performar

### **3. Database Migration** ⚠️ MÉDIO
- **Risco**: Adicionar campos pode corromper dados
- **Mitigação**: Backup do banco antes de migration
- **Rollback**: `npx prisma migrate rollback`

### **4. Conflict Resolution** ⚠️ MÉDIO
- **Risco**: Lógica complexa de votação
- **Mitigação**: Testar com dados mock primeiro
- **Rollback**: Desabilitar routes se não funcionar

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

Após cada fase, validar:

- [ ] ✅ Código compila sem erros
- [ ] ✅ Testes automatizados passam (103 tests)
- [ ] ✅ Backend responde em http://localhost:3001
- [ ] ✅ Frontend carrega em http://localhost:5173
- [ ] ✅ Login funciona
- [ ] ✅ Criar tradução funciona
- [ ] ✅ Aprovar tradução funciona
- [ ] ✅ Dark mode funciona
- [ ] ✅ Toast notifications aparecem
- [ ] ✅ Guidelines page abre
- [ ] ✅ Three-strike system funciona
- [ ] ✅ Auto-promotion funciona
- [ ] ✅ **NOVO**: 17.020 termos carregam
- [ ] ✅ **NOVO**: Infinite scroll suave
- [ ] ✅ **NOVO**: WebSocket conecta
- [ ] ✅ **NOVO**: Comentários funcionam
- [ ] ✅ **NOVO**: Conflict resolution vota
- [ ] ✅ **NOVO**: Onboarding tour guia
- [ ] ✅ **NOVO**: Emails são enviados

---

## 🎯 **PRÓXIMA AÇÃO**

**Você decide:**

1. **Migração COMPLETA agora** (~17 horas, tudo de uma vez)
2. **Migração INCREMENTAL** (1 feature por vez, testar cada uma)
3. **Apenas CRÍTICOS** (17.020 termos + Infinite scroll + WebSocket)

**Recomendação**: **Opção 3 (Críticos primeiro)**

**Justificativa**:
- ✅ Sistema fica funcional RÁPIDO (3-4 horas)
- ✅ Menor risco de quebrar features atuais
- ✅ Testa features mais complexas primeiro
- ✅ Pode adicionar resto depois

---

**Documento criado**: 15/out/2025  
**Última atualização**: Agora  
**Status**: ✅ Pronto para migração
