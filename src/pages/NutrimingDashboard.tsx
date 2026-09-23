import React, { useState } from 'react';
import { NutrimingPage } from '../components/NutrimingPage';
import { Pill, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NutrimingCapture } from '../components/nutriming/NutrimingCapture';
import { NutrimingCaptureFlows, CaptureMethod } from '../components/nutriming/NutrimingCaptureFlows';
import { NutrimingConfirmationModal } from '../components/nutriming/NutrimingConfirmationModal';
import { ZenFoodBalance } from '../components/nutriming/ZenFoodBalance';
import { ZenMentorInsight } from '../components/nutriming/ZenMentorInsight';
import { FoodExplorer } from '../components/nutriming/FoodExplorer';
import { ZenInterventionModal } from '../components/nutriming/ZenInterventionModal';
import { MealEventsApi } from '../services/nutriming/mealEventsApi';
import { TemporalObservationEngine } from '../services/nutriming/TemporalObservationEngine';
import { ExplorationSelector } from '../services/nutriming/ExplorationSelector';
import { ZenEvent, PatternEventData, ExplorationOption, InterventionEventData } from '../types/nutriming';
import { Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NutrimingDashboardProps {
  onBack?: () => void;
  initialTab?: 'diet' | 'supplements';
}

export const NutrimingDashboard: React.FC<NutrimingDashboardProps> = ({ onBack, initialTab = 'diet' }) => {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState<'diet' | 'supplements'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedFoods, setExtractedFoods] = useState<string[]>([]);
  const [activeCaptureMethod, setActiveCaptureMethod] = useState<CaptureMethod>(null);
  const [activePattern, setActivePattern] = useState<PatternEventData | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  // Controle dos modais da Sprint 3
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<ExplorationOption | null>(null);
  
  const handleCaptureInitiated = (method: 'photo' | 'voice' | 'search' | 'favorite') => {
    if (method === 'favorite') {
      setExtractedFoods(['Tapioca', 'Café coado']);
      setIsModalOpen(true);
      return;
    }
    setActiveCaptureMethod(method);
  };

  const handleCaptureComplete = (foods: string[]) => {
    setActiveCaptureMethod(null);
    setExtractedFoods(foods);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    
    // 1. Criar o evento formatado (Sprint 2 Provenance + userConfirmed)
    const newEvent: ZenEvent = {
      id: `evt-${Date.now()}`,
      userId: 'mock-user-123',
      type: 'food',
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      provenance: { source: 'user', method: 'photo-mock', confidence: 0.8 },
      data: {
        foods: extractedFoods.map(f => ({
          name: f,
          estimated: true,
          confidence: 0.82,
          userConfirmed: true // O pulo do gato do GPT
        }))
      },
      createdAt: new Date().toISOString()
    };

    // 2. SAVE (API Mock que retorna < 1s provando os <10s)
    const saved = await MealEventsApi.createMealEvent(newEvent);
    if (saved) {
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);

      // 3. OBSERVE & MATCH (Fetch histórico e passa pro motor)
      const history = await MealEventsApi.fetchRecentMealEvents('mock-user-123');
      
      // 4. CONFIDENCE, PATTERN & DO NOTHING ENGINE
      const patterns = TemporalObservationEngine.analyzeAndExtractPatterns([...history, newEvent]);
      
      if (patterns.length > 0) {
        // Se passou por todo o DoNothingEngine e tem insight válido:
        setActivePattern(patterns[0]);
      }
    }
  };

  const handleReject = () => {
    setIsModalOpen(false);
  };

  const handleExplorePattern = () => {
    setIsExplorerOpen(true);
  };

  const handleExploreOption = (option: ExplorationOption) => {
    setIsExplorerOpen(false);
    setActiveIntervention(option);
  };

  const handleInterventionComplete = (eventData: Partial<InterventionEventData>) => {
    setActiveIntervention(null);
    console.log('📦 [Sprint 3] Intervention/Response Event Salvo:', eventData);
    // Na vida real: MealEventsApi.createInterventionEvent(eventData);
    // E então fechamos o card de padrão pois a ação foi tomada
    setActivePattern(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Toast de Sucesso Rápido */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Check className="w-5 h-5" />
            Registrado
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10 text-center relative">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center backdrop-blur-sm"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-4xl font-light text-white mb-2">Nutriming <span className="text-emerald-400 font-medium">Zen</span></h1>
          <p className="text-gray-400">Nutrição Integrativa 360°: Dietoterapia Energética & Suplementação Circadiana.</p>
        </header>

        {/* ── Seletor de Abas Principais: Dietoterapia vs Suplementos ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl gap-2">
            <button
              type="button"
              onClick={() => setActiveMainTab('diet')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeMainTab === 'diet'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Dietoterapia (MTC & Ayurveda)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('supplements')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeMainTab === 'supplements'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Suplementos & Crononutrição</span>
            </button>
          </div>
        </div>

        {activeMainTab === 'supplements' ? (
          <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl backdrop-blur-xl">
            <NutrimingPage onPageChange={(p) => {
              if (p === 'home' && onBack) onBack();
            }} />
          </div>
        ) : (
          <>

        {/* Banner Interativo MTC + Ayurveda com Teste Rapido em 1 Toque */}
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-purple-950/50 border border-emerald-500/30 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h2 className="text-base font-semibold text-emerald-300 tracking-wide">
                Avaliação Energética: MTC & Ayurveda
              </h2>
            </div>
            <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
              Yin/Yang • Doshas • 5 Sabores • Agni
            </span>
          </div>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Selecione um exemplo abaixo para abrir a <strong>Bússola Nutriming</strong> e conferir a análise em tempo real com orientações de harmonização (sem precisar tirar foto):
          </p>
          <div className="flex flex-wrap gap-2.5">
            {[
              { name: 'Café com Canela', tag: 'Yang • Estimula Agni', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-200' },
              { name: 'Inhame com Gengibre', tag: 'MTC Baço • Acalma Vata', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-200' },
              { name: 'Salada de Folhas Cruas', tag: 'Yin Frio • Reduz Pitta', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-cyan-200' },
              { name: 'Ginseng com Mel', tag: 'Tônico Qi & Ojas', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-200' },
              { name: 'Sopa de Abóbora com Cúrcuma', tag: 'Tridosha • Nutre Jing', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-200' },
            ].map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setExtractedFoods([sample.name]);
                  setIsModalOpen(true);
                }}
                className={`text-xs px-3.5 py-2 rounded-xl border bg-gradient-to-r ${sample.color} hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm`}
              >
                <span className="font-semibold">{sample.name}</span>
                <span className="opacity-75 text-[11px]">({sample.tag})</span>
              </button>
            ))}
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coluna da Esquerda: Ações e Insights */}
          <div className="space-y-6">
            <NutrimingCapture onCaptureInitiated={handleCaptureInitiated} />
            
            <AnimatePresence>
              {activePattern && (
                <ZenMentorInsight 
                  pattern={activePattern}
                  onExplore={handleExplorePattern}
                  onObserve={() => setActivePattern(null)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Coluna da Direita: O Balanço */}
          <div>
            <ZenFoodBalance />
          </div>
        </main>
          </>
        )}
      </div>

      {activeCaptureMethod && (
        <NutrimingCaptureFlows 
          method={activeCaptureMethod}
          onCancel={() => setActiveCaptureMethod(null)}
          onComplete={handleCaptureComplete}
        />
      )}

      <NutrimingConfirmationModal 
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onReject={handleReject}
        extractedFoods={extractedFoods}
      />

      {isExplorerOpen && activePattern && (
        <FoodExplorer 
          onExploreOption={handleExploreOption} 
          onClose={() => setIsExplorerOpen(false)} 
        />
      )}

      {activeIntervention && (
        <ZenInterventionModal 
          option={activeIntervention}
          onComplete={handleInterventionComplete}
          onClose={() => setActiveIntervention(null)}
        />
      )}
    </div>
  );
};
