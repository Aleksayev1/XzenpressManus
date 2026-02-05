import { supabase } from '../lib/supabase';

// Helper para verificar conexão
const requireSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }
    return supabase;
};

export interface ZSParticipantData {
    name: string;
    email: string;
    age: number;
    condition: string;
    severity: string;
    consent: boolean;
}

export interface ZSEnrollmentResponse {
    success: boolean;
    studyId?: string;
    error?: string;
}

/**
 * Cadastra uma nova participante no estudo ZS Point
 */
export async function enrollZSParticipant(data: ZSParticipantData): Promise<ZSEnrollmentResponse> {
    try {
        // Validações básicas
        if (!data.name || data.name.trim().length < 3) {
            return { success: false, error: 'Nome deve ter pelo menos 3 caracteres' };
        }

        if (!data.email || !data.email.includes('@')) {
            return { success: false, error: 'Email inválido' };
        }

        if (!data.age || data.age < 45 || data.age > 65) {
            return { success: false, error: 'Idade deve estar entre 45 e 65 anos' };
        }

        if (!data.consent) {
            return { success: false, error: 'É necessário consentir com o uso dos dados' };
        }

        // Verificar se email já está cadastrado
        const client = requireSupabase();

        const { data: { user } } = await client.auth.getUser();

        const { data: existingParticipant } = await client
            .from('zs_study_participants')
            .select('study_id')
            .eq('user_id', user?.id)
            .single();

        if (existingParticipant) {
            return {
                success: false,
                error: 'Você já está cadastrada no estudo',
                studyId: existingParticipant.study_id
            };
        }



        // Inserir participante (study_id será gerado automaticamente pelo trigger)
        const { data: participant, error } = await client
            .from('zs_study_participants')
            .insert({
                user_id: user?.id || null,
                age: data.age,
                consent_signed_at: new Date().toISOString(),
                consent_ip_address: null, // Pode ser capturado via API se necessário
                study_status: 'enrolled'
            })
            .select('study_id')
            .single();

        if (error) {
            console.error('Erro ao cadastrar participante:', error);
            return {
                success: false,
                error: 'Erro ao processar cadastro. Tente novamente em instantes.'
            };
        }

        // Salvar dados adicionais em tabela auxiliar (se necessário)
        // Por ora, vamos armazenar no localStorage como fallback
        localStorage.setItem('zs_enrollment_data', JSON.stringify({
            studyId: participant.study_id,
            name: data.name,
            email: data.email,
            condition: data.condition,
            severity: data.severity,
            enrolledAt: new Date().toISOString()
        }));

        return {
            success: true,
            studyId: participant.study_id
        };

    } catch (error) {
        console.error('Erro inesperado ao cadastrar:', error);
        return {
            success: false,
            error: 'Erro inesperado. Entre em contato com support@xzenpress.com'
        };
    }
}

/**
 * Verifica se usuário atual já está cadastrado no estudo
 */
export async function checkZSEnrollment(): Promise<{ enrolled: boolean; studyId?: string }> {
    try {
        const client = requireSupabase();
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            return { enrolled: false };
        }

        const { data: participant } = await client
            .from('zs_study_participants')
            .select('study_id, study_status')
            .eq('user_id', user.id)
            .single();

        if (participant && participant.study_status !== 'withdrawn') {
            return { enrolled: true, studyId: participant.study_id };
        }

        return { enrolled: false };
    } catch (error) {
        console.error('Erro ao verificar cadastro:', error);
        return { enrolled: false };
    }
}

/**
 * Registra um fogacho (hot flash) da participante
 */
export async function logHotFlash(severity: number, trigger?: string): Promise<boolean> {
    try {
        const client = requireSupabase();
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            return false;
        }

        // Obter participant_id
        const { data: participant } = await client
            .from('zs_study_participants')
            .select('id, intervention_start_date')
            .eq('user_id', user.id)
            .single();

        if (!participant) {
            return false;
        }

        // Calcular study_week
        let studyWeek = 0;
        if (participant.intervention_start_date) {
            const startDate = new Date(participant.intervention_start_date);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            studyWeek = Math.floor(diffDays / 7);
        }

        const { error } = await client
            .from('zs_study_hot_flashes')
            .insert({
                participant_id: participant.id,
                occurred_at: new Date().toISOString(),
                severity: severity,
                trigger: trigger || null,
                study_week: studyWeek
            });

        if (error) {
            console.error('Erro ao registrar fogacho:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro inesperado ao registrar fogacho:', error);
        return false;
    }
}

/**
 * Registra uma sessão de acupressão ZS
 */
export async function logZSSession(durationSeconds: number, completed: boolean): Promise<boolean> {
    try {
        const client = requireSupabase();
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            return false;
        }

        // Obter participant_id
        const { data: participant } = await client
            .from('zs_study_participants')
            .select('id, intervention_start_date')
            .eq('user_id', user.id)
            .single();

        if (!participant) {
            return false;
        }

        // Calcular study_week
        let studyWeek = 0;
        if (participant.intervention_start_date) {
            const startDate = new Date(participant.intervention_start_date);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            studyWeek = Math.floor(diffDays / 7);
        }

        const { error } = await client
            .from('zs_study_sessions')
            .insert({
                participant_id: participant.id,
                session_date: new Date().toISOString().split('T')[0],
                session_time: new Date().toISOString().split('T')[1].split('.')[0],
                duration_seconds: durationSeconds,
                completed: completed,
                study_week: studyWeek
            });

        if (error) {
            console.error('Erro ao registrar sessão:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro inesperado ao registrar sessão:', error);
        return false;
    }
}
