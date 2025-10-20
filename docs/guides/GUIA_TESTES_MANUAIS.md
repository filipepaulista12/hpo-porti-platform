# 🧪 Guia de Testes Manuais - Sistema de Permissões

**Data:** 17 de Outubro de 2025  
**Objetivo:** Validar sistema de permissões implementado no frontend

---

## 🚀 Passo 1: Iniciar Backend e Frontend

### Backend
```powershell
# Terminal 1
cd hpo-platform-backend
npm run dev
```

Aguarde até ver:
```
✅ Servidor rodando em http://localhost:3001
✅ Conectado ao PostgreSQL
```

### Frontend
```powershell
# Terminal 2
cd plataforma-raras-cpl
npm run dev
```

Aguarde até ver:
```
✅ Local: http://localhost:5173
```

---

## 👤 Passo 2: Usuários de Teste Criados

| Role | Email | Senha | O que DEVE ver |
|------|-------|-------|----------------|
| **TRANSLATOR** | translator@test.com | Test123! | ❌ NÃO vê botões admin |
| **MODERATOR** | moderator@test.com | Test123! | ✅ Vê "Rejeitar" ❌ Não vê "Aprovar" |
| **ADMIN** | admin@test.com | Test123! | ✅ Vê TUDO |

---

## 🧪 Passo 3: Testes

### ✅ TESTE 1: Usuário TRANSLATOR

1. **Abrir navegador:** http://localhost:5173
2. **Login:**
   - Email: `translator@test.com`
   - Senha: `Test123!`

3. **Verificações:**
   - [ ] ❌ NÃO deve ver botão "👑 Admin" no menu superior
   - [ ] ✅ Deve ver: Dashboard, Traduzir, Revisar, Ranking, etc
   - [ ] ✅ Pode navegar normalmente pela aplicação

4. **Tentar acessar Admin (via URL direta):**
   - Digite na URL: `http://localhost:5173/#admin`
   - [ ] ✅ Deve ver tela bonita de "🔒 Acesso Restrito"
   - [ ] ✅ Mensagem deve mostrar: "Seu perfil: Tradutor"
   - [ ] ✅ Mensagem deve mostrar: "Perfil necessário: Moderador ou superior"

5. **Ir para uma tradução pendente:**
   - Clicar em "Revisar"
   - Selecionar uma tradução
   - [ ] ❌ NÃO deve ver botões "Aprovar" ou "Rejeitar"
   - [ ] ✅ Deve ver mensagem: "ℹ️ Apenas moderadores podem..."

**Status TESTE 1:** 
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (detalhe: _______________)

---

### ✅ TESTE 2: Usuário MODERATOR

1. **Logout** (clicar no nome do usuário → Logout)

2. **Login:**
   - Email: `moderator@test.com`
   - Senha: `Test123!`

3. **Verificações:**
   - [ ] ✅ DEVE ver botão "👑 Admin" no menu superior
   - [ ] ✅ Clicar em "👑 Admin" → deve abrir painel administrativo

4. **No Painel Admin:**
   - [ ] ✅ Deve ver lista de traduções pendentes
   - [ ] ✅ Para cada tradução, deve ver botão "❌ Rejeitar"
   - [ ] ❌ NÃO deve ver botão "✅ Aprovar Tradução"
   - [ ] ✅ Se não tiver permissão, deve ver: "ℹ️ Você não tem permissão para moderar traduções"

5. **Testar botão Rejeitar:**
   - Clicar em "❌ Rejeitar" em uma tradução
   - [ ] ✅ Deve abrir modal de confirmação
   - [ ] ✅ Deve funcionar normalmente (MODERATOR pode rejeitar)

**Status TESTE 2:**
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (detalhe: _______________)

---

### ✅ TESTE 3: Usuário ADMIN

1. **Logout**

2. **Login:**
   - Email: `admin@test.com`
   - Senha: `Test123!`

3. **Verificações:**
   - [ ] ✅ DEVE ver botão "👑 Admin" no menu
   - [ ] ✅ Clicar em "👑 Admin" → painel administrativo abre

4. **No Painel Admin:**
   - [ ] ✅ Deve ver lista de traduções pendentes
   - [ ] ✅ Para cada tradução, deve ver AMBOS os botões:
     - [ ] ✅ "✅ Aprovar Tradução"
     - [ ] ✅ "❌ Rejeitar"

5. **Testar botão Aprovar:**
   - Clicar em "✅ Aprovar Tradução"
   - [ ] ✅ Deve abrir modal de confirmação
   - [ ] ✅ Modal mostra detalhes da tradução
   - [ ] ✅ Botão "Confirmar Aprovação" funciona

6. **Testar botão Rejeitar:**
   - Clicar em "❌ Rejeitar"
   - [ ] ✅ Deve abrir modal de confirmação
   - [ ] ✅ Campo para motivo da rejeição
   - [ ] ✅ Botão "Confirmar Rejeição" funciona

**Status TESTE 3:**
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (detalhe: _______________)

---

### ✅ TESTE 4: Navegação entre Roles

1. **Login como TRANSLATOR** → Verificar que não vê admin
2. **Logout → Login como MODERATOR** → Verificar que vê admin parcial
3. **Logout → Login como ADMIN** → Verificar que vê admin completo
4. **Voltar para TRANSLATOR** → Verificar novamente

**Objetivo:** Garantir que as permissões mudam corretamente ao trocar de usuário

**Status TESTE 4:**
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (detalhe: _______________)

---

### ✅ TESTE 5: Tentativa de Burla (Segurança)

1. **Login como TRANSLATOR**

2. **Abrir Console do Navegador (F12)**

3. **Tentar forçar acesso via JavaScript:**
   ```javascript
   window.location.href = '/#admin';
   ```

4. **Verificações:**
   - [ ] ✅ Página muda para /#admin
   - [ ] ✅ MAS mostra tela "🔒 Acesso Restrito"
   - [ ] ✅ NÃO mostra conteúdo do AdminDashboard
   - [ ] ✅ Botão "Voltar" funciona

5. **Tentar chamar API diretamente (Console):**
   ```javascript
   fetch('http://localhost:3001/api/admin/translations/pending', {
     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
   }).then(r => r.json()).then(console.log)
   ```

6. **Verificações:**
   - [ ] ✅ Backend deve retornar erro 403 Forbidden
   - [ ] ✅ Mensagem: "Access denied. Required role: MODERATOR..."

**Status TESTE 5 (Segurança):**
- [ ] ✅ PASSOU - Sistema seguro
- [ ] ❌ FALHOU - VULNERABILIDADE DETECTADA!

---

## 📊 Resumo Final

| Teste | Status | Observações |
|-------|--------|-------------|
| TESTE 1: TRANSLATOR | [ ] ✅ / [ ] ❌ | |
| TESTE 2: MODERATOR | [ ] ✅ / [ ] ❌ | |
| TESTE 3: ADMIN | [ ] ✅ / [ ] ❌ | |
| TESTE 4: Navegação | [ ] ✅ / [ ] ❌ | |
| TESTE 5: Segurança | [ ] ✅ / [ ] ❌ | |

---

## 🐛 Problemas Encontrados

Se encontrar algum problema, anote aqui:

### Problema 1:
- **O que:** 
- **Quando:** 
- **Esperado:** 
- **Obtido:** 
- **Severidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

### Problema 2:
- **O que:** 
- **Quando:** 
- **Esperado:** 
- **Obtido:** 
- **Severidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

---

## ✅ Checklist Pré-Teste

Antes de começar, verificar:

- [ ] Backend rodando em http://localhost:3001
- [ ] Frontend rodando em http://localhost:5173
- [ ] Usuários de teste criados (executou `npx ts-node scripts/create-test-users.ts`)
- [ ] Banco de dados com dados de teste
- [ ] Navegador aberto (Chrome ou Firefox recomendado)
- [ ] Console do navegador acessível (F12)

---

## 📸 Screenshots Recomendados

Para documentação, tirar prints de:

1. ✅ TRANSLATOR vendo interface sem botões admin
2. ✅ TRANSLATOR vendo tela "Acesso Restrito"
3. ✅ MODERATOR vendo painel admin com botão "Rejeitar" apenas
4. ✅ ADMIN vendo painel admin com ambos botões "Aprovar" e "Rejeitar"
5. ✅ Console mostrando erro 403 ao tentar API admin como TRANSLATOR

---

## 🎯 Critérios de Sucesso

Para considerar a implementação APROVADA, todos os seguintes devem ser verdadeiros:

- [ ] ✅ TRANSLATOR não vê botões admin em lugar nenhum
- [ ] ✅ MODERATOR vê "Rejeitar" mas NÃO vê "Aprovar"
- [ ] ✅ ADMIN vê TODOS os botões administrativos
- [ ] ✅ Tela "Acesso Restrito" aparece quando necessário
- [ ] ✅ Backend bloqueia requisições não autorizadas (403)
- [ ] ✅ Mensagens de erro são claras e em português
- [ ] ✅ Interface é intuitiva e profissional
- [ ] ✅ Zero bugs visuais ou funcionais

---

## 📞 Suporte

Se tiver dúvidas ou encontrar problemas:

1. Verificar logs do console (F12)
2. Verificar logs do backend no terminal
3. Consultar documentação em `docs/features/PERMISSOES_FRONTEND.md`
4. Verificar código em `src/utils/RoleHelpers.ts`

---

**Data do Teste:** ___/___/______  
**Testador:** __________________  
**Resultado Final:** [ ] ✅ APROVADO [ ] ❌ REPROVADO
