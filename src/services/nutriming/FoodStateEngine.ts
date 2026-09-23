import { 
  FoodStateInput, 
  FoodStateResult, 
  ThermalNature, 
  Flavor, 
  MealContext 
} from '../../types/nutriming';
import { MtcFoodClassifier } from './mtcFoodClassifier';

export class FoodStateEngine {
  /**
   * Avalia deterministicamente o encontro entre Alimento + Refeição + Estado + Tratamento.
   * Executa em < 5ms sem rede e sem chamadas lentas de IA.
   */
  public static evaluate(input: FoodStateInput): FoodStateResult {
    const { food, meal, userState, treatment } = input;

    // ── 1. MODIFICADORES DE PREPARO / REFEIÇÃO NA NATUREZA TÉRMICA ──
    const effectiveThermal = this.calculateEffectiveThermal(food.tcm.thermalNature, meal);

    // ── 2. TRILHA OCIDENTAL ──
    const westernBullets: string[] = [];
    let westernSeverity: FoodStateResult['western']['severity'] = 'ok';

    if (food.western?.nova === 4) {
      westernBullets.push('Alimento ultraprocessado (NOVA 4) com aditivos e refinamento.');
      westernSeverity = 'attention';
    }
    if (food.western?.caffeineMg && food.western.caffeineMg > 50) {
      westernBullets.push(`Contém estimulante: ~${food.western.caffeineMg}mg de cafeína.`);
      if (meal.moment === 'evening' || meal.moment === 'night') {
        westernBullets.push('Consumo noturno: alta probabilidade de atrasar a produção de melatonina.');
        westernSeverity = 'high_attention';
      }
    }
    if (food.western?.sugarG && food.western.sugarG > 15) {
      westernBullets.push(`Pico glicêmico rápido: ~${food.western.sugarG}g de açúcares.`);
      if (westernSeverity !== 'high_attention') westernSeverity = 'attention';
    }
    if (food.western?.sodiumMg && food.western.sodiumMg > 500) {
      westernBullets.push(`Teor expressivo de sódio: ~${food.western.sodiumMg}mg.`);
      if (westernSeverity !== 'high_attention') westernSeverity = 'attention';
    }
    if (westernBullets.length === 0) {
      westernBullets.push('Ingredientes simples ou in natura sem excessos de sódio ou açúcares.');
    }

    // ── 3. TRILHA MTC (DIREÇÃO E SABORES) ──
    const flavorActions = MtcFoodClassifier.getFlavorActions(food.tcm.flavors);
    
    // Análise de polaridade: Alimento aquece/move vs esfria/umecta
    const isFoodWarming = effectiveThermal === 'warm' || effectiveThermal === 'hot';
    const isFoodCooling = effectiveThermal === 'cold' || effectiveThermal === 'cool';

    const isUserHot = (userState.heat + userState.tension) >= 4;
    const isUserCold = (userState.cold + userState.qiDeficiency) >= 4;

    let tcmDirection: FoodStateResult['tcm']['direction'] = 'neutral';
    let thermalMatch = 'Harmonia neutra com o centro digestivo.';

    if (isFoodWarming && isUserHot) {
      tcmDirection = 'intensifies';
      thermalMatch = 'Natureza quente/ativadora em confronto com estado de calor e tensão.';
    } else if (isFoodCooling && isUserCold) {
      tcmDirection = 'intensifies';
      thermalMatch = 'Natureza fria/pesada pode apagar o fogo digestivo e aumentar a lentidão.';
    } else if (isFoodWarming && isUserCold) {
      tcmDirection = 'balances';
      thermalMatch = 'Natureza morna terapêutica: ajuda a aquecer o centro e tonificar o Qi.';
    } else if (isFoodCooling && isUserHot) {
      tcmDirection = 'balances';
      thermalMatch = 'Natureza fresca/refrigerante: ajuda a drenar o calor e acalmar o Shen.';
    }

    // ── 3.1 TRILHA AYURVÉDICA (DOSHAS, GUNAS, AGNI) ──
    let ayurvedaResult: FoodStateResult['ayurveda'] = undefined;
    if (food.ayurveda) {
      const gunaMeanings = {
        sattvic: 'Sáttvico: promove clareza mental, serenidade e equilíbrio emocional.',
        rajasic: 'Rajásico: ativador; move e aquece, mas pode gerar agitação e pressa mental.',
        tamasic: 'Tamásico: pesado e denso; tende a gerar letargia e lentidão digestiva.'
      };
      const v = food.ayurveda.doshaImpact.vata === 'aggravates' ? 'Agrava Vata (ansiedade/frio)' : 'Pacifica Vata';
      const p = food.ayurveda.doshaImpact.pitta === 'aggravates' ? 'Agrava Pitta (fogo/irritação)' : 'Pacifica Pitta';
      const k = food.ayurveda.doshaImpact.kapha === 'aggravates' ? 'Agrava Kapha (peso/umidade)' : 'Pacifica Kapha';

      ayurvedaResult = {
        guna: food.ayurveda.guna,
        gunaMeaning: gunaMeanings[food.ayurveda.guna],
        doshaSummary: `${v} · ${p} · ${k}`,
        agniSummary: food.ayurveda.agniEffect === 'kindles' 
          ? 'Acende o Agni (fogo digestivo)' 
          : food.ayurveda.agniEffect === 'smothers' 
          ? 'Pode apagar o Agni se consumido frio' 
          : 'Nutre e equilibra o Agni'
      };
    }

    // ── 4. CONFRONTO / SINERGIA COM O TRATAMENTO DO USUÁRIO ──
    let treatmentAlignment: FoodStateResult['treatmentAlignment'] = undefined;

    if (treatment && treatment.activeTreatments && treatment.activeTreatments.length > 0) {
      const activeDesc = treatment.activeTreatments.join(' ').toLowerCase();
      const hasInsomniaOrLiverHeat = activeDesc.includes('insônia') || activeDesc.includes('sono') || activeDesc.includes('ansiedade') || activeDesc.includes('fogo');
      const hasSpleenDeficiency = activeDesc.includes('baço') || activeDesc.includes('digest') || activeDesc.includes('cansaço') || activeDesc.includes('estufamento');

      if (hasInsomniaOrLiverHeat && (isFoodWarming || (food.western?.caffeineMg && food.western.caffeineMg > 30))) {
        treatmentAlignment = {
          status: 'conflict',
          badgeText: '⚠️ Confronto com seu Tratamento Atual',
          message: `Você está em protocolo para acalmar a mente (${treatment.activeTreatments[0]}). Este alimento é ativador e pode sabotar o relaxamento do seu sistema nervoso.`,
          recommendedPoints: ['F3', 'PC6']
        };
      } else if (hasSpleenDeficiency && isFoodCooling && meal.servingTemperature === 'cold') {
        treatmentAlignment = {
          status: 'conflict',
          badgeText: '⚠️ Esfria o Fogo Digestivo do seu Tratamento',
          message: `Seu tratamento atual foca na digestão (${treatment.activeTreatments[0]}). Alimentos muito frios ou crus exigem mais esforço do Baço.`,
          recommendedPoints: ['E36']
        };
      } else {
        treatmentAlignment = {
          status: 'aligned',
          badgeText: '🛡️ Alinhado ao seu Tratamento',
          message: `Este alimento harmoniza com os objetivos do seu tratamento atual (${treatment.activeTreatments[0]}).`
        };
      }
    }

    // ── 5. BÚSSOLA PESSOAL & RECOMENDAÇÕES PRÁTICAS ──
    let compass: FoodStateResult['personal']['compass'] = 'green';
    let headline = 'Refeição em sintonia com o seu estado de hoje.';
    let explanation = 'A combinação de temperatura e natureza energética apoia o equilíbrio do seu organismo.';
    const balancingSuggestions: string[] = [];

    if (treatmentAlignment?.status === 'conflict') {
      compass = 'red';
      headline = 'Atenção: este alimento contraria seu foco de autocuidado hoje.';
      explanation = treatmentAlignment.message;
      balancingSuggestions.push('Reduza a porção pela metade ou consuma após um prato nutritivo.');
      if (treatmentAlignment.recommendedPoints) {
        balancingSuggestions.push(`Estimule o ponto ${treatmentAlignment.recommendedPoints.join(' e ')} por 1 minuto para neutralizar o impacto.`);
      }
    } else if (tcmDirection === 'intensifies' || westernSeverity === 'high_attention') {
      compass = 'yellow';
      headline = 'Vale observar: este alimento tende a puxar o corpo para um extremo.';
      if (isFoodWarming) {
        explanation = 'Como você registrou tensão ou cansaço acumulado, estimulantes ou alimentos muito quentes podem dar um impulso ilusório agora e cobrar energia à noite.';
        balancingSuggestions.push('Beba água pura antes e após a refeição.');
        balancingSuggestions.push('Combine com um alimento neutro ou refrescante (ex: maçã, folhas, chá morno).');
      } else {
        explanation = 'Alimentos muito frios ou crus podem paralisar temporariamente a digestão em momentos de energia mais baixa.';
        balancingSuggestions.push('Se puder, aqueça a refeição ou adicione uma pitada de gengibre ou canela.');
      }
    }

    return {
      western: {
        severity: westernSeverity,
        bullets: westernBullets
      },
      tcm: {
        direction: tcmDirection,
        thermalMatch,
        flavorActions,
        cautions: food.tcm.cautions || []
      },
      ayurveda: ayurvedaResult,
      treatmentAlignment,
      personal: {
        compass,
        headline,
        explanation,
        actions: ['consume', 'balance', 'understand'],
        balancingSuggestions: balancingSuggestions.length > 0 ? balancingSuggestions : [
          'Aproveite a refeição com presença plena, mastigando com calma.',
          'Observe como sua barriga e energia se comportam nas próximas 2 horas.'
        ]
      }
    };
  }

  /**
   * Modifica a natureza térmica base dependendo da temperatura de serviço e forma.
   */
  private static calculateEffectiveThermal(baseThermal: ThermalNature, meal: MealContext): ThermalNature {
    // Sopa quente aquece e harmoniza
    if (meal.form === 'soup' || meal.servingTemperature === 'hot') {
      if (baseThermal === 'cool') return 'neutral';
      if (baseThermal === 'cold') return 'cool';
      if (baseThermal === 'neutral') return 'warm';
      return baseThermal;
    }

    // Congelado ou cru intensifica o frio
    if (meal.servingTemperature === 'iced' || meal.form === 'raw') {
      if (baseThermal === 'warm') return 'neutral';
      if (baseThermal === 'neutral') return 'cool';
      if (baseThermal === 'cool') return 'cold';
      return baseThermal;
    }

    return baseThermal;
  }
}
