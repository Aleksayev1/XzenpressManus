import React from 'react';
import { X, Brain, Sparkles } from 'lucide-react';

interface AIRecommendationsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({ 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recomendações IA</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Demonstração IA</h3>
              </div>
              <p className="text-purple-700 mb-4">
                Esta é uma demonstração de como as recomendações de IA funcionarão no futuro.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🫁 Recomendação Personalizada</h4>
                  <p className="text-gray-600 text-sm">
                    Baseado no seu perfil, recomendamos 3 sessões de respiração 4-7-8 por dia, 
                    focando no período da manhã para reduzir ansiedade.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Ponto Sugerido</h4>
                  <p className="text-gray-600 text-sm">
                    O ponto Yintang (EX-HN3) seria ideal para seu perfil de estresse atual.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">⏰ Horário Otimizado</h4>
                  <p className="text-gray-600 text-sm">
                    Melhor horário para suas sessões: 7h-9h e 19h-21h.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Em Desenvolvimento:</strong> As recomendações reais de IA serão baseadas 
                no seu histórico de uso, perfil de saúde e padrões comportamentais.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};