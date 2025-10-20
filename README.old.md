# 🧬 HPO Translator CPLP - Plataforma Colaborativa

**Plataforma colaborativa de tradução dos termos do Human Phenotype Ontology (HPO) para português e outras línguas da CPLP**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Type.js](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescript.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

---

## 📋 Sobre o Projeto

Sistema completo de tradução colaborativa do HPO (Human Phenotype Ontology) com foco na Comunidade dos Países de Língua Portuguesa (CPLP). Permite que tradutores contribuam com termos médicos, validem traduções de outros usuários, e participem de um sistema de gamificação com rankings e badges.

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

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Git ([Download](https://git-scm.com/))

### 1. Clone o Repositório

```bash
git clone <seu-repo>
cd hpo_translation
```

### 2. Iniciar Infraestrutura

```powershell
cd monorepo\backend
docker compose up -d postgres redis
npx prisma migrate deploy
```

### 3. Iniciar Backend

```powershell
cd monorepo\backend
npx tsx watch src/server.ts
# Deve rodar em http://localhost:3001
```

### 4. Iniciar Frontend

```powershell
cd monorepo\frontend
npm run dev
# Deve rodar em http://localhost:5173
```

### 5. Login de Teste

```
Email: teste@hpo.com
Senha: senha1234
Role: ADMIN
```

---

## 📊 Status do Projeto

### ✅ Implementado (100%)
- Autenticação JWT + ORCID
- Sistema de Tradução (17.020 termos HPO)
- Validação por Pares
- Gamificação (pontos, níveis, badges)
- Admin Dashboard (Módulos 1 & 2)
- Notificações em tempo real
- Conflict Resolution (Módulo 3)
- Analytics & Sync (Módulo 4)
- Onboarding interativo
- Perfil de usuário completo
- **[NOVO v2.0]** Perfil Profissional com validação acadêmica
- **[NOVO v2.0]** eHEALS - Literacia Digital em Saúde
- **[NOVO v2.0]** Exportação Babelon TSV com ORCID iDs
- **[NOVO v2.0]** Botão de exportação no Admin Dashboard
- **[NOVO v2.0]** Landing page compactada

### ⚠️ Testes Unitários
- **Status**: 60/60 passando ✅
- **Cobertura**: 100% E2E scenarios via unit tests
- **Framework**: Jest + TestDataFactory

---

## 🧪 Executar Testes

### Testes Unitários (Jest)
```powershell
cd monorepo\backend
npx jest tests/unit/ --runInBand --passWithNoTests
```

### Ver Relatório de Cobertura
```powershell
npx jest --coverage
```

---

## 🏗️ Arquitetura

### Monorepo Structure

```
hpo_translation/
├── monorepo/
│   ├── backend/               # Node.js + Express + TypeScript + Prisma
│   │   ├── src/
│   │   │   ├── routes/        # 11 arquivos de rotas
│   │   │   ├── middleware/    # Auth, permissions, errors
│   │   │   └── server.ts      # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema (17 modelos)
│   │   └── tests/unit/        # 60 testes unitários
│   │
│   ├── frontend/              # React + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── ProductionHPOApp.tsx  # App principal (3.700 linhas)
│   │   │   └── components/    # UI components (Shadcn)
│   │   ├── e2e/               # Testes E2E (Playwright)
│   │   └── package.json
│   │
│   └── docs/                  # Documentação técnica
│
├── hpo-translations/          # Repositório oficial HPO
│   └── babelon/               # Arquivos de tradução oficial
│
└── docs/                      # Guias do usuário
```

### Tech Stack

**Backend:**
- Node.js 18+
- Express 4.21
- TypeScript 5.7
- Prisma ORM 5.20
- PostgreSQL 14+
- Redis (cache)

**Frontend:**
- React 18.3
- TypeScript 5.7
- Vite 6.3
- Tailwind CSS
- Shadcn/UI

**Testing:**
- Jest (Unit Tests)
- Playwright (E2E)
- TestDataFactory (Database isolation)

---

## � Desenvolvimento

### API Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Status do servidor |
| `POST` | `/api/auth/login` | Login JWT |
| `GET` | `/api/terms` | Listar termos HPO |
| `POST` | `/api/translations` | Criar tradução |
| `GET` | `/api/admin/dashboard` | Dashboard admin |
| `GET` | `/api/analytics` | Estatísticas |
| `GET` | `/api/users/profile/complete` | **NOVO** - Perfil completo (user + profileJson) |
| `PUT` | `/api/users/profile/professional` | **NOVO** - Atualizar perfil profissional |
| `GET` | `/api/export/release/babelon-with-orcid` | **NOVO** - Exportar Babelon TSV com ORCID |

---

## 🆕 Novas Funcionalidades (v2.0)

### 👨‍🔬 Perfil Profissional

Sistema completo de perfil profissional para colaboradores com validação acadêmica e integração ORCID.

**Campos disponíveis:**

```typescript
{
  institution: string;                // Instituição acadêmica
  department: string;                 // Departamento/Centro
  academicDegree: enum;               // Graduação | Mestrado | Doutorado | Pós-Doutorado
  yearsExperience: number;            // Anos de experiência na área
  researchAreas: string[];            // [Bioinformática, Genética, etc]
  orcidId: string;                    // ORCID iD (formato validado)
  linkedInUrl: string;                // LinkedIn profile (placeholder)
  ehealsScore: number;                // Score eHEALS (8-40)
  ehealsAnswers: number[];            // Respostas da escala Likert
}
```

**Enums definidos:**

```typescript
ACADEMIC_DEGREES = ['Graduação', 'Mestrado', 'Doutorado', 'Pós-Doutorado', 'Professor'];

RESEARCH_AREAS = [
  'Genética Médica', 'Bioinformática', 'Doenças Raras',
  'Medicina Translacional', 'Genômica', 'Pediatria',
  'Neurologia', 'Cardiologia', 'Farmacologia'
];
```

**API - Buscar perfil completo:**

```bash
curl -X GET "http://localhost:3001/api/users/profile/complete" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "Dr. João Silva",
    "email": "joao@example.com",
    "level": 5,
    "points": 1250
  },
  "profileJson": {
    "institution": "Universidade de São Paulo",
    "department": "Departamento de Genética",
    "academicDegree": "Doutorado",
    "yearsExperience": 8,
    "researchAreas": ["Genética Médica", "Doenças Raras"],
    "orcidId": "0000-0002-1234-5678",
    "linkedInUrl": "",
    "ehealsScore": 35,
    "ehealsAnswers": [5, 4, 5, 4, 5, 4, 3, 5]
  }
}
```

**API - Atualizar perfil profissional:**

```bash
curl -X PUT "http://localhost:3001/api/users/profile/professional" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "institution": "USP",
    "department": "Genética",
    "academicDegree": "Doutorado",
    "yearsExperience": 8,
    "researchAreas": ["Genética Médica"],
    "orcidId": "0000-0002-1234-5678"
  }'
```

**Validação ORCID:**
- Formato: `XXXX-XXXX-XXXX-XXXX` ou `XXXX-XXXX-XXXX-XXXZ`
- Dígito verificador calculado automaticamente
- Regex: `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`

---

### 📊 eHEALS - Escala de Literacia Digital em Saúde

Implementação completa da **eHealth Literacy Scale (Norman & Skinner, 2006)** para avaliar competências digitais em saúde dos colaboradores.

**Características:**

- **8 perguntas** com escala Likert de 5 pontos (1 = Discordo Totalmente → 5 = Concordo Totalmente)
- **Score total**: 8-40 pontos
- **Interpretação automática**:
  - 8-20: Literacia Baixa (Vermelho)
  - 21-32: Literacia Moderada (Laranja)
  - 33-40: Literacia Alta (Verde)
- **Breakdown por categoria**:
  - Conhecimento (2 perguntas)
  - Habilidade (2 perguntas)
  - Aplicação (1 pergunta)
  - Avaliação (2 perguntas)
  - Confiança (1 pergunta)

**Perguntas (Traduzidas para PT-BR):**

1. Sei quais recursos de saúde estão disponíveis na Internet
2. Sei onde encontrar recursos úteis de saúde na Internet
3. Sei como encontrar recursos úteis de saúde na Internet
4. Sei como usar a Internet para responder às minhas questões de saúde
5. Sei como usar as informações de saúde que encontro na Internet para me ajudar
6. Tenho as habilidades necessárias para avaliar os recursos de saúde que encontro na Internet
7. Consigo distinguir entre recursos de saúde de alta e baixa qualidade na Internet
8. Sinto-me confiante ao usar informações da Internet para tomar decisões de saúde

**Integração no frontend:**

```tsx
import { EhealsModal } from './components/EhealsModal';

// No ProfilePage:
const [showEhealsModal, setShowEhealsModal] = useState(false);

const handleSaveEheals = async (score: number, answers: number[]) => {
  await fetch('/api/users/profile/professional', {
    method: 'PUT',
    body: JSON.stringify({ ehealsScore: score, ehealsAnswers: answers })
  });
};

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

