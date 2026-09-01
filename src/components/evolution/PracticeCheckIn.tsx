import React, { useState } from 'react';
import { Chapter, PracticeOutcome } from '../../types/evolution';
import { CheckCircle2, CircleDashed, XCircle, HelpCircle } from 'lucide-react';

interface PracticeCheckInProps {
  chapter: Chapter;
  onLog: (outcome: PracticeOutcome, reflection: string) => Promise<void>;
}

export const PracticeCheckIn: React.FC<PracticeCheckInProps> = ({ chapter, onLog }) => {
  const [selectedOutcome, setSelectedOutcome] = useState<PracticeOutcome | null>(null);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedOutcome) return;
    setIsSubmitting(true);
    try {
      await onLog(selectedOutcome, reflection);
      setSelectedOutcome(null);
      setReflection('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#0a1411] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-200">
      
      {!selectedOutcome ? (
        <div className="animate-in fade-in duration-500">
          <h3 className="text-2xl font-serif text-emerald-50 mb-2 text-center">
            Houve uma oportunidade de praticar hoje?
          </h3>
          <p className="text-emerald-100/50 text-center mb-8">
            Sua direção: <strong className="text-emerald-400 font-medium">{'Microcomportamento ' + chapter.microBehaviorId}</strong>
          </p>

          <div className="space-y-3 max-w-md mx-auto">
            <button 
              onClick={() => setSelectedOutcome('completed')}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-emerald-900/30 hover:border-emerald-500/50 hover:bg-[#11241e] rounded-xl transition-all group"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3" />
              <span className="font-medium text-emerald-50">Pratiquei</span>
            </button>
            
            <button 
              onClick={() => setSelectedOutcome('partial')}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-emerald-900/30 hover:border-amber-500/50 hover:bg-[#15201b] rounded-xl transition-all group"
            >
              <CircleDashed className="w-5 h-5 text-amber-400 mr-3" />
              <span className="font-medium text-emerald-50">Tentei, mas foi diferente</span>
            </button>

            <button 
              onClick={() => setSelectedOutcome('skipped')}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-emerald-900/30 hover:border-slate-500/50 hover:bg-[#131b18] rounded-xl transition-all group"
            >
              <XCircle className="w-5 h-5 text-slate-400 mr-3" />
              <span className="font-medium text-emerald-50">Não houve oportunidade hoje</span>
            </button>

            <button 
              onClick={() => setSelectedOutcome('uncertain')}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-emerald-900/30 hover:border-purple-500/50 hover:bg-[#151722] rounded-xl transition-all group"
            >
              <HelpCircle className="w-5 h-5 text-purple-400 mr-3" />
              <span className="font-medium text-emerald-50">Não sei ainda</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
          <button 
            onClick={() => setSelectedOutcome(null)} 
            className="text-emerald-600 text-sm mb-6 hover:text-emerald-400 transition-colors"
          >
            ← Alterar resposta
          </button>
          
          <h3 className="text-xl font-serif text-emerald-50 mb-4">
            O que aconteceu? <span className="text-emerald-100/40 text-sm font-sans italic">(Opcional)</span>
          </h3>
          
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Alguma reflexão curta sobre esse momento..."
            className="w-full bg-[#0d1a16] border border-emerald-900/30 rounded-xl p-4 text-emerald-50 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/50 min-h-[100px] resize-none mb-6"
          />

          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Prática'}
          </button>
        </div>
      )}
    </div>
  );
};
