import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, Flame, Snowflake, Scale, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { MealEvent, MicroObservation } from '../../types/nutriming';
import { MealEventsApi } from '../../services/nutriming/mealEventsApi';

interface NutrimingPostPrandialCheckinProps {
  isOpen: boolean;
  mealEvent: MealEvent | null;
  onClose: () => void;
  onCompleted: (observation: MicroObservation) => void;
}

export const NutrimingPostPrandialCheckin: React.FC<NutrimingPostPrandialCheckinProps> = ({
  isOpen,
  mealEvent,
  onClose,
  onCompleted
}) => {
  const [belly, setBelly] = useState<MicroObservation['check']['belly']>('normal');
  const [energy, setEnergy] = useState<MicroObservation['check']['energy']>('stable');
  const [mood, setMood] = useState<MicroObservation['check']['mood']>('same');
  const [thermalSense, setThermalSense] = useState<'neutral' | 'warm' | 'cold'>('neutral');
  const [craving, setCraving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const foodName = mealEvent?.product?.name || 'sua refeição recente';

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const observation: MicroObservation = {
      id: `obs_${Date.now()}`,
      userId: mealEvent?.userId || 'user_active',
      mealEventId: mealEvent?.id || `meal_mock_${Date.now()}`,
      capturedAt: new Date().toISOString(),
      offsetMinutesAfterMeal: 120,
      check: {
        belly,
        energy,
        mood,
        craving
      },
      note: thermalSense !== 'neutral' ? `Sensação térmica: ${thermalSense}` : undefined
    };

    await MealEventsApi.saveMicroObservation(observation);
    setIsSubmitting(false);
    onCompleted(observation);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0d1a16] border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto"
        >
          {/* Botão de Fechar */}
          <button 
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/70 text-emerald-100/70 hover:text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Topo: Identificação da Janela de 2 Horas */}
          <div className="p-6 pb-4 border-b border-emerald-900/40 bg-gradient-to-b from-emerald-950/40 to-transparent">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Janela Somática de 2 Horas</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Como seu corpo assimilou?
            </h3>
            <p className="text-xs text-emerald-200/70">
              Alimento: <strong className="text-emerald-300 capitalize">{foodName}</strong>
            </p>
          </div>

          <div className="p-6 space-y-5 text-left text-xs">
            {/* 1. Sensação no Abdômen / Digestão */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">
                1. Como está seu estômago e digestão?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBelly('light')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    belly === 'light'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">🪶</span>
                  Leve / Fluido
                </button>

                <button
                  type="button"
                  onClick={() => setBelly('normal')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    belly === 'normal'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">⚖️</span>
                  Confortável
                </button>

                <button
                  type="button"
                  onClick={() => setBelly('bloated')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    belly === 'bloated'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">🎈</span>
                  Estufado
                </button>

                <button
                  type="button"
                  onClick={() => setBelly('heavy')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    belly === 'heavy'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">🪨</span>
                  Pesado / Lento
                </button>

                <button
                  type="button"
                  onClick={() => setBelly('pain')}
                  className={`p-2.5 rounded-xl border text-center transition-all col-span-2 ${
                    belly === 'pain'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">⚡</span>
                  Azia / Desconforto gástrico
                </button>
              </div>
            </div>

            {/* 2. Nível de Energia e Disposição */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">
                2. Nível de energia e clareza mental agora:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEnergy('up')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    energy === 'up'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">⚡</span>
                  Foco & Vitalidade
                </button>

                <button
                  type="button"
                  onClick={() => setEnergy('stable')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    energy === 'stable'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">⚖️</span>
                  Estável / Neutro
                </button>

                <button
                  type="button"
                  onClick={() => setEnergy('down')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    energy === 'down'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-base block mb-0.5">🥱</span>
                  Queda / Sonolência
                </button>
              </div>
            </div>

            {/* 3. Sensação Térmica Corporal (MTC) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">
                3. Sensação de temperatura interna corporal (MTC):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setThermalSense('warm')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    thermalSense === 'warm'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Calor / Aquecido
                </button>

                <button
                  type="button"
                  onClick={() => setThermalSense('neutral')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    thermalSense === 'neutral'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  Equilibrado
                </button>

                <button
                  type="button"
                  onClick={() => setThermalSense('cold')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    thermalSense === 'cold'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                  Frio / Calafrios
                </button>
              </div>
            </div>

            {/* 4. Desejo por Açúcar / Beliscar */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">
                4. Saciedade e vontades:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCraving(false)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                    !craving
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  ✅ Satisfeito sem urgência
                </button>
                <button
                  type="button"
                  onClick={() => setCraving(true)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                    craving
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  🍬 Vontade de doce / beliscar
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé com botão de confirmação */}
          <div className="p-6 pt-3 border-t border-emerald-900/40 bg-slate-950/60 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 text-xs font-medium transition-colors"
            >
              Depois
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Resposta Somática'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
