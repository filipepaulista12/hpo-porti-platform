# 🧬 HPO Translator CPLP - Documentação Completa do Projeto

**Plataforma Colaborativa de Tradução de Termos Médicos HPO para Português**

---

## 📑 Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Quick Start](#quick-start)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Features Implementadas](#features-implementadas)
5. [Configuração e Setup](#configuração-e-setup)
6. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
7. [Deploy em Produção](#deploy-em-produção)
8. [Features Pendentes](#features-pendentes)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 📋 Sobre o Projeto

Sistema completo de tradução colaborativa do HPO (Human Phenotype Ontology) com foco na Comunidade dos Países de Língua Portuguesa (CPLP). Permite que profissionais de saúde contribuam com traduções de termos médicos, validem traduções de outros usuários, e participem de um sistema de gamificação com rankings e badges.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação JWT + OAuth ORCID**
- 📝 **17.020 Termos HPO** importados e prontos para tradução
- ✅ **Validação por Pares** - Sistema de revisão colaborativo
- 🏆 **Gamificação Completa** - Ranking, pontos, níveis e badges
- 👑 **Dashboard Admin** - Moderação, aprovação e rejeição
- 🔔 **Notificações Real-Time** - WebSocket com centro de notificações
- 📊 **Exportação Multi-formato** - CSV, JSON, XLIFF, Babelon TSV, Five Stars
- 🔍 **Busca Avançada** - Filtros por categoria, confiança e status
- 📚 **Histórico Completo** - Rastreamento de todas as contribuições
- ✉️ **Email Service** - 6 templates HTML profissionais
- 📱 **Totalmente Responsivo** - Mobile, Tablet e Desktop

### 📊 Estatísticas do Sistema

- **17.020 termos HPO** no banco de dados
- **7.213 traduções legadas** (português) importadas
- **9.806 termos** aguardando tradução
- **97/99 testes unitários passando** (97% success rate)
- **10 fases de migração concluídas**

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone o Repositório

```bash
git clone <seu-repo>
cd hpo_translation
```

### 2. Iniciar Infraestrutura Docker

```powershell
# Iniciar PostgreSQL + Redis
docker compose up -d postgres redis

# Aguardar 10 segundos para containers iniciarem
Start-Sleep -Seconds 10
```

### 3. Configurar Backend

```powershell
cd hpo-platform-backend

# Criar arquivo .env
@"
DATABASE_URL="postgresql://postgres:hpo_password@localhost:5433/hpo_platform?schema=public"
JWT_SECRET="sua_chave_super_secreta_aqui_minimo_32_caracteres"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
EMAIL_ENABLED="false"
"@ | Out-File -FilePath .env -Encoding UTF8

# Instalar dependências
npm install

# Aplicar schema no banco
npx prisma db push

# Importar 17.020 termos HPO
npm run prisma:import-all

# Iniciar backend
npx tsx watch src/server.ts
```

### 4. Configurar Frontend (novo terminal)

```powershell
cd plataforma-raras-cpl

# Instalar dependências
npm install

# Iniciar frontend
npm run dev
```

### 5. Acessar Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 6. Criar Primeira Conta

1. Acesse http://localhost:5173
2. Clique em **"Criar Conta"**
3. Preencha: Nome, Email, Senha, Especialidade
4. Faça login e comece a traduzir!

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica

**Frontend:**
- React 18 + TypeScript
- Vite 6.3.6 (build tool)
- TailwindCSS + Shadcn/ui
- Socket.IO Client (WebSocket)
- React Toastify (notificações)

**Backend:**
- Node.js 22 + Express
- TypeScript
- Prisma ORM 5.22
- Socket.IO (WebSocket)
- JWT + bcrypt (auth)
- Nodemailer (emails)

**Infraestrutura:**
- PostgreSQL 16 (banco de dados)
- Redis 7 (cache - futuro)
- Docker Compose (containerização)

### Estrutura de Diretórios

```
hpo_translation/
├── hpo-platform-backend/        # Backend API
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Lógica de negócio
│   │   ├── middleware/          # Auth, errors, rate limit
│   │   ├── utils/               # Logger, helpers
│   │   ├── websocket/           # Socket.IO server
│   │   └── server.ts            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # DB migrations
│   │   └── scripts/             # Import scripts
│   └── package.json
│
├── plataforma-raras-cpl/        # Frontend React
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── layout/          # Layout wrapper
│   │   │   ├── pages/           # Page components
│   │   │   └── ui/              # Shadcn components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom hooks
│   │   ├── ProductionHPOApp.tsx # Main app
│   │   └── main.tsx             # Entry point
│   └── package.json
│
├── docker-compose.simple.yml    # Docker setup
├── hpo-translations/            # HPO source data
│   └── babelon/                 # Translation files
└── docs/                        # Documentation
```

### Fluxo de Dados

```
┌─────────────┐
│   Frontend  │  ← User Interface (React)
│  Port 5173  │
└──────┬──────┘
       │ HTTP/REST + WebSocket
       ↓
┌──────────────┐
│   Backend    │  ← API Server (Express)
│  Port 3001   │
└──────┬───────┘
       │ Prisma ORM
       ↓
┌──────────────┐
│  PostgreSQL  │  ← Database
│  Port 5433   │
└──────────────┘
```

---

## ✅ Features Implementadas

### 1. Sistema de Autenticação

**JWT Authentication:**
- Login com email/senha
- Token expira em 7 dias
- Refresh automático
- Logout seguro

**OAuth ORCID (preparado):**
- Callback route: `/api/auth/orcid/callback`
- Token storage: localStorage

**Papéis de Usuário:**
- `TRANSLATOR` - Pode traduzir e validar
- `COMMITTEE_MEMBER` - Voto em conflitos
- `ADMIN` - Acesso total ao sistema

### 2. Sistema de Tradução

**17.020 Termos HPO:**
- Importados do arquivo `hp-nl.babelon.tsv`
- 7.213 com tradução legada (português)
- 9.806 aguardando tradução

**Interface de Tradução:**
- Busca por HPO ID ou nome
- Filtros por categoria (17 categorias)
- Scroll infinito (InfiniteTermsList)
- Nível de confiança (1-5 estrelas)
- Comentários opcionais

**Categorias Suportadas:**
- 🧠 Nervous system
- ❤️ Cardiovascular system
- 🦴 Skeletal system
- 🫁 Respiratory system
- 🍽️ Digestive system
- ⚡ Endocrine system
- 🛡️ Immune system
- 👶 Reproductive system
- 👁️ Eye
- 👂 Ear
- 🏥 Skin
- 📈 Growth
- 🌡️ Constitutional symptom
- ⚗️ Metabolism
- 🩸 Blood
- 🫘 Kidney
- 🫀 Liver

### 3. Sistema de Validação

**Peer Review:**
- Tradutores validam traduções de outros
- Não pode validar suas próprias traduções
- Sistema de rating (1-5 estrelas)
- Comentários obrigatórios em rejeição

**Estados de Tradução:**
- `NOT_STARTED` - Termo ainda não traduzido
- `PENDING_REVIEW` - Aguardando validação
- `APPROVED` - Aprovada pelo revisor
- `REJECTED` - Rejeitada com feedback
- `NEEDS_REVISION` - Requer ajustes

### 4. Sistema de Gamificação

**Pontos:**
- Tradução criada: `10 × dificuldade do termo`
- Validação feita: 5 pontos
- Tradução aprovada: Bônus de 20 pontos
- Convite aceito: 50 pontos (para quem convidou)

**Níveis:**
- Nível 1: 0-99 pontos (Iniciante)
- Nível 2: 100-499 pontos (Tradutor)
- Nível 3: 500-1999 pontos (Especialista)
- Nível 4: 2000+ pontos (Mestre)

**Badges:**
- 🥉 Primeiros Passos (primeira tradução)
- 🥈 Tradutor Dedicado (10 traduções)
- 🥇 Especialista (50 traduções)
- 👑 Mestre HPO (100 traduções)
- ⭐ Avaliador (10 validações)

**Ranking:**
- Top 10 tradutores
- Ranking por pontos totais
- Ranking semanal/mensal (futuro)
- Estatísticas individuais

### 5. Notificações em Tempo Real

**WebSocket Server:**
- Socket.IO na porta 3001
- Namespace: `/socket.io/`
- Reconexão automática

**Tipos de Notificação:**
- `TRANSLATION_APPROVED` - Sua tradução foi aprovada
- `TRANSLATION_REJECTED` - Sua tradução foi rejeitada
- `NEW_VALIDATION` - Alguém validou sua tradução
- `LEVEL_UP` - Subiu de nível
- `BADGE_EARNED` - Ganhou novo badge
- `CONFLICT_CREATED` - Conflito detectado (futuro)

**Centro de Notificações:**
- Badge com contador de não lidas
- Lista de notificações recentes
- Marcar como lida individualmente
- Marcar todas como lidas

### 6. Email Service

**6 Templates HTML:**
1. **Welcome Email** - Boas-vindas ao novo usuário
2. **Translation Approved** - Tradução aprovada
3. **Translation Rejected** - Tradução rejeitada com feedback
4. **Level Up** - Subiu de nível
5. **Badge Earned** - Ganhou novo badge
6. **Invite Email** - Convite para colega (NEW!)

**Providers Suportados:**
- **Ethereal** - Desenvolvimento (fake SMTP)
- **Gmail** - Produção (App Password)
- **Custom SMTP** - Produção (qualquer SMTP)

**Configuração:**
```env
EMAIL_ENABLED="true"
EMAIL_PROVIDER="gmail"
GMAIL_USER="seu-email@gmail.com"
GMAIL_APP_PASSWORD="sua_senha_app"
EMAIL_FROM="noreply@hpo-platform.com"
EMAIL_FROM_NAME="HPO Translation Platform"
```

### 7. Dashboard Admin

**Estatísticas:**
- Total de traduções
- Taxa de aprovação
- Traduções por status
- Gráfico de progresso

**Moderação:**
- Aprovar/rejeitar traduções em lote
- Banir usuários problemáticos
- Sistema de strikes (warnings)
- Auditoria de ações

### 8. Exportação Multi-formato

**Formatos Disponíveis:**

1. **CSV** - Compatível com Excel
2. **JSON** - Estruturado para APIs
3. **XLIFF** - Translation Memory XML
4. **Babelon TSV** - Formato oficial HPO
5. **Five Stars TSV** - Sistema de rating

**Filtros de Exportação:**
- Por status (aprovadas, pendentes, etc.)
- Por categoria
- Por tradutor
- Por período

### 9. Sistema de Convite (NEW!)

**Feature de Convite:**
- Botão "Convidar Colegas" no rodapé do Ranking
- Modal com campos: nome e email do colega
- Email automático com link de registro
- Recompensa: 50 pontos quando convite for aceito
- Validação: não pode convidar email já registrado

**Backend Endpoint:**
```typescript
POST /api/invite
Authorization: Bearer <token>
Body: { email: string, name: string }
Response: { success: true, pointsAwarded: 50 }
```

### 10. Interface Responsiva

**Breakpoints:**
- Mobile: < 640px (1 coluna)
- Tablet: 640px - 1024px (2 colunas)
- Desktop: > 1024px (4 colunas)

**Componentes UX:**
- ✅ Tooltips informativos
- ✅ Loading skeletons
- ✅ Empty states
- ✅ Star rating
- ✅ Breadcrumbs
- ✅ Confirmation modals
- ✅ Toast notifications

---

## 🔧 Configuração e Setup

### Variáveis de Ambiente

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:hpo_password@localhost:5433/hpo_platform?schema=public"

# JWT
JWT_SECRET="sua_chave_super_secreta_aqui_min_32_caracteres"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Email (opcional em dev)
EMAIL_ENABLED="false"
EMAIL_PROVIDER="ethereal"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend (.env)

```env
# Não necessário - API URL está hardcoded em ProductionHPOApp.tsx
# Caso queira configurar:
VITE_API_URL="http://localhost:3001"
VITE_WS_URL="ws://localhost:3001"
```

### Docker Compose

O arquivo `docker-compose.simple.yml` define:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5433:5432"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: hpo_password
      POSTGRES_DB: hpo_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

**Comandos Úteis:**

```powershell
# Iniciar containers
docker compose up -d postgres redis

# Ver logs
docker compose logs -f postgres

# Parar containers
docker compose down

# Limpar tudo (CUIDADO: apaga dados!)
docker compose down -v
```

### Database Schema

**Principais Models (Prisma):**

```prisma
model User {
  id                      String @id @default(uuid())
  email                   String @unique
  password                String
  name                    String
  specialty               String?
  role                    Role @default(TRANSLATOR)
  points                  Int @default(0)
  level                   Int @default(1)
  orcidId                 String? @unique
  hasCompletedOnboarding  Boolean @default(false)
  translations            Translation[]
  validations             Validation[]
  activities              UserActivity[]
  notifications           Notification[]
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

model HpoTerm {
  id                String @id @default(uuid())
  hpoId             String @unique
  labelEn           String
  definitionEn      String?
  synonymsEn        String[]
  category          String?
  difficulty        Int @default(1)
  translationStatus TranslationStatus @default(NOT_STARTED)
  labelPt           String?
  definitionPt      String?
  synonymsPt        String[]
  translations      Translation[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Translation {
  id            String @id @default(uuid())
  termId        String
  userId        String
  labelPt       String
  definitionPt  String?
  synonymsPt    String[]
  confidence    Int
  status        TranslationStatus @default(PENDING_REVIEW)
  source        String @default("MANUAL")
  comments      String?
  term          HpoTerm @relation(fields: [termId], references: [id])
  user          User @relation(fields: [userId], references: [id])
  validations   Validation[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Validation {
  id            String @id @default(uuid())
  translationId String
  validatorId   String
  decision      ValidationDecision
  rating        Int
  comments      String?
  translation   Translation @relation(fields: [translationId], references: [id])
  validator     User @relation(fields: [validatorId], references: [id])
  createdAt     DateTime @default(now())
}

model Notification {
  id        String @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean @default(false)
  metadata  Json?
  user      User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## 💻 Guia de Desenvolvimento

### Rodando Testes

**Backend (Unit Tests - Jest):**
```powershell
cd hpo-platform-backend
npm test
```

**Frontend (Unit Tests - Vitest):**
```powershell
cd plataforma-raras-cpl
npm test
```

**Frontend (E2E - Playwright):**
```powershell
cd plataforma-raras-cpl
npm run test:e2e
```

### API Endpoints Principais

#### Autenticação
```
POST   /api/auth/register          - Criar conta
POST   /api/auth/login             - Login JWT
GET    /api/auth/me                - Usuário atual
POST   /api/auth/orcid/callback    - OAuth ORCID
```

#### Termos HPO
```
GET    /api/terms                  - Listar termos (paginado)
GET    /api/terms/:id              - Detalhes do termo
GET    /api/terms/search           - Busca por HPO ID/nome
```

#### Traduções
```
GET    /api/translations           - Listar traduções (filtros)
POST   /api/translations           - Criar tradução
GET    /api/translations/:id       - Detalhes
PUT    /api/translations/:id       - Atualizar
DELETE /api/translations/:id       - Deletar
GET    /api/translations/my-history - Histórico do usuário
```

#### Validações
```
POST   /api/validations            - Criar validação
GET    /api/validations/:id        - Detalhes
```

#### Convites (NEW!)
```
POST   /api/invite                 - Enviar convite
Body: { email: string, name: string }
```

#### Admin
```
GET    /api/admin/stats            - Estatísticas gerais
GET    /api/admin/users            - Listar usuários
PUT    /api/admin/users/:id/ban    - Banir usuário
GET    /api/admin/translations     - Moderar traduções
```

#### Exportação
```
POST   /api/export                 - Exportar traduções
Body: { format: 'csv' | 'json' | 'xliff' | 'babelon' | 'five-stars' }
```

#### Notificações
```
GET    /api/notifications          - Listar notificações
PUT    /api/notifications/:id/read - Marcar como lida
PUT    /api/notifications/read-all - Marcar todas como lidas
```

### Estrutura de Response

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "error": "Nome do erro",
  "message": "Descrição do erro",
  "statusCode": 400
}
```

**Paginação:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Desenvolvimento Frontend

**Componentes Principais:**

- `ProductionHPOApp.tsx` - App principal (5024 linhas)
- `Layout.tsx` - Wrapper com navegação
- `TranslationPage.tsx` - Página de tradução
- `FAQPage.tsx` - Perguntas frequentes
- `ProfilePage.tsx` - Perfil do usuário

**Services:**

- `toast.service.ts` - Notificações toast
- `emailService.ts` - Envio de emails (backend)
- `websocket/socket.ts` - WebSocket server (backend)

**Custom Hooks:**

- `useIsMobile()` - Detecta mobile/tablet/desktop
- `useAuth()` - Gerencia autenticação (futuro)

### Desenvolvimento Backend

**Estrutura de Rotas:**

```typescript
// routes/translation.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    // Lógica aqui
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Middleware de Autenticação:**

```typescript
// middleware/auth.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new AppError('Token não fornecido', 401);
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
  next();
};
```

---

## 🚀 Deploy em Produção

### Requisitos do Servidor

**Mínimos Recomendados:**
- **OS:** Ubuntu 20.04+ / Debian 11+
- **RAM:** 4GB
- **CPU:** 2 cores
- **Disco:** 20GB SSD
- **Node.js:** v20.x
- **PostgreSQL:** 16.x

### 1. Instalar Dependências

```bash
# Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 16
sudo apt install postgresql postgresql-contrib

# Nginx (reverse proxy)
sudo apt install nginx

# PM2 (process manager)
sudo npm install -g pm2

# Certbot (SSL)
sudo apt install certbot python3-certbot-nginx
```

### 2. Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE hpo_platform;
CREATE USER hpo_user WITH PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE hpo_platform TO hpo_user;
\q

# Permitir conexões externas (opcional)
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 3. Deploy Backend

```bash
# Clonar repositório
cd /var/www
git clone <seu-repo-url> hpo-platform
cd hpo-platform/hpo-platform-backend

# Instalar dependências
npm install --production

# Configurar .env
nano .env
# Adicionar variáveis de produção (ver seção Variáveis de Ambiente)

# Aplicar migrations
npx prisma migrate deploy

# Importar termos HPO
npm run prisma:import-all

# Build TypeScript
npm run build

# Iniciar com PM2
pm2 start dist/server.js --name hpo-backend
pm2 save
pm2 startup
```

### 4. Deploy Frontend

```bash
cd /var/www/hpo-platform/plataforma-raras-cpl

# Instalar dependências
npm install

# Build para produção
npm run build

# Copiar para Nginx
sudo cp -r dist/* /var/www/html/hpo-platform/
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/hpo-platform
```

```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/html/hpo-platform;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/hpo-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Configurar SSL (HTTPS)

```bash
# Obter certificado Let's Encrypt
sudo certbot --nginx -d seu-dominio.com -d api.seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

### 7. Monitoramento

**PM2 Monitoring:**
```bash
pm2 monit               # Monitor em tempo real
pm2 logs hpo-backend    # Ver logs
pm2 restart hpo-backend # Reiniciar
pm2 status              # Status de todos os processos
```

**PostgreSQL Monitoring:**
```bash
# Ver conexões ativas
psql -U hpo_user -d hpo_platform -c "SELECT * FROM pg_stat_activity;"

# Ver tamanho do banco
psql -U hpo_user -d hpo_platform -c "SELECT pg_size_pretty(pg_database_size('hpo_platform'));"
```

**Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚧 Features Pendentes

### 1. Analytics Routes

**Funcionalidades:**
- Dashboard analytics avançado
- Velocidade de tradução (termos/dia)
- Trends de qualidade
- Top contributors
- Sincronização com GitHub HPO oficial

**Dependências Faltando:**
- Model `SyncLog` precisa campo `adminId`
- HpoTerm precisa campo `label` (além de `labelEn`)

**Prioridade:** 🔴 ALTA

### 2. Comment Routes

**Funcionalidades:**
- CRUD de comentários em traduções
- Sistema de respostas (replies)
- Notificações quando recebe comentário

**Dependências:**
- Model `Comment` já existe ✅
- Precisa apenas ajustar relations

**Prioridade:** 🟡 MÉDIA

### 3. Conflict Routes

**Funcionalidades:**
- Sistema de votação do comitê
- Gerenciamento de conflitos de tradução
- Resolução automática por votação majoritária

**Dependências Faltando:**
- Model `ConflictReview` (não existe)
- Model `CommitteeVote` (não existe)
- Enums: `ConflictType`, `ConflictStatus`, `Priority`

**Prioridade:** 🟢 BAIXA

### Estimativa de Tempo

- **Comment Routes:** 1-2 horas
- **Analytics Routes:** 3-4 horas
- **Conflict Routes:** 6-8 horas

**TOTAL:** 10-14 horas de desenvolvimento + testes

---

## 🧪 Testes

### Frontend (Vitest)

**Resultados Atuais:**
- **97/99 testes passando** (97% success rate)
- **2 falhas:** CSS styling tests (não crítico)

**Componentes Testados:**
- ✅ TokenStorage (13 tests)
- ✅ EmptyState (10 tests)
- ✅ Auth.integration (13 tests)
- ✅ Breadcrumbs (11 tests)
- ✅ StarRating (16 tests)
- ✅ Tooltip (7 tests)
- ✅ ConfirmationModal (5 tests)
- ❌ NotificationCenter (1 CSS test failed)
- ❌ Skeleton (1 animation test failed)

**Rodar Testes:**
```powershell
cd plataforma-raras-cpl
npm test
```

### Backend (Jest - Futuro)

Testes unitários planejados para:
- Routes (translation, validation, auth)
- Services (emailService, websocket)
- Middleware (auth, errorHandler)

---

## 🔧 Troubleshooting

### Backend não inicia

**Erro: "Cannot find module"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Erro: "Port 3001 already in use"**
```powershell
# Windows
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Frontend não conecta ao backend

**Erro: "ERR_CONNECTION_REFUSED"**

1. Verificar se backend está rodando:
   ```bash
   curl http://localhost:3001/health
   ```

2. Verificar URL da API em `ProductionHPOApp.tsx`:
   ```typescript
   const API_BASE_URL = 'http://localhost:3001';
   ```

### Docker PostgreSQL não inicia

**Erro: "port is already allocated"**
```powershell
# Parar todos os containers PostgreSQL
docker ps -a | findstr postgres
docker stop <container_id>
docker rm <container_id>

# Reiniciar
docker compose up -d postgres
```

### Prisma erros

**Erro: "Table does not exist"**
```bash
# Recriar schema (CUIDADO: apaga dados!)
npx prisma db push --accept-data-loss
npm run prisma:import-all
```

**Erro: "Invalid datasource"**
```bash
# Verificar .env
cat .env | grep DATABASE_URL

# Verificar conexão
psql "postgresql://postgres:hpo_password@localhost:5433/hpo_platform"
```

### Email Service não envia

**Solução:**
1. Verificar `EMAIL_ENABLED="true"` no `.env`
2. Para Gmail, criar **App Password** em https://myaccount.google.com/apppasswords
3. Testar com Ethereal (desenvolvimento):
   ```env
   EMAIL_ENABLED="true"
   EMAIL_PROVIDER="ethereal"
   ```

### WebSocket não conecta

**Erro: "WebSocket connection failed"**

1. Verificar Socket.IO inicializado no backend:
   ```bash
   # Logs devem mostrar:
   # [info]: 🔌 WebSocket server initialized
   ```

2. Verificar CORS no backend:
   ```typescript
   // server.ts
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

---

## 📊 Performance & Otimização

### Database Indexes

```sql
-- Índices já criados automaticamente pelo Prisma:
CREATE INDEX idx_translation_status ON "Translation"(status);
CREATE INDEX idx_translation_userId ON "Translation"("userId");
CREATE INDEX idx_hpoterm_translationStatus ON "HpoTerm"("translationStatus");
CREATE INDEX idx_notification_userId ON "Notification"("userId");
```

### Caching (Futuro - Redis)

```typescript
// Cachear termos HPO mais buscados
const cachedTerm = await redis.get(`term:${hpoId}`);
if (cachedTerm) return JSON.parse(cachedTerm);

// Cachear ranking (atualizar a cada 5 minutos)
const leaderboard = await redis.get('leaderboard:top10');
```

---

## 📝 Notas de Versão

### v1.0.0 (Atual)

**Principais Features:**
- ✅ 17.020 termos HPO importados
- ✅ Sistema de tradução e validação completo
- ✅ Gamificação (pontos, níveis, badges)
- ✅ Notificações real-time (WebSocket)
- ✅ Email Service (6 templates)
- ✅ Dashboard Admin
- ✅ Exportação multi-formato
- ✅ Sistema de convite com recompensa
- ✅ Interface responsiva
- ✅ 97/99 testes unitários passando

**Features Pendentes:**
- ⏳ Analytics Routes (dashboard avançado)
- ⏳ Comment Routes (sistema de comentários)
- ⏳ Conflict Routes (votação do comitê)

---

## 👥 Contribuindo

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Add nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - Veja arquivo LICENSE para detalhes

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@hpo-platform.com
- 💬 Discord: [Link do servidor]
- 📚 Wiki: [Link da documentação]

---

**Última Atualização:** 15 de Outubro de 2025
