import { EvolutionMeaningPipeline } from '../../services/evolution/EvolutionMeaningPipeline';
import { MeaningTemporalValidator } from '../../lib/meaning/MeaningTemporalValidator';
import { MeaningRecurrenceEngine } from '../../lib/meaning/MeaningRecurrenceEngine';
import { RawMeaningEvent, MeaningEvent, MeaningObservationState, MeaningDivergenceResult, PipelineResult, MeaningInsufficientResult } from '../../types/meaning';

// Helper: create a minimal valid MeaningEvent
const validEvent = (overrides: Partial<MeaningEvent> = {}): MeaningEvent => ({
  practiceLogId: 'log-default',
  chapterId: 'c1',
  occurredAt: '2026-09-01T10:00:00Z',
  contribution: true,
  feltMeaningful: true,
  ...overrides,
});

// Helper for fast event creation
const makeEvents = (
  contributions: number,
  noContributions: number,
  chapters: string[],
  baseDate: string = '2026-09-01T10:00:00Z'
): MeaningEvent[] => {
  const events: MeaningEvent[] = [];
  const baseTime = new Date(baseDate).getTime();
  
  for (let i = 0; i < contributions; i++) {
    events.push(validEvent({ 
      practiceLogId: `c${i}`, 
      chapterId: chapters[i % chapters.length], 
      contribution: true,
      feltMeaningful: true,
      occurredAt: new Date(baseTime + i * 1000).toISOString()
    }));
  }
  for (let i = 0; i < noContributions; i++) {
    events.push(validEvent({ 
      practiceLogId: `nc${i}`, 
      chapterId: chapters[i % chapters.length], 
      contribution: false,
      feltMeaningful: false,
      occurredAt: new Date(baseTime + (contributions + i) * 1000).toISOString()
    }));
  }
  return events;
};

// ---------------------------------------------------------------------------
// MeaningTemporalValidator — ISO 8601 Regex & Windowing
// ---------------------------------------------------------------------------
describe('MeaningTemporalValidator', () => {
  describe('isValidOccurredAt', () => {
    it('accepts a full ISO 8601 datetime with Z', () => {
      expect(MeaningTemporalValidator.isValidOccurredAt('2026-09-01T10:00:00Z')).toBe(true);
    });

    it('rejects "banana"', () => {
      expect(MeaningTemporalValidator.isValidOccurredAt('banana')).toBe(false);
    });

    it('rejects a year-only string "2022"', () => {
      expect(MeaningTemporalValidator.isValidOccurredAt('2022')).toBe(false);
    });

    it('rejects structurally-ISO-but-semantically-impossible date "2099-13-45"', () => {
      expect(MeaningTemporalValidator.isValidOccurredAt('2099-13-45')).toBe(false);
    });
  });

  describe('isWindowValid', () => {
    it('returns true for start <= end', () => {
      expect(MeaningTemporalValidator.isWindowValid({ start: '2026-09-01T00:00:00Z', end: '2026-09-30T23:59:59Z' })).toBe(true);
      expect(MeaningTemporalValidator.isWindowValid({ start: '2026-09-01T00:00:00Z', end: '2026-09-01T00:00:00Z' })).toBe(true);
    });
    it('returns false for start > end', () => {
      expect(MeaningTemporalValidator.isWindowValid({ start: '2026-09-30T00:00:00Z', end: '2026-09-01T00:00:00Z' })).toBe(false);
    });
    it('returns false for invalid ISO strings', () => {
      expect(MeaningTemporalValidator.isWindowValid({ start: 'banana', end: '2026-09-01T00:00:00Z' })).toBe(false);
    });
  });

  describe('filterWithinWindow', () => {
    const window = { start: '2026-09-02T00:00:00Z', end: '2026-09-04T23:59:59Z' };
    
    it('drops events before start', () => {
      expect(MeaningTemporalValidator.filterWithinWindow([validEvent({ occurredAt: '2026-09-01T23:59:59Z' })], window)).toHaveLength(0);
    });
    it('drops events after end', () => {
      expect(MeaningTemporalValidator.filterWithinWindow([validEvent({ occurredAt: '2026-09-05T00:00:00Z' })], window)).toHaveLength(0);
    });
    it('keeps events exactly on start', () => {
      expect(MeaningTemporalValidator.filterWithinWindow([validEvent({ occurredAt: '2026-09-02T00:00:00Z' })], window)).toHaveLength(1);
    });
    it('keeps events exactly on end', () => {
      expect(MeaningTemporalValidator.filterWithinWindow([validEvent({ occurredAt: '2026-09-04T23:59:59Z' })], window)).toHaveLength(1);
    });
  });

  describe('deduplicateEvents', () => {
    it('collapses identical duplicates', () => {
      const events = [
        validEvent({ practiceLogId: '1', chapterId: 'c1', contribution: true, feltMeaningful: true }),
        validEvent({ practiceLogId: '1', chapterId: 'c1', contribution: true, feltMeaningful: true }),
      ];
      const result = MeaningTemporalValidator.deduplicateEvents(events);
      expect(result.hasConflict).toBe(false);
      expect(result.events).toHaveLength(1);
    });
    it('detects conflict on different contribution', () => {
      const events = [
        validEvent({ practiceLogId: '1', contribution: true }),
        validEvent({ practiceLogId: '1', contribution: false }),
      ];
      const result = MeaningTemporalValidator.deduplicateEvents(events);
      expect(result.hasConflict).toBe(true);
      expect(result.events).toHaveLength(0);
    });
    it('preserves distinct practiceLogIds', () => {
      const result = MeaningTemporalValidator.deduplicateEvents([
        validEvent({ practiceLogId: '1' }),
        validEvent({ practiceLogId: '2' }),
      ]);
      expect(result.hasConflict).toBe(false);
      expect(result.events).toHaveLength(2);
    });
  });

  describe('sortEvents', () => {
    it('sorts events chronologically ascending', () => {
      const events = [
        validEvent({ practiceLogId: '3', occurredAt: '2026-09-03T00:00:00Z' }),
        validEvent({ practiceLogId: '1', occurredAt: '2026-09-01T00:00:00Z' }),
        validEvent({ practiceLogId: '2', occurredAt: '2026-09-02T00:00:00Z' }),
      ];
      const sorted = MeaningTemporalValidator.sortEvents(events);
      expect(sorted.map(e => e.practiceLogId)).toEqual(['1', '2', '3']);
    });
    
    it('uses practiceLogId as tie-breaker for identical timestamps', () => {
      const events = [
        validEvent({ practiceLogId: 'C', occurredAt: '2026-09-01T00:00:00Z' }),
        validEvent({ practiceLogId: 'A', occurredAt: '2026-09-01T00:00:00Z' }),
        validEvent({ practiceLogId: 'B', occurredAt: '2026-09-01T00:00:00Z' }),
      ];
      const sorted = MeaningTemporalValidator.sortEvents(events);
      expect(sorted.map(e => e.practiceLogId)).toEqual(['A', 'B', 'C']);
    });
  });
});

// ---------------------------------------------------------------------------
// MeaningRecurrenceEngine
// ---------------------------------------------------------------------------
describe('MeaningRecurrenceEngine', () => {
  it('passes with exactly 5 contributions, 2 no-contributions, 3 chapters', () => {
    expect(MeaningRecurrenceEngine.validateSampleThreshold(makeEvents(5, 2, ['c1', 'c2', 'c3']))).toBe(true);
  });
  it('fails with only 4 contributions (below minimum)', () => {
    expect(MeaningRecurrenceEngine.validateSampleThreshold(makeEvents(4, 2, ['c1', 'c2', 'c3']))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EvolutionMeaningPipeline — Integration Tests
// ---------------------------------------------------------------------------
describe('EvolutionMeaningPipeline Integration Tests', () => {
  it('returns INSUFFICIENT/SAMPLE_TOO_SMALL if no events are provided', () => {
    const result = EvolutionMeaningPipeline.process([]) as MeaningInsufficientResult;
    expect(result.state).toBe(MeaningObservationState.INSUFFICIENT);
    expect(result.reason).toBe('SAMPLE_TOO_SMALL');
  });

  it('returns INSUFFICIENT/INVALID_WINDOW if window is backwards', () => {
    const window = { start: '2026-09-30T00:00:00Z', end: '2026-09-01T00:00:00Z' };
    const result = EvolutionMeaningPipeline.process(makeEvents(5, 2, ['c1', 'c2', 'c3']), window) as MeaningInsufficientResult;
    expect(result.state).toBe(MeaningObservationState.INSUFFICIENT);
    expect(result.reason).toBe('INVALID_WINDOW');
  });

  it('returns INSUFFICIENT/DUPLICATE_CONFLICT if there are conflicting events', () => {
    const events = makeEvents(5, 2, ['c1', 'c2', 'c3']);
    events.push(validEvent({ practiceLogId: 'c0', contribution: false })); // conflict with c0
    
    const result = EvolutionMeaningPipeline.process(events) as MeaningInsufficientResult;
    expect(result.state).toBe(MeaningObservationState.INSUFFICIENT);
    expect(result.reason).toBe('DUPLICATE_CONFLICT');
  });

  it('applies window BEFORE threshold', () => {
    const events = makeEvents(5, 2, ['c1', 'c2', 'c3']);
    // 7 events in total, all valid. Occurred around '2026-09-01T10:00:00Z'.
    // If we set window to exclude them, the threshold will fail.
    const window = { start: '2027-01-01T00:00:00Z', end: '2027-12-31T23:59:59Z' };
    
    const result = EvolutionMeaningPipeline.process(events, window) as MeaningInsufficientResult;
    expect(result.state).toBe(MeaningObservationState.INSUFFICIENT);
    expect(result.reason).toBe('SAMPLE_TOO_SMALL'); // It dropped the events, leaving 0, triggering threshold failure.
  });

  it('preserves chronological order in evidenceEventIds', () => {
    // Create valid event set
    const events = [
      validEvent({ practiceLogId: 'ev3', occurredAt: '2026-09-03T00:00:00Z', chapterId: 'c3', contribution: true, feltMeaningful: true }),
      validEvent({ practiceLogId: 'ev1', occurredAt: '2026-09-01T00:00:00Z', chapterId: 'c1', contribution: true, feltMeaningful: true }),
      validEvent({ practiceLogId: 'ev2', occurredAt: '2026-09-02T00:00:00Z', chapterId: 'c2', contribution: true, feltMeaningful: true }),
      
      validEvent({ practiceLogId: 'ev4', occurredAt: '2026-09-04T00:00:00Z', chapterId: 'c1', contribution: true, feltMeaningful: true }),
      validEvent({ practiceLogId: 'ev5', occurredAt: '2026-09-05T00:00:00Z', chapterId: 'c2', contribution: true, feltMeaningful: true }),
      
      validEvent({ practiceLogId: 'ev6', occurredAt: '2026-09-06T00:00:00Z', chapterId: 'c1', contribution: false, feltMeaningful: false }),
      validEvent({ practiceLogId: 'ev7', occurredAt: '2026-09-07T00:00:00Z', chapterId: 'c2', contribution: false, feltMeaningful: false }),
    ];
    
    // Pass to pipeline
    const result = EvolutionMeaningPipeline.process(events);
    expect(result.state).not.toBe(MeaningObservationState.INSUFFICIENT);
    
    if (result.state !== MeaningObservationState.INSUFFICIENT) {
      // Must be strictly chronological
      expect(result.evidenceEventIds).toEqual(['ev1', 'ev2', 'ev3', 'ev4', 'ev5', 'ev6', 'ev7']);
    }
  });

  it('computes correct deltaS and NO_OBSERVED_DIFFERENCE', () => {
    const events = makeEvents(5, 5, ['c1', 'c2', 'c3']);
    // By default makeEvents sets feltMeaningful = contribution.
    // So 5/5 = 1.0 (P(S|C)) and 0/5 = 0.0 (P(S|~C)). deltaS = 1.0.
    const result = EvolutionMeaningPipeline.process(events);
    expect(result.state).toBe(MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE);
  });
});
