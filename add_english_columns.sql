-- Adicionar colunas em inglês como sinônimos das colunas em português
-- Isso permite que o código JavaScript funcione sem alterar nada

-- 1. Renomear/adicionar coluna published_at
ALTER TABLE posts_do_blog 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

UPDATE posts_do_blog 
SET published_at = publicado_em 
WHERE published_at IS NULL;

-- 2. Renomear/adicionar coluna created_at
ALTER TABLE posts_do_blog 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

UPDATE posts_do_blog 
SET created_at = criado_em 
WHERE created_at IS NULL;

-- 3. Renomear/adicionar coluna updated_at
ALTER TABLE posts_do_blog 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

UPDATE posts_do_blog 
SET updated_at = atualizado_em 
WHERE updated_at IS NULL;

-- Verificar
SELECT titulo, published_at, created_at, updated_at 
FROM posts_do_blog 
LIMIT 5;
