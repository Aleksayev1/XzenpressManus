-- ================================
-- SCRIPT COMPLETO: Tradução de TODOS os Posts
-- ================================

-- 1. POST: "5 Pontos de Acupressão"
UPDATE posts_do_blog
SET 
  title_en = '5 Acupressure Points to Relieve Daily Stress',
  content_en = '# 5 Acupressure Points to Relieve Daily Stress

Stress is a constant in modern life. Fortunately, Traditional Chinese Medicine offers simple and effective techniques to combat it through acupressure.',
  excerpt_en = 'Discover 5 key acupressure points to combat daily stress naturally and effectively.',
  
  title_es = '5 Puntos de Acupresión para Aliviar el Estrés Diario',
  content_es = '# 5 Puntos de Acupresión para Aliviar el Estrés Diario

El estrés es una constante en la vida moderna. Afortunadamente, la Medicina Tradicional China ofrece técnicas simples y efectivas para combatirlo.',
  excerpt_es = 'Descubre 5 puntos clave de acupresión para combatir el estrés diario de forma natural y efectiva.',
  
  title_zh = '缓解日常压力的5个指压点',
  content_zh = '# 缓解日常压力的5个指压点

压力是现代生活中的常态。幸运的是，中医提供了简单有效的指压技术来对抗它。',
  excerpt_zh = '探索5个关键的指压点，自然有效地对抗日常压力。'
WHERE lesma = '5-pontos-acupressao-estresse-diario';

-- 2. POST: "Vida Após a Morte"
UPDATE posts_do_blog
SET 
  title_en = 'Life After Death: Scientific Arguments Against Suicide',
  content_en = '# Life After Death: Scientific Arguments Against Suicide

A deep analysis on the continuity of consciousness and the implications of suicide under a scientific and spiritual perspective.

## The Continuity of Consciousness
Near-Death Experience (NDE) studies suggest that consciousness may persist beyond physical death.

## The Impact of Suicide
Suicide does not end suffering, it only transfers consciousness to another state.

## Seek Help
If you are going through a difficult time, know that you are not alone. Life is precious and there are solutions to your suffering.',
  excerpt_en = 'A scientific and spiritual analysis on the continuity of life and why suicide is not the solution.',
  
  title_es = 'Vida Después de la Muerte: Argumentos Científicos Contra el Suicidio',
  content_es = '# Vida Después de la Muerte: Argumentos Científicos Contra el Suicidio

Un análisis profundo sobre la continuidad de la conciencia y las implicaciones del suicidio bajo una perspectiva científica y espiritual.

## La Continuidad de la Conciencia
Estudios de Experiencia Cercana a la Muerte (ECM) sugieren que la conciencia puede persistir más allá de la muerte física.

## El Impacto del Suicidio
El suicidio no termina con el sufrimiento, solo transfiere la conciencia a otro estado.

## Busca Ayuda
Si estás pasando por un momento difícil, sepa que no estás solo. La vida es preciosa y hay soluciones para tu sufrimiento.',
  excerpt_es = 'Un análisis científico y espiritual sobre la continuidad de la vida y por qué el suicidio no es la solución.',
  
  title_zh = '死后的生活：反对自杀的科学论据',
  content_zh = '# 死后的生活：反对自杀的科学论据

从科学和精神的角度深入分析意识的连续性和自杀的影响。

## 意识的连续性
濒死体验 (NDE) 研究表明，意识可能会在肉体死亡后继续存在。

## 自杀的影响
自杀并不能结束痛苦，它只是将意识转移到另一种状态。

## 寻求帮助
如果你正在经历困难时期，请知道你并不孤单。生命是宝贵的，你的痛苦有解决方案。',
  excerpt_zh = '从科学和精神的角度深入分析生命的连续性以及为什么自杀不是解决方案。'
WHERE lesma = 'vida-apos-morte-argumentos-cientificos-contra-suicidio';

-- Confirmação
SELECT 
  id,
  titulo,
  title_en,
  title_es,
  title_zh
FROM posts_do_blog 
WHERE lesma IN ('5-pontos-acupressao-estresse-diario', 'vida-apos-morte-argumentos-cientificos-contra-suicidio');
