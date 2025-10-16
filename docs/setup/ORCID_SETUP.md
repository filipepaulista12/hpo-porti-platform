# 🔐 Configuração do ORCID OAuth

Este guia explica como configurar a autenticação ORCID para a plataforma HPO Translation.

## 📋 Pré-requisitos

- Conta ORCID (criar em https://orcid.org/register)
- Acesso ao ORCID Developer Tools

## 🚀 Passos para Configuração

### 1. Registrar Aplicação no ORCID

#### Para Desenvolvimento (Sandbox):

1. Acesse: https://sandbox.orcid.org/developer-tools
2. Faça login com sua conta ORCID Sandbox
3. Clique em "Register for the free ORCID public API"
4. Preencha o formulário:
   - **Application name**: HPO Translation Platform (Development)
   - **Application website**: http://localhost:5173
   - **Application description**: Platform for collaborative translation of Human Phenotype Ontology terms to Portuguese
   - **Redirect URIs**: 
     - `http://localhost:3001/api/auth/orcid/callback`
     - `http://localhost:5173/orcid-callback` (opcional para frontend direct)

5. Após registro, você receberá:
   - **Client ID** (exemplo: APP-XXXXXXXXXX)
   - **Client Secret** (guarde com segurança!)

#### Para Produção:

1. Acesse: https://orcid.org/developer-tools
2. Siga os mesmos passos, mas com URLs de produção:
   - **Application website**: https://seu-dominio.com
   - **Redirect URIs**: 
     - `https://seu-dominio.com/api/auth/orcid/callback`

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` no backend:

```bash
# ORCID OAuth
ORCID_CLIENT_ID="APP-XXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"

# Para sandbox (desenvolvimento)
NODE_ENV="development"

# Para produção
NODE_ENV="production"
```

### 3. Testar a Integração

#### Fluxo de Autenticação:

1. **Iniciar OAuth**:
   ```
   GET http://localhost:3001/api/auth/orcid
   ```
   Retorna: `{ "authUrl": "https://sandbox.orcid.org/oauth/authorize?..." }`

2. **Redirecionar usuário** para `authUrl`

3. **ORCID autentica** e redireciona de volta com `code`:
   ```
   http://localhost:3001/api/auth/orcid/callback?code=XXXXXX
   ```

4. **Backend processa** o código e:
   - Troca por access token
   - Busca dados do perfil ORCID
   - Cria/atualiza usuário no banco
   - Gera JWT token
   - Redireciona para frontend com token

5. **Frontend recebe** token via query param:
   ```
   http://localhost:5173?orcid_token=eyJhbGc...&orcid_success=true
   ```

## 🔑 Endpoints Implementados

### GET /api/auth/orcid
Retorna URL de autorização ORCID para redirecionar o usuário.

**Response:**
```json
{
  "authUrl": "https://sandbox.orcid.org/oauth/authorize?client_id=...",
  "message": "Redirect user to this URL for ORCID authentication"
}
```

### GET /api/auth/orcid/callback
Processa callback do ORCID após autorização.

**Query Params:**
- `code`: Authorization code do ORCID
- `error`: (opcional) Erro se autorização falhou

**Comportamento:**
1. Troca code por access token
2. Busca perfil ORCID (email, nome)
3. Cria novo usuário ou vincula ORCID a conta existente
4. Gera JWT token
5. Redireciona para frontend: `http://localhost:5173?orcid_token=JWT&orcid_success=true`

## 📊 Banco de Dados

A tabela `User` já possui o campo `orcidId`:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  orcidId   String?  @unique  // ORCID iD (ex: 0000-0002-1825-0097)
  password  String   // Vazio para usuários ORCID-only
  // ... outros campos
}
```

## 🔒 Segurança

- ✅ Client Secret **nunca** é exposto ao frontend
- ✅ Token exchange acontece no backend (server-to-server)
- ✅ JWT gerado após autenticação bem-sucedida
- ✅ Suporte para vincular ORCID a contas existentes
- ✅ Validação de redirect URIs no ORCID

## 🐛 Troubleshooting

### Erro: "ORCID not configured"
- Verifique se `ORCID_CLIENT_ID` está definido no `.env`
- Reinicie o servidor backend

### Erro: "Failed to exchange code for token"
- Verifique se `ORCID_CLIENT_SECRET` está correto
- Confirme que `ORCID_REDIRECT_URI` corresponde ao registrado no ORCID
- Código de autorização expira em ~10 minutos

### Erro: "CORS"
- Adicione origem do frontend no ORCID Developer Tools
- Verifique `FRONTEND_URL` no `.env`

### Sandbox vs Production
- **Desenvolvimento**: Use https://sandbox.orcid.org
- **Produção**: Use https://orcid.org
- Credenciais do sandbox **não funcionam** em produção!

## 📚 Referências

- ORCID API Documentation: https://info.orcid.org/documentation/api-tutorials/
- ORCID OAuth Guide: https://info.orcid.org/documentation/integration-guide/registering-a-public-api-client/
- ORCID Developer Tools: https://orcid.org/developer-tools

## ✅ Checklist de Implementação

Backend:
- [x] Rotas `/api/auth/orcid` e `/api/auth/orcid/callback` criadas
- [x] Token exchange implementado
- [x] Busca de perfil ORCID
- [x] Criação/vinculação de usuário
- [x] Geração de JWT
- [x] Redirect para frontend com token
- [ ] Variáveis ORCID_CLIENT_ID e ORCID_CLIENT_SECRET configuradas

Frontend:
- [ ] Botão "Login com ORCID" nas páginas de login/registro
- [ ] Redirect para URL de autorização ORCID
- [ ] Handling de callback com token
- [ ] Armazenamento de token e auto-login
- [ ] UI para mostrar ORCID vinculado no perfil

Produção:
- [ ] Registrar app no ORCID production
- [ ] Configurar redirect URIs de produção
- [ ] Atualizar variáveis de ambiente
- [ ] Testar fluxo completo
