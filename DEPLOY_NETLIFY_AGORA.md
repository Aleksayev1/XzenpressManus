# 🚀 DEPLOY NO NETLIFY - INSTRUÇÕES COMPLETAS

## ✅ BUILD JÁ ESTÁ PRONTO!

A pasta `dist/` está pronta com todos os arquivos compilados.

---

## 📋 PASSO A PASSO PARA DEPLOY MANUAL

### OPÇÃO 1: Deploy via Interface Web (MAIS FÁCIL)

1. **Acesse:** https://app.netlify.com/

2. **Vá no seu site:** `phenomenal-gnome-e43d9f`

3. **Clique em:** Deploys → Deploy manually

4. **Arraste a pasta `dist/`** para a área de upload

5. **IMPORTANTE:** Antes de fazer upload, **VERIFIQUE AS VARIÁVEIS DE AMBIENTE:**
   - Vá em: **Site settings → Environment variables**
   - Confira se existe:
     - `VITE_SUPABASE_URL` = `https://peicfjwigfxnhkobpgmw.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaWNmandpZ2Z4bmhrb2JwZ213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDg1ODcsImV4cCI6MjA3ODE4NDU4N30.pceUoCyhp3mBbLPdsPbfo6kReBn1ZIrzHZWaK-41gwg`

   - **Se NÃO tiver ou estiver diferente:**
     - DELETE as variáveis antigas
     - Crie novamente com `VITE_` no começo
     - Depois: Deploys → Trigger deploy → **Clear cache and deploy site**

6. **Aguarde o deploy terminar** (1-2 minutos)

7. **Teste o site:**
   - ✅ Imagens dos pontos devem aparecer
   - ✅ Login deve funcionar
   - ✅ Blog deve ter conteúdo

---

### OPÇÃO 2: Deploy via CLI Netlify

```bash
# 1. Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# 2. Login no Netlify
netlify login

# 3. Fazer deploy da pasta dist
netlify deploy --prod --dir=dist
```

---

## 🔍 VERIFICAÇÃO APÓS DEPLOY

### 1. Testar Conexão Supabase
Abra o Console do navegador (F12) e procure por:
```
✅ Supabase configurado e ativo: https://peicfjwigfxnhkobpgmw...
```

**Se aparecer:**
```
⚠️ Supabase não configurado - usando modo local
```
**→ As variáveis de ambiente NÃO foram configuradas corretamente!**

### 2. Testar Imagens
- Clique em qualquer ponto de acupressão
- Clique em "Ver detalhes"
- A imagem DEVE aparecer

### 3. Testar Login
- Faça login com seu usuário
- Deve aparecer seu nome no canto superior direito
- Deve aparecer badge "PREMIUM" se você for premium

### 4. Testar Blog
- Clique em "Blog" no menu
- Deve mostrar os posts

---

## ⚠️ SE DER ERRO

### Erro: "Supabase não configurado"

**CAUSA:** Variáveis de ambiente sem o prefixo `VITE_`

**SOLUÇÃO:**
1. Netlify → Site settings → Environment variables
2. DELETE todas as variáveis relacionadas a Supabase
3. Crie novamente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploys → Trigger deploy → **Clear cache and deploy site**

### Erro: Imagens não aparecem

**CAUSA:** Bucket do Supabase não está público

**SOLUÇÃO:**
1. Acesse Supabase Dashboard
2. Storage → acupressure-images
3. Clique em Settings (engrenagem)
4. Marque "Public bucket"
5. Save

### Erro: Blog vazio

**CAUSA:** Tabelas do blog não foram criadas no Supabase

**SOLUÇÃO:** Executar as migrations (já existem na pasta `supabase/migrations/`)

---

## 📦 ARQUIVO DE BUILD

Se precisar do arquivo compactado:
```bash
# Criar arquivo .tar.gz da pasta dist
tar -czf xzenpress-dist-$(date +%Y%m%d).tar.gz dist/
```

---

## 🎯 RESUMO

✅ Build completo na pasta `dist/`
✅ Variáveis de ambiente configuradas no `netlify.toml`
✅ Arquivo `_redirects` criado para roteamento SPA
✅ Todas as dependências instaladas

**PRÓXIMO PASSO:** Fazer upload da pasta `dist/` no Netlify!

---

**Data do Build:** $(date)
**Versão:** 2.5.0
