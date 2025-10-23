# Investigação HPO Backend - Porta 3002
# NÃO MEXER NO cplp-backend (porta 3001) - É OUTRO PROJETO!

Write-Host "=== INVESTIGAÇÃO HPO-BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Testar Apache config
Write-Host "1. Verificando configuração Apache..." -ForegroundColor Yellow
ssh ubuntu@200.144.254.4 "sudo grep -h 'localhost:3002' /etc/apache2/sites-enabled/hpo*.conf 2>/dev/null"

Write-Host ""
Write-Host "2. Testando backend na porta 3002..." -ForegroundColor Yellow
ssh ubuntu@200.144.254.4 'curl -s http://localhost:3002/ 2>&1 | head -c 300'

Write-Host ""
Write-Host ""
Write-Host "3. Status PM2 do hpo-backend..." -ForegroundColor Yellow
ssh ubuntu@200.144.254.4 "pm2 list | grep hpo-backend"

Write-Host ""
Write-Host "4. Últimas 15 linhas de log..." -ForegroundColor Yellow
ssh ubuntu@200.144.254.4 "pm2 logs hpo-backend --lines 15 --nostream 2>&1 | tail -20"

Write-Host ""
Write-Host "=== CONCLUSÃO ===" -ForegroundColor Cyan
Write-Host "Apache deve apontar para: localhost:3002"
Write-Host "Backend HPO deve responder nesta porta"
Write-Host ""
