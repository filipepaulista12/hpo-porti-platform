# Deploy Debug Version to Production
Write-Host "🚀 Iniciando deploy da versão DEBUG para produção..." -ForegroundColor Cyan

$distPath = "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist"
$server = "ubuntu@200.144.254.4"

# 1. Upload index.html
Write-Host "`n📤 Upload index.html..." -ForegroundColor Yellow
scp "$distPath\index.html" "${server}:/tmp/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ index.html uploaded" -ForegroundColor Green
} else {
    Write-Host "❌ Falha no upload do index.html" -ForegroundColor Red
    exit 1
}

# 2. Upload JavaScript
Write-Host "`n📤 Upload index.R7NKbuCd.js..." -ForegroundColor Yellow
scp "$distPath\assets\index.R7NKbuCd.js" "${server}:/tmp/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ JavaScript uploaded" -ForegroundColor Green
} else {
    Write-Host "❌ Falha no upload do JavaScript" -ForegroundColor Red
    exit 1
}

# 3. Move files to production
Write-Host "`n📦 Movendo arquivos para produção..." -ForegroundColor Yellow
ssh $server "sudo cp /tmp/index.html /var/www/html/hpo-platform/public/ && sudo cp /tmp/index.R7NKbuCd.js /var/www/html/hpo-platform/public/assets/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao copiar arquivos" -ForegroundColor Red
    exit 1
}

# 4. Verify deployment
Write-Host "`n🔍 Verificando deployment..." -ForegroundColor Yellow
ssh $server "ls -lh /var/www/html/hpo-platform/public/assets/index.R7NKbuCd.js"

Write-Host "`n✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Abra https://hpo.raras-cplp.org" -ForegroundColor White
Write-Host "2. Pressione CTRL+SHIFT+R para limpar cache" -ForegroundColor White
Write-Host "3. Faça login com ORCID" -ForegroundColor White
Write-Host "4. Abra o Console (F12)" -ForegroundColor White
Write-Host "5. Procure pelas mensagens de DEBUG:" -ForegroundColor White
Write-Host "   - ✅ User carregado com sucesso" -ForegroundColor Gray
Write-Host "   - 📍 CurrentPage atual" -ForegroundColor Gray
Write-Host "   - 🎨 RENDERIZANDO" -ForegroundColor Gray
