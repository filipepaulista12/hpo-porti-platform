# 📊 RESUMO EXECUTIVO - Deploy PORTI-HPO

**Data:** 19 de Outubro de 2025  
**Versão:** PORTI-HPO Platform v1.0 (Monorepo)  
**Repositório:** https://github.com/filipepaulista12/hpo-porti-platform

---

## ✅ SITUAÇÃO ATUAL

### 🎯 O Que Temos

**LOCAL (Windows):**
- ✅ Aplicação rodando: Backend (3001) + Frontend (5174)
- ✅ 322 testes passando (100%)
- ✅ Código commitado no GitHub
- ✅ README completo criado
- ✅ Estrutura organizada (monorepo)

**SERVIDOR (200.144.254.4):**
- ✅ Deploy anterior funcionando (17/Out/2025)
- ✅ URL ativa: https://hpo.raras-cplp.org
- ✅ Backend em PM2 (porta 3002)
- ✅ Frontend servido por Apache
- ✅ PostgreSQL com 16.942 termos HPO
- ⚠️ **VERSÃO ANTIGA/BUGADA** (precisa substituir)

---

## 🎯 OBJETIVO

**SUBSTITUIR** a aplicação antiga no servidor pela **nova versão** do GitHub.

**Estratégia:** Deploy seguro com backup e rollback preparado.

---

## 📚 DOCUMENTAÇÃO CRIADA

Criei **3 documentos** para você:

### 1. 📋 ANÁLISE_PRE_DEPLOY_SERVIDOR.md
**Localização:** `docs-organized/03-deployment/`

**Conteúdo:**
- Resumo executivo do estado do servidor
- Estrutura atual vs nova estrutura
- Fluxo de substituição (10 passos)
- Pontos de atenção (o que NÃO mexer)
- Checklist de verificação

### 2. 🔍 SCRIPT_EXPLORACAO_CONSULTIVA.md
**Localização:** `docs-organized/03-deployment/`

**Conteúdo:**
- 13 blocos de comandos para executar no servidor
- Modo READ-ONLY (sem fazer alterações)
- Documentar estado atual
- Identificar diferenças
- Template de resumo

### 3. 📖 README Anterior (Referência)
**Documentos existentes:**
- `GUIA_DEPLOY_APACHE_PM2.md` (976 linhas - deploy completo)
- `ANALISE_SERVIDOR_COMPLETA.md` (análise de recursos)
- `DEPLOYMENT_COMPLETO_SUCESSO.md` (deploy 17/Out)

---

## 🗺️ MAPA DO SERVIDOR (Já Documentado)

```
200.144.254.4 (Ubuntu 20.04)
├── Recursos:
│   ├── Disco: 20GB (15GB usado, 5GB livre) ⚠️ 75%
│   ├── RAM: 15GB (3GB usado, 12GB livre) ✅
│   └── Swap: 472MB ✅
│
├── Software:
│   ├── Node.js v18.20.4 ✅
│   ├── PM2 v6.0.13 ✅
│   ├── Apache2 (com SSL) ✅
│   ├── PostgreSQL ✅
│   └── Docker: ❌ NÃO instalado
│
├── Portas:
│   ├── 22: SSH ✅
│   ├── 80/443: Apache ✅
│   ├── 3001: CPLP Backend (outro projeto) ⚠️ NÃO MEXER
│   ├── 3002: HPO Backend ✅
│   ├── 3306: MySQL (outro projeto) ⚠️ NÃO MEXER
│   ├── 5432: PostgreSQL ✅
│   └── 8081: Python App (outro projeto) ⚠️ NÃO MEXER
│
└── Estrutura HPO Atual:
    ├── /var/www/html/hpo-platform/
    │   ├── backend/ (Node.js)
    │   ├── public/ (Frontend build)
    │   └── backups/
    │
    ├── PM2: hpo-backend (ID: 1)
    ├── Apache: hpo.raras-cplp.org.conf
    └── Database: hpo_platform
```

---

## 🔄 DIFERENÇAS: Código Antigo vs Novo

### Código Antigo (Servidor Atual)
```
/var/www/html/hpo-platform/
├── backend/          # Estrutura antiga
└── public/           # Frontend build
```

### Código Novo (GitHub)
```
hpo-porti-platform/
├── hpo-platform-backend/      # Backend (nome original)
├── plataforma-raras-cpl/      # Frontend (nome original)
├── docs-organized/            # Documentação
├── scripts/                   # Scripts organizados
├── assets/                    # Branding
└── docker-compose.*.yml       # NÃO usar (sem Docker)
```

**⚠️ ATENÇÃO:** Nomes de pastas diferentes! Precisamos ajustar.

---

## 📋 PRÓXIMOS PASSOS

### AGORA (Quando Conectar na VPN)

1. **Conectar SSH:**
   ```bash
   ssh ubuntu@200.144.254.4
   ```

2. **Executar Script de Exploração:**
   - Abrir: `docs-organized/03-deployment/SCRIPT_EXPLORACAO_CONSULTIVA.md`
   - Copiar comandos um por um
   - Documentar resultados
   - **NÃO MEXER EM NADA!** Apenas olhar

3. **Reportar:**
   - Aplicação atual funcionando?
   - Algum problema encontrado?
   - Diferenças identificadas?

### DEPOIS (Após Exploração)

4. **Criar Plano de Deploy Detalhado:**
   - Com base no estado atual encontrado
   - Ordem de execução
   - Comandos exatos
   - Pontos de validação
   - Estratégia de rollback

5. **Executar Deploy:**
   - Backup completo
   - Clone novo repositório
   - Configuração
   - Build
   - Substituição
   - Testes
   - Validação

---

## ⚠️ REGRAS DE SEGURANÇA

### 🔴 NÃO MEXER (NUNCA!)

- ❌ Backend CPLP (porta 3001)
- ❌ Site Filipe (`/var/www/html/filipe/`)
- ❌ MySQL (porta 3306)
- ❌ Python App (porta 8081)
- ❌ Configurações Apache de outros sites
- ❌ Processos PM2 de outros projetos

### 🟢 PODE MEXER

- ✅ `/var/www/html/hpo-platform/`
- ✅ PM2 processo `hpo-backend` (ID: 1)
- ✅ Database `hpo_platform`
- ✅ Configuração `/etc/apache2/sites-enabled/hpo.raras-cplp.org.conf`

### 🟡 ANTES DE MEXER

- ⚠️ SEMPRE fazer backup
- ⚠️ Documentar estado atual
- ⚠️ Ter plano de rollback
- ⚠️ Testar em ambiente isolado (se possível)

---

## 🎓 O Que Já Sabemos (de Deploys Anteriores)

### Deploy 17/Out/2025 - Sucesso ✅

**O que foi feito:**
1. ✅ PostgreSQL instalado
2. ✅ Database criada com 16.942 termos
3. ✅ Backend compilado e rodando (PM2)
4. ✅ Frontend buildado e servido (Apache)
5. ✅ SSL configurado (Let's Encrypt)
6. ✅ Testes funcionais OK

**Configurações que funcionaram:**
- Backend porta 3002 ✅
- PM2 com ecosystem.config.js ✅
- Apache VirtualHost com ProxyPass ✅
- PostgreSQL local (sem Docker) ✅

**Problemas conhecidos:**
- Versão com bugs (motivo para substituir)
- Código não está no Git no servidor
- Estrutura de pastas diferente do monorepo

---

## 🎯 CRITÉRIOS DE SUCESSO

### Exploração Consultiva
- [ ] Todos os comandos executados sem erro
- [ ] Estado atual documentado
- [ ] Diferenças identificadas
- [ ] Recursos confirmados (disco, RAM)
- [ ] Nenhuma alteração feita

### Deploy (Futuro)
- [ ] Backup completo criado
- [ ] Nova versão clonada do GitHub
- [ ] Backend buildado sem erros
- [ ] Frontend buildado sem erros
- [ ] Database migrations aplicadas
- [ ] PM2 iniciou backend sem erros
- [ ] Apache recarregado
- [ ] https://hpo.raras-cplp.org carrega
- [ ] Backend responde (health check)
- [ ] API funciona (login, traduções)
- [ ] Testes manuais OK
- [ ] Sem erros nos logs

---

## 📞 COMUNICAÇÃO COMIGO

Quando estiver explorando o servidor, me reporte:

1. **Antes de iniciar:**
   - "Conectei no servidor, vou começar exploração"

2. **Durante:**
   - Qualquer coisa estranha encontrada
   - Erros ao executar comandos
   - Diferenças significativas do esperado

3. **Depois:**
   - Resumo dos 13 blocos executados
   - Estado atual documentado
   - Pronto para criar plano de deploy

---

## 🚀 EXPECTATIVA

**Tempo estimado:**
- Exploração consultiva: **15-20 minutos**
- Criação do plano: **10 minutos**
- Deploy completo: **30-45 minutos**
- Testes e validação: **15 minutos**

**Total:** ~1h30min

---

## ✅ CHECKLIST ANTES DE COMEÇAR

- [ ] Conectado na VPN
- [ ] Terminal SSH aberto
- [ ] Documentos de exploração abertos
- [ ] Pronto para copiar/colar comandos
- [ ] Bloco de notas para documentar resultados
- [ ] Eu (IA) disponível para ajudar

---

**🎯 OBJETIVO FINAL:** Substituir aplicação antiga pela nova versão do GitHub de forma segura e sem afetar outros projetos no servidor.

**Por ti, pela ciência, em português!** 🔗
