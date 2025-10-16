# 📥 Sistema de Exportação de Traduções HPO

## Visão Geral

O sistema de exportação permite baixar todas as traduções em múltiplos formatos profissionais, incluindo o formato oficial do HPO para contribuição ao repositório internacional.

## 🎯 Formatos Suportados

### 1. 📊 CSV (Comma-Separated Values)
**Uso**: Excel, Google Sheets, análise de dados

**Conteúdo**:
- HPO ID
- Termo Original (EN)
- Tradução (PT)
- Definição Original e Traduzida
- Status da tradução
- Níveis de confiança (termo e definição)
- Categoria e dificuldade
- Informações do tradutor (username, email, ORCID)
- Datas de criação e atualização
- Estatísticas de validação (total, aprovadas, rejeitadas, rating médio)

**Quando usar**: 
- Análise estatística
- Revisão em planilhas
- Geração de relatórios
- Import para outros sistemas

---

### 2. 📦 JSON (JavaScript Object Notation)
**Uso**: APIs, integração com sistemas, análise programática

**Estrutura**:
```json
{
  "exportDate": "2025-10-13T...",
  "totalTranslations": 1234,
  "translations": [
    {
      "hpoId": "HP:0001250",
      "original": {
        "label": "Seizure",
        "definition": "..."
      },
      "translation": {
        "label": "Convulsão",
        "definition": "...",
        "confidenceLabel": 5,
        "confidenceDefinition": 4
      },
      "metadata": { ... },
      "translator": { ... },
      "validations": [ ... ]
    }
  ]
}
```

**Quando usar**:
- Integração com outros sistemas
- Processamento automatizado
- Backup estruturado
- APIs REST

---

### 3. 🌐 XLIFF (XML Localization Interchange File Format)
**Uso**: Ferramentas CAT profissionais, tradução assistida

**Padrão**: XLIFF 1.2 (OASIS standard)

**Compatível com**:
- SDL Trados
- MemoQ
- Smartcat
- Crowdin
- Lokalise

**Conteúdo**:
```xml
<trans-unit id="1" resname="HP:0001250">
  <source xml:lang="en">Seizure</source>
  <target xml:lang="pt" state="final">Convulsão</target>
  <note>Definition text...</note>
  <note from="translator">username</note>
  <note from="confidence">5/5</note>
</trans-unit>
```

**Quando usar**:
- Fluxos profissionais de tradução
- Integração com ferramentas CAT
- Projetos multilíngues
- Memória de tradução

---

### 4. 🔬 Babelon TSV (Official HPO Format)
**Uso**: Contribuição ao repositório oficial do HPO

**Formato**: Tab-Separated Values (TSV)

**Colunas**:
```
source_language  translation_language  subject_id  predicate_id  source_value  translation_value  translation_status  translator  confidence_label  confidence_definition  validations_count  avg_rating
en              pt                     HP:0001250  rdfs:label    Seizure       Convulsão          OFFICIAL           orcid:...   5                 4                      3                  4.67
```

**Status Mapping**:
- `APPROVED` → `OFFICIAL`
- `PENDING_REVIEW` → `CANDIDATE`
- `NEEDS_REVISION` → `CANDIDATE`

**Quando usar**:
- 🎯 **PRINCIPAL USO**: Contribuir traduções revisadas ao HPO oficial
- Pull requests para https://github.com/obophenotype/hpo-translations
- Submissão formal de traduções PT-BR
- Colaboração com consórcio internacional

**Como contribuir ao HPO**:
1. Exporte no formato Babelon TSV
2. Selecione "Apenas traduções aprovadas"
3. Faça fork do repositório hpo-translations
4. Substitua/atualize `babelon/hp-pt.babelon.tsv`
5. Crie pull request com descrição das traduções
6. Aguarde revisão do time HPO

---

### 5. ⭐ Five Stars TSV (Confidence & Quality System)
**Uso**: Sistema de classificação de confiança e qualidade

**Colunas**:
```
hpo_id  term_en  term_pt  confidence_label  confidence_definition  validations_count  approved_count  rejected_count  needs_revision_count  avg_rating  quality_score  status  translator  translator_orcid  created_at  last_updated
```

**Quality Score (0-5 estrelas)**:

Calculado baseado em:
- **40% Confiança do tradutor** (média de confidence_label e confidence_definition)
- **30% Rating médio** das validações (1-5 estrelas dos revisores)
- **30% Taxa de aprovação** (aprovadas / total de validações)

**Fórmula**:
```
confidence_score = (avg_confidence / 5) * 2.0      // 0-2 pontos
rating_score = (avg_rating / 5) * 1.5              // 0-1.5 pontos
approval_score = (approved / total) * 1.5          // 0-1.5 pontos

quality_score = confidence_score + rating_score + approval_score  // 0-5 estrelas
```

**Quando usar**:
- Identificar traduções de alta qualidade
- Priorizar revisões
- Análise de métricas de qualidade
- Relatórios para gestores

---

## 🚀 Como Usar

### Interface Web

1. **Acesse**: Página "Histórico" → Botão "📥 Exportar Traduções"

2. **Selecione o formato**:
   - CSV para análise
   - JSON para programação
   - XLIFF para CAT tools
   - Babelon TSV para contribuir ao HPO
   - Five Stars TSV para métricas

3. **Opções**:
   - ☑️ **Apenas traduções aprovadas**: Filtra apenas traduções com status APPROVED

4. **Clique em "Exportar"**: Download automático do arquivo

### API Endpoint

```bash
GET /api/export/translations?format=babelon&onlyApproved=true&userId=1
```

**Query Parameters**:
- `format`: csv | json | xliff | babelon | fivestars (obrigatório)
- `onlyApproved`: true | false (opcional)
- `status`: APPROVED | PENDING_REVIEW | NEEDS_REVISION | REJECTED (opcional)
- `userId`: ID do usuário (opcional, filtrar por tradutor)
- `startDate`: ISO 8601 date (opcional, filtrar por data)
- `endDate`: ISO 8601 date (opcional)

**Exemplo com curl**:
```bash
# Exportar apenas aprovadas em formato Babelon
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/export/translations?format=babelon&onlyApproved=true" \
  -o hp-pt.babelon.tsv

# Exportar todas em JSON
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/export/translations?format=json" \
  -o translations.json

# Exportar CSV com filtro de data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/export/translations?format=csv&startDate=2025-01-01&endDate=2025-12-31" \
  -o translations-2025.csv
```

---

## 📋 Casos de Uso

### 1. Contribuir ao HPO Oficial
```
Formato: Babelon TSV
Filtro: Apenas aprovadas ✅
Uso: Pull request para hpo-translations
```

### 2. Análise de Qualidade
```
Formato: Five Stars TSV
Filtro: Todas
Uso: Identificar traduções que precisam revisão
```

### 3. Relatório para Coordenação
```
Formato: CSV
Filtro: Período específico
Uso: Relatório mensal de progresso
```

### 4. Backup de Dados
```
Formato: JSON
Filtro: Todas
Uso: Backup completo com metadados
```

### 5. Integração CAT Tool
```
Formato: XLIFF
Filtro: Pendentes de revisão
Uso: Revisão profissional em MemoQ/Trados
```

---

## 🔒 Segurança

- ✅ Autenticação obrigatória (JWT token)
- ✅ Rate limiting aplicado
- ✅ Apenas dados do usuário autenticado
- ✅ Validação de formato
- ✅ Escape de caracteres especiais (CSV, TSV, XML)

---

## 📊 Estatísticas no Export

Todos os formatos incluem (quando aplicável):
- Total de validações recebidas
- Contagem de aprovações/rejeições
- Rating médio dos revisores
- Nível de confiança auto-reportado
- ORCID do tradutor (quando disponível)
- Datas de criação e última atualização

---

## 🎯 Próximos Passos

Após exportar no formato Babelon TSV:

1. **Validação local**: Verificar se arquivo está bem formatado
2. **Fork do repositório**: https://github.com/obophenotype/hpo-translations
3. **Atualizar arquivo**: Substituir ou fazer merge com `babelon/hp-pt.babelon.tsv`
4. **Pull Request**: Descrever traduções adicionadas/atualizadas
5. **Revisão**: Aguardar feedback do time HPO
6. **Merge**: Suas traduções entram no release oficial!

---

## 📞 Suporte

Dúvidas sobre formatos ou como contribuir ao HPO oficial?
- Documentação HPO: https://hpo.jax.org
- Issues: https://github.com/obophenotype/hpo-translations/issues
- Email: (adicionar email de contato)

---

**Última atualização**: 2025-10-13
**Versão**: 1.0.0
