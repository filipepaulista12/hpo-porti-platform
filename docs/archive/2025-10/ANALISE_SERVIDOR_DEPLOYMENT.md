# 📊 ANÁLISE COMPLETA DO SERVIDOR - HPO PLATFORM

**Data da Análise:** 17 de Outubro de 2025  
**Servidor:** 200.144.254.4  
**Diretório do Projeto:** `/var/www/html/hpo-platform/`

---

## 🗂️ ESTRUTURA ATUAL NO SERVIDOR

```
/var/www/html/
├── filipe/              ❌ NÃO MEXER (Site CPLP)
├── cadsus/              ❌ NÃO MEXER (Outra app)
├── cplp-raras-backend/  ❌ NÃO MEXER (Outra app - PM2 id:0 - 6 dias uptime)
├── integrador-tb-plan/  ❌ NÃO MEXER (Outra app)
├── raras-api/           ❌ NÃO MEXER (Outra app)
└── hpo-platform/        ✅ NOSSO PROJETO
    ├── backend/         (última atualização: 16 Out 12:18)
    ├── frontend/        (última atualização: 16 Out 11:09)
    ├── hpo-translations-data/
    ├── logs/
    └── public/
```

---

## 🔧 BACKEND - ESTADO ATUAL NO SERVIDOR

### **Localização:** `/var/www/html/hpo-platform/backend/`

### **PM2 Status:**
- ✅ **Rodando:** PM2 id: 1 (hpo-backend)
- ✅ **Uptime:** 30 horas
- ✅ **Restarts:** 9 vezes
- ✅ **Memória:** 115.9 MB
- ✅ **Status:** Online

### **Configuração Atual (.env):**
```env
NODE_ENV=production
PORT=3002
DATABASE_URL="postgresql://hpo_user:HpoSecure2024!@localhost:5432/hpo_platform"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
FRONTEND_URL="https://hpo.raras-cplp.org"
```

### **Última Modificação:**
- `server.ts`: 16 Out 2025, 10:36:45

### **Arquivos Presentes:**
- ✅ `package.json`, `package-lock.json`
- ✅ `node_modules/` (instalado)
- ✅ `dist/` (código compilado)
- ✅ `prisma/` (schema + migrations)
- ✅ `src/` (código fonte TypeScript)
- ✅ `.env` (production)
- ✅ `ecosystem.config.js` (PM2)
- ✅ Scripts de teste e utilitários

### **Git Status:**
- ⚠️ **NÃO é repositório Git** (foi feito deploy de arquivos diretos)

---

## 🎨 FRONTEND - ESTADO ATUAL NO SERVIDOR

### **Localização:** `/var/www/html/hpo-platform/frontend/`

### **Build:**
- ✅ `dist/` existe (build compilado)
- ✅ `node_modules/` instalado

### **Última Modificação:**
- `ProductionHPOApp.tsx`: 16 Out 2025, 10:40:18

### **Configuração (.env.production):**
```env
VITE_API_URL=https://hpo.raras-cplp.org/api
```

### **Arquivos Presentes:**
- ✅ `package.json`, `package-lock.json`
- ✅ `src/` (código fonte React)
- ✅ `dist/` (build de produção)
- ✅ `nginx.conf` (configuração Nginx)
- ✅ `Dockerfile.prod`
- ✅ Arquivos de configuração (vite, tailwind, etc)

### **Git Status:**
- ⚠️ **NÃO é repositório Git** (foi feito deploy de arquivos diretos)

---

## 📅 COMPARAÇÃO: SERVIDOR vs LOCAL

### **Data do Deploy no Servidor:**
- Backend: **16 Outubro 2025, 10:36**
- Frontend: **16 Outubro 2025, 10:40**

### **Últimos Commits Locais:**
- Frontend: **17 Outubro 2025** (commit `c23e55a` - 5 commits novos)
- Backend: **17 Outubro 2025** (commit `dc5f1c3a` - 4 commits novos)

### **⚠️ SERVIDOR ESTÁ DESATUALIZADO!**

**O que está NO LOCAL mas NÃO ESTÁ no servidor:**

#### **Frontend (5 commits):**
1. ✅ Tour interativo (`InteractiveTour.tsx`)
2. ✅ Sistema de permissões (`UnauthorizedAccess.tsx`)
3. ✅ Utilitários de roles (`RoleHelpers.ts`)
4. ✅ Tradutor de erros (`ErrorTranslator.ts`)
5. ✅ Cache busting (headers HTTP + hashes)
6. ✅ Configs de produção atualizadas
7. ✅ 85+ novos testes

#### **Backend (4 commits):**
1. ✅ Scripts utilitários (`check-terms.js`, `create-test-users.ts`)
2. ✅ Suite de testes completa (69 testes)
3. ✅ Rotas atualizadas (auth, user, translation, etc)
4. ✅ Schema do Prisma atualizado
5. ✅ Build compilado atualizado

---

## 🎯 PLANO DE DEPLOYMENT SEGURO

### **FASE 1: BACKUP COMPLETO** 🔒
```bash
# No servidor, criar backup com timestamp
cd /var/www/html/hpo-platform/
cp -r backend backend_backup_2025-10-17_antes_update
cp -r frontend frontend_backup_2025-10-17_antes_update
```

### **FASE 2: BACKEND UPDATE** 🔧

#### **Opção A: Via Git (RECOMENDADO)**
```bash
# Transformar em repositório e puxar do GitHub
cd /var/www/html/hpo-platform/backend/
git init
git remote add origin https://github.com/filipepaulista12/hpo-translator-cplp-backend.git
git fetch origin main
git reset --hard origin/main
```

#### **Opção B: Via FileZilla (MAIS SEGURO para você)**
**Arquivos GRANDES (você faz via FileZilla):**
- `node_modules/` - **NÃO ENVIAR** (rodar `npm install` no servidor)
- `dist/` - **NÃO ENVIAR** (rodar `npm run build` no servidor)

**Arquivos PEQUENOS (eu faço via SSH):**
- `.env` - ATUALIZAR com novos campos (se houver)
- `package.json` - ATUALIZAR
- `src/**/*` - ATUALIZAR todos os arquivos fonte

#### **Comandos pós-upload:**
```bash
cd /var/www/html/hpo-platform/backend/
npm install
npm run build
pm2 restart hpo-backend
pm2 logs hpo-backend --lines 50
```

### **FASE 3: FRONTEND UPDATE** 🎨

#### **Via FileZilla (você faz):**
**Arquivos a enviar:**
- `src/` - TODOS os arquivos (incluindo novos componentes)
- `index.html` - ATUALIZAR (cache busting)
- `vite.config.ts` - ATUALIZAR (hashes)
- `package.json` - ATUALIZAR

**NÃO enviar:**
- `node_modules/` - será instalado no servidor
- `dist/` - será gerado no servidor

#### **Comandos pós-upload:**
```bash
cd /var/www/html/hpo-platform/frontend/
npm install
npm run build
# Reiniciar Nginx (se necessário)
sudo systemctl reload nginx
```

### **FASE 4: TESTES** ✅
1. ✅ Acessar https://hpo.raras-cplp.org
2. ✅ Testar login
3. ✅ Testar tour interativo
4. ✅ Testar permissões
5. ✅ Verificar traduções de erro
6. ✅ Verificar cache (Ctrl+Shift+R)

### **FASE 5: ROLLBACK (se necessário)** ⏪
```bash
cd /var/www/html/hpo-platform/
rm -rf backend frontend
mv backend_backup_2025-10-17_antes_update backend
mv frontend_backup_2025-10-17_antes_update frontend
pm2 restart hpo-backend
sudo systemctl reload nginx
```

---

## 📦 ARQUIVOS PARA ENVIAR VIA FILEZILLA

### **BACKEND:**
```
hpo-platform-backend/
├── src/                    ✅ ENVIAR COMPLETO
├── prisma/                 ✅ ENVIAR COMPLETO
├── scripts/                ✅ ENVIAR (novos scripts)
├── package.json            ✅ ENVIAR
├── package-lock.json       ✅ ENVIAR
├── jest.config.js          ✅ ENVIAR (atualizado)
├── tsconfig.json           ✅ ENVIAR
└── .env                    ⚠️ ATUALIZAR (merge com existente)
```

### **FRONTEND:**
```
plataforma-raras-cpl/
├── src/                    ✅ ENVIAR COMPLETO
├── index.html              ✅ ENVIAR (cache busting)
├── vite.config.ts          ✅ ENVIAR (hashes)
├── package.json            ✅ ENVIAR
├── package-lock.json       ✅ ENVIAR
├── nginx.conf              ✅ ENVIAR (atualizado)
├── Dockerfile.prod         ✅ ENVIAR
└── .env.production         ⚠️ VERIFICAR (já existe)
```

---

## ⚠️ ARQUIVOS CRÍTICOS - CUIDADO ESPECIAL

### **Backend `.env`:**
**MANTER do servidor:**
- `DATABASE_URL` (já configurado)
- `JWT_SECRET` (já configurado)
- `PORT=3002` (já configurado)

**ADICIONAR/ATUALIZAR se houver novos:**
- Variáveis ORCID (se mudaram)
- Variáveis SMTP (se mudaram)

### **PM2 Ecosystem:**
- Verificar se `ecosystem.config.js` precisa atualizar

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

**1. BACKUP** (eu faço via SSH)
**2. BACKEND - Upload de arquivos** (você faz via FileZilla)
**3. BACKEND - Install + Build** (eu faço via SSH)
**4. BACKEND - Restart PM2** (eu faço via SSH)
**5. BACKEND - Testar API** (eu faço via SSH - curl)
**6. FRONTEND - Upload de arquivos** (você faz via FileZilla)
**7. FRONTEND - Install + Build** (eu faço via SSH)
**8. FRONTEND - Reload Nginx** (eu faço via SSH)
**9. TESTES FINAIS** (você testa no navegador)

---

## 📞 PRÓXIMOS PASSOS

**PRONTO PARA COMEÇAR?**

1. ✅ Análise concluída
2. ✅ Plano de deployment criado
3. ⏳ Aguardando confirmação para executar

**Quer que eu:**
- [ ] Faça o backup agora?
- [ ] Prepare uma lista exata de arquivos para você enviar?
- [ ] Execute o deployment passo-a-passo com você?
