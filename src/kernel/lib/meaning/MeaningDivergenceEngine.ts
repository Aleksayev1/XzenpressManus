import { MeaningMatrix, MeaningObservationState, MeaningDivergenceResult, MeaningConditionalProbabilities, MeaningEvent } from '../../types/meaning';

export class MeaningDivergenceEngine {
  static evaluateMatrix(matrix: MeaningMatrix, events: MeaningEvent[]): MeaningDivergenceResult {
    // Denominadores
    const totalContribution = matrix.n11 + matrix.n10;
    const totalNoContribution = matrix.n01 + matrix.n00;

    // P(S|C)
    const p_S_given_C = totalContribution > 0 ? matrix.n11 / totalContribution : null;
    
    // P(S|~C) (Invariante 6 - Cálculo obrigatório)
    const p_S_given_not_C = totalNoContribution > 0 ? matrix.n01 / totalNoContribution : null;

    const deltaS = (p_S_given_C !== null && p_S_given_not_C !== null) 
      ? p_S_given_C - p_S_given_not_C 
      : null;

    const probabilities: MeaningConditionalProbabilities = {
      p_S_given_C,
      p_S_given_not_C,
      deltaS,
    };

    let state: MeaningDivergenceResult['state'] = MeaningObservationState.NO_OBSERVED_DIFFERENCE;
    let description = 'Ausência de diferença observada (deltaS = 0).';

    if (p_S_given_C !== null && p_S_given_not_C !== null) {
      if (deltaS! > 0) {
        state = MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE;
        description = 'Diferença matemática positiva observada.';
      } else if (deltaS! < 0) {
        state = MeaningObservationState.OBSERVED_DIFFERENCE_NEGATIVE;
        description = 'Diferença matemática negativa observada (predominância na ausência).';
      } else {
        state = MeaningObservationState.NO_OBSERVED_DIFFERENCE;
        description = 'Ausência de diferença observada (deltaS = 0).';
      }
    }

    // Events are already deduplicated and sorted chronologically
    const evidenceEventIds = events.map(e => e.practiceLogId);
    const evidenceChapterIds = Array.from(new Set(events.map(e => e.chapterId)));

    return {
      state,
      matrix,
      probabilities,
      description,
      evidenceEventIds,
      evidenceChapterIds
    };
  }
}