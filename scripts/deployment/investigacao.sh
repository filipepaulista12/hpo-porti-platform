#!/bin/bash
# Script de Investigação Rápida
# Execute: bash investigacao.sh

echo "=========================================="
echo "🔍 INVESTIGAÇÃO - PORTI-HPO"
echo "=========================================="
echo ""

echo "1️⃣ Verificando link simbólico..."
ls -lah /var/www/html/hpo-platform/ | grep backend
echo ""

echo "2️⃣ Processos Node na porta 3002..."
ps aux | grep node | grep 3002
echo ""

echo "3️⃣ Testando backend (health)..."
curl -s http://localhost:3002/health
echo ""
echo ""

echo "4️⃣ Testando site (HTTPS)..."
curl -I https://hpo.raras-cplp.org 2>&1 | head -5
echo ""

echo "5️⃣ Apache ProxyPass..."
cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf 2>/dev/null | grep ProxyPass
echo ""

echo "6️⃣ PM2 Logs (últimas 10 linhas)..."
pm2 logs hpo-backend --lines 10 --nostream
echo ""

echo "7️⃣ Frontend public..."
ls -la /var/www/html/hpo-platform/public/ | head -10
echo ""

echo "8️⃣ Package.json do backup..."
cat /var/www/html/hpo-platform/backend_backup_2025-10-17_/package.json 2>/dev/null | grep '"name"' -A 3
echo ""

echo "=========================================="
echo "✅ Investigação concluída!"
echo "=========================================="
