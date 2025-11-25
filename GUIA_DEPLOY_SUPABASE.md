# 🎯 GUIA: Como Fazer Deploy com Supabase Funcionando

## Problema Atual:
- Site mostra 4 posts de exemplo (mock data)
- Console mostra "Invalid API Key"
- Supabase não conecta

## ✅ Solução - Deploy no Netlify:

### 1. Verificar Variáveis de Ambiente no Netlify

Acesse: https://app.netlify.com/sites/incredible-hummingbird-dda3e2/configuration/env

Confirme que existem:
- `VITE_SUPABASE_URL` = `https://dqjcbwjqrenubdzalicy.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (a chave anon key completa do Supabase)

### 2. Pegar a Chave Correta do Supabase

1. Acesse: https://supabase.com/dashboard/project/dqjcbwjqrenubdzalicy/settings/api
2. Copie a **anon/public key** (NOT the service_role key!)
3. Cole no Netlify na variável `VITE_SUPABASE_ANON_KEY`

### 3. Fazer Deploy

Opção A - Via Git:
```bash
git add .
git commit -m "Update env for Supabase"
git push
```

Opção B - Via Netlify UI:
1. Vá em: Deploys > Trigger deploy > Clear cache and deploy site

### 4. Verificar

Após 2-3 minutos:
1. Acesse: https://incredible-hummingbird-dda3e2.netlify.app/blog
2. Abra console (F12)
3. Deve mostrar: "✅ Supabase configurado e ativo"
4. Devem aparecer **5 posts** do banco de dados
