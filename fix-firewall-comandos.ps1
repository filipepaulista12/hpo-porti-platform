# ================================================================
# 🔥 FIX FIREWALL - COMANDOS DIRETOS (SEM SCRIPT)
# ================================================================
# Execute estes comandos UM POR VEZ no PowerShell como ADMIN
# ================================================================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🔥 CONFIGURAÇÃO FIREWALL - COMANDOS DIRETOS          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ================================================================
# COMANDO 1: Remover regras antigas (se existirem)
# ================================================================
Write-Host "📋 Removendo regras antigas..." -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "HPO-Dev-*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
Write-Host "✅ OK`n" -ForegroundColor Green

# ================================================================
# COMANDO 2: Criar regra INBOUND (receber conexões)
# ================================================================
Write-Host "🔧 Criando regra INBOUND..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "HPO-Dev-Ports-Inbound" -Description "Permite portas 3000-6000 para HPO Platform" -Direction Inbound -Protocol TCP -LocalPort 3000-6000 -Action Allow -Profile Any -Enabled True
Write-Host "✅ INBOUND criada`n" -ForegroundColor Green

# ================================================================
# COMANDO 3: Criar regra OUTBOUND (enviar conexões)
# ================================================================
Write-Host "🔧 Criando regra OUTBOUND..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "HPO-Dev-Ports-Outbound" -Description "Permite portas 3000-6000 para HPO Platform" -Direction Outbound -Protocol TCP -LocalPort 3000-6000 -Action Allow -Profile Any -Enabled True
Write-Host "✅ OUTBOUND criada`n" -ForegroundColor Green

# ================================================================
# COMANDO 4: Verificar regras criadas
# ================================================================
Write-Host "📊 Verificando regras criadas..." -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "HPO-Dev-*" | Select-Object DisplayName, Enabled, Direction | Format-Table -AutoSize
Write-Host ""

# ================================================================
# COMANDO 5: Testar conectividade
# ================================================================
Write-Host "🧪 Testando portas..." -ForegroundColor Yellow

$ports = @(3000, 3001, 5173)
foreach ($port in $ports) {
    Write-Host "   Porta $port : " -NoNewline -ForegroundColor Cyan
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
        $listener.Start()
        Start-Sleep -Milliseconds 100
        $listener.Stop()
        Write-Host "✅ DISPONÍVEL" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*já está*" -or $_.Exception.Message -like "*already*") {
            Write-Host "⚠️  EM USO (OK!)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ BLOQUEADA" -ForegroundColor Red
        }
    }
}

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ CONFIGURAÇÃO CONCLUÍDA!                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🚀 PRÓXIMO PASSO: Teste o frontend`n" -ForegroundColor Yellow
Write-Host "   cd plataforma-raras-cpl" -ForegroundColor Cyan
Write-Host "   npm run dev`n" -ForegroundColor Cyan

pause
