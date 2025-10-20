# 🔥 Guia Completo: Solução Firewall Corporativo

> Guia completo para resolver bloqueio de portas de desenvolvimento em ambiente corporativo

---

## 📋 Diagnóstico do Problema

**Sintoma**: Não consegue acessar `localhost:3000` ou outras portas de desenvolvimento  
**Contexto**: Ambiente corporativo com firewall ativo  
**Alternativas Funcionando**: Docker (localhost:3001) funciona ✅

---

## 🎯 Solução 1: Windows Firewall (RECOMENDADO) ⭐

### Passo 1: Executar Script Automático

1. **Abra PowerShell como ADMINISTRADOR**:
   - Pressione `Windows + X`
   - Clique em "Windows PowerShell (Admin)" ou "Terminal (Admin)"

2. **Execute o script**:
   ```powershell
   cd "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation"
   .\fix-firewall-admin.ps1
   ```

3. **O script vai criar automaticamente**:
   - ✅ Regra INBOUND para portas 3000-6000
   - ✅ Regra OUTBOUND para portas 3000-6000
   - ✅ Regra específica para Node.js
   - ✅ Habilitar em todos os perfis (Domain, Private, Public)

### Passo 2: Testar

```powershell
cd plataforma-raras-cpl
npm run dev
```

Acesse: http://localhost:3000

---

## 🔧 Solução 2: Criar Regras Manualmente

Se preferir criar as regras manualmente via interface gráfica:

### Via Windows Defender Firewall

1. **Abrir Firewall**:
   - Pressione `Windows + R`
   - Digite: `wf.msc`
   - Enter

2. **Criar Regra Inbound**:
   - Clique em "Regras de Entrada" (Inbound Rules)
   - Clique em "Nova Regra..." (New Rule)
   - Tipo: **Porta**
   - Protocolo: **TCP**
   - Portas: **3000-6000**
   - Ação: **Permitir a conexão**
   - Perfis: **Marque todos** (Domain, Private, Public)
   - Nome: `HPO Dev Ports`

3. **Criar Regra Outbound** (mesmos passos):
   - Clique em "Regras de Saída" (Outbound Rules)
   - Repita o processo acima

---

## 🌐 Solução 3: Proxy Reverso com Porta Permitida

Se o firewall bloqueia 3000-6000 mas permite 80/443:

### Criar arquivo `docker-compose.proxy.yml`:

```yaml
version: '3.8'
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
```

### Criar `nginx-proxy.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://host.docker.internal:3000;
            proxy_set_header Host $host;
        }

        location /api/ {
            proxy_pass http://host.docker.internal:3001/api/;
            proxy_set_header Host $host;
        }
    }
}
```

### Usar:
```powershell
docker-compose -f docker-compose.proxy.yml up -d
# Acesse: http://localhost (porta 80)
```

---

## 🔐 Solução 4: Port Forwarding

Redirecionar porta bloqueada para porta permitida:

```powershell
# Como Admin - Redirecionar 3000 → 80
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=3000 connectaddress=127.0.0.1

# Verificar
netsh interface portproxy show all

# Usar
cd plataforma-raras-cpl
npm run dev
# Acesse: http://localhost (porta 80 → 3000)

# Remover depois
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
```

---

## 📱 Solução 5: Usar 127.0.0.1 ao invés de localhost

```powershell
npm run dev
# Acesse: http://127.0.0.1:3000
```

---

## 📊 Ordem de Tentativas Recomendada

1. ⭐ **Solução 1**: Windows Firewall (script automático)
2. **Solução 5**: Testar 127.0.0.1
3. **Solução 4**: Port forwarding temporário
4. **Solução 3**: Proxy reverso Docker
5. 🏢 **Último recurso**: Contatar TI

---

## 🧪 Teste de Validação

```powershell
# Teste 1: Porta disponível?
Test-NetConnection -ComputerName localhost -Port 3000

# Teste 2: Bind funciona?
$l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, 3000)
$l.Start()
Write-Host "✅ OK!"
$l.Stop()

# Teste 3: Frontend inicia?
cd plataforma-raras-cpl
npm run dev
```

---

## 🔄 Reverter Mudanças

```powershell
# Remover regras firewall
Get-NetFirewallRule -DisplayName "HPO-Dev-*" | Remove-NetFirewallRule

# Remover port forwarding
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
```

---

**Data**: 18/10/2025 | **Versão**: 2.0 | **Status**: Pronto 🔥
