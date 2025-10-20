# Respostas às Questões sobre HPO e Perfil de Usuários

**Data**: 18 de Outubro de 2025  
**Contexto**: Análise do projeto HPO oficial e proposta de perfil de usuários

---

## ✅ 1. CRÉDITO ORCID NO HPO OFICIAL - **É POSSÍVEL!**

### Confirmação:
**SIM, é 100% possível incluir ORCID dos contribuidores nas submissões ao HPO oficial.**

### Evidências do Repositório HPO:

1. **Formato Babelon TSV** (formato oficial do HPO para traduções):
   - Possui campo `translator` que aceita ORCID
   - Exemplo de linha do README oficial:
   ```tsv
   | HP:0001945 | rdfs:label | Fever | Fieber | https://orcid.org/0000-0002-1373-XXXX | 2021-05-21 | 0.95 | exact | HumanCurated |
   ```

2. **Pipeline de Tradução do HPO**:
   - Usa o formato Babelon TSV: `hp-pt.babelon.tsv`
   - Makefile oficial: `$(TRANSLATIONSDIR)/hp-pt-preprocessed.babelon.tsv`
   - Campo `translator` é parte obrigatória do schema

3. **Repositório de Traduções**:
   - Localização: `https://github.com/obophenotype/hpo-translations`
   - Formato esperado: Babelon TSV com coluna `translator`
   - Exemplo: `https://github.com/obophenotype/hpo-translations/blob/main/babelon/hp-pt.babelon.tsv`

### Schema Babelon (campos relevantes):

```
subject_id (HP ID)
predicate_id (rdfs:label, IAO:0000115, etc.)
source_value (texto em inglês)
translation_value (texto traduzido)
translator (ORCID ou URL)
translator_expertise (ALGORITHM, DOMAIN_EXPERT, etc.)
translation_date
translation_status (CANDIDATE, OFFICIAL, etc.)
translation_confidence (0.0-1.0)
```

### ✅ **Conclusão**: 
Podemos e **DEVEMOS** implementar a exportação com ORCID. O HPO oficial já espera esse formato.

---

## 📊 2. PERFIL DE USUÁRIOS - PROPOSTA COMPLETA

### Contexto:
Não obrigatório, mas **autodeclaração** para melhor análise e qualidade das traduções.

### 🎯 Campos Propostos (Todos Opcionais):

#### A) **Informações Profissionais**
```typescript
interface UserProfile {
  // Formação
  academicDegree?: 'high_school' | 'bachelor' | 'master' | 'phd' | 'postdoc' | 'other';
  fieldOfStudy?: string; // Ex: "Medicina", "Biologia", "Enfermagem"
  
  // Experiência
  professionalRole?: 'researcher' | 'clinician' | 'student' | 'professor' | 'translator' | 'other';
  yearsOfExperience?: number;
  institution?: string; // Nome da instituição
  
  // Especialização
  medicalSpecialty?: string; // Ex: "Geneticista", "Pediatra", "Cardiologista"
  researchArea?: string; // Ex: "Doenças Raras", "Oncologia Pediátrica"
}
```

#### B) **Nível de Inglês (Autodeclarado)**

Escala simplificada de 5 níveis:

```typescript
enum EnglishProficiency {
  BASIC = 'basic',           // Básico - compreende textos simples
  INTERMEDIATE = 'intermediate', // Intermediário - lê artigos com dicionário
  ADVANCED = 'advanced',     // Avançado - lê artigos científicos confortavelmente
  FLUENT = 'fluent',         // Fluente - escreve e revisa textos técnicos
  NATIVE = 'native'          // Nativo ou equivalente
}
```

**Escala visual no formulário**:
```
🔴 Básico → 🟠 Intermediário → 🟡 Avançado → 🟢 Fluente → ⭐ Nativo
```

#### C) **eHEALS (e-Health Literacy Scale)**

**O que é**: Escala validada de **8 perguntas** que mede literacia digital em saúde.

**Por que usar?**:
- ✅ Validado cientificamente (Norman & Skinner, 2006)
- ✅ Traduzido e validado para português brasileiro
- ✅ Rápido (2-3 minutos)
- ✅ Preditor de qualidade de contribuições online

**Implementação sugerida**:

```typescript
interface eHEALSQuestions {
  // Escala Likert 1-5 (Discordo Totalmente → Concordo Totalmente)
  q1_useful_health_resources: number; // "Sei quais recursos de saúde estão disponíveis na Internet"
  q2_know_where_to_find: number;      // "Sei onde encontrar recursos úteis de saúde na Internet"
  q3_how_to_find: number;             // "Sei como encontrar recursos úteis de saúde na Internet"
  q4_how_to_use: number;              // "Sei como usar a Internet para responder minhas questões de saúde"
  q5_how_to_use_info: number;         // "Sei como usar informações de saúde que encontro na Internet"
  q6_evaluate_resources: number;      // "Tenho habilidades para avaliar recursos de saúde na Internet"
  q7_distinguish_quality: number;     // "Consigo distinguir recursos de alta e baixa qualidade na Internet"
  q8_confident_decisions: number;     // "Me sinto confiante em usar informações da Internet para decisões"
}

// Score total: soma das 8 respostas (8-40)
// Interpretação:
// - 8-20: Literacia Baixa
// - 21-32: Literacia Moderada
// - 33-40: Literacia Alta
```

**Fonte**: Norman, C. D., & Skinner, H. A. (2006). eHEALS: The eHealth Literacy Scale. *Journal of Medical Internet Research*, 8(4), e27.

---

## 🎨 3. INTERFACE NO PERFIL DO USUÁRIO

### Seção Expandível "Perfil Profissional (Opcional)"

```tsx
<div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
  <h3>👤 Perfil Profissional (Opcional)</h3>
  <p style={{ color: '#64748b', fontSize: '14px' }}>
    Essas informações nos ajudam a entender melhor nossos contribuidores e a qualidade das traduções.
    Todos os campos são opcionais e podem ser atualizados a qualquer momento.
  </p>
  
  {/* Formação */}
  <label>🎓 Formação Acadêmica</label>
  <select>
    <option value="">Não informado</option>
    <option value="high_school">Ensino Médio</option>
    <option value="bachelor">Graduação</option>
    <option value="master">Mestrado</option>
    <option value="phd">Doutorado</option>
    <option value="postdoc">Pós-Doutorado</option>
  </select>
  
  {/* Nível de Inglês */}
  <label>🌐 Nível de Inglês Técnico</label>
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <button>🔴 Básico</button>
    <button>🟠 Intermediário</button>
    <button>🟡 Avançado</button>
    <button>🟢 Fluente</button>
    <button>⭐ Nativo</button>
  </div>
  
  {/* eHEALS */}
  <label>📊 Questionário de Literacia Digital em Saúde (eHEALS)</label>
  <button onClick={() => setShowEhealsModal(true)}>
    Preencher Questionário (2 min)
  </button>
</div>
```

---

## 📈 4. BENEFÍCIOS DA IMPLEMENTAÇÃO

### Para a Plataforma:
1. **Validação de Qualidade**: Correlacionar expertise com precisão de traduções
2. **Gamificação Inteligente**: Badges baseados em perfil + contribuições
3. **Matching de Tarefas**: Direcionar termos complexos para especialistas
4. **Pesquisa Acadêmica**: Dados para papers sobre tradução colaborativa

### Para os Contribuidores:
1. **Reconhecimento**: Perfil público mostra expertise
2. **ORCID Integration**: Crédito acadêmico oficial
3. **Recomendações**: Sistema sugere termos da sua área
4. **Networking**: Conectar com outros profissionais da área

### Para o HPO Oficial:
1. **Metadados Ricos**: Saber quem traduziu cada termo
2. **Confiança**: `translator_expertise` baseado em perfil real
3. **Rastreabilidade**: ORCID para cada contribuição

---

## 🚀 5. PLANO DE IMPLEMENTAÇÃO

### Fase 1: Backend (1-2 dias)
```sql
ALTER TABLE users ADD COLUMN profile_json JSONB;
ALTER TABLE translations ADD COLUMN translator_orcid VARCHAR(50);

-- Índice para busca rápida
CREATE INDEX idx_users_profile ON users USING GIN (profile_json);
```

### Fase 2: Interface (2-3 dias)
- Expandir ProfilePage com campos opcionais
- Modal eHEALS (8 perguntas)
- Salvar como JSON no banco

### Fase 3: Exportação Babelon (1 dia)
```typescript
// Endpoint: /api/export/release/babelon-with-orcid
{
  subject_id: "HP:0001234",
  predicate_id: "rdfs:label",
  source_value: "Abnormal heart",
  translation_value: "Coração anormal",
  translator: user.orcidId || `internal:${user.id}`,
  translator_expertise: calculateExpertise(user.profile),
  translation_date: "2025-10-18",
  translation_status: "OFFICIAL"
}
```

---

## 📝 6. LANDING PAGE - PROPOSTA DE COMPACTAÇÃO

### Problema:
Muito espaçamento, informação dispersa.

### Solução:
1. **Reduzir padding**: 100px → 60px
2. **Compactar seções**: Combinar "O que é HPO" + "Por que PT"
3. **Espaço para vídeo**: Seção dedicada para demonstração
4. **Cards mais densos**: Menos margem, mais conteúdo

### Exemplo de Seção Compacta:
```tsx
{/* Hero - COMPACTO */}
<div style={{ padding: '60px 20px' }}> {/* antes: 100px */}
  <h1 style={{ fontSize: '42px' }}>HPO-PT CPLP 🧬</h1>
  <p style={{ fontSize: '20px', marginBottom: '30px' }}>
    Traduza termos médicos do HPO para português...
  </p>
</div>

{/* Vídeo Demo - NOVO */}
<div style={{ padding: '40px 20px', textAlign: 'center' }}>
  <h2>🎥 Como Funciona (2 minutos)</h2>
  <div style={{ maxWidth: '800px', margin: '20px auto' }}>
    <div style={{ 
      aspectRatio: '16/9', 
      backgroundColor: '#000',
      borderRadius: '12px'
    }}>
      {/* Espaço para vídeo ou GIF animado */}
      <p style={{ color: 'white', padding: '100px' }}>
        [Vídeo explicativo aqui]
      </p>
    </div>
  </div>
</div>
```

---

## ✅ 7. PRÓXIMOS PASSOS RECOMENDADOS

### Prioridade ALTA:
1. ✅ **Implementar exportação Babelon com ORCID** (já é padrão HPO!)
2. 📝 Adicionar campos de perfil ao usuário
3. 🎥 Criar vídeo curto (1-2 min) do processo

### Prioridade MÉDIA:
4. 🌐 Implementar seletor de nível de inglês
5. 📊 Integrar eHEALS no perfil
6. 🎨 Compactar landing page

### Prioridade BAIXA:
7. 📈 Dashboard de estatísticas por perfil
8. 🔬 Sistema de recomendação baseado em expertise
9. 📄 Geração automática de CV acadêmico

---

## 📚 REFERÊNCIAS

1. **HPO Official Repository**: https://github.com/obophenotype/human-phenotype-ontology
2. **HPO Translations**: https://github.com/obophenotype/hpo-translations
3. **Babelon Specification**: https://github.com/monarch-initiative/babelon
4. **eHEALS Original**: Norman & Skinner (2006) - J Med Internet Res
5. **eHEALS PT-BR**: Pesquisar validação brasileira (existe!)

---

## 💡 RESUMO EXECUTIVO

| Pergunta | Resposta | Status |
|----------|----------|--------|
| ORCID no HPO oficial? | ✅ **SIM! Campo `translator` no Babelon TSV** | Implementar |
| Landing page? | 🎨 Compactar (60px padding, vídeo demo) | Ajustar |
| Perfil de usuários? | 📊 Formação + Inglês + eHEALS (opcional) | Propor |
| eHEALS? | ✅ **Excelente! 8 perguntas, validado** | Implementar |

**Recomendação Final**: Focar primeiro na exportação Babelon com ORCID (é o mais importante e já é esperado pelo HPO). Perfil de usuários pode ser Fase 2.
