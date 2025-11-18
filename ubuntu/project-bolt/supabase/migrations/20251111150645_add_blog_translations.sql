/*
  # Adicionar Suporte Multilíngue ao Blog

  1. Alterações na Tabela `blog_posts`
    - Adicionar colunas de tradução para 12 idiomas:
      - Inglês (En), Espanhol (Es), Italiano (It), Francês (Fr)
      - Alemão (De), Chinês (Zh), Japonês (Ja), Russo (Ru)
      - Hindi (Hi), Árabe (Ar), Bengali (Bn)
    - Campos traduzidos: title, content, excerpt
    - Total: 33 novas colunas (11 idiomas × 3 campos)
    
  2. Notas Importantes
    - Colunas opcionais (NULL permitido) para facilitar migração
    - Português permanece nos campos originais (title, content, excerpt)
    - Traduções automáticas podem ser adicionadas posteriormente
    - Fallback para português caso tradução não exista

  3. Performance
    - Índices não necessários para colunas de texto longo
    - Consultas continuam eficientes com campos adicionais
*/

-- Adicionar colunas de tradução para Inglês
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_en text;
    ALTER TABLE blog_posts ADD COLUMN content_en text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_en text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Espanhol
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_es'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_es text;
    ALTER TABLE blog_posts ADD COLUMN content_es text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_es text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Italiano
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_it'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_it text;
    ALTER TABLE blog_posts ADD COLUMN content_it text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_it text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Francês
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_fr'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_fr text;
    ALTER TABLE blog_posts ADD COLUMN content_fr text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_fr text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Alemão
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_de'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_de text;
    ALTER TABLE blog_posts ADD COLUMN content_de text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_de text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Chinês
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_zh'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_zh text;
    ALTER TABLE blog_posts ADD COLUMN content_zh text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_zh text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Japonês
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_ja'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_ja text;
    ALTER TABLE blog_posts ADD COLUMN content_ja text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_ja text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Russo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_ru'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_ru text;
    ALTER TABLE blog_posts ADD COLUMN content_ru text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_ru text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Hindi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_hi'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_hi text;
    ALTER TABLE blog_posts ADD COLUMN content_hi text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_hi text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Árabe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_ar text;
    ALTER TABLE blog_posts ADD COLUMN content_ar text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_ar text;
  END IF;
END $$;

-- Adicionar colunas de tradução para Bengali
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_bn'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_bn text;
    ALTER TABLE blog_posts ADD COLUMN content_bn text;
    ALTER TABLE blog_posts ADD COLUMN excerpt_bn text;
  END IF;
END $$;