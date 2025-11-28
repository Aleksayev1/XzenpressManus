-- Script para preencher imagens que estão NULL
-- Garante que nenhum post fique sem imagem

UPDATE posts_do_blog
SET imagem_url = '/Logo Xzenpress oficial.png'
WHERE imagem_url IS NULL;

-- Confirmação Final
SELECT id, titulo, imagem_url FROM posts_do_blog;
