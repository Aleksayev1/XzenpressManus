// =============================================================================
// ZenSentinel — Camada de Triagem de Seguranca (CommonJS para Netlify Functions)
// =============================================================================
// PRINCIPIO INVIOLAVEL: Este modulo roda ANTES de qualquer engine de IA.
// FAIL-SAFE: Em erro, timeout ou ambiguidade -> CAUTION. Nunca SAFE.
// =============================================================================

const RULES = [
  // CRITICO — Emergencia Cardiovascular
  {
    id: 'cardio_emergency',
    category: 'cardiovascular',
    level: 'CRITICAL',
    patterns: [
      /dor (no |de )peito.{0,40}(bra[cç]o|costas|mand[ií]bula)/i,
      /(aperto|pressao) (no )peito.{0,50}(falta de ar|suando|tontura)/i,
      /dor forte no peito/i,
      /nao consigo respirar/i,
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
      /fala (enrolada|travada) de repente/i,
    ],
    weight: 10,
  },
  // CRITICO — Ideacao Suicida Ativa
  {
    id: 'suicidal_active_direct',
    category: 'suicidal_ideation_active',
    level: 'CRITICAL',
    negationGuard: /nao (vou|faria|consigo).{0,20}(fazer|isso|nada)/i,
    patterns: [
      /(quero|vou) (me matar|morrer|acabar com (tudo|minha vida))/i,
      /pensando (seriamente )?em (me matar|suicidio)/i,
      /nao faco falta.{0,40}(sumir|acabar|desistir)/i,
    ],
    weight: 10,
  },
  {
    id: 'suicidal_metaphor',
    category: 'suicidal_ideation_active',
    level: 'CRITICAL',
    negationGuard: /nao (quero|vou) (de verdade|serio)/i,
    patterns: [
      /apertar o botao de desligar/i,
      /sair do jogo (de vez|para sempre)/i,
      /(sumir|desaparecer) de vez/i,
    ],
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
    id: 'violence_active',
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
    id: 'passive_ideation',
    category: 'suicidal_ideation_passive',
    level: 'CAUTION',
    patterns: [
      /melhor (nao acordar|nem ter nascido|ter morrido)/i,
      /(as vezes) (penso) que seria melhor (nao|acabar)/i,
      /cansei de (tudo|lutar|tentar|viver assim)/i,
      /nada (faz|tem) (sentido|importancia)/i,
    ],
    weight: 6,
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
  // ATENCAO — Sintoma Persistente
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

const RESTRICTIONS = {
  pregnancy: ['no_acupoints_SP6', 'no_acupoints_LI4', 'no_herbal_uterotonic'],
  medication_interaction: ['no_herbal_anticoagulant'],
  cardiac_condition: ['no_breathing_intense'],
};

const TEMPLATES = {
  CRITICAL: {
    cardiovascular: 'O que voce esta descrevendo pode ser uma emergencia medica. Por favor, ligue AGORA para o SAMU: **192**, ou va ao pronto-socorro mais proximo. Nao espere os sintomas passarem.',
    neurological: 'Esses sintomas podem indicar uma emergencia neurologica. Ligue para o SAMU: **192** agora.',
    suicidal_ideation_active: 'Eu ouvi voce, e o que voce esta sentindo importa. O CVV esta disponivel 24h, de graca: ligue **188** ou acesse cvv.org.br. Se houver risco imediato, ligue **192**. Voce nao precisa passar por isso sozinho(a).',
    self_harm_active: 'Por favor, ligue agora para o SAMU (**192**) ou peca ajuda para alguem proximo. O CVV (**188**) tambem pode acompanhar voce agora.',
    domestic_violence: 'Sua seguranca e o que importa agora. Se estiver em perigo imediato, ligue **190** (Policia) ou **180** (Central da Mulher).',
    default: 'Essa situacao precisa de atendimento humano imediato. SAMU: **192** | CVV: **188** | Policia: **190**.',
  },
  CAUTION: {
    suicidal_ideation_passive: 'Obrigado por me dizer isso. Esses pensamentos merecem atencao de um profissional de saude mental. O CVV (**188**) funciona 24h se precisar conversar agora. Estou aqui com voce.',
    pregnancy: 'Vou adaptar as sugestoes considerando sua gestacao — alguns pontos e plantas precisam de cuidado extra durante a gravidez.',
    persistent_symptom: 'Esse sintoma merece uma avaliacao medica antes de qualquer pratica complementar. Recomendo consultar um profissional de saude.',
    default: 'O que voce descreveu merece cuidado — e as vezes esse cuidado envolve tambem o olhar de um profissional de saude. Estou aqui para apoiar voce com praticas de bem-estar.',
  },
};

/**
 * sentinelLayer1 — Classificador deterministico.
 * Nao depende de LLM. Roda offline. Sempre disponivel.
 * @param {string} input — mensagem do usuario
 * @returns {object} SentinelResult
 */
function sentinelLayer1(input) {
  try {
    const hits = RULES.filter(rule =>
      rule.patterns.some(pattern => pattern.test(input))
    );

    const effective = hits.map(rule => ({
      ...rule,
      effectiveLevel: (rule.negationGuard && rule.negationGuard.test(input) && rule.level === 'CRITICAL')
        ? 'CAUTION'   // negacao rebaixa — nunca libera para SAFE
        : rule.level,
    }));

    const worstLevel =
      effective.some(r => r.effectiveLevel === 'CRITICAL') ? 'CRITICAL' :
      effective.some(r => r.effectiveLevel === 'CAUTION')  ? 'CAUTION'  : 'SAFE';

    const categories = [...new Set(effective.map(r => r.category))];
    const primaryCategory = effective[0] && effective[0].category ? effective[0].category : 'default';

    return {
      level: worstLevel,
      categories,
      matchedRules: effective.map(r => r.id),   // auditabilidade LGPD Art. 20
      blockEngines: worstLevel === 'CRITICAL',
      responseTemplate: worstLevel === 'SAFE'
        ? null
        : ((TEMPLATES[worstLevel] && (TEMPLATES[worstLevel][primaryCategory] || TEMPLATES[worstLevel].default)) || null),
      restrictions: effective.reduce((acc, r) => acc.concat(RESTRICTIONS[r.category] || []), []),
      requiresHumanEscalation: worstLevel === 'CRITICAL',
    };
  } catch (error) {
    // FAIL-SAFE OBRIGATORIO: qualquer erro -> CAUTION. Nunca SAFE por omissao.
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

module.exports = { sentinelLayer1 };
