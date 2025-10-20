# Organizacao Simples do Projeto PORTI-HPO
Write-Host "Iniciando organizacao..." -ForegroundColor Cyan

# Criar diretorios
Write-Host "Criando estrutura..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "docs-organized\01-setup" | Out-Null
New-Item -ItemType Directory -Force -Path "docs-organized\02-features" | Out-Null
New-Item -ItemType Directory -Force -Path "docs-organized\03-deployment" | Out-Null
New-Item -ItemType Directory -Force -Path "docs-organized\05-testing" | Out-Null
New-Item -ItemType Directory -Force -Path "docs-organized\06-legacy" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts\deployment" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts\maintenance" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts\development" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\images" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\branding" | Out-Null
New-Item -ItemType Directory -Force -Path ".archive" | Out-Null

Write-Host "OK - Estrutura criada" -ForegroundColor Green

# Mover documentacao de teste
Write-Host "Movendo docs de teste..." -ForegroundColor Yellow
if (Test-Path "docs\RELATORIO_TESTES_COMPLETO.md") {
    Move-Item -Path "docs\RELATORIO_TESTES_COMPLETO.md" -Destination "docs-organized\05-testing\" -Force
}
if (Test-Path "docs\RESUMO_TESTES.md") {
    Move-Item -Path "docs\RESUMO_TESTES.md" -Destination "docs-organized\05-testing\" -Force
}

# Mover imagens
Write-Host "Movendo imagens..." -ForegroundColor Yellow
if (Test-Path "image1.png") { Move-Item -Path "image1.png" -Destination "assets\images\" -Force }
if (Test-Path "image2.png") { Move-Item -Path "image2.png" -Destination "assets\images\" -Force }
if (Test-Path "logo_porti.png") { Move-Item -Path "logo_porti.png" -Destination "assets\images\" -Force }

# Mover branding
if (Test-Path "BRANDING.txt") { Move-Item -Path "BRANDING.txt" -Destination "assets\branding\" -Force }

# Mover scripts de deployment
Write-Host "Movendo scripts..." -ForegroundColor Yellow
if (Test-Path "deploy-production.ps1") { Move-Item -Path "deploy-production.ps1" -Destination "scripts\deployment\" -Force }
if (Test-Path "deploy-production.sh") { Move-Item -Path "deploy-production.sh" -Destination "scripts\deployment\" -Force }

# Mover scripts de desenvolvimento  
if (Test-Path "start-dev.ps1") { Move-Item -Path "start-dev.ps1" -Destination "scripts\development\" -Force }
if (Test-Path "START.ps1") { Move-Item -Path "START.ps1" -Destination "scripts\development\" -Force }
if (Test-Path "STOP.ps1") { Move-Item -Path "STOP.ps1" -Destination "scripts\development\" -Force }

# Arquivar scripts antigos
Write-Host "Arquivando scripts antigos..." -ForegroundColor Yellow
if (Test-Path "organize-docs-final.ps1") { Move-Item -Path "organize-docs-final.ps1" -Destination ".archive\" -Force }
if (Test-Path "organize-docs-simple.ps1") { Move-Item -Path "organize-docs-simple.ps1" -Destination ".archive\" -Force }
if (Test-Path "reorganize-docs.ps1") { Move-Item -Path "reorganize-docs.ps1" -Destination ".archive\" -Force }
if (Test-Path "reorganize-docs-simple.ps1") { Move-Item -Path "reorganize-docs-simple.ps1" -Destination ".archive\" -Force }

# Arquivar arquivos sensiveis/desnecessarios
if (Test-Path "VERIFICAR_UPLOAD.txt") { Move-Item -Path "VERIFICAR_UPLOAD.txt" -Destination ".archive\" -Force }
if (Test-Path "*.pdf") { Move-Item -Path "*.pdf" -Destination ".archive\" -Force }

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "ORGANIZACAO COMPLETA!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estrutura criada:" -ForegroundColor Yellow
Write-Host "  docs-organized/" -ForegroundColor White
Write-Host "  scripts/" -ForegroundColor White
Write-Host "  assets/" -ForegroundColor White
Write-Host "  .archive/" -ForegroundColor DarkGray
Write-Host ""
