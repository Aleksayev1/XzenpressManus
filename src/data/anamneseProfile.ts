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

/**
 * Cronicicidade do padrão principal — conecta MTC, Epigenética e André Luiz.
 * Quanto mais antigo, mais profunda a expressão epigenética e o padrão espiritual.
 */
export type Cronicicidade =
  | 'dias'       // Agudo — reação recente, sem marcador epigenético consolidado
  | 'semanas'    // Subagudo — início de padrão, epigenética em formação
  | 'meses'      // Crônico leve — metilação inicial de genes regulatórios
  | 'anos'       // Crônico — expressão epigenética estabelecida, padrão de Qi consolidado
  | 'vida_toda'; // Constitucional — possível herança epigenética, padrão kármico (André Luiz)

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

export interface GeneticMarkers {
  detoxHepatico: 'lento' | 'normal' | 'rapido';
  sensibilidadeInflamacao: 'alta' | 'normal' | 'baixa';
  estresseOxidativo: 'alto' | 'normal' | 'baixo';
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

  // ─── Campos Integrativos (os 3 elos da cadeia causal) ───────────────────

  /**
   * Há quanto tempo o padrão principal existe.
   * Epigenética: determina grau de metilação e expressão gênica consolidada.
   * André Luiz: padrões mais longos sugerem carga perispiritual acumulada.
   * MTC: define se é condição aguda (Biao) ou raiz profunda (Ben).
   */
  cronicicidade?: Cronicicidade;

  /**
   * Horário do dia em que o sintoma principal piora ou aparece.
   * MTC: mapeia diretamente ao Relógio dos Órgãos (Horloge Circadienne).
   * Ex: 1h–3h → Fígado (Madeira) | 3h–5h → Pulmão (Metal) | 11h–13h → Coração (Fogo)
   */
  horarioSintoma?: string;

  /**
   * O que o usuário acredita ser a causa do seu estado.
   * Maiêutica: ponto de entrada para o insight terapêutico.
   * Epigenética: crenças cronificadas alteram eixo HPA e expressão de BDNF/COMT.
   * ZenMentor usa isso para formular a pergunta socrática certa.
   */
  crencaLimitante?: string;

  // Scores calculados dos Guardiões
  guardianScores: GuardianScoresAnamnese;

  // Marcadores Epigenticos (DNA)
  geneticMarkers?: GeneticMarkers;

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

// ---- Cronicicidade ----
export const CRONICICIDADE_CONFIG: { id: Cronicicidade; label: string; epigeneticNote: string; mtcNote: string }[] = [
  {
    id: 'dias',
    label: 'Há alguns dias',
    epigeneticNote: 'Padrão agudo — sem marcador epigenético consolidado. Alta reversibilidade.',
    mtcNote: 'Condição de Biao (superfície) — desequilíbrio recente, responde bem à intervenção imediata.'
  },
  {
    id: 'semanas',
    label: 'Há algumas semanas',
    epigeneticNote: 'Início de metilação em genes do eixo HPA (cortisol). Ainda reversível com prática regular.',
    mtcNote: 'Transição Biao→Ben — o Qi está começando a comprometer o órgão subjacente.'
  },
  {
    id: 'meses',
    label: 'Há alguns meses',
    epigeneticNote: 'Metilação de genes regulatórios (NF-κB, IL-6) em consolidação. Requer prática consistente.',
    mtcNote: 'Condição de Ben (raiz) estabelecida — o padrão já afeta o órgão Zang e o meridiano.'
  },
  {
    id: 'anos',
    label: 'Há anos',
    epigeneticNote: 'Expressão epigenética estabelecida — genes COMT, MAOA, BDNF provavelmente afetados. Requer trabalho longitudinal.',
    mtcNote: 'Deficiência do Jing (essência) — o padrão penetrou no nível mais profundo do sistema energético.'
  },
  {
    id: 'vida_toda',
    label: 'Desde que me lembro / vida toda',
    epigeneticNote: 'Possível herança epigenética intergeracional. Padrão inscrito no epigenoma desde o desenvolvimento fetal.',
    mtcNote: 'Constituição Pré-Natal (Xian Tian Zhi Jing) — padrão herdado dos ancestrais. André Luiz: carga kármica familiar.'
  },
];

// ---- Horários MTC (Relógio dos Órgãos / Horloge Circadienne) ----
export const HORARIOS_MTC: { range: string; organ: string; element: string; guardian: keyof GuardianScoresAnamnese }[] = [
  { range: '23h–1h',  organ: 'Vesícula Biliar', element: 'Madeira', guardian: 'madeira' },
  { range: '1h–3h',   organ: 'Fígado',          element: 'Madeira', guardian: 'madeira' },
  { range: '3h–5h',   organ: 'Pulmão',           element: 'Metal',   guardian: 'metal'   },
  { range: '5h–7h',   organ: 'Intestino Grosso', element: 'Metal',   guardian: 'metal'   },
  { range: '7h–9h',   organ: 'Estômago',         element: 'Terra',   guardian: 'terra'   },
  { range: '9h–11h',  organ: 'Baço',             element: 'Terra',   guardian: 'terra'   },
  { range: '11h–13h', organ: 'Coração',           element: 'Fogo',    guardian: 'fogo'    },
  { range: '13h–15h', organ: 'Intestino Delgado', element: 'Fogo',    guardian: 'fogo'    },
  { range: '15h–17h', organ: 'Bexiga',            element: 'Água',    guardian: 'agua'    },
  { range: '17h–19h', organ: 'Rim',               element: 'Água',    guardian: 'agua'    },
  { range: '19h–21h', organ: 'Pericárdio',        element: 'Fogo',    guardian: 'fogo'    },
  { range: '21h–23h', organ: 'Triplo Aquecedor',  element: 'Fogo',    guardian: 'fogo'    },
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

  // Aplicar impacto dos sintomas físicos de forma segura
  if (profile && Array.isArray(profile.sintomasFisicos)) {
    profile.sintomasFisicos.forEach(sintomaId => {
      const cfg = SINTOMAS_CONFIG.find(s => s.id === sintomaId);
      if (cfg) {
        scores[cfg.guardianImpact] = Math.max(5, scores[cfg.guardianImpact] + cfg.impactValue);
      }
    });
  }

  // Aplicar impacto das emoções dominantes de forma segura
  if (profile && Array.isArray(profile.emocoesDominantes)) {
    profile.emocoesDominantes.forEach(emocaoId => {
      const cfg = EMOCOES_CONFIG.find(e => e.id === emocaoId);
      if (cfg) {
        const newVal = scores[cfg.guardianImpact] + cfg.impactValue;
        scores[cfg.guardianImpact] = Math.min(100, Math.max(5, newVal));
      }
    });
  }

  // Modificadores globais de sono
  const sonoModifier: Record<QualidadeSono, number> = {
    pessimo: -15,
    ruim: -8,
    regular: 0,
    bom: 5,
    otimo: 10,
  };
  if (profile && profile.qualidadeSono && sonoModifier[profile.qualidadeSono] !== undefined) {
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
  if (profile && profile.nivelEstresse && estresseModifier[profile.nivelEstresse] !== undefined) {
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
  // Garantir que guardianScores existe no perfil antigo
  const scores = profile.guardianScores || calcularGuardianScores(profile);
  
  const guardiaoFraco = Object.entries(scores || {}).reduce(
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

  // Interpretar cronicicidade nos múltiplos sistemas
  const cronicicidadeContext = profile.cronicicidade ? (() => {
    const cfg = CRONICICIDADE_CONFIG.find(c => c.id === profile.cronicicidade);
    return cfg ? `\n  → Epigenética: ${cfg.epigeneticNote}\n  → MTC: ${cfg.mtcNote}` : '';
  })() : '';

  // Interpretar horário do sintoma no Relógio dos Órgãos
  const horarioContext = profile.horarioSintoma
    ? `\n  → Relógio dos Órgãos (MTC): Sintomas no horário "${profile.horarioSintoma}" sugerem verificar qual meridiano está em pico nesse período. Cruze com o Guardião mais fraco para confirmar o padrão.`
    : '';

  // Crença limitante para a maiêutica do ZenMentor
  const crencaContext = profile.crencaLimitante
    ? `\n  → Maiêutica: O usuário acredita que a causa é "${profile.crencaLimitante}". Use isso como ponto de entrada socrático — não confronte diretamente, faça a pergunta que abre a reflexão.`
    : '';

  return `
## PERFIL DO USUÁRIO (Anamnese Evolutiva Integrativa — PILAR 0)
- Nome: ${profile.nome || 'Usuário'}
- Faixa etária: ${profile.faixaEtaria || 'Não informada'} anos
- Sexo biológico: ${profile.sexoBiologico || 'Não informado'}
- Objetivo principal: ${(profile.objetivoPrincipal || 'Geral').replace(/_/g, ' ')}
- Qualidade do sono: ${profile.qualidadeSono || 'Regular'}
- Nível de estresse: ${(profile.nivelEstresse || 'Moderado').replace(/_/g, ' ')}
- Nível de atividade física: ${profile.nivelAtividade || 'Não informado'}
- Padrão alimentar: ${(profile.padraoAlimentar || 'Geral').replace(/_/g, ' ')}
- Sintomas físicos relatados: ${(profile.sintomasFisicos || []).join(', ') || 'nenhum'}
- Emoções dominantes: ${(profile.emocoesDominantes || []).join(', ') || 'não informado'}
- Condições de saúde declaradas: ${(profile.condicoesExistentes || []).join(', ') || 'nenhuma'}
- Medicamentos em uso: ${(profile.medicamentosEmUso || []).join(', ') || 'nenhum'}
- Guardião mais fraco: ${nomeGuardiao[guardiaoFraco[0]] || 'Nenhum'} (${guardiaoFraco[1]}%)
- Scores dos Guardiões: Madeira ${scores.madeira || 60}%, Fogo ${scores.fogo || 60}%, Terra ${scores.terra || 60}%, Metal ${scores.metal || 60}%, Água ${scores.agua || 60}%

## CADEIA CAUSAL INTEGRATIVA
- Cronicicidade do padrão: ${profile.cronicicidade || 'não informado'}${cronicicidadeContext}
- Horário do sintoma: ${profile.horarioSintoma || 'não informado'}${horarioContext}
- Crença sobre a causa (Maiêutica): ${profile.crencaLimitante || 'não informada'}${crencaContext}

INSTRUÇÕES INTEGRATIVAS: Use o perfil completo para personalizar TODAS as respostas.
1. Sempre considere os medicamentos declarados ao sugerir plantas medicinais.
2. Priorize o Guardião mais fraco nas recomendações de acupressão e Qi Gong.
3. Use a cronicicidade para calibrar a profundidade da intervenção (aguda vs. constitucional).
4. Se o horário do sintoma estiver informado, relacione com o meridiano correspondente.
5. Use a crença limitante como ponto de entrada maiêutico — nunca confronte, pergunte.
6. Chame o usuário pelo nome quando disponível.
`.trim();
}
