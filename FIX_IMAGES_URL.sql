-- Script para corrigir URLs de imagens quebradas
-- Substitui URLs antigas do Supabase pelo caminho local da imagem

UPDATE posts_do_blog
SET imagem_url = '/Logo Xzenpress oficial.png'
WHERE imagem_url LIKE '%supabase.co%';

-- Confirmação
SELECT id, titulo, imagem_url FROM posts_do_blog;
