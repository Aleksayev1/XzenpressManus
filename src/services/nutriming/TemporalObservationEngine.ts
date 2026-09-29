import { ZenEvent, PatternEventData, MicroObservation } from '../../types/nutriming';
import { DoNothingEngine } from './DoNothingEngine';

export class TemporalObservationEngine {
  
  /**
   * Procura associações temporais e aplica o DoNothingEngine como PORTEIRO.
   */
  public static analyzeAndExtractPatterns(
    events: ZenEvent[],
    microObservations?: MicroObservation[]
  ): PatternEventData[] {
    const rawPatterns = this.detectRawPatterns(events, microObservations);
    const validPatterns: PatternEventData[] = [];

    for (const pattern of rawPatterns) {
      // 1. RUNTIME SAFETY: Bloqueio agressivo contra causalidade.
      // Se qualquer parte do código injetou true, a aplicação quebra propositalmente.
      if (pattern.causalClaim !== false) {
        throw new Error('RUNTIME SAFETY ALERT: Causal claims are strictly forbidden in Nutriming. A pattern attempted to declare causality.');
      }

      // 2. O PORTEIRO: DoNothingEngine avalia se este padrão merece ser exibido
      const enoughData = pattern.frequency >= 2 && pattern.dataQuality >= 0.5;
      const relevant = pattern.recurrenceRate >= 0.6; // Mais de 60% de recorrência
      
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
   * Detecção matemática de padrões cruzando refeições e respostas pós-prandiais de 2h.
   */
  private static detectRawPatterns(
    events: ZenEvent[],
    microObservations?: MicroObservation[]
  ): PatternEventData[] {
    if (events.length === 0) return [];

    // Se temos micro-observações reais, cruzar por id de refeição
    if (microObservations && microObservations.length > 0) {
      const fatigueOrBloatCount = microObservations.filter(
        o => o.check.belly === 'bloated' || o.check.belly === 'heavy' || o.check.energy === 'down'
      ).length;

      const recurrence = fatigueOrBloatCount / microObservations.length;

      if (fatigueOrBloatCount >= 2 && recurrence >= 0.5) {
        return [{
          patternId: `pattern-temporal-somatic-${Date.now()}`,
          observations: microObservations.map(m => m.id),
          frequency: microObservations.length,
          recurrenceRate: recurrence,
          temporalWindow: {
            afterMinutes: 120
          },
          confidence: Math.min(0.92, 0.65 + fatigueOrBloatCount * 0.1),
          dataQuality: 0.85,
          confounders: ['qualidade_do_sono', 'estresse_no_trabalho', 'ritmo_de_mastigacao'],
          causalClaim: false, // Regra inegociável do XZenpress
          status: recurrence > 0.8 ? 'recurrent' : 'emerging'
        }];
      }
      return [];
    }

    // Se não há micro-observações mas há eventos suficientes
    if (events.length >= 3) {
      return [{
        patternId: `pattern-${Date.now()}`,
        observations: events.map(e => e.id),
        frequency: events.length,
        recurrenceRate: 1.0,
        temporalWindow: {
          afterMinutes: 120
        },
        confidence: 0.85, 
        dataQuality: 0.8,
        confounders: ['sleep_variation', 'stress_variation'],
        causalClaim: false,
        status: 'recurrent'
      }];
    }

    return [];
  }
}

