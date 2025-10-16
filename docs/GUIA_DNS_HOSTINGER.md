# 🌐 GUIA: Configurar DNS na Hostinger

**Domínio:** raras-cplp.org  
**Objetivo:** Criar subdomínio `hpo.raras-cplp.org`  
**Servidor:** 200.144.254.4

---

## 📋 PASSO A PASSO DETALHADO

### **1. Acessar painel Hostinger**

1.1. Abra navegador e acesse: **https://hpanel.hostinger.com/**

1.2. Faça login com:
   - Email da sua conta Hostinger
   - Senha

---

### **2. Encontrar seu domínio**

2.1. No painel principal (hPanel), procure por **"Domínios"** no menu lateral esquerdo

2.2. Clique em **"Domínios"**

2.3. Na lista de domínios, encontre **raras-cplp.org**

2.4. Clique em **"Gerenciar"** ou **"Manage"** ao lado do domínio

---

### **3. Acessar Zona DNS**

3.1. Na página do domínio, procure por uma das opções:
   - **"Zona DNS"** (português)
   - **"DNS Zone"** (inglês)
   - **"DNS / Nameservers"**
   - **"Advanced"** → **"DNS Zone Editor"**

3.2. Clique para abrir o editor de DNS

**Você verá uma tabela com registros DNS existentes**

---

### **4. Adicionar registro A para subdomínio**

4.1. Procure botão **"Adicionar registro"** ou **"Add Record"** ou **"Add New Record"**

4.2. Clique nele

4.3. **Preencha o formulário:**

```
┌─────────────────────────────────────────┐
│ Tipo / Type                             │
│ [Selecione: A]                          │
├─────────────────────────────────────────┤
│ Nome / Name / Host                      │
│ hpo                                     │
│ (NÃO digite raras-cplp.org!)           │
├─────────────────────────────────────────┤
│ Aponta para / Points to / Value         │
│ 200.144.254.4                           │
├─────────────────────────────────────────┤
│ TTL                                     │
│ 14400 (ou deixe padrão)                 │
│ (Pode ser: 300, 3600, 14400, 86400)    │
└─────────────────────────────────────────┘
```

**Detalhes importantes:**

| Campo | O que colocar | Observação |
|-------|---------------|------------|
| **Tipo** | `A` | Record Type A (IPv4) |
| **Nome** | `hpo` | APENAS "hpo" (sem domínio) |
| **Valor** | `200.144.254.4` | IP do servidor |
| **TTL** | `14400` ou padrão | Time To Live (segundos) |

**⚠️ ATENÇÃO no campo Nome:**
- ✅ Correto: `hpo`
- ❌ Errado: `hpo.raras-cplp.org`
- ❌ Errado: `hpo.raras-cplp.org.`

4.4. Clique em **"Salvar"** ou **"Save"** ou **"Add Record"**

---

### **5. (Opcional) Adicionar registro A para www**

Se quiser que `www.hpo.raras-cplp.org` também funcione:

5.1. Adicionar outro registro A:

```
Tipo: A
Nome: www.hpo
Valor: 200.144.254.4
TTL: 14400
```

**Ou usar CNAME:**

```
Tipo: CNAME
Nome: www.hpo
Aponta para: hpo.raras-cplp.org
TTL: 14400
```

---

### **6. Verificar registros adicionados**

6.1. Na tabela de DNS, você deve ver:

```
┌──────┬──────────┬─────────────────┬────────┐
│ Tipo │ Nome     │ Valor           │ TTL    │
├──────┼──────────┼─────────────────┼────────┤
│ A    │ hpo      │ 200.144.254.4   │ 14400  │
│ A    │ www.hpo  │ 200.144.254.4   │ 14400  │ (opcional)
└──────┴──────────┴─────────────────┴────────┘
```

✅ **Configuração DNS concluída!**

---

### **7. Aguardar propagação DNS**

**Tempo:** 5 minutos a 48 horas (geralmente 15-30 minutos)

7.1. Enquanto aguarda, DNS está se propagando pelos servidores mundiais

---

### **8. Verificar propagação (Teste 1)**

8.1. Abra **PowerShell** ou **cmd** no Windows

8.2. Digite:
```powershell
nslookup hpo.raras-cplp.org
```

**Resultado esperado (quando propagado):**
```
Servidor:  UnKnown
Address:  [IP do seu provedor]

Nome:    hpo.raras-cplp.org
Address:  200.144.254.4
```

**Se aparecer "Non-existent domain":** DNS ainda não propagou. Aguarde mais 10-15 minutos e teste novamente.

---

### **9. Verificar propagação (Teste 2 - Online)**

9.1. Acesse: **https://www.whatsmydns.net/**

9.2. No campo de busca, digite: `hpo.raras-cplp.org`

9.3. Selecione tipo: **A**

9.4. Clique em **"Search"**

**Você verá um mapa mundial:**
- ✅ **Verde (checkmark):** DNS propagado naquela região (mostra 200.144.254.4)
- ❌ **Vermelho (X):** Ainda não propagado

**Aguarde até que maioria dos pontos estejam verdes**

---

### **10. Teste final**

10.1. Quando DNS propagar, teste no navegador:

```
http://hpo.raras-cplp.org
```

**O que vai acontecer:**
- **Antes do deploy:** Erro 404 ou "Site não encontrado" (normal - Apache ainda não configurado)
- **Depois do deploy:** Site HPO carrega! ✅

---

## 🔍 TROUBLESHOOTING DNS

### **Problema: "Non-existent domain" após 1 hora**

**Possíveis causas:**

1. **Nameservers errados**

Verificar se domínio está usando nameservers Hostinger:

```bash
nslookup -type=NS raras-cplp.org
```

Deve retornar algo como:
```
ns1.dns-parking.com
ns2.dns-parking.com
```

Ou:
```
ns1.hostinger.com
ns2.hostinger.com
```

**Se estiver diferente:** O domínio pode estar apontando para outro servidor DNS (GoDaddy, Cloudflare, etc)

**Solução:** Configurar DNS no lugar correto ou trocar nameservers.

---

2. **Digitou nome errado**

Verificar na Hostinger se registro foi criado exatamente assim:
- Tipo: `A`
- Nome: `hpo` (só isso, sem domínio)
- Valor: `200.144.254.4`

---

3. **DNS cache local**

Limpar cache DNS do Windows:

```powershell
ipconfig /flushdns
```

Testar novamente:
```powershell
nslookup hpo.raras-cplp.org
```

---

### **Problema: DNS propagou mas site não carrega**

**Possíveis causas:**

1. **Apache não configurado ainda** (normal - aguarde deploy)

2. **Firewall bloqueando porta 80/443 no servidor**

Verificar no servidor:
```bash
sudo ufw status
```

Se firewall ativo, liberar:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. **Apache não está rodando**

```bash
sudo systemctl status apache2
```

Se parado:
```bash
sudo systemctl start apache2
```

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                    FLUXO DNS                            │
└─────────────────────────────────────────────────────────┘

1. hpanel.hostinger.com
   └─> Login
   
2. Domínios
   └─> raras-cplp.org
       └─> Gerenciar
   
3. Zona DNS / DNS Zone
   └─> Adicionar registro / Add Record
   
4. Formulário:
   ┌─────────────────┐
   │ Tipo: A         │
   │ Nome: hpo       │
   │ Valor: 200...4  │
   │ TTL: 14400      │
   └─────────────────┘
   └─> Salvar
   
5. Aguardar propagação (15-30 min)

6. Testar:
   nslookup hpo.raras-cplp.org
   └─> 200.144.254.4 ✅

7. Continuar deploy (Etapa 2 do guia principal)
```

---

## ✅ CHECKLIST DNS

- [ ] Acessei hpanel.hostinger.com
- [ ] Encontrei domínio raras-cplp.org
- [ ] Abri Zona DNS
- [ ] Adicionei registro A:
  - [ ] Tipo: A
  - [ ] Nome: hpo
  - [ ] Valor: 200.144.254.4
  - [ ] TTL: 14400
- [ ] Salvei registro
- [ ] Aguardei 15-30 minutos
- [ ] Testei nslookup (retornou 200.144.254.4)
- [ ] DNS propagado com sucesso! ✅

---

## 🆘 PRECISA DE AJUDA?

Se DNS não propagar após 1 hora:

1. Tire screenshot da tela de Zona DNS da Hostinger
2. Me envie
3. Vou verificar o que está errado

---

**Criado em:** 16 de Outubro de 2025  
**Tempo estimado:** 5-30 minutos (+ propagação DNS)  
**Próximo passo:** Etapa 2 do GUIA_DEPLOY_APACHE_PM2.md
