# 🔍 ANÁLISE PRÉ-DEPLOY - Servidor PORTI-HPO

**Data:** 19 de Outubro de 2025  
**Objetivo:** Exploração consultiva do servidor antes do deploy  
**Modo:** READ-ONLY (sem alterações)

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Estado Atual do Servidor](#estado-atual-do-servidor)
3. [Deploy Anterior (17/Out)](#deploy-anterior-17out)
4. [Estrutura de Deploy Planejada](#estrutura-de-deploy-planejada)
5. [Comandos Consultivos](#comandos-consultivos)
6. [Plano de Substituição](#plano-de-substituição)

---

## 📊 RESUMO EXECUTIVO

### ✅ O Que Já Foi Feito (17/Out/2025)

**DEPLOYMENT COMPLETO BEM-SUCEDIDO:**

| Componente | Status | Localização | Porta |
|------------|--------|-------------|-------|
| **Backend** | ✅ ONLINE | `/var/www/html/hpo-platform/backend/` | 3002 |
| **Frontend** | ✅ ONLINE | `/var/www/html/hpo-platform/public/` | 80/443 |
| **Database** | ✅ PostgreSQL | Servidor local | 5432 |
| **PM2** | ✅ hpo-backend | Process ID: 1 | - |
| **Apache** | ✅ VirtualHost | hpo.raras-cplp.org.conf | 80/443 |
| **SSL** | ✅ Let's Encrypt | Certificado válido | 443 |

**URL ATIVA:** https://hpo.raras-cplp.org

---

### 🎯 Objetivo Atual

**SUBSTITUIR** a aplicação antiga/bugada pela **NOVA VERSÃO** do GitHub:
- **Repositório:** https://github.com/filipepaulista12/hpo-porti-platform
- **Commit:** b03e2d2b (19/Out/2025 - "Initial commit - PORTI-HPO Platform v1.0")
- **Versão:** PORTI-HPO Platform v1.0 (Monorepo completo)

---

## 🖥️ ESTADO ATUAL DO SERVIDOR

### 📍 Servidor

```
IP: 200.144.254.4
Hostname: ciis
OS: Ubuntu 20.04 LTS (Kernel 5.4.0-73-generic)
User: ubuntu
```

### 💾 Recursos Disponíveis

| Recurso | Total | Usado | Livre | Status |
|---------|-------|-------|-------|--------|
| **Disco (/)** | 20 GB | ~15 GB | ~5 GB | ⚠️ 75% |
| **RAM** | 15 GB | ~3 GB | ~12 GB | ✅ OK |
| **Swap** | 472 MB | ~30 MB | ~440 MB | ✅ OK |

### 🔧 Software Instalado

```
✅ Node.js v18.20.4 (suporta nossa app)
✅ PM2 v6.0.13 (gerenciador de processos)
✅ Apache2 (web server com SSL)
✅ PostgreSQL (banco de dados)
✅ MySQL (outro projeto - porta 3306)
✅ Python3 (outro projeto - porta 8081)
❌ Docker (NÃO instalado - usamos PM2)
```

### 🌐 Portas em Uso

| Porta | Serviço | Projeto | Status |
|-------|---------|---------|--------|
| 22 | SSH | Sistema | ✅ |
| 80 | HTTP | Apache | ✅ |
| 443 | HTTPS | Apache | ✅ |
| 3001 | Backend | **CPLP Backend** (outro projeto) | ✅ 171 restarts |
| 3002 | Backend | **HPO Backend** (nossa app) | ✅ ONLINE |
| 3306 | MySQL | Outro projeto | ✅ |
| 5432 | PostgreSQL | HPO Database | ✅ |
| 8081 | Python App | Outro projeto | ✅ |

**⚠️ IMPORTANTE:** Porta 3001 está ocupada por outro backend (CPLP) - **NÃO MEXER!**

---

## 📦 DEPLOY ANTERIOR (17/Out/2025)

### Estrutura Criada

```
/var/www/html/hpo-platform/
├── backend/                    # Backend Node.js
│   ├── dist/                  # Código compilado
│   ├── src/                   # Código fonte
│   ├── prisma/                # Schema + migrations
│   ├── logs/                  # PM2 logs
│   ├── .env                   # Variáveis de produção
│   ├── package.json
│   └── ecosystem.config.js    # PM2 config
│
├── frontend/                   # Código fonte React (NÃO usado)
│   └── (arquivos de desenvolvimento)
│
├── public/                     # BUILD do frontend (servido pelo Apache)
│   ├── index.html
│   ├── assets/
│   └── (arquivos estáticos)
│
├── backend_backup_2025-10-17_*   # Backup automático
└── frontend_backup_2025-10-17_*  # Backup automático
```

### Configurações Ativas

**1. PM2 (Backend):**
```javascript
// /var/www/html/hpo-platform/backend/ecosystem.config.js
{
  name: 'hpo-backend',
  script: './dist/server.js',
  cwd: '/var/www/html/hpo-platform/backend',
  instances: 1,
  port: 3002,
  autorestart: true,
  max_memory_restart: '1G'
}
```

**2. Apache VirtualHost:**
```apache
# /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf
ServerName hpo.raras-cplp.org
DocumentRoot /var/www/html/hpo-platform/public
ProxyPass /api http://localhost:3002/api
ProxyPass /socket.io http://localhost:3002/socket.io
```

**3. PostgreSQL:**
```sql
Database: hpo_platform
User: hpo_user
Port: 5432
Termos HPO: 16.942 registros
```

---

## 🔄 ESTRUTURA DE DEPLOY PLANEJADA

### Nova Estrutura (Monorepo do GitHub)

```
/var/www/html/hpo-platform-new/     # NOVA instalação
├── hpo-platform-backend/           # Backend (nome original do repo)
│   ├── src/
│   ├── dist/
│   ├── prisma/
│   ├── .env.production             # Copiar do antigo + ajustes
│   └── ecosystem.config.js         # Ajustar cwd
│
├── plataforma-raras-cpl/           # Frontend (nome original do repo)
│   ├── src/
│   ├── dist/                       # Após build
│   └── .env.production             # Configurar API URL
│
├── docs-organized/                 # Documentação
├── scripts/                        # Scripts de deploy
├── assets/                         # Branding
└── docker-compose.*.yml            # NÃO usar (sem Docker)
```

### Fluxo de Substituição

```
PASSO 1: Exploração Consultiva (SEM MEXER)
├── ssh ubuntu@200.144.254.4
├── ls -la /var/www/html/
├── pm2 list
├── sudo apache2ctl -S
└── cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf

PASSO 2: Backup Completo
├── Backup database (pg_dump)
├── Backup /var/www/html/hpo-platform/
└── Backup Apache config

PASSO 3: Clonar Novo Repositório
├── cd /var/www/html/
├── git clone https://github.com/filipepaulista12/hpo-porti-platform.git hpo-platform-new
└── cd hpo-platform-new

PASSO 4: Configurar Backend
├── cd hpo-platform-backend
├── cp .env.example .env.production
├── nano .env.production (ajustar DATABASE_URL, PORT=3002, etc)
├── npm install --production
├── npm run build
└── npx prisma migrate deploy

PASSO 5: Configurar Frontend
├── cd ../plataforma-raras-cpl
├── cp .env.example .env.production
├── nano .env.production (VITE_API_URL=https://hpo.raras-cplp.org)
├── npm install
└── npm run build

PASSO 6: Parar Aplicação Antiga
├── pm2 stop hpo-backend
├── pm2 delete hpo-backend
└── (app antiga offline)

PASSO 7: Substituir Arquivos
├── sudo rm -rf /var/www/html/hpo-platform/public/*
├── sudo cp -r plataforma-raras-cpl/dist/* /var/www/html/hpo-platform/public/
├── mv /var/www/html/hpo-platform/backend /var/www/html/hpo-platform/backend-OLD
└── cp -r hpo-platform-backend /var/www/html/hpo-platform/backend

PASSO 8: Iniciar Nova Versão
├── cd /var/www/html/hpo-platform/backend
├── pm2 start ecosystem.config.js
├── pm2 save
└── sudo systemctl reload apache2

PASSO 9: Testes
├── curl http://localhost:3002/health
├── curl -I https://hpo.raras-cplp.org
└── Abrir no navegador e testar

PASSO 10: Rollback (se necessário)
├── pm2 stop hpo-backend
├── rm -rf /var/www/html/hpo-platform/backend
├── mv /var/www/html/hpo-platform/backend-OLD /var/www/html/hpo-platform/backend
├── Restaurar frontend do backup
├── pm2 start ecosystem.config.js
└── sudo systemctl reload apache2
```

---

## 🔍 COMANDOS CONSULTIVOS

### Comandos para Executar SEM MEXER em Nada

```bash
# ============================================
# CONEXÃO SSH
# ============================================
ssh ubuntu@200.144.254.4

# ============================================
# ESTRUTURA DE ARQUIVOS
# ============================================
# Listar pasta principal
ls -la /var/www/html/

# Verificar estrutura HPO atual
ls -la /var/www/html/hpo-platform/
tree -L 2 /var/www/html/hpo-platform/  # Se tiver tree instalado

# Ver backend
ls -la /var/www/html/hpo-platform/backend/
ls -la /var/www/html/hpo-platform/backend/dist/

# Ver frontend servido
ls -la /var/www/html/hpo-platform/public/

# ============================================
# PROCESSOS PM2
# ============================================
# Listar todos os processos
pm2 list

# Detalhes do processo HPO
pm2 info hpo-backend

# Ver logs (últimas 50 linhas)
pm2 logs hpo-backend --lines 50

# Monitoramento em tempo real
pm2 monit

# Status detalhado
pm2 status

# ============================================
# APACHE
# ============================================
# Listar VirtualHosts configurados
sudo apache2ctl -S

# Ver configuração do site HPO
cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf

# Status do Apache
sudo systemctl status apache2

# Ver logs (últimas 50 linhas)
sudo tail -50 /var/log/apache2/hpo-error.log
sudo tail -50 /var/log/apache2/hpo-access.log

# ============================================
# POSTGRESQL
# ============================================
# Status do PostgreSQL
sudo systemctl status postgresql

# Conectar no banco
psql -U hpo_user -d hpo_platform

# Dentro do psql:
\dt                          # Listar tabelas
SELECT COUNT(*) FROM "HpoTerm";  # Contar termos (esperado: 16.942)
SELECT COUNT(*) FROM "User";     # Contar usuários
\q                           # Sair

# ============================================
# RECURSOS DO SERVIDOR
# ============================================
# Uso de disco
df -h

# Uso de RAM
free -h

# Processos rodando
ps aux | grep node
ps aux | grep apache
ps aux | grep postgres

# Portas em uso
sudo netstat -tulpn | grep LISTEN

# ============================================
# VARIÁVEIS DE AMBIENTE (Backend)
# ============================================
# Ver .env (SEM mostrar senhas)
cat /var/www/html/hpo-platform/backend/.env | grep -v PASSWORD | grep -v SECRET

# ============================================
# VERSÃO DO SOFTWARE
# ============================================
node --version
npm --version
pm2 --version
apache2 -v
psql --version

# ============================================
# CERTIFICADO SSL
# ============================================
sudo certbot certificates

# ============================================
# TESTAR BACKEND (CONSULTIVO)
# ============================================
# Health check
curl http://localhost:3002/health

# Testar API
curl http://localhost:3002/api/terms/count

# ============================================
# TESTAR FRONTEND
# ============================================
# Via Apache (HTTPS)
curl -I https://hpo.raras-cplp.org

# Ver index.html servido
curl https://hpo.raras-cplp.org | head -20
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Antes de iniciar o deploy, confirmar:

### Recursos
- [ ] Disco tem espaço suficiente (min 2GB livres)
- [ ] RAM disponível (min 1GB)
- [ ] Porta 3002 disponível para backend
- [ ] PostgreSQL rodando

### Backups
- [ ] Backup do banco de dados criado
- [ ] Backup da pasta `/var/www/html/hpo-platform/` criado
- [ ] Backup da configuração Apache criado

### Configurações
- [ ] DNS `hpo.raras-cplp.org` aponta para 200.144.254.4
- [ ] Certificado SSL válido
- [ ] `.env.production` configurado corretamente

### Acesso
- [ ] SSH funciona (ubuntu@200.144.254.4)
- [ ] Sudo disponível
- [ ] PM2 acessível
- [ ] Apache acessível

### Validação da Aplicação Atual
- [ ] https://hpo.raras-cplp.org carrega
- [ ] Backend responde em `localhost:3002`
- [ ] PM2 mostra `hpo-backend` online
- [ ] Logs sem erros críticos

---

## ⚠️ PONTOS DE ATENÇÃO

### 🔴 NÃO MEXER

**Outros projetos no servidor:**
- ❌ Backend CPLP (porta 3001, PM2 ID: 0) - 171 restarts
- ❌ Site Filipe (`/var/www/html/filipe/`)
- ❌ MySQL (porta 3306)
- ❌ Python App (porta 8081)
- ❌ Configurações Apache de outros sites

### 🟡 MONITORAR

- Uso de disco (atualmente 75%)
- Backend CPLP com 171 restarts (instável?)
- Logs do Apache para verificar erros

### 🟢 PODE MEXER

- `/var/www/html/hpo-platform/` (nossa aplicação)
- PM2 processo `hpo-backend` (ID: 1)
- Database `hpo_platform`
- Configuração `/etc/apache2/sites-enabled/hpo.raras-cplp.org.conf`

---

## 🎯 PRÓXIMOS PASSOS

### 1. Exploração Consultiva (AGORA)
```bash
# Conectar VPN
# SSH no servidor
ssh ubuntu@200.144.254.4

# Executar comandos consultivos (seção acima)
# Validar estado atual
# Identificar diferenças entre deploy antigo e novo código
```

### 2. Análise de Diferenças
```bash
# Ver versão atual do código
cd /var/www/html/hpo-platform/backend
git log --oneline -5  # Se for repositório git

# Comparar package.json
cat package.json

# Ver structure
ls -la src/
ls -la dist/
```

### 3. Plano de Deploy Detalhado
- Criar script de deploy automatizado
- Definir ordem de execução
- Estabelecer critérios de sucesso
- Preparar rollback

### 4. Execução do Deploy
- Backup completo
- Clone do novo repo
- Configuração
- Build
- Substituição
- Testes
- Validação

---

## 📚 Documentação de Referência

**Guias Criados:**
- `GUIA_DEPLOY_APACHE_PM2.md` - Deploy passo a passo (976 linhas)
- `ANALISE_SERVIDOR_COMPLETA.md` - Análise detalhada do servidor
- `DEPLOYMENT_COMPLETO_SUCESSO.md` - Deploy anterior (17/Out)
- `PACOTE_DEPLOY_COMPLETO.md` - Plano completo

**Arquivos de Configuração:**
- `ecosystem.config.js` - PM2 config
- `hpo.raras-cplp.org.conf` - Apache VirtualHost
- `.env.example` - Variáveis de ambiente

**Repositório:**
- https://github.com/filipepaulista12/hpo-porti-platform

---

**Status:** ✅ PRONTO PARA EXPLORAÇÃO CONSULTIVA

**Aguardando:** Conexão VPN + SSH para exploração
