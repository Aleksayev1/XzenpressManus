import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Target, Brain, Heart, Crown, Zap, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPageChange: (page: string) => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  action?: {
    text: string;
    page: string;
  };
  tips: string[];
  gradient: string;
  accentColor: string;
  badgeText: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isVisible,
  onClose,
  onPageChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const { t } = useLanguage();

  // Reset step when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: 'Bem-vindo ao XZenPress!',
      description: 'Sua plataforma completa de medicina integrativa — unindo milênios de sabedoria com ciência moderna',
      emoji: '🌟',
      icon: <Heart className="w-8 h-8 text-white" />,
      tips: [
        'Combine MTC, Craniopuntura YNSA e respiração científica em um só lugar',
        'Todas as ferramentas básicas são gratuitas e disponíveis 24/7',
        'Cada ponto terapêutico tem imagem de referência e timer integrado',
        'A IA Self Oracle prescreve pontos personalizados para o seu caso',
      ],
      gradient: 'from-rose-500 via-pink-500 to-purple-600',
      accentColor: '#f43f5e',
      badgeText: 'Início',
    },
    {
      id: 2,
      title: 'Acupressão MTC — Pontos Clássicos',
      description: 'Pontos milenares da Medicina Tradicional Chinesa para alívio natural e imediato de sintomas',
      emoji: '🫴',
      icon: <Target className="w-8 h-8 text-white" />,
      action: {
        text: 'Explorar Pontos MTC',
        page: 'acupressure',
      },
      tips: [
        'Pontos como ZS (Zusanli), BP6 e VB20 — referências clínicas testadas',
        'Terapia integrada: acupressão + respiração 4-7-8 + cromoterapia simultâneas',
        'Imagem anatômica de referência para localização precisa de cada ponto',
        'Filtros por categoria: Geral, Neurologia, Imunidade, Cardio e mais',
      ],
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      accentColor: '#10b981',
      badgeText: 'MTC',
    },
    {
      id: 3,
      title: 'Craniopuntura YNSA — Yamamoto',
      description: 'Nova Craniopuntura de Yamamoto: quatro grupos clínicos precisos no crânio para tratamento orgânico e neurológico',
      emoji: '🧠',
      icon: <Brain className="w-8 h-8 text-white" />,
      action: {
        text: 'Ver Craniopuntura',
        page: 'acupressure',
      },
      tips: [
        'Pontos Básicos (A-K): dores físicas, locomotor, cervical e lombalgia',
        'Ypsilon Bilaterais (têmpora): equilíbrio de órgãos internos — ação crônica e profunda',
        'Sensoriais/Cerebrais: visão, audição, emoções e gânglios basais',
        'Nervos Cranianos (I-XII): neurologia avançada — ação aguda e imediata',
        'Ponto ZS Hormonal: exclusivo para mulheres — eixo hipotálamo-hipófise (eficácia 99%)',
      ],
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      accentColor: '#8b5cf6',
      badgeText: 'YNSA',
    },
    {
      id: 4,
      title: 'Self Oracle — IA de Diagnóstico',
      description: 'Inteligência artificial que analisa seus sintomas e prescreve pontos clínicos com base em agudez ou cronicidade',
      emoji: '🔮',
      icon: <Sparkles className="w-8 h-8 text-white" />,
      action: {
        text: 'Consultar o Oráculo',
        page: 'plantas-medicinais',
      },
      tips: [
        'Selecione "Agudo" → IA prioriza Nervos Cranianos (ação imediata, occipital)',
        'Selecione "Crônico" → IA prioriza Ypsilon Bilaterais (reequilíbrio orgânico, temporal)',
        'Selecione "Misto" → protocolo combinado com prioridade dupla',
        'Prescrição de pontos MTC + YNSA + fitoterápicos + plantas medicinais',
        'Visualize imagens dos pontos prescritos diretamente no resultado',
      ],
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      accentColor: '#f59e0b',
      badgeText: 'IA Oracle',
    },
    {
      id: 5,
      title: 'Respiração 4-7-8 + Cromoterapia',
      description: 'Técnica científica validada com cores terapêuticas sincronizadas — ativa o sistema nervoso parassimpático',
      emoji: '🌈',
      icon: <Activity className="w-8 h-8 text-white" />,
      action: {
        text: 'Experimentar Agora',
        page: 'breathing',
      },
      tips: [
        '4s Inspire (Azul) → 7s Segure (Verde) → 8s Expire (Roxo)',
        'Ativa o nervo vago e reduz cortisol em sessões de 3 minutos',
        'Cromoterapia sincronizada potencializa o efeito em até 3x',
        'Use antes ou durante a aplicação de pontos de acupressão',
      ],
      gradient: 'from-blue-500 via-cyan-500 to-sky-600',
      accentColor: '#3b82f6',
      badgeText: 'Respiração',
    },
    {
      id: 6,
      title: 'Sons Harmonizantes',
      description: 'Biblioteca de frequências terapêuticas para criar seu ambiente de cura ideal',
      emoji: '🎵',
      icon: <Zap className="w-8 h-8 text-white" />,
      tips: [
        'Frequências binaurais: Alpha (relaxamento), Theta (meditação), Delta (sono)',
        'Integração com Spotify Premium para assinantes',
        'Combine sons com respiração e acupressão para potencializar resultados',
        'Player compacto flutuante disponível em todas as páginas',
      ],
      gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
      accentColor: '#ec4899',
      badgeText: 'Sons',
    },
    {
      id: 7,
      title: 'Você está Pronto para Começar! ✨',
      description: 'Sua jornada terapêutica integrativa começa agora — com a ciência do Oriente e do Ocidente ao seu lado',
      emoji: '🚀',
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      tips: [
        '1. Descreva seu sintoma ao Self Oracle → receba pontos prescritos',
        '2. Localize o ponto pela imagem → aplique com pressão leve circular',
        '3. Ative a respiração 4-7-8 + cromoterapia durante a aplicação',
        '4. Para dor aguda: priorize Nervos Cranianos (occipital)',
        '5. Para condição crônica: priorize Ypsilon Bilaterais (têmpora)',
        '6. Acompanhe sua evolução no Dashboard',
      ],
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      accentColor: '#10b981',
      badgeText: 'Concluído',
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const isLast = currentStep === tutorialSteps.length - 1;
  const isFirst = currentStep === 0;

  const goToStep = (step: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setAnimating(false);
    }, 200);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) goToStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  const handleAction = () => {
    if (currentStepData.action) {
      localStorage.setItem('xzenpress_tutorial_seen', 'true');
      onClose();
      onPageChange(currentStepData.action.page);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('xzenpress_tutorial_seen', 'true');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        style={{ boxShadow: `0 25px 80px -10px ${currentStepData.accentColor}40` }}
      >
        {/* ── HEADER GRADIENTE ── */}
        <div className={`bg-gradient-to-br ${currentStepData.gradient} relative overflow-hidden flex-shrink-0`}>
          {/* Background blur orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

          <div className="relative z-10 p-6 pb-5">
            {/* Top row: badge + step counter + close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentStepData.badgeText}
                </span>
                <span className="text-white/70 text-xs font-medium">
                  {currentStep + 1} / {tutorialSteps.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl flex-shrink-0">
                {currentStepData.icon}
              </div>
              <div className="pt-1">
                <div className="text-3xl mb-1">{currentStepData.emoji}</div>
                <h2 className="text-xl font-bold text-white leading-tight">{currentStepData.title}</h2>
                <p className="text-white/85 text-sm mt-1 leading-relaxed">{currentStepData.description}</p>
              </div>
            </div>
          </div>

          {/* Progress dots bar */}
          <div className="relative z-10 px-6 pb-4 flex items-center gap-1.5">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white w-8'
                    : index < currentStep
                    ? 'bg-white/60 w-4'
                    : 'bg-white/25 w-4'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ opacity: animating ? 0.3 : 1, transition: 'opacity 0.2s ease' }}
        >
          {/* Tips list */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: `${currentStepData.accentColor}08`,
              borderColor: `${currentStepData.accentColor}20`,
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: currentStepData.accentColor }}>
              💡 O que você vai encontrar aqui
            </h3>
            <div className="space-y-3">
              {currentStepData.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white"
                    style={{ backgroundColor: currentStepData.accentColor }}
                  >
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button (optional) */}
          {currentStepData.action && (
            <button
              onClick={handleAction}
              className={`w-full bg-gradient-to-r ${currentStepData.gradient} text-white py-3.5 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <span>{currentStepData.action.text}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── NAVIGATION FOOTER ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Anterior</span>
          </button>

          <button
            onClick={handleFinish}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Pular tutorial
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              className={`flex items-center gap-2 bg-gradient-to-r ${currentStepData.gradient} text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all font-semibold shadow-md`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Começar!</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className={`flex items-center gap-2 bg-gradient-to-r ${currentStepData.gradient} text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-semibold shadow-md`}
            >
              <span className="text-sm">Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};