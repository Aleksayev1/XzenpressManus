import React, { useEffect, useState } from 'react';
import { EvolutionObservation, ChapterComparison, NarrativeOutput } from '../../types/evolution';
import { NarrativeService } from '../../services/evolution/narrativeService';
import { Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';

interface NarrativeSynthesisProps {
  observations: EvolutionObservation[];
  comparisons: ChapterComparison[];
  onViewEvidence: (chapterIds: string[]) => void;
}

export const NarrativeSynthesis: React.FC<NarrativeSynthesisProps> = ({ observations, comparisons, onViewEvidence }) => {
  const [output, setOutput] = useState<NarrativeOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (observations.length === 0) return;
    
    let mounted = true;
    const fetchNarrative = async () => {
      setLoading(true);
      const res = await NarrativeService.generate(observations, comparisons);
      if (mounted) {
        setOutput(res);
        setLoading(false);
      }
    };
    
    fetchNarrative();
    return () => { mounted = false; };
  }, [observations, comparisons]);

  if (observations.length === 0) return null;
  if (loading) return (
    <div className="flex items-center justify-center p-8 bg-[#0d1a16] border border-emerald-900/30 rounded-2xl animate-pulse">
      <Sparkles className="w-5 h-5 text-emerald-500/50 mr-3" />
      <span className="text-emerald-500/50 text-sm">Sintetizando reflexões...</span>
    </div>
  );

  if (!output || output.status === 'rejected') return null; // Silence on rejection

  return (
    <div className="bg-gradient-to-br from-[#0d1a16] to-[#0a1411] border border-emerald-900/40 rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
      
      {output.status === 'approved' && output.claims && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest">Síntese de Padrões</h3>
          </div>
          
          {output.claims.map(claim => (
            <div key={claim.id} className="bg-[#11241e]/50 border border-emerald-900/30 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
              <p className="text-emerald-50 font-serif italic mb-3">"{claim.text}"</p>
              <button 
                onClick={() => onViewEvidence(claim.evidenceChapterIds)}
                className="text-xs text-emerald-500 hover:text-emerald-300 font-mono flex items-center gap-1 transition-colors"
              >
                [Ver evidências]
              </button>
            </div>
          ))}
        </div>
      )}

      {output.status === 'question' && output.question && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-mono text-amber-400 uppercase tracking-widest">Investigação</h3>
          </div>
          
          <div className="bg-[#151c16]/50 border border-amber-900/30 rounded-xl p-4 hover:border-amber-500/30 transition-colors">
            <p className="text-amber-50 font-serif text-lg mb-4 leading-relaxed">
              {output.question.question}
            </p>
            <button 
              onClick={() => onViewEvidence(output.question.evidenceChapterIds)}
              className="text-xs text-amber-500/70 hover:text-amber-400 font-mono flex items-center gap-1 transition-colors"
            >
              [Ver capítulos relacionados]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
