import React, { useState, useEffect } from 'react';
import { X, Play, ArrowRight, CheckCircle, Target, Brain, Heart, Crown } from 'lucide-react';

interface FirstTimeBannerProps {
  onStartTutorial: () => void;
}

export const FirstTimeBanner: React.FC<FirstTimeBannerProps> = ({ onStartTutorial }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Verificar se é primeira vez do usuário
    const hasSeenTutorial = localStorage.getItem('xzenpress_tutorial_seen');
    const hasSeenBanner = localStorage.getItem('xzenpress_banner_dismissed');
    
    if (!hasSeenTutorial && !hasSeenBanner) {
      // Mostrar banner após 2 segundos para não ser intrusivo
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000);
    }
  }, []);

  const handleStartTutorial = () => {
    localStorage.setItem('xzenpress_banner_dismissed', 'true');
    setIsVisible(false);
    onStartTutorial();
  };

  const handleDismiss = () => {
    localStorage.setItem('xzenpress_banner_dismissed', 'true');
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transition-all duration-500 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl shadow-2xl p-1 max-w-sm">
        <div className="bg-white rounded-xl p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              🌟 Primeira vez aqui?
            </h3>
            <p className="text-sm text-gray-600">
              Descubra como aproveitar ao máximo o XZenPress
            </p>
          </div>

          {/* Preview Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-2 h-2 text-blue-600" />
              </div>
              <span className="text-gray-700">Como usar os pontos de acupressão</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <Brain className="w-2 h-2 text-green-600" />
              </div>
              <span className="text-gray-700">Respiração 4-7-8 com cromoterapia</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-2 h-2 text-purple-600" />
              </div>
              <span className="text-gray-700">Terapia integrada para máximo resultado</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-yellow-600" />
              </div>
              <span className="text-gray-700">Recursos Premium disponíveis</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStartTutorial}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Play className="w-4 h-4" />
            <span>Começar Tutorial</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Skip Option */}
          <button
            onClick={handleDismiss}
            className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Pular tutorial
          </button>

          {/* Floating Animation */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};