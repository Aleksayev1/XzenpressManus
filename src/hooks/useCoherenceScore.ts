/**
 * useCoherenceScore — Body-Mind Coherence Score Engine
 * =====================================================
 * Calcula o Índice de Coerência Mente-Corpo (ICX) a partir de:
 *   - RMSSD real medido via BLE (useBLEHeartRate) antes/depois da sessão
 *   - Nível de ansiedade subjetiva declarado (0-10) antes/depois
 *   - Padrão respiratório (implícito via duração do pacer)
 *
 * Os resultados são salvos no Supabase para rastreamento cumulativo
 * e cálculo da tendência epigenética ao longo do tempo.
 *
 * Base científica:
 *   - RMSSD como biomarcador de tônus vagal: Task Force, 1996, Eur Heart J
 *   - Coerência cardíaca (0.1 Hz LF peak): McCraty et al., HeartMath 2006
 *   - Efeito cumulativo em VFC com prática regular: Wheat & Larkin, 2010
 */

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CoherenceSnapshot {
  rmssd: number;          // ms - variabilidade real do BLE
  anxietyScore: number;   // 0-10 declarado pelo usuário
  timestamp: Date;
}

export interface CoherenceResult {
  /** Índice de Coerência da sessão (0–100) */
  icx: number;
  /** Delta RMSSD em ms (positivo = melhora) */
  rmssdDelta: number;
  /** Delta ansiedade (negativo = melhora) */
  anxietyDelta: number;
  /** Percentual de melhora do RMSSD */
  rmssdImprovementPct: number;
  /** Nível verbal da coerência */
  coherenceLevel: 'crítico' | 'baixo' | 'moderado' | 'alto' | 'ótimo';
  /** Cor associada ao nível */
  coherenceColor: string;
  /** Mensagem clínica explicativa */
  clinicalMessage: string;
  /** Mensagem epigenética contextual */
  epigeneticMessage: string;
}

export interface CumulativeStats {
  /** Total de sessões com medição biométrica */
  totalMeasuredSessions: number;
  /** RMSSD médio histórico (ms) */
  averageRmssd: number;
  /** Tendência de melhora do RMSSD nos últimos 30 dias (%) */
  rmssdTrend30d: number;
  /** ICX médio histórico */
  averageIcx: number;
  /** Dias com prática consecutiva */
  streakDays: number;
  /** Dados históricos para gráfico (últimas 10 sessões) */
  history: Array<{
    date: string;
    rmssdBefore: number;
    rmssdAfter: number;
    icx: number;
  }>;
}

// ─── Cálculos Centrais ────────────────────────────────────────────────────────

/**
 * Interpreta o RMSSD segundo faixas clínicas estabelecidas.
 * Faixas baseadas em: Task Force of ESC/NASPE, 1996
 */
function classifyRmssd(rmssd: number): {
  level: CoherenceResult['coherenceLevel'];
  color: string;
} {
  if (rmssd < 20)  return { level: 'crítico',  color: '#ef4444' };
  if (rmssd < 35)  return { level: 'baixo',    color: '#f97316' };
  if (rmssd < 50)  return { level: 'moderado', color: '#eab308' };
  if (rmssd < 70)  return { level: 'alto',     color: '#22c55e' };
  return              { level: 'ótimo',     color: '#06b6d4' };
}

/**
 * Calcula o Índice de Coerência (ICX) a partir dos dados biométricos.
 * Fórmula ponderada:
 *   - RMSSD after (peso 50%): normalizado para 0-100 na faixa 10-100ms
 *   - Delta RMSSD (peso 30%): ganho relativo na sessão
 *   - Melhora subjetiva de ansiedade (peso 20%): escala 0-10 invertida
 */
export function computeCoherenceResult(
  before: CoherenceSnapshot,
  after: CoherenceSnapshot
): CoherenceResult {
  // Normalizar RMSSD final (10ms = 0%, 100ms = 100%)
  const rmssdScore = Math.min(100, Math.max(0, ((after.rmssd - 10) / 90) * 100));

  // Delta e percentual de melhora do RMSSD
  const rmssdDelta = after.rmssd - before.rmssd;
  const rmssdImprovementPct = before.rmssd > 0
    ? Math.round((rmssdDelta / before.rmssd) * 100)
    : 0;

  // Normalizar delta RMSSD (ganho de 0-30ms mapeado para 0-100)
  const deltaScore = Math.min(100, Math.max(0, (rmssdDelta / 30) * 100));

  // Melhora de ansiedade (escala invertida: 0 = ótimo, 10 = pior)
  const anxietyDelta = before.anxietyScore - after.anxietyScore;
  const anxietyScore = Math.min(100, Math.max(0, (anxietyDelta / 10) * 100 + 50));

  // ICX ponderado final
  const icx = Math.round(rmssdScore * 0.5 + deltaScore * 0.3 + anxietyScore * 0.2);

  const { level: coherenceLevel, color: coherenceColor } = classifyRmssd(after.rmssd);

  // Mensagem clínica baseada no RMSSD final e delta
  const clinicalMessage = buildClinicalMessage(after.rmssd, rmssdDelta);

  // Mensagem epigenética contextual
  const epigeneticMessage = buildEpigeneticMessage(rmssdDelta, rmssdImprovementPct);

  return {
    icx,
    rmssdDelta,
    anxietyDelta,
    rmssdImprovementPct,
    coherenceLevel,
    coherenceColor,
    clinicalMessage,
    epigeneticMessage,
  };
}

function buildClinicalMessage(rmssdAfter: number, delta: number): string {
  if (delta > 10) {
    return `Excelente resposta autonômica. Seu RMSSD aumentou ${Math.round(delta)}ms, indicando ativação significativa do nervo vago e inibição do eixo simpático-adrenal.`;
  }
  if (delta > 3) {
    return `Boa resposta parassimpática. O aumento de ${Math.round(delta)}ms no RMSSD indica que sua respiração guiada ativou o tônus vagal e reduziu o estado de alerta do sistema nervoso.`;
  }
  if (delta >= 0) {
    return `Sistema nervoso estabilizado. Seu RMSSD atual de ${Math.round(rmssdAfter)}ms indica que o organismo manteve equilíbrio autonômico durante a sessão.`;
  }
  return `Sessão de adaptação. Variações negativas de RMSSD são comuns em primeiras sessões — o sistema nervoso está aprendendo a regular seu próprio ritmo.`;
}

function buildEpigeneticMessage(delta: number, pct: number): string {
  if (pct > 15) {
    return `Cada sessão com ganho de VFC dessa magnitude reforça a expressão de genes ligados à regulação inflamatória e neuroplasticidade. O efeito acumula-se semana a semana.`;
  }
  if (pct > 5) {
    return `A prática regular com esses ganhos de VFC foi associada à redução da metilação de genes pró-inflamatórios em estudos de meditação de longo prazo (Davidson et al., 2003).`;
  }
  return `Consistência é o motor epigenético. Mesmo sessões com ganhos menores criam padrões cumulativos que moldam a expressão gênica ao longo de semanas e meses.`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCoherenceScore(userId: string | undefined) {
  const [isSaving, setIsSaving] = useState(false);
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  /**
   * Salva o resultado de coerência no Supabase dentro de session_history.
   * Usa o campo session_data (JSONB) para guardar os dados biométricos.
   */
  const saveCoherenceResult = useCallback(async (
    before: CoherenceSnapshot,
    after: CoherenceSnapshot,
    result: CoherenceResult,
    sessionType: string = 'integrated',
    durationSeconds: number = 600
  ) => {
    if (!userId) return;
    setIsSaving(true);

    const payload = {
      user_id: userId,
      session_type: sessionType,
      duration_seconds: durationSeconds,
      effectiveness_rating: Math.round(result.icx / 10), // 0-10 scale
      session_data: {
        coherence: {
          icx: result.icx,
          rmssd_before: before.rmssd,
          rmssd_after: after.rmssd,
          rmssd_delta: result.rmssdDelta,
          rmssd_improvement_pct: result.rmssdImprovementPct,
          anxiety_before: before.anxietyScore,
          anxiety_after: after.anxietyScore,
          anxiety_delta: result.anxietyDelta,
          coherence_level: result.coherenceLevel,
        }
      },
      completed_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        await supabase.from('session_history').insert([payload]);
      } else {
        // Fallback localStorage
        const local = JSON.parse(localStorage.getItem('xzenpress_sessions') || '[]');
        local.push({ id: `local_${Date.now()}`, ...payload, created_at: new Date().toISOString() });
        localStorage.setItem('xzenpress_sessions', JSON.stringify(local));
      }
    } catch (err) {
      console.error('[CoherenceScore] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  /**
   * Carrega o histórico cumulativo de coerência do usuário.
   */
  const loadCumulativeStats = useCallback(async () => {
    if (!userId) return;
    setIsLoadingStats(true);

    try {
      let sessions: any[] = [];

      if (supabase) {
        const { data } = await supabase
          .from('session_history')
          .select('*')
          .eq('user_id', userId)
          .not('session_data->coherence', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(60);
        sessions = data || [];
      } else {
        const local = JSON.parse(localStorage.getItem('xzenpress_sessions') || '[]');
        sessions = local
          .filter((s: any) => s.user_id === userId && s.session_data?.coherence)
          .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      }

      if (sessions.length === 0) {
        setCumulativeStats(null);
        return;
      }

      const measuredSessions = sessions.filter(s => s.session_data?.coherence?.rmssd_after > 0);
      const rmssdValues = measuredSessions.map(s => s.session_data.coherence.rmssd_after);
      const icxValues = measuredSessions.map(s => s.session_data.coherence.icx);

      const averageRmssd = rmssdValues.length > 0
        ? Math.round(rmssdValues.reduce((a, b) => a + b, 0) / rmssdValues.length)
        : 0;

      const averageIcx = icxValues.length > 0
        ? Math.round(icxValues.reduce((a, b) => a + b, 0) / icxValues.length)
        : 0;

      // Tendência 30 dias: compara média dos últimos 15 vs anteriores 15
      const recent15 = rmssdValues.slice(0, 15);
      const prev15 = rmssdValues.slice(15, 30);
      const recentAvg = recent15.length > 0 ? recent15.reduce((a, b) => a + b, 0) / recent15.length : 0;
      const prevAvg = prev15.length > 0 ? prev15.reduce((a, b) => a + b, 0) / prev15.length : recentAvg;
      const rmssdTrend30d = prevAvg > 0 ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100) : 0;

      // Streak
      const sessionDates = [...new Set(
        sessions.map(s => new Date(s.completed_at).toDateString())
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streakDays = 0;
      let checkDate = new Date();
      for (const ds of sessionDates) {
        if (ds === checkDate.toDateString()) {
          streakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }

      // Histórico para gráfico (últimas 10)
      const history = measuredSessions.slice(0, 10).reverse().map(s => ({
        date: new Date(s.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        rmssdBefore: s.session_data.coherence.rmssd_before,
        rmssdAfter: s.session_data.coherence.rmssd_after,
        icx: s.session_data.coherence.icx,
      }));

      setCumulativeStats({
        totalMeasuredSessions: measuredSessions.length,
        averageRmssd,
        rmssdTrend30d,
        averageIcx,
        streakDays,
        history,
      });
    } catch (err) {
      console.error('[CoherenceScore] Load error:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [userId]);

  return {
    saveCoherenceResult,
    loadCumulativeStats,
    cumulativeStats,
    isSaving,
    isLoadingStats,
    computeResult: computeCoherenceResult,
  };
}
