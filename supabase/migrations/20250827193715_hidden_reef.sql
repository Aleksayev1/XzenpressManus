/*
  # Criar sistema de blog

  1. Nova Tabela
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, título do post)
      - `slug` (text, URL amigável, único)
      - `content` (text, conteúdo do post)
      - `excerpt` (text, resumo do post)
      - `author` (text, nome do autor)
      - `author_email` (text, email do autor)
      - `image_url` (text, URL da imagem destacada)
      - `category` (text, categoria do post)
      - `tags` (text array, tags do post)
      - `published` (boolean, se está publicado)
      - `published_at` (timestamp, data de publicação)
      - `views` (integer, número de visualizações)
      - `reading_time` (integer, tempo estimado de leitura em minutos)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `blog_posts`
    - Política para leitura pública de posts publicados
    - Política para inserção/edição apenas por usuários autenticados (admin)

  3. Índices
    - Índice em slug para consultas rápidas
    - Índice em published_at para ordenação
    - Índice em category para filtros
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text NOT NULL DEFAULT 'XZenPress Team',
  author_email text DEFAULT 'aleksayevacupress@gmail.com',
  image_url text,
  category text DEFAULT 'bem-estar',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  published_at timestamptz,
  views integer DEFAULT 0,
  reading_time integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública de posts publicados
CREATE POLICY "Allow public read for published posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Política para inserção apenas por usuários autenticados
CREATE POLICY "Allow authenticated insert for blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização apenas por usuários autenticados
CREATE POLICY "Allow authenticated update for blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política para exclusão apenas por usuários autenticados
CREATE POLICY "Allow authenticated delete for blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at_trigger
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_slug text)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts 
    SET views = views + 1 
    WHERE slug = post_slug AND published = true;
END;
$$ language 'plpgsql';