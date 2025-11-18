/*
  # Sistema Completo de Blog XZenPress

  1. Novas Tabelas
    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Nome da categoria
      - `slug` (text, unique) - URL-friendly slug
      - `description` (text) - Descrição da categoria
      - `created_at` (timestamptz)
      
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text) - Título do post
      - `slug` (text, unique) - URL-friendly slug
      - `content` (text) - Conteúdo completo
      - `excerpt` (text) - Resumo do post
      - `author` (text) - Nome do autor
      - `author_email` (text) - Email do autor
      - `author_id` (uuid, foreign key to auth.users) - ID do usuário autor
      - `image_url` (text) - URL da imagem destacada
      - `category` (text) - Categoria principal
      - `tags` (text[]) - Array de tags
      - `published` (boolean, default false) - Status de publicação
      - `published_at` (timestamptz) - Data de publicação
      - `views` (integer, default 0) - Contador de visualizações
      - `reading_time` (integer, default 5) - Tempo estimado de leitura em minutos
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to blog_posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_name` (text) - Nome do usuário
      - `user_email` (text) - Email do usuário
      - `content` (text) - Conteúdo do comentário
      - `approved` (boolean, default false) - Status de aprovação
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança (RLS)
    - Enable RLS em todas as tabelas
    - Políticas para leitura pública de posts publicados
    - Políticas restritas para criação/edição (apenas autores)
    - Políticas de comentários (usuários autenticados podem comentar)

  3. Funções
    - `increment_blog_post_views` - Incrementa contador de visualizações
    - `calculate_reading_time` - Calcula tempo de leitura baseado no conteúdo

  4. Índices
    - Índices em slug, category, published, published_at para performance
*/

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text DEFAULT '',
  author text NOT NULL DEFAULT 'XZenPress Team',
  author_email text DEFAULT 'contato@xzenpress.com',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  category text NOT NULL DEFAULT 'geral',
  tags text[] DEFAULT ARRAY[]::text[],
  published boolean DEFAULT false,
  published_at timestamptz,
  views integer DEFAULT 0,
  reading_time integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de comentários
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts(published);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_comments_post_id_idx ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS blog_comments_user_id_idx ON blog_comments(user_id);

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_slug text)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular tempo de leitura (baseado em 200 palavras por minuto)
CREATE OR REPLACE FUNCTION calculate_reading_time(post_content text)
RETURNS integer AS $$
DECLARE
  word_count integer;
  reading_minutes integer;
BEGIN
  word_count := array_length(regexp_split_to_array(post_content, '\s+'), 1);
  reading_minutes := GREATEST(1, CEIL(word_count::numeric / 200));
  RETURN reading_minutes;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para blog_categories (todos podem ler)
CREATE POLICY "Categories are viewable by everyone"
  ON blog_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can create categories"
  ON blog_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update categories"
  ON blog_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para blog_posts
CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authors can view their own unpublished posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Políticas para blog_comments
CREATE POLICY "Approved comments are viewable by everyone"
  ON blog_comments FOR SELECT
  TO public
  USING (approved = true);

CREATE POLICY "Users can view their own comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserir categorias padrão
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Acupressão', 'acupressao', 'Artigos sobre pontos de acupressão e medicina tradicional chinesa'),
  ('Respiração', 'respiracao', 'Técnicas de respiração e seus benefícios terapêuticos'),
  ('Cromoterapia', 'cromoterapia', 'Uso terapêutico das cores para bem-estar'),
  ('Bem-estar Corporativo', 'bem-estar-corporativo', 'Saúde mental e bem-estar no ambiente de trabalho'),
  ('Medicina Tradicional Chinesa', 'medicina-tradicional-chinesa', 'Fundamentos e práticas da MTC')
ON CONFLICT (slug) DO NOTHING;