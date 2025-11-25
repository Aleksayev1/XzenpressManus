-- Corrigir apenas a data do post "Vida Após a Morte"
UPDATE posts_do_blog 
SET publicado_em = NOW()
WHERE titulo LIKE '%Vida%';

-- Verificar
SELECT titulo, categoria, publicado, publicado_em 
FROM posts_do_blog 
ORDER BY publicado_em DESC;
