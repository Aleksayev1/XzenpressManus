// =============================================================================
// ZenSentinel — Camada de Triagem de Seguran—a do XZenPress
// =============================================================================
// PRINCIPIO INVIOLAVEL: Este modulo roda ANTES de qualquer engine.
// Nunca pode ser bypassado.
//
// FAIL-SAFE: Em qualquer erro, timeout ou ambiguidade -> default e CAUTION.
// Falso positivo custa uma mensagem acolhedora a mais.
// Falso negativo custa o projeto.
//
// ARQUITETURA CINTO E SUSPENSORIO:
//   Camada 1: Regras deterministicas (sempre roda, <5ms, offline-safe)
//   Camada 2: LLM como segundo verificador (quando disponivel)
//   Merge: prevalece SEMPRE a classificacao mais grave das duas
// =============================================================================

export type SentinelLevel = 'CRITICAL' | 'CAUTION' | 'SAFE';

export interface SentinelResult {
  level: SentinelLevel;
  categories: string[];
  matchedRules: string[];         // auditabilidade — LGPD Art. 20
  blockEngines: boolean;          // true = CRITICAL: nenhum engine roda
  responseTemplate: string | null;
  restrictions: string[];         // ex: ['no_acupoints_SP6'] para gestante
  requiresHumanEscalation: boolean;
}

interface Rule {
  id: string;
  category: string;
  level: SentinelLevel;
  patterns: RegExp[];
  negationGuard?: RegExp;         // rebaixa um nivel — nunca libera para SAFE
  weight: number;
}

// =============================================================================
// TABELA DE REGRAS (Camada 1)
// =============================================================================

const RULES: Rule[] = [
  // CRITICO — Emergencia Cardiovascular
  {
    id: 'cardio_emergency_radiation',
    category: 'cardiovascular',
    level: 'CRITICAL',
    patterns: [
      /dor (no |de )peito.{0,40}(bra[cç]o|costas|mand[ií]bula)/i,
      /(aperto|pressao|aperta) (no )peito.{0,50}(falta de ar|suando|tontura)/i,
      /dor forte no peito/i,
    ],
    weight: 10,
  },
  {
    id: 'cardio_breathless',
    category: 'cardiovascular',
    level: 'CRITICAL',
    patterns: [
      /nao consigo respirar/i,
      /falta (de )?ar de repente/i,
      /aperto no peito e suando frio/i,
    ],
    weight: 10,
  },

  // CRITICO — Emergencia Neurologica
  {
    id: 'neuro_emergency',
    category: 'neurological',
    level: 'CRITICAL',
    patterns: [
      /pior dor de cabe[cç]a (da minha vida|que ja tive|de repente)/i,
      /(boca|rosto) (torto|caindo) de repente/i,
      /(bra[cç]o|perna).{0,20}(dormeceu|sem forca) de repente/i,
    ],
    weight: 10,
  },

  // CRITICO — Ideacao Suicida Ativa
  {
    id: 'suicidal_active_direct',
    category: 'suicidal_ideation_active',
    level: 'CRITICAL',
    patterns: [
      /(quero|vou) (me matar|morrer|acabar com (tudo|minha vida))/i,
      /pensando (seriamente )?em (me matar|suicidio|dar um fim)/i,
      /nao faco falta.{0,40}(sumir|acabar|desistir)/i,
    ],
    negationGuard: /nao (vou|faria|consigo).{0,20}(fazer|isso|nada)/i,
    weight: 10,
  },
  {
    id: 'suicidal_active_metaphor',
    category: 'suicidal_ideation_active',
    level: 'CRITICAL',
    patterns: [
      /apertar o botao de desligar/i,
      /sair do jogo (de vez|para sempre)/i,
      /(sumir|desaparecer) de vez/i,
    ],
    negationGuard: /nao (quero|vou) (de verdade|serio)/i,
    weight: 9,
  },

  // CRITICO — Autolesao em Curso
  {
    id: 'self_harm_active',
    category: 'self_harm_active',
    level: 'CRITICAL',
    patterns: [
      /me (cortei|machuquei) agora/i,
      /tomei (os remedios todos|varios comprimidos) de uma vez/i,
    ],
    weight: 10,
  },

  // CRITICO — Violencia em Curso
  {
    id: 'domestic_violence_active',
    category: 'domestic_violence',
    level: 'CRITICAL',
    patterns: [
      /(ele|ela) vai me bater agora/i,
      /to trancad[ao] (no quarto|em casa) com medo/i,
    ],
    weight: 10,
  },

  // ATENCAO — Ideacao Passiva
  {
    id: 'passive_ideation_wishful',
    category: 'suicidal_ideation_passive',
    level: 'CAUTION',
    patterns: [
      /melhor (nao acordar|nem ter nascido|ter morrido)/i,
      /(as vezes) (penso|fico pensando) que seria melhor (nao|acabar)/i,
    ],
    weight: 6,
  },
  {
    id: 'passive_ideation_hopeless',
    category: 'hopelessness',
    level: 'CAUTION',
    patterns: [
      /cansei de (tudo|lutar|tentar|viver assim)/i,
      /nada (faz|tem) (sentido|importancia)/i,
    ],
    weight: 5,
  },

  // ATENCAO — Gravidez
  {
    id: 'pregnancy',
    category: 'pregnancy',
    level: 'CAUTION',
    patterns: [
      /(to|estou|sou) gravida/i,
      /gestante/i,
      /gravidez/i,
      /semanas de gestacao/i,
    ],
    weight: 5,
  },

  // ATENCAO — Medicacao / Condicao Cronica
  {
    id: 'anticoagulant',
    category: 'medication_interaction',
    level: 'CAUTION',
    patterns: [
      /tomo (anticoagulante|varfarina|warfarina|xarelto)/i,
      /uso (marcapasso|desfibrilador)/i,
    ],
    weight: 5,
  },
  {
    id: 'cardiac_condition',
    category: 'cardiac_condition',
    level: 'CAUTION',
    patterns: [
      /sou cardiaco/i,
      /insuficiencia cardiaca/i,
      /faco (quimio|quimioterapia)/i,
    ],
    weight: 5,
  },

  // ATENCAO — Sintoma Fisico Persistente
  {
    id: 'persistent_symptom',
    category: 'persistent_symptom',
    level: 'CAUTION',
    patterns: [
      /essa (dor|febre).{0,30}(nao passa|ha (semanas|meses))/i,
      /perdi \d+\s?kg (sem fazer nada|de repente)/i,
    ],
    weight: 4,
  },
];

// =============================================================================
// RESTRICOES POR CATEGORIA
// =============================================================================

const RESTRICTIONS: Record<string, string[]> = {
  pregnancy: [
    'no_acupoints_SP6',
    'no_acupoints_LI4',
    'no_herbal_uterotonic',
    'no_breathing_forceful',
  ],
  medication_interaction: ['no_herbal_anticoagulant'],
  cardiac_condition: ['no_breathing_intense'],
};

// =============================================================================
// TEMPLATES DE RESPOSTA — linguagem juridicamente segura + acolhedora
// =============================================================================

const TEMPLATES: Record<string, Record<string, string>> = {
  CRITICAL: {
    cardiovascular:
      'O que voce esta descrevendo pode ser uma emergencia medica. Por favor, ligue AGORA para o SAMU: **192**, ou va ao pronto-socorro mais proximo. Nao espere os sintomas passarem.',
    neurological:
      'Esses sintomas podem indicar uma emergencia neurologica. Ligue para o SAMU: **192** agora.',
    suicidal_ideation_active:
      'Eu ouvi voce, e o que voce esta sentindo importa. O CVV esta disponivel 24h, de graca: ligue **188** ou acesse cvv.org.br. Se houver risco imediato, ligue **192**.',
    self_harm_active:
      'Por favor, ligue agora para o SAMU (**192**) ou peca ajuda para alguem proximo. O CVV (**188**) tambem pode acompanhar voce agora.',
    domestic_violence:
      'Sua seguranca e o que importa agora. Se estiver em perigo imediato, ligue **190** (Policia) ou **180** (Central da Mulher).',
    default:
      'Essa situacao precisa de atendimento humano imediato. SAMU: **192** | CVV: **188** | Policia: **190**.',
  },
  CAUTION: {
    suicidal_ideation_passive:
      'Obrigado por me dizer isso. Esses pensamentos merecem atencao de um profissional de saude mental. O CVV (**188**) funciona 24h se precisar conversar agora.',
    hopelessness:
      'O cansaco que voce esta sentindo e real, e eu ouco isso. Se em algum momento sentir que precisa de um suporte diferente, o CVV (**188**) esta disponivel sem julgamento.',
    pregnancy:
      'Vou adaptar as sugestoes considerando sua gestacao — alguns pontos e plantas precisam de cuidado extra durante a gravidez.',
    persistent_symptom:
      'Esse sintoma merece uma avaliacao medica antes de qualquer pratica complementar. Recomendo consultar um profissional.',
    default:
      'O que voce descreveu merece cuidado — e as vezes esse cuidado envolve tambem o olhar de um profissional de saude.',
  },
};

// =============================================================================
// FUNCAO PRINCIPAL — CAMADA 1
// =============================================================================

export function sentinelLayer1(input: string): SentinelResult {
  try {
    const SEVERITY_ORDER: Record<SentinelLevel, number> = { CRITICAL: 2, CAUTION: 1, SAFE: 0 };

    const hits = RULES.filter(rule =>
      rule.patterns.some(pattern => pattern.test(input))
    );

    const effective = hits.map(rule => ({
      ...rule,
      effectiveLevel: (
        rule.negationGuard?.test(input) && rule.level === 'CRITICAL'
          ? 'CAUTION'
          : rule.level
      ) as SentinelLevel,
    }));

    const worstLevel: SentinelLevel =
      effective.some(r => r.effectiveLevel === 'CRITICAL') ? 'CRITICAL' :
      effective.some(r => r.effectiveLevel === 'CAUTION')  ? 'CAUTION'  : 'SAFE';

    const categories = [...new Set(effective.map(r => r.category))];
    const primaryCategory = effective[0]?.category ?? 'default';

    return {
      level: worstLevel,
      categories,
      matchedRules: effective.map(r => r.id),
      blockEngines: worstLevel === 'CRITICAL',
      responseTemplate:
        worstLevel === 'SAFE' ? null
          : (TEMPLATES[worstLevel]?.[primaryCategory] ?? TEMPLATES[worstLevel]?.default ?? null),
      restrictions: effective.flatMap(r => RESTRICTIONS[r.category] ?? []),
      requiresHumanEscalation: worstLevel === 'CRITICAL',
    };
  } catch (error) {
    // FAIL-SAFE: erro no classificador NUNCA libera fluxo normal
    console.error('[ZenSentinel] Erro na camada 1 — fail-safe ativado:', error);
    return {
      level: 'CAUTION',
      categories: ['classifier_error'],
      matchedRules: ['FAILSAFE'],
      blockEngines: false,
      responseTemplate: TEMPLATES.CAUTION.default,
      restrictions: [],
      requiresHumanEscalation: false,
    };
  }
}

// =============================================================================
// MERGE DE CAMADAS (Camada 1 + Camada 2 via LLM)
// Prevalece sempre a classificacao mais grave
// =============================================================================

const SEVERITY: Record<SentinelLevel, number> = { CRITICAL: 2, CAUTION: 1, SAFE: 0 };

export function mergeSentinelResults(
  layer1: SentinelResult,
  layer2: SentinelResult | null,
): SentinelResult {
  if (!layer2) return layer1;
  const worstLevel = SEVERITY[layer1.level] >= SEVERITY[layer2.level]
    ? layer1.level : layer2.level;

  return {
    level: worstLevel,
    categories: [...new Set([...layer1.categories, ...layer2.categories])],
    matchedRules: [...new Set([...layer1.matchedRules, ...layer2.matchedRules])],
    blockEngines: worstLevel === 'CRITICAL',
    responseTemplate: SEVERITY[layer1.level] >= SEVERITY[layer2.level]
      ? layer1.responseTemplate : layer2.responseTemplate,
    restrictions: [...new Set([...layer1.restrictions, ...layer2.restrictions])],
    requiresHumanEscalation: layer1.requiresHumanEscalation || layer2.requiresHumanEscalation,
  };
}

// =============================================================================
// ENTRADA PRINCIPAL
// =============================================================================

export async function runSentinel(
  userMessage: string,
  llmVerifier?: (input: string) => Promise<SentinelResult | null>,
): Promise<SentinelResult> {
  const layer1 = sentinelLayer1(userMessage);

  // CRITICO pela camada 1 -> resposta imediata, sem aguardar LLM
  if (layer1.level === 'CRITICAL') return layer1;

  let layer2: SentinelResult | null = null;
  if (llmVerifier) {
    try {
      layer2 = await Promise.race([
        llmVerifier(userMessage),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch {
      // LLM indisponivel -> layer1 segura sozinha (fail-safe)
    }
  }

  return mergeSentinelResults(layer1, layer2);
}
