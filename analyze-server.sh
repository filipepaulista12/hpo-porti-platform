#!/bin/bash
# Script de análise do servidor (MODO CONSULTIVO - SEM ALTERAÇÕES)

echo "========================================="
echo "ANÁLISE DO SERVIDOR - RARAS CPLP"
echo "Data: $(date)"
echo "========================================="
echo ""

echo "1. INFORMAÇÕES BÁSICAS"
echo "-------------------------------------"
echo "Hostname: $(hostname)"
echo "Sistema: $(uname -a)"
echo "Usuário: $(whoami)"
echo "Diretório atual: $(pwd)"
echo ""

echo "2. ESPAÇO EM DISCO"
echo "-------------------------------------"
df -h
echo ""

echo "3. MEMÓRIA RAM"
echo "-------------------------------------"
free -h
echo ""

echo "4. SERVIÇOS DOCKER"
echo "-------------------------------------"
docker --version 2>/dev/null || echo "Docker não encontrado"
docker ps 2>/dev/null || echo "Sem permissão Docker ou não rodando"
echo ""

echo "5. PM2 (Process Manager)"
echo "-------------------------------------"
pm2 --version 2>/dev/null || echo "PM2 não encontrado"
pm2 list 2>/dev/null || echo "Sem processos PM2 ou não instalado"
echo ""

echo "6. NGINX"
echo "-------------------------------------"
nginx -v 2>&1
systemctl status nginx --no-pager 2>/dev/null | head -10
echo ""

echo "7. SITES CONFIGURADOS (Nginx)"
echo "-------------------------------------"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Sem acesso a sites-enabled"
echo ""

echo "8. ESTRUTURA /var/www/"
echo "-------------------------------------"
ls -la /var/www/ 2>/dev/null || echo "Sem acesso a /var/www/"
echo ""

echo "9. ESTRUTURA /var/www/html/filipe/"
echo "-------------------------------------"
ls -la /var/www/html/filipe/ 2>/dev/null || echo "Sem acesso a /var/www/html/filipe/"
echo ""

echo "10. PORTAS EM USO"
echo "-------------------------------------"
ss -tlnp 2>/dev/null | head -20 || netstat -tlnp 2>/dev/null | head -20 || echo "Sem permissão para ver portas"
echo ""

echo "11. PROCESSOS NODE/PYTHON/ETC"
echo "-------------------------------------"
ps aux | grep -E 'node|python|php|apache' | grep -v grep | head -10
echo ""

echo "12. CERTIFICADOS SSL"
echo "-------------------------------------"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Sem certificados Let's Encrypt ou sem acesso"
echo ""

echo "13. LOGS RECENTES NGINX (últimas 5 linhas)"
echo "-------------------------------------"
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Sem acesso aos logs"
echo ""

echo "========================================="
echo "ANÁLISE CONCLUÍDA"
echo "========================================="
