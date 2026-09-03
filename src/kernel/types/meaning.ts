export interface RawMeaningEvent {
  practiceLogId: string;
  chapterId: string;
  occurredAt?: string | null;
  contribution: boolean;
  feltMeaningful: boolean;
  microBehaviorId?: string;
}

export interface MeaningEvent extends RawMeaningEvent {
  occurredAt: string; // ISO 8601 string, guaranteed valid
}

export interface MeaningMatrix {
  readonly n11: number; // C=1, S=1
  readonly n10: number; // C=1, S=0
  readonly n01: number; // C=0, S=1
  readonly n00: number; // C=0, S=0

  // Negative capability: Prevent semantic leaking from internal dependency
  readonly confidence?: never;
  readonly meaning?: never;
  readonly causalScore?: never;
  readonly personality?: never;
  readonly growth?: never;
  readonly interpretation?: never;
}

export interface MeaningConditionalProbabilities {
  readonly p_S_given_C: number | null; // P(S|C)
  readonly p_S_given_not_C: number | null; // P(S|~C)
  readonly deltaS: number | null; // P(S|C) - P(S|~C)
}

export enum MeaningObservationState {
  INSUFFICIENT = 'INSUFFICIENT',
  OBSERVED_DIFFERENCE_POSITIVE = 'OBSERVED_DIFFERENCE_POSITIVE',
  NO_OBSERVED_DIFFERENCE = 'NO_OBSERVED_DIFFERENCE',
  OBSERVED_DIFFERENCE_NEGATIVE = 'OBSERVED_DIFFERENCE_NEGATIVE',
}

export interface MeaningInsufficientResult {
  readonly state: MeaningObservationState.INSUFFICIENT;
  readonly reason: 'SAMPLE_TOO_SMALL' | 'DUPLICATE_CONFLICT' | 'INVALID_WINDOW';
}

export interface MeaningDivergenceResult {
  readonly state:
    | MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE
    | MeaningObservationState.NO_OBSERVED_DIFFERENCE
    | MeaningObservationState.OBSERVED_DIFFERENCE_NEGATIVE;
  readonly matrix: MeaningMatrix;
  readonly probabilities: MeaningConditionalProbabilities;
  readonly description: string;
  readonly evidenceEventIds: readonly string[];
  readonly evidenceChapterIds: readonly string[];
}

/**
 * Discriminated union for all possible pipeline results.
 * Use `result.state` to narrow before accessing matrix/probabilities/evidence fields.
 */
export type PipelineResult = MeaningInsufficientResult | MeaningDivergenceResult;

export interface TemporalWindow {
  readonly start: string; // ISO 8601
  readonly end: string;   // ISO 8601
}