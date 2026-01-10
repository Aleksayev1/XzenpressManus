?# 🌍 Guia: Ajuste de Preços Mundial

## 📋 Visão Geral

O XZenPress usa **preços regionalizados automáticos** baseados no país do usuário. Este guia explica como ajustar os preços globalmente.

---

## 🎯 Como Funciona

### Detecção Automática de País

1. **Usuário acessa o site**
2. **Sistema detecta país** via API de geolocalização IP
3. **Exibe preços na moeda local:**
   - 🇧🇷 Brasil → **R$ (BRL)**
   - 🇺🇸 EUA → **$ (USD)**
   - 🌎 Outros países → **$ (USD)**

### Estrutura de Preços

Atualmente temos **3 planos** em **2 moedas**:

| Plano | Brasil (BRL) | EUA/Mundo (USD) |
|-------|--------------|-----------------|
| **Mensal** | R$50,00 | $10.00 |
| **Anual** | R$449,95 ~~R$600,00~~ | $89.99 ~~$120.00~~ |
| **Lifetime** | R$999,90 ~~R$1.799,90~~ | $199.99 ~~$359.99~~ |

---

## 🛠️ Como Atualizar os Preços

### Passo 1: Abrir o Arquivo de Configuração

**Arquivo:** `src/services/regionalPricingService.ts`

### Passo 2: Localizar a Seção de Preços

Procure pelas linhas **67-87** (Brasil) e **90-102** (EUA/Mundo):

```typescript
// 🇧🇷 Brasil - Linha 67
if (countryCode === 'BR') {
  return {
    currency: 'BRL',
    symbol: 'R$',
    monthly: 50.00,              // ← PREÇO MENSAL
    annual: 449.95,              // ← PREÇO ANUAL
    lifetime: 999.90,            // ← PREÇO LIFETIME
    annualOriginal: 600.00,      // ← PREÇO ORIGINAL ANUAL
    lifetimeOriginal: 1799.90,   // ← PREÇO ORIGINAL LIFETIME
    countryCode: 'BR',
    countryName: 'Brasil',
    isPromotional: true
  };
}

// 🇺🇸 EUA e resto do mundo - Linha 90
return {
  currency: 'USD',
  symbol: '$',
  monthly: 10.00,                // ← PREÇO MENSAL
  annual: 89.99,                 // ← PREÇO ANUAL
  lifetime: 199.99,              // ← PREÇO LIFETIME
  annualOriginal: 120.00,        // ← PREÇO ORIGINAL ANUAL
  lifetimeOriginal: 359.99,      // ← PREÇO ORIGINAL LIFETIME
  countryCode,
  countryName: countryCode === 'US' ? 'United States' : 'International',
  isPromotional: true
};
```

### Passo 3: Editar os Valores

**Exemplo: Aumentar preços em 10%**

**ANTES (Brasil):**
```typescript
monthly: 50.00,
annual: 449.95,
lifetime: 999.90,
```

**DEPOIS (Brasil):**
```typescript
monthly: 55.00,        // +10%
annual: 494.95,        // +10%
lifetime: 1099.89,     // +10%
```

### Passo 4: Ajustar Preços "Originais" (Riscados)

Se quiser manter o desconto visível, ajuste também os preços riscados:

```typescript
annualOriginal: 660.00,      // Aumenta para manter proporção
lifetimeOriginal: 1979.89,   // Aumenta para manter proporção
```

### Passo 5: Fazer Deploy

```powershell
# 1. Adicionar mudanças
git add src/services/regionalPricingService.ts

# 2. Commitar com mensagem descritiva
git commit -m "update: ajuste de preços - aumento de 10%"

# 3. Enviar para produção
git push origin main
```

### Passo 6: Aguardar Deploy

- ⏱️ **Netlify processa:** 2-3 minutos
- ✅ **Preços atualizados** em todo o mundo automaticamente!

---

## 💡 Dicas Importantes

### ✅ Manter Consistência

**Regra de Ouro:** Mantenha a proporcionalidade entre moedas

```
R$50 ≈ $10 (cotação ~R$5 por dólar)
```

Se você aumentar no Brasil, aumente proporcionalmente no USD.

### 🎁 Badge Promocional

O badge **"🎁 PROMOÇÃO - Oferta Limitada"** aparece quando:

```typescript
isPromotional: true  // ← Mude para false para remover o badge
```

### 📊 Calcular Descontos Automaticamente

O sistema calcula automaticamente:
- **Porcentagem de desconto** (ex: "25% OFF")
- **Economia total** (ex: "Economize R$150")

Você só precisa definir:
1. Preço atual (`annual`)
2. Preço original (`annualOriginal`)

---

## 🌍 Adicionar Novos Países (Avançado)

Para adicionar preços específicos para outros países (ex: Europa em EUR):

```typescript
// 🇪🇺 Europa
if (countryCode === 'ES' || countryCode === 'FR' || countryCode === 'DE') {
  return {
    currency: 'EUR',
    symbol: '€',
    monthly: 9.00,
    annual: 80.99,
    lifetime: 179.99,
    annualOriginal: 108.00,
    lifetimeOriginal: 323.99,
    countryCode,
    countryName: 'Europe',
    isPromotional: true
  };
}
```

**Importante:** Você precisará também atualizar:
- `FormatPrice()` para suportar EUR
- Interface `RegionalPrice` para aceitar 'EUR'

---

## 🧪 Testar Localmente Antes de Deploy

Sempre teste no localhost primeiro:

```powershell
# Rodar servidor local
npm run dev

# Acessar: http://localhost:5173/
# Ir para Premium e verificar preços
```

---

## 📞 Solução de Problemas

### Problema: Preços não mudaram após deploy

**Solução:**
1. Limpe cache do navegador (Ctrl + Shift + R)
2. Abra aba anônima
3. Verifique console (F12) se vê: `💰 Preços carregados: BRL Brasil`

### Problema: API de geolocalização falhou

**Fallback automático:**
- Tenta via **timezone** (Brasília = Brasil)
- Se falhar, usa **USD** (padrão)

### Problema: Deploy travou

**Verificar:**
1. Netlify → Deploys → Status
2. Logs de erro no build
3. Sintaxe do arquivo `.ts` (vírgulas, chaves)

---

## 📅 Histórico de Mudanças

Sempre documente as mudanças de preços:

```markdown
## 2026-01-09
- Implementação inicial: R$50/mês, $10/mês
- Badge promocional ativado

## (Futuras atualizações aqui)
```

---

## 🎯 Checklist Rápido

Antes de atualizar preços:

- [ ] Decidir novo valor (Brasil e USA)
- [ ] Manter proporção entre moedas
- [ ] Ajustar preços "originais" se necessário
- [ ] Testar no localhost
- [ ] Fazer commit descritivo
- [ ] Push para production
- [ ] Aguardar deploy (2-3 min)
- [ ] Verificar no site (aba anônima)
- [ ] Documentar mudança neste arquivo

---

## 📂 Arquivo de Referência

**Localização:** `src/services/regionalPricingService.ts`

**Linhas importantes:**
- **67-87:** Preços Brasil (BRL)
- **90-102:** Preços EUA/Mundo (USD)
- **119-127:** Função `formatPrice()` 
- **130-133:** Função `calculateDiscount()`

---

## ✅ Exemplo Completo de Atualização

### Cenário: Black Friday - 50% OFF

**1. Editar `regionalPricingService.ts`:**

```typescript
// Brasil
monthly: 25.00,           // Era R$50
annual: 224.98,           // Era R$449.95
lifetime: 499.95,         // Era R$999.90

// USA
monthly: 5.00,            // Era $10
annual: 44.99,            // Era $89.99
lifetime: 99.99,          // Era $199.99
```

**2. Ativar badge promocional:**
```typescript
isPromotional: true  // Já está true
```

**3. Deploy:**
```powershell
git add .
git commit -m "promo: Black Friday - 50% OFF em todos os planos"
git push origin main
```

**4. Resultado:**
- 🎁 Badge "PROMOÇÃO" piscando
- Preços reduzidos pela metade
- Deploy global em 2-3 minutos

---

## 🆘 Suporte

Se tiver dúvidas ou problemas:
1. Verifique este guia primeiro
2. Teste no localhost
3. Confira logs do console (F12)
4. Veja logs do Netlify

**Última atualização:** 09/01/2026
