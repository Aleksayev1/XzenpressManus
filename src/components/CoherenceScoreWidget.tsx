import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Zap, ChevronRight, Info } from 'lucide-react';
import type { CoherenceResult, CumulativeStats } from '../hooks/useCoherenceScore';

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function MetricBadge({ label, value, unit, color }: {
  label: string; value: number | string; unit?: string; color?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-2xl font-black" style={{ color: color || '#a78bfa' }}>
        {value}{unit && <span className="text-sm font-semibold ml-0.5">{unit}</span>}
      </span>
      <span className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

function TrendIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (delta < 0) return <TrendingDown className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
}

// ─── Mini Sparkline (bar chart) ──────────────────────────────────────────────

function SparklineChart({ history }: { history: CumulativeStats['history'] }) {
  if (!history || history.length < 2) return null;
  const maxRmssd = Math.max(...history.map(h => h.rmssdAfter), 1);

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">RMSSD · Histórico de Sessões</div>
      <div className="flex items-end gap-1.5 h-20">
        {history.map((h, i) => {
          const height = Math.max(8, (h.rmssdAfter / maxRmssd) * 80);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: `${height}px`,
                  background: h.rmssdAfter >= 50
                    ? 'linear-gradient(to top, #22c55e, #4ade80)'
                    : h.rmssdAfter >= 35
                    ? 'linear-gradient(to top, #eab308, #fde047)'
                    : 'linear-gradient(to top, #ef4444, #f87171)',
                }}
              />
              <span className="text-[9px] text-gray-600">{h.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

interface CoherenceScoreWidgetProps {
  result: CoherenceResult;
  rmssdBefore: number;
  rmssdAfter: number;
  cumulative?: CumulativeStats | null;
  onClose?: () => void;
}

export const CoherenceScoreWidget: React.FC<CoherenceScoreWidgetProps> = ({
  result,
  rmssdBefore,
  rmssdAfter,
  cumulative,
  onClose,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [animatedIcx, setAnimatedIcx] = useState(0);

  // Animação do ICX ao montar
  useEffect(() => {
    let frame = 0;
    const target = result.icx;
    const step = target / 40;

    const timer = setInterval(() => {
      frame++;
      setAnimatedIcx(prev => {
        const next = Math.min(target, prev + step);
        if (next >= target) clearInterval(timer);
        return Math.round(next);
      });
    }, 25);

    return () => clearInterval(timer);
  }, [result.icx]);

  const icxColor = result.coherenceColor;

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">

      {/* ── Card Principal: ICX ── */}
      <div
        className="relative rounded-3xl p-6 overflow-hidden border border-white/5"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          boxShadow: `0 0 60px ${icxColor}22`,
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 30%, ${icxColor}, transparent 70%)` }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Índice de Coerência</div>
              <div className="text-sm font-bold text-white">Body-Mind Coherence Score</div>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* ICX Score principal */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative flex items-center justify-center">
              {/* Círculo animado */}
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="58" fill="none"
                  stroke={icxColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(animatedIcx / 100) * 364.4} 364.4`}
                  style={{ transition: 'stroke-dasharray 0.1s linear', filter: `drop-shadow(0 0 8px ${icxColor})` }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{animatedIcx}</span>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: icxColor }}>
                  {result.coherenceLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas RMSSD */}
          <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-2xl p-4">
            <MetricBadge label="RMSSD Antes" value={Math.round(rmssdBefore)} unit="ms" color="#94a3b8" />
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1">
                <TrendIcon delta={result.rmssdDelta} />
                <span
                  className="text-xl font-black"
                  style={{ color: result.rmssdDelta >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {result.rmssdDelta >= 0 ? '+' : ''}{Math.round(result.rmssdDelta)}
                  <span className="text-xs font-semibold ml-0.5">ms</span>
                </span>
              </div>
              <span className="text-[10px] text-gray-600">variação VFC</span>
            </div>
            <MetricBadge label="RMSSD Depois" value={Math.round(rmssdAfter)} unit="ms" color={icxColor} />
          </div>

          {/* Badge de melhora */}
          {result.rmssdImprovementPct > 0 && (
            <div
              className="mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
              style={{ background: `${icxColor}18`, color: icxColor }}
            >
              <Zap className="w-4 h-4" />
              Tônus vagal melhorou {result.rmssdImprovementPct}% nesta sessão
            </div>
          )}
        </div>
      </div>

      {/* ── Card Mensagem Clínica ── */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              Interpretação Biométrica
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{result.clinicalMessage}</p>
          </div>
        </div>
      </div>

      {/* ── Card Epigenético ── */}
      <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Impacto Epigenético Cumulativo
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{result.epigeneticMessage}</p>
          </div>
        </div>
      </div>

      {/* ── Card Cumulativo Histórico ── */}
      {cumulative && cumulative.totalMeasuredSessions > 0 && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Evolução Cumulativa
          </div>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <MetricBadge
              label="Sessões"
              value={cumulative.totalMeasuredSessions}
              color="#a78bfa"
            />
            <MetricBadge
              label="RMSSD Médio"
              value={cumulative.averageRmssd}
              unit="ms"
              color="#22c55e"
            />
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-0.5">
                <TrendIcon delta={cumulative.rmssdTrend30d} />
                <span
                  className="text-2xl font-black"
                  style={{ color: cumulative.rmssdTrend30d >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {cumulative.rmssdTrend30d >= 0 ? '+' : ''}{cumulative.rmssdTrend30d}%
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-0.5">30 dias</span>
            </div>
          </div>

          {cumulative.streakDays > 1 && (
            <div className="flex items-center gap-2 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-3">
              <span className="text-amber-400 text-base">🔥</span>
              <span className="text-xs font-semibold text-amber-400">
                {cumulative.streakDays} dias consecutivos de prática
              </span>
            </div>
          )}

          <SparklineChart history={cumulative.history} />
        </div>
      )}

      {/* ── Painel de Info Científica ── */}
      {showInfo && (
        <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl p-4 text-xs text-gray-400 space-y-2 leading-relaxed">
          <p className="font-semibold text-indigo-400">📊 Base Científica</p>
          <p>• <strong>RMSSD</strong>: Métrica padrão-ouro de tônus vagal (Task Force, ESC/NASPE, 1996)</p>
          <p>• Valores {">"} 50ms estão associados a menor risco cardiovascular e maior resiliência ao estresse</p>
          <p>• Prática de respiração guiada (0.1 Hz) aumenta RMSSD em 20-40% em estudos randomizados (Wheat & Larkin, 2010)</p>
          <p>• Efeito epigenético: regulação de genes inflamatórios com prática regular {">"} 8 semanas (Davidson et al., 2003)</p>
          <p className="text-gray-600 mt-2">* Os dados são medições reais do seu dispositivo Bluetooth. Nenhum valor é estimado.</p>
        </div>
      )}

      {/* Botão fechar */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        >
          Ver meu painel completo
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default CoherenceScoreWidget;
