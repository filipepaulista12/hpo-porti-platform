# 📤 GUIA DE UPLOAD - FILEZILLA

**Data:** 17 de Outubro de 2025  
**Backup criado:** ✅ `backend_backup_2025-10-17_` e `frontend_backup_2025-10-17_`

---

## 🔐 CREDENCIAIS FILEZILLA

```
Protocolo: SFTP
Host: 200.144.254.4
Porta: 22
Usuário: ubuntu
Senha: vFpyJS4FA
```

---

## 📦 PASSO 1: UPLOAD DO BACKEND

### **Diretório REMOTO (servidor):**
```
/var/www/html/hpo-platform/backend/
```

### **Diretório LOCAL (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\
```

### **⚠️ ANTES DE ENVIAR - VERIFICAR `.env`**

**NO SERVIDOR já existe (.env atual):**
```env
NODE_ENV=production
PORT=3002
DATABASE_URL="postgresql://hpo_user:HpoSecure2024!@localhost:5432/hpo_platform"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
FRONTEND_URL="https://hpo.raras-cplp.org"
```

**⚠️ NÃO SOBRESCREVER O .env DO SERVIDOR!**  
(Se houver variáveis novas, eu adiciono via SSH depois)

---

### **📁 ARQUIVOS BACKEND A ENVIAR:**

#### ✅ **ENVIAR ESTES:**

```
hpo-platform-backend/
├── src/                           ✅ ENVIAR PASTA COMPLETA
│   ├── __tests__/                 (NOVO - 5 arquivos de teste)
│   ├── routes/                    (ATUALIZADO - 10 arquivos)
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── server.ts                  (ATUALIZADO)
│
├── prisma/                        ✅ ENVIAR PASTA COMPLETA
│   ├── schema.prisma              (ATUALIZADO)
│   ├── seed.ts                    (ATUALIZADO)
│   └── migrations/
│
├── scripts/                       ✅ ENVIAR PASTA COMPLETA
│   └── create-test-users.ts       (NOVO)
│
├── check-terms.js                 ✅ ENVIAR (NOVO)
├── jest.config.js                 ✅ ENVIAR (ATUALIZADO)
├── package.json                   ✅ ENVIAR (ATUALIZADO)
├── package-lock.json              ✅ ENVIAR (ATUALIZADO)
├── tsconfig.json                  ✅ ENVIAR
└── ecosystem.config.js            ✅ ENVIAR
```

#### ❌ **NÃO ENVIAR:**

```
❌ .env                    (já existe no servidor - não sobrescrever)
❌ node_modules/           (será instalado depois via SSH)
❌ dist/                   (será compilado depois via SSH)
❌ *.log                   (logs locais)
```

---

## 🎨 PASSO 2: UPLOAD DO FRONTEND

### **Diretório REMOTO (servidor):**
```
/var/www/html/hpo-platform/frontend/
```

### **Diretório LOCAL (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\
```

### **📁 ARQUIVOS FRONTEND A ENVIAR:**

#### ✅ **ENVIAR ESTES:**

```
plataforma-raras-cpl/
├── src/                           ✅ ENVIAR PASTA COMPLETA
│   ├── components/
│   │   ├── InteractiveTour.tsx    (NOVO)
│   │   └── UnauthorizedAccess.tsx (NOVO)
│   │
│   ├── utils/                     ✅ ENVIAR PASTA COMPLETA (NOVA)
│   │   ├── ErrorTranslator.ts     (NOVO)
│   │   └── RoleHelpers.ts         (NOVO)
│   │
│   ├── tests/                     ✅ ENVIAR PASTA COMPLETA
│   │   ├── RoleHelpers.test.ts    (NOVO)
│   │   └── UnauthorizedAccess.test.tsx (NOVO)
│   │
│   ├── services/                  (ATUALIZADO)
│   ├── pages/
│   └── ProductionHPOApp.tsx       (ATUALIZADO)
│
├── index.html                     ✅ ENVIAR (cache busting)
├── vite.config.ts                 ✅ ENVIAR (hashes)
├── package.json                   ✅ ENVIAR (ATUALIZADO)
├── package-lock.json              ✅ ENVIAR (ATUALIZADO)
├── nginx.conf                     ✅ ENVIAR (ATUALIZADO)
├── Dockerfile.prod                ✅ ENVIAR
├── clear-cache-dev.ps1            ✅ ENVIAR (NOVO)
└── .env.production                ⚠️ VERIFICAR (já existe)
```

#### ❌ **NÃO ENVIAR:**

```
❌ node_modules/           (será instalado depois via SSH)
❌ dist/                   (será compilado depois via SSH)
❌ .env                    (desenvolvimento local)
❌ *.log                   (logs locais)
```

---

## 🎯 PASSO A PASSO - COMO FAZER NO FILEZILLA

### **1. CONECTAR NO FILEZILLA:**
- Abra o FileZilla
- Host: `sftp://200.144.254.4`
- Usuário: `ubuntu`
- Senha: `vFpyJS4FA`
- Porta: `22`
- Clique em **"Conexão Rápida"**

### **2. NAVEGAR PARA O BACKEND:**
**Painel REMOTO (direita):**
- Navegue para: `/var/www/html/hpo-platform/backend/`

**Painel LOCAL (esquerda):**
- Navegue para: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\`

### **3. FAZER UPLOAD DO BACKEND:**

**MÉTODO A - Pasta Completa (exceto exclusões):**
1. Clique com botão direito na pasta `src` (esquerda)
2. Escolha **"Upload"**
3. Aguarde conclusão
4. Repita para: `prisma/`, `scripts/`
5. Envie arquivos individuais: `check-terms.js`, `jest.config.js`, `package.json`, `package-lock.json`

**MÉTODO B - Drag and Drop:**
1. Selecione as pastas/arquivos da lista acima (esquerda)
2. Arraste para o painel direito
3. **IMPORTANTE:** Quando perguntar sobre sobrescrever `.env`, escolha **"PULAR"**

### **4. NAVEGAR PARA O FRONTEND:**
**Painel REMOTO (direita):**
- Navegue para: `/var/www/html/hpo-platform/frontend/`

**Painel LOCAL (esquerda):**
- Navegue para: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\`

### **5. FAZER UPLOAD DO FRONTEND:**

Envie:
- Pasta `src/` completa
- Arquivos: `index.html`, `vite.config.ts`, `package.json`, `package-lock.json`, `nginx.conf`, `Dockerfile.prod`, `clear-cache-dev.ps1`

**⚠️ ATENÇÃO:** Se `.env.production` já existir, **PULE** (não sobrescrever)

---

## ✅ CHECKLIST DE UPLOAD

### **BACKEND:**
- [ ] Pasta `src/` enviada
- [ ] Pasta `prisma/` enviada
- [ ] Pasta `scripts/` enviada
- [ ] Arquivo `check-terms.js` enviado
- [ ] Arquivo `jest.config.js` enviado
- [ ] Arquivo `package.json` enviado
- [ ] Arquivo `package-lock.json` enviado
- [ ] **`.env` NÃO foi sobrescrito** ✅

### **FRONTEND:**
- [ ] Pasta `src/` enviada (incluindo `utils/` nova)
- [ ] Arquivo `index.html` enviado
- [ ] Arquivo `vite.config.ts` enviado
- [ ] Arquivo `package.json` enviado
- [ ] Arquivo `package-lock.json` enviado
- [ ] Arquivo `nginx.conf` enviado
- [ ] **`.env.production` NÃO foi sobrescrito** ✅

---

## 🚨 PROBLEMAS COMUNS

### **1. "Permissão negada"**
- ✅ Normal! Eu ajusto permissões depois via SSH

### **2. "Arquivo já existe"**
- ✅ Para `.env` → **PULAR/SKIP**
- ✅ Para outros → **SOBRESCREVER/OVERWRITE**

### **3. Upload muito lento**
- ✅ Normal com muitos arquivos pequenos
- ✅ Pode demorar 5-10 minutos

### **4. Conexão cai**
- ✅ Reconectar e retomar upload
- ✅ FileZilla continua de onde parou

---

## 📞 QUANDO TERMINAR

**Me avise com:** "✅ Upload concluído!"

**Daí EU faço via SSH:**
1. ✅ Ajustar permissões dos arquivos
2. ✅ `npm install` no backend
3. ✅ `npm run build` no backend
4. ✅ Restart do PM2
5. ✅ `npm install` no frontend
6. ✅ `npm run build` no frontend
7. ✅ Reload do Nginx
8. ✅ Testes finais

---

## 🔙 ROLLBACK (se algo der errado)

**EU FAÇO via SSH:**
```bash
cd /var/www/html/hpo-platform/
rm -rf backend frontend
mv backend_backup_2025-10-17_* backend
mv frontend_backup_2025-10-17_* frontend
pm2 restart hpo-backend
```

---

## 🎯 PRONTO PARA COMEÇAR?

1. ✅ Abra o FileZilla
2. ✅ Conecte com as credenciais acima
3. ✅ Siga o passo a passo
4. ✅ Me avise quando terminar!

**BOA SORTE! 🚀**
