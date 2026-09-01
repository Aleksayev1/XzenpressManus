import { ZenEvent } from '../../types/nutriming';
import { Chapter } from '../../types/evolution';
import { Observation } from '../../types/meaning';

const MIN_EVENTS_TO_SPEAK = 3;

export const MeaningEngine = {
  /**
   * Analisa eventos de prática brutos e retorna frases observacionais neutras.
   * Regra de Ouro: Nunca afirma quem o usuário é. Descreve o que observou.
   */
  interpret(events: ZenEvent[], chapter: Chapter): Observation[] {
    const observations: Observation[] = [];
    
    // Filtra apenas eventos de prática deste capítulo
    const practiceEvents = events.filter(
      (e) => e.type === 'practice' && e.data?.chapterId === chapter.id
    );

    const evidenceCount = practiceEvents.length;

    // Regra de silêncio: dado insuficiente não vira afirmação
    if (evidenceCount < MIN_EVENTS_TO_SPEAK) {
      return observations;
    }

    // Ordena por data (mais antigo para mais recente)
    const sortedEvents = [...practiceEvents].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const eventIds = sortedEvents.map(e => e.id);
    const now = new Date().toISOString();

    // 1. Padrão: Frequência (Quantidade total)
    observations.push({
      id: `obs-freq-${chapter.id}-${Date.now()}`,
      chapterId: chapter.id,
      generatedAt: now,
      text: `Nos últimos dias, você registrou ${evidenceCount} oportunidades de praticar.`,
      epistemicStatus: 'observed',
      supportingEventIds: eventIds,
      window: 'chapter',
      evidenceCount,
    });

    // 2. Padrão: Gap Médio (Intervalo médio entre práticas)
    if (evidenceCount > 1) {
      let totalGapMs = 0;
      for (let i = 1; i < sortedEvents.length; i++) {
        const prev = new Date(sortedEvents[i - 1].timestamp).getTime();
        const curr = new Date(sortedEvents[i].timestamp).getTime();
        totalGapMs += (curr - prev);
      }
      const avgGapMs = totalGapMs / (evidenceCount - 1);
      const avgGapDays = Math.max(1, Math.round(avgGapMs / (1000 * 60 * 60 * 24)));
      
      observations.push({
        id: `obs-gap-${chapter.id}-${Date.now()}`,
        chapterId: chapter.id,
        generatedAt: now,
        text: `O intervalo médio entre suas práticas foi de ${avgGapDays} dia(s).`,
        epistemicStatus: 'observed',
        supportingEventIds: eventIds,
        window: 'chapter',
        evidenceCount,
      });
    }

    // 3. Padrão: Distribuição por período do dia
    let morning = 0, afternoon = 0, evening = 0;
    sortedEvents.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      if (hour >= 5 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else evening++;
    });

    let period = 'à noite';
    if (morning > afternoon && morning > evening) period = 'de manhã';
    else if (afternoon > morning && afternoon > evening) period = 'à tarde';

    observations.push({
      id: `obs-dist-${chapter.id}-${Date.now()}`,
      chapterId: chapter.id,
      generatedAt: now,
      text: `A maioria das suas práticas aconteceu ${period}.`,
      epistemicStatus: 'observed',
      supportingEventIds: eventIds,
      window: 'chapter',
      evidenceCount,
    });

    return observations;
  }
  /**
   * Analisa eventos cruzados de Evolução + Nutriming para gerar observações interpretativas.
   * Regra de Ouro: Correlação não é causalidade. EpistemicStatus sempre 'interpretive'.
   */
  interpretCrossData(
    evolutionEvents: ZenEvent[],
    nutrimingEvents: ZenEvent[],
    chapter: Chapter
  ): Observation[] {
    const observations: Observation[] = [];
    const now = new Date().toISOString();

    const practiceEvents = evolutionEvents.filter(e => e.type === 'practice' && e.data?.chapterId === chapter.id);
    const choiceEvents = evolutionEvents.filter(e => e.type === 'choice' && e.data?.chapterId === chapter.id);

    // Regra de silêncio: precisamos de dados suficientes em AMBOS os domínios
    if (practiceEvents.length < MIN_EVENTS_TO_SPEAK || nutrimingEvents.length < MIN_EVENTS_TO_SPEAK) {
      return observations;
    }

    const allEvolutionIds = [...practiceEvents, ...choiceEvents].map(e => e.id);

    // Padrão Cruzado 1: Práticas e emoções no mesmo dia
    const emotionEvents = nutrimingEvents.filter(e => e.type === 'emotion');
    if (emotionEvents.length >= MIN_EVENTS_TO_SPEAK) {
      const practiceDays = new Set(practiceEvents.map(e => new Date(e.timestamp).toDateString()));
      const emotionDays = new Set(emotionEvents.map(e => new Date(e.timestamp).toDateString()));
      const overlap = [...practiceDays].filter(d => emotionDays.has(d)).length;
      const overlapRate = Math.round((overlap / practiceDays.size) * 100);

      if (overlap >= MIN_EVENTS_TO_SPEAK) {
        observations.push({
          id: `obs-cross-emo-${chapter.id}-${Date.now()}`,
          chapterId: chapter.id,
          generatedAt: now,
          text: `Em ${overlapRate}% dos dias em que você praticou, também registrou check-ins de emoção.`,
          epistemicStatus: 'interpretive', // Correlação, não causalidade
          supportingEventIds: allEvolutionIds,
          window: 'chapter',
          evidenceCount: overlap,
        });
      }
    }

    // Padrão Cruzado 2: Escolhas conscientes e check-ins alimentares
    const foodEvents = nutrimingEvents.filter(e => e.type === 'food');
    if (choiceEvents.length >= MIN_EVENTS_TO_SPEAK && foodEvents.length >= MIN_EVENTS_TO_SPEAK) {
      const choiceDays = new Set(choiceEvents.map(e => new Date(e.timestamp).toDateString()));
      const foodDays = new Set(foodEvents.map(e => new Date(e.timestamp).toDateString()));
      const overlap = [...choiceDays].filter(d => foodDays.has(d)).length;

      if (overlap >= MIN_EVENTS_TO_SPEAK) {
        observations.push({
          id: `obs-cross-food-${chapter.id}-${Date.now()}`,
          chapterId: chapter.id,
          generatedAt: now,
          text: `Nos dias em que você registrou momentos de escolha consciente, você também fez check-ins alimentares.`,
          epistemicStatus: 'interpretive', // Correlação observada, não confirmada
          supportingEventIds: allEvolutionIds,
          window: 'chapter',
          evidenceCount: overlap,
        });
      }
    }

    return observations;
  }

};
