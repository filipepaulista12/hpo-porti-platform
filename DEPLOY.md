# 🚀 GUIA DE DEPLOY - HPO Translation Platform

## 📦 O QUE FOI MIGRADO

### ✅ FEATURES IMPLEMENTADAS (10 fases completas)
1. **16.942 Termos HPO** importados do arquivo Babelon holandês
2. **WebSocket Real-time** - Notificações instantâneas
3. **Email Service** - 6 templates HTML profissionais
4. **InfiniteTermsList** - Scroll infinito com dark mode
5. **Sistema de Gamificação** - Pontos, badges, níveis
6. **Sistema de Moderação** - Strikes, warnings, banimento
7. **UI Components** - CommentsSection, Onboarding, UX utilities
8. **Validação de Traduções** - Sistema multi-nível
9. **Dashboard Admin** - Estatísticas e auditoria

### ⚠️ FEATURES PENDENTES (Ver TODO_FEATURES_PENDENTES.md)
- **Analytics Routes** - Dashboard avançado, sync GitHub
- **Comment Routes** - Sistema de comentários
- **Conflict Routes** - Sistema de votação do comitê

---

## 🔧 REQUISITOS DO SERVIDOR

### Mínimos Recomendados
- **OS:** Ubuntu 20.04+ / Debian 11+ / Windows Server 2019+
- **RAM:** 2GB (4GB recomendado)
- **CPU:** 2 cores (4 recomendado)
- **Disco:** 20GB SSD
- **Node.js:** v18.x ou v20.x
- **PostgreSQL:** 14.x ou superior
- **Ports:** 3001 (backend), 5173 ou 80/443 (frontend)

### Software Necessário
```bash
# Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 14
sudo apt install postgresql postgresql-contrib

# PM2 (process manager)
npm install -g pm2

# Nginx (reverse proxy)
sudo apt install nginx

# Certbot (SSL)
sudo apt install certbot python3-certbot-nginx
```

---

## 📝 VARIÁVEIS DE AMBIENTE

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/hpo_platform?schema=public"

# JWT
JWT_SECRET="sua_chave_super_secreta_aqui_min_32_caracteres"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://seu-dominio.com"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua_senha_app_gmail"
EMAIL_FROM="noreply@seu-dominio.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="https://seu-dominio.com"
```

### Frontend (.env)
```env
VITE_API_URL="https://api.seu-dominio.com"
VITE_WS_URL="wss://api.seu-dominio.com"
```

---

## 🚀 DEPLOY BACKEND (UBUNTU)

### 1. Clonar Repositório
```bash
cd /var/www
git clone <seu-repo-url> hpo-platform
cd hpo-platform/hpo-platform-backend
```

### 2. Instalar Dependências
```bash
npm install --production
```

### 3. Configurar Database
```bash
# Criar usuário PostgreSQL
sudo -u postgres createuser hpo_user -P

# Criar database
sudo -u postgres createdb hpo_platform -O hpo_user

# Copiar .env e editar
cp .env.example .env
nano .env  # Editar DATABASE_URL e outras vars
```

### 4. Rodar Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Importar Termos HPO
```bash
npm run prisma:import-all
# Aguardar até ver: "✅ Total importado: 16942 termos"
```

### 6. Configurar PM2
```bash
# Criar ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hpo-backend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hpo-platform/hpo-platform-backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
}
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Seguir instruções
```

### 7. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/hpo-backend
```

```nginx
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/hpo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL com Let's Encrypt
sudo certbot --nginx -d api.seu-dominio.com
```

---

## 🎨 DEPLOY FRONTEND (UBUNTU)

### 1. Build Frontend
```bash
cd /var/www/hpo-platform/plataforma-raras-cpl

# Instalar dependências
npm install

# Build
npm run build
# Output: dist/
```

### 2. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/hpo-frontend
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/hpo-platform/plataforma-raras-cpl/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/hpo-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL com Let's Encrypt
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### 1. Testar Backend
```bash
curl http://localhost:3001/health
# Esperado: {"status":"ok","timestamp":"...","uptime":123,"environment":"production"}

# Testar termos
curl http://localhost:3001/api/terms?page=1&limit=10
```

### 2. Testar Frontend
```bash
# Abrir navegador
https://seu-dominio.com

# Console DevTools deve mostrar:
# "🟢 WebSocket Conectado"
```

### 3. Logs
```bash
# Backend
pm2 logs hpo-backend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Atualizar Código
```bash
cd /var/www/hpo-platform
git pull origin main

# Backend
cd hpo-platform-backend
npm install
npx prisma migrate deploy
pm2 restart hpo-backend

# Frontend
cd ../plataforma-raras-cpl
npm install
npm run build
```

### Backup Database
```bash
# Criar backup
pg_dump hpo_platform -U hpo_user > backup_$(date +%Y%m%d).sql

# Restaurar
psql hpo_platform -U hpo_user < backup_20251015.sql
```

---

## 📊 MONITORAMENTO

### PM2 Monitor
```bash
pm2 monit
pm2 status
pm2 logs --lines 100
```

### Database
```bash
# Conectar
psql -U hpo_user -d hpo_platform

# Verificar termos
SELECT COUNT(*) FROM "HpoTerm";
# Esperado: 16942

# Verificar usuários
SELECT COUNT(*) FROM "User";
```

---

## 🐛 TROUBLESHOOTING

### Backend não inicia
```bash
# Verificar logs
pm2 logs hpo-backend --err

# Verificar porta
sudo lsof -i :3001

# Testar migrations
cd /var/www/hpo-platform/hpo-platform-backend
npx prisma migrate status
```

### WebSocket não conecta
- Verificar CORS no backend (.env: FRONTEND_URL)
- Verificar Nginx proxy_pass para /socket.io/
- Testar: `wscat -c ws://localhost:3001/socket.io/`

### Frontend 404
```bash
# Verificar build
ls -la /var/www/hpo-platform/plataforma-raras-cpl/dist/

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 📞 SUPORTE

### Logs Importantes
- Backend: `/var/www/hpo-platform/hpo-platform-backend/logs/`
- PM2: `~/.pm2/logs/`
- Nginx: `/var/log/nginx/`

### Comandos Úteis
```bash
# Reiniciar tudo
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Ver recursos
htop
df -h
free -m
```

---

## ✅ CHECKLIST PRÉ-PRODUÇÃO

- [ ] DATABASE_URL configurado corretamente
- [ ] JWT_SECRET gerado (32+ caracteres aleatórios)
- [ ] SMTP configurado e testado
- [ ] SSL certificados instalados
- [ ] 16.942 termos HPO importados
- [ ] Backup database configurado (cron daily)
- [ ] PM2 startup configurado
- [ ] Firewall configurado (ufw allow 80,443)
- [ ] Logs rotacionados (logrotate)
- [ ] Monitoramento configurado (pm2-logrotate)

---

**Status:** ✅ Pronto para deploy após finalizar limpeza do monorepo/
**Última atualização:** 15 de outubro de 2025
