export type ZenEventType =
  | 'food'
  | 'checkin'
  | 'sleep'
  | 'movement'
  | 'emotion'
  | 'biometric'
  | 'practice'
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
