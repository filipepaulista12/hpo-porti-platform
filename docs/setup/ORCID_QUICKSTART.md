# 🚀 Quick Start - ORCID OAuth

## ⚡ Configuração Rápida (5 minutos)

### 1. Registrar no ORCID Sandbox (Desenvolvimento)

1. **Criar conta ORCID Sandbox** (se não tiver):
   - Acesse: https://sandbox.orcid.org/register
   - Preencha o formulário
   - Confirme o email

2. **Registrar aplicação**:
   - Acesse: https://sandbox.orcid.org/developer-tools
   - Faça login
   - Clique em **"Register for the free ORCID public API"**
   
3. **Preencher formulário**:
   ```
   Application name: HPO Translation Platform Dev
   Application website: http://localhost:5173
   Application description: Collaborative platform for translating Human Phenotype Ontology to Portuguese
   Redirect URIs: http://localhost:3001/api/auth/orcid/callback
   ```

4. **Copiar credenciais**:
   - Client ID (formato: APP-XXXXXXXXXX)
   - Client Secret (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### 2. Configurar Backend

Edite `hpo-platform-backend/.env`:

```bash
# ORCID OAuth
ORCID_CLIENT_ID="APP-XXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"

# Manter development para usar sandbox
NODE_ENV="development"
```

### 3. Reiniciar Backend

```powershell
cd hpo-platform-backend
npm run dev
```

### 4. Testar!

1. Abra http://localhost:5173
2. Clique em **"🔬 Login com ORCID"**
3. Será redirecionado para ORCID Sandbox
4. Autorize a aplicação
5. Será redirecionado de volta e logado automaticamente!

## ✅ Como Saber se Está Funcionando

### Sinais de Sucesso:
- ✅ Botão "🔬 Login com ORCID" aparece nas páginas de login/registro
- ✅ Ao clicar, redireciona para sandbox.orcid.org
- ✅ Após autorizar, volta para a aplicação logado
- ✅ Nome do usuário aparece no Header com um ✓ verde
- ✅ Usuário é criado automaticamente no banco de dados

### Verificar no Console do Backend:
```
✅ Usuario criado/atualizado com ORCID: 0000-0002-XXXX-XXXX
```

## 🐛 Troubleshooting

### Erro: "ORCID not configured"
**Causa**: ORCID_CLIENT_ID não está definido no .env  
**Solução**: 
1. Verifique se copiou o Client ID corretamente
2. Reinicie o backend: `npm run dev`

### Erro: "Failed to exchange code for token"
**Causa**: Client Secret incorreto ou Redirect URI não cadastrada  
**Solução**:
1. Verifique ORCID_CLIENT_SECRET no .env
2. Confirme que http://localhost:3001/api/auth/orcid/callback está registrado no ORCID
3. Código expira em ~10 min - tente novamente

### Erro: CORS
**Causa**: Frontend não autorizado  
**Solução**: 
- No ORCID Developer Tools, adicione http://localhost:5173 como origem permitida

### Botão ORCID não aparece
**Causa**: Frontend não consegue acessar backend  
**Solução**:
- Verifique se backend está rodando em http://localhost:3001
- Teste: http://localhost:3001/health

## 📊 Endpoints

### Testar manualmente:

```bash
# 1. Obter URL de autorização
curl http://localhost:3001/api/auth/orcid

# Retorna:
{
  "authUrl": "https://sandbox.orcid.org/oauth/authorize?client_id=...",
  "message": "Redirect user to this URL for ORCID authentication"
}

# 2. Copiar authUrl e abrir no navegador
# 3. Autorizar aplicação
# 4. ORCID redireciona para: http://localhost:3001/api/auth/orcid/callback?code=XXXXX
# 5. Backend processa e redireciona para: http://localhost:5173?orcid_token=JWT&orcid_success=true
```

## 🔒 Segurança

- ✅ Client Secret **nunca** exposto ao frontend
- ✅ Token exchange server-to-server
- ✅ JWT gerado no backend
- ✅ Validação de redirect URIs
- ✅ HTTPS obrigatório em produção

## 🌍 Produção

Para deploy em produção, registre uma nova aplicação em:
- https://orcid.org/developer-tools (não use sandbox!)

Atualize .env:
```bash
NODE_ENV="production"
ORCID_CLIENT_ID="APP-PROD-XXXXX"
ORCID_CLIENT_SECRET="prod-secret-xxxxx"
ORCID_REDIRECT_URI="https://seu-dominio.com/api/auth/orcid/callback"
FRONTEND_URL="https://seu-dominio.com"
```

## 📚 Recursos

- ORCID Sandbox: https://sandbox.orcid.org
- ORCID Production: https://orcid.org
- Documentação API: https://info.orcid.org/documentation/
- Developer Tools: https://orcid.org/developer-tools
- Guia completo: Ver ORCID_SETUP.md

## ✨ Features Implementadas

✅ Login com ORCID  
✅ Registro com ORCID  
✅ Vinculação de ORCID a conta existente  
✅ Criação automática de usuário  
✅ Badge visual quando vinculado  
✅ Busca de perfil (nome, email)  
✅ Suporte sandbox + produção  
✅ Tratamento de erros  
✅ Redirect automático após login  
✅ Armazenamento seguro de orcidId  

🎉 Sistema 100% funcional!
