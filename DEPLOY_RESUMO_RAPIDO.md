# 🚀 DEPLOY RÁPIDO - O QUE FAZER AGORA

## ✅ PASSO 1: BUILD LOCAL (aqui no Windows)

```powershell
# 1. Build do Backend
cd "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend"
npm run build
# Verifica se criou a pasta dist/

# 2. Build do Frontend  
cd "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl"
npm run build
# Verifica se criou a pasta dist/
```

---

## ✅ PASSO 2: EDITAR .env.production

### **Backend** (`hpo-platform-backend\.env.production`):
Já criei o arquivo! Você só precisa **TROCAR**:

1. **DATABASE_URL**: Senha do PostgreSQL no servidor
2. **OAuth credenciais**: Google, ORCID, LinkedIn (use as mesmas que funcionam local)
3. **SMTP_PASS**: Senha de app do Gmail (cplp@raras.org.br)

### **Frontend** (`plataforma-raras-cpl\.env.production`):
Já está pronto! Não precisa mudar nada.

---

## ✅ PASSO 3: ENVIAR VIA FILEZILLA

### **Conexão FileZilla**:
- **Host**: 200.144.254.4
- **Porta**: 22 (SFTP)
- **Usuário**: ubuntu
- **Senha**: vFpyJS4FA

### **O que enviar**:

#### **1. Backend completo**
- **Origem**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend\`
- **Destino**: `/var/www/html/hpo-platform/backend/`
- **Incluir**:
  - ✅ dist/ (pasta inteira)
  - ✅ prisma/ (pasta inteira)
  - ✅ package.json
  - ✅ package-lock.json
  - ✅ .env.production
  - ❌ node_modules/ (NÃO enviar, eu instalo no servidor)
  - ❌ src/ (NÃO precisa, só o dist/ compilado)

#### **2. Frontend compilado**
- **Origem**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\`
- **Destino**: `/var/www/html/hpo-platform/frontend/dist/`
- **Incluir**:
  - ✅ Todo conteúdo da pasta dist/ (HTML, CSS, JS, assets)

#### **3. Configuração PM2**
- **Origem**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\ecosystem.config.js`
- **Destino**: `/var/www/html/hpo-platform/ecosystem.config.js`

---

## ✅ PASSO 4: ESTRUTURA FINAL NO SERVIDOR

Depois que você enviar, o servidor deve ficar assim:

```
/var/www/html/hpo-platform/
├── backend/                       ← Você enviou agora
│   ├── dist/
│   ├── prisma/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.production
├── frontend/                      ← Você enviou agora
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
├── ecosystem.config.js            ← Você enviou agora
├── hpo-translations-data/         ← Já existe
├── logs/                          ← Já existe
├── public/                        ← Apache serve daqui (EU copio depois)
└── OLD/                           ← EU crio e movo as porcarias antigas
```

---

## ✅ PASSO 5: ME AVISAR

Depois de enviar via FileZilla, **me avise** e eu faço via SSH:

1. ✅ Mover pastas antigas para OLD/
2. ✅ Instalar node_modules no backend
3. ✅ Rodar migrations Prisma
4. ✅ Copiar frontend/dist/ para public/
5. ✅ Configurar permissões
6. ✅ Reiniciar PM2
7. ✅ Testar site

---

## 📝 CHECKLIST PRÉ-ENVIO

- [ ] `npm run build` no backend (criou dist/)
- [ ] `npm run build` no frontend (criou dist/)
- [ ] Editei .env.production do backend (credenciais reais)
- [ ] FileZilla conectado em 200.144.254.4:22
- [ ] Enviei backend/ (sem node_modules/)
- [ ] Enviei frontend/dist/
- [ ] Enviei ecosystem.config.js
- [ ] Avisei o agente para executar comandos SSH

---

## ⚠️ IMPORTANTE

- **NÃO deletar** nada no servidor ainda (eu organizo via SSH)
- **NÃO tocar** na pasta do outro projeto (cplp-backend)
- **NÃO reiniciar** Apache ou PostgreSQL
- Se FileZilla perguntar sobre sobrescrever, responda **SIM** (queremos substituir)

---

## 🎯 TEMPO ESTIMADO

- Build local: 2 min
- Editar .env: 2 min
- Upload FileZilla: 5-10 min (dependendo da conexão)
- SSH comandos (eu faço): 5 min
- **Total**: ~15-20 minutos

Vamos nessa! 🚀
