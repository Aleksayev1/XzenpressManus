import { supabase } from '../../lib/supabase';
import { ZenEvent, MealEvent } from '../../types/nutriming';

const LOCAL_STORAGE_MEALS_KEY = 'xzen_local_meal_events';

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
