# 🛑 HPO Translation Platform - Parar Tudo
Write-Host "`n🛑 Parando HPO Translation Platform..." -ForegroundColor Red

# Matar processos nas portas 3001 e 5173
$ports = @(3001, 5173)
foreach ($port in $ports) {
    Write-Host "🔍 Verificando porta $port..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $processes) {
            try {
                $proc = Get-Process -Id $procId -ErrorAction Stop
                Write-Host "  ❌ Parando: $($proc.Name) (PID: $procId)" -ForegroundColor Yellow
                Stop-Process -Id $procId -Force
                Write-Host "  ✅ Processo parado" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  Processo $procId já finalizado" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  ✅ Porta $port já está livre" -ForegroundColor Green
    }
}

Write-Host "`n✅ Todos os servidores foram parados!" -ForegroundColor Green
Write-Host "Para reiniciar, execute: .\START.ps1`n" -ForegroundColor Cyan
