import { FoodProduct, AllergenNotice } from '../../types/nutriming';

export class AllergenGuard {
  public static readonly DISCLAIMER = 
    'Aviso de Segurança: Os dados de alérgenos baseiam-se na declaração de rotulagem do fabricante e base Open Food Facts. Em caso de alergias severas (como anafilaxia ou doença celíaca estrita), sempre verifique a embalagem física antes do consumo.';

  /**
   * Avalia alérgenos e gera o parecer de segurança determinístico.
   */
  public static evaluateAllergens(product: FoodProduct, userSensitivities: string[] = []): AllergenNotice {
    const detected: string[] = [];
    const traces: string[] = [];

    const labelAllergens = product.labelFacts.allergens || [];
    const labelTraces = product.labelFacts.traces || [];

    // Checar cruzamento com sensibilidades do usuário
    userSensitivities.forEach(sensitivity => {
      const s = sensitivity.toLowerCase();
      if (labelAllergens.some(a => a.includes(s))) {
        detected.push(sensitivity);
      }
      if (labelTraces.some(t => t.includes(s))) {
        traces.push(sensitivity);
      }
    });

    return {
      detected: detected.length > 0 ? detected : labelAllergens,
      traces: traces.length > 0 ? traces : labelTraces,
      source: product.source.origin,
      verifiedAgainstLabel: product.source.origin === 'barcode_verified',
      safetyDisclaimer: this.DISCLAIMER
    };
  }
}
