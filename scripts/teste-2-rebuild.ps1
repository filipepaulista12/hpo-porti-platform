# ========================================
# TESTE 2: REBUILD BACKEND + RESTART PM2
# ========================================

$SERVER = "ubuntu@200.144.254.4"
$BACKEND_PATH = "/var/www/html/hpo-platform/backend"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 2: Rebuild Backend + Restart" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "⚠️  Isso irá:" -ForegroundColor Yellow
Write-Host "   • Recompilar TypeScript → JavaScript" -ForegroundColor Gray
Write-Host "   • Restartar o PM2" -ForegroundColor Gray
Write-Host "   • Pode causar downtime de ~10 segundos`n" -ForegroundColor Gray

$confirm = Read-Host "Confirma rebuild? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "`n❌ Cancelado pelo usuário." -ForegroundColor Red
    exit
}

Write-Host "`n1️⃣ Fazendo backup do dist atual..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && [ -d dist ] && cp -r dist dist.backup-`$(date +%Y%m%d-%H%M%S) || echo 'Sem dist para backup'"

Write-Host "`n2️⃣ Executando npm run build..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && npm run build"

Write-Host "`n3️⃣ Reiniciando PM2..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && pm2 restart hpo-backend"

Write-Host "`n4️⃣ Aguardando 5 segundos..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

Write-Host "`n5️⃣ Verificando status após restart..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && pm2 status && pm2 logs hpo-backend --lines 10 --nostream"

Write-Host "`n6️⃣ Testando endpoint /api/terms/categories..." -ForegroundColor Yellow

ssh $SERVER "curl -s -w '\nHTTP Status: %{http_code}\n' http://localhost:3002/api/terms/categories"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ TESTE 2 COMPLETO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "🔍 PRÓXIMO PASSO:" -ForegroundColor Yellow
Write-Host "   Teste no navegador: https://hpo.raras-cplp.org" -ForegroundColor Cyan
Write-Host "   Vá em Traduzir e veja se ainda trava`n" -ForegroundColor Cyan
