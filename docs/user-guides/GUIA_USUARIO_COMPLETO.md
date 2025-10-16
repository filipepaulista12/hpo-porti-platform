# 📖 GUIA COMPLETO DO USUÁRIO - HPO Translator Platform

**Versão**: 1.0  
**Data**: 14 de Outubro de 2025  
**Público**: Pesquisadores, Clínicos, Tradutores Biomédicos

---

## 🎯 SOBRE A PLATAFORMA

### O Que é HPO?

**Human Phenotype Ontology (HPO)** é um vocabulário padronizado que descreve **fenótipos clínicos anormais** em humanos. Com mais de **17.000 termos**, o HPO é usado mundialmente para:

- 🧬 Diagnóstico de doenças raras
- 🔬 Pesquisa genômica e fenotípica
- 🏥 Registros médicos eletrônicos
- 📊 Análise de dados clínicos

### Por Que Traduzir?

Apenas **20% dos médicos** no Brasil leem inglês fluentemente. A tradução do HPO para português permite:

✅ Democratizar acesso ao diagnóstico de doenças raras  
✅ Facilitar colaboração entre profissionais de saúde  
✅ Melhorar comunicação médico-paciente  
✅ Aumentar inclusão de pacientes brasileiros em pesquisas  

### Nossa Missão

Criar a **tradução brasileira oficial** do HPO através de:
- **Tradução colaborativa** por especialistas
- **Validação por pares** (peer review)
- **Revisão por comitê** científico
- **Sincronização oficial** com o HPO internacional

---

## 🚀 COMEÇANDO

### 1. Criar Conta

1. Acesse: `http://localhost:5173` (ou domínio da produção)
2. Clique em **"Registrar"**
3. Preencha:
   - Nome completo
   - Email institucional (preferencial)
   - Senha segura (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**

### 2. Completar Perfil (Importante!)

Após o primeiro login, complete seu perfil:

- **Instituição**: Universidade, Hospital, Centro de Pesquisa
- **Especialidade**: Genética Médica, Pediatria, Bioinformática, etc.
- **País**: Brasil
- **Experiência**: Iniciante, Intermediário, Avançado
- **ORCID iD** (opcional): Vincula suas traduções ao seu perfil acadêmico

**Por que é importante?**
- Credita corretamente suas contribuições
- Permite análise de qualidade por especialidade
- Facilita colaboração entre pares

### 3. Entender Roles (Papéis)

A plataforma tem 3 níveis de permissão:

#### 🟢 TRANSLATOR (Tradutor)
- **Acesso**: Criar e editar traduções
- **Pode**: Traduzir termos, validar traduções de outros
- **Não pode**: Aprovar definitivamente, resolver conflitos

#### 🟡 COMMITTEE_MEMBER (Membro do Comitê)
- **Herda**: Tudo que TRANSLATOR pode
- **Extra**: Resolver conflitos quando há discordâncias
- **Vota**: Em traduções divergentes

#### 🔴 ADMIN (Administrador)
- **Herda**: Tudo que COMMITTEE_MEMBER pode
- **Extra**: Aprovar traduções finais, gerenciar usuários
- **Sincroniza**: Traduções aprovadas com HPO oficial

---

## 📝 COMO TRADUZIR

### Passo 1: Acessar Lista de Termos

1. Faça login
2. Clique em **"Traduzir"** no menu superior
3. Veja lista de **17.020 termos HPO**

### Passo 2: Filtrar Termos

Use filtros para encontrar termos relevantes:

- **Status**: "Não traduzidos" (foco em novos)
- **Categoria**: Sua área de expertise (ex: "Nervous system")
- **Dificuldade**: Iniciante (1-2), Intermediário (3-4), Avançado (5)
- **Busca**: Digite palavra-chave (ex: "cardiomyopathy")

**Dica**: Comece por termos de **dificuldade 1-2** para se familiarizar!

### Passo 3: Selecionar Termo

Clique em **"Ver Detalhes"** no termo escolhido.

Você verá:
- **HP ID**: Código único (ex: HP:0001250)
- **Termo Original** (inglês): "Seizure"
- **Definição** (inglês): Explicação detalhada
- **Categoria**: Sistema afetado
- **Dificuldade**: 1-5 estrelas
- **Sinônimos** (se houver)

### Passo 4: Preencher Tradução

Complete o formulário:

#### **Label PT (Termo em Português)** ⚠️ OBRIGATÓRIO
- Tradução concisa do termo principal
- Exemplo: "Seizure" → "Convulsão"
- **Boas práticas**:
  - Use terminologia médica brasileira padrão
  - Consulte DeCS (Descritores em Ciências da Saúde)
  - Mantenha consistência com traduções existentes

#### **Definição PT** ⚠️ OBRIGATÓRIO
- Tradução da definição completa
- Adapte para contexto brasileiro quando relevante
- Exemplo: "A seizure is an intermittent abnormality of nervous system..." → "Uma convulsão é uma anormalidade intermitente do sistema nervoso..."

#### **Sinônimos PT** (Opcional)
- Termos alternativos usados no Brasil
- Separe por vírgula
- Exemplo: "Convulsão, Crise convulsiva, Ataque epilético"

#### **Comentários** (Opcional)
- Justifique escolhas de tradução
- Cite referências (se usou)
- Indique dúvidas para validadores

#### **Nível de Confiança** (1-5)
- 1 ⭐: Incerto, precisa revisão urgente
- 2 ⭐⭐: Pouco confiante
- 3 ⭐⭐⭐: Moderadamente confiante
- 4 ⭐⭐⭐⭐: Confiante
- 5 ⭐⭐⭐⭐⭐: Muito confiante, especialista no tema

**Seja honesto!** Confiança baixa não é problema - ajuda validadores a priorizarem revisão.

### Passo 5: Submeter

1. Clique em **"Submeter Tradução"**
2. Veja mensagem: **"Tradução enviada com sucesso! +50 pontos"**
3. Status muda para: **PENDING_REVIEW** (Aguardando Validação)

---

## ✅ VALIDAÇÃO POR PARES

### O Que é Peer Review?

Cada tradução é revisada por **pelo menos 2 validadores** antes de ser aprovada definitivamente.

### Como Validar Traduções de Outros

1. Vá em **"Validar"** (ou veja traduções PENDING_REVIEW)
2. Selecione uma tradução
3. Compare:
   - Termo original (inglês)
   - Tradução proposta (português)
   - Definição traduzida
4. Avalie usando **Escala Likert**:

   - **1 - Discordo Totalmente**: Tradução incorreta, precisa refazer
   - **2 - Discordo**: Problemas significativos
   - **3 - Neutro**: Aceitável mas pode melhorar
   - **4 - Concordo**: Boa tradução
   - **5 - Concordo Totalmente**: Excelente tradução

5. Adicione **comentários** (obrigatório se nota ≤3):
   - Explique o que está errado
   - Sugira melhorias
   - Cite referências se necessário

6. Clique em **"Enviar Validação"**
7. Receba **+30 pontos**

### Critérios de Qualidade

✅ **Correção Terminológica**: Usa termos médicos corretos?  
✅ **Consistência**: Coerente com traduções similares?  
✅ **Clareza**: Fácil de entender para público-alvo?  
✅ **Contexto Brasileiro**: Adaptada à realidade local?  
✅ **Gramática**: Português correto sem erros?  

---

## 🔀 RESOLUÇÃO DE CONFLITOS

### O Que é um Conflito?

Quando **2 ou mais tradutores** submetem traduções **diferentes** para o **mesmo termo**, o sistema cria automaticamente um **ConflictReview**.

### Como Funciona?

1. **Auto-Detecção**: Sistema detecta traduções divergentes
2. **Notificação**: Comitê científico é alertado
3. **Votação**: Membros do comitê votam na melhor opção
4. **Quórum**: Mínimo **3 votos** para resolver
5. **Resolução**: Opção com **>50% dos votos** vence

### Se Você Está no Comitê

1. Receba notificação: **"🔀 Novo Conflito Detectado"**
2. Clique em **"Conflitos"** no menu
3. Veja lista de conflitos pendentes
4. Clique em **"Votar"**
5. Compare traduções lado a lado:
   - Opção 1: Tradução do Usuário A
   - Opção 2: Tradução do Usuário B
6. Escolha uma das 3 opções:

   #### ✅ Aprovar uma das traduções
   - Selecione a melhor opção (1 ou 2)
   - Adicione comentário justificando
   - **Resultado**: Vencedora vira APPROVED (+150pts extra)

   #### 📝 Solicitar nova tradução
   - Nenhuma opção é adequada
   - Ambas mantêm status PENDING
   - Tradutores são notificados para refazerem

   #### 🤔 Abster-se
   - Não tem expertise suficiente
   - Não conta para quórum

7. Confirme voto
8. Quando **3 votos** com **mesma escolha**:
   - Conflito **RESOLVIDO** automaticamente
   - Vencedora → APPROVED
   - Perdedora → REJECTED
   - Tradutores notificados

---

## 🎮 GAMIFICAÇÃO

### Sistema de Pontos

Ganhe pontos por contribuições:

| Ação | Pontos |
|------|--------|
| Criar tradução | +50 |
| Validar tradução | +30 |
| Tradução aprovada (bônus) | +100 |
| Vencer conflito (extra) | +150 |
| Tradução rejeitada (penalidade) | -10 |

### Níveis

Suba de nível acumulando pontos:

- 🥉 **Nível 1 - Iniciante**: 0-99 pontos
- 🥈 **Nível 2 - Aprendiz**: 100-299 pontos
- 🏅 **Nível 3 - Colaborador**: 300-599 pontos
- 🏆 **Nível 4 - Especialista**: 600-999 pontos
- 💎 **Nível 5 - Mestre**: 1000+ pontos

### Badges (Distintivos)

Desbloqueie badges especiais:

- 🌟 **Primeira Tradução**: Complete sua primeira tradução
- 🔥 **Sequência de 7 Dias**: Traduza 7 dias seguidos
- 💯 **100 Traduções**: Atinja 100 traduções criadas
- ⭐ **100% de Aprovação**: 50+ traduções, todas aprovadas
- 🏅 **Top 10**: Entre no top 10 do leaderboard
- 👑 **Líder**: Seja #1 no leaderboard

### Leaderboard (Ranking)

Veja os top contribuidores em **"Leaderboard"**:
- 🥇 **1º Lugar**: Medalha dourada
- 🥈 **2º Lugar**: Medalha prata
- 🥉 **3º Lugar**: Medalha bronze

**Atualização**: Em tempo real via WebSocket!

---

## 🔔 NOTIFICAÇÕES

### Tipos de Notificações

Receba alertas para:

- ✅ **Tradução Aprovada**: "Sua tradução de 'Seizure' foi aprovada! +100 pontos"
- ❌ **Tradução Rejeitada**: "Sua tradução precisa revisão. Veja comentários."
- 🎉 **Sync Oficial**: "Suas 5 traduções foram incluídas no sync HPO!"
- 🔀 **Novo Conflito**: (Comitê) "Termo HP:0001250 tem múltiplas traduções"
- 🏆 **Conflito Vencido**: "Sua tradução venceu o voto do comitê! +150 pontos"
- 📊 **Conflito Resolvido**: "O comitê escolheu outra tradução para o termo..."
- 🆙 **Novo Nível**: "Parabéns! Você atingiu Nível 3 - Colaborador"
- 🏅 **Novo Badge**: "Badge desbloqueado: 100 Traduções"

### Como Usar

1. **Bell Icon** (🔔) no header sempre visível
2. **Badge vermelho** com número de não lidas
3. **Clique** para abrir dropdown
4. **Notificações recentes** (até 20)
5. **Clique na notificação** para ir ao contexto
6. **"Carregar mais"** para ver antigas
7. **"Marcar todas como lidas"** para limpar badge

**Atualização**: Instantânea via WebSocket!

---

## 📊 ANALYTICS (Apenas ADMINs)

### Dashboard de Métricas

Visão geral do projeto:

#### Cards de Progresso
- **Progresso Geral**: % termos traduzidos (meta: 17.020)
- **Tempo Médio de Aprovação**: Dias até aprovação
- **Usuários Ativos**: Ativos vs. Total
- **Aguardando Aprovação**: Traduções pending

#### Top Contribuidores
- Ranking dos 6 melhores tradutores
- Pontos, nível, traduções recentes

#### Distribuição de Status
- PENDING_REVIEW, APPROVED, REJECTED, etc.
- Contagem por status

#### Traduções por Categoria
- Top 8 categorias mais traduzidas
- Identifica gaps

### Sincronização HPO Oficial

**Objetivo**: Enviar traduções aprovadas para o repositório oficial do HPO.

#### Como Sincronizar

1. Vá em **"Analytics"** (apenas ADMIN)
2. Seção: **"🔄 Sincronização HPO Oficial"**
3. Veja contador: **"X traduções prontas"**
4. Clique em **"🚀 Iniciar Sync"**
5. Confirme no alert
6. Aguarde processamento (5-30s)
7. Veja mensagem: **"Sync concluído! X traduções sincronizadas"**

#### O Que Acontece no Sync?

1. **Seleção**: Busca traduções APPROVED + não sincronizadas
2. **Geração TSV**: Cria arquivo Babelon TSV (formato oficial HPO)
3. **10 Colunas**:
   - subject_id (HP:XXXXXXX)
   - subject_label (Termo original)
   - predicate_id (rdfs:label ou oboInOwl:hasExactSynonym)
   - object_id (vazio)
   - object_label (Tradução PT)
   - translator (email do tradutor)
   - translation_provider (HPO-PT Platform)
   - source (URL da plataforma)
   - translation_status (OFFICIAL)
   - translation_type (translation ou synonym)
4. **Marcação**: Traduções marcadas como `syncedToHpo = true`
5. **Registro**: SyncLog criado com metadata
6. **Notificações**: Tradutores recebem notificação de sucesso
7. **Arquivo**: Salvo em `exports/sync/hp-pt.babelon.YYYY-MM-DD.tsv`

#### Histórico de Sincronizações

Veja todas sync anteriores:
- Data e hora
- Quantidade de traduções
- Usuário que executou
- Status (COMPLETED)
- **Download**: Baixe arquivo TSV novamente

#### Recomendações

- **Frequência**: Mensal ou quando atingir ≥100 traduções novas
- **Qualidade**: Apenas traduções APPROVED são incluídas
- **Backup**: Arquivos TSV são versionados por data

---

## 📜 HISTÓRICO PESSOAL

### Ver Suas Traduções

1. Clique em **"Histórico"** no menu
2. Veja todas suas traduções criadas
3. **Filtros disponíveis**:
   - Status (PENDING, APPROVED, REJECTED)
   - Categoria
   - Data (mais recentes primeiro)
4. **Busca**: Digite HP ID ou termo

### Informações Exibidas

Cada tradução mostra:
- **Termo HP**: ID e nome original
- **Tradução PT**: Sua tradução
- **Status**: Badge colorido (Verde/Amarelo/Vermelho)
- **Data**: Quando foi criada
- **Validações**: Quantas validações recebeu
- **Confiança**: Seu nível de confiança (1-5)
- **Ações**: Ver detalhes, Editar (se PENDING)

---

## 🔒 SEGURANÇA E PRIVACIDADE

### Autenticação

- **JWT Tokens**: Sessão segura por 7 dias
- **Bcrypt**: Senhas hashadas (nunca armazenadas em plain text)
- **HTTPS**: Todas comunicações criptografadas (produção)

### Permissões

- **Role-Based Access Control (RBAC)**
- Cada feature verifica permissões
- Logs de auditoria para ações sensíveis

### Dados Pessoais

- **Email**: Usado apenas para login e notificações
- **ORCID**: Opcional, para atribuição acadêmica
- **Não compartilhamos** dados com terceiros
- **Export**: Traduções creditadas com seu nome/ORCID

---

## ❓ FAQ (Perguntas Frequentes)

### 1. Posso traduzir termos fora da minha especialidade?

**Sim!** Mas seja honesto no **nível de confiança**. Traduções com confiança baixa são priorizadas para validação por especialistas.

### 2. O que acontece se minha tradução for rejeitada?

- Você perde **-10 pontos** (pequena penalidade)
- Recebe **feedback** nos comentários
- Pode **refazer** a tradução considerando sugestões
- **Não desanime!** Faz parte do processo de aprendizado

### 3. Quanto tempo leva para uma tradução ser aprovada?

- **Validação**: 2-7 dias (depende de disponibilidade de validadores)
- **Aprovação final**: 1-2 semanas (ADMIN precisa aprovar)
- **Sync oficial**: Mensal (após aprovação)

### 4. Posso editar uma tradução depois de submetida?

- **PENDING_REVIEW**: Sim, pode editar livremente
- **APPROVED**: Não, mas pode solicitar revisão ao ADMIN
- **REJECTED**: Sim, refaça e resubmeta

### 5. Como me tornar COMMITTEE_MEMBER?

Critérios:
- Mínimo **100 traduções** aprovadas
- Taxa de aprovação **≥90%**
- **Nível 4+** (Especialista)
- **Convite** do ADMIN após análise de qualidade

### 6. Posso usar tradutores automáticos (Google Translate, DeepL)?

**Com cautela!** Tradutores automáticos podem ajudar, mas:
- ⚠️ **Sempre revise** manualmente
- ⚠️ **Adapte** termos médicos (máquinas erram muito)
- ⚠️ **Consulte** DeCS e literatura brasileira
- ⚠️ **Indique confiança baixa** se usou máquina sem revisão

### 7. O que são sinônimos e quando adicionar?

**Sinônimos** são termos alternativos usados no Brasil para o mesmo conceito.

Exemplo:
- Termo: "Convulsão"
- Sinônimos: "Crise convulsiva, Ataque epilético, Episódio convulsivo"

**Adicione sinônimos quando**:
- Termo tem variações regionais (Brasil vs. Portugal)
- Existem termos populares vs. técnicos
- Literatura brasileira usa múltiplos termos

### 8. Como citar referências na minha tradução?

No campo **Comentários**, adicione:
```
Tradução baseada em:
- DeCS (Descritores em Ciências da Saúde)
- Artigo: Silva et al. 2023 (DOI: 10.xxxx)
- Consenso Brasileiro de Genética Médica
```

### 9. Posso trabalhar offline?

**Não.** A plataforma requer conexão para:
- Salvar traduções em tempo real
- Receber notificações instantâneas
- Evitar conflitos de edição
- Sincronizar gamificação

### 10. Como reportar bugs ou sugerir melhorias?

- **Email**: suporte@hpo-translator.com
- **GitHub Issues**: (link do repositório)
- **Formulário de Feedback**: Na plataforma (em breve)

---

## 📞 SUPORTE

### Contatos

- **Email Técnico**: suporte@hpo-translator.com
- **Email Científico**: comite@hpo-translator.com
- **Documentação**: https://docs.hpo-translator.com
- **GitHub**: https://github.com/hpo-translator/platform

### Horário de Atendimento

- Segunda a Sexta: 9h - 18h (Brasília)
- Resposta em até 48h úteis

### Recursos Adicionais

- **Tutorial em Vídeo**: (em breve)
- **Webinars Mensais**: Treinamento ao vivo
- **Comunidade Slack**: Discussões e dúvidas
- **Wiki**: Guias detalhados por especialidade

---

## 🎓 CRÉDITOS E LICENÇA

### Equipe

- **Desenvolvimento**: [Nomes]
- **Comitê Científico**: [Nomes]
- **Apoio Institucional**: [Universidades/Hospitais]

### Licença

- **Código**: MIT License (open source)
- **Traduções**: CC BY 4.0 (atribuição obrigatória)
- **HPO Ontology**: © Monarch Initiative

### Como Citar

```
HPO Brazilian Portuguese Translation Platform (2025).
Developed by [Instituição].
Available at: https://hpo-translator.com
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Complete Seu Perfil
📝 Adicione instituição, especialidade e ORCID

### 2. Faça Sua Primeira Tradução
🌟 Escolha um termo de dificuldade 1-2

### 3. Valide Traduções de Colegas
✅ Ajude a comunidade revisando

### 4. Suba no Ranking
🏆 Alcance Nível 3 e desbloqueie badges

### 5. Junte-se ao Comitê
👥 Torne-se COMMITTEE_MEMBER

---

**Bem-vindo à revolução da saúde inclusiva! 🎉**

Sua contribuição ajudará milhares de pacientes brasileiros a terem acesso a diagnósticos mais rápidos e precisos de doenças raras.

**Vamos traduzir juntos! 💙🇧🇷**
