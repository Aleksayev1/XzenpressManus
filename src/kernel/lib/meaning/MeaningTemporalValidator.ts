import { RawMeaningEvent, MeaningEvent, TemporalWindow } from '../../types/meaning';

/**
 * Strict ISO 8601 regex.
 * Accepts: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, with optional milliseconds and timezone (Z or ±HH:MM).
 * Rejects: "banana", "1", "January 1, 2020", "2022" (year-only), etc.
 */
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

export class MeaningTemporalValidator {
  /**
   * Checks if a given string is a valid ISO 8601 date string.
   * Two-phase validation: regex structure first, then semantic validity via Date parsing.
   */
  public static isValidOccurredAt(dateStr?: string | null): boolean {
    if (!dateStr || dateStr.trim() === '') return false;

    // Phase 1: Reject anything that does not match the ISO 8601 structure.
    if (!ISO_8601_REGEX.test(dateStr.trim())) return false;

    // Phase 2: Reject structurally-valid-but-semantically-impossible dates (e.g. "2099-13-45").
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  /**
   * Filters an array of RawMeaningEvent, returning only those with a strictly valid occurredAt.
   * The returned array is typed as MeaningEvent[], guaranteeing occurredAt is a string.
   */
  public static filterValidEvents(rawEvents: RawMeaningEvent[]): MeaningEvent[] {
    return rawEvents.filter(event => this.isValidOccurredAt(event.occurredAt)) as MeaningEvent[];
  }

  /**
   * Validates if a TemporalWindow is well-formed and logically sound (start <= end).
   */
  public static isWindowValid(window: TemporalWindow): boolean {
    if (!this.isValidOccurredAt(window.start) || !this.isValidOccurredAt(window.end)) return false;
    const startTime = new Date(window.start).getTime();
    const endTime = new Date(window.end).getTime();
    return startTime <= endTime;
  }

  /**
   * Filters an array of MeaningEvent to only include those within the given inclusive TemporalWindow.
   * Assumes the window has already been validated via isWindowValid.
   */
  public static filterWithinWindow(events: MeaningEvent[], window?: TemporalWindow): MeaningEvent[] {
    if (!window) return events;
    const startTime = new Date(window.start).getTime();
    const endTime = new Date(window.end).getTime();
    
    return events.filter(event => {
      const eventTime = new Date(event.occurredAt).getTime();
      return eventTime >= startTime && eventTime <= endTime;
    });
  }

  /**
   * Deduplicates events by practiceLogId.
   * If two events have the same practiceLogId but divergent payloads (contribution, feltMeaningful, chapterId),
   * returns hasConflict = true. Otherwise, collapses into a single event.
   */
  public static deduplicateEvents(events: MeaningEvent[]): { events: MeaningEvent[], hasConflict: boolean } {
    const map = new Map<string, MeaningEvent>();
    
    for (const event of events) {
      if (map.has(event.practiceLogId)) {
        const existing = map.get(event.practiceLogId)!;
        // Check for conflicts
        if (
          existing.contribution !== event.contribution || 
          existing.feltMeaningful !== event.feltMeaningful || 
          existing.chapterId !== event.chapterId
        ) {
          return { events: [], hasConflict: true };
        }
      } else {
        map.set(event.practiceLogId, event);
      }
    }
    
    return { events: Array.from(map.values()), hasConflict: false };
  }

  /**
   * Sorts events chronologically (ascending) by their occurredAt timestamp.
   * Deterministic ordering.
   */
  public static sortEvents(events: MeaningEvent[]): MeaningEvent[] {
    return [...events].sort((a, b) => {
      const timeDiff = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      // Tie-breaker for absolute determinism: order alphabetically by ID if timestamps match
      return a.practiceLogId.localeCompare(b.practiceLogId);
    });
  }
}
