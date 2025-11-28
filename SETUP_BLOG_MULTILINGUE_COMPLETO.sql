-- SCRIPT UNIFICADO: CONFIGURAÇÃO COMPLETA DO BLOG MULTILÍNGUE
-- Execute este script inteiro no SQL Editor do Supabase

-- PARTE 1: CRIAR COLUNAS DE TRADUÇÃO
-- Adiciona colunas para os 11 idiomas adicionais na tabela posts_do_blog

-- 1. Inglês (en)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_en TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_en TEXT;

-- 2. Espanhol (es)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_es TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_es TEXT;

-- 3. Francês (fr)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_fr TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_fr TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_fr TEXT;

-- 4. Italiano (it)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_it TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_it TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_it TEXT;

-- 5. Alemão (de)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_de TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_de TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_de TEXT;

-- 6. Chinês (zh)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_zh TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_zh TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_zh TEXT;

-- 7. Japonês (ja)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ja TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ja TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ja TEXT;

-- 8. Russo (ru)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ru TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ru TEXT;

-- 9. Hindi (hi)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_hi TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_hi TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_hi TEXT;

-- 10. Árabe (ar)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_ar TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;

-- 11. Bengalês (bn)
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS title_bn TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS content_bn TEXT;
ALTER TABLE posts_do_blog ADD COLUMN IF NOT EXISTS excerpt_bn TEXT;


-- PARTE 2: INSERIR TRADUÇÕES
-- Popula o post principal com traduções em todos os idiomas

UPDATE posts_do_blog
SET 
  -- Inglês (EN)
  title_en = '5 Acupressure Points to Relieve Daily Stress',
  excerpt_en = 'Discover 5 key acupressure points to combat daily stress naturally and effectively.',
  content_en = '# 5 Acupressure Points to Relieve Daily Stress\n\nStress is a constant reality in modern life. Fortunately, Traditional Chinese Medicine offers simple and effective techniques to combat it through acupressure.\n\n## 1. Yintang (EX-HN3)\nLocated between the eyebrows, this point is known as the "third eye". It is extremely effective for reducing anxiety and calming the mind.\n\n## 2. Shenmen (C7)\nLocated at the wrist crease, this point is fundamental for balancing emotions and improving sleep quality.\n\n## 3. Laogong (PC8)\nIn the center of the palm, this point is ideal for controlling panic attacks and promoting immediate relaxation.',

  -- Espanhol (ES)
  title_es = '5 Puntos de Acupresión para Aliviar el Estrés Diario',
  excerpt_es = 'Descubre 5 puntos clave de acupresión para combatir el estrés diario de forma natural y efectiva.',
  content_es = '# 5 Puntos de Acupresión para Aliviar el Estrés Diario\n\nEl estrés es una realidad constante en la vida moderna. Afortunadamente, la Medicina Tradicional China ofrece técnicas simples y efectivas para combatirlo.\n\n## 1. Yintang (EX-HN3)\nUbicado entre las cejas, este punto es conocido como el "tercer ojo". Es extremadamente efectivo para reducir la ansiedad.\n\n## 2. Shenmen (C7)\nUbicado en el pliegue de la muñeca, es fundamental para equilibrar las emociones.\n\n## 3. Laogong (PC8)\nEn el centro de la palma, ideal para controlar ataques de pánico.',

  -- Francês (FR)
  title_fr = '5 Points d''Acupression pour Soulager le Stress Quotidien',
  excerpt_fr = 'Découvrez 5 points clés d''acupression pour combattre le stress quotidien naturellement.',
  content_fr = '# 5 Points d''Acupression pour Soulager le Stress Quotidien\n\nLe stress est une réalité constante. La Médecine Traditionnelle Chinoise offre des techniques simples.\n\n## 1. Yintang (EX-HN3)\nSitué entre les sourcils, ce point est connu comme le "troisième œil".\n\n## 2. Shenmen (C7)\nSitué au pli du poignet, fondamental pour équilibrer les émotions.',

  -- Alemão (DE)
  title_de = '5 Akupressurpunkte zur Linderung von Alltagsstress',
  excerpt_de = 'Entdecken Sie 5 wichtige Akupressurpunkte, um Alltagsstress natürlich zu bekämpfen.',
  content_de = '# 5 Akupressurpunkte zur Linderung von Alltagsstress\n\nStress ist eine ständige Realität. Die Traditionelle Chinesische Medizin bietet einfache Techniken.\n\n## 1. Yintang (EX-HN3)\nZwischen den Augenbrauen gelegen, bekannt als das "dritte Auge".',

  -- Italiano (IT)
  title_it = '5 Punti di Digitopressione per Alleviare lo Stress Quotidiano',
  excerpt_it = 'Scopri 5 punti chiave di digitopressione per combattere lo stress quotidiano.',
  content_it = '# 5 Punti di Digitopressione per Alleviare lo Stress Quotidiano\n\nLo stress è una realtà costante. La Medicina Tradizionale Cinese offre tecniche semplici.',

  -- Chinês (ZH)
  title_zh = '缓解日常压力的5个指压点',
  excerpt_zh = '探索5个关键的指压点，自然有效地对抗日常压力。',
  content_zh = '# 缓解日常压力的5个指压点\n\n压力是现代生活中不变的现实。幸运的是，中医提供了简单有效的指压技术来对抗它。\n\n## 1. 印堂 (Yintang)\n位于眉间，被称为"第三只眼"。对减轻焦虑非常有效。',

  -- Japonês (JA)
  title_ja = '日々のストレスを和らげる5つの指圧ポイント',
  excerpt_ja = '日々のストレスに自然かつ効果的に対処するための5つの重要な指圧ポイントを発見しましょう。',
  content_ja = '# 日々のストレスを和らげる5つの指圧ポイント\n\nストレスは現代生活において避けられないものです。幸いなことに、伝統的な中国医学は指圧を通じてそれに対抗するためのシンプルで効果的な技術を提供しています。',

  -- Russo (RU)
  title_ru = '5 точек акупрессуры для снятия ежедневного стресса',
  excerpt_ru = 'Откройте для себя 5 ключевых точек акупрессуры для естественной борьбы со стрессом.',
  content_ru = '# 5 точек акупрессуры для снятия ежедневного стресса\n\nСтресс — постоянная реальность современной жизни. Традиционная китайская медицина предлагает простые методы.',

  -- Hindi (HI)
  title_hi = 'दैनिक तनाव को दूर करने के लिए 5 एक्यूप्रेशर बिंदु',
  excerpt_hi = 'दैनिक तनाव से स्वाभाविक रूप से लड़ने के लिए 5 प्रमुख एक्यूप्रेशर बिंदुओं की खोज करें।',
  content_hi = '# दैनिक तनाव को दूर करने के लिए 5 एक्यूप्रेशर बिंदु\n\nतनाव आधुनिक जीवन की एक निरंतर वास्तविकता है। सौभाग्य से, पारंपरिक चीनी चिकित्सा एक्यूप्रेशर के माध्यम से इससे निपटने के लिए सरल और प्रभावी तकनीक प्रदान करती है।',

  -- Árabe (AR)
  title_ar = '5 نقاط للعلاج بالضغط لتخفيف التوتر اليومي',
  excerpt_ar = 'اكتشف 5 نقاط رئيسية للعلاج بالضغط لمكافحة التوتر اليومي بشكل طبيعي وفعال.',
  content_ar = '# 5 نقاط للعلاج بالضغط لتخفيف التوتر اليومي\n\nالتوتر حقيقة ثابتة في الحياة الحديثة. لحسن الحظ، يقدم الطب الصيني التقليدي تقنيات بسيطة وفعالة لمكافحته من خلال العلاج بالضغط.',

  -- Bengalês (BN)
  title_bn = 'দৈনিক চাপ উপশম করার জন্য 5টি আকুপ্রেশার পয়েন্ট',
  excerpt_bn = 'প্রাকৃতিকভাবে এবং কার্যকরভাবে দৈনিক চাপের বিরুদ্ধে লড়াই করার জন্য 5টি মূল আকুপ্রেশার পয়েন্ট আবিষ্কার করুন।',
  content_bn = '# দৈনিক চাপ উপশম করার জন্য 5টি আকুপ্রেশার পয়েন্ট\n\nচাপ আধুনিক জীবনের একটি ধ্রুবক বাস্তবতা। সৌভাগ্যবশত, ঐতিহ্যবাহী চীনা ঔষধ আকুপ্রেশারের মাধ্যমে এটি মোকাবেলা করার জন্য সহজ এবং কার্যকর কৌশল প্রদান করে।'

WHERE lesma = '5-pontos-acupressao-estresse-diario' OR lesma = '5-pontos-acupressao';

-- Confirmação final
SELECT 'Configuração completa do blog multilíngue realizada com sucesso!' as status;
