# Script para verificar se frontend otimizado está deployado em produção
# Servidor: 200.144.254.4
# Caminho: /var/www/html/hpo-platform/public/

Write-Host "🔍 VERIFICANDO DEPLOY DO FRONTEND OTIMIZADO" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Verificar data do build local
Write-Host "`n📦 BUILD LOCAL:" -ForegroundColor Yellow
$localBuild = Get-ChildItem "plataforma-raras-cpl\dist\assets\*.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Arquivo: $($localBuild.Name)"
Write-Host "Data: $($localBuild.LastWriteTime)"
Write-Host "Tamanho: $([math]::Round($localBuild.Length/1MB,2)) MB"

# 2. Verificar se ProductionHPOApp.tsx tem as otimizações
Write-Host "`n🔧 OTIMIZAÇÕES NO CÓDIGO:" -ForegroundColor Yellow
$code = Get-Content "plataforma-raras-cpl\src\ProductionHPOApp.tsx" -Raw

if ($code -match "translationsCache = React\.useRef") {
    Write-Host "✅ Cache implementado (React.useRef)" -ForegroundColor Green
} else {
    Write-Host "❌ Cache NÃO encontrado!" -ForegroundColor Red
}

if ($code -match "setTimeout.*150") {
    Write-Host "✅ Debounce implementado (150ms)" -ForegroundColor Green
} else {
    Write-Host "❌ Debounce NÃO encontrado!" -ForegroundColor Red
}

if ($code -match "limit: '15'") {
    Write-Host "✅ Paginação otimizada (15 itens)" -ForegroundColor Green
} else {
    Write-Host "❌ Paginação NÃO otimizada!" -ForegroundColor Red
}

if ($code -match "maxHeight: '600px'") {
    Write-Host "✅ maxHeight implementado (600px)" -ForegroundColor Green
} else {
    Write-Host "❌ maxHeight NÃO encontrado!" -ForegroundColor Red
}

# 3. Informações para verificar no servidor
Write-Host "`n🌐 VERIFICAR NO SERVIDOR (200.144.254.4):" -ForegroundColor Yellow
Write-Host "1. Conectar via SSH/FileZilla"
Write-Host "2. Navegar para: /var/www/html/hpo-platform/public/assets/"
Write-Host "3. Verificar data de modificação dos arquivos .js"
Write-Host "4. Comparar tamanho:"
Write-Host "   - Esperado: ~1.5-1.6 MB (otimizado)"
Write-Host "   - Se > 2 MB: NÃO deployado!"

# 4. Comando para fazer deploy
Write-Host "`n📤 PARA FAZER DEPLOY:" -ForegroundColor Yellow
Write-Host @"
# OPÇÃO 1: FileZilla/WinSCP
1. Conectar em 200.144.254.4
2. Navegar para /var/www/html/hpo-platform/public/
3. Fazer backup da pasta atual: mv public public_backup_$(date +%Y%m%d)
4. Upload da pasta: plataforma-raras-cpl\dist\* -> /var/www/html/hpo-platform/public/

# OPÇÃO 2: SCP (se SSH funcionar)
scp -r plataforma-raras-cpl\dist\* root@200.144.254.4:/var/www/html/hpo-platform/public/

# OPÇÃO 3: Script automático (requer SSH)
.\deploy-frontend.ps1
"@

Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "1. Fazer BACKUP antes de substituir arquivos!"
Write-Host "2. Limpar cache do browser após deploy (Ctrl+Shift+R)"
Write-Host "3. Verificar no DevTools se os arquivos novos foram carregados"

Write-Host "`n=" * 60
