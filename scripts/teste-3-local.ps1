# ========================================
# TESTE 3: RODAR PÁGINA DE TESTE LOCAL
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 3: Página de Teste Isolada" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$PROJECT_PATH = "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl"

Write-Host "📦 Verificando se TestTranslatePage.tsx existe..." -ForegroundColor Yellow

if (Test-Path "$PROJECT_PATH\src\TestTranslatePage.tsx") {
    Write-Host "   ✅ Arquivo encontrado!`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ Arquivo NÃO encontrado!" -ForegroundColor Red
    Write-Host "   Execute o script de diagnóstico completo primeiro.`n" -ForegroundColor Yellow
    exit
}

Write-Host "🔧 INSTRUÇÕES MANUAIS:" -ForegroundColor Yellow
Write-Host "`n1. Abra o arquivo:" -ForegroundColor Cyan
Write-Host "   plataforma-raras-cpl\src\App.tsx" -ForegroundColor Gray

Write-Host "`n2. Adicione o import:" -ForegroundColor Cyan
Write-Host "   import TestTranslatePage from './TestTranslatePage';" -ForegroundColor Gray

Write-Host "`n3. Adicione a rota (dentro de <Routes>):" -ForegroundColor Cyan
Write-Host "   <Route path='/test' element={<TestTranslatePage />} />" -ForegroundColor Gray

Write-Host "`n4. Salve o arquivo`n" -ForegroundColor Cyan

$addRoute = Read-Host "Deseja que eu adicione a rota automaticamente? (S/N)"

if ($addRoute -eq "S" -or $addRoute -eq "s") {
    Write-Host "`n📝 Adicionando rota ao App.tsx..." -ForegroundColor Yellow
    
    # Lê o App.tsx
    $appContent = Get-Content "$PROJECT_PATH\src\App.tsx" -Raw
    
    # Adiciona import se não existir
    if ($appContent -notmatch "TestTranslatePage") {
        $appContent = $appContent -replace "(import.*from\s+['\"]react-router-dom['\"];)", "`$1`nimport TestTranslatePage from './TestTranslatePage';"
        Write-Host "   ✅ Import adicionado" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Import já existe" -ForegroundColor Gray
    }
    
    # Adiciona rota se não existir
    if ($appContent -notmatch "/test") {
        $appContent = $appContent -replace "(<Routes>)", "`$1`n          <Route path='/test' element={<TestTranslatePage />} />"
        Write-Host "   ✅ Rota adicionada" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Rota já existe" -ForegroundColor Gray
    }
    
    # Salva arquivo
    Set-Content "$PROJECT_PATH\src\App.tsx" -Value $appContent
    Write-Host "`n✅ App.tsx atualizado!`n" -ForegroundColor Green
}

Write-Host "`n🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host "   URL de teste: http://localhost:5173/test`n" -ForegroundColor Cyan

Write-Host "⚡ TESTES A FAZER:" -ForegroundColor Yellow
Write-Host "   1. Scroll rápido na lista de termos" -ForegroundColor Gray
Write-Host "   2. Clicar em vários termos seguidos" -ForegroundColor Gray
Write-Host "   3. Digitar no formulário" -ForegroundColor Gray
Write-Host "   4. Abrir DevTools (F12) → Performance → Gravar durante scroll" -ForegroundColor Gray
Write-Host "   5. Verificar se trava ou não`n" -ForegroundColor Gray

$runDev = Read-Host "Iniciar servidor agora? (S/N)"

if ($runDev -eq "S" -or $runDev -eq "s") {
    Set-Location $PROJECT_PATH
    Write-Host "`n🚀 Rodando npm run dev...`n" -ForegroundColor Green
    npm run dev
} else {
    Write-Host "`n📝 Para rodar manualmente:" -ForegroundColor Yellow
    Write-Host "   cd plataforma-raras-cpl" -ForegroundColor Gray
    Write-Host "   npm run dev`n" -ForegroundColor Gray
}
