import React from 'react';
import { Chapter } from '../../types/evolution';
import { Book, Play, Pause, CheckCircle } from 'lucide-react';
import { EvolutionObservation, ChapterWithLogs } from '../../types/evolution';
import { EvolutionMirrorHeader } from './EvolutionMirrorHeader';
import { ChapterComparator } from './ChapterComparator';
import { ChapterComparatorEngine } from '../../services/evolution/chapterComparatorEngine';
import { NarrativeSynthesis } from './NarrativeSynthesis';

interface ChapterHistoryProps {
  chapters: Chapter[];
  dataset: ChapterWithLogs[];
  observations: EvolutionObservation[];
  onBack: () => void;
}

export const ChapterHistory: React.FC<ChapterHistoryProps> = ({ chapters, dataset, observations, onBack }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = React.useState<string[]>([]);

  const handleViewEvidence = (chapterIds: string[]) => {
    setHighlightedIds(prev =>
      JSON.stringify(prev) === JSON.stringify(chapterIds) ? [] : chapterIds
    );
  };

  const comparisons = ChapterComparatorEngine.buildComparisons(dataset, observations);

  const getStatusIcon = (status: Chapter['status']) => {
    switch(status) {
      case 'active': return <Play className="w-5 h-5 text-emerald-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'paused': return <Pause className="w-5 h-5 text-amber-400" />;
      case 'draft': return <Book className="w-5 h-5 text-purple-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: Chapter['status']) => {
    switch(status) {
      case 'active': return 'Em andamento';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const calculateDays = (chapter: Chapter) => {
    const start = new Date(chapter.createdAt);
    const end = chapter.narrativeGeneratedAt ? new Date(chapter.narrativeGeneratedAt) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full bg-[#0a1411] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl relative text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-emerald-50">Minha Jornada</h2>
          <p className="text-emerald-100/50 mt-2">
            Sua história registrada em {chapters.length} arco{chapters.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="text-emerald-500 hover:text-emerald-400 transition-colors px-4 py-2 bg-[#0d1a16] rounded-xl border border-emerald-900/30"
        >
          Voltar ao Dashboard
        </button>
      </div>

      <ChapterComparator comparisons={comparisons} onViewEvidence={handleViewEvidence} />

      <EvolutionMirrorHeader observations={observations} onViewEvidence={handleViewEvidence} />

      <NarrativeSynthesis observations={observations} comparisons={comparisons} onViewEvidence={handleViewEvidence} />

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-900/30 before:to-transparent">
        {chapters.length === 0 ? (
          <div className="text-center py-12 text-emerald-100/40 italic">
            Nenhum capítulo gravado ainda. Sua jornada aguarda.
          </div>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-900/50 bg-[#0d1a16] text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getStatusIcon(chapter.status)}
              </div>
              
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0d1a16] border p-6 rounded-2xl transition-all shadow-lg ${ highlightedIds.includes(chapter.id) ? 'border-emerald-500/50' : 'border-emerald-900/20 hover:border-emerald-700/40' }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-mono text-emerald-500/60 uppercase tracking-wider">
                    {getStatusLabel(chapter.status)} • {calculateDays(chapter)} dias
                  </div>
                  <div className="flex items-center gap-2">
                    {highlightedIds.includes(chapter.id) && (
                      <span className="text-xs font-mono text-emerald-400">← evidência</span>
                    )}
                    <span className="text-xs text-emerald-100/30">{new Date(chapter.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-serif text-emerald-50 mb-1">
                  {chapter.primaryVirtueId}
                </h3>
                <p className="text-sm text-emerald-100/60 mb-4">
                  {chapter.microBehaviorId}
                </p>

                {chapter.narrativeText && (
                  <div className="mt-4 pt-4 border-t border-emerald-900/30">
                    <div className="text-[10px] font-mono text-emerald-100/30 uppercase tracking-widest mb-2">
                      Epistemic Status: NARRATIVE
                    </div>
                    <p className="text-sm text-emerald-100/80 leading-relaxed font-serif italic">
                      "{chapter.narrativeText}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
