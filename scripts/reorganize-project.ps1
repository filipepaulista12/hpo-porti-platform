# ================================================================
# 🧹 SCRIPT DE REORGANIZAÇÃO AUTOMÁTICA DO PROJETO
# ================================================================
# Data: 21 de Janeiro de 2025
# Objetivo: Limpar e organizar projeto antes do deploy
# ================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧹 REORGANIZAÇÃO AUTOMÁTICA DO PROJETO HPO           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ================================================================
# BACKUP AUTOMÁTICO
# ================================================================

Write-Host "📦 Criando backup de segurança..." -ForegroundColor Yellow

$backupDir = ".\.reorganization-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Copiar apenas arquivos que serão deletados
Write-Host "   Copiando arquivos para backup..." -ForegroundColor Gray

# ================================================================
# FASE 1: CRIAR ESTRUTURA DE PASTAS
# ================================================================

Write-Host "`n📁 Criando nova estrutura de pastas..." -ForegroundColor Yellow

$newDirs = @(
    "docs\archive\2025-01"
    "docs\setup"
    "docs\deployment"
    "docs\features"
    "docs\testing"
    "docs\research"
    "scripts\local"
    "scripts\deploy"
    "scripts\database"
    "scripts\server"
)

foreach ($dir in $newDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Criado: $dir" -ForegroundColor Green
    }
}

# ================================================================
# FASE 2: MOVER ARQUIVOS PARA ARCHIVE
# ================================================================

Write-Host "`n📦 Arquivando relatórios e documentos obsoletos..." -ForegroundColor Yellow

$toArchive = @(
    "RELATORIO_COMPLETO_20_OUT_2025.md"
    "RELATORIO_FINAL_SESSAO_20_OUT.md"
    "RELATORIO_POS_CRASH_20_OUT.md"
    "RELATORIO_VERIFICACAO.md"
    "RESUMO_EXECUTIVO.md"
    "SESSAO_18_OUT_RESUMO.md"
    "ANALISE_COMPLETA_FINAL.md"
    "EXECUTAR_AGORA.md"
    "ACAO_IMEDIATA.md"
    "ATUALIZACAO_FRONTEND_URGENTE.md"
    "CORRECAO_APACHE_URGENTE.md"
    "INSTRUCOES_MIGRACAO_PRISMA.md"
    "INSTRUCOES_UPLOAD_FRONTEND.md"
)

foreach ($file in $toArchive) {
    if (Test-Path $file) {
        Move-Item $file "docs\archive\2025-01\" -Force
        Write-Host "   📦 Arquivado: $file" -ForegroundColor Gray
    }
}

# ================================================================
# FASE 3: MOVER SPRINTS PARA docs/features/
# ================================================================

Write-Host "`n📋 Movendo documentação de features..." -ForegroundColor Yellow

$featureDocs = @(
    "SPRINT_1_1_HTTPS_DEPLOY.md"
    "SPRINT_1_5_ADMIN_DASHBOARD_MOBILE.md"
    "SPRINT_1_5_ADMIN_USERS_MOBILE.md"
    "SPRINT_1_5_HISTORY_MOBILE.md"
    "SPRINT_1_5_LEADERBOARD_MOBILE.md"
    "SPRINT_1_5_MOBILE_HEADER.md"
    "SPRINT_1_5_TRANSLATEPAGE_MOBILE.md"
    "RESUMO_FEATURES.md"
)

foreach ($file in $featureDocs) {
    if (Test-Path $file) {
        Move-Item $file "docs\features\" -Force
        Write-Host "   📋 Movido: $file" -ForegroundColor Gray
    }
}

# ================================================================
# FASE 4: MOVER TESTES PARA docs/testing/
# ================================================================

Write-Host "`n🧪 Movendo documentação de testes..." -ForegroundColor Yellow

$testDocs = @(
    "TESTES_MOBILE_AUTOMATIZADOS_SUCESSO.md"
    "TESTE_MOBILE_LOCAL.md"
    "PLANO_TESTES.md"
)

foreach ($file in $testDocs) {
    if (Test-Path $file) {
        Move-Item $file "docs\testing\" -Force
        Write-Host "   🧪 Movido: $file" -ForegroundColor Gray
    }
}

# ================================================================
# FASE 5: MOVER PAPER PARA docs/research/
# ================================================================

Write-Host "`n📄 Movendo paper acadêmico..." -ForegroundColor Yellow

if (Test-Path "MIE2026_HPO_Paper_Formatted.docx.txt") {
    Move-Item "MIE2026_HPO_Paper_Formatted.docx.txt" "docs\research\" -Force
    Write-Host "   📄 Movido: MIE2026_HPO_Paper_Formatted.docx.txt" -ForegroundColor Gray
}

# ================================================================
# FASE 6: DELETAR SCRIPTS OBSOLETOS
# ================================================================

Write-Host "`n🗑️  Deletando scripts obsoletos..." -ForegroundColor Yellow

$obsoleteScripts = @(
    "deploy-debug.ps1"
    "deploy-fix-user.ps1"
    "fix-apache-final.ps1"
    "fix-apache-proxy.sh"
    "fix-firewall-admin.ps1"
    "fix-firewall-comandos.ps1"
    "fix-upload-structure.sh"
    "organize-project.ps1"
    "organize-simple.ps1"
    "analyze-server.ps1"
    "analyze-server.sh"
)

foreach ($file in $obsoleteScripts) {
    if (Test-Path $file) {
        # Backup antes de deletar
        Copy-Item $file $backupDir -Force
        Remove-Item $file -Force
        Write-Host "   🗑️  Deletado: $file (backup criado)" -ForegroundColor Red
    }
}

# ================================================================
# FASE 7: CONSOLIDAR SCRIPTS EM scripts/
# ================================================================

Write-Host "`n📝 Movendo scripts para estrutura organizada..." -ForegroundColor Yellow

# Mover scripts de database
$dbScripts = @("check-database.ps1", "start-backend-docker.ps1")
foreach ($file in $dbScripts) {
    if (Test-Path $file) {
        Move-Item $file "scripts\database\" -Force
        Write-Host "   📝 Movido: $file → scripts\database\" -ForegroundColor Gray
    }
}

# Mover scripts de deploy
$deployScripts = @("restart-backend.ps1", "update-auth.ps1")
foreach ($file in $deployScripts) {
    if (Test-Path $file) {
        Move-Item $file "scripts\deploy\" -Force
        Write-Host "   📝 Movido: $file → scripts\deploy\" -ForegroundColor Gray
    }
}

# Mover scripts de servidor
$serverScripts = @("ssh-cmd.ps1", "test-orcid.ps1")
foreach ($file in $serverScripts) {
    if (Test-Path $file) {
        Move-Item $file "scripts\server\" -Force
        Write-Host "   📝 Movido: $file → scripts\server\" -ForegroundColor Gray
    }
}

# ================================================================
# FASE 8: DELETAR ARQUIVOS DUPLICADOS
# ================================================================

Write-Host "`n🗑️  Deletando arquivos duplicados/obsoletos..." -ForegroundColor Yellow

$duplicates = @(
    "README.old.md"
    "README-MONOREPO.md"
    "PROJECT_DOCUMENTATION.md"
    "TODO.md"
    "TODO_NOVO.md"
    "LISTA_MELHORIAS_SUGERIDAS.md"
    "COMANDOS_RAPIDOS.md"
    "COMANDOS_TESTE_LOCAL.md"
    "DEPLOY_RESUMO_RAPIDO.md"
    "GUIA_DEPLOY.md"
    "GUIA_FILEZILLA_RAPIDO.md"
)

foreach ($file in $duplicates) {
    if (Test-Path $file) {
        Copy-Item $file $backupDir -Force
        Remove-Item $file -Force
        Write-Host "   🗑️  Deletado: $file (backup criado)" -ForegroundColor Red
    }
}

# ================================================================
# FASE 9: MESCLAR docs-organized/ em docs/
# ================================================================

Write-Host "`n🔄 Mesclando docs-organized/ em docs/..." -ForegroundColor Yellow

if (Test-Path "docs-organized") {
    # Copiar arquivos únicos
    Get-ChildItem "docs-organized" -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\docs-organized\", "")
        $destPath = "docs\$relativePath"
        $destDir = Split-Path $destPath -Parent
        
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        if (!(Test-Path $destPath)) {
            Copy-Item $_.FullName $destPath -Force
            Write-Host "   🔄 Copiado: $relativePath" -ForegroundColor Gray
        }
    }
    
    # Deletar docs-organized/
    Remove-Item "docs-organized" -Recurse -Force
    Write-Host "   🗑️  Removida pasta docs-organized/" -ForegroundColor Red
}

# ================================================================
# FASE 10: CRIAR DOCUMENTAÇÃO CONSOLIDADA
# ================================================================

Write-Host "`n📝 Criando documentação consolidada..." -ForegroundColor Yellow

# Criar docs/README.md (índice)
$docsIndexContent = "# Documentacao HPO Translation Platform`n`n"
$docsIndexContent += "## Indice Rapido`n`n"
$docsIndexContent += "### Para Comecar`n"
$docsIndexContent += "- README.md - Overview do projeto`n"
$docsIndexContent += "- QUICK_START.md - Guia de inicio rapido`n`n"
$docsIndexContent += "### Deploy`n"
$docsIndexContent += "- deployment/ - Guias de deploy`n`n"
$docsIndexContent += "### Features`n"
$docsIndexContent += "- features/ - Documentacao de features implementadas`n`n"
$docsIndexContent += "### Testes`n"
$docsIndexContent += "- testing/ - Testes automatizados e manuais`n`n"
$docsIndexContent += "### Arquivo`n"
$docsIndexContent += "- archive/2025-01/ - Relatorios e documentos historicos`n`n"
$docsIndexContent += "---`n`n"
$docsIndexContent += "**Ultima atualizacao:** $(Get-Date -Format 'dd/MM/yyyy HH:mm')"

Set-Content -Path "docs\README.md" -Value $docsIndexContent -Force
Write-Host "   ✅ Criado: docs\README.md" -ForegroundColor Green

# ================================================================
# FASE 11: ATUALIZAR .gitignore
# ================================================================

Write-Host "`n📝 Atualizando .gitignore..." -ForegroundColor Yellow

$gitignoreAdditions = @"

# Reorganization backups
.reorganization-backup-*/
*.backup

# Temporary documentation
REORGANIZACAO_*.md

# Archive (não versionar)
docs/archive/
"@

if (Test-Path ".gitignore") {
    Add-Content -Path ".gitignore" -Value $gitignoreAdditions
    Write-Host "   ✅ .gitignore atualizado" -ForegroundColor Green
}

# ================================================================
# RELATÓRIO FINAL
# ================================================================

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ REORGANIZAÇÃO CONCLUÍDA COM SUCESSO!       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 RESUMO DA REORGANIZAÇÃO:`n" -ForegroundColor Cyan

$archivedCount = (Get-ChildItem "docs\archive\2025-01" -File -ErrorAction SilentlyContinue).Count
$featuresCount = (Get-ChildItem "docs\features" -File -ErrorAction SilentlyContinue).Count
$testingCount = (Get-ChildItem "docs\testing" -File -ErrorAction SilentlyContinue).Count
$backupCount = (Get-ChildItem $backupDir -ErrorAction SilentlyContinue).Count

Write-Host "   📦 Arquivos arquivados: $archivedCount" -ForegroundColor White
Write-Host "   📋 Features documentadas: $featuresCount" -ForegroundColor White
Write-Host "   🧪 Testes documentados: $testingCount" -ForegroundColor White
Write-Host "   💾 Backup criado: $backupDir ($backupCount arquivos)" -ForegroundColor White

Write-Host "`n📁 ESTRUTURA FINAL:`n" -ForegroundColor Cyan
Write-Host "   Raiz: ~12 arquivos essenciais" -ForegroundColor White
Write-Host "   docs/: Organizado por categoria" -ForegroundColor White
Write-Host "   scripts/: Agrupado por função" -ForegroundColor White

Write-Host "`n🎯 PRÓXIMOS PASSOS:`n" -ForegroundColor Yellow
Write-Host "   1. Revisar arquivos na raiz" -ForegroundColor White
Write-Host "   2. Verificar docs/README.md" -ForegroundColor White
Write-Host "   3. Testar projeto (npm run dev)" -ForegroundColor White
Write-Host "   4. Commit: git add . && git commit -m 'docs: reorganize project structure'" -ForegroundColor White
Write-Host "   5. Deploy em produção" -ForegroundColor White

Write-Host "`n✅ Reorganização completa!" -ForegroundColor Green
Write-Host "💾 Backup salvo em: $backupDir`n" -ForegroundColor Cyan
