# 🧪 Guia de Testes - HPO Translation Platform

## Data: Outubro 2025
## Versão: P2 Final Release

---

## 📋 Índice

1. [Teste Manual Completo](#teste-manual-completo)
2. [Testes Automatizados](#testes-automatizados)
3. [Checklist de Features](#checklist-de-features)
4. [Casos de Uso](#casos-de-uso)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Teste Manual Completo

### Pré-requisitos
```bash
# Backend rodando em http://localhost:3001
cd hpo-platform-backend
npm run dev

# Frontend rodando em http://localhost:5173
cd plataforma-raras-cpl
npm run dev

# Database: PostgreSQL em localhost:5433
# 100 HPO terms, 4 test users seeded
```

### 🔐 **TESTE 1: Autenticação**

#### 1.1 Registro de Novo Usuário
- [ ] Acesse http://localhost:5173
- [ ] Clique em "Cadastrar"
- [ ] Preencha dados válidos:
  - Nome: "Teste User"
  - Email: "teste@example.com"
  - Senha: "senha12345" (mínimo 8 caracteres)
  - Confirmar senha: "senha12345"
- [ ] **VERIFICAR**: Toast verde ✅ "Cadastro realizado com sucesso!"
- [ ] **VERIFICAR**: Redirect para dashboard

#### 1.2 Login
- [ ] Volte para tela de login
- [ ] Login com:
  - Email: translator@hpo.com
  - Senha: password123
- [ ] **VERIFICAR**: Toast verde ✅ "Login realizado com sucesso!"
- [ ] **VERIFICAR**: Dashboard carregado com stats

#### 1.3 Token Expiration
- [ ] Aguarde 15 minutos OU modifique JWT_EXPIRES_IN no .env para "10s"
- [ ] Tente fazer qualquer ação
- [ ] **VERIFICAR**: Toast vermelho ❌ "Sua sessão expirou. Por favor, faça login novamente."
- [ ] **VERIFICAR**: Redirect para login

---

### 🌓 **TESTE 2: Dark Mode (P2.2)**

#### 2.1 Toggle Tema
- [ ] Login no sistema
- [ ] Clique no botão 🌙 (canto superior direito)
- [ ] **VERIFICAR**: Interface muda para tema escuro
- [ ] **VERIFICAR**: Botão muda para ☀️
- [ ] Clique novamente
- [ ] **VERIFICAR**: Volta para tema claro
- [ ] Recarregue a página (F5)
- [ ] **VERIFICAR**: Tema persiste (localStorage)

#### 2.2 Contraste e Legibilidade
- [ ] Em dark mode, verifique:
  - [ ] Background escuro (oklch 0.12)
  - [ ] Texto claro legível
  - [ ] Cards com contraste adequado
  - [ ] Botões visíveis
  - [ ] Inputs com borda visível

---

### 📝 **TESTE 3: Sistema de Tradução**

#### 3.1 Criar Nova Tradução
- [ ] Login como TRANSLATOR
- [ ] Clique em "Traduzir"
- [ ] Selecione um termo HPO da lista
- [ ] Preencha tradução em português
- [ ] Ajuste confiança (1-5 estrelas)
- [ ] Clique "Enviar Tradução"
- [ ] **VERIFICAR**: Toast verde ✅ "Tradução enviada com sucesso! +X pontos 🎉"
- [ ] **VERIFICAR**: Pontos incrementados no header
- [ ] **VERIFICAR**: Termo removido da lista

#### 3.2 Rate Limiting
- [ ] Envie 5 traduções rapidamente (< 1 minuto)
- [ ] Na 6ª tentativa:
- [ ] **VERIFICAR**: Toast amarelo ⚠️ "Aguarde X segundos..."
- [ ] **VERIFICAR**: Banner no topo com countdown
- [ ] Aguarde countdown zerar
- [ ] **VERIFICAR**: Banner desaparece
- [ ] **VERIFICAR**: Pode traduzir novamente

---

### ✅ **TESTE 4: Sistema de Validação**

#### 4.1 Validar Traduções
- [ ] Login como REVIEWER (reviewer@hpo.com / password123)
- [ ] Clique em "Revisar"
- [ ] Selecione tradução pendente
- [ ] Escolha decisão (Aprovar/Rejeitar/Revisar)
- [ ] Adicione rating (1-5 estrelas)
- [ ] Adicione comentário (opcional)
- [ ] Clique "Enviar Validação"
- [ ] **VERIFICAR**: Toast verde ✅ "Validação enviada com sucesso! +X pontos 🎉"
- [ ] **VERIFICAR**: Tradução removida da lista

---

### 📖 **TESTE 5: Guidelines Page (P2.3)**

#### 5.1 Acesso à Página
- [ ] Login no sistema
- [ ] Clique em "📖 Diretrizes" no header
- [ ] **VERIFICAR**: Página carrega com:
  - [ ] Título "📖 Diretrizes de Tradução HPO"
  - [ ] Seção "Objetivo" (azul)
  - [ ] 4 Princípios Fundamentais
  - [ ] Regras de Formatação
  - [ ] Casos Específicos (tabela anatomia)
  - [ ] 5 Níveis de Confiança
  - [ ] Recursos Recomendados
  - [ ] Processo de Validação

#### 5.2 Navegação
- [ ] Clique em "← Voltar"
- [ ] **VERIFICAR**: Retorna para dashboard

---

### 🚨 **TESTE 6: Three-Strike System (P2.4)**

#### 6.1 Criar Strike (Admin)
- [ ] Login como ADMIN (admin@hpo.com / admin123)
- [ ] Vá para Admin Dashboard
- [ ] **TESTE VIA API** (Postman/Thunder Client):
  ```json
  POST http://localhost:3001/api/admin/strikes
  Headers: { Authorization: "Bearer <admin_token>" }
  Body: {
    "userId": "<user_id>",
    "reason": "LOW_QUALITY_TRANSLATION",
    "detailedReason": "Traduções consistentemente ruins com erros graves de terminologia médica.",
    "severity": 2
  }
  ```
- [ ] **VERIFICAR**: Response 200 com "Strike created. User has 1/3 strikes."
- [ ] **VERIFICAR**: Usuário recebe notificação

#### 6.2 Strike #2 (Warning)
- [ ] Crie segundo strike para mesmo usuário
- [ ] **VERIFICAR**: Response indica "2/3 strikes"
- [ ] **VERIFICAR**: Notificação de warning: "⚠️ ATENÇÃO: Um terceiro strike resultará em suspensão"

#### 6.3 Strike #3 (Auto-Ban)
- [ ] Crie terceiro strike
- [ ] **VERIFICAR**: Response "User has been automatically banned for 7 days"
- [ ] **VERIFICAR**: isBanned=true, isActive=false
- [ ] Tente fazer login com usuário banido
- [ ] **VERIFICAR**: Erro "Usuário banido"

#### 6.4 Deactivate Strike
- [ ] **TESTE VIA API**:
  ```json
  PUT http://localhost:3001/api/admin/strikes/<strike_id>/deactivate
  ```
- [ ] **VERIFICAR**: Strike.isActive = false
- [ ] Se tinha 3 strikes:
  - [ ] **VERIFICAR**: Usuário automaticamente desbanido

#### 6.5 Strike Statistics
- [ ] **TESTE VIA API**:
  ```json
  GET http://localhost:3001/api/admin/strikes/statistics
  ```
- [ ] **VERIFICAR**: Response com:
  - totalStrikes
  - activeStrikes
  - strikesByReason
  - usersAtRisk (2 strikes)
  - bannedDueToStrikes

---

### 🔄 **TESTE 7: Auto-Promoção (P1.2)**

#### 7.1 TRANSLATOR → REVIEWER
- [ ] Como TRANSLATOR, crie 50+ traduções
- [ ] Tenha 85%+ taxa de aprovação
- [ ] Alcance level 3+
- [ ] Admin aprova uma tradução sua
- [ ] **VERIFICAR**: Toast verde ✅ "🎉 Parabéns! Você foi promovido a REVIEWER!"
- [ ] **VERIFICAR**: user.role = 'REVIEWER'
- [ ] **VERIFICAR**: Pode acessar página "Revisar"

#### 7.2 REVIEWER → COMMITTEE_MEMBER
- [ ] Como REVIEWER, crie 200+ traduções
- [ ] Tenha 90%+ taxa de aprovação
- [ ] Alcance level 8+
- [ ] Faça 100+ validações
- [ ] **VERIFICAR**: Promoção para COMMITTEE_MEMBER

#### 7.3 Progresso de Promoção
- [ ] **TESTE VIA API**:
  ```json
  GET http://localhost:3001/api/users/promotion-progress
  Headers: { Authorization: "Bearer <user_token>" }
  ```
- [ ] **VERIFICAR**: Response com percentuais:
  - translationProgress: XX%
  - approvalRateProgress: XX%
  - levelProgress: XX%
  - validationProgress: XX%
  - isEligible: true/false

---

### 🎨 **TESTE 8: Toast Notifications (P2.1)**

#### 8.1 Success Toasts
- [ ] Envie tradução → Verde ✅
- [ ] Aprove validação → Verde ✅
- [ ] Exporte arquivo → Verde ✅
- [ ] Atualize perfil → Verde ✅

#### 8.2 Error Toasts
- [ ] Tente login inválido → Vermelho ❌
- [ ] Erro de rede → Vermelho ❌
- [ ] Validação falha → Vermelho ❌

#### 8.3 Warning Toasts
- [ ] Rate limiting → Amarelo ⚠️
- [ ] Senhas não coincidem → Amarelo ⚠️
- [ ] Campos obrigatórios → Amarelo ⚠️

#### 8.4 Toast Positioning & Behavior
- [ ] **VERIFICAR**: Posição top-right
- [ ] **VERIFICAR**: Auto-close após 3 segundos
- [ ] **VERIFICAR**: Progress bar visível
- [ ] **VERIFICAR**: Pode fechar manualmente (X)
- [ ] **VERIFICAR**: Múltiplos toasts empilham verticalmente

---

### 📊 **TESTE 9: Leaderboard & Stats**

#### 9.1 Ranking
- [ ] Clique em "🏆 Ranking"
- [ ] **VERIFICAR**: Lista de usuários ordenada por pontos
- [ ] **VERIFICAR**: Mostra: rank, nome, pontos, level, badges
- [ ] **VERIFICAR**: Filtros: Todos/Mês/Semana
- [ ] Mude filtro para "Mês"
- [ ] **VERIFICAR**: Dados atualizam

#### 9.2 Profile Stats
- [ ] Clique em "👤 Perfil"
- [ ] **VERIFICAR**: Mostra:
  - Pontos totais
  - Level atual
  - Traduções (total, aprovadas, pendentes, rejeitadas)
  - Taxa de aprovação
  - Badges conquistados
  - Streak

---

### 🔐 **TESTE 10: Admin Functions**

#### 10.1 Admin Dashboard
- [ ] Login como ADMIN
- [ ] Clique em "⚙️ Admin"
- [ ] **VERIFICAR**: Cards com:
  - Pending Translations
  - Conflicts
  - Low Quality
  - Recent Actions

#### 10.2 Approve Translation
- [ ] Selecione tradução pendente
- [ ] Clique "Aprovar"
- [ ] **VERIFICAR**: Toast verde ✅ "Tradução aprovada com sucesso!"
- [ ] **VERIFICAR**: Status = APPROVED
- [ ] **VERIFICAR**: Se usuário elegível, promoção automática

#### 10.3 Reject Translation
- [ ] Selecione tradução
- [ ] Clique "Rejeitar"
- [ ] Escolha motivo (enum)
- [ ] Escreva razão detalhada (mín. 20 caracteres)
- [ ] **VERIFICAR**: Toast verde ✅ "Tradução rejeitada"
- [ ] **VERIFICAR**: Usuário recebe notificação
- [ ] **VERIFICAR**: Pode reenviar (canResubmit=true)

#### 10.4 Ban/Unban User
- [ ] **TESTE VIA API**:
  ```json
  PUT http://localhost:3001/api/admin/users/<user_id>/ban
  Body: { "reason": "Comportamento inadequado repetido" }
  ```
- [ ] **VERIFICAR**: isBanned=true
- [ ] **VERIFICAR**: Notificação enviada
- [ ] **VERIFICAR**: Não pode fazer login
- [ ] Desban:
  ```json
  PUT http://localhost:3001/api/admin/users/<user_id>/unban
  ```
- [ ] **VERIFICAR**: isBanned=false

---

## 🤖 Testes Automatizados

### Setup
```bash
cd plataforma-raras-cpl
npm run test
```

### Test Files (10 arquivos, 103 test cases)

#### 1. ConfirmationModal.test.tsx (6 tests)
```bash
✓ Renderiza modal quando isOpen=true
✓ Não renderiza quando isOpen=false
✓ Chama onConfirm ao clicar em confirmar
✓ Chama onCancel ao clicar em cancelar
✓ Mostra labels customizados
✓ Renderiza com variantes (danger, warning, info)
```

#### 2. TokenStorage.test.ts (12 tests)
```bash
✓ save() armazena token no localStorage
✓ get() retorna token armazenado
✓ get() retorna null se não existe
✓ remove() limpa token
✓ hasToken() retorna true/false corretamente
✓ getAuthHeader() retorna Bearer token
✓ isExpired() detecta token expirado
✓ isExpired() retorna true para token inválido
✓ save() sobrescreve token existente
✓ Integração: save → get → remove
✓ Integração: múltiplas operações
✓ Error handling para localStorage indisponível
```

#### 3. Tooltip.test.tsx (8 tests)
```bash
✓ Mostra tooltip ao hover
✓ Esconde tooltip ao sair
✓ Renderiza conteúdo customizado
✓ Posições: top, bottom, left, right
✓ Tooltip com texto longo
✓ Delay no hover
✓ Tooltip em elementos disabled
✓ Rapid hover (não quebra)
```

#### 4. Skeleton.test.tsx (10 tests)
```bash
✓ Renderiza skeleton loader
✓ Variante: text, circular, rectangular
✓ Tamanhos diferentes (width, height)
✓ Animação pulse
✓ Múltiplos skeletons em grid
✓ Skeleton para card completo
✓ Condicional: loading vs content
✓ Skeleton com count (repetir)
✓ Custom className
✓ Snapshot test
```

#### 5. EmptyState.test.tsx (11 tests)
```bash
✓ Renderiza mensagem vazia
✓ Ícone customizado
✓ Descrição opcional
✓ Action button
✓ Callback do botão
✓ Sem botão quando não fornecido
✓ EmptyState para lista vazia
✓ EmptyState para busca sem resultados
✓ EmptyState para erro
✓ Acessibilidade (aria-labels)
✓ Responsividade
```

#### 6. StarRating.test.tsx (15 tests)
```bash
✓ Renderiza 5 estrelas
✓ Seleção de rating ao clicar
✓ Callback onChange
✓ Rating inicial (defaultValue)
✓ Hover preview
✓ Readonly mode (sem interação)
✓ Tamanhos: small, medium, large
✓ Half stars
✓ Custom max stars (1-10)
✓ Disabled state
✓ Clear rating (click novamente)
✓ Keyboard navigation (arrows)
✓ Acessibilidade (aria)
✓ Snapshot test
✓ Integração com form
```

#### 7. Breadcrumbs.test.tsx (12 tests)
```bash
✓ Renderiza breadcrumbs
✓ Navegação ao clicar
✓ Separador customizado (/, >, →)
✓ Último item não é link
✓ Truncate no meio (...)
✓ Breadcrumb com ícones
✓ Home icon
✓ Responsivo (collapse em mobile)
✓ Dropdown para muitos itens
✓ Acessibilidade (nav, aria)
✓ Click tracking
✓ Snapshot test
```

#### 8. NotificationCenter.test.tsx (15 tests)
```bash
✓ Renderiza botão com badge count
✓ Abre dropdown ao clicar
✓ Lista de notificações
✓ Badge vermelho para unread
✓ Mark as read
✓ Mark all as read
✓ Delete notification
✓ Notification types (icons)
✓ Empty state
✓ Link navigation
✓ Auto-refresh (polling)
✓ Click outside fecha dropdown
✓ Keyboard (Escape fecha)
✓ Event propagation
✓ Snapshot test
```

#### 9. Auth.integration.test.tsx (14 tests)
```bash
✓ Login flow completo
✓ Login error handling
✓ Logout limpa token
✓ Token persistence (localStorage)
✓ Auto-login com token válido
✓ Redirect após login
✓ Protected routes (sem token)
✓ Token expiration redirect
✓ Register flow
✓ Form validation
✓ Password mismatch error
✓ API error handling
✓ Session management
✓ E2E: Register → Login → Logout
```

### Rodar Testes
```bash
# Todos os testes
npm run test

# Com coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode (visual)
npm run test:ui
```

### Coverage Target
```
Statements   : 80%+
Branches     : 75%+
Functions    : 80%+
Lines        : 80%+
```

---

## ✅ Checklist de Features

### Core Features (P0) - 100%
- [x] 100 HPO terms seeded
- [x] User authentication (JWT)
- [x] Translation CRUD
- [x] Validation system
- [x] Gamification (points, levels, badges)
- [x] Leaderboard
- [x] Profile page
- [x] History tracking

### Advanced Features (P1) - 75%
- [x] P1.2: Auto-promotion REVIEWER/COMMITTEE_MEMBER
- [x] P1.3: Rejection system with detailed reasons
- [x] P1.4: Ban/Unban moderation system
- [x] P1.6: Test suite (10 files, 103 tests)
- [ ] P1.1: OAuth ORCID (deferred to deployment)
- [ ] P1.5: GitHub API sync (deferred to deployment)

### Polish Features (P2) - 100%
- [x] P2.1: Toast notification system (25 alerts replaced)
- [x] P2.2: Dark mode with toggle
- [x] P2.3: Guidelines page (350+ lines)
- [x] P2.4: Three-strike system (auto-ban)
- [x] P2.5: Productivity dashboard (recharts)

---

## 🎭 Casos de Uso

### Caso 1: Novo Usuário Traduzindo
1. Cadastro
2. Onboarding (tutorial)
3. Primeira tradução (ganha badge)
4. Level up (50 pontos)
5. Consulta guidelines
6. Continua traduzindo

### Caso 2: Revisão de Pares
1. REVIEWER acessa "Revisar"
2. Seleciona tradução pendente
3. Avalia qualidade (1-5 estrelas)
4. Aprova ou rejeita
5. Ganha pontos por validação
6. Sistema checa promoção automática

### Caso 3: Moderação Admin
1. ADMIN vê dashboard
2. Identifica tradução problemática
3. Rejeita com motivo detalhado
4. Usuário recebe feedback
5. Pode reenviar melhorada

### Caso 4: Three-Strike Disciplinar
1. Admin detecta spam
2. Aplica Strike #1 (warning)
3. Usuário recebe notificação
4. Continua spam
5. Strike #2 (warning final)
6. Persiste
7. Strike #3 → Auto-ban 7 dias

---

## 🔧 Troubleshooting

### Toast não aparece
- Verifique se `<ToastContainer />` está renderizado
- Verifique CSS do react-toastify importado
- Console: procure por erros do ToastService

### Dark mode não persiste
- Verifique localStorage: `localStorage.getItem('theme')`
- Verifique useEffect de theme
- Limpe localStorage e tente novamente

### Prisma errors após migration
```bash
# Regenerar client
cd hpo-platform-backend
npx prisma generate

# Reiniciar backend
npm run dev
```

### Testes falhando
```bash
# Limpar cache
npm run test:clear

# Reinstalar dependências
rm -rf node_modules
npm install

# Rodar novamente
npm run test
```

### Recharts não renderiza
- Verifique instalação: `npm list recharts`
- Verifique dados mockados na API
- Console: errors de renderização

---

## 📝 Relatório de Bugs (Template)

```markdown
## Bug Report

**Data**: YYYY-MM-DD
**Testador**: Nome
**Severidade**: Alta/Média/Baixa

### Descrição
[Descreva o problema]

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[O que deveria acontecer]

### Actual Behavior
[O que aconteceu]

### Screenshots
[Anexe prints]

### Environment
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Version: 
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Logs
```
[Cole logs relevantes]
```
```

---

## ✅ Sign-off Final

**Testado por**: ___________________  
**Data**: ___________________  
**Status**: ☐ Pass ☐ Fail ☐ Partial  
**Notas**: 

---

**Última atualização**: Outubro 2025  
**Versão do documento**: 1.0
