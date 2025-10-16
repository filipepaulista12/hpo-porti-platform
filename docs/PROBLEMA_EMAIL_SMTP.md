# 🔒 PROBLEMA: Gmail bloqueou acesso SMTP

**Data:** 16 de Outubro de 2025  
**Status:** ❌ ERRO DE AUTENTICAÇÃO

---

## ❌ O QUE ACONTECEU:

Tentamos enviar email de teste e recebemos este erro:

```
❌ ERRO DE AUTENTICAÇÃO
Error: Invalid login: 534-5.7.9 Application-specific password required
```

**Tradução:** O Gmail bloqueou o acesso porque a conta `cplp@raras.org.br` tem **verificação em 2 etapas** ativada.

---

## ✅ SOLUÇÃO: Criar "Senha de App" no Gmail

### **O que é uma "Senha de App"?**

É uma senha especial de 16 caracteres que o Gmail gera para aplicativos que não suportam verificação em 2 etapas (como nosso backend).

**Importante:** Não é a senha normal da conta! É uma senha separada só para aplicativos.

---

## 🔧 COMO CRIAR A SENHA DE APP (Passo a Passo):

### **Opção A: Acesso Rápido** (Recomendado)

1. ✅ Acesse diretamente: https://myaccount.google.com/apppasswords

2. ✅ Faça login com `cplp@raras.org.br` (pode pedir a senha normal + código de verificação)

3. ✅ Na tela "Senhas de app":
   - **Nome do app:** `HPO Translation Platform`
   - Clique em **"Criar"**

4. ✅ Vai aparecer uma senha de 16 caracteres assim:
   ```
   abcd efgh ijkl mnop
   ```

5. ✅ **COPIE essa senha** (com ou sem espaços, tanto faz)

6. ✅ Me envie aqui no chat:
   ```
   A senha de app é: abcd efgh ijkl mnop
   ```

7. ✅ Eu vou configurar no `.env` e testar novamente

---

### **Opção B: Passo a Passo Detalhado**

Se o link direto não funcionar:

1. ✅ Acesse: https://myaccount.google.com/
2. ✅ Faça login com `cplp@raras.org.br`
3. ✅ Clique em **"Segurança"** (menu lateral)
4. ✅ Role até **"Como fazer login no Google"**
5. ✅ Clique em **"Verificação em duas etapas"**
6. ✅ Role até o final da página
7. ✅ Clique em **"Senhas de app"**
8. ✅ Digite um nome: `HPO Translation Platform`
9. ✅ Clique em **"Criar"**
10. ✅ Copie a senha gerada (16 caracteres)
11. ✅ Me envie aqui

---

## 🚫 SE NÃO CONSEGUIR CRIAR SENHA DE APP:

### **Causa 1: Verificação em 2 etapas desativada**

Se você **NÃO** tem verificação em 2 etapas:

1. ✅ Acesse: https://myaccount.google.com/signinoptions/two-step-verification
2. ✅ Ative a **Verificação em duas etapas**
3. ✅ Depois, volte para criar a Senha de App

---

### **Causa 2: Conta de organização (Google Workspace)**

Se `cplp@raras.org.br` é uma conta empresarial/organização:

**Problema:** O administrador pode ter bloqueado "Senhas de app"

**Soluções:**

**A) Falar com administrador:**
- Pedir para liberar "Senhas de app" para sua conta
- Ou criar uma conta de serviço específica para emails

**B) Usar SMTP OAuth2 (mais complexo):**
- Usa tokens ao invés de senha
- Mais seguro, mas complexo de configurar
- Posso te ajudar se necessário

**C) Usar outro provedor de email:**
- Outlook/Hotmail (mais fácil)
- SendGrid (gratuito até 100 emails/dia)
- Mailgun (gratuito até 5.000 emails/mês)
- Brevo (ex-Sendinblue, gratuito até 300 emails/dia)

---

## 🔄 ALTERNATIVAS SE O GMAIL NÃO FUNCIONAR:

### **1) Outlook/Hotmail (Mais Fácil)**

Se você tem uma conta Outlook/Hotmail:

```bash
# No .env:
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="seu-email@outlook.com"
SMTP_PASSWORD="sua-senha-normal"  # ← Não precisa de senha de app!
EMAIL_FROM="HPO CPLP <seu-email@outlook.com>"
```

**Vantagem:** Outlook aceita senha normal (sem senha de app)

---

### **2) SendGrid (Gratuito, Profissional)**

**Plano gratuito:** 100 emails/dia (suficiente para testes)

1. ✅ Criar conta: https://signup.sendgrid.com/
2. ✅ Verificar email
3. ✅ Criar API Key em: https://app.sendgrid.com/settings/api_keys
4. ✅ Configurar:

```bash
# No .env:
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"  # ← Literalmente "apikey"
SMTP_PASSWORD="SG.xxxxx"  # ← Sua API Key
EMAIL_FROM="HPO CPLP <cplp@raras.org.br>"
```

**Vantagem:** 
- Profissional
- Estatísticas de emails enviados
- Melhor entregabilidade

---

### **3) Mailtrap (Só para Testes)**

**Perfeito para desenvolvimento!** Captura emails sem enviar de verdade.

1. ✅ Criar conta: https://mailtrap.io/register
2. ✅ Copiar credenciais SMTP
3. ✅ Configurar no `.env`

**Vantagem:** Não precisa de email real, só para testar

---

## 🤔 O QUE VOCÊ PREFERE?

### **Opção 1:** Criar senha de app do Gmail
- ✅ Usa o email `cplp@raras.org.br` (o certo)
- ⏱️ 5 minutos
- 🔒 Precisa acessar a conta Gmail

### **Opção 2:** Usar Outlook/Hotmail (se tiver conta)
- ✅ Mais fácil (senha normal)
- ⚠️ Mas não usa o email `cplp@raras.org.br`

### **Opção 3:** Criar conta SendGrid (gratuita)
- ✅ Profissional
- ✅ Pode enviar de `cplp@raras.org.br`
- ⏱️ 10 minutos

### **Opção 4:** Usar Mailtrap (só testes)
- ✅ Rápido (2 minutos)
- ⚠️ Não envia emails de verdade
- ✅ Perfeito para ver se o sistema funciona

---

## 📋 RESUMO:

**Para PRODUÇÃO (servidor):**
- Gmail com senha de app OU SendGrid

**Para DESENVOLVIMENTO (local):**
- Mailtrap (recomendado) OU Gmail com senha de app

---

## ❓ ME RESPONDA:

**1) Você consegue acessar a conta `cplp@raras.org.br` no Gmail?**
- [ ] Sim, tenho acesso total
- [ ] Não, é conta de organização/empresa
- [ ] Não sei a senha

**2) O que você prefere fazer?**
- [ ] A) Criar senha de app do Gmail (5 min)
- [ ] B) Usar SendGrid (gratuito, profissional, 10 min)
- [ ] C) Usar Mailtrap só para testes (2 min)
- [ ] D) Deixar email para depois (quando for para produção)

---

**Qual opção você escolhe?** 🤔

---

**Última atualização:** 16 de Outubro de 2025  
**Erro:** Autenticação SMTP bloqueada  
**Causa:** Verificação em 2 etapas ativa  
**Solução:** Senha de app ou provedor alternativo
