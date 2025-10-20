# ==================================================
# INICIAR BACKEND COM DOCKER (Bypass Firewall!)
# ==================================================

Write-Host ""
Write-Host "INICIANDO BACKEND NO DOCKER..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Matar processos locais Node/TSX (se houver)
Write-Host "Matando processos Node/TSX locais..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -match "node|tsx"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Parar containers existentes
Write-Host ""
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Build e start do backend
Write-Host ""
Write-Host "Buildando e iniciando backend..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml up -d --build backend

# Aguardar inicialização
Write-Host ""
Write-Host "Aguardando backend inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status
Write-Host ""
Write-Host "STATUS DOS CONTAINERS:" -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

# Testar conexão
Write-Host ""
Write-Host "TESTANDO BACKEND..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host ""
    Write-Host ">>> BACKEND FUNCIONANDO NO DOCKER!" -ForegroundColor Green
    Write-Host "URL: http://localhost:3001" -ForegroundColor Green
    Write-Host "Health: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Backend ainda nao respondeu, verificando logs..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "LOGS DO BACKEND:" -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml logs --tail=50 backend
}

Write-Host ""
Write-Host "=================================================="
Write-Host "COMANDOS UTEIS:" -ForegroundColor Cyan
Write-Host "   Ver logs:    docker-compose -f docker-compose.dev.yml logs -f backend"
Write-Host "   Parar:       docker-compose -f docker-compose.dev.yml down"
Write-Host "   Restart:     docker-compose -f docker-compose.dev.yml restart backend"
Write-Host "=================================================="
Write-Host ""
