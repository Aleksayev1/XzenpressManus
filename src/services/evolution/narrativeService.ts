import { supabase } from '../../lib/supabase';
import { Chapter } from '../../types/evolution';
import { Observation } from '../../types/meaning';
import { chaptersApi } from './chaptersApi';

export interface NarrativeInput {
  virtueName: string;
  microBehaviorName: string;
  draftDurationDays: number;
  observations: string[];
}

export const narrativeService = {
  /**
   * Chama a Edge Function para gerar a narrativa, sem passar dados brutos.
   * Se der erro, não quebra a interface, apenas loga e retorna um texto padrão ou string vazia.
   */
  async generateChapterNarrative(
    chapter: Chapter, 
    observations: Observation[]
  ): Promise<string> {
    if (!supabase) return "";

    const input: NarrativeInput = {
      virtueName: chapter.primaryVirtueId, // Idealmente seria o nome extenso, vamos usar o ID como substituto por ora
      microBehaviorName: chapter.microBehaviorId,
      draftDurationDays: 7,
      observations: observations.map(o => o.text),
    };

    try {
      const { data, error } = await supabase.functions.invoke('generate-narrative', {
        body: input,
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        return "O sistema temporal encontrou um lapso ao gerar a síntese, mas seus registros estão salvos na eternidade.";
      }

      const narrativeText = data?.narrative || "";

      if (narrativeText) {
        // Salva silenciosamente no banco
        await chaptersApi.updateNarrative(chapter.id, narrativeText);
      }

      return narrativeText;
    } catch (e) {
      console.error("Erro fatal no narrativeService:", e);
      return "Não foi possível conectar-se ao Cérebro Generativo neste momento.";
    }
  }
};
