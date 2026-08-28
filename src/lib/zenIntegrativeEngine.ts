/**
 * XZENPRESS — FUNDAÇÃO TÉCNICA v1.4 (CANONICAL GATE COMPLETO: INTEGRITY & SECURITY)
 * Documento de fechamento do brainstorm — Decisões congeladas para execução 🔒
 * 
 * "O evento original é fato registrado; o estado é uma representação calculada; 
 * a correlação é uma associação; a hipótese é uma inferência. 
 * Nenhuma dessas camadas, isoladamente, constitui diagnóstico."
 */

// ============================================================================
// 1. 🔒 UTILITÁRIO DE IMUTABILIDADE REAL (RECURSIVE DEEP FREEZE)
// ============================================================================

export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as Record<string, any>)[prop];
    if (value !== null && (typeof value === 'object' || typeof value === 'function') && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return obj;
}

// ============================================================================
// 2. 🔒 SELOS DE EVIDÊNCIA (6 CATEGORIAS DEFINITIVAS)
// ============================================================================

export type EvidenceLabel = 
  | 'established'            // 🟢 Evidência Estabelecida: Literatura biomédica sólida e replicada
  | 'emerging'               // 🟡 Evidência Emergente: Literatura ativa, metodologia heterogênea
  | 'population_pattern'     // ⚪ Padrão Populacional: Sem histórico individual ainda (resolve cold start)
  | 'observational_n_of_1'   // 🟠 Associação Observacional (N-of-1): Histórico do próprio usuário
  | 'integrative_hypothesis' // 🔵 Hipótese Integrativa: Lente MTC / tradicional, sem validação biomédica direta
  | 'red_flag';              // 🔴 Sinal de Alerta: Não interpreta — encaminha para avaliação profissional

export const EVIDENCE_BADGES: Record<EvidenceLabel, { icon: string; label: string; description: string }> = {
  established: {
    icon: '🟢',
    label: 'Evidência Estabelecida',
    description: 'Literatura biomédica sólida e replicada.'
  },
  emerging: {
    icon: '🟡',
    label: 'Evidência Emergente',
    description: 'Literatura científica ativa, com achados promissores em evolução.'
  },
  population_pattern: {
    icon: '⚪',
    label: 'Padrão Populacional',
    description: 'Padrão observado em perfis semelhantes — ainda sem confirmação no seu histórico pessoal.'
  },
  observational_n_of_1: {
    icon: '🟠',
    label: 'Associação Pessoal (N-of-1)',
    description: 'Padrão observado no seu próprio histórico temporal com base em repetições consistentes.'
  },
  integrative_hypothesis: {
    icon: '🔵',
    label: 'Hipótese Integrativa',
    description: 'Correlação baseada em modelos da Medicina Tradicional Chinesa e práticas integrativas.'
  },
  red_flag: {
    icon: '🔴',
    label: 'Sinal de Atenção',
    description: 'Não interpreta — orienta avaliação médica presencial.'
  }
};

// ============================================================================
// 3. 🔒 CAMADA RAW: O SCHEMA CANÔNICO HARDENED (ZenIntegrativeEvent)
// ============================================================================

export type StoolAppearanceColor = 
  | 'brown' 
  | 'pale' 
  | 'dark_brown' 
  | 'yellowish' 
  | 'black_tarry_reported'       // Descrição relatada pelo usuário (aspecto de piche) -> Gatilho Red Flag
  | 'visible_bright_red_blood';  // Sangue vivo relatado -> Gatilho Red Flag

export type PostPrandialSymptomType = 
  | 'plenitude' 
  | 'estufamento' 
  | 'gases' 
  | 'refluxo' 
  | 'nausea' 
  | 'dor_abdominal' 
  | 'sonolencia' 
  | 'queda_energia';

export interface ZenIntegrativeEvent {
  id: string;
  userId: string;          // Pseudonimizado / Account ID mapeado
  timestamp: string;       // ISO8601
  schemaVersion: string;   // ex: "1.4.0" — obrigatório desde o 1º evento

  // De onde veio esse dado, exatamente (Data Provenance)
  provenance: {
    source: 'user_self_report' | 'wearable' | 'ai_image_analysis' | 'lab_result' | 'system_derived';
    method?: string;        // 'visual_selector', 'photo_analysis', 'nocturnal_measurement'
    device?: string;
    modelVersion?: string;  // Se envolveu IA (ex: análise de imagem)
    confidence: 'user_reported' | 'device_measured' | 'lab_verified' | 'ai_inferred';
  };

  // Consentimento — 3 níveis, granular, versionado e auditável (LGPD/GDPR)
  consent: {
    personalUse: true;              // Sempre true, obrigatório p/ usar o app
    populationPooling: boolean;     // Opt-in explícito, separado
    researchUse: boolean;           // Opt-in explícito, separado
    consentVersion: string;
    grantedAt?: string;
    revokedAt?: string;
  };

  // Qualidade do contexto de captura & Metadados de confiabilidade
  reportingContext?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    hoursAfterEvent?: number;
    reportedUnderStress?: boolean;
    captureQuality?: {              // Para fotos (língua, fezes)
      lighting?: 'natural' | 'artificial' | 'poor';
      angle?: string;
      device?: string;
    };
  };

  dataQuality?: {
    completeness: number;           // 0 a 1
    consistency: number;            // 0 a 1
    reliability: 'low' | 'moderate' | 'high';
  };

  // 1. EXPOSIÇÕES (Inputs ambientais / alimentares / emocionais)
  exposures?: {
    food?: { items: string[]; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; notes?: string };
    stressLevel?: number;           // 1-10
    perceivedEmotion?: string;      // Lente MTC/metafísica, sempre rotulada como tal
    medicationsOrSupplements?: string[];
  };

  // 2. OBSERVAÇÕES FENOTÍPICAS BRUTAS
  phenotype?: {
    tongue?: {
      bodyColor?: 'pale' | 'pink' | 'red' | 'purple';
      coatingColor?: 'white' | 'yellow' | 'none';
      coatingThickness?: 'thin' | 'thick' | 'greasy';
      teethMarks?: boolean;
      redPinchTip?: boolean;
      photoHash?: string;           // Destruição auditável da imagem original
      mtcInterpretation?: {         // Camada MTC explicitamente separada da observação física
        traditionalPattern?: string;
        elementalAffiliation?: 'Madeira' | 'Fogo' | 'Terra' | 'Metal' | 'Água';
      };
    };
    stool?: {
      bristolScale?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      frequencyToday?: number;                 // Quantas evacuações no dia
      daysSincePreviousBowelMovement?: number; // Intervalo em dias
      urgency?: boolean;
      painOrEffort?: boolean;
      incompleteEvacuation?: boolean;
      color?: StoolAppearanceColor;
      hasBloodVisible?: boolean;               // Gatilho imediato de Red Flag
    };
    autonomic?: { vfcMs?: number; heartRateBpm?: number; breathRateRpm?: number };
    sleep?: { durationHours?: number; qualityScore?: number; nightWakings?: number };
    skinImmune?: { itchingOrRash?: boolean; nasalCongestion?: boolean; targetArea?: string };
  };

  // 3. RESPOSTA PÓS-PRANDIAL IMEDIATA (Tempo Contínuo + Bucket UX)
  postPrandialResponse?: {
    linkedMealId: string;                      // Deve apontar para o id real de um evento de refeição do mesmo usuário
    timeAfterMeal: '30min' | '2h' | '6h';      // Bucket para UX / Categorização
    minutesAfterMeal: number;                  // Tempo contínuo calculado/validado pelo motor
    overallComfort: 'muito_bem' | 'bem' | 'neutro' | 'nao_caiu_bem' | 'muito_desconfortavel';
    comfortScore?: 0 | 1 | 2 | 3 | 4;          // 0=muito desconfortável, 4=muito bem
    symptoms?: {
      type: PostPrandialSymptomType;
      severity: 0 | 1 | 2 | 3 | 4;             // 0=ausente, 4=severo
    }[];
    freeText?: string;
  };

  // 4. INTERVENÇÕES INTEGRATIVAS COM DOSE
  intervention?: {
    type: 'acupressure' | 'zensom' | 'breathwork' | 'zenflow';
    protocolId: string;
    dose: { durationSeconds: number; pointsStimulated?: string[]; frequencyHz?: number };
  };

  // 5. RESPOSTA AVALIADA (Dose-Response Outcome)
  response?: {
    measuredAt: string;
    latencyHorizon: 'immediate_10m' | 'short_2_6h' | 'circadian_24h' | 'delayed_48_72h';
    deltaStress?: number;
    deltaVfc?: number;
    subjectiveReliefScore?: number;
  };
}

// ============================================================================
// 4. 🔒 CAMADA DERIVED: BASELINES, DESVIOS E LATÊNCIAS
// ============================================================================

export interface DerivedBaseline {
  userId: string;
  windowDays: number;
  computedAt: string;
  algorithmVersion: string; // Reprodutibilidade
  metrics: Record<string, { mean: number; sd: number; n: number }>;
}

export interface StateDeviationAnalysis {
  metric: string;
  currentValue: number;
  baselineMean: number;
  baselineSd: number;
  zScore: number;
  status: 'normal_range' | 'mild_deviation' | 'significant_deviation';
  description: string;
}

export interface LatencyWindowQuery {
  referenceEvent: ZenIntegrativeEvent;
  windowHours: number;
  subsequentEvents: ZenIntegrativeEvent[];
  postPrandialResponses: ZenIntegrativeEvent[];
  stoolsRecorded: ZenIntegrativeEvent[];
  interventionsApplied: ZenIntegrativeEvent[];
}

// ============================================================================
// 5. 🔒 CAMADA INFERENCE: HIPÓTESES E OUTPUTS PROTEGIDOS (HypothesisOutput)
// ============================================================================

export interface HypothesisOutput {
  id: string;
  userId: string;
  generatedAt: string;
  modelVersion: string;
  evidenceLabel: EvidenceLabel;
  evidenceStrength: 'low' | 'moderate' | 'high'; // Nomenclatura precisa
  narrative: string;                             // Já validada pelo Safety Layer
  supportingEventIds: string[];                  // Rastreabilidade até o RAW
}

// ============================================================================
// 6. 🔒 EVIDENCE & SAFETY LAYER (P0) — HARDENED & AUDITADA CLINICAMENTE
// ============================================================================

export interface RedFlagAlert {
  id: string;
  timestamp: string;
  severity: 'high' | 'critical';
  triggerReason: string;
  evidenceLabel: 'red_flag';
  guidanceMessage: string;
}

export class ZenSafetyLayer {
  /**
   * Validador estruturado de alegações proibidas (Prohibited Claim Policy)
   */
  public static validateSafetyPolicy(claimText: string): { isValid: boolean; violationReason?: string } {
    const prohibitedPatterns = [
      { regex: /você tem disbiose/i, reason: 'Tentativa de emitir diagnóstico médico direto de disbiose.' },
      { regex: /este alimento causou sua inflamação/i, reason: 'Afirmação causal determinística sem prova de mecanismo.' },
      { regex: /a acupressão curou/i, reason: 'Alegação de cura por terapia integrativa.' },
      { regex: /diagnóstico de alergia/i, reason: 'Diagnóstico alergênico sem confirmação imuno-laboratorial.' }
    ];

    for (const pattern of prohibitedPatterns) {
      if (pattern.regex.test(claimText)) {
        return { isValid: false, violationReason: pattern.reason };
      }
    }
    return { isValid: true };
  }

  /**
   * Filtro de linguagem / última barreira para textos direcionados ao usuário
   */
  public static sanitizeNarrative(rawText: string): string {
    return rawText
      .replace(/você tem disbiose/gi, 'observamos alterações no padrão intestinal')
      .replace(/este alimento causou sua inflamação/gi, 'foi observada associação temporal recorrente entre esta exposição e determinados sintomas')
      .replace(/a acupressão curou/gi, 'nas últimas sessões comparáveis, houve melhora após a intervenção')
      .replace(/o que realmente cura você\?/gi, 'quais intervenções apresentaram maior associação com melhora em contextos semelhantes ao seu?');
  }

  /**
   * Critérios clínicos auditados de Red Flag (com separação estrita de dias civis)
   */
  public static checkRedFlags(events: ZenIntegrativeEvent[]): RedFlagAlert[] {
    const alerts: RedFlagAlert[] = [];

    // 1. Sangue vivo ou aspecto em piche relatado (black_tarry_reported)
    const criticalStoolEvents = events.filter(e => 
      e.phenotype?.stool?.hasBloodVisible === true ||
      e.phenotype?.stool?.color === 'visible_bright_red_blood' ||
      e.phenotype?.stool?.color === 'black_tarry_reported'
    );

    criticalStoolEvents.forEach(criticalStoolEvent => {
      alerts.push({
        id: `rf_stool_critical_${criticalStoolEvent.id}`,
        timestamp: criticalStoolEvent.timestamp,
        severity: 'critical',
        triggerReason: 'Presença de sangue visível ou fezes com aspecto escuro semelhante a piche relatada.',
        evidenceLabel: 'red_flag',
        guidanceMessage: 'Este sintoma requer avaliação médica presencial para investigação adequada.'
      });
    });

    // 2. Constipação por DIAS CIVIS CONSECUTIVOS (>= 7 dias civis reais, não apenas 7 registros)
    const stoolEventsWithDate = events
      .filter(e => e.phenotype?.stool?.bristolScale !== undefined)
      .map(e => ({
        dateStr: e.timestamp.substring(0, 10), // YYYY-MM-DD
        bristol: e.phenotype!.stool!.bristolScale!
      }))
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    // Agrupa por dia civil
    const daysMap = new Map<string, number[]>();
    stoolEventsWithDate.forEach(item => {
      if (!daysMap.has(item.dateStr)) daysMap.set(item.dateStr, []);
      daysMap.get(item.dateStr)!.push(item.bristol);
    });

    const uniqueDays = Array.from(daysMap.keys()).sort();
    let consecutiveHardDays = 0;
    let maxConsecutiveHardDays = 0;
    let previousDate: Date | null = null;

    for (const dayStr of uniqueDays) {
      const bristolList = daysMap.get(dayStr)!;
      const isHardDay = bristolList.every(b => b <= 2);
      const currentDate = new Date(`${dayStr}T00:00:00Z`);

      if (isHardDay) {
        if (!previousDate) {
          consecutiveHardDays = 1;
        } else {
          const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
          if (diffDays === 1) {
            consecutiveHardDays += 1;
          } else {
            consecutiveHardDays = 1;
          }
        }
        previousDate = currentDate;
      } else {
        consecutiveHardDays = 0;
        previousDate = currentDate;
      }

      if (consecutiveHardDays > maxConsecutiveHardDays) {
        maxConsecutiveHardDays = consecutiveHardDays;
      }
    }

    if (maxConsecutiveHardDays >= 7) {
      alerts.push({
        id: `rf_hard_stools_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'high',
        triggerReason: `Padrão persistente de fezes endurecidas (Bristol 1-2) identificado por ${maxConsecutiveHardDays} dias civis consecutivos.`,
        evidenceLabel: 'red_flag',
        guidanceMessage: 'Padrão prolongado de evacuação endurecida por mais de 7 dias. Se houver desconforto contínuo, considere orientação médica ou nutricional presencial.'
      });
    }

    return alerts;
  }
}

// ============================================================================
// 7. MOTOR CORE: IMPLEMENTAÇÃO (ZenIntegrativeEngine)
// ============================================================================

const STORAGE_KEY_EVENTS = 'xzen_integrative_events_v1';
const CURRENT_SCHEMA_VERSION = '1.4.0';
const CURRENT_ALGORITHM_VERSION = 'zen_stat_v1.4';

export class ZenIntegrativeEngine {
  private static eventsCache: ZenIntegrativeEvent[] = [];

  public static init(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (stored) {
        const rawEvents = JSON.parse(stored);
        this.eventsCache = rawEvents.map((e: ZenIntegrativeEvent) => deepFreeze(e));
      }
    } catch (e) {
      console.warn('[ZenIntegrativeEngine] Erro ao carregar eventos:', e);
      this.eventsCache = [];
    }
  }

  /**
   * Append-only RAW event registration com proteção estrita de ID único (1 ID = 1 evento RAW)
   */
  public static async appendEvent(eventData: Omit<ZenIntegrativeEvent, 'id' | 'schemaVersion'> & {
    id?: string;
    schemaVersion?: string;
  }): Promise<ZenIntegrativeEvent> {
    const targetId = eventData.id || `zen_evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Regra estrita: 1 ID = 1 Evento RAW. Duplicidade sempre rejeitada.
    if (this.eventsCache.some(e => e.id === targetId)) {
      throw new Error(`Conflito de ID no Event Store: Evento com ID "${targetId}" já existe no registro imutável.`);
    }

    const fullEvent: ZenIntegrativeEvent = {
      id: targetId,
      userId: eventData.userId,
      timestamp: eventData.timestamp || new Date().toISOString(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      provenance: eventData.provenance,
      consent: eventData.consent,
      reportingContext: eventData.reportingContext,
      dataQuality: eventData.dataQuality || { completeness: 1.0, consistency: 1.0, reliability: 'high' },
      exposures: eventData.exposures,
      phenotype: eventData.phenotype,
      postPrandialResponse: eventData.postPrandialResponse,
      intervention: eventData.intervention,
      response: eventData.response
    };

    // Imutabilidade profunda garantida
    const frozenEvent = deepFreeze(JSON.parse(JSON.stringify(fullEvent)));
    this.eventsCache.push(frozenEvent);
    this.persist();

    return frozenEvent;
  }

  /**
   * Busca um evento específico por ID com isolamento estrito de usuário (userId obrigatório)
   */
  public static async getEventById(eventId: string, userId: string): Promise<ZenIntegrativeEvent | undefined> {
    return this.eventsCache.find(e => e.id === eventId && e.userId === userId);
  }

  /**
   * Timeline cronológica de eventos com isolamento estrito de usuário
   */
  public static async getTimeline(userId: string, fromDate?: string, toDate?: string): Promise<ZenIntegrativeEvent[]> {
    return this.eventsCache
      .filter(e => e.userId === userId) // Isolamento estrito de usuário
      .filter(e => (!fromDate || new Date(e.timestamp) >= new Date(fromDate)))
      .filter(e => (!toDate || new Date(e.timestamp) <= new Date(toDate)))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Cálculo de Baseline derivado e recalculável com isolamento estrito de usuário
   */
  public static async calculateBaseline(
    userId: string, 
    windowDays: number = 30,
    asOfDate?: string
  ): Promise<DerivedBaseline | null> {
    const referenceDate = asOfDate ? new Date(asOfDate) : new Date();
    const cutoff = new Date(referenceDate);
    cutoff.setDate(cutoff.getDate() - windowDays);
    cutoff.setHours(0, 0, 0, 0);

    const timeline = await this.getTimeline(userId, cutoff.toISOString(), referenceDate.toISOString());
    if (timeline.length === 0) return null;

    const metricValues: Record<string, number[]> = {
      vfcMs: [],
      sleepQuality: [],
      bristolScale: [],
      stressLevel: []
    };

    timeline.forEach(e => {
      if (e.phenotype?.autonomic?.vfcMs !== undefined) metricValues.vfcMs.push(e.phenotype.autonomic.vfcMs);
      if (e.phenotype?.sleep?.qualityScore !== undefined) metricValues.sleepQuality.push(e.phenotype.sleep.qualityScore);
      if (e.phenotype?.stool?.bristolScale !== undefined) metricValues.bristolScale.push(e.phenotype.stool.bristolScale);
      if (e.exposures?.stressLevel !== undefined) metricValues.stressLevel.push(e.exposures.stressLevel);
    });

    const metricsSummary: Record<string, { mean: number; sd: number; n: number }> = {};

    Object.entries(metricValues).forEach(([key, values]) => {
      if (values.length > 0) {
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
        metricsSummary[key] = {
          mean: Number(mean.toFixed(2)),
          sd: Number(Math.sqrt(variance).toFixed(2)),
          n: values.length
        };
      }
    });

    return {
      userId,
      windowDays,
      computedAt: referenceDate.toISOString(),
      algorithmVersion: CURRENT_ALGORITHM_VERSION,
      metrics: metricsSummary
    };
  }

  /**
   * Análise de Desvio do Baseline Pessoal (Transições de Estado)
   */
  public static calculateStateDeviation(
    currentValue: number,
    metricKey: string,
    baseline: DerivedBaseline
  ): StateDeviationAnalysis | null {
    const metricStats = baseline.metrics[metricKey];
    if (!metricStats || metricStats.sd === 0) return null;

    const zScore = Number(((currentValue - metricStats.mean) / metricStats.sd).toFixed(2));
    const absZ = Math.abs(zScore);

    let status: 'normal_range' | 'mild_deviation' | 'significant_deviation' = 'normal_range';
    if (absZ >= 2.0) status = 'significant_deviation';
    else if (absZ >= 1.0) status = 'mild_deviation';

    return {
      metric: metricKey,
      currentValue,
      baselineMean: metricStats.mean,
      baselineSd: metricStats.sd,
      zScore,
      status,
      description: status === 'normal_range'
        ? `Valor dentro do padrão habitual (Z-Score: ${zScore}).`
        : `Valor com variação em relação ao baseline pessoal (Z-Score: ${zScore}).`
    };
  }

  /**
   * Janela de latência temporal canônica (T0 -> T+72h) com corte estrito e isolamento de usuário
   */
  public static async queryLatencyWindow(
    userId: string,
    referenceEventId: string,
    windowHours: number = 72
  ): Promise<LatencyWindowQuery | null> {
    const refEvent = await this.getEventById(referenceEventId, userId);
    if (!refEvent) return null;

    const refTime = new Date(refEvent.timestamp).getTime();
    const maxTime = refTime + (windowHours * 60 * 60 * 1000);

    const timeline = await this.getTimeline(userId, refEvent.timestamp);
    const windowEvents = timeline.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= refTime && t <= maxTime && e.id !== refEvent.id;
    });

    return {
      referenceEvent: refEvent,
      windowHours,
      subsequentEvents: windowEvents,
      postPrandialResponses: windowEvents.filter(e => !!e.postPrandialResponse),
      stoolsRecorded: windowEvents.filter(e => e.phenotype?.stool?.bristolScale !== undefined),
      interventionsApplied: windowEvents.filter(e => !!e.intervention)
    };
  }

  /**
   * Validação relacional, temporal e de segurança estrita do postPrandialResponse (4 Dimensões + Bucket Deterministico)
   */
  public static async validatePostPrandialIntegrity(responseEvent: ZenIntegrativeEvent): Promise<{
    isValid: boolean;
    calculatedMinutes?: number;
    reason?: string;
  }> {
    if (!responseEvent.postPrandialResponse) {
      return { isValid: false, reason: 'Evento não possui postPrandialResponse.' };
    }

    const mealId = responseEvent.postPrandialResponse.linkedMealId;
    
    // Dimensão A & B: Existência e Mesmo Usuário (Isolamento de Tenant)
    const mealEvent = await this.getEventById(mealId, responseEvent.userId);

    if (!mealEvent) {
      // Verifica se a refeição existe em outro usuário para reportar erro preciso
      const existsInOtherUser = this.eventsCache.some(e => e.id === mealId && e.userId !== responseEvent.userId);
      if (existsInOtherUser) {
        return { isValid: false, reason: `Violação de segurança: linkedMealId "${mealId}" pertence a outro usuário.` };
      }
      return { isValid: false, reason: `Refeição referenciada "${mealId}" não existe no Event Store.` };
    }

    if (!mealEvent.exposures?.food) {
      return { isValid: false, reason: `Evento referenciado "${mealId}" não possui dados de exposição alimentar.` };
    }

    // Dimensão C: Ordem Temporal Estrita
    const mealTime = new Date(mealEvent.timestamp).getTime();
    const respTime = new Date(responseEvent.timestamp).getTime();

    if (respTime <= mealTime) {
      return { 
        isValid: false, 
        reason: `Violação temporal: A resposta (${responseEvent.timestamp}) ocorreu antes ou no mesmo instante da refeição (${mealEvent.timestamp}).` 
      };
    }

    const realDeltaMinutes = Math.round((respTime - mealTime) / (60 * 1000));
    const statedMinutes = responseEvent.postPrandialResponse.minutesAfterMeal;

    // Dimensão D: Timestamp Tampering / NaN / Infinity / Negativo
    if (statedMinutes !== undefined) {
      if (typeof statedMinutes !== 'number' || isNaN(statedMinutes) || !isFinite(statedMinutes) || statedMinutes <= 0) {
        return {
          isValid: false,
          reason: `Valor de minutesAfterMeal inválido ou corrompido: ${statedMinutes}.`
        };
      }

      if (Math.abs(realDeltaMinutes - statedMinutes) > 5) {
        return {
          isValid: false,
          reason: `Inconsistência temporal contínua: minutesAfterMeal declarado (${statedMinutes}m) difere do delta real (${realDeltaMinutes}m) além da tolerância permitida de 5m.`
        };
      }
    }

    // Dimensão E: Regras Determinísticas de Bucket UX
    // 30min -> 0 < delta <= 60 min
    // 2h    -> 60 < delta <= 240 min
    // 6h    -> 240 < delta <= 720 min
    const bucket = responseEvent.postPrandialResponse.timeAfterMeal;
    const bucketLimits: Record<'30min' | '2h' | '6h', { min: number; max: number }> = {
      '30min': { min: 1, max: 60 },
      '2h': { min: 61, max: 240 },
      '6h': { min: 241, max: 720 }
    };

    const limit = bucketLimits[bucket];
    if (!limit) {
      return { isValid: false, reason: `Bucket UX inválido: ${bucket}` };
    }

    const effectiveMinutes = statedMinutes ?? realDeltaMinutes;
    if (effectiveMinutes < limit.min || effectiveMinutes > limit.max) {
      return {
        isValid: false,
        reason: `Inconsistência de bucket UX: bucket "${bucket}" é incompatível com tempo de ${effectiveMinutes}m (Faixa permitida: ${limit.min}m a ${limit.max}m).`
      };
    }

    return { isValid: true, calculatedMinutes: realDeltaMinutes };
  }

  /**
   * 🔒 CANONICAL ACCEPTANCE TEST GATE (Bateria Completa v1.4)
   */
  public static async runAcceptanceTests(): Promise<{
    passed: boolean;
    tests: { name: string; passed: boolean; details: string }[];
  }> {
    const testUserId = `canonical_gate_v14_${Date.now()}`;
    const testResults: { name: string; passed: boolean; details: string }[] = [];

    const baseDate = new Date('2026-08-01T08:00:00Z');
    const simulatedEvents: ZenIntegrativeEvent[] = [];

    // Gerar 30 dias de dados de teste (90 eventos)
    for (let day = 0; day < 30; day++) {
      const morningDate = new Date(baseDate);
      morningDate.setDate(morningDate.getDate() + day);

      // 1. Manhã: Sono + Bristol + VFC
      simulatedEvents.push({
        id: `sim_morning_${day}`,
        userId: testUserId,
        timestamp: morningDate.toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        dataQuality: { completeness: 1.0, consistency: 1.0, reliability: 'high' },
        phenotype: {
          stool: { 
            bristolScale: (day % 4 === 0 ? 3 : 4) as 3 | 4,
            frequencyToday: 1,
            color: 'brown'
          },
          autonomic: { vfcMs: 50 + (day % 3) * 2 },
          sleep: { qualityScore: 8, durationHours: 7.8 }
        },
        exposures: { stressLevel: 3 }
      });

      // 2. Almoço: Refeição (T0)
      const lunchDate = new Date(morningDate);
      lunchDate.setHours(12, 30, 0);
      const mealEventId = `meal_event_${day}`;

      simulatedEvents.push({
        id: mealEventId,
        userId: testUserId,
        timestamp: lunchDate.toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        exposures: {
          food: { items: ['Salmão grelhado', 'Quinoa', 'Brócolis'], mealType: 'lunch' }
        }
      });

      // 3. Resposta Pós-Prandial (T+2h = 120 minutos exatos depois)
      const postMealDate = new Date(lunchDate);
      postMealDate.setHours(14, 30, 0);

      simulatedEvents.push({
        id: `meal_resp_${day}`,
        userId: testUserId,
        timestamp: postMealDate.toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        postPrandialResponse: {
          linkedMealId: mealEventId,
          timeAfterMeal: '2h',
          minutesAfterMeal: 120,
          overallComfort: 'muito_bem',
          comfortScore: 4,
          symptoms: []
        }
      });
    }

    for (const evt of simulatedEvents) {
      await this.appendEvent(evt);
    }

    // -------------------------------------------------------------
    // TESTE 1: Timeline com verificação estrita de ordem cronológica
    // -------------------------------------------------------------
    const timeline = await this.getTimeline(testUserId);
    const isStrictlyChronological = timeline.every((event, i) => {
      if (i === 0) return true;
      return new Date(event.timestamp).getTime() >= new Date(timeline[i - 1].timestamp).getTime();
    });
    const t1Passed = timeline.length === 90 && isStrictlyChronological;
    testResults.push({
      name: '1. Timeline & Ordenação Cronológica Estrita',
      passed: t1Passed,
      details: `${timeline.length} eventos recuperados. Ordem temporal verificada evento-a-evento: ${isStrictlyChronological ? 'VÁLIDA' : 'INVÁLIDA'}.`
    });

    // -------------------------------------------------------------
    // TESTE 2: Baseline e Recalculabilidade
    // -------------------------------------------------------------
    const fixedEvaluationTime = '2026-08-31T23:59:59Z';
    const baseline = await this.calculateBaseline(testUserId, 30, fixedEvaluationTime);
    const t2Passed = baseline !== null && baseline.metrics.vfcMs?.n === 30 && baseline.metrics.vfcMs.mean > 0;
    testResults.push({
      name: '2. Baseline & Métricas Estatísticas',
      passed: t2Passed,
      details: `Média VFC: ${baseline?.metrics.vfcMs?.mean}ms (SD: ${baseline?.metrics.vfcMs?.sd}ms, N: ${baseline?.metrics.vfcMs?.n}).`
    });

    // -------------------------------------------------------------
    // TESTE 3: Latency Window Canônica (T0 -> T+72h) com Exclusão Exata
    // -------------------------------------------------------------
    const refMeal = simulatedEvents[1]; // Almoço do dia 0 (2026-08-01T12:30:00Z)
    const latency72h = await this.queryLatencyWindow(testUserId, refMeal.id, 72);
    const refTime = new Date(refMeal.timestamp).getTime();
    const maxAllowedTime = refTime + (72 * 60 * 60 * 1000);
    const allWithin72h = latency72h !== null && latency72h.subsequentEvents.every(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= refTime && t <= maxAllowedTime;
    });
    const t3Passed = allWithin72h && (latency72h?.subsequentEvents.length || 0) > 0;
    testResults.push({
      name: '3. Janela de Latência Canônica (T0 a T+72h)',
      passed: t3Passed,
      details: `${latency72h?.subsequentEvents.length} eventos capturados. Todos estritamente dentro da janela de 72h da refeição de referência.`
    });

    // -------------------------------------------------------------
    // TESTE 4: Integridade Relacional e Temporal de linkedMealId
    // -------------------------------------------------------------
    const postMealResponses = timeline.filter(e => !!e.postPrandialResponse);
    let linkedMealIntegrity = postMealResponses.length > 0;
    for (const resp of postMealResponses) {
      const validation = await this.validatePostPrandialIntegrity(resp);
      if (!validation.isValid) {
        linkedMealIntegrity = false;
        break;
      }
    }
    testResults.push({
      name: '4. Integridade Relacional & Temporal de linkedMealId',
      passed: linkedMealIntegrity,
      details: `${postMealResponses.length} respostas validadas. Cada uma referencia refeição real com minutesAfterMeal e bucket UX 100% coerentes.`
    });

    // -------------------------------------------------------------
    // TESTE 5: Imutabilidade Profunda Multicamadas (Deep Freeze)
    // -------------------------------------------------------------
    const sampleEvent = timeline[0];
    let isDeeplyImmutable = Object.isFrozen(sampleEvent) && 
      Object.isFrozen(sampleEvent.phenotype) && 
      Object.isFrozen(sampleEvent.phenotype?.stool) &&
      Object.isFrozen(sampleEvent.consent) &&
      Object.isFrozen(sampleEvent.exposures);
    
    let stoolMutPrevented = false;
    let consentMutPrevented = false;
    try { (sampleEvent as any).phenotype.stool.bristolScale = 7; } catch (e) { stoolMutPrevented = true; }
    try { (sampleEvent as any).consent.populationPooling = true; } catch (e) { consentMutPrevented = true; }
    
    const t5Passed = isDeeplyImmutable && 
      (stoolMutPrevented || sampleEvent.phenotype?.stool?.bristolScale !== 7) &&
      (consentMutPrevented || sampleEvent.consent?.populationPooling !== true);

    testResults.push({
      name: '5. Imutabilidade Profunda Multicamadas (Deep Freeze)',
      passed: t5Passed,
      details: 'Eventos RAW, fenótipos, consentimento e exposições são completamente blindados contra mutações em tempo de execução.'
    });

    // -------------------------------------------------------------
    // TESTE 6: Triagem Completa de Red Flags (Sangue + Piche + Sem Falsos Positivos)
    // -------------------------------------------------------------
    const testRedFlagEvents: ZenIntegrativeEvent[] = [
      {
        id: 'rf_bright_blood',
        userId: 'temp_user',
        timestamp: new Date().toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        phenotype: { stool: { color: 'visible_bright_red_blood', hasBloodVisible: true } }
      },
      {
        id: 'rf_black_tarry',
        userId: 'temp_user',
        timestamp: new Date().toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        phenotype: { stool: { color: 'black_tarry_reported' } }
      },
      {
        id: 'rf_dark_brown_normal',
        userId: 'temp_user',
        timestamp: new Date().toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        phenotype: { stool: { color: 'dark_brown' } }
      }
    ];
    const redFlagAlerts = ZenSafetyLayer.checkRedFlags(testRedFlagEvents);
    const t6Passed = redFlagAlerts.length === 2 && 
      redFlagAlerts.some(a => a.id.includes('rf_bright_blood')) && 
      redFlagAlerts.some(a => a.id.includes('rf_black_tarry'));
    testResults.push({
      name: '6. Triagem de Segurança & Red Flags Clínicos',
      passed: t6Passed,
      details: 'Disparou alerta para sangue vivo e aspecto de piche relatado, sem falso alarme para fezes marrom-escuras.'
    });

    // -------------------------------------------------------------
    // TESTE 7: Safety Layer Policy & Sanitização de Linguagem
    // -------------------------------------------------------------
    const policyCheck1 = ZenSafetyLayer.validateSafetyPolicy('Observamos alterações no padrão intestinal.');
    const policyCheck2 = ZenSafetyLayer.validateSafetyPolicy('Você tem disbiose e este alimento causou sua inflamação.');
    const sanitized = ZenSafetyLayer.sanitizeNarrative('Você tem disbiose e este alimento causou sua inflamação.');
    const t7Passed = policyCheck1.isValid && !policyCheck2.isValid && !sanitized.includes('disbiose');
    testResults.push({
      name: '7. Safety Policy & Guardrail de Linguagem',
      passed: t7Passed,
      details: `Bloqueou alegação causal (${policyCheck2.violationReason}) e sanitizou saída para narrativa ética.`
    });

    // -------------------------------------------------------------
    // TESTE 8: Regra Estrita de Constipação por Dias Civis Consecutivos
    // -------------------------------------------------------------
    const denseTwoDays: ZenIntegrativeEvent[] = [
      { id: 'c1', userId: 'temp2', timestamp: '2026-08-01T08:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 1 } } },
      { id: 'c2', userId: 'temp2', timestamp: '2026-08-01T12:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 2 } } },
      { id: 'c3', userId: 'temp2', timestamp: '2026-08-01T16:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 1 } } },
      { id: 'c4', userId: 'temp2', timestamp: '2026-08-01T20:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 1 } } },
      { id: 'c5', userId: 'temp2', timestamp: '2026-08-02T08:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 2 } } },
      { id: 'c6', userId: 'temp2', timestamp: '2026-08-02T12:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 1 } } },
      { id: 'c7', userId: 'temp2', timestamp: '2026-08-02T18:00:00Z', schemaVersion: '1.4.0', provenance: { source: 'user_self_report', confidence: 'user_reported' }, consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' }, phenotype: { stool: { bristolScale: 1 } } }
    ];
    const alertTwoDays = ZenSafetyLayer.checkRedFlags(denseTwoDays);

    const realSevenDays: ZenIntegrativeEvent[] = [];
    for (let d = 1; d <= 7; d++) {
      const dayPad = d < 10 ? `0${d}` : `${d}`;
      realSevenDays.push({
        id: `c_day_${d}`,
        userId: 'temp3',
        timestamp: `2026-08-${dayPad}T09:00:00Z`,
        schemaVersion: '1.4.0',
        provenance: { source: 'user_self_report', confidence: 'user_reported' },
        consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
        phenotype: { stool: { bristolScale: 1 } }
      });
    }
    const alertSevenDays = ZenSafetyLayer.checkRedFlags(realSevenDays);
    const t8Passed = alertTwoDays.length === 0 && alertSevenDays.length === 1;
    testResults.push({
      name: '8. Discriminação Temporal de Constipação (Dias Civis Consecutivos)',
      passed: t8Passed,
      details: 'Diferenciou com precisão 7 registros em 2 dias (sem alerta) de 7 dias civis consecutivos reais (alerta disparado).'
    });

    // Limpeza de eventos do usuário de teste
    this.eventsCache = this.eventsCache.filter(e => e.userId !== testUserId);
    this.persist();

    return {
      passed: testResults.every(t => t.passed),
      tests: testResults
    };
  }

  private static persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.eventsCache));
    } catch (e) {
      console.warn('[ZenIntegrativeEngine] Erro ao persistir eventos:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  ZenIntegrativeEngine.init();
}
