#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Inicia o ambiente de desenvolvimento completo (Backend + Frontend)
.DESCRIPTION
    Script inteligente que:
    - Verifica e inicia Docker (PostgreSQL + Redis)
    - Inicia Backend em porta disponível
    - Inicia Frontend em porta disponível
    - Detecta automaticamente se algo já está rodando
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando ambiente de desenvolvimento HPO Translation Platform" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se porta está disponível
function Test-PortAvailable {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -eq $connection
    } catch {
        return $true
    }
}

# Função para encontrar porta disponível
function Get-AvailablePort {
    param([int]$StartPort)
    $port = $StartPort
    while ($port -lt ($StartPort + 100)) {
        if (Test-PortAvailable -Port $port) {
            return $port
        }
        $port++
    }
    throw "Nenhuma porta disponível encontrada a partir de $StartPort"
}

# Função para verificar se URL está respondendo
function Test-UrlResponding {
    param([string]$Url, [int]$MaxAttempts = 10)
    
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    return $false
}

# 1. Verificar Docker
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Verificar containers PostgreSQL e Redis
Write-Host ""
Write-Host "🗄️  Verificando containers do banco de dados..." -ForegroundColor Yellow

$postgresRunning = docker ps --filter "name=hpo-postgres" --filter "status=running" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=hpo-redis" --filter "status=running" --format "{{.Names}}" 2>$null

if (-not $postgresRunning -or -not $redisRunning) {
    Write-Host "⚠️  Containers não estão rodando. Iniciando..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot"
    docker-compose -f docker-compose.dev.yml up -d
    Pop-Location
    
    Write-Host "⏳ Aguardando containers iniciarem..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "✅ Containers iniciados" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL e Redis já estão rodando" -ForegroundColor Green
}

# 3. Backend
Write-Host ""
Write-Host "🔧 Verificando Backend..." -ForegroundColor Yellow

$backendPort = 3001
$backendUrl = "http://localhost:$backendPort/health"

# Verifica se backend já está rodando
try {
    $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend já está rodando na porta $backendPort" -ForegroundColor Green
} catch {
    Write-Host "📌 Backend não está rodando. Iniciando..." -ForegroundColor Yellow
    
    # Encontra porta disponível
    $backendPort = Get-AvailablePort -StartPort 3001
    Write-Host "🔌 Usando porta $backendPort para o backend" -ForegroundColor Cyan
    
    # Inicia backend
    Push-Location "$PSScriptRoot/hpo-platform-backend"
    
    $backendJob = Start-Job -ScriptBlock {
        param($port)
        $env:PORT = $port
        $env:NODE_ENV = "development"
        npm run dev
    } -ArgumentList $backendPort
    
    Pop-Location
    
    # Aguarda backend iniciar
    Write-Host "⏳ Aguardando backend iniciar..." -ForegroundColor Yellow
    $backendReady = Test-UrlResponding -Url "http://localhost:$backendPort/health" -MaxAttempts 30
    
    if ($backendReady) {
        Write-Host "✅ Backend iniciado com sucesso em http://localhost:$backendPort" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend não iniciou a tempo" -ForegroundColor Red
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        exit 1
    }
}

# 4. Frontend
Write-Host ""
Write-Host "⚛️  Verificando Frontend..." -ForegroundColor Yellow

$frontendPort = 5173
$frontendUrl = "http://localhost:$frontendPort"

# Verifica se frontend já está rodando
try {
    Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "✅ Frontend já está rodando na porta $frontendPort" -ForegroundColor Green
} catch {
    Write-Host "📌 Frontend não está rodando. Iniciando..." -ForegroundColor Yellow
    
    # Encontra porta disponível
    $frontendPort = Get-AvailablePort -StartPort 5173
    Write-Host "🔌 Usando porta $frontendPort para o frontend" -ForegroundColor Cyan
    
    # Inicia frontend
    Push-Location "$PSScriptRoot/plataforma-raras-cpl"
    
    $frontendJob = Start-Job -ScriptBlock {
        param($port, $backendPort)
        $env:VITE_API_URL = "http://localhost:$backendPort"
        npm run dev -- --port $port
    } -ArgumentList $frontendPort, $backendPort
    
    Pop-Location
    
    # Aguarda frontend iniciar
    Write-Host "⏳ Aguardando frontend iniciar..." -ForegroundColor Yellow
    $frontendReady = Test-UrlResponding -Url $frontendUrl -MaxAttempts 30
    
    if ($frontendReady) {
        Write-Host "✅ Frontend iniciado com sucesso em $frontendUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend pode demorar um pouco para compilar..." -ForegroundColor Yellow
    }
}

# Resumo
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ AMBIENTE DE DESENVOLVIMENTO PRONTO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 URLs Disponíveis:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:$frontendPort" -ForegroundColor White
Write-Host "   Backend:   http://localhost:$backendPort" -ForegroundColor White
Write-Host "   Health:    http://localhost:$backendPort/health" -ForegroundColor White
Write-Host ""
Write-Host "📊 Serviços:" -ForegroundColor Yellow
Write-Host "   PostgreSQL: localhost:5433" -ForegroundColor White
Write-Host "   Redis:      localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Para parar os serviços, use: .\STOP.ps1" -ForegroundColor Gray
Write-Host ""
