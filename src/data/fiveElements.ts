// ============================================================
// XZENPRESS — CINCO MOVIMENTOS (Wu Xing)
// Estrutura de dados completa dos 5 Guardiões Elementais da MTC
// ============================================================

export interface GuardianElement {
  id: 'madeira' | 'fogo' | 'terra' | 'metal' | 'agua';
  name: string;
  organ: string;
  viscera: string;
  element: string;
  color: string;
  colorDim: string;
  colorGlow: string;
  emoji: string;
  season: string;
  peakHour: string;
  naturalFactor: string;
  flavor: string;
  tissue: string;
  sense: string;
  sound: string;
  lifePhase: string;
  emotions: {
    imbalanced: string[];
    balanced: string[];
  };
  physicalSigns: {
    weak: string[];
    strong: string[];
  };
  foods: string[];
  plants: string[];
  points: string[];
  frequency: number; // Hz
  weakMessage: string;
  strongMessage: string;
  onboardingQuestion: string;
  triboName: string;
  triboDescription: string;
  avatarWeak: string;    // emoji descrevendo estado fraco
  avatarStrong: string;  // emoji descrevendo estado forte
}

export const fiveElements: GuardianElement[] = [
  {
    id: 'madeira',
    name: 'Guardião da Madeira',
    organ: 'Fígado',
    viscera: 'Vesícula Biliar',
    element: 'Madeira',
    color: '#22c55e',
    colorDim: '#14532d',
    colorGlow: 'rgba(34, 197, 94, 0.4)',
    emoji: '🌳',
    season: 'Primavera',
    peakHour: '1h–3h',
    naturalFactor: 'Vento',
    flavor: 'Azedo',
    tissue: 'Tendão e ligamentos',
    sense: 'Visão (olhos)',
    sound: 'Grito',
    lifePhase: 'Nascimento',
    emotions: {
      imbalanced: ['raiva', 'frustração', 'ressentimento', 'impaciência', 'julgamento'],
      balanced: ['mansidão', 'criatividade', 'visão', 'planejamento', 'assertividade']
    },
    physicalSigns: {
      weak: [
        'Acorda entre 1h e 3h da manhã',
        'Tensão na nuca e ombros',
        'Olhos cansados ou ressecados',
        'Cãibras e dores em tendões',
        'Irritabilidade matinal'
      ],
      strong: [
        'Sono profundo e ininterrupto',
        'Visão clara e foco mental',
        'Criatividade em alta',
        'Flexibilidade física e emocional'
      ]
    },
    foods: ['limão', 'vinagre de maçã', 'alcachofra', 'rúcula', 'dente-de-leão', 'beterraba', 'folhas verdes'],
    plants: ['Cardo-mariano', 'Dente-de-leão', 'Boldo', 'Alcachofra'],
    points: ['LV3 (Tai Chong)', 'LV14 (Qi Men)', 'GB34 (Yang Ling Quan)'],
    frequency: 528,
    weakMessage: 'Há raiva guardada que precisa ser transformada. O Fígado está pedindo liberação.',
    strongMessage: 'Sua visão e criatividade estão fluindo livremente. O Guardião da Madeira está radiante.',
    onboardingQuestion: 'Você tem sentido raiva, frustração ou dificuldade em perdoar ultimamente?',
    triboName: 'Tribo do Fígado',
    triboDescription: 'Jornada da Mansidão — transformar raiva em criatividade e visão',
    avatarWeak: '😤',
    avatarStrong: '🌱'
  },

  {
    id: 'fogo',
    name: 'Guardião do Fogo',
    organ: 'Coração',
    viscera: 'Intestino Delgado',
    element: 'Fogo',
    color: '#ef4444',
    colorDim: '#7f1d1d',
    colorGlow: 'rgba(239, 68, 68, 0.4)',
    emoji: '🔥',
    season: 'Verão',
    peakHour: '11h–13h',
    naturalFactor: 'Calor',
    flavor: 'Amargo',
    tissue: 'Vasos sanguíneos',
    sense: 'Fala (língua)',
    sound: 'Riso',
    lifePhase: 'Crescimento',
    emotions: {
      imbalanced: ['ansiedade', 'agitação', 'euforia excessiva', 'dificuldade de conexão', 'pânico'],
      balanced: ['alegria', 'amor', 'clareza', 'conexão', 'presença', 'entusiasmo saudável']
    },
    physicalSigns: {
      weak: [
        'Palpitações e coração acelerado',
        'Ansiedade e agitação mental',
        'Insônia com sonhos intensos',
        'Suor excessivo',
        'Língua com ponta vermelha'
      ],
      strong: [
        'Sono tranquilo e reparador',
        'Alegria espontânea',
        'Conexão fácil com pessoas',
        'Clareza na comunicação'
      ]
    },
    foods: ['chocolate amargo', 'café puro', 'frutas vermelhas', 'endívia', 'radicchio', 'sementes de girassol'],
    plants: ['Melissa', 'Espinheira-santa', 'Valeriana', 'Passiflora'],
    points: ['PC6 (Nei Guan)', 'HT7 (Shen Men)', 'HT3 (Shao Hai)'],
    frequency: 639,
    weakMessage: 'O coração precisa de paz e de pertencimento. A ansiedade é um sinal de que a chama está tremendo.',
    strongMessage: 'Seu coração está irradiando amor e alegria. O Guardião do Fogo está em plena chama.',
    onboardingQuestion: 'Você tem sentido ansiedade, agitação ou dificuldade em se conectar com os outros?',
    triboName: 'Tribo do Coração',
    triboDescription: 'Jornada do Perdão — transformar ansiedade em amor e conexão genuína',
    avatarWeak: '😰',
    avatarStrong: '❤️'
  },

  {
    id: 'terra',
    name: 'Guardião da Terra',
    organ: 'Baço e Pâncreas',
    viscera: 'Estômago',
    element: 'Terra',
    color: '#f59e0b',
    colorDim: '#78350f',
    colorGlow: 'rgba(245, 158, 11, 0.4)',
    emoji: '🌎',
    season: 'Canícula (verão tardio)',
    peakHour: '9h–11h',
    naturalFactor: 'Umidade',
    flavor: 'Doce natural',
    tissue: 'Músculo e tecido conjuntivo',
    sense: 'Paladar (boca)',
    sound: 'Canto',
    lifePhase: 'Transformação',
    emotions: {
      imbalanced: ['preocupação excessiva', 'ruminação mental', 'necessidade de aprovação', 'obsessão', 'apego'],
      balanced: ['confiança', 'estabilidade', 'nutrição', 'presença', 'cuidado genuíno']
    },
    physicalSigns: {
      weak: [
        'Digestão lenta ou pesada',
        'Cansaço após refeições',
        'Preocupação crônica e ruminação',
        'Sensação de peso e inchaço',
        'Apetite excessivo por doce'
      ],
      strong: [
        'Digestão leve e eficiente',
        'Mente quieta e confiante',
        'Estabilidade emocional',
        'Energia constante ao longo do dia'
      ]
    },
    foods: ['abóbora', 'batata-doce', 'cenoura', 'inhame', 'maçã', 'gengibre', 'cúrcuma'],
    plants: ['Gengibre', 'Cúrcuma', 'Camomila', 'Erva-doce'],
    points: ['SP6 (San Yin Jiao)', 'SP9 (Yin Ling Quan)', 'ST36 (Zu San Li)'],
    frequency: 174,
    weakMessage: 'A mente está consumindo energia que deveria ir para o corpo. A Terra pede quietude e confiança.',
    strongMessage: 'Você está nutrido, estável e confiante. O Guardião da Terra está firme e acolhedor.',
    onboardingQuestion: 'Você tem sentido preocupação excessiva, ruminação mental ou dificuldade em confiar no processo?',
    triboName: 'Tribo do Baço',
    triboDescription: 'Jornada da Confiança — transformar preocupação em presença e estabilidade',
    avatarWeak: '😟',
    avatarStrong: '🌻'
  },

  {
    id: 'metal',
    name: 'Guardião do Metal',
    organ: 'Pulmão',
    viscera: 'Intestino Grosso',
    element: 'Metal',
    color: '#cbd5e1',
    colorDim: '#334155',
    colorGlow: 'rgba(203, 213, 225, 0.4)',
    emoji: '⚙️',
    season: 'Outono',
    peakHour: '3h–5h',
    naturalFactor: 'Secura',
    flavor: 'Picante',
    tissue: 'Pele e pelos',
    sense: 'Olfato (nariz)',
    sound: 'Choro',
    lifePhase: 'Velhice (recepção e sabedoria)',
    emotions: {
      imbalanced: ['tristeza', 'luto', 'apego', 'dificuldade em soltar', 'rigidez'],
      balanced: ['desapego', 'renovação', 'leveza', 'pureza', 'inspiração']
    },
    physicalSigns: {
      weak: [
        'Acorda entre 3h e 5h da manhã',
        'Tristeza ou melancolia sem motivo claro',
        'Pele ressecada ou com problemas',
        'Constipação ou intestino irregular',
        'Respiração curta ou superficial'
      ],
      strong: [
        'Respiração profunda e livre',
        'Pele saudável e luminosa',
        'Facilidade em deixar ir',
        'Clareza e leveza emocional'
      ]
    },
    foods: ['pera', 'nabo', 'alho', 'cebola', 'gengibre', 'pimenta', 'raiz-forte'],
    plants: ['Guaco', 'Eucalipto', 'Própolis', 'Thyme', 'Orégano'],
    points: ['LU9 (Tai Yuan)', 'LU7 (Lie Que)', 'LI4 (He Gu)'],
    frequency: 741,
    weakMessage: 'Há algo que precisa ser liberado. Soltar não é perder — é renovar.',
    strongMessage: 'Sua respiração está livre e sua mente, leve. O Guardião do Metal está cristalino.',
    onboardingQuestion: 'Você tem sentido tristeza, saudade ou dificuldade em deixar ir algo do passado?',
    triboName: 'Tribo do Pulmão',
    triboDescription: 'Jornada do Desapego — transformar tristeza em renovação e leveza',
    avatarWeak: '😢',
    avatarStrong: '🌬️'
  },

  {
    id: 'agua',
    name: 'Guardião da Água',
    organ: 'Rim',
    viscera: 'Bexiga',
    element: 'Água',
    color: '#3b82f6',
    colorDim: '#1e3a5f',
    colorGlow: 'rgba(59, 130, 246, 0.4)',
    emoji: '💧',
    season: 'Inverno',
    peakHour: '17h–19h',
    naturalFactor: 'Frio',
    flavor: 'Salgado natural',
    tissue: 'Ossos e medula',
    sense: 'Audição (ouvido)',
    sound: 'Gemido',
    lifePhase: 'Estocar (profundidade e morte simbólica)',
    emotions: {
      imbalanced: ['medo', 'insegurança', 'falta de propósito', 'sensação de escassez', 'pavor'],
      balanced: ['coragem', 'fé', 'propósito', 'ancestralidade', 'profundidade', 'sabedoria']
    },
    physicalSigns: {
      weak: [
        'Dor lombar crônica',
        'Medo frequente e sem razão aparente',
        'Frio excessivo nos pés e mãos',
        'Audição reduzida ou zumbido',
        'Energia vital muito baixa'
      ],
      strong: [
        'Lombar forte e sem dor',
        'Coragem e senso de propósito',
        'Energia vital duradoura',
        'Conexão profunda com si mesmo'
      ]
    },
    foods: ['feijão preto', 'alga marinha', 'sementes de gergelim', 'nozes', 'miso', 'frutos do mar'],
    plants: ['Ashwagandha', 'Maca peruana', 'Gotu Kola', 'Rhodiola'],
    points: ['KD1 (Yong Quan)', 'KD3 (Tai Xi)', 'KD7 (Fu Liu)'],
    frequency: 396,
    weakMessage: 'Há um medo antigo que pede para ser encarado com coragem. O Rim guarda a força ancestral.',
    strongMessage: 'Sua coragem e propósito estão firmes. O Guardião da Água está profundo e poderoso.',
    onboardingQuestion: 'Você tem sentido medo, insegurança ou falta de propósito e direção na vida?',
    triboName: 'Tribo do Rim',
    triboDescription: 'Jornada da Coragem — transformar medo em propósito e conexão ancestral',
    avatarWeak: '😨',
    avatarStrong: '🌊'
  }
];

// Mapeamento de emoções existentes no emotionalMapping.ts para guardiões
export const emotionToGuardian: Record<string, GuardianElement['id']> = {
  // Madeira / Fígado
  'anger': 'madeira',
  'frustration': 'madeira',
  'irritability': 'madeira',
  'resentment': 'madeira',
  // Fogo / Coração
  'anxiety': 'fogo',
  'panic': 'fogo',
  'agitation': 'fogo',
  'joy': 'fogo',
  // Terra / Baço
  'worry': 'terra',
  'overthinking': 'terra',
  'obsession': 'terra',
  // Metal / Pulmão
  'sadness': 'metal',
  'grief': 'metal',
  'melancholy': 'metal',
  // Água / Rim
  'fear': 'agua',
  'insecurity': 'agua',
  'fright': 'agua'
};

// Utilitário: calcular XLI básico a partir dos scores dos guardiões e check-ins
export interface GuardianScores {
  madeira: number; // 0-100
  fogo: number;
  terra: number;
  metal: number;
  agua: number;
}

export interface XLIInputs {
  guardianScores: GuardianScores;
  checkinConsistency: number;  // 0-100 (% de check-ins feitos nas últimas 4 semanas)
  avgSleepScore: number;       // 0-100
  avgEnergyScore: number;      // 0-100
}

export function calculateXLI(inputs: XLIInputs): number {
  const avgGuardian = (
    inputs.guardianScores.madeira +
    inputs.guardianScores.fogo +
    inputs.guardianScores.terra +
    inputs.guardianScores.metal +
    inputs.guardianScores.agua
  ) / 5;

  const xli = Math.round(
    avgGuardian * 0.40 +
    inputs.checkinConsistency * 0.30 +
    inputs.avgSleepScore * 0.15 +
    inputs.avgEnergyScore * 0.15
  ) * 10;

  return Math.min(1000, Math.max(0, xli));
}

export function getXLIState(xli: number): {
  label: string;
  description: string;
  avatarEmoji: string;
  colorClass: string;
} {
  if (xli <= 200) return {
    label: 'Esgotamento',
    description: 'Seu corpo e mente estão pedindo cuidado urgente.',
    avatarEmoji: '😴',
    colorClass: 'text-gray-400'
  };
  if (xli <= 400) return {
    label: 'Recuperação',
    description: 'Algo está mudando. Continue praticando.',
    avatarEmoji: '🌱',
    colorClass: 'text-green-400'
  };
  if (xli <= 600) return {
    label: 'Equilíbrio',
    description: 'Você está encontrando seu centro.',
    avatarEmoji: '⚖️',
    colorClass: 'text-blue-400'
  };
  if (xli <= 800) return {
    label: 'Vitalidade',
    description: 'Sua energia está fluindo com força.',
    avatarEmoji: '✨',
    colorClass: 'text-yellow-400'
  };
  return {
    label: 'Maestria',
    description: 'Você está no fluxo. Continue irradiando.',
    avatarEmoji: '🌟',
    colorClass: 'text-purple-400'
  };
}

export function getDominantGuardian(scores: GuardianScores): GuardianElement {
  const entries = Object.entries(scores) as [GuardianElement['id'], number][];
  const weakest = entries.reduce((a, b) => a[1] < b[1] ? a : b);
  return fiveElements.find(e => e.id === weakest[0])!;
}
