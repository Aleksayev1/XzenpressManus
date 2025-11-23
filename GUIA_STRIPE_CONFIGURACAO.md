# 💳 Configuração Stripe Oficial - XZenPress

## 🎯 **Passos para Ativar Stripe Real**

### **1. No Dashboard Stripe (que você já abriu):**

#### **Obter Chaves de API:**
1. **Menu lateral:** Clique em **"Developers"**
2. **Submenu:** Clique em **"API keys"**
3. **Copie a chave:** `pk_test_51...` (Publishable key)

### **2. No Netlify (adicionar nova variável):**

#### **Adicionar Chave Stripe:**
```
Key: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51234567890abcdef... (sua chave real)
Secret: ❌ Desmarcar (pode ficar visível)
Scopes: All scopes
```

#### **Ativar Stripe:**
```
Editar a variável existente:
VITE_CREDIT_CARD_PROVIDER = stripe (mudar de "mock" para "stripe")
```

### **3. Fazer Novo Deploy:**
- Trigger deploy → Deploy site
- Aguardar 2-3 minutos

## 🧪 **Cartões de Teste Stripe:**

### **Para Testar Quando Ativar:**
```
✅ Sucesso: 4242 4242 4242 4242
❌ Recusado: 4000 0000 0000 0002
💳 Visa: 4242 4242 4242 4242
💳 Mastercard: 5555 5555 5555 4444
💳 Amex: 3782 822463 10005
```

**Data:** Qualquer futura (ex: 12/25)  
**CVV:** Qualquer 3 dígitos (ex: 123)  
**Nome:** Qualquer nome

## 💰 **Custos Stripe Brasil:**
- **Sem mensalidade**
- **3,4% + R$ 0,39** por transação nacional
- **5,4% + R$ 0,39** por transação internacional
- **Pague apenas quando vender**

## 🚀 **Status Atual:**
- ✅ Código Stripe integrado
- ⏳ Aguardando suas chaves de API
- 🎯 Pronto para ativação

---

## 📋 **Checklist:**
- [ ] Copiar chave `pk_test_...` do Stripe
- [ ] Adicionar no Netlify como `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Mudar `VITE_CREDIT_CARD_PROVIDER` para `stripe`
- [ ] Fazer novo deploy
- [ ] Testar com cartões de teste

**Me avise quando copiar a chave do Stripe!** 🔑