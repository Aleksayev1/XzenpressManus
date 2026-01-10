import { useState, useEffect } from 'react';
import { SessionHistoryService, SessionData, SessionStats } from '../services/sessionHistoryService';
import { useAuth } from '../contexts/AuthContext';

export const useSessionHistory = (period: 'week' | 'month' | 'year' = 'week') => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setStats(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calcular datas do período
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const userSessions = await SessionHistoryService.fetchUserSessions(user.id, {
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        limit: 100
      });

      setSessions(userSessions);
      
      // Calcular estatísticas
      const calculatedStats = SessionHistoryService.calculateStats(userSessions, period);
      setStats(calculatedStats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(errorMessage);
      console.error('Erro ao buscar sessões:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordSession = async (sessionData: Omit<SessionData, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const newSession = await SessionHistoryService.recordSession({
        ...sessionData,
        userId: user.id
      });

      if (newSession) {
        // Atualizar lista local
        setSessions(prev => [newSession, ...prev]);
        
        // Recalcular estatísticas
        const updatedSessions = [newSession, ...sessions];
        const updatedStats = SessionHistoryService.calculateStats(updatedSessions, period);
        setStats(updatedStats);
      }

      return newSession;
    } catch (error) {
      console.error('Erro ao registrar sessão:', error);
      throw error;
    }
  };

  const updateSessionRating = async (sessionId: string, rating: number) => {
    try {
      const success = await SessionHistoryService.updateSessionRating(sessionId, rating);
      
      if (success) {
        // Atualizar sessão local
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, effectivenessRating: rating }
            : session
        ));
        
        // Recalcular estatísticas
        const updatedSessions = sessions.map(session => 
          session.id === sessionId 
            ? { ...session, effectivenessRating: rating }
            : session
        );
        const updatedStats = SessionHistoryService.calculateStats(updatedSessions, period);
        setStats(updatedStats);
      }

      return success;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  };

  // Carregar sessões quando usuário ou período mudar
  useEffect(() => {
    fetchSessions();
  }, [user, period]);

  return {
    sessions,
    stats,
    loading,
    error,
    recordSession,
    updateSessionRating,
    refetch: fetchSessions
  };
};