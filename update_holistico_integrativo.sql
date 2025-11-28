-- Script para substituir "holístico" por "integrativo" em todo o conteúdo do blog
-- Atualiza título, conteúdo, trecho e categoria

UPDATE posts_do_blog
SET 
  titulo = REPLACE(REPLACE(titulo, 'Holístico', 'Integrativo'), 'holístico', 'integrativo'),
  contente = REPLACE(REPLACE(contente, 'Holístico', 'Integrativo'), 'holístico', 'integrativo'),
  trecho = REPLACE(REPLACE(trecho, 'Holístico', 'Integrativo'), 'holístico', 'integrativo'),
  categoria = REPLACE(categoria, 'holistica', 'integrativa');

-- Mensagem de confirmação
SELECT 'Substituição concluída! "Holístico" foi trocado por "Integrativo" em todos os posts.' as status;
