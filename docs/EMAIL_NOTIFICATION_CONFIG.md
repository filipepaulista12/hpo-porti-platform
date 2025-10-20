# Email Notification Service

## 📧 Configuração SMTP

Este serviço envia notificações por email usando Nodemailer.

### Instalação

```bash
cd hpo-platform-backend
npm install nodemailer @types/nodemailer
```

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cplp@raras.org.br
SMTP_PASSWORD=xchq edyv fpvz tiwv
EMAIL_FROM=CPLP Raras <cplp@raras.org.br>
```

**Nota**: A senha SMTP é uma "App Password" do Gmail (16 caracteres com espaços).

### Gmail - App Password

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "App": Mail
3. Selecione "Device": Other (Custom name) → "HPO Backend"
4. Copie a senha gerada (16 caracteres)
5. Use como `SMTP_PASS` no .env

### SendGrid (Alternativa)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
```

Obtenha API Key em: https://app.sendgrid.com/settings/api_keys

## 🚀 Uso

```typescript
import EmailService from './services/email.service';

// Enviar notificação de tradução aprovada
await EmailService.sendTranslationApprovedEmail({
  to: 'translator@example.com',
  translatorName: 'João Silva',
  termLabel: 'Abnormal nervous system morphology',
  termId: 'HP:0012443'
});

// Enviar notificação de conflito
await EmailService.sendConflictAssignedEmail({
  to: 'reviewer@example.com',
  reviewerName: 'Maria Santos',
  termLabel: 'Seizure',
  termId: 'HP:0001250',
  conflictUrl: 'http://hpo.raras-cplp.org/conflicts/abc123'
});
```

## 📨 Tipos de Email

1. **Translation Approved** - Tradução aceita por revisor
2. **Translation Rejected** - Tradução rejeitada
3. **Conflict Assigned** - Novo conflito atribuído
4. **Comment Mention** - Mencionado em comentário
5. **Level Up** - Subiu de nível
6. **Strike Warning** - Aviso de strike
7. **Role Promoted** - Promovido a novo cargo

## 🧪 Testes

```bash
# Testar envio de email
npm run test:email

# Ou via curl
curl -X POST http://localhost:3001/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "seu-email@example.com"}'
```

## ⚙️ Configuração de Produção

### PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hpo-backend',
    script: 'dist/server.js',
    env: {
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: 587,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      EMAIL_ENABLED: 'true'
    }
  }]
};
```

### Apache Reverse Proxy

Adicione ao `.htaccess` se necessário permitir conexões SMTP:

```apache
# Allow outbound SMTP connections
php_flag allow_url_fopen On
```

## 🛡️ Segurança

- ❌ **NÃO** commite credenciais SMTP no Git
- ✅ Use variáveis de ambiente
- ✅ App Passwords em vez de senha da conta
- ✅ Rate limiting (max 100 emails/hora)
- ✅ Validação de destinatário
- ✅ Templates sanitizados contra XSS

## 📊 Monitoramento

Logs são salvos em `logs/email.log`:

```
[2025-10-19 14:30:15] ✅ Email sent to translator@example.com - Translation Approved
[2025-10-19 14:31:22] ❌ Failed to send email to invalid@example.com - SMTP Error
```

## 🔧 Troubleshooting

### Erro: "Invalid login"
- Verifique SMTP_USER e SMTP_PASS
- Gmail: Use App Password, não senha da conta
- Verifique se 2FA está ativado

### Erro: "Connection timeout"
- Verifique firewall do servidor
- Porta 587 (TLS) deve estar aberta
- Tente SMTP_PORT=465 com SMTP_SECURE=true

### Emails não chegam
- Verifique spam folder
- Whitelist: noreply@raras-cplp.org
- Verifique logs: `cat logs/email.log`

## 📞 Suporte

**Email**: devops@raras-cplp.org  
**Issues**: https://github.com/seu-repo/issues (tag: email)
