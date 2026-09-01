import { Chapter, PracticeLog, PracticeOutcome } from '../../types/evolution';
import { practiceLogsApi } from './practiceLogsApi';
import { ZenEventBridge } from './zeneventbridge';
import { zenEventsApi } from './zenEventsApi';

export const practiceService = {
  /**
   * Registra uma nova prática. Orquestra a persistência e o disparo de eventos.
   */
  async recordPractice(
    userId: string,
    chapter: Chapter,
    outcome: PracticeOutcome,
    reflection?: string
  ): Promise<PracticeLog> {
    const now = new Date().toISOString();
    
    const newLog: PracticeLog = {
      // In a real env, crypto.randomUUID() is better, using fallback for simplicity if not available
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      chapterId: chapter.id,
      microBehaviorId: chapter.microBehaviorId,
      occurredAt: now,
      recordedAt: now,
      outcome,
      userReflection: reflection,
    };

    // 1. Salva na tabela practice_logs
    const savedLog = await practiceLogsApi.logPractice(newLog);

    // 2. Converte para ZenEvent (Macro arquitetura temporal)
    const zenEvent = ZenEventBridge.createPracticeEvent(userId, savedLog);
    
    // Sprint 9: Salva de fato no banco temporal
    await zenEventsApi.save(zenEvent, userId);

    return savedLog;
  }
};
