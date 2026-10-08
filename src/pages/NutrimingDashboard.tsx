import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NutrimingCapture } from '../components/nutriming/NutrimingCapture';
import { NutrimingCaptureFlows, CaptureMethod } from '../components/nutriming/NutrimingCaptureFlows';
import { NutrimingConfirmationModal } from '../components/nutriming/NutrimingConfirmationModal';
import { NutrimingPostPrandialCheckin } from '../components/nutriming/NutrimingPostPrandialCheckin';
import { ZenFoodBalance } from '../components/nutriming/ZenFoodBalance';
import { ZenMentorInsight } from '../components/nutriming/ZenMentorInsight';
import { FoodExplorer } from '../components/nutriming/FoodExplorer';
import { ZenInterventionModal } from '../components/nutriming/ZenInterventionModal';
import { MealEventsApi } from '../services/nutriming/mealEventsApi';
import { TemporalObservationEngine } from '../services/nutriming/TemporalObservationEngine';
import { ExplorationSelector } from '../services/nutriming/ExplorationSelector';
import { ZenEvent, PatternEventData, ExplorationOption, InterventionEventData, MealEvent, MicroObservation } from '../types/nutriming';
import { Check, ArrowLeft, Clock, ShieldAlert, ShieldCheck, Activity, Flame, Utensils, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthenticityReportModal } from '../components/nutriming/AuthenticityReportModal';
import { ClinicalCorrelationModal } from '../components/nutriming/ClinicalCorrelationModal';
import { NutrimingPage } from '../components/NutrimingPage';

interface NutrimingDashboardProps {
  onBack?: () => void;
  initialTab?: 'diet' | 'supplements';
}

export const NutrimingDashboard: React.FC<NutrimingDashboardProps> = ({ onBack, initialTab = 'diet' }) => {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState<'diet' | 'supplements'>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedFoods, setExtractedFoods] = useState<string[]>([]);
  const [activeCaptureMethod, setActiveCaptureMethod] = useState<CaptureMethod>(null);
  const [activePattern, setActivePattern] = useState<PatternEventData | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Registrado');
  
  // Controle da Janela de 2h Pós-Prandial (Sprint 2)
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<MealEvent | null>(null);

  // Modais de Integridade Alimentar e Telemetria N-of-1
  const [isAuthenticityReportOpen, setIsAuthenticityReportOpen] = useState(false);
  const [isClinicalCorrelationOpen, setIsClinicalCorrelationOpen] = useState(false);
  const [allMealEvents, setAllMealEvents] = useState<MealEvent[]>([]);

  // Controle dos modais da Sprint 3
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<ExplorationOption | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | undefined>(undefined);

  const refreshPendingMeal = () => {
    const pending = MealEventsApi.getPendingMealForCheckin();
    setPendingMeal(pending);
    const all = MealEventsApi.getAllMealEvents();
    setAllMealEvents(all);
  };

  useEffect(() => {
    refreshPendingMeal();
  }, []);
  
  const handleCaptureInitiated = (method: 'photo' | 'voice' | 'search' | 'favorite' | 'barcode') => {
    if (method === 'favorite') {
      setExtractedFoods(['Tapioca', 'Café coado']);
      setScannedBarcode(undefined);
      setIsModalOpen(true);
      return;
    }
    setActiveCaptureMethod(method);
  };

  const handleCaptureComplete = (foods: string[], barcode?: string) => {
    setActiveCaptureMethod(null);
    setExtractedFoods(foods);
    setScannedBarcode(barcode);
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
      setToastMessage('Refeição registrada com sucesso!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
      refreshPendingMeal();

      // 3. OBSERVE & MATCH (Fetch histórico e passa pro motor)
      const history = await MealEventsApi.fetchRecentMealEvents('mock-user-123');
      const observations = await MealEventsApi.fetchMicroObservations();
      
      // 4. CONFIDENCE, PATTERN & DO NOTHING ENGINE
      const patterns = TemporalObservationEngine.analyzeAndExtractPatterns([...history, newEvent], observations);
      
      if (patterns.length > 0) {
        // Se passou por todo o DoNothingEngine e tem insight válido:
        setActivePattern(patterns[0]);
      }
    }
  };

  const handleReject = () => {
    setIsModalOpen(false);
  };

  const handleCheckinComplete = async (obs: MicroObservation) => {
    setIsCheckinOpen(false);
    setToastMessage('Sensação de 2h registrada!');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
    refreshPendingMeal();

    // Reanalisar padrões cruzando refeições e micro-observações
    const history = await MealEventsApi.fetchRecentMealEvents('mock-user-123');
    const observations = await MealEventsApi.fetchMicroObservations();
    const patterns = TemporalObservationEngine.analyzeAndExtractPatterns(history, observations);
    if (patterns.length > 0) {
      setActivePattern(patterns[0]);
    }
  };

  const handleExplorePattern = () => {
    setIsExplorerOpen(true);
  };

  const handleExploreOption = (option: ExplorationOption) => {
    setIsExplorerOpen(false);
    setActiveIntervention(option);
  };

  const handleExplorePoint = (point: string) => {
    setIsModalOpen(false);
    setActiveIntervention({
      id: `opt-acupressure-${point}`,
      title: `Harmonização Somática no Ponto ${point}`,
      category: 'somatic',
      description: `Estimulação do ponto ${point} para restabelecer o equilíbrio do Qi e harmonizar o sistema nervoso e digestivo.`,
      durationSeconds: 60,
      guidanceType: 'acupressure'
    });
  };

  const handleInterventionComplete = (eventData: Partial<InterventionEventData>) => {
    setActiveIntervention(null);
    console.log('📦 [Sprint 3] Intervention/Response Event Salvo:', eventData);
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
            {toastMessage}
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
          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coluna da Esquerda: Ações e Insights */}
          <div className="space-y-6">
            {/* Banner da Janela Somática de 2h (quando há refeição recente) */}
            {pendingMeal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900 border border-emerald-500/40 flex items-center justify-between shadow-xl shadow-emerald-950/40 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                      Janela Somática de 2 Horas
                    </span>
                    <p className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                      Como assimilou: {pendingMeal.product?.name || 'sua refeição'}?
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckinOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  Avaliar (5s)
                </button>
              </motion.div>
            )}

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

          {/* Coluna da Direita: O Balanço e Módulos Clínicos */}
          <div className="space-y-6">
            <ZenFoodBalance />

            {/* Card de Integridade Alimentar & Adulterações */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4" />
                    {allMealEvents.some(m => m.stateResult?.personal?.compass === 'red') && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Integridade Alimentar
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                        OFFLINE
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Detecção de maquiagem e análogos industriais</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAuthenticityReportOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center gap-1 shadow-sm"
                >
                  Ver Relatório
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Auditados</span>
                  <span className="text-base font-black text-white">{allMealEvents.length}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Genuínos</span>
                  <span className="text-base font-black text-emerald-400">
                    {allMealEvents.filter(m => m.stateResult?.personal?.compass === 'green').length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-red-950/20 border border-red-900/30">
                  <span className="text-[10px] text-red-300 uppercase font-semibold block flex items-center justify-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    Alertas
                  </span>
                  <span className="text-base font-black text-red-400">
                    {allMealEvents.filter(m => m.stateResult?.personal?.compass === 'red').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Card de Telemetria e Correlação Prandial N-of-1 */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Correlação Prandial & VFC
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                        N-OF-1
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Monitoramento Autonômico N-of-1</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsClinicalCorrelationOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                >
                  Painel Clínico
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Controle de ruído metabólico e digestivo sobre a assimetria térmica cutânea (&Delta;T) e VFC (RMSSD).
              </p>
          </div>
        </main>
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
        barcode={scannedBarcode}
        onExplorePoint={handleExplorePoint}
      />

      {/* Modal da Janela de 2h Pós-Prandial */}
      <NutrimingPostPrandialCheckin 
        isOpen={isCheckinOpen}
        mealEvent={pendingMeal}
        onClose={() => setIsCheckinOpen(false)}
        onCompleted={handleCheckinComplete}
      />

      {/* Modal de Relatório de Integridade e Adulterações */}
      <AuthenticityReportModal
        isOpen={isAuthenticityReportOpen}
        onClose={() => setIsAuthenticityReportOpen(false)}
        mealEvents={allMealEvents}
      />

      {/* Modal de Correlação Prandial e Telemetria N-of-1 */}
      <ClinicalCorrelationModal
        isOpen={isClinicalCorrelationOpen}
        onClose={() => setIsClinicalCorrelationOpen(false)}
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
