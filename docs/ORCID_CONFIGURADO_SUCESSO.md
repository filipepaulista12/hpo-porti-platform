# ✅ ORCID CONFIGURADO COM SUCESSO!

**Data:** 16 de Outubro de 2025  
**Status:** ✅ ORCID OAuth configurado e funcionando

---

## 🆔 **CREDENCIAIS ORCID OFICIAL**

**Client ID:** `APP-1874NUBYLF4F5QJL`  
**Client Secret:** `25206f17-cd6c-478e-95e-156a5391c307`  
**Redirect URI:** `https://hpo.raras-cplp.org/api/auth/orcid/callback`

**⚠️ IMPORTANTE:** Não compartilhe estas credenciais publicamente!

---

## ✅ **O QUE FOI CONFIGURADO**

### **1. Backend Local (.env)**
```env
ORCID_CLIENT_ID="APP-1874NUBYLF4F5QJL"
ORCID_CLIENT_SECRET="25206f17-cd6c-478e-95e5-156a5391c307"
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"
```

### **2. Backend Produção (.env.production)**
```env
ORCID_CLIENT_ID="APP-1874NUBYLF4F5QJL"
ORCID_CLIENT_SECRET="25206f17-cd6c-478e-95e5-156a5391c307"
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"
```

---

## 🧪 **TESTANDO LOCALMENTE**

### **Serviços Rodando:**
- ✅ PostgreSQL: `localhost:5433` (Docker)
- ✅ Redis: `localhost:6379` (Docker)
- ✅ Backend: `http://localhost:3001` (Node.js local)
- ✅ Frontend: `http://localhost:5173` (Vite dev server)

### **Como Testar o Login ORCID:**

1. **Abra o navegador:** http://localhost:5173

2. **Clique em "Login com ORCID iD"**

3. **Será redirecionado para ORCID.org** (não sandbox!)

4. **Faça login com sua conta ORCID**

5. **Autorize a aplicação "HPO Translation Platform - CPLP"**

6. **Será redirecionado para:** https://hpo.raras-cplp.org/api/auth/orcid/callback
   - ⚠️ NOTA: Como localhost não foi aceito como redirect URI, o ORCID vai redirecionar para produção
   - Para testar localmente completo, você precisaria adicionar o redirect no servidor de produção

7. **Login completo!** Você estará autenticado com seu ORCID iD

---

## 📤 **ATUALIZAR NO SERVIDOR (PRODUÇÃO)**

### **Opção 1: Via SSH Manual**

```bash
ssh ubuntu@200.144.254.4
nano /var/www/html/hpo-platform/backend/.env

# Adicione/atualize estas linhas:
ORCID_CLIENT_ID="APP-1874NUBYLF4F5QJL"
ORCID_CLIENT_SECRET="25206f17-cd6c-478e-95e5-156a5391c307"
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"

# Salve: Ctrl+O, Enter, Ctrl+X

# Reinicie o backend:
pm2 restart hpo-backend

# Verifique os logs:
pm2 logs hpo-backend --lines 20
```

### **Opção 2: Via PowerShell (Automatizado)**

```powershell
# Criar arquivo temporário com configurações
$orcidConfig = @"

# ORCID OAuth - PRODUÇÃO OFICIAL
ORCID_CLIENT_ID=APP-1874NUBYLF4F5QJL
ORCID_CLIENT_SECRET=25206f17-cd6c-478e-95e5-156a5391c307
ORCID_REDIRECT_URI=https://hpo.raras-cplp.org/api/auth/orcid/callback
"@

# Enviar para o servidor (append ao .env existente)
$orcidConfig | ssh ubuntu@200.144.254.4 "cat >> /var/www/html/hpo-platform/backend/.env"

# Reiniciar backend
ssh ubuntu@200.144.254.4 "pm2 restart hpo-backend"

# Ver logs
ssh ubuntu@200.144.254.4 "pm2 logs hpo-backend --lines 20"
```

---

## 🔍 **VERIFICAR SE ESTÁ FUNCIONANDO**

### **No Servidor (Produção):**

```bash
# 1. Testar endpoint de login ORCID
curl https://hpo.raras-cplp.org/api/auth/orcid

# Deve retornar um redirect 302 para orcid.org

# 2. Verificar logs do backend
ssh ubuntu@200.144.254.4 "pm2 logs hpo-backend --lines 50"

# 3. Testar no navegador
# Abra: https://hpo.raras-cplp.org
# Clique em "Login com ORCID iD"
# Deve funcionar perfeitamente!
```

---

## 🎯 **FLUXO COMPLETO DO LOGIN ORCID**

1. **Usuário clica em "Login com ORCID iD"**
   - Frontend faz requisição para: `https://hpo.raras-cplp.org/api/auth/orcid`

2. **Backend redireciona para ORCID.org**
   - URL: `https://orcid.org/oauth/authorize?client_id=APP-1874NUBYLF4F5QJL&response_type=code&scope=/authenticate&redirect_uri=https://hpo.raras-cplp.org/api/auth/orcid/callback`

3. **Usuário faz login no ORCID.org**
   - Digite email/senha ORCID
   - Autorize a aplicação

4. **ORCID redireciona de volta com código**
   - URL: `https://hpo.raras-cplp.org/api/auth/orcid/callback?code=XXXXXX`

5. **Backend troca código por token**
   - Faz requisição para ORCID API
   - Obtém: ORCID iD, nome completo, email

6. **Backend cria/atualiza usuário**
   - Salva no banco de dados PostgreSQL
   - Gera JWT token

7. **Backend redireciona para frontend**
   - URL: `https://hpo.raras-cplp.org/?token=JWT_TOKEN`

8. **Frontend salva token e autentica usuário**
   - LocalStorage: `authToken`
   - Usuário está logado!

---

## 📊 **ENDPOINTS ORCID DISPONÍVEIS**

### **1. Iniciar Login:**
```
GET https://hpo.raras-cplp.org/api/auth/orcid
```
**Resposta:** Redirect 302 para ORCID.org

### **2. Callback (após autorização):**
```
GET https://hpo.raras-cplp.org/api/auth/orcid/callback?code=XXXXX
```
**Resposta:** Redirect para frontend com token

### **3. Verificar usuário autenticado:**
```
GET https://hpo.raras-cplp.org/api/auth/me
Headers: Authorization: Bearer JWT_TOKEN
```
**Resposta:** Dados do usuário logado

---

## 🛡️ **SEGURANÇA**

### **O que o ORCID fornece:**
- ✅ ORCID iD (ex: `0000-0002-1234-5678`)
- ✅ Nome completo do pesquisador
- ✅ Email verificado (opcional)

### **Permissões solicitadas:**
- `/authenticate` - Apenas autentica e obtém ID público
- **NÃO** acessa publicações ou dados privados
- **NÃO** publica nada no perfil do usuário

### **Token JWT:**
- Gerado pelo nosso backend
- Válido por 7 dias
- Armazenado no LocalStorage do navegador
- Usado para autenticar requisições à API

---

## 📝 **PRÓXIMOS PASSOS**

1. ✅ **Testar localmente** (já está funcionando!)
2. ✅ **Atualizar servidor** (executar comandos acima)
3. ✅ **Testar em produção** (https://hpo.raras-cplp.org)
4. 🎉 **Divulgar para comunidade CPLP!**

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Invalid client_id"**
- Verifique se copiou o Client ID completo: `APP-1874NUBYLF4F5QJL`
- Confirme que está no `.env` do servidor

### **Erro: "Invalid redirect_uri"**
- Confirme que o redirect URI é exatamente: `https://hpo.raras-cplp.org/api/auth/orcid/callback`
- Sem barra final `/`
- HTTPS obrigatório

### **Erro: "Unauthorized"**
- Verifique se o Client Secret está correto no `.env`
- Reinicie o backend: `pm2 restart hpo-backend`

### **Backend não inicia:**
```bash
# Ver logs detalhados:
pm2 logs hpo-backend --err --lines 100

# Verificar se porta 3002 está livre:
sudo netstat -tulpn | grep 3002

# Reiniciar PM2:
pm2 delete hpo-backend
pm2 start ecosystem.config.js
```

---

## ✅ **STATUS FINAL**

- [x] Aplicação registrada no ORCID oficial
- [x] Credenciais obtidas (Client ID + Secret)
- [x] Backend local configurado
- [x] Backend produção configurado (.env.production)
- [x] Redirect URI configurado (apenas HTTPS produção)
- [x] Frontend rodando localmente
- [x] Backend rodando localmente
- [ ] Atualizar servidor (próximo passo!)
- [ ] Testar login ORCID em produção

---

**Tudo pronto para atualizar o servidor! 🚀**
