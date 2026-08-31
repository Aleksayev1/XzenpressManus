import React, { useState } from 'react';
import { INITIAL_VIRTUES, getMicroBehaviorsForVirtue, Virtue, MicroBehavior, Chapter } from '../../types/evolution';
import { ArrowRight, CheckCircle2, Sprout } from 'lucide-react';

interface NewChapterFlowProps {
  onComplete: (chapter: Chapter) => void;
  onCancel?: () => void;
}

export const NewChapterFlow: React.FC<NewChapterFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedVirtue, setSelectedVirtue] = useState<Virtue | null>(null);
  const [selectedBehavior, setSelectedBehavior] = useState<MicroBehavior | null>(null);

  const handleVirtueSelect = (virtue: Virtue) => {
    setSelectedVirtue(virtue);
    setStep(3);
  };

  const handleBehaviorSelect = (behavior: MicroBehavior) => {
    setSelectedBehavior(behavior);
    setStep(4);
  };

  const handleStartDraft = () => {
    if (!selectedVirtue || !selectedBehavior) return;

    const now = new Date().toISOString();
    const draftUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newChapter: Chapter = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      title: `Novo Capítulo — ${selectedVirtue.name}`,
      primaryVirtueId: selectedVirtue.id,
      microBehaviorId: selectedBehavior.id,
      createdAt: now,
      startedAt: now,
      draftUntil: draftUntil,
      status: 'draft',
    };

    onComplete(newChapter);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0a1411] rounded-3xl border border-emerald-900/50 shadow-2xl text-slate-200 font-sans relative overflow-hidden transition-all duration-500 ease-in-out">
      
      {onCancel && step === 1 && (
        <button onClick={onCancel} className="absolute top-4 right-6 text-emerald-100/40 hover:text-emerald-100 transition-colors text-sm font-medium">
          Cancelar
        </button>
      )}

      {/* Tela 1: O Convite */}
      {step === 1 && (
        <div className="text-center py-12 transform transition-all opacity-100 translate-y-0 duration-700">
          <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sprout className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl text-emerald-50 font-serif mb-6 leading-tight">
            Novo Capítulo
          </h2>
          <p className="text-emerald-100/70 text-lg mb-12 max-w-sm mx-auto">
            Existe alguma coisa na sua vida que você gostaria de viver de outra maneira?
          </p>
          <button 
            onClick={() => setStep(2)}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center mx-auto group"
          >
            Começar
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Tela 2: Seleção de Virtude */}
      {step === 2 && (
        <div className="transform transition-all opacity-100 translate-x-0 duration-500">
          {onCancel && (
            <button onClick={onCancel} className="text-sm text-emerald-600 hover:text-emerald-400 mb-8 flex items-center transition-colors">
              ← Cancelar
            </button>
          )}
          <h3 className="text-2xl text-emerald-50 font-serif mb-8 text-center">
            Quem você gostaria de praticar ser?
          </h3>
          
          <div className="space-y-4">
            {INITIAL_VIRTUES.map(virtue => (
              <button 
                key={virtue.id}
                onClick={() => handleVirtueSelect(virtue)}
                className="w-full text-left p-6 rounded-2xl bg-[#0d1a16] border border-emerald-900/30 hover:border-emerald-500/50 hover:bg-[#11241e] transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center text-xl font-medium text-emerald-50 mb-1">
                    <span className="text-2xl mr-4">{virtue.emoji}</span>
                    {virtue.name}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-800 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tela 3: Seleção de Comportamento */}
      {step === 3 && selectedVirtue && (
        <div className="transform transition-all opacity-100 translate-x-0 duration-500">
          <button onClick={() => setStep(2)} className="text-sm text-emerald-600 hover:text-emerald-400 mb-8 flex items-center transition-colors">
            ← Voltar
          </button>
          
          <h3 className="text-2xl text-emerald-50 font-serif mb-8 text-center">
            Como isso poderia aparecer na sua vida?
          </h3>

          <div className="space-y-4">
            {getMicroBehaviorsForVirtue(selectedVirtue.id).map(behavior => (
              <button 
                key={behavior.id}
                onClick={() => handleBehaviorSelect(behavior)}
                className="w-full text-left p-6 rounded-2xl bg-[#0d1a16] border border-emerald-900/30 hover:border-emerald-500/50 hover:bg-[#11241e] transition-all flex items-start group"
              >
                <div className="mt-1 mr-4 text-emerald-800 group-hover:text-emerald-500 transition-colors">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-medium text-emerald-50 mb-2">{behavior.label}</div>
                  <div className="text-emerald-100/60 text-sm leading-relaxed">{behavior.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tela 4: Confirmação e Magia */}
      {step === 4 && selectedBehavior && selectedVirtue && (
        <div className="transform transition-all opacity-100 scale-100 duration-700 text-center py-8">
          <div className="w-20 h-20 bg-[#0d1a16] border border-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
            {selectedVirtue.emoji}
          </div>
          
          <h3 className="text-2xl font-serif text-emerald-50 mb-8">
            Seu primeiro capítulo está começando.
          </h3>
          
          <div className="bg-[#0d1a16] border border-emerald-900/30 p-6 rounded-2xl text-left mb-10 max-w-sm mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-900/20 pb-4">
                <span className="text-emerald-100/50 text-sm">Virtude</span>
                <span className="text-emerald-50 font-medium">{selectedVirtue.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-900/20 pb-4">
                <span className="text-emerald-100/50 text-sm">Prática</span>
                <span className="text-emerald-50 font-medium text-right max-w-[200px]">{selectedBehavior.label}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-emerald-100/50 text-sm">Duração experimental</span>
                <span className="text-emerald-400 font-medium bg-emerald-950/50 px-3 py-1 rounded-full text-xs">7 dias (Rascunho)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStartDraft}
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-900/50 w-full mb-8 text-lg"
          >
            Começar
          </button>
          
          <div className="text-emerald-100/40 text-sm italic font-serif">
            "Não precisamos saber onde isso termina. Só precisamos começar."
          </div>
        </div>
      )}
    </div>
  );
};
