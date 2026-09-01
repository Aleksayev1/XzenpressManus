import { ChapterWithLogs, EvolutionObservation, EvolutionEvidenceStrength } from '../../types/evolution';

const MIN_CHAPTERS_TO_INTERPRET = 2;
const MIN_LOGS_FOR_OUTCOME_CHANGE = 3;
const MIN_OUTCOME_DELTA = 0.20; // 20%
const MIN_CHOICES_FOR_PATTERN = 2; // mínimo de ChoiceRecords por capítulo para inferir padrão

export const EvolutionMirrorEngine = {
  /**
   * O motor longitudinal. Totalmente determinístico. Zero LLM.
   * Só recebe capítulos com dados já normalizados, evitando acessar o banco.
   */
  analyzeLongitudinal(userId: string, dataset: ChapterWithLogs[]): EvolutionObservation[] {
    const observations: EvolutionObservation[] = [];
    
    // 1. Regra de Elegibilidade: Somente capítulos fechados ou concluídos.
    const eligibleChapters = dataset.filter(d => 
      d.chapter.status === 'completed' || d.chapter.status === 'paused'
    );

    if (eligibleChapters.length < MIN_CHAPTERS_TO_INTERPRET) {
      return observations; // Silêncio epistemológico
    }

    const strength = this.calculateStrength(eligibleChapters.length);

    // 2. Detectores Independentes
    
    // A. Recorrência de Microcomportamento
    const microBehaviorRecurrence = this.detectMicroBehaviorRecurrence(userId, eligibleChapters, strength);
    if (microBehaviorRecurrence) observations.push(microBehaviorRecurrence);

    // B. Mudança de Outcome (Proporção de completed/skipped)
    const outcomeChange = this.detectOutcomeChange(userId, eligibleChapters, strength);
    if (outcomeChange) observations.push(outcomeChange);

    // C. Mudança de Padrão de Consciência (Choice Records)
    const choicePatternChange = this.detectChoicePatternChange(userId, eligibleChapters, strength);
    if (choicePatternChange) observations.push(choicePatternChange);

    // D. Recorrência de Gatilho (Trigger)
    const triggerRecurrence = this.detectTriggerRecurrence(userId, eligibleChapters, strength);
    if (triggerRecurrence) observations.push(triggerRecurrence);

    return observations;
  },

  calculateStrength(chapterCount: number): EvolutionEvidenceStrength {
    if (chapterCount < 2) return 'low'; // Nunca deveria chegar aqui por causa do filtro
    if (chapterCount === 2) return 'moderate';
    return 'high';
  },

  detectMicroBehaviorRecurrence(userId: string, chapters: ChapterWithLogs[], strength: EvolutionEvidenceStrength): EvolutionObservation | null {
    // Somente capítulos com evidência comportamental real (não apenas intenção declarada)
    const practiceChapters = chapters.filter(c => c.logs.length > 0);
    if (practiceChapters.length < 2) return null;

    const behaviorCounts: Record<string, { count: number, evidence: any[] }> = {};

    practiceChapters.forEach(c => {
      const mbId = c.chapter.microBehaviorId;
      if (!behaviorCounts[mbId]) {
        behaviorCounts[mbId] = { count: 0, evidence: [] };
      }
      behaviorCounts[mbId].count++;
      behaviorCounts[mbId].evidence.push({
        chapterId: c.chapter.id,
        eventIds: [] // Aqui poderíamos colocar IDs dos logs de criação, mas para nível capítulo vazio deixamos array vazio
      });
    });

    // Encontra o mais frequente que bateu o mínimo
    for (const [mbId, data] of Object.entries(behaviorCounts)) {
      if (data.count >= MIN_CHAPTERS_TO_INTERPRET) {
        return {
          id: `evo-mbr-${Date.now()}`,
          userId,
          observationType: 'recurrence',
          domain: 'practice',
          text: `Você focou no mesmo microcomportamento em ${data.count} capítulos diferentes.`,
          epistemicStatus: 'observed',
          evidenceStrength: strength,
          evidence: data.evidence,
          chapterCount: data.count,
          structuredPattern: { pattern: 'microbehavior_recurrence', microBehaviorId: mbId },
          createdAt: new Date().toISOString()
        };
      }
    }

    return null;
  },

  detectOutcomeChange(userId: string, chapters: ChapterWithLogs[], strength: EvolutionEvidenceStrength): EvolutionObservation | null {
    // Precisamos de pelo menos 2 capítulos do MESMO microcomportamento para comparar variação, ou olhamos geral?
    // Vamos olhar o mais recente contra o anterior, se tiverem amostragem suficiente.
    if (chapters.length < 2) return null;

    // Pega os dois últimos
    const sorted = [...chapters].sort((a, b) => new Date(a.chapter.startedAt).getTime() - new Date(b.chapter.startedAt).getTime());
    const c1 = sorted[sorted.length - 2];
    const c2 = sorted[sorted.length - 1];

    // Só faz sentido comparar taxas do mesmo microcomportamento
    if (c1.chapter.microBehaviorId !== c2.chapter.microBehaviorId) {
      return null; // Comportamentos diferentes — sem base para comparar proporções
    }

    if (c1.logs.length < MIN_LOGS_FOR_OUTCOME_CHANGE || c2.logs.length < MIN_LOGS_FOR_OUTCOME_CHANGE) {
      return null; // Amostra muito pequena
    }

    const c1Completed = c1.logs.filter(l => l.outcome === 'completed').length / c1.logs.length;
    const c2Completed = c2.logs.filter(l => l.outcome === 'completed').length / c2.logs.length;

    const delta = c2Completed - c1Completed;

    if (Math.abs(delta) >= MIN_OUTCOME_DELTA) {
      const direction = delta > 0 ? 'aumentou' : 'diminuiu';
      return {
        id: `evo-outc-${Date.now()}`,
        userId,
        observationType: 'change',
        domain: 'practice',
        text: `A proporção de práticas completadas ${direction} significativamente no capítulo mais recente comparado ao anterior.`,
        epistemicStatus: 'observed',
        evidenceStrength: strength,
        evidence: [
          { chapterId: c1.chapter.id, eventIds: c1.logs.map(l => l.id) },
          { chapterId: c2.chapter.id, eventIds: c2.logs.map(l => l.id) }
        ],
        chapterCount: 2,
        structuredPattern: { pattern: 'outcome_change', delta, c1Completed, c2Completed },
        createdAt: new Date().toISOString()
      };
    }

    return null;
  },

  detectChoicePatternChange(userId: string, chapters: ChapterWithLogs[], strength: EvolutionEvidenceStrength): EvolutionObservation | null {
    // Procura por evidência de que a pessoa passou a agir consciente onde antes agia no automático
    if (chapters.length < 2) return null;

    const sorted = [...chapters].sort((a, b) => new Date(a.chapter.startedAt).getTime() - new Date(b.chapter.startedAt).getTime());
    const c1 = sorted[sorted.length - 2];
    const c2 = sorted[sorted.length - 1];

    // Amostragem mínima por capítulo antes de inferir qualquer padrão
    if (c1.choices.length < MIN_CHOICES_FOR_PATTERN || c2.choices.length < MIN_CHOICES_FOR_PATTERN) {
      return null; // Evidência insuficiente
    }

    const c1Auto = c1.choices.filter(c => c.choiceOutcome === 'continued_automatic').length;
    const c2Conscious = c2.choices.filter(c => c.choiceOutcome === 'acted_consciously').length;

    // Se no capítulo 1 houve resposta automática, e no 2 houve resposta consciente (sinal claro)
    // e o mesmo microcomportamento foi o foco dos dois capítulos
    if (c1Auto >= 1 && c2Conscious >= 1 && c1.chapter.microBehaviorId === c2.chapter.microBehaviorId) {
       return {
        id: `evo-cpc-${Date.now()}`,
        userId,
        observationType: 'change',
        domain: 'choice',
        text: `No capítulo mais recente, apareceram registros de ação consciente em situações onde respostas automáticas foram relatadas anteriormente.`,
        epistemicStatus: 'observed',
        evidenceStrength: strength,
        evidence: [
          { chapterId: c1.chapter.id, eventIds: c1.choices.filter(c => c.choiceOutcome === 'continued_automatic').map(c => c.id) },
          { chapterId: c2.chapter.id, eventIds: c2.choices.filter(c => c.choiceOutcome === 'acted_consciously').map(c => c.id) }
        ],
        chapterCount: 2,
        structuredPattern: { pattern: 'choice_pattern_change' },
        createdAt: new Date().toISOString()
      };
    }

    return null;
  },

  detectTriggerRecurrence(userId: string, chapters: ChapterWithLogs[], strength: EvolutionEvidenceStrength): EvolutionObservation | null {
    const triggerCounts: Record<string, { count: number, evidence: any[] }> = {};

    chapters.forEach(c => {
      // Usamos um set local para não contar o mesmo gatilho duas vezes no mesmo capítulo (queremos recorrência entre capítulos)
      const chapterTriggers = new Set<string>();
      
      c.choices.forEach(choice => {
        if (choice.trigger) {
          const t = choice.trigger.trim().toLowerCase();
          if (t && !chapterTriggers.has(t)) {
            chapterTriggers.add(t);
            if (!triggerCounts[t]) {
              triggerCounts[t] = { count: 0, evidence: [] };
            }
            triggerCounts[t].count++;
            triggerCounts[t].evidence.push({
              chapterId: c.chapter.id,
              eventIds: [choice.id]
            });
          } else if (t) {
            // Se já tem no capítulo, só adiciona a evidência
            const entry = triggerCounts[t].evidence.find(ev => ev.chapterId === c.chapter.id);
            if (entry) entry.eventIds.push(choice.id);
          }
        }
      });
    });

    for (const [t, data] of Object.entries(triggerCounts)) {
      if (data.count >= MIN_CHAPTERS_TO_INTERPRET) {
        return {
          id: `evo-trg-${Date.now()}`,
          userId,
          observationType: 'recurrence',
          domain: 'choice',
          text: `O mesmo gatilho quebra-padrão foi percebido em ${data.count} capítulos diferentes.`,
          epistemicStatus: 'observed',
          evidenceStrength: strength,
          evidence: data.evidence,
          chapterCount: data.count,
          structuredPattern: { pattern: 'trigger_recurrence', trigger: t },
          createdAt: new Date().toISOString()
        };
      }
    }

    return null;
  }
};
