-- Adicionar imagem_url ao post "Vida Após a Morte"
UPDATE posts_do_blog 
SET imagem_url = 'https://dqjcbwjqrenubdzalicy.supabase.co/storage/v1/object/public/acupressure-images/Logo-Xzenpress-oficial.png'
WHERE titulo LIKE '%Vida%';

-- Verificar
SELECT titulo, imagem_url FROM posts_do_blog WHERE titulo LIKE '%Vida%';
