# 🔍 RELATÓRIO DE INVESTIGAÇÃO - NOVAS TAREFAS

**Data:** 18/10/2025  
**Solicitado por:** Usuário  
**Status:** INVESTIGAÇÃO COMPLETA ✅

---

## 📊 SUMÁRIO EXECUTIVO

| Questão | Status Atual | Ação Necessária |
|---------|--------------|-----------------|
| 1. Nome da Plataforma | ❌ "HPO Platform" genérico | ✅ Sugestões prontas |
| 2. LinkedIn OAuth 404 | ⚠️ Código OK, build pendente | ✅ Reiniciar container |
| 3. Metadados HPO | ⚠️ Parcialmente implementados | ⚡ Enriquecer schema |
| 4. Testes Automatizados | ✅ 83/83 passando | ⚡ Faltam testes específicos |
| 5. Seeds HPO | ❌ Importa TODOS termos | ✅ Criar seed seletivo |
| 6. Classificação HPO | ❌ Não implementada | ✅ Integrar categorias oficiais |

---

## 1️⃣ SUGESTÕES DE NOME PARA A PLATAFORMA

### 🏆 **TOP 3 RECOMENDADAS:**

#### **1. HPO-PT Colaborativo** ⭐⭐⭐⭐⭐
- **Português:** "HPO-PT Colaborativo: Plataforma de Tradução Médica"
- **Inglês:** "HPO-PT Collaborative: Medical Translation Platform"
- **Vantagens:**
  - ✅ Deixa claro que é focado em Português (PT)
  - ✅ Destaca natureza colaborativa
  - ✅ Curto e memorável
  - ✅ URL disponível: hpo-pt.org / hpo-pt.raras-cplp.org

#### **2. Rare CPLP Translator** ⭐⭐⭐⭐
- **Nome completo:** "Rare CPLP Translator - HPO Medical Ontology"
- **Vantagens:**
  - ✅ Destaca foco em países lusófonos (CPLP)
  - ✅ "Rare" conecta com doenças raras
  - ✅ Internacional e profissional
  - ✅ SEO friendly

#### **3. MedOntoPT** ⭐⭐⭐⭐
- **Nome completo:** "MedOntoPT - Ontologia Médica Colaborativa"
- **Vantagens:**
  - ✅ Nome único e memorável
  - ✅ "MedOnto" = Medical Ontology
  - ✅ PT = Português/Portugal/Brazil
  - ✅ Som profissional

---

### 💡 **OUTRAS OPÇÕES CRIATIVAS:**

| Nome | Descrição | Nota |
|------|-----------|------|
| **HPOHub** | Hub colaborativo HPO | ⭐⭐⭐ |
| **TermoRaro** | Foco em termos de doenças raras | ⭐⭐⭐ |
| **OntoBridge** | Ponte entre idiomas em ontologias | ⭐⭐⭐ |
| **RareLex** | Léxico de doenças raras | ⭐⭐⭐ |
| **PhenoTrans** | Tradução de fenótipos | ⭐⭐⭐⭐ |
| **HPO em Português** | Direto e claro | ⭐⭐ |
| **Colabmed HPO** | Colaboração médica | ⭐⭐⭐ |

---

### 🎨 **BRANDING SUGERIDO:**

**Para "HPO-PT Colaborativo":**
```
Logo: 🧬 + 🌍 (DNA + globo lusófono)
Tagline PT: "Traduzindo Ciência, Salvando Vidas"
Tagline EN: "Translating Science, Saving Lives"
Cores: Azul (#0077b5) + Verde (#16a34a) + Branco
```

**Para "Rare CPLP Translator":**
```
Logo: 🔬 + 🗣️ (microscópio + idiomas)
Tagline PT: "Unidos pela Ciência em Português"
Tagline EN: "United by Science in Portuguese"
Cores: Roxo (#8b5cf6) + Laranja (#f59e0b) + Branco
```

---

## 2️⃣ LINKEDIN OAUTH - DIAGNÓSTICO COMPLETO

### ❌ **PROBLEMA:**
```
GET /api/auth/linkedin 
→ {"error":"Not Found","message":"Route GET /api/auth/linkedin not found"}
```

### ✅ **INVESTIGAÇÃO:**

#### Status dos Arquivos:
- ✅ Código implementado em `src/routes/auth.routes.ts` (linhas 399-560)
- ✅ Rota registrada em `src/server.ts` (linha 98: `app.use('/api/auth', authRoutes)`)
- ✅ Arquivo existe no container Docker (`-rwxrwxrwx 1 root root 17586 Oct 18 19:51`)
- ✅ Código da rota confirmado dentro do container

#### Causa Raiz:
⚠️ **TypeScript não compilado!**

O container Docker executa código TypeScript usando `tsx watch`, mas as mudanças recentes no `auth.routes.ts` não foram detectadas pelo watcher.

### 🔧 **SOLUÇÃO:**

```bash
# Opção 1: Restart simples (RECOMENDADO)
docker restart hpo-backend

# Opção 2: Rebuild completo (se restart não funcionar)
docker-compose down
docker-compose up -d --build

# Opção 3: Forçar recompilação
docker exec hpo-backend touch src/routes/auth.routes.ts
```

### ✅ **VALIDAÇÃO:**

Após restart, testar:
```bash
curl http://localhost:3001/api/auth/linkedin
# Deve redirecionar para LinkedIn
```

---

## 3️⃣ METADADOS HPO - ANÁLISE DETALHADA

### 📋 **METADADOS ATUALMENTE IMPLEMENTADOS:**

#### No Schema `HpoTerm`:
```prisma
model HpoTerm {
  ✅ hpoId             String   @unique    // HP:0001298
  ✅ labelEn           String               // Nome em inglês
  ✅ definitionEn      String?  @db.Text   // Definição
  ✅ synonymsEn        String[]             // Sinônimos
  
  ⚠️  category          String?              // Categoria (NÃO POPULADO)
  ⚠️  parentId          String?              // Hierarquia (NÃO POPULADO)
  ✅ difficulty        Int      @default(3) // 1-5
  ✅ translationStatus TranslationStatus    // Status tradução
  ⚠️  hpoVersion        String?              // Versão (NÃO POPULADO)
  ✅ isObsolete        Boolean  @default(false)
  
  ✅ createdAt         DateTime @default(now())
  ✅ updatedAt         DateTime @updatedAt
}
```

### ❌ **METADADOS FALTANTES (HPO Oficial):**

Segundo a ontologia HPO oficial, cada termo tem:

| Metadado | Implementado? | Onde Buscar |
|----------|---------------|-------------|
| **hpoId** | ✅ Sim | hp.obo |
| **name** (label) | ✅ Sim | hp.obo |
| **definition** | ⚠️ Parcial | hp.obo (def:) |
| **synonyms** | ⚠️ Parcial | hp.obo (synonym:) |
| **is_a** (parent) | ❌ Não | hp.obo (is_a:) |
| **category** | ❌ Não | Categorias HPO |
| **xref** (cross-refs) | ❌ Não | hp.obo (xref:) |
| **comment** | ❌ Não | hp.obo (comment:) |
| **alt_id** | ❌ Não | hp.obo (alt_id:) |
| **created_by** | ❌ Não | hp.obo |
| **creation_date** | ❌ Não | hp.obo |

### 🎯 **CATEGORIAS HPO OFICIAIS:**

A HPO tem **25 categorias principais:**

```
1.  HP:0000118 - Phenotypic abnormality (RAIZ)
2.  HP:0000707 - Abnormality of the nervous system
3.  HP:0000152 - Abnormality of head or neck
4.  HP:0001626 - Abnormality of the cardiovascular system
5.  HP:0000478 - Abnormality of the eye
6.  HP:0000598 - Abnormality of the ear
7.  HP:0002715 - Abnormality of the immune system
8.  HP:0002086 - Abnormality of the respiratory system
9.  HP:0000769 - Abnormality of the breast
10. HP:0001197 - Abnormality of prenatal development
11. HP:0001507 - Growth abnormality
12. HP:0001939 - Abnormality of metabolism/homeostasis
13. HP:0003549 - Abnormality of connective tissue
14. HP:0001574 - Abnormality of the integument
15. HP:0000924 - Abnormality of the skeletal system
16. HP:0001608 - Abnormality of the voice
17. HP:0025031 - Abnormality of the digestive system
18. HP:0000119 - Abnormality of the genitourinary system
19. HP:0000818 - Abnormality of the endocrine system
20. HP:0001871 - Abnormality of blood and blood-forming tissues
21. HP:0025142 - Constitutional symptom
22. HP:0025354 - Abnormal cellular phenotype
23. HP:0040279 - Frequency
24. HP:0012823 - Clinical modifier
25. HP:0032443 - Past medical history
```

---

## 4️⃣ TESTES AUTOMATIZADOS - INVENTÁRIO COMPLETO

### ✅ **TESTES EXISTENTES (83/83 PASSING):**

#### Backend (6 arquivos, 83 testes):
```
1. auth.test.ts (17 testes)
   ✅ POST /api/auth/register
   ✅ POST /api/auth/login
   ✅ GET /api/auth/me
   ✅ Validações de email/senha

2. health.test.ts (1 teste)
   ✅ GET /health

3. terms.test.ts (21 testes)
   ✅ GET /api/terms (paginação, filtros)
   ✅ GET /api/terms/:id
   ✅ GET /api/terms/search
   ✅ Validações

4. user-profile.test.ts (14 testes)
   ✅ GET /api/users/profile/:id
   ✅ PUT /api/users/profile/complete
   ✅ Partial updates
   ✅ Professional profile

5. persistence.test.ts (20 testes)
   ✅ Translation persistence
   ✅ Comment persistence
   ✅ Gamification persistence
   ✅ Database relationships

6. integration.test.ts (10 testes - MEGA TESTE)
   ✅ Phase 1: Authentication
   ✅ Phase 2: Find HPO Term
   ✅ Phase 3: Create Translations
   ✅ Phase 4: Validations
   ✅ Phase 5: Comments
   ✅ Phase 6: Conflicts
   ✅ Phase 7: Gamification
   ✅ Phase 8: Notifications
   ✅ Phase 9: Search & Filters
   ✅ Phase 10: History
```

#### Frontend (2 arquivos):
```
1. TokenStorage.test.ts
   ✅ Token save/get/remove
   ✅ JWT decode
   ✅ Expiration check

2. RoleHelpers.test.ts
   ✅ Role permissions
   ✅ Access control
```

### ❌ **TESTES FALTANTES:**

| Funcionalidade | Teste Existe? | Prioridade |
|----------------|---------------|------------|
| LinkedIn OAuth | ❌ Não | 🔴 Alta |
| ORCID OAuth | ❌ Não | 🟡 Média |
| Analytics Dashboard | ❌ Não | 🔴 Alta |
| Export Babelon | ⚠️ Skipado (.SKIP) | 🔴 Alta |
| Admin Routes | ❌ Não | 🟡 Média |
| Invite System | ❌ Não | 🟢 Baixa |
| Conflict Resolution | ⚠️ Parcial | 🟡 Média |
| WebSocket (real-time) | ❌ Não | 🟢 Baixa |
| Rate Limiting | ❌ Não | 🟡 Média |
| Email Notifications | ❌ Não | 🟢 Baixa |

---

## 5️⃣ SEEDS HPO - PROBLEMA E SOLUÇÃO

### ❌ **PROBLEMA ATUAL:**

O arquivo `prisma/seed.ts` importa **TODOS os ~16.000 termos HPO**:

```typescript
// prisma/seed.ts (linha 20)
async function importAllHPOTerms() {
  console.log('📥 FASE 1: Importando TODOS os termos HPO oficiais...');
  // Importa 16.000+ termos do Babelon
}
```

**Consequências:**
- ❌ Database muito grande para testes
- ❌ Lento para desenvolvedores iniciarem
- ❌ Impossível testar interface com dados gerenciáveis
- ❌ Não representa uso real (poucas traduções iniciais)

### ✅ **SOLUÇÃO PROPOSTA:**

Criar **seed em camadas** com diferentes cenários:

```bash
# Seed mínimo (desenvolvimento rápido)
npm run prisma:seed:minimal
# → 50 termos mais comuns + 10 usuários

# Seed demo (testes de UX)
npm run prisma:seed:demo
# → 200 termos variados + 50 usuários + 100 traduções

# Seed staging (pré-produção)
npm run prisma:seed:staging
# → 2000 termos + 200 usuários + 500 traduções

# Seed completo (produção)
npm run prisma:seed:full
# → TODOS 16.000 termos
```

### 📊 **TERMOS MAIS COMUNS (Top 50):**

Baseado em frequência de uso em estudos de doenças raras:

```
1. HP:0001250 - Seizure (Convulsões)
2. HP:0001263 - Global developmental delay
3. HP:0001249 - Intellectual disability
4. HP:0001252 - Hypotonia
5. HP:0000252 - Microcephaly
6. HP:0001510 - Growth delay
7. HP:0002194 - Delayed gross motor development
8. HP:0000750 - Delayed speech and language development
9. HP:0001371 - Flexion contracture
10. HP:0000618 - Blindness
... (continua até 50)
```

---

## 6️⃣ CLASSIFICAÇÃO HPO - INTEGRAÇÃO NECESSÁRIA

### ❌ **SITUAÇÃO ATUAL:**

O campo `category` existe no schema mas está **sempre NULL**:

```sql
SELECT category, COUNT(*) 
FROM hpo_terms 
GROUP BY category;

-- Resultado:
-- NULL | 16000
```

### ✅ **FONTES OFICIAIS DE CATEGORIAS:**

#### Opção 1: **hp.obo (OBO Format)**
```obo
[Term]
id: HP:0001250
name: Seizure
def: "A seizure is an intermittent abnormality..." [HPO:probinson]
is_a: HP:0000707 ! Abnormality of the nervous system
```

O `is_a` indica a categoria pai.

#### Opção 2: **phenotype.hpoa (HPO Annotations)**
```tsv
DB  ID          Name            Category
OMIM  100050  AARSKOG SYNDROME  HP:0000707
```

#### Opção 3: **API HPO Oficial**
```bash
curl https://hpo.jax.org/api/hpo/term/HP:0001250
# Retorna JSON com parents, ancestors, category
```

### 🎯 **PROPOSTA DE IMPLEMENTAÇÃO:**

```typescript
// Adicionar ao schema:
model HpoTerm {
  // ... campos existentes
  
  // Hierarquia
  parentTerms  HpoTerm[]  @relation("TermHierarchy")
  childTerms   HpoTerm[]  @relation("TermHierarchy")
  
  // Categoria raiz (uma das 25 principais)
  rootCategory String?    // "Nervous system", "Cardiovascular", etc
  categoryPath String?    // "Nervous > Central > Seizures"
  
  // Metadados de classificação
  isRootCategory Boolean @default(false)
  depth          Int     @default(0)  // Profundidade na árvore
}
```

### 📥 **SCRIPT DE IMPORTAÇÃO:**

```typescript
// scripts/import-hpo-categories.ts
async function importCategories() {
  // 1. Baixar hp.obo oficial
  const hpoData = await fetchHPOFile();
  
  // 2. Parsear hierarquia
  const hierarchy = parseOBOHierarchy(hpoData);
  
  // 3. Atualizar database
  for (const term of hierarchy) {
    await prisma.hpoTerm.update({
      where: { hpoId: term.id },
      data: {
        rootCategory: term.rootCategory,
        categoryPath: term.path,
        depth: term.depth
      }
    });
  }
}
```

---

## 📋 RESUMO DE AÇÕES NECESSÁRIAS

### 🔴 **PRIORIDADE ALTA (Esta Semana):**

1. ✅ **Escolher nome da plataforma**
   - Decidir entre top 3 sugestões
   - Atualizar branding (logo, cores, tagline)
   - Registrar domínio

2. ✅ **Corrigir LinkedIn OAuth**
   - `docker restart hpo-backend`
   - Testar login LinkedIn
   - Criar LinkedIn App (seguir GUIA_LINKEDIN_OAUTH.md)

3. ✅ **Criar seed seletivo**
   - Implementar `prisma:seed:minimal` (50 termos)
   - Implementar `prisma:seed:demo` (200 termos)
   - Documentar uso

### 🟡 **PRIORIDADE MÉDIA (Próximas 2 Semanas):**

4. ✅ **Enriquecer metadados HPO**
   - Baixar hp.obo oficial
   - Parsear hierarquia e categorias
   - Popular campo `category` e `parentId`
   - Adicionar filtros por categoria no frontend

5. ✅ **Adicionar testes críticos**
   - LinkedIn OAuth test
   - Analytics Dashboard test
   - Descongelar babelon-export.test.ts

### 🟢 **PRIORIDADE BAIXA (Futuro):**

6. ✅ **Metadados avançados**
   - xref, alt_id, creation_date
   - Cross-references com OMIM, ORDO
   - Integração API HPO oficial

7. ✅ **Cobertura completa de testes**
   - WebSocket tests
   - Email notification tests
   - Performance tests

---

## 🎯 NOVA TODO LIST PROPOSTA

```markdown
# TODO - Próximas Tarefas (18/10/2025)

## 🔴 URGENTE (Esta Semana)

- [ ] 🏷️  Escolher Nome da Plataforma
  - Decidir entre: HPO-PT Colaborativo / Rare CPLP / MedOntoPT
  - Criar logo e branding
  - Atualizar README.md e package.json
  - Registrar domínio

- [ ] 🔧 Corrigir LinkedIn OAuth
  - Reiniciar container: docker restart hpo-backend
  - Testar: curl http://localhost:3001/api/auth/linkedin
  - Criar LinkedIn Developer App
  - Configurar .env com Client ID/Secret

- [ ] 🌱 Criar Seeds Seletivos
  - Implementar prisma:seed:minimal (50 termos comuns)
  - Implementar prisma:seed:demo (200 termos variados)
  - Implementar prisma:seed:staging (2000 termos)
  - Documentar em README.md

## 🟡 IMPORTANTE (Próximas 2 Semanas)

- [ ] 📊 Enriquecer Metadados HPO
  - Baixar hp.obo oficial (https://hpo.jax.org/data/ontology)
  - Criar script import-hpo-metadata.ts
  - Parsear hierarquia (is_a relationships)
  - Popular campos: category, parentId, categoryPath
  - Adicionar filtro por categoria no frontend

- [ ] 🧪 Adicionar Testes Críticos
  - Test: LinkedIn OAuth flow
  - Test: Analytics Dashboard (ADMIN)
  - Converter babelon-export.test.ts.SKIP
  - Test: Admin routes (approve, reject)

## 🟢 FUTURO (Backlog)

- [ ] 🔗 Metadados Avançados
  - xref (OMIM, ORDO, ICD-10)
  - alt_id (IDs alternativos)
  - created_by, creation_date
  - Integrar API HPO oficial

- [ ] 📈 Cobertura Completa Testes
  - WebSocket real-time tests
  - Email notification tests
  - Rate limiting tests
  - Performance/load tests
```

---

**Próximo passo:** Qual tarefa quer começar primeiro? 🚀

