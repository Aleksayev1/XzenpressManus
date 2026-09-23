import { FoodProfile, Flavor, ThermalNature } from '../../types/nutriming';

export const FLAVOR_ACTION_MAP: Record<Flavor, { actionVerb: string; meaning: string; targetOrgan: string }> = {
  sour: {
    actionVerb: 'Recolher · Preservar · Concentrar',
    meaning: 'Adstringe fluidos e acalma o vento interno.',
    targetOrgan: 'Fígado'
  },
  bitter: {
    actionVerb: 'Descer · Secar · Limpar',
    meaning: 'Drena o calor excessivo e elimina umidade.',
    targetOrgan: 'Coração'
  },
  sweet: {
    actionVerb: 'Nutrir · Harmonizar · Suavizar',
    meaning: 'Tonifica o centro digestivo e desacelera tensões.',
    targetOrgan: 'Baço-Pâncreas'
  },
  pungent: {
    actionVerb: 'Mover · Dispersar · Liberar',
    meaning: 'Ativa a circulação do Qi e abre os poros.',
    targetOrgan: 'Pulmão'
  },
  salty: {
    actionVerb: 'Amolecer · Conduzir para baixo',
    meaning: 'Amacia nódulos e direciona energia aos reservatórios vitais.',
    targetOrgan: 'Rins'
  }
};

export const FOUNDATIONAL_MTC_FOODS: Record<string, FoodProfile> = {
  // ─── GRANDES ATIVADORES / YANG (QUENTE / MORNO) ───────────────────────────
  cafe: {
    id: 'cafe',
    name: 'Café (Espresso / Coado)',
    western: { caffeineMg: 95, nova: 1 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['bitter', 'pungent'],
      qiDynamics: ['Ascende a energia para a cabeça', 'Acelera a circulação do Qi', 'Pede empréstimo do Jing'],
      organAffinity: ['Coração', 'Fígado', 'Baço'],
      cautions: ['Evitar em estados de ansiedade, calor interno, insônia ou palpitação.', 'Consumir com moderação se estiver em tratamento para acalmar a mente.']
    },
    ayurveda: {
      guna: 'rajasic',
      doshaImpact: { vata: 'aggravates', pitta: 'aggravates', kapha: 'pacifies' },
      agniEffect: 'kindles',
      traditionalNotes: ['Estimulante rajásico; acende o fogo temporário mas esgota a reserva de Ojas (vitalidade profunda).']
    }
  },
  ginseng: {
    id: 'ginseng',
    name: 'Ginseng',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['sweet', 'bitter'],
      qiDynamics: ['Grande tonificador do Qi primordial (Yuan Qi)', 'Tonifica o Yang dos Rins e Baço'],
      organAffinity: ['Baço', 'Pulmão', 'Coração'],
      cautions: ['Contraindicado em quadros agudos de febre, hipertensão descontrolada ou fogo no Fígado.']
    },
    ayurveda: {
      guna: 'rajasic',
      doshaImpact: { vata: 'pacifies', pitta: 'aggravates', kapha: 'pacifies' },
      agniEffect: 'kindles',
      traditionalNotes: ['Tônico rejuvenescedor (Rasayana) aquecedor; usar com cautela em pessoas com Pitta alto.']
    }
  },
  gengibre: {
    id: 'gengibre',
    name: 'Gengibre (Fresco / Seco)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['pungent'],
      qiDynamics: ['Aquece o centro digestivo', 'Dispersa o frio externo', 'Interrompe náuseas'],
      organAffinity: ['Estômago', 'Baço', 'Pulmão'],
      cautions: ['Evitar se houver queimação estomacal ativa (calor no Estômago).']
    }
  },
  pimenta: {
    id: 'pimenta',
    name: 'Pimenta (Vermelha / Malagueta / Dedo-de-Moça)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'hot',
      flavors: ['pungent'],
      qiDynamics: ['Calor intenso', 'Move o sangue vigorosamente', 'Abre os poros'],
      organAffinity: ['Coração', 'Baço', 'Estômago'],
      cautions: ['Pode irritar a mucosa gástrica e agravar hemorroidas e irritabilidade.']
    }
  },
  canela: {
    id: 'canela',
    name: 'Canela',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'hot',
      flavors: ['pungent', 'sweet'],
      qiDynamics: ['Aquece os canais e o Ming Men (fogo vital)', 'Dispersa frio profundo'],
      organAffinity: ['Rins', 'Baço', 'Fígado'],
      cautions: ['Usar com cautela em gravidez e quadros de calor por deficiência de Yin.']
    }
  },
  carne_vermelha: {
    id: 'carne_vermelha',
    name: 'Carne Vermelha (Bovina)',
    western: { nova: 1, sodiumMg: 60 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['sweet'],
      qiDynamics: ['Tonifica o Qi e o Sangue (Xue)', 'Fortalece tendões e ossos'],
      organAffinity: ['Baço', 'Estômago', 'Rins'],
      cautions: ['Digestão densa; em excesso pode gerar estagnação e calor-umidade.']
    }
  },
  alcool: {
    id: 'alcool',
    name: 'Bebida Alcoólica (Vinho / Destilado / Cerveja)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'hot',
      flavors: ['bitter', 'pungent', 'sweet'],
      qiDynamics: ['Move o Qi no início, depois dispersa o Yang e gera umidade-calor no Fígado'],
      organAffinity: ['Fígado', 'Coração', 'Estômago'],
      cautions: ['Interfere diretamente com medicamentos e sobrecarrega o Fígado.']
    }
  },

  // ─── GRANDES RESFRIADORES / YIN (FRIO / FRESCO) ───────────────────────────
  salada_crua: {
    id: 'salada_crua',
    name: 'Salada Crua / Folhas Verdes (Alface, Rúcula, Agrião)',
    western: { fiber: 3, nova: 1 },
    tcm: {
      thermalNature: 'cool',
      flavors: ['bitter', 'sweet'],
      qiDynamics: ['Limpa o calor interno', 'Desintoxica', 'Promove a diurese'],
      organAffinity: ['Fígado', 'Estômago', 'Intestino Grosso'],
      cautions: ['Se consumida muito fria em pessoas de Baço fraco, gera estufamento e lentidão digestiva.']
    }
  },
  melancia: {
    id: 'melancia',
    name: 'Melancia',
    western: { sugarG: 6, nova: 1 },
    tcm: {
      thermalNature: 'cold',
      flavors: ['sweet'],
      qiDynamics: ['Apaga o calor de verão', 'Gera fluidos corporais (Jin Ye)', 'Acalma a sede'],
      organAffinity: ['Coração', 'Estômago', 'Bexiga'],
      cautions: ['Evitar em diarreias ou estômago frio.']
    }
  },
  acai_congelado: {
    id: 'acai_congelado',
    name: 'Açaí na Tigela (Gelado)',
    western: { sugarG: 18, nova: 3 },
    tcm: {
      thermalNature: 'cold',
      flavors: ['sweet'],
      qiDynamics: ['Nutre o sangue pela fruta, mas o gelo e xarope sobrecarregam o Baço'],
      organAffinity: ['Fígado', 'Baço'],
      cautions: ['A temperatura congelada paralisa o peristaltismo e o calor do Baço temporariamente.']
    }
  },
  pepino: {
    id: 'pepino',
    name: 'Pepino',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'cool',
      flavors: ['sweet'],
      qiDynamics: ['Limpa calor e purifica toxinas', 'Hidrata profundamente'],
      organAffinity: ['Estômago', 'Intestino Grosso', 'Bexiga'],
      cautions: ['Pode ser indigesto para quem tem frio no estômago.']
    }
  },
  hortela: {
    id: 'hortela',
    name: 'Chá de Hortelã (Menta)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'cool',
      flavors: ['pungent'],
      qiDynamics: ['Dispersa o calor da cabeça e olhos', 'Suaviza o Qi do Fígado', 'Libera estagnações'],
      organAffinity: ['Fígado', 'Pulmão'],
      cautions: ['Ótimo para quem está tenso e com calor; usar moderado se houver muito frio corporal.']
    }
  },
  leite: {
    id: 'leite',
    name: 'Leite de Vaca',
    western: { allergens: ['lactose', 'caseina'], nova: 1 },
    tcm: {
      thermalNature: 'cool',
      flavors: ['sweet'],
      qiDynamics: ['Nutre o Yin e tonifica fraquezas, mas gera Umidade (Shi) e Fleuma (Tan) com facilidade'],
      organAffinity: ['Coração', 'Pulmão', 'Estômago'],
      cautions: ['Evitar em rinite, sinusite, catarro e estufamento abdominal.']
    }
  },
  refrigerante_gelado: {
    id: 'refrigerante_gelado',
    name: 'Refrigerante Gelado / Cola',
    western: { sugarG: 21, nova: 4, caffeineMg: 25 },
    tcm: {
      thermalNature: 'cold',
      flavors: ['sweet'],
      qiDynamics: ['Choque térmico frio no estômago + calor inflamatório químico do açúcar refinado'],
      organAffinity: ['Estômago', 'Baço', 'Rins'],
      cautions: ['Gera umidade-calor tóxica e rouba a vitalidade digestiva.']
    }
  },

  // ─── HARMONIZADORES DO CENTRO / NEUTROS ───────────────────────────────────
  arroz: {
    id: 'arroz',
    name: 'Arroz Cozido (Branco / Integral)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'neutral',
      flavors: ['sweet'],
      qiDynamics: ['Alimento de ouro do Baço', 'Tonifica o Qi suavemente', 'Harmoniza o Estômago'],
      organAffinity: ['Baço', 'Estômago'],
      cautions: []
    }
  },
  feijao: {
    id: 'feijao',
    name: 'Feijão Cozido (Preto / Carioca)',
    western: { fiber: 6, protein: 7, nova: 1 },
    tcm: {
      thermalNature: 'neutral',
      flavors: ['sweet'],
      qiDynamics: ['Tonifica o Qi e o Sangue', 'Fortalece os Rins e Baço', 'Elimina água excessiva'],
      organAffinity: ['Rins', 'Baço'],
      cautions: ['Cozinhar bem para evitar gases por fermentação.']
    }
  },
  maca: {
    id: 'maca',
    name: 'Maçã',
    western: { fiber: 2.4, nova: 1 },
    tcm: {
      thermalNature: 'neutral',
      flavors: ['sweet', 'sour'],
      qiDynamics: ['Gera fluidos corporais', 'Harmoniza a digestão', 'Acalma a sede'],
      organAffinity: ['Baço', 'Estômago', 'Coração'],
      cautions: []
    }
  },
  cenoura: {
    id: 'cenoura',
    name: 'Cenoura (Cozida / Vapor)',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'neutral',
      flavors: ['sweet'],
      qiDynamics: ['Tonifica o Baço e fortalece o Fígado', 'Melhora a visão'],
      organAffinity: ['Baço', 'Fígado', 'Pulmão'],
      cautions: []
    }
  },
  sopa_legumes: {
    id: 'sopa_legumes',
    name: 'Sopa de Legumes Quente',
    western: { nova: 1 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['sweet'],
      qiDynamics: ['Acolhimento térmico perfeito para o Baço', 'Facilíssima assimilação', 'Restaura a energia'],
      organAffinity: ['Baço', 'Estômago'],
      cautions: []
    }
  },
  frango: {
    id: 'frango',
    name: 'Carne de Frango (Cozida / Grelhada)',
    western: { protein: 25, nova: 1 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['sweet'],
      qiDynamics: ['Tonifica o Qi e a Essência (Jing)', 'Aquece o centro'],
      organAffinity: ['Baço', 'Estômago'],
      cautions: ['Se for frito, torna-se muito quente e gera umidade.']
    }
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    western: { sugarG: 12, fiber: 2.6, nova: 1 },
    tcm: {
      thermalNature: 'cold',
      flavors: ['sweet'],
      qiDynamics: ['Lubrifica os intestinos', 'Limpa o calor seco'],
      organAffinity: ['Intestino Grosso', 'Baço'],
      cautions: ['Consumir moderada se houver diarreia ou muito muco/estufamento.']
    }
  },
  ultraprocessado_generico: {
    id: 'ultraprocessado_generico',
    name: 'Alimento Ultraprocessado (Salgadinho / Biscoito Recheado)',
    western: { nova: 4, sodiumMg: 450, sugarG: 25 },
    tcm: {
      thermalNature: 'warm',
      flavors: ['sweet', 'salty'],
      qiDynamics: ['Gera Umidade-Calor tóxica', 'Obstrui a circulação limpa do Qi', 'Perturba o Shen'],
      organAffinity: ['Estômago', 'Baço'],
      cautions: ['Consumir com consciência e moderação; agride o eixo intestino-mente.']
    }
  }
};
