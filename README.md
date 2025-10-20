# 🔗 PORTI-HPO - Portuguese Open Research & Translation Initiative

> **Por ti, pela ciência, em português**

Plataforma colaborativa de tradução dos termos do Human Phenotype Ontology (HPO) para português e outras línguas da CPLP.

[![Status](https://img.shields.io/badge/status-production-success)](https://hpo.raras-cplp.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescript.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

---

##  Sobre o PORTI-HPO

Sistema completo de tradução colaborativa do HPO (Human Phenotype Ontology) com foco na Comunidade dos Países de Língua Portuguesa (CPLP). O **PORTI** (Portuguese Open Research & Translation Initiative) é uma iniciativa para tornar o conhecimento científico acessível em português através de traduções colaborativas de qualidade.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Completa** - JWT + OAuth ORCID
- 📝 **Sistema de Tradução** - Tradução de 17.020 termos HPO
- ✅ **Validação por Pares** - Sistema de revisão colaborativo
- 🏆 **Gamificação** - Ranking, pontos, níveis e badges
- 👑 **Dashboard Admin** - Moderação, aprovação e rejeição de traduções
- 🔔 **Notificações em Tempo Real** - Centro de notificações com badge
- 📊 **Exportação** - 5 formatos (CSV, JSON, XLIFF, Babelon TSV, Five Stars)
- 🔍 **Busca Avançada** - Filtros por categoria, confiança e status
- 📚 **Histórico Completo** - Rastreamento de todas as contribuições



### 🚀 Para Deploy---

| Guia | Descrição |

|------|-----------|## 🚀 Quick Start

| [Deployment Guide](docs/deployment/DEPLOY_GUIDE.md) | Deploy completo em produção |

| [Guia Apache + PM2](docs/GUIA_DEPLOY_APACHE_PM2.md) | Configurar reverse proxy |### Pré-requisitos

| [ORCID Setup](docs/setup/ORCID_SETUP.md) | Autenticação ORCID |

| [DNS Hostinger](docs/GUIA_DNS_HOSTINGER.md) | Configurar domínio |- Node.js 18+ ([Download](https://nodejs.org/))

| [Email SMTP](docs/EMAIL_SMTP_SUCESSO.md) | Configurar envio de emails |- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

- Git ([Download](https://git-scm.com/))

### 📖 Para Usuários

| Guia | Descrição |### 1. Clone o Repositório

|------|-----------|

| [Guia do Usuário](docs/user-guides/GUIA_USUARIO_COMPLETO.md) | Como usar a plataforma |```bash

| [Guia de Tradução](docs/user-guides/GUIA_TRADUCAO.md) | Como traduzir termos HPO |git clone <seu-repo>

cd hpo_translation

### 🎯 Features & Arquitetura```

| Doc | Descrição |

|-----|-----------|### 2. Iniciar Infraestrutura

| [Admin Dashboard](docs/architecture/ADMIN_DASHBOARD_ARCHITECTURE.md) | Arquitetura do dashboard admin |

| [Export Formats](docs/features/EXPORT_DOCUMENTATION.md) | Formatos de exportação disponíveis |```powershell

| [Sistema de Roles](docs/features/ANALISE_SISTEMA_ROLES.md) | Permissões e papéis |cd monorepo\backend

docker compose up -d postgres redis

---npx prisma migrate deploy

```

## 🏗️ Estrutura do Projeto

### 3. Iniciar Backend

```

hpo_translation/```powershell

├── 📦 hpo-platform-backend/       # Backend (Node.js + Express + Prisma)cd monorepo\backend

│   ├── src/npx tsx watch src/server.ts

│   │   ├── routes/               # Rotas da API# Deve rodar em http://localhost:3001

│   │   ├── services/             # Lógica de negócio```

│   │   ├── middleware/           # Middlewares (auth, roles, etc)

│   │   ├── config/               # Configurações (database, jwt, etc)### 4. Iniciar Frontend

│   │   └── __tests__/            # 83 testes automatizados ✅

│   ├── prisma/                   # Schema e migrations do banco```powershell

│   └── Dockerfile               # Docker para produçãocd monorepo\frontend

│npm run dev

├── 🎨 plataforma-raras-cpl/       # Frontend (Next.js 14 App Router)# Deve rodar em http://localhost:5173

│   ├── src/```

│   │   ├── app/                 # Pages e layouts (App Router)

│   │   ├── components/          # Componentes React reutilizáveis### 5. Login de Teste

│   │   ├── contexts/            # Context API (auth, theme)

│   │   ├── hooks/               # Custom hooks```

│   │   └── utils/               # Funções utilitáriasEmail: teste@hpo.com

│   └── public/                  # Assets estáticosSenha: senha1234

│Role: ADMIN

├── 📊 hpo-translations-data/      # Dados de tradução (JSON/CSV)```

│

├── 📚 docs/                       # Documentação organizada---

│   ├── guides/                  # Guias práticos

│   ├── setup/                   # Guias de configuração inicial## 📊 Status do Projeto

│   ├── deployment/              # Guias de deploy

│   ├── testing/                 # Guias de testes### ✅ Implementado (100%)

│   ├── features/                # Documentação de features- Autenticação JWT + ORCID

│   ├── architecture/            # Arquitetura do sistema- Sistema de Tradução (17.020 termos HPO)

│   ├── developer/               # Para desenvolvedores- Validação por Pares

│   ├── user-guides/             # Para usuários finais- Gamificação (pontos, níveis, badges)

│   └── archive/                 # Histórico de sessões antigas- Admin Dashboard (Módulos 1 & 2)

│       └── 2025-10/            # Arquivos históricos de outubro- Notificações em tempo real

│- Conflict Resolution (Módulo 3)

├── 🐳 docker-compose.*.yml        # Configs Docker (dev, prod, backend-only)- Analytics & Sync (Módulo 4)

├── 📋 README.md                   # Este arquivo- Onboarding interativo

├── 📝 TODO.md                     # Lista de tarefas atual- Perfil de usuário completo

├── 🚀 QUICK_START.md              # Início rápido- **[NOVO v2.0]** Perfil Profissional com validação acadêmica

└── 📖 PROJECT_DOCUMENTATION.md    # Documentação completa- **[NOVO v2.0]** eHEALS - Literacia Digital em Saúde

```- **[NOVO v2.0]** Exportação Babelon TSV com ORCID iDs

- **[NOVO v2.0]** Botão de exportação no Admin Dashboard

---- **[NOVO v2.0]** Landing page compactada



## ✅ Status Atual (18/10/2025)### ⚠️ Testes Unitários

- **Status**: 60/60 passando ✅

### 🎉 COMPLETO- **Cobertura**: 100% E2E scenarios via unit tests

- ✅ **Backend 100% funcional** no Docker- **Framework**: Jest + TestDataFactory

- ✅ **83/83 testes automatizados** passando

- ✅ **Autenticação ORCID** configurada e funcionando---

- ✅ **Sistema de gamificação** (XP, níveis, badges, leaderboard)

- ✅ **Dashboard de analytics** implementado## 🧪 Executar Testes

- ✅ **Tour interativo** na aplicação

- ✅ **Histórico de traduções** completo### Testes Unitários (Jest)

- ✅ **5 formatos de exportação** (CSV, JSON, XLIFF, Babelon, Five Stars)```powershell

- ✅ **Sistema de notificações** em tempo realcd monorepo\backend

- ✅ **Permissões por role** (USER, TRANSLATOR, VALIDATOR, MODERATOR, ADMIN)npx jest tests/unit/ --runInBand --passWithNoTests

- ✅ **Documentação organizada** (31 arquivos movidos para archive, apenas 5 na raiz)```



### 🔄 EM ANDAMENTO### Ver Relatório de Cobertura

- 🔥 Investigação de solução para firewall corporativo```powershell

npx jest --coverage

### 📋 PRÓXIMOS PASSOS```

1. 🎬 Criar vídeo para landing page

2. 🔌 Conectar analytics backend ao frontend---

3. 🔗 LinkedIn OAuth (opcional)

## 🏗️ Arquitetura

---

### Monorepo Structure

## 🛠️ Comandos Rápidos

```

### 🐳 Docker (Produção & Desenvolvimento)hpo_translation/

├── monorepo/

```powershell│   ├── backend/               # Node.js + Express + TypeScript + Prisma

# Iniciar backend completo│   │   ├── src/

docker-compose -f docker-compose.backend-only.yml up -d│   │   │   ├── routes/        # 11 arquivos de rotas

│   │   │   ├── middleware/    # Auth, permissions, errors

# Ver logs em tempo real│   │   │   └── server.ts      # Entry point

docker logs hpo-backend -f│   │   ├── prisma/

│   │   │   └── schema.prisma  # Database schema (17 modelos)

# Rodar todos os testes (83/83 ✅)│   │   └── tests/unit/        # 60 testes unitários

docker exec hpo-backend npm test│   │

│   ├── frontend/              # React + TypeScript + Vite

# Parar containers│   │   ├── src/

docker-compose -f docker-compose.backend-only.yml down│   │   │   ├── ProductionHPOApp.tsx  # App principal (3.700 linhas)

│   │   │   └── components/    # UI components (Shadcn)

# Rebuild após mudanças no código│   │   ├── e2e/               # Testes E2E (Playwright)

docker-compose -f docker-compose.backend-only.yml up -d --build│   │   └── package.json

```│   │

│   └── docs/                  # Documentação técnica

### 💻 Frontend (Windows - sem Docker por firewall)│

├── hpo-translations/          # Repositório oficial HPO

```powershell│   └── babelon/               # Arquivos de tradução oficial

cd plataforma-raras-cpl│

└── docs/                      # Guias do usuário

# Instalar dependências (primeira vez)```

npm install

### Tech Stack

# Iniciar em desenvolvimento

npm run dev**Backend:**

# Acessa: http://localhost:3000- Node.js 18+

- Express 4.21

# Build para produção- TypeScript 5.7

npm run build- Prisma ORM 5.20

npm start- PostgreSQL 14+

```- Redis (cache)



### 🗄️ Banco de Dados (Prisma)**Frontend:**

- React 18.3

```powershell- TypeScript 5.7

cd hpo-platform-backend- Vite 6.3

- Tailwind CSS

# Aplicar migrations- Shadcn/UI

npx prisma migrate deploy

**Testing:**

# Abrir Prisma Studio (GUI do banco)- Jest (Unit Tests)

npx prisma studio- Playwright (E2E)

- TestDataFactory (Database isolation)

# Gerar Prisma Client após mudanças no schema

npx prisma generate---



# Criar nova migration## � Desenvolvimento

npx prisma migrate dev --name nome_da_migration

```### API Endpoints Principais



### 🧪 Testes| Método | Endpoint | Descrição |

|--------|----------|-----------|

```powershell| `GET` | `/health` | Status do servidor |

# Todos os testes (83/83)| `POST` | `/api/auth/login` | Login JWT |

docker exec hpo-backend npm test| `GET` | `/api/terms` | Listar termos HPO |

| `POST` | `/api/translations` | Criar tradução |

# Testes específicos| `GET` | `/api/admin/dashboard` | Dashboard admin |

docker exec hpo-backend npm test -- user-profile| `GET` | `/api/analytics` | Estatísticas |

docker exec hpo-backend npm test -- integration| `GET` | `/api/users/profile/complete` | **NOVO** - Perfil completo (user + profileJson) |

| `PUT` | `/api/users/profile/professional` | **NOVO** - Atualizar perfil profissional |

# Testes com coverage| `GET` | `/api/export/release/babelon-with-orcid` | **NOVO** - Exportar Babelon TSV com ORCID |

docker exec hpo-backend npm test -- --coverage

```---



---## 🆕 Novas Funcionalidades (v2.0)



## 🌟 Features Principais### 👨‍🔬 Perfil Profissional



### 🔐 Autenticação & SegurançaSistema completo de perfil profissional para colaboradores com validação acadêmica e integração ORCID.

- Login via email/senha ou ORCID OAuth

- JWT com refresh tokens**Campos disponíveis:**

- Middleware de autenticação e autorização por roles

- Rate limiting para prevenir abuse```typescript

- Validação de inputs com express-validator{

  institution: string;                // Instituição acadêmica

### 📝 Sistema de Tradução  department: string;                 // Departamento/Centro

- 17.020 termos HPO para traduzir  academicDegree: enum;               // Graduação | Mestrado | Doutorado | Pós-Doutorado

- Editor com sugestões e histórico  yearsExperience: number;            // Anos de experiência na área

- Sistema de revisão por pares  researchAreas: string[];            // [Bioinformática, Genética, etc]

- Detecção automática de conflitos entre traduções  orcidId: string;                    // ORCID iD (formato validado)

- Votação para resolução de conflitos  linkedInUrl: string;                // LinkedIn profile (placeholder)

  ehealsScore: number;                // Score eHEALS (8-40)

### 🏆 Gamificação  ehealsAnswers: number[];            // Respostas da escala Likert

- Sistema de XP e níveis}

- Leaderboard global```

- Badges de conquistas

- Progresso visual de contribuições**Enums definidos:**



### 👑 Dashboard Admin```typescript

- Moderação de traduçõesACADEMIC_DEGREES = ['Graduação', 'Mestrado', 'Doutorado', 'Pós-Doutorado', 'Professor'];

- Aprovação/rejeição em massa

- Analytics completos (gráficos, estatísticas)RESEARCH_AREAS = [

- Gerenciamento de usuários e permissões  'Genética Médica', 'Bioinformática', 'Doenças Raras',

  'Medicina Translacional', 'Genômica', 'Pediatria',

### 📊 Exportação  'Neurologia', 'Cardiologia', 'Farmacologia'

5 formatos disponíveis:];

1. **CSV** - Planilhas Excel```

2. **JSON** - APIs e integração

3. **XLIFF** - Padrão de tradução**API - Buscar perfil completo:**

4. **Babelon TSV** - Formato ontology

5. **Five Stars TSV** - Padrão de qualidade```bash

curl -X GET "http://localhost:3001/api/users/profile/complete" \

---  -H "Authorization: Bearer SEU_JWT_TOKEN"

```

## 🔧 Configuração de Ambiente

**Response:**

### Backend `.env````json

```env{

# Database  "user": {

DATABASE_URL="postgresql://postgres:password@hpo-postgres:5432/hpo_platform"    "id": "user_123",

    "name": "Dr. João Silva",

# JWT    "email": "joao@example.com",

JWT_SECRET="seu-secret-super-seguro-aqui"    "level": 5,

    "points": 1250

# ORCID OAuth  },

ORCID_CLIENT_ID="seu-client-id"  "profileJson": {

ORCID_CLIENT_SECRET="seu-secret"    "institution": "Universidade de São Paulo",

ORCID_REDIRECT_URI="http://localhost:3001/api/auth/orcid/callback"    "department": "Departamento de Genética",

    "academicDegree": "Doutorado",

# URLs    "yearsExperience": 8,

FRONTEND_URL="http://localhost:3000"    "researchAreas": ["Genética Médica", "Doenças Raras"],

BACKEND_URL="http://localhost:3001"    "orcidId": "0000-0002-1234-5678",

    "linkedInUrl": "",

# Email (opcional)    "ehealsScore": 35,

SMTP_HOST="smtp.gmail.com"    "ehealsAnswers": [5, 4, 5, 4, 5, 4, 3, 5]

SMTP_PORT="587"  }

SMTP_USER="seu-email@gmail.com"}

SMTP_PASS="sua-senha-app"```

```

**API - Atualizar perfil profissional:**

### Frontend `.env.local`

```env```bash

NEXT_PUBLIC_API_URL=http://localhost:3001/apicurl -X PUT "http://localhost:3001/api/users/profile/professional" \

NEXT_PUBLIC_ORCID_CLIENT_ID=seu-client-id  -H "Authorization: Bearer SEU_JWT_TOKEN" \

```  -H "Content-Type: application/json" \

  -d '{

---    "institution": "USP",

    "department": "Genética",

## 📊 Tecnologias Utilizadas    "academicDegree": "Doutorado",

    "yearsExperience": 8,

### Backend    "researchAreas": ["Genética Médica"],

- **Node.js 18** - Runtime JavaScript    "orcidId": "0000-0002-1234-5678"

- **Express 4** - Framework web minimalista  }'

- **Prisma 5** - ORM moderno e type-safe```

- **PostgreSQL 15** - Banco de dados relacional

- **TypeScript 5** - JavaScript tipado**Validação ORCID:**

- **Jest 29** - Framework de testes (83/83 testes ✅)- Formato: `XXXX-XXXX-XXXX-XXXX` ou `XXXX-XXXX-XXXX-XXXZ`

- **JWT** - Autenticação stateless- Dígito verificador calculado automaticamente

- **Docker** - Containerização- Regex: `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`



### Frontend---

- **Next.js 14** - Framework React com App Router

- **React 18** - Biblioteca UI### 📊 eHEALS - Escala de Literacia Digital em Saúde

- **TypeScript 5** - JavaScript tipado

- **Tailwind CSS 3** - Framework CSS utility-firstImplementação completa da **eHealth Literacy Scale (Norman & Skinner, 2006)** para avaliar competências digitais em saúde dos colaboradores.

- **Radix UI** - Componentes acessíveis

- **React Query** - Cache e sincronização de dados**Características:**

- **Zustand** - State management leve

- **8 perguntas** com escala Likert de 5 pontos (1 = Discordo Totalmente → 5 = Concordo Totalmente)

---- **Score total**: 8-40 pontos

- **Interpretação automática**:

## 🤝 Contribuindo  - 8-20: Literacia Baixa (Vermelho)

  - 21-32: Literacia Moderada (Laranja)

Leia [GUIA_USUARIO_COMPLETO.md](docs/user-guides/GUIA_USUARIO_COMPLETO.md) para detalhes sobre o processo de contribuição.  - 33-40: Literacia Alta (Verde)

- **Breakdown por categoria**:

---  - Conhecimento (2 perguntas)

  - Habilidade (2 perguntas)

## 📞 Suporte  - Aplicação (1 pergunta)

  - Avaliação (2 perguntas)

- **📧 Email**: [seu-email]  - Confiança (1 pergunta)

- **🐙 GitHub**: https://github.com/filipepaulista12/hpo-translator-cplp-backend

- **📖 Docs**: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)**Perguntas (Traduzidas para PT-BR):**

- **🌐 Site**: https://hpo.raras-cplp.org

1. Sei quais recursos de saúde estão disponíveis na Internet

---2. Sei onde encontrar recursos úteis de saúde na Internet

3. Sei como encontrar recursos úteis de saúde na Internet

## 📜 Licença4. Sei como usar a Internet para responder às minhas questões de saúde

5. Sei como usar as informações de saúde que encontro na Internet para me ajudar

[MIT License](LICENSE) - sinta-se livre para usar este projeto!6. Tenho as habilidades necessárias para avaliar os recursos de saúde que encontro na Internet

7. Consigo distinguir entre recursos de saúde de alta e baixa qualidade na Internet

---8. Sinto-me confiante ao usar informações da Internet para tomar decisões de saúde



## 🙏 Agradecimentos**Integração no frontend:**



- [Human Phenotype Ontology (HPO)](https://hpo.jax.org/) - Ontologia de fenótipos```tsx

- [ORCID](https://orcid.org/) - Autenticação acadêmicaimport { EhealsModal } from './components/EhealsModal';

- Comunidade CPLP de tradutores e revisores

// No ProfilePage:

---const [showEhealsModal, setShowEhealsModal] = useState(false);



<div align="center">const handleSaveEheals = async (score: number, answers: number[]) => {

  await fetch('/api/users/profile/professional', {

**Feito com ❤️ para a comunidade CPLP**    method: 'PUT',

    body: JSON.stringify({ ehealsScore: score, ehealsAnswers: answers })

[🌐 Website](https://hpo.raras-cplp.org) · [📚 Docs](PROJECT_DOCUMENTATION.md) · [🐛 Issues](https://github.com/filipepaulista12/hpo-translator-cplp-backend/issues)  });

};

</div>

<EhealsModal
  isOpen={showEhealsModal}
  onClose={() => setShowEhealsModal(false)}
  onSave={handleSaveEheals}
  initialAnswers={professionalProfile.ehealsAnswers}
/>
```

**Componente:** `plataforma-raras-cpl/src/components/EhealsModal.tsx` (470 linhas)

---

### 📥 Exportação Babelon TSV com ORCID

Sistema de exportação oficial no formato **Babelon TSV** com ORCID iDs dos tradutores para submissão ao repositório HPO.

**Formato do arquivo:** 14 colunas TSV

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `term_id` | HPO ID | `HP:0001166` |
| `language` | Código ISO 639-1 | `pt` |
| `label` | Tradução do termo | `Aracnodactilia` |
| `definition` | Definição traduzida | `Dedos desproporcionalmente longos` |
| `synonyms` | Sinônimos (pipe-separated) | `Dedos longos\|Dedos aracnóides` |
| `contributor` | ORCID da equipe | `RARAS-CPLP` |
| `creator_id` | ORCID do tradutor | `0000-0002-1234-5678` |
| `contributor_name` | Nome do tradutor | `João Silva` |
| `contributor_id` | ORCID do tradutor (duplicado) | `0000-0002-1234-5678` |
| `reviewer` | Nome dos revisores | `Maria Santos, Pedro Costa` |
| `reviewer_name` | Cópia do campo reviewer | `Maria Santos, Pedro Costa` |
| `translator_expertise` | Cálculo automático | `8.5` |
| `source` | Fonte da tradução | `RARAS-CPLP Platform` |
| `comment` | Notas | `Reviewed by 5 validators` |

**Cálculo de Expertise:**

```typescript
expertise = (
  yearsExperience * 1.0 +
  (academicDegree === 'Doutorado' || academicDegree === 'Pós-Doutorado' ? 3 : 0) +
  (ehealsScore > 32 ? 2 : 0) +
  (userLevel >= 5 ? 1.5 : 0) +
  (validationCount > 100 ? 1 : 0)
);
```

**API - Exportar Babelon:**

```bash
# Exportar todos os termos aprovados
curl -X GET "http://localhost:3001/api/export/release/babelon-with-orcid" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  --output babelon-hpo-pt.tsv

# Exportar com filtro de data
curl -X GET "http://localhost:3001/api/export/release/babelon-with-orcid?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  --output babelon-hpo-pt-2025.tsv
```

**Parâmetros de Query:**

- `startDate` (opcional): Data início (formato: YYYY-MM-DD)
- `endDate` (opcional): Data fim (formato: YYYY-MM-DD)
- Filtros aplicados ao campo `syncedToHpoAt` (data de sincronização)

**Requisitos:**

- Apenas traduções com status: `approved_for_sync`
- Usuário deve ter ORCID iD registrado no profileJson
- Permissões: `ADMIN` ou `COMMITTEE_MEMBER`

**Interface Admin Dashboard:**

- Seção "Exportar para HPO" com inputs de date range
- Botão "📥 Exportar Babelon TSV"
- Download automático com nome: `babelon-hpo-pt-{YYYY-MM-DD}.tsv`
- Toast de sucesso/erro

---

### Database Schema

**17 tabelas principais:**
- `users` - Usuários e autenticação
- `hpo_terms` - Termos HPO (~18.000)
- `translations` - Traduções submetidas
- `validations` - Revisões por pares
- `conflict_reviews` - Resolução de conflitos
- `notifications` - Centro de notificações
- `user_badges` - Sistema de gamificação

---

## 🎮 Funcionalidades

### Sistema de Gamificação

**Pontos:**
- Criar tradução: 10-50 pts (baseado em dificuldade)
- Validar tradução: 5 pts
- Tradução aprovada: +15 pts bônus
- Streak diário: +5 pts/dia

**Níveis:**
1. Novato (0-100 pts)
2. Colaborador (100-500 pts)
3. Especialista (500-2000 pts)
4. Mestre (2000-5000 pts)
5. Lenda (5000+ pts)

**Badges:**
- 🎯 Primeira Tradução
- 🔥 Em Chamas (7 dias consecutivos)
- 💯 Perfeccionista (100% aprovação)
- 🏆 Top 10 (ranking)
- 👑 Mestre HPO (500+ traduções)

### Sistema de Validação

```
1. Tradutor submete → PENDING_REVIEW
2. 3+ Revisores avaliam → PENDING_VALIDATION
3. Comitê aprova → APPROVED
4. Sincronização HPO oficial
```

**Roles:**
- **TRANSLATOR:** Qualquer usuário autenticado
- **COMMITTEE_MEMBER:** Resolve conflitos
- **ADMIN:** Acesso total ao sistema

---

## 🔧 Troubleshooting

### Backend não inicia
```powershell
# Verificar se porta 3001 está livre
netstat -ano | findstr :3001

# Matar processo se necessário
Stop-Process -Id <PID> -Force

# Verificar se Docker está rodando
docker ps
```

### Frontend não carrega
```powershell
# Limpar cache
cd monorepo\frontend
rm -rf node_modules dist
npm install
npm run dev
```

### Banco de dados com erro
```powershell
cd monorepo\backend

# Resetar banco (APAGA TUDO!)
docker compose down -v
docker compose up -d postgres redis
npx prisma migrate deploy
npx tsx prisma/seed-test-users.ts
```

---

## 🎯 Deployment (Produção)

### Pré-requisitos
- Conta Vercel (frontend)
- Conta Railway ou Render (backend + PostgreSQL)
- Domínio configurado (opcional)

### Variáveis de Ambiente

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=sua-chave-super-secreta-aqui
ORCID_CLIENT_ID=seu-client-id
ORCID_CLIENT_SECRET=seu-secret
FRONTEND_URL=https://seu-dominio.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.seu-dominio.com
```

---

## 📝 Usuários de Teste

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| teste@hpo.com | senha1234 | ADMIN | Acesso total |
| comite@hpo.com | senha1234 | COMMITTEE_MEMBER | Resolve conflitos |
| tradutor1@hpo.com | senha1234 | TRANSLATOR | Traduz termos |
| tradutor2@hpo.com | senha1234 | TRANSLATOR | Traduz termos |

Para recriar usuários:
```powershell
cd monorepo\backend
npx tsx prisma/seed-test-users.ts
```

---

## 📚 Documentação

### Guias Essenciais
- **[Guia do Usuário](./GUIA_USUARIO_COMPLETO.md)** - Como usar a plataforma
- **[Guia de Desenvolvimento](./DEVELOPMENT_GUIDE.md)** - Arquitetura e APIs
- **[Arquitetura Admin](./ADMIN_DASHBOARD_ARCHITECTURE.md)** - Dashboard administrativo

### Documentação Técnica
- **API Docs**: Ver `monorepo/backend/src/routes/` (comentários no código)
- **Database Schema**: `monorepo/backend/prisma/schema.prisma`
- **Testes**: `monorepo/backend/tests/unit/`

---

## 🤝 Contribuir

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add: nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra Pull Request

---

## 📄 Licença

MIT License - Veja arquivo LICENSE

---

## � Autor

**Filipe Paulista**  
GitHub: [@filipepaulista12](https://github.com/filipepaulista12)

---

## 🎉 Status Atual

```
Backend:       ████████████████████ 100% ✅
Frontend:      ████████████████████ 100% ✅
Testes:        ████████████████████ 100% ✅
Documentação:  ████████████████████ 100% ✅
Deployment:    ██████████░░░░░░░░░░  50% 🟡
```

**Última atualização**: 16 de Janeiro de 2025 (v2.0 - Professional Profiles)  
**Status**: ✅ **Sistema completo e funcional** com perfis profissionais e exportação Babelon

---

<div align="center">

**[🚀 Quick Start](#-quick-start)** •
**[📚 Documentação](#-documentação)** •
**[🧪 Testes](#-executar-testes)** •
**[🤝 Contribuir](#-contribuir)**

</div>

---

## Documentacao

A documentacao completa esta organizada em `docs/`:

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

