-- ==============================================================================
-- SOLUÇÃO SIMPLES: Copia o conteúdo Português para todas as colunas de idioma
-- O Google Translate vai traduzir automaticamente quando o usuário mudar o idioma
-- ==============================================================================

-- Copiar TODO o conteúdo português para as colunas de inglês
UPDATE posts_do_blog
SET 
  title_en = titulo,
  content_en = contente,
  excerpt_en = trecho;

-- Copiar TODO o conteúdo português para as colunas de espanhol
UPDATE posts_do_blog
SET 
  title_es = titulo,
  content_es = contente,
  excerpt_es = trecho;

-- Copiar TODO o conteúdo português para as colunas de italiano
UPDATE posts_do_blog
SET 
  title_it = titulo,
  content_it = contente,
  excerpt_it = trecho;

-- Verificar
SELECT id, titulo, title_en IS NOT NULL as tem_en, title_es IS NOT NULL as tem_es, title_it IS NOT NULL as tem_it FROM posts_do_blog;
