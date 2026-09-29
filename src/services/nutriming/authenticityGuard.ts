/**
 * AuthenticityGuard
 * ─────────────────────────────────────────────────────────────────────────────
 * Detecta padrões de adulteração e maquiagem industrial em rótulos alimentares.
 * Opera 100% offline, < 2ms, zero rede.
 *
 * Contexto clínico XZenPress:
 * O paciente escaneia um produto que se apresenta como "chocolate", "leite" ou
 * "queijo". Este guard analisa a lista de ingredientes e o nome do produto para
 * identificar se o produto é genuíno ou se trata de um COMPOSTO, ANÁLOGO ou
 * PRODUTO MAQUIADO industrialmente — com impacto direto na inflamação sistêmica
 * e na resposta metabólica do paciente.
 */

export type AuthenticityCategory =
  | 'chocolate'
  | 'dairy_milk'
  | 'dairy_cheese'
  | 'dairy_yogurt'
  | 'juice'
  | 'honey'
  | 'olive_oil'
  | 'meat_processed';

export type AuthenticityLevel =
  | 'genuine'      // Produto genuíno, ingredientes compatíveis com a identidade
  | 'suspect'      // Presença de extensores ou ingredientes que levantam suspeita
  | 'misleading'   // Produto claramente adulterado ou "análogo" mascarado
  | 'unknown';     // Não foi possível avaliar (sem lista de ingredientes)

export interface AuthenticityFlag {
  level: AuthenticityLevel;
  category: AuthenticityCategory | null;
  fraudTermsFound: string[];
  explanation: string;
  clinicalNote: string;
  consumerRights: string;
}

// ─── TERMOS POR CATEGORIA ───────────────────────────────────────────────────

/** Termos que CONFIRMAM autenticidade (são esperados no produto genuíno) */
const GENUINE_MARKERS: Record<AuthenticityCategory, string[]> = {
  chocolate: ['cacau', 'liquor de cacau', 'massa de cacau', 'manteiga de cacau', 'pasta de cacau'],
  dairy_milk: ['leite integral', 'leite desnatado', 'leite semidesnatado'],
  dairy_cheese: ['leite', 'coalho', 'cloreto de cálcio', 'sal', 'fermento lático'],
  dairy_yogurt: ['leite', 'fermento lático', 'streptococcus thermophilus', 'lactobacillus bulgaricus'],
  juice: ['suco de', 'polpa de'],
  honey: ['mel'],
  olive_oil: ['azeite de oliva'],
  meat_processed: ['carne', 'frango', 'suíno']
};

/** Termos que DENUNCIAM adulteração ou extensão industrial */
const FRAUD_MARKERS: Record<AuthenticityCategory, string[]> = {
  chocolate: [
    'gordura vegetal', 'gordura de palma', 'gordura de palmiste',
    'gordura parcialmente hidrogenada', 'gordura interesterificada',
    'óleo vegetal parcialmente', 'gordura vegetal fracionada',
    'aroma de chocolate', 'aroma artificial', 'cacau em pó alcalinizado',
    'farinha de trigo', 'amido de milho', 'dextrose', 'xarope de glicose',
    'cobertura sabor chocolate', 'coating', 'hidrogenado'
  ],
  dairy_milk: [
    'amido', 'amido modificado', 'gordura vegetal', 'soro de leite em pó',
    'maltodextrina', 'xarope de milho', 'lactose', 'proteína de soja',
    'carragena', 'goma guar', 'extrato de baunilha artificial',
    'composto lácteo', 'bebida láctea', 'mistura láctea'
  ],
  dairy_cheese: [
    'amido', 'amido modificado', 'gordura vegetal', 'óleo vegetal',
    'proteína de soja', 'caseína', 'caseinato', 'carragena',
    'goma xantana', 'fosfato', 'análogo', 'requeijão light com amido',
    'gordura de palmiste', 'gordura interesterificada',
    'produto lácteo composto', 'produto de queijo processado', 'queijo processado'
  ],
  dairy_yogurt: [
    'amido', 'amido modificado', 'gelatina', 'maltodextrina', 'dextrose',
    'xarope de frutose', 'xarope de glucose', 'carragena', 'goma',
    'sabor artificial', 'corante', 'sacarose excessiva'
  ],
  juice: [
    'açúcar adicionado', 'frutose', 'xarope de milho', 'aroma artificial',
    'ácido cítrico', 'conservante', 'corante', 'água adicionada',
    'suco reconstituído com adição'
  ],
  honey: [
    'xarope de glicose', 'xarope de frutose', 'açúcar invertido',
    'sacarose', 'xarope de milho', 'aroma', 'corante', 'conservante',
    'extrato de mel'
  ],
  olive_oil: [
    'óleo de soja', 'óleo de canola', 'óleo de girassol', 'óleo vegetal',
    'óleo de palma', 'mistura de óleos', 'blend'
  ],
  meat_processed: [
    'proteína de soja', 'proteína vegetal texturizada', 'amido', 'amido modificado',
    'carragena', 'polifosfato', 'nitrito de sódio', 'nitrato de sódio',
    'corante', 'eritorbato de sódio', 'glutamato monossódico',
    'caldo de carne artificial', 'aroma de carne'
  ]
};

/** Termos no NOME do produto que denunciam identidade falsa */
const MISLEADING_NAME_PATTERNS: Record<AuthenticityCategory, string[]> = {
  chocolate:    ['sabor chocolate', 'cobertura sabor', 'achocolatado', 'composto de chocolate'],
  dairy_milk:   ['composto lácteo', 'bebida láctea', 'mistura láctea', 'leite uht com'],
  dairy_cheese: ['análogo', 'produto de queijo', 'queijo processado', 'composto lácteo'],
  dairy_yogurt: ['bebida láctea fermentada', 'bebida iogurtizada'],
  juice:        ['néctar', 'refresco', 'bebida de fruta', 'drink de'],
  honey:        ['mel composto', 'produto de mel'],
  olive_oil:    ['blend de azeite', 'composto de azeite', 'mistura de azeite'],
  meat_processed: ['hambúrguer de soja', 'almôndega de soja', 'presunto de frango tipo']
};

// ─── DETECÇÃO DE CATEGORIA POR NOME ─────────────────────────────────────────

const CATEGORY_DETECTION: Array<{ category: AuthenticityCategory; keywords: string[] }> = [
  { category: 'chocolate',      keywords: ['chocolate', 'cacau', 'achocolatado', 'trufa', 'bombom', 'cobertura'] },
  { category: 'dairy_cheese',   keywords: ['queijo', 'requeijão', 'cream cheese', 'catupiry', 'mussarela', 'parmesão', 'ricota', 'cottage', 'provolone', 'gorgonzola'] },
  { category: 'dairy_yogurt',   keywords: ['iogurte', 'yogurt', 'kefir', 'bebida fermentada'] },
  { category: 'dairy_milk',     keywords: ['leite', 'leite condensado', 'creme de leite', 'nata', 'composto lácteo'] },
  { category: 'juice',          keywords: ['suco', 'néctar', 'refresco', 'bebida de fruta'] },
  { category: 'honey',          keywords: ['mel'] },
  { category: 'olive_oil',      keywords: ['azeite'] },
  { category: 'meat_processed', keywords: ['presunto', 'mortadela', 'salame', 'salsicha', 'linguiça', 'hambúrguer', 'nugget', 'apresuntado', 'peito de peru', 'blanquet'] }
];

// ─── MENSAGENS CLÍNICAS ──────────────────────────────────────────────────────

const CLINICAL_NOTES: Record<AuthenticityCategory, string> = {
  chocolate:
    'Gorduras vegetais hidrogenadas/interesterificadas no lugar da manteiga de cacau são pró-inflamatórias e interferem na biossíntese de prostaglandinas. Impacto relevante em quadros de inflamação sistêmica, intestino irritável e desequilíbrios hormonais.',
  dairy_milk:
    'Compostos lácteos com amido ou gordura vegetal têm índice glicêmico maior e perfil de gordura pior que o leite integral. Em pacientes com resistência à insulina ou disbiose, esse padrão agrava a permeabilidade intestinal.',
  dairy_cheese:
    'Queijos análogos (com amido + gordura vegetal) não possuem ácido láurico nem probióticos naturais. Em pacientes com deficiência de cálcio ou inflamação articular, este produto não oferece os benefícios esperados de um queijo real.',
  dairy_yogurt:
    'Bebidas iogurtizadas com espessantes e açúcares simples têm perfil glicêmico desfavorável. Ausência de probióticos vivos reduz o benefício para microbiota intestinal. Relevante em protocolos de saúde intestinal e imunidade.',
  juice:
    'Néctares e refrescos com açúcar adicionado produzem pico glicêmico equivalente a refrigerante. Ausência de fibras da fruta inteira amplifica a absorção de frutose livre — risco adicional em pacientes com fígado gorduroso.',
  honey:
    'Mel adulterado com xaropes de glicose/frutose perde atividade antibacteriana, enzimas e polifenóis. Impacto em pacientes que usam mel como suporte imunológico ou terapêutico.',
  olive_oil:
    'Blends de azeite com óleos refinados de soja/canola têm ômega-6 dominante, o que reverte o efeito anti-inflamatório esperado do azeite extra virgem. Crítico para pacientes em protocolo cardiovascular.',
  meat_processed:
    'Embutidos com proteína de soja e nitritos em excesso são associados a estresse oxidativo e carga inflamatória. Em pacientes com hipertensão, doenças autoimunes ou câncer, o consumo regular deve ser reavaliado.'
};

// ─── ENGINE PRINCIPAL ────────────────────────────────────────────────────────

export class AuthenticityGuard {

  /**
   * Detecta a categoria sensível do produto pelo nome.
   */
  public static detectCategory(productName: string): AuthenticityCategory | null {
    const lower = productName.toLowerCase();
    for (const { category, keywords } of CATEGORY_DETECTION) {
      if (keywords.some(k => lower.includes(k))) {
        return category;
      }
    }
    return null;
  }

  /**
   * Avalia a autenticidade de um produto dado o nome e a lista de ingredientes.
   *
   * @param productName   Nome comercial do produto
   * @param ingredients   Texto livre dos ingredientes (como no rótulo)
   * @returns             AuthenticityFlag com diagnóstico completo
   */
  public static evaluate(productName: string, ingredients?: string): AuthenticityFlag {
    const category = this.detectCategory(productName);
    const lowerName = productName.toLowerCase();
    const lowerIngredients = (ingredients || '').toLowerCase();

    if (!category) {
      return {
        level: 'unknown',
        category: null,
        fraudTermsFound: [],
        explanation: 'Produto fora das categorias monitoradas pelo AuthenticityGuard.',
        clinicalNote: '',
        consumerRights: ''
      };
    }

    if (!lowerIngredients || lowerIngredients.trim().length < 5) {
      return {
        level: 'unknown',
        category,
        fraudTermsFound: [],
        explanation: 'Lista de ingredientes não disponível. Verifique a embalagem física do produto.',
        clinicalNote: CLINICAL_NOTES[category],
        consumerRights: 'Exija a lista completa de ingredientes — é um direito do consumidor (CDC Art. 31 e RDC 259/2002).'
      };
    }

    const fraudMarkers = FRAUD_MARKERS[category] || [];
    const foundFraudTerms = fraudMarkers.filter(term => lowerIngredients.includes(term.toLowerCase()));

    const misleadingNamePatterns = MISLEADING_NAME_PATTERNS[category] || [];
    const hasMisleadingName = misleadingNamePatterns.some(p => lowerName.includes(p.toLowerCase()));

    const genuineMarkers = GENUINE_MARKERS[category] || [];
    const hasGenuineMarkers = genuineMarkers.some(m => lowerIngredients.includes(m.toLowerCase()));

    let level: AuthenticityLevel = 'genuine';

    if (hasMisleadingName && foundFraudTerms.length > 0) {
      level = 'misleading';
    } else if (foundFraudTerms.length >= 2 || (foundFraudTerms.length >= 1 && !hasGenuineMarkers)) {
      level = 'misleading';
    } else if (foundFraudTerms.length === 1 && hasGenuineMarkers) {
      level = 'suspect';
    }

    const explanation = this.buildExplanation(level, category, foundFraudTerms, hasMisleadingName);

    return {
      level,
      category,
      fraudTermsFound: foundFraudTerms,
      explanation,
      clinicalNote: level !== 'genuine' ? CLINICAL_NOTES[category] : '',
      consumerRights: level !== 'genuine'
        ? 'Você tem o direito de saber exatamente o que está consumindo (CDC Art. 6º, III e RDC 259/2002). Prefira produtos com lista de ingredientes curta e reconhecível.'
        : ''
    };
  }

  private static buildExplanation(
    level: AuthenticityLevel,
    category: AuthenticityCategory,
    fraudTerms: string[],
    hasMisleadingName: boolean
  ): string {
    const categoryLabel = this.categoryLabel(category);

    if (level === 'genuine') {
      return `✅ ${categoryLabel} com composição compatível com o produto genuíno. Ingredientes principais identificados sem extensores industriais relevantes.`;
    }

    if (level === 'suspect') {
      const terms = fraudTerms.slice(0, 2).map(t => `"${t}"`).join(' e ');
      return `⚠️ ${categoryLabel} com ingrediente suspeito: ${terms}. Pode ser um produto adulterado ou com extensores industriais. Analise o rótulo físico.`;
    }

    const terms = fraudTerms.slice(0, 3).map(t => `"${t}"`).join(', ');
    const nameAlert = hasMisleadingName
      ? ' O próprio nome do produto indica que não é o produto genuíno.'
      : '';
    return `🚫 ${categoryLabel} ADULTERADO ou análogo industrial. Ingredientes encontrados: ${terms}.${nameAlert} Este produto não oferece os benefícios nutricionais do ${categoryLabel.toLowerCase()} de verdade.`;
  }

  private static categoryLabel(category: AuthenticityCategory): string {
    const labels: Record<AuthenticityCategory, string> = {
      chocolate:      'Chocolate',
      dairy_milk:     'Leite / Produto Lácteo',
      dairy_cheese:   'Queijo / Requeijão',
      dairy_yogurt:   'Iogurte / Bebida Fermentada',
      juice:          'Suco / Bebida de Fruta',
      honey:          'Mel',
      olive_oil:      'Azeite de Oliva',
      meat_processed: 'Produto de Carne Processada'
    };
    return labels[category] || category;
  }
}
