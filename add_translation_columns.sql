-- Adiciona colunas de tradução na tabela posts_do_blog
-- Suporte para: Inglês (en), Espanhol (es), Francês (fr), Italiano (it), Alemão (de)

ALTER TABLE posts_do_blog
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT,
ADD COLUMN IF NOT EXISTS excerpt_en TEXT,

ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS content_es TEXT,
ADD COLUMN IF NOT EXISTS excerpt_es TEXT,

ADD COLUMN IF NOT EXISTS title_fr TEXT,
ADD COLUMN IF NOT EXISTS content_fr TEXT,
ADD COLUMN IF NOT EXISTS excerpt_fr TEXT,

ADD COLUMN IF NOT EXISTS title_it TEXT,
ADD COLUMN IF NOT EXISTS content_it TEXT,
ADD COLUMN IF NOT EXISTS excerpt_it TEXT,

ADD COLUMN IF NOT EXISTS title_de TEXT,
ADD COLUMN IF NOT EXISTS content_de TEXT,
ADD COLUMN IF NOT EXISTS excerpt_de TEXT;

-- Comentário para documentação
COMMENT ON COLUMN posts_do_blog.title_en IS 'Título em Inglês';
COMMENT ON COLUMN posts_do_blog.content_en IS 'Conteúdo em Inglês';

SELECT 'Colunas de tradução criadas com sucesso!' as status;
