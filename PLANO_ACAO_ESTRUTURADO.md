# 🎯 PLANO DE AÇÃO ESTRUTURADO - HPO Translator
## Roadmap Baseado em Prioridades (Crítico → Importante → Nice-to-Have)

**Data de criação:** 2025-01-20  
**Baseado em:** `relatoriocompleto.txt` + `ANALISE_COMPARATIVA.md`  
**Metodologia:** Priorização P0 (Bloqueador) → P1 (Alta) → P2 (Média) → P3 (Baixa)

---

## 📊 RESUMO EXECUTIVO

### Status Atual
- **Backend:** ████████████████████ 100% ✅ (68/68 tests)
- **Frontend UX:** ██████████████████░░ 90% ✅ (18/20 tasks)
- **Frontend Tests:** ░░░░░░░░░░░░░░░░░░░░ 0% ❌
- **Dados Reais:** ░░░░░░░░░░░░░░░░░░░░ 0% ❌ **CRÍTICO!**
- **Deploy Ready:** ████████░░░░░░░░░░░░ 40% 🟡

### Gaps Críticos Identificados
- 🔴 **5 bloqueadores P0** (sistema não funciona sem isso)
- 🟡 **10 itens P1** (alta prioridade, afetam UX/funcionalidade core)
- 🟢 **15 itens P2-P3** (melhorias, polimento, nice-to-have)

### Timeline Estimada
- **P0 (Bloqueadores):** 2-3 horas ⚡
- **P1 (Alta Prioridade):** 2-3 dias 🚀
- **P2-P3 (Polimento):** 1-2 semanas 💎

---

## 🔴 P0: BLOQUEADORES (FAZER AGORA - 2-3 horas)

### ✅ P0.1: Importar Termos HPO Oficiais
**Problema:** Banco de dados está VAZIO (0 termos). Sistema não funciona sem dados reais.  
**Impacto:** 🔴 CRÍTICO - Usuário não pode traduzir nada.  
**Solução:**
```powershell
cd hpo-platform-backend
npx tsx prisma/seed.ts
```

**Verificação:**
```sql
SELECT COUNT(*) FROM "Term";  -- Deve retornar 17,020
SELECT * FROM "Term" LIMIT 10;
```

**Responsável:** DevOps / Backend  
**Tempo estimado:** 30 minutos (download + import)  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P0.2: Criar Usuário de Teste
**Problema:** Não é possível logar para testar o sistema (senha de filipeandradebernardi@gmail.com desconhecida).  
**Impacto:** 🔴 CRÍTICO - Não dá pra testar features implementadas.  
**Solução:**
```powershell
cd hpo-platform-backend
psql -U postgres -d hpo_translator -f create_test_users.sql
```

**Credenciais criadas:**
- `admin@test.com` / `admin123` (SUPER_ADMIN)
- `tradutor@test.com` / `admin123` (TRANSLATOR)
- `revisor@test.com` / `admin123` (COMMITTEE_MEMBER)

**Responsável:** DevOps  
**Tempo estimado:** 5 minutos  
**Bloqueio:** Nenhum  
**Status:** ✅ SCRIPT CRIADO (`create_test_users.sql`)

---

### ✅ P0.3: Testar Sistema End-to-End
**Problema:** Todas as 18 tasks UX foram implementadas mas NENHUMA foi testada manualmente.  
**Impacto:** 🔴 ALTO - Bugs podem estar escondidos.  
**Checklist de testes:**
- [ ] Login com admin@test.com
- [ ] Dashboard carrega com termos reais
- [ ] Traduzir termo (submit + confidence + star rating)
- [ ] Ver histórico (tabs: Todas/Pendentes/Aprovadas/Rejeitadas)
- [ ] Abrir perfil (editar nome, salvar, ver stats)
- [ ] Tooltips aparecem ao hover
- [ ] Loading skeletons durante fetch
- [ ] Empty states quando sem dados
- [ ] Mobile responsive (DevTools, <768px)
- [ ] Rate limiting (fazer 50 requests rápidas, verificar banner)
- [ ] Breadcrumbs (Home > Perfil)
- [ ] Category icons (🧠🦴❤️ nos termos)

**Responsável:** QA / Frontend  
**Tempo estimado:** 1 hora  
**Bloqueio:** Aguarda P0.1 e P0.2  
**Status:** ⏳ AGUARDANDO

---

### ✅ P0.4: Implementar Task #19 (Token Expiration Validation)
**Problema:** JWT expira após 7 dias mas frontend não detecta. Usuário fica com 401 sem saber por quê.  
**Impacto:** 🟡 MÉDIO - UX ruim (usuário confuso).  
**Solução:**

**Arquivo:** `plataforma-raras-cpl/src/ProductionHPOApp.tsx`

```typescript
// Adicionar em TokenStorage (linha ~150)
static isExpired(): boolean {
  const token = this.getToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true; // Token inválido
  }
}

// Adicionar antes de cada fetch (ex: linha ~400, antes de fetchTerms)
useEffect(() => {
  if (TokenStorage.isExpired()) {
    TokenStorage.clear();
    setUser(null);
    setCurrentPage('login');
    alert('⏱️ Sua sessão expirou. Faça login novamente.');
  }
}, [currentPage]); // Verificar a cada mudança de página
```

**Testes:**
1. Forçar token expirado (modificar `exp` no localStorage)
2. Tentar navegar → deve redirecionar para login com mensagem

**Responsável:** Frontend  
**Tempo estimado:** 30 minutos  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P0.5: Substituir `confirm()` e `alert()` por ConfirmationModal
**Problema:** Task #20 ficou incompleta. Ainda há `confirm()` nativo (UX feia).  
**Impacto:** 🟢 BAIXO - Funciona, mas UX ruim.  
**Solução:**

**Buscar e substituir:**
```typescript
// ANTES (linha ~2180, ReviewPage)
if (!confirm('Tem certeza que deseja aprovar esta tradução?')) return;

// DEPOIS
<ConfirmationModal
  isOpen={showApproveModal}
  title="Aprovar Tradução"
  message="Tem certeza que deseja aprovar esta tradução? Esta ação é irreversível."
  confirmLabel="✅ Sim, Aprovar"
  cancelLabel="❌ Cancelar"
  variant="info"
  onConfirm={() => { /* lógica de aprovação */ }}
  onCancel={() => setShowApproveModal(false)}
/>
```

**Locais para substituir:**
- Aprovar tradução (ReviewPage)
- Rejeitar tradução (AdminDashboard)
- Deletar tradução (HistoryPage)
- Banir usuário (AdminDashboard - se implementado)

**Responsável:** Frontend  
**Tempo estimado:** 1 hora  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

## 🟡 P1: ALTA PRIORIDADE (2-3 dias)

### ✅ P1.1: OAuth ORCID em Produção
**Problema:** Código implementado mas CLIENT_ID/SECRET não configurados. Nunca foi testado.  
**Impacto:** 🟡 MÉDIO - Funcionalidade premium (autenticação acadêmica) não utilizável.  
**Passos:**

1. **Registrar app no ORCID:**
   - Ir em: https://orcid.org/developer-tools
   - Criar "Developer Application"
   - Callback URL: `http://localhost:5000/api/auth/orcid/callback`
   - Copiar CLIENT_ID e CLIENT_SECRET

2. **Adicionar no `.env`:**
```env
ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ORCID_REDIRECT_URI=http://localhost:5000/api/auth/orcid/callback
```

3. **Testar:**
   - Clicar "Login com ORCID" no frontend
   - Redirecionar para ORCID → autorizar
   - Voltar para app → verificar token JWT e dados do usuário

**Responsável:** Backend + DevOps  
**Tempo estimado:** 1,5 horas (1h registro + 30min teste)  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P1.2: Auto-Promoção para REVIEWER
**Problema:** Docs dizem "50+ traduções aprovadas, 85%+ taxa → AUTO-PROMOTE para REVIEWER", mas lógica não existe.  
**Impacto:** 🟡 MÉDIO - Gamificação incompleta.  
**Solução:**

**Arquivo:** `hpo-platform-backend/src/services/promotion.service.ts` (criar novo)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkAutoPromotion(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      translations: {
        where: { status: 'APPROVED' }
      }
    }
  });

  if (!user || user.role !== 'TRANSLATOR') return;

  const approvedCount = user.translations.length;
  const totalCount = await prisma.translation.count({ where: { translatorId: userId } });
  const approvalRate = totalCount > 0 ? approvedCount / totalCount : 0;

  // Critérios: 50+ approved, 85%+ taxa
  if (approvedCount >= 50 && approvalRate >= 0.85) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'REVIEWER' }
    });

    // Notificar usuário
    await prisma.notification.create({
      data: {
        userId,
        type: 'PROMOTION',
        title: '🎉 Promoção para Revisor!',
        content: 'Parabéns! Você foi promovido a REVIEWER por sua excelência em traduções.',
        isRead: false
      }
    });
  }
}
```

**Chamar função:**
- Após tradução ser aprovada (endpoint `PUT /api/admin/translations/:id/approve`)

**Responsável:** Backend  
**Tempo estimado:** 2 horas  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P1.3: Sistema de Rejection Estruturado
**Problema:** Admin pode rejeitar, mas sem feedback detalhado (reason_code, suggestions, can_resubmit).  
**Impacto:** 🟡 MÉDIO - Tradutor não sabe por que foi rejeitado → UX ruim.  
**Solução:**

**1. Atualizar Prisma Schema:**
```prisma
model Rejection {
  id             String   @id @default(uuid())
  translationId  String
  adminId        String
  reasonCode     RejectionReason
  feedback       String   // Texto livre
  suggestions    String?  // Sugestões de melhoria
  canResubmit    Boolean  @default(true)
  createdAt      DateTime @default(now())

  translation    Translation @relation(fields: [translationId], references: [id])
  admin          User        @relation(fields: [adminId], references: [id])
}

enum RejectionReason {
  POOR_QUALITY
  INCORRECT_TRANSLATION
  INCOMPLETE
  OFFENSIVE_CONTENT
  DUPLICATE
  OTHER
}
```

**2. Migração:**
```powershell
npx prisma migrate dev --name add-rejection-table
```

**3. Endpoint de Rejeição:**
```typescript
// PUT /api/admin/translations/:id/reject
{
  "reasonCode": "INCORRECT_TRANSLATION",
  "feedback": "A tradução está incorreta. 'Seizure' significa 'Convulsão', não 'Ataque'.",
  "suggestions": "Consulte DeCS para termos médicos corretos.",
  "canResubmit": true
}
```

**4. UI no AdminDashboard:**
- Substituir `prompt("Motivo da rejeição:")` por modal detalhado
- Dropdown com reason_code (POOR_QUALITY, INCORRECT, etc.)
- Textarea para feedback
- Checkbox "Permitir reenvio?"

**Responsável:** Backend + Frontend  
**Tempo estimado:** 3 horas  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P1.4: Moderação de Usuários (Ban/Unban UI)
**Problema:** Flag `isActive` existe no User, mas sem UI/API para banir/desbanir usuários.  
**Impacto:** 🟡 MÉDIO - Admin não consegue moderar spammers.  
**Solução:**

**1. Endpoints:**
```typescript
// PUT /api/admin/users/:id/ban
// PUT /api/admin/users/:id/unban
```

**2. UI no AdminDashboard:**
- Adicionar seção "👥 Gerenciar Usuários"
- Lista de usuários com botões "🚫 Banir" e "✅ Desbanir"
- Usar `ConfirmationModal` (variant: danger) para confirmar ban

**3. Lógica:**
```typescript
// Ao banir:
await prisma.user.update({
  where: { id: userId },
  data: { isActive: false }
});

// Ao desbanir:
await prisma.user.update({
  where: { id: userId },
  data: { isActive: true }
});
```

**4. Middleware de autenticação:**
- Verificar `isActive` antes de permitir acesso
- Retornar 403 se `isActive === false`

**Responsável:** Backend + Frontend  
**Tempo estimado:** 2 horas  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO

---

### ✅ P1.5: GitHub API para Pull Requests Automáticos
**Problema:** Sincronização HPO gera arquivo `.babelon.tsv` mas não cria PR automaticamente.  
**Impacto:** 🟡 MÉDIO - Processo de sync é manual e lento.  
**Solução:**

**1. Instalar Octokit:**
```powershell
cd hpo-platform-backend
npm install @octokit/rest
```

**2. Configurar GitHub Token:**
```env
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_REPO_OWNER=obophenotype
GITHUB_REPO_NAME=hpo-translations
```

**3. Implementar sync com PR:**
```typescript
import { Octokit } from '@octokit/rest';

async function syncAndCreatePR(tsvContent: string) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const branchName = `sync-${new Date().toISOString().split('T')[0]}`;
  const fileName = 'babelon/hp-pt.babelon.tsv';

  // 1. Criar branch
  await octokit.git.createRef({
    owner: 'obophenotype',
    repo: 'hpo-translations',
    ref: `refs/heads/${branchName}`,
    sha: 'SHA_DO_MAIN' // Buscar dinamicamente
  });

  // 2. Commit arquivo
  await octokit.repos.createOrUpdateFileContents({
    owner: 'obophenotype',
    repo: 'hpo-translations',
    path: fileName,
    message: `Sync HPO-PT translations - ${new Date().toLocaleDateString()}`,
    content: Buffer.from(tsvContent).toString('base64'),
    branch: branchName
  });

  // 3. Criar Pull Request
  const pr = await octokit.pulls.create({
    owner: 'obophenotype',
    repo: 'hpo-translations',
    title: `[HPO-PT] Sync traduções - ${new Date().toLocaleDateString()}`,
    head: branchName,
    base: 'main',
    body: `Sincronização automática de traduções português brasileiro.\n\n- Total de termos: XXX\n- Novas traduções: YYY\n- Atualizações: ZZZ`
  });

  return pr.data.html_url;
}
```

**Responsável:** Backend  
**Tempo estimado:** 3 horas  
**Bloqueio:** GitHub token e permissões  
**Status:** ❌ NÃO INICIADO

---

### ✅ P1.6: Testes Frontend (Criar 10 Testes Críticos)
**Problema:** 0% coverage no frontend. Nenhum teste foi criado.  
**Impacto:** 🟡 MÉDIO - Qualidade de código comprometida, bugs podem passar.  
**Solução:**

**1. Setup Jest + React Testing Library:**
```powershell
cd plataforma-raras-cpl
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest
```

**2. Criar `jest.config.js`:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
```

**3. Criar testes prioritários:**

**`src/__tests__/ConfirmationModal.test.tsx`**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../ProductionHPOApp';

test('ConfirmationModal renderiza corretamente', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  
  render(
    <ConfirmationModal
      isOpen={true}
      title="Confirmar Ação"
      message="Tem certeza?"
      confirmLabel="Sim"
      cancelLabel="Não"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  
  expect(screen.getByText('Confirmar Ação')).toBeInTheDocument();
  expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Sim'));
  expect(onConfirm).toHaveBeenCalled();
});
```

**Lista de testes a criar:**
1. ✅ ConfirmationModal.test.tsx
2. ✅ Tooltip.test.tsx
3. ✅ Skeleton.test.tsx
4. ✅ EmptyState.test.tsx
5. ✅ StarRating.test.tsx
6. ✅ Breadcrumbs.test.tsx
7. ✅ ProfilePage.test.tsx (edit/save flow)
8. ✅ TokenStorage.test.tsx (isExpired, getToken, clear)
9. ✅ NotificationCenter.test.tsx (mark as read, delete)
10. ✅ Auth flow integration test (login → dashboard → logout)

**Responsável:** Frontend + QA  
**Tempo estimado:** 8 horas (1h setup + 7h testes)  
**Bloqueio:** Nenhum  
**Status:** ❌ NÃO INICIADO  
**Meta:** 80%+ coverage

---

## 🟢 P2: MÉDIA PRIORIDADE (1 semana)

### ✅ P2.1: Página de Guidelines (Como Traduzir)
- **Arquivo:** `plataforma-raras-cpl/src/pages/GuidelinesPage.tsx`
- **Conteúdo:** Baseado em `docs/GUIA_TRADUCAO.md`
- **Tempo:** 2 horas

### ✅ P2.2: Three-Strike System (3 rejeições → suspensão 7 dias)
- **Adicionar campo:** `user.warningCount` (Prisma)
- **Lógica:** Se warningCount >= 3, suspender conta por 7 dias
- **Tempo:** 2 horas

### ✅ P2.3: UI para Comentários em Traduções
- **Tabela:** `Comment` (já existe no Prisma)
- **UI:** Seção de discussão em cada tradução (como GitHub issues)
- **Tempo:** 4 horas

### ✅ P2.4: Email Notifications (SendGrid)
- **Eventos:** Tradução aprovada, rejeitada, promoção, conflito
- **Integração:** SendGrid ou Resend
- **Tempo:** 3 horas

### ✅ P2.5: Dark Mode
- **Implementação:** CSS variables + toggle button
- **Persistência:** localStorage
- **Tempo:** 3 horas

### ✅ P2.6: Dashboard de "Minha Produtividade"
- **Gráficos:** Traduções por dia (Chart.js), taxa de aprovação
- **Tempo:** 4 horas

### ✅ P2.7: Bulk Actions para Tradutores
- **Exemplo:** Deletar múltiplas traduções pendentes de uma vez
- **UI:** Checkboxes + botão "Deletar Selecionadas"
- **Tempo:** 2 horas

### ✅ P2.8: Testes E2E (Playwright no Docker)
- **Setup:** Docker container para rodar Playwright (evitar Windows block)
- **Arquivos:** 4 specs já existem (`01-auth.spec.ts`, etc.)
- **Tempo:** 4 horas

### ✅ P2.9: Expert Routing (Recomendação por Especialidade)
- **Lógica:** Auto-atribuir termos por specialty do usuário (precisa coletar no perfil)
- **Tempo:** 3 horas

### ✅ P2.10: Cache no Frontend (React Query)
- **Benefício:** Reduzir requests, melhorar performance
- **Tempo:** 4 horas

---

## 🎨 P3: BAIXA PRIORIDADE (Nice-to-Have)

1. **Integração com Prisma Studio no README** (10 min)
2. **Notificações com preview** (30 min)
3. **Conflitos com split view** (2h)
4. **Badges com cards grandes e ícones** (2h)
5. **Loading states informativos** ("Carregando 17.020 termos...") (30 min)

---

## 📅 TIMELINE SUGERIDA

### 🔥 **Hoje (2-3 horas)**
- ✅ P0.1: Importar termos HPO (30min)
- ✅ P0.2: Criar usuário teste (5min)
- ✅ P0.3: Testar sistema end-to-end (1h)
- ✅ P0.4: Token Expiration Validation (30min)
- ✅ P0.5: Substituir confirm/alert (1h)

**Objetivo:** Sistema 100% funcional e testado com dados reais ✅

---

### 🚀 **Amanhã (4 horas)**
- ✅ P1.1: OAuth ORCID (1,5h)
- ✅ P1.2: Auto-promoção REVIEWER (2h)
- ✅ P1.3: Rejection estruturado (3h - parte 1)

**Objetivo:** Features de gamificação e OAuth funcionando ✅

---

### 📅 **Dia 3 (8 horas)**
- ✅ P1.3: Rejection estruturado (parte 2 - UI)
- ✅ P1.4: Moderação de usuários (ban/unban)
- ✅ P1.6: Testes frontend (criar 5 testes básicos)

**Objetivo:** UX melhorada e início de cobertura de testes ✅

---

### 📅 **Dia 4 (8 horas)**
- ✅ P1.5: GitHub API Pull Requests (3h)
- ✅ P1.6: Testes frontend (completar 10 testes)

**Objetivo:** Automação de sync e 50%+ test coverage ✅

---

### 📅 **Semana 2 (40 horas)**
- ✅ P2: Itens de média prioridade (P2.1 a P2.10)
- ✅ P3: Nice-to-have conforme tempo permitir

**Objetivo:** Polimento e funcionalidades extras ✅

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs para considerar "100% pronto"
- ✅ Backend: 100% (68/68 tests)
- ✅ Frontend UX: 100% (20/20 tasks)
- ✅ Frontend Tests: 80%+ coverage
- ✅ Dados Reais: 17.020 termos HPO importados
- ✅ OAuth ORCID: Funcional em produção
- ✅ Deploy: Vercel (frontend) + Railway (backend)
- ✅ E2E Tests: 15+ scenarios rodando no CI/CD
- ✅ Documentação: 100% (já está)

---

## 🎯 DECISÕES DE PRIORIZAÇÃO

### Por que P0 vem primeiro?
- **Sem dados reais (P0.1), o sistema NÃO FUNCIONA** (bloqueador absoluto)
- **Sem usuário de teste (P0.2), não dá pra testar** (bloqueador de QA)
- **Sem testes manuais (P0.3), bugs podem estar escondidos** (risco alto)

### Por que P1 é crítico?
- **OAuth ORCID:** Diferencial competitivo (autenticação acadêmica)
- **Auto-promoção REVIEWER:** Core da gamificação (usuários precisam "subir de nível")
- **Rejection estruturado:** UX ruim = tradutores desmotivados
- **Moderação:** Segurança contra spam/abuso
- **GitHub API:** Automação salva HORAS de trabalho manual
- **Testes frontend:** Qualidade = menos bugs em produção

### Por que P2-P3 podem esperar?
- **Sistema JÁ FUNCIONA sem eles** (são melhorias, não bloqueios)
- **Dark mode, guidelines, etc são "nice-to-have"** (usuários podem viver sem)
- **ROI menor:** 80/20 rule (20% do esforço = 80% do valor)

---

## 🚀 RECOMENDAÇÃO FINAL

### 🔥 AGORA MESMO (próximos 30 minutos):
```powershell
cd hpo-platform-backend
npx tsx prisma/seed.ts  # Importar 17.020 termos
psql -U postgres -d hpo_translator -f create_test_users.sql  # Criar usuários teste
```

### 🎯 PRÓXIMAS 2 HORAS:
- Logar com admin@test.com
- Testar todas as 18 tasks implementadas
- Documentar bugs encontrados

### 🚀 PRÓXIMOS 3 DIAS:
- Completar P0 (bloqueadores)
- Completar P1 (alta prioridade)
- Sistema pronto para deploy beta 🚢

---

**Criado por:** GitHub Copilot  
**Data:** 2025-01-20  
**Baseado em:** Análise comparativa + Relatório completo + TASKS_CHECKLIST.md
