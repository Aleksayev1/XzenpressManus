import { supabase } from '../lib/supabase';

export interface Supplement {
    id?: string;
    name: string;
    dosage: string;
    timing: 'morning' | 'with-meal' | 'night' | 'anytime';
    notes?: string;
}

export interface NutrimingData {
    supplements: Supplement[];
    profile: {
        age: number;
        gender?: 'male' | 'female' | 'other';
        symptoms: string[];
    };
}

/**
 * Service para salvar/carregar dados do Nutriming AI no Supabase
 */
export const NutrimingStorageService = {
    /**
     * Salvar suplementos do usuário no Supabase
     */
    async saveSupplements(userId: string, supplements: Supplement[]): Promise<boolean> {
        try {
            // 1. Deletar suplementos antigos do usuário
            const { error: deleteError } = await supabase
                .from('nutriming_supplements')
                .delete()
                .eq('user_id', userId);

            if (deleteError) {
                console.error('Erro ao deletar suplementos antigos:', deleteError);
                return false;
            }

            // 2. Inserir novos suplementos
            if (supplements.length > 0) {
                const supplementsToInsert = supplements.map(sup => ({
                    user_id: userId,
                    name: sup.name,
                    dosage: sup.dosage,
                    timing: sup.timing,
                    notes: sup.notes || null
                }));

                const { error: insertError } = await supabase
                    .from('nutriming_supplements')
                    .insert(supplementsToInsert);

                if (insertError) {
                    console.error('Erro ao inserir suplementos:', insertError);
                    return false;
                }
            }

            console.log('✅ Suplementos salvos no Supabase:', supplements.length);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar suplementos:', error);
            return false;
        }
    },

    /**
     * Carregar suplementos do usuário do Supabase
     */
    async loadSupplements(userId: string): Promise<Supplement[]> {
        try {
            const { data, error } = await supabase
                .from('nutriming_supplements')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Erro ao carregar suplementos:', error);
                return [];
            }

            if (!data || data.length === 0) {
                console.log('ℹ️ Nenhum suplemento encontrado para este usuário');
                return [];
            }

            const supplements: Supplement[] = data.map(item => ({
                id: item.id,
                name: item.name,
                dosage: item.dosage,
                timing: item.timing as Supplement['timing'],
                notes: item.notes || undefined
            }));

            console.log('✅ Suplementos carregados do Supabase:', supplements.length);
            return supplements;
        } catch (error) {
            console.error('❌ Erro ao carregar suplementos:', error);
            return [];
        }
    },

    /**
     * Salvar perfil do usuário no localStorage (não crítico para Supabase por enquanto)
     */
    saveProfile(userId: string, profile: { age: number; gender?: 'male' | 'female' | 'other'; symptoms: string[] }) {
        localStorage.setItem(`nutriming_profile_${userId}`, JSON.stringify(profile));
    },

    /**
     * Carregar perfil do usuário do localStorage
     */
    loadProfile(userId: string): { age: number; gender?: 'male' | 'female' | 'other'; symptoms: string[] } {
        const saved = localStorage.getItem(`nutriming_profile_${userId}`);
        if (saved) {
            return JSON.parse(saved);
        }
        return { age: 35, symptoms: [] };
    }
};
