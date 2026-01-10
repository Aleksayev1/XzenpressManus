# Migrar para Stripe Elements

## ❌ Problema Atual
Stripe retorna erro: `Please use Stripe Elements to collect card details`

**Causa:** Formulário usa campos HTML normais, não permitidos pelo Stripe.

## ✅ Solução

### 1. Instalar biblioteca
```bash
npm install @stripe/react-stripe-js
```

### 2. Substituir CreditCardForm.tsx
- Usar `<CardElement>` ao invés de inputs HTML
- Wrapper com `<Elements>` provider

### 3. Atualizar creditCardService.ts  
- Passar `CardElement` para `createPaymentMethod`
- Remover lógica de campos manuais

### 4. Testar
- Localhost com `netlify dev`
- Cartão teste: 4242 4242 4242 4242

## Arquivos Afetados
1. `package.json` → adicionar dependência
2. `src/components/ui/CreditCardForm.tsx` → refazer c/ Elements
3. `src/services/creditCardService.ts` → ajustar criação PaymentMethod
4. `src/components/CreditCardPaymentComponent.tsx` → wrapper Elements
