import { RawMeaningEvent, MeaningObservationState, PipelineResult, TemporalWindow } from '../../types/meaning';
import { MeaningTemporalValidator } from '../../lib/meaning/MeaningTemporalValidator';
import { MeaningRecurrenceEngine } from '../../lib/meaning/MeaningRecurrenceEngine';
import { MeaningAssociationEngine } from '../../lib/meaning/MeaningAssociationEngine';
import { MeaningDivergenceEngine } from '../../lib/meaning/MeaningDivergenceEngine';

export class EvolutionMeaningPipeline {
  static process(rawEvents: RawMeaningEvent[], window?: TemporalWindow): PipelineResult {
    // 0. Validate Window
    if (window && !MeaningTemporalValidator.isWindowValid(window)) {
      return { state: MeaningObservationState.INSUFFICIENT, reason: 'INVALID_WINDOW' };
    }

    // 1. Temporal Validation (basic format)
    const validEvents = MeaningTemporalValidator.filterValidEvents(rawEvents);
    
    // 2. Window Filtering
    const windowedEvents = MeaningTemporalValidator.filterWithinWindow(validEvents, window);

    // 3. Deduplication
    const { events: dedupedEvents, hasConflict } = MeaningTemporalValidator.deduplicateEvents(windowedEvents);
    if (hasConflict) {
      return { state: MeaningObservationState.INSUFFICIENT, reason: 'DUPLICATE_CONFLICT' };
    }

    // 4. Sorting
    const sortedEvents = MeaningTemporalValidator.sortEvents(dedupedEvents);

    // 5. Recurrence Gate (counts only temporally valid events, including control group check)
    const hasEnoughData = MeaningRecurrenceEngine.validateSampleThreshold(sortedEvents);
    
    if (!hasEnoughData) {
      return { state: MeaningObservationState.INSUFFICIENT, reason: 'SAMPLE_TOO_SMALL' };
    }
    
    // 6. Association Matrix
    const matrix = MeaningAssociationEngine.calculateMatrix(sortedEvents);
    
    // 7. Divergence / Evaluation (also generates evidence trail)
    const result = MeaningDivergenceEngine.evaluateMatrix(matrix, sortedEvents);
    
    return result;
  }
}
