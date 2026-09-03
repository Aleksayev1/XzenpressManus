import { MeaningEvent, MeaningMatrix } from '../../types/meaning';

export class MeaningAssociationEngine {
  static calculateMatrix(events: MeaningEvent[]): MeaningMatrix {
    let n11 = 0;
    let n10 = 0;
    let n01 = 0;
    let n00 = 0;

    for (const event of events) {
      if (event.contribution && event.feltMeaningful) {
        n11++;
      } else if (event.contribution && !event.feltMeaningful) {
        n10++;
      } else if (!event.contribution && event.feltMeaningful) {
        n01++;
      } else {
        n00++;
      }
    }

    return { n11, n10, n01, n00 };
  }
}