# 🎯 PLANO DE AÇÃO - ORGANIZAÇÃO DOS REPOSITÓRIOS

**Data:** 16 de Outubro de 2025

---

## 📊 **SITUAÇÃO ATUAL CONFIRMADA:**

### **Repositórios GitHub:**

1. ✅ **Frontend:** https://github.com/filipepaulista12/plataforma-raras-cpl
   - **Status:** Tem monorepo antigo (backend + frontend juntos)
   - **Problema:** Versão desatualizada, precisa limpar
   - **Branch local:** Submodule em `plataforma-raras-cpl/`

2. ✅ **Backend:** https://github.com/filipepaulista12/hpo-translator-cplp-backend.git
   - **Status:** Repositório VAZIO (recém criado)
   - **Ação:** Fazer push do backend atual

### **Repositório Local:**
```
hpo_translation/
├── .git/                          ← Git principal (sem remote GitHub)
├── hpo-platform-backend/          ← Backend (vai pro repo backend)
├── plataforma-raras-cpl/          ← Frontend (submodule)
├── docs/                          ← Docs (vai pro repo backend)
└── scripts, configs, etc          ← Vai pro repo backend
```

---

## 🚀 **PLANO DE AÇÃO:**

### **FASE 1: Preparar Backend para Push** ✅

**Objetivo:** Limpar e organizar o que vai pro GitHub

#### **1.1 Criar/Atualizar .gitignore**
```bash
# Adicionar ao .gitignore:
.env
.env.*
!.env.example
!.env.production.example
**/COORDENADAS_FILEZILLA.md
*.pdf
node_modules/
dist/
.DS_Store
*.log
ssh-cmd.ps1
test-orcid.ps1
update-auth.ps1
hpo-platform-backend/.env.server
```

#### **1.2 Remover Submodule do Frontend**
```bash
# O frontend já está em repo separado, não precisa estar aqui
git rm plataforma-raras-cpl
git commit -m "chore: remove frontend submodule (repositório separado)"
```

#### **1.3 Remover Arquivos Sensíveis**
```bash
# Remover do Git (mas manter localmente):
git rm --cached hpo-platform-backend/.env
git rm --cached docs/COORDENADAS_FILEZILLA.md
git rm --cached "hpo token*.pdf"
git commit -m "chore: remove sensitive files"
```

---

### **FASE 2: Organizar Commits** ✅

**Fazer commits limpos e organizados:**

#### **Commit 1: Backend - ORCID OAuth Funcional**
```bash
git add hpo-platform-backend/src/server.ts
git add hpo-platform-backend/src/routes/auth.routes.ts
git add hpo-platform-backend/src/middleware/auth.ts
git add hpo-platform-backend/dist/
git commit -m "feat(backend): ORCID OAuth + Trust Proxy configurado

- Implementado login com ORCID iD oficial (produção)
- Configurado Express trust proxy para Apache reverse proxy  
- Corrigido rate limiter para X-Forwarded-For headers
- Removida chamada problemática ao endpoint /person
- Adicionados logs detalhados para debugging
- ORCID login 100% funcional em produção

Tested: ✅ Login funcionando em https://hpo.raras-cplp.org
ORCID App: APP-1874NUBYLF4F5QJL"
```

#### **Commit 2: Scripts de Deploy e Automação**
```bash
git add START.bat START.ps1 STOP.ps1
git add deploy-production.ps1 deploy-production.sh
git add ecosystem.config.js
git add docker-compose.*.yml
git add hpo.raras-cplp.org.conf
git commit -m "feat(deploy): Scripts de automação e configurações PM2

- Scripts START/STOP para desenvolvimento local
- Deploy automático para produção (deploy-production.ps1)
- Configuração PM2 (ecosystem.config.js)
- Docker Compose para dev/prod/simple
- Apache VirtualHost config
- Nginx config (alternativa)

Tested: ✅ Deploy funcionando no servidor 200.144.254.4"
```

#### **Commit 3: Documentação Completa**
```bash
git add docs/
git add PROJECT_DOCUMENTATION.md
git add QUICK_START.md
git add README.md
git add TODO.md
git add ORCID_LOGIN_SUCESSO_FINAL.md
git add CORRECAO_TRUST_PROXY_APLICADA.md
git add GIT_STATUS_RESUMO.md
git add SITUACAO_REPOSITORIOS_GIT.md
git commit -m "docs: Documentação completa de deploy e ORCID

Adicionada documentação detalhada:
- Guias de deploy (Apache, PM2, DNS, SSL)
- Documentação ORCID OAuth (configuração e troubleshooting)
- Troubleshooting (Docker, Email, Servidor)
- Arquitetura e setup do projeto
- TODO e roadmap
- Sessões de desenvolvimento completas

Total: ~50 arquivos de documentação organizados em /docs"
```

#### **Commit 4: Configurações e Templates**
```bash
git add .env.production.example
git add hpo-platform-backend/.env.example
git add .github/
git commit -m "chore: Templates de configuração e CI/CD

- Template .env para produção
- Exemplo de configuração backend
- GitHub Actions workflows (futuros)
- EditorConfig e formatação"
```

#### **Commit 5: Limpeza e Organização**
```bash
git add -u  # Adiciona todas as remoções
git commit -m "chore: Reorganização e limpeza de documentação

Removidos:
- Arquivos duplicados de relatórios
- Documentação obsoleta do monorepo
- Arquivos de análise temporários

Consolidada documentação em estrutura organizada em /docs"
```

---

### **FASE 3: Push para GitHub (Backend)** 🚀

```bash
# 1. Verificar remote
git remote -v

# Deve mostrar:
# backend  https://github.com/filipepaulista12/hpo-translator-cplp-backend.git (fetch)
# backend  https://github.com/filipepaulista12/hpo-translator-cplp-backend.git (push)

# 2. Push da branch atual
git push backend feature/migrate-monorepo-safely

# 3. Criar branch main/master se necessário
git checkout -b main
git push backend main

# 4. Definir main como branch padrão no GitHub
# Ir em: Settings > Branches > Default branch
```

---

### **FASE 4: Atualizar Frontend (Separado)** 🎨

**No repositório do Frontend:**

```bash
cd plataforma-raras-cpl

# 1. Verificar status
git status
git remote -v

# Deve mostrar:
# origin  https://github.com/filipepaulista12/plataforma-raras-cpl.git

# 2. Ver o que mudou
git diff

# 3. Fazer commit das mudanças (se houver)
git add .
git commit -m "feat: Atualizações do frontend

- Integração com backend ORCID
- Correções de API endpoints
- Melhorias de UX"

# 4. Push
git push origin main
```

---

### **FASE 5: Limpar Histórico GitHub (OPCIONAL)** 🧹

**Se quiser limpar o monorepo antigo do frontend:**

⚠️ **ATENÇÃO: Isso apaga o histórico! Fazer backup antes!**

```bash
# Opção A: Force push (perigoso, apaga histórico)
cd plataforma-raras-cpl
git checkout -b fresh-start
git rm -rf .
# Copiar arquivos atuais
git add .
git commit -m "feat: Frontend limpo (separado do backend)"
git push origin fresh-start --force

# Opção B: Manter histórico, fazer commit de limpeza
git rm -rf <arquivos do backend antigo>
git commit -m "chore: remove backend files (moved to separate repo)"
git push origin main
```

---

## 📋 **CHECKLIST FINAL:**

### **Antes de Push:**
- [ ] `.gitignore` atualizado com arquivos sensíveis
- [ ] Arquivos `.env` removidos do Git
- [ ] `COORDENADAS_FILEZILLA.md` removido
- [ ] PDFs pessoais removidos
- [ ] Scripts temporários removidos
- [ ] Commits organizados e com mensagens claras
- [ ] README.md atualizado

### **Depois de Push:**
- [ ] Verificar repo backend no GitHub
- [ ] Verificar repo frontend no GitHub
- [ ] Configurar branch padrão (main)
- [ ] Adicionar descrição nos repos
- [ ] Adicionar topics/tags
- [ ] Configurar GitHub Actions (CI/CD)
- [ ] Adicionar badges ao README

---

## 🎯 **ESTRUTURA FINAL:**

```
GitHub/filipepaulista12/
├── plataforma-raras-cpl                    ← Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── hpo-translator-cplp-backend             ← Backend (Express + TypeScript)
    ├── hpo-platform-backend/               ← Código backend
    │   ├── src/
    │   ├── prisma/
    │   ├── dist/
    │   └── package.json
    ├── docs/                               ← Documentação completa
    ├── docker-compose.yml                  ← Docker configs
    ├── ecosystem.config.js                 ← PM2 config
    ├── START.ps1                           ← Scripts
    ├── deploy-production.ps1
    └── README.md                           ← Documentação principal
```

---

## 💡 **RECOMENDAÇÕES EXTRAS:**

### **Para o Backend:**
1. Adicionar **GitHub Actions** para CI/CD
2. Configurar **Dependabot** para atualizações
3. Adicionar **badges** no README (build status, coverage)
4. Configurar **branch protection** na main
5. Adicionar **CONTRIBUTING.md**

### **Para o Frontend:**
1. Deploy automático no **Vercel** ou **Netlify**
2. Preview deployments para PRs
3. Lighthouse CI para performance

---

## 🚀 **COMANDOS RESUMIDOS (COPY/PASTE):**

```powershell
# 1. Atualizar .gitignore (fazer manualmente)

# 2. Remover frontend submodule
cd C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation
git rm plataforma-raras-cpl
git commit -m "chore: remove frontend submodule"

# 3. Remover arquivos sensíveis
git rm --cached hpo-platform-backend/.env
git rm --cached docs/COORDENADAS_FILEZILLA.md
git commit -m "chore: remove sensitive files"

# 4. Fazer commits organizados (ver FASE 2 acima)

# 5. Push para backend
git push backend feature/migrate-monorepo-safely

# 6. Criar branch main
git checkout -b main
git push backend main -u
```

---

**PRONTO PARA EXECUTAR? Me avisa que vamos fazer passo a passo!** 🎯
