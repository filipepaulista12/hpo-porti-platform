# Script para testar todos os endpoints da API
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TESTE COMPLETO DA API HPO-PT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$testResults = @()

# Função helper para testar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "🔍 Testando: $Name" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ SUCESSO" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress -Depth 3)" -ForegroundColor Gray
        Write-Host ""
        
        return @{
            Name = $Name
            Status = "✅ PASS"
            Response = $response
        }
    }
    catch {
        Write-Host "   ❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        
        return @{
            Name = $Name
            Status = "❌ FAIL"
            Error = $_.Exception.Message
        }
    }
}

# ═══════════════════════════════════════════════════════
# PARTE 1: ENDPOINTS PÚBLICOS
# ═══════════════════════════════════════════════════════

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  📡 PARTE 1: ENDPOINTS PÚBLICOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. Health Check
$result = Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/health"
$testResults += $result

# 2. Stats Overview
$result = Test-Endpoint -Name "Stats Overview" -Method "GET" -Url "$baseUrl/api/stats/overview"
$testResults += $result

# 3. Leaderboard
$result = Test-Endpoint -Name "Leaderboard" -Method "GET" -Url "$baseUrl/api/stats/leaderboard"
$testResults += $result

# ═══════════════════════════════════════════════════════
# PARTE 2: AUTENTICAÇÃO
# ═══════════════════════════════════════════════════════

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🔐 PARTE 2: AUTENTICAÇÃO" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 4. Register User
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerData = @{
    email = "teste$timestamp@hpo.test"
    password = "Teste123!"
    name = "Usuário Teste"
    institution = "Universidade Teste"
    specialty = "Genética"
    country = "BR"
}

$result = Test-Endpoint -Name "Register User" -Method "POST" -Url "$baseUrl/api/auth/register" -Body $registerData
$testResults += $result
$token = $result.Response.token

# 5. Login
if ($token) {
    $loginData = @{
        email = $registerData.email
        password = $registerData.password
    }
    
    $result = Test-Endpoint -Name "Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData
    $testResults += $result
    $loginToken = $result.Response.token
}

# ═══════════════════════════════════════════════════════
# PARTE 3: ENDPOINTS PROTEGIDOS
# ═══════════════════════════════════════════════════════

if ($token) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  🔒 PARTE 3: ENDPOINTS PROTEGIDOS" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }
    
    # 6. Get User Profile
    $result = Test-Endpoint -Name "Get User Profile" -Method "GET" -Url "$baseUrl/api/users/me" -Headers $authHeaders
    $testResults += $result
    
    # 7. List Terms (first page)
    $result = Test-Endpoint -Name "List Terms (page 1)" -Method "GET" -Url "$baseUrl/api/terms?page=1&limit=10" -Headers $authHeaders
    $testResults += $result
    
    # 8. Get Term Details (first term if available)
    if ($result.Response.terms -and $result.Response.terms.Count -gt 0) {
        $firstTermId = $result.Response.terms[0].id
        $result = Test-Endpoint -Name "Get Term Details" -Method "GET" -Url "$baseUrl/api/terms/$firstTermId" -Headers $authHeaders
        $testResults += $result
    }
    
    # 9. Get My Stats
    $result = Test-Endpoint -Name "Get My Stats" -Method "GET" -Url "$baseUrl/api/stats/my-stats" -Headers $authHeaders
    $testResults += $result
    
    # 10. Get My Translations
    $result = Test-Endpoint -Name "Get My Translations" -Method "GET" -Url "$baseUrl/api/translations/my-translations" -Headers $authHeaders
    $testResults += $result
}

# ═══════════════════════════════════════════════════════
# RESUMO DOS RESULTADOS
# ═══════════════════════════════════════════════════════

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -like "*PASS*" }).Count
$failed = ($testResults | Where-Object { $_.Status -like "*FAIL*" }).Count
$total = $testResults.Count

foreach ($test in $testResults) {
    $statusColor = if ($test.Status -like "*PASS*") { "Green" } else { "Red" }
    Write-Host "  $($test.Status) $($test.Name)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TOTAL: $total testes" -ForegroundColor White
Write-Host "  ✅ PASSOU: $passed" -ForegroundColor Green
Write-Host "  ❌ FALHOU: $failed" -ForegroundColor Red
Write-Host "  📈 TAXA DE SUCESSO: $([math]::Round(($passed/$total)*100, 2))%" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

if ($passed -eq $total) {
    Write-Host "`n🎉 TODOS OS TESTES PASSARAM! API 100% FUNCIONAL! 🎉" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Alguns testes falharam. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host ""
