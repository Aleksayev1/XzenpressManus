-- Verificar se os posts têm conteúdo completo
SELECT 
  titulo,
  LENGTH(contente) as tamanho_conteudo,
  LENGTH(trecho) as tamanho_resumo,
  SUBSTRING(contente, 1, 100) as preview_conteudo
FROM posts_do_blog
ORDER BY published_at DESC;
