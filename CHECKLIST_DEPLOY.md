# ✅ CHECKLIST DE DEPLOY - XZenPress

## 🎯 O QUE JÁ ESTÁ PRONTO

- ✅ Build de produção completo (`dist/`)
- ✅ Arquivo compactado: `xzenpress-deploy-ready.tar.gz` (190KB)
- ✅ Variáveis de ambiente no `netlify.toml`
- ✅ Arquivo `_redirects` configurado
- ✅ Todas as imagens hospedadas no Supabase Storage
- ✅ Blog configurado no Supabase
- ✅ Sistema de autenticação pronto

---

## 📋 ANTES DE FAZER O DEPLOY

### 1. Verificar Variáveis de Ambiente no Netlify

**Acesse:** https://app.netlify.com/sites/phenomenal-gnome-e43d9f/settings/env

**Deve ter EXATAMENTE:**

```
VITE_SUPABASE_URL
Valor: https://peicfjwigfxnhkobpgmw.supabase.co

VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaWNmandpZ2Z4bmhrb2JwZ213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDg1ODcsImV4cCI6MjA3ODE4NDU4N30.pceUoCyhp3mBbLPdsPbfo6kReBn1ZIrzHZWaK-41gwg
```

**ATENÇÃO:** PRECISA ter `VITE_` no começo! Sem isso, o Vite não reconhece!

### 2. Verificar Supabase Storage

**Acesse:** https://supabase.com/dashboard/project/peicfjwigfxnhkobpgmw/storage/buckets

**Verificar:**
- ✅ Bucket `acupressure-images` existe
- ✅ Bucket está PÚBLICO (public)
- ✅ Imagens estão todas lá

**Testar:** https://peicfjwigfxnhkobpgmw.supabase.co/storage/v1/object/public/acupressure-images/Logo-Xzenpress-oficial.png

### 3. Verificar Tabelas do Blog

**Acesse:** https://supabase.com/dashboard/project/peicfjwigfxnhkobpgmw/editor

**Deve ter:**
- ✅ Tabela `blog_posts`
- ✅ Tabela `blog_translations`

**Se não tiver, executar migrations:**
```sql
-- Ver arquivo: supabase/migrations/20251108164617_create_blog_system.sql
```

---

## 🚀 FAZER O DEPLOY

### OPÇÃO 1: Upload Manual (RECOMENDADO)

1. Acesse: https://app.netlify.com/sites/phenomenal-gnome-e43d9f/deploys

2. Clique em: **Deploy manually**

3. Arraste a pasta `dist/` (ou extraia o `xzenpress-deploy-ready.tar.gz`)

4. Aguarde o upload (1-2 minutos)

### OPÇÃO 2: Trigger Deploy

1. Acesse: https://app.netlify.com/sites/phenomenal-gnome-e43d9f/deploys

2. Clique em: **Trigger deploy** → **Clear cache and deploy site**

3. Aguarde o build automático (3-5 minutos)

---

## 🧪 TESTAR APÓS DEPLOY

### 1. Console do Navegador (F12)

**Deve aparecer:**
```
✅ Supabase configurado e ativo: https://peicfjwigfxnhkobpgmw...
```

**NÃO deve aparecer:**
```
⚠️ Supabase não configurado - usando modo local
```

### 2. Imagens dos Pontos

- [ ] Ir em "Acupressão"
- [ ] Clicar em qualquer ponto
- [ ] Clicar em "Ver detalhes"
- [ ] A imagem DEVE aparecer

### 3. Login

- [ ] Clicar em "Login"
- [ ] Fazer login
- [ ] Nome deve aparecer no header
- [ ] Badge "PREMIUM" deve aparecer (se for premium)

### 4. Blog

- [ ] Clicar em "Blog" no menu
- [ ] Posts devem aparecer
- [ ] Clicar em um post
- [ ] Conteúdo deve abrir

---

## 🔧 SE DER PROBLEMA

### Problema: "Supabase não configurado"

**Causa:** Variáveis sem `VITE_` prefix

**Solução:**
1. Netlify → Environment variables
2. DELETE todas as variáveis Supabase
3. Criar novamente COM `VITE_` no começo
4. Trigger deploy → Clear cache

### Problema: Imagens não aparecem

**Causa 1:** Bucket não está público
- Storage → acupressure-images → Settings → Public bucket ✅

**Causa 2:** CORS bloqueado
- Verificar console do navegador (F12)

### Problema: Blog vazio

**Causa:** Tabelas não criadas ou sem dados

**Solução:**
1. Supabase Editor → Verificar se tabelas existem
2. Se não existir, rodar migrations
3. Adicionar posts via "Admin Blog"

---

## 📞 SUPORTE

**Em caso de erro:**
1. Abrir console do navegador (F12)
2. Tirar print dos erros
3. Verificar Network tab para ver quais requests falharam

---

**Build preparado em:** $(date)
**Versão:** 2.5.0
**Tamanho do bundle:** 756KB (gzip: 186KB)
