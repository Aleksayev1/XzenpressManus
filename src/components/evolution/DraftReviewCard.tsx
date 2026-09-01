import React, { useState } from 'react';
import { Chapter, ChapterStatus } from '../../types/evolution';
import { narrativeService } from '../../services/evolution/narrativeService';
import { Observation } from '../../types/meaning';
import { Sparkles, ArrowRight, BookOpen, PauseCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

interface DraftReviewCardProps {
  observations: Observation[];
  chapter: Chapter;
  practiceCount: number; // Mocado para o componente visual
  onDecision: (status: ChapterStatus, reflection: string) => void;
  onPostpone: () => void;
}

export const DraftReviewCard: React.FC<DraftReviewCardProps> = ({ 
  chapter, 
  practiceCount, 
  onDecision, 
  onPostpone 
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [narrativeText, setNarrativeText] = useState('');
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [reflection, setReflection] = useState('');

  return (
    <div className="w-full bg-[#0a1411] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-200">
      
      {/* Botão Decidir Depois (Sempre presente, Lei 9) */}
      <button 
        onClick={onPostpone}
        className="absolute top-6 right-6 text-sm text-emerald-100/40 hover:text-emerald-100 transition-colors"
      >
        Decidir depois
      </button>

      {/* Tela 1: A Reflexão */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
          <div className="flex items-center gap-3 text-emerald-400 mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-serif italic">Período de rascunho concluído</span>
          </div>
          
          <h3 className="text-2xl font-serif text-emerald-50 mb-4">
            O que você descobriu sobre si nesses 7 dias?
          </h3>
          
          <p className="text-emerald-100/60 mb-6">
            Você escolheu cultivar sua direção através de pequenas práticas. Antes de decidir o próximo passo, reserve um momento (opcional).
          </p>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="O que apareceu na sua vida essa semana? O que foi fácil? O que foi difícil?"
            className="w-full bg-[#0d1a16] border border-emerald-900/30 rounded-xl p-4 text-emerald-50 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/50 min-h-[120px] resize-none mb-6"
          />

          <button 
            onClick={() => setStep(2)}
            className="flex items-center justify-center w-full px-6 py-3 bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-100 rounded-xl transition-colors group"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Tela 2: O Espelho */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-lg mx-auto">
          <button onClick={() => setStep(1)} className="text-emerald-600 text-sm mb-6 hover:text-emerald-400 transition-colors">← Voltar</button>
          
          <h3 className="text-2xl font-serif text-emerald-50 mb-8">
            O Espelho
          </h3>

          <div className="bg-[#0d1a16] p-6 rounded-2xl border border-emerald-900/30 mb-8">
            <div className="text-4xl font-serif text-emerald-400 mb-2">{practiceCount}</div>
            <div className="text-emerald-100/70">
              oportunidades em que você escolheu praticar.
            </div>
          </div>

          <p className="text-sm text-emerald-100/40 italic font-serif text-center mb-8">
            Não estamos medindo se você "evoluiu".<br/> Estamos observando o que aconteceu.
          </p>

          <button 
            onClick={() => setStep(3)}
            className="flex items-center justify-center w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
          >
            Decidir Próximo Passo
          </button>
        </div>
      )}

      {/* Tela 3: A Escolha */}
      {step === 3 && (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
          <button onClick={() => setStep(2)} className="text-emerald-600 text-sm mb-4 hover:text-emerald-400 transition-colors">← Voltar</button>
          
          <h3 className="text-2xl font-serif text-emerald-50 mb-8 text-center">
            O que faz sentido agora?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onDecision('active', reflection)}
              className="p-5 text-left rounded-2xl border border-emerald-900/40 hover:border-emerald-500/50 hover:bg-[#11241e] transition-all group"
            >
              <div className="flex items-center text-emerald-300 mb-2">
                <PlayCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Continuar</span>
              </div>
              <p className="text-sm text-emerald-100/60 group-hover:text-emerald-100/80">Quero continuar praticando esta direção.</p>
            </button>

            <button 
              onClick={() => onDecision('active', reflection)} // Mesma ação macro, mas na vida real abriria a tela de trocar microcomportamento
              className="p-5 text-left rounded-2xl border border-emerald-900/40 hover:border-emerald-500/50 hover:bg-[#11241e] transition-all group"
            >
              <div className="flex items-center text-blue-300 mb-2">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-medium">Ajustar</span>
              </div>
              <p className="text-sm text-emerald-100/60 group-hover:text-emerald-100/80">Quero experimentar outro microcomportamento.</p>
            </button>

            <button 
              onClick={() => onDecision('paused', reflection)}
              className="p-5 text-left rounded-2xl border border-emerald-900/40 hover:border-amber-500/50 hover:bg-[#15201b] transition-all group"
            >
              <div className="flex items-center text-amber-300 mb-2">
                <PauseCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Pausar</span>
              </div>
              <p className="text-sm text-emerald-100/60 group-hover:text-emerald-100/80">Quero deixar este capítulo em repouso por enquanto.</p>
            </button>

            <button 
              onClick={() => onDecision('completed', reflection)}
              className="p-5 text-left rounded-2xl border border-emerald-900/40 hover:border-slate-500/50 hover:bg-[#131b18] transition-all group"
            >
              <div className="flex items-center text-slate-300 mb-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="font-medium">Encerrar</span>
              </div>
              <p className="text-sm text-emerald-100/60 group-hover:text-emerald-100/80">Este capítulo cumpriu seu propósito.</p>
            </button>
          </div>
        </div>
      )}
      {/* Step 4: A Síntese (O Espelho do Cérebro Generativo) */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-lg mx-auto">
          <h3 className="text-2xl font-serif text-emerald-50 mb-8 text-center">
            A Síntese
          </h3>

          <div className="bg-[#0d1a16] border border-emerald-900/40 rounded-xl p-6 mb-8 min-h-[120px] flex items-center justify-center">
            {isGeneratingNarrative ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="text-emerald-100/50 text-sm italic">Sintetizando a memória do capítulo...</p>
              </div>
            ) : (
              <p className="text-emerald-50 leading-relaxed font-serif">
                {narrativeText}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-4 text-xs font-mono text-emerald-100/40 uppercase tracking-widest text-right mb-6">
            Epistemic Status: NARRATIVE
          </div>

          {!isGeneratingNarrative && (
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-full px-6 py-3 bg-[#0d1a16] hover:bg-[#11241e] border border-emerald-900/50 text-emerald-100 rounded-xl transition-colors group"
            >
              Fechar Capítulo
            </button>
          )}
        </div>
      )}
    </div>
  );
};
