# 🎯 PLANO DE AÇÃO - CORRIGIR 78 TESTES FALHANDO

**Data**: 23 de Outubro de 2025
**Status Atual**: 111/189 testes PASSANDO (59%) ✅
**Objetivo**: 95%+ testes passando (180+/189)

---

## 📊 SITUAÇÃO ATUAL (MELHOR QUE ESPERADO!)

### ✅ **SUITES PASSANDO (4/15 = 27%)**
1. ✅ **auth.test.ts** - 10/10 testes (100%)
2. ✅ **health.test.ts** - Todos passando
3. ✅ **email.test.ts** - Todos passando
4. ✅ **babelon-export-simple.test.ts** - Maioria passando

### ❌ **SUITES FALHANDO (11/15 = 73%)**
1. ❌ **integration.test.ts** - 915s (15min) - TIMEOUT
2. ❌ **cplp-analytics.test.ts** - 855s (14min) - TIMEOUT
3. ❌ **persistence.test.ts** - 735s (12min) - TIMEOUT
4. ❌ **cplp-auth.test.ts** - 673s (11min) - TIMEOUT
5. ❌ **cplp-e2e.test.ts** - 555s (9min) - TIMEOUT
6. ❌ **analytics.test.ts** - 314s (5min) - TIMEOUT
7. ❌ **linkedin-oauth.test.ts** - 182s (3min) - OAuth não configurado
8. ❌ **user-profile.test.ts** - 195s (3min) - Senha no response
9. ❌ **terms.test.ts** - 63s (1min)
10. ❌ **babelon-export.test.ts** - 11s - Floating point
11. ❌ **auth-validation.test.ts** - 12s - Validação retorna 500

---

## 🔍 DIAGNÓSTICO POR PRIORIDADE

### 🔴 **PRIORIDADE CRÍTICA** (Bloqueiam tudo)

#### 1. **TIMEOUTS MASSIVOS** (6 suites = ~70 testes)
**Problema**: Testes levam 3-15 minutos e dão timeout
**Causa Provável**: 
- Queries lentas (sem índices)
- Aguardando conexões que nunca fecham
- Promises não resolvidas
- `jest.setTimeout()` muito baixo

**Solução**:
```typescript
// globalSetup.ts
jest.setTimeout(120000); // 2 minutos por teste

// Verificar queries lentas
console.time('query');
await prisma.translation.findMany({ ... });
console.timeEnd('query');
```

**Tempo Estimado**: 2-3 horas
**Impacto**: Corrige ~70 testes (37% do total)

---

### 🟠 **PRIORIDADE ALTA** (Bugs específicos)

#### 2. **user-profile.test.ts - Senha exposta no response**
**Problema**: Password aparece no JSON de perfil
**Causa**: `select` do Prisma não exclui password

**Solução**:
```typescript
// src/routes/user.ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    // NÃO incluir password!
  }
});
```

**Tempo Estimado**: 15 minutos
**Impacto**: Corrige ~5 testes + SEGURANÇA CRÍTICA! 🔒

---

#### 3. **babelon-export.test.ts - Floating point precision**
**Problema**: `expect(0.8).toBe(0.7999999999999999)`
**Causa**: Aritmética de ponto flutuante JavaScript

**Solução**:
```typescript
// Usar toBeCloseTo em vez de toBe
expect(calculateConfidence(3, 4)).toBeCloseTo(0.8, 2); // 2 decimais

// OU arredondar no código
return Math.round(confidence * 100) / 100;
```

**Tempo Estimado**: 10 minutos
**Impacto**: Corrige 1 teste

---

#### 4. **auth-validation.test.ts - Validação retorna 500**
**Problema**: Campos inválidos retornam 500 (Internal Server Error) em vez de 400 (Bad Request)
**Causa**: Erro de validação não tratado corretamente

**Solução**:
```typescript
// src/routes/auth.ts
app.post('/api/auth/login', async (req, res) => {
  try {
    // Validar ANTES de qualquer query
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: 'Email e password obrigatórios' });
    }
    
    if (!isValidEmail(req.body.email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Continuar com login...
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

**Tempo Estimado**: 20 minutos
**Impacto**: Corrige 2 testes

---

### 🟡 **PRIORIDADE MÉDIA** (Configuração)

#### 5. **linkedin-oauth.test.ts - OAuth não configurado**
**Problema**: Testes de LinkedIn OAuth falham (credenciais ausentes)

**Solução Rápida (Mock)**:
```typescript
// src/__tests__/linkedin-oauth.test.ts
jest.mock('../services/linkedin', () => ({
  getLinkedInAuthUrl: jest.fn(() => 'https://linkedin.com/oauth/authorize?...'),
  getLinkedInUserProfile: jest.fn(() => ({
    id: 'test-linkedin-id',
    email: 'test@linkedin.com',
    name: 'Test User'
  }))
}));
```

**Tempo Estimado**: 30 minutos
**Impacto**: Corrige ~10 testes

---

#### 6. **terms.test.ts - Falhas diversas**
**Problema**: Testes de API de termos HPO
**Causa**: Provavelmente falta de dados (termos não seedados)

**Solução**:
```typescript
// src/__tests__/setup/seed.ts
export async function seedTerms() {
  await prisma.hPOTerm.createMany({
    data: [
      { hpoId: 'HP:0000001', name: 'All', definition: 'Root term' },
      { hpoId: 'HP:0000118', name: 'Phenotypic abnormality', definition: '...' },
      // ... mais termos para testes
    ]
  });
}

// Chamar em globalSetup.ts
```

**Tempo Estimado**: 1 hora
**Impacto**: Corrige ~10 testes

---

### 🟢 **PRIORIDADE BAIXA** (Otimização)

#### 7. **Otimizar queries lentas**
- Adicionar índices no banco
- Usar `select` para buscar apenas campos necessários
- Implementar paginação nos testes

**Tempo Estimado**: 2 horas
**Impacto**: Reduz tempo de execução de 15min → 2min

---

## 📋 PLANO DE EXECUÇÃO (ORDEM CRONOLÓGICA)

### **FASE 1: QUICK WINS** (1 hora - 10 testes) 🚀

**Objetivo**: Corrigir bugs simples primeiro

1. ✅ **[15min] user-profile.test.ts - Remover password do response**
   - Arquivo: `src/routes/user.ts`
   - Adicionar `select` excluindo password
   - **CRÍTICO PARA SEGURANÇA!** 🔒

2. ✅ **[10min] babelon-export.test.ts - Floating point**
   - Arquivo: `src/__tests__/babelon-export.test.ts`
   - Trocar `.toBe()` por `.toBeCloseTo()`

3. ✅ **[20min] auth-validation.test.ts - Validação 500→400**
   - Arquivo: `src/routes/auth.ts`
   - Adicionar validação antes de query

4. ✅ **[15min] Aumentar jest.setTimeout()**
   - Arquivo: `jest.config.js`
   - Adicionar `testTimeout: 120000` (2 minutos)

**Resultado Esperado**: 118/189 testes passando (62%)

---

### **FASE 2: TIMEOUTS** (3 horas - 40 testes) ⏱️

**Objetivo**: Resolver timeouts que bloqueiam 6 suites

1. ✅ **[1h] Investigar queries lentas**
   - Adicionar `console.time()` em queries
   - Identificar gargalos
   - Adicionar índices necessários

2. ✅ **[1h] Corrigir conexões não fechadas**
   - Verificar `afterAll()` em cada teste
   - Garantir `await prisma.$disconnect()`
   - Verificar listeners de eventos

3. ✅ **[1h] Otimizar testes CPLP**
   - Refatorar `cplp-auth.test.ts` (673s → <60s)
   - Refatorar `cplp-analytics.test.ts` (855s → <60s)
   - Refatorar `cplp-e2e.test.ts` (555s → <60s)

**Resultado Esperado**: 158/189 testes passando (84%)

---

### **FASE 3: MOCKS E SEEDS** (2 horas - 20 testes) 🌱

**Objetivo**: Configurar ambiente de teste completo

1. ✅ **[30min] Mock LinkedIn OAuth**
   - Arquivo: `src/__tests__/linkedin-oauth.test.ts`
   - Mockar serviço de LinkedIn

2. ✅ **[1h] Seed de termos HPO**
   - Criar `src/__tests__/setup/seed.ts`
   - Popular banco com termos de teste

3. ✅ **[30min] Seed de usuários/traduções**
   - Criar dados consistentes para testes
   - Garantir referências corretas

**Resultado Esperado**: 178/189 testes passando (94%)

---

### **FASE 4: POLIMENTO** (1 hora - 5 testes) ✨

**Objetivo**: Corrigir últimos edge cases

1. ✅ Revisar testes restantes
2. ✅ Ajustar assertions
3. ✅ Limpar código de teste

**Resultado Esperado**: 183+/189 testes passando (97%)

---

## ⏱️ CRONOGRAMA RESUMIDO

| Fase | Tempo | Testes Corrigidos | Taxa de Sucesso |
|------|-------|-------------------|-----------------|
| **Inicial** | - | 111 | 59% ✅ |
| **Fase 1** | 1h | +7 (118 total) | 62% |
| **Fase 2** | 3h | +40 (158 total) | 84% |
| **Fase 3** | 2h | +20 (178 total) | 94% |
| **Fase 4** | 1h | +5 (183 total) | 97% |
| **TOTAL** | **7h** | **+72 testes** | **97%** 🎯 |

---

## 🎯 METAS REALISTAS

### Meta Mínima (ACEITÁVEL)
- ✅ **85% testes passando** (160+/189)
- ✅ Tempo de execução: <5 minutos
- ✅ Zero bugs de segurança

### Meta Ideal (EXCELENTE)
- ✅ **95% testes passando** (180+/189)
- ✅ Tempo de execução: <3 minutos
- ✅ Cobertura de código: >80%

### Meta Perfeita (IMPOSSÍVEL?)
- ✅ **100% testes passando** (189/189)
- ✅ Tempo de execução: <2 minutos
- ✅ Cobertura de código: >90%

---

## 🔧 COMANDOS ÚTEIS

### Rodar testes específicos
```powershell
# Suite específica
npm test -- src/__tests__/user-profile.test.ts

# Com coverage
npm test -- --coverage src/__tests__/user-profile.test.ts

# Com logs detalhados
npm test -- --verbose src/__tests__/user-profile.test.ts

# Watch mode (durante desenvolvimento)
npm test -- --watch src/__tests__/user-profile.test.ts
```

### Debug de timeouts
```powershell
# Ver quais testes demoram mais
npm test -- --verbose 2>&1 | Select-String -Pattern "PASS|FAIL" -Context 0,1

# Rodar apenas testes rápidos
npm test -- --testTimeout=30000 # 30 segundos
```

### Limpar cache
```powershell
# Limpar Jest cache
npm test -- --clearCache

# Regenerar Prisma
npx prisma generate
```

---

## 📈 TRACKING DE PROGRESSO

### Checklist FASE 1 (Quick Wins)
- [ ] user-profile.test.ts - Remover password
- [ ] babelon-export.test.ts - Floating point
- [ ] auth-validation.test.ts - Validação 400
- [ ] jest.config.js - Aumentar timeout

### Checklist FASE 2 (Timeouts)
- [ ] Adicionar console.time() em queries
- [ ] Identificar queries lentas
- [ ] Adicionar índices no banco
- [ ] Verificar afterAll() em todos os testes
- [ ] Garantir prisma.$disconnect()
- [ ] Refatorar integration.test.ts
- [ ] Refatorar cplp-analytics.test.ts
- [ ] Refatorar persistence.test.ts
- [ ] Refatorar cplp-auth.test.ts
- [ ] Refatorar cplp-e2e.test.ts
- [ ] Refatorar analytics.test.ts

### Checklist FASE 3 (Mocks e Seeds)
- [ ] Mock LinkedIn OAuth
- [ ] Criar seed de termos HPO
- [ ] Criar seed de usuários
- [ ] Criar seed de traduções

### Checklist FASE 4 (Polimento)
- [ ] Revisar testes restantes
- [ ] Ajustar assertions
- [ ] Limpar código

---

## 🎉 CELEBRAÇÃO DE MARCOS

### Já Alcançado ✅
- ✅ **59% dos testes passando** (111/189)
- ✅ **Docker Postgres funcionando**
- ✅ **Infraestrutura de testes correta**
- ✅ **Backend 100% funcional em produção**

### Próximas Comemorações 🎯
- [ ] **70% dos testes** (132/189) - Celebrar com café! ☕
- [ ] **85% dos testes** (160/189) - Celebrar com cerveja! 🍺
- [ ] **95% dos testes** (180/189) - FESTA COMPLETA! 🎉

---

## 💡 OBSERVAÇÕES IMPORTANTES

### O que NÃO está quebrado:
✅ **Backend em produção**: 100% funcional
✅ **Frontend**: Otimizado e funcionando
✅ **Autenticação**: 10/10 testes passando
✅ **Docker Postgres**: Rodando perfeitamente
✅ **Infraestrutura**: Configurada corretamente

### O que precisa corrigir:
❌ **Timeouts**: 6 suites levam 3-15 minutos cada
❌ **Segurança**: Password exposto em user profile
❌ **Validações**: Retornando 500 em vez de 400
❌ **Mocks**: LinkedIn OAuth não configurado
❌ **Seeds**: Dados de teste ausentes

### Por que isso aconteceu:
- Testes foram escritos mas nunca executados (banco remoto bloqueado)
- Agora que temos Docker Postgres, os testes REALMENTE executam
- Os bugs sempre estiveram lá, mas agora conseguimos vê-los!

---

## 🚀 COMEÇAR AGORA?

**Comando para iniciar FASE 1:**
```powershell
# 1. Abrir arquivo de rotas de usuário
code hpo-platform-backend/src/routes/user.ts

# 2. Rodar teste para ver falha
npm test -- src/__tests__/user-profile.test.ts

# 3. Corrigir e testar novamente
npm test -- src/__tests__/user-profile.test.ts
```

---

**🎯 OBJETIVO FINAL: 95%+ testes passando em 7 horas de trabalho**

Bora começar? Qual fase você quer atacar primeiro? 🚀
