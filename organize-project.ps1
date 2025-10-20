# 🧹 PORTI-HPO - Script de Organização do Projeto
# Data: 2025-10-19
# Objetivo: Preparar projeto para commit no GitHub (Monorepo)

Write-Host "🧹 Iniciando Organização do Projeto PORTI-HPO..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. CRIAR ESTRUTURA DE DIRETÓRIOS ORGANIZADOS
# ============================================

Write-Host "📁 Criando estrutura de diretórios..." -ForegroundColor Yellow

$dirs = @(
    "docs-organized/01-setup",
    "docs-organized/02-features",
    "docs-organized/03-deployment",
    "docs-organized/04-development",
    "docs-organized/05-testing",
    "docs-organized/06-legacy-archive",
    "scripts/deployment",
    "scripts/maintenance",
    "scripts/development",
    "assets/images",
    "assets/branding",
    ".archive/old-docs",
    ".archive/old-scripts"
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $PSScriptRoot $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✅ Criado: $dir" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# 2. MOVER DOCUMENTAÇÃO PARA ESTRUTURA ORGANIZADA
# ============================================

Write-Host "📚 Organizando Documentação..." -ForegroundColor Yellow

# Setup & Guias Iniciais
$setupDocs = @(
    "QUICK_START.md",
    "PROJECT_DOCUMENTATION.md",
    "README.md"
)

# Features & Releases
$featureDocs = @(
    "RESUMO_FEATURES.md",
    "ACESSIBILIDADE_WCAG_IMPLEMENTACAO.md",
    "EMAIL_NOTIFICATION_CONFIG.md",
    "EMAIL_INTEGRATION_READY.md"
)

# Deployment
$deployDocs = @(
    "GUIA_DEPLOY_APACHE_PM2.md",
    "GUIA_DEPLOY_SERVIDOR.md",
    "DEPLOYMENT_COMPLETO_SUCESSO.md",
    "PACOTE_DEPLOY_COMPLETO.md"
)

# Testing
$testDocs = @(
    "RELATORIO_TESTES_COMPLETO.md",
    "RESUMO_TESTES.md",
    "DEBUG_TESTES_RESUMO.md"
)

# Legacy/Archive (mover para arquivo)
$legacyDocs = @(
    "ACAO_IMEDIATA.md",
    "SESSAO_18_OUT_RESUMO.md",
    "SESSAO_18_OUT_TASK_6.md",
    "SESSAO_18_OUT_TASK_7_LINKEDIN.md",
    "SESSAO_COMPLETA_16_OUT_2025.md",
    "RELATORIO_FINAL_19_OUT.md",
    "RESUMO_SESSAO_18_19_OUT.md",
    "RESUMO_COMPLETO_FALTA_100.md",
    "REORGANIZACAO_RELATORIO_FINAL.md",
    "REORGANIZACAO_RESUMO.md",
    "ANALISE_MELHORIAS_COMPLETA.md",
    "ANALISE_SERVIDOR_COMPLETA.md",
    "DOCUMENTACAO_ANALISE_COMPLETA.md",
    "README.old.md",
    "COMANDOS_RAPIDOS.md",
    "COMANDOS_TESTE_LOCAL.md",
    "TODO.md",
    "TODO_NOVO.md"
)

# Mover para docs/
foreach ($doc in $setupDocs) {
    $source = Join-Path "docs" $doc
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "docs-organized/01-setup/" -Force
        Write-Host "  ✅ Movido: $doc → 01-setup/" -ForegroundColor Green
    }
}

foreach ($doc in $featureDocs) {
    $source = Join-Path "docs" $doc
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "docs-organized/02-features/" -Force
        Write-Host "  ✅ Movido: $doc → 02-features/" -ForegroundColor Green
    }
}

foreach ($doc in $deployDocs) {
    $source = Join-Path "docs" $doc
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "docs-organized/03-deployment/" -Force
        Write-Host "  ✅ Movido: $doc → 03-deployment/" -ForegroundColor Green
    }
}

foreach ($doc in $testDocs) {
    $source = Join-Path "docs" $doc
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "docs-organized/05-testing/" -Force
        Write-Host "  ✅ Movido: $doc → 05-testing/" -ForegroundColor Green
    }
}

foreach ($doc in $legacyDocs) {
    $source = Join-Path "docs" $doc
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "docs-organized/06-legacy-archive/" -Force
        Write-Host "  ✅ Arquivado: $doc" -ForegroundColor DarkGray
    }
}

Write-Host ""

# ============================================
# 3. ORGANIZAR SCRIPTS
# ============================================

Write-Host "🔧 Organizando Scripts..." -ForegroundColor Yellow

# Deployment Scripts
$deployScripts = @(
    "deploy-production.ps1",
    "deploy-production.sh",
    "start-backend-docker.ps1"
)

# Maintenance Scripts
$maintenanceScripts = @(
    "analyze-server.ps1",
    "analyze-server.sh",
    "check-database.ps1",
    "fix-firewall-admin.ps1",
    "fix-firewall-comandos.ps1",
    "fix-upload-structure.sh",
    "update-auth.ps1"
)

# Development Scripts
$devScripts = @(
    "start-dev.ps1",
    "START.ps1",
    "START.bat",
    "STOP.ps1",
    "test-orcid.ps1",
    "ssh-cmd.ps1"
)

# Archive (scripts de organização antigos)
$archiveScripts = @(
    "organize-docs-final.ps1",
    "organize-docs-simple.ps1",
    "reorganize-docs-simple.ps1",
    "reorganize-docs.ps1"
)

foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "scripts/deployment/" -Force
        Write-Host "  ✅ Movido: $script → deployment/" -ForegroundColor Green
    }
}

foreach ($script in $maintenanceScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "scripts/maintenance/" -Force
        Write-Host "  ✅ Movido: $script → maintenance/" -ForegroundColor Green
    }
}

foreach ($script in $devScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "scripts/development/" -Force
        Write-Host "  ✅ Movido: $script → development/" -ForegroundColor Green
    }
}

foreach ($script in $archiveScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination ".archive/old-scripts/" -Force
        Write-Host "  ✅ Arquivado: $script" -ForegroundColor DarkGray
    }
}

Write-Host ""

# ============================================
# 4. ORGANIZAR ASSETS
# ============================================

Write-Host "🎨 Organizando Assets..." -ForegroundColor Yellow

# Imagens
$images = @(
    "image1.png",
    "image2.png",
    "logo_porti.png"
)

# Branding
$branding = @(
    "BRANDING.txt"
)

foreach ($img in $images) {
    if (Test-Path $img) {
        Move-Item -Path $img -Destination "assets/images/" -Force
        Write-Host "  ✅ Movido: $img → images/" -ForegroundColor Green
    }
}

foreach ($brand in $branding) {
    if (Test-Path $brand) {
        Move-Item -Path $brand -Destination "assets/branding/" -Force
        Write-Host "  ✅ Movido: $brand → branding/" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# 5. DELETAR ARQUIVOS DESNECESSÁRIOS/VAZIOS
# ============================================

Write-Host "🗑️  Identificando arquivos para deletar..." -ForegroundColor Yellow

$filesToDelete = @(
    "VERIFICAR_UPLOAD.txt",
    "MIE2026_HPO_Paper_Formatted.docx.txt",
    "hpo token Filipe Andrade Bernardi (0000-0002-9597-5470) - O meu ORCID.pdf"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        # Mover para arquivo em vez de deletar (segurança)
        Move-Item -Path $file -Destination ".archive/" -Force
        Write-Host "  ✅ Arquivado: $file" -ForegroundColor DarkYellow
    }
}

Write-Host ""

# ============================================
# 6. CRIAR README PRINCIPAL DO MONOREPO
# ============================================

Write-Host "📝 Criando README principal do monorepo..." -ForegroundColor Yellow

$readmeContent = @"
# 🔗 PORTI-HPO - Portuguese Open Research & Translation Initiative

> **Por ti, pela ciência, em português**

Plataforma colaborativa de tradução de terminologias médicas (HPO) para português e outras línguas da CPLP.

[![Status](https://img.shields.io/badge/status-production-success)](https://hpo.raras-cplp.org)
[![Tests](https://img.shields.io/badge/tests-322%2F322-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20Level%20AA-green)]()

---

## 📋 Sobre o Projeto

O **PORTI-HPO** é a primeira plataforma lusófona de tradução colaborativa de terminologias médicas, focada no Human Phenotype Ontology (HPO). Com uma arquitetura moderna e gamificação integrada, conectamos profissionais de saúde, pesquisadores e tradutores para tornar o conhecimento científico acessível em português.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Completa** - JWT + OAuth ORCID + LinkedIn
- 📝 **Sistema de Tradução** - 17.020+ termos HPO
- ✅ **Validação por Pares** - Sistema de revisão colaborativo
- 🏆 **Gamificação** - Ranking, pontos, níveis e badges
- 👑 **Dashboard Admin** - Moderação e aprovação
- 🔔 **Notificações** - Email (SMTP) + Real-time
- 📊 **Exportação** - 5 formatos (CSV, JSON, XLIFF, Babelon TSV, Five Stars)
- ♿ **Acessibilidade** - WCAG 2.1 Level AA (100%)
- 📧 **Email Service** - 5 templates HTML profissionais

---

## 🏗️ Arquitetura Monorepo

\`\`\`
hpo-porti-platform/
├── apps/
│   ├── frontend/         # React + TypeScript + Vite
│   └── backend/          # Node.js + Express + Prisma
├── docs-organized/       # Documentação centralizada
├── scripts/              # Scripts de deploy e manutenção
├── assets/               # Imagens e branding
├── .github/              # GitHub Actions CI/CD
└── package.json          # Workspace root
\`\`\`

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- pnpm (recomendado) ou npm

### Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/hpo-porti-platform.git
cd hpo-porti-platform

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Rodar migrations
cd apps/backend
npx prisma migrate dev

# Iniciar desenvolvimento
pnpm dev
\`\`\`

Acesse: http://localhost:5000 (frontend) e http://localhost:3001 (backend)

---

## 🧪 Testes

\`\`\`bash
# Todos os testes
pnpm test

# Backend apenas
pnpm test:backend

# Frontend apenas
pnpm test:frontend

# Com coverage
pnpm test:coverage
\`\`\`

**Status Atual**: ✅ **322/322 testes passando (100%)**

- Backend: 120 testes
- Frontend: 202 testes

---

## 📚 Documentação

- **[Setup Guide](docs-organized/01-setup/QUICK_START.md)** - Guia rápido de instalação
- **[Features](docs-organized/02-features/)** - Funcionalidades implementadas
- **[Deployment](docs-organized/03-deployment/)** - Guias de deploy
- **[Testing](docs-organized/05-testing/)** - Relatórios de testes

---

## 🎨 Branding

### Nome
**PORTI** = Portuguese Open Research & Translation Initiative

### Significado Duplo
- **"Por ti"** (para você) - aspecto humano e inclusivo
- **PORTI** - acrônimo técnico profissional

### Tagline
**"Por ti, pela ciência, em português"**

### Cores
- Azul #1E40AF (ciência, confiança)
- Roxo #7C3AED (inovação, doenças raras)
- Verde #10B981 (saúde, sustentabilidade)

### Expansão Futura
- PORTI-HPO (atual)
- PORTI-SNOMED
- PORTI-ORDO
- PORTI-AI

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja nosso [guia de contribuição](CONTRIBUTING.md).

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Time

Desenvolvido pela comunidade **RARAS-CPLP** para democratizar o acesso ao conhecimento científico em português.

---

## 📧 Contato

- Website: https://hpo.raras-cplp.org
- Email: contato@raras-cplp.org
- DPO/LGPD: dpo@raras-cplp.org

---

**Por ti, pela ciência, em português** 🔗
"@

Set-Content -Path "README-MONOREPO.md" -Value $readmeContent -Encoding UTF8
Write-Host "  ✅ Criado: README-MONOREPO.md" -ForegroundColor Green

Write-Host ""

# ============================================
# 7. CRIAR .gitignore PRINCIPAL
# ============================================

Write-Host "📝 Criando .gitignore principal..." -ForegroundColor Yellow

$gitignoreContent = @"
# =====================================
# PORTI-HPO Monorepo .gitignore
# =====================================

# Node modules
node_modules/
**/node_modules/

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# Environment files
.env
.env.local
.env.*.local
apps/backend/.env
apps/frontend/.env

# Build outputs
dist/
build/
.next/
.vite/
*.tsbuildinfo

# Database
*.db
*.sqlite
*.sqlite3
prisma/*.db

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Archives & Backups
.archive/
*BACKUP*
*.bak

# Temporary files
*.tmp
.temp/

# Uploads
uploads/
**/uploads/

# Docker
*.dockerignore
docker-compose.override.yml
"@

Set-Content -Path "gitignore-new.txt" -Value $gitignoreContent
Write-Host "  OK Criado: gitignore-new.txt" -ForegroundColor Green

Write-Host ""

# ============================================
# 8. RELATORIO FINAL
# ============================================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "ORGANIZACAO COMPLETA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Yellow
Write-Host "  OK Estrutura de diretorios criada" -ForegroundColor Green
Write-Host "  OK Documentacao organizada" -ForegroundColor Green
Write-Host "  OK Scripts movidos" -ForegroundColor Green
Write-Host "  OK Assets organizados" -ForegroundColor Green
Write-Host "  OK Arquivos arquivados" -ForegroundColor Green
Write-Host "  OK README-MONOREPO.md criado" -ForegroundColor Green
Write-Host "  OK gitignore-new.txt criado" -ForegroundColor Green
Write-Host ""
Write-Host "Nova Estrutura:" -ForegroundColor Yellow
Write-Host "  docs-organized/" -ForegroundColor White
Write-Host "    01-setup/" -ForegroundColor White
Write-Host "    02-features/" -ForegroundColor White
Write-Host "    03-deployment/" -ForegroundColor White
Write-Host "    04-development/" -ForegroundColor White
Write-Host "    05-testing/" -ForegroundColor White
Write-Host "    06-legacy-archive/" -ForegroundColor DarkGray
Write-Host "  scripts/" -ForegroundColor White
Write-Host "    deployment/" -ForegroundColor White
Write-Host "    maintenance/" -ForegroundColor White
Write-Host "    development/" -ForegroundColor White
Write-Host "  assets/" -ForegroundColor White
Write-Host "    images/" -ForegroundColor White
Write-Host "    branding/" -ForegroundColor White
Write-Host ""
Write-Host "Proximos Passos:" -ForegroundColor Yellow
Write-Host "  1. Revisar estrutura organizada" -ForegroundColor White
Write-Host "  2. Renomear: plataforma-raras-cpl para frontend" -ForegroundColor White
Write-Host "  3. Renomear: hpo-platform-backend para backend" -ForegroundColor White
Write-Host "  4. Criar estrutura monorepo apps/" -ForegroundColor White
Write-Host "  5. Criar package.json root" -ForegroundColor White
Write-Host "  6. Git init e commit" -ForegroundColor White
Write-Host ""
