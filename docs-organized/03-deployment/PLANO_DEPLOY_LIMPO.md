# 🚀 PLANO DE DEPLOY LIMPO - PORTI-HPO

**Data**: 19 de Outubro de 2025  
**Situação**: Frontend funciona, backend atual NÃO funciona  
**Estratégia**: Limpar servidor e subir versão nova via FileZilla

---

## 📦 FASE 1: O QUE VOCÊ DEVE SUBIR VIA FILEZILLA

### **1.1 Backend (hpo-platform-backend/)**

**Pasta local**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\`

**O que enviar**:
```
hpo-platform-backend/
├── dist/                    ← BUILD compilado (pasta inteira)
├── prisma/                  ← Schema + migrations
├── node_modules/            ← Dependências (ou instalar no servidor)
├── package.json
├── package-lock.json
├── .env.production          ← CRIAR este arquivo antes de enviar
└── ecosystem.config.js      ← Configuração PM2
```

**Destino no servidor**: `/var/www/html/hpo-platform/backend/`

**⚠️ ANTES de enviar, você precisa**:

1. **Build do backend** (se ainda não foi feito):
   ```powershell
   cd hpo-platform-backend
   npm run build
   ```
   Isso cria a pasta `dist/` com código compilado

2. **Criar `.env.production`** na pasta `hpo-platform-backend/`:
   ```env
   # Database
   DATABASE_URL="postgresql://hpo_user:SUA_SENHA@localhost:5432/hpo_platform"
   
   # Server
   NODE_ENV=production
   PORT=3002
   JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
   
   # Frontend URL
   FRONTEND_URL=https://hpo.raras-cplp.org
   
   # OAuth (use as mesmas credenciais que funcionam local)
   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"
   ORCID_CLIENT_ID="seu-orcid-client-id"
   ORCID_CLIENT_SECRET="seu-orcid-client-secret"
   LINKEDIN_CLIENT_ID="seu-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="seu-linkedin-client-secret"
   
   # Email SMTP (Gmail configurado anteriormente)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=cplp@raras.org.br
   SMTP_PASS="sua-senha-app-gmail"
   EMAIL_FROM="PORTI-HPO <cplp@raras.org.br>"
   ```

3. **Decidir sobre node_modules**:
   - **Opção A** (mais rápido mas pesado): Enviar node_modules/ inteiro via FileZilla
   - **Opção B** (recomendado): NÃO enviar node_modules, eu instalo no servidor depois com `npm ci --production`

---

### **1.2 Frontend (plataforma-raras-cpl/)**

**Pasta local**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\`

**O que enviar**:
```
plataforma-raras-cpl/
├── dist/                    ← BUILD compilado (pasta inteira)
└── .env.production          ← CRIAR este arquivo antes de enviar
```

**Destino no servidor**: `/var/www/html/hpo-platform/frontend/`

**⚠️ ANTES de enviar, você precisa**:

1. **Criar `.env.production`** na pasta `plataforma-raras-cpl/`:
   ```env
   VITE_API_URL=https://hpo.raras-cplp.org/api
   VITE_APP_NAME=PORTI-HPO
   VITE_ENVIRONMENT=production
   ```

2. **Build do frontend**:
   ```powershell
   cd plataforma-raras-cpl
   npm run build
   ```
   Isso cria a pasta `dist/` com HTML/CSS/JS otimizados

3. **Enviar apenas a pasta `dist/`** (não precisa de node_modules, package.json, etc.)

---

### **1.3 Dados HPO (hpo-translations-data/)**

**Se ainda não está no servidor**, enviar:
```
hpo-translations-data/
├── PT_hp.json
├── EN_hp.json
└── (outros arquivos .json)
```

**Destino no servidor**: `/var/www/html/hpo-platform/hpo-translations-data/`

---

### **1.4 Configuração PM2 (ecosystem.config.js)**

**Arquivo**: `ecosystem.config.js` (na raiz do projeto)

**Enviar para**: `/var/www/html/hpo-platform/ecosystem.config.js`

**Conteúdo atualizado**:
```javascript
module.exports = {
  apps: [
    {
      name: 'hpo-backend',
      script: './backend/dist/server.js',
      cwd: '/var/www/html/hpo-platform',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/hpo-backend-error.log',
      out_file: './logs/hpo-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M'
    }
  ]
};
```

---

## 🗂️ FASE 2: COMANDOS NO SERVIDOR (EU FAÇO VIA SSH)

Depois que você enviar os arquivos, EU vou executar:

### **2.1 Organizar pastas antigas**
```bash
ssh ubuntu@200.144.254.4

cd /var/www/html/hpo-platform

# Criar pasta OLD
mkdir -p OLD

# Mover tudo que está bugado
mv backend_backup_2025-10-17_ OLD/
mv backend_OLD_DELETE OLD/
mv frontend_backup_2025-10-17_ OLD/
mv frontend_NEW OLD/
mv frontend_OLD_DELETE OLD/

# Verificar estrutura limpa
ls -la
# Deve mostrar: backend/, frontend/, hpo-translations-data/, ecosystem.config.js, logs/, public/
```

### **2.2 Instalar dependências do backend**
```bash
cd /var/www/html/hpo-platform/backend
npm ci --production
```

### **2.3 Rodar migrations do Prisma**
```bash
npx prisma migrate deploy
npx prisma generate
```

### **2.4 Copiar frontend para public/**
```bash
cd /var/www/html/hpo-platform
rm -rf public/*
cp -r frontend/dist/* public/
```

### **2.5 Configurar permissões**
```bash
sudo chown -R ubuntu:www-data /var/www/html/hpo-platform
sudo chmod -R 755 /var/www/html/hpo-platform
sudo chmod -R 775 /var/www/html/hpo-platform/logs
```

### **2.6 Reiniciar PM2**
```bash
cd /var/www/html/hpo-platform
pm2 stop hpo-backend
pm2 delete hpo-backend
pm2 start ecosystem.config.js
pm2 save
```

### **2.7 Verificar Apache**
```bash
sudo systemctl reload apache2
```

### **2.8 Testar**
```bash
# Backend health
curl http://localhost:3002/health

# Site
curl -I https://hpo.raras-cplp.org

# Logs
pm2 logs hpo-backend --lines 20
```

---

## ✅ CHECKLIST PARA VOCÊ

Antes de enviar via FileZilla:

- [ ] **Backend build completo**: `cd hpo-platform-backend && npm run build`
- [ ] **Frontend build completo**: `cd plataforma-raras-cpl && npm run build`
- [ ] **Criar `.env.production` no backend** (com credenciais OAuth, database, SMTP)
- [ ] **Criar `.env.production` no frontend** (com VITE_API_URL)
- [ ] **Verificar que pasta `dist/` existe** no backend (após build)
- [ ] **Verificar que pasta `dist/` existe** no frontend (após build)

**Pastas a enviar via FileZilla**:

1. `hpo-platform-backend/` → `/var/www/html/hpo-platform/backend/`
   - Incluir: dist/, prisma/, package*.json, .env.production, ecosystem.config.js
   - Opcionalmente: node_modules/ (se quiser economizar tempo)

2. `plataforma-raras-cpl/dist/` → `/var/www/html/hpo-platform/frontend/dist/`
   - Apenas a pasta dist/ compilada

3. `ecosystem.config.js` → `/var/www/html/hpo-platform/ecosystem.config.js`

---

## 🎯 RESUMO

**VOCÊ FAZ (FileZilla)**:
1. Build backend + frontend
2. Criar .env.production (backend + frontend)
3. Enviar arquivos para servidor

**EU FAÇO (SSH)**:
1. Mover pastas antigas para OLD/
2. Instalar node_modules no servidor
3. Rodar migrations Prisma
4. Copiar frontend para public/
5. Configurar permissões
6. Reiniciar PM2
7. Validar funcionamento

---

## ⚠️ IMPORTANTE

- **NÃO TOCAR** na pasta do outro projeto (cplp-backend no PM2 ID 0)
- **NÃO MEXER** no banco de dados PostgreSQL (já existe)
- **MANTER** Apache rodando (só reload, não restart)
- **BACKUP**: As pastas antigas vão para OLD/ (não deletar ainda)

---

## 📞 PRÓXIMOS PASSOS

1. **ME AVISE** quando tiver enviado os arquivos via FileZilla
2. **CONFIRME** se enviou node_modules/ ou se quer que eu instale no servidor
3. **ENVIE** as credenciais que preciso colocar no .env.production (se faltarem)

Aí eu executo a FASE 2 via SSH e validamos tudo! 🚀
