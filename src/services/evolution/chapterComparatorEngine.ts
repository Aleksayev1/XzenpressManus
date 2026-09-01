import { ChapterWithLogs, EvolutionObservation, ChapterComparison } from '../../types/evolution';

/**
 * Motor do Chapter Comparator.
 *
 * Recebe ChapterWithLogs[] e EvolutionObservation[] já calculadas.
 * Não acessa Supabase, não usa LLM, não cria interpretações novas.
 * Apenas agrupa e organiza evidências existentes por microcomportamento.
 */
export const ChapterComparatorEngine = {
  /**
   * Produz ChapterComparison[] a partir dos capítulos e observações existentes.
   * Só agrupa microcomportamentos com 2+ capítulos elegíveis (completed | paused).
   */
  buildComparisons(
    dataset: ChapterWithLogs[],
    observations: EvolutionObservation[]
  ): ChapterComparison[] {
    // Somente capítulos encerrados
    const eligible = dataset.filter(
      d => d.chapter.status === 'completed' || d.chapter.status === 'paused'
    );

    if (eligible.length < 2) return [];

    // Agrupa por microBehaviorId
    const byMb = new Map<string, ChapterWithLogs[]>();
    for (const item of eligible) {
      const mbId = item.chapter.microBehaviorId;
      if (!byMb.has(mbId)) byMb.set(mbId, []);
      byMb.get(mbId)!.push(item);
    }

    const comparisons: ChapterComparison[] = [];

    for (const [mbId, items] of Array.from(byMb.entries())) {
      if (items.length < 2) continue;

      // Ordena por startedAt — mesma lógica do motor longitudinal
      const sorted = [...items].sort(
        (a, b) => new Date(a.chapter.startedAt).getTime() - new Date(b.chapter.startedAt).getTime()
      );

      const chapterIds = sorted.map(i => i.chapter.id);

      // Observações que mencionam pelo menos um dos capítulos deste grupo
      const related = observations.filter(obs =>
        obs.evidence.some(ev => chapterIds.includes(ev.chapterId))
      );

      // IDs de capítulos com evidência real
      const evidenceChapterIds = Array.from(new Set(
        related.flatMap(obs => obs.evidence.map(ev => ev.chapterId))
      ));

      comparisons.push({
        microBehaviorId: mbId,
        chapters: sorted.map(i => i.chapter),
        relatedObservations: related,
        evidenceChapterIds,
      });
    }

    // Comparisons com mais observações primeiro
    return comparisons.sort((a, b) => b.relatedObservations.length - a.relatedObservations.length);
  }
};
