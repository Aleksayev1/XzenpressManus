import { ZenEvent, ZenEventProvenance } from '../../types/nutriming';
import { PracticeLog, Chapter, ChapterStatus, ChoiceRecord } from '../../types/evolution';

/**
 * ZenEventBridge: O tradutor que conecta a Evolução Humana ao Temporal Engine.
 * Responsabilidade: Transformar ações de desenvolvimento pessoal em eventos
 * observáveis pelo cérebro temporal (Nutriming).
 */

const EVOLUTION_PROVENANCE: ZenEventProvenance = {
  source: 'user',
  method: 'self_report',
  confidence: 1, // High confidence as it's explicit user action
};

export const ZenEventBridge = {
  /**
   * Converte uma prática isolada (Micro) em um ZenEvent.
   * Disparado a cada vez que o usuário clica em "Pratiquei".
   */
  createPracticeEvent(userId: string, log: PracticeLog): ZenEvent {
    return {
      id: `ze-prac-${log.id}`,
      userId,
      type: 'practice',
      timestamp: log.occurredAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      provenance: EVOLUTION_PROVENANCE,
      data: {
        chapterId: log.chapterId,
        microBehaviorId: log.microBehaviorId,
        context: log.context,
        outcome: log.outcome,
        userReflection: log.userReflection,
      },
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Converte a revisão do 7º dia (Macro) em um ZenEvent.
   * Disparado APENAS se houver uma reflexão ou uma mudança de estado significativa.
   */
  createChapterReviewEvent(
    userId: string,
    chapter: Chapter,
    selectedStatus: ChapterStatus,
    reflectionText: string,
    practiceCount: number
  ): ZenEvent {
    return {
      id: `ze-rev-${chapter.id}-${Date.now()}`,
      userId,
      type: 'chapter_review',
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      provenance: EVOLUTION_PROVENANCE,
      data: {
        chapterId: chapter.id,
        primaryVirtueId: chapter.primaryVirtueId,
        previousStatus: chapter.status,
        selectedStatus,
        practiceCount,
        userReflection: reflectionText,
      },
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Converte o momento do Choice Engine em um ZenEvent
   */
  createChoiceEvent(userId: string, record: ChoiceRecord): ZenEvent {
    return {
      id: `ze-cho-${record.id}`,
      userId,
      type: 'choice', // Registrado em nutriming.ts na Sprint 5
      timestamp: record.occurredAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      provenance: EVOLUTION_PROVENANCE,
      data: {
        chapterId: record.chapterId,
        trigger: record.trigger,
        choiceOutcome: record.choiceOutcome,
        userReflection: record.reflection,
      },
      createdAt: new Date().toISOString(),
    };
  }
};
