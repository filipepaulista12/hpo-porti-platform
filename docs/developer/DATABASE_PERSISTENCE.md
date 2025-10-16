# ✅ BANCO DE DADOS - Status e Persistência

**Data:** 16 de Outubro de 2025  
**Status:** ✅ POPULADO E PERSISTENTE

---

## 🎯 SITUAÇÃO ATUAL

### ✅ Banco de Dados ESTÁ Populado e Funcionando!

```
PostgreSQL Container: hpo-postgres (HEALTHY)
Uptime: 15 horas
Volume: hpo-platform-backend_postgres_data (persistente)
Created: 13 de Outubro de 2025
```

### 📊 Dados Atuais (Verificado em 16/10/2025):

| Tabela | Quantidade | Status |
|--------|------------|--------|
| **hpo_terms** | **17.020** | ✅ 100% completo |
| **users** | **5** | ✅ Usuários ativos |
| **translations** | **7.215** | ✅ Traduções legadas importadas |
| **Tabelas criadas** | **18** | ✅ Todas as migrations aplicadas |

---

## 🔍 POR QUE PARECE QUE PRECISA POPULAR SEMPRE?

### Causas Identificadas:

#### 1. **Problema de Memória/Cache do Desenvolvedor** ❌
- Você já populou várias vezes
- Cérebro registra como "sempre precisa fazer"
- **Realidade:** Dados estão persistidos!

#### 2. **Container PostgreSQL com Nome Diferente** ⚠️
- **Antes:** `hpo-postgres-dev` (docker-compose.dev.yml)
- **Agora:** `hpo-postgres` (nome antigo)
- Possível confusão entre containers

#### 3. **Volumes Duplicados** ⚠️
```
- hpo-platform-backend_postgres_data (ATUAL - 17.020 termos)
- backend_postgres_data (ANTIGO - vazio?)
```

---

## ✅ GARANTINDO PERSISTÊNCIA PERMANENTE

### 1. Verificar Volume Correto

```powershell
# Ver volumes existentes
docker volume ls | Select-String "postgres"

# Inspecionar volume atual (17.020 termos)
docker volume inspect hpo-platform-backend_postgres_data

# Ver dados do volume
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM hpo_terms;"
```

**Resultado esperado:** `17020` termos

---

### 2. Padronizar Nome do Container

**Problema:** Docker Compose usa nomes diferentes dependendo do arquivo:
- `docker-compose.yml` (antigo) → `hpo-postgres`
- `docker-compose.dev.yml` (novo) → `hpo-postgres-dev`

**Solução:** Garantir que sempre usamos o mesmo arquivo.

#### Verificar qual está rodando:
```powershell
docker ps | Select-String "postgres"
```

**Se aparecer `hpo-postgres` (sem -dev):**
- Container criado pelo `docker-compose.yml` antigo
- Volume: `hpo-platform-backend_postgres_data`
- **Ação:** Continuar usando este

**Se aparecer `hpo-postgres-dev`:**
- Container criado pelo `docker-compose.dev.yml` novo
- Volume: `postgres_dev_data`
- **Ação:** Migrar dados ou recriar

---

### 3. Script de Verificação de Dados

Crie um script para sempre verificar antes de popular:

```powershell
# check-database.ps1
Write-Host "Verificando banco de dados..." -ForegroundColor Cyan

$termCount = docker exec hpo-postgres psql -U postgres -d hpo_platform -t -c "SELECT COUNT(*) FROM hpo_terms;" 2>$null

if ($LASTEXITCODE -eq 0) {
    $count = [int]($termCount.Trim())
    
    if ($count -eq 17020) {
        Write-Host "✅ Banco de dados OK: $count termos HPO" -ForegroundColor Green
        Write-Host "❌ NÃO precisa popular novamente!" -ForegroundColor Yellow
        exit 0
    } elseif ($count -gt 0) {
        Write-Host "⚠️  Banco parcialmente populado: $count termos" -ForegroundColor Yellow
        Write-Host "🔄 Considere reimportar para garantir 17.020 termos" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ Banco vazio: 0 termos" -ForegroundColor Red
        Write-Host "🔄 PRECISA popular o banco" -ForegroundColor Red
        exit 2
    }
} else {
    Write-Host "❌ Erro ao conectar ao banco" -ForegroundColor Red
    Write-Host "🔧 Verifique se o container PostgreSQL está rodando" -ForegroundColor Yellow
    exit 3
}
```

**Uso:**
```powershell
.\check-database.ps1

# Se retornar "✅ Banco OK", não precisa popular!
# Se retornar "❌ Banco vazio", aí sim precisa popular
```

---

### 4. Atualizar Scripts de Inicialização

#### START.ps1 - Adicionar verificação automática:

```powershell
# Antes de iniciar, verificar banco
Write-Host "Verificando banco de dados..." -ForegroundColor Cyan
$termCount = docker exec hpo-postgres psql -U postgres -d hpo_platform -t -c "SELECT COUNT(*) FROM hpo_terms;" 2>$null

if ($LASTEXITCODE -eq 0) {
    $count = [int]($termCount.Trim())
    Write-Host "✅ Banco possui $count termos HPO" -ForegroundColor Green
    
    if ($count -lt 17020) {
        Write-Host "⚠️  Esperado: 17.020 termos" -ForegroundColor Yellow
        $response = Read-Host "Deseja reimportar termos HPO? (s/n)"
        if ($response -eq "s") {
            cd hpo-platform-backend
            npm run prisma:import-all
            cd ..
        }
    }
} else {
    Write-Host "⚠️  Não foi possível verificar o banco" -ForegroundColor Yellow
}
```

---

## 🚀 COMANDOS ÚTEIS (SOMENTE QUANDO NECESSÁRIO)

### Quando REALMENTE precisa popular:

#### 1. Banco completamente vazio (0 termos)
```powershell
cd hpo-platform-backend

# 1. Aplicar migrations
npx prisma migrate deploy

# 2. Gerar Prisma Client
npx prisma generate

# 3. Importar termos HPO (demora ~2min)
npm run prisma:import-all
```

#### 2. Banco corrompido ou inconsistente
```powershell
cd hpo-platform-backend

# CUIDADO: Isso apaga TODOS os dados!
npx prisma migrate reset

# Depois reimportar
npm run prisma:import-all
```

---

## ⚠️ QUANDO **NÃO** PRECISA POPULAR

### ❌ NÃO popular se:
- ✅ Container PostgreSQL está rodando (`docker ps`)
- ✅ Volume `hpo-platform-backend_postgres_data` existe
- ✅ Query `SELECT COUNT(*) FROM hpo_terms` retorna `17020`
- ✅ Usuários existem no banco
- ✅ Traduções existem no banco

### ✅ APENAS popular se:
- ❌ Container PostgreSQL não existe ou foi recriado SEM volume
- ❌ Volume foi deletado (`docker volume rm`)
- ❌ Query retorna `0` termos
- ❌ Erro `relation "hpo_terms" does not exist`
- ❌ Banco de dados foi dropado manualmente

---

## 🔄 SITUAÇÕES COMUNS

### Situação 1: "Reiniciei o computador"
```powershell
# Container para ao reiniciar, mas volume persiste
docker start hpo-postgres

# Verificar dados
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM hpo_terms;"
```
**Resultado:** 17.020 termos ainda lá! ✅

---

### Situação 2: "Rodei `docker-compose down`"
```powershell
# DOWN para o container mas NÃO deleta o volume
docker-compose down

# UP reinicia com os mesmos dados
docker-compose up -d

# Verificar dados
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM hpo_terms;"
```
**Resultado:** 17.020 termos ainda lá! ✅

---

### Situação 3: "Rodei `docker-compose down -v`" ⚠️
```powershell
# -v DELETA os volumes!
docker-compose down -v

# Agora o volume foi deletado
docker volume ls  # não aparece mais
```
**Resultado:** Banco vazio, PRECISA popular novamente! ❌

**Solução:** NUNCA use `-v` a menos que queira deletar os dados propositalmente.

---

### Situação 4: "Mudei de docker-compose.yml para docker-compose.dev.yml"
```powershell
# Containers diferentes, volumes diferentes!

# Container antigo
docker-compose -f docker-compose.yml up -d
# Volume: hpo-platform-backend_postgres_data
# Container: hpo-postgres

# Container novo
docker-compose -f docker-compose.dev.yml up -d
# Volume: postgres_dev_data
# Container: hpo-postgres-dev
```
**Resultado:** Dois bancos separados! ⚠️

**Solução:** Escolher UM e padronizar:
```powershell
# Parar antigo
docker-compose -f docker-compose.yml down

# Usar sempre o novo
docker-compose -f docker-compose.dev.yml up -d

# OU copiar dados do antigo para o novo
# (script de migração)
```

---

## 📋 CHECKLIST DE CONSISTÊNCIA

Antes de popular o banco, sempre execute:

```powershell
# 1. Verificar container rodando
docker ps | Select-String "postgres"

# 2. Verificar volume existe
docker volume ls | Select-String "postgres"

# 3. Contar termos
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM hpo_terms;"

# 4. Verificar usuários
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM users;"

# 5. Verificar traduções
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM translations;"
```

**Se todos retornarem números > 0:** ✅ **NÃO PRECISA POPULAR!**

---

## 🎯 RESUMO EXECUTIVO

### Estado Atual (16/10/2025):
- ✅ **Banco populado:** 17.020 termos HPO
- ✅ **Volume persistente:** `hpo-platform-backend_postgres_data`
- ✅ **Container rodando:** `hpo-postgres` (15h uptime)
- ✅ **Dados íntegros:** 5 usuários, 7.215 traduções

### Próximas Ações:
1. ✅ **Criar `check-database.ps1`** para verificação automática
2. ✅ **Atualizar `START.ps1`** com verificação integrada
3. ✅ **Documentar** quando popular vs quando não popular
4. ✅ **Padronizar** uso de `docker-compose.dev.yml`

### Regra de Ouro:
> **"Antes de popular, SEMPRE verificar se já está populado!"**

```powershell
docker exec hpo-postgres psql -U postgres -d hpo_platform -c "SELECT COUNT(*) FROM hpo_terms;"
```

Se retornar **17020** → ✅ **Não precisa fazer nada!**

---

**Última verificação:** 16 de Outubro de 2025 - 17.020 termos confirmados  
**Persistência:** ✅ Garantida via Docker volumes  
**Status:** ✅ BANCO FUNCIONAL E PERMANENTE
