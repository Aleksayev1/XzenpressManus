-- Adicionar coluna 'category' (em inglês) para o código JavaScript funcionar
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS category TEXT;

-- Copiar o valor de 'categoria' para 'category'
UPDATE posts_do_blog SET category = categoria;

-- Verificar
SELECT titulo, categoria, category FROM posts_do_blog;
