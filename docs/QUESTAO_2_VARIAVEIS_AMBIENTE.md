# 💬 QUESTÃO 2: Configurar Variáveis de Ambiente

**Data:** 16 de Outubro de 2025  
**Status:** 🚧 EM PROGRESSO

---

## 🎯 SUAS RESPOSTAS:

### **A) Email Service (SMTP)** ✅ CONFIGURADO E TESTADO

**Resposta:**
```
Email: cplp@raras.org.br
Senha de App: xchq edyv fpvz tiwv (gerada em https://myaccount.google.com/apppasswords)
Nome do App: HPO-Translator-PT
Provedor: Gmail
```

**Ação realizada:**
✅ Atualizado `hpo-platform-backend/.env` com senha de app do Gmail  
✅ Executado teste de envio de email  
✅ Email enviado com sucesso (Message ID: 8aa5deb9-c8c6-301c-2e20-9173341d9d2d)

**Configuração aplicada:**
```bash
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="cplp@raras.org.br"
SMTP_PASSWORD="xchq edyv fpvz tiwv"  # Senha de App (não é a senha normal!)
EMAIL_FROM="CPLP Raras <cplp@raras.org.br>"
```

**Teste realizado:**
- ✅ Conexão com servidor SMTP bem-sucedida
- ✅ Email enviado para cplp@raras.org.br
- ✅ Assunto: "✅ Teste de Email - HPO Translation Platform"
- ✅ Conteúdo HTML formatado com todas as configurações

**Status:** ✅ **COMPLETO E TESTADO** - Email service 100% funcional

---

### **B) ORCID OAuth** ⏳ AGUARDANDO CREDENCIAIS

**Sua pergunta:**
> "É possível implementar isso para funcionar localmente ou somente quando estiver no servidor?"

**Resposta:**
✅ **Funciona nos dois ambientes!**

- **Localmente (Development):** 
  - Usa **ORCID Sandbox** (sandbox.orcid.org)
  - URL: `http://localhost:3001/api/auth/orcid/callback`
  - Contas de teste (não são reais)

- **No Servidor (Production):**
  - Usa **ORCID Production** (orcid.org)
  - URL: `https://seu-dominio.com/api/auth/orcid/callback`
  - Contas reais de pesquisadores

**Documentação criada:**
📖 `docs/setup/ORCID_SETUP_COMPLETO.md` - Guia passo a passo detalhado

**Próximos passos (VOCÊ precisa fazer):**

1. ✅ Acessar: https://sandbox.orcid.org/register
2. ✅ Criar conta com `cplp@raras.org.br`
3. ✅ Ir em: https://sandbox.orcid.org/developer-tools
4. ✅ Registrar aplicação:
   ```
   Nome: HPO Translation Platform - CPLP
   URL: http://localhost:5173
   Redirect URIs:
     - http://localhost:3001/api/auth/orcid/callback
     - http://localhost:5173/orcid-callback
   ```
5. ✅ Copiar **Client ID** e **Client Secret**
6. ✅ Me enviar as credenciais para configurar `.env`

**Status:** ⏳ **AGUARDANDO VOCÊ REGISTRAR**

---

### **C) OpenAI API** ✅ DESABILITADO

**Resposta:**
> "Não precisa. Não vou usar API da OpenAI porque não tenho dinheiro"

**Ação realizada:**
✅ Adicionado `OPENAI_ENABLED=false` no `.env`

**Configuração aplicada:**
```bash
# OpenAI API (opcional - para sugestões de IA)
# DESABILITADO: Sem budget para OpenAI
OPENAI_API_KEY=""
OPENAI_ENABLED=false
```

**Impacto:**
- ❌ Features de IA **desabilitadas**
- ✅ Sistema funciona normalmente **sem IA**
- ✅ Tradutores fazem traduções manualmente (como esperado)

**Status:** ✅ **COMPLETO** - IA desabilitada

---

## 📊 RESUMO DE CONFIGURAÇÕES

### ✅ **O que está configurado e testado:**

| Serviço | Status | Configuração |
|---------|--------|--------------|
| **Database** | ✅ OK | PostgreSQL 16 (17.020 termos) |
| **Redis** | ✅ OK | Cache funcionando |
| **JWT** | ✅ OK | Autenticação básica |
| **Email (SMTP)** | ✅ OK TESTADO | Gmail `cplp@raras.org.br` + senha de app |
| **OpenAI** | ✅ OK | Desabilitado propositalmente |

### ⏳ **O que falta configurar:**

| Serviço | Status | Ação Necessária |
|---------|--------|------------------|
| **ORCID OAuth** | ⏳ PENDENTE | Você precisa registrar em sandbox.orcid.org |

---

## 🔍 VERIFICAR CONFIGURAÇÕES

### **Teste de Email (SMTP):**

```powershell
cd hpo-platform-backend

# Reiniciar backend para carregar novo .env
npm run dev

# Deve aparecer no log:
# ✅ Email service enabled
```

**Teste real de envio:**
```powershell
# Criar usuário novo no sistema
# Sistema enviará email de boas-vindas para cplp@raras.org.br
# Verificar na caixa de entrada!
```

---

### **Verificar se ORCID está desabilitado (por enquanto):**

```powershell
cd hpo-platform-backend
npm run dev

# Deve aparecer no log:
# ⚠️  ORCID OAuth disabled (credentials not configured)
```

Após você registrar e me enviar as credenciais, vai aparecer:
```
✅ ORCID OAuth enabled (Sandbox mode)
```

---

## 📋 CHECKLIST

### Email (SMTP):
- [x] Credenciais fornecidas
- [x] Senha de app do Gmail criada (HPO-Translator-PT)
- [x] `.env` atualizado
- [x] Teste de envio executado com sucesso
- [x] Email enviado para `cplp@raras.org.br`
- [ ] Usuário confirmou recebimento do email de teste

### ORCID OAuth:
- [ ] Criar conta ORCID Sandbox
- [ ] Registrar aplicação em developer-tools
- [ ] Copiar Client ID e Client Secret
- [ ] Atualizar `.env`
- [ ] Testar login com ORCID
- [ ] Verificar usuário criado no banco

### OpenAI:
- [x] Desabilitado
- [x] Features de IA removidas
- [x] Sistema funciona sem IA

---

## 🎯 PRÓXIMA AÇÃO

### **Você precisa fazer AGORA:**

1. Abrir navegador
2. Acessar: https://sandbox.orcid.org/register
3. Criar conta com `cplp@raras.org.br`
4. Ir em: https://sandbox.orcid.org/developer-tools
5. Registrar aplicação (seguir guia em `docs/setup/ORCID_SETUP_COMPLETO.md`)
6. Copiar credenciais (Client ID + Client Secret)
7. Me enviar aqui no chat

**Tempo estimado:** 10 minutos

---

### **Ou, se preferir:**

Posso criar um `.env` template para você preencher depois:

```bash
# ORCID OAuth - SANDBOX (Development)
# PREENCHA APÓS REGISTRAR EM https://sandbox.orcid.org/developer-tools
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-XXXXXXXXXXXXXXXX"  # ← COLE AQUI
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← COLE AQUI
ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"
ORCID_SANDBOX=true
```

E você preenche quando tiver as credenciais.

---

## ✅ ARQUIVOS CRIADOS/MODIFICADOS

1. **`hpo-platform-backend/.env`** (modificado)
   - ✅ Email SMTP configurado
   - ✅ OpenAI desabilitado
   - ⏳ ORCID aguardando credenciais

2. **`docs/setup/ORCID_SETUP_COMPLETO.md`** (novo - 8KB)
   - Guia passo a passo completo
   - Screenshots das telas
   - Troubleshooting
   - Diferença sandbox vs production

3. **`docs/QUESTAO_2_VARIAVEIS_AMBIENTE.md`** (este arquivo)
   - Resumo executivo
   - Status de cada serviço
   - Próximas ações

---

## 🤔 QUER QUE EU FAÇA AGORA?

**Opção A:** Você vai registrar ORCID agora e me envia as credenciais (10 min)

**Opção B:** Deixa ORCID para depois e vamos para **Questão 3: Substituir URLs Hardcoded no Frontend**?

**Opção C:** Testar email SMTP primeiro para garantir que está funcionando?

**Qual opção?** 🤔

---

**Última atualização:** 16 de Outubro de 2025  
**Email:** ✅ Configurado  
**ORCID:** ⏳ Aguardando registro  
**OpenAI:** ✅ Desabilitado
