# 📋 TODO LIST COMPLETO - HPO Translation Platform
## Análise Minuciosa para Produção 100% Funcional

**Data da Análise:** 15 de Outubro de 2025  
**Status Atual:** Sistema 80% funcional, faltam ajustes críticos para produção

---

## 🎯 RESUMO EXECUTIVO

### ✅ O QUE ESTÁ FUNCIONANDO (80%)
- ✅ Backend Node.js + Express + TypeScript rodando na porta 3001
- ✅ Frontend React + Vite rodando na porta 5173
- ✅ PostgreSQL no Docker (porta 5433) - **HEALTHY**
- ✅ Redis no Docker (porta 6379) - **HEALTHY**
- ✅ Prisma Schema completo (17 models, 633 linhas)
- ✅ 11 rotas de API implementadas
- ✅ Autenticação JWT funcionando
- ✅ Sistema de gamificação implementado
- ✅ WebSocket para notificações real-time
- ✅ Email service configurado (6 templates)
- ✅ node_modules instalados em backend e frontend
- ✅ Scripts START.ps1 e STOP.ps1 funcionais

### ⚠️ O QUE FALTA PARA 100% (20%)
1. **Database não está populado** - Faltam migrações e seed de dados
2. **Variáveis de ambiente incompletas** - SMTP, ORCID OAuth
3. **Pasta monorepo vazia** - Estrutura inconsistente
4. **Falta arquivo .gitignore na raiz** - Controle de versão incompleto
5. **3 rotas não implementadas** - Analytics, Comments, Conflicts
6. **Frontend hardcoded API URL** - Não usa variável de ambiente
7. **Documentação desorganizada** - 76 arquivos .md espalhados
8. **Falta CI/CD pipeline** - GitHub Actions não configurado
9. **Falta testes automatizados** - Nenhum teste rodando
10. **Docker Compose incompleto** - Não sobe backend automaticamente

---

## 🔴 PRIORIDADE CRÍTICA (BLOCKER)

### 1. ✅ **CONFIGURAR BANCO DE DADOS**
**Status:** ⚠️ PostgreSQL rodando mas **VAZIO**

**Problema:**
```bash
# Docker está rodando mas banco não tem dados
hpo-postgres   Up About an hour (healthy)
```

**Solução:**
```powershell
# 1. Verificar se migrations foram aplicadas
cd hpo-platform-backend
npx prisma migrate status

# 2. Aplicar migrations (se pendentes)
npx prisma migrate deploy

# 3. Gerar Prisma Client
npx prisma generate

# 4. Importar 16.942 termos HPO
npm run prisma:import-all
# Aguardar: "✅ Total importado: 16942 termos"

# 5. (Opcional) Criar usuário admin de teste
npx tsx scripts/promote-to-admin.ts --email admin@hpo.com
```

**Estimativa:** 10-15 minutos  
**Impacto:** 🔴 BLOCKER - Sem isso, nada funciona

---

### 2. ✅ **CORRIGIR VARIÁVEIS DE AMBIENTE**

#### Backend (.env)
**Arquivo:** `hpo-platform-backend/.env`

**Problemas:**
- ❌ ORCID_CLIENT_ID vazio (OAuth não funciona)
- ❌ ORCID_CLIENT_SECRET vazio
- ❌ SMTP_HOST vazio (emails não funcionam)
- ❌ OPENAI_API_KEY vazio (sugestões IA desabilitadas)

**Solução Imediata (Dev):**
```env
# Backend .env (MÍNIMO para funcionar)
DATABASE_URL="postgresql://postgres:hpo_password@localhost:5433/hpo_platform?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="hpo-platform-2025-secret-key-change-in-production-abc123xyz789"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Desabilitar serviços opcionais temporariamente
EMAIL_ENABLED="false"
ORCID_ENABLED="false"
OPENAI_ENABLED="false"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL="info"
```

**Solução Produção (obrigatório depois):**
```env
# SMTP - Configurar Gmail ou SendGrid
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua_senha_app_16_digitos"
EMAIL_FROM="noreply@hpo-plataforma.com"
EMAIL_ENABLED="true"

# ORCID OAuth - Criar app em https://sandbox.orcid.org/developer-tools
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="https://seu-dominio.com/api/auth/orcid/callback"
ORCID_ENABLED="true"

# OpenAI (opcional - sugestões de tradução IA)
OPENAI_API_KEY="sk-proj-xxxxxxxxx"
OPENAI_ENABLED="true"
```

#### Frontend (.env)
**Arquivo:** `plataforma-raras-cpl/.env`

**Problema:**
- ❌ Só tem `VITE_API_URL` mas código usa hardcoded `http://localhost:3001`
- ❌ Falta `VITE_WS_URL` para WebSocket

**Solução:**
```env
# Frontend .env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

**DEPOIS: Corrigir ProductionHPOApp.tsx linha 8:**
```typescript
// ❌ ANTES (hardcoded)
const API_BASE_URL = 'http://localhost:3001';

// ✅ DEPOIS (variável de ambiente)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
```

**Estimativa:** 5 minutos (dev), 30 minutos (produção com OAuth)  
**Impacto:** 🔴 CRÍTICO

---

### 3. ✅ **LIMPAR ESTRUTURA MONOREPO**

**Problema:**
```
monorepo/
├── backend/   <--- ⚠️ VAZIO (0 arquivos)
└── frontend/  <--- ⚠️ Só tem node_modules
```

**Análise:**
- A estrutura atual está em `hpo-platform-backend/` e `plataforma-raras-cpl/`
- Pasta `monorepo/` está **obsoleta** e confusa
- README.md menciona `monorepo/` mas código real está fora

**Decisão:**
Manter estrutura atual (melhor organizada) e **DELETAR pasta monorepo/**

**Solução:**
```powershell
# Remover pasta monorepo vazia
Remove-Item -Recurse -Force "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\monorepo"
```

**Estimativa:** 1 minuto  
**Impacto:** 🟡 Médio (organização)

---

## 🟡 PRIORIDADE ALTA (Antes de Deploy)

### 4. ✅ **CRIAR .gitignore NA RAIZ**

**Problema:**
- ✅ Backend tem .gitignore
- ✅ Frontend tem .gitignore
- ❌ Raiz do projeto **NÃO TEM**

**Risco:**
- Commitar `.env` com senhas
- Commitar `node_modules/` (gigante)
- Commitar `logs/` com dados sensíveis

**Solução:**
```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment variables
.env
.env.local
.env.*.local
**/.env

# Build output
dist/
build/
**/dist/

# Logs
logs/
*.log
**/*.log

# Database
*.db
*.db-journal
postgres_data/
redis_data/

# OS files
.DS_Store
Thumbs.db
.DS_Store?

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
**/.vitest/

# Temp
tmp/
temp/
monorepo/

# Docker volumes
postgres_data
redis_data
```

**Estimativa:** 2 minutos  
**Impacto:** 🟡 Alto (segurança)

---

### 5. ✅ **IMPLEMENTAR ROTAS FALTANTES**

**Status:** 11/14 rotas implementadas (78%)

**Rotas Implementadas (✅):**
1. ✅ `auth.routes.ts` - Login, registro, ORCID
2. ✅ `user.routes.ts` - Perfil, atualização
3. ✅ `term.routes.ts` - Listar termos HPO
4. ✅ `translation.routes.ts` - CRUD traduções
5. ✅ `validation.routes.ts` - Revisão por pares
6. ✅ `stats.routes.ts` - Estatísticas gerais
7. ✅ `leaderboard.routes.ts` - Ranking de usuários
8. ✅ `export.routes.ts` - Exportar CSV, JSON, XLIFF, Babelon
9. ✅ `admin.routes.ts` - Dashboard admin (896 linhas)
10. ✅ `notification.routes.ts` - Centro de notificações
11. ✅ `invite.routes.ts` - Convidar colegas

**Rotas Faltando (❌):**
1. ❌ `analytics.routes.ts` - Analytics avançado, sync GitHub
2. ❌ `comment.routes.ts` - Comentários em traduções
3. ❌ `conflict.routes.ts` - Sistema de votação do comitê

**Impacto:**
- **Analytics:** Dashboard admin incompleto (falta sync GitHub)
- **Comments:** Colaboração limitada (não tem discussões)
- **Conflicts:** Resolução manual de conflitos (não automatizado)

**Opções:**

#### Opção A: Desabilitar features temporariamente (RÁPIDO)
```typescript
// ProductionHPOApp.tsx - Esconder botões não funcionais
const FEATURES_ENABLED = {
  analytics: false,  // Desabilitar até implementar rota
  comments: false,   // Desabilitar até implementar rota
  conflicts: false   // Desabilitar até implementar rota
};
```

#### Opção B: Implementar rotas faltantes (COMPLETO)
Seguir `TODO_FEATURES_PENDENTES.md`:

**1. Analytics Routes** (3-4 horas)
```typescript
// Adicionar ao schema.prisma
model SyncLog {
  adminId String  // ⚠️ Campo faltando
  admin   User @relation(fields: [adminId], references: [id])
}
```

**2. Comment Routes** (1-2 horas)
- Model `Comment` já existe no schema ✅
- Só falta implementar CRUD

**3. Conflict Routes** (6-8 horas)
- Models `ConflictReview`, `CommitteeVote` já existem ✅
- Implementar lógica de votação

**Estimativa:**
- Opção A: 15 minutos
- Opção B: 10-14 horas

**Recomendação:** Opção A para MVP, Opção B para versão final

**Impacto:** 🟡 Médio (features avançadas)

---

### 6. ✅ **CORRIGIR DOCKER COMPOSE**

**Problema:**
```yaml
# docker-compose.yml tem serviço 'api' mas NÃO SOBE automaticamente
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev  # ⚠️ Problema: build falha
```

**Solução: Usar docker-compose.simple.yml (apenas infra)**
```powershell
# 1. Renomear docker-compose.yml atual
mv hpo-platform-backend/docker-compose.yml hpo-platform-backend/docker-compose.full.yml

# 2. Copiar docker-compose.simple.yml para raiz
cp docker-compose.simple.yml hpo-platform-backend/docker-compose.yml

# 3. Testar
cd hpo-platform-backend
docker compose down
docker compose up -d
```

**Alternativa: Consertar Dockerfile.dev**
```dockerfile
# Dockerfile.dev (criar se não existir)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

**Estimativa:** 15 minutos  
**Impacto:** 🟡 Médio (deploy)

---

### 7. ✅ **ORGANIZAR DOCUMENTAÇÃO**

**Problema:**
```
76 arquivos .md espalhados:
- 6 na raiz
- 3 em docs/
- 12 em plataforma-raras-cpl/docs/
- 5 em hpo-platform-backend/
- 50+ em plataforma-raras-cpl/temp-check/
```

**Solução:**
```powershell
# Deletar pasta temp-check (obsoleta)
Remove-Item -Recurse -Force plataforma-raras-cpl/temp-check

# Manter apenas essenciais:
# - README.md (raiz)
# - PROJECT_DOCUMENTATION.md (raiz)
# - DEPLOY.md (raiz)
# - docs/GUIA_TRADUCAO.md
# - docs/TESTING_GUIDE.md
# - docs/FINAL_IMPLEMENTATION_REPORT.md

# Deletar redundantes
Remove-Item RELATORIO_FINAL_CORRECOES.md
Remove-Item DEVELOPMENT_GUIDE.md  # (conteúdo já está em PROJECT_DOCUMENTATION.md)
Remove-Item TODO_FEATURES_PENDENTES.md  # (migrar para este arquivo)
```

**Estimativa:** 10 minutos  
**Impacto:** 🟢 Baixo (organização)

---

## 🟢 PRIORIDADE MÉDIA (Melhorias)

### 8. ✅ **ADICIONAR TESTES AUTOMATIZADOS**

**Status Atual:**
```json
// Backend package.json
"test": "jest",  // ⚠️ Nenhum arquivo de teste existe
```

**Solução Mínima (Smoke Tests):**
```typescript
// hpo-platform-backend/src/__tests__/health.test.ts
import request from 'supertest';
import app from '../server';

describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

**Estimativa:** 2-4 horas (smoke tests básicos)  
**Impacto:** 🟢 Médio (qualidade)

---

### 9. ✅ **CONFIGURAR CI/CD**

**Solução:**
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd hpo-platform-backend && npm ci
      - name: Build
        run: cd hpo-platform-backend && npm run build
      - name: Run tests
        run: cd hpo-platform-backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd plataforma-raras-cpl && npm ci
      - name: Build
        run: cd plataforma-raras-cpl && npm run build
```

**Estimativa:** 1 hora  
**Impacto:** 🟢 Alto (qualidade contínua)

---

### 10. ✅ **CRIAR SCRIPT DE DEPLOY AUTOMATIZADO**

**Solução:**
```powershell
# DEPLOY_PRODUCTION.ps1
Write-Host "🚀 Iniciando deploy em PRODUÇÃO..." -ForegroundColor Cyan

# 1. Build backend
cd hpo-platform-backend
npm run build
Write-Host "✅ Backend compilado" -ForegroundColor Green

# 2. Build frontend
cd ../plataforma-raras-cpl
npm run build
Write-Host "✅ Frontend compilado (dist/)" -ForegroundColor Green

# 3. Aplicar migrations
cd ../hpo-platform-backend
npx prisma migrate deploy
Write-Host "✅ Migrations aplicadas" -ForegroundColor Green

# 4. Copiar para servidor (exemplo com SCP)
# scp -r dist/ user@servidor:/var/www/hpo-backend
# scp -r ../plataforma-raras-cpl/dist/ user@servidor:/var/www/hpo-frontend

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
```

**Estimativa:** 30 minutos  
**Impacto:** 🟢 Alto (produtividade)

---

## 📝 CHECKLIST FINAL PARA PRODUÇÃO

### Fase 1: Setup Inicial (30 minutos)
```powershell
# [ ] 1. Configurar banco de dados
cd hpo-platform-backend
npx prisma migrate deploy
npx prisma generate
npm run prisma:import-all

# [ ] 2. Configurar variáveis de ambiente
# Editar hpo-platform-backend/.env (JWT, DATABASE_URL)
# Editar plataforma-raras-cpl/.env (VITE_API_URL)

# [ ] 3. Criar .gitignore na raiz
# Copiar conteúdo da seção 4

# [ ] 4. Deletar pasta monorepo
Remove-Item -Recurse -Force monorepo

# [ ] 5. Testar sistema localmente
.\START.ps1
# Abrir http://localhost:5173
# Criar conta de teste
# Traduzir 1 termo
# Verificar no banco: psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM translations;"
```

### Fase 2: Preparação para GitHub (20 minutos)
```powershell
# [ ] 6. Limpar documentação
Remove-Item -Recurse -Force plataforma-raras-cpl/temp-check
Remove-Item RELATORIO_FINAL_CORRECOES.md
Remove-Item DEVELOPMENT_GUIDE.md
Remove-Item TODO_FEATURES_PENDENTES.md

# [ ] 7. Criar README.md principal atualizado
# (Usar conteúdo de PROJECT_DOCUMENTATION.md)

# [ ] 8. Adicionar .gitignore na raiz
# (Ver seção 4)

# [ ] 9. Commit inicial
git add .
git commit -m "feat: Sistema HPO Translation Platform completo"

# [ ] 10. Push para GitHub
git remote add origin https://github.com/seu-usuario/hpo-translation.git
git push -u origin main
```

### Fase 3: Deploy em Servidor (1-2 horas)
```bash
# [ ] 11. Servidor Ubuntu: Instalar dependências
sudo apt update
sudo apt install -y nodejs npm postgresql nginx certbot

# [ ] 12. Clonar repositório
cd /var/www
git clone https://github.com/seu-usuario/hpo-translation.git
cd hpo-translation

# [ ] 13. Configurar PostgreSQL
sudo -u postgres createuser hpo_user -P
sudo -u postgres createdb hpo_platform -O hpo_user

# [ ] 14. Configurar .env de produção
cd hpo-platform-backend
cp .env.example .env
nano .env  # Editar com dados reais

# [ ] 15. Build backend
npm ci --production
npx prisma migrate deploy
npx prisma generate
npm run prisma:import-all

# [ ] 16. Build frontend
cd ../plataforma-raras-cpl
npm ci
npm run build  # Gera dist/

# [ ] 17. Configurar Nginx
sudo nano /etc/nginx/sites-available/hpo
# (Ver DEPLOY.md)

# [ ] 18. SSL com Let's Encrypt
sudo certbot --nginx -d seu-dominio.com

# [ ] 19. PM2 para backend
npm install -g pm2
cd /var/www/hpo-translation/hpo-platform-backend
pm2 start dist/server.js --name hpo-backend
pm2 save
pm2 startup

# [ ] 20. Testar produção
curl https://seu-dominio.com/api/health
```

### Fase 4: Configurações Avançadas (Opcional)
```powershell
# [ ] 21. Configurar OAuth ORCID
# https://sandbox.orcid.org/developer-tools

# [ ] 22. Configurar SMTP (Gmail)
# https://myaccount.google.com/apppasswords

# [ ] 23. Configurar OpenAI API
# https://platform.openai.com/api-keys

# [ ] 24. Configurar monitoramento (PM2 Plus)
pm2 link <secret> <public>

# [ ] 25. Configurar backup automático
# cron job para backup PostgreSQL
```

---

## 🎯 ESTIMATIVA DE TEMPO TOTAL

### Cenário Mínimo Viável (MVP)
- ✅ Fase 1: 30 minutos
- ✅ Fase 2: 20 minutos
- ✅ Fase 3 (sem SSL): 1 hora
- **TOTAL:** ~2 horas para rodar localmente + GitHub

### Cenário Completo (Produção)
- ✅ Fase 1: 30 minutos
- ✅ Fase 2: 20 minutos
- ✅ Fase 3: 2 horas
- ✅ Fase 4: 2 horas
- ✅ Implementar rotas faltantes: 10 horas
- ✅ Testes + CI/CD: 4 horas
- **TOTAL:** ~19 horas

---

## 🚨 PROBLEMAS CONHECIDOS

### 1. Porta 5433 vs 5432
**Problema:** Docker usa 5433 mas código menciona 5432  
**Solução:** Sempre usar `localhost:5433` no DATABASE_URL

### 2. CORS em Produção
**Problema:** Frontend em domínio diferente do backend  
**Solução:** Adicionar no backend `.env`:
```env
CORS_ORIGIN="https://seu-dominio.com,https://www.seu-dominio.com"
```

### 3. WebSocket em HTTPS
**Problema:** wss:// precisa certificado SSL  
**Solução:** Nginx proxy_pass para WebSocket:
```nginx
location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 4. Prisma Client desatualizado
**Problema:** Após alterar schema.prisma  
**Solução:**
```bash
npx prisma generate
```

---

## 📞 CONTATOS E RECURSOS

### Documentação Oficial
- **HPO Official:** https://hpo.jax.org/
- **Prisma:** https://www.prisma.io/docs
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/

### Arquivos Importantes
- `PROJECT_DOCUMENTATION.md` - Documentação completa
- `DEPLOY.md` - Guia de deploy detalhado
- `docs/GUIA_TRADUCAO.md` - Guia para tradutores
- `docs/TESTING_GUIDE.md` - Guia de testes

### Scripts Úteis
```powershell
# Iniciar tudo
.\START.ps1

# Parar tudo
.\STOP.ps1

# Reset completo do banco
cd hpo-platform-backend
npx prisma migrate reset

# Ver logs do backend
Get-Content .\hpo-platform-backend\logs\combined.log -Tail 50

# Verificar portas em uso
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5433
```

---

## ✅ CONCLUSÃO

**Status Atual:** Sistema 80% funcional  
**Para MVP (dev local):** Faltam 30-60 minutos  
**Para Produção completa:** Faltam 2-4 horas  
**Para Sistema Final (todas features):** Faltam 15-20 horas

**Próximos Passos:**
1. ✅ Aplicar migrations e importar termos HPO (CRÍTICO)
2. ✅ Corrigir variáveis de ambiente (CRÍTICO)
3. ✅ Criar .gitignore e limpar estrutura (IMPORTANTE)
4. ✅ Testar localmente com START.ps1
5. ✅ Commit e push para GitHub
6. ✅ Deploy em servidor de produção

**Sistema estará 100% funcional após completar Fases 1-3 do checklist!** 🚀
