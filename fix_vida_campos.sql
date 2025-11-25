-- Corrigir o post "Vida Após a Morte"
-- Adicionar campos com nomes em inglês que o código espera

UPDATE posts_do_blog 
SET 
  published_at = NOW(),
  created_at = NOW(),
  updated_at = NOW()
WHERE titulo LIKE '%Vida%';

-- Verificar
SELECT titulo, publicado, published_at, publicado_em 
FROM posts_do_blog 
WHERE titulo LIKE '%Vida%';
