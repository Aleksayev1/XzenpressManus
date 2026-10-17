/**
 * FoodTransparencyGuard (anteriormente AuthenticityGuard)
 * ─────────────────────────────────────────────────────────────────────────────
 * Analisador de Transparência e Composição Declarada de Rótulos Alimentares.
 * Opera 100% offline, < 2ms, zero rede.
 *
 * Princípios de Engenharia e Compliance (GPT 6 & XZenPress):
 * 1. Explica a composição declarada e a denominação de venda sem certificar autenticidade,
 *    segurança ou conformidade legal.
 * 2. Utiliza correspondência de termos com limites de palavras Unicode flexíveis.
 * 3. Deduplica marcadores compostos (ex: 'amido modificado' não pontua 'amido' novamente).
 * 4. Respeita alegações de negação no escopo apropriado (ex: 'zero lactose' não cancela alerta de leite).
 * 5. Não acusa fabricantes de crime ou fraude: foca na transparência dos ingredientes
 *    para orientar a decisão consciente do consumidor.
 */

export type AuthenticityCategory =
  | 'dairy_milk'
  | 'dairy_cheese'
  | 'chocolate'
  | 'juice'
  | 'honey'
  | 'olive_oil'
  | 'meat_processed'
  | 'dairy_yogurt';

export type TransparencyStatus =
  | 'standard_composition' // Composição compatível com a denominação clássica declarada
  | 'divergent_category'   // Denominação alternativa (ex: bebida láctea vs leite, néctar vs suco)
  | 'declared_substitutes'  // Presença de ingredientes substitutos ou extensores (amidos, gorduras vegetais)
  | 'not_assessed';         // Dados insuficientes na base para análise conclusiva

// Compatibilidade de tipo com o ecossistema existente
export type AuthenticityLevel = 'genuine' | 'suspect' | 'misleading' | 'unknown';

export interface TransparencyFinding {
  ruleId: string;
  matchedText: string;
  explanation: string;
  sourceField: 'name' | 'ingredients' | 'sales_description';
}

export interface AuthenticityFlag {
  level: AuthenticityLevel;
  status: TransparencyStatus;
  category: AuthenticityCategory | null;
  findings: TransparencyFinding[];
  fraudTermsFound: string[]; // Termos de substituição identificados (para retrocompatibilidade)
  explanation: string;
  clinicalNote: string;
  consumerRights: string;
  regulatoryDisclaimer: string;
}

interface CategorySpec {
  name: string;
  categoryRegex: RegExp[];
  genuineMarkers: string[];
  replacementMarkers: string[];
  divergentNamePatterns: string[];
  explanationTemplates: {
    standard: string;
    divergent: string;
    substitutes: string;
  };
}

const CATEGORY_SPECS: Record<AuthenticityCategory, CategorySpec> = {
  dairy_milk: {
    name: 'Leite',
    categoryRegex: [/(?:^|[^p{L}p{N}])leite(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])compostos+l[aá]cteo(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])bebidas+l[aá]ctea(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['leite integral', 'leite semidesnatado', 'leite desnatado', 'leite pasteurizado', 'leite uht', 'leite fluido', 'leite em pó'],
    replacementMarkers: [
      'soro de leite reconstituído',
      'soro de leite em pó',
      'soro de leite',
      'gordura vegetal hidrogenada',
      'gordura vegetal',
      'óleo vegetal',
      'amido modificado',
      'amido',
      'maltodextrina',
      'xarope de milho'
    ],
    divergentNamePatterns: ['composto lácteo', 'bebida láctea', 'mistura láctea', 'alimento lácteo'],
    explanationTemplates: {
      standard: 'Composição declarada compatível com a denominação padrão de leite integral/desnatado.',
      divergent: 'O rótulo identifica o produto como composto lácteo ou bebida láctea, categoria regulatória diferente de leite.',
      substitutes: 'A lista consultada declara ingredientes substitutos como soro de leite, gordura vegetal ou amido.'
    }
  },

  dairy_cheese: {
    name: 'Queijo / Requeijão',
    categoryRegex: [/(?:^|[^p{L}p{N}])queijo(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])requeij[aã]o(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])an[aá]logos+des+queijo(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['leite', 'coalho', 'cloreto de cálcio', 'sal', 'fermento lático', 'creme de leite', 'massa coalhada'],
    replacementMarkers: [
      'requeijão cremoso com amido',
      'requeijão com amido',
      'análogo de queijo',
      'gordura vegetal hidrogenada',
      'gordura de palmiste',
      'gordura vegetal',
      'óleo de palma',
      'óleo vegetal',
      'amido modificado',
      'amido',
      'fécula de mandioca',
      'proteína de soja'
    ],
    divergentNamePatterns: ['mistura alimentícia sabor queijo', 'preparado sabor queijo', 'produto sabor requeijão', 'análogo', 'especialidade láctea'],
    explanationTemplates: {
      standard: 'Composição declarada compatível com o padrão tradicional de queijo/requeijão.',
      divergent: 'A denominação indica mistura alimentícia ou preparado sabor queijo, e não queijo tradicional puro.',
      substitutes: 'A lista declara amido modificado e/ou gordura vegetal como ingredientes extensores.'
    }
  },

  chocolate: {
    name: 'Chocolate',
    categoryRegex: [/(?:^|[^p{L}p{N}])chocolate(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])coberturas+sabors+chocolate(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])cacau(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['manteiga de cacau', 'massa de cacau', 'cacau em pó', 'liquor de cacau', 'pasta de cacau'],
    replacementMarkers: [
      'cobertura fracionada sabor chocolate',
      'cobertura sabor chocolate',
      'gordura parcialmente hidrogenada',
      'gordura vegetal hidrogenada',
      'gordura vegetal interesterificada',
      'gordura vegetal fracionada',
      'gordura de palmiste',
      'gordura de palma',
      'gordura vegetal'
    ],
    divergentNamePatterns: ['cobertura sabor chocolate', 'cobertura fracionada', 'achocolatado', 'doce sabor chocolate'],
    explanationTemplates: {
      standard: 'Composição declarada compatível com derivados de cacau tradicionais.',
      divergent: 'A denominação disponível é cobertura sabor chocolate, categoria distinta de chocolate.',
      substitutes: 'A composição declara gordura vegetal fracionada/hidrogenada substituindo a manteiga de cacau.'
    }
  },

  juice: {
    name: 'Suco',
    categoryRegex: [/(?:^|[^p{L}p{N}])suco(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])n[eé]ctar(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])refresco(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['suco de', 'polpa de', 'suco integral'],
    replacementMarkers: [
      'açúcar adicionado',
      'sacarose',
      'xarope de glicose',
      'xarope de frutose',
      'edulcorante sucralose',
      'sucralose',
      'acessulfame de potássio',
      'aroma artificial'
    ],
    divergentNamePatterns: ['néctar', 'refresco', 'bebida de fruta', 'drink de fruta'],
    explanationTemplates: {
      standard: 'Identificado como suco integral ou polpa sem adição declarada de açúcares ou edulcorantes.',
      divergent: 'O produto é identificado como néctar ou refresco, que regulatoriamente possuem menor percentual de fruta que suco integral.',
      substitutes: 'A lista declara adição de água, açúcares ou edulcorantes artificiais.'
    }
  },

  honey: {
    name: 'Mel',
    categoryRegex: [/(?:^|[^p{L}p{N}])mel(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])honey(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['mel'],
    replacementMarkers: [
      'xarope de milho com alto teor de frutose',
      'xarope de glicose',
      'xarope de frutose',
      'xarope de milho',
      'açúcar invertido',
      'xarope de açúcar',
      'aroma de mel',
      'aromatizante',
      'extrato de mel'
    ],
    divergentNamePatterns: ['mel composto', 'xarope sabor mel', 'preparado com mel', 'produto sabor mel'],
    explanationTemplates: {
      standard: 'Composição consultada declara mel puro de abelhas como ingrediente.',
      divergent: 'Identificado como mel composto ou xarope com mel, categoria diferente de mel puro.',
      substitutes: 'A composição declara adição de xaropes de glicose/milho ou açúcar invertido.'
    }
  },

  olive_oil: {
    name: 'Azeite de Oliva',
    categoryRegex: [/(?:^|[^p{L}p{N}])azeite(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])[oó]leos+misto(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])[oó]leos+composto(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['azeite de oliva extra virgem', 'azeite de oliva virgem', 'azeite de oliva'],
    replacementMarkers: [
      'óleo de soja',
      'óleo de canola',
      'óleo de girassol',
      'óleo de milho',
      'óleo vegetal',
      'mistura de óleos',
      'óleo misto',
      'azeite de oliva refinado'
    ],
    divergentNamePatterns: ['óleo misto', 'óleo composto', 'tempero de mesa', 'mistura de azeite'],
    explanationTemplates: {
      standard: 'Declaração de azeite de oliva sem menção a outros óleos vegetais na lista.',
      divergent: 'Denominado como óleo misto ou composto, categoria que combina azeite com óleos refinados de sementes.',
      substitutes: 'A lista declara presença de óleo de soja, canola ou girassol misturados ao azeite.'
    }
  },

  meat_processed: {
    name: 'Produto Cárneo',
    categoryRegex: [/(?:^|[^p{L}p{N}])presunto(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])mortadela(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])salsicha(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])lingui[cç]a(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])hamb[uú]rguer(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])apresuntado(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['carne bovina', 'carne suína', 'carne de frango'],
    replacementMarkers: [
      'carne mecanicamente separada de aves',
      'carne mecanicamente separada de frango',
      'carne mecanicamente separada',
      'proteína vegetal texturizada de soja',
      'proteína vegetal texturizada',
      'proteína de soja',
      'amido modificado',
      'amido'
    ],
    divergentNamePatterns: ['apresuntado', 'empanado sabor', 'hambúrguer misto com soja'],
    explanationTemplates: {
      standard: 'Composição declarada compatível com corte cárneo tradicional.',
      divergent: 'Denominação de apresuntado ou empanado misto.',
      substitutes: 'Declara uso de carne mecanicamente separada (CMS), amido ou proteína de soja.'
    }
  },

  dairy_yogurt: {
    name: 'Iogurte',
    categoryRegex: [/(?:^|[^p{L}p{N}])iogurte(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])yogurt(?:[^p{L}p{N}]|$)/ui, /(?:^|[^p{L}p{N}])bebidas+l[aá]cteas+fermentada(?:[^p{L}p{N}]|$)/ui],
    genuineMarkers: ['leite', 'fermento lático', 'streptococcus thermophilus', 'lactobacillus bulgaricus'],
    replacementMarkers: [
      'bebida láctea fermentada',
      'bebida láctea',
      'amido modificado',
      'amido',
      'xarope de glicose',
      'maltodextrina'
    ],
    divergentNamePatterns: ['bebida láctea fermentada', 'bebida láctea'],
    explanationTemplates: {
      standard: 'Composição compatível com iogurte tradicional fermentado.',
      divergent: 'Identificado como bebida láctea fermentada, categoria distinta de iogurte integral.',
      substitutes: 'Presença declarada de amido modificado e xaropes açucarados.'
    }
  }
};

function safeEscape(str: string): string {
  return str.replace(/[-/\^$*+?.()|[]{}]/g, '\$&');
}

export class AuthenticityGuard {

  public static detectCategory(productName: string): AuthenticityCategory | null {
    for (const [catKey, spec] of Object.entries(CATEGORY_SPECS)) {
      if (spec.categoryRegex.some(rx => rx.test(productName))) {
        return catKey as AuthenticityCategory;
      }
    }
    return null;
  }

  public static evaluate(productName: string, ingredients?: string): AuthenticityFlag {
    const category = this.detectCategory(productName);
    const lowerName = productName.toLowerCase();
    const rawIngredients = (ingredients || '').trim();
    const lowerIngredients = rawIngredients.toLowerCase();

    const regulatoryDisclaimer =
      'Informação, não diagnóstico. O XZenPress analisa os dados declarados no rótulo e bases públicas abertas. Confira sempre a embalagem física da unidade antes do consumo.';

    if (!category) {
      return {
        level: 'unknown',
        status: 'not_assessed',
        category: null,
        findings: [],
        fraudTermsFound: [],
        explanation: 'Produto fora das categorias monitoradas para análise de substituição de ingredientes.',
        clinicalNote: '',
        consumerRights: '',
        regulatoryDisclaimer
      };
    }

    const spec = CATEGORY_SPECS[category];
    const minLength = category === 'honey' ? 3 : 5;

    if (!lowerIngredients || lowerIngredients.length < minLength) {
      return {
        level: 'unknown',
        status: 'not_assessed',
        category,
        findings: [],
        fraudTermsFound: [],
        explanation: 'Lista de ingredientes não detalhada na base consultada. Verifique a embalagem física da unidade.',
        clinicalNote: '',
        consumerRights: 'O consumidor tem direito à informação clara sobre ingredientes (CDC Art. 6º, III e RDC 727/2022).',
        regulatoryDisclaimer
      };
    }

    const findings: TransparencyFinding[] = [];
    const foundReplacements: string[] = [];

    // Checagem de denominação divergente no nome
    let hasDivergentName = false;
    for (const pattern of spec.divergentNamePatterns) {
      const rx = new RegExp('(^|[^\p{L}\p{N}])' + safeEscape(pattern) + '([^\p{L}\p{N}]|$)', 'ui');
      if (rx.test(lowerName)) {
        hasDivergentName = true;
        findings.push({
          ruleId: 'DIVERGENT_SALES_NAME',
          matchedText: pattern,
          explanation: spec.explanationTemplates.divergent,
          sourceField: 'name'
        });
        break;
      }
    }

    // Busca de marcadores de substituição com isolamento e deduplicação
    let textToAnalyze = ' ' + lowerIngredients + ' ';

    // Proteção de escopo: cacau alcalinizado não é fraude
    if (category === 'chocolate') {
      textToAnalyze = textToAnalyze.replace(/cacaus+ems+p[oó]s+100%s+alcalinizado/gi, ' [cacau_puro_processado] ');
      textToAnalyze = textToAnalyze.replace(/cacaus+alcalinizado/gi, ' [cacau_puro_processado] ');
    }

    // Proteção de escopo: blend de variedades de azeitona não é mistura com outros óleos vegetais
    if (category === 'olive_oil') {
      textToAnalyze = textToAnalyze.replace(/blends+des+(?:azeitonas|variedades|arbequina|koroneiki|picual|frantoio)/gi, ' [blend_azeitonas_legitimo] ');
      textToAnalyze = textToAnalyze.replace(/blends+(?:arbequina|koroneiki|picual|frantoio)/gi, ' [blend_azeitonas_legitimo] ');
    }

    // Tratamento de negação: 'zero lactose', 'sem adição de açúcares', etc.
    textToAnalyze = textToAnalyze.replace(/(?:zero|sem|isentos+de|livres+de)s+[p{L}p{N}_-]+/gui, ' [negated_claim] ');

    for (const marker of spec.replacementMarkers) {
      const rx = new RegExp('(^|[^\p{L}\p{N}])' + safeEscape(marker) + '([^\p{L}\p{N}]|$)', 'ui');

      if (rx.test(textToAnalyze)) {
        foundReplacements.push(marker);
        findings.push({
          ruleId: 'REPLACEMENT_INGREDIENT_DECLARED',
          matchedText: marker,
          explanation: 'Declaração de ingrediente extensor ou substituto: ' + marker + '.',
          sourceField: 'ingredients'
        });
        // Consome a correspondência para evitar recontagem
        textToAnalyze = textToAnalyze.replace(rx, '$1[matched]$2');
      }
    }

    // Checar presença de marcadores genuínos
    const hasGenuineMarkers = spec.genuineMarkers.some(marker => {
      const rx = new RegExp('(^|[^\p{L}\p{N}])' + safeEscape(marker) + '([^\p{L}\p{N}]|$)', 'ui');
      return rx.test(' ' + lowerIngredients + ' ');
    });

    let status: TransparencyStatus = 'not_assessed';
    let level: AuthenticityLevel = 'unknown';

    if (hasDivergentName) {
      status = 'divergent_category';
      level = 'misleading';
    } else if (foundReplacements.length >= 2 || (foundReplacements.length >= 1 && !hasGenuineMarkers)) {
      status = 'declared_substitutes';
      level = 'misleading';
    } else if (foundReplacements.length === 1 && hasGenuineMarkers) {
      status = 'declared_substitutes';
      level = 'suspect';
    } else if (hasGenuineMarkers && foundReplacements.length === 0) {
      status = 'standard_composition';
      level = 'genuine';
    } else {
      status = 'not_assessed';
      level = 'unknown';
    }

    let explanation = '';
    if (status === 'standard_composition') {
      explanation = '✅ ' + spec.name + ': ' + spec.explanationTemplates.standard;
    } else if (status === 'divergent_category') {
      explanation = 'ℹ️ ' + spec.name + ': ' + spec.explanationTemplates.divergent;
    } else if (status === 'declared_substitutes') {
      const termsList = foundReplacements.slice(0, 3).join(', ');
      explanation = '⚠️ ' + spec.name + ': ' + spec.explanationTemplates.substitutes + ' (' + termsList + ').';
    } else {
      explanation = '🔍 ' + spec.name + ': Ingredientes declarados não são conclusivos para caracterização padrão. Consulte a embalagem física.';
    }

    return {
      level,
      status,
      category,
      findings,
      fraudTermsFound: foundReplacements,
      explanation,
      clinicalNote: status !== 'standard_composition'
        ? 'Diferenças de formulação alteram a proporção de gorduras e a densidade de nutrientes. Acompanhe sua resposta digestiva após o consumo.'
        : '',
      consumerRights: 'O rótulo físico na embalagem é o documento legal soberano sobre a composição da unidade.',
      regulatoryDisclaimer
    };
  }
}

export const FoodTransparencyGuard = AuthenticityGuard;
