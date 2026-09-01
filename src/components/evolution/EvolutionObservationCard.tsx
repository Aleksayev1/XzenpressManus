import React from 'react';
import { EvolutionObservation } from '../../types/evolution';
import { Search, ArrowLeftRight } from 'lucide-react';

interface EvolutionObservationCardProps {
  observation: EvolutionObservation;
  onViewEvidence: (chapterIds: string[]) => void;
}

export const EvolutionObservationCard: React.FC<EvolutionObservationCardProps> = ({
  observation,
  onViewEvidence
}) => {
  const isRecurrence = observation.observationType === 'recurrence';
  const icon = isRecurrence ? <Search className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />;
  const label = isRecurrence ? 'Recorrência' : 'Mudança';
  const evidenceChapterIds = observation.evidence.map(e => e.chapterId);

  return (
    <div className="bg-[#0d1a16] border border-emerald-900/20 rounded-2xl p-5 transition-all hover:border-emerald-700/30">
      <div className="flex items-center gap-2 mb-3 text-emerald-500/70 text-xs font-mono uppercase tracking-widest">
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-emerald-100/30">{observation.evidenceStrength === 'high' ? 'Alta' : 'Moderada'} evidência</span>
      </div>

      {/* O texto vem DIRETAMENTE do motor. A UI não reescreve. */}
      <p className="text-emerald-50 leading-relaxed text-sm">
        {observation.text}
      </p>

      <div className="mt-4 pt-4 border-t border-emerald-900/20 flex items-center justify-between">
        <span className="text-xs text-emerald-100/40">
          Evidência: {observation.chapterCount} capítulo{observation.chapterCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => onViewEvidence(evidenceChapterIds)}
          className="text-xs text-emerald-500/60 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
        >
          Ver onde apareceu
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};
