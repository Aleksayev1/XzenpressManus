import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Flame, 
  X, 
  Download, 
  FileText, 
  Check, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ClinicalCorrelationService, 
  PairedClinicalSession 
} from '../../services/nutriming/clinicalCorrelationService';

interface ClinicalCorrelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const ClinicalCorrelationModal: React.FC<ClinicalCorrelationModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [copied, setCopied] = useState(false);

  // Carregar sessões clínicas pareadas
  const pairedSessions: PairedClinicalSession[] = useMemo(() => {
    return ClinicalCorrelationService.getPairedClinicalSessions(userId);
  }, [userId, isOpen]);

  // Estatísticas de pesquisa
  const stats = useMemo(() => {
    const total = pairedSessions.length;
    const cleanBaselines = pairedSessions.filter(s => s.prandialStatus === 'fasting_baseline').length;
    const confounded = pairedSessions.filter(s => s.confounderLevel === 'critical_adulteration').length;
    const avgReliability = total > 0
      ? Math.round(pairedSessions.reduce((acc, s) => acc + s.thermalReliabilityScore, 0) / total)
      : 100;
    const avgDeltaRmssd = total > 0
      ? Math.round((pairedSessions.reduce((acc, s) => acc + s.deltaRmssd, 0) / total) * 10) / 10
      : 0;

    return { total, cleanBaselines, confounded, avgReliability, avgDeltaRmssd };
  }, [pairedSessions]);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvData = ClinicalCorrelationService.exportToCSV(pairedSessions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `xzen_piloto_brioschi_termografia_vfc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonData = ClinicalCorrelationService.exportToJSON(pairedSessions);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `xzen_piloto_brioschi_fair_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyDossier = () => {
    const dossierText = ClinicalCorrelationService.exportDossierReport(pairedSessions);
    navigator.clipboard.writeText(dossierText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header Científico */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Piloto Clínico Termografia N-of-1</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                  Prof. Dr. Brioschi / ABRATERM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cruzamento cronológico de refeições, alimentos adulterados e telemetria autonômica (RMSSD/VFC).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Fundamentação Metrológica */}
        <div className="px-6 py-3 bg-indigo-950/30 border-b border-indigo-900/30 text-xs text-indigo-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-300">Controle Estrito de Confounders:</span> A termografia médica cutânea (ΔT) e os intervalos R-R exigem estabilização metabólica. O Nutriming audita a janela digestiva e acusa alimentos adulterados para garantir integridade científica aos dados do estudo piloto.
          </div>
        </div>

        {/* Resumo Metrológico dos Dados */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Confiabilidade Térmica</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black ${stats.avgReliability >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.avgReliability}%
              </span>
              <span className="text-[10px] text-slate-500">índice médio</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex flex-col">
            <span className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">Jejum Limpo</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.cleanBaselines}</span>
              <span className="text-[10px] text-emerald-400/60">de {stats.total} sessões</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/30 flex flex-col">
            <span className="text-[11px] text-red-300 font-medium uppercase tracking-wider flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Ruído Alimentar
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-red-400">{stats.confounded}</span>
              <span className="text-[10px] text-red-400/60">flagrantes</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 flex flex-col">
            <span className="text-[11px] text-indigo-300 font-medium uppercase tracking-wider">Δ RMSSD Médio</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-indigo-400">+{stats.avgDeltaRmssd}</span>
              <span className="text-[10px] text-indigo-400/60">ms ganho</span>
            </div>
          </div>
        </div>

        {/* Timeline e Sessões Pareadas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
            Sessões Fisiológicas Pareadas com Histórico Prandial
          </h3>

          {pairedSessions.map((session, index) => {
            const isClean = session.prandialStatus === 'fasting_baseline';
            const isCritical = session.confounderLevel === 'critical_adulteration';
            const isModerate = session.confounderLevel === 'moderate';

            const cardBorder = isCritical
              ? 'border-red-500/40 bg-gradient-to-br from-red-950/20 via-slate-900 to-slate-900'
              : isModerate
              ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/15 via-slate-900 to-slate-900'
              : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-slate-900 to-slate-900';

            return (
              <div key={session.sessionId} className={`p-4 rounded-2xl border ${cardBorder} shadow-lg space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {session.sessionId.toUpperCase()}
                      </span>
                      {isCritical && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm shadow-red-950">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          Viés Inflamatório Prandial
                        </span>
                      )}
                      {isClean && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Linha de Base Pura (&gt;3h Jejum)
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(session.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • 10 min
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-1">
                      Protocolo de Coerência & Acupressão (Sessão Mestra)
                    </h4>
                  </div>

                  {/* Score de Confiabilidade da Termografia */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confiabilidade IR</span>
                    <span className={`text-xl font-black ${session.thermalReliabilityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {session.thermalReliabilityScore}%
                    </span>
                  </div>
                </div>

                {/* Métricas Fisiológicas Pareadas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">RMSSD Pré → Pós</span>
                    <span className="font-mono font-bold text-white">
                      {session.rmssdBefore} ms → {session.rmssdAfter} ms
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Ganho Autonômico</span>
                    <span className={`font-mono font-bold ${session.deltaRmssd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {session.deltaRmssd >= 0 ? '+' : ''}{session.deltaRmssd} ms (VFC)
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Escala de Estresse (EVA)</span>
                    <span className="font-mono font-bold text-white">
                      {session.anxietyBefore}/10 → {session.anxietyAfter}/10
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Estado Prandial</span>
                    <span className="font-bold text-slate-200">
                      {isClean ? 'Jejum (>180m)' : `${session.lastMeal?.minutesBeforeSession}m pós-refeição`}
                    </span>
                  </div>
                </div>

                {/* Bloco de Detalhes da Refeição Próxima */}
                {session.lastMeal && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    session.lastMeal.isAdulterated
                      ? 'bg-red-950/30 border-red-800/40 text-red-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Refeição Anterior: {session.lastMeal.productName} ({session.lastMeal.minutesBeforeSession} min antes)
                      </span>
                      <span className="text-[10px] uppercase font-mono font-semibold">
                        {session.lastMeal.compass.toUpperCase()}
                      </span>
                    </div>
                    {session.lastMeal.isAdulterated && (
                      <p className="mt-1 text-red-300/90 text-[11px] leading-relaxed">
                        ⚠️ Alimento fraudado/adulterado consumido na janela crítica. Alerta o operador da câmera FLIR/termográfica quanto a dilatação esplâncnica e assimetria térmica cutânea no tronco anterior.
                      </p>
                    )}
                  </div>
                )}

                {/* Nota Metodológica Brioschi */}
                <p className="text-[11px] text-slate-400 italic">
                  🔬 {session.methodologicalNote}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer com Exportação Open Data (Kubios HRV, R, Python) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              CSV (R / Python / Kubios)
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Cpu className="w-3.5 h-3.5" />
              JSON (FAIR Data)
            </button>
            <button
              type="button"
              onClick={handleCopyDossier}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              {copied ? 'Parecer Copiado!' : 'Copiar Parecer Técnico'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Fechar Painel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
