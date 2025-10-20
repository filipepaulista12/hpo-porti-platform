#!/bin/bash

# ====================================================
# EXPLORAÇÃO CONSULTIVA - Servidor PORTI-HPO
# Modo: READ-ONLY (sem alterações)
# Data: 19 de Outubro de 2025
# ====================================================

echo "🔍 Iniciando exploração consultiva do servidor..."
echo "⚠️  MODO READ-ONLY - Nenhuma alteração será feita!"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ====================================================
# 1. RECURSOS DO SERVIDOR
# ====================================================
echo -e "${BLUE}[1/13] Verificando recursos do servidor...${NC}"
echo "=== DISCO ==="
df -h | grep -E '(Filesystem|/dev/)'
echo ""
echo "=== RAM ==="
free -h
echo ""
echo "=== TOP 10 PROCESSOS (por memória) ==="
ps aux --sort=-%mem | head -11
echo ""

# ====================================================
# 2. PM2 PROCESSOS
# ====================================================
echo -e "${BLUE}[2/13] Verificando PM2...${NC}"
echo "=== PM2 LISTA ==="
pm2 list
echo ""
echo "=== HPO BACKEND INFO ==="
pm2 info hpo-backend 2>/dev/null || echo "⚠️  Processo hpo-backend não encontrado"
echo ""
echo "=== LOGS HPO BACKEND (últimas 30 linhas) ==="
pm2 logs hpo-backend --lines 30 --nostream 2>/dev/null || echo "⚠️  Sem logs"
echo ""

# ====================================================
# 3. ESTRUTURA DE ARQUIVOS
# ====================================================
echo -e "${BLUE}[3/13] Verificando estrutura de arquivos...${NC}"
echo "=== /var/www/html/ ==="
ls -la /var/www/html/
echo ""
echo "=== HPO PLATFORM ==="
ls -la /var/www/html/hpo-platform/ 2>/dev/null || echo "⚠️  Pasta hpo-platform não existe"
echo ""
echo "=== BACKEND ==="
ls -la /var/www/html/hpo-platform/backend/ 2>/dev/null | head -20
echo ""
echo "=== FRONTEND PUBLIC ==="
ls -la /var/www/html/hpo-platform/public/ 2>/dev/null | head -15
echo ""

# ====================================================
# 4. APACHE
# ====================================================
echo -e "${BLUE}[4/13] Verificando Apache...${NC}"
echo "=== VIRTUAL HOSTS ==="
sudo apache2ctl -S 2>/dev/null | grep -A 5 "hpo" || echo "⚠️  Sem VirtualHost HPO"
echo ""
echo "=== HPO CONFIG ==="
cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf 2>/dev/null || echo "⚠️  Config não encontrado"
echo ""
echo "=== APACHE STATUS ==="
sudo systemctl status apache2 | head -20
echo ""

# ====================================================
# 5. POSTGRESQL
# ====================================================
echo -e "${BLUE}[5/13] Verificando PostgreSQL...${NC}"
echo "=== POSTGRESQL STATUS ==="
sudo systemctl status postgresql | head -10
echo ""
echo "=== DATABASE TABELAS ==="
psql -U hpo_user -d hpo_platform -c "\dt" 2>/dev/null || echo "⚠️  Erro ao conectar (pode precisar senha)"
echo ""
echo "=== CONTAR TERMOS HPO ==="
psql -U hpo_user -d hpo_platform -c 'SELECT COUNT(*) FROM "HpoTerm";' 2>/dev/null || echo "⚠️  Erro ao consultar"
echo ""

# ====================================================
# 6. PORTAS EM USO
# ====================================================
echo -e "${BLUE}[6/13] Verificando portas...${NC}"
echo "=== PORTAS EM USO ==="
sudo netstat -tulpn | grep LISTEN | grep -E "(3001|3002|5432|80|443)"
echo ""

# ====================================================
# 7. VARIÁVEIS DE AMBIENTE
# ====================================================
echo -e "${BLUE}[7/13] Verificando variáveis de ambiente...${NC}"
echo "=== BACKEND .env (sem senhas) ==="
cat /var/www/html/hpo-platform/backend/.env 2>/dev/null | grep -v PASSWORD | grep -v SECRET || echo "⚠️  Arquivo .env não encontrado"
echo ""
echo "=== ECOSYSTEM.CONFIG.JS ==="
cat /var/www/html/hpo-platform/backend/ecosystem.config.js 2>/dev/null || echo "⚠️  ecosystem.config.js não encontrado"
echo ""

# ====================================================
# 8. TESTAR BACKEND
# ====================================================
echo -e "${BLUE}[8/13] Testando backend...${NC}"
echo "=== BACKEND HEALTH ==="
curl -s http://localhost:3002/health 2>/dev/null || echo "⚠️  Backend não responde"
echo ""
echo "=== API TEST ==="
curl -s http://localhost:3002/api/terms/count 2>/dev/null | head -5 || echo "⚠️  API não responde"
echo ""

# ====================================================
# 9. TESTAR FRONTEND
# ====================================================
echo -e "${BLUE}[9/13] Testando frontend...${NC}"
echo "=== FRONTEND HTTPS ==="
curl -I https://hpo.raras-cplp.org 2>/dev/null | head -10
echo ""
echo "=== INDEX.HTML (primeiras 20 linhas) ==="
curl -s https://hpo.raras-cplp.org 2>/dev/null | head -20
echo ""

# ====================================================
# 10. VERSÃO DO CÓDIGO
# ====================================================
echo -e "${BLUE}[10/13] Verificando versão do código...${NC}"
echo "=== GIT STATUS ==="
cd /var/www/html/hpo-platform/backend && git log --oneline -5 2>/dev/null || echo "⚠️  Não é repositório git"
echo ""
echo "=== PACKAGE.JSON ==="
cat /var/www/html/hpo-platform/backend/package.json 2>/dev/null | grep -A 3 '"name"' || echo "⚠️  package.json não encontrado"
echo ""
echo "=== BACKEND STRUCTURE ==="
ls -la /var/www/html/hpo-platform/backend/src/ 2>/dev/null | head -20 || echo "⚠️  src/ não encontrado"
echo ""

# ====================================================
# 11. CERTIFICADO SSL
# ====================================================
echo -e "${BLUE}[11/13] Verificando SSL...${NC}"
echo "=== SSL CERTIFICATES ==="
sudo certbot certificates 2>/dev/null || echo "⚠️  Certbot não instalado"
echo ""

# ====================================================
# 12. LOGS RECENTES
# ====================================================
echo -e "${BLUE}[12/13] Verificando logs...${NC}"
echo "=== APACHE ERROR LOG (últimas 15 linhas) ==="
sudo tail -30 /var/log/apache2/hpo-error.log 2>/dev/null | tail -15
echo ""
echo "=== APACHE ACCESS LOG (últimas 10 linhas) ==="
sudo tail -10 /var/log/apache2/hpo-access.log 2>/dev/null
echo ""

# ====================================================
# 13. VERSÕES DE SOFTWARE
# ====================================================
echo -e "${BLUE}[13/13] Verificando versões de software...${NC}"
echo "=== VERSÕES ==="
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Apache: $(apache2 -v | head -1)"
echo "PostgreSQL: $(psql --version)"
echo ""

# ====================================================
# RESUMO FINAL
# ====================================================
echo ""
echo "=================================================="
echo -e "${GREEN}✅ EXPLORAÇÃO CONSULTIVA CONCLUÍDA!${NC}"
echo "=================================================="
echo ""
echo "📊 Próximo passo: Analisar resultados e criar plano de deploy"
echo ""
