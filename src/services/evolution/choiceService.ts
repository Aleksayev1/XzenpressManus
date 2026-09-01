import { Chapter, ChoiceRecord } from '../../types/evolution';
import { choiceRecordsApi } from './choiceRecordsApi';
import { ZenEventBridge } from './zeneventbridge';
import { zenEventsApi } from './zenEventsApi';

export const choiceService = {
  /**
   * Registra um momento de escolha consciente.
   * Orquestra: persiste o ChoiceRecord → gera ZenEvent → salva no motor temporal.
   * O componente React não precisa saber de nada disso.
   */
  async recordChoice(
    userId: string,
    chapter: Chapter,
    choiceOutcome: ChoiceRecord['choiceOutcome'],
    trigger?: string,
    reflection?: string
  ): Promise<ChoiceRecord> {
    const now = new Date().toISOString();

    const newRecord: ChoiceRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cho-${Date.now()}`,
      chapterId: chapter.id,
      userId,
      occurredAt: now,
      trigger,
      choiceOutcome,
      reflection,
    };

    // 1. Salva na tabela choice_records
    const savedRecord = await choiceRecordsApi.save(newRecord);

    // 2. Gera o ZenEvent para o motor temporal
    const zenEvent = ZenEventBridge.createChoiceEvent(userId, savedRecord);

    // 3. Persiste o evento no motor temporal
    await zenEventsApi.save(zenEvent, userId);

    // 4. Atualiza o zenEventId no record (opcional, para rastreabilidade futura)
    savedRecord.zenEventId = zenEvent.id;

    return savedRecord;
  }
};
