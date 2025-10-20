# Deploy Fix - Verificação de User
Write-Host "🚀 Deployando fix para verificação de user..." -ForegroundColor Cyan

$server = "ubuntu@200.144.254.4"

Write-Host "`n1️⃣ Copiando index.html..." -ForegroundColor Yellow
ssh $server "sudo cp /tmp/index.html /var/www/html/hpo-platform/public/"

Write-Host "`n2️⃣ Copiando JavaScript..." -ForegroundColor Yellow
ssh $server "sudo cp /tmp/index.Ct8ZEWdC.js /var/www/html/hpo-platform/public/assets/"

Write-Host "`n3️⃣ Verificando deploy..." -ForegroundColor Yellow
ssh $server "cat /var/www/html/hpo-platform/public/index.html | Select-String 'index.*\.js'"

Write-Host "`n✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Vá para https://hpo.raras-cplp.org" -ForegroundColor White
Write-Host "2. Pressione CTRL+SHIFT+R (limpar cache)" -ForegroundColor White
Write-Host "3. Faça login com ORCID" -ForegroundColor White
Write-Host "4. Abra Console (F12)" -ForegroundColor White
Write-Host "5. Procure por '📦 RESPOSTA COMPLETA DO BACKEND:'" -ForegroundColor White
Write-Host "6. ME ENVIE O CONTEÚDO DESSA RESPOSTA!" -ForegroundColor Yellow
