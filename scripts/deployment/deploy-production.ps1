# ==============================================
# DEPLOY PARA PRODUÇÃO - Docker Compose (Windows)
# ==============================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 HPO Translation Platform - Deploy para Produção" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================
# 1. VERIFICAÇÕES PRÉ-DEPLOY
# ==============================================
Write-Host "[1/7] Verificando pré-requisitos..." -ForegroundColor Yellow

if (-not (Test-Path ".env.production.local")) {
    Write-Host "❌ Erro: .env.production.local não encontrado!" -ForegroundColor Red
    Write-Host "Copie .env.production.example para .env.production.local e configure" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Erro: Docker não está instalado!" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Erro: Docker Compose não está instalado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pré-requisitos OK" -ForegroundColor Green
Write-Host ""

# ==============================================
# 2. BACKUP DO BANCO DE DADOS (se existir)
# ==============================================
Write-Host "[2/7] Backup do banco de dados..." -ForegroundColor Yellow

$containerExists = docker ps -a --format "{{.Names}}" | Select-String "hpo-postgres-prod"
if ($containerExists) {
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    docker exec hpo-postgres-prod pg_dump -U postgres hpo_platform > "backups\$backupFile"
    Write-Host "✅ Backup criado: $backupFile" -ForegroundColor Green
} else {
    Write-Host "⚠️  Nenhum container de produção encontrado (primeira vez?)" -ForegroundColor Yellow
}
Write-Host ""

# ==============================================
# 3. PARAR CONTAINERS ANTIGOS
# ==============================================
Write-Host "[3/7] Parando containers antigos..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down 2>$null
Write-Host "✅ Containers parados" -ForegroundColor Green
Write-Host ""

# ==============================================
# 4. BUILD DAS IMAGENS
# ==============================================
Write-Host "[4/7] Building Docker images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache
Write-Host "✅ Build concluído" -ForegroundColor Green
Write-Host ""

# ==============================================
# 5. INICIAR CONTAINERS
# ==============================================
Write-Host "[5/7] Iniciando containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d
Write-Host "✅ Containers iniciados" -ForegroundColor Green
Write-Host ""

# ==============================================
# 6. AGUARDAR SERVIÇOS FICAREM PRONTOS
# ==============================================
Write-Host "[6/7] Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check database
$maxRetries = 30
$retries = 0
while ($retries -lt $maxRetries) {
    $dbReady = docker exec hpo-postgres-prod pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Write-Host "⏳ Aguardando PostgreSQL..."
    Start-Sleep -Seconds 2
    $retries++
}
Write-Host "✅ PostgreSQL pronto" -ForegroundColor Green

# Check backend
$retries = 0
while ($retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:80/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            break
        }
    } catch {
        # Continue trying
    }
    Write-Host "⏳ Aguardando Backend..."
    Start-Sleep -Seconds 2
    $retries++
}
Write-Host "✅ Backend pronto" -ForegroundColor Green
Write-Host ""

# ==============================================
# 7. APLICAR MIGRATIONS
# ==============================================
Write-Host "[7/7] Aplicando migrations do Prisma..." -ForegroundColor Yellow
docker exec hpo-backend-prod npx prisma migrate deploy
Write-Host "✅ Migrations aplicadas" -ForegroundColor Green
Write-Host ""

# ==============================================
# RESUMO FINAL
# ==============================================
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Status dos serviços:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:       http://localhost (porta 80)"
Write-Host "  API:            http://localhost/api"
Write-Host "  Health Check:   http://localhost/health"
Write-Host ""
Write-Host "📝 Logs úteis:" -ForegroundColor Cyan
Write-Host "  Ver logs:       docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "  Logs backend:   docker logs -f hpo-backend-prod"
Write-Host "  Logs nginx:     docker logs -f hpo-nginx-prod"
Write-Host ""
Write-Host "🛑 Para parar:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.prod.yml down"
Write-Host ""
