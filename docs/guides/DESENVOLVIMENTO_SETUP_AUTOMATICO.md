# 🚀 Guia de Desenvolvimento - HPO Translation Platform

## Setup Automático Inteligente

Este projeto possui setup automático inteligente que facilita o desenvolvimento e testes.

### ✨ Novidades

#### 1. Script de Desenvolvimento Automático

**`start-dev.ps1`** - Inicia todo o ambiente automaticamente

```powershell
.\start-dev.ps1
```

**O que ele faz:**
- ✅ Verifica se Docker está rodando
- ✅ Inicia PostgreSQL e Redis (se não estiverem rodando)
- ✅ Detecta se Backend já está rodando, senão inicia
- ✅ Detecta se Frontend já está rodando, senão inicia
- ✅ **Encontra portas disponíveis automaticamente** (não quebra se porta estiver ocupada!)
- ✅ Mostra resumo completo com todas as URLs

**Exemplo de saída:**
```
🚀 Iniciando ambiente de desenvolvimento HPO Translation Platform

✅ Docker está rodando
✅ PostgreSQL e Redis já estão rodando
✅ Backend já está rodando na porta 3001
✅ Frontend iniciado com sucesso em http://localhost:5173

═══════════════════════════════════════════════════
✨ AMBIENTE DE DESENVOLVIMENTO PRONTO!
═══════════════════════════════════════════════════

🔗 URLs Disponíveis:
   Frontend:  http://localhost:5173
   Backend:   http://localhost:3001
   Health:    http://localhost:3001/health

📊 Serviços:
   PostgreSQL: localhost:5433
   Redis:      localhost:6379
```

#### 2. Testes com Setup Automático

Os testes do **backend** agora iniciam o servidor automaticamente!

**Antes:**
```powershell
# Você tinha que fazer isso manualmente:
cd hpo-platform-backend
npm run dev  # Iniciar servidor
# Em outro terminal:
npm test     # Rodar testes
```

**Agora:**
```powershell
# Simplesmente rode os testes:
cd hpo-platform-backend
npm test
```

**O que acontece automaticamente:**
1. Jest detecta se servidor está rodando
2. Se não estiver, inicia automaticamente em porta disponível
3. Aguarda servidor ficar pronto
4. Roda todos os testes
5. Para o servidor ao final

**Saída:**
```
🔍 Verificando se servidor está rodando...
📌 Servidor não está rodando, iniciando automaticamente...
🔌 Usando porta 3001
⏳ Aguardando servidor iniciar...
✅ Servidor iniciado com sucesso em http://localhost:3001

PASS  src/__tests__/health.test.ts
PASS  src/__tests__/auth.test.ts
PASS  src/__tests__/terms.test.ts
PASS  src/__tests__/persistence.test.ts
PASS  src/__tests__/integration.test.ts

Test Suites: 5 passed, 5 total
Tests:       69 passed, 69 total

🛑 Parando servidor de teste...
✅ Servidor parado com sucesso
```

### 🔧 Arquivos Criados

#### Backend

1. **`src/__tests__/globalSetup.ts`**
   - Roda UMA VEZ antes de todos os testes
   - Verifica se servidor está rodando
   - Inicia servidor automaticamente se necessário
   - Encontra porta disponível (3001, 3002, 3003, ...)
   - Salva configuração para os testes

2. **`src/__tests__/globalTeardown.ts`**
   - Roda UMA VEZ depois de todos os testes
   - Para o servidor iniciado pelo globalSetup
   - Limpa arquivos temporários

3. **`src/__tests__/setup.ts`** (modificado)
   - Roda ANTES de cada arquivo de teste
   - Lê configuração do servidor (URL e porta)
   - Configura variáveis de ambiente

4. **`jest.config.js`** (modificado)
   - Adicionou `globalSetup` e `globalTeardown`
   - Aumentou timeout para 30s (servidor pode demorar para iniciar)

#### Raiz do Projeto

1. **`start-dev.ps1`**
   - Script PowerShell completo para iniciar ambiente
   - Inteligente: detecta o que já está rodando
   - Resiliente: encontra portas livres automaticamente
   - Amigável: mostra URLs e status de cada serviço

### 📋 Comandos Úteis

#### Desenvolvimento

```powershell
# Iniciar ambiente completo (recomendado)
.\start-dev.ps1

# Ou manualmente:
cd hpo-platform-backend
npm run dev

# Em outro terminal:
cd plataforma-raras-cpl
npm run dev
```

#### Testes

```powershell
# Backend (com setup automático)
cd hpo-platform-backend
npm test                    # Todos os testes
npm test -- health.test     # Teste específico
npm test -- --coverage      # Com cobertura

# Frontend
cd plataforma-raras-cpl
npm test                    # Todos os testes
npm run test:ui             # Interface visual
npm run test:coverage       # Com cobertura
```

#### Parar Serviços

```powershell
# Parar tudo
.\STOP.ps1

# Ou manualmente no Windows:
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 🎯 Benefícios

#### Para Desenvolvimento
- ✅ **Um comando para iniciar tudo**: `.\start-dev.ps1`
- ✅ **Não quebra se porta estiver ocupada**: Encontra porta livre automaticamente
- ✅ **Feedback visual**: Mostra claramente o que está rodando e onde
- ✅ **Idempotente**: Pode rodar várias vezes sem problema

#### Para Testes
- ✅ **Sem setup manual**: Só rode `npm test`
- ✅ **CI/CD friendly**: Funciona perfeitamente no GitHub Actions
- ✅ **Isolado**: Cada run de teste inicia/para servidor independentemente
- ✅ **Confiável**: Aguarda servidor estar 100% pronto antes de rodar testes

### 🐛 Troubleshooting

#### "Port is already in use"

**Solução**: O script `start-dev.ps1` ou `globalSetup.ts` já resolvem isso automaticamente encontrando porta livre. Se ainda ver este erro:

```powershell
# Liberar porta 3001
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Liberar porta 5173
Get-NetTCPConnection -LocalPort 5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### Testes falhando por timeout

Se testes falharem com timeout, o servidor pode estar demorando para iniciar. Já configuramos 30s de timeout, mas se necessário:

```javascript
// jest.config.js
module.exports = {
  //...
  testTimeout: 60000, // 60s
};
```

#### Docker não está rodando

```powershell
# Verificar Docker
docker ps

# Se não funcionar, inicie Docker Desktop
```

### 📊 Status Atual

#### Backend
- **Testes**: 69/69 passando (100%) ✅
- **Setup**: Automático ✅
- **Cobertura**: ~85% ✅

#### Frontend
- **Testes**: 99/99 passando (100%) ✅
- **Setup**: Manual (não precisa servidor próprio)
- **Cobertura**: ~80% ✅

#### CI/CD
- **GitHub Actions**: Configurado ✅
- **Deploy**: Automático via SSH ✅
- **Workflows**: ci.yml + deploy.yml ✅

### 🚀 Próximos Passos

1. ✅ Setup automático backend
2. ✅ Script start-dev.ps1
3. ✅ Correção testes frontend
4. ⏳ Deploy em produção para testes com usuários reais
5. ⏳ Monitoramento e métricas

---

**Desenvolvido com ❤️ pela equipe HPO-CPLP**
