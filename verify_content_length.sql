-- Verificar se o conteúdo está completo no banco
-- Mostra os primeiros 200 caracteres e o tamanho total de cada post

SELECT 
  titulo,
  LENGTH(contente) as tamanho_total,
  LEFT(contente, 200) as inicio_conteudo,
  RIGHT(contente, 100) as final_conteudo
FROM posts_do_blog
ORDER BY published_at DESC;
