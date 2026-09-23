import { FoodProfile, ThermalNature, Flavor } from '../../types/nutriming';
import { FOUNDATIONAL_MTC_FOODS, FLAVOR_ACTION_MAP } from './mtcFoodDatabase';

export class MtcFoodClassifier {
  /**
   * Classifica um alimento por nome ou busca na base MTC fundacional.
   */
  public static classify(foodName: string): FoodProfile {
    const normalized = foodName.toLowerCase().trim();

    // 1. Match direto por chave
    if (FOUNDATIONAL_MTC_FOODS[normalized]) {
      return FOUNDATIONAL_MTC_FOODS[normalized];
    }

    // 2. Match por substring inteligente
    if (normalized.includes('café') || normalized.includes('coffee') || normalized.includes('espresso') || normalized.includes('cappuccino')) {
      return { ...FOUNDATIONAL_MTC_FOODS.cafe, name: foodName };
    }
    if (normalized.includes('ginseng')) {
      return { ...FOUNDATIONAL_MTC_FOODS.ginseng, name: foodName };
    }
    if (normalized.includes('gengibre') || normalized.includes('ginger')) {
      return { ...FOUNDATIONAL_MTC_FOODS.gengibre, name: foodName };
    }
    if (normalized.includes('pimenta') || normalized.includes('chili') || normalized.includes('pepper') || normalized.includes('jalapeno')) {
      return { ...FOUNDATIONAL_MTC_FOODS.pimenta, name: foodName };
    }
    if (normalized.includes('canela') || normalized.includes('cinnamon')) {
      return { ...FOUNDATIONAL_MTC_FOODS.canela, name: foodName };
    }
    if (normalized.includes('carne') || normalized.includes('bife') || normalized.includes('hambúrguer') || normalized.includes('churrasco')) {
      return { ...FOUNDATIONAL_MTC_FOODS.carne_vermelha, name: foodName };
    }
    if (normalized.includes('cerveja') || normalized.includes('vinho') || normalized.includes('vodka') || normalized.includes('whisky') || normalized.includes('álcool')) {
      return { ...FOUNDATIONAL_MTC_FOODS.alcool, name: foodName };
    }
    if (normalized.includes('salada') || normalized.includes('alface') || normalized.includes('rúcula') || normalized.includes('agrião')) {
      return { ...FOUNDATIONAL_MTC_FOODS.salada_crua, name: foodName };
    }
    if (normalized.includes('melancia') || normalized.includes('melon')) {
      return { ...FOUNDATIONAL_MTC_FOODS.melancia, name: foodName };
    }
    if (normalized.includes('açaí') || normalized.includes('acai')) {
      return { ...FOUNDATIONAL_MTC_FOODS.acai_congelado, name: foodName };
    }
    if (normalized.includes('pepino')) {
      return { ...FOUNDATIONAL_MTC_FOODS.pepino, name: foodName };
    }
    if (normalized.includes('hortelã') || normalized.includes('menta')) {
      return { ...FOUNDATIONAL_MTC_FOODS.hortela, name: foodName };
    }
    if (normalized.includes('leite') || normalized.includes('queijo') || normalized.includes('iogurte')) {
      return { ...FOUNDATIONAL_MTC_FOODS.leite, name: foodName };
    }
    if (normalized.includes('refrigerante') || normalized.includes('coca') || normalized.includes('pepsi') || normalized.includes('guaraná')) {
      return { ...FOUNDATIONAL_MTC_FOODS.refrigerante_gelado, name: foodName };
    }
    if (normalized.includes('arroz') || normalized.includes('rice')) {
      return { ...FOUNDATIONAL_MTC_FOODS.arroz, name: foodName };
    }
    if (normalized.includes('feijão') || normalized.includes('feijao') || normalized.includes('beans') || normalized.includes('lentilha')) {
      return { ...FOUNDATIONAL_MTC_FOODS.feijao, name: foodName };
    }
    if (normalized.includes('maçã') || normalized.includes('maca') || normalized.includes('apple')) {
      return { ...FOUNDATIONAL_MTC_FOODS.maca, name: foodName };
    }
    if (normalized.includes('cenoura') || normalized.includes('carrot')) {
      return { ...FOUNDATIONAL_MTC_FOODS.cenoura, name: foodName };
    }
    if (normalized.includes('sopa') || normalized.includes('caldo') || normalized.includes('canja')) {
      return { ...FOUNDATIONAL_MTC_FOODS.sopa_legumes, name: foodName };
    }
    if (normalized.includes('frango') || normalized.includes('chicken') || normalized.includes('ave')) {
      return { ...FOUNDATIONAL_MTC_FOODS.frango, name: foodName };
    }
    if (normalized.includes('banana')) {
      return { ...FOUNDATIONAL_MTC_FOODS.banana, name: foodName };
    }

    // 3. Fallback inteligente neutro / harmonizador
    return {
      id: `custom_${Date.now()}`,
      name: foodName,
      tcm: {
        thermalNature: 'neutral',
        flavors: ['sweet'],
        qiDynamics: ['Alimento de natureza suave ou mista', 'Nutre o centro digestivo'],
        organAffinity: ['Baço', 'Estômago'],
        cautions: []
      }
    };
  }

  /**
   * Obtém os verbos de ação para os sabores do alimento.
   */
  public static getFlavorActions(flavors: Flavor[]) {
    return flavors.map(flavor => ({
      flavor,
      actionVerb: FLAVOR_ACTION_MAP[flavor]?.actionVerb || 'Harmonizar',
      meaning: FLAVOR_ACTION_MAP[flavor]?.meaning || ''
    }));
  }
}
