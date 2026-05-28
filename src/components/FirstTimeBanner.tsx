import React, { useState, useEffect } from 'react';
import { X, Brain, Target, Sparkles, ArrowRight } from 'lucide-react';

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
      <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Gradient header strip */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-lg" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-white font-bold text-base leading-tight">🌟 Primeira vez aqui?</div>
              <div className="text-white/80 text-xs mt-0.5">Conheça o XZenPress em 2 minutos</div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2.5">
          {/* Feature rows */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-gray-700 text-sm">Pontos MTC + Craniopuntura YNSA</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-700 text-sm">Respiração 4-7-8 com cromoterapia</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-gray-700 text-sm">Self Oracle (IA) — diagnóstico inteligente</span>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartTutorial}
            className="w-full mt-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Começar Tutorial</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDismiss}
            className="w-full text-gray-400 hover:text-gray-600 text-sm transition-colors py-1"
          >
            Pular por agora
          </button>
        </div>

        {/* Floating Animation */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-500 rounded-full" />
      </div>
    </div>
  );
};