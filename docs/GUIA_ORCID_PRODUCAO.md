# 🆔 CONFIGURAÇÃO ORCID OAUTH - PRODUÇÃO OFICIAL

**Data:** 16 de Outubro de 2025  
**Ambiente:** PRODUÇÃO (ORCID.org - não sandbox)

---

## 📋 PASSO A PASSO PARA REGISTRAR NO ORCID OFICIAL

### **1. Criar Conta ORCID (se não tiver)**
1. Acesse: https://orcid.org/register
2. Preencha seus dados
3. Confirme o email
4. Anote seu ORCID iD (ex: 0000-0002-1234-5678)

---

### **2. Registrar Aplicação OAuth**

1. **Faça login em:** https://orcid.org/signin

2. **Acesse Developer Tools:**
   - URL direta: https://orcid.org/developer-tools
   - Ou: Menu → Developer Tools

3. **Clique em "Register for the free Public API"**

4. **Preencha o formulário:**

   ```
   Application Name: HPO Translation Platform
   
   Application Website: https://hpo.raras-cplp.org
   
   Description: 
   Collaborative platform for translating Human Phenotype Ontology (HPO) 
   terms to Portuguese for the CPLP community. Researchers can contribute 
   translations, validate entries, and earn gamification badges.
   
   Redirect URIs (IMPORTANTE - adicione AMBOS):
   - https://hpo.raras-cplp.org/api/auth/orcid/callback
   - http://localhost:3001/api/auth/orcid/callback
   
   (Adicione os dois separadamente, um por vez)
   ```

5. **Aceite os termos de uso**

6. **Clique em "Save"**

---

### **3. Copiar Credenciais**

Após salvar, você verá:

```
Client ID: APP-XXXXXXXXXXXXXXXX
Client Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** 
- Copie AMBOS imediatamente
- O Client Secret só aparece UMA VEZ
- Se perder, terá que gerar novo

---

## 🔧 CONFIGURAÇÃO LOCAL

### **1. Atualizar `.env` do Backend**

Abra: `hpo-platform-backend/.env`

Atualize as linhas do ORCID:

```env
# ORCID OAuth - PRODUÇÃO OFICIAL
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"
```

### **2. Atualizar `.env.production` do Backend**

Abra: `hpo-platform-backend/.env.production`

```env
# ORCID OAuth - PRODUÇÃO OFICIAL
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"
```

---

## 🧪 TESTAR LOCALMENTE

### **1. Iniciar Backend Local**

```powershell
cd hpo-platform-backend
npm run dev
```

### **2. Iniciar Frontend Local**

```powershell
cd plataforma-raras-cpl
npm run dev
```

### **3. Testar Login ORCID**

1. Abra: http://localhost:5173
2. Clique em "Login com ORCID iD"
3. Será redirecionado para ORCID.org (oficial)
4. Faça login com sua conta ORCID
5. Autorize a aplicação
6. Será redirecionado de volta para localhost
7. Deve estar logado!

---

## 📤 ATUALIZAR NO SERVIDOR

Depois de testar localmente:

### **1. Atualizar .env no Servidor**

```powershell
# Criar arquivo temporário com as credenciais
$orcidConfig = @"
ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ORCID_REDIRECT_URI=https://hpo.raras-cplp.org/api/auth/orcid/callback
"@

# Enviar para o servidor
$orcidConfig | ssh ubuntu@200.144.254.4 "cat >> /var/www/html/hpo-platform/backend/.env"
```

**OU manualmente via SSH:**

```bash
ssh ubuntu@200.144.254.4
nano /var/www/html/hpo-platform/backend/.env

# Adicione as linhas:
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
ORCID_REDIRECT_URI="https://hpo.raras-cplp.org/api/auth/orcid/callback"

# Salve: Ctrl+O, Enter, Ctrl+X
```

### **2. Reiniciar Backend no Servidor**

```powershell
ssh ubuntu@200.144.254.4 "pm2 restart hpo-backend"
```

### **3. Verificar Logs**

```powershell
ssh ubuntu@200.144.254.4 "pm2 logs hpo-backend --lines 20"
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### **Localmente:**

```powershell
# Testar endpoint ORCID
curl http://localhost:3001/api/auth/orcid
```

Deve retornar um redirect para ORCID.org

### **No Servidor:**

```powershell
# Testar endpoint ORCID
curl https://hpo.raras-cplp.org/api/auth/orcid
```

---

## 📊 URLS ORCID IMPORTANTES

- **Login oficial:** https://orcid.org/signin
- **Developer Tools:** https://orcid.org/developer-tools
- **API Docs:** https://info.orcid.org/documentation/api-tutorials/
- **OAuth Flow:** https://info.orcid.org/documentation/integration-guide/working-with-oauth/

---

## 🛡️ SEGURANÇA

### **O que o ORCID OAuth faz:**

✅ Autentica usuários com suas credenciais ORCID  
✅ Obtém ORCID iD do usuário (ex: 0000-0002-1234-5678)  
✅ Obtém nome completo do pesquisador  
✅ Garante identidade acadêmica verificada  

### **O que NÃO faz:**

❌ Não publica nada no perfil ORCID do usuário  
❌ Não acessa trabalhos/publicações (só leitura de ID público)  
❌ Não modifica nada na conta ORCID  

### **Permissões solicitadas:**

```
/authenticate - Apenas autentica e obtém ORCID iD público
```

---

## 🐛 TROUBLESHOOTING

### **Erro: "Invalid redirect_uri"**
- Verifique se adicionou exatamente:
  - `https://hpo.raras-cplp.org/api/auth/orcid/callback`
  - `http://localhost:3001/api/auth/orcid/callback`
- Sem barra final `/`
- Protocolo correto (http vs https)

### **Erro: "Invalid client_id"**
- Verifique se copiou o Client ID completo
- Deve começar com `APP-`

### **Erro: "Invalid client_secret"**
- Se perdeu o secret, gere um novo em Developer Tools
- Clique em "Reset client secret"

### **Erro: "Backend Offline"**
- Verifique se backend está rodando: `npm run dev`
- Verifique a porta: deve ser 3001 localmente

---

## ✅ CHECKLIST

- [ ] Conta ORCID criada e verificada
- [ ] Aplicação registrada em https://orcid.org/developer-tools
- [ ] Client ID e Secret copiados
- [ ] Redirect URIs configurados (localhost + produção)
- [ ] `.env` local atualizado
- [ ] Backend local testado
- [ ] Login ORCID funcionando localmente
- [ ] `.env` do servidor atualizado
- [ ] Backend do servidor reiniciado
- [ ] Login ORCID testado em produção

---

## 📝 PRÓXIMOS PASSOS

Depois de configurar:

1. ✅ Teste localmente primeiro
2. ✅ Confirme que login funciona
3. ✅ Atualize servidor
4. ✅ Teste em produção
5. 🎉 Divulgue para a comunidade CPLP!

---

**Qualquer dúvida, consulte a documentação oficial:**  
https://info.orcid.org/documentation/

**Ou me chame que eu te ajudo! 🚀**
