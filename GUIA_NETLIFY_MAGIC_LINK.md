# 🚀 GUIA PASSO A PASSO: Configurar Magic Link no Netlify

## 📋 VARIÁVEIS QUE VOCÊ PRECISA ADICIONAR:

```
VITE_SUPABASE_URL=https://dqjcbwjqrenubdzalicy.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxamNid2pxcmVudWJkemFsaWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE0MjcsImV4cCI6MjA3OTUwNzQyN30.KxH3diGoF-tkwLdPdPuxC5yQ8Rjpr2grV4VgGNUk5Vo
```

---

## 🎯 PASSO A PASSO:

### **PASSO 1: Acessar Netlify**

1. Abra: https://app.netlify.com/
2. Faça login (se necessário)
3. Você verá a lista de sites

---

### **PASSO 2: Selecionar o Site XZenPress**

1. Clique no site **"XZenPress"** (ou o nome que você deu)
2. Você será levado para o dashboard do site

---

### **PASSO 3: Ir para Environment Variables**

1. No menu lateral, clique em **"Site settings"**
2. No menu esquerdo, clique em **"Environment variables"**
3. Você verá a lista de variáveis (pode estar vazia)

---

### **PASSO 4: Adicionar VITE_SUPABASE_URL**

1. Clique no botão **"Add a variable"** (ou "Add variable")
2. Preencha:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://dqjcbwjqrenubdzalicy.supabase.co`
   - **Scopes:** Deixe marcado "All scopes" (ou marque "Production")
3. Clique em **"Create variable"** ou **"Save"**

---

### **PASSO 5: Adicionar VITE_SUPABASE_ANON_KEY**

1. Clique novamente em **"Add a variable"**
2. Preencha:
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** (copie o valor completo abaixo)
   
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxamNid2pxcmVudWJkemFsaWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE0MjcsImV4cCI6MjA3OTUwNzQyN30.KxH3diGoF-tkwLdPdPuxC5yQ8Rjpr2grV4VgGNUk5Vo
```

   - **Scopes:** Deixe marcado "All scopes" (ou marque "Production")
3. Clique em **"Create variable"** ou **"Save"**

---

### **PASSO 6: Verificar Variáveis**

Você deve ver agora 2 variáveis:

```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
```

---

### **PASSO 7: Rebuild do Site**

**IMPORTANTE:** As variáveis só entram em vigor após rebuild!

1. No menu lateral, clique em **"Deploys"**
2. Clique no botão **"Trigger deploy"** (canto superior direito)
3. Selecione **"Deploy site"**
4. Aguarde 2-3 minutos (você verá "Building" → "Published")

---

### **PASSO 8: Testar Magic Link**

1. Acesse: **https://xzenpress.com**
2. Clique em **"Entrar"**
3. Clique na tab **"Magic Link"**
4. Digite seu email
5. Clique em **"Enviar Link Mágico"**

**Resultado esperado:**
```
✅ Mensagem: "Link mágico enviado! Verifique seu email"
✅ Email chega na caixa de entrada
✅ Clicar no link faz login
```

---

## 🔍 TROUBLESHOOTING

### **Se não funcionar:**

#### **Problema 1: "Invalid API Key"**
```
Causa: Variáveis não foram adicionadas corretamente
Solução: 
1. Verificar se as variáveis estão no Netlify
2. Verificar se o rebuild foi feito
3. Aguardar 5 minutos e tentar novamente
```

#### **Problema 2: Email não chega**
```
Causa: Supabase Auth não configurado
Solução:
1. Acessar: https://supabase.com/dashboard
2. Projeto XZenPress → Authentication
3. Verificar se "Email" está habilitado
4. Verificar "Email Templates"
```

#### **Problema 3: Link não funciona**
```
Causa: Redirect URL não configurada
Solução:
1. Supabase Dashboard → Authentication → URL Configuration
2. Adicionar: https://xzenpress.com
3. Salvar
```

---

## ✅ CHECKLIST FINAL

Antes de testar, confirme:

- [ ] VITE_SUPABASE_URL adicionada no Netlify
- [ ] VITE_SUPABASE_ANON_KEY adicionada no Netlify
- [ ] Rebuild do site foi feito
- [ ] Deploy foi concluído (status "Published")
- [ ] Aguardou 2-3 minutos após deploy

---

## 🎯 PRÓXIMOS PASSOS APÓS FUNCIONAR

1. **Testar Google OAuth:** Verificar se continua funcionando
2. **Testar Email + Senha:** Verificar login tradicional
3. **Monitorar:** Ver qual método os usuários preferem

---

## 📊 MÉTRICAS PARA ACOMPANHAR

Após 1 semana, verifique no Supabase:
- Quantos logins por Magic Link
- Quantos logins por Google
- Quantos logins por Email + Senha
- Taxa de sucesso de cada método

---

**Data:** 16/01/2026 10:14
**Status:** Aguardando configuração no Netlify
**Tempo estimado:** 5-10 minutos
