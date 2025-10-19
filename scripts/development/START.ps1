# HPO Translation Platform - Iniciar Tudo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HPO TRANSLATION PLATFORM - STARTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Diretorios
$BASE_DIR = "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation"
$BACKEND_DIR = "$BASE_DIR\hpo-platform-backend"
$FRONTEND_DIR = "$BASE_DIR\plataforma-raras-cpl"

# 1. Verificar PostgreSQL
Write-Host "[1/5] Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -ne "Running") {
        Write-Host "  PostgreSQL parado. Iniciando..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Start-Sleep -Seconds 3
    }
    Write-Host "  OK - PostgreSQL rodando" -ForegroundColor Green
} catch {
    Write-Host "  AVISO - PostgreSQL: verificar manualmente" -ForegroundColor Yellow
}

# 2. Limpar portas
Write-Host "`n[2/5] Limpando portas 3001 e 5173..." -ForegroundColor Yellow
$ports = @(3001, 5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  OK - Porta $port liberada" -ForegroundColor Green
    }
}
Start-Sleep -Seconds 2

# 3. Iniciar Backend
Write-Host "`n[3/5] Iniciando BACKEND (porta 3001)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev
} -ArgumentList $BACKEND_DIR

Write-Host "  Aguardando backend inicializar..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Verificar se backend respondeu
$backendOK = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  OK - Backend ONLINE em http://localhost:3001" -ForegroundColor Green
            $backendOK = $true
            break
        }
    } catch {
        Write-Host "  Tentativa $i/5..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendOK) {
    Write-Host "  ERRO - Backend nao respondeu!" -ForegroundColor Red
    Write-Host "  Verifique: cd $BACKEND_DIR && npm run dev" -ForegroundColor Yellow
    Receive-Job $backendJob
    exit 1
}

# 4. Iniciar Frontend
Write-Host "`n[4/5] Iniciando FRONTEND (porta 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev
} -ArgumentList $FRONTEND_DIR

Write-Host "  Aguardando frontend inicializar..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Verificar se frontend respondeu
$frontendOK = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  OK - Frontend ONLINE em http://localhost:5173" -ForegroundColor Green
            $frontendOK = $true
            break
        }
    } catch {
        Write-Host "  Tentativa $i/5..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $frontendOK) {
    Write-Host "  ERRO - Frontend nao respondeu!" -ForegroundColor Red
    Write-Host "  Verifique: cd $FRONTEND_DIR && npm run dev" -ForegroundColor Yellow
    Receive-Job $frontendJob
    exit 1
}

# 5. Abrir navegador
Write-Host "`n[5/5] Abrindo navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

# Status final
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SISTEMA RODANDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3001" -ForegroundColor Cyan
Write-Host "WebSocket: ws://localhost:3001/socket.io/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: 16.942 termos HPO importados" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para PARAR: Ctrl+C ou execute .\STOP.ps1" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione Ctrl+C para parar os servidores..." -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nParando servidores..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Servidores parados!" -ForegroundColor Green
}
