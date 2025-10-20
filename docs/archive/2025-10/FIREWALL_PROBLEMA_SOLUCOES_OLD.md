# 🔥 Problema: Firewall Corporativo Bloqueando Desenvolvimento Local

## 🚨 Situação Atual

**Problema**: Firewall corporativo do Windows bloqueia TODAS as portas de desenvolvimento local (3000-6000+), impossibilitando desenvolvimento normal.

**Sintomas**:
- `npm run dev` inicia servidor (logs mostram "Server running on port 3001")
- Mas `curl http://localhost:3001` FALHA
- `netstat -ano | Select-String "3001"` retorna VAZIO (porta não escuta)
- Mesmo com regras de firewall adicionadas, conexões são bloqueadas

**Workaround Atual**: Docker (funciona mas é lento para desenvolvimento iterativo)

---

## ✅ Soluções Possíveis (Você TEM Perfil ADMIN!)

### 🥇 OPÇÃO 1: Regras de Firewall Windows (RECOMENDADO)

**Vantagem**: Solução mais direta e rápida  
**Complexidade**: Baixa  

```powershell
# Execute no PowerShell como ADMINISTRADOR:

# 1. Desabilitar firewall para perfil Privado (desenvolvimento local)
Set-NetFirewallProfile -Profile Private -Enabled False

# 2. OU criar regra específica para Node.js
$nodePath = (Get-Command node).Source
New-NetFirewallRule -DisplayName "Node.js Development - All Ports" `
  -Direction Inbound `
  -Program $nodePath `
  -Action Allow `
  -Protocol TCP `
  -LocalPort Any `
  -Profile Private

# 3. OU permitir todas conexões localhost
New-NetFirewallRule -DisplayName "Localhost Development" `
  -Direction Inbound `
  -LocalAddress 127.0.0.1,::1 `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 3000-9000 `
  -Profile Private,Domain

# Verificar regras criadas
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Development*"} | Format-Table DisplayName, Enabled, Direction, Action
```

**Se ainda não funcionar**: O problema pode ser um software de segurança corporativo (tipo Crowdstrike, Carbon Black, etc) que opera ACIMA do Windows Firewall.

---

### 🥈 OPÇÃO 2: WSL2 com Bridge Network

**Vantagem**: Isola ambiente dev da rede Windows  
**Complexidade**: Média

```powershell
# 1. Instalar WSL2 (se não tiver)
wsl --install -d Ubuntu

# 2. Configurar .wslconfig para usar bridge
# Criar/editar: C:\Users\<SEU_USER>\.wslconfig
[wsl2]
networkingMode=bridged
vmSwitch=WSL

# 3. Trabalhar DENTRO do WSL2
wsl
cd /mnt/c/Users/up739088/Desktop/aplicaçoes,sites,etc/hpo_translation
npm run dev
# Acessar de: http://localhost:3001 (Windows consegue acessar WSL2)
```

---

### 🥉 OPÇÃO 3: SSH Tunnel / Port Forwarding

**Vantagem**: Bypass completo do firewall local  
**Complexidade**: Média

```powershell
# Usar SSH para fazer tunnel do Docker para localhost
# (Requer servidor SSH local - pode usar OpenSSH do Windows)

# 1. Habilitar OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# 2. Criar tunnel
ssh -L 3001:localhost:3001 localhost
# Agora http://localhost:3001 vai para o tunnel
```

---

### 🏅 OPÇÃO 4: Configurar Proxy/VPN Interno

**Vantagem**: Solução corporativa "oficial"  
**Complexidade**: Alta (requer TI)

- Pedir à TI para configurar whitelist de portas para seu IP
- Ou usar VPN interna que bypass firewall para devs
- Ou configurar proxy reverso (Nginx/Apache) em servidor permitido

---

### 🔧 OPÇÃO 5: Usar Porta ALTA (Menos Provável de Estar Bloqueada)

**Vantagem**: Simples de testar  
**Complexidade**: Baixa

```bash
# Testar portas altas (8000+, 30000+, 50000+)
PORT=8080 npm run dev
PORT=30000 npm run dev
PORT=50000 npm run dev
```

Algumas empresas só bloqueiam portas "conhecidas" (80, 443, 3000-5000).

---

## 🔍 Diagnóstico Adicional

Execute estes comandos para identificar O QUE está bloqueando:

```powershell
# 1. Ver TODAS as regras de firewall ativas
Get-NetFirewallRule -Enabled True | 
  Where-Object {$_.Direction -eq "Inbound"} | 
  Format-Table DisplayName, Profile, Action | 
  Out-File firewall-rules.txt

# 2. Ver processos de segurança rodando
Get-Process | Where-Object {$_.ProcessName -match "crowd|carbon|defender|endpoint|security"} | 
  Select-Object ProcessName, Id, Path

# 3. Ver políticas de grupo aplicadas
gpresult /H gpreport.html
# Abrir gpreport.html e buscar por "firewall" ou "network"

# 4. Testar se é firewall ou outro bloqueio
# Desabilitar Windows Defender Firewall temporariamente
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
# TESTE AGORA
# Se ainda falhar → NÃO É O WINDOWS FIREWALL!
# Reabilitar:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

## 📋 Plano de Ação

1. **TESTAR OPÇÃO 1** (desabilitar firewall Private profile) → 5 min
2. Se falhar, **DIAGNOSTICAR** (executar comandos acima) → 10 min
3. Se for software corporativo, **TESTAR OPÇÃO 2** (WSL2) → 30 min
4. Se ainda falhar, **ESCALAR PARA TI** com evidências → 1 dia

---

## 🎯 Impacto no Desenvolvimento

**Atualmente**: 
- ❌ Hot reload não funciona
- ❌ Debug local impossível
- ❌ Testes lentos (rebuild Docker a cada mudança)
- ⏱️ Perda de ~30-40% de produtividade

**Após resolver**:
- ✅ Desenvolvimento normal
- ✅ Hot reload instantâneo
- ✅ Debug local funcional
- ✅ Testes rápidos

**Prioridade**: 🔴 CRÍTICA

---

## 📝 Notas

- Você TEM perfil ADMIN → pode executar soluções 1, 2, 3, 5
- Solução 4 requer TI → só se outras falharem
- Docker funciona mas NÃO É SOLUÇÃO de longo prazo

**Próximo Passo**: Executar OPÇÃO 1 assim que possível!
