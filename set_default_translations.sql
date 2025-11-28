-- Script para preencher traduções padrão (copia do conteúdo em português) para todos os posts existentes
-- e criar trigger para futuros inserts que copie automaticamente os campos PT para os campos de tradução.

-- 1. Atualiza todos os posts já existentes
UPDATE posts_do_blog
SET
  title_en = titulo,
  content_en = contente,
  excerpt_en = trecho,
  title_es = titulo,
  content_es = contente,
  excerpt_es = trecho,
  title_fr = titulo,
  content_fr = contente,
  excerpt_fr = trecho,
  title_it = titulo,
  content_it = contente,
  excerpt_it = trecho,
  title_de = titulo,
  content_de = contente,
  excerpt_de = trecho;

-- 2. Cria função trigger para novos posts
CREATE OR REPLACE FUNCTION copy_pt_to_translations()
RETURNS trigger AS $$
BEGIN
  NEW.title_en := NEW.titulo;
  NEW.content_en := NEW.contente;
  NEW.excerpt_en := NEW.trecho;
  NEW.title_es := NEW.titulo;
  NEW.content_es := NEW.contente;
  NEW.excerpt_es := NEW.trecho;
  NEW.title_fr := NEW.titulo;
  NEW.content_fr := NEW.contente;
  NEW.excerpt_fr := NEW.trecho;
  NEW.title_it := NEW.titulo;
  NEW.content_it := NEW.contente;
  NEW.excerpt_it := NEW.trecho;
  NEW.title_de := NEW.titulo;
  NEW.content_de := NEW.contente;
  NEW.excerpt_de := NEW.trecho;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Cria trigger que chama a função acima antes de inserir
DROP TRIGGER IF EXISTS trg_copy_pt_to_translations ON posts_do_blog;
CREATE TRIGGER trg_copy_pt_to_translations
BEFORE INSERT ON posts_do_blog
FOR EACH ROW EXECUTE FUNCTION copy_pt_to_translations();

-- Comentário de verificação
SELECT 'Traduções padrão aplicadas e trigger criada' AS status;
