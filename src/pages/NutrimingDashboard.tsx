import React, { useState } from 'react';
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
}

export const NutrimingDashboard: React.FC<NutrimingDashboardProps> = ({ onBack }) => {
  const { t } = useTranslation();
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
          <p className="text-gray-400">O ecossistema que aprende com a sua rotina alimentar.</p>
        </header>

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
