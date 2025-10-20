# 🚀 GUIA RÁPIDO - FILEZILLA UPLOAD

**Data**: 19 de Outubro de 2025  
**Status**: Pastas criadas no servidor ✅

---

## 📂 ESTRUTURA NO SERVIDOR (JÁ CRIADA)

```
/var/www/html/hpo-platform/
├── backend/     ✅ CRIADA (vazia)
├── frontend/    ✅ CRIADA (vazia)
└── logs/        ✅ CRIADA (vazia)
```

---

## 📤 O QUE ENVIAR VIA FILEZILLA

### **1️⃣ BACKEND** 

**Pasta LOCAL (Windows)**:  
`C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\`

**Destino SERVIDOR**:  
`/var/www/html/hpo-platform/backend/`

**Arquivos/Pastas a enviar**:

| Origem (Local) | Destino (Servidor) | Tipo |
|----------------|-------------------|------|
| `dist\` (pasta inteira) | `/var/www/html/hpo-platform/backend/dist/` | 📁 PASTA |
| `prisma\` (pasta inteira) | `/var/www/html/hpo-platform/backend/prisma/` | 📁 PASTA |
| `package.json` | `/var/www/html/hpo-platform/backend/package.json` | 📄 ARQUIVO |
| `package-lock.json` | `/var/www/html/hpo-platform/backend/package-lock.json` | 📄 ARQUIVO |
| `.env.production` | `/var/www/html/hpo-platform/backend/.env` | 📄 **RENOMEAR para .env** |

⚠️ **NÃO ENVIAR**:
- ❌ `node_modules/` (eu instalo no servidor)
- ❌ `src/` (não precisa, só o dist/ compilado)
- ❌ `.git/`
- ❌ `tests/`

---

### **2️⃣ FRONTEND**

**Pasta LOCAL (Windows)**:  
`C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\`

**Destino SERVIDOR**:  
`/var/www/html/hpo-platform/frontend/`

**Arquivos/Pastas a enviar**:

| Origem (Local) | Destino (Servidor) | Tipo |
|----------------|-------------------|------|
| `dist\` (pasta inteira com TUDO dentro) | `/var/www/html/hpo-platform/frontend/dist/` | 📁 PASTA |

⚠️ **ATENÇÃO**: Enviar SOMENTE a pasta `dist/` do frontend!

---

### **3️⃣ RAIZ (Configurações)**

**Pasta LOCAL (Windows)**:  
`C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\`

**Destino SERVIDOR**:  
`/var/www/html/hpo-platform/`

**Arquivos a enviar**:

| Origem (Local) | Destino (Servidor) | Tipo |
|----------------|-------------------|------|
| `ecosystem.config.js` | `/var/www/html/hpo-platform/ecosystem.config.js` | 📄 ARQUIVO |
| `hpo-translations-data\` (pasta inteira - OPCIONAL) | `/var/www/html/hpo-platform/hpo-translations-data/` | 📁 PASTA |

---

## ✅ CHECKLIST DE UPLOAD

Marque conforme for enviando:

### Backend:
- [ ] `hpo-platform-backend\dist\` → `/var/www/html/hpo-platform/backend/dist/`
- [ ] `hpo-platform-backend\prisma\` → `/var/www/html/hpo-platform/backend/prisma/`
- [ ] `hpo-platform-backend\package.json` → `/var/www/html/hpo-platform/backend/package.json`
- [ ] `hpo-platform-backend\package-lock.json` → `/var/www/html/hpo-platform/backend/package-lock.json`
- [ ] `hpo-platform-backend\.env.production` → `/var/www/html/hpo-platform/backend/.env` ⚠️ **RENOMEAR**

### Frontend:
- [ ] `plataforma-raras-cpl\dist\` → `/var/www/html/hpo-platform/frontend/dist/`

### Raiz:
- [ ] `ecosystem.config.js` → `/var/www/html/hpo-platform/ecosystem.config.js`
- [ ] `hpo-translations-data\` → `/var/www/html/hpo-platform/hpo-translations-data/` (opcional)

---

## 📐 ESTRUTURA FINAL ESPERADA NO SERVIDOR

Depois do upload, a estrutura deve ficar:

```
/var/www/html/hpo-platform/
├── backend/
│   ├── dist/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── package-lock.json
│   └── .env
├── frontend/
│   └── dist/
│       ├── index.html
│       ├── assets/
│       │   ├── index-[hash].js
│       │   ├── index-[hash].css
│       │   └── ...
│       └── ...
├── logs/
├── ecosystem.config.js
└── hpo-translations-data/ (opcional)
    ├── PT_hp.json
    ├── EN_hp.json
    └── ...
```

---

## 🎯 RESUMO SIMPLES

**3 COISAS PRINCIPAIS**:

1. **Backend**: Enviar `dist/`, `prisma/`, `package*.json`, `.env.production` (renomear)
2. **Frontend**: Enviar só a pasta `dist/`
3. **Raiz**: Enviar `ecosystem.config.js`

**Tempo estimado**: 5-10 minutos

---

## ⚠️ IMPORTANTE - RENOMEAR ARQUIVO

No FileZilla, quando enviar `.env.production`:
1. Enviar para `/var/www/html/hpo-platform/backend/`
2. **Clicar com botão direito** no arquivo `.env.production` no servidor
3. Selecionar **"Renomear"**
4. Trocar para `.env`

OU

Você pode renomear localmente ANTES de enviar:
1. Copiar `.env.production` → `.env` na pasta local
2. Enviar o arquivo `.env` direto

---

## 🚀 DEPOIS DO UPLOAD

Quando terminar, **ME AVISAR** que eu vou:
1. Instalar `node_modules` no backend
2. Rodar migrations Prisma
3. Copiar frontend para `public/`
4. Configurar permissões
5. Iniciar PM2
6. Testar tudo

---

## 🔗 CONEXÃO FILEZILLA

```
Host: sftp://200.144.254.4
Porta: 22
Usuário: ubuntu
Senha: vFpyJS4FA
```

**Boa sorte!** 🎉
