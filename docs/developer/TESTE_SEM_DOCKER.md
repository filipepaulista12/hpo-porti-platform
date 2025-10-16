# 🚀 TESTANDO SEM DOCKER - GUIA RÁPIDO

## Situação Atual

O Docker Desktop não está rodando no momento. Não tem problema! Podemos testar de 3 formas:

### Opção A: PostgreSQL Online Gratuito (2 minutos) ⭐ RECOMENDADO

**Crie uma conta grátis no Neon.tech:**
1. Acesse: https://neon.tech
2. Clique em "Sign up with GitHub" ou "Sign up with Google"
3. Crie um projeto chamado "hpo-platform-dev"
4. Copie a "Connection string" que aparece
5. Cole no arquivo `.env` na linha DATABASE_URL

**Pronto!** Continue com os próximos passos abaixo.

---

### Opção B: Iniciar Docker Desktop (3 minutos)

Se preferir usar Docker:

1. **Abra o Docker Desktop** (ícone na bandeja do sistema)
2. **Aguarde iniciar** (leva ~1-2 minutos)
3. **Execute:**
   ```powershell
   docker-compose up -d postgres redis
   ```
4. Configure o .env:
   ```env
   DATABASE_URL="postgresql://hpo_user:hpo_password@localhost:5432/hpo_platform?schema=public"
   ```

---

### Opção C: PostgreSQL Local (se já tiver instalado)

Se você já tem PostgreSQL instalado localmente:

1. Crie o banco:
   ```sql
   CREATE DATABASE hpo_platform;
   CREATE USER hpo_user WITH PASSWORD 'hpo_password';
   GRANT ALL PRIVILEGES ON DATABASE hpo_platform TO hpo_user;
   ```

2. Configure o .env:
   ```env
   DATABASE_URL="postgresql://hpo_user:hpo_password@localhost:5432/hpo_platform?schema=public"
   ```

---

## ✅ Próximos Passos (Após Escolher Uma Opção)

```powershell
# 1. Navegar para o diretório
cd "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend"

# 2. Gerar Prisma Client
npm run prisma:generate

# 3. Criar tabelas no banco
npm run prisma:migrate

# Quando pedir o nome da migration, digite: initial_schema

# 4. Importar os 7.215 termos HPO
npm run prisma:seed

# 5. Iniciar o servidor
npm run dev
```

## 🧪 Testar

Em outro terminal PowerShell:

```powershell
# Health check
curl http://localhost:3001/health

# Ver estatísticas
curl http://localhost:3001/api/stats/overview
```

---

## 💡 Recomendação

**Use Neon.tech (Opção A)** porque:
- ✅ Não precisa instalar nada
- ✅ Funciona de qualquer lugar
- ✅ Grátis sem cartão de crédito
- ✅ Setup em 2 minutos
- ✅ Perfeito para desenvolvimento

**Depois você pode:**
- Migrar para Docker quando quiser
- Usar em produção com plano pago
- Ou usar Supabase/Railway/Render

---

## 🎯 Decisão Rápida

**Escolha AGORA:**
- [ ] Vou criar conta no Neon.tech (2 min) ← **RECOMENDADO**
- [ ] Vou iniciar o Docker Desktop (3 min)
- [ ] Já tenho PostgreSQL local instalado

**Depois me avise que opção escolheu e eu te ajudo a continuar!** 🚀
