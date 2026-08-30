import { supabase } from '../../lib/supabase';
import { ZenEvent } from '../../types/nutriming';

export const MealEventsApi = {
  /**
   * Salva um evento alimentar (Mock/Supabase).
   * Objetivo da Sprint 2: < 10s flow
   */
  async createMealEvent(event: ZenEvent): Promise<boolean> {
    try {
      // Simulação de salvar ultra rápido
      // Na integração real:
      // const { error } = await supabase.from('meal_events').insert([{
      //   user_id: event.userId,
      //   foods: event.data.foods,
      //   ...
      // }]);
      
      console.log('📦 [Supabase Mock] Evento salvo:', event);
      
      // Delay fake de rede para provar UX < 10s
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    } catch (e) {
      console.error('Erro ao salvar:', e);
      return false;
    }
  },

  /**
   * Busca o histórico para o TemporalObservationEngine analisar
   */
  async fetchRecentMealEvents(userId: string): Promise<ZenEvent[]> {
    // Na integração real, faríamos um select no supabase
    // Para provar a arquitetura da Sprint 2 (Closed Loop), 
    // retornaremos o Mock do cenário ("Café às 07:30 3x repetido")
    
    return [
      {
        id: 'evt-1',
        userId,
        type: 'food',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provenance: { source: 'user', method: 'photo', confidence: 0.9 },
        data: {
          foods: [{ name: 'Café + Alimento X', estimated: true, confidence: 0.8, userConfirmed: true }],
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-2',
        userId,
        type: 'food',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provenance: { source: 'user', method: 'photo', confidence: 0.9 },
        data: {
          foods: [{ name: 'Café + Alimento X', estimated: true, confidence: 0.8, userConfirmed: true }],
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-3',
        userId,
        type: 'food',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provenance: { source: 'user', method: 'photo', confidence: 0.9 },
        data: {
          foods: [{ name: 'Café + Alimento X', estimated: true, confidence: 0.8, userConfirmed: true }],
        },
        createdAt: new Date().toISOString()
      }
    ];
  }
};
