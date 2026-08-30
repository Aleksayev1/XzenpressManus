import { ZenEvent, PatternEventData } from '../../types/nutriming';
import { DoNothingEngine } from './DoNothingEngine';

export class TemporalObservationEngine {
  
  /**
   * Procura associações temporais e aplica o DoNothingEngine como PORTEIRO.
   */
  public static analyzeAndExtractPatterns(events: ZenEvent[]): PatternEventData[] {
    const rawPatterns = this.detectRawPatterns(events);
    const validPatterns: PatternEventData[] = [];

    for (const pattern of rawPatterns) {
      // 1. RUNTIME SAFETY: Bloqueio agressivo contra causalidade.
      // Se qualquer parte do código injetou true, a aplicação quebra propositalmente.
      if (pattern.causalClaim !== false) {
        throw new Error('RUNTIME SAFETY ALERT: Causal claims are strictly forbidden in Nutriming. A pattern attempted to declare causality.');
      }

      // 2. O PORTEIRO: DoNothingEngine avalia se este padrão merece ser exibido
      // Para demonstração da Sprint 2 (MVP "3 cafés"), permitimos que 3 passe, 
      // mas na vida real o motor vai exigir mais volume e dados.
      const enoughData = pattern.frequency >= 3 && pattern.dataQuality > 0.5;
      const relevant = pattern.recurrenceRate > 0.7; // Mais de 70% de recorrência
      
      const actionDecision = DoNothingEngine.evaluateAction(
        pattern,
        enoughData,
        relevant,
        true // Ação segura (apenas um insight observacional)
      );

      // 3. Se o DoNothingEngine disser 'suggest', nós emitimos o padrão como Insight.
      // Se disser 'observe', o padrão é descartado/ocultado do usuário.
      if (actionDecision === 'suggest') {
        validPatterns.push(pattern);
      } else {
        console.log(`[DoNothingEngine] Padrão ${pattern.patternId} barrado. Motivo: Observe e aguarde.`);
      }
    }

    return validPatterns;
  }

  /**
   * Detecção "crua" matemática dos padrões.
   * Mock da Sprint 2: Simulando que a IA encontrou a relação "Café -> Cansaço".
   */
  private static detectRawPatterns(events: ZenEvent[]): PatternEventData[] {
    if (events.length === 0) return [];

    return [{
      patternId: `pattern-${Date.now()}`,
      observations: events.map(e => e.id),
      frequency: events.length,
      recurrenceRate: 1.0, // 3 refeições -> 3 checkins = 100% de match simulado
      temporalWindow: {
        afterMinutes: 120
      },
      confidence: 0.85, 
      dataQuality: 0.8, // Nova métrica exigida pela Sprint 2
      confounders: ['sleep_variation', 'stress_variation'], // Evita viés de certeza
      causalClaim: false, // OBRIGATÓRIO SER FALSE
      status: 'recurrent'
    }];
  }
}
