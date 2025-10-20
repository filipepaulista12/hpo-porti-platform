# ⚡ Comandos Rápidos - Testar Features Localmente

## 🚀 Início Rápido

### 1️⃣ Iniciar Backend
```powershell
cd c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend
npm run dev
```

**Deve aparecer:**
```
✅ Server running on http://localhost:3001
✅ Database connected
```

### 2️⃣ Iniciar Frontend
```powershell
# Novo terminal
cd c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl
npm run dev
```

**Deve aparecer:**
```
➜ Local: http://localhost:5173/
```

### 3️⃣ Abrir no Navegador
```
http://localhost:5173
```

---

## 🧪 Testar Filtros de Busca

### Passo a Passo:
1. **Login** com qualquer usuário
2. Clicar em **"Traduzir Termos"** no menu
3. Procurar botão **"Filtros Avançados"** (com ícone de funil 🔍)
4. Clicar para expandir painel de filtros
5. **Testar filtro por categoria:**
   - Selecionar "Abnormality of the nervous system" 🧠
   - Ver lista atualizar com apenas termos dessa categoria
6. **Testar filtro por status:**
   - Selecionar "✅ Aprovado"
   - Ver lista atualizar com apenas termos aprovados
7. **Combinar filtros:**
   - Categoria: "Abnormality of the cardiovascular system" ❤️
   - Status: "❌ Não Traduzido"
   - Ver badge contador mostrando "2"
8. **Limpar filtros:**
   - Clicar em "🗑️ Limpar Todos os Filtros"
   - Ver lista voltar ao estado original

### ✅ Checklist de Validação:
- [ ] Painel de filtros expande/recolhe suavemente
- [ ] Dropdown de categorias tem 25 opções
- [ ] Dropdown de status tem 4 opções
- [ ] Badge contador aparece quando filtros ativos
- [ ] Lista atualiza instantaneamente ao mudar filtros
- [ ] Botão "Limpar" remove todos os filtros
- [ ] Busca + filtros funcionam juntos
- [ ] Paginação reseta ao mudar filtros
- [ ] Dark mode funciona corretamente

---

## 🎯 Testar Sistema de Recomendações

### Passo a Passo:

#### Preparação (se usuário não tem specialty):
```sql
-- Abrir Prisma Studio
cd hpo-platform-backend
npx prisma studio

-- Ou via SQL direto
SELECT * FROM "User" WHERE email = 'seu-email@test.com';

UPDATE "User" 
SET specialty = 'Abnormality of the nervous system', 
    level = 2
WHERE email = 'seu-email@test.com';
```

#### Teste da Feature:
1. **Login** com usuário que tem `specialty` definido
2. Ir para **Dashboard** (página inicial após login)
3. Rolar página para baixo (logo após estatísticas globais)
4. Procurar seção **"🎯 Recomendados para Você"**
5. **Verificar cards:**
   - Deve mostrar até 10 termos
   - Cada card tem badge "#1 PRIORIDADE", "#2 PRIORIDADE", etc.
   - Cores de dificuldade: 🟢 🟡 🟠 🔴
   - Badges de razões: 🎓 Sua especialidade, ⭐ Nível adequado
6. **Clicar em "✨ Traduzir Agora":**
   - Deve navegar para página de tradução
   - Termo deve aparecer pré-selecionado
   - Formulário deve estar pronto para traduzir
7. **Testar botão refresh (🔄):**
   - Clicar no botão no canto superior direito da seção
   - Ver loading aparecer
   - Ver lista atualizar

### ✅ Checklist de Validação:
- [ ] Seção aparece no Dashboard (entre stats e action cards)
- [ ] Título mostra especialidade do usuário
- [ ] Mostra até 10 termos recomendados
- [ ] Cards têm gradiente purple-to-blue
- [ ] Badges de prioridade numerados (#1, #2, #3...)
- [ ] Cores de dificuldade corretas (verde/amarelo/laranja/vermelho)
- [ ] Badges de razões aparecem (especialidade, nível, sem tradução)
- [ ] Botão "Traduzir Agora" funciona
- [ ] Redirecionamento para página de tradução funciona
- [ ] Termo correto é pré-selecionado
- [ ] Botão refresh (🔄) atualiza lista
- [ ] Loading state aparece corretamente
- [ ] Empty state aparece quando não há recomendações
- [ ] Error state aparece e permite retry
- [ ] Dark mode funciona

---

## 🐛 Troubleshooting

### Problema: "Backend não conecta"
```powershell
# Verificar se porta 3001 está livre
netstat -ano | findstr :3001

# Se ocupada, matar processo
taskkill /PID <PID> /F

# Reiniciar backend
cd hpo-platform-backend
npm run dev
```

### Problema: "Frontend não carrega"
```powershell
# Limpar cache
cd plataforma-raras-cpl
rm -rf node_modules/.vite
npm run dev
```

### Problema: "Categorias não carregam (filtros vazios)"
```powershell
# Testar endpoint manualmente
curl -H "Authorization: Bearer <seu-token>" http://localhost:3001/api/terms/categories

# Se erro, regenerar Prisma client
cd hpo-platform-backend
npx prisma generate
npm run dev
```

### Problema: "Recomendações vazias"
**Causa 1:** Usuário não tem `specialty` definido
```sql
-- Verificar
SELECT id, name, specialty, level FROM "User" WHERE email = 'seu-email@test.com';

-- Corrigir
UPDATE "User" SET specialty = 'Abnormality of the nervous system', level = 2 
WHERE email = 'seu-email@test.com';
```

**Causa 2:** Todos os termos da especialidade já foram traduzidos
```sql
-- Ver quantos termos não traduzidos existem para a especialidade
SELECT COUNT(*) FROM "HpoTerm" 
WHERE category = 'Abnormality of the nervous system' 
AND "translationStatus" IN ('NOT_TRANSLATED', 'PENDING_REVIEW');
```

### Problema: "CORS error"
**Solução:** Verificar se backend está rodando em `http://localhost:3001`
```powershell
# Backend
cd hpo-platform-backend
npm run dev

# Verificar .env do frontend
cat plataforma-raras-cpl\.env
# Deve ter: VITE_API_URL=http://localhost:3001
```

---

## 📊 Comandos de Verificação

### Backend Health Check
```powershell
# Testar se API está respondendo
curl http://localhost:3001/api/health

# Testar autenticação
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/users/me

# Testar endpoint de categorias
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/terms/categories

# Testar endpoint de recomendações
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/terms/recommended/for-me
```

### Database Check
```powershell
cd hpo-platform-backend
npx prisma studio
# Abre interface gráfica em http://localhost:5555
```

### Ver Logs do Backend
```powershell
cd hpo-platform-backend
npm run dev
# Deixar terminal aberto para ver logs em tempo real
```

---

## 🎬 Fluxo Completo de Teste (15 minutos)

### Minuto 0-2: Setup
- [ ] Abrir 2 terminais PowerShell
- [ ] Terminal 1: Iniciar backend (`cd hpo-platform-backend && npm run dev`)
- [ ] Terminal 2: Iniciar frontend (`cd plataforma-raras-cpl && npm run dev`)
- [ ] Abrir navegador em `http://localhost:5173`

### Minuto 2-5: Login e Preparação
- [ ] Fazer login com usuário de teste
- [ ] Verificar se usuário tem `specialty` (via Prisma Studio)
- [ ] Se não tiver, atualizar via SQL

### Minuto 5-10: Testar Filtros
- [ ] Ir para página "Traduzir"
- [ ] Abrir "Filtros Avançados"
- [ ] Testar cada filtro individualmente
- [ ] Testar combinação de filtros
- [ ] Testar botão "Limpar"
- [ ] Testar busca + filtros juntos

### Minuto 10-15: Testar Recomendações
- [ ] Voltar para Dashboard
- [ ] Localizar seção "🎯 Recomendados para Você"
- [ ] Verificar cards de recomendação
- [ ] Clicar em "Traduzir Agora" em um card
- [ ] Verificar redirecionamento
- [ ] Voltar ao Dashboard
- [ ] Testar botão refresh (🔄)

### Minuto 15: Validação Final
- [ ] Testar dark mode (se tiver toggle)
- [ ] Testar em mobile (redimensionar janela)
- [ ] Verificar se não há erros no console do navegador (F12)
- [ ] ✅ **TUDO FUNCIONANDO!**

---

## 📸 O que Esperar Ver

### Filtros de Busca:
```
┌─────────────────────────────────────┐
│ 🔍 Buscar por HPO ID ou nome...    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔍 Filtros Avançados          [2] ▼ │ ← Badge contador
└─────────────────────────────────────┘
  ↓ Expandido:
  ┌───────────────────┬───────────────┐
  │ 📂 Categoria HPO  │ 🎯 Status     │
  │ [Dropdown 25]     │ [Dropdown 4]  │
  └───────────────────┴───────────────┘
  ┌─────────────────────────────────────┐
  │ 🗑️ Limpar Todos os Filtros         │
  └─────────────────────────────────────┘
```

### Sistema de Recomendações:
```
┌──────────────────────────────────────────────┐
│ 🎯 Recomendados para Você              🔄   │
│ Baseado na sua especialidade: Nervous... • Nível 2 │
├──────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ #1 PRIOR │ │ #2 PRIOR │ │ #3 PRIOR │      │
│ │ 🟢 Fácil │ │ 🟡 Médio │ │ 🟠 Difíc.│      │
│ │ HP:00001 │ │ HP:00002 │ │ HP:00003 │      │
│ │ Seizure  │ │ Migraine │ │ Stroke   │      │
│ │ 🎓 Sua   │ │ ⭐ Nível │ │ 🆕 Sem   │      │
│ │ especial │ │ adequado │ │ tradução │      │
│ │ [Traduz] │ │ [Traduz] │ │ [Traduz] │      │
│ └──────────┘ └──────────┘ └──────────┘      │
└──────────────────────────────────────────────┘
```

---

## ✅ Resultado Esperado

Após testes completos:
- ✅ Filtros funcionando 100%
- ✅ Recomendações personalizadas aparecendo
- ✅ Redirecionamentos funcionando
- ✅ UI responsiva e bonita
- ✅ Sem erros no console
- ✅ Dark mode funcionando
- ✅ Performance boa (carregamento rápido)

---

**Próximo passo:** Decidir nome da plataforma (Task #5) 🏷️
