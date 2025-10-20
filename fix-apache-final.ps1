# Script para corrigir Apache e garantir funcionamento
# Senha: vFpyJS4FA

Write-Host "`n🔧 CORRIGINDO APACHE PARA FUNCIONAR COM BACKEND" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Gray

$server = "ubuntu@200.144.254.4"
$password = "vFpyJS4FA"

Write-Host "`n1️⃣  Copiando arquivo SSL para o servidor..." -ForegroundColor Yellow

# Copiar SSL config
Write-Host "Executando SCP..." -ForegroundColor Gray
scp hpo.raras-cplp.org-le-ssl.conf ubuntu@200.144.254.4:/tmp/

Write-Host "`n2️⃣  Aplicando configurações no servidor..." -ForegroundColor Yellow
Write-Host "Entre com a senha quando solicitado: vFpyJS4FA" -ForegroundColor Cyan

# Conectar via SSH e executar comandos
ssh ubuntu@200.144.254.4 @"
echo '=== COPIANDO ARQUIVO SSL ==='
sudo cp /tmp/hpo.raras-cplp.org-le-ssl.conf /etc/apache2/sites-available/

echo ''
echo '=== TESTANDO CONFIGURAÇÃO ==='
sudo apache2ctl configtest

echo ''
echo '=== RECARREGANDO APACHE ==='
sudo systemctl reload apache2

echo ''
echo '=== TESTANDO BACKEND DIRETO ==='
curl -s http://localhost:3002/api/health

echo ''
echo '=== TESTANDO VIA APACHE (HTTPS) ==='
curl -s https://hpo.raras-cplp.org/api/health

echo ''
echo '=== TESTANDO /api/auth/config VIA APACHE ==='
curl -s https://hpo.raras-cplp.org/api/auth/config

echo ''
echo '✅ TESTES COMPLETOS!'
"@

Write-Host "`n✅ Script executado!" -ForegroundColor Green
Write-Host "Verifique os resultados acima." -ForegroundColor Cyan
