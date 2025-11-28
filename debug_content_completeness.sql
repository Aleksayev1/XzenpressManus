-- Verificar se o conteúdo está completo no banco de dados
-- Mostra título, tamanho do conteúdo, e parte do início/fim

SELECT 
  titulo,
  LENGTH(contente) as tamanho_bytes,
  SUBSTRING(contente, 1, 100) as primeiros_100_chars,
  SUBSTRING(contente, LENGTH(contente) - 100, 100) as ultimos_100_chars,
  CASE 
    WHEN contente LIKE '%Conclusão%' THEN '✅ Tem conclusão'
    WHEN contente LIKE '%conclusão%' THEN '✅ Tem conclusão'
    ELSE '❌ Sem conclusão'
  END as tem_conclusao
FROM posts_do_blog
ORDER BY published_at DESC;
