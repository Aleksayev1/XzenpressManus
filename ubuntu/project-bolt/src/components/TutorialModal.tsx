import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Target, Brain, Heart, Crown, Play, Zap } from 'lucide-react';

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
  action?: {
    text: string;
    page: string;
  };
  tips: string[];
  color: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ 
  isVisible, 
  onClose, 
  onPageChange 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: '🌟 Bem-vindo ao XZenPress!',
      description: 'Sua plataforma completa de bem-estar integrativa que combina Medicina Tradicional Chinesa, Craniopuntura, respiração científica e cromoterapia.',
      icon: <Heart className="w-8 h-8 text-red-500" />,
      tips: [
        'Plataforma 100% baseada em evidências científicas',
        'Mais de 15 anos de experiência clínica',
        'Técnicas aprovadas pela Medicina Tradicional Chinesa',
        'Resultados comprovados em milhares de usuários'
      ],
      color: 'red'
    },
    {
      id: 2,
      title: '🫴 Pontos de Acupressão',
      description: 'Comece explorando nossos 20 pontos terapêuticos. 9 pontos são gratuitos e 11 são premium para casos específicos.',
      icon: <Target className="w-8 h-8 text-green-500" />,
      action: {
        text: 'Explorar Pontos',
        page: 'acupressure'
      },
      tips: [
        'Clique em qualquer ponto para ver detalhes',
        'Leia as instruções antes de aplicar',
        'Use o timer integrado para duração correta',
        'Combine com respiração para potencializar efeitos'
      ],
      color: 'green'
    },
    {
      id: 3,
      title: '🧘 Respiração 4-7-8',
      description: 'Técnica científica que combina 4 segundos de inspiração, 7 de retenção e 8 de expiração com cromoterapia sincronizada.',
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      action: {
        text: 'Praticar Respiração',
        page: 'breathing'
      },
      tips: [
        'Azul na inspiração (4s) - ativa sistema parassimpático',
        'Verde na retenção (7s) - equilibra sistema nervoso',
        'Roxo na expiração (8s) - libera tensões',
        'Pratique 3-4 ciclos para começar'
      ],
      color: 'blue'
    },
    {
      id: 4,
      title: '⚡ Terapia Integrada',
      description: 'O diferencial do XZenPress: combine acupressão + respiração + cromoterapia + sons em uma única sessão.',
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      tips: [
        'Escolha um ponto de acupressão',
        'Clique "Iniciar Terapia Integrada"',
        'Siga a respiração 4-7-8 enquanto pressiona o ponto',
        'As cores mudam automaticamente com sua respiração'
      ],
      color: 'purple'
    },
    {
      id: 5,
      title: '👑 Recursos Premium',
      description: 'Desbloqueie pontos especializados, consulta WhatsApp, sons exclusivos e recomendações de IA.',
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      action: {
        text: 'Ver Premium',
        page: 'premium'
      },
      tips: [
        '11 pontos premium para casos específicos',
        'Consulta personalizada via WhatsApp',
        'Biblioteca completa de 50+ sons',
        'Recomendações baseadas em IA'
      ],
      color: 'yellow'
    },
    {
      id: 6,
      title: '🎯 Dicas para Máximo Resultado',
      description: 'Siga estas recomendações para obter os melhores resultados com o XZenPress.',
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      tips: [
        '🕐 Pratique no mesmo horário todos os dias',
        '🧘 Comece com 5 minutos e aumente gradualmente',
        '📱 Use sem pressa, foque na qualidade',
        '💡 Combine técnicas para potencializar efeitos',
        '📊 Acompanhe seu progresso (Premium)',
        '🎵 Use sons harmonizantes durante a prática'
      ],
      color: 'green'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-500 to-pink-500 bg-red-50 border-red-200 text-red-600',
      green: 'from-green-500 to-emerald-500 bg-green-50 border-green-200 text-green-600',
      blue: 'from-blue-500 to-cyan-500 bg-blue-50 border-blue-200 text-blue-600',
      purple: 'from-purple-500 to-violet-500 bg-purple-50 border-purple-200 text-purple-600',
      yellow: 'from-yellow-400 to-orange-500 bg-yellow-50 border-yellow-200 text-yellow-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getColorClasses(currentStepData.color).split(' ')[0]} ${getColorClasses(currentStepData.color).split(' ')[1]} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                {currentStepData.icon}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-white text-opacity-90">{currentStepData.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? `bg-gradient-to-r ${getColorClasses(currentStepData.color).split(' ')[0]} ${getColorClasses(currentStepData.color).split(' ')[1]}`
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className={`${getColorClasses(currentStepData.color).split(' ')[2]} border ${getColorClasses(currentStepData.color).split(' ')[3]} rounded-xl p-6 mb-6`}>
            <h3 className="font-bold text-gray-800 mb-4">💡 Dicas importantes:</h3>
            <div className="space-y-3">
              {currentStepData.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${getColorClasses(currentStepData.color).split(' ')[2]}`}>
                    <CheckCircle className={`w-3 h-3 ${getColorClasses(currentStepData.color).split(' ')[4]}`} />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {currentStepData.action && (
            <div className="mb-6">
              <button
                onClick={handleAction}
                className={`w-full bg-gradient-to-r ${getColorClasses(currentStepData.color).split(' ')[0]} ${getColorClasses(currentStepData.color).split(' ')[1]} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                <span>{currentStepData.action.text}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} de {tutorialSteps.length}
            </div>

            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};