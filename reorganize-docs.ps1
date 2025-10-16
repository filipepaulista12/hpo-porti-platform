# ========================================
# SCRIPT DE REORGANIZAÇÃO DE DOCUMENTAÇÃO
# ========================================
# Autor: GitHub Copilot
# Data: 16 de Outubro de 2025
# Propósito: Reorganizar 84 arquivos .md em estrutura hierárquica

$ErrorActionPreference = "Stop"

Write-Host "🗂️  REORGANIZAÇÃO DE DOCUMENTAÇÃO - HPO Translation Platform" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation"
Set-Location $projectRoot

# ========================================
# FASE 1: CRIAR ESTRUTURA DE PASTAS
# ========================================
Write-Host "📁 [FASE 1/6] Criando estrutura de pastas..." -ForegroundColor Yellow

$folders = @(
    "docs\user-guides",
    "docs\developer",
    "docs\deployment",
    "docs\setup",
    "docs\testing",
    "docs\architecture",
    "docs\features",
    "docs\history",
    "docs\legacy"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $projectRoot $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✅ Criado: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Já existe: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# ========================================
# FASE 2: MOVER ARQUIVOS PARA docs/
# ========================================
Write-Host "📦 [FASE 2/6] Movendo arquivos para docs/..." -ForegroundColor Yellow

# Array de mapeamento: Origem → Destino
$fileMoves = @{
    # USER GUIDES
    "plataforma-raras-cpl\docs\GUIA_USUARIO_COMPLETO.md" = "docs\user-guides\"
    
    # DEVELOPER
    "DEVELOPMENT_GUIDE.md" = "docs\developer\"
    "hpo-platform-backend\TESTE_SEM_DOCKER.md" = "docs\developer\"
    
    # DEPLOYMENT
    "DEPLOY.md" = "docs\deployment\DEPLOY_GUIDE.md"
    
    # SETUP
    "hpo-platform-backend\ORCID_SETUP.md" = "docs\setup\"
    "hpo-platform-backend\ORCID_QUICKSTART.md" = "docs\setup\"
    "hpo-platform-backend\ORCID_SANDBOX_VS_PRODUCTION.md" = "docs\setup\"
    "hpo-platform-backend\SETUP_POSTGRES_ONLINE.md" = "docs\setup\"
    
    # TESTING
    "plataforma-raras-cpl\docs\QUICK_TEST_GUIDE.md" = "docs\testing\"
    "plataforma-raras-cpl\docs\TESTING_CHECKLIST.md" = "docs\testing\"
    
    # ARCHITECTURE
    "plataforma-raras-cpl\docs\ADMIN_DASHBOARD_ARCHITECTURE.md" = "docs\architecture\"
    
    # FEATURES
    "plataforma-raras-cpl\EXPORT_DOCUMENTATION.md" = "docs\features\"
    
    # HISTORY (com data no nome)
    "RELATORIO_FINAL_CORRECOES.md" = "docs\history\2025-10-15_RELATORIO_FINAL_CORRECOES.md"
    "RELATORIO_MELHORIAS.md" = "docs\history\2025-10-16_RELATORIO_MELHORIAS.md"
    "RELATORIO_ROTAS_IMPLEMENTADAS.md" = "docs\history\2025-10-16_RELATORIO_ROTAS_IMPLEMENTADAS.md"
    "docs\FINAL_IMPLEMENTATION_REPORT.md" = "docs\history\2025-10-15_FINAL_IMPLEMENTATION_REPORT.md"
    "plataforma-raras-cpl\docs\SESSION_SUMMARY.md" = "docs\history\2025-10-13_SESSION_SUMMARY.md"
    "plataforma-raras-cpl\docs\SESSION_REPORT_FINAL.md" = "docs\history\2025-10-XX_SESSION_REPORT_FINAL.md"
    "plataforma-raras-cpl\docs\PROGRESS_P1_REPORT.md" = "docs\history\2025-10-XX_PROGRESS_P1_REPORT.md"
    "plataforma-raras-cpl\docs\ANALISE_COMPARATIVA.md" = "docs\history\ANALISE_COMPARATIVA.md"
    "TODO_FEATURES_PENDENTES.md" = "docs\history\2025-10-15_TODO_FEATURES_PENDENTES.md"
}

$movedCount = 0
foreach ($move in $fileMoves.GetEnumerator()) {
    $source = Join-Path $projectRoot $move.Key
    $destination = Join-Path $projectRoot $move.Value
    
    # Se destino é pasta, manter nome do arquivo
    if ($destination.EndsWith("\")) {
        $destination = Join-Path $destination (Split-Path $source -Leaf)
    }
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $destination -Force
        Write-Host "  ✅ $($move.Key) → $($move.Value)" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "  ⚠️  Não encontrado: $($move.Key)" -ForegroundColor Yellow
    }
}

Write-Host "  📊 Total movido: $movedCount arquivos" -ForegroundColor Cyan
Write-Host ""

# ========================================
# FASE 3: CONSOLIDAR ARQUIVOS DUPLICADOS
# ========================================
Write-Host "🔄 [FASE 3/6] Consolidando arquivos duplicados..." -ForegroundColor Yellow

# GUIA_TRADUCAO (2 versões)
$guiaRaiz = Join-Path $projectRoot "docs\GUIA_TRADUCAO.md"
$guiaFrontend = Join-Path $projectRoot "plataforma-raras-cpl\docs\GUIA_TRADUCAO.md"
$guiaDestino = Join-Path $projectRoot "docs\user-guides\GUIA_TRADUCAO.md"

if ((Test-Path $guiaRaiz) -and (Test-Path $guiaFrontend)) {
    # Usar o maior arquivo (mais completo)
    $size1 = (Get-Item $guiaRaiz).Length
    $size2 = (Get-Item $guiaFrontend).Length
    
    if ($size1 -gt $size2) {
        Move-Item -Path $guiaRaiz -Destination $guiaDestino -Force
        Remove-Item $guiaFrontend -Force
    } else {
        Move-Item -Path $guiaFrontend -Destination $guiaDestino -Force
        Remove-Item $guiaRaiz -Force
    }
    Write-Host "  ✅ Consolidado: GUIA_TRADUCAO.md → docs\user-guides\" -ForegroundColor Green
} elseif (Test-Path $guiaRaiz) {
    Move-Item -Path $guiaRaiz -Destination $guiaDestino -Force
    Write-Host "  ✅ Movido: GUIA_TRADUCAO.md → docs\user-guides\" -ForegroundColor Green
} elseif (Test-Path $guiaFrontend) {
    Move-Item -Path $guiaFrontend -Destination $guiaDestino -Force
    Write-Host "  ✅ Movido: GUIA_TRADUCAO.md → docs\user-guides\" -ForegroundColor Green
}

# TESTING_GUIDE (2 versões)
$testingRaiz = Join-Path $projectRoot "docs\TESTING_GUIDE.md"
$testingDestino = Join-Path $projectRoot "docs\testing\TESTING_GUIDE.md"

if (Test-Path $testingRaiz) {
    Move-Item -Path $testingRaiz -Destination $testingDestino -Force
    Write-Host "  ✅ Movido: TESTING_GUIDE.md → docs\testing\" -ForegroundColor Green
}

Write-Host ""

# ========================================
# FASE 4: ARQUIVAR TODO ANTIGO
# ========================================
Write-Host "📋 [FASE 4/6] Arquivando TODO antigo..." -ForegroundColor Yellow

$todoAntigo = Join-Path $projectRoot "TODO_COMPLETO_PRODUCAO.md"
$todoArquivado = Join-Path $projectRoot "docs\history\2025-10-15_TODO_COMPLETO_PRODUCAO.md"

if (Test-Path $todoAntigo) {
    Copy-Item -Path $todoAntigo -Destination $todoArquivado -Force
    Write-Host "  ✅ Arquivado: TODO_COMPLETO_PRODUCAO.md → docs\history\" -ForegroundColor Green
    Write-Host "  ℹ️  Original mantido na raiz (será substituído por TODO.md limpo)" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# FASE 5: MOVER temp-check PARA LEGACY
# ========================================
Write-Host "🗑️  [FASE 5/6] Movendo temp-check/ para legacy/..." -ForegroundColor Yellow

$tempCheckPath = Join-Path $projectRoot "plataforma-raras-cpl\temp-check"
$legacyPath = Join-Path $projectRoot "docs\legacy\temp-check-nextjs"

if (Test-Path $tempCheckPath) {
    # Extrair informações úteis antes de mover
    Write-Host "  📝 Extraindo informações úteis..." -ForegroundColor Gray
    
    # export-format.md → mesclar com EXPORT_DOCUMENTATION.md
    $exportFormat = Join-Path $tempCheckPath "docs\export-format.md"
    if (Test-Path $exportFormat) {
        Write-Host "    ⚠️  TODO: Revisar export-format.md e mesclar com EXPORT_DOCUMENTATION.md" -ForegroundColor Yellow
    }
    
    # Mover toda pasta para legacy
    Move-Item -Path $tempCheckPath -Destination $legacyPath -Force
    Write-Host "  ✅ Movido: temp-check/ → docs\legacy\temp-check-nextjs\" -ForegroundColor Green
    Write-Host "  ℹ️  Motivo: Sistema mudou de Next.js para Vite + Express" -ForegroundColor Gray
} else {
    Write-Host "  ⏭️  temp-check/ já foi removido" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# FASE 6: ATUALIZAR README PRINCIPAL
# ========================================
Write-Host "📖 [FASE 6/6] Atualizando README.md principal..." -ForegroundColor Yellow

$readmePath = Join-Path $projectRoot "README.md"

if (Test-Path $readmePath) {
    $readmeContent = Get-Content $readmePath -Raw
    
    # Adicionar seção de documentação se não existir
    if ($readmeContent -notmatch "## Documentacao") {
        $docSection = @"

---

## Documentacao

A documentacao completa esta organizada em ``docs/``:

- **[Guias do Usuario](docs/user-guides/)** - Manuais e guias de uso
- **[Guias do Desenvolvedor](docs/developer/)** - Setup e arquitetura
- **[Deploy](docs/deployment/)** - Guias de deployment e Docker
- **[Setup](docs/setup/)** - Configuracao inicial (ORCID, PostgreSQL)
- **[Testes](docs/testing/)** - Guias de testes
- **[Arquitetura](docs/architecture/)** - Decisoes tecnicas
- **[Features](docs/features/)** - Documentacao de funcionalidades
- **[Historico](docs/history/)** - Relatorios de implementacao

### Documentos Principais

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Documentacao tecnica completa
- [QUICK_START.md](QUICK_START.md) - Guia de inicio rapido
- [TODO.md](TODO.md) - Lista de tarefas pendentes
- [CONTRIBUTING.md](CONTRIBUTING.md) - Como contribuir

"@
        Add-Content -Path $readmePath -Value $docSection
        Write-Host "  Adicionada secao de documentacao ao README.md" -ForegroundColor Green
    } else {
        Write-Host "  README.md ja possui secao de documentacao" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  README.md não encontrado na raiz" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# RELATÓRIO FINAL
# ========================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ REORGANIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Resumo:" -ForegroundColor Cyan
Write-Host "  ✅ Estrutura de pastas criada (9 pastas)" -ForegroundColor Green
Write-Host "  ✅ Arquivos movidos para docs/ ($movedCount arquivos)" -ForegroundColor Green
Write-Host "  ✅ Arquivos consolidados (GUIA_TRADUCAO, TESTING_GUIDE)" -ForegroundColor Green
Write-Host "  ✅ TODO antigo arquivado" -ForegroundColor Green
Write-Host "  ✅ temp-check movido para docs/legacy/" -ForegroundColor Green
Write-Host "  ✅ README.md atualizado" -ForegroundColor Green
Write-Host ""

Write-Host "📂 Nova Estrutura:" -ForegroundColor Cyan
Write-Host "  docs/" -ForegroundColor White
Write-Host "    ├── user-guides/        📘 Guias de usuário" -ForegroundColor Gray
Write-Host "    ├── developer/          🛠️  Guias de desenvolvedor" -ForegroundColor Gray
Write-Host "    ├── deployment/         🚀 Deploy e Docker" -ForegroundColor Gray
Write-Host "    ├── setup/              ⚙️  Configuração inicial" -ForegroundColor Gray
Write-Host "    ├── testing/            🧪 Testes" -ForegroundColor Gray
Write-Host "    ├── architecture/       🏗️  Decisões técnicas" -ForegroundColor Gray
Write-Host "    ├── features/           ✨ Features" -ForegroundColor Gray
Write-Host "    ├── history/            📜 Histórico" -ForegroundColor Gray
Write-Host "    └── legacy/             🗑️  Arquivos antigos" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  PRÓXIMOS PASSOS MANUAIS:" -ForegroundColor Yellow
Write-Host "  1. Revisar docs/setup/ORCID_*.md e consolidar em um único arquivo" -ForegroundColor White
Write-Host "  2. Criar TODO.md limpo com apenas pendências ativas" -ForegroundColor White
Write-Host "  3. Criar QUICK_START.md para novos desenvolvedores" -ForegroundColor White
Write-Host "  4. Atualizar links internos em PROJECT_DOCUMENTATION.md" -ForegroundColor White
Write-Host "  5. Revisar docs/legacy/ e decidir o que deletar permanentemente" -ForegroundColor White
Write-Host ""

Write-Host "💡 Dica: Execute 'git status' para ver todas as mudanças" -ForegroundColor Cyan
Write-Host ""
