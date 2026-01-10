# 🔑 Como Pegar as Chaves do Stripe

## Passo a Passo:

### 1️⃣ Acesse o Dashboard do Stripe
🔗 **Link direto:** https://dashboard.stripe.com/apikeys

### 2️⃣ Escolha o Modo

**🧪 Modo Teste (para testar):**
- Use para desenvolvimento
- Não processa pagamentos reais
- Chaves começam com `pk_test_` e `sk_test_`

**💰 Modo Produção (para clientes reais):**
- Toggle no canto superior direito: "Test mode" → Desligar
- Processa pagamentos REAIS
- Chaves começam com `pk_live_` e `sk_live_`

### 3️⃣ Copie as 2 Chaves

#### a) Publishable Key (Chave Pública)
- **Nome:** "Publishable key"
- **Formato:** `pk_test_...` ou `pk_live_...`
- **Onde usar:** Frontend (arquivo `.env` → `VITE_STRIPE_PUBLISHABLE_KEY`)
- ✅ **Seguro** expor publicamente

#### b) Secret Key (Chave Secreta)
- **Nome:** "Secret key" 
- **Formato:** `sk_test_...` ou `sk_live_...`
- **Onde usar:** Backend/Netlify Function (nunca no frontend!)
- ⚠️ **NUNCA** compartilhe ou exponha

### 4️⃣ Configurar no Projeto

**Arquivo `.env` (raiz do projeto):**
```env
# Chave PÚBLICA (frontend - ok expor)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SUA_CHAVE_AQUI

# Chave SECRETA (backend - NUNCA commitar)
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_AQUI
```

**No Netlify (para Netlify Functions):**
1. Acesse: Site Settings → Environment Variables
2. Adicione:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`

### 5️⃣ Ativar Conta Stripe (se necessário)

Se aparecer mensagem "Activate your account":
1. Complete informações da empresa
2. Adicione dados bancários (para receber pagamentos)
3. Verifique identidade

---

## 📍 Localização Visual no Dashboard

```
Dashboard Stripe
├─ [Toggle] Test mode (desligar para produção)
├─ Developers
│  └─ API keys  ← VOCÊ ESTÁ AQUI
│     ├─ 🔓 Publishable key (pk_...)  ← Copiar
│     └─ 🔐 Secret key (sk_...)       ← Copiar (clicar "Reveal")
```

---

## ⚠️ Segurança

✅ **Pode compartilhar:**
- Publishable key (`pk_...`)

❌ **NUNCA compartilhe:**
- Secret key (`sk_...`)
- Não commite no Git
- Não exponha no frontend

---

## 🚀 Depois de Configurar

1. Salve as chaves no `.env`
2. Reinicie o servidor: `npm run dev`
3. Faça novo build: `npm run build`
4. Deploy no Netlify
5. Teste com cartão real!

**Cartão de Teste Stripe (modo test):**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura
- CVV: Qualquer 3 dígitos
