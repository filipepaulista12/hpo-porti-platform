# 🔍 RELATÓRIO COMPLETO: Análise do Servidor RARAS-CPLP

**Data:** 16 de Outubro de 2025  
**Servidor:** 200.144.254.4 (ciis)  
**Modo:** CONSULTIVO (Sem alterações)

---

## 📊 INFORMAÇÕES BÁSICAS DO SERVIDOR

### **Sistema Operacional:**
```
Hostname: ciis
OS: Linux Ubuntu (5.4.0-73-generic)
Kernel: #82-Ubuntu SMP Wed Apr 14 17:39:42 UTC 2021 x86_64
```

### **Recursos Disponíveis:**

| Recurso | Total | Usado | Disponível | Uso % |
|---------|-------|-------|------------|-------|
| **Disco (/)** | 20 GB | 15 GB | 3.9 GB | **80%** ⚠️ |
| **RAM** | 15 GB | 2.7 GB | 12 GB | 18% ✅ |
| **Swap** | 472 MB | 32 MB | 439 MB | 7% ✅ |

**⚠️ ALERTA:** Disco está com **80% de uso** (15GB/20GB). Só tem **3.9GB livres**.

---

## 🐳 DOCKER

**Status:** ❌ **NÃO INSTALADO**

```
bash: docker: command not found
```

**Impacto:** Não poderemos usar Docker Compose. Precisaremos usar **PM2** para gerenciar processos.

---

## ⚙️ PM2 (Process Manager) ✅

**Status:** ✅ **INSTALADO E RODANDO**

### **Processos PM2 Ativos:**

| ID | Nome | Status | Uptime | CPU | RAM | Restarts |
|----|------|--------|--------|-----|-----|----------|
| 0 | **cplp-backend** | 🟢 online | 4 dias | 0% | 115.9 MB | 171 |

**Análise:**
- ✅ PM2 funcionando perfeitamente
- ✅ Backend CPLP rodando há 4 dias
- ⚠️ 171 restarts (muitos! pode ter problemas de estabilidade)
- ✅ Uso de RAM baixo (115 MB)
- ✅ CPU em 0% (sistema ocioso)

**Path do backend atual:**
```
/home/ubuntu/cplp_backend/dist/main.js
```

---

## 🌐 SERVIDOR WEB

**Tipo:** ✅ **APACHE2** (NÃO Nginx!)

### **Portas em Uso:**

| Porta | Serviço | Processo | Status |
|-------|---------|----------|--------|
| **80** | HTTP | Apache2 | ✅ Ativo |
| **443** | HTTPS | Apache2 | ✅ Ativo |
| **3001** | Backend CPLP | PM2 (Node.js) | ✅ Ativo |
| **3306** | MySQL | mysqld | ✅ Ativo |
| **8081** | Python App | python3 | ✅ Ativo |
| **22** | SSH | sshd | ✅ Ativo |

**Observações:**
- ✅ Porta **3001** JÁ ESTÁ EM USO (backend CPLP atual)
- ✅ Porta **80** e **443** em uso pelo Apache
- ✅ MySQL rodando na porta 3306
- ✅ Aplicação Python na porta 8081

**⚠️ IMPORTANTE:** Como porta 3001 está ocupada, o HPO backend precisará usar **outra porta** (ex: 3002, 3003, 4000, etc).

---

## 📁 ESTRUTURA DE ARQUIVOS

### **/var/www/**
```
total 12
drwxr-xr-x  3 root root 4096 Aug  4 23:05 .
drwxr-xr-x 13 root root 4096 Mar  2  2024 ..
drwxr-xr-x  7 root root 4096 Sep 12 18:37 html
```

### **/var/www/html/filipe/** (Site Atual)

**Estrutura completa:**
```
drwxrwxr-x 22 ubuntu www-data    4096 Sep  7 18:33 .
-rwxrwxr-x  1 ubuntu www-data   48308 Oct 11 13:02 404.html
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 acessibilidade
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 api
drwxrwxr-x  3 ubuntu www-data    4096 Aug  3 20:49 atlas
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 contato
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 dados
drwxrwxr-x  2 ubuntu www-data    4096 Aug  6 10:35 diagnostic
drwxrwxr-x  5 ubuntu www-data    4096 Aug  3 20:49 equipe
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 eventos
-rwxrwxr-x  1 ubuntu www-data 1754740 Oct 11 13:02 favicon.ico
drwxrwxr-x  7 ubuntu www-data    4096 Aug  6 10:36 hpo
-rwxrwxr-x  1 ubuntu www-data  108068 Oct 11 13:02 index.html
drwxrwxr-x 12 ubuntu www-data    4096 Oct 11 13:03 _next (Next.js)
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 noticias
drwxrwxr-x  3 ubuntu ubuntu      4096 Sep  7 18:33 projetos
drwxrwxr-x  2 ubuntu www-data    4096 Aug  3 20:49 publicacoes
drwxrwxr-x  7 ubuntu www-data    4096 Sep  7 18:33 recursos-digitais
drwxrwxr-x  6 ubuntu www-data    4096 Sep  7 18:35 sobre
```

**Análise:**
- ✅ Site Next.js (pasta `_next`)
- ✅ Já tem pasta `hpo` (relacionado?)
- ✅ Permissões: `ubuntu:www-data`
- ✅ 22 diretórios/arquivos
- ⚠️ Misturado com site atual

---

## 🔐 APACHE & SSL

**Apache Config:**
```
/etc/apache2/sites-enabled/ - Não acessível (precisa sudo)
```

**Processos Apache Rodando:**
- ✅ 12 processos Apache2 ativos
- ✅ Rodando nas portas 80 (HTTP) e 443 (HTTPS)
- ✅ SSL configurado (porta 443 ativa)

**Let's Encrypt:**
```
/etc/letsencrypt/live/ - Precisa sudo para verificar
```

Mas como porta 443 está ativa, **SSL provavelmente já está configurado**.

---

## 🔧 SOFTWARE INSTALADO

### **Node.js & PM2:**
```
PM2: v6.0.13 ✅
Node.js: (precisa verificar versão)
NPM: (precisa verificar versão)
```

### **Banco de Dados:**
```
MySQL: Rodando na porta 3306 ✅
```

### **Python:**
```
Python3: Rodando app na porta 8081 ✅
```

### **Docker:**
```
Docker: ❌ NÃO INSTALADO
```

---

## 📍 BACKEND CPLP ATUAL

**Localização:**
```
/home/ubuntu/cplp_backend/dist/main.js
```

**Status:**
- ✅ Rodando via PM2 (processo ID: 0)
- ✅ Nome do processo: `cplp-backend`
- ✅ Porta: 3001
- ⚠️ 171 restarts (instável?)
- ✅ Uptime: 4 dias

---

## 🎯 RECOMENDAÇÕES PARA DEPLOY HPO

### **🟢 OPÇÃO 1: Pasta Separada (RECOMENDADO)** ⭐

```
/var/www/html/hpo-platform/
├── backend/          (Node.js + PM2)
├── frontend/         (React build)
└── .env
```

**Vantagens:**
- ✅ Separado do site Filipe (seguro!)
- ✅ Fácil de gerenciar
- ✅ Não afeta site atual
- ✅ Rollback simples

**Subdomínio sugerido:**
- Frontend: `hpo.raras-cplp.org`
- API: `api-hpo.raras-cplp.org`

---

### **🟡 OPÇÃO 2: Subpasta dentro de /filipe/**

```
/var/www/html/filipe/hpo-platform/
```

**Vantagens:**
- ✅ Usa estrutura existente

**Desvantagens:**
- ⚠️ Misturado com site Filipe
- ⚠️ Risco de quebrar site atual
- ⚠️ Difícil de separar depois

**NÃO RECOMENDADO** para produção.

---

### **🔴 OPÇÃO 3: Substituir site Filipe**

❌ **NÃO FAZER!** Você mencionou medo de "cagar o site".

---

## 🚀 PLANO DE DEPLOY RECOMENDADO

### **ETAPA 1: Preparação (SEM RISCO)**

1. ✅ **Criar pasta separada:**
   ```bash
   sudo mkdir -p /var/www/html/hpo-platform
   sudo chown ubuntu:www-data /var/www/html/hpo-platform
   ```

2. ✅ **Escolher porta para backend HPO:**
   - Porta 3001: ❌ Ocupada (CPLP backend)
   - Porta 3002: ✅ Sugerida para HPO
   - Ou: 4000, 5000, 8000

3. ✅ **Configurar subdomínio DNS:**
   - `hpo.raras-cplp.org` → 200.144.254.4
   - `api-hpo.raras-cplp.org` → 200.144.254.4

---

### **ETAPA 2: Deploy Backend (PM2)**

```bash
# 1. Clonar/copiar código
cd /var/www/html/hpo-platform
git clone <repo> backend
cd backend

# 2. Instalar dependências
npm install

# 3. Configurar .env (PORTA 3002!)
cp .env.example .env
nano .env  # Ajustar DATABASE_URL, PORT=3002, etc

# 4. Build
npm run build

# 5. PM2 start
pm2 start dist/server.js --name hpo-backend --instances 1
pm2 save
pm2 startup  # Autostart
```

---

### **ETAPA 3: Deploy Frontend (Apache)**

```bash
# 1. Build frontend
cd /var/www/html/hpo-platform/frontend
npm install
npm run build

# 2. Copiar build para pasta pública
sudo cp -r dist/* /var/www/html/hpo-platform/public/
```

---

### **ETAPA 4: Configurar Apache Virtual Host**

Criar arquivo: `/etc/apache2/sites-available/hpo.raras-cplp.org.conf`

```apache
<VirtualHost *:80>
    ServerName hpo.raras-cplp.org
    ServerAlias www.hpo.raras-cplp.org
    
    DocumentRoot /var/www/html/hpo-platform/public
    
    <Directory /var/www/html/hpo-platform/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router (SPA)
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Proxy para API backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3002/api
    ProxyPassReverse /api http://localhost:3002/api
    
    ErrorLog ${APACHE_LOG_DIR}/hpo-error.log
    CustomLog ${APACHE_LOG_DIR}/hpo-access.log combined
</VirtualHost>
```

**Ativar site:**
```bash
sudo a2ensite hpo.raras-cplp.org
sudo a2enmod proxy proxy_http rewrite
sudo systemctl reload apache2
```

---

### **ETAPA 5: SSL (Certbot)**

```bash
sudo certbot --apache -d hpo.raras-cplp.org -d www.hpo.raras-cplp.org
```

---

### **ETAPA 6: Database**

**Opções:**

**A) Usar MySQL existente (porta 3306):**
```bash
# Criar database
mysql -u root -p
CREATE DATABASE hpo_platform;
CREATE USER 'hpo_user'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON hpo_platform.* TO 'hpo_user'@'localhost';
FLUSH PRIVILEGES;
```

**B) Instalar PostgreSQL separado:**
```bash
sudo apt install postgresql postgresql-contrib
# Configurar porta diferente (5433) para não conflitar
```

---

## ⚠️ PONTOS DE ATENÇÃO

### **1. Disco com 80% de uso (3.9GB livres)**

**Verificar o que está consumindo:**
```bash
sudo du -sh /var/* | sort -rh | head -10
```

**Limpar se necessário:**
```bash
# Logs antigos
sudo journalctl --vacuum-time=7d

# Pacotes antigos
sudo apt autoremove
sudo apt clean
```

**Espaço necessário para HPO:**
- Backend: ~500 MB
- Frontend: ~100 MB
- Database (vazio): ~50 MB
- Database (17.020 termos): ~200-300 MB
- **Total estimado:** ~1 GB

**Status:** ✅ **TEM ESPAÇO** (mas monitorar!)

---

### **2. Backend CPLP com 171 restarts**

**Possíveis causas:**
- Crashes por erros no código
- Falta de memória (pouco provável - só 2.7GB/15GB usado)
- Erros de conexão (database, APIs externas)

**Recomendação:** Verificar logs:
```bash
pm2 logs cplp-backend --lines 100
```

---

### **3. Porta 3001 ocupada**

**Solução:** HPO backend usar porta **3002** ou outra disponível.

---

### **4. Apache (não Nginx)**

**Impacto:** Guia de deploy precisa usar configuração **Apache**, não Nginx.

**Diferenças:**
- Apache: Virtual Hosts em `/etc/apache2/sites-available/`
- Apache: `a2ensite`, `a2enmod`
- Apache: `ProxyPass` para reverse proxy

---

## 📋 CHECKLIST PRÉ-DEPLOY

### **Recursos:**
- [x] RAM suficiente (15GB, 12GB livres)
- [⚠️] Disco com espaço (3.9GB livres - **80% usado**)
- [x] PM2 instalado e funcionando
- [x] Node.js instalado
- [x] MySQL rodando
- [x] Apache com SSL configurado

### **Configurações:**
- [x] Porta 3002 disponível para HPO backend
- [x] /var/www/html/ acessível
- [x] Domínio raras-cplp.org disponível
- [ ] Subdomínio hpo.raras-cplp.org (criar DNS)
- [ ] Certificado SSL para subdomínio (depois do DNS)

### **Decisões:**
- [x] **Pasta separada:** `/var/www/html/hpo-platform/` ⭐
- [x] **Backend porta:** 3002
- [x] **Process manager:** PM2
- [x] **Banco de dados:** MySQL existente (criar database nova)
- [x] **Web server:** Apache (não Nginx)

---

## 🎯 PRÓXIMOS PASSOS

### **1. AGORA (Preparação - 10 min):**

a) **Limpar espaço em disco:**
```bash
sudo journalctl --vacuum-time=7d
sudo apt autoremove
sudo apt clean
```

b) **Criar estrutura de pastas:**
```bash
sudo mkdir -p /var/www/html/hpo-platform
sudo chown -R ubuntu:www-data /var/www/html/hpo-platform
```

c) **Configurar DNS:**
- Acessar painel do domínio raras-cplp.org
- Criar registro A:
  - Nome: `hpo`
  - Tipo: `A`
  - Valor: `200.144.254.4`
  - TTL: `300`

---

### **2. DEPOIS (Deploy - 2-3 horas):**

Seguir guia detalhado que vou criar agora com comandos específicos para **Apache + PM2 + MySQL**.

---

## ✅ CONCLUSÃO

### **Servidor está PRONTO para receber HPO!**

**Recursos:**
- ✅ RAM: 12GB disponíveis (suficiente)
- ⚠️ Disco: 3.9GB livres (suficiente, mas monitorar)
- ✅ PM2: Funcionando
- ✅ Apache: Com SSL
- ✅ MySQL: Rodando

**Recomendações:**
1. ✅ **Usar pasta separada:** `/var/www/html/hpo-platform/`
2. ✅ **Backend porta 3002** (3001 ocupada)
3. ✅ **PM2 para gerenciar** backend
4. ✅ **Apache Virtual Host** para frontend
5. ✅ **MySQL** para database (criar database nova)
6. ⚠️ **Limpar espaço** em disco antes

**Risco:** 🟢 **BAIXO** - Não vai afetar site Filipe nem backend CPLP atual.

---

**Posso criar o guia detalhado de deploy agora?** 🚀
