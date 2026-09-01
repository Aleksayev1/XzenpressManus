import React, { useState } from 'react';
import { ChoiceRecord } from '../../types/evolution';
import { Brain, ArrowRight, PauseCircle, PlayCircle, Eye, HelpCircle } from 'lucide-react';

interface ChoiceMomentProps {
  onComplete: (choice: Omit<ChoiceRecord, 'id' | 'userId' | 'chapterId' | 'occurredAt'>) => void;
  onCancel: () => void;
}

export const ChoiceMoment: React.FC<ChoiceMomentProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [trigger, setTrigger] = useState('');
  const [outcome, setOutcome] = useState<ChoiceRecord['choiceOutcome'] | null>(null);
  const [reflection, setReflection] = useState('');

  const handleFinish = () => {
    if (!outcome) return;
    onComplete({
      trigger,
      choiceOutcome: outcome,
      reflection,
    });
  };

  return (
    <div className="w-full bg-[#0a1411] border border-blue-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-200">
      
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        Cancelar
      </button>

      {/* Tela 1: O Gatilho */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
          <div className="flex items-center gap-3 text-blue-400 mb-6">
            <Brain className="w-5 h-5" />
            <span className="font-serif italic">Você notou um padrão</span>
          </div>
          
          <h3 className="text-2xl font-serif text-blue-50 mb-4">
            O que você percebeu antes de agir?
          </h3>
          
          <p className="text-blue-100/60 mb-6">
            Não importa se você seguiu o hábito antigo ou fez diferente. O simples fato de ter notado antes de agir já é a essência do XZenPress.
          </p>

          <textarea
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="Ex: Senti o estômago apertar e minha mão já estava indo para o celular..."
            className="w-full bg-[#0d1a16] border border-blue-900/30 rounded-xl p-4 text-blue-50 placeholder:text-blue-900/50 focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none mb-6"
          />

          <button 
            onClick={() => setStep(2)}
            className="flex items-center justify-center w-full px-6 py-3 bg-blue-900/30 hover:bg-blue-800/40 text-blue-100 rounded-xl transition-colors group"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Tela 2: A Escolha */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-lg mx-auto">
          <button onClick={() => setStep(1)} className="text-blue-600 text-sm mb-6 hover:text-blue-400 transition-colors">← Voltar</button>
          
          <h3 className="text-2xl font-serif text-blue-50 mb-8">
            E o que aconteceu depois?
          </h3>

          <div className="space-y-3">
            <button 
              onClick={() => { setOutcome('acted_consciously'); setStep(3); }}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-blue-900/30 hover:border-emerald-500/50 hover:bg-[#11241e] rounded-xl transition-all group"
            >
              <Eye className="w-5 h-5 text-emerald-400 mr-3" />
              <div className="text-left">
                <span className="font-medium text-emerald-50 block">Agi consciente</span>
                <span className="text-xs text-blue-100/40">Consegui quebrar o padrão e fiz diferente</span>
              </div>
            </button>
            
            <button 
              onClick={() => { setOutcome('continued_automatic'); setStep(3); }}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-blue-900/30 hover:border-blue-500/50 hover:bg-[#111e24] rounded-xl transition-all group"
            >
              <PlayCircle className="w-5 h-5 text-blue-400 mr-3" />
              <div className="text-left">
                <span className="font-medium text-blue-50 block">Continuei no automático</span>
                <span className="text-xs text-blue-100/40">Percebi, mas o impulso foi mais forte</span>
              </div>
            </button>

            <button 
              onClick={() => { setOutcome('paused'); setStep(3); }}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-blue-900/30 hover:border-amber-500/50 hover:bg-[#201c15] rounded-xl transition-all group"
            >
              <PauseCircle className="w-5 h-5 text-amber-400 mr-3" />
              <div className="text-left">
                <span className="font-medium text-amber-50 block">Pausei</span>
                <span className="text-xs text-blue-100/40">Não fiz o velho, mas também não fiz o novo</span>
              </div>
            </button>

            <button 
              onClick={() => { setOutcome('uncertain'); setStep(3); }}
              className="w-full flex items-center p-4 bg-[#0d1a16] border border-blue-900/30 hover:border-slate-500/50 hover:bg-[#181a1b] rounded-xl transition-all group"
            >
              <HelpCircle className="w-5 h-5 text-slate-400 mr-3" />
              <span className="font-medium text-slate-50">Não sei dizer exatamente</span>
            </button>
          </div>
        </div>
      )}

      {/* Tela 3: Reflexão */}
      {step === 3 && (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
          <button onClick={() => setStep(2)} className="text-blue-600 text-sm mb-4 hover:text-blue-400 transition-colors">← Voltar</button>
          
          <h3 className="text-2xl font-serif text-blue-50 mb-4 text-center">
            Como foi isso? <span className="text-blue-100/40 text-sm font-sans italic">(Opcional)</span>
          </h3>
          
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Como o corpo reagiu? O que pensou?"
            className="w-full bg-[#0d1a16] border border-blue-900/30 rounded-xl p-4 text-blue-50 placeholder:text-blue-900/50 focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none mb-6"
          />

          <button 
            onClick={handleFinish}
            className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            Registrar Observação
          </button>
        </div>
      )}
    </div>
  );
};
