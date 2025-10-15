# 📚 Guia de Boas Práticas de Tradução - HPO Translator

**Para tradutores da plataforma HPO-PT**

---

## 🎯 Objetivo das Traduções

Criar traduções **precisas**, **consistentes** e **culturalmente adaptadas** dos termos do Human Phenotype Ontology (HPO) para o português brasileiro, mantendo a integridade científica e facilitando o uso clínico.

---

## ✅ Princípios Fundamentais

### 1. **Precisão Terminológica**
- Use termos médicos brasileiros padronizados (DeCS - Descritores em Ciências da Saúde)
- Consulte o [DeCS/MeSH](https://decs.bvsalud.org/) antes de traduzir
- Mantenha a especificidade do termo original
- Evite simplificações que alterem o significado clínico

**Exemplo:**
```
❌ Errado:  "Seizure" → "Ataque"
✅ Correto: "Seizure" → "Convulsão"
```

### 2. **Consistência**
- Verifique traduções existentes de termos similares na plataforma
- Use sempre o mesmo termo para o mesmo conceito
- Mantenha padrões de tradução dentro da mesma categoria

**Exemplo:**
```
Se "Cardiomyopathy" = "Cardiomiopatia"
Então "Dilated cardiomyopathy" = "Cardiomiopatia dilatada"
      "Hypertrophic cardiomyopathy" = "Cardiomiopatia hipertrófica"
```

### 3. **Clareza**
- Evite jargões desnecessários
- Traduza definições de forma compreensível para clínicos brasileiros
- Adicione contexto quando necessário

### 4. **Adaptação Cultural**
- Use terminologia brasileira, não portuguesa de Portugal
- Adapte exemplos para contexto brasileiro quando relevante
- Considere diferenças regionais quando aplicável

**Exemplo:**
```
❌ Brasil: "Análises"
✅ Brasil: "Exames"

❌ Portugal: "Rastreio"
✅ Brasil: "Rastreamento"
```

---

## 📝 Como Traduzir um Termo

### Passo 1: Entenda o Contexto

Antes de traduzir, leia atentamente:
- **Term Label (EN)**: O termo em inglês
- **Definition (EN)**: A definição completa
- **Synonyms (EN)**: Sinônimos em inglês
- **Category**: Sistema ou área médica (Neurologia, Cardiologia, etc.)
- **Difficulty**: Nível de complexidade (1-5 estrelas)

### Passo 2: Pesquise

Consulte fontes confiáveis:
1. **DeCS** (Descritores em Ciências da Saúde): https://decs.bvsalud.org/
2. **Traduções HPO existentes** na plataforma (busque termos similares)
3. **Literatura médica brasileira** (artigos, livros)
4. **Colegas especialistas** da sua área

### Passo 3: Traduza com Qualidade

#### **Label PT** (Termo em Português)
- **Obrigatório**
- Tradução concisa do termo principal
- Use maiúsculas apenas quando necessário
- Evite abreviações (exceto quando padrão)

**Exemplos:**
```
"Seizure" → "Convulsão"
"Intellectual disability" → "Deficiência intelectual"
"Abnormality of the nervous system" → "Anormalidade do sistema nervoso"
```

#### **Definition PT** (Definição)
- **Obrigatório**
- Tradução completa e precisa da definição
- Adapte para português natural (não tradução literal)
- Mantenha todos os detalhes clínicos importantes

**Exemplo:**
```
Original (EN):
"A seizure is an intermittent abnormality of nervous system physiology 
characterized by a transient occurrence of signs and/or symptoms due to 
abnormal excessive or synchronous neuronal activity in the brain."

Tradução (PT):
"Uma convulsão é uma anormalidade intermitente da fisiologia do sistema 
nervoso caracterizada pela ocorrência transitória de sinais e/ou sintomas 
devido à atividade neuronal anormal, excessiva ou síncrona no cérebro."
```

#### **Synonyms PT** (Sinônimos)
- **Opcional**
- Termos alternativos usados no Brasil
- Separe por vírgula
- Inclua variações regionais se relevantes

**Exemplo:**
```
"Convulsão, Crise convulsiva, Episódio convulsivo"
```

#### **Comments** (Comentários)
- **Opcional mas recomendado**
- Justifique escolhas de tradução
- Cite fontes consultadas
- Indique dúvidas ou termos controversos

**Exemplo:**
```
"Tradução baseada no DeCS (ID: 12345). O termo 'convulsão' é preferível 
a 'ataque' por ser mais específico e clinicamente preciso. Alguns autores 
usam 'crise convulsiva' como sinônimo, incluído nos sinônimos."
```

#### **Confidence Level** (Nível de Confiança)
Seja honesto! Isso ajuda validadores a priorizarem revisões.

- ⭐ (1): **Muito incerto** - Não sou especialista, precisa revisão urgente
- ⭐⭐ (2): **Incerto** - Pesquisei mas tenho dúvidas
- ⭐⭐⭐ (3): **Moderado** - Confiante mas pode haver alternativas
- ⭐⭐⭐⭐ (4): **Confiante** - Pesquisei bem, termo adequado
- ⭐⭐⭐⭐⭐ (5): **Muito confiante** - Sou especialista no tema

---

## 🚫 Erros Comuns a Evitar

### ❌ **1. Tradução Literal**
```
Errado: "Blue sclera" → "Esclera azul"
Correto: "Blue sclera" → "Esclerótica azulada"
(Termo mais usado na clínica brasileira)
```

### ❌ **2. Anglicismos**
```
Errado: "Screening" → "Screening"
Correto: "Screening" → "Rastreamento"
```

### ❌ **3. Termos de Portugal**
```
Errado: "Análises" (Portugal)
Correto: "Exames" (Brasil)

Errado: "Rastreio" (Portugal)
Correto: "Rastreamento" (Brasil)
```

### ❌ **4. Abreviações Não Padrão**
```
Errado: "IC" (insuficiência cardíaca)
Correto: "Insuficiência cardíaca"
(Escreva por extenso, exceto abreviações universais como DNA, RNA)
```

### ❌ **5. Perda de Especificidade**
```
Errado: "Hypertrophic cardiomyopathy" → "Problema cardíaco"
Correto: "Hypertrophic cardiomyopathy" → "Cardiomiopatia hipertrófica"
```

### ❌ **6. Tradução de Nomes Próprios**
```
Errado: "Down syndrome" → "Síndrome de Baixo"
Correto: "Down syndrome" → "Síndrome de Down"
(Nomes de síndromes não são traduzidos)
```

---

## 💡 Dicas Pro

### **Para Termos Difíceis**
1. Marque confiança baixa (1-2⭐)
2. Adicione comentário explicando a dúvida
3. Consulte especialistas antes de submeter (se possível)
4. Use sinônimos para cobrir variações

### **Para Sinônimos**
- Inclua termos que médicos brasileiros realmente usam
- Evite sinônimos técnicos demais ou arcaicos
- Priorize clareza sobre formalidade

### **Para Definições**
- Traduza a ideia, não palavra por palavra
- Use português natural e fluente
- Mantenha rigor científico sem ser robotizado

### **Recursos Úteis**
- **DeCS/MeSH**: https://decs.bvsalud.org/
- **Portal de Terminologia HPO**: https://hpo.jax.org/
- **Orphanet**: https://www.orpha.net/consor/cgi-bin/Disease_Search_Simple.php
- **OMIM**: https://www.omim.org/
- **SciELO** (artigos brasileiros): https://scielo.br/

---

## 🏆 Gamificação

### **Pontos por Ação**
- Criar tradução: **+50 pontos**
- Tradução aprovada (bônus): **+100 pontos**
- Validar tradução: **+30 pontos**
- Vencer conflito: **+150 pontos**

### **Como Ganhar Mais Pontos**
✅ Traduza termos de **alta dificuldade** (4-5⭐)  
✅ Mantenha **alta taxa de aprovação** (>85%)  
✅ Seja **consistente** (traduza diariamente)  
✅ **Valide** traduções de outros (peer review)  
✅ Contribua com **comentários úteis**  

### **Progressão de Níveis**
- **Nível 1-2**: Iniciante (0-500 pts)
- **Nível 3-4**: Colaborador (500-2000 pts)
- **Nível 5-6**: Especialista (2000-5000 pts)
- **Nível 7-10**: Mestre (5000+ pts)

Com **50+ traduções aprovadas** e **85%+ taxa de aprovação**, você é promovido automaticamente para **REVIEWER**! 🎉

---

## 📞 Precisa de Ajuda?

- **Dúvidas sobre um termo?** Adicione comentário na tradução
- **Não sabe como traduzir?** Marque confiança baixa (1-2⭐)
- **Conflito com outra tradução?** O comitê científico vai avaliar
- **Suporte técnico?** Contate: suporte@hpo-translator.com

---

## 🤝 Código de Conduta

1. **Seja respeitoso** com outros tradutores
2. **Não copie** traduções automáticas sem revisão
3. **Justifique** escolhas quando necessário
4. **Aceite feedback** construtivo de validadores
5. **Colabore** para melhoria contínua

---

**Última atualização**: 15 de Outubro de 2025  
**Versão**: 1.0

---

<div align="center">

**Boas traduções! 🧬**

[Voltar ao Dashboard](/) | [Ver Termos](/translate) | [Meu Histórico](/history)

</div>
