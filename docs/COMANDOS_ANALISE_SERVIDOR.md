# 🔍 COMANDOS PARA ANÁLISE MANUAL DO SERVIDOR

**Servidor:** 200.144.254.4  
**Usuário:** ubuntu  
**Senha:** vFpyJS4FA

---

## 📋 INSTRUÇÕES:

1. Abra o **PuTTY** ou **terminal SSH**
2. Conecte em: `ssh ubuntu@200.144.254.4`
3. Digite a senha: `vFpyJS4FA`
4. Copie e cole cada comando abaixo (um de cada vez)
5. Me envie os resultados aqui no chat

---

## 🔧 COMANDOS PARA EXECUTAR:

### **1. Informações Básicas**
```bash
echo "=== INFORMAÇÕES BÁSICAS ==="
hostname
uname -a
whoami
pwd
```

### **2. Espaço em Disco**
```bash
echo ""
echo "=== ESPAÇO EM DISCO ==="
df -h
```

### **3. Memória RAM**
```bash
echo ""
echo "=== MEMÓRIA RAM ==="
free -h
```

### **4. Docker**
```bash
echo ""
echo "=== DOCKER ==="
docker --version
docker ps
docker images
```

### **5. PM2 (Process Manager)**
```bash
echo ""
echo "=== PM2 PROCESSOS ==="
pm2 --version
pm2 list
pm2 status
```

### **6. Nginx**
```bash
echo ""
echo "=== NGINX ==="
nginx -v
systemctl status nginx
```

### **7. Sites Nginx Configurados**
```bash
echo ""
echo "=== SITES NGINX ==="
ls -la /etc/nginx/sites-enabled/
```

### **8. Estrutura /var/www/**
```bash
echo ""
echo "=== ESTRUTURA /var/www/ ==="
ls -la /var/www/
```

### **9. Site Filipe (seu site atual)**
```bash
echo ""
echo "=== SITE FILIPE ==="
ls -la /var/www/html/filipe/
du -sh /var/www/html/filipe/
```

### **10. Portas em Uso**
```bash
echo ""
echo "=== PORTAS EM USO ==="
sudo ss -tlnp | head -30
# ou se não funcionar:
sudo netstat -tlnp | head -30
```

### **11. Processos Rodando**
```bash
echo ""
echo "=== PROCESSOS RODANDO ==="
ps aux | grep -E 'node|python|php|nginx|apache|docker|pm2' | grep -v grep
```

### **12. Certificados SSL**
```bash
echo ""
echo "=== CERTIFICADOS SSL ==="
sudo ls -la /etc/letsencrypt/live/
```

### **13. Versões de Software**
```bash
echo ""
echo "=== VERSÕES INSTALADAS ==="
node --version
npm --version
python3 --version
php --version | head -1
```

### **14. Configuração Nginx do Site Filipe**
```bash
echo ""
echo "=== CONFIG NGINX SITE FILIPE ==="
cat /etc/nginx/sites-enabled/filipe 2>/dev/null || cat /etc/nginx/sites-enabled/default 2>/dev/null | head -50
```

### **15. Domínio Configurado**
```bash
echo ""
echo "=== DOMÍNIOS CONFIGURADOS ==="
cat /etc/nginx/sites-enabled/* | grep server_name
```

---

## 📊 OPÇÃO ALTERNATIVA (Tudo de uma vez):

Se preferir executar tudo de uma vez, copie e cole este comando único:

```bash
echo "=== ANÁLISE COMPLETA DO SERVIDOR ==="; \
echo ""; echo "1. INFO BÁSICA"; hostname; uname -a; whoami; pwd; \
echo ""; echo "2. DISCO"; df -h; \
echo ""; echo "3. RAM"; free -h; \
echo ""; echo "4. DOCKER"; docker --version 2>&1; docker ps 2>&1; \
echo ""; echo "5. PM2"; pm2 --version 2>&1; pm2 list 2>&1; \
echo ""; echo "6. NGINX"; nginx -v 2>&1; systemctl status nginx --no-pager 2>&1 | head -10; \
echo ""; echo "7. SITES NGINX"; ls -la /etc/nginx/sites-enabled/ 2>&1; \
echo ""; echo "8. /var/www/"; ls -la /var/www/ 2>&1; \
echo ""; echo "9. SITE FILIPE"; ls -la /var/www/html/filipe/ 2>&1; du -sh /var/www/html/filipe/ 2>&1; \
echo ""; echo "10. PORTAS"; sudo ss -tlnp 2>&1 | head -25; \
echo ""; echo "11. PROCESSOS"; ps aux | grep -E 'node|python|php|nginx|pm2' | grep -v grep; \
echo ""; echo "12. SSL"; sudo ls -la /etc/letsencrypt/live/ 2>&1; \
echo ""; echo "13. VERSÕES"; node --version 2>&1; npm --version 2>&1; python3 --version 2>&1; \
echo ""; echo "14. DOMÍNIOS"; cat /etc/nginx/sites-enabled/* 2>&1 | grep server_name; \
echo ""; echo "=== FIM ==="
```

---

## 🎯 O QUE PRECISO SABER:

Com base nos resultados, vou identificar:

1. ✅ **Portas disponíveis** (para backend HPO)
2. ✅ **Espaço em disco** (se tem espaço suficiente)
3. ✅ **PM2 configurado** (para gerenciar processos)
4. ✅ **Docker disponível** (opção alternativa)
5. ✅ **Nginx configuração** (onde adicionar novo site)
6. ✅ **Onde colocar o projeto** (criar pasta própria ou usar /var/www/html/filipe)
7. ✅ **SSL já configurado** (para adicionar subdomínio)
8. ✅ **Recursos disponíveis** (RAM, CPU)

---

## ⚠️ IMPORTANTE:

**NÃO VOU ALTERAR NADA!** Apenas vou:
- ✅ Ler configurações
- ✅ Listar arquivos
- ✅ Ver processos
- ✅ Analisar portas
- ✅ Criar relatório
- ✅ Propor plano de deploy seguro

---

**Pode conectar e me enviar os resultados?** 🔍

Ou, se preferir, me dê acesso temporário via SSH para eu fazer a análise diretamente (garanto que não vou alterar nada).
