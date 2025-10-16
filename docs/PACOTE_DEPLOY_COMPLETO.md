# 📦 PACOTE COMPLETO DE DEPLOY - HPO Translation Platform

**Data:** 16 de Outubro de 2025  
**Status:** ✅ PRONTO PARA EXECUÇÃO

---

## 🎯 O QUE FOI PREPARADO

Criei **TODO o necessário** para deploy no servidor sem riscos:

### ✅ **1. Análise Completa do Servidor**
- Recursos disponíveis (RAM, Disco, CPU)
- Serviços rodando (PM2, Apache, MySQL)
- Portas em uso (3001 ocupada → usar 3002)
- Estrutura de arquivos
- **SEM ALTERAR NADA** no servidor

### ✅ **2. Guias Detalhados**
- Passo a passo com comandos exatos
- Screenshots de referência
- Troubleshooting completo
- Checklist de verificação

### ✅ **3. Arquivos de Configuração**
- `.env.production` (backend)
- `.env.production` (frontend)
- `ecosystem.config.js` (PM2)
- Apache Virtual Host config

---

## 📚 DOCUMENTOS CRIADOS

### **📖 Guia Principal: GUIA_DEPLOY_APACHE_PM2.md**
**Localização:** `docs/GUIA_DEPLOY_APACHE_PM2.md`

**Conteúdo:**
- 11 etapas detalhadas
- Comandos copy/paste prontos
- Configuração Apache + PM2 + PostgreSQL
- SSL com Certbot
- Testes finais
- Troubleshooting

**Tempo estimado:** 2-3 horas

---

### **🌐 Guia DNS: GUIA_DNS_HOSTINGER.md**
**Localização:** `docs/GUIA_DNS_HOSTINGER.md`

**Conteúdo:**
- Como configurar DNS na Hostinger (passo a passo)
- Criar subdomínio `hpo.raras-cplp.org`
- Verificar propagação DNS
- Troubleshooting DNS específico

**Tempo estimado:** 5-30 minutos (+ propagação)

---

### **📊 Análise do Servidor: ANALISE_SERVIDOR_COMPLETA.md**
**Localização:** `docs/ANALISE_SERVIDOR_COMPLETA.md`

**Conteúdo:**
- Recursos disponíveis (RAM: 12GB, Disco: 3.9GB)
- Serviços rodando (PM2, Apache, MySQL)
- Portas em uso (3001 → usar 3002)
- Recomendações de deploy
- Pontos de atenção

---

### **⚙️ Arquivos de Configuração Criados:**

#### **Backend - `.env.production`**
**Localização:** `hpo-platform-backend/.env.production`

**Configurações:**
- Porta: 3002 (3001 ocupada)
- Database: PostgreSQL (não Docker)
- Email: Gmail configurado
- ORCID: Desabilitado (registrar depois)
- JWT: Precisa gerar senha forte

#### **Frontend - `.env.production`**
**Localização:** `plataforma-raras-cpl/.env.production`

**Configurações:**
- API URL: `https://hpo.raras-cplp.org`

---

## 🚀 RESUMO DO PLANO

### **🔴 NÃO VAI SER INSTALADO:**
- ❌ Docker (não precisa - usaremos PM2)
- ❌ Redis (opcional - simplificar)
- ❌ Nginx (já tem Apache)

### **✅ VAI SER USADO:**
- ✅ PM2 (já instalado - gerenciar backend)
- ✅ Apache (já instalado - frontend + proxy)
- ✅ PostgreSQL (vamos instalar - 500MB)
- ✅ Let's Encrypt (SSL gratuito)

---

## 📋 MUDANÇAS LOCAIS NECESSÁRIAS

### **Backend - Porta 3002**
**Motivo:** Porta 3001 ocupada no servidor (backend CPLP)

**Arquivo:** `hpo-platform-backend/.env.production`
```bash
PORT=3002
```

### **Frontend - URL produção**
**Arquivo:** `plataforma-raras-cpl/.env.production`
```bash
VITE_API_URL=https://hpo.raras-cplp.org
```

### **⚠️ IMPORTANTE:**
- **NÃO** altere `.env` local (porta 3001 continua para dev)
- Use `.env.production` apenas no servidor

---

## 🎯 ORDEM DE EXECUÇÃO

### **FASE 1: DNS (VOCÊ FAZ - 30 min)**
📖 Guia: `docs/GUIA_DNS_HOSTINGER.md`

1. Acessar Hostinger
2. Configurar DNS (tipo A, nome: hpo, valor: 200.144.254.4)
3. Aguardar propagação (15-30 min)
4. Verificar com `nslookup hpo.raras-cplp.org`

---

### **FASE 2: DEPLOY (VOCÊ FAZ - 2-3h)**
📖 Guia: `docs/GUIA_DEPLOY_APACHE_PM2.md`

**Etapas:**
1. ✅ Configurar DNS (Fase 1)
2. ✅ Criar pasta HPO no servidor
3. ✅ Upload código (Git ou SFTP)
4. ✅ Instalar PostgreSQL (500MB)
5. ✅ Configurar backend
6. ✅ PM2 start (porta 3002)
7. ✅ Build frontend
8. ✅ Apache Virtual Host
9. ✅ SSL com Certbot
10. ✅ Testes finais

---

## ⚠️ GARANTIAS DE SEGURANÇA

### **❌ NÃO VAI AFETAR:**
- ❌ Site Filipe (`/var/www/html/filipe/`)
- ❌ Backend CPLP (PM2, porta 3001)
- ❌ Outros serviços (Python porta 8081, MySQL 3306)
- ❌ Configurações Apache existentes

### **✅ VAI CRIAR SEPARADO:**
- ✅ Pasta própria: `/var/www/html/hpo-platform/`
- ✅ Processo PM2 separado: `hpo-backend`
- ✅ Porta separada: 3002
- ✅ Virtual Host separado: `hpo.raras-cplp.org.conf`
- ✅ Database separado: `hpo_platform`

---

## 🔍 ESPAÇO EM DISCO

### **Situação Atual:**
```
Disco: 20GB total
Usado: 15GB (80%)
Livre: 3.9GB
```

### **Espaço Necessário:**
```
PostgreSQL: ~500 MB
Backend: ~300 MB
Frontend: ~100 MB
Database populado: ~300 MB
Total: ~1.2 GB
```

### **Após Deploy:**
```
Usado: ~16.2 GB (81%)
Livre: ~2.7 GB ✅ OK
```

**⚠️ Ação:** Monitorar espaço (não vamos limpar para não arriscar)

---

## 📊 PORTAS USADAS

### **Antes:**
```
80    → Apache (HTTP)
443   → Apache (HTTPS)
3001  → Backend CPLP (PM2)
3306  → MySQL
8081  → Python app
22    → SSH
```

### **Depois (vai adicionar):**
```
3002  → HPO Backend (PM2) ← NOVA
5432  → PostgreSQL ← NOVA
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

### **Documentação:**
- [x] Guia de deploy completo criado
- [x] Guia DNS Hostinger criado
- [x] Análise servidor completa
- [x] `.env.production` criados (backend + frontend)
- [x] Troubleshooting incluído

### **Servidor:**
- [x] Análise completa feita (SEM alterações)
- [x] PM2 disponível ✅
- [x] Apache disponível ✅
- [x] Porta 3002 livre ✅
- [x] Espaço suficiente ✅ (1.2GB necessário, 3.9GB livres)

### **DNS:**
- [ ] Subdomínio criado na Hostinger (VOCÊ VAI FAZER)
- [ ] DNS propagado (aguardar 15-30 min)

### **Código:**
- [x] `.env.production` backend criado
- [x] `.env.production` frontend criado
- [x] Porta 3002 configurada
- [ ] Commit Git (fazer antes de subir)

---

## 🎯 PRÓXIMOS PASSOS

### **AGORA (Você faz):**

1. **Ler guias completos:**
   - ✅ `docs/GUIA_DNS_HOSTINGER.md` (30 min)
   - ✅ `docs/GUIA_DEPLOY_APACHE_PM2.md` (2-3h)

2. **Configurar DNS:**
   - Seguir `GUIA_DNS_HOSTINGER.md`
   - Aguardar propagação

3. **Quando DNS propagar:**
   - Seguir `GUIA_DEPLOY_APACHE_PM2.md`
   - Executar etapa por etapa
   - **PARAR** e me perguntar se tiver dúvidas

---

## 🆘 SUPORTE

### **Se algo der errado:**

1. **PARE imediatamente**
2. **NÃO tente corrigir sozinho**
3. **Tire screenshot do erro**
4. **Me envie:**
   - Screenshot
   - Qual etapa estava fazendo
   - Comandos executados
   - Output do erro

### **Troubleshooting nos guias:**
- `GUIA_DEPLOY_APACHE_PM2.md` (seção Troubleshooting)
- `GUIA_DNS_HOSTINGER.md` (seção Troubleshooting DNS)

---

## 📁 ESTRUTURA FINAL NO SERVIDOR

```
/var/www/html/
├── filipe/                    ← Site atual (NÃO MEXER)
└── hpo-platform/              ← HPO (NOVO)
    ├── backend/
    │   ├── dist/
    │   ├── node_modules/
    │   ├── prisma/
    │   ├── .env              ← .env.production copiado
    │   ├── ecosystem.config.js
    │   └── logs/
    ├── frontend/
    │   ├── dist/
    │   ├── node_modules/
    │   └── .env              ← .env.production copiado
    └── public/               ← Frontend build (Apache aponta aqui)
        ├── index.html
        └── assets/
```

---

## 🎉 QUANDO DEPLOY COMPLETO

### **URLs Funcionando:**
```
✅ https://hpo.raras-cplp.org        → Frontend
✅ https://hpo.raras-cplp.org/api    → Backend (proxy)
```

### **Funcionalidades:**
- ✅ Criar conta
- ✅ Login
- ✅ Buscar termos HPO (17.020 termos)
- ✅ Traduzir
- ✅ Validar traduções
- ✅ Gamificação (XP + badges)
- ✅ Leaderboard
- ✅ Email notifications
- ✅ Dashboard admin

---

## 📊 RESUMO EXECUTIVO

| Item | Status | Observação |
|------|--------|------------|
| **Análise Servidor** | ✅ Completa | SEM alterações |
| **Guias Deploy** | ✅ Prontos | Passo a passo detalhado |
| **DNS Hostinger** | ⏳ Aguardando | VOCÊ vai configurar |
| **`.env` Produção** | ✅ Criados | Backend + Frontend |
| **Risco Deploy** | 🟢 Baixo | Pasta separada, não afeta nada |
| **Espaço Disco** | ✅ Suficiente | 1.2GB necessário, 3.9GB livres |
| **Tempo Estimado** | ⏱️ 2-3 horas | + 30 min DNS |

---

## ✅ TUDO PRONTO!

**Você tem TUDO que precisa para fazer deploy:**

1. ✅ Guia completo de DNS (Hostinger)
2. ✅ Guia completo de deploy (Apache + PM2)
3. ✅ Análise completa do servidor
4. ✅ Arquivos `.env.production` prontos
5. ✅ Troubleshooting incluído
6. ✅ Checklist de verificação
7. ✅ SEM RISCOS ao site atual

**Pode começar quando quiser!** 🚀

---

**Criado em:** 16 de Outubro de 2025  
**Tempo de preparação:** 1 hora  
**Status:** ✅ PRONTO PARA EXECUÇÃO  
**Próxima ação:** Configurar DNS na Hostinger
