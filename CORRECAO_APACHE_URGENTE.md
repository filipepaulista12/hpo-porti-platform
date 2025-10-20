# ⚠️ CORREÇÃO URGENTE - APACHE PROXY (19/10/2025 20:30)

**Problema**: Backend não responde porque Apache está mantendo `/api` na URL

**Solução**: Substituir arquivo de configuração do Apache

---

## 📤 **ENVIAR VIA FILEZILLA**:

**Arquivo LOCAL**:
```
C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo.raras-cplp.org.conf
```

**Destino SERVIDOR**:
```
/tmp/hpo.raras-cplp.org.conf
```

⚠️ **Envie para /tmp/ primeiro** (você não tem permissão para escrever direto em /etc/apache2/)

---

## 🔧 **DEPOIS DO UPLOAD, ME AVISE** que eu executo:

```bash
# Copiar arquivo para local correto
sudo cp /tmp/hpo.raras-cplp.org.conf /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf

# Habilitar módulo rewrite (se não estiver)
sudo a2enmod rewrite

# Testar configuração
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Testar API
curl -s https://hpo.raras-cplp.org/api/health
```

---

## ✅ **MUDANÇA**:

**ANTES** (errado):
```apache
ProxyPass /api http://localhost:3002/api
```
→ Enviava: `/api/health` → Backend recebia: `/api/health` ❌

**DEPOIS** (correto):
```apache
RewriteRule ^/api/(.*)$ /$1 [P,L]
ProxyPassReverse / http://localhost:3002/
```
→ Enviava: `/api/health` → Backend recebe: `/health` ✅

---

**ENVIE O ARQUIVO e ME AVISE!** 🚀
