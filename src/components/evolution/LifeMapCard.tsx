import React from 'react';
import { Observation } from '../../types/meaning';
import { EpistemicTag } from './EpistemicTag';
import { Map, Clock, CalendarDays, Activity } from 'lucide-react';

interface LifeMapCardProps {
  observations: Observation[];
}

export const LifeMapCard: React.FC<LifeMapCardProps> = ({ observations }) => {
  if (!observations || observations.length === 0) {
    return (
      <div className="w-full bg-[#0a1411] border border-emerald-900/20 rounded-3xl p-8 text-center text-emerald-100/40 font-serif italic">
        Ainda reunindo observações...
      </div>
    );
  }

  // Ícones dinâmicos baseados no ID da observação gerada pelo MeaningEngine
  const getIcon = (id: string) => {
    if (id.includes('obs-freq')) return <Activity className="w-5 h-5 text-emerald-400" />;
    if (id.includes('obs-gap')) return <CalendarDays className="w-5 h-5 text-emerald-400" />;
    if (id.includes('obs-dist')) return <Clock className="w-5 h-5 text-emerald-400" />;
    return <Map className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="w-full bg-[#0a1411] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-900/30 rounded-lg">
          <Map className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-serif text-emerald-50">O Mapa da Vida</h3>
      </div>
      
      <div className="space-y-4">
        {observations.map((obs) => (
          <div key={obs.id} className="p-5 bg-[#0d1a16] border border-emerald-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-emerald-500/30 transition-colors">
            
            <div className="flex items-start gap-4">
              <div className="mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                {getIcon(obs.id)}
              </div>
              <div>
                <p className="text-emerald-50 font-medium text-lg leading-relaxed">
                  {obs.text}
                </p>
                <p className="text-sm text-emerald-100/40 mt-1 font-serif italic">
                  Baseado em {obs.evidenceCount} oportunidades registradas
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <EpistemicTag status={obs.epistemicStatus} />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
