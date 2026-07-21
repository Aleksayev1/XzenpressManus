// ZenSense Cognitive Engine (Mock & Types)
// O cérebro matemático do XZenPress. Desacoplado do LLM.

export type MentorMode = 'regulator' | 'mentor' | 'reflector' | 'explorer';

/**
 * 1. Sinais extraídos brutos pelo LLM (Input)
 */
export interface LinguisticSignals {
  fragmentation: 'alta' | 'media' | 'baixa';
  ego_focus: 'alta' | 'media' | 'baixa';
  causal_reasoning: 'alta' | 'media' | 'baixa' | 'ausente';
  emotional_intensity: 'alta' | 'media' | 'baixa';
}

/**
 * 2. Mistura de comportamento definida pelo LLM
 */
export type MentorStateBlend = Record<MentorMode, number>;

/**
 * 3. O Estado Humano Computado (Output final do ZenSense)
 * O Fenótipo Digital construído a partir de múltiplas sessões.
 */
export interface HumanState {
  adaptation: {
    capacity: number;      // Quanto consegue sair de um estado ruim para equilíbrio
    velocity: number;      // Rapidez da recuperação
    resilience: number;    // Resistência a novos gatilhos
    stability: number;     // Consistência do estado
    variability: number;   // Flexibilidade do sistema nervoso
  };
  awareness: {
    body: number;          // Percepção física
    emotion: number;       // Alfabetização emocional
    behavior: number;      // Consciência de ações/vícios
    pattern: number;       // Consciência de ciclos repetitivos
    meaning: number;       // Construção de sentido/propósito
    interoception: number; // NOVO: Percepção de sinais internos viscerais
  };
  curiosity_index: number; // Curiosos aprendem e aderem mais
  dynamic_baseline: {
    deviation_from_normal: number; // -1.0 a 1.0 (Desvio do normal do PRÓPRIO usuário)
    historical_norm: number;
  };
  recovery_signature: {
    best_modality: 'respiração' | 'som' | 'acupressão' | 'zenflow' | 'natureza';
    confidence: number;
  };
  trajectory: {
    trend: 'improving' | 'stable' | 'declining';
    velocity: number;      // Velocidade da mudança de estado
    confidence: number;    // Grau de certeza da trajetória (Fusão Multimodal)
  };
  adaptation_forecast: {
    projection: string; // Ex: "Alta probabilidade de melhora no sono se mantiver rotina"
    risk_warning?: string;
  };
  sense_making_index: number; // SMI (0 a 100): Marcador longitudinal de reorganização cognitiva
  timestamp: string;
}

/**
 * Camada Anticorrupção (Anti-Corruption Layer)
 * Impede que alucinações de LLM quebrem o schema matemático do sistema.
 */
export class ZenValidator {
  
  /**
   * Garante que os sinais linguísticos estejam dentro das strings restritas
   */
  static validateLinguisticSignals(raw: any): LinguisticSignals {
    const validLevels = ['alta', 'media', 'baixa', 'ausente'];
    
    return {
      fragmentation: validLevels.includes(raw?.fragmentation) ? raw.fragmentation : 'media',
      ego_focus: validLevels.includes(raw?.ego_focus) ? raw.ego_focus : 'media',
      causal_reasoning: validLevels.includes(raw?.causal_reasoning) ? raw.causal_reasoning : 'ausente',
      emotional_intensity: validLevels.includes(raw?.emotional_intensity) ? raw.emotional_intensity : 'media'
    };
  }

  /**
   * Garante que a mistura do mentor não tenha falhas matemáticas (valores nulos, ou que não somam ~1.0)
   */
  static validateMentorBlend(raw: any): MentorStateBlend {
    const clamp = (val: any) => {
      const num = parseFloat(val);
      if (isNaN(num)) return 0;
      return Math.min(Math.max(num, 0), 1);
    };

    const blend: MentorStateBlend = {
      regulator: clamp(raw?.regulator),
      mentor: clamp(raw?.mentor),
      reflector: clamp(raw?.reflector),
      explorer: clamp(raw?.explorer)
    };

    // Normaliza para garantir que a soma seja exatamente 1.0, caso o LLM erre a matemática.
    const total = blend.regulator + blend.mentor + blend.reflector + blend.explorer;
    if (total > 0 && total !== 1.0) {
      blend.regulator /= total;
      blend.mentor /= total;
      blend.reflector /= total;
      blend.explorer /= total;
    } else if (total === 0) {
      // Fallback seguro se o LLM enviar tudo zerado
      blend.regulator = 0.5;
      blend.reflector = 0.5;
    }

    return blend;
  }
}

/**
 * Motor ZenSense - Fase de Observação (Mock)
 */
export class ZenSenseEngine {
  
  /**
   * Calcula o Human State final cruzando os sinais validados do LLM com a base histórica.
   */
  static computeHumanState(rawSignals: any, history: HumanState[]): HumanState {
    // 1. Camada de Validação
    const signals = ZenValidator.validateLinguisticSignals(rawSignals);

    // 2. Cálculo Matemático (Mock para Fase 1)
    // Na Fase 2, esta função será o núcleo da Fenotipagem Computacional.
    return {
      adaptation: { capacity: 0.5, velocity: 0.4, resilience: 0.6, stability: 0.5, variability: 0.5 },
      awareness: { body: 0.4, emotion: 0.5, behavior: 0.3, pattern: 0.2, meaning: 0.4, interoception: 0.3 },
      curiosity_index: 0.6,
      dynamic_baseline: { deviation_from_normal: 0.1, historical_norm: 0.5 },
      recovery_signature: { best_modality: 'respiração', confidence: 0.8 },
      trajectory: { trend: 'stable', velocity: 0, confidence: 0.5 },
      adaptation_forecast: { projection: "Estável, manter a rotina." },
      sense_making_index: 50, // Baseline inicial neutro (0-100)
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Armazena os dados validados localmente para amostragem empírica (Sprint 1)
   */
  static logTelemetry(rawSignals: any, rawMentorState: any): void {
    try {
      const signals = ZenValidator.validateLinguisticSignals(rawSignals);
      const mentorState = ZenValidator.validateMentorBlend(rawMentorState);

      const key = 'xzen_computational_phenotype_logs';
      const historyRaw = localStorage.getItem(key);
      let history: any[] = historyRaw ? JSON.parse(historyRaw) : [];
      
      history.push({
        signals,
        mentorState,
        timestamp: new Date().toISOString()
      });
      
      if (history.length > 100) history.shift();
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to log telemetry locally", e);
    }
  }
}
