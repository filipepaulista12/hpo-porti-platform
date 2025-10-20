# 📤 INSTRUÇÕES PARA UPLOAD DO FRONTEND CORRIGIDO

## ✅ O QUE FOI CORRIGIDO
- **API_BASE_URL** agora detecta automaticamente o ambiente:
  - Local: `http://localhost:3001`
  - Produção: `https://hpo.raras-cplp.org`

## 📁 ARQUIVOS PARA FAZER UPLOAD VIA FILEZILLA

### 1️⃣ Abra o FileZilla
- Conecte ao servidor: `200.144.254.4`
- Usuário: `ubuntu`
- Senha: `vFpyJS4FA`

### 2️⃣ Navegue até o diretório remoto
```
/var/www/html/hpo-platform/public/
```

### 3️⃣ Faça upload dos seguintes arquivos:

#### ✅ Arquivo 1: `index.html`
- **Local**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\index.html`
- **Remoto**: `/var/www/html/hpo-platform/public/index.html`
- **Ação**: SUBSTITUIR o arquivo existente

#### ✅ Arquivo 2: `index.Ca87mzxP.js` (NOVO!)
- **Local**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\assets\index.Ca87mzxP.js`
- **Remoto**: `/var/www/html/hpo-platform/public/assets/index.Ca87mzxP.js`
- **Ação**: ADICIONAR (novo arquivo)
- **Tamanho**: 1.5MB

#### ℹ️ Arquivo 3: `index.CYHHxVzV.css` (pode manter ou substituir)
- **Local**: `C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\assets\index.CYHHxVzV.css`
- **Remoto**: `/var/www/html/hpo-platform/public/assets/index.CYHHxVzV.css`
- **Ação**: OPCIONAL (CSS não mudou muito)

### 4️⃣ Após o upload, teste no navegador:
1. Abra: https://hpo.raras-cplp.org
2. Pressione `Ctrl + Shift + R` (força reload sem cache)
3. Verifique se os botões de login estão **HABILITADOS**
4. Tente clicar em "Login com ORCID iD"

## 🔍 VERIFICAÇÃO RÁPIDA
Após upload, teste via SSH:
```bash
ssh ubuntu@200.144.254.4
ls -lh /var/www/html/hpo-platform/public/assets/index.Ca87mzxP.js
# Deve mostrar: 1.5M (1502401 bytes)

curl -s https://hpo.raras-cplp.org/api/auth/config
# Deve retornar JSON com providers
```

## 🎯 RESULTADO ESPERADO
- ✅ Página carrega sem erro "Não foi possível conectar ao servidor"
- ✅ Botões ORCID e LinkedIn ficam **HABILITADOS**
- ✅ Ao clicar, abre página de autenticação OAuth

## ❌ SE DER ERRO APÓS UPLOAD
1. Verifique se o arquivo `index.html` referencia `index.Ca87mzxP.js`
2. Confirme que o arquivo foi para `/var/www/html/hpo-platform/public/assets/`
3. Teste `curl -I https://hpo.raras-cplp.org/assets/index.Ca87mzxP.js` (deve retornar 200 OK)
