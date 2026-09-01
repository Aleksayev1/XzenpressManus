import React from 'react';
import { ChapterComparison, EvolutionObservation } from '../../types/evolution';
import { GitCompare, Search, ArrowLeftRight } from 'lucide-react';

interface ChapterComparatorProps {
  comparisons: ChapterComparison[];
  onViewEvidence: (chapterIds: string[]) => void;
}

/**
 * S13.5 — Chapter Comparator
 *
 * Apresenta ChapterComparison[] como camada visual pura.
 * Não calcula, não interpreta, não adiciona linguagem avaliativa.
 * Apenas exibe o que o ChapterComparatorEngine encontrou.
 */
export const ChapterComparator: React.FC<ChapterComparatorProps> = ({
  comparisons,
  onViewEvidence,
}) => {
  if (comparisons.length === 0) return null;

  return (
    <div className="mb-10 pb-8 border-b border-emerald-900/20">
      <div className="flex items-center gap-2 mb-6 text-emerald-100/40">
        <GitCompare className="w-4 h-4" />
        <h3 className="text-sm font-mono uppercase tracking-widest">
          Capítulos em comum
        </h3>
      </div>

      <div className="space-y-6">
        {comparisons.map((comp) => (
          <ComparisonCard
            key={comp.microBehaviorId}
            comparison={comp}
            onViewEvidence={onViewEvidence}
          />
        ))}
      </div>
    </div>
  );
};

interface ComparisonCardProps {
  comparison: ChapterComparison;
  onViewEvidence: (chapterIds: string[]) => void;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ comparison, onViewEvidence }) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasObservations = comparison.relatedObservations.length > 0;

  return (
    <div className="bg-[#0d1a16] border border-emerald-900/20 rounded-2xl overflow-hidden">
      {/* Header: microcomportamento + contagem de capítulos */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-emerald-500/60 uppercase tracking-wider">
            {comparison.chapters.length} capítulos
          </span>
          {hasObservations && (
            <span className="text-xs text-emerald-500/50">
              {comparison.relatedObservations.length} observação{comparison.relatedObservations.length !== 1 ? 'ões' : ''}
            </span>
          )}
        </div>

        {/* Timeline de capítulos — sem score, sem avaliação */}
        <div className="space-y-2 mb-4">
          {comparison.chapters.map((chapter, index) => {
            const hasEvidence = comparison.evidenceChapterIds.includes(chapter.id);
            return (
              <div key={chapter.id} className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasEvidence ? 'bg-emerald-400' : 'bg-emerald-900/60'}`} />
                <span className={`text-sm ${hasEvidence ? 'text-emerald-100' : 'text-emerald-100/40'}`}>
                  {chapter.title || 'Capítulo ' + (index + 1)}
                </span>
                {hasEvidence && (
                  <span className="text-xs text-emerald-500/60 ml-auto">evidência</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Observações relacionadas */}
        {hasObservations && (
          <div className="space-y-3">
            {comparison.relatedObservations.map(obs => (
              <ObservationRow
                key={obs.id}
                observation={obs}
                onViewEvidence={onViewEvidence}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ObservationRowProps {
  observation: EvolutionObservation;
  onViewEvidence: (chapterIds: string[]) => void;
}

const ObservationRow: React.FC<ObservationRowProps> = ({ observation, onViewEvidence }) => {
  const isRecurrence = observation.observationType === 'recurrence';
  const icon = isRecurrence
    ? <Search className="w-3 h-3" />
    : <ArrowLeftRight className="w-3 h-3" />;

  const evidenceChapterIds = observation.evidence.map(e => e.chapterId);

  return (
    <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-900/20">
      <div className="flex items-center gap-1.5 mb-2 text-emerald-500/60 text-xs font-mono">
        {icon}
        <span>{isRecurrence ? 'Recorrência' : 'Mudança'}</span>
      </div>
      {/* Texto vem diretamente do motor — a UI não reescreve */}
      <p className="text-emerald-50/90 text-sm leading-relaxed mb-3">
        {observation.text}
      </p>
      <button
        onClick={() => onViewEvidence(evidenceChapterIds)}
        className="text-xs text-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
      >
        Ver capítulos de evidência
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </button>
    </div>
  );
};
