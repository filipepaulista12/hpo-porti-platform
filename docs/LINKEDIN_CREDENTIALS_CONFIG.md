# 🔐 LinkedIn OAuth - Credenciais e Configuração

**Data:** 19 de Outubro de 2025  
**Status:** ✅ App criado no LinkedIn, credenciais obtidas

---

## 📋 Credenciais LinkedIn

```bash
# LinkedIn OAuth Credentials
LINKEDIN_CLIENT_ID=77x5k5zmu04ct4
LINKEDIN_CLIENT_SECRET=WPL_AP1.INTjMTNN6PAEty4b.xVZLgw==
```

⚠️ **IMPORTANTE:** Estas credenciais são sensíveis. NÃO commitar no Git!

---

## ✅ Já Configurado no LinkedIn:

- ✅ **App Name:** HPO Translation Platform
- ✅ **Company:** Rede Nacional de Doenças Raras
- ✅ **Privacy Policy URL:** https://hpo.raras-cplp.org/privacy
- ✅ **App Logo:** Uploaded
- ✅ **Client ID e Secret:** Gerados

---

## ⏳ PENDENTE - Adicionar Redirect URLs

**Ir para:** LinkedIn Developers → Auth → Authorized redirect URLs for your app

**Adicionar:**
```
https://hpo.raras-cplp.org/api/auth/linkedin/callback
http://localhost:3001/api/auth/linkedin/callback
```

**Status atual:** "No redirect URLs added"

---

## ⏳ PENDENTE - Solicitar Produtos/Permissões

**Ir para:** LinkedIn Developers → Products

**Solicitar acesso para:**
- [ ] **Sign In with LinkedIn using OpenID Connect** (Default Tier)
  - Permite: openid, profile, email scopes
  - Necessário para autenticação OAuth
  - Status: Disponível para solicitar

**Produtos visíveis:**
- Share on LinkedIn (Default Tier) - Request access
- Advertising API (Development Tier) - Request access
- Lead Sync API (Standard Tier) - Request access
- Live Events (Development Tier) - Request access

**Ação:** Clicar em "Request access" no produto "Share on LinkedIn" ou similar que dê acesso ao Sign In.

---

## 📝 TO DO - Configurar no Servidor (Quando conectar)

Quando for atualizar a aplicação no servidor `hpo.raras-cplp.org`:

### Passo 1: Adicionar ao .env
```bash
# SSH no servidor
ssh user@hpo.raras-cplp.org

# Navegar para diretório do backend
cd /path/to/hpo-platform-backend

# Editar .env
nano .env

# Adicionar estas linhas:
LINKEDIN_CLIENT_ID=77x5k5zmu04ct4
LINKEDIN_CLIENT_SECRET=WPL_AP1.INTjMTNN6PAEty4b.xVZLgw==
LINKEDIN_REDIRECT_URI=https://hpo.raras-cplp.org/api/auth/linkedin/callback
```

### Passo 2: Reiniciar Backend
```bash
pm2 restart hpo-backend

# Verificar se está rodando
pm2 logs hpo-backend --lines 50
```

### Passo 3: Testar
```bash
# Testar redirect
curl -I https://hpo.raras-cplp.org/api/auth/linkedin

# Deve retornar 302 (redirect) ao invés de 500
```

---

## 🧪 Testar Localmente (Desenvolvimento)

### Adicionar ao .env local:
```bash
# No arquivo hpo-platform-backend/.env
LINKEDIN_CLIENT_ID=77x5k5zmu04ct4
LINKEDIN_CLIENT_SECRET=WPL_AP1.INTjMTNN6PAEty4b.xVZLgw==
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/auth/linkedin/callback
```

### Testar:
1. Reiniciar backend: `npm run dev`
2. Abrir: http://localhost:3001/api/auth/linkedin
3. Deve redirecionar para LinkedIn
4. Após login, callback deve funcionar

---

## 📄 Documentação de Referência

- **LinkedIn OAuth 2.0:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **Sign In with LinkedIn:** https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- **Scopes:** openid, profile, email

---

## 🔒 Segurança

### ✅ Implementado no código:
- CSRF protection com state parameter (crypto.randomBytes(16))
- Token JWT com expiração
- Verificação de state no callback
- HTTPS only em produção

### 🎯 Próximos passos de segurança:
- [ ] Rate limiting no endpoint OAuth
- [ ] Logging de tentativas de autenticação
- [ ] Monitoramento de tokens suspeitos
