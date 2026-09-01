import React from 'react';
import { EvolutionObservation } from '../../types/evolution';
import { EvolutionObservationCard } from './EvolutionObservationCard';

interface EvolutionMirrorHeaderProps {
  observations: EvolutionObservation[];
  onViewEvidence: (chapterIds: string[]) => void;
}

export const EvolutionMirrorHeader: React.FC<EvolutionMirrorHeaderProps> = ({
  observations,
  onViewEvidence
}) => {
  // Silêncio epistêmico: zero observações = zero UI
  if (observations.length === 0) return null;

  const recurrences = observations.filter(o => o.observationType === 'recurrence');
  const changes = observations.filter(o => o.observationType === 'change');

  return (
    <div className="mb-10 pb-8 border-b border-emerald-900/20">
      <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-100/40 mb-6">
        O que apareceu ao longo do tempo
      </h3>

      <div className="space-y-6">
        {recurrences.length > 0 && (
          <div>
            <div className="text-xs font-mono text-emerald-500/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🔎 Recorrências</span>
            </div>
            <div className="space-y-3">
              {recurrences.map(obs => (
                <EvolutionObservationCard
                  key={obs.id}
                  observation={obs}
                  onViewEvidence={onViewEvidence}
                />
              ))}
            </div>
          </div>
        )}

        {changes.length > 0 && (
          <div>
            <div className="text-xs font-mono text-emerald-500/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>↔ Mudanças observadas</span>
            </div>
            <div className="space-y-3">
              {changes.map(obs => (
                <EvolutionObservationCard
                  key={obs.id}
                  observation={obs}
                  onViewEvidence={onViewEvidence}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
