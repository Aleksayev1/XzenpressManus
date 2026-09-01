import { Chapter, ChapterWithLogs } from '../../types/evolution';
import { practiceLogsApi } from './practiceLogsApi';
import { choiceRecordsApi } from './choiceRecordsApi';

/**
 * Camada de agregação de evidências longitudinais.
 * Responsável exclusivamente por buscar dados reais do banco e normalizá-los
 * em ChapterWithLogs[]. O Dashboard e o EvolutionMirrorEngine não acessam
 * o banco diretamente para análise longitudinal.
 *
 * Custo: 2 queries batch (não N+1).
 */
export const evolutionEvidenceRepository = {
  async buildDataset(chapters: Chapter[]): Promise<ChapterWithLogs[]> {
    if (chapters.length === 0) return [];

    const chapterIds = chapters.map(c => c.id);

    // 2 queries batch em paralelo — não N+1
    const [logs, choices] = await Promise.all([
      practiceLogsApi.fetchByChapterIds(chapterIds),
      choiceRecordsApi.fetchByChapterIds(chapterIds),
    ]);

    // Agrupa por chapterId no cliente (evita múltiplas queries)
    return chapters.map(chapter => ({
      chapter,
      logs: logs.filter(l => l.chapterId === chapter.id),
      choices: choices.filter(c => c.chapterId === chapter.id),
    }));
  }
};
