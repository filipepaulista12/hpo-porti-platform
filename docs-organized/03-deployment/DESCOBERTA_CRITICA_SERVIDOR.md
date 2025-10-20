# 🚨 DESCOBERTA CRÍTICA - Servidor PORTI-HPO

**Data:** 19 de Outubro de 2025, 19:17  
**Status:** ⚠️ **PROBLEMA ENCONTRADO!**

---

## 🔍 SITUAÇÃO ATUAL DESCOBERTA

### ❌ PROBLEMA CRÍTICO

**PM2 está apontando para pasta que NÃO EXISTE!**

```
PM2 config: /var/www/html/hpo-platform/backend/dist/server.js
Realidade: Pasta 'backend' NÃO EXISTE!
```

### 📂 Estrutura Atual do Servidor

```
/var/www/html/hpo-platform/
├── backend_backup_2025-10-17_     ← Backup antigo
├── backend_OLD_DELETE             ← Backend antigo
├── frontend_backup_2025-10-17_    ← Backup frontend
├── frontend_NEW                   ← Frontend novo (não usado?)
├── frontend_OLD_DELETE            ← Frontend antigo
├── hpo-translations-data/         ← Dados HPO
├── logs/                          ← Logs
└── public/                        ← Frontend SERVIDO pelo Apache ✅
```

**⚠️ FALTA:** Pasta `backend/` ativa!

---

## 📊 PM2 Status

```
┌────┬─────────────┬─────────┬────────┬──────┬────────┬──────────┐
│ id │ name        │ version │ uptime │ ↺    │ status │ cpu/mem  │
├────┼─────────────┼─────────┼────────┼──────┼────────┼──────────┤
│ 0  │ cplp-backend│ 1.0.0   │ 8D     │ 171  │ online │ 0%/116MB │
│ 1  │ hpo-backend │ 1.0.0   │ 46h    │ 10   │ online │ 0%/97MB  │
└────┴─────────────┴─────────┴────────┴──────┴────────┴──────────┘
```

**HPO Backend:**
- Status: ONLINE (mas de onde?)
- Uptime: 46 horas (desde 17/Out 20:03)
- Script: `/var/www/html/hpo-platform/backend/dist/server.js`
- Porta: 3002 (NODE_ENV=production)
- Restarts: 10

---

## 🤔 POSSÍVEIS CENÁRIOS

### Cenário 1: Link Simbólico
```bash
# Backend pode ser link simbólico para backup
ls -la /var/www/html/hpo-platform/ | grep backend
```

### Cenário 2: PM2 Usa Snapshot Antigo
```bash
# PM2 salvou estado antigo e continua rodando
# mesmo sem pasta existir
pm2 save
pm2 resurrect
```

### Cenário 3: Backend Rodando de Outro Local
```bash
# Processo pode ter sido iniciado de outro lugar
pm2 info hpo-backend
# Ver "exec cwd"
```

---

## 🎯 COMANDOS PARA VOCÊ EXECUTAR

Conecte SSH e execute estes comandos:

```bash
# 1. Verificar se backend é link simbólico
ls -lah /var/www/html/hpo-platform/ | grep backend

# 2. Verificar processos Node rodando
ps aux | grep node | grep 3002

# 3. Testar se backend responde
curl http://localhost:3002/health

# 4. Testar se site carrega
curl -I https://hpo.raras-cplp.org

# 5. Ver Apache config
cat /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf | grep ProxyPass

# 6. Ver logs PM2
pm2 logs hpo-backend --lines 20

# 7. Verificar public (frontend)
ls -la /var/www/html/hpo-platform/public/ | head -15

# 8. Ver package.json do backup
cat /var/www/html/hpo-platform/backend_backup_2025-10-17_/package.json | grep '"name"' -A 3
```

---

## 🚦 PRÓXIMAS AÇÕES

### ✅ SE BACKEND ESTÁ FUNCIONANDO:

1. **Entender de onde está rodando**
2. **Criar link simbólico ou copiar backup para pasta backend/**
3. **Ou substituir completamente pelo novo código do GitHub**

### ❌ SE BACKEND NÃO ESTÁ FUNCIONANDO:

1. **Parar PM2** (`pm2 stop hpo-backend`)
2. **Clonar repositório novo do GitHub**
3. **Configurar e buildar**
4. **Iniciar PM2 com novo código**

---

## 📋 INFORMAÇÕES COLETADAS

### Recursos do Servidor ✅

```
Disco: 20GB total
RAM: 15GB (12GB disponíveis)
Swap: 472MB
Node.js: v18.20.4
```

### PM2 ✅

```
cplp-backend: ID 0, porta 3001 (NÃO MEXER)
hpo-backend: ID 1, porta 3002, ONLINE há 46h
```

### Estrutura Arquivos ⚠️

```
/var/www/html/hpo-platform/ existe
backend/ NÃO EXISTE
public/ existe (frontend)
Vários backups e pastas _OLD_DELETE
```

---

## ⚠️ RECOMENDAÇÃO IMEDIATA

**NÃO FAZER DEPLOY AINDA!**

Precisamos primeiro:

1. ✅ Entender por que PM2 está ONLINE sem pasta backend/
2. ✅ Testar se aplicação atual funciona
3. ✅ Decidir estratégia:
   - **OPÇÃO A:** Restaurar backend_backup para pasta backend/
   - **OPÇÃO B:** Deploy limpo do GitHub (recomendado)

---

## 🔍 PRÓXIMO PASSO

**Execute os 8 comandos acima e me reporte os resultados.**

Especialmente importante:
- Comando 1 (link simbólico?)
- Comando 3 (backend responde?)
- Comando 4 (site carrega?)

Com essas informações, vou criar o plano de deploy correto!

---

**Status:** ⏸️ DEPLOY PAUSADO - Aguardando investigação
