import { useState, useCallback, useEffect } from 'react';

export interface CoherenceSnapshot {
  rmssd: number;
  anxietyScore: number;
  timestamp: Date | string;
}

export interface CoherenceResult {
  score: number;
  tier: 'Baixa' | 'Moderada' | 'Alta' | 'Excelente';
  deltaRmssd: number;
  deltaAnxiety: number;
  improved: boolean;
  explanation: string;
}

export interface CumulativeStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  totalRmssdGain: number;
}

export function computeCoherenceResult(
  before: CoherenceSnapshot,
  after: CoherenceSnapshot
): CoherenceResult {
  const deltaRmssd = after.rmssd - before.rmssd;
  const deltaAnxiety = before.anxietyScore - after.anxietyScore;

  let baseScore = 50;

  if (before.rmssd > 0 && after.rmssd > 0) {
    const rmssdFactor = Math.min(40, Math.max(-30, deltaRmssd * 2.5));
    baseScore += rmssdFactor;
  }

  const anxietyFactor = Math.min(30, Math.max(-20, deltaAnxiety * 5));
  baseScore += anxietyFactor;

  const finalScore = Math.min(100, Math.max(10, Math.round(baseScore)));

  let tier: 'Baixa' | 'Moderada' | 'Alta' | 'Excelente' = 'Moderada';
  if (finalScore >= 85) tier = 'Excelente';
  else if (finalScore >= 70) tier = 'Alta';
  else if (finalScore >= 45) tier = 'Moderada';
  else tier = 'Baixa';

  const improved = deltaAnxiety > 0 || deltaRmssd > 0;

  let explanation = 'Sua sessão promoveu reequilíbrio parassimpático e desaceleração do estresse.';
  if (tier === 'Excelente') {
    explanation = 'Excelente coerência! Seu ritmo cardíaco e estado emocional entraram em sincronia fisiológica perfeita.';
  } else if (tier === 'Alta') {
    explanation = 'Alta coerência! Houve nítida redução no tônus simpático e recuperação autonômica.';
  } else if (tier === 'Baixa') {
    explanation = 'Sua coerência foi inicial. Praticar os ciclos diários ajudará seu sistema nervoso a assimilar o relaxamento.';
  }

  return {
    score: finalScore,
    tier,
    deltaRmssd,
    deltaAnxiety,
    improved,
    explanation,
  };
}

export function useCoherenceScore(userId?: string) {
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    totalRmssdGain: 0,
  });

  const loadCumulativeStats = useCallback(() => {
    try {
      const raw = localStorage.getItem(`coherence_stats_${userId || 'guest'}`);
      if (raw) {
        setCumulativeStats(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Error loading coherence stats:', e);
    }
  }, [userId]);

  const saveCoherenceResult = useCallback(
    (
      before: CoherenceSnapshot,
      after: CoherenceSnapshot,
      result: CoherenceResult,
      sessionType: string = 'integrated',
      durationSeconds: number = 600
    ) => {
      try {
        const storageKey = `coherence_history_${userId || 'guest'}`;
        const existingHistoryRaw = localStorage.getItem(storageKey);
        const history = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];

        const newEntry = {
          before,
          after,
          result,
          sessionType,
          durationSeconds,
          timestamp: new Date().toISOString(),
        };

        history.push(newEntry);
        localStorage.setItem(storageKey, JSON.stringify(history));

        const totalSessions = history.length;
        const sumScores = history.reduce((acc: number, item: any) => acc + (item.result?.score || 50), 0);
        const bestScore = history.reduce((max: number, item: any) => Math.max(max, item.result?.score || 0), 0);
        const totalRmssdGain = history.reduce((acc: number, item: any) => acc + Math.max(0, item.result?.deltaRmssd || 0), 0);

        const newStats: CumulativeStats = {
          totalSessions,
          averageScore: Math.round(sumScores / totalSessions),
          bestScore,
          totalRmssdGain,
        };

        localStorage.setItem(`coherence_stats_${userId || 'guest'}`, JSON.stringify(newStats));
        setCumulativeStats(newStats);
      } catch (e) {
        console.warn('Error saving coherence result:', e);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadCumulativeStats();
  }, [loadCumulativeStats]);

  return {
    saveCoherenceResult,
    loadCumulativeStats,
    cumulativeStats,
  };
}
