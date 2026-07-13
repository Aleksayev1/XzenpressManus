import { supabase } from '../lib/supabase';

// ==========================================
// 1. TYPES & ENUMS
// ==========================================

export type MemoryType = 'factual' | 'episodic' | 'pattern' | 'emotional_pattern' | 'purpose' | 'reflective';
export type MemoryCategory = 'sleep' | 'stress' | 'nutrition' | 'emotion' | 'pain' | 'relationship' | 'spirituality' | 'movement' | 'general';
export type MemorySource = 'user_report' | 'ai_inference' | 'session_result' | 'wearable_data' | 'anamnesis';
export type MemoryState = 'candidate' | 'hypothesis' | 'evidence' | 'confirmed' | 'consolidated' | 'archived';
export type MemoryStatus = 'active' | 'inactive' | 'archived' | 'user_hidden';
export type PrivacyLevel = 'public_context' | 'personal_context' | 'sensitive_context';

export interface ZenMemory {
  id?: string;
  user_id: string;
  memory_type: MemoryType;
  memory_category: MemoryCategory;
  tags: string[];
  
  memory_content: string;
  ai_interpretation?: string;
  
  privacy_level: PrivacyLevel;
  source_type: MemorySource;
  source_reference_id?: string;
  user_confirmed: boolean;
  
  memory_state: MemoryState;
  memory_status: MemoryStatus;
  confidence_score: number;
  activation_score: number;
  influence_weight: number;
  
  confirmations_count: number;
  contradictions_count: number;
  last_activated_at?: string;
  created_at?: string;
  updated_at?: string;
  
  // Campo dinâmico em tempo de execução
  _ranking_score?: number;
}

// ==========================================
// 2. ZEN MEMORY ENGINE CORE
// ==========================================

export class ZenMemoryEngine {
  
  /**
   * Registra uma nova memória como 'Candidata' (Requer validação humana para seguir fluxo)
   */
  static async captureCandidateMemory(memoryData: Partial<ZenMemory>): Promise<ZenMemory | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('zen_memory')
        .insert([{
          ...memoryData,
          memory_state: 'candidate',
          memory_status: 'active',
          confidence_score: memoryData.confidence_score || 20, 
          activation_score: memoryData.activation_score || 80, 
          user_confirmed: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro na Captura de Memória:', error);
      return null;
    }
  }

  /**
   * Recupera o contexto ativo e aplica o MEMORY RANKING ENGINE.
   * Evita "dump" de memórias no prompt, enviando apenas as TOP 3.
   */
  static async retrieveActiveContext(userId: string, categories: MemoryCategory[]): Promise<ZenMemory[]> {
    if (!supabase || categories.length === 0) return [];

    try {
      // 1. Memory Retriever (Busca bruta na Camada 2)
      const { data, error } = await supabase
        .from('zen_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('memory_status', 'active')
        .in('memory_category', categories);

      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // 2. Memory Ranking Engine
      const rankedMemories = data.map(memory => {
        const score = this.calculateRankingScore(memory);
        return { ...memory, _ranking_score: score };
      });
      
      // Ordena pelas mais fortes e limita às TOP 3
      rankedMemories.sort((a, b) => (b._ranking_score || 0) - (a._ranking_score || 0));
      const topMemories = rankedMemories.slice(0, 3);
      
      // 3. Renova recência
      if (topMemories.length > 0) {
        this.updateActivationRecency(topMemories.map(m => m.id as string));
      }

      return topMemories;
    } catch (error) {
      console.error('Erro na Recuperação de Memória:', error);
      return [];
    }
  }

  /**
   * O Motor de Rankeamento: Calcula a força de uma memória para o contexto atual
   * Fórmula: Relevância Atual + Influência + Confiança + Confirmação do Usuário - Decaimento de Recência - Contradições
   */
  private static calculateRankingScore(memory: any): number {
    let score = 0;
    
    // Relevância atual (Activation Score)
    score += memory.activation_score || 0;
    
    // Influência (peso da memória x 10)
    score += (memory.influence_weight || 1) * 10;
    
    // Confiança (Confidence Score)
    score += memory.confidence_score || 0;
    
    // Confirmação do usuário (Bônus maciço para a colaboração)
    if (memory.user_confirmed) {
      score += 50; 
    }
    
    // Maturação (Bônus extra se for 'consolidated' ou 'confirmed')
    if (memory.memory_state === 'consolidated') score += 30;
    if (memory.memory_state === 'confirmed') score += 20;

    // Recência (Decaimento suave ao longo do tempo sem uso)
    const lastAct = memory.last_activated_at ? new Date(memory.last_activated_at).getTime() : Date.now();
    const daysSince = (Date.now() - lastAct) / (1000 * 60 * 60 * 24);
    const recencyPenalty = Math.min(daysSince * 1.5, 40); // Punição máxima de 40 pontos
    score -= recencyPenalty;
    
    // Contradições (Queda forte)
    score -= (memory.contradictions_count || 0) * 20;
    
    return score;
  }

  /**
   * Motor de Consolidação e User Feedback Loop
   */
  static async applyMemoryFeedback(memoryId: string, feedbackType: 'confirmed' | 'corrected' | 'ignored' | 'helped' | 'rejected'): Promise<void> {
    if (!supabase) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        console.warn('Cannot apply memory feedback: No active user session');
        return;
      }

      // 1. Grava no memory_usage_log
      await supabase.from('memory_usage_log').insert([{
        user_id: userId,
        memory_id: memoryId,
        interaction_type: feedbackType,
        context_score_delta: feedbackType === 'confirmed' ? 50 : feedbackType === 'rejected' ? -50 : 0
      }]);

      // 2. Atualiza estado na zen_memory dependendo do feedback
      let updateData: any = {};
      
      if (feedbackType === 'confirmed') {
        updateData.user_confirmed = true;
        updateData.memory_state = 'confirmed';
        // Incrementa contagem de confirmações (requeriria ler o dado atual, mas vamos simplificar o update usando raw sql ou atualizando estado)
        // Para simplificar, sem RPC, apenas atualizamos o estado
      } else if (feedbackType === 'rejected') {
        updateData.memory_state = 'archived';
        updateData.memory_status = 'inactive';
      } else if (feedbackType === 'helped') {
        // Incrementa influence_weight sutilmente (fictício, se houvesse RPC)
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('zen_memory')
          .update(updateData)
          .eq('id', memoryId);
      }

      console.log(`[ZenMemoryEngine] Feedback '${feedbackType}' registrado para memória ${memoryId}`);
    } catch (error) {
       console.error('Erro no Memory Feedback:', error);
    }
  }

  private static async updateActivationRecency(memoryIds: string[]): Promise<void> {
    if (!supabase || memoryIds.length === 0) return;
    try {
      await supabase
        .from('zen_memory')
        .update({ last_activated_at: new Date().toISOString() })
        .in('id', memoryIds);
    } catch (error) {
      console.error('Erro ao renovar recência:', error);
    }
  }

  // ==========================================
  // 3. O CONTRATO DE MEMÓRIA (Context Builder)
  // ==========================================
  
  /**
   * Gera o Contrato de Memória que é injetado no System Prompt do Gemini.
   */
  static getMemoryContract(): string {
    return JSON.stringify({
      "memory_usage_rules": {
        "sensitive_memory": "use_only_if_relevant_and_user_confirmed",
        "medical_claims": "never_infer_or_diagnose_use_reflective_memory_instead",
        "user_correction": "always_prioritize_and_apologize",
        "causality": "present_as_hypothesis_not_fact",
        "tone": "collaborative_mirror_not_authoritative_oracle"
      }
    }, null, 2);
  }
}
