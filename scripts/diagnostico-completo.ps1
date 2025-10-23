# ========================================
# 🔍 DIAGNÓSTICO COMPLETO - TRAVAMENTO
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 INICIANDO DIAGNÓSTICO COMPLETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@200.144.254.4"
$BACKEND_PATH = "/var/www/html/hpo-platform/backend"

# ========================================
# TESTE 1: Verificar Rota /categories
# ========================================
Write-Host "📡 TESTE 1: Verificando rota /api/terms/categories" -ForegroundColor Yellow
Write-Host ""

ssh $SERVER @"
cd $BACKEND_PATH
echo '🔍 Procurando rota categories no código...'
grep -n 'categories' src/routes/term.routes.ts | head -20
echo ''
echo '🔍 Verificando se rota está montada no server.ts...'
grep -n 'term.routes' src/server.ts
"@

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 2: Verificar PM2 Status
# ========================================
Write-Host "📊 TESTE 2: Status do Backend (PM2)" -ForegroundColor Yellow
Write-Host ""

ssh $SERVER @"
cd $BACKEND_PATH
pm2 describe hpo-backend
"@

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 3: Verificar Últimos Logs
# ========================================
Write-Host "📝 TESTE 3: Últimos 50 logs do Backend" -ForegroundColor Yellow
Write-Host ""

ssh $SERVER @"
cd $BACKEND_PATH
pm2 logs hpo-backend --lines 50 --nostream
"@

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 4: Testar Endpoint Diretamente
# ========================================
Write-Host "🌐 TESTE 4: Testando endpoint /api/terms diretamente" -ForegroundColor Yellow
Write-Host ""

ssh $SERVER @"
cd $BACKEND_PATH
echo '🔍 Testando GET /api/terms (sem auth - deve dar 401)...'
curl -s -w '\nStatus: %{http_code}\n' http://localhost:3002/api/terms
echo ''
echo '🔍 Testando GET /api/terms/categories (sem auth - deve dar 401)...'
curl -s -w '\nStatus: %{http_code}\n' http://localhost:3002/api/terms/categories
"@

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 5: Verificar Banco de Dados
# ========================================
Write-Host "🗄️  TESTE 5: Verificando dados no PostgreSQL" -ForegroundColor Yellow
Write-Host ""

ssh $SERVER @"
cd $BACKEND_PATH
echo '🔍 Contando termos no banco...'
PGPASSWORD=hpo2024secure psql -h localhost -U postgres -d hpo_platform -c "SELECT COUNT(*) as total_termos FROM \"HPOTerm\";"
echo ''
echo '🔍 Contando categorias distintas...'
PGPASSWORD=hpo2024secure psql -h localhost -U postgres -d hpo_platform -c "SELECT COUNT(DISTINCT category) as total_categorias FROM \"HPOTerm\" WHERE category IS NOT NULL;"
echo ''
echo '🔍 Listando primeiras 10 categorias...'
PGPASSWORD=hpo2024secure psql -h localhost -U postgres -d hpo_platform -c "SELECT DISTINCT category FROM \"HPOTerm\" WHERE category IS NOT NULL ORDER BY category LIMIT 10;"
"@

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 6: Rebuild Backend
# ========================================
Write-Host "🔨 TESTE 6: Rebuild do Backend TypeScript" -ForegroundColor Yellow
Write-Host "   (Pode resolver problema de rota não registrada)" -ForegroundColor Gray
Write-Host ""
$rebuild = Read-Host "Deseja fazer rebuild do backend? (S/N)"

if ($rebuild -eq "S" -or $rebuild -eq "s") {
    ssh $SERVER @"
cd $BACKEND_PATH
echo '🔨 Fazendo rebuild...'
npm run build
echo ''
echo '🔄 Reiniciando PM2...'
pm2 restart hpo-backend
echo ''
echo '⏳ Aguardando 5 segundos...'
sleep 5
echo ''
echo '✅ Verificando status após restart...'
pm2 status
"@
} else {
    Write-Host "⏭️  Pulando rebuild..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 7: Verificar Tamanho do Bundle
# ========================================
Write-Host "📦 TESTE 7: Tamanho do Bundle Frontend" -ForegroundColor Yellow
Write-Host ""

$distPath = "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\assets"
if (Test-Path $distPath) {
    Get-ChildItem $distPath | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name): $sizeMB MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ⚠️  Pasta dist não encontrada. Faça build primeiro." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pressione ENTER para continuar..." -ForegroundColor Gray
Read-Host

# ========================================
# TESTE 8: Rodar Página de Teste Local
# ========================================
Write-Host "🧪 TESTE 8: Preparar Página de Teste Isolada" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Criado arquivo: TestTranslatePage.tsx" -ForegroundColor Green
Write-Host "   Para testar:" -ForegroundColor Cyan
Write-Host "   1. Adicione rota no App.tsx:" -ForegroundColor Gray
Write-Host "      import TestTranslatePage from './TestTranslatePage'" -ForegroundColor Gray
Write-Host "      <Route path='/test-translate' element={<TestTranslatePage />} />" -ForegroundColor Gray
Write-Host "   2. npm run dev" -ForegroundColor Gray
Write-Host "   3. Acesse: http://localhost:5173/test-translate" -ForegroundColor Gray
Write-Host "   4. Faça scroll e clique nos termos" -ForegroundColor Gray
Write-Host "   5. Abra DevTools (F12) → Performance → Grave durante scroll" -ForegroundColor Gray
Write-Host ""

$testLocal = Read-Host "Deseja rodar servidor local agora? (S/N)"

if ($testLocal -eq "S" -or $testLocal -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
    Write-Host ""
    Set-Location "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl"
    npm run dev
} else {
    Write-Host "⏭️  Servidor não iniciado." -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DIAGNÓSTICO COMPLETO FINALIZADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 RESUMO DOS TESTES:" -ForegroundColor Yellow
Write-Host "   1. ✓ Verificado rota /categories no código" -ForegroundColor Gray
Write-Host "   2. ✓ Verificado status PM2" -ForegroundColor Gray
Write-Host "   3. ✓ Verificado logs do backend" -ForegroundColor Gray
Write-Host "   4. ✓ Testado endpoints diretamente" -ForegroundColor Gray
Write-Host "   5. ✓ Verificado dados no PostgreSQL" -ForegroundColor Gray
Write-Host "   6. ✓ (Opcional) Rebuild do backend" -ForegroundColor Gray
Write-Host "   7. ✓ Verificado tamanho do bundle" -ForegroundColor Gray
Write-Host "   8. ✓ Criado página de teste isolada" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   • Verifique os resultados acima" -ForegroundColor Cyan
Write-Host "   • Se rota /categories não existir no server.ts → ADICIONE" -ForegroundColor Cyan
Write-Host "   • Se rebuild resolveu → Era problema de compilação TypeScript" -ForegroundColor Cyan
Write-Host "   • Teste a página isolada (TestTranslatePage) → Identifica se é problema do componente gigante" -ForegroundColor Cyan
Write-Host "   • Use Chrome DevTools → Performance → Identifica gargalo exato" -ForegroundColor Cyan
Write-Host ""
