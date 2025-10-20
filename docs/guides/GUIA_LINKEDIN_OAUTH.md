# 🔗 GUIA: Configurar LinkedIn OAuth 2.0

**Data:** 18/10/2025  
**Objetivo:** Permitir login via LinkedIn na plataforma HPO

---

## 📋 PASSO 1: Criar LinkedIn App

### 1.1 Acessar LinkedIn Developers
1. Ir para: https://www.linkedin.com/developers/apps
2. Clicar em **"Create app"**

### 1.2 Preencher Informações da App
```
App name: HPO Translation Platform - CPLP
Company: [Sua organização/universidade]
Privacy policy URL: https://hpo.raras-cplp.org/privacy
App logo: [Upload logo 100x100px]
Legal agreement: ✅ Aceitar termos
```

### 1.3 Configurar OAuth Settings
Na aba **"Auth"** da sua app:

**Redirect URLs (adicionar ambas):**
```
http://localhost:3001/api/auth/linkedin/callback
https://hpo.raras-cplp.org/api/auth/linkedin/callback
```

**Scopes necessários:**
- ✅ `r_liteprofile` (Nome, foto, localização)
- ✅ `r_emailaddress` (Email do usuário)

### 1.4 Obter Credenciais
Na aba **"Auth"**, copiar:
- **Client ID:** `78xxxxxxxxxxxxx`
- **Client Secret:** `xxxxxxxxxxxxxxxx` (clicar em "Show" para revelar)

---

## 📝 PASSO 2: Configurar Backend

### 2.1 Adicionar Variáveis de Ambiente

Editar arquivo `hpo-platform-backend/.env`:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="seu-client-id-aqui"
LINKEDIN_CLIENT_SECRET="seu-client-secret-aqui"
LINKEDIN_REDIRECT_URI="http://localhost:3001/api/auth/linkedin/callback"
```

**Para produção** (`hpo-platform-backend/.env.production`):
```bash
LINKEDIN_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/linkedin/callback"
```

### 2.2 Reiniciar Backend

**Docker:**
```bash
docker restart hpo-backend
```

**Local:**
```bash
npm run dev
```

---

## 🧪 PASSO 3: Testar Integração

### 3.1 Testar Redirect
Acessar no navegador:
```
http://localhost:3001/api/auth/linkedin
```

**Esperado:**
- ✅ Redireciona para LinkedIn
- ✅ Solicita permissões (nome, email)
- ✅ Após aprovar, redireciona para callback

### 3.2 Verificar Callback
Após aprovação, a URL será:
```
http://localhost:3001/api/auth/linkedin/callback?code=AQT...&state=abc123
```

**Esperado:**
- ✅ Usuário criado/atualizado no banco
- ✅ JWT token retornado
- ✅ Redirecionamento para frontend

### 3.3 Verificar Banco de Dados

**Listar usuários LinkedIn:**
```bash
docker exec hpo-backend npx tsx -e "
import prisma from './src/config/database.js';
const users = await prisma.user.findMany({
  where: { orcidId: { startsWith: 'linkedin:' } },
  select: { id: true, email: true, name: true, orcidId: true }
});
console.log(users);
"
```

---

## 🎨 PASSO 4: Configurar Frontend

### 4.1 Verificar Botão LinkedIn

Arquivo: `plataforma-raras-cpl/src/pages/Login.tsx`

O botão já deve estar implementado:
```tsx
<button
  onClick={() => window.location.href = `${API_URL}/api/auth/linkedin`}
  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
>
  <LinkedInIcon />
  Continuar com LinkedIn
</button>
```

### 4.2 Testar Flow Completo

1. Acessar: http://localhost:3000/login
2. Clicar em **"Continuar com LinkedIn"**
3. Aprovar permissões no LinkedIn
4. Ser redirecionado de volta logado

---

## 🔍 DADOS EXTRAÍDOS DO LINKEDIN

O backend mapeia automaticamente:

| Campo LinkedIn | Campo HPO | Exemplo |
|----------------|-----------|---------|
| `firstName` + `lastName` | `name` | "Ana Silva" |
| `emailAddress` | `email` | "ana@example.com" |
| `id` | `orcidId` | "linkedin:xyz123" |
| `headline` | `specialty` | "Geneticista Médica" |
| `industry` | `institution` | "Hospital Research" |
| `country` | `country` | "BR" |
| `pictureUrl` | `avatarUrl` | "https://..." |

---

## 🛠️ TROUBLESHOOTING

### Erro: "redirect_uri_mismatch"
**Causa:** URL de callback não está registrada no LinkedIn App

**Solução:**
1. Ir para LinkedIn App > Auth > Redirect URLs
2. Adicionar exatamente: `http://localhost:3001/api/auth/linkedin/callback`
3. Aguardar 5 minutos para propagar

### Erro: "invalid_client"
**Causa:** Client ID ou Secret incorreto

**Solução:**
1. Verificar `.env` tem valores corretos
2. Reiniciar backend: `docker restart hpo-backend`

### Erro: "insufficient_scope"
**Causa:** Falta permissão no LinkedIn App

**Solução:**
1. Ir para LinkedIn App > Products
2. Solicitar: "Sign In with LinkedIn using OpenID Connect"
3. Aguardar aprovação (pode levar 1-2 dias)

### Usuário não é criado
**Causa:** Email já existe com outro método

**Solução:**
O sistema faz merge automático se o email já existe. Verificar logs:
```bash
docker logs hpo-backend --tail 50
```

---

## 📊 ANALYTICS

### Verificar Logins LinkedIn
```sql
SELECT 
  COUNT(*) as total_linkedin_users,
  COUNT(DISTINCT DATE(\"createdAt\")) as days_with_signups
FROM users
WHERE \"orcidId\" LIKE 'linkedin:%';
```

### Top Instituições via LinkedIn
```sql
SELECT 
  institution,
  COUNT(*) as users
FROM users
WHERE \"orcidId\" LIKE 'linkedin:%'
  AND institution IS NOT NULL
GROUP BY institution
ORDER BY users DESC
LIMIT 10;
```

---

## 🔒 SEGURANÇA

### State Parameter
- ✅ Gerado randomicamente a cada request
- ✅ Validado no callback para prevenir CSRF

### Token JWT
- ✅ Assinado com JWT_SECRET
- ✅ Expira em 7 dias (configurável)
- ✅ Incluído no header Authorization

### Dados Sensíveis
- ✅ Client Secret nunca exposto no frontend
- ✅ Token de acesso do LinkedIn descartado após uso
- ✅ Apenas dados essenciais armazenados

---

## 📚 REFERÊNCIAS

- **LinkedIn OAuth Docs:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **LinkedIn API Reference:** https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
- **OAuth 2.0 Spec:** https://oauth.net/2/

---

## ✅ CHECKLIST DE DEPLOYMENT

**Desenvolvimento:**
- [ ] LinkedIn App criada
- [ ] Redirect URL `localhost:3001` adicionada
- [ ] Client ID/Secret no `.env`
- [ ] Backend reiniciado
- [ ] Teste de login funcionando

**Produção:**
- [ ] Redirect URL `https://hpo.raras-cplp.org` adicionada
- [ ] `.env.production` configurado
- [ ] SSL/HTTPS configurado
- [ ] Teste em ambiente de staging
- [ ] Deploy em produção
- [ ] Monitoramento de erros ativo

---

**Criado por:** GitHub Copilot  
**Data:** 18 de Outubro de 2025  
**Versão:** 1.0
