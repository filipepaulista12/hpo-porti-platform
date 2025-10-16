# 🔐 ORCID OAuth - Guia de Configuração Passo a Passo

**Data:** 16 de Outubro de 2025  
**Status:** 📝 AGUARDANDO CONFIGURAÇÃO

---

## ❓ SUA PERGUNTA:

> "É possivel implementar isso para funcionar localmente ou somente quando estiver no servidor?"

## ✅ RESPOSTA:

**SIM! Funciona nos dois ambientes:**

- ✅ **Localmente (Development):** Usando ORCID Sandbox
- ✅ **No Servidor (Production):** Usando ORCID Production

A diferença é apenas a **URL de callback** e o **ambiente ORCID** usado.

---

## 🎯 DUAS CONFIGURAÇÕES NECESSÁRIAS:

### 1️⃣ **ORCID Sandbox (Desenvolvimento Local)**
- ✅ Funciona em `localhost:3001` e `localhost:5173`
- ✅ Para testes durante desenvolvimento
- ✅ Contas ORCID de teste (não são reais)
- 🔧 **Vamos configurar AGORA!**

### 2️⃣ **ORCID Production (Servidor)**
- ✅ Funciona no seu domínio (ex: `https://hpo.raras.org.br`)
- ✅ Para usuários reais
- ✅ Contas ORCID oficiais (pesquisadores reais)
- ⏳ **Configurar quando for fazer deploy**

---

## 🚀 PASSO A PASSO: ORCID Sandbox (Local)

### **PASSO 1: Criar Conta ORCID Sandbox**

1. Acesse: **https://sandbox.orcid.org/register**

2. Preencha o formulário:
   ```
   First name: HPO
   Last name: Translator CPLP
   Email: cplp@raras.org.br
   Password: [escolha uma senha forte]
   ```

3. ✅ **Confirme o email** (chegará em `cplp@raras.org.br`)

4. ✅ **Anote seu ORCID ID** (ex: `0000-0002-1234-5678`)

---

### **PASSO 2: Registrar Aplicação no ORCID Developer Tools**

1. Faça login em: **https://sandbox.orcid.org/**

2. Vá em: **Developer Tools**
   - URL direta: https://sandbox.orcid.org/developer-tools

3. Clique em: **"Register for the free ORCID public API"**

4. Preencha o formulário de registro:

   ```
   ┌─────────────────────────────────────────────────┐
   │ Application name:                               │
   │ HPO Translation Platform - CPLP                 │
   ├─────────────────────────────────────────────────┤
   │ Application website URL:                        │
   │ http://localhost:5173                           │
   ├─────────────────────────────────────────────────┤
   │ Application description:                        │
   │ Collaborative platform for translating Human    │
   │ Phenotype Ontology (HPO) terms to Portuguese   │
   │ for the CPLP (Community of Portuguese Language  │
   │ Countries). Allows researchers to contribute    │
   │ with translations, validate peer translations,  │
   │ and access gamification features.               │
   ├─────────────────────────────────────────────────┤
   │ Redirect URIs (one per line):                   │
   │ http://localhost:3001/api/auth/orcid/callback   │
   │ http://localhost:5173/orcid-callback            │
   └─────────────────────────────────────────────────┘
   ```

5. ✅ Aceite os termos de uso

6. ✅ Clique em **"Save"** ou **"Register"**

---

### **PASSO 3: Copiar Credenciais**

Após o registro, você verá uma tela com suas credenciais:

```
┌─────────────────────────────────────────────────┐
│ ✅ Application Registered Successfully!         │
├─────────────────────────────────────────────────┤
│ Client ID:                                      │
│ APP-XXXXXXXXXXXXXXXX                            │
│                                                 │
│ Client Secret:                                  │
│ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx            │
└─────────────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:** 
- Copie essas credenciais AGORA!
- O **Client Secret** só aparece UMA VEZ
- Se perder, terá que gerar novo

---

### **PASSO 4: Atualizar `.env` do Backend**

Abra: `hpo-platform-backend/.env`

Substitua as linhas do ORCID:

```bash
# ORCID OAuth - SANDBOX (Development)
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"
ORCID_SANDBOX=true
```

**Cole suas credenciais reais** nos campos acima!

---

### **PASSO 5: Testar Localmente**

```powershell
# Reiniciar backend
cd hpo-platform-backend
npm run dev

# Em outro terminal, iniciar frontend
cd plataforma-raras-cpl
npm run dev
```

**Testar login:**

1. Abra: http://localhost:5173
2. Clique em **"Login com ORCID"**
3. Você será redirecionado para **sandbox.orcid.org**
4. Faça login com sua conta ORCID Sandbox
5. Autorize a aplicação
6. Você voltará para o sistema logado! ✅

---

## 🌍 CONFIGURAÇÃO PARA PRODUÇÃO (Servidor)

**Quando for fazer deploy no servidor:**

### **PASSO 1: Registrar Aplicação ORCID Production**

1. Acesse: **https://orcid.org/developer-tools** (NÃO é sandbox!)

2. Registre com **URL real do servidor:**
   ```
   Application name: HPO Translation Platform - CPLP
   Application website: https://hpo.raras.org.br
   Redirect URIs:
     https://hpo.raras.org.br/api/auth/orcid/callback
     https://hpo.raras.org.br/orcid-callback
   ```

3. Copie as **novas credenciais** (diferentes do sandbox!)

---

### **PASSO 2: Atualizar `.env.production`**

Crie arquivo: `hpo-platform-backend/.env.production`

```bash
# ORCID OAuth - PRODUCTION
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-YYYYYYYYYYYYYYYY"
ORCID_CLIENT_SECRET="yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
ORCID_REDIRECT_URI="https://hpo.raras.org.br/api/auth/orcid/callback"
ORCID_SANDBOX=false
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### Desenvolvimento Local (AGORA):
- [ ] Criar conta ORCID Sandbox
- [ ] Registrar aplicação em sandbox.orcid.org/developer-tools
- [ ] Copiar Client ID e Client Secret
- [ ] Atualizar `hpo-platform-backend/.env`
- [ ] Reiniciar backend (`npm run dev`)
- [ ] Testar login com ORCID
- [ ] Verificar que usuário foi criado no banco

### Produção (DEPOIS):
- [ ] Ter domínio próprio (ex: hpo.raras.org.br)
- [ ] Ter HTTPS configurado (SSL/TLS)
- [ ] Registrar aplicação em orcid.org/developer-tools
- [ ] Copiar credenciais de produção
- [ ] Atualizar `.env.production`
- [ ] Testar login com ORCID real

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Depois de configurar, teste:

```powershell
# 1. Backend deve mostrar ORCID habilitado
cd hpo-platform-backend
npm run dev

# Deve aparecer no log:
# ✅ ORCID OAuth enabled
```

### Teste de login:

1. Abra o frontend: http://localhost:5173
2. Procure botão **"Login com ORCID"**
3. Clique e será redirecionado para sandbox.orcid.org
4. Faça login com conta ORCID Sandbox
5. Autorize a aplicação
6. Voltará logado no sistema

### Verificar no banco:

```powershell
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT email, orcid_id FROM users WHERE orcid_id IS NOT NULL;"
```

Deve aparecer seu usuário com ORCID ID!

---

## ⚠️ PROBLEMAS COMUNS

### 1. "Client credentials are not valid"
**Causa:** Client ID ou Secret errados  
**Solução:** Verificar se copiou corretamente de developer-tools

### 2. "Redirect URI mismatch"
**Causa:** URI no `.env` diferente do registrado na ORCID  
**Solução:** Garantir que são EXATAMENTE iguais (incluindo http/https)

### 3. "ORCID button não aparece"
**Causa:** Frontend não detecta que ORCID está habilitado  
**Solução:** Verificar `ORCID_ENABLED=true` no backend

### 4. "Sandbox vs Production confusion"
**Causa:** Misturando credenciais de sandbox com produção  
**Solução:** 
- Dev: sandbox.orcid.org + ORCID_SANDBOX=true
- Prod: orcid.org + ORCID_SANDBOX=false

---

## 📞 LINKS ÚTEIS

- **ORCID Sandbox Login:** https://sandbox.orcid.org/
- **ORCID Sandbox Developer Tools:** https://sandbox.orcid.org/developer-tools
- **ORCID Production Login:** https://orcid.org/
- **ORCID Production Developer Tools:** https://orcid.org/developer-tools
- **ORCID API Documentation:** https://info.orcid.org/documentation/api-tutorials/

---

## 🎯 RESUMO

### Ambiente Local (Desenvolvimento):
```bash
# .env
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-sandbox-id"
ORCID_CLIENT_SECRET="sandbox-secret"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"
ORCID_SANDBOX=true
```

### Ambiente Produção (Servidor):
```bash
# .env.production
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-production-id"
ORCID_CLIENT_SECRET="production-secret"
ORCID_REDIRECT_URI="https://hpo.raras.org.br/api/auth/orcid/callback"
ORCID_SANDBOX=false
```

---

## ✅ PRÓXIMOS PASSOS

**Agora você precisa:**

1. ✅ Acessar https://sandbox.orcid.org/register
2. ✅ Criar conta com email `cplp@raras.org.br`
3. ✅ Ir em https://sandbox.orcid.org/developer-tools
4. ✅ Registrar aplicação "HPO Translation Platform - CPLP"
5. ✅ Copiar Client ID e Client Secret
6. ✅ Me enviar as credenciais para eu configurar no `.env`

**Ou, se preferir, posso:**
- Gerar um `.env` template para você preencher
- Explicar qualquer passo com mais detalhes
- Criar um script automatizado de configuração

---

**Quer que eu te ajude a fazer esses passos agora?**

Ou prefere fazer sozinho e depois me enviar as credenciais? 🤔

---

**Última atualização:** 16 de Outubro de 2025  
**Status:** ⏳ Aguardando registro ORCID Sandbox
