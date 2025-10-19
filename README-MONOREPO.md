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

```
porti-hpo-platform/
├── hpo-platform-backend/    # Node.js + Express + Prisma
├── plataforma-raras-cpl/    # React + TypeScript + Vite
├── docs-organized/           # Documentação centralizada
├── scripts/                  # Scripts de deploy e manutenção
├── assets/                   # Imagens e branding
├── .github/                  # GitHub Actions CI/CD (futuro)
└── docker-compose.*.yml      # Configurações Docker
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou pnpm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/porti-hpo-platform.git
cd porti-hpo-platform

# Backend - Instalar dependências
cd hpo-platform-backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Rodar migrations
npx prisma migrate dev

# Iniciar backend
npm run dev

# Frontend (em outro terminal)
cd plataforma-raras-cpl
npm install
npm run dev
```

**Acesso:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:3001

---

## 🧪 Testes

```bash
# Backend
cd hpo-platform-backend
npm test

# Frontend
cd plataforma-raras-cpl
npm test
```

**Status Atual**: ✅ **322/322 testes passando (100%)**

- Backend: 120 testes (Jest)
- Frontend: 202 testes (Vitest + React Testing Library)

Veja relatórios detalhados em `docs-organized/05-testing/`

---

## 🐳 Docker

```bash
# Desenvolvimento completo (frontend + backend + postgres)
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose -f docker-compose.prod.yml up -d

# Apenas backend
docker-compose -f docker-compose.backend-only.yml up
```

---

## 📚 Documentação

- **[Setup Guide](docs-organized/01-setup/)** - Guias de instalação
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

### Cores Principais
- **Azul** `#1E40AF` - Ciência, confiança
- **Roxo** `#7C3AED` - Inovação, doenças raras
- **Verde** `#10B981` - Saúde, sustentabilidade

### Ícone
🔗 Nó de rede - representa ontologia e conexões

### Expansão Futura
- **PORTI-HPO** (atual) - Human Phenotype Ontology
- **PORTI-SNOMED** - SNOMED CT
- **PORTI-ORDO** - Orphanet Rare Disease Ontology
- **PORTI-AI** - Ferramentas de IA para tradução

---

## 🛠️ Stack Tecnológico

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL 14
- JWT + OAuth (ORCID, LinkedIn)
- Nodemailer (SMTP Gmail)
- Jest (testes)

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- TailwindCSS
- Axios
- Vitest + React Testing Library

### DevOps
- Docker + Docker Compose
- PM2 (process manager)
- Apache (reverse proxy)
- GitHub Actions (futuro)

---

## 📊 Estatísticas do Projeto

- **17.020+** termos HPO catalogados
- **322** testes automatizados (100% passing)
- **100%** WCAG 2.1 Level AA compliance
- **5** formatos de exportação
- **2** métodos OAuth (ORCID + LinkedIn)
- **5** templates de email HTML

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

**Diretrizes:**
- Escreva testes para novas funcionalidades
- Siga os padrões de código existentes (ESLint + Prettier)
- Atualize a documentação quando necessário
- Certifique-se de que todos os testes passam

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Time

Desenvolvido pela comunidade **RARAS-CPLP** para democratizar o acesso ao conhecimento científico em português.

### Contato

- **Website**: https://hpo.raras-cplp.org
- **Email**: contato@raras-cplp.org
- **DPO/LGPD**: dpo@raras-cplp.org

---

## 🔐 Segurança & Privacidade

- Conformidade com LGPD (Lei Geral de Proteção de Dados)
- Conformidade com GDPR (General Data Protection Regulation)
- Política de Privacidade disponível em `/privacy-policy`
- DPO (Data Protection Officer) designado

---

## 🏆 Reconhecimentos

Agradecimentos especiais a todos os tradutores, revisores e contribuidores que tornam este projeto possível.

Este projeto foi inspirado pela necessidade de democratizar o acesso ao conhecimento científico em português, especialmente na área de doenças raras.

---

## 📝 Changelog

### v1.0.0 (2025-10-19)
- ✅ Sistema completo de tradução colaborativa
- ✅ Autenticação JWT + OAuth (ORCID + LinkedIn)
- ✅ Gamificação com ranking e badges
- ✅ Dashboard administrativo
- ✅ Email notifications (Gmail SMTP)
- ✅ 5 formatos de exportação
- ✅ WCAG 2.1 Level AA compliance
- ✅ PORTI branding completo
- ✅ 322 testes automatizados (100%)
- ✅ Documentação completa

---

**Por ti, pela ciência, em português** 🔗
