import { FoodProduct, FoodProfile, DataOrigin } from '../../types/nutriming';
import { MtcFoodClassifier } from './mtcFoodClassifier';

export class FoodNormalizer {
  /**
   * Converte o payload cru do Open Food Facts para FoodProduct tipado e seguro.
   */
  public static normalizeOpenFoodFacts(raw: Record<string, any>, barcode: string): FoodProduct {
    const nutriments = raw.nutriments || {};
    const novaGroup = (raw.nova_group >= 1 && raw.nova_group <= 4) ? (raw.nova_group as 1 | 2 | 3 | 4) : undefined;

    // Alérgenos declarados
    const allergens: string[] = (raw.allergens_tags || [])
      .map((tag: string) => tag.replace(/^[a-z]{2}:/, '').toLowerCase().trim())
      .filter(Boolean);

    const traces: string[] = (raw.traces_tags || [])
      .map((tag: string) => tag.replace(/^[a-z]{2}:/, '').toLowerCase().trim())
      .filter(Boolean);

    // Aditivos
    const additives = (raw.additives_tags || []).map((tag: string) => {
      const code = tag.replace(/^[a-z]{2}:/, '').toUpperCase();
      return {
        code,
        name: code
      };
    });

    const warnings: FoodProduct['warnings'] = [];

    if (novaGroup === 4) {
      warnings.push({
        type: 'ultraprocessed',
        severity: 'caution',
        message: 'Alimento ultraprocessado (NOVA 4) com aditivos industriais.'
      });
    }

    if (nutriments.sugars_100g && nutriments.sugars_100g > 15) {
      warnings.push({
        type: 'high_sugar',
        severity: 'info',
        message: `Alto teor de açúcares (${nutriments.sugars_100g.toFixed(1)}g / 100g).`
      });
    }

    if (nutriments.sodium_100g && nutriments.sodium_100g > 0.6) {
      warnings.push({
        type: 'high_sodium',
        severity: 'info',
        message: `Alto teor de sódio (${(nutriments.sodium_100g * 1000).toFixed(0)}mg / 100g).`
      });
    }

    if (allergens.length > 0) {
      warnings.push({
        type: 'allergen',
        severity: 'caution',
        message: `Contém alérgenos declarados: ${allergens.join(', ')}.`
      });
    }

    const name = raw.product_name_pt || raw.product_name || 'Produto sem nome';
    const brand = raw.brands || undefined;
    const imageUrl = raw.image_front_url || raw.image_url || undefined;

    return {
      id: barcode || `off_${Date.now()}`,
      barcode,
      name,
      brand,
      imageUrl,
      source: {
        provider: 'open_food_facts',
        externalId: barcode,
        fetchedAt: new Date().toISOString(),
        completeness: raw.completeness || 0.7,
        origin: 'barcode_verified'
      },
      labelFacts: {
        ingredientsText: raw.ingredients_text_pt || raw.ingredients_text || undefined,
        allergens,
        traces,
        novaGroup,
        nutritionPer100g: {
          energyKcal: nutriments['energy-kcal_100g'] || nutriments.energy_100g ? Math.round((nutriments['energy-kcal_100g'] || nutriments.energy_100g / 4.184)) : undefined,
          carbs: nutriments.carbohydrates_100g,
          sugars: nutriments.sugars_100g,
          fat: nutriments.fat_100g,
          saturatedFat: nutriments['saturated-fat_100g'],
          protein: nutriments.proteins_100g,
          fiber: nutriments.fiber_100g,
          sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : undefined
        },
        additives
      },
      warnings
    };
  }

  /**
   * Converte um FoodProduct normalizado em um FoodProfile para o FoodStateEngine.
   */
  public static toFoodProfile(product: FoodProduct): FoodProfile {
    const mtcBase = MtcFoodClassifier.classify(product.name);

    return {
      id: product.id,
      name: product.name,
      western: {
        nova: product.labelFacts.novaGroup,
        allergens: product.labelFacts.allergens,
        additives: product.labelFacts.additives?.map(a => a.name),
        sugarG: product.labelFacts.nutritionPer100g?.sugars,
        sodiumMg: product.labelFacts.nutritionPer100g?.sodium,
        caffeineMg: product.name.toLowerCase().includes('café') ? 95 : undefined
      },
      tcm: {
        thermalNature: mtcBase.tcm.thermalNature,
        flavors: mtcBase.tcm.flavors,
        qiDynamics: mtcBase.tcm.qiDynamics,
        cautions: mtcBase.tcm.cautions,
        organAffinity: mtcBase.tcm.organAffinity
      }
    };
  }
}
