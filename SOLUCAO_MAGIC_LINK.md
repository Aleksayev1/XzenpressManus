# 🔧 SOLUÇÃO: Magic Link "Invalid API Key"

## 🐛 PROBLEMA IDENTIFICADO

**Sintomas:**
- ❌ Email não aparece no campo de Magic Link
- ❌ Erro "Invalid API Key" ao tentar enviar
- ❌ Magic Link não funciona

**Causa Raiz:**
- Variáveis de ambiente do Supabase não estão configuradas corretamente no ambiente de produção (Netlify)

---

## ✅ SOLUÇÃO COMPLETA

### **1. VERIFICAR VARIÁVEIS NO NETLIFY**

**Acesse:**
1. https://app.netlify.com/
2. Sites → XZenPress
3. Site settings → Environment variables

**Variáveis Necessárias:**
```
VITE_SUPABASE_URL=https://dqjcbwjqrenubdzalicy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:**
- As variáveis devem começar com `VITE_` para serem incluídas no build
- Copie exatamente do arquivo `.env` local
- Não compartilhe a ANON_KEY publicamente

---

### **2. CONFIGURAR EMAIL NO SUPABASE**

**Acesse:**
1. https://supabase.com/dashboard
2. Projeto: XZenPress
3. Authentication → Email Templates

**Templates a Configurar:**

#### **A) Confirm Signup (Magic Link)**
```html
<h2>Bem-vindo ao XZenPress!</h2>
<p>Clique no link abaixo para fazer login:</p>
<p><a href="{{ .ConfirmationURL }}">Acessar XZenPress</a></p>
```

#### **B) Magic Link**
```html
<h2>Seu Link de Acesso - XZenPress</h2>
<p>Clique no link abaixo para fazer login sem senha:</p>
<p><a href="{{ .ConfirmationURL }}">Fazer Login</a></p>
<p>Este link expira em 1 hora.</p>
```

---

### **3. CONFIGURAR SMTP (OPCIONAL)**

**Se quiser usar email customizado:**

**Acesse:**
1. Supabase Dashboard
2. Project Settings → Auth
3. SMTP Settings

**Opções:**

#### **Opção A: Usar Supabase (Padrão)**
- ✅ Já funciona out-of-the-box
- ✅ Sem configuração necessária
- ⚠️ Limite: 3 emails/hora (plano gratuito)

#### **Opção B: SendGrid (Recomendado)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SG.xxxxxxxxxxxxx
From Email: noreply@xzenpress.com
```

#### **Opção C: Gmail**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Password: senha-de-app (não a senha normal!)
From Email: seu-email@gmail.com
```

---

### **4. CONFIGURAR REDIRECT URLs**

**Acesse:**
1. Supabase Dashboard
2. Authentication → URL Configuration

**Adicionar URLs:**
```
Site URL: https://xzenpress.com
Redirect URLs:
  - https://xzenpress.com
  - https://xzenpress.com/auth/callback
  - http://localhost:5173 (para desenvolvimento)
```

---

## 🧪 TESTAR MAGIC LINK

### **Passo a Passo:**

1. **Abrir site:** https://xzenpress.com
2. **Clicar em:** "Entrar"
3. **Escolher:** "Magic Link"
4. **Digitar email:** seu@email.com
5. **Clicar:** "Enviar Link Mágico"
6. **Verificar:**
   - ✅ Mensagem de sucesso aparece
   - ✅ Email chega na caixa de entrada
   - ✅ Link funciona e faz login

### **Se não funcionar:**

**Verificar:**
- [ ] Variáveis no Netlify estão corretas
- [ ] Rebuild do site foi feito após adicionar variáveis
- [ ] Email não está na pasta de spam
- [ ] Supabase Auth está habilitado
- [ ] Redirect URLs estão configuradas

---

## 🔍 DEBUG

### **Console do Navegador:**

Abra o console (F12) e procure por:

```javascript
// Deve aparecer:
Supabase URL: https://dqjcbwjqrenubdzalicy.supabase.co
Supabase Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (primeiros caracteres)

// Se aparecer "undefined":
❌ Variáveis não estão configuradas no Netlify
```

### **Network Tab:**

Procure por requisição para:
```
POST https://dqjcbwjqrenubdzalicy.supabase.co/auth/v1/otp
```

**Status esperado:** 200 OK

**Se der erro 400/401:**
- ❌ API Key inválida ou expirada
- ❌ Verificar variáveis no Netlify

---

## 📋 CHECKLIST RÁPIDO

### **Ambiente Local (Desenvolvimento):**
- [ ] Arquivo `.env` existe
- [ ] Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidas
- [ ] `npm run dev` reiniciado após criar `.env`

### **Ambiente Produção (Netlify):**
- [ ] Variáveis adicionadas em "Environment variables"
- [ ] Site foi "Rebuild" após adicionar variáveis
- [ ] Deploy foi concluído com sucesso

### **Supabase:**
- [ ] Projeto está ativo
- [ ] Authentication está habilitado
- [ ] Email provider está configurado
- [ ] Redirect URLs estão corretas

---

## 🚀 SOLUÇÃO RÁPIDA (AGORA)

**Se você está vendo este erro AGORA:**

1. **Acesse:** https://app.netlify.com/
2. **Vá em:** Sites → XZenPress → Site settings → Environment variables
3. **Adicione:**
   ```
   VITE_SUPABASE_URL = https://dqjcbwjqrenubdzalicy.supabase.co
   VITE_SUPABASE_ANON_KEY = [copie do .env local]
   ```
4. **Clique em:** "Save"
5. **Vá em:** Deploys → Trigger deploy → Deploy site
6. **Aguarde:** 2-3 minutos
7. **Teste:** https://xzenpress.com

---

## 📧 ALTERNATIVA: USAR GOOGLE LOGIN

Enquanto o Magic Link não funciona, use:

**Google OAuth:**
- ✅ Já está funcionando
- ✅ Não precisa de SMTP
- ✅ Login com 1 clique

**Como ativar:**
- Já está ativo no site
- Botão "Continuar com Google"

---

## 💡 DICA PRO

**Para evitar problemas futuros:**

1. **Sempre use variáveis de ambiente para:**
   - API Keys
   - URLs de serviços
   - Tokens secretos

2. **Nunca commite `.env` no Git:**
   - Já está no `.gitignore`
   - Use `.env.example` como template

3. **Teste em produção após deploy:**
   - Magic Link
   - Google OAuth
   - Pagamentos

---

**Criado em:** 16/01/2026 10:03
**Status:** Aguardando configuração no Netlify
