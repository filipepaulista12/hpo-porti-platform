# 🐘 Setup PostgreSQL Online Gratuito (Neon.tech)

Como o Docker Desktop não está rodando, vamos usar um PostgreSQL online gratuito para desenvolvimento.

## Opção 1: Neon.tech (RECOMENDADO) ⭐

### 1. Criar Conta no Neon
1. Acesse: https://neon.tech
2. Clique em "Sign Up" ou "Get Started"
3. Faça login com GitHub ou Google
4. É gratuito, sem cartão de crédito!

### 2. Criar Database
1. No dashboard, clique em "Create Project"
2. Nome do projeto: `hpo-platform-dev`
3. Região: Escolha a mais próxima (Europe recommended)
4. Clique em "Create Project"

### 3. Copiar Connection String
1. Na página do projeto, procure por "Connection String"
2. Copie a string que começa com `postgresql://`
3. Deve ser algo como:
   ```
   postgresql://usuario:senha@ep-xxx-yyy-zzz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 4. Configurar .env
Abra o arquivo `.env` e cole a connection string:

```env
DATABASE_URL="postgresql://usuario:senha@ep-xxx.neon.tech/neondb?sslmode=require"
```

## Opção 2: Supabase

### 1. Criar Conta no Supabase
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Gratuito!

### 2. Criar Projeto
1. Clique em "New project"
2. Nome: `hpo-platform-dev`
3. Database Password: Crie uma senha forte (ANOTE!)
4. Região: Escolha a mais próxima
5. Clique em "Create new project" (leva ~2 min)

### 3. Obter Connection String
1. No menu lateral, clique em "Project Settings" (ícone de engrenagem)
2. Clique em "Database"
3. Role até "Connection string"
4. Selecione "URI" e copie
5. Substitua `[YOUR-PASSWORD]` pela senha que você criou

### 4. Configurar .env
```env
DATABASE_URL="postgresql://postgres:suasenha@db.xxxx.supabase.co:5432/postgres"
```

## Opção 3: ElephantSQL

### 1. Criar Conta
1. Acesse: https://www.elephantsql.com
2. Clique em "Get a managed database today"
3. Faça login com GitHub ou crie conta
4. Gratuito até 20MB

### 2. Criar Instância
1. Clique em "Create New Instance"
2. Nome: `hpo-platform-dev`
3. Plan: Selecione "Tiny Turtle (Free)"
4. Data center: Escolha o mais próximo
5. Clique em "Create instance"

### 3. Obter URL
1. Clique na instância criada
2. Copie a "URL" que aparece (começa com `postgres://`)

### 4. Configurar .env
```env
DATABASE_URL="postgres://usuario:senha@isilo.db.elephantsql.com/usuario"
```

## ✅ Após Configurar

Execute os comandos:

```powershell
# 1. Gerar Prisma Client
npm run prisma:generate

# 2. Criar tabelas no banco
npm run prisma:migrate

# 3. Importar dados
npm run prisma:seed

# 4. Iniciar servidor
npm run dev
```

## 🔧 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se copiou a connection string completa
- Verifique se tem `?sslmode=require` no final (Neon)
- Teste a conexão diretamente

### Erro: "Authentication failed"
- Verifique senha
- Certifique-se de substituir `[YOUR-PASSWORD]`

### Erro: "SSL required"
- Adicione `?sslmode=require` no final da URL

## 📝 Nota Importante

Estes serviços gratuitos são perfeitos para desenvolvimento e testes, mas para produção você deve:
- Usar um plano pago com backups
- Configurar variáveis de ambiente diferentes
- Implementar sistema de backup próprio

## 🎯 Qual Escolher?

**Recomendo Neon.tech porque:**
- ✅ Mais rápido de configurar
- ✅ Generous free tier
- ✅ Auto-scaling
- ✅ Branches de database
- ✅ Boa performance

**Use Supabase se:**
- Você quer usar as outras features (Auth, Storage, Realtime)
- Planeja migrar tudo para Supabase no futuro

**Use ElephantSQL se:**
- Quer algo super simples
- Precisa apenas de PostgreSQL puro
