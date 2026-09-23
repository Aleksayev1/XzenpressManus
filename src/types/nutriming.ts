export type ZenEventType =
  | 'food'
  | 'checkin'
  | 'sleep'
  | 'movement'
  | 'emotion'
  | 'biometric'
  | 'practice' // Micro: registro de prática isolada
  | 'chapter_review' // Macro: reflexão de encerramento de rascunho
  | 'choice' // Opcional: quando o usuário escolhe reagir diferente
  | 'intervention'
  | 'response'
  | 'pattern';

export interface ZenEventProvenance {
  source: 'user' | 'ai' | 'device' | 'system';
  method: string; // Ex: 'photo', 'voice', 'food-vision', 'temporal-engine'
  confidence: number;
}

export interface ZenEvent {
  id: string;
  userId: string;
  type: ZenEventType;

  timestamp: string; // ISO 8601 string
  timezone: string;

  provenance: ZenEventProvenance;

  // O payload específico varia conforme o 'type'
  data: Record<string, unknown>;

  consentScope?: string[];
  createdAt: string;
}

export interface FoodEventData {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

  foods: Array<{
    name: string;
    quantity?: number;
    unit?: string;

    estimated: boolean;
    confidence: number;
    userConfirmed: boolean; // Essencial para diferenciar inferência de confirmação humana

    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };

    classification?: {
      novaGroup?: 1 | 2 | 3 | 4;
      plant: boolean;
      fermented?: boolean;
    };

    mtc?: {
      nature?: string[]; // Quente, Frio, Neutro, Úmido
      flavors?: string[]; // Doce, Salgado, Azedo, Amargo, Picante
    };
  }>;

  context?: {
    alone?: boolean;
    rushed?: boolean;
    screen?: boolean;
    social?: boolean;
  };

  estimatedPortion: boolean;
}

export interface PatternEventData {
  patternId: string;
  observations: string[]; // Referências aos IDs de ZenEvents
  frequency: number;
  recurrenceRate: number;

  temporalWindow: {
    beforeMinutes?: number;
    afterMinutes?: number;
  };

  confidence: number;
  dataQuality: number; // Qualidade do conjunto de dados que sustenta o insight
  confounders: string[]; // Ex: ['sleep_variation', 'stress_variation']

  // Regra de Ouro do XZenPress: Nunca afirmar causalidade.
  causalClaim: false;

  status: 'insufficient-data' | 'emerging' | 'recurrent' | 'stable';
}

export interface ExplorationOption {
  id: string;
  type: 'breathing' | 'audio' | 'movement' | 'acupressure' | 'education';
  title: string;
  durationMinutes: number;
  source: 'xzenpress-library' | 'traditional-reference';
  safetyClass: 'low-risk-wellness';
  requiresProfessionalReview: boolean;
  enabled: boolean;
}

export interface InterventionEventData {
  triggeringPatternId?: string;
  explorationOptionId: string;
  
  userAction: 'experiment_now' | 'continue_observing' | 'learn_more';
  
  baselinePre?: number; // 1 a 5
  baselinePost?: number; // 1 a 5
  
  postInterventionFeedback?: 'Melhor' | 'Sem mudança' | 'Diferente' | 'Pior' | 'Não tenho certeza';
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧬 SPRINT 1 — NUTRIMING FOOD FOUNDATION & FOOD STATE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export type DataOrigin =
  | 'barcode_verified'
  | 'photo_estimated'
  | 'user_declared'
  | 'unknown';

export type EvidenceGrade =
  | 'deterministic'
  | 'strong'
  | 'moderate'
  | 'weak'
  | 'traditional'
  | 'unknown';

export type ThermalNature = 'cold' | 'cool' | 'neutral' | 'warm' | 'hot';

export type Flavor = 'sour' | 'bitter' | 'sweet' | 'pungent' | 'salty';

export interface AllergenNotice {
  detected: string[];
  traces: string[];
  source: DataOrigin;
  verifiedAgainstLabel: boolean;
  safetyDisclaimer: string;
}

export interface FoodProduct {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  imageUrl?: string;

  source: {
    provider: 'open_food_facts' | 'manual' | 'catalog';
    externalId?: string;
    fetchedAt: string;
    completeness: number; // 0 a 1
    origin: DataOrigin;
  };

  labelFacts: {
    ingredientsText?: string;
    allergens: string[];
    traces?: string[];
    novaGroup?: 1 | 2 | 3 | 4;
    nutritionPer100g?: {
      energyKcal?: number;
      carbs?: number;
      sugars?: number;
      fat?: number;
      saturatedFat?: number;
      protein?: number;
      fiber?: number;
      sodium?: number;
    };
    additives?: {
      code?: string;
      name: string;
    }[];
  };

  warnings: {
    type: 'allergen' | 'restriction' | 'missing_data' | 'high_sodium' | 'high_sugar' | 'ultraprocessed';
    severity: 'info' | 'caution' | 'critical';
    message: string;
  }[];
}

export interface FoodMTCProfile {
  foodProductId: string;
  foodName: string;

  lens: 'traditional_chinese_medicine';
  evidenceGrade: 'traditional';

  thermalNature: ThermalNature;
  flavors: Flavor[];
  organAffinity?: ('spleen' | 'stomach' | 'liver' | 'heart' | 'lung' | 'kidney')[];

  qiDynamics: string[]; // Ex: ["Aquece o centro", "Move o Qi", "Ascende ao Fogo"]
  traditionalNotes: string[];
  cautions?: string[];

  source: {
    provider: 'xzenpress_mtc_knowledge_base';
    version: string;
  };
}

export type Dosha = 'vata' | 'pitta' | 'kapha';
export type Guna = 'sattvic' | 'rajasic' | 'tamasic';

export interface AyurvedicProfile {
  doshaImpact: {
    vata: 'pacifies' | 'neutral' | 'aggravates';
    pitta: 'pacifies' | 'neutral' | 'aggravates';
    kapha: 'pacifies' | 'neutral' | 'aggravates';
  };
  guna: Guna;
  agniEffect: 'kindles' | 'depletes' | 'smothers' | 'balances';
  rasas?: string[];
  traditionalNotes?: string[];
}

export interface FoodProfile {
  id: string;
  name: string;
  western?: {
    nova?: 1 | 2 | 3 | 4;
    allergens?: string[];
    additives?: string[];
    caffeineMg?: number;
    sugarG?: number;
    sodiumMg?: number;
    fiber?: number;
    protein?: number;
  };
  tcm: {
    thermalNature: ThermalNature;
    flavors: Flavor[];
    qiDynamics: string[];
    cautions?: string[];
    organAffinity?: string[];
  };
  ayurveda?: AyurvedicProfile;
}

export interface UserStateVector {
  heat: number;          // 0 a 5: calor, irritação, inflamação, boca seca, insônia
  cold: number;          // 0 a 5: frio, lentidão, fezes pastosas, extremidades frias
  qiDeficiency: number;  // 0 a 5: fadiga, voz fraca, digestão pesada
  yinDeficiency: number; // 0 a 5: agitação noturna, suor noturno, calor nos 5 centros
  dampness: number;      // 0 a 5: estufamento, edema, sensação de peso no corpo
  stagnation: number;    // 0 a 5: suspiros, dor em aperto, tensão muscular
  tension: number;       // 0 a 5: estresse percebido
  sleepDebt: number;     // 0 a 5: noites mal dormidas
}

export interface MealContext {
  moment: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  form: 'raw' | 'salad' | 'soup' | 'stew' | 'fried' | 'baked' | 'drink' | 'snack';
  servingTemperature: 'cold' | 'room' | 'warm' | 'hot' | 'iced';
  modifiers?: Array<'spicy' | 'ginger' | 'alcohol' | 'coffee' | 'heavy' | 'light'>;
}

export interface TreatmentContext {
  activeTreatments?: string[]; // Ex: ["Insônia / Fogo no Fígado", "Deficiência de Baço"]
  activeAcupoints?: string[];   // Ex: ["F3", "PC6", "E36"]
  avoidFlags?: string[];        // Ex: ["evitar_estimulantes", "evitar_frio"]
  sensitivities?: string[];     // Ex: ["lactose", "gluten"]
}

export interface FoodStateInput {
  food: FoodProfile;
  meal: MealContext;
  userState: UserStateVector;
  treatment?: TreatmentContext;
  longitudinal?: {
    recentPatterns?: string[];
    knownReactions?: string[];
  };
}

export interface FoodStateResult {
  western: {
    severity: 'ok' | 'attention' | 'high_attention';
    bullets: string[];
  };
  tcm: {
    direction: 'balances' | 'neutral' | 'intensifies';
    thermalMatch: string;
    flavorActions: {
      flavor: Flavor;
      actionVerb: string;
      meaning: string;
    }[];
    cautions: string[];
  };
  ayurveda?: {
    guna: Guna;
    gunaMeaning: string;
    doshaSummary: string;
    agniSummary: string;
  };
  treatmentAlignment?: {
    status: 'aligned' | 'neutral' | 'conflict';
    badgeText: string;
    message: string;
    recommendedPoints?: string[]; // Pontos sugeridos para reequilibrar
  };
  personal: {
    compass: 'green' | 'yellow' | 'red';
    headline: string;
    explanation: string;
    actions: Array<'consume' | 'balance' | 'understand'>;
    balancingSuggestions?: string[];
  };
}

export interface ContextSnapshot {
  id: string;
  userId: string;
  capturedAt: string;

  moment: {
    localTime: string;
    mealWindow?: 'morning' | 'midday' | 'afternoon' | 'night' | 'late_night';
    timezone: string;
  };

  userState: {
    mood?: 'calm' | 'tense' | 'sad' | 'irritated' | 'anxious' | 'neutral';
    energy?: 1 | 2 | 3 | 4 | 5;
    hunger?: 1 | 2 | 3 | 4 | 5;
    digestion?: 'light' | 'bloated' | 'heavy' | 'nauseous' | 'unknown';
    stress?: 1 | 2 | 3 | 4 | 5;
  };

  derivedFrom: {
    zenCheckinId?: string;
    sleepSummaryId?: string;
    manualInput?: boolean;
  };

  confidence: 'high' | 'medium' | 'low';
}

export interface MicroObservation {
  id: string;
  userId: string;
  mealEventId: string;
  capturedAt: string;
  offsetMinutesAfterMeal: number;

  check: {
    belly?: 'light' | 'normal' | 'bloated' | 'heavy' | 'pain';
    energy?: 'up' | 'stable' | 'down';
    mood?: 'better' | 'same' | 'worse';
    craving?: boolean;
  };

  note?: string;
}

export interface MealEvent {
  id: string;
  userId: string;
  createdAt: string;

  product: {
    foodProductId?: string;
    name: string;
    portionText?: string;
    confidence: 'known' | 'estimated' | 'unknown';
  };

  mealContext: MealContext;
  stateResult: FoodStateResult;
  contextSnapshotId?: string;

  followUp: {
    scheduledFor?: string;
    completedObservationId?: string;
  };
}
