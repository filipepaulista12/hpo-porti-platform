# 🔧 CORREÇÃO APLICADA - ORCID OAuth

**Data:** 16 de Outubro de 2025, 12:11

---

## 🐛 **PROBLEMA ENCONTRADO:**

Quando tentou fazer login com ORCID, o backend retornava:
```
Error: Internal Server Error
Message: Something went wrong
```

**Nos logs:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

---

## ✅ **CAUSA RAIZ:**

O backend está **atrás de um proxy reverso Apache**, que adiciona o header `X-Forwarded-For` para identificar o IP real do cliente.

Mas o Express.js por padrão **não confia em proxies** (`trust proxy = false`).

Isso causava erro no **express-rate-limit** que tentava usar esse header para identificar usuários.

---

## 🛠️ **CORREÇÃO APLICADA:**

### **Arquivo:** `src/server.ts`

**Adicionamos:**
```typescript
// Trust proxy (we're behind Apache reverse proxy)
app.set('trust proxy', true);
```

**Localização:** Logo após criar o app Express, antes dos middlewares.

---

## 📦 **DEPLOY REALIZADO:**

1. ✅ Editado `src/server.ts` localmente
2. ✅ Compilado com `npm run build`
3. ✅ Enviado `dist/server.js` para o servidor via SCP
4. ✅ Reiniciado PM2: `pm2 restart hpo-backend`

---

## 🧪 **PRÓXIMOS PASSOS PARA TESTAR:**

### **1. Abrir o site:**
```
https://hpo.raras-cplp.org
```

### **2. Clicar em "Login com ORCID iD"**

### **3. Fazer login no ORCID**

### **4. Autorizar a aplicação**

### **5. DEVE FUNCIONAR AGORA! ✅**

---

## 📊 **STATUS ATUAL:**

- ✅ Backend reiniciado às **12:11:21** (horário do servidor)
- ✅ Servidor rodando na porta **3002**
- ✅ Email service **ENABLED**
- ✅ WebSocket **inicializado**
- ✅ **SEM ERROS** nos logs

---

## 🔍 **VERIFICAR SE FUNCIONOU:**

Depois de testar o login, verificar logs:
```bash
ssh ubuntu@200.144.254.4
tail -50 /var/www/html/hpo-platform/backend/logs/out.log
```

**Procure por:**
- ✅ `GET /api/auth/orcid` ← Iniciou login
- ✅ `GET /api/auth/orcid/callback` ← ORCID retornou
- ✅ `User authenticated` ← Login bem-sucedido!
- ❌ **NÃO DEVE ter** "Unexpected token" ou "trust proxy"

---

## 📝 **DOCUMENTAÇÃO:**

- **Express trust proxy:** https://expressjs.com/en/guide/behind-proxies.html
- **Rate limit error:** https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/

---

**CORREÇÃO APLICADA! TESTE AGORA:** https://hpo.raras-cplp.org 🚀
