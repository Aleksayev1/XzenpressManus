-- RESET COMPLETO DO BLOG
-- Este script deleta TODOS os posts e insere apenas os 5 corretos

-- 1. DELETAR TUDO
DELETE FROM posts_do_blog;

-- 2. INSERIR OS 5 POSTS CORRETOS

-- POST 1: Vida Após a Morte
INSERT INTO posts_do_blog (titulo, lesma, contente, trecho, autor, categoria, publicado, publicado_em, tempo_leitura) 
VALUES (
  'Vida Após a Morte: Argumentos Científicos Contra o Suicídio',
  'vida-apos-morte-argumentos-cientificos',
  'Artigo completo sobre argumentos científicos e filosóficos para valorizar a vida. CVV: 188 (24 horas).',
  'Argumentos científicos, filosóficos e existenciais sobre por que a vida vale a pena ser vivida, mesmo nos momentos mais difíceis.',
  'XZenPress',
  'saude-mental',
  true,
  NOW(),
  25
);

-- POST 2: Acupressão
INSERT INTO posts_do_blog (titulo, lesma, contente, trecho, autor, categoria, publicado, publicado_em, tempo_leitura) 
VALUES (
  '5 Pontos de Acupressão para Aliviar o Estresse Diário',
  '5-pontos-acupressao-estresse-diario',
  'Descubra 5 pontos de acupressão da Medicina Tradicional Chinesa que podem ser usados para combater o estresse e ansiedade.',
  'Descubra 5 pontos de acupressão fundamentais para combater o estresse diário de forma natural e eficaz.',
  'Dr. XZenPress',
  'acupressao',
  true,
  NOW() - INTERVAL '2 days',
  8
);

-- POST 3: Respiração 4-7-8
INSERT INTO posts_do_blog (titulo, lesma, contente, trecho, autor, categoria, publicado, publicado_em, tempo_leitura) 
VALUES (
  'Respiração 4-7-8: A Técnica Científica para Ansiedade',
  'respiracao-4-7-8-tecnica-cientifica-ansiedade',
  'A técnica de respiração 4-7-8 desenvolvida pelo Dr. Andrew Weil tem comprovação científica para redução da ansiedade.',
  'Aprenda a técnica de respiração 4-7-8 com base científica para reduzir ansiedade e melhorar o bem-estar.',
  'Equipe XZenPress',
  'respiracao',
  true,
  NOW() - INTERVAL '5 days',
  6
);

-- POST 4: Lei 14.831/2024
INSERT INTO posts_do_blog (titulo, lesma, contente, trecho, autor, categoria, publicado, publicado_em, tempo_leitura) 
VALUES (
  'Lei 14.831/2024: Como Sua Empresa Pode Se Tornar Promotora da Saúde Mental',
  'lei-14831-2024-empresa-promotora-saude-mental',
  'A Lei 14.831/2024 representa um marco na legislação brasileira sobre saúde mental no ambiente de trabalho.',
  'Entenda como a Lei 14.831/2024 pode transformar sua empresa em uma Promotora da Saúde Mental e os benefícios práticos dessa adequação.',
  'Consultoria XZenPress',
  'bem-estar-corporativo',
  true,
  NOW() - INTERVAL '1 day',
  12
);

-- POST 5: Cromoterapia
INSERT INTO posts_do_blog (titulo, lesma, contente, trecho, autor, categoria, publicado, publicado_em, tempo_leitura) 
VALUES (
  'Cromoterapia: Como as Cores Afetam Nosso Bem-estar',
  'cromoterapia-cores-afetam-bem-estar',
  'A cromoterapia utiliza as diferentes frequências de luz colorida para promover equilíbrio físico, mental e emocional.',
  'Descubra como a cromoterapia funciona cientificamente e como as cores podem ser usadas terapeuticamente para melhorar seu bem-estar.',
  'Dr. Terapia Holística',
  'cromoterapia',
  true,
  NOW() - INTERVAL '7 days',
  10
);

-- Verificar resultado
SELECT COUNT(*) as total_posts, 'Posts resetados com sucesso!' as mensagem FROM posts_do_blog;
