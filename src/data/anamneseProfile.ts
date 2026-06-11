// ============================================================
// XZENPRESS — PILAR 0: ANAMNESE EVOLUTIVA INTELIGENTE
// Estrutura de dados do perfil inicial do usuário
// ============================================================

export type SexoBiologico = 'masculino' | 'feminino' | 'nao_informar';
export type ObjetivoPrincipal =
  | 'reduzir_estresse'
  | 'mais_energia'
  | 'longevidade'
  | 'equilibrio_emocional'
  | 'melhorar_sono'
  | 'fortalecer_imunidade';

export type FaixaEtaria = '18-29' | '30-44' | '45-59' | '60+';

export type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso';

export type QualidadeSono = 'pessimo' | 'ruim' | 'regular' | 'bom' | 'otimo';

export type NivelEstresse = 'muito_baixo' | 'baixo' | 'moderado' | 'alto' | 'critico';

export type PadraoAlimentar = 'processados' | 'misto' | 'natural' | 'organico_integral';

export type CondicaoExistente =
  | 'hipertensao'
  | 'diabetes'
  | 'ansiedade_diagnosticada'
  | 'depressao_diagnosticada'
  | 'problemas_digestivos'
  | 'dores_cronicas'
  | 'insonia_cronica'
  | 'problemas_hormonais'
  | 'nenhuma';

export type MedicamentoPotencial =
  | 'anticoagulantes'
  | 'antidepressivos'
  | 'antihipertensivos'
  | 'hipoglicemiantes'
  | 'anticoncepcionais'
  | 'nenhum';

export interface GuardianScoresAnamnese {
  madeira: number;
  fogo: number;
  terra: number;
  metal: number;
  agua: number;
}

export interface AnamneseProfile {
  // Identidade
  nome?: string;
  faixaEtaria: FaixaEtaria;
  sexoBiologico: SexoBiologico;
  objetivoPrincipal: ObjetivoPrincipal;

  // Estado físico atual
  qualidadeSono: QualidadeSono;
  nivelEnergia: number; // 0-100
  nivelEstresse: NivelEstresse;
  nivelAtividade: NivelAtividade;
  padraoAlimentar: PadraoAlimentar;

  // Sintomas físicos selecionados
  sintomasFisicos: string[];

  // Emocional
  emocoesDominantes: string[];

  // Saúde declarada
  condicoesExistentes: CondicaoExistente[];
  medicamentosEmUso: MedicamentoPotencial[];

  // Scores calculados dos Guardiões
  guardianScores: GuardianScoresAnamnese;

  // Metadados
  completedAt: string;
  version: number;
}

export const STORAGE_KEY_ANAMNESE = 'xzenpress_anamnese_v1';

// ---- Objetivos ----
export const OBJETIVOS_CONFIG: {
  id: ObjetivoPrincipal;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { id: 'reduzir_estresse', label: 'Reduzir estresse', emoji: '🧘', desc: 'Mais calma e equilíbrio no dia a dia' },
  { id: 'mais_energia', label: 'Mais energia', emoji: '⚡', desc: 'Vitalidade e disposição duradouras' },
  { id: 'longevidade', label: 'Longevidade', emoji: '🌿', desc: 'Viver mais e com mais saúde' },
  { id: 'equilibrio_emocional', label: 'Equilíbrio emocional', emoji: '❤️', desc: 'Paz interior e clareza mental' },
  { id: 'melhorar_sono', label: 'Melhorar o sono', emoji: '🌙', desc: 'Noites restauradoras e profundas' },
  { id: 'fortalecer_imunidade', label: 'Imunidade', emoji: '🛡️', desc: 'Fortalecer as defesas naturais' },
];

// ---- Sintomas físicos ----
export const SINTOMAS_CONFIG: { id: string; label: string; emoji: string; guardianImpact: keyof GuardianScoresAnamnese; impactValue: number }[] = [
  { id: 'acorda_noite', label: 'Acordo durante a noite', emoji: '🌙', guardianImpact: 'madeira', impactValue: -12 },
  { id: 'tensao_nuca', label: 'Tensão na nuca/ombros', emoji: '😤', guardianImpact: 'madeira', impactValue: -10 },
  { id: 'palpitacoes', label: 'Palpitações / ansiedade', emoji: '💓', guardianImpact: 'fogo', impactValue: -15 },
  { id: 'digestao_lenta', label: 'Digestão lenta ou pesada', emoji: '🤢', guardianImpact: 'terra', impactValue: -12 },
  { id: 'inchaço', label: 'Inchaço ou retenção', emoji: '💧', guardianImpact: 'terra', impactValue: -10 },
  { id: 'pele_ressecada', label: 'Pele ressecada', emoji: '🌵', guardianImpact: 'metal', impactValue: -10 },
  { id: 'constipacao', label: 'Intestino irregular', emoji: '🔄', guardianImpact: 'metal', impactValue: -10 },
  { id: 'respiracao_curta', label: 'Respiração curta', emoji: '💨', guardianImpact: 'metal', impactValue: -12 },
  { id: 'dor_lombar', label: 'Dor lombar crônica', emoji: '🦴', guardianImpact: 'agua', impactValue: -15 },
  { id: 'frio_extremidades', label: 'Pés/mãos frios', emoji: '🥶', guardianImpact: 'agua', impactValue: -10 },
  { id: 'cansaco_cronico', label: 'Cansaço constante', emoji: '😴', guardianImpact: 'agua', impactValue: -12 },
  { id: 'dores_articulares', label: 'Dores articulares', emoji: '🦵', guardianImpact: 'madeira', impactValue: -10 },
];

// ---- Emoções dominantes ----
export const EMOCOES_CONFIG: { id: string; label: string; emoji: string; guardianImpact: keyof GuardianScoresAnamnese; impactValue: number }[] = [
  { id: 'raiva', label: 'Raiva / irritação frequente', emoji: '😤', guardianImpact: 'madeira', impactValue: -18 },
  { id: 'ansiedade', label: 'Ansiedade / agitação', emoji: '😰', guardianImpact: 'fogo', impactValue: -18 },
  { id: 'preocupacao', label: 'Preocupação / ruminação', emoji: '😟', guardianImpact: 'terra', impactValue: -18 },
  { id: 'tristeza', label: 'Tristeza / melancolia', emoji: '😢', guardianImpact: 'metal', impactValue: -18 },
  { id: 'medo', label: 'Medo / insegurança', emoji: '😨', guardianImpact: 'agua', impactValue: -18 },
  { id: 'paz', label: 'Paz / tranquilidade', emoji: '😌', guardianImpact: 'agua', impactValue: 10 },
  { id: 'alegria', label: 'Alegria / gratidão', emoji: '😊', guardianImpact: 'fogo', impactValue: 10 },
  { id: 'foco', label: 'Foco / clareza mental', emoji: '🎯', guardianImpact: 'madeira', impactValue: 10 },
];

// ---- Condições existentes ----
export const CONDICOES_CONFIG: { id: CondicaoExistente; label: string; emoji: string }[] = [
  { id: 'hipertensao', label: 'Pressão alta', emoji: '❤️' },
  { id: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { id: 'ansiedade_diagnosticada', label: 'Ansiedade (diagnosticada)', emoji: '🧠' },
  { id: 'depressao_diagnosticada', label: 'Depressão (diagnosticada)', emoji: '🌧️' },
  { id: 'problemas_digestivos', label: 'Problemas digestivos', emoji: '🫄' },
  { id: 'dores_cronicas', label: 'Dores crônicas', emoji: '⚡' },
  { id: 'insonia_cronica', label: 'Insônia crônica', emoji: '🌙' },
  { id: 'problemas_hormonais', label: 'Desequilíbrio hormonal', emoji: '⚗️' },
  { id: 'nenhuma', label: 'Nenhuma das acima', emoji: '✅' },
];

// ---- Medicamentos ----
export const MEDICAMENTOS_CONFIG: { id: MedicamentoPotencial; label: string }[] = [
  { id: 'anticoagulantes', label: 'Anticoagulantes (Warfarina, etc.)' },
  { id: 'antidepressivos', label: 'Antidepressivos / Ansiolíticos' },
  { id: 'antihipertensivos', label: 'Anti-hipertensivos' },
  { id: 'hipoglicemiantes', label: 'Hipoglicemiantes (Metformina, etc.)' },
  { id: 'anticoncepcionais', label: 'Anticoncepcionais hormonais' },
  { id: 'nenhum', label: 'Nenhum medicamento contínuo' },
];

// ============================================================
// CALCULADORA DE SCORES DOS GUARDIÕES BASEADA NA ANAMNESE
// ============================================================

export function calcularGuardianScores(profile: Partial<AnamneseProfile>): GuardianScoresAnamnese {
  const base = 60; // Começa em 60, não em 50 — otimismo moderado
  const scores: GuardianScoresAnamnese = {
    madeira: base,
    fogo: base,
    terra: base,
    metal: base,
    agua: base,
  };

  // Aplicar impacto dos sintomas físicos
  (profile.sintomasFisicos || []).forEach(sintomaId => {
    const cfg = SINTOMAS_CONFIG.find(s => s.id === sintomaId);
    if (cfg) {
      scores[cfg.guardianImpact] = Math.max(5, scores[cfg.guardianImpact] + cfg.impactValue);
    }
  });

  // Aplicar impacto das emoções dominantes
  (profile.emocoesDominantes || []).forEach(emocaoId => {
    const cfg = EMOCOES_CONFIG.find(e => e.id === emocaoId);
    if (cfg) {
      const newVal = scores[cfg.guardianImpact] + cfg.impactValue;
      scores[cfg.guardianImpact] = Math.min(100, Math.max(5, newVal));
    }
  });

  // Modificadores globais de sono
  const sonoModifier: Record<QualidadeSono, number> = {
    pessimo: -15,
    ruim: -8,
    regular: 0,
    bom: 5,
    otimo: 10,
  };
  if (profile.qualidadeSono) {
    const mod = sonoModifier[profile.qualidadeSono];
    Object.keys(scores).forEach(k => {
      scores[k as keyof GuardianScoresAnamnese] = Math.min(100, Math.max(5, scores[k as keyof GuardianScoresAnamnese] + mod * 0.5));
    });
  }

  // Modificadores de estresse
  const estresseModifier: Record<NivelEstresse, number> = {
    muito_baixo: 10,
    baixo: 5,
    moderado: -5,
    alto: -12,
    critico: -20,
  };
  if (profile.nivelEstresse) {
    const mod = estresseModifier[profile.nivelEstresse];
    scores.fogo = Math.min(100, Math.max(5, scores.fogo + mod));
    scores.madeira = Math.min(100, Math.max(5, scores.madeira + mod * 0.7));
    scores.terra = Math.min(100, Math.max(5, scores.terra + mod * 0.5));
  }

  // Arredondar todos os scores
  Object.keys(scores).forEach(k => {
    scores[k as keyof GuardianScoresAnamnese] = Math.round(scores[k as keyof GuardianScoresAnamnese]);
  });

  return scores;
}

// ---- Persistência ----

export function saveAnamneseProfile(profile: AnamneseProfile): void {
  localStorage.setItem(STORAGE_KEY_ANAMNESE, JSON.stringify(profile));
}

export function loadAnamneseProfile(): AnamneseProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANAMNESE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function hasCompletedAnamnese(): boolean {
  return !!loadAnamneseProfile();
}

// ---- Gerar resumo para o Oracle (injetado no system prompt) ----
export function generateOracleContext(profile: AnamneseProfile): string {
  const guardiaoFraco = Object.entries(profile.guardianScores).reduce(
    (min, [k, v]) => (v < min[1] ? [k, v] : min),
    ['', 100]
  );

  const nomeGuardiao: Record<string, string> = {
    madeira: 'Guardião da Madeira (Fígado)',
    fogo: 'Guardião do Fogo (Coração)',
    terra: 'Guardião da Terra (Baço)',
    metal: 'Guardião do Metal (Pulmão)',
    agua: 'Guardião da Água (Rim)',
  };

  return `
## PERFIL DO USUÁRIO (Anamnese Evolutiva — PILAR 0)
- Nome: ${profile.nome || 'Usuário'}
- Faixa etária: ${profile.faixaEtaria} anos
- Sexo biológico: ${profile.sexoBiologico}
- Objetivo principal: ${profile.objetivoPrincipal.replace(/_/g, ' ')}
- Qualidade do sono: ${profile.qualidadeSono}
- Nível de estresse: ${profile.nivelEstresse.replace(/_/g, ' ')}
- Nível de atividade física: ${profile.nivelAtividade}
- Padrão alimentar: ${profile.padraoAlimentar.replace(/_/g, ' ')}
- Sintomas físicos relatados: ${profile.sintomasFisicos.join(', ') || 'nenhum'}
- Emoções dominantes: ${profile.emocoesDominantes.join(', ') || 'não informado'}
- Condições de saúde declaradas: ${profile.condicoesExistentes.join(', ') || 'nenhuma'}
- Medicamentos em uso: ${profile.medicamentosEmUso.join(', ') || 'nenhum'}
- Guardião mais fraco: ${nomeGuardiao[guardiaoFraco[0]]} (${guardiaoFraco[1]}%)
- Scores dos Guardiões: Madeira ${profile.guardianScores.madeira}%, Fogo ${profile.guardianScores.fogo}%, Terra ${profile.guardianScores.terra}%, Metal ${profile.guardianScores.metal}%, Água ${profile.guardianScores.agua}%

INSTRUÇÕES: Use este perfil para personalizar TODAS as respostas. Sempre considere os medicamentos declarados ao sugerir plantas medicinais. Priorize o Guardião mais fraco nas recomendações. Chame o usuário pelo nome quando disponível.
`.trim();
}
