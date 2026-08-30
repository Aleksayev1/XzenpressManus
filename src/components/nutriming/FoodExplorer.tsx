import React, { useState } from 'react';
import { Search, Info, Shield, Droplet, Flame, Leaf, Wind } from 'lucide-react';
import { MtcKnowledgeBase } from '../../services/nutriming/MtcKnowledgeBase';
import { ExplorationOption } from '../../types/nutriming';

interface FoodExplorerProps {
  foodQuery?: string;
  onExploreOption: (option: ExplorationOption) => void;
  onClose: () => void;
}

export const FoodExplorer: React.FC<FoodExplorerProps> = ({ foodQuery = 'café', onExploreOption, onClose }) => {
  const [query, setQuery] = useState(foodQuery);
  const mtcData = MtcKnowledgeBase['cafe']; // Mock para o MVP

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header - Busca Curiosa */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Quero variar o café da manhã..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Disclaimer Obrigatório (Segurança Regulatória) */}
        <div className="bg-slate-800/50 border-b border-slate-800 px-6 py-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Atenção:</strong> As duas lentes abaixo apresentam sistemas de conhecimento diferentes. 
            A perspectiva MTC reflete sabedoria tradicional e não é uma conclusão ou diagnóstico médico. 
            O objetivo é oferecer perspectivas para autoconhecimento e escolhas mais conscientes, respeitando sempre a sua cultura e disponibilidade local.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lente Nutricional (Ciência Ocidental / OMS) */}
            <div className="bg-slate-950 rounded-2xl border border-blue-900/30 overflow-hidden">
              <div className="bg-blue-950/40 p-4 border-b border-blue-900/30 flex items-center gap-2">
                <span className="text-xl">🔬</span>
                <h3 className="font-bold text-blue-400">Lente Nutricional</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Processamento (NOVA)</h4>
                  <p className="text-sm text-slate-300">Minimamente processado</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Fibras e Diversidade Vegetal</h4>
                  <p className="text-sm text-slate-300">Fonte de polifenóis (antioxidantes). Não contribui para a carga de fibras diárias.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Perspectiva Geral</h4>
                  <p className="text-sm text-slate-300">A adequação depende do horário e tolerância individual à cafeína. A OMS recomenda moderação para evitar interferência na absorção de micronutrientes em refeições principais.</p>
                </div>
              </div>
            </div>

            {/* Lente Tradicional (MTC) */}
            <div className="bg-slate-950 rounded-2xl border border-amber-900/30 overflow-hidden">
              <div className="bg-amber-950/40 p-4 border-b border-amber-900/30 flex items-center gap-2">
                <span className="text-xl">☯️</span>
                <h3 className="font-bold text-amber-400">Lente Tradicional (MTC)</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Natureza</h4>
                    <div className="flex items-center gap-1.5 text-sm text-amber-300 font-medium">
                      <Flame className="w-4 h-4" /> Quente
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Sabor</h4>
                    <p className="text-sm text-slate-300 capitalize">{mtcData.flavor.join(', ')}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Categoria Energética</h4>
                  <p className="text-sm text-slate-300">{mtcData.traditionalCategory}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Contexto Tradicional</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{mtcData.traditionalContext}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Seção de Ação (Exploration Options) */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-lg font-medium text-white mb-4">Baseado neste padrão, deseja experimentar uma prática?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => onExploreOption({
                  id: 'exp-breath',
                  type: 'breathing',
                  title: 'Respiração Guiada (2 min)',
                  durationMinutes: 2,
                  source: 'xzenpress-library',
                  safetyClass: 'low-risk-wellness',
                  requiresProfessionalReview: false,
                  enabled: true
                })}
                className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-left flex items-start gap-4 group"
              >
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Respiração Guiada</h4>
                  <p className="text-xs text-slate-400">Prática rápida de 2 minutos para regulação do sistema nervoso autônomo.</p>
                </div>
              </button>

              <button 
                onClick={() => onExploreOption({
                  id: 'exp-acu',
                  type: 'acupressure',
                  title: 'Educação Tradicional: Acupressão (3 min)',
                  durationMinutes: 3,
                  source: 'traditional-reference',
                  safetyClass: 'low-risk-wellness',
                  requiresProfessionalReview: false,
                  enabled: true
                })}
                className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-left flex items-start gap-4 group"
              >
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Droplet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Tradição: Acupressão</h4>
                  <p className="text-xs text-slate-400">Explore o contexto do ponto Zu San Li (E36) na tradição oriental.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950/70 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Fechar Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
