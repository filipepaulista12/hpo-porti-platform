# 🐛 Analytics System - Debug Status

**Data**: 18 de Outubro de 2025  
**Status**: ⚠️ Sistema implementado mas com problemas de integração

---

## ✅ O que foi implementado

### 1. **Database Schemas** (100% Completo)
- ✅ `SessionLog` model: 17 campos (IP, geolocation, device, session data)
- ✅ `UserAnalytics` model: 15 campos (engagement, patterns, performance)
- ✅ `ApiMetrics` model: 9 campos (endpoint tracking, errors)
- ✅ Relações adicionadas no User model
- ✅ Database sincronizado com `npx prisma db push`
- ✅ Prisma Client regenerado (v5.22.0)

**Tabelas criadas no PostgreSQL**:
```sql
session_logs       -- 17 colunas
user_analytics     -- 15 colunas
api_metrics        -- 9 colunas
```

### 2. **Analytics Middleware** (95% Completo)
**Arquivo**: `src/middleware/analytics.middleware.ts` (245 linhas)

**Funcionalidades implementadas**:
- ✅ Coleta automática de IP (x-forwarded-for + fallback)
- ✅ GeoIP lookup (país, cidade, latitude, longitude)
- ✅ User-Agent parsing (browser, OS, device type)
- ✅ Session tracking em memória (Map<sessionKey, ActiveSession>)
- ✅ Timing de resposta (res.on('finish'))
- ✅ API metrics logging assíncrono
- ✅ Cleanup de sessões inativas (30min timeout, 5min interval)
- ✅ Graceful shutdown handler (SIGTERM)

**Dependências instaladas**:
```json
{
  "geoip-lite": "^1.4.10",
  "ua-parser-js": "^1.0.38",
  "@types/geoip-lite": "^1.4.x",
  "@types/ua-parser-js": "^0.7.x"
}
```

### 3. **Analytics API Endpoints** (100% Completo)
**Arquivo**: `src/routes/analytics.routes.ts` (370 linhas)

**Endpoints implementados**:

#### GET `/api/analytics/dashboard`
Query params: `startDate`, `endDate`

**11 métricas retornadas**:
1. `activeUsers24h` - Usuários ativos nas últimas 24h
2. `translationsPerDay` - Traduções agrupadas por dia (raw SQL)
3. `usersByCountry` - Top 10 países (via SessionLog)
4. `deviceDistribution` - Mobile/tablet/desktop counts
5. `avgSessionDuration` - Duração média de sessão
6. `topTranslators` - Top 10 tradutores por pontos
7. `avgResponseTime` - Tempo médio de resposta da API
8. `levelDistribution` - Distribuição de usuários por nível
9. `retentionRate` - Taxa de retenção (%)
10. `browserDistribution` - Top 5 navegadores
11. `translationsByStatus` - Traduções por status

#### GET `/api/analytics/heatmap`
Query params: `days` (default: 30)

**Retorna**: Matriz de atividade por hora (0-23) e dia da semana (0-6)

#### GET `/api/analytics/user/:userId`
**Retorna**: UserAnalytics + últimas 10 sessões do usuário específico

**Segurança**: Todos endpoints protegidos com `requireRole(['ADMIN', 'SUPER_ADMIN'])`

---

## ❌ Problemas Identificados

### **Problema 1: Middleware bloqueando servidor**
**Sintoma**: Servidor inicia mas não responde a requisições (nem `/health`)

**Causa provável**: 
1. Middleware interceptando TODAS as requests (incluindo /health)
2. Possível problema com `res.on('finish')` não sendo chamado corretamente
3. Session tracking pode estar travando em algum edge case

**Solução temporária aplicada**:
```typescript
// server.ts - linha 78
// NOTE: Desabilitado temporariamente para testes
// app.use(analyticsMiddleware);
```

### **Problema 2: TypeScript errors (falsos positivos)**
**Sintoma**: VS Code mostrando erros de tipos do Prisma Client

```
Property 'apiMetrics' does not exist on type 'PrismaClient'
Property 'sessionLog' does not exist on type 'PrismaClient'
Property 'userAnalytics' does not exist on type 'PrismaClient'
```

**Causa**: TypeScript language server não recarregou após `npx prisma generate`

**Solução**: Recarregar VS Code window (Ctrl+Shift+P → "Reload Window")

### **Problema 3: requireRole signature incorreta**
**Sintoma**: TypeScript error em analytics.routes.ts

```typescript
requireRole(['ADMIN', 'SUPER_ADMIN']) // ❌ Argument of type 'string[]' not assignable
```

**Causa**: `requireRole` espera `UserRole` ou `UserRole[]`, não `string[]`

**Solução**: Verificar tipo em `src/middleware/permissions.ts`

---

## 🔧 Próximos Passos (Debug)

### **1. Isolar o problema do middleware** (15 min)

**Teste A**: Servidor sem middleware
```typescript
// server.ts - manter comentado
// app.use(analyticsMiddleware);
```
✅ Testar: `curl http://localhost:3001/health`
✅ Testar: Login com admin

**Teste B**: Middleware simplificado
Criar `analytics.middleware.simple.ts`:
```typescript
export const analyticsMiddleware = (req, res, next) => {
  console.log(`[Analytics] ${req.method} ${req.path}`);
  next(); // Apenas log, sem coleta
};
```

**Teste C**: Ativar coleta gradualmente
1. Apenas IP e User-Agent ✓
2. Adicionar GeoIP lookup ✓
3. Adicionar UA parsing ✓
4. Adicionar session tracking ✓
5. Adicionar API metrics ✓

### **2. Corrigir tipo do requireRole** (5 min)

Verificar em `permissions.ts`:
```typescript
export const requireRole = (roles: UserRole | UserRole[]) => { ... }
```

Corrigir em `analytics.routes.ts`:
```typescript
import { UserRole } from '@prisma/client';

router.get('/dashboard',
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), // ✅ Tipado corretamente
  async (req, res) => { ... }
);
```

### **3. Testar endpoints sem middleware** (10 min)

Com middleware desabilitado:

```bash
# 1. Login como admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@hpo.com","password":"senha1234"}'

# 2. Extrair token (ex: eyJhbGciOiJIUzI1...)
TOKEN="<jwt_token>"

# 3. Testar dashboard
curl -X GET "http://localhost:3001/api/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN"

# 4. Testar heatmap
curl -X GET "http://localhost:3001/api/analytics/heatmap?days=7" \
  -H "Authorization: Bearer $TOKEN"

# 5. Verificar dados no banco
psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM session_logs;"
```

### **4. Documentar solução** (5 min)

Após identificar problema:
- Atualizar `ANALYTICS_SISTEMA_ESPECIFICACAO.md`
- Criar guia de troubleshooting
- Adicionar testes unitários para middleware

---

## 📊 Analytics System - Roadmap

### **Fase 1: Estabilização Backend** (1-2 horas)
- [ ] Corrigir problema do middleware (blocking issue)
- [ ] Ajustar tipos TypeScript (requireRole)
- [ ] Testar todos endpoints com dados reais
- [ ] Verificar performance (response time não afetado)
- [ ] Documentar limitações e edge cases

### **Fase 2: Frontend SEO** (30 min - Task 15)
- [ ] Adicionar meta tags em `index.html`
- [ ] Title, description, keywords
- [ ] Open Graph (Facebook/LinkedIn)
- [ ] Twitter Card
- [ ] JSON-LD structured data

### **Fase 3: Analytics Dashboard** (1-2 horas - Tasks 16-17)
- [ ] Instalar `recharts` + `date-fns`
- [ ] Criar `AnalyticsDashboard.tsx`
- [ ] Cards de KPI (4 métricas principais)
- [ ] LineChart (traduções/dia, últimos 30 dias)
- [ ] PieChart (distribuição de devices)
- [ ] BarChart (usuários por país - top 10)
- [ ] Table (top 10 tradutores com avatar)
- [ ] Date range picker
- [ ] Loading states + error handling
- [ ] Integrar em `AdminDashboard.tsx` (nova tab)

### **Fase 4: Testes & Otimização** (1 hora)
- [ ] Testar com dados reais (100+ sessões)
- [ ] Verificar impacto no desempenho
- [ ] Adicionar índices no PostgreSQL se necessário
- [ ] Implementar cache (Redis?) para dashboard
- [ ] GDPR compliance (anonimização de IP, opt-out)

---

## 🎯 Estado Atual

**Backend Analytics**: 90% completo ⚠️
- ✅ Database schemas
- ✅ Middleware (código pronto, mas desabilitado)
- ✅ API endpoints
- ❌ Integração estável
- ❌ Testes com dados reais

**Frontend**: 0% completo ⏳
- ❌ SEO meta tags
- ❌ AnalyticsDashboard component
- ❌ Integração no AdminDashboard

**Bloqueador**: Middleware causando problemas de conexão no servidor

---

## 💡 Recomendações

### **Abordagem 1: Simplificar middleware** (RECOMENDADO)
Remover interceptação de resposta, usar apenas logging assíncrono:
```typescript
export const analyticsMiddleware = (req, res, next) => {
  // Skip health/static
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Coletar dados básicos
  const startTime = Date.now();
  const { ipAddress, userAgent, userId, endpoint, method } = extractData(req);

  // Continuar sem bloquear
  next();

  // Após resposta, logar (não bloqueia)
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logApiMetrics({ endpoint, method, statusCode: res.statusCode, responseTime })
      .catch(err => logger.error('Analytics error:', err));
  });
};
```

### **Abordagem 2: Sistema de filas**
- Usar Redis/Bull para processar analytics assincronamente
- Middleware apenas adiciona job na fila
- Worker separado processa e salva no banco
- Mais robusto mas mais complexo

### **Abordagem 3: Pular middleware inicial**
- Focar em implementar dashboard primeiro (Tasks 15-17)
- Dashboard consome dados mockados
- Voltar ao middleware depois com mais tempo

---

## 📝 Logs Relevantes

### Último erro observado:
```
Server started successfully on port 3001
✅ Email service connection verified

[Tentativa de requisição]
Invoke-RestMethod : Não é possível estabelecer ligação com o servidor remoto
```

**Análise**: Servidor inicia mas trava na primeira request. Confirma que middleware está bloqueando.

---

## 🚀 Comandos Úteis

```bash
# Verificar se porta está aberta
netstat -ano | findstr :3001

# Ver processos Node
Get-Process node

# Logs do servidor
cd hpo-platform-backend
npm run dev  # Ver output no terminal

# Regenerar Prisma Client
npx prisma generate

# Verificar tabelas no PostgreSQL
psql -U postgres -d hpo_platform
\dt  # Listar tabelas
\d session_logs  # Descrever schema
SELECT COUNT(*) FROM session_logs;
```

---

**Última atualização**: 18/10/2025 12:30  
**Status**: Middleware desabilitado, aguardando debug
