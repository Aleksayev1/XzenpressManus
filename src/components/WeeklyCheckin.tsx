import React, { useState } from 'react';
import { fiveElements, type GuardianElement, type GuardianScores } from '../data/fiveElements';
import { Check } from 'lucide-react';

export interface WeeklyCheckinData {
  date: string;
  energyScore: number;
  sleepScore: number;
  emotionGuardianId: GuardianElement['id'];
  challenge?: string;
  victory?: string;
}

interface WeeklyCheckinProps {
  onComplete: (data: WeeklyCheckinData) => void;
  onSkip: () => void;
}

const ENERGY_LEVELS = [
  { value: 10, emoji: '😴', label: 'Sem forças' },
  { value: 30, emoji: '😓', label: 'Cansado' },
  { value: 55, emoji: '😐', label: 'Regular' },
  { value: 75, emoji: '🙂', label: 'Bem' },
  { value: 95, emoji: '⚡', label: 'Ótimo' },
];

const SLEEP_LEVELS = [
  { value: 10, emoji: '😵', label: 'Péssimo' },
  { value: 30, emoji: '😟', label: 'Ruim' },
  { value: 55, emoji: '😐', label: 'Regular' },
  { value: 75, emoji: '😴', label: 'Bom' },
  { value: 95, emoji: '🌙', label: 'Profundo' },
];

export const WeeklyCheckin: React.FC<WeeklyCheckinProps> = ({ onComplete, onSkip }) => {
  const [energyScore, setEnergyScore] = useState(55);
  const [sleepScore, setSleepScore] = useState(55);
  const [selectedEmotion, setSelectedEmotion] = useState<GuardianElement['id'] | null>(null);
  const [challenge, setChallenge] = useState('');
  const [victory, setVictory] = useState('');
  const [phase, setPhase] = useState<'energy' | 'sleep' | 'emotion' | 'text' | 'done'>('energy');

  const handleSubmit = () => {
    if (!selectedEmotion) return;
    setPhase('done');
    setTimeout(() => {
      onComplete({
        date: new Date().toISOString(),
        energyScore,
        sleepScore,
        emotionGuardianId: selectedEmotion,
        challenge: challenge.trim() || undefined,
        victory: victory.trim() || undefined,
      });
    }, 1200);
  };

  const phaseOrder: typeof phase[] = ['energy', 'sleep', 'emotion', 'text'];
  const phaseIndex = phaseOrder.indexOf(phase);
  const progress = phase === 'done' ? 100 : ((phaseIndex + 1) / phaseOrder.length) * 100;

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check-in registrado!</h2>
          <p className="text-gray-400 text-sm">Seu Mapa Vivo foi atualizado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Progress header */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Check-in Semanal</span>
          <button onClick={onSkip} className="text-xs text-gray-600 hover:text-gray-400">Pular</button>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-500 bg-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* PHASE 1 — Energy */}
          {phase === 'energy' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Como esteve sua energia?</h2>
              <p className="text-gray-400 text-sm mb-8">Esta semana, no geral</p>
              <div className="flex justify-between items-end gap-2 mb-6">
                {ENERGY_LEVELS.map(lvl => (
                  <button
                    key={lvl.value}
                    onClick={() => setEnergyScore(lvl.value)}
                    className={`flex flex-col items-center gap-1 transition-all duration-200 ${energyScore === lvl.value ? 'scale-125' : 'scale-100 opacity-60'}`}
                  >
                    <span className="text-3xl">{lvl.emoji}</span>
                    <span className="text-xs text-gray-500">{lvl.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPhase('sleep')}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
              >
                Próximo →
              </button>
            </div>
          )}

          {/* PHASE 2 — Sleep */}
          {phase === 'sleep' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Como foi seu sono?</h2>
              <p className="text-gray-400 text-sm mb-8">Esta semana, no geral</p>
              <div className="flex justify-between items-end gap-2 mb-6">
                {SLEEP_LEVELS.map(lvl => (
                  <button
                    key={lvl.value}
                    onClick={() => setSleepScore(lvl.value)}
                    className={`flex flex-col items-center gap-1 transition-all duration-200 ${sleepScore === lvl.value ? 'scale-125' : 'scale-100 opacity-60'}`}
                  >
                    <span className="text-3xl">{lvl.emoji}</span>
                    <span className="text-xs text-gray-500">{lvl.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('energy')}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setPhase('emotion')}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3 — Emotion */}
          {phase === 'emotion' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Emoção predominante?</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">O que mais marcou esta semana</p>
              <div className="space-y-2 mb-6">
                {fiveElements.map(el => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedEmotion(el.id)}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 text-left
                      ${selectedEmotion === el.id
                        ? 'scale-[1.02]'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}
                    style={selectedEmotion === el.id ? {
                      borderColor: el.color,
                      backgroundColor: el.color + '15'
                    } : {}}
                  >
                    <span className="text-2xl">{el.emoji}</span>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {el.emotions.imbalanced.slice(0, 3).join(' / ')}
                      </div>
                      <div className="text-xs text-gray-500">{el.organ}</div>
                    </div>
                    {selectedEmotion === el.id && (
                      <div className="ml-auto">
                        <Check className="w-4 h-4" style={{ color: el.color }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('sleep')}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setPhase('text')}
                  disabled={!selectedEmotion}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4 — Text (optional) */}
          {phase === 'text' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Compartilhe (opcional)</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">Esses registros fazem parte do seu Mapa de Evolução</p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                    Principal desafio desta semana
                  </label>
                  <textarea
                    value={challenge}
                    onChange={e => setChallenge(e.target.value)}
                    placeholder="O que foi difícil..."
                    maxLength={120}
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                    Principal vitória desta semana
                  </label>
                  <textarea
                    value={victory}
                    onChange={e => setVictory(e.target.value)}
                    placeholder="O que conquistei ou percebi..."
                    maxLength={120}
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('emotion')}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  ✨ Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
