import { PatternEventData } from '../../types/nutriming';

export class DoNothingEngine {
  /**
   * Avalia se devemos sugerir uma ação ou simplesmente ficar em silêncio (Wu Wei).
   * O aplicativo não deve virar um "papagaio" de intervenções.
   * 
   * @returns 'observe' (Ficar quieto) ou 'suggest' (Falar algo)
   */
  public static evaluateAction(
    pattern: PatternEventData | null, 
    enoughData: boolean, 
    relevant: boolean, 
    safeLowRiskAction: boolean
  ): 'observe' | 'suggest' {
    
    // 1. Faltam dados no usuário (ex: Registrou 2 dias apenas)? Silêncio.
    if (!enoughData) {
      return 'observe';
    }

    // 2. Não há nenhum padrão recorrente ou claro? Silêncio.
    if (!pattern || pattern.status === 'insufficient-data') {
      return 'observe';
    }

    // 3. O padrão é relevante para a saúde/conforto da pessoa no momento? Se não, Silêncio.
    if (!relevant) {
      return 'observe';
    }

    // 4. A ação (Acupressão/Áudio) é segura e de baixo risco? Se for invasiva (ex: Jejum), Silêncio.
    if (!safeLowRiskAction) {
      return 'observe';
    }

    // 5. Se passou por todos os filtros de cautela, só então SUGERIMOS.
    return 'suggest';
  }
}
