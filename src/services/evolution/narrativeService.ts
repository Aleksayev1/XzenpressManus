import { supabase } from '../../lib/supabase';
import { EvolutionObservation, ChapterComparison, NarrativeOutput } from '../../types/evolution';

export class NarrativeService {
  static async generate(observations: EvolutionObservation[], comparisons: ChapterComparison[]): Promise<NarrativeOutput> {
    if (!observations || observations.length === 0) {
      return { status: 'rejected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-narrative', {
        body: { observations, comparisons }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { status: 'rejected' };
      }

      return data as NarrativeOutput;
    } catch (err) {
      console.error('NarrativeService error:', err);
      return { status: 'rejected' };
    }
  }
}
