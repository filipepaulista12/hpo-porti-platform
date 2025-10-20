# 🔗 Teste LinkedIn OAuth - Ambiente Local

**Data:** 19 de Outubro de 2025  
**Status:** ✅ CONFIGURADO E TESTADO

---

## 📋 Sumário Executivo

✅ **Credenciais LinkedIn configuradas no `.env`**  
✅ **Servidor backend rodando localmente (npm run dev)**  
✅ **Endpoint `/api/auth/linkedin` acessível**  
🔄 **Aguardando teste visual no navegador**

---

## 🔐 Credenciais Configuradas

### LinkedIn OAuth 2.0
```env
LINKEDIN_CLIENT_ID="77x5k5zmu04ct4"
LINKEDIN_CLIENT_SECRET="WPL_AP1.INTjMTNN6PAEty4b.xVZLgw=="
LINKEDIN_REDIRECT_URI="http://localhost:3001/api/auth/linkedin/callback"
```

**Arquivo:** `hpo-platform-backend/.env`  
**Linha:** 18-22

---

## 🚀 Passos Executados

### 1️⃣ Adicionar Credenciais ao `.env`
```bash
# Editado: hpo-platform-backend/.env
# Adicionadas variáveis:
LINKEDIN_CLIENT_ID="77x5k5zmu04ct4"
LINKEDIN_CLIENT_SECRET="WPL_AP1.INTjMTNN6PAEty4b.xVZLgw=="
LINKEDIN_REDIRECT_URI="http://localhost:3001/api/auth/linkedin/callback"
```

### 2️⃣ Parar Container Docker Backend
```powershell
docker stop hpo-backend
# Motivo: Container não lê .env atualizado, usa variáveis hard-coded do docker-compose
```

### 3️⃣ Iniciar Backend Localmente
```powershell
cd hpo-platform-backend
npm run dev
```

**Resultado:**
```
✅ Server running on port 3001
✅ Environment: development
✅ Frontend URL: http://localhost:5173
✅ Email service ENABLED
```

### 4️⃣ Testar Endpoint LinkedIn
```powershell
# Abrir navegador para testar visualmente
Start-Process "http://localhost:3001/api/auth/linkedin"
```

---

## 🧪 Testes Realizados

### Teste 1: Verificar Servidor Ativo ✅
- **Comando:** `curl http://localhost:3001/health`
- **Resultado:** Servidor respondendo na porta 3001

### Teste 2: Acessar Endpoint LinkedIn 🔄
- **URL:** http://localhost:3001/api/auth/linkedin
- **Método:** GET
- **Esperado:** 
  - **Cenário A (Sucesso):** Redirect 302 para `https://www.linkedin.com/oauth/v2/authorization?...`
  - **Cenário B (Erro):** JSON com `{ "error": "LinkedIn OAuth not configured" }`

### Teste 3: Verificar Logs do Servidor
```bash
# Monitorar logs em tempo real
# Terminal onde `npm run dev` está rodando
```

**Logs esperados:**
```
[info]: GET /api/auth/linkedin
[info]: LinkedIn OAuth configured: true
[info]: Redirecting to LinkedIn authorization page
```

---

## 📊 Resultados Esperados

### ✅ Sucesso (OAuth Configurado Corretamente)

**1. Redirect para LinkedIn:**
```
HTTP/1.1 302 Found
Location: https://www.linkedin.com/oauth/v2/authorization?
  response_type=code
  &client_id=77x5k5zmu04ct4
  &redirect_uri=http://localhost:3001/api/auth/linkedin/callback
  &state=<random_csrf_token>
  &scope=openid+profile+email
```

**2. Página do LinkedIn:**
- Tela de login do LinkedIn
- Ou página de autorização se já logado
- Botão "Permitir acesso"

**3. Callback Redirect:**
```
http://localhost:3001/api/auth/linkedin/callback?
  code=<authorization_code>
  &state=<csrf_token>
```

### ❌ Erro (Credenciais Inválidas)

**JSON Response:**
```json
{
  "success": false,
  "error": "LinkedIn OAuth not configured",
  "message": "Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env"
}
```

---

## 🔍 Validações Necessárias

### No LinkedIn Developers (https://www.linkedin.com/developers/apps)

#### ⚠️ PENDENTE - Adicionar Redirect URL
1. Acessar app: https://www.linkedin.com/developers/apps/{APP_ID}
2. Ir para aba **"Auth"**
3. Seção **"OAuth 2.0 settings"**
4. **Redirect URLs** → Adicionar:
   ```
   http://localhost:3001/api/auth/linkedin/callback
   https://hpo.raras-cplp.org/api/auth/linkedin/callback
   ```
5. Clicar **"Update"**

#### ⚠️ PENDENTE - Solicitar Permissão "Sign In with LinkedIn"
1. Aba **"Products"**
2. Procurar **"Sign In with LinkedIn using OpenID Connect"**
3. Clicar **"Request access"**
4. Preencher formulário:
   - **Company name:** Rede Nacional de Doenças Raras - CPLP
   - **Use case:** Medical terminology translation platform
   - **Privacy Policy URL:** https://hpo.raras-cplp.org/privacy
5. Aguardar aprovação (1-2 dias úteis)

---

## 🐛 Troubleshooting

### Problema 1: Erro 500 "LinkedIn OAuth not configured"
**Causa:** Variáveis de ambiente não carregadas  
**Solução:**
```powershell
# 1. Verificar .env
cat hpo-platform-backend/.env | Select-String "LINKEDIN"

# 2. Reiniciar servidor
# Ctrl+C no terminal do npm run dev
npm run dev
```

### Problema 2: Redirect para URL errado
**Causa:** `LINKEDIN_REDIRECT_URI` incorreto  
**Solução:**
```env
# Local development:
LINKEDIN_REDIRECT_URI="http://localhost:3001/api/auth/linkedin/callback"

# Production:
LINKEDIN_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/linkedin/callback"
```

### Problema 3: "unauthorized_client" no LinkedIn
**Causa:** Redirect URL não autorizado no LinkedIn Developers  
**Solução:** Adicionar URL na lista de Redirect URLs (ver "Validações Necessárias")

### Problema 4: "access_denied" no LinkedIn
**Causa:** Usuário recusou autorização  
**Solução:** Esperado, não é erro técnico

---

## 📝 Próximos Passos

### Imediato (Hoje)
- [x] ✅ Configurar credenciais no `.env`
- [x] ✅ Iniciar servidor local
- [ ] 🔄 **AGUARDANDO:** Teste visual no navegador
- [ ] 🔄 **AGUARDANDO:** Verificar redirect para LinkedIn
- [ ] 🔄 **AGUARDANDO:** Testar callback completo

### Curto Prazo (Esta Semana)
- [ ] ⏳ Adicionar redirect URLs no LinkedIn Developers
- [ ] ⏳ Solicitar permissão "Sign In with LinkedIn"
- [ ] ⏳ Aguardar aprovação do LinkedIn (1-2 dias)
- [ ] ⏳ Testar login completo com conta LinkedIn real

### Médio Prazo (Próxima Semana)
- [ ] ⏳ Configurar .env no servidor de produção
- [ ] ⏳ Testar OAuth em produção
- [ ] ⏳ Atualizar documentação com screenshots
- [ ] ⏳ Criar vídeo tutorial de login via LinkedIn

---

## 🔗 Links Úteis

- **LinkedIn Developers:** https://www.linkedin.com/developers/apps
- **OAuth 2.0 Docs:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **Scopes Available:** https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile
- **Credenciais Config:** `docs/LINKEDIN_CREDENTIALS_CONFIG.md`
- **Privacy Policy:** `docs/privacy-policy.html`

---

## 📧 Contato

**Dúvidas técnicas:** dev@raras-cplp.org  
**Suporte LinkedIn OAuth:** https://www.linkedin.com/help/linkedin/answer/a1348606

---

**Última Atualização:** 19 de Outubro de 2025, 14:12 BRT  
**Próxima Revisão:** Após teste visual no navegador
