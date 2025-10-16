# Script para testar ORCID OAuth diretamente

Write-Host "🧪 Testando ORCID OAuth..." -ForegroundColor Cyan

# Passo 1: Gerar URL de autorização
$clientId = "APP-1874NUBYLF4F5QJL"
$redirectUri = "https://hpo.raras-cplp.org/api/auth/orcid/callback"
$scope = "/authenticate"

$authUrl = "https://orcid.org/oauth/authorize?client_id=$clientId&response_type=code&scope=$scope&redirect_uri=$redirectUri"

Write-Host "`n📋 URL de Autorização:" -ForegroundColor Yellow
Write-Host $authUrl

Write-Host "`n⚠️  ATENÇÃO:" -ForegroundColor Red
Write-Host "1. Copie a URL acima" -ForegroundColor White
Write-Host "2. Abra no navegador" -ForegroundColor White
Write-Host "3. Faça login no ORCID" -ForegroundColor White
Write-Host "4. Após autorizar, copie o 'code=' da URL de retorno" -ForegroundColor White
Write-Host "5. Cole aqui:" -ForegroundColor White

$code = Read-Host "`nCódigo de autorização"

if ($code) {
    Write-Host "`n🔄 Trocando código por token..." -ForegroundColor Cyan
    
    $tokenUrl = "https://orcid.org/oauth/token"
    $body = @{
        client_id = $clientId
        client_secret = "25206f17-cd6c-478e-95e5-156a5391c307"
        grant_type = "authorization_code"
        code = $code
        redirect_uri = $redirectUri
    }
    
    try {
        $response = Invoke-WebRequest -Uri $tokenUrl -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        Write-Host "`n✅ SUCESSO!" -ForegroundColor Green
        Write-Host $response.Content
    } catch {
        Write-Host "`n❌ ERRO:" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "`n📄 Resposta do servidor:" -ForegroundColor Yellow
            Write-Host $responseBody
        }
    }
}
