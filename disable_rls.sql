-- Desabilitar RLS (Row Level Security) na tabela posts_do_blog
-- Isso permite leitura pública dos posts

ALTER TABLE posts_do_blog DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts_do_blog';
