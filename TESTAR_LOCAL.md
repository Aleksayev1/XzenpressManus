# 🧪 Testar Pagamento Localmente (Economia de Créditos Netlify)

## ✅ Variáveis Confirmadas no Netlify

Todas as variáveis estão configuradas corretamente:
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_51Rgt3OG22eI...`
- ✅ `STRIPE_SECRET_KEY` = `sk_live_...`
- ✅ `VITE_CREDIT_CARD_PROVIDER` = `stripe`
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

## 📋 Comandos para Teste Local

### 1️⃣ Criar arquivo `.env` local

Execute este comando no PowerShell:

```powershell
@"
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SUA_CHAVE_AQUI
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
VITE_CREDIT_CARD_PROVIDER=stripe
VITE_SUPABASE_URL=SUA_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_SUPABASE
"@ | Out-File -FilePath .env -Encoding UTF8
```

> ⚠️ **IMPORTANTE:** Pegue as chaves reais no Netlify Dashboard → Environment Variables

### 2️⃣ Instalar Netlify CLI (se não tiver)

```powershell
npm install -g netlify-cli
```

### 3️⃣ Rodar localmente

```powershell
netlify dev
```

Isso vai abrir automaticamente em: **http://localhost:8888**

### 4️⃣ Testar pagamento

**Cartão de teste SUCESSO:**
```
Número: 4242 4242 4242 4242
Data: 01/33
CVV: 123
Nome: Teste Payment Intent
```

**Cartão de teste RECUSA:**
```
Número: 4000 0000 0000 0002
Data: 01/33
CVV: 123
```

## 🎯 Resultado Esperado

Com o código atualizado (Payment Intents API), deve:
- ✅ Processar em 5-10 segundos
- ✅ NÃO mais o erro "Invalid value for token type"
- ✅ Retornar sucesso ou erro específico do Stripe
- ✅ Ver logs no console: "PaymentMethod Stripe criado: pm_..."

## 📊 Logs Esperados no Console

```
🔍 Variáveis de ambiente disponíveis: {...}
✅ Stripe configurado com chave: pk_live_51Rgt3OG22eI...
🎯 PaymentMethod Stripe criado: pm_...
📡 Enviando para backend processar pagamento REAL...
✅ Pagamento processado com sucesso!
```

## ⚠️ Se ainda der erro

Envie print do console mostrando o erro específico para investigarmos.
