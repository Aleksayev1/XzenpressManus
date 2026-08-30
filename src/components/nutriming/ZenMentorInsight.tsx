import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, AlertCircle, Info, Activity } from 'lucide-react';
import { PatternEventData } from '../../types/nutriming';

interface ZenMentorInsightProps {
  pattern: PatternEventData;
  onExplore: () => void;
  onObserve: () => void;
}

export const ZenMentorInsight: React.FC<ZenMentorInsightProps> = ({ pattern, onExplore, onObserve }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative mt-6"
    >
      {/* Estado 1: O Insight Inicial */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 mt-1">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              Padrão observado
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Nutriming Temporal Engine</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Nos seus registros recentes, o café da manhã registrado apareceu associado a um relato de "energia baixa" posteriormente.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Toggle para o "Por quê?" */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 bg-slate-950/50 border-y border-slate-800/80 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span className="font-semibold tracking-widest uppercase">Por quê?</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Estado 2 e 3: Transparência e Guardrails (Provenance) */}
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-950/80"
          >
            <div className="p-5 space-y-5">
              {/* Estado 2: Evidência (Provenance e Data Quality) */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Base de Dados (Provenance)
                </h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex justify-between border-b border-slate-800/50 pb-1">
                    <span className="text-slate-400">Ocorrências:</span>
                    <span className="font-medium text-white">{pattern.frequency} refeições associadas</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/50 pb-1">
                    <span className="text-slate-400">Janela temporal média:</span>
                    <span className="font-medium text-white">~ {pattern.temporalWindow.afterMinutes} minutos</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/50 pb-1">
                    <span className="text-slate-400">Qualidade dos dados:</span>
                    <span className="font-medium text-amber-400">Moderada ({(pattern.dataQuality * 100).toFixed(0)}%)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/50 pb-1">
                    <span className="text-slate-400">Variações mapeadas (Confounders):</span>
                    <span className="font-medium text-white truncate max-w-[150px]">{pattern.confounders.join(', ')}</span>
                  </li>
                </ul>
              </div>

              {/* Estado 3: O que isso NÃO significa (CausalClaim: false) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 items-start">
                <Info className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 block mb-1">O que isso NÃO significa:</strong>
                  Este padrão aponta apenas para uma associação cronológica nos seus registros. Ele não demonstra causa ou efeito. A queda de energia pode estar relacionada a fatores simultâneos (como qualidade do sono).
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ações não indutivas */}
      <div className="p-5 flex items-center gap-3 bg-slate-900">
        <button 
          onClick={onExplore}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700"
        >
          Explorar padrão
        </button>
        <button 
          onClick={onObserve}
          className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-all bg-transparent"
        >
          Continuar observando
        </button>
      </div>

    </motion.div>
  );
};
