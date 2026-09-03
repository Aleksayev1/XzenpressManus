import { MeaningMatrix, MeaningObservationState } from './meaning';

export type Provenance = 
  | 'SYSTEM_OBSERVATION' 
  | 'HUMAN_REFLECTION' 
  | 'LLM_TRANSLATION';

/**
 * Strict contract for what an Observation is allowed to contain.
 * Notice the 'never' fields: this ensures the system physically cannot
 * pass epistemic overreaches down the pipeline.
 */
export interface ObservationContract {
  /**
   * Identifies the registration of this observation instance, not its mathematical identity.
   * If the exact same pipeline result is processed twice, they get different observationIds.
   */
  readonly observationId: string;
  /**
   * Runtime enforcement brand to prevent loose structural assignment.
   * You cannot hand-craft this contract; it must be constructed via ObservationFactory.
   */
  readonly _brand: 'ObservationContract';

  readonly observationType:
    | MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE
    | MeaningObservationState.OBSERVED_DIFFERENCE_NEGATIVE
    | MeaningObservationState.NO_OBSERVED_DIFFERENCE
    | MeaningObservationState.INSUFFICIENT;

  readonly matrix: MeaningMatrix;
  readonly deltaS: number | null;
  readonly evidenceEventIds: readonly string[];
  readonly evidenceChapterIds: readonly string[];

  // Negative capability: explicitly forbidding epistemic overreach fields
  readonly confidence?: never;
  readonly meaning?: never;
  readonly insight?: never;
  readonly growth?: never;
  readonly improvement?: never;
  readonly personality?: never;
  readonly cause?: never;
  readonly recommendation?: never;
  readonly psychologicalState?: never;
  readonly evolution?: never;
}

/**
 * The only place where human meaning is authored.
 * Source is strictly HUMAN. 
 * IMPORTANT: 'source: HUMAN' significa somente proveniência da declaração, não veracidade da declaração.
 * O sistema não julga se a reflexão é "verdadeira" ou "falsa".
 */
export interface HumanReflectionContract {
  readonly reflectionId: string;
  readonly observationId: string;
  readonly text: string;
  readonly createdAt: string;
  readonly previousReflectionId?: string;
  readonly source: 'HUMAN_REFLECTION'; // Provenance rule
}

export type SupportedLocale = 'pt-BR' | 'en-US';

/**
 * The sanitized context provided to the LLM. No raw databases, no scores, no hidden classifiers.
 */
export interface ReflectionContext {
  readonly observation: ObservationContract;
  readonly humanReflection: HumanReflectionContract;
  readonly locale: SupportedLocale;
  /**
   * System-authored control metadata. MUST NOT be generated, modified, inferred, 
   * or escalated by the LLM. Determines what the LLM is allowed to do.
   */
  readonly allowedAction: 'TRANSLATE' | 'ACKNOWLEDGE' | 'PRESERVE_AMBIGUITY';
}

/**
 * Explict mapping of violations for the Epistemic Monotonicity Guard.
 */
export enum GuardViolation {
  STRUCTURAL = 'STRUCTURAL',
  EPISTEMIC_ESCALATION = 'EPISTEMIC_ESCALATION',
  LEXICAL_IMPOSITION = 'LEXICAL_IMPOSITION',
  SEMANTIC_CONCLUSION = 'SEMANTIC_CONCLUSION',
  AUTHORSHIP_VIOLATION = 'AUTHORSHIP_VIOLATION',
  TEMPORAL_NORMATIVITY = 'TEMPORAL_NORMATIVITY',
  AGGREGATION_OVERREACH = 'AGGREGATION_OVERREACH',
  HUMAN_REFLECTION_INVALIDATION = 'HUMAN_REFLECTION_INVALIDATION',
  // Novos Vetores (S14-C)
  IDENTITY_CLAIM = 'IDENTITY_CLAIM',
  TELEOLOGY_IMPOSITION = 'TELEOLOGY_IMPOSITION',
  CAUSALITY_OVERREACH = 'CAUSALITY_OVERREACH',
  DISCOVERY_CLAIM = 'DISCOVERY_CLAIM',
  BENEVOLENT_PERSUASION = 'BENEVOLENT_PERSUASION',
  EVIDENCE_ESCALATION = 'EVIDENCE_ESCALATION',
  COMPOSITION_OVERREACH = 'COMPOSITION_OVERREACH',
  UNKNOWN_OR_UNSAFE = 'UNKNOWN_OR_UNSAFE',
}

export enum GuardLayer {
  LAYER_0_PROVENANCE = 'Layer 0: Provenance',
  LAYER_1_STRUCTURAL = 'Layer 1: Structural Contract',
  LAYER_2_EPISTEMIC = 'Layer 2: Epistemic Monotonicity',
  LAYER_3_LEXICAL = 'Layer 3: Lexical Imposition',
  LAYER_4_SEMANTIC = 'Layer 4: Semantic Patterns',
  LAYER_5_FALLBACK = 'Layer 5: Safe Fallback'
}

export interface GuardTelemetryEvent {
  readonly schemaVersion: string;
  readonly eventId: string;
  readonly violation: GuardViolation;
  readonly ruleId: string;
  readonly layer: GuardLayer;
  readonly outputHash: string;
  readonly redactedExcerpt?: string;
  readonly timestamp: string;
}

/**
 * Deterministic output from the Guard layer.
 */
export type GuardResult =
  | {
      readonly status: 'PASS';
      readonly text: string;
    }
  | {
      readonly status: 'REJECT';
      readonly reason: GuardViolation;
      readonly fallback: string;
    };
