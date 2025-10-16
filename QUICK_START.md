# 🚀 Quick Start - HPO Translation Platform

**Tempo estimado:** 10 minutos  
**Pré-requisitos:** Node.js 18+, Docker Desktop

---

## 📦 Instalação Rápida

### 1️⃣ Clone o repositório
```powershell
git clone <repository-url>
cd hpo_translation
```

### 2️⃣ Inicie a infraestrutura (PostgreSQL + Redis)
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

✅ **Resultado esperado:**
```
✔ Container hpo-postgres-dev  Started
✔ Container hpo-redis-dev     Started
```

### 3️⃣ Configure o Backend
```powershell
cd hpo-platform-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
Copy-Item .env.example .env

# Aplicar migrations do banco
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Importar 16.942 termos HPO (demora ~2min)
npm run prisma:import-all

# Iniciar servidor (porta 3001)
npm run dev
```

✅ **Resultado esperado:**
```
🚀 Server running on http://localhost:3001
✅ Database connected
✅ Redis connected
```

### 4️⃣ Configure o Frontend
```powershell
# Em NOVA janela PowerShell
cd plataforma-raras-cpl

# Instalar dependências
npm install

# Iniciar servidor (porta 5173)
npm run dev
```

✅ **Resultado esperado:**
```
  VITE v6.3.6  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎉 Primeiro Uso

### 1. Acesse o Sistema
Abra: **http://localhost:5173**

### 2. Crie uma Conta Admin
```powershell
# Em nova janela PowerShell
cd hpo-platform-backend

# Criar usuário admin
npm run create-admin
# Email: admin@hpo.com
# Senha: Admin123!
```

### 3. Faça Login
- **Email:** `admin@hpo.com`
- **Senha:** `Admin123!`

### 4. Traduza Seu Primeiro Termo
1. Vá em **"Traduzir"** no menu
2. Escolha um termo HPO (ex: "Abnormality of the nervous system")
3. Preencha a tradução em português
4. Clique em **"Submeter Tradução"**

🎊 **Parabéns!** Você acabou de contribuir para a plataforma!

---

## 🛠️ Comandos Úteis

### Backend
```powershell
cd hpo-platform-backend

npm run dev              # Desenvolvimento com hot reload
npm run build            # Build para produção
npm test                 # Rodar 23 testes automatizados
npx prisma studio        # Visualizar banco de dados
npx prisma migrate dev   # Criar nova migration
```

### Frontend
```powershell
cd plataforma-raras-cpl

npm run dev              # Desenvolvimento com hot reload
npm run build            # Build para produção
npm run preview          # Preview do build
npm run lint             # Verificar erros de código
```

### Docker
```powershell
# Infraestrutura de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d      # Iniciar
docker-compose -f docker-compose.dev.yml down       # Parar
docker-compose -f docker-compose.dev.yml logs -f    # Ver logs

# Produção (todos os serviços)
docker-compose -f docker-compose.prod.yml up -d     # Iniciar
docker-compose -f docker-compose.prod.yml down      # Parar
```

---

## 📂 Estrutura do Projeto

```
hpo_translation/
├── 🖥️ hpo-platform-backend/        Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/                 13 rotas de API
│   │   ├── services/               Lógica de negócio
│   │   ├── middleware/             Autenticação, validação
│   │   └── server.ts               Entry point
│   └── prisma/
│       ├── schema.prisma           17 models
│       └── migrations/             10 migrations
│
├── 🎨 plataforma-raras-cpl/        Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/             Componentes reutilizáveis
│   │   ├── contexts/               Estado global
│   │   └── ProductionHPOApp.tsx    App principal
│   └── public/                     Assets estáticos
│
├── 📚 docs/                        Documentação organizada
│   ├── user-guides/                Guias do usuário
│   ├── developer/                  Guias do desenvolvedor
│   ├── deployment/                 Deploy e Docker
│   ├── setup/                      Configuração (ORCID, SMTP)
│   └── testing/                    Guias de testes
│
└── 🐳 docker-compose.*.yml         Orquestração Docker
```

---

## 🔧 Configuração Opcional

### SMTP (Email Service)
```bash
# hpo-platform-backend/.env
EMAIL_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
```

📖 **Guia:** [Como obter senha de app Gmail](https://support.google.com/mail/answer/185833)

### ORCID OAuth (Login com ORCID)
```bash
# hpo-platform-backend/.env
ORCID_ENABLED=true
ORCID_CLIENT_ID="APP-XXXXXXXXXX"
ORCID_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

📖 **Guia:** [docs/setup/ORCID_SETUP.md](docs/setup/ORCID_SETUP.md)

---

## ❓ Problemas Comuns

### ❌ Erro: "Cannot connect to database"
```powershell
# Verificar se PostgreSQL está rodando
docker ps | Select-String "postgres"

# Reiniciar container
docker restart hpo-postgres-dev
```

### ❌ Erro: "Port 3001 already in use"
```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :3001

# Matar processo (substitua PID)
taskkill /PID 1234 /F
```

### ❌ Frontend não conecta ao Backend
```bash
# Verificar CORS no backend
# src/server.ts deve ter:
app.use(cors({ origin: 'http://localhost:5173' }))

# Reiniciar backend
npm run dev
```

📖 **Mais soluções:** [docs/deployment/DOCKER_TROUBLESHOOTING.md](docs/deployment/DOCKER_TROUBLESHOOTING.md)

---

## 📚 Próximos Passos

1. **Explorar o Sistema:**
   - 📘 Ler [GUIA_USUARIO_COMPLETO.md](docs/user-guides/GUIA_USUARIO_COMPLETO.md)
   - 🎨 Explorar Dashboard Admin (se você é admin)
   - 📊 Ver ranking de tradutores

2. **Entender Arquitetura:**
   - 🏗️ Ler [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
   - 🛠️ Ler [DEVELOPMENT_GUIDE.md](docs/developer/DEVELOPMENT_GUIDE.md)
   - 🗄️ Explorar Prisma Schema: `npx prisma studio`

3. **Contribuir:**
   - 🐛 Reportar bugs no GitHub Issues
   - ✨ Sugerir features
   - 🧪 Rodar testes: `npm test`
   - 📖 Melhorar documentação

4. **Deploy em Produção:**
   - 🚀 Ler [DEPLOY_GUIDE.md](docs/deployment/DEPLOY_GUIDE.md)
   - 🐳 Usar Docker Compose Prod
   - 🔒 Configurar HTTPS

---

## 📞 Suporte

- **Documentação Completa:** [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **TODO List:** [TODO.md](TODO.md)
- **Troubleshooting:** [docs/deployment/DOCKER_TROUBLESHOOTING.md](docs/deployment/DOCKER_TROUBLESHOOTING.md)
- **GitHub Issues:** [Reportar problema](https://github.com/seu-repo/issues)

---

## ✅ Checklist de Sucesso

Após completar este guia, você deve ter:

- [x] PostgreSQL + Redis rodando no Docker
- [x] Backend rodando em http://localhost:3001
- [x] Frontend rodando em http://localhost:5173
- [x] 16.942 termos HPO no banco de dados
- [x] Conta admin criada
- [x] Primeira tradução submetida

**Tudo funcionando?** 🎉 Você está pronto para contribuir!

---

**Última atualização:** 16 de Outubro de 2025  
**Tempo de setup:** ~10 minutos  
**Dificuldade:** Iniciante
