import { supabase } from '../lib/supabase';

export interface Supplement {
    id?: string;
    name: string;
    dosage: string;
    timing: 'morning' | 'afternoon' | 'evening' | 'with-meal' | 'night' | 'empty-stomach' | 'anytime';
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
            // Backup local sempre (redundância)
            localStorage.setItem(`nutriming_supplements_${userId}`, JSON.stringify(supplements));

            // 1. Deletar suplementos antigos do usuário
            const { error: deleteError } = await supabase
                .from('nutriming_supplements')
                .delete()
                .eq('user_id', userId);

            if (deleteError) {
                console.error('Erro ao deletar suplementos antigos (DB), salvo localmente:', deleteError);
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
                    console.error('Erro ao inserir suplementos (DB), salvo localmente:', insertError);
                    return false;
                }
            }

            console.log('✅ Suplementos salvos no Supabase:', supplements.length);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar suplementos:', error);
            // Backup já foi feito no início do try
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

            if (data && !error && data.length > 0) {
                const supplements: Supplement[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    dosage: item.dosage,
                    timing: item.timing as Supplement['timing'],
                    notes: item.notes || undefined
                }));

                // Atualizar cache local
                localStorage.setItem(`nutriming_supplements_${userId}`, JSON.stringify(supplements));
                console.log('✅ Suplementos carregados do Supabase:', supplements.length);
                return supplements;
            }

            // Fallback: Se der erro ou vazio, tenta local
            console.log('ℹ️ Buscando suplementos no cache local...');
            const localData = localStorage.getItem(`nutriming_supplements_${userId}`);
            if (localData) {
                return JSON.parse(localData);
            }

            return [];
        } catch (error) {
            console.error('❌ Erro ao carregar suplementos, tentando local:', error);
            const localData = localStorage.getItem(`nutriming_supplements_${userId}`);
            return localData ? JSON.parse(localData) : [];
        }
    },

    /**
     * Salvar perfil do usuário no Supabase
     */
    async saveProfile(userId: string, profile: { age: number; gender: string; symptoms: string[] }): Promise<void> {
        try {
            // Tentar atualizar primeiro (upsert)
            const { error } = await supabase
                .from('nutriming_profiles')
                .upsert({ 
                    user_id: userId,
                    age: profile.age,
                    gender: profile.gender,
                    symptoms: profile.symptoms,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Erro ao salvar perfil no Supabase:', error);
                // Fallback para localStorage
                localStorage.setItem(`nutriming_profile_${userId}`, JSON.stringify(profile));
            } else {
                console.log('✅ Perfil salvo no Supabase');
            }
        } catch (error) {
            console.error('Erro crítico ao salvar perfil:', error);
        }
    },

    /**
     * Carregar perfil do usuário do Supabase (com fallback para localStorage se vazio)
     */
    async loadProfile(userId: string): Promise<{ age: number; gender: string; symptoms: string[] }> {
        try {
            const { data, error } = await supabase
                .from('nutriming_profiles')
                .select('age, gender, symptoms')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
                console.error('Erro ao carregar perfil do Supabase:', error);
            }

            if (data) {
                console.log('✅ Perfil carregado do Supabase');
                return {
                    age: data.age || 35,
                    gender: data.gender || 'other',
                    symptoms: data.symptoms || []
                };
            }
            
            // Tentar localStorage se não achar no banco (migração suave)
            const saved = localStorage.getItem(`nutriming_profile_${userId}`);
            if (saved) {
                const localProfile = JSON.parse(saved);
                // Salvar no banco para migrar
                await this.saveProfile(userId, localProfile);
                return localProfile;
            }
        } catch (error) {
            console.error('Erro crítico ao carregar perfil:', error);
        }

        return { age: 35, gender: 'other', symptoms: [] };
    }
};
