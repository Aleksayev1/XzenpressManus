-- Verificar slugs e status das traduções
SELECT 
  id, 
  titulo, 
  lesma, 
  title_en IS NOT NULL as has_en,
  title_es IS NOT NULL as has_es,
  title_it IS NOT NULL as has_it
FROM posts_do_blog;
