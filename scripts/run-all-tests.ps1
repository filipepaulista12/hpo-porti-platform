# run-all-tests.ps1
# Script para rodar TODOS os testes do projeto HPO Translation Platform

Write-Host "🧪 ============================================" -ForegroundColor Cyan
Write-Host "🧪 EXECUTANDO TODOS OS TESTES - HPO PLATFORM" -ForegroundColor Cyan
Write-Host "🧪 ============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$StartTime = Get-Date

# ========================================
# 1. TESTES BACKEND
# ========================================

Write-Host "📦 [1/3] TESTES BACKEND (Jest)" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Gray

try {
    Push-Location "hpo-platform-backend"
    
    Write-Host "🔧 Verificando dependências..." -ForegroundColor Gray
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules não encontrado. Instalando..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🧬 Gerando Prisma Client..." -ForegroundColor Gray
    npx prisma generate 2>$null
    
    Write-Host "🚀 Executando testes backend..." -ForegroundColor Green
    Write-Host ""
    
    npm test -- --testTimeout=60000 --forceExit
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Testes backend FALHARAM" -ForegroundColor Red
        $ErrorCount++
    } else {
        Write-Host "✅ Testes backend PASSARAM" -ForegroundColor Green
    }
    
    Pop-Location
} catch {
    Write-Host "❌ ERRO ao executar testes backend: $_" -ForegroundColor Red
    $ErrorCount++
    Pop-Location
}

Write-Host ""
Write-Host ""

# ========================================
# 2. TESTES FRONTEND
# ========================================

Write-Host "🎨 [2/3] TESTES FRONTEND (Vitest)" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

try {
    Push-Location "plataforma-raras-cpl"
    
    Write-Host "🔧 Verificando dependências..." -ForegroundColor Gray
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules não encontrado. Instalando..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🚀 Executando testes frontend..." -ForegroundColor Green
    Write-Host ""
    
    npm test -- --run
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Testes frontend FALHARAM" -ForegroundColor Red
        $ErrorCount++
    } else {
        Write-Host "✅ Testes frontend PASSARAM" -ForegroundColor Green
    }
    
    Pop-Location
} catch {
    Write-Host "❌ ERRO ao executar testes frontend: $_" -ForegroundColor Red
    $ErrorCount++
    Pop-Location
}

Write-Host ""
Write-Host ""

# ========================================
# 3. TESTES ESPECÍFICOS CPLP
# ========================================

Write-Host "🌍 [3/3] TESTES CPLP (Backend + Frontend)" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Gray

try {
    # Backend CPLP tests
    Write-Host "📊 Executando testes CPLP backend..." -ForegroundColor Cyan
    Push-Location "hpo-platform-backend"
    
    npm test -- --testNamePattern="CPLP" --forceExit
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Alguns testes CPLP backend falharam" -ForegroundColor Yellow
        $ErrorCount++
    } else {
        Write-Host "✅ Testes CPLP backend PASSARAM" -ForegroundColor Green
    }
    
    Pop-Location
    
    # Frontend CPLP tests
    Write-Host "🎨 Executando testes CPLP frontend..." -ForegroundColor Cyan
    Push-Location "plataforma-raras-cpl"
    
    npm test -- --run CPLPHelpers
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Alguns testes CPLP frontend falharam" -ForegroundColor Yellow
        $ErrorCount++
    } else {
        Write-Host "✅ Testes CPLP frontend PASSARAM" -ForegroundColor Green
    }
    
    Pop-Location
} catch {
    Write-Host "❌ ERRO ao executar testes CPLP: $_" -ForegroundColor Red
    $ErrorCount++
    if (Get-Location | Select-Object -ExpandProperty Path | Where-Object { $_ -match "hpo-platform-backend|plataforma-raras-cpl" }) {
        Pop-Location
    }
}

Write-Host ""
Write-Host ""

# ========================================
# RESUMO FINAL
# ========================================

$EndTime = Get-Date
$Duration = $EndTime - $StartTime
$DurationFormatted = "{0:mm}m {0:ss}s" -f $Duration

Write-Host "🏁 ============================================" -ForegroundColor Cyan
Write-Host "🏁 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "🏁 ============================================" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host "🎉 Projeto está pronto para deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Estatísticas:" -ForegroundColor Cyan
    Write-Host "   - Tempo total: $DurationFormatted" -ForegroundColor Gray
    Write-Host "   - Suites executadas: 3" -ForegroundColor Gray
    Write-Host "   - Erros: 0" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Commit das alterações: git add . && git commit -m 'feat: CPLP support complete'" -ForegroundColor Gray
    Write-Host "   2. Push para repositório: git push origin feature/cplp-variants" -ForegroundColor Gray
    Write-Host "   3. Fazer deploy: Seguir GUIA_DEPLOY_SERVIDOR.md" -ForegroundColor Gray
    Write-Host ""
    
    exit 0
} else {
    Write-Host "❌ ALGUNS TESTES FALHARAM" -ForegroundColor Red
    Write-Host "⚠️  Total de falhas: $ErrorCount" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Ações recomendadas:" -ForegroundColor Cyan
    Write-Host "   1. Verificar logs acima para detalhes" -ForegroundColor Gray
    Write-Host "   2. Rodar testes individuais para debug:" -ForegroundColor Gray
    Write-Host "      - Backend: cd hpo-platform-backend && npm test" -ForegroundColor Gray
    Write-Host "      - Frontend: cd plataforma-raras-cpl && npm test" -ForegroundColor Gray
    Write-Host "   3. Verificar banco de dados:" -ForegroundColor Gray
    Write-Host "      - docker ps" -ForegroundColor Gray
    Write-Host "      - cd hpo-platform-backend && npx prisma migrate dev" -ForegroundColor Gray
    Write-Host "   4. Consultar TESTES_CPLP_COMPLETO.md para troubleshooting" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 Tempo de execução: $DurationFormatted" -ForegroundColor Gray
    Write-Host ""
    
    exit 1
}
