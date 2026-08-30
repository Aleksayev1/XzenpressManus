import { FoodEventData } from '../../types/nutriming';

export class ObservationConfidenceEngine {
  /**
   * Avalia a confiança de um registro alimentar com base em como foi coletado
   * e quão detalhados são os dados.
   * Não estamos interessados em 100% de precisão de gramas,
   * mas sim se o evento reflete a realidade da pessoa.
   */
  public static calculateConfidence(foodData: FoodEventData, source: string): number {
    let confidence = 0.5; // Base confidence

    // Se o usuário tirou foto ou escaneou, é mais confiável que memória falha
    if (source === 'device' || source === 'ai') {
      confidence += 0.2;
    } else if (source === 'user') {
      // Se foi manual, depende da completude
      if (!foodData.estimatedPortion) {
        confidence += 0.1; 
      }
    }

    // Se possui contexto associado (horário, emoção), aumenta a validade do "estado"
    if (foodData.context && Object.keys(foodData.context).length > 0) {
      confidence += 0.1;
    }

    // Se tem processamento classificado (NOVA)
    const hasClassification = foodData.foods.some(f => !!f.classification?.novaGroup);
    if (hasClassification) {
      confidence += 0.1;
    }

    // Teto de 1.0
    return Math.min(confidence, 1.0);
  }
}
