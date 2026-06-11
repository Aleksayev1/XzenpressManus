import React, { useState } from 'react';
import { fiveElements, type GuardianElement, type GuardianScores } from '../data/fiveElements';

interface MapaVivoOnboardingProps {
  onComplete: (scores: GuardianScores, dominantId: GuardianElement['id']) => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
}

const STEPS: OnboardingStep[] = [
  { id: 1, title: 'Como foi seu sono?', subtitle: 'Toque na imagem que mais representa suas noites recentes' },
  { id: 2, title: 'Como está sua energia agora?', subtitle: 'Toque na postura que representa como você se sente' },
  { id: 3, title: 'Qual emoção predominou em você?', subtitle: 'Toque na que mais ressoa nos últimos dias' },
  { id: 4, title: 'Qual Guardião está mais apagado em você?', subtitle: 'Confie na sua intuição. Toque no que sentir' },
];

const SLEEP_OPTIONS = [
  { value: 20, label: 'Muito agitado', emoji: '😵', desc: 'Muitos acordares, sonhos intensos' },
  { value: 45, label: 'Irregular', emoji: '😟', desc: 'Dificuldade para dormir ou acordar cedo' },
  { value: 70, label: 'Razoável', emoji: '😐', desc: 'Durmo, mas não me sinto descansado' },
  { value: 95, label: 'Profundo', emoji: '😴', desc: 'Sono tranquilo e reparador' },
];

const ENERGY_OPTIONS = [
  { value: 15, label: 'Sem energia', emoji: '🥱', desc: 'Sinto que não tenho forças para nada' },
  { value: 40, label: 'Cansado', emoji: '😓', desc: 'Consigo o básico, mas me sinto pesado' },
  { value: 70, label: 'Estável', emoji: '🙂', desc: 'Energia razoável, sem altos ou baixos' },
  { value: 95, label: 'Cheio de energia', emoji: '⚡', desc: 'Ativo, disposto e com vontade de agir' },
];

const EMOTION_OPTIONS = [
  { emotion: 'raiva', emoji: '😤', label: 'Raiva / Frustração', guardianId: 'madeira' as const },
  { emotion: 'ansiedade', emoji: '😰', label: 'Ansiedade / Agitação', guardianId: 'fogo' as const },
  { emotion: 'preocupação', emoji: '😟', label: 'Preocupação / Ruminação', guardianId: 'terra' as const },
  { emotion: 'tristeza', emoji: '😢', label: 'Tristeza / Melancolia', guardianId: 'metal' as const },
  { emotion: 'medo', emoji: '😨', label: 'Medo / Insegurança', guardianId: 'agua' as const },
  { emotion: 'paz', emoji: '😌', label: 'Paz / Tranquilidade', guardianId: 'agua' as const },
  { emotion: 'alegria', emoji: '😊', label: 'Alegria / Gratidão', guardianId: 'fogo' as const },
  { emotion: 'criatividade', emoji: '🌱', label: 'Criatividade / Propósito', guardianId: 'madeira' as const },
];

export const MapaVivoOnboarding: React.FC<MapaVivoOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [sleepScore, setSleepScore] = useState<number | null>(null);
  const [energyScore, setEnergyScore] = useState<number | null>(null);
  const [emotionGuardian, setEmotionGuardian] = useState<GuardianElement['id'] | null>(null);
  const [weakGuardian, setWeakGuardian] = useState<GuardianElement['id'] | null>(null);
  const [revealing, setRevealing] = useState(false);

  const handleSleepSelect = (value: number) => {
    setSleepScore(value);
    setTimeout(() => setStep(2), 500);
  };

  const handleEnergySelect = (value: number) => {
    setEnergyScore(value);
    setTimeout(() => setStep(3), 500);
  };

  const handleEmotionSelect = (guardianId: GuardianElement['id']) => {
    setEmotionGuardian(guardianId);
    setTimeout(() => setStep(4), 500);
  };

  const handleGuardianSelect = (guardianId: GuardianElement['id']) => {
    setWeakGuardian(guardianId);
    setRevealing(true);
    setTimeout(() => {
      // Calculate initial scores
      const baseScore = 50;
      const scores: GuardianScores = {
        madeira: baseScore,
        fogo: baseScore,
        terra: baseScore,
        metal: baseScore,
        agua: baseScore,
      };

      // Reduce score for the weak guardian identified in step 4
      if (guardianId) scores[guardianId] = Math.max(10, baseScore - 30);
      // Slightly reduce score for emotion guardian identified in step 3
      if (emotionGuardian && emotionGuardian !== guardianId) {
        scores[emotionGuardian] = Math.max(20, scores[emotionGuardian] - 15);
      }
      // Apply sleep and energy as global modifiers
      const sleepMod = sleepScore ? (sleepScore - 50) / 10 : 0;
      const energyMod = energyScore ? (energyScore - 50) / 10 : 0;
      Object.keys(scores).forEach(k => {
        scores[k as keyof GuardianScores] = Math.min(100, Math.max(5,
          scores[k as keyof GuardianScores] + sleepMod + energyMod
        ));
      });

      onComplete(scores, guardianId);
    }, 2500);
  };

  const getGuardianBrightness = (el: GuardianElement) => {
    // In step 4, show guardians with varying dim/bright to prompt intuition
    const seed = el.id.charCodeAt(0) + el.id.charCodeAt(1);
    const brightness = [0.3, 0.6, 0.45, 0.8, 0.25];
    return brightness[seed % 5];
  };

  const currentStep = STEPS[step - 1];
  const progress = (step / 4) * 100;

  if (revealing) {
    const chosen = fiveElements.find(e => e.id === weakGuardian)!;
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center animate-pulse-slow max-w-sm">
          <div className="text-8xl mb-6 animate-bounce">{chosen.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-3">Seu Guardião foi encontrado</h2>
          <p className="text-lg font-semibold mb-2" style={{ color: chosen.color }}>
            {chosen.name}
          </p>
          <p className="text-gray-400 text-sm">{chosen.weakMessage}</p>
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: chosen.color, borderTopColor: 'transparent' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header with progress */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-widest">Despertar do Avatar Vital</div>
          <div className="text-xs text-gray-500">{step} de 4</div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
            <p className="text-gray-400 text-sm">{currentStep.subtitle}</p>
          </div>

          {/* Step 1 — Sleep */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {SLEEP_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSleepSelect(opt.value)}
                  className={`
                    p-5 rounded-2xl border-2 transition-all duration-300 text-center
                    ${sleepScore === opt.value
                      ? 'border-purple-500 bg-purple-900/30 scale-105'
                      : 'border-gray-700 bg-gray-900 hover:border-purple-500/50 hover:bg-gray-800'}
                  `}
                >
                  <div className="text-4xl mb-2">{opt.emoji}</div>
                  <div className="text-white font-semibold text-sm">{opt.label}</div>
                  <div className="text-gray-400 text-xs mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Energy */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {ENERGY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleEnergySelect(opt.value)}
                  className={`
                    p-5 rounded-2xl border-2 transition-all duration-300 text-center
                    ${energyScore === opt.value
                      ? 'border-yellow-500 bg-yellow-900/20 scale-105'
                      : 'border-gray-700 bg-gray-900 hover:border-yellow-500/50 hover:bg-gray-800'}
                  `}
                >
                  <div className="text-4xl mb-2">{opt.emoji}</div>
                  <div className="text-white font-semibold text-sm">{opt.label}</div>
                  <div className="text-gray-400 text-xs mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Emotion */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-3">
              {EMOTION_OPTIONS.map(opt => (
                <button
                  key={opt.emotion}
                  onClick={() => handleEmotionSelect(opt.guardianId)}
                  className={`
                    p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center gap-3
                    ${emotionGuardian === opt.guardianId
                      ? 'border-indigo-500 bg-indigo-900/20 scale-105'
                      : 'border-gray-700 bg-gray-900 hover:border-indigo-500/50 hover:bg-gray-800'}
                  `}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-white text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4 — Guardian Intuition */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {fiveElements.map(el => {
                  const brightness = getGuardianBrightness(el);
                  return (
                    <button
                      key={el.id}
                      onClick={() => handleGuardianSelect(el.id)}
                      className="relative p-4 rounded-2xl border-2 border-gray-700 bg-gray-900 hover:border-opacity-100 transition-all duration-300 flex items-center gap-4 text-left group hover:scale-[1.02]"
                      style={{ borderColor: `${el.color}${Math.round(brightness * 255).toString(16).padStart(2, '0')}` }}
                    >
                      {/* Glow effect */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                        style={{ backgroundColor: el.color }}
                      />
                      {/* Guardian icon with brightness */}
                      <div
                        className="text-4xl flex-shrink-0 transition-all duration-300"
                        style={{ opacity: brightness + 0.2, filter: brightness < 0.5 ? 'grayscale(60%)' : 'none' }}
                      >
                        {el.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{el.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: el.color }}>{el.organ}</div>
                        <div className="text-xs text-gray-500 mt-1">{el.emotions.imbalanced.slice(0, 2).join(', ')}</div>
                      </div>
                      {/* Brightness bar */}
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${brightness * 100}%`, backgroundColor: el.color }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-600">
          {step < 4
            ? 'Confie no que você sente. Não existe resposta errada.'
            : 'Qual Guardião pede mais atenção agora?'
          }
        </p>
      </div>
    </div>
  );
};
