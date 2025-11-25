-- Inserção SIMPLIFICADA do post "Vida Após a Morte"
-- Se der erro, me avise qual é!

INSERT INTO posts_do_blog (
  titulo,
  lesma,
  contente,
  trecho,
  autor,
  categoria,
  tags,
  publicado,
  publicado_em,
  tempo_leitura
) VALUES (
  'Vida Após a Morte: Argumentos Científicos Contra o Suicídio',
  'vida-apos-morte-2025',
  'Artigo completo sobre argumentos científicos e filosóficos sobre a vida e prevenção ao suicídio. CVV: 188 (24 horas). Este é um resumo do artigo completo.',
  'Argumentos científicos, filosóficos e existenciais sobre por que a vida vale a pena, mesmo nos momentos mais difíceis.',
  'XZenPress',
  'saude-mental',
  ARRAY['saúde-mental', 'prevenção-suicídio', 'cvv'],
  true,
  NOW(),
  15
);
