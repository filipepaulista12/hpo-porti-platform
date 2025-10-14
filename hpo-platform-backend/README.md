# HPO Translation Platform - Backend

API REST para plataforma colaborativa de tradução de termos HPO para português.

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Iniciar banco de dados com Docker:**
```bash
docker-compose up -d postgres redis
```

4. **Executar migrations:**
```bash
npm run prisma:migrate
```

5. **Importar dados (HPO terms + traduções legacy):**
```bash
npm run prisma:seed
```

6. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## 📁 Estrutura do Projeto

```
src/
├── server.ts              # Entry point
├── config/
│   └── database.ts        # Prisma client
├── middleware/
│   ├── auth.ts            # Autenticação JWT
│   └── errorHandler.ts    # Error handling global
├── routes/
│   ├── auth.routes.ts     # Login, registro
│   ├── user.routes.ts     # Perfil de usuário
│   ├── term.routes.ts     # Termos HPO
│   ├── translation.routes.ts  # Traduções
│   ├── validation.routes.ts   # Validações
│   └── stats.routes.ts    # Estatísticas
└── utils/
    └── logger.ts          # Winston logger

prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Seed script (importa dados)
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual

### HPO Terms
- `GET /api/terms` - Listar termos (com filtros)
- `GET /api/terms/:id` - Detalhes de um termo
- `GET /api/terms/recommended/for-me` - Termos recomendados

### Translations
- `POST /api/translations` - Criar tradução
- `GET /api/translations/:id` - Detalhes da tradução
- `PUT /api/translations/:id` - Atualizar tradução
- `DELETE /api/translations/:id` - Deletar tradução

### Validations
- `POST /api/validations` - Validar uma tradução
- `GET /api/validations/pending` - Traduções pendentes de validação

### Stats
- `GET /api/stats/overview` - Estatísticas gerais
- `GET /api/stats/leaderboard` - Ranking de usuários
- `GET /api/stats/my-stats` - Estatísticas pessoais

## 🗄️ Database Schema

### Principais Entidades

- **User** - Usuários da plataforma
  - Roles: TRANSLATOR, REVIEWER, VALIDATOR, ADMIN
  - Gamificação: points, level, streak
  
- **HpoTerm** - Termos da ontologia HPO
  - Status: NOT_TRANSLATED, PENDING_REVIEW, APPROVED, etc
  
- **Translation** - Traduções submetidas
  - Source: MANUAL, AI_ASSISTED, LEGACY
  - isLegacy: marca traduções importadas (precisam validação)
  
- **Validation** - Validações de revisores
  - Decision: APPROVED, NEEDS_REVISION, REJECTED
  - Rating: 1-5 (Likert scale)
  
- **Badge** - Conquistas/badges
- **UserActivity** - Log de atividades

## 🎮 Sistema de Gamificação

### Pontos
- Tradução simples: 10-50 pts (baseado em dificuldade)
- Validação: 5 pts
- Bônus de aprovação: +15 pts
- Streak diário: +5 pts

### Níveis
1. Novato (0-100 pts)
2. Colaborador (100-500 pts)
3. Especialista (500-2000 pts)
4. Mestre (2000-5000 pts)
5. Lenda (5000+ pts)

### Badges
- Primeira Tradução
- Em Chamas (7 dias)
- Perfeccionista (100% aprovação)
- Top 10
- Mestre HPO (500+ traduções)

## 🔐 Sistema de Validação

### Fluxo Multi-nível

```
1. Tradutor submete tradução → PENDING_REVIEW
2. 3+ Revisores avaliam (Likert 1-5)
3. Se 70%+ aprovarem → PENDING_VALIDATION
4. Validador especialista faz aprovação final → APPROVED
```

### Roles e Permissões

- **TRANSLATOR**: Pode criar traduções
- **REVIEWER**: Pode revisar traduções (≥50 traduções aprovadas + 85% taxa)
- **VALIDATOR**: Especialista convidado, aprovação final
- **ADMIN**: Gestão completa

## 📊 Traduções Legacy

As 7.215 traduções importadas de `hp-pt.babelon.tsv`:
- Marcadas com `isLegacy: true`
- Status inicial: `LEGACY_PENDING`
- Necessitam validação igual às novas traduções
- Rastreabilidade mantida

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor com hot-reload

# Database
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Executar migrations
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Importar dados iniciais

# Build
npm run build            # Compilar TypeScript
npm start                # Rodar build de produção

# Testes
npm test                 # Rodar testes
npm run test:watch       # Testes em modo watch
```

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up        # Todos os serviços
docker-compose up -d     # Background
docker-compose logs -f   # Ver logs
docker-compose down      # Parar serviços
```

### Prisma Studio (UI do banco)
```bash
docker-compose up prisma-studio
# Acesse: http://localhost:5555
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/hpo_platform"

# JWT
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Redis
REDIS_URL="redis://localhost:6379"
```

## 🚧 Próximas Implementações

### Sprint 2 (Semana 3-4)
- [ ] Integração OAuth2 com ORCID
- [ ] Sistema de badges automático
- [ ] Algoritmo de reputação
- [ ] Dashboard de admin

### Sprint 3 (Semana 5-6)
- [ ] Integração com OpenAI para sugestões
- [ ] Sistema de comentários threaded
- [ ] Notificações por email
- [ ] Webhooks

### Sprint 4 (Semana 7-8)
- [ ] Exportação multi-formato (XLIFF, OBO)
- [ ] API pública com rate limiting
- [ ] Sincronização com HPO oficial
- [ ] Analytics avançado

## 📝 Desenvolvimento

### Adicionar Nova Rota

1. Criar arquivo em `src/routes/`
2. Definir schema de validação (Zod)
3. Implementar handlers
4. Adicionar middleware de autenticação
5. Registrar no `src/server.ts`

### Adicionar Nova Entity

1. Atualizar `prisma/schema.prisma`
2. Rodar `npm run prisma:migrate`
3. Gerar client: `npm run prisma:generate`

## 🐛 Troubleshooting

### Erro: "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar serviços
docker-compose restart postgres
```

### Reset completo do banco
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
```

## 📄 Licença

MIT

## 👥 Contribuidores

- [Seu Nome] - Desenvolvimento inicial

---

**Status:** 🟢 Em Desenvolvimento Ativo (Sprint 1)
