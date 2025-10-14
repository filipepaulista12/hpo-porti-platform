# 🔧 ORCID Sandbox vs Production - Guia Completo

## ❓ O Problema: ORCID Production não aceita localhost

Você está certo! O ORCID **production** (orcid.org) não aceita URLs localhost por questões de segurança.

## ✅ SOLUÇÃO: Use ORCID Sandbox para Desenvolvimento

### O que é ORCID Sandbox?

- **Ambiente de testes** oficial do ORCID
- **Aceita localhost** ✅
- **Funcionalidade idêntica** ao production
- **Gratuito** e sem limitações
- **ORCIDs separados** (não mistura com production)

---

## 🚀 CONFIGURAÇÃO RECOMENDADA

### **AGORA - Desenvolvimento Local (Sandbox)**

#### 1. Criar conta no Sandbox
- Acesse: https://sandbox.orcid.org/register
- Crie um usuário de teste
- Confirme o email

#### 2. Registrar aplicação no Sandbox
- Acesse: https://sandbox.orcid.org/developer-tools
- Preencha:
  - **Nome**: HPO-PT Translation Platform (Dev)
  - **URL**: http://localhost:5173
  - **Descrição**: Plataforma de tradução colaborativa HPO
  - **Redirect URI**: http://localhost:3001/api/auth/orcid/callback ✅

#### 3. Configurar .env (Sandbox)
```bash
# ORCID Sandbox - Desenvolvimento
ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ORCID_REDIRECT_URI=http://localhost:3001/api/auth/orcid/callback

# Usar sandbox
NODE_ENV=development

# Frontend local
FRONTEND_URL=http://localhost:5173
```

#### 4. Testar localmente
- Sistema 100% funcional
- Login com ORCID Sandbox
- Desenvolvimento completo

---

### **DEPOIS - Produção (quando fizer deploy)**

#### 1. Ter infraestrutura pronta
- ✅ Servidor (AWS, Azure, DigitalOcean, etc.)
- ✅ Domínio configurado (ex: hpo-pt.exemplo.com)
- ✅ **HTTPS configurado** (obrigatório!)
- ✅ PostgreSQL em produção
- ✅ Node.js instalado

#### 2. Registrar no ORCID Production
- Acesse: https://orcid.org/developer-tools
- Preencha com URLs reais:
  - **URL**: https://hpo-pt.seu-dominio.com
  - **Redirect URI**: https://hpo-pt.seu-dominio.com/api/auth/orcid/callback

#### 3. Configurar .env (Production)
```bash
# ORCID Production
ORCID_CLIENT_ID=APP-PROD-XXXXXXXXXX
ORCID_CLIENT_SECRET=prod-secret-xxxxx
ORCID_REDIRECT_URI=https://hpo-pt.seu-dominio.com/api/auth/orcid/callback

# Usar production
NODE_ENV=production

# Frontend em produção
FRONTEND_URL=https://hpo-pt.seu-dominio.com
```

---

## 🎯 ESTRATÉGIA RECOMENDADA

### Fase 1: Desenvolvimento (AGORA) - 2-4 semanas
- ✅ ORCID Sandbox + localhost
- ✅ Desenvolver todas as features
- ✅ Testar completamente
- ✅ Convide alguns beta testers para usar localmente ou em sandbox
- ✅ Documentação completa

### Fase 2: Preparação para Produção - 1 semana
- 🛠️ Escolher provedor de servidor (recomendo: DigitalOcean ou Railway)
- 🛠️ Configurar domínio
- 🛠️ Setup PostgreSQL em produção (ou usar serviço gerenciado)
- 🛠️ Configurar HTTPS (Let's Encrypt gratuito)
- 🛠️ Testar deploy

### Fase 3: Lançamento - 1-2 dias
- 🚀 Registrar no ORCID Production
- 🚀 Deploy do código
- 🚀 Migração de dados (se houver)
- 🚀 Monitoramento
- 🚀 Abrir para comunidade

---

## 💰 CUSTOS ESTIMADOS (Produção)

### Opção Budget (mais barato):
- **Railway.app** ou **Render.com**: $5-20/mês
- **PostgreSQL gerenciado**: $7-15/mês (Railway/Supabase)
- **Domínio**: $10-15/ano
- **HTTPS**: Grátis (Let's Encrypt)
- **TOTAL**: ~$20-40/mês

### Opção Profissional:
- **DigitalOcean Droplet**: $12/mês (2GB RAM)
- **Managed PostgreSQL**: $15/mês
- **Domínio**: $10-15/ano
- **CDN Cloudflare**: Grátis
- **TOTAL**: ~$30-35/mês

---

## 🔄 MIGRAÇÃO SANDBOX → PRODUCTION

Quando fizer deploy, é super simples:

1. **No ORCID**: Registrar nova app em production
2. **No código**: Trocar 3 variáveis no .env:
   ```bash
   ORCID_CLIENT_ID=APP-NOVO-ID
   ORCID_CLIENT_SECRET=novo-secret
   NODE_ENV=production
   ```
3. **Código**: NÃO precisa mudar nada! ✅

---

## ✅ PRÓXIMOS PASSOS RECOMENDADOS

### AGORA (Continue desenvolvendo):
1. ✅ Registre no **ORCID Sandbox** (aceita localhost)
2. ✅ Implemente features avançadas:
   - Histórico de traduções
   - Filtros e busca
   - Exportação de dados
   - Dashboard admin
3. ✅ Teste tudo localmente
4. ✅ Documente o sistema

### QUANDO ESTIVER PRONTO:
1. 🚀 Escolha provedor de hospedagem
2. 🚀 Configure domínio + HTTPS
3. 🚀 Registre no ORCID Production
4. 🚀 Faça deploy
5. 🚀 Lance oficialmente!

---

## 🎓 ANALOGIA

É como desenvolver um app mobile:

- **Sandbox = Emulador/Device de teste**
  - Desenvolve localmente
  - Testa tudo
  - Iteração rápida

- **Production = App Store/Play Store**
  - Só publica quando está pronto
  - Usuários reais
  - Processo mais formal

---

## 📞 DECISÃO: O que você prefere?

### A) Continue com Sandbox agora (RECOMENDADO)
- Desenvolva todas as features
- Teste completamente
- Deploy quando estiver 100% pronto
- **Tempo**: 2-4 semanas de desenvolvimento
- **Custo agora**: $0

### B) Deploy em produção agora
- Precisa de servidor + domínio JÁ
- Registra ORCID Production
- Sistema já acessível publicamente
- **Tempo**: 2-3 dias de setup
- **Custo**: ~$20-40/mês a partir de agora

---

## ✨ MINHA RECOMENDAÇÃO FINAL

**Use ORCID Sandbox + Continue desenvolvendo features**

PORQUE:
1. ✅ Sistema já está 90% pronto
2. ✅ ORCID Sandbox funciona perfeitamente para dev
3. ✅ Você pode adicionar mais 3-4 features legais
4. ✅ Testa com usuários beta localmente
5. ✅ Quando lançar em produção, vai estar PERFEITO

**Depois de 2-3 semanas**, quando tiver:
- ✅ Todas as features implementadas
- ✅ Tudo testado
- ✅ Documentação completa
- ✅ Alguns beta testers satisfeitos

AÍ SIM → Deploy produção + ORCID Production + Lançamento oficial! 🎉

---

**O que você acha? Quer continuar com sandbox e desenvolver mais features, ou prefere fazer deploy em produção agora?**
