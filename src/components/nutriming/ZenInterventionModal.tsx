import React, { useState } from 'react';
import { ExplorationOption, InterventionEventData } from '../../types/nutriming';
import { Wind, Activity, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZenInterventionModalProps {
  option: ExplorationOption;
  onComplete: (eventData: Partial<InterventionEventData>) => void;
  onClose: () => void;
}

type Step = 'action_choice' | 'baseline_pre' | 'practice' | 'baseline_post' | 'feedback_post';

export const ZenInterventionModal: React.FC<ZenInterventionModalProps> = ({ option, onComplete, onClose }) => {
  const [step, setStep] = useState<Step>('action_choice');
  const [baselinePre, setBaselinePre] = useState<number | null>(null);
  const [baselinePost, setBaselinePost] = useState<number | null>(null);
  
  const handleActionChoice = (choice: 'experiment_now' | 'continue_observing' | 'learn_more') => {
    if (choice === 'experiment_now') {
      setStep('baseline_pre');
    } else if (choice === 'continue_observing') {
      onComplete({ userAction: 'continue_observing', explorationOptionId: option.id });
    } else {
      // Learn more (abre um artigo na vida real)
      onComplete({ userAction: 'learn_more', explorationOptionId: option.id });
    }
  };

  const handleBaselinePreSubmit = () => {
    if (baselinePre !== null) setStep('practice');
  };

  const handlePracticeComplete = () => {
    setStep('baseline_post');
  };

  const handleBaselinePostSubmit = () => {
    if (baselinePost !== null) setStep('feedback_post');
  };

  const handleFeedbackSubmit = (feedback: 'Melhor' | 'Sem mudança' | 'Diferente' | 'Pior' | 'Não tenho certeza') => {
    onComplete({
      userAction: 'experiment_now',
      explorationOptionId: option.id,
      baselinePre: baselinePre!,
      baselinePost: baselinePost!,
      postInterventionFeedback: feedback
    });
  };

  // Componente de Régua 1-5 (Energia)
  const BaselineRuler = ({ value, onChange }: { value: number | null, onChange: (v: number) => void }) => (
    <div className="flex justify-between gap-2 mt-4 mb-6">
      {[1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 py-4 rounded-xl text-lg font-bold border transition-all ${
            value === v 
              ? 'bg-emerald-500 border-emerald-400 text-slate-900 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col relative min-h-[400px]">
        
        {/* Progress Bar (se estiver no fluxo ativo) */}
        {step !== 'action_choice' && (
          <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{
            width: step === 'baseline_pre' ? '25%' : step === 'practice' ? '50%' : step === 'baseline_post' ? '75%' : '100%'
          }} />
        )}

        <div className="p-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* ETAPA 1: A ESCOLHA LIVRE */}
            {step === 'action_choice' && (
              <motion.div key="action_choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Wind className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{option.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Você gostaria de experimentar esta prática de {option.durationMinutes} minutos agora?
                  </p>
                </div>

                <div className="space-y-3">
                  <button onClick={() => handleActionChoice('experiment_now')} className="w-full p-4 rounded-xl font-bold text-sm bg-emerald-500 text-slate-950 hover:brightness-110 transition-all border border-emerald-400">
                    Experimentar agora
                  </button>
                  <button onClick={() => handleActionChoice('learn_more')} className="w-full p-4 rounded-xl font-medium text-sm bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700">
                    Saiba mais
                  </button>
                  <button onClick={() => handleActionChoice('continue_observing')} className="w-full p-4 rounded-xl font-medium text-sm bg-transparent text-slate-500 hover:text-slate-300 transition-all">
                    Continuar observando
                  </button>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: BASELINE PRE */}
            {step === 'baseline_pre' && (
              <motion.div key="baseline_pre" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Passo 1/3</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Antes de começarmos...</h3>
                <p className="text-slate-400 text-sm">Como está o seu nível de energia neste exato momento? (1 = Esgotado, 5 = Máximo)</p>
                
                <BaselineRuler value={baselinePre} onChange={setBaselinePre} />

                <button 
                  onClick={handleBaselinePreSubmit}
                  disabled={baselinePre === null}
                  className="w-full p-4 rounded-xl font-bold text-sm bg-emerald-500 text-slate-950 hover:brightness-110 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* ETAPA 3: A PRÁTICA (SIMULADA AQUI) */}
            {step === 'practice' && (
              <motion.div key="practice" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-8">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <Wind className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Respire...</h3>
                  <p className="text-sm text-slate-400">Simulando {option.durationMinutes} minutos de prática.</p>
                </div>
                <button 
                  onClick={handlePracticeComplete}
                  className="px-8 py-3 rounded-xl font-bold text-sm bg-slate-800 text-white hover:bg-slate-700 transition-all border border-slate-700 mt-4"
                >
                  Concluir Prática
                </button>
              </motion.div>
            )}

            {/* ETAPA 4: BASELINE POST */}
            {step === 'baseline_post' && (
              <motion.div key="baseline_post" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Passo 3/3</span>
                </div>
                <h3 className="text-2xl font-bold text-white">E agora?</h3>
                <p className="text-slate-400 text-sm">Após a prática, como está o seu nível de energia?</p>
                
                <BaselineRuler value={baselinePost} onChange={setBaselinePost} />

                <button 
                  onClick={handleBaselinePostSubmit}
                  disabled={baselinePost === null}
                  className="w-full p-4 rounded-xl font-bold text-sm bg-emerald-500 text-slate-950 hover:brightness-110 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
                >
                  Ver resultado
                </button>
              </motion.div>
            )}

            {/* ETAPA 5: FEEDBACK E RESULTADO OBSERVACIONAL */}
            {step === 'feedback_post' && (
              <motion.div key="feedback_post" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 flex flex-col items-center justify-center text-center space-y-2 mb-2">
                  <span className="text-3xl">📊</span>
                  <p className="text-sm text-slate-300">
                    Você registrou uma mudança de <strong className="text-emerald-400 text-lg">{baselinePre}</strong> para <strong className="text-emerald-400 text-lg">{baselinePost}</strong> após a prática.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Isso é uma observação pessoal, não prova de causalidade.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-3">Depois da prática, o que você percebeu?</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'Melhor', emoji: '🙂' },
                      { id: 'Sem mudança', emoji: '😐' },
                      { id: 'Diferente', emoji: '🤔' },
                      { id: 'Pior', emoji: '🙁' },
                      { id: 'Não tenho certeza', emoji: '🤷', isDull: true }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleFeedbackSubmit(f.id as any)}
                        className={`w-full p-3.5 rounded-xl text-left font-medium text-sm transition-all flex items-center gap-3 border ${
                          f.isDull 
                            ? 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{f.emoji}</span>
                        {f.id}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Close Header (Aparece apenas na etapa 1) */}
        {step === 'action_choice' && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
