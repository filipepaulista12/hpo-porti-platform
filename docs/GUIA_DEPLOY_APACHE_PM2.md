# 🚀 GUIA COMPLETO DE DEPLOY - HPO Translation Platform

**Servidor:** 200.144.254.4  
**Domínio:** raras-cplp.org (Hostinger)  
**Sem Docker no servidor** (usaremos PM2)  
**Backend porta:** 3002 (3001 já está ocupada)

---

## ⚠️ IMPORTANTE: Leia TUDO antes de começar!

Este guia é dividido em etapas independentes. **NÃO PULE ETAPAS!**

---

## 📋 ÍNDICE

1. [Configurar DNS na Hostinger](#1-configurar-dns-na-hostinger)
2. [Criar pasta HPO no servidor](#2-criar-pasta-hpo-no-servidor)
3. [Ajustar projeto LOCAL (porta 3002)](#3-ajustar-projeto-local)
4. [Upload código para servidor](#4-upload-código-para-servidor)
5. [Instalar PostgreSQL no servidor](#5-instalar-postgresql-no-servidor)
6. [Configurar backend no servidor](#6-configurar-backend-no-servidor)
7. [Configurar PM2](#7-configurar-pm2)
8. [Build frontend](#8-build-frontend)
9. [Configurar Apache Virtual Host](#9-configurar-apache-virtual-host)
10. [Configurar SSL (Certbot)](#10-configurar-ssl-certbot)
11. [Testes finais](#11-testes-finais)

---

## 1. CONFIGURAR DNS NA HOSTINGER

### **Passo 1.1: Acessar painel Hostinger**

1. Acesse: https://hpanel.hostinger.com/
2. Login com suas credenciais
3. Vá em **Domínios** → Selecione **raras-cplp.org**

### **Passo 1.2: Editar zona DNS**

Procure por **"Zona DNS"** ou **"DNS Zone"** ou **"Gerenciar DNS"**

### **Passo 1.3: Adicionar registro A para subdomínio**

Clique em **"Adicionar registro"** ou **"Add Record"**

**Configuração:**
```
Tipo: A
Nome: hpo
Valor/Aponta para: 200.144.254.4
TTL: 14400 (ou 3600, ou 300 - qualquer um funciona)
```

Clique em **Salvar** ou **Save**

### **Passo 1.4: Verificar propagação (aguardar 5-30 minutos)**

Abra terminal e teste:
```bash
nslookup hpo.raras-cplp.org
```

Deve retornar: `Address: 200.144.254.4`

**⚠️ AGUARDE DNS propagar antes de continuar!**

---

## 2. CRIAR PASTA HPO NO SERVIDOR

### **Passo 2.1: Conectar no servidor**

Abra **PuTTY** ou terminal SSH:
```bash
ssh ubuntu@200.144.254.4
# Senha: vFpyJS4FA
```

### **Passo 2.2: Criar estrutura de pastas**

```bash
# Criar pasta principal
sudo mkdir -p /var/www/html/hpo-platform

# Ajustar permissões
sudo chown -R ubuntu:www-data /var/www/html/hpo-platform
sudo chmod -R 755 /var/www/html/hpo-platform

# Verificar
ls -la /var/www/html/
```

Deve aparecer:
```
drwxr-xr-x  2 ubuntu www-data 4096 Oct 16 XX:XX hpo-platform
```

✅ **Pasta criada com sucesso!**

---

## 3. AJUSTAR PROJETO LOCAL

### **⚠️ MUDANÇAS NECESSÁRIAS ANTES DE SUBIR:**

#### **3.1. Backend - Trocar porta de 3001 para 3002**

**Arquivo:** `hpo-platform-backend/.env`

```bash
# ANTES (local)
PORT=3001

# DEPOIS (produção)
PORT=3002
```

**⚠️ NÃO altere ainda! Vamos criar .env separado para produção.**

---

#### **3.2. Criar .env de PRODUÇÃO**

**Criar arquivo:** `hpo-platform-backend/.env.production`

```bash
# Database (PostgreSQL no servidor - vamos instalar)
DATABASE_URL="postgresql://hpo_user:SENHA_FORTE_AQUI@localhost:5432/hpo_platform?schema=public"

# Redis (não vamos usar no servidor - simplificar)
REDIS_URL=""

# JWT
JWT_SECRET="gere-uma-senha-super-forte-aleatoria-aqui-min-32-caracteres-produção"
JWT_EXPIRES_IN="7d"

# Server
PORT=3002
NODE_ENV="production"

# CORS (URL DO FRONTEND EM PRODUÇÃO)
FRONTEND_URL="https://hpo.raras-cplp.org"

# ORCID OAuth - PRODUCTION (registrar depois)
ORCID_CLIENT_ID=""
ORCID_CLIENT_SECRET=""
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"
ORCID_SANDBOX=false

# OpenAI (desabilitado)
OPENAI_API_KEY=""
OPENAI_ENABLED=false

# Email SMTP (Gmail - mesma config)
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="cplp@raras.org.br"
SMTP_PASSWORD="xchq edyv fpvz tiwv"
EMAIL_FROM="CPLP Raras <cplp@raras.org.br>"
```

**⚠️ IMPORTANTE:** Gere uma senha JWT forte! Exemplo:
```bash
# No PowerShell, gere uma senha aleatória:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

#### **3.3. Frontend - .env de PRODUÇÃO**

**Criar arquivo:** `plataforma-raras-cpl/.env.production`

```bash
# URL da API em PRODUÇÃO
VITE_API_URL=https://hpo.raras-cplp.org
```

**⚠️ Nota:** O frontend vai fazer proxy via Apache, então API estará em `/api`

---

## 4. UPLOAD CÓDIGO PARA SERVIDOR

### **Opção A: Via Git (Recomendado)**

#### **4.1. Commit e push local**

```powershell
cd c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation

# Adicionar .env.production ao .gitignore (se não estiver)
# NÃO COMMITAR SENHAS!

git add .
git commit -m "Preparação para deploy produção"
git push origin main
```

#### **4.2. Clonar no servidor**

```bash
# No servidor (SSH)
cd /var/www/html/hpo-platform

# Clonar (substitua pela URL do seu repo)
git clone https://github.com/seu-usuario/hpo-translation.git .

# Ou se já tem repo:
git pull origin main
```

---

### **Opção B: Via SFTP (se não usar Git)**

Use **FileZilla** ou **WinSCP**:

**Configuração SFTP:**
```
Host: 200.144.254.4
Porta: 22
Protocolo: SFTP
Usuário: ubuntu
Senha: vFpyJS4FA
```

**Upload:**
- `hpo-platform-backend/` → `/var/www/html/hpo-platform/backend/`
- `plataforma-raras-cpl/` → `/var/www/html/hpo-platform/frontend/`

---

## 5. INSTALAR POSTGRESQL NO SERVIDOR

### **⚠️ ATENÇÃO: Vamos verificar espaço primeiro!**

#### **5.1. Verificar espaço disponível**

```bash
# No servidor
df -h /

# Deve ter pelo menos 1GB livre
# Você tem 3.9GB - suficiente!
```

#### **5.2. Instalar PostgreSQL**

```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL (versão 12 ou superior)
sudo apt install postgresql postgresql-contrib -y

# Verificar instalação
psql --version

# Verificar serviço rodando
sudo systemctl status postgresql
```

#### **5.3. Criar database e usuário HPO**

```bash
# Acessar PostgreSQL como superuser
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE hpo_platform;
CREATE USER hpo_user WITH ENCRYPTED PASSWORD 'SuaSenhaForteAqui123!';
GRANT ALL PRIVILEGES ON DATABASE hpo_platform TO hpo_user;
\q
```

**⚠️ Anote a senha escolhida!** Você vai usar no `.env.production`

#### **5.4. Testar conexão**

```bash
psql -h localhost -U hpo_user -d hpo_platform

# Digite a senha quando pedir
# Se conectar, está OK!
# Sair: \q
```

---

## 6. CONFIGURAR BACKEND NO SERVIDOR

### **6.1. Instalar dependências Node.js**

```bash
cd /var/www/html/hpo-platform/backend

# Instalar dependências
npm install --production

# Verificar versão Node
node --version
# Deve ser v18 ou superior
```

#### **Se Node.js for antigo, atualizar:**

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar terminal
source ~/.bashrc

# Instalar Node 20
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version  # Deve mostrar v20.x.x
```

---

### **6.2. Copiar .env de produção**

```bash
cd /var/www/html/hpo-platform/backend

# Copiar .env.production para .env
cp .env.production .env

# Editar com nano
nano .env
```

**Ajustar no .env:**
```bash
# Trocar SENHA_FORTE_AQUI pela senha do PostgreSQL que você criou
DATABASE_URL="postgresql://hpo_user:SuaSenhaForteAqui123!@localhost:5432/hpo_platform?schema=public"

# Trocar JWT_SECRET pela senha gerada
JWT_SECRET="sua-senha-jwt-aleatoria-32-caracteres"
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

---

### **6.3. Rodar migrations do Prisma**

```bash
cd /var/www/html/hpo-platform/backend

# Gerar client Prisma
npx prisma generate

# Rodar migrations
npx prisma migrate deploy

# Seed database (popular 17.020 termos HPO)
npm run seed

# Verificar
npx prisma studio
# Abrir http://seu-ip:5555 no navegador (temporário)
# Verificar se há 17.020 termos na tabela hpo_terms
# Fechar com Ctrl+C
```

**⏱️ Tempo estimado:** 5-10 minutos (importar 17.020 termos)

---

### **6.4. Build do backend**

```bash
cd /var/www/html/hpo-platform/backend

# Build TypeScript
npm run build

# Verificar pasta dist/
ls -la dist/

# Deve ter: server.js, routes/, services/, etc
```

---

## 7. CONFIGURAR PM2

### **7.1. Criar arquivo de configuração PM2**

```bash
cd /var/www/html/hpo-platform/backend

# Criar ecosystem.config.js
nano ecosystem.config.js
```

**Conteúdo:**
```javascript
module.exports = {
  apps: [{
    name: 'hpo-backend',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

---

### **7.2. Criar pasta de logs**

```bash
mkdir -p /var/www/html/hpo-platform/backend/logs
```

---

### **7.3. Iniciar com PM2**

```bash
cd /var/www/html/hpo-platform/backend

# Iniciar aplicação
pm2 start ecosystem.config.js

# Verificar status
pm2 list

# Deve aparecer:
# │ hpo-backend │ online │
```

---

### **7.4. Salvar configuração PM2**

```bash
# Salvar lista de processos
pm2 save

# Configurar autostart (reinicia após reboot)
pm2 startup

# PM2 vai mostrar um comando sudo para executar
# Copie e cole esse comando exatamente como mostrado
```

---

### **7.5. Testar backend funcionando**

```bash
# Verificar logs
pm2 logs hpo-backend --lines 50

# Testar endpoint
curl http://localhost:3002/health

# Deve retornar:
# {"status":"ok","timestamp":"...","uptime":...}
```

✅ **Backend funcionando na porta 3002!**

---

## 8. BUILD FRONTEND

### **8.1. Instalar dependências**

```bash
cd /var/www/html/hpo-platform/frontend

# Instalar dependências
npm install
```

---

### **8.2. Copiar .env de produção**

```bash
cd /var/www/html/hpo-platform/frontend

# Copiar .env.production para .env
cp .env.production .env

# Verificar
cat .env

# Deve ter:
# VITE_API_URL=https://hpo.raras-cplp.org
```

---

### **8.3. Build de produção**

```bash
cd /var/www/html/hpo-platform/frontend

# Build
npm run build

# Criar pasta pública
sudo mkdir -p /var/www/html/hpo-platform/public

# Copiar arquivos do build
sudo cp -r dist/* /var/www/html/hpo-platform/public/

# Ajustar permissões
sudo chown -R ubuntu:www-data /var/www/html/hpo-platform/public
sudo chmod -R 755 /var/www/html/hpo-platform/public

# Verificar
ls -la /var/www/html/hpo-platform/public/

# Deve ter: index.html, assets/, etc
```

✅ **Frontend build completo!**

---

## 9. CONFIGURAR APACHE VIRTUAL HOST

### **9.1. Habilitar módulos Apache necessários**

```bash
# Habilitar mod_rewrite, proxy, proxy_http
sudo a2enmod rewrite proxy proxy_http ssl headers

# Reiniciar Apache
sudo systemctl restart apache2

# Verificar status
sudo systemctl status apache2
```

---

### **9.2. Criar arquivo de configuração do site**

```bash
sudo nano /etc/apache2/sites-available/hpo.raras-cplp.org.conf
```

**Conteúdo completo:**
```apache
<VirtualHost *:80>
    ServerName hpo.raras-cplp.org
    ServerAlias www.hpo.raras-cplp.org
    ServerAdmin admin@raras-cplp.org
    
    DocumentRoot /var/www/html/hpo-platform/public
    
    <Directory /var/www/html/hpo-platform/public>
        Options -Indexes +FollowSymLinks -MultiViews
        AllowOverride All
        Require all granted
        
        # React Router (Single Page Application)
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api
        RewriteRule . /index.html [L]
    </Directory>
    
    # Proxy para API backend (porta 3002)
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3002/api
    ProxyPassReverse /api http://localhost:3002/api
    ProxyPass /socket.io http://localhost:3002/socket.io
    ProxyPassReverse /socket.io http://localhost:3002/socket.io
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3002/$1" [P,L]
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/hpo-error.log
    CustomLog ${APACHE_LOG_DIR}/hpo-access.log combined
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

---

### **9.3. Ativar o site**

```bash
# Ativar site
sudo a2ensite hpo.raras-cplp.org.conf

# Testar configuração Apache
sudo apache2ctl configtest

# Deve retornar: Syntax OK

# Recarregar Apache
sudo systemctl reload apache2
```

---

### **9.4. Testar site HTTP (sem SSL ainda)**

Abra navegador:
```
http://hpo.raras-cplp.org
```

Deve carregar o frontend! (Sem HTTPS ainda)

---

## 10. CONFIGURAR SSL (CERTBOT)

### **10.1. Instalar Certbot (se não estiver instalado)**

```bash
# Verificar se está instalado
certbot --version

# Se não estiver, instalar:
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

### **10.2. Obter certificado SSL**

```bash
# Gerar certificado
sudo certbot --apache -d hpo.raras-cplp.org -d www.hpo.raras-cplp.org

# Certbot vai perguntar:
# 1. Email: seu-email@dominio.com
# 2. Aceitar termos: Y
# 3. Compartilhar email: N (ou Y, tanto faz)
# 4. Redirect HTTP -> HTTPS: 2 (redirect)
```

**⏱️ Aguarde 30-60 segundos...**

**Resposta esperada:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/hpo.raras-cplp.org/fullchain.pem
Key is saved at: /etc/letsencrypt/live/hpo.raras-cplp.org/privkey.pem
```

✅ **SSL configurado!**

---

### **10.3. Testar auto-renovação**

```bash
# Testar renovação (dry-run - não renova de verdade)
sudo certbot renew --dry-run

# Deve retornar: Congratulations, all simulated renewals succeeded!
```

**✅ Auto-renovação funcionando!** (Certbot renova automaticamente a cada 60 dias)

---

### **10.4. Verificar Apache config atualizado**

```bash
# Ver configuração HTTPS gerada pelo Certbot
sudo cat /etc/apache2/sites-available/hpo.raras-cplp.org-le-ssl.conf

# Certbot criou arquivo -le-ssl.conf automaticamente
```

---

## 11. TESTES FINAIS

### **11.1. Testar HTTPS**

Abra navegador:
```
https://hpo.raras-cplp.org
```

**Verificar:**
- [x] ✅ Cadeado verde (SSL válido)
- [x] ✅ Site carrega
- [x] ✅ Sem erros no console (F12)

---

### **11.2. Testar API**

```bash
# No navegador ou terminal:
curl https://hpo.raras-cplp.org/api/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}
```

---

### **11.3. Testar funcionalidades**

**No navegador (https://hpo.raras-cplp.org):**

1. ✅ **Criar conta:**
   - Registrar novo usuário
   - Verificar email de boas-vindas chegou

2. ✅ **Fazer login:**
   - Login com email/senha
   - Ver dashboard

3. ✅ **Buscar termos HPO:**
   - Buscar "seizure"
   - Verificar resultados aparecem

4. ✅ **Adicionar tradução:**
   - Traduzir termo
   - Verificar XP ganho

5. ✅ **Leaderboard:**
   - Ver ranking
   - Verificar gamificação funciona

---

### **11.4. Verificar logs**

```bash
# Logs PM2 (backend)
pm2 logs hpo-backend --lines 100

# Logs Apache
sudo tail -f /var/log/apache2/hpo-error.log
sudo tail -f /var/log/apache2/hpo-access.log

# Verificar se há erros
```

---

### **11.5. Monitoramento**

```bash
# Status PM2
pm2 status

# Uso de recursos
pm2 monit

# Info detalhada do processo
pm2 info hpo-backend
```

---

## 🎉 DEPLOY COMPLETO!

### **✅ CHECKLIST FINAL:**

- [x] DNS configurado (hpo.raras-cplp.org)
- [x] Pasta criada no servidor
- [x] PostgreSQL instalado
- [x] Database populado (17.020 termos)
- [x] Backend rodando (PM2, porta 3002)
- [x] Frontend build completo
- [x] Apache Virtual Host configurado
- [x] SSL ativo (HTTPS)
- [x] Testes funcionais OK

---

## 🔧 COMANDOS ÚTEIS

### **PM2:**
```bash
pm2 list              # Ver todos os processos
pm2 logs hpo-backend  # Ver logs
pm2 restart hpo-backend  # Reiniciar
pm2 stop hpo-backend  # Parar
pm2 delete hpo-backend  # Remover
pm2 monit             # Monitor em tempo real
```

### **Apache:**
```bash
sudo systemctl status apache2   # Status
sudo systemctl restart apache2  # Reiniciar
sudo apache2ctl configtest     # Testar config
sudo tail -f /var/log/apache2/hpo-error.log  # Ver logs
```

### **PostgreSQL:**
```bash
sudo systemctl status postgresql  # Status
psql -U hpo_user -d hpo_platform  # Conectar
sudo -u postgres psql             # Superuser
```

### **Certbot:**
```bash
sudo certbot certificates         # Ver certificados
sudo certbot renew               # Renovar manualmente
sudo certbot renew --dry-run     # Testar renovação
```

---

## 🆘 TROUBLESHOOTING

### **Problema: Site não carrega**

```bash
# Verificar Apache
sudo systemctl status apache2

# Verificar logs
sudo tail -50 /var/log/apache2/hpo-error.log

# Testar config
sudo apache2ctl configtest
```

---

### **Problema: API não responde (502 Bad Gateway)**

```bash
# Verificar PM2
pm2 status

# Ver logs backend
pm2 logs hpo-backend

# Testar porta 3002 localmente
curl http://localhost:3002/health

# Se não responder, reiniciar:
pm2 restart hpo-backend
```

---

### **Problema: Database connection error**

```bash
# Verificar PostgreSQL rodando
sudo systemctl status postgresql

# Testar conexão
psql -U hpo_user -d hpo_platform

# Verificar .env tem senha correta
cd /var/www/html/hpo-platform/backend
cat .env | grep DATABASE_URL
```

---

### **Problema: Certificado SSL expirou**

```bash
# Renovar manualmente
sudo certbot renew

# Reiniciar Apache
sudo systemctl restart apache2
```

---

## 📝 NOTAS IMPORTANTES

### **1. Backups:**

```bash
# Backup database (executar semanalmente)
pg_dump -U hpo_user hpo_platform > /home/ubuntu/backup_hpo_$(date +%Y%m%d).sql

# Restaurar backup
psql -U hpo_user -d hpo_platform < /home/ubuntu/backup_hpo_20251016.sql
```

### **2. Updates:**

```bash
# Atualizar código
cd /var/www/html/hpo-platform
git pull origin main

# Rebuild backend
cd backend
npm install
npm run build
pm2 restart hpo-backend

# Rebuild frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* ../public/
```

### **3. Monitoramento:**

```bash
# Ver uso de recursos
top
htop
pm2 monit

# Espaço em disco
df -h

# Logs em tempo real
pm2 logs hpo-backend -f
```

---

## ✅ FIM DO GUIA

**Tempo estimado total:** 2-3 horas

**Se tiver dúvidas em qualquer etapa, PARE e me pergunte antes de continuar!**

---

**Criado em:** 16 de Outubro de 2025  
**Versão:** 1.0  
**Status:** Pronto para execução
