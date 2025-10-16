# 📋 TODO - HPO Translation Platform

**Última atualização:** 16 de Outubro de 2025  
**Status do Sistema:** 93% completo (13/14 rotas implementadas)

---

## 🎯 VISÃO GERAL

### ✅ Sistema Funcional (93%)
- ✅ Backend Node.js + Express + TypeScript (porta 3001)
- ✅ Frontend React 18 + Vite (porta 5173)
- ✅ PostgreSQL 16 no Docker (porta 5433) - HEALTHY
- ✅ Redis 7 no Docker (porta 6379) - HEALTHY
- ✅ 13/14 rotas de API implementadas
- ✅ 23 testes automatizados (Jest)
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Docker hybrid structure (dev + prod)
- ✅ WebSocket notifications real-time
- ✅ Email service (6 templates)
- ✅ Gamificação completa
- ✅ Sistema de moderação (3-strikes)

### 🚧 O que falta para 100% (7%)
4 itens críticos que impedem deploy em produção

---

## 🔴 CRÍTICO - BLOQUEADORES DE PRODUÇÃO

### 1. 🗄️ Popular Banco de Dados
**Status:** ⚠️ PostgreSQL rodando mas VAZIO

**Problema:**
- Migrations não aplicadas
- Nenhum termo HPO importado (0/16.942)
- Tabelas não criadas

**Solução:**
```powershell
cd hpo-platform-backend

# 1. Aplicar migrations
npx prisma migrate deploy

# 2. Gerar Prisma Client
npx prisma generate

# 3. Importar termos HPO
npm run prisma:import-all

# Verificar
npx prisma studio  # Abrir em http://localhost:5555
```

**Resultado esperado:** 16.942 termos HPO na tabela `HpoTerm`

**Prioridade:** 🔴 CRÍTICO  
**Tempo estimado:** 5 minutos  
**Dependências:** Nenhuma

---

### 2. ⚙️ Configurar Variáveis de Ambiente

**Status:** ⚠️ `.env` incompleto - serviços opcionais desabilitados

**Problema:**
- Email service não funciona (SMTP não configurado)
- ORCID OAuth não funciona (credenciais faltando)
- IA features desabilitadas (OpenAI API key faltando)

**Solução:**

#### Backend (.env)
```bash
# Email (SMTP)
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
SMTP_FROM="HPO Translation <noreply@hpo-translator.com>"

# ORCID OAuth (obter em https://orcid.org/developer-tools)
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-XXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"

# OpenAI (para IA features - opcional)
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxx"

# Segurança
JWT_SECRET="[GERAR CHAVE FORTE]"  # pwgen 64 1
ENCRYPTION_KEY="[GERAR CHAVE FORTE]"  # pwgen 32 1
```

#### Frontend (.env)
```bash
# API URL (atualmente hardcoded)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001

# Produção
# VITE_API_URL=https://api.seu-dominio.com
# VITE_WS_URL=wss://api.seu-dominio.com
```

**Guias:**
- ORCID: `docs/setup/ORCID_SETUP.md`
- SMTP Gmail: https://support.google.com/mail/answer/185833

**Prioridade:** 🔴 CRÍTICO (sem isso, features essenciais não funcionam)  
**Tempo estimado:** 15 minutos  
**Dependências:** Contas SMTP e ORCID

---

### 3. 🔒 Configurar HTTPS (SSL/TLS)

**Status:** ⚠️ Servidor rodando em HTTP (inseguro para produção)

**Problema:**
- Cookies JWT vulneráveis a MITM attacks
- ORCID OAuth requer HTTPS em produção
- Dados sensíveis trafegam sem criptografia

**Solução:**

#### Opção A: Nginx + Let's Encrypt (Recomendado)
```bash
# 1. Instalar Nginx
sudo apt install nginx certbot python3-certbot-nginx

# 2. Configurar reverse proxy
sudo nano /etc/nginx/sites-available/hpo-translator

# 3. Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# 4. Auto-renovação
sudo certbot renew --dry-run
```

#### Opção B: Cloudflare (Mais fácil)
1. Apontar DNS para Cloudflare
2. Ativar SSL/TLS (Full)
3. Cloudflare gerencia certificados automaticamente

**Guias:**
- Nginx: `docs/deployment/DEPLOY_GUIDE.md` (seção SSL)
- Cloudflare: https://www.cloudflare.com/ssl/

**Prioridade:** 🔴 CRÍTICO (obrigatório para produção)  
**Tempo estimado:** 30 minutos  
**Dependências:** Domínio próprio

---

### 4. 🔧 Substituir URLs Hardcoded no Frontend

**Status:** ⚠️ API URL hardcoded em múltiplos arquivos

**Problema:**
```typescript
// ❌ ERRADO (hardcoded)
const response = await fetch('http://localhost:3001/api/users');

// ✅ CORRETO (variável de ambiente)
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
```

**Arquivos afetados:**
- `plataforma-raras-cpl/src/ProductionHPOApp.tsx` (~50 ocorrências)
- `plataforma-raras-cpl/src/services/*.ts` (se existir)

**Solução:**
```powershell
cd plataforma-raras-cpl

# Buscar todas as ocorrências
Select-String -Path "src/**/*.tsx" -Pattern "http://localhost:3001" -Recurse

# Substituir manualmente ou usar script
# Criar constante global:
# const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**Prioridade:** 🟡 IMPORTANTE (não bloqueia dev, mas quebra prod)  
**Tempo estimado:** 20 minutos  
**Dependências:** Nenhuma

---

## 🟡 IMPORTANTE - Melhorias Pré-Produção

### 5. 🧪 Expandir Cobertura de Testes

**Status:** 23 testes (apenas backend)

**O que falta:**
- [ ] Testes E2E (Playwright)
- [ ] Testes de integração (Prisma + Database)
- [ ] Testes de frontend (Vitest + Testing Library)
- [ ] Testes de carga (k6 ou Artillery)

**Meta:** 80% code coverage

**Prioridade:** 🟡 MÉDIA  
**Tempo estimado:** 4-6 horas

---

### 6. 📊 Implementar Analytics Routes (1/14 rotas)

**Status:** 93% completo (13/14 rotas)

**Features faltando:**
- Dashboard de analytics (velocidade de tradução, trends)
- Top contributors
- Sincronização com GitHub HPO oficial
- Download de arquivo Babelon sincronizado

**Arquivos:**
- Criar: `src/routes/analytics.routes.ts`
- Atualizar: `src/server.ts` (registrar rota)

**Dependências:**
- Model `SyncLog` precisa campo `adminId`
- User model precisa campo `approvedCount` (✅ já existe)
- HpoTerm precisa campo `label` (atualmente só tem `labelEn`)

**Prioridade:** 🟡 MÉDIA (feature avançada, não essencial para MVP)  
**Tempo estimado:** 3-4 horas

---

### 7. 📝 Criar CONTRIBUTING.md

**Status:** ❌ Arquivo não existe

**O que incluir:**
- Como fazer fork e clone
- Padrões de código (ESLint, Prettier)
- Como rodar testes
- Como submeter Pull Request
- Code review checklist

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 30 minutos

---

### 8. 🎨 Criar QUICK_START.md

**Status:** ❌ Arquivo não existe

**O que incluir:**
- Instalação rápida (3 comandos)
- Primeiro uso (criar conta admin)
- Traduzir primeiro termo
- Links para documentação completa

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 20 minutos

---

## 🟢 DESEJÁVEL - Post-MVP

### 9. 📈 Monitoramento e Observabilidade

**Features:**
- [ ] Sentry (error tracking)
- [ ] Prometheus + Grafana (métricas)
- [ ] Winston (structured logging)
- [ ] Health checks avançados (database, redis, external APIs)

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 2-3 horas

---

### 10. 🚀 CI/CD Melhorado

**Features:**
- [ ] Deploy automático em staging
- [ ] Deploy automático em produção (após aprovação manual)
- [ ] Rollback automático em caso de falha
- [ ] Notificação no Slack/Discord

**Status atual:** GitHub Actions basic CI (tests + build)

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 2 horas

---

### 11. 📱 Progressive Web App (PWA)

**Features:**
- [ ] Service Worker
- [ ] Offline mode
- [ ] Install prompt
- [ ] Push notifications (via WebPush)

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 3-4 horas

---

### 12. 🌍 Internacionalização (i18n)

**Features:**
- [ ] Suporte a múltiplos idiomas (PT, EN, ES)
- [ ] Traduções da UI (não apenas termos HPO)
- [ ] Detecção automática de idioma

**Prioridade:** 🟢 BAIXA  
**Tempo estimado:** 4-6 horas

---

## 📋 CHECKLIST PRÉ-DEPLOY

Antes de fazer deploy em produção:

### Backend
- [ ] Migrations aplicadas (`npx prisma migrate deploy`)
- [ ] 16.942 termos HPO importados
- [ ] Variáveis de ambiente configuradas (SMTP, ORCID, JWT_SECRET)
- [ ] HTTPS configurado (SSL/TLS)
- [ ] CORS configurado para domínio de produção
- [ ] Rate limiting ativado
- [ ] Logs estruturados (Winston ou Pino)
- [ ] Health check respondendo

### Frontend
- [ ] URLs hardcoded substituídas por variáveis de ambiente
- [ ] Build de produção funcional (`npm run build`)
- [ ] Otimizações de bundle (code splitting, lazy loading)
- [ ] Favicon e meta tags configuradas
- [ ] Analytics (Google Analytics ou Plausible)

### Infraestrutura
- [ ] Docker Compose prod testado
- [ ] Nginx reverse proxy configurado
- [ ] Firewall configurado (portas 80, 443)
- [ ] Backup automático do PostgreSQL
- [ ] Monitoramento básico (uptime, disk space)
- [ ] Certificado SSL válido
- [ ] DNS configurado

### Segurança
- [ ] Secrets em variáveis de ambiente (não no código)
- [ ] Helmet.js ativado (security headers)
- [ ] SQL injection protegido (Prisma faz isso)
- [ ] XSS protegido (React faz isso)
- [ ] CSRF token implementado
- [ ] Rate limiting API

---

## 📊 PROGRESSO

```
CRÍTICO (Bloqueadores)        [█████░░░] 20% (1/4 - Testes OK, falta DB + Env + HTTPS + URLs)
IMPORTANTE (Pré-Produção)     [████████] 80% (4/5 - Apenas Analytics pendente)
DESEJÁVEL (Post-MVP)          [░░░░░░░░]  0% (0/4 - Não iniciado)

TOTAL:                        [██████░░] 75% (12/16 tarefas)
```

---

## 🎯 SPRINT ATUAL: Preparar para Produção

**Objetivo:** Completar 4 bloqueadores críticos

**Estimativa:** 1h 10min

**Ordem de execução:**
1. 🗄️ Popular banco (5min) → Permite testar features
2. ⚙️ Configurar .env (15min) → Ativa SMTP + ORCID
3. 🔧 Substituir URLs (20min) → Frontend pronto para prod
4. 🔒 Configurar HTTPS (30min) → Deploy seguro

**Após sprint:** Sistema 100% funcional e pronto para deploy! 🎉

---

## 📞 Suporte

- **Documentação Completa:** [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Guia de Deploy:** [docs/deployment/DEPLOY_GUIDE.md](docs/deployment/DEPLOY_GUIDE.md)
- **Troubleshooting:** [docs/deployment/DOCKER_TROUBLESHOOTING.md](docs/deployment/DOCKER_TROUBLESHOOTING.md)
- **Histórico:** [docs/history/](docs/history/) - Relatórios de implementação

---

**Última atualização:** 16 de Outubro de 2025  
**Responsável:** GitHub Copilot + Equipe HPO CPLP
