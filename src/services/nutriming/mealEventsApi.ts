import { supabase } from '../../lib/supabase';
import { ZenEvent, MealEvent, MicroObservation } from '../../types/nutriming';

const LOCAL_STORAGE_MEALS_KEY = 'xzen_local_meal_events';
const LOCAL_STORAGE_OBS_KEY = 'xzen_local_micro_observations';

export const MealEventsApi = {
  /**
   * Salva um evento alimentar completo com o resultado do FoodStateEngine.
   */
  async createMealEvent(event: ZenEvent | MealEvent): Promise<boolean> {
    try {
      console.log('📦 [MealEventsApi] Salvando evento alimentar:', event);

      // 1. Salvar no localStorage para resiliência offline e velocidade instantânea
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
        const list: any[] = stored ? JSON.parse(stored) : [];
        list.unshift(event);
        localStorage.setItem(LOCAL_STORAGE_MEALS_KEY, JSON.stringify(list.slice(0, 50)));
      } catch (e) {
        console.warn('Erro ao salvar localmente:', e);
      }

      // 2. Se o Supabase estiver disponível, gravar na tabela
      if (supabase) {
        try {
          const isNewMealEvent = 'stateResult' in event;
          const payload = isNewMealEvent ? {
            id: event.id,
            user_id: event.userId,
            created_at: event.createdAt,
            product_name: event.product.name,
            product_id: event.product.foodProductId,
            meal_context: event.mealContext,
            state_result: event.stateResult
          } : {
            id: event.id,
            user_id: event.userId,
            timestamp: event.timestamp,
            data: event.data,
            provenance: event.provenance
          };

          await supabase.from('meal_events').insert([payload]);
        } catch (dbErr) {
          console.warn('[MealEventsApi] Falha ao persistir no Supabase (offline fallback ativo):', dbErr);
        }
      }

      return true;
    } catch (e) {
      console.error('[MealEventsApi] Erro crítico ao salvar evento:', e);
      return false;
    }
  },

  /**
   * Salva o micro-checkin de 2 horas pós-prandial.
   */
  async saveMicroObservation(obs: MicroObservation): Promise<boolean> {
    try {
      console.log('🌱 [MealEventsApi] Salvando micro-observação 2h:', obs);

      // 1. Salvar no localStorage
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_OBS_KEY);
        const list: MicroObservation[] = stored ? JSON.parse(stored) : [];
        list.unshift(obs);
        localStorage.setItem(LOCAL_STORAGE_OBS_KEY, JSON.stringify(list.slice(0, 50)));

        // Marcar a refeição como concluída
        this.markMealCheckinComplete(obs.mealEventId, obs.id);
      } catch (e) {
        console.warn('Erro ao salvar observação local:', e);
      }

      // 2. Persistir no Supabase se disponível
      if (supabase) {
        try {
          await supabase.from('micro_observations').insert([{
            id: obs.id,
            user_id: obs.userId,
            meal_event_id: obs.mealEventId,
            captured_at: obs.capturedAt,
            offset_minutes: obs.offsetMinutesAfterMeal,
            belly: obs.check.belly,
            energy: obs.check.energy,
            mood: obs.check.mood,
            craving: obs.check.craving,
            note: obs.note
          }]);
        } catch (dbErr) {
          console.warn('[MealEventsApi] Falha ao persistir micro_observation no Supabase:', dbErr);
        }
      }

      return true;
    } catch (err) {
      console.error('[MealEventsApi] Erro ao salvar micro-observação:', err);
      return false;
    }
  },

  /**
   * Retorna a refeição mais recente que aguarda o check-in de 2h.
   */
  getPendingMealForCheckin(): MealEvent | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      if (!stored) return null;
      const list = JSON.parse(stored);
      if (!Array.isArray(list) || list.length === 0) return null;

      // Procura primeiro a refeição não completada
      const pending = list.find((item: any) => item && 'stateResult' in item && !item.followUp?.completedObservationId);
      if (pending) return pending as MealEvent;

      // Se todas já foram ou mock, retorna a primeira se for MealEvent
      if ('stateResult' in list[0]) return list[0] as MealEvent;

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Marca a refeição correspondente como avaliada.
   */
  markMealCheckinComplete(mealId: string, observationId: string): void {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      if (!stored) return;
      const list = JSON.parse(stored);
      if (!Array.isArray(list)) return;

      const updated = list.map((item: any) => {
        if (item.id === mealId) {
          return {
            ...item,
            followUp: {
              ...item.followUp,
              completedObservationId: observationId
            }
          };
        }
        return item;
      });

      localStorage.setItem(LOCAL_STORAGE_MEALS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao atualizar status da refeição:', e);
    }
  },

  /**
   * Retorna todas as refeições registradas (incluindo stateResult e autenticidade).
   * Se vazio, injeta casos reais demonstrativos (ex: chocolate adulterado vs genuíno).
   */
  getAllMealEvents(): MealEvent[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          return list.filter((item: any) => item && 'stateResult' in item) as MealEvent[];
        }
      }
    } catch (e) {
      console.warn('Erro ao ler meal events:', e);
    }

    // Casos demonstrativos reais para visualização imediata do piloto e do relatório
    const demoEvents: MealEvent[] = [
      {
        id: 'meal-demo-1',
        userId: 'pilot-user-1',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Há 45 minutos (janela digestiva ativa)
        product: {
          name: 'Chocolate ao Leite Garoto (Tablete)',
          foodProductId: '7891000248705',
          confidence: 'known'
        },
        mealContext: {
          moment: 'afternoon',
          form: 'snack',
          servingTemperature: 'room'
        },
        stateResult: {
          western: {
            severity: 'high_attention',
            bullets: [
              'Alerta crítico: Gordura vegetal fracionada substituindo manteiga de cacau',
              'Presença de aromatizante sintético idêntico ao natural e emulsificante lecitina de soja'
            ]
          },
          tcm: {
            direction: 'intensifies',
            thermalMatch: 'Natureza quente e excesso de umidade doce geram estagnação no Baço/Estômago.',
            flavorActions: [
              { flavor: 'sweet', actionVerb: 'estagna', meaning: 'Sobrecarga de umidade no centro digestivo' }
            ],
            cautions: ['Evitar em estados de calor interno e disfunção metabólica']
          },
          personal: {
            compass: 'red',
            headline: '🔴 PRODUTO ADULTERADO OU MAQUIADO: Chocolate Garoto',
            explanation: 'Gordura vegetal hidrogenada/fracionada detectada no lugar da manteiga de cacau genuína. Alimento de alta carga inflamatória e disbiose gástrica.',
            actions: ['understand', 'balance'],
            balancingSuggestions: ['Substituir por chocolate autêntico >70% de cacau sem óleos vegetais hidrogenados']
          }
        },
        followUp: {}
      },
      {
        id: 'meal-demo-2',
        userId: 'pilot-user-1',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Há 4 horas (fora da janela prandial)
        product: {
          name: 'Azeite de Oliva Extra Virgem Andorinha',
          foodProductId: '5601004000109',
          confidence: 'known'
        },
        mealContext: {
          moment: 'midday',
          form: 'salad',
          servingTemperature: 'room'
        },
        stateResult: {
          western: {
            severity: 'ok',
            bullets: ['100% puro azeite de oliva extra virgem. Acidez < 0.5%. Livre de óleos vegetais refinados.']
          },
          tcm: {
            direction: 'balances',
            thermalMatch: 'Natureza neutra e suave, lubrifica os intestinos e harmoniza o fígado.',
            flavorActions: [
              { flavor: 'sweet', actionVerb: 'nutre', meaning: 'Ação emoliente e anti-inflamatória' }
            ],
            cautions: []
          },
          personal: {
            compass: 'green',
            headline: '🟢 ALIMENTO GENUÍNO E PURO: Azeite de Oliva Extra Virgem',
            explanation: 'Composição 100% compatível com a identidade botânica e legal. Rico em polifenóis e ácido oleico anti-inflamatório.',
            actions: ['consume']
          }
        },
        followUp: {}
      },
      {
        id: 'meal-demo-3',
        userId: 'pilot-user-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        product: {
          name: 'Requeijão Cremoso com Amido e Gordura Vegetal',
          foodProductId: '7891234567890',
          confidence: 'known'
        },
        mealContext: {
          moment: 'morning',
          form: 'snack',
          servingTemperature: 'cold'
        },
        stateResult: {
          western: {
            severity: 'high_attention',
            bullets: ['Queijo análogo ultraprocessado com amido modificado, gordura vegetal de palma e estabilizantes']
          },
          tcm: {
            direction: 'intensifies',
            thermalMatch: 'Gera umidade-mucosidade pesada no Baço, prejudicando o Qi digestivo.',
            flavorActions: [
              { flavor: 'sweet', actionVerb: 'obstrui', meaning: 'Formação de fleuma e letargia' }
            ],
            cautions: ['Agrava retenção hídrica e sensibilidade gastrointestinal']
          },
          personal: {
            compass: 'red',
            headline: '🔴 QUEIJO ANÁLOGO ADULTERADO: Requeijão com Amido',
            explanation: 'Substituição da massa láctea por amido de milho e óleo vegetal. Não possui as propriedades de queijo genuíno.',
            actions: ['understand', 'balance']
          }
        },
        followUp: {}
      }
    ];

    try {
      localStorage.setItem(LOCAL_STORAGE_MEALS_KEY, JSON.stringify(demoEvents));
    } catch {}

    return demoEvents;
  },

  /**
   * Retorna todas as micro-observações registradas.
   */
  async fetchMicroObservations(): Promise<MicroObservation[]> {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_OBS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  },

  /**
   * Busca o histórico recente de refeições para o TemporalObservationEngine analisar.
   */
  async fetchRecentMealEvents(userId: string): Promise<ZenEvent[]> {
    // 1. Tentar ler do localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEALS_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          return list.map((item: any) => {
            if ('stateResult' in item) {
              return {
                id: item.id,
                userId: item.userId,
                type: 'food' as const,
                timestamp: item.createdAt,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                provenance: { source: 'user' as const, method: 'barcode_or_food_engine', confidence: 0.95 },
                data: {
                  foods: [{ name: item.product.name, estimated: false, confidence: 0.95, userConfirmed: true }],
                  stateResult: item.stateResult,
                  mealContext: item.mealContext
                },
                createdAt: item.createdAt
              };
            }
            return item;
          });
        }
      }
    } catch {
      // Ignora erro de parsing
    }

    // 2. Retorno com mock seguro caso ainda não haja dados
    return [
      {
        id: 'evt-1',
        userId,
        type: 'food',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provenance: { source: 'user', method: 'photo', confidence: 0.9 },
        data: {
          foods: [{ name: 'Café (Espresso)', estimated: true, confidence: 0.8, userConfirmed: true }]
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-2',
        userId,
        type: 'food',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provenance: { source: 'user', method: 'photo', confidence: 0.9 },
        data: {
          foods: [{ name: 'Café (Espresso)', estimated: true, confidence: 0.8, userConfirmed: true }]
        },
        createdAt: new Date().toISOString()
      }
    ];
  }
};
