import { supabase } from '../lib/supabase';
import { type AnamneseProfile } from '../data/anamneseProfile';
import { type WeeklyCheckinData } from '../components/WeeklyCheckin';

// Prefixos para cache local redundante/offline
const LOCAL_ANAMNESE_PREFIX = 'xzenpress_anamnese_v1';
const LOCAL_MAPA_STATE_PREFIX = 'xzenpress_mapa_vivo_v1';

export const MapaVivoStorageService = {
  /**
   * Salva o perfil de anamnese no Supabase com redundância local
   */
  async saveAnamneseProfile(userId: string, profile: AnamneseProfile): Promise<boolean> {
    try {
      // Salva no localStorage como backup de contingência
      localStorage.setItem(LOCAL_ANAMNESE_PREFIX, JSON.stringify(profile));
      localStorage.setItem(`xzen_anamnese_${userId}`, JSON.stringify(profile));

      const dbData = {
        user_id: userId,
        nome: profile.nome || null,
        faixa_etaria: profile.faixaEtaria,
        sexo_biologico: profile.sexoBiologico,
        objetivo_principal: profile.objetivoPrincipal,
        qualidade_sono: profile.qualidadeSono,
        nivel_energia: profile.nivelEnergia,
        nivel_estresse: profile.nivelEstresse,
        nivel_atividade: profile.nivelAtividade,
        padrao_alimentar: profile.padraoAlimentar,
        sintomas_fisicos: profile.sintomasFisicos || [],
        emocoes_dominantes: profile.emocoesDominantes || [],
        condicoes_existentes: profile.condicoesExistentes || [],
        medicamentos_em_uso: profile.medicamentosEmUso || [],
        guardian_scores: profile.guardianScores,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('xzen_anamnese_profiles')
        .upsert(dbData);

      if (error) {
        console.error('Erro ao salvar anamnese no Supabase:', error);
        return false;
      }

      console.log('✅ Anamnese sincronizada no Supabase.');
      return true;
    } catch (e) {
      console.error('Erro inesperado ao salvar anamnese:', e);
      return false;
    }
  },

  /**
   * Carrega o perfil de anamnese
   */
  async loadAnamneseProfile(userId: string): Promise<AnamneseProfile | null> {
    try {
      const { data, error } = await supabase
        .from('xzen_anamnese_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const profile: AnamneseProfile = {
          nome: data.nome || undefined,
          faixaEtaria: data.faixa_etaria,
          sexoBiologico: data.sexo_biologico,
          objetivoPrincipal: data.objetivo_principal,
          qualidadeSono: data.qualidade_sono,
          nivelEnergia: data.nivel_energia,
          nivelEstresse: data.nivel_estresse,
          nivelAtividade: data.nivel_atividade,
          padraoAlimentar: data.padrao_alimentar,
          sintomasFisicos: data.sintomas_fisicos || [],
          emocoesDominantes: data.emocoes_dominantes || [],
          condicoesExistentes: data.condicoes_existentes || [],
          medicamentos_em_uso: data.medicamentos_em_uso || [],
          guardianScores: data.guardian_scores,
          completedAt: data.completed_at,
          version: 1
        };

        // Cache local
        localStorage.setItem(LOCAL_ANAMNESE_PREFIX, JSON.stringify(profile));
        localStorage.setItem(`xzen_anamnese_${userId}`, JSON.stringify(profile));
        return profile;
      }

      // Fallback local
      const saved = localStorage.getItem(`xzen_anamnese_${userId}`) || localStorage.getItem(LOCAL_ANAMNESE_PREFIX);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Erro ao carregar anamnese:', e);
      const saved = localStorage.getItem(`xzen_anamnese_${userId}`) || localStorage.getItem(LOCAL_ANAMNESE_PREFIX);
      return saved ? JSON.parse(saved) : null;
    }
  },

  /**
   * Salva o estado atual do Mapa Vivo no Supabase
   */
  async saveMapaVivoState(userId: string, state: any): Promise<boolean> {
    try {
      localStorage.setItem(LOCAL_MAPA_STATE_PREFIX, JSON.stringify(state));
      localStorage.setItem(`xzen_mapa_state_${userId}`, JSON.stringify(state));

      const dbData = {
        user_id: userId,
        has_completed_onboarding: state.hasCompletedOnboarding,
        scores: state.scores,
        dominant_guardian_id: state.dominantGuardianId,
        last_checkin_date: state.lastCheckinDate,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('xzen_mapa_vivo_states')
        .upsert(dbData);

      if (error) {
        console.error('Erro ao salvar estado do Mapa Vivo no Supabase:', error);
        return false;
      }

      console.log('✅ Estado do Mapa Vivo sincronizado.');
      return true;
    } catch (e) {
      console.error('Erro inesperado ao salvar estado do Mapa Vivo:', e);
      return false;
    }
  },

  /**
   * Carrega o estado atual do Mapa Vivo
   */
  async loadMapaVivoState(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('xzen_mapa_vivo_states')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const state = {
          hasCompletedOnboarding: data.has_completed_onboarding,
          scores: data.scores,
          dominantGuardianId: data.dominant_guardian_id,
          checkins: [], // Será carregado separadamente por loadCheckins
          lastCheckinDate: data.last_checkin_date,
          createdAt: data.created_at
        };

        // Cache local
        localStorage.setItem(LOCAL_MAPA_STATE_PREFIX, JSON.stringify(state));
        localStorage.setItem(`xzen_mapa_state_${userId}`, JSON.stringify(state));
        return state;
      }

      const saved = localStorage.getItem(`xzen_mapa_state_${userId}`) || localStorage.getItem(LOCAL_MAPA_STATE_PREFIX);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Erro ao carregar estado do Mapa Vivo:', e);
      const saved = localStorage.getItem(`xzen_mapa_state_${userId}`) || localStorage.getItem(LOCAL_MAPA_STATE_PREFIX);
      return saved ? JSON.parse(saved) : null;
    }
  },

  /**
   * Grava um novo checkin no Supabase
   */
  async saveCheckin(userId: string, checkin: WeeklyCheckinData): Promise<boolean> {
    try {
      const dbData = {
        user_id: userId,
        date: checkin.date.split('T')[0], // Apenas a data YYYY-MM-DD
        sleep_score: checkin.sleepScore,
        energy_score: checkin.energyScore,
        emotion_guardian_id: checkin.emotionGuardianId,
        challenges: checkin.challenge || null,
        victories: checkin.victory || null
      };

      const { error } = await supabase
        .from('xzen_mapa_vivo_checkins')
        .insert(dbData);

      if (error) {
        console.error('Erro ao salvar check-in no Supabase:', error);
        return false;
      }

      console.log('✅ Check-in salvo no Supabase.');
      return true;
    } catch (e) {
      console.error('Erro inesperado ao salvar check-in:', e);
      return false;
    }
  },

  /**
   * Carrega os checkins históricos do Supabase
   */
  async loadCheckins(userId: string): Promise<WeeklyCheckinData[]> {
    try {
      const { data, error } = await supabase
        .from('xzen_mapa_vivo_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (data && !error) {
        const checkins: WeeklyCheckinData[] = data.map(item => ({
          date: new Date(item.date).toISOString(),
          sleepScore: item.sleep_score,
          energyScore: item.energy_score,
          emotionGuardianId: item.emotion_guardian_id,
          challenge: item.challenges || undefined,
          victory: item.victories || undefined
        }));

        localStorage.setItem(`xzen_checkins_${userId}`, JSON.stringify(checkins));
        return checkins;
      }

      const saved = localStorage.getItem(`xzen_checkins_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Erro ao carregar check-ins:', e);
      const saved = localStorage.getItem(`xzen_checkins_${userId}`);
      return saved ? JSON.parse(saved) : [];
    }
  },

  /**
   * Sincroniza dados locais criados offline ou anonimamente para a nuvem
   */
  async syncLocalDataToCloud(userId: string): Promise<void> {
    try {
      // 1. Sincronizar Anamnese
      const localAnamnese = localStorage.getItem(LOCAL_ANAMNESE_PREFIX);
      if (localAnamnese) {
        const profile = JSON.parse(localAnamnese);
        const success = await this.saveAnamneseProfile(userId, profile);
        if (success) {
          localStorage.removeItem(LOCAL_ANAMNESE_PREFIX);
        }
      }

      // 2. Sincronizar Estado do Mapa Vivo
      const localState = localStorage.getItem(LOCAL_MAPA_STATE_PREFIX);
      if (localState) {
        const state = JSON.parse(localState);
        const success = await this.saveMapaVivoState(userId, state);
        if (success) {
          localStorage.removeItem(LOCAL_MAPA_STATE_PREFIX);
        }
      }
    } catch (e) {
      console.error('Erro durante sincronização automática de dados locais:', e);
    }
  },

  /**
   * Reseta os dados de estado e check-ins do usuário no Supabase
   */
  async resetUserData(userId: string): Promise<boolean> {
    try {
      const { error: stateError } = await supabase
        .from('xzen_mapa_vivo_states')
        .delete()
        .eq('user_id', userId);

      const { error: checkinError } = await supabase
        .from('xzen_mapa_vivo_checkins')
        .delete()
        .eq('user_id', userId);

      localStorage.removeItem(`xzen_mapa_state_${userId}`);
      localStorage.removeItem(`xzen_checkins_${userId}`);

      return !stateError && !checkinError;
    } catch (e) {
      console.error('Erro ao resetar dados do Mapa Vivo:', e);
      return false;
    }
  }
};
