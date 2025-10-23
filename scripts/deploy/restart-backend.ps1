# Restart backend PM2 after uploading auth.routes.js

Write-Host "🔄 Reiniciando backend PM2..." -ForegroundColor Cyan

$password = "vFpyJS4FA"
$server = "ubuntu@200.144.254.4"

# Comando para reiniciar PM2
$command = "sudo pm2 restart hpo-backend && pm2 logs hpo-backend --lines 20"

Write-Host "Executando: pm2 restart hpo-backend" -ForegroundColor Yellow

# Usar plink se disponível, ou instruções manuais
if (Get-Command plink -ErrorAction SilentlyContinue) {
    echo $password | plink -pw $password $server $command
} else {
    Write-Host "`n⚠️  Plink não encontrado. Execute manualmente:" -ForegroundColor Yellow
    Write-Host "ssh ubuntu@200.144.254.4" -ForegroundColor White
    Write-Host "Senha: vFpyJS4FA" -ForegroundColor White
    Write-Host "sudo pm2 restart hpo-backend" -ForegroundColor White
    Write-Host "curl -s https://hpo.raras-cplp.org/api/auth/config" -ForegroundColor White
}

Write-Host "`n✅ Depois de reiniciar, teste:" -ForegroundColor Green
Write-Host "https://hpo.raras-cplp.org/api/auth/config" -ForegroundColor Cyan
