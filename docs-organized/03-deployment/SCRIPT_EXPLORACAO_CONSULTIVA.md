# 🔍 SCRIPT DE EXPLORAÇÃO CONSULTIVA - Servidor PORTI-HPO

**Objetivo:** Explorar servidor SEM fazer alterações  
**Modo:** READ-ONLY (apenas leitura)  
**Data:** 19 de Outubro de 2025

---

## 🎯 OBJETIVO

Entender a estrutura atual do servidor antes de substituir a aplicação antiga pela nova versão do GitHub.

**⚠️ REGRA DE OURO:** NÃO mexer em NADA! Apenas OLHAR e DOCUMENTAR.

---

## 📋 CHECKLIST DE EXPLORAÇÃO

Execute os comandos abaixo NA ORDEM e documente os resultados.

---

## 1️⃣ CONECTAR NO SERVIDOR

```bash
# Conectar via SSH
ssh ubuntu@200.144.254.4

# Se pedir senha, usar: vFpyJS4FA
```

✅ **Resultado esperado:** Conectado no servidor `ciis`

---

## 2️⃣ VERIFICAR RECURSOS DISPONÍVEIS

```bash
# Uso de disco
echo "=== DISCO ===" && df -h | grep -E '(Filesystem|/dev/)'

# Uso de RAM
echo -e "\n=== RAM ===" && free -h

# Processos consumindo mais recursos
echo -e "\n=== TOP 10 PROCESSOS ===" && ps aux --sort=-%mem | head -11
```

📝 **Documentar:**
- Quanto de disco livre? (min 2GB necessário)
- Quanto de RAM livre?
- Algum processo consumindo muito?

---

## 3️⃣ VERIFICAR PM2

```bash
# Listar processos PM2
echo "=== PM2 PROCESSOS ===" && pm2 list

# Detalhes do HPO backend
echo -e "\n=== HPO BACKEND INFO ===" && pm2 info hpo-backend 2>/dev/null || echo "Processo hpo-backend não encontrado"

# Logs recentes (últimas 30 linhas)
echo -e "\n=== LOGS HPO BACKEND ===" && pm2 logs hpo-backend --lines 30 --nostream 2>/dev/null || echo "Sem logs"
```

📝 **Documentar:**
- HPO backend está rodando?
- Qual porta está usando?
- Quantos restarts?
- Algum erro nos logs?

---

## 4️⃣ VERIFICAR ESTRUTURA DE ARQUIVOS

```bash
# Pasta principal
echo "=== /var/www/html/ ===" && ls -la /var/www/html/

# Estrutura HPO atual
echo -e "\n=== HPO PLATFORM ===" && ls -la /var/www/html/hpo-platform/ 2>/dev/null || echo "Pasta hpo-platform não existe"

# Backend
echo -e "\n=== BACKEND ===" && ls -la /var/www/html/hpo-platform/backend/ 2>/dev/null | head -20

# Frontend servido
echo -e "\n=== FRONTEND PUBLIC ===" && ls -la /var/www/html/hpo-platform/public/ 2>/dev/null | head -15
```

📝 **Documentar:**
- Pasta `/var/www/html/hpo-platform/` existe?
- Tem backend e public?
- Quais arquivos estão lá?

---

## 5️⃣ VERIFICAR APACHE

```bash
# VirtualHosts configurados
echo "=== APACHE VIRTUAL HOSTS ===" && sudo apache2ctl -S 2>/dev/null | grep -A 5 "hpo"

# Configuração do site HPO
echo -e "\n=== HPO CONFIG ===" && cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf 2>/dev/null || echo "Config não encontrado"

# Status do Apache
echo -e "\n=== APACHE STATUS ===" && sudo systemctl status apache2 | head -20
```

📝 **Documentar:**
- Apache está rodando?
- VirtualHost `hpo.raras-cplp.org` está configurado?
- Qual DocumentRoot?
- Qual ProxyPass (porta do backend)?

---

## 6️⃣ VERIFICAR POSTGRESQL

```bash
# Status PostgreSQL
echo "=== POSTGRESQL STATUS ===" && sudo systemctl status postgresql | head -10

# Conectar e verificar database
echo -e "\n=== DATABASE INFO ===" && psql -U hpo_user -d hpo_platform -c "\dt" 2>/dev/null || echo "Erro ao conectar (pode precisar senha)"

# Contar termos HPO
echo -e "\n=== CONTAR TERMOS HPO ===" && psql -U hpo_user -d hpo_platform -c 'SELECT COUNT(*) FROM "HpoTerm";' 2>/dev/null || echo "Erro ao consultar"
```

📝 **Documentar:**
- PostgreSQL rodando?
- Database `hpo_platform` existe?
- Quantos termos HPO tem?
- Quantos usuários?

---

## 7️⃣ VERIFICAR PORTAS EM USO

```bash
# Listar portas
echo "=== PORTAS EM USO ===" && sudo netstat -tulpn | grep LISTEN | grep -E "(3001|3002|5432|80|443)"
```

📝 **Documentar:**
- Porta 3002 está em uso? (HPO backend)
- Porta 3001 em uso? (CPLP backend)
- Porta 80/443 em uso? (Apache)
- Porta 5432 em uso? (PostgreSQL)

---

## 8️⃣ VERIFICAR VARIÁVEIS DE AMBIENTE

```bash
# Ver .env do backend (SEM mostrar senhas)
echo "=== BACKEND .env ===" && cat /var/www/html/hpo-platform/backend/.env 2>/dev/null | grep -v PASSWORD | grep -v SECRET || echo "Arquivo .env não encontrado"

# Ver ecosystem.config.js
echo -e "\n=== PM2 CONFIG ===" && cat /var/www/html/hpo-platform/backend/ecosystem.config.js 2>/dev/null || echo "ecosystem.config.js não encontrado"
```

📝 **Documentar:**
- Qual PORT configurado?
- Qual DATABASE_URL?
- NODE_ENV=production?
- Alguma config importante?

---

## 9️⃣ TESTAR BACKEND

```bash
# Health check
echo "=== BACKEND HEALTH ===" && curl -s http://localhost:3002/health 2>/dev/null || echo "Backend não responde"

# Testar API
echo -e "\n=== API TEST ===" && curl -s http://localhost:3002/api/terms/count 2>/dev/null | head -5 || echo "API não responde"
```

📝 **Documentar:**
- Backend responde no health?
- API retorna dados?
- Algum erro?

---

## 🔟 TESTAR FRONTEND

```bash
# Teste HTTPS
echo "=== FRONTEND HTTPS ===" && curl -I https://hpo.raras-cplp.org 2>/dev/null | head -10

# Ver index.html
echo -e "\n=== INDEX.HTML ===" && curl -s https://hpo.raras-cplp.org 2>/dev/null | head -20
```

📝 **Documentar:**
- Site carrega?
- Status code 200?
- Certificado SSL válido?

---

## 1️⃣1️⃣ VERIFICAR VERSÃO DO CÓDIGO ATUAL

```bash
# Verificar se é repositório git
echo "=== GIT STATUS ===" && cd /var/www/html/hpo-platform/backend && git log --oneline -5 2>/dev/null || echo "Não é repositório git"

# Ver package.json
echo -e "\n=== PACKAGE.JSON ===" && cat /var/www/html/hpo-platform/backend/package.json 2>/dev/null | grep -A 3 '"name"' || echo "package.json não encontrado"

# Ver estrutura do backend
echo -e "\n=== BACKEND STRUCTURE ===" && ls -la /var/www/html/hpo-platform/backend/src/ 2>/dev/null | head -20 || echo "src/ não encontrado"
```

📝 **Documentar:**
- É repositório git?
- Qual versão/commit atual?
- Estrutura de pastas (src, dist, prisma)?

---

## 1️⃣2️⃣ VERIFICAR CERTIFICADO SSL

```bash
# Certificados Let's Encrypt
echo "=== SSL CERTIFICATES ===" && sudo certbot certificates 2>/dev/null || echo "Certbot não instalado"
```

📝 **Documentar:**
- Certificado válido?
- Data de expiração?
- Domínios cobertos?

---

## 1️⃣3️⃣ VERIFICAR LOGS RECENTES

```bash
# Logs Apache (erros)
echo "=== APACHE ERROR LOG ===" && sudo tail -30 /var/log/apache2/hpo-error.log 2>/dev/null | tail -15

# Logs Apache (acesso)
echo -e "\n=== APACHE ACCESS LOG ===" && sudo tail -10 /var/log/apache2/hpo-access.log 2>/dev/null
```

📝 **Documentar:**
- Algum erro recente?
- Tráfego ativo?
- Tipo de requisições?

---

## ✅ RESUMO DA EXPLORAÇÃO

Após executar todos os comandos, criar resumo:

```
=== RESUMO ===

1. RECURSOS:
   - Disco livre: _____ GB
   - RAM livre: _____ GB
   - Status: OK / CRÍTICO

2. PM2:
   - hpo-backend: ONLINE / OFFLINE
   - Porta: _____
   - Restarts: _____

3. APACHE:
   - Status: RUNNING / STOPPED
   - VirtualHost HPO: CONFIGURADO / NÃO
   - SSL: VÁLIDO / EXPIRADO

4. POSTGRESQL:
   - Status: RUNNING / STOPPED
   - Database hpo_platform: EXISTS / NÃO
   - Termos HPO: _____ registros

5. APLICAÇÃO:
   - Frontend carrega: SIM / NÃO
   - Backend responde: SIM / NÃO
   - API funciona: SIM / NÃO

6. ESTRUTURA:
   - /var/www/html/hpo-platform/: EXISTS / NÃO
   - Backend em: _____
   - Frontend em: _____

7. OBSERVAÇÕES:
   - [Anotar qualquer coisa estranha]
   - [Diferenças do esperado]
   - [Problemas identificados]
```

---

## 🚨 SE ENCONTRAR PROBLEMAS

**NÃO TENTAR CONSERTAR!** Apenas documentar:

```
PROBLEMA: [descrever]
COMANDO: [comando que mostrou o problema]
OUTPUT: [saída do comando]
GRAVIDADE: CRÍTICO / MÉDIO / BAIXO
```

---

## 📤 PRÓXIMO PASSO

Após completar exploração, voltar aqui e reportar:

1. ✅ Aplicação atual está funcionando?
2. ✅ Estrutura de arquivos identificada?
3. ✅ Diferenças entre código atual e novo repositório?
4. ✅ Recursos suficientes para deploy?
5. ✅ Algum problema crítico encontrado?

---

**🎯 Objetivo Concluído:** Servidor mapeado e pronto para deploy seguro!

**Próximo Documento:** `PLANO_DEPLOY_SUBSTITUICAO.md`
