-- ====================================================================
-- MIGRATION: ZenGrowth Engine v2 — Growth Memory & Closed-Loop Analytics
-- Data: 03/08/2026
-- ====================================================================

-- 1. TABELA DE REGISTRO DE PERFORMANCE POR POST
CREATE TABLE IF NOT EXISTS public.zen_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.zen_content_queue(id) ON DELETE SET NULL,
  pillar VARCHAR(100) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'instagram',
  views INT DEFAULT 0,
  sessions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0.00,
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.zen_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir gestão em zen_performance_log"
  ON public.zen_performance_log FOR ALL USING (true);


-- 2. TABELA DE MEMÓRIA ESTRATÉGICA (Estado dos 4 Pilares)
CREATE TABLE IF NOT EXISTS public.zen_strategy_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar VARCHAR(100) UNIQUE NOT NULL,
  current_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  best_format VARCHAR(100) DEFAULT 'POV 60s',
  best_hook_type VARCHAR(100) DEFAULT 'Neurocientífico',
  avg_conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  total_conversions INT DEFAULT 0,
  last_revised_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE public.zen_strategy_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir gestão em zen_strategy_state"
  ON public.zen_strategy_state FOR ALL USING (true);

INSERT INTO public.zen_strategy_state (pillar, current_weight, best_format, best_hook_type)
VALUES 
  ('medicina', 1.00, 'Reels Educativo', 'Ciência + Corpo'),
  ('self-oracle', 1.00, 'Demonstração IA', 'Perguntei para a IA'),
  ('sessao-mestra', 1.25, 'Transformação 15m', 'Resultado emocional'),
  ('acupressao', 1.25, 'Tutorial 60s', 'Faça agora alívio imediato')
ON CONFLICT (pillar) DO NOTHING;


-- 3. TABELA GROWTH MEMORY HONEST (Com trava estatística & expiração em 90 dias)
CREATE TABLE IF NOT EXISTS public.zen_growth_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'hipotese', -- 'hipotese' | 'em_teste' | 'validado' | 'expirado'
  confidence NUMERIC(3,2) DEFAULT 0.50,
  sample_size INT NOT NULL DEFAULT 1,
  min_sample_para_validar INT NOT NULL DEFAULT 100,
  platform VARCHAR(50) NOT NULL DEFAULT 'Geral',
  pillar VARCHAR(100) DEFAULT 'Geral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
  notes TEXT
);

ALTER TABLE public.zen_growth_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir gestão em zen_growth_memory"
  ON public.zen_growth_memory FOR ALL USING (true);

-- Função para expirar automaticamente descobertas antigas (> 90 dias)
CREATE OR REPLACE FUNCTION expire_old_growth_memories()
RETURNS void AS $$
BEGIN
  UPDATE public.zen_growth_memory
  SET status = 'expirado'
  WHERE expira_em < CURRENT_DATE AND status != 'expirado';
END;
$$ LANGUAGE plpgsql;

-- Indexes para alta performance
CREATE INDEX IF NOT EXISTS idx_zen_perf_post ON public.zen_performance_log(post_id);
CREATE INDEX IF NOT EXISTS idx_zen_strat_pillar ON public.zen_strategy_state(pillar);
CREATE INDEX IF NOT EXISTS idx_zen_mem_status ON public.zen_growth_memory(status);
