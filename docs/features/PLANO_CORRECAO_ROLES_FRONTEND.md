# 🔧 Plano de Correção - Sistema de Roles no Frontend

**Data:** 17 de Outubro de 2025  
**Objetivo:** Corrigir UX do sistema de permissões - esconder funcionalidades que o usuário não pode usar  
**Prioridade:** 🔴 ALTA (não é bug de segurança, mas péssima UX)

---

## 📋 Resumo Executivo

**Problema:** Frontend mostra botões admin para todos os usuários. Quando clicam, recebem erro 403.  
**Causa:** Falta verificação de roles antes de renderizar componentes administrativos.  
**Solução:** Criar helpers de permissão e aplicar em todos os componentes admin.  
**Tempo Estimado:** 2-3 horas  
**Complexidade:** Média

---

## 🎯 Objetivos

1. ✅ Criar sistema de helpers de permissão no frontend
2. ✅ Esconder botões admin de usuários sem permissão
3. ✅ Adicionar feedback claro quando não tiver acesso
4. ✅ Manter sincronizado com permissões do backend
5. ✅ Documentar sistema de permissões

---

## 📝 Plano Detalhado (8 Etapas)

### ETAPA 1: Criar RoleHelpers.ts 🔧

**Arquivo:** `plataforma-raras-cpl/src/utils/RoleHelpers.ts`

**Funções a implementar:**

```typescript
// Verificações básicas de role
export const isTranslator = (userRole: string): boolean
export const isReviewer = (userRole: string): boolean
export const isValidator = (userRole: string): boolean
export const isModerator = (userRole: string): boolean
export const isCommitteeMember = (userRole: string): boolean
export const isAdmin = (userRole: string): boolean
export const isSuperAdmin = (userRole: string): boolean

// Verificações de permissões específicas
export const canApproveTranslation = (userRole: string): boolean
  // Apenas ADMIN e SUPER_ADMIN

export const canRejectTranslation = (userRole: string): boolean
  // MODERATOR, ADMIN, SUPER_ADMIN

export const canAccessAdminDashboard = (userRole: string): boolean
  // MODERATOR+

export const canVoteOnConflict = (userRole: string): boolean
  // COMMITTEE_MEMBER, ADMIN, SUPER_ADMIN

export const canManageUsers = (userRole: string): boolean
  // ADMIN, SUPER_ADMIN

export const canBanUsers = (userRole: string): boolean
  // ADMIN, SUPER_ADMIN

export const canManageConflicts = (userRole: string): boolean
  // MODERATOR+

export const canDeleteComments = (userRole: string): boolean
  // MODERATOR+ ou próprio comentário

// Helper para mensagens
export const getRoleDisplayName = (role: string): string
  // TRANSLATOR → "Tradutor"
  // ADMIN → "Administrador"
  // etc...

// Hierarquia de roles (para comparações)
export const ROLE_HIERARCHY: Record<string, number>
```

**Tempo estimado:** 30 min

---

### ETAPA 2: Proteger Botões no Painel de Tradução 🔒

**Arquivo:** `ProductionHPOApp.tsx`  
**Linhas:** 2450-2520

**Mudanças:**

```tsx
// ❌ ANTES (todos veem)
{showTranslationPanel && selectedTerm && (
  <div>
    <button onClick={handleApproveTranslation}>
      ✅ Aprovar Tradução
    </button>
    <button onClick={handleRejectTranslation}>
      ❌ Rejeitar
    </button>
  </div>
)}

// ✅ DEPOIS (apenas quem pode usar vê)
import { canApproveTranslation, canRejectTranslation } from './utils/RoleHelpers';

{showTranslationPanel && selectedTerm && (
  <div>
    {canApproveTranslation(user.role) && (
      <button onClick={handleApproveTranslation}>
        ✅ Aprovar Tradução
      </button>
    )}
    
    {canRejectTranslation(user.role) && (
      <button onClick={handleRejectTranslation}>
        ❌ Rejeitar
      </button>
    )}
    
    {/* Mostrar mensagem se não tiver permissão */}
    {!canApproveTranslation(user.role) && !canRejectTranslation(user.role) && (
      <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginTop: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          ℹ️ Apenas moderadores podem aprovar ou rejeitar traduções.
        </p>
      </div>
    )}
  </div>
)}
```

**Tempo estimado:** 20 min

---

### ETAPA 3: Proteger Botões no AdminDashboard 🔒

**Arquivo:** `ProductionHPOApp.tsx`  
**Linhas:** 4240-4290

**Mudanças:**

```tsx
// No AdminDashboard component
const AdminDashboard = () => {
  // ... código existente ...

  return (
    <div>
      {/* Lista de traduções pendentes */}
      {pendingTranslations.map(translation => (
        <div key={translation.id}>
          <h3>{translation.term}</h3>
          
          {/* Botões condicionais */}
          <div>
            {canApproveTranslation(user.role) && (
              <button onClick={() => handleApprove(translation.id)}>
                ✅ Aprovar
              </button>
            )}
            
            {canRejectTranslation(user.role) && (
              <button onClick={() => handleReject(translation.id)}>
                ❌ Rejeitar
              </button>
            )}
          </div>
          
          {/* Aviso se não tiver permissão */}
          {!canApproveTranslation(user.role) && (
            <p style={{ fontSize: '12px', color: '#999' }}>
              Você não tem permissão para aprovar traduções
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Tempo estimado:** 20 min

---

### ETAPA 4: Proteger Renderização do AdminDashboard 🔒

**Arquivo:** `ProductionHPOApp.tsx`  
**Linha:** 5130

**Mudanças:**

```tsx
// ❌ ANTES (renderiza para qualquer usuário logado)
{currentPage === 'admin' && user && <AdminDashboard />}

// ✅ DEPOIS (verifica permissão)
{currentPage === 'admin' && user && (
  canAccessAdminDashboard(user.role) ? (
    <AdminDashboard />
  ) : (
    <UnauthorizedAccess 
      requiredRole="MODERATOR"
      userRole={user.role}
      message="Apenas moderadores e administradores podem acessar o painel administrativo."
    />
  )
)}
```

**Tempo estimado:** 15 min

---

### ETAPA 5: Criar Componente UnauthorizedAccess 🚫

**Arquivo:** `plataforma-raras-cpl/src/components/UnauthorizedAccess.tsx`

**Implementação:**

```tsx
import React from 'react';
import { getRoleDisplayName } from '../utils/RoleHelpers';

interface UnauthorizedAccessProps {
  requiredRole: string;
  userRole: string;
  message: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ 
  requiredRole, 
  userRole, 
  message 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '48px auto',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
      
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '700', 
        color: '#333', 
        marginBottom: '16px' 
      }}>
        Acesso Restrito
      </h2>
      
      <p style={{ 
        fontSize: '16px', 
        color: '#666', 
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          <strong>Seu perfil:</strong> {getRoleDisplayName(userRole)}
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
          <strong>Perfil necessário:</strong> {getRoleDisplayName(requiredRole)} ou superior
        </p>
      </div>
      
      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        ← Voltar
      </button>
    </div>
  );
};

export default UnauthorizedAccess;
```

**Tempo estimado:** 30 min

---

### ETAPA 6: Aplicar Verificações em TODAS as Áreas Admin 🔍

**Buscar todas as ocorrências:**

```bash
# No ProductionHPOApp.tsx, buscar por:
- "admin/"
- "approve"
- "reject"  
- "ban"
- "/api/admin"
```

**Áreas identificadas para proteger:**

1. ✅ **Linha 2450-2520**: Botões aprovar/rejeitar (translation panel) ✅
2. ✅ **Linha 3742**: Botão "👑 Admin" no menu (JÁ PROTEGIDO)
3. ✅ **Linha 4014**: Componente AdminDashboard
4. ✅ **Linha 4044**: API call /api/admin/translations/pending
5. ✅ **Linha 4060**: API call /api/admin/translations/:id/approve
6. ✅ **Linha 4092**: API call /api/admin/translations/:id/reject
7. ❓ **Buscar mais**: Qualquer botão/componente que chame rotas /api/admin/*

**Ações para cada área:**

```tsx
// Para cada botão/componente admin:
1. Identificar qual permissão é necessária
2. Adicionar verificação com helper apropriado
3. Esconder ou desabilitar se não tiver permissão
4. Adicionar tooltip/mensagem explicativa opcional
```

**Tempo estimado:** 40 min

---

### ETAPA 7: Testes de Permissões 🧪

**Casos de teste:**

```
✅ TESTE 1: Usuário TRANSLATOR
   - Não vê botão "👑 Admin" no menu
   - Não vê botões "Aprovar" e "Rejeitar" nas traduções
   - Se forçar acesso admin via console, vê tela "Acesso Restrito"

✅ TESTE 2: Usuário MODERATOR
   - Vê botão "👑 Admin" no menu
   - Vê botão "Rejeitar" mas NÃO vê "Aprovar"
   - Consegue acessar AdminDashboard
   - Lista de traduções pendentes carrega

✅ TESTE 3: Usuário COMMITTEE_MEMBER
   - Vê botão "👑 Admin" no menu
   - Consegue votar em conflitos
   - NÃO vê botões aprovar/rejeitar traduções normais

✅ TESTE 4: Usuário ADMIN
   - Vê TODOS os botões administrativos
   - Consegue aprovar e rejeitar traduções
   - Consegue banir usuários
   - Consegue resolver conflitos

✅ TESTE 5: Mensagens de erro
   - Se tentar acessar área sem permissão, vê mensagem clara
   - Mensagem mostra qual role é necessário
   - Botão "Voltar" funciona
```

**Como testar:**

```javascript
// No console do navegador:
localStorage.setItem('token', 'seu_token_aqui');

// Criar usuários teste no banco:
// TRANSLATOR: translator@test.com
// MODERATOR: moderator@test.com
// ADMIN: admin@test.com
```

**Tempo estimado:** 30 min

---

### ETAPA 8: Documentação 📚

**Arquivo:** `docs/features/PERMISSOES_FRONTEND.md`

**Conteúdo:**

```markdown
# Sistema de Permissões - Frontend

## Tabela de Permissões

| Ação | TRANSLATOR | REVIEWER | VALIDATOR | MODERATOR | COMMITTEE | ADMIN | SUPER_ADMIN |
|------|-----------|----------|-----------|-----------|-----------|-------|-------------|
| Traduzir termos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Votar em traduções | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rejeitar tradução | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Aprovar tradução | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Votar em conflitos | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Acessar Admin Dashboard | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Banir usuários | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gerenciar sistema | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Como Usar RoleHelpers

\```typescript
import { canApproveTranslation, canAccessAdminDashboard } from './utils/RoleHelpers';

// Em componente React:
{canApproveTranslation(user.role) && (
  <button onClick={handleApprove}>Aprovar</button>
)}
\```

## Sincronização Backend ↔️ Frontend

As permissões do frontend devem SEMPRE espelhar o backend:
- Backend: src/middleware/permissions.ts
- Frontend: src/utils/RoleHelpers.ts

Se adicionar nova permissão no backend, adicione também no frontend!
```

**Tempo estimado:** 20 min

---

## 📊 Resumo de Arquivos Modificados

### Arquivos NOVOS (2):
1. ✅ `plataforma-raras-cpl/src/utils/RoleHelpers.ts` (novo)
2. ✅ `plataforma-raras-cpl/src/components/UnauthorizedAccess.tsx` (novo)
3. ✅ `docs/features/PERMISSOES_FRONTEND.md` (novo)

### Arquivos MODIFICADOS (1):
1. ✅ `plataforma-raras-cpl/src/ProductionHPOApp.tsx`
   - Linha 2450-2520: Adicionar verificações em botões tradução
   - Linha 4014+: Adicionar verificações em AdminDashboard
   - Linha 5130: Proteger renderização AdminDashboard
   - Adicionar imports de RoleHelpers e UnauthorizedAccess

---

## ⏱️ Timeline

| Etapa | Tempo | Acumulado |
|-------|-------|-----------|
| 1. RoleHelpers.ts | 30 min | 30 min |
| 2. Botões Tradução | 20 min | 50 min |
| 3. Botões AdminDashboard | 20 min | 1h 10min |
| 4. Proteção AdminDashboard | 15 min | 1h 25min |
| 5. UnauthorizedAccess | 30 min | 1h 55min |
| 6. Aplicar em todas áreas | 40 min | 2h 35min |
| 7. Testes | 30 min | 3h 05min |
| 8. Documentação | 20 min | **3h 25min** |

**Tempo total estimado:** 3h 25min

---

## ✅ Checklist Final

Antes de considerar COMPLETO, verificar:

- [ ] RoleHelpers.ts criado e testado
- [ ] Todos os botões admin protegidos
- [ ] UnauthorizedAccess implementado
- [ ] AdminDashboard protegido na renderização
- [ ] Mensagens claras para usuários sem permissão
- [ ] Testes com 3 tipos de usuário (TRANSLATOR, MODERATOR, ADMIN)
- [ ] Documentação completa
- [ ] Zero erros de compilação
- [ ] Zero warnings no console
- [ ] Backend continua funcionando normalmente

---

## 🎯 Resultado Esperado

**ANTES:**
- 😕 Usuário TRANSLATOR vê botão "Aprovar"
- 😕 Clica → Recebe erro 403
- 😕 Fica confuso

**DEPOIS:**
- 😊 Usuário TRANSLATOR NÃO vê botão "Aprovar"
- 😊 Vê mensagem: "Apenas administradores podem aprovar"
- 😊 Entende claramente suas limitações

---

## 🚀 Comando para Começar

```bash
# 1. Criar RoleHelpers.ts
cd plataforma-raras-cpl/src/utils
# Criar arquivo conforme ETAPA 1

# 2. Aplicar mudanças no ProductionHPOApp.tsx
# Seguir ETAPAS 2, 3, 4

# 3. Criar UnauthorizedAccess
cd ../components
# Criar arquivo conforme ETAPA 5

# 4. Testar
npm run dev
# Abrir http://localhost:5173
# Login com diferentes usuários
```

---

**Status:** 📋 PLANO APROVADO - PRONTO PARA EXECUÇÃO
