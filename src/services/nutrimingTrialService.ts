import { supabase } from '../lib/supabase';

export interface TrialStatus {
    allowed: boolean;
    usesLeft: number;
    isPremium: boolean;
}

/**
 * Serviço de gerenciamento de trial do Nutriming AI
 * - 3 usos gratuitos para novos usuários
 * - Acesso ilimitado para Premium
 * - Usa tabela public.nutriming_trials
 */
export class NutrimingTrialService {
    /**
     * Verifica se usuário pode acessar Nutriming AI
     * @param userId - ID do usuário autenticado
     * @param isPremium - Se usuário é premium
     * @returns Status de acesso e usos restantes
     */
    static async canAccessNutriming(userId: string, isPremium: boolean): Promise<TrialStatus> {
        // Premium tem acesso ilimitado
        if (isPremium) {
            return {
                allowed: true,
                usesLeft: Infinity,
                isPremium: true
            };
        }

        if (!supabase) {
            console.warn('Supabase não configurado. Permitindo acesso temporário.');
            return { allowed: true, usesLeft: 3, isPremium: false };
        }

        try {
            // Usar função RPC para buscar usos
            const { data: usesCount, error } = await supabase.rpc('get_nutriming_uses', {
                p_user_id: userId
            });

            if (error) {
                // Se erro, assumir que é novo usuário (0 usos)
                console.warn('Erro ao buscar contador de usos:', error);
                return { allowed: true, usesLeft: 3, isPremium: false };
            }

            const currentUses = usesCount || 0;
            const usesLeft = Math.max(0, 3 - currentUses);

            return {
                allowed: usesLeft > 0,
                usesLeft,
                isPremium: false
            };
        } catch (error) {
            console.error('Erro ao verificar acesso Nutriming:', error);
            // Em caso de erro, permitir acesso (fail-safe)
            return { allowed: true, usesLeft: 3, isPremium: false };
        }
    }

    /**
     * Incrementa contador de usos ao acessar Nutriming AI
     * @param userId - ID do usuário autenticado
     */
    static async incrementUsage(userId: string): Promise<void> {
        if (!supabase) {
            console.warn('Supabase não configurado. Skip increment.');
            return;
        }

        try {
            // Usar RPC para incremento atômico (evita race conditions)
            const { error } = await supabase.rpc('increment_nutriming_usage', {
                p_user_id: userId
            });

            if (error) {
                console.error('Erro ao incrementar usos via RPC:', error);

                // Fallback: inserção/atualização manual
                const { data: existing } = await supabase
                    .from('nutriming_trials')
                    .select('uses_count')
                    .eq('user_id', userId)
                    .single();

                if (existing) {
                    await supabase
                        .from('nutriming_trials')
                        .update({
                            uses_count: existing.uses_count + 1,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userId);
                } else {
                    await supabase
                        .from('nutriming_trials')
                        .insert({ user_id: userId, uses_count: 1 });
                }
            }
        } catch (error) {
            console.error('Erro crítico ao incrementar usos:', error);
        }
    }

    /**
     * Retorna usos restantes para usuário
     * @param userId - ID do usuário autenticado
     * @param isPremium - Se usuário é premium
     */
    static async getRemainingUses(userId: string, isPremium: boolean): Promise<number> {
        const status = await this.canAccessNutriming(userId, isPremium);
        return status.usesLeft;
    }
}
