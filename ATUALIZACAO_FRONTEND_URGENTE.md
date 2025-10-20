# 🔄 ATUALIZAÇÃO FRONTEND - URGENTE

**Data**: 19 de Outubro 2025  
**Problema**: Frontend no servidor estava desatualizado (versão sem LinkedIn, sem PORTI completo)  
**Solução**: Novo build feito localmente, precisa ser enviado

---

## ✅ **JÁ FEITO**:

1. ✅ Novo build do frontend (`npm run build`) - **5.72 KB index.html** (antes: 2.2KB)
2. ✅ Limpeza da pasta `public/` no servidor
3. ✅ Pronto para receber novos arquivos

---

## 📤 **O QUE VOCÊ PRECISA FAZER AGORA**:

### **Via FileZilla**:

**Pasta LOCAL (Windows)**:  
`C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl\dist\`

**Destino SERVIDOR**:  
`/var/www/html/hpo-platform/public/`

**Enviar**:
- ✅ **TODO o conteúdo** da pasta `dist\` (não a pasta, só o conteúdo dentro)
  - `assets\` (pasta inteira com novos arquivos CSS/JS)
  - `index.html` (5.72 KB - atualizado)

---

## 🎯 **IMPORTANTE**:

1. **SOBRESCREVER** tudo que está em `public/`
2. Enviar o **conteúdo DE DENTRO** de `dist\`, não a pasta `dist\` em si
3. Estrutura final deve ser:
   ```
   /var/www/html/hpo-platform/public/
   ├── assets/
   │   ├── index.CUZwEmOD.js  (novo, 1.5MB)
   │   └── index.CYHHxVzV.css (novo, 315KB)
   └── index.html (novo, 5.72KB)
   ```

---

## ⏱️ **DEPOIS DO UPLOAD**:

Quando terminar, **ME AVISE** que eu vou:
1. Limpar cache do Apache
2. Testar o novo frontend
3. Verificar se PORTI, LinkedIn, etc aparecem
4. Confirmar que tudo está atualizado

---

## 🔗 **CONEXÃO FILEZILLA**:

```
Host: sftp://200.144.254.4
Porta: 22
Usuário: ubuntu
Senha: vFpyJS4FA
```

---

**ENVIE AGORA e ME AVISE!** 🚀
