# ========================================
# VERIFICACAO DE BANCO DE DADOS
# ========================================
# Script para verificar se o banco ja esta populado
# Evita popular desnecessariamente

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACAO DE BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se container esta rodando
Write-Host "[1/5] Verificando container PostgreSQL..." -ForegroundColor Yellow
$container = docker ps --filter "name=hpo-postgres" --format "{{.Names}}" 2>$null

if ($container) {
    Write-Host "  [OK] Container rodando: $container" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Container PostgreSQL nao esta rodando!" -ForegroundColor Red
    Write-Host "  Execute: docker-compose -f docker-compose.dev.yml up -d" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# 2. Verificar volumes
Write-Host ""
Write-Host "[2/5] Verificando volumes de dados..." -ForegroundColor Yellow
$volumes = docker volume ls --filter "name=postgres" --format "{{.Name}}" 2>$null

if ($volumes) {
    foreach ($vol in $volumes) {
        Write-Host "  [OK] Volume encontrado: $vol" -ForegroundColor Green
    }
} else {
    Write-Host "  [AVISO] Nenhum volume encontrado" -ForegroundColor Yellow
}

# 3. Contar termos HPO
Write-Host ""
Write-Host "[3/5] Contando termos HPO..." -ForegroundColor Yellow
$termCountRaw = docker exec $container psql -U postgres -d hpo_platform -t -c "SELECT COUNT(*) FROM hpo_terms;" 2>$null

if ($LASTEXITCODE -eq 0) {
    $termCount = [int]($termCountRaw.Trim())
    
    if ($termCount -eq 17020) {
        Write-Host "  [OK] Banco completo: $termCount termos HPO" -ForegroundColor Green
        $needsImport = $false
    } elseif ($termCount -gt 0) {
        Write-Host "  [AVISO] Banco parcial: $termCount termos (esperado: 17.020)" -ForegroundColor Yellow
        $needsImport = $true
    } else {
        Write-Host "  [ERRO] Banco vazio: 0 termos" -ForegroundColor Red
        $needsImport = $true
    }
} else {
    Write-Host "  [ERRO] Nao foi possivel consultar o banco" -ForegroundColor Red
    Write-Host "  Tabela 'hpo_terms' pode nao existir" -ForegroundColor Yellow
    $needsImport = $true
}

# 4. Contar usuarios
Write-Host ""
Write-Host "[4/5] Contando usuarios..." -ForegroundColor Yellow
$userCountRaw = docker exec $container psql -U postgres -d hpo_platform -t -c "SELECT COUNT(*) FROM users;" 2>$null

if ($LASTEXITCODE -eq 0) {
    $userCount = [int]($userCountRaw.Trim())
    Write-Host "  [OK] $userCount usuarios cadastrados" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Nao foi possivel contar usuarios" -ForegroundColor Yellow
}

# 5. Contar traducoes
Write-Host ""
Write-Host "[5/5] Contando traducoes..." -ForegroundColor Yellow
$translationCountRaw = docker exec $container psql -U postgres -d hpo_platform -t -c "SELECT COUNT(*) FROM translations;" 2>$null

if ($LASTEXITCODE -eq 0) {
    $translationCount = [int]($translationCountRaw.Trim())
    Write-Host "  [OK] $translationCount traducoes no banco" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Nao foi possivel contar traducoes" -ForegroundColor Yellow
}

# ========================================
# RESUMO FINAL
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Container:   $container" -ForegroundColor White
Write-Host "Termos HPO:  $termCount / 17.020" -ForegroundColor White
Write-Host "Usuarios:    $userCount" -ForegroundColor White
Write-Host "Traducoes:   $translationCount" -ForegroundColor White
Write-Host ""

if (-not $needsImport) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BANCO DE DADOS OK!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "NAO PRECISA POPULAR NOVAMENTE!" -ForegroundColor Yellow
    Write-Host "Os dados ja estao persistidos no volume Docker." -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BANCO PRECISA SER POPULADO" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    $response = Read-Host "Deseja popular o banco agora? (s/n)"
    
    if ($response -eq "s" -or $response -eq "S") {
        Write-Host ""
        Write-Host "Populando banco de dados..." -ForegroundColor Cyan
        Write-Host ""
        
        Set-Location hpo-platform-backend
        
        # Aplicar migrations
        Write-Host "[1/3] Aplicando migrations..." -ForegroundColor Yellow
        npx prisma migrate deploy
        
        # Gerar Prisma Client
        Write-Host ""
        Write-Host "[2/3] Gerando Prisma Client..." -ForegroundColor Yellow
        npx prisma generate
        
        # Importar termos HPO
        Write-Host ""
        Write-Host "[3/3] Importando 17.020 termos HPO (pode demorar ~2min)..." -ForegroundColor Yellow
        npm run prisma:import-all
        
        Set-Location ..
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "BANCO POPULADO COM SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        exit 0
    } else {
        Write-Host ""
        Write-Host "Operacao cancelada pelo usuario." -ForegroundColor Yellow
        Write-Host ""
        exit 2
    }
}
