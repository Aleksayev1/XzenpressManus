-- ================================
-- TRADUÇÕES COMPLETAS PARA TODOS OS POSTS
-- ================================

-- 1. POST: "5 Pontos de Acupressão" (já tem traduções, mas vamos garantir)
UPDATE posts_do_blog
SET 
  title_en = '5 Acupressure Points to Relieve Daily Stress',
  excerpt_en = 'Discover 5 key acupressure points to combat daily stress naturally and effectively.',
  title_es = '5 Puntos de Acupresión para Aliviar el Estrés Diario',
  excerpt_es = 'Descubre 5 puntos clave de acupresión para combatir el estrés diario de forma natural y efectiva.',
  title_zh = '缓解日常压力的5个指压点',
  excerpt_zh = '探索5个关键的指压点，自然有效地对抗日常压力。'
WHERE lesma = '5-pontos-acupressao-estresse-diario';

-- 2. POST: "Respiração 4-7-8"
UPDATE posts_do_blog
SET 
  title_en = '4-7-8 Breathing: The Scientific Technique for Anxiety',
  excerpt_en = 'Learn the 4-7-8 breathing technique with scientific basis to reduce anxiety and improve well-being.',
  title_es = 'Respiración 4-7-8: La Técnica Científica para la Ansiedad',
  excerpt_es = 'Aprende la técnica de respiración 4-7-8 con base científica para reducir la ansiedad y mejorar el bienestar.',
  title_zh = '4-7-8呼吸法：缓解焦虑的科学技术',
  excerpt_zh = '学习具有科学依据的4-7-8呼吸技术，以减少焦虑并改善健康。'
WHERE lesma = 'respiracao-4-7-8-tecnica-cientifica-ansiedade';

-- 3. POST: "Lei 14.831/2024"
UPDATE posts_do_blog
SET 
  title_en = 'Law 14.831/2024: How Your Company Can Become a Mental Health Promoter',
  excerpt_en = 'Understand how Law 14.831/2024 can transform your company into a Mental Health Promoter and the practical benefits of this compliance.',
  title_es = 'Ley 14.831/2024: Cómo Su Empresa Puede Convertirse en Promotora de la Salud Mental',
  excerpt_es = 'Entienda cómo la Ley 14.831/2024 puede transformar su empresa en una Promotora de la Salud Mental y los beneficios prácticos de este cumplimiento.',
  title_zh = '14.831/2024法：您的公司如何成为心理健康促进者',
  excerpt_zh = '了解14.831/2024法如何将您的公司转变为心理健康促进者以及合规的实际好处。'
WHERE lesma = 'lei-14831-2024-empresa-promotora-saude-mental';

-- 4. POST: "Cromoterapia"
UPDATE posts_do_blog
SET 
  title_en = 'Chromotherapy: How Colors Affect Our Well-being',
  excerpt_en = 'Discover how chromotherapy works scientifically and how colors can be used therapeutically to improve your well-being.',
  title_es = 'Cromoterapia: Cómo los Colores Afectan Nuestro Bienestar',
  excerpt_es = 'Descubre cómo funciona científicamente la cromoterapia y cómo los colores pueden usarse terapéuticamente para mejorar tu bienestar.',
  title_zh = '色彩疗法：颜色如何影响我们的健康',
  excerpt_zh = '探索色彩疗法的科学原理以及如何通过治疗性地使用颜色来改善您的健康。'
WHERE lesma = 'cromoterapia-cores-afetam-bem-estar';

-- Confirmação
SELECT 
  lesma,
  titulo,
  title_en,
  title_es,
  title_zh
FROM posts_do_blog 
ORDER BY criado_em DESC;
