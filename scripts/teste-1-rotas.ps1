# ========================================
# TESTE 1: VERIFICAR ROTA /CATEGORIES
# ========================================

$SERVER = "ubuntu@200.144.254.4"
$BACKEND_PATH = "/var/www/html/hpo-platform/backend"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 1: Verificando Rota /categories" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1️⃣ Procurando rota 'categories' no term.routes.ts..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && grep -n 'router.get.*categories' src/routes/term.routes.ts"

Write-Host "`n2️⃣ Verificando se term.routes está montado no server.ts..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && grep -n 'term.*routes' src/server.ts"

Write-Host "`n3️⃣ Listando TODAS as rotas em term.routes.ts..." -ForegroundColor Yellow

ssh $SERVER "cd $BACKEND_PATH && grep -n 'router\.(get\|post\|put\|delete\|patch)' src/routes/term.routes.ts"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ TESTE 1 COMPLETO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
