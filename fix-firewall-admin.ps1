# ================================================================
# 🔥 FIX FIREWALL - PERMITIR PORTAS DE DESENVOLVIMENTO
# ================================================================
# IMPORTANTE: Execute este script como ADMINISTRADOR
# Clique com botão direito → "Executar como Administrador"
# ================================================================

# Verificar se está rodando como Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ ERRO: Este script precisa ser executado como ADMINISTRADOR" -ForegroundColor Red
    Write-Host "`n📝 Como fazer:" -ForegroundColor Yellow
    Write-Host "   1. Clique com botão direito no PowerShell" -ForegroundColor White
    Write-Host "   2. Selecione 'Executar como Administrador'" -ForegroundColor White
    Write-Host "   3. Execute este script novamente`n" -ForegroundColor White
    pause
    exit 1
}

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🔥 CONFIGURAÇÃO FIREWALL - PORTAS DEV              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ================================================================
# PASSO 1: Verificar regras existentes
# ================================================================
Write-Host "📋 Verificando regras existentes..." -ForegroundColor Yellow

$existingRules = Get-NetFirewallRule -DisplayName "HPO-Dev-*" -ErrorAction SilentlyContinue

if ($existingRules) {
    Write-Host "   ⚠️  Encontradas regras antigas, removendo..." -ForegroundColor Yellow
    $existingRules | Remove-NetFirewallRule
    Write-Host "   ✅ Regras antigas removidas`n" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhuma regra anterior encontrada`n" -ForegroundColor Gray
}

# ================================================================
# PASSO 2: Criar regra para INBOUND (receber conexões)
# ================================================================
Write-Host "🔧 Criando regra INBOUND (receber conexões)..." -ForegroundColor Cyan

try {
    New-NetFirewallRule `
        -DisplayName "HPO-Dev-Ports-Inbound" `
        -Description "Permite conexões de entrada nas portas de desenvolvimento (3000-6000) para HPO Translation Platform" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 3000-6000 `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Enabled True `
        -ErrorAction Stop | Out-Null
    
    Write-Host "   ✅ Regra INBOUND criada!" -ForegroundColor Green
    Write-Host "      - Portas: 3000-6000 TCP" -ForegroundColor Gray
    Write-Host "      - Direção: Entrada (Inbound)" -ForegroundColor Gray
    Write-Host "      - Perfis: Domain, Private, Public`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erro ao criar regra INBOUND: $_`n" -ForegroundColor Red
    exit 1
}

# ================================================================
# PASSO 3: Criar regra para OUTBOUND (enviar conexões)
# ================================================================
Write-Host "🔧 Criando regra OUTBOUND (enviar conexões)..." -ForegroundColor Cyan

try {
    New-NetFirewallRule `
        -DisplayName "HPO-Dev-Ports-Outbound" `
        -Description "Permite conexões de saída nas portas de desenvolvimento (3000-6000) para HPO Translation Platform" `
        -Direction Outbound `
        -Protocol TCP `
        -LocalPort 3000-6000 `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Enabled True `
        -ErrorAction Stop | Out-Null
    
    Write-Host "   ✅ Regra OUTBOUND criada!" -ForegroundColor Green
    Write-Host "      - Portas: 3000-6000 TCP" -ForegroundColor Gray
    Write-Host "      - Direção: Saída (Outbound)" -ForegroundColor Gray
    Write-Host "      - Perfis: Domain, Private, Public`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erro ao criar regra OUTBOUND: $_`n" -ForegroundColor Red
    exit 1
}

# ================================================================
# PASSO 4: Criar regra específica para Node.js
# ================================================================
Write-Host "🔧 Criando regra específica para Node.js..." -ForegroundColor Cyan

$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if ($nodePath) {
    try {
        New-NetFirewallRule `
            -DisplayName "HPO-Dev-Node.js" `
            -Description "Permite Node.js para HPO Translation Platform" `
            -Direction Inbound `
            -Program $nodePath `
            -Action Allow `
            -Profile Domain,Private,Public `
            -Enabled True `
            -ErrorAction Stop | Out-Null
        
        Write-Host "   ✅ Regra Node.js criada!" -ForegroundColor Green
        Write-Host "      - Programa: $nodePath" -ForegroundColor Gray
        Write-Host "      - Todas as portas permitidas para Node.js`n" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  Não foi possível criar regra para Node.js: $_`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Node.js não encontrado no PATH`n" -ForegroundColor Yellow
}

# ================================================================
# PASSO 5: Verificar configuração
# ================================================================
Write-Host "📊 Verificando configuração..." -ForegroundColor Yellow

$rules = Get-NetFirewallRule -DisplayName "HPO-Dev-*"
Write-Host "   ✅ Regras criadas: $($rules.Count)" -ForegroundColor Green

foreach ($rule in $rules) {
    Write-Host "      - $($rule.DisplayName) [Enabled: $($rule.Enabled)]" -ForegroundColor Gray
}

Write-Host ""

# ================================================================
# PASSO 6: Testar conectividade
# ================================================================
Write-Host "🧪 Testando conectividade nas portas..." -ForegroundColor Yellow

$testPorts = @(3000, 3001, 5173, 8080)

foreach ($port in $testPorts) {
    Write-Host "   Porta $port : " -NoNewline -ForegroundColor Cyan
    
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
        $listener.Start()
        Start-Sleep -Milliseconds 100
        $listener.Stop()
        Write-Host "✅ DISPONÍVEL" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*já está sendo usado*" -or $_.Exception.Message -like "*already in use*") {
            Write-Host "⚠️  EM USO (isso é OK!)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ BLOQUEADA" -ForegroundColor Red
        }
    }
}

Write-Host ""

# ================================================================
# RESULTADO FINAL
# ================================================================
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ FIREWALL CONFIGURADO COM SUCESSO             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 O QUE FOI FEITO:" -ForegroundColor Cyan
Write-Host "   1. ✅ Regra INBOUND criada (portas 3000-6000)" -ForegroundColor White
Write-Host "   2. ✅ Regra OUTBOUND criada (portas 3000-6000)" -ForegroundColor White
Write-Host "   3. ✅ Regra Node.js específica criada" -ForegroundColor White
Write-Host "   4. ✅ Todas as regras habilitadas para Domain/Private/Public`n" -ForegroundColor White

Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Teste iniciar o frontend: cd plataforma-raras-cpl; npm run dev" -ForegroundColor White
Write-Host "   2. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Se ainda não funcionar, verifique se há firewall corporativo adicional`n" -ForegroundColor White

Write-Host "💡 DICA:" -ForegroundColor Cyan
Write-Host "   Se o problema persistir, pode ser um firewall de rede corporativo" -ForegroundColor White
Write-Host "   (não Windows Firewall). Nesse caso, será necessário contato com TI.`n" -ForegroundColor White

Write-Host "📝 Para reverter estas mudanças:" -ForegroundColor Gray
Write-Host "   Get-NetFirewallRule -DisplayName 'HPO-Dev-*' | Remove-NetFirewallRule`n" -ForegroundColor DarkGray

pause
