# 🔧 DEVELOPMENT GUIDE - HPO Translator

**Guia técnico para desenvolvedores**

---

## 🏗️ ARQUITETURA

### Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT + OAuth (ORCID)
- **Testing**: Playwright (E2E) + Jest (Unit)

### Fluxo de Dados
```
Frontend (React)
    ↓ HTTP/REST
Backend (Express)
    ↓ Prisma
PostgreSQL (Database)
```

---

## 📦 MODELOS DO BANCO (Prisma Schema)

### Principais Tabelas

**User** - Usuários do sistema
- email, password, name
- role: TRANSLATOR | COMMITTEE_MEMBER | ADMIN
- points, level (gamificação)
- hasCompletedOnboarding

**HPOTerm** - 17.020 termos da ontologia
- hpoId (ex: HP:0000001)
- labelEn (inglês)
- labelPt (português - quando traduzido)
- translationStatus: NOT_STARTED | IN_PROGRESS | PENDING_REVIEW | APPROVED | REJECTED

**Translation** - Traduções submetidas
- hpoTermId (FK)
- translatorId (FK)
- termPt, definitionPt
- status, confidence (1-5)
- approvedAt, approvedById

**ConflictReview** - Sistema de resolução de conflitos
- hpoTermId (termos com múltiplas traduções)
- type: MULTIPLE_TRANSLATIONS | QUALITY_ISSUE
- status: PENDING_COMMITTEE | RESOLVED | CANCELLED
- resolution: TRANSLATION_SELECTED | REQUIRES_NEW_TRANSLATION

**ConflictVote** - Votos do comitê
- conflictReviewId (FK)
- voterId (FK)
- decision: APPROVE_THIS | CREATE_NEW | ABSTAIN
- selectedTranslationId (se APPROVE_THIS)

**SyncLog** - Histórico de sincronização HPO oficial
- syncedCount
- syncedBy (admin)
- exportFilePath (arquivo .babelon.tsv gerado)

**Notification** - Centro de notificações
- userId (FK)
- type: TRANSLATION_APPROVED | CONFLICT_CREATED | etc.
- isRead
- relatedTranslationId, relatedConflictId

---

## 🛣️ BACKEND API ENDPOINTS

### Autenticação
```
POST   /api/auth/register       - Criar conta
POST   /api/auth/login          - Login JWT
POST   /api/auth/orcid/callback - OAuth ORCID
GET    /api/auth/me             - Usuário atual
```

### Termos HPO
```
GET    /api/terms               - Listar termos (paginado)
GET    /api/terms/:id           - Detalhes do termo
POST   /api/terms/:id/translate - Criar tradução
```

### Traduções
```
GET    /api/translations        - Listar traduções (filtros)
GET    /api/translations/:id    - Detalhes
POST   /api/translations/:id/validate  - Validar (peer review)
```

### Admin
```
GET    /api/admin/pending       - Traduções pendentes
POST   /api/admin/approve/:id   - Aprovar tradução
POST   /api/admin/reject/:id    - Rejeitar tradução
GET    /api/admin/dashboard     - Stats do dashboard
```

### Conflitos (Módulo 3)
```
GET    /api/conflicts           - Listar conflitos pendentes
GET    /api/conflicts/:id       - Detalhes do conflito
POST   /api/conflicts/:id/vote  - Votar (comitê)
```

### Analytics (Módulo 4)
```
GET    /api/analytics           - Métricas gerais
GET    /api/analytics/top-contributors  - Ranking
POST   /api/analytics/sync      - Sincronizar com HPO oficial
GET    /api/analytics/sync-history      - Histórico de sync
```

### Notificações
```
GET    /api/notifications       - Listar notificações
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### Pontos por Ação
- Criar tradução: **+50 pts**
- Tradução aprovada: **+100 pts extra**
- Validar tradução: **+20 pts**
- Vencer conflito (voto majoritário): **+150 pts**

### Níveis
```typescript
const calculateLevel = (points: number) => {
  if (points < 100) return 1;
  if (points < 250) return 2;
  if (points < 500) return 3;
  if (points < 1000) return 4;
  if (points < 2000) return 5;
  // ... até level 10
};
```

### Badges
- 🥉 Bronze: 10 traduções aprovadas
- 🥈 Prata: 50 traduções aprovadas
- 🥇 Ouro: 100 traduções aprovadas
- 💎 Diamante: 500 traduções aprovadas

---

## 🔀 MÓDULO 3: CONFLICT RESOLUTION

### Fluxo de Resolução

1. **Detecção automática**: Quando ≥2 traduções do mesmo termo
2. **Criação de ConflictReview** (status: PENDING_COMMITTEE)
3. **Notificação** enviada a COMMITTEE_MEMBER+
4. **Votação** do comitê (3 opções):
   - APPROVE_THIS: Escolhe uma tradução específica
   - CREATE_NEW: Rejeita todas, pede nova
   - ABSTAIN: Abstenção
5. **Quórum**: Mínimo 3 votos
6. **Resolução automática**: Quando >50% concordam
7. **Vencedor**: Tradução aprovada automaticamente (+150 pts)
8. **Perdedores**: Traduções rejeitadas
9. **HPO Term**: Atualizado com vencedor

---

## 📊 MÓDULO 4: ANALYTICS & SYNC

### Métricas Disponíveis
- Progresso geral (% termos traduzidos)
- Tempo médio de aprovação
- Usuários ativos no período
- Traduções aguardando aprovação
- Top 6 contribuidores

### Sincronização HPO Oficial

**Formato Babelon TSV** (10 colunas):
```tsv
subject_id	subject_label	predicate_id	object_id	object_label	translator	translation_provider	source	translation_status	translation_type
HP:0000001	Termo Original	rdfs:label		Termo Traduzido	user@email.com	HPO-PT Platform	https://url	OFFICIAL	translation
```

**Arquivo gerado**: `backend/exports/sync/hp-pt.babelon.YYYY-MM-DD.tsv`

**Processo**:
1. Admin clica "🚀 Iniciar Sync"
2. Backend busca traduções com `syncedToHpo = false` e `status = APPROVED`
3. Gera arquivo .babelon.tsv
4. Marca traduções como `syncedToHpo = true`
5. Cria registro SyncLog
6. Envia notificações aos tradutores

---

## 🧪 TESTES

### Configuração E2E (Playwright)

**playwright.config.ts**:
```typescript
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  workers: 1,  // Sequencial para evitar race conditions
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### Usuários de Teste
Criar com: `npx tsx prisma/seed-test-users.ts`

### Executar Testes
```powershell
# E2E (precisa backend+frontend rodando!)
cd monorepo\frontend
npx playwright test --workers=1

# Unit/Integration
cd monorepo\backend
npm test
```

### Problemas Comuns

**Testes E2E timeout**:
- ✅ Verificar se backend está em http://localhost:3001
- ✅ Verificar se frontend está em http://localhost:5173
- ✅ Aguardar 10s após iniciar serviços antes de rodar testes

**Botão de login fica disabled**:
- ✅ Usar `.type()` ao invés de `.fill()` nos testes
- ✅ Adicionar delay: `{ delay: 50 }`
- ✅ Aguardar validação: `await page.waitForTimeout(300)`

---

## 🐳 DOCKER

### Desenvolvimento

**docker-compose.yml**:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: hpo_translator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Comandos Úteis
```powershell
# Iniciar
docker compose up -d postgres redis

# Ver logs
docker compose logs -f postgres

# Parar
docker compose down

# Resetar (APAGA TUDO!)
docker compose down -v
```

---

## 🚀 DEPLOYMENT

### Vercel (Frontend)

1. Conectar repositório GitHub
2. Build command: `cd monorepo/frontend && npm run build`
3. Output directory: `monorepo/frontend/dist`
4. Environment variables:
   - `VITE_API_URL=https://api.seu-dominio.com`

### Railway (Backend + PostgreSQL)

1. Criar novo projeto
2. Add PostgreSQL database
3. Add service do GitHub
4. Build command: `cd monorepo/backend && npm run build`
5. Start command: `cd monorepo/backend && node dist/server.js`
6. Environment variables:
   - `DATABASE_URL` (auto-preenchido)
   - `JWT_SECRET`
   - `ORCID_CLIENT_ID`
   - `ORCID_CLIENT_SECRET`
   - `FRONTEND_URL`

### Migrations em Produção
```powershell
# No Railway (ou Render)
npx prisma migrate deploy
```

---

## 🔐 SEGURANÇA

### JWT Tokens
- Expiração: 7 dias
- Armazenamento: localStorage (frontend)
- Header: `Authorization: Bearer <token>`

### Roles & Permissões
```typescript
// Middleware de autorização
const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Uso
router.post('/approve', authenticate, requireRole(['ADMIN']), approveTranslation);
```

### ORCID OAuth
1. Registrar app em https://orcid.org/developer-tools
2. Callback URL: `https://seu-dominio.com/auth/orcid/callback`
3. Obter CLIENT_ID e CLIENT_SECRET
4. Configurar no .env

---

## 📝 CONTRIBUINDO

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Commits convencionais:
  - `feat:` nova funcionalidade
  - `fix:` correção de bug
  - `docs:` documentação
  - `refactor:` refatoração
  - `test:` testes

### Pull Request Process
1. Fork + branch
2. Implementar mudanças
3. Adicionar testes
4. Atualizar documentação
5. Abrir PR com descrição clara

---

## 🆘 SUPORTE

**Issues**: https://github.com/filipepaulista12/hpo-translator-cplp/issues  
**Email**: filipe.paulista@example.com

---

**Última atualização**: 14 de Outubro de 2025
