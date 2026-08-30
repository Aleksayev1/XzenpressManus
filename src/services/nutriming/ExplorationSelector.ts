import { PatternEventData, ExplorationOption } from '../../types/nutriming';

/**
 * ExplorationSelector (Substitui o antigo InterventionEngine)
 * A arquitetura foi ajustada para que o software NÃO FAÇA prescrições
 * ("Seu padrão exige Zusanli"), mas sim ofereça opções de EXPLORAÇÃO (low-risk-wellness)
 * baseadas no estado da arte de autogerenciamento (N-of-1).
 */
export class ExplorationSelector {
  
  /**
   * Retorna opções curadas de baixo risco baseadas no padrão.
   * Se nenhuma se aplicar ou se o padrão for inconclusivo, retorna vazio.
   */
  public static getOptions(pattern: PatternEventData): ExplorationOption[] {
    // Na V1, a IA ajuda na linguagem, mas a seleção de opções é determinística.
    // Exemplo: se o padrão está associado a queda de energia pós-prandial
    
    // Regra Determinística 1: Segurança sempre.
    if (pattern.causalClaim !== false) {
      return []; // Proteção extra: se causalidade foi corrompida, não sugira nada.
    }

    const options: ExplorationOption[] = [];

    // Opção 1: Respiração guiada (Baixíssimo risco, foco no sistema nervoso autônomo)
    options.push({
      id: 'exp-breath-478',
      type: 'breathing',
      title: 'Respiração 4-7-8 (2 minutos)',
      durationMinutes: 2,
      source: 'xzenpress-library',
      safetyClass: 'low-risk-wellness',
      requiresProfessionalReview: false,
      enabled: true
    });

    // Opção 2: Exploração de Acupressão como educação/tradição
    // Nota: Apresentada de forma neutra ("Exploração de tradição"), não como cura.
    options.push({
      id: 'exp-acu-st36',
      type: 'acupressure',
      title: 'Educação Tradicional: Ponto Zu San Li (E36)',
      durationMinutes: 3,
      source: 'traditional-reference',
      safetyClass: 'low-risk-wellness',
      requiresProfessionalReview: false,
      enabled: true
    });

    return options;
  }
}
