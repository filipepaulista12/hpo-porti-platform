# 📚 Documentação - HPO Translator (Plataforma Raras)

## 📂 Estrutura da Documentação

Esta pasta centraliza TODA a documentação do projeto HPO Translator (Plataforma Raras).

### 📖 **Guias de Uso**
- [`GUIA_TRADUCAO.md`](./GUIA_TRADUCAO.md) - Boas práticas para tradutores (precisão, consistência, DeCS)
- [`GUIA_USUARIO_COMPLETO.md`](./GUIA_USUARIO_COMPLETO.md) - Manual completo do usuário final

### 🏗️ **Arquitetura e Desenvolvimento**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Visão geral da arquitetura (Backend + Frontend + Banco)
- [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) - Guia para desenvolvedores (setup, comandos, workflow)
- [`ADMIN_DASHBOARD_ARCHITECTURE.md`](./ADMIN_DASHBOARD_ARCHITECTURE.md) - Arquitetura do painel administrativo

### 🧪 **Testes e Qualidade**
- [`TESTING_CHECKLIST.md`](./TESTING_CHECKLIST.md) - Checklist de testes (unit, E2E, coverage)
- [`QUICK_TEST_GUIDE.md`](./QUICK_TEST_GUIDE.md) - Guia rápido de testes para CI/CD

### 🎯 **Implementação e Roadmap**
- [`IMPLEMENTATION_ROADMAP.txt`](./IMPLEMENTATION_ROADMAP.txt) - Roadmap de funcionalidades
- [`TASKS_CHECKLIST.md`](./TASKS_CHECKLIST.md) - Checklist de tasks UX (20 tasks)
- [`ANALISE_COMPARATIVA.md`](./ANALISE_COMPARATIVA.md) - Análise do que foi implementado vs. esperado
- [`FINAL_REPORT.md`](./FINAL_REPORT.md) - Relatório final de implementação (sessão 2025-01-20)

### 📊 **Relatórios e Status**
- [`relatoriocompleto.txt`](./relatoriocompleto.txt) - Relatório completo com gaps críticos/importantes/nice-to-have
- [`SESSION_SUMMARY.md`](./SESSION_SUMMARY.md) - Resumos de sessões de desenvolvimento
- [`NOTIFICATION_CENTER_COMPLETE.md`](./NOTIFICATION_CENTER_COMPLETE.md) - Documentação do sistema de notificações
- [`ADMIN_MODULES_1_2_COMPLETE.md`](./ADMIN_MODULES_1_2_COMPLETE.md) - Módulos administrativos completos

### 🔧 **Operações e Deploy**
- [`COMANDOS_EXECUTAR.md`](./COMANDOS_EXECUTAR.md) - Comandos úteis (build, test, seed, etc.)
- [`DEBUG_SERVIDOR.md`](./DEBUG_SERVIDOR.md) - Guia de debug do servidor
- [`GIT_COMMIT_GUIDE.md`](./GIT_COMMIT_GUIDE.md) - Guia de commits (conventional commits)
- [`EXPORT_DOCUMENTATION.md`](./EXPORT_DOCUMENTATION.md) - Documentação de exportação de dados

### 📝 **Outros**
- [`PRD.md`](./PRD.md) - Product Requirements Document (visão de produto)
- [`SECURITY.md`](./SECURITY.md) - Políticas de segurança
- [`LICENSE`](./LICENSE) - Licença do projeto

---

## 🏥 Visão Geral do Projeto

**HPO Translator** é uma plataforma colaborativa para tradução e validação dos termos da **Human Phenotype Ontology (HPO)** para português brasileiro.

### 🎯 Objetivos
- Traduzir 17.020 termos HPO para pt-BR
- Sistema de validação por pares (peer review)
- Gamificação (pontos, badges, níveis, leaderboard)
- Qualidade através de consenso (múltiplas validações)
- Sincronização com repositório oficial HPO

### 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                │
│  - ProductionHPOApp.tsx (4,769 linhas)                     │
│  - 28 componentes React                                     │
│  - Port: 5173                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│  - TypeScript                                               │
│  - API REST + WebSocket (notificações)                      │
│  - JWT Authentication (7 dias)                              │
│  - Port: 5000                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                       │
│  - 17.020 termos HPO (após seed)                            │
│  - Tables: User, Term, Translation, Validation, Badge, etc. │
│  - Port: 5432                                               │
└─────────────────────────────────────────────────────────────┘
```

### 🎮 Funcionalidades Principais

#### ✅ **Implementadas (100%)**
- Autenticação (JWT + OAuth ORCID)
- Sistema de tradução (criar, editar, deletar)
- Validação por pares (Likert 1-5)
- Gamificação (pontos, badges, níveis, streaks)
- Leaderboard (all-time, monthly, weekly)
- Admin Dashboard (aprovar/rejeitar traduções)
- Conflict Resolution (votação por comitê)
- Analytics (métricas, progresso, top contributors)
- Notificações em tempo real (WebSocket)
- Exportação (CSV, JSON, XLIFF, Babelon TSV, Five Stars JSON)
- Onboarding Tour (6 etapas)
- Perfil de usuário (edição completa)

#### ⚠️ **Parcialmente Implementadas**
- OAuth ORCID (código pronto, mas CLIENT_ID/SECRET não configurados)
- Auto-promoção para REVIEWER (lógica falta)
- Sistema de Rejection estruturado (básico implementado)
- Moderação de usuários (flag existe, UI falta)

#### ❌ **Pendentes**
- Importação de termos HPO reais (seed não rodado) - **CRÍTICO!**
- Testes Frontend (0% coverage)
- Testes E2E (nunca rodados)
- GitHub API para Pull Requests automáticos
- Email notifications (SendGrid)
- Dark mode
- Página de Guidelines

---

## 🚀 Quick Start

### 1️⃣ **Backend**
```powershell
cd hpo-platform-backend
npm install
npx prisma generate
npx prisma migrate deploy

# Importar termos HPO (CRÍTICO!)
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

### 2️⃣ **Frontend**
```powershell
cd plataforma-raras-cpl
npm install
npm run dev
```

### 3️⃣ **Abrir no Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger Docs: http://localhost:5000/api-docs

---

## 📊 Status Atual

```
Backend:              ████████████████████ 100% ✅
Frontend - Tasks UX:  ██████████████████░░  90% ✅ (18/20 tasks)
Frontend - Testes:    ░░░░░░░░░░░░░░░░░░░░   0% ❌
Backend - Testes:     ████████████████████ 100% ✅ (68/68 tests)
Testes E2E:           ░░░░░░░░░░░░░░░░░░░░   0% ❌
Documentação:         ████████████████████ 100% ✅
Dados Reais:          ░░░░░░░░░░░░░░░░░░░░   0% ❌ CRÍTICO!
UX/UI:                ███████████████████░  95% ✅
Deploy Ready:         ████████░░░░░░░░░░░░  40% 🟡
```

---

## 🎯 Próximos Passos

**AGORA (1 hora):**
1. 🔴 Importar termos HPO oficiais (`npx tsx prisma/seed.ts`)
2. 🔴 Criar usuário de teste (admin@test.com / admin123)
3. 🔴 Testar sistema end-to-end com dados reais

**HOJE (4 horas):**
4. 🟡 Implementar Token Expiration Validation (Task #19)
5. 🟡 Implementar Advanced Confirmation Modals (Task #20)
6. 🟡 Criar testes frontend básicos (5-10 tests críticos)

**ESTA SEMANA (3 dias):**
7. 🟡 OAuth ORCID (registrar app + testar)
8. 🟡 Auto-promoção REVIEWER (cronjob)
9. 🟡 Sistema de Rejection estruturado
10. 🟡 Moderação de usuários (ban/unban UI)

---

## 📞 Contato

**Repositório:** [GitHub](https://github.com/your-repo/hpo-translator)
**Documentação Oficial HPO:** https://hpo.jax.org/

---

**Última atualização:** 2025-01-20
**Versão:** 1.0.0
