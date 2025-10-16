# 🏛️ Dashboard de Administrador - Arquitetura Completa

## 📋 Visão Geral

O Dashboard Admin é um **sistema de governança completo** para gerenciar todo o ciclo de vida das traduções HPO, desde a submissão até a contribuição oficial ao repositório HPO.

---

## 🎯 Objetivos do Sistema

### Primários
1. **Validação por Consenso**: Notificar comitê quando ≥2 traduções do mesmo termo
2. **Gestão de Qualidade**: Aprovar/rejeitar com rastreabilidade completa
3. **Moderação de Usuários**: Gerenciar permissões, banir spam, promover especialistas
4. **Sincronização HPO**: Fluxo periódico de atualização do repositório oficial

### Secundários
5. **Analytics**: Métricas de produtividade, qualidade, engajamento
6. **Auditoria**: Log completo de todas as ações administrativas
7. **Comunicação**: Notificações contextuais aos usuários

---

## 👥 Personas e Permissões

### Hierarquia de Roles
```
SUPER_ADMIN (nível 5)
  └─ Acesso total
  └─ Gerencia outros admins
  └─ Configurações de sistema

ADMIN (nível 4)
  └─ Aprovação final de traduções
  └─ Ban/unban usuários
  └─ Sincronização HPO

COMMITTEE_MEMBER (nível 3)
  └─ Voto em traduções com conflito
  └─ Revisão de traduções complexas
  └─ Sugestões de melhoria

MODERATOR (nível 2)
  └─ Triagem inicial
  └─ Marcar para comitê
  └─ Responder comentários

USER (nível 1)
  └─ Traduzir e validar
```

---

## 🔄 Workflows Principais

### 1️⃣ **Workflow de Validação por Consenso**

```
┌─────────────────────────────────────────────────────────────┐
│ TRADUÇÃO SUBMETIDA                                          │
│ termo.translations_count++                                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ VERIFICAR: termo.translations_count >= 2?                   │
└─────────────────────────────────────────────────────────────┘
         ↓ NÃO                              ↓ SIM
┌──────────────────┐           ┌───────────────────────────────┐
│ Status:          │           │ CRIAR CONFLICT_REVIEW         │
│ PENDING_REVIEW   │           │ - tipo: MULTIPLE_TRANSLATIONS │
│                  │           │ - status: PENDING_COMMITTEE   │
│ Aguardar mais    │           │ - priority: MEDIUM            │
│ tradutores       │           └───────────────────────────────┘
└──────────────────┘                       ↓
                              ┌───────────────────────────────┐
                              │ NOTIFICAR COMMITTEE_MEMBERS   │
                              │ Email + Dashboard + Bell      │
                              │ "Novo termo com 2+ traduções" │
                              └───────────────────────────────┘
                                          ↓
                              ┌───────────────────────────────┐
                              │ COMMITTEE VOTE                │
                              │ Cada membro vota em 1 opção:  │
                              │ - Tradução A                  │
                              │ - Tradução B                  │
                              │ - Tradução C (se existir)     │
                              │ - Criar nova (síntese)        │
                              └───────────────────────────────┘
                                          ↓
                              ┌───────────────────────────────┐
                              │ QUORUM ALCANÇADO (>50% votos) │
                              │ Opção vencedora → APPROVED    │
                              │ Outras opções → REJECTED      │
                              └───────────────────────────────┘
                                          ↓
                              ┌───────────────────────────────┐
                              │ NOTIFICAR TRADUTORES          │
                              │ "Sua tradução foi aprovada"   │
                              │ "Sua tradução foi rejeitada"  │
                              │ + Feedback do comitê          │
                              └───────────────────────────────┘
```

### 2️⃣ **Workflow de Aprovação Individual**

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN APROVA TRADUÇÃO                                       │
│ - Verificar validations (ratings médio ≥ 4)                │
│ - Verificar confidence (≥ 4)                                │
│ - Verificar translator.level (≥ 3)                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ CRIAR AUDIT_LOG                                             │
│ - action: APPROVE_TRANSLATION                               │
│ - admin_id, translation_id                                  │
│ - reason, timestamp                                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ATUALIZAR STATUS                                            │
│ translation.status = APPROVED                               │
│ translation.approved_by = admin_id                          │
│ translation.approved_at = NOW()                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ATUALIZAR HPO_TERM                                          │
│ hpo_term.translation_status = APPROVED                      │
│ hpo_term.label_pt = translation.label_pt                    │
│ hpo_term.definition_pt = translation.definition_pt          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ GAMIFICATION                                                │
│ user.approved_count++                                       │
│ user.points += 100                                          │
│ user.reputation += 10                                       │
│ Verificar level up, badges                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ NOTIFICAR TRADUTOR                                          │
│ "Sua tradução foi aprovada! +100 pontos"                   │
└─────────────────────────────────────────────────────────────┘
```

### 3️⃣ **Workflow de Rejeição**

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN REJEITA TRADUÇÃO                                      │
│ - reason: OBRIGATÓRIO (seleção + texto livre)              │
│ - suggestions: OPCIONAL (como melhorar)                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ CRIAR REJECTION                                             │
│ - translation_id                                            │
│ - admin_id                                                  │
│ - reason_code: INCORRECT_TRANSLATION |                      │
│                POOR_GRAMMAR |                               │
│                NOT_MEDICAL_TERM |                           │
│                DUPLICATE |                                   │
│                OTHER                                         │
│ - detailed_reason: texto livre                              │
│ - suggestions: como corrigir                                │
│ - can_resubmit: true/false                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ATUALIZAR STATUS                                            │
│ translation.status = REJECTED                               │
│ translation.rejected_by = admin_id                          │
│ translation.rejected_at = NOW()                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ IMPACTO NO TRADUTOR                                         │
│ SE reason = SPAM ou POOR_QUALITY:                           │
│   user.reputation -= 5                                      │
│   user.warning_count++                                      │
│   SE warning_count >= 3:                                    │
│     user.status = SUSPENDED (7 dias)                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ NOTIFICAR TRADUTOR                                          │
│ Email + Dashboard:                                          │
│ "Sua tradução foi rejeitada"                               │
│ "Motivo: [reason]"                                          │
│ "Sugestões: [suggestions]"                                  │
│ "Você pode resubmeter? [can_resubmit]"                     │
└─────────────────────────────────────────────────────────────┘
```

### 4️⃣ **Workflow de Sincronização HPO**

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: Manual (Admin) ou Agendado (1x/mês)              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ COLETAR TRADUÇÕES APROVADAS                                 │
│ WHERE status = APPROVED                                     │
│   AND synced_to_hpo = false                                 │
│   AND quality_score >= 4.0                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ GERAR ARQUIVO BABELON                                       │
│ format: hp-pt.babelon.tsv                                   │
│ translator: orcid ou email do comitê                        │
│ translation_status: OFFICIAL                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ CRIAR SYNC_LOG                                              │
│ - sync_date, admin_id                                       │
│ - translations_count                                         │
│ - babelon_file_path                                         │
│ - status: PENDING_GITHUB_PR                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ OPÇÃO A: Auto GitHub PR (via GitHub API)                   │
│ - Create branch: update-pt-translations-YYYY-MM             │
│ - Commit file                                               │
│ - Open Pull Request                                         │
│ - Atribuir reviewers do HPO                                 │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ OPÇÃO B: Download Manual                                    │
│ Admin baixa arquivo → Upload manual no GitHub               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ MARCAR COMO SINCRONIZADO                                    │
│ translation.synced_to_hpo = true                            │
│ translation.synced_at = NOW()                               │
│ hpo_term.sync_status = SYNCED                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ MÉTRICAS DE CONTRIBUIÇÃO                                    │
│ - Calcular ranking dos tradutores por contribuições sync   │
│ - Badge: "HPO Contributor" (1+ aprovadas sincronizadas)    │
│ - Badge: "HPO Champion" (50+ aprovadas sincronizadas)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelos de Dados Necessários

### 1. ConflictReview
```typescript
model ConflictReview {
  id                Int       @id @default(autoincrement())
  hpoTermId         Int
  hpoTerm           HpoTerm   @relation(fields: [hpoTermId], references: [id])
  translations      Translation[] @relation("ConflictTranslations")
  type              ConflictType  // MULTIPLE_TRANSLATIONS, QUALITY_DISPUTE
  status            ReviewStatus  // PENDING_COMMITTEE, IN_REVIEW, RESOLVED
  priority          Priority      // LOW, MEDIUM, HIGH, CRITICAL
  committeeVotes    CommitteeVote[]
  winningTranslationId Int?
  resolution        String?       // Explicação da decisão
  createdAt         DateTime  @default(now())
  resolvedAt        DateTime?
  resolvedBy        Int?
  resolver          User?     @relation(fields: [resolvedBy], references: [id])
}
```

### 2. CommitteeVote
```typescript
model CommitteeVote {
  id                Int       @id @default(autoincrement())
  conflictReviewId  Int
  conflictReview    ConflictReview @relation(fields: [conflictReviewId], references: [id])
  voterId           Int
  voter             User      @relation(fields: [voterId], references: [id])
  translationId     Int?      // null se voto for "criar nova"
  translation       Translation? @relation(fields: [translationId], references: [id])
  voteType          VoteType  // APPROVE_THIS, CREATE_NEW, ABSTAIN
  comment           String?
  votedAt           DateTime  @default(now())
  
  @@unique([conflictReviewId, voterId]) // 1 voto por membro
}
```

### 3. Rejection
```typescript
model Rejection {
  id                Int       @id @default(autoincrement())
  translationId     Int       @unique
  translation       Translation @relation(fields: [translationId], references: [id])
  rejectedBy        Int
  admin             User      @relation(fields: [rejectedBy], references: [id])
  reasonCode        RejectionReason
  detailedReason    String
  suggestions       String?
  canResubmit       Boolean   @default(true)
  createdAt         DateTime  @default(now())
}

enum RejectionReason {
  INCORRECT_TRANSLATION
  POOR_GRAMMAR
  NOT_MEDICAL_TERM
  DUPLICATE
  OFFENSIVE_CONTENT
  SPAM
  OTHER
}
```

### 4. AdminAuditLog
```typescript
model AdminAuditLog {
  id          Int       @id @default(autoincrement())
  adminId     Int
  admin       User      @relation(fields: [adminId], references: [id])
  action      AdminAction
  targetType  String    // Translation, User, HpoTerm, System
  targetId    Int?
  changes     Json?     // Before/after snapshot
  reason      String?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  
  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}

enum AdminAction {
  APPROVE_TRANSLATION
  REJECT_TRANSLATION
  DELETE_TRANSLATION
  BAN_USER
  UNBAN_USER
  PROMOTE_USER
  DEMOTE_USER
  SYNC_TO_HPO
  RESOLVE_CONFLICT
  EDIT_TERM
  SYSTEM_CONFIG
}
```

### 5. SyncLog
```typescript
model SyncLog {
  id                  Int       @id @default(autoincrement())
  syncDate            DateTime  @default(now())
  initiatedBy         Int
  admin               User      @relation(fields: [initiatedBy], references: [id])
  translationsCount   Int
  babelonFilePath     String?
  githubPrUrl         String?
  status              SyncStatus
  errorMessage        String?
  completedAt         DateTime?
  
  @@index([syncDate])
}

enum SyncStatus {
  PENDING
  GENERATING_FILE
  CREATING_PR
  PR_CREATED
  COMPLETED
  FAILED
}
```

### 6. Notification
```typescript
model Notification {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  message     String
  link        String?   // Deep link para página relevante
  read        Boolean   @default(false)
  createdAt   DateTime  @default(now())
  
  @@index([userId, read])
  @@index([createdAt])
}

enum NotificationType {
  TRANSLATION_APPROVED
  TRANSLATION_REJECTED
  VALIDATION_RECEIVED
  CONFLICT_VOTE_NEEDED
  LEVEL_UP
  BADGE_EARNED
  COMMENT_RECEIVED
  SYSTEM_ANNOUNCEMENT
}
```

---

## 🎨 Interface do Dashboard Admin

### Página Principal - Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🏛️ Admin Dashboard                           [Usuário Admin]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Aguardando  │ │ Conflitos   │ │ Qualidade   │            │
│ │ Aprovação   │ │ Pendentes   │ │ Baixa       │            │
│ │     42      │ │      8      │ │     15      │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚨 Ações Urgentes                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⚠️  Termo HP:0001250 tem 3 traduções conflitantes      │ │
│ │     [Ver Detalhes] [Iniciar Votação]                   │ │
│ │                                                          │ │
│ │ ⏰  Sincronização mensal vence em 2 dias               │ │
│ │     125 traduções prontas para sync                     │ │
│ │     [Iniciar Sincronização]                            │ │
│ │                                                          │ │
│ │ 👤  Usuário "João Silva" atingiu 3 avisos              │ │
│ │     [Revisar Atividade] [Suspender]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [📋 Fila de Moderação] [👥 Usuários] [⚙️ Configurações]     │
└─────────────────────────────────────────────────────────────┘
```

### Fila de Moderação
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Fila de Moderação                                         │
│ Filtros: [Todas] [Alta Prioridade] [Conflitos] [Baixa Qual]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🔴 HP:0001250 - Seizure                               │   │
│ │ 3 traduções conflitantes • Prioridade: ALTA           │   │
│ │ Tradutores: Ana (★4.8), Bruno (★4.5), Carlos (★4.2)  │   │
│ │                                                        │   │
│ │ [Ver Traduções] [Iniciar Votação] [Pedir Revisão]    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🟡 HP:0002315 - Headache                              │   │
│ │ 1 tradução pendente • Confiança: 3/5 • Rating: 4.2    │   │
│ │ Tradutor: Maria (★4.6) • 2 validações positivas      │   │
│ │                                                        │   │
│ │ [Aprovar] [Rejeitar] [Pedir Mais Info]               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ... mais traduções ...                                       │
│                                                               │
│ [Anterior] Página 1 de 15 [Próxima]                         │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Aprovação/Rejeição
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Aprovar Tradução                                [X]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Termo: HP:0001250 - Seizure                                 │
│ Tradução: "Convulsão"                                        │
│ Tradutor: Ana Silva (Nível 5, ★4.8)                         │
│                                                               │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Verificações Automáticas:                           │     │
│ │ ✅ Confiança do tradutor: 5/5                       │     │
│ │ ✅ Rating de validadores: 4.5/5 (2 validações)     │     │
│ │ ✅ Sem conflitos conhecidos                         │     │
│ │ ✅ Gramática verificada                             │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                               │
│ Comentário para o tradutor (opcional):                      │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Excelente trabalho! Tradução precisa e concisa.    │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                               │
│ ☑️ Sincronizar com HPO na próxima atualização               │
│                                                               │
│ [Cancelar] [Aprovar Agora]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Sistema de Notificações

### Eventos que Geram Notificações

**Para Tradutores:**
1. Tradução aprovada → "🎉 Sua tradução foi aprovada!"
2. Tradução rejeitada → "❌ Sua tradução precisa revisão"
3. Validação recebida → "⭐ Alguém validou sua tradução"
4. Conflito resolvido → "✅ Votação concluída: sua tradução venceu"
5. Level up → "🎊 Parabéns! Você subiu para nível 5"
6. Badge ganho → "🏆 Novo badge desbloqueado: HPO Contributor"

**Para Comitê:**
1. Novo conflito → "🚨 Novo termo com múltiplas traduções"
2. Votação necessária → "🗳️ Sua votação é necessária"
3. Quorum alcançado → "✅ Votação concluída"
4. Tradução complexa → "🔍 Revisão de especialista solicitada"

**Para Admins:**
1. Usuário suspenso automaticamente → "⚠️ Usuário suspender por 3 avisos"
2. Sincronização pendente → "⏰ Sincronização mensal agendada para hoje"
3. GitHub PR criado → "✅ Pull Request #123 criado no HPO"

---

## 📈 Métricas e Analytics

### Dashboard de Métricas
```
Performance da Plataforma (Últimos 30 dias)

📊 Traduções
- Total submetidas: 1.247
- Aprovadas: 892 (71.5%)
- Rejeitadas: 145 (11.6%)
- Em revisão: 210 (16.9%)

⚡ Tempo Médio
- Submissão → Primeira validação: 2.3 dias
- Submissão → Aprovação final: 5.8 dias
- Conflito → Resolução: 3.1 dias

👥 Engajamento
- Usuários ativos: 42
- Novos tradutores: 8
- Validadores ativos: 15
- Taxa de retenção: 68%

🎯 Qualidade
- Quality score médio: 4.2/5
- Traduções com 2+ validações: 78%
- Taxa de consenso: 85%
```

---

## 🔐 Segurança e Auditoria

### Logs de Auditoria
```sql
-- Todas as ações críticas são registradas
SELECT 
  admin_id,
  action,
  target_type,
  target_id,
  reason,
  created_at
FROM AdminAuditLog
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Prevenção de Abuso
- Rate limiting em aprovações (máx 100/dia por admin)
- Requerer reason em todas as rejeições
- Alertar quando admin rejeita >50% de um tradutor específico
- Log de IPs para todas as ações administrativas

---

## 📅 Periodicidade e Agendamentos

### Tarefas Automatizadas

**Diárias**:
- Verificar traduções com 2+ submissões → criar ConflictReview
- Calcular quality scores atualizados
- Enviar digest de notificações não lidas

**Semanais**:
- Relatório de progresso para admins
- Lembrete de votações pendentes para comitê
- Identificar usuários inativos

**Mensais**:
- Sincronização HPO (se ≥50 traduções aprovadas)
- Relatório de analytics completo
- Backup de auditoria logs

**Trimestrais**:
- Revisão de usuários suspensos
- Análise de tendências de qualidade
- Atualização de dificuldades dos termos

---

## 🚀 Próximos Passos de Implementação

### Fase 1 - Core (Essencial)
1. ✅ Modelos de dados (Prisma schema)
2. ✅ Backend routes para admin
3. ✅ Sistema de permissões (middleware)
4. ✅ CRUD de moderação
5. ✅ Notificações básicas

### Fase 2 - Workflows (Crítico)
6. ✅ Conflict detection automático
7. ✅ Committee voting system
8. ✅ Approval/rejection workflows
9. ✅ Audit logging completo

### Fase 3 - Sincronização (Importante)
10. ✅ HPO sync scheduler
11. ✅ Babelon export refinado
12. ✅ GitHub integration (opcional)

### Fase 4 - Interface (UX)
13. ✅ Admin Dashboard UI
14. ✅ Moderation queue
15. ✅ Analytics dashboard
16. ✅ Notification center

### Fase 5 - Automação (Otimização)
17. Auto-approval baseado em regras
18. ML para detecção de qualidade
19. Sugestões de tradução similares
20. Performance monitoring

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Admins sobrecarregados | Alto | Committee voting, auto-approval rules |
| Decisões inconsistentes | Médio | Audit logs, review process |
| Conflitos nunca resolvidos | Médio | Prioridade automática, alertas |
| Sincronização HPO falha | Alto | Validações antes de sync, rollback |
| Spam/abuso de usuários | Médio | Rate limiting, suspensão automática |

---

## 📝 Considerações Finais

Este Dashboard Admin é praticamente **um sistema completo de governança**. Requer:
- **15-20 tabelas novas** no banco
- **20+ endpoints** novos no backend
- **5-10 páginas** novas no frontend
- **Sistema de jobs** para tarefas agendadas
- **Webhook integration** com GitHub (opcional)
- **Email service** para notificações externas

**Estimativa de esforço**: 40-60 horas de desenvolvimento

**Prioridade de implementação**: Posso começar com as funcionalidades core (Fase 1-2) que você mais precisa agora, e expandir gradualmente?

Você gostaria que eu comece implementando qual parte primeiro?
1. 🗳️ Sistema de votação do comitê
2. ✅ Fila de moderação básica
3. 🔔 Sistema de notificações
4. 📊 Analytics dashboard

