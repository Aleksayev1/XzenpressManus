import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Target, Brain, Heart, Crown, Play, Zap } from 'lucide-react';
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
  const { t } = useLanguage();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: t('tutorial.step1.title'),
      description: t('tutorial.step1.description'),
      icon: <Heart className="w-8 h-8 text-red-500" />,
      tips: [
        t('tutorial.step1.tip1'),
        t('tutorial.step1.tip2'),
        t('tutorial.step1.tip3'),
        t('tutorial.step1.tip4')
      ],
      color: 'red'
    },
    {
      id: 2,
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.description'),
      icon: <Target className="w-8 h-8 text-green-500" />,
      action: {
        text: t('tutorial.step2.action'),
        page: 'acupressure'
      },
      tips: [
        t('tutorial.step2.tip1'),
        t('tutorial.step2.tip2'),
        t('tutorial.step2.tip3'),
        t('tutorial.step2.tip4')
      ],
      color: 'green'
    },
    {
      id: 3,
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.description'),
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      action: {
        text: t('tutorial.step3.action'),
        page: 'breathing'
      },
      tips: [
        t('tutorial.step3.tip1'),
        t('tutorial.step3.tip2'),
        t('tutorial.step3.tip3'),
        t('tutorial.step3.tip4')
      ],
      color: 'blue'
    },
    {
      id: 4,
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.description'),
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      tips: [
        t('tutorial.step4.tip1'),
        t('tutorial.step4.tip2'),
        t('tutorial.step4.tip3'),
        t('tutorial.step4.tip4')
      ],
      color: 'purple'
    },
    {
      id: 5,
      title: t('tutorial.step5.title'),
      description: t('tutorial.step5.description'),
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      action: {
        text: t('tutorial.step5.action'),
        page: 'premium'
      },
      tips: [
        t('tutorial.step5.tip1'),
        t('tutorial.step5.tip2'),
        t('tutorial.step5.tip3'),
        t('tutorial.step5.tip4')
      ],
      color: 'yellow'
    },
    {
      id: 6,
      title: t('tutorial.step6.title'),
      description: t('tutorial.step6.description'),
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      tips: [
        t('tutorial.step6.tip1'),
        t('tutorial.step6.tip2'),
        t('tutorial.step6.tip3'),
        t('tutorial.step6.tip4'),
        t('tutorial.step6.tip5'),
        t('tutorial.step6.tip6')
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
                className={`w-3 h-3 rounded-full transition-all ${index === currentStep
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
            <h3 className="font-bold text-gray-800 mb-4">💡 {t('tutorial.tips')}:</h3>
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
              <span>{t('tutorial.previous')}</span>
            </button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} {t('tutorial.of')} {tutorialSteps.length}
            </div>

            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('tutorial.finish')}</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>{t('tutorial.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};