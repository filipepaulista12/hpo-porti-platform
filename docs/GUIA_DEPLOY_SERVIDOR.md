# 🚀 GUIA RÁPIDO: Deploy no Servidor

**Data:** 16 de Outubro de 2025  
**Status:** 📖 GUIA DE REFERÊNCIA

---

## ⚠️ IMPORTANTE: Leia isto ANTES de fazer deploy!

Este guia é um resumo executivo do que você precisa fazer quando for colocar a aplicação no servidor. **Não faça agora!** Guarde este arquivo para consultar no dia do deploy.

---

## 📋 CHECKLIST PRÉ-DEPLOY

### ✅ **O que já está pronto (LOCAL):**
- [x] Backend funcionando
- [x] Frontend funcionando
- [x] Database populado (17.020 termos)
- [x] Email SMTP configurado e testado
- [x] URLs hardcoded corrigidos
- [x] Docker configurado
- [x] Testes passando
- [x] CI/CD configurado

### ⏳ **O que precisa fazer (NO SERVIDOR):**
- [ ] Configurar HTTPS/SSL
- [ ] Registrar ORCID Produção
- [ ] Criar .env de produção (backend)
- [ ] Criar .env de produção (frontend)
- [ ] Configurar domínio/DNS
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Testar tudo

---

## 🛠️ PASSO A PASSO COMPLETO

### **ETAPA 1: Preparar o Servidor** (30 min)

#### **1.1. Instalar Docker + Docker Compose**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin
```

#### **1.2. Instalar Nginx**
```bash
sudo apt update
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### **1.3. Configurar Firewall**
```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

---

### **ETAPA 2: Configurar Domínio** (15 min)

#### **2.1. DNS (no provedor do domínio)**
```
Tipo: A
Nome: @
Valor: [IP do servidor]
TTL: 300

Tipo: A
Nome: api
Valor: [IP do servidor]
TTL: 300
```

**Exemplo:**
- `seu-dominio.com` → Frontend
- `api.seu-dominio.com` → Backend

#### **2.2. Aguardar propagação DNS (5-30 min)**
```bash
# Testar se propagou
nslookup seu-dominio.com
nslookup api.seu-dominio.com
```

---

### **ETAPA 3: Configurar HTTPS** (30 min)

#### **Opção A: Let's Encrypt (Certbot)** - Gratuito ⭐

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado (frontend)
sudo certbot --nginx -d seu-dominio.com

# Gerar certificado (backend)
sudo certbot --nginx -d api.seu-dominio.com

# Auto-renovação (já vem configurada)
sudo certbot renew --dry-run
```

#### **Opção B: Cloudflare** - Mais fácil
1. Adicionar domínio no Cloudflare
2. Trocar nameservers no registro do domínio
3. Ativar SSL/TLS (Full Strict)
4. Pronto! Cloudflare gerencia SSL automaticamente

---

### **ETAPA 4: Deploy do Backend** (30 min)

#### **4.1. Clonar repositório no servidor**
```bash
cd /var/www
git clone https://github.com/seu-usuario/hpo-translation.git
cd hpo-translation/hpo-platform-backend
```

#### **4.2. Criar .env de produção**
```bash
nano .env
```

**Conteúdo do .env (PRODUÇÃO):**
```bash
# Database (Docker)
DATABASE_URL="postgresql://postgres:SUA_SENHA_FORTE_AQUI@localhost:5433/hpo_platform?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (TROCAR SECRET!)
JWT_SECRET="sua-chave-secreta-super-forte-aleatoria-aqui-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS (URL REAL do frontend)
FRONTEND_URL="https://seu-dominio.com"

# ORCID OAuth - PRODUCTION (não sandbox!)
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="https://api.seu-dominio.com/api/auth/orcid/callback"
ORCID_SANDBOX=false  # ← IMPORTANTE: false em produção!

# OpenAI (desabilitado)
OPENAI_API_KEY=""
OPENAI_ENABLED=false

# Email SMTP
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="cplp@raras.org.br"
SMTP_PASSWORD="xchq edyv fpvz tiwv"
EMAIL_FROM="CPLP Raras <cplp@raras.org.br>"
```

#### **4.3. Subir containers Docker**
```bash
# Usar docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d

# Verificar se subiu
docker ps
```

#### **4.4. Verificar logs**
```bash
docker logs hpo-backend -f
```

---

### **ETAPA 5: Registrar ORCID Produção** (15 min)

#### **5.1. Acessar ORCID Production**
https://orcid.org/developer-tools (NÃO sandbox!)

#### **5.2. Registrar aplicação**
- **Nome:** HPO Translation Platform - CPLP
- **Website:** `https://seu-dominio.com`
- **Redirect URIs:**
  ```
  https://api.seu-dominio.com/api/auth/orcid/callback
  https://seu-dominio.com/orcid-callback
  ```

#### **5.3. Copiar credenciais**
- Client ID: `APP-XXXXXXXXXXXXXXXX`
- Client Secret: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### **5.4. Atualizar .env no servidor**
```bash
nano /var/www/hpo-translation/hpo-platform-backend/.env
# Colar Client ID e Secret
# Salvar e sair (Ctrl+X, Y, Enter)

# Reiniciar backend
docker restart hpo-backend
```

---

### **ETAPA 6: Deploy do Frontend** (30 min)

#### **6.1. No servidor, criar .env de produção**
```bash
cd /var/www/hpo-translation/plataforma-raras-cpl
nano .env
```

**Conteúdo:**
```bash
# URL REAL da API (sem /api no final)
VITE_API_URL=https://api.seu-dominio.com
```

#### **6.2. Build de produção**
```bash
npm install
npm run build
# Gera pasta dist/
```

#### **6.3. Copiar build para Nginx**
```bash
sudo cp -r dist/* /var/www/html/hpo-frontend/
```

#### **6.4. Configurar Nginx**
```bash
sudo nano /etc/nginx/sites-available/hpo-frontend
```

**Conteúdo:**
```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    root /var/www/html/hpo-frontend;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 6;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

#### **6.5. Configurar Nginx (Backend)**
```bash
sudo nano /etc/nginx/sites-available/hpo-backend
```

**Conteúdo:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/api.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

#### **6.6. Ativar sites e reiniciar Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/hpo-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/hpo-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

---

### **ETAPA 7: Testes Finais** (30 min)

#### **7.1. Testar Frontend**
```
https://seu-dominio.com
- [ ] Site carrega?
- [ ] Design aparece corretamente?
- [ ] Console sem erros? (F12)
```

#### **7.2. Testar Backend API**
```bash
curl https://api.seu-dominio.com/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

#### **7.3. Testar Login**
```
- [ ] Criar conta nova
- [ ] Receber email de boas-vindas
- [ ] Fazer login
- [ ] Ver dashboard
```

#### **7.4. Testar ORCID**
```
- [ ] Clicar "Login com ORCID"
- [ ] Redireciona para orcid.org?
- [ ] Autoriza e volta pro site?
- [ ] Usuário criado com ORCID ID?
```

#### **7.5. Testar Tradução**
```
- [ ] Buscar termo HPO
- [ ] Adicionar tradução
- [ ] Validar tradução
- [ ] Verificar XP ganho
```

---

## 🔧 TROUBLESHOOTING

### **Problema: "Connection refused" no frontend**
```bash
# Verificar se backend está rodando
docker ps | grep hpo-backend

# Ver logs do backend
docker logs hpo-backend -f

# Verificar CORS no .env
# FRONTEND_URL deve ser https://seu-dominio.com
```

### **Problema: "SSL certificate error"**
```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Reiniciar Nginx
sudo systemctl restart nginx
```

### **Problema: "ORCID login não funciona"**
```bash
# Verificar redirect URI no ORCID
# Deve ser EXATAMENTE: https://api.seu-dominio.com/api/auth/orcid/callback

# Verificar .env
# ORCID_SANDBOX deve ser false
# ORCID_REDIRECT_URI deve ter https://
```

### **Problema: Database vazio**
```bash
# Entrar no container
docker exec -it hpo-postgres psql -U postgres -d hpo_platform

# Verificar termos
SELECT COUNT(*) FROM hpo_terms;
# Deve ter 17020

# Se estiver vazio, rodar seed
cd /var/www/hpo-translation/hpo-platform-backend
npm run seed
```

---

## 📊 TEMPO ESTIMADO TOTAL

| Etapa | Tempo |
|-------|-------|
| Preparar servidor | 30 min |
| Configurar domínio | 15 min |
| Configurar HTTPS | 30 min |
| Deploy backend | 30 min |
| Registrar ORCID | 15 min |
| Deploy frontend | 30 min |
| Testes | 30 min |
| **TOTAL** | **~3 horas** |

---

## ✅ CHECKLIST FINAL

Antes de considerar deploy completo:

### **Segurança:**
- [ ] HTTPS funcionando (cadeado verde)
- [ ] Certificados válidos
- [ ] JWT_SECRET trocado
- [ ] Database password forte
- [ ] Firewall configurado
- [ ] SSH com chave (não senha)

### **Funcionalidade:**
- [ ] Frontend carrega
- [ ] Backend responde
- [ ] Database conectado
- [ ] Email funciona
- [ ] ORCID funciona
- [ ] Traduções funcionam
- [ ] Gamificação funciona

### **Performance:**
- [ ] Gzip ativo
- [ ] Cache configurado
- [ ] Images otimizadas
- [ ] Build minificado

### **Monitoramento:**
- [ ] Logs configurados
- [ ] Backup automático database
- [ ] Alertas configurados

---

## 📝 NOTAS IMPORTANTES

### **Backups:**
```bash
# Backup manual database
docker exec hpo-postgres pg_dump -U postgres hpo_platform > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i hpo-postgres psql -U postgres hpo_platform < backup_20251016.sql
```

### **Updates:**
```bash
# Atualizar código
cd /var/www/hpo-translation
git pull

# Rebuild backend (se houve mudanças)
cd hpo-platform-backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Rebuild frontend
cd ../plataforma-raras-cpl
npm run build
sudo cp -r dist/* /var/www/html/hpo-frontend/
```

---

## 🆘 SUPORTE

Se algo der errado durante deploy, verifique:

1. **Logs do backend:** `docker logs hpo-backend -f`
2. **Logs do Nginx:** `sudo tail -f /var/log/nginx/error.log`
3. **Console do navegador:** F12 → Console tab
4. **Network tab:** F12 → Network tab (ver requisições falhando)

---

**Última atualização:** 16 de Outubro de 2025  
**Status:** 📖 Guia de referência para deploy futuro  
**Não executar agora!** Guardar para quando for colocar no servidor.
