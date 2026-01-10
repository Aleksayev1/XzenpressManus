import { supabase } from '../lib/supabase';

export interface SessionData {
  id?: string;
  userId: string;
  sessionType: 'breathing' | 'acupressure' | 'chromotherapy' | 'integrated';
  durationSeconds: number;
  effectivenessRating?: number;
  pointsUsed?: string[];
  sessionData?: Record<string, any>;
  completedAt?: string;
  createdAt?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalTime: number;
  averageEffectiveness: number;
  streakDays: number;
  favoritePoint: string;
  improvementTrend: number;
  sessionsByType: Record<string, number>;
  dailyActivity: Array<{ date: string; sessions: number }>;
}

export class SessionHistoryService {
  /**
   * Registra uma nova sessão no histórico
   */
  static async recordSession(sessionData: Omit<SessionData, 'id' | 'createdAt'>): Promise<SessionData | null> {
    if (!supabase) {
      console.warn('Supabase não configurado. Salvando sessão localmente para demonstração.');
      
      // Salvar localmente para demonstração
      const localSessions = this.getLocalSessions();
      const newSession: SessionData = {
        id: `local_${Date.now()}`,
        ...sessionData,
        createdAt: new Date().toISOString()
      };
      localSessions.push(newSession);
      localStorage.setItem('xzenpress_sessions', JSON.stringify(localSessions));
      
      return newSession;
    }

    try {
      const { data, error } = await supabase
        .from('session_history')
        .insert([{
          user_id: sessionData.userId,
          session_type: sessionData.sessionType,
          duration_seconds: sessionData.durationSeconds,
          effectiveness_rating: sessionData.effectivenessRating,
          points_used: sessionData.pointsUsed || [],
          session_data: sessionData.sessionData || {},
          completed_at: sessionData.completedAt || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar sessão:', error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        sessionType: data.session_type,
        durationSeconds: data.duration_seconds,
        effectivenessRating: data.effectiveness_rating,
        pointsUsed: data.points_used,
        sessionData: data.session_data,
        completedAt: data.completed_at,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      throw error;
    }
  }

  /**
   * Busca o histórico de sessões do usuário
   */
  static async fetchUserSessions(
    userId: string, 
    options?: {
      startDate?: string;
      endDate?: string;
      sessionType?: string;
      limit?: number;
    }
  ): Promise<SessionData[]> {
    if (!supabase) {
      console.warn('Supabase não configurado. Usando dados locais.');
      return this.getLocalSessions().filter(session => session.userId === userId);
    }

    try {
      let query = supabase
        .from('session_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (options?.startDate) {
        query = query.gte('completed_at', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('completed_at', options.endDate);
      }

      if (options?.sessionType) {
        query = query.eq('session_type', options.sessionType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        throw error;
      }

      return (data || []).map(session => ({
        id: session.id,
        userId: session.user_id,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        effectivenessRating: session.effectiveness_rating,
        pointsUsed: session.points_used,
        sessionData: session.session_data,
        completedAt: session.completed_at,
        createdAt: session.created_at
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico de sessões:', error);
      throw error;
    }
  }

  /**
   * Calcula estatísticas baseadas no histórico de sessões
   */
  static calculateStats(sessions: SessionData[], period: 'week' | 'month' | 'year' = 'week'): SessionStats {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageEffectiveness: 0,
        streakDays: 0,
        favoritePoint: 'Nenhum',
        improvementTrend: 0,
        sessionsByType: {},
        dailyActivity: []
      };
    }

    // Filtrar sessões por período
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodSessions = sessions.filter(session => 
      new Date(session.completedAt || session.createdAt || '') >= periodStart
    );

    // Calcular estatísticas básicas
    const totalSessions = periodSessions.length;
    const totalTime = periodSessions.reduce((acc, session) => acc + session.durationSeconds, 0);
    const averageEffectiveness = periodSessions.length > 0 
      ? periodSessions.reduce((acc, session) => acc + (session.effectivenessRating || 0), 0) / periodSessions.length
      : 0;

    // Calcular sequência de dias
    const streakDays = this.calculateStreakDays(sessions);

    // Encontrar ponto favorito
    const pointUsage: Record<string, number> = {};
    periodSessions.forEach(session => {
      if (session.pointsUsed) {
        session.pointsUsed.forEach(point => {
          pointUsage[point] = (pointUsage[point] || 0) + 1;
        });
      }
    });
    
    const favoritePoint = Object.keys(pointUsage).length > 0
      ? Object.entries(pointUsage).sort(([,a], [,b]) => b - a)[0][0]
      : 'Nenhum';

    // Calcular tendência de melhoria
    const improvementTrend = this.calculateImprovementTrend(sessions, period);

    // Sessões por tipo
    const sessionsByType: Record<string, number> = {};
    periodSessions.forEach(session => {
      sessionsByType[session.sessionType] = (sessionsByType[session.sessionType] || 0) + 1;
    });

    // Atividade diária
    const dailyActivity = this.calculateDailyActivity(periodSessions, period);

    return {
      totalSessions,
      totalTime,
      averageEffectiveness,
      streakDays,
      favoritePoint,
      improvementTrend,
      sessionsByType,
      dailyActivity
    };
  }

  /**
   * Calcula sequência de dias consecutivos
   */
  private static calculateStreakDays(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const sessionDates = [...new Set(
      sessions.map(session => 
        new Date(session.completedAt || session.createdAt || '').toDateString()
      )
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = currentDate.toDateString();
      
      if (sessionDates.includes(sessionDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcula tendência de melhoria baseada na efetividade
   */
  private static calculateImprovementTrend(sessions: SessionData[], period: 'week' | 'month' | 'year'): number {
    if (sessions.length < 2) return 0;

    const now = new Date();
    const periodStart = new Date();
    const previousPeriodStart = new Date();
    
    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        previousPeriodStart.setDate(now.getDate() - 14);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        previousPeriodStart.setMonth(now.getMonth() - 2);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        previousPeriodStart.setFullYear(now.getFullYear() - 2);
        break;
    }

    const currentPeriodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt || '');
      return sessionDate >= periodStart && sessionDate <= now;
    });

    const previousPeriodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt || '');
      return sessionDate >= previousPeriodStart && sessionDate < periodStart;
    });

    if (currentPeriodSessions.length === 0 || previousPeriodSessions.length === 0) {
      return 0;
    }

    const currentAvg = currentPeriodSessions.reduce((acc, s) => acc + (s.effectivenessRating || 0), 0) / currentPeriodSessions.length;
    const previousAvg = previousPeriodSessions.reduce((acc, s) => acc + (s.effectivenessRating || 0), 0) / previousPeriodSessions.length;

    return previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
  }

  /**
   * Calcula atividade diária
   */
  private static calculateDailyActivity(sessions: SessionData[], period: 'week' | 'month' | 'year'): Array<{ date: string; sessions: number }> {
    const dailyCount: Record<string, number> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.completedAt || session.createdAt || '').toDateString();
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });

    return Object.entries(dailyCount)
      .map(([date, sessions]) => ({ date, sessions }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Atualiza avaliação de efetividade de uma sessão
   */
  static async updateSessionRating(sessionId: string, rating: number): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase não configurado. Atualizando localmente.');
      const localSessions = this.getLocalSessions();
      const sessionIndex = localSessions.findIndex(s => s.id === sessionId);
      if (sessionIndex >= 0) {
        localSessions[sessionIndex].effectivenessRating = rating;
        localStorage.setItem('xzenpress_sessions', JSON.stringify(localSessions));
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('session_history')
        .update({ effectiveness_rating: rating })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao atualizar avaliação:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return false;
    }
  }

  /**
   * Busca sessões locais (fallback quando Supabase não está configurado)
   */
  private static getLocalSessions(): SessionData[] {
    try {
      const stored = localStorage.getItem('xzenpress_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar sessões locais:', error);
      return [];
    }
  }

  /**
   * Limpa dados locais (para desenvolvimento)
   */
  static clearLocalData(): void {
    localStorage.removeItem('xzenpress_sessions');
    console.log('Dados locais de sessões limpos');
  }
}