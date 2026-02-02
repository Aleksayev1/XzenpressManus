import { supabase } from '../lib/supabase';

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    activityMap: Record<string, number>; // Date -> Session Count
    level: 'iniciante' | 'buscador' | 'desperto' | 'mestre';
    nextLevelThreshold: number;
}

export const StreakService = {
    /**
     * Calcula o streak atual e histórico do usuário
     */
    async calculateStreak(userId: string): Promise<StreakData> {
        if (!userId) return this.getEmptyStreak();

        try {
            // Buscar sessões dos últimos 365 dias (otimização)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const { data: sessions, error } = await supabase
                .from('session_history')
                .select('created_at')
                .eq('user_id', userId)
                .gte('created_at', oneYearAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!sessions || sessions.length === 0) return this.getEmptyStreak();

            // Mapear dias ativos (Set para unicidade)
            const activityMap: Record<string, number> = {};
            const uniqueDays = new Set<string>();

            sessions.forEach(session => {
                const date = new Date(session.created_at).toISOString().split('T')[0];
                uniqueDays.add(date);
                activityMap[date] = (activityMap[date] || 0) + 1;
            });

            const sortedDates = Array.from(uniqueDays).sort().reverse(); // Decrescente (hoje -> passado)

            // Calcular Current Streak
            let currentStreak = 0;
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Se a última atividade foi hoje ou ontem, o streak está vivo
            if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
                // Encontrar cadeia consecutiva
                let checkDate = new Date(sortedDates[0]); // Começa da data mais recente

                // Ajuste: se a data mais recente for hoje, começamos a contar. 
                // Se for ontem, também. Se for antes de ontem, o streak quebrou.

                currentStreak = 1; // Pelo menos o dia mais recente conta

                for (let i = 0; i < sortedDates.length - 1; i++) {
                    const dateCurr = new Date(sortedDates[i]);
                    const datePrev = new Date(sortedDates[i + 1]);

                    const diffTime = Math.abs(dateCurr.getTime() - datePrev.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break; // Quebrou a sequência
                    }
                }
            } else {
                currentStreak = 0; // Streak quebrado
            }

            // Calcular Longest Streak (Algoritmo simples)
            let longestStreak = currentStreak;
            let tempStreak = 1;

            for (let i = 0; i < sortedDates.length - 1; i++) {
                const dateCurr = new Date(sortedDates[i]);
                const datePrev = new Date(sortedDates[i + 1]);
                const diffDays = Math.ceil(Math.abs(dateCurr.getTime() - datePrev.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);


            return {
                currentStreak,
                longestStreak: Math.max(longestStreak, currentStreak), // Ensure logical consistency
                lastActivityDate: sortedDates[0] || null,
                activityMap,
                level: this.getLevel(currentStreak),
                nextLevelThreshold: this.getNextThreshold(currentStreak)
            };

        } catch (err) {
            console.error('Erro ao calcular streak:', err);
            return this.getEmptyStreak();
        }
    },

    getEmptyStreak(): StreakData {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            activityMap: {},
            level: 'iniciante',
            nextLevelThreshold: 3
        };
    },

    getLevel(streak: number): StreakData['level'] {
        if (streak >= 90) return 'mestre';
        if (streak >= 21) return 'desperto';
        if (streak >= 7) return 'buscador';
        return 'iniciante';
    },

    getNextThreshold(streak: number): number {
        if (streak >= 90) return 365; // Next global goal
        if (streak >= 21) return 90;
        if (streak >= 7) return 21;
        return 7;
    }
};
