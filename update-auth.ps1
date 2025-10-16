# Script para atualizar auth.routes.js no servidor
$ErrorActionPreference = "Stop"

Write-Host "📦 Enviando auth.routes.js..." -ForegroundColor Cyan
scp "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\dist\routes\auth.routes.js" ubuntu@200.144.254.4:/var/www/html/hpo-platform/backend/dist/routes/

Write-Host "🔄 Reiniciando backend..." -ForegroundColor Cyan
ssh ubuntu@200.144.254.4 "pm2 restart hpo-backend"

Write-Host "✅ Pronto! Aguardando 5 segundos..." -ForegroundColor Green
Start-Sleep -Seconds 5

Write-Host "📋 Logs do servidor:" -ForegroundColor Yellow
ssh ubuntu@200.144.254.4 "tail -20 /var/www/html/hpo-platform/backend/logs/out.log"

Write-Host "`n🧪 TESTE AGORA: https://hpo.raras-cplp.org" -ForegroundColor Green
