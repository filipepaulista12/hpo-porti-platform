# 📁 CONFIGURAÇÃO FILEZILLA - Upload HPO

## 🔐 CREDENCIAIS SFTP

```
Host: 200.144.254.4
Porta: 22
Protocolo: SFTP - SSH File Transfer Protocol
Tipo de Logon: Normal
Usuário: ubuntu
Senha: vFpyJS4FA
```

---

## 📂 O QUE ENVIAR E PARA ONDE

### **1. BACKEND:**

**Pasta LOCAL (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\
```

**Destino NO SERVIDOR:**
```
/var/www/html/hpo-platform/backend/
```

**⚠️ IMPORTANTE:** Envie TUDO da pasta `hpo-platform-backend`, EXCETO:
- ❌ `node_modules/` (não enviar - vamos instalar no servidor)
- ❌ `dist/` (não enviar - vamos buildar no servidor)
- ❌ `.env` (não enviar - vamos criar específico)

**✅ ENVIAR:**
- ✅ `src/` (código fonte)
- ✅ `prisma/` (schemas e migrations)
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `.env.production` (renomear para `.env` depois)
- ✅ Todos os outros arquivos de config

---

### **2. FRONTEND:**

**Pasta LOCAL (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\
```

**Destino NO SERVIDOR:**
```
/var/www/html/hpo-platform/frontend/
```

**⚠️ IMPORTANTE:** Envie TUDO, EXCETO:
- ❌ `node_modules/` (não enviar)
- ❌ `dist/` (não enviar)
- ❌ `.next/` (não enviar)
- ❌ `.env` (não enviar - vamos criar específico)

**✅ ENVIAR:**
- ✅ `src/` (código fonte)
- ✅ `public/`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `vite.config.ts`
- ✅ `tsconfig.json`
- ✅ `.env.production` (renomear para `.env` depois)
- ✅ Todos os outros arquivos de config

---

## 🎯 PASSO A PASSO NO FILEZILLA

### **1. Abrir FileZilla**

### **2. Conectar:**

No topo do FileZilla, preencha:
```
Host: sftp://200.144.254.4
Usuário: ubuntu
Senha: vFpyJS4FA
Porta: 22
```

Clique em **"Conexão Rápida"** ou **"Quickconnect"**

---

### **3. Navegar no servidor (lado direito):**

```
/ (raiz)
└── var/
    └── www/
        └── html/
            └── hpo-platform/    ← Você vai ver essa pasta vazia
                ├── backend/     ← Criar se não existir
                └── frontend/    ← Criar se não existir
```

---

### **4. Upload BACKEND:**

**Lado ESQUERDO (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\
```

**Lado DIREITO (servidor):**
```
/var/www/html/hpo-platform/backend/
```

**Selecionar arquivos/pastas:**
- Selecione TUDO, EXCETO `node_modules`, `dist`, `.env`
- Arraste para o lado direito

**⏱️ Aguarde upload... (pode demorar 5-10 minutos)**

---

### **5. Upload FRONTEND:**

**Lado ESQUERDO (seu PC):**
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\
```

**Lado DIREITO (servidor):**
```
/var/www/html/hpo-platform/frontend/
```

**Selecionar arquivos/pastas:**
- Selecione TUDO, EXCETO `node_modules`, `dist`, `.next`, `.env`
- Arraste para o lado direito

**⏱️ Aguarde upload... (pode demorar 5-10 minutos)**

---

## ✅ DEPOIS DO UPLOAD, ME AVISE!

Quando terminar, me diga **"Upload concluído"** e eu vou:

1. ✅ Verificar arquivos no servidor via SSH
2. ✅ Configurar `.env` correto
3. ✅ Instalar dependências (`npm install`)
4. ✅ Build backend (`npm run build`)
5. ✅ Prisma migrations + seed (17.020 termos)
6. ✅ Configurar PM2
7. ✅ Build frontend
8. ✅ Configurar Apache
9. ✅ SSL com Certbot
10. ✅ Testes finais

---

## 🆘 SE DER ERRO NO FILEZILLA

### **"Permission denied":**
```
Pode ignorar se for em pastas como node_modules ou dist
(não estamos enviando essas)
```

### **"Connection refused":**
```
Verificar:
1. Host é: sftp://200.144.254.4 (com sftp://)
2. Porta: 22
3. Protocolo: SFTP (não FTP!)
```

### **"Timeout":**
```
Conexão lenta. Continuar tentando.
FileZilla retoma upload automaticamente.
```

---

## 📊 TEMPO ESTIMADO

- Backend: ~5-10 minutos
- Frontend: ~5-10 minutos
- **Total: ~10-20 minutos**

---

## ⚠️ LEMBRETE IMPORTANTE

**NÃO enviar:**
- ❌ `node_modules/` (pesado, vamos instalar no servidor)
- ❌ `dist/` (build local, vamos buildar no servidor)
- ❌ `.env` original (vamos usar `.env.production`)

---

**Quando terminar upload, me avise que eu continuo com as etapas 7-11!** 🚀
