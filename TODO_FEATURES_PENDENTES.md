# 🚧 TODO - FEATURES PENDENTES DE MIGRAÇÃO

## ⚠️ ROTAS NÃO MIGRADAS (Requerem Models Prisma Adicionais)

### 1. **Analytics Routes** (`analytics.routes.ts`)
**Funcionalidades:**
- Dashboard analytics avançado (velocidade de tradução, trends de qualidade)
- Top contributors
- Sincronização com GitHub HPO oficial (export Babelon)
- Download de arquivo Babelon sincronizado

**Dependências faltando no schema:**
- Model `SyncLog` precisa campo `adminId` 
- User model precisa campo `approvedCount` (✅ JÁ ADICIONADO na migração)
- HpoTerm precisa campo `label` (atualmente só tem `labelEn`)

**Prioridade:** 🔴 ALTA (analytics é crítico para admins)

---

### 2. **Comment Routes** (`comment.routes.ts`)
**Funcionalidades:**
- CRUD de comentários em traduções
- Sistema de respostas (replies)
- Notificações quando recebe comentário

**Dependências faltando no schema:**
- Model `Comment` já existe ✅
- Precisa apenas ajustar relations

**Prioridade:** 🟡 MÉDIA (comentários melhoram colaboração)

---

### 3. **Conflict Routes** (`conflict.routes.ts`)
**Funcionalidades:**
- Sistema de votação do comitê para resolver conflitos
- Gerenciamento de conflitos de tradução
- Resolução automática por votação majoritária

**Dependências faltando no schema:**
- Model `ConflictReview` (não existe)
- Model `CommitteeVote` (não existe)
- Enums: `ConflictType`, `ConflictStatus`, `Priority`

**Prioridade:** 🟢 BAIXA (feature avançada, não essencial para MVP)

---

## 📋 PLANO DE AÇÃO PARA IMPLEMENTAR

### Opção 1: Implementação Completa (RECOMENDADO)
```bash
# 1. Adicionar models faltando no schema.prisma:
# - ConflictReview
# - CommitteeVote  
# - Adicionar campo `label` (labelPt) em HpoTerm
# - Adicionar campo `adminId` em SyncLog

# 2. Criar migration
npx prisma migrate dev --name add_conflict_and_analytics_models

# 3. Copiar as 3 rotas de volta
# 4. Adicionar no server.ts
```

### Opção 2: Implementação Parcial (RÁPIDO)
```bash
# Implementar apenas Comment Routes (mais simples)
# Deixar Analytics e Conflict para versão futura
```

---

## 🎯 ESTIMATIVA DE TEMPO

- **Comment Routes:** 1-2 horas
- **Analytics Routes:** 3-4 horas (precisa testar sync GitHub)
- **Conflict Routes:** 6-8 horas (sistema complexo de votação)

**TOTAL:** 10-14 horas de desenvolvimento + testes

---

## 💡 RECOMENDAÇÃO

**Para MVP/Produção inicial:**
1. ✅ Manter features já migradas (são sólidas)
2. ✅ Implementar **Comment Routes** (simples e útil)
3. ⏳ Deixar Analytics e Conflict para Sprint 2

**As features migradas já são 100% funcionais:**
- WebSocket (notificações real-time)
- Email Service (6 templates)
- 16.942 termos HPO
- Sistema de gamificação
- Validação de traduções
- Sistema de strikes/moderação
