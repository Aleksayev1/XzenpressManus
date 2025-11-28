-- Adiciona colunas de tradução para TODOS os idiomas suportados
-- Tabela: posts_do_blog

-- 1. Inglês (en)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_en TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_en TEXT;

-- 2. Espanhol (es)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_es TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_es TEXT;

-- 3. Francês (fr)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_fr TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_fr TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_fr TEXT;

-- 4. Italiano (it)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_it TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_it TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_it TEXT;

-- 5. Alemão (de)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_de TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_de TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_de TEXT;

-- 6. Chinês (zh)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_zh TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_zh TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_zh TEXT;

-- 7. Japonês (ja)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ja TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ja TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ja TEXT;

-- 8. Russo (ru)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ru TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ru TEXT;

-- 9. Hindi (hi)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_hi TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_hi TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_hi TEXT;

-- 10. Árabe (ar)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ar TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;

-- 11. Bengalês (bn)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_bn TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_bn TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_bn TEXT;

-- Confirmação
SELECT 'Todas as colunas de tradução foram criadas com sucesso!' as status;
