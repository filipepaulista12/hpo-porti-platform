# ⚡ Comandos Rápidos - Iniciar Testes

## 🚀 INICIAR TUDO (Copy & Paste)

### Terminal 1: Backend
```powershell
cd "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend"
npm run dev
```

### Terminal 2: Frontend
```powershell
cd "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl"
npm run dev
```

### Navegador
```
http://localhost:5173
```

---

## 👤 Credenciais de Teste

### TRANSLATOR (não vê admin)
```
Email: translator@test.com
Senha: Test123!
```

### MODERATOR (vê "Rejeitar" mas não "Aprovar")
```
Email: moderator@test.com
Senha: Test123!
```

### ADMIN (vê tudo)
```
Email: admin@test.com
Senha: Test123!
```

---

## 🧪 Sequência de Testes (5 minutos)

1. Login com `translator@test.com`
   - ❌ Não deve ver "👑 Admin"
   - ✅ Deve funcionar normalmente

2. Forçar acesso admin: digite `http://localhost:5173/#admin`
   - ✅ Deve ver tela "🔒 Acesso Restrito"

3. Logout → Login com `moderator@test.com`
   - ✅ Deve ver "👑 Admin"
   - ✅ Clicar → Painel abre
   - ✅ Deve ver "❌ Rejeitar"
   - ❌ NÃO deve ver "✅ Aprovar"

4. Logout → Login com `admin@test.com`
   - ✅ Deve ver "👑 Admin"
   - ✅ Deve ver "✅ Aprovar"
   - ✅ Deve ver "❌ Rejeitar"

5. **SUCESSO!** Sistema está funcionando ✅

---

## 🐛 Se Algo Der Errado

### Backend não inicia?
```powershell
cd hpo-platform-backend
npm install
npm run dev
```

### Frontend não inicia?
```powershell
cd plataforma-raras-cpl
npm install
npm run dev
```

### Usuários não existem?
```powershell
cd hpo-platform-backend
npx ts-node scripts/create-test-users.ts
```

---

## ✅ Verificação Rápida

Execute isto para ver se está tudo OK:

```powershell
# Backend rodando?
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing

# Frontend rodando?
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
```

Se ambos retornarem 200 OK, está tudo pronto! 🎉
