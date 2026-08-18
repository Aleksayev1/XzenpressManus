import React from 'react';
import { Activity, ShieldCheck, TrendingUp, Award } from 'lucide-react';
import type { CoherenceResult, CumulativeStats } from '../hooks/useCoherenceScore';

interface CoherenceScoreWidgetProps {
  result: CoherenceResult;
  rmssdBefore?: number;
  rmssdAfter?: number;
  cumulative?: CumulativeStats;
}

export const CoherenceScoreWidget: React.FC<CoherenceScoreWidgetProps> = ({
  result,
  rmssdBefore = 0,
  rmssdAfter = 0,
  cumulative,
}) => {
  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Excelente':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Alta':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Moderada':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl max-w-md mx-auto text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Índice de Coerência</h3>
            <p className="text-xs text-gray-400">Resposta Autonômica & VFC</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getBadgeColor(result.tier)}`}>
          Coerência {result.tier}
        </div>
      </div>

      <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 mb-4 flex items-center justify-between">
        <div>
          <span className="text-4xl font-extrabold text-white">{result.score}</span>
          <span className="text-sm font-semibold text-gray-500 ml-1">/100</span>
          <p className="text-xs text-gray-400 mt-1">Pontuação de VFC e Estresse</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {result.deltaRmssd > 0 && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" /> +{result.deltaRmssd} ms VFC
            </span>
          )}
          {result.deltaAnxiety > 0 && (
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> -{result.deltaAnxiety} Ansiedade
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed mb-4 italic bg-purple-950/20 p-3 rounded-xl border border-purple-500/10">
        "{result.explanation}"
      </p>

      {(rmssdBefore > 0 || rmssdAfter > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-center text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">VFC Antes</span>
            <span className="text-sm font-bold text-gray-300">{rmssdBefore} ms</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">VFC Depois</span>
            <span className="text-sm font-bold text-emerald-400">{rmssdAfter} ms</span>
          </div>
        </div>
      )}

      {cumulative && cumulative.totalSessions > 1 && (
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            {cumulative.totalSessions} Sessões Concluídas
          </span>
          <span className="font-semibold text-purple-300">
            Média: {cumulative.averageScore} pts
          </span>
        </div>
      )}
    </div>
  );
};
