import { MeaningEvent } from '../../types/meaning';

export class MeaningRecurrenceEngine {
  static validateSampleThreshold(events: MeaningEvent[]): boolean {
    const chapters = new Set(events.map((e) => e.chapterId));
    
    // Mínimo de 3 capítulos distintos
    if (chapters.size < 3) {
      return false;
    }

    // Mínimo de 5 registros de contribuição (C=1)
    const contributionCount = events.filter((e) => e.contribution).length;
    if (contributionCount < 5) {
      return false;
    }

    // Mínimo de 2 registros sem contribuição (C=0) — grupo de controle obrigatório.
    // Sem isso, P(S|~C) é matematicamente incalculável e deltaS nunca existirá.
    const noContributionCount = events.filter((e) => !e.contribution).length;
    if (noContributionCount < 2) {
      return false;
    }

    return true;
  }
}