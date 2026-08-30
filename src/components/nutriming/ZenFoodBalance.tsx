import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Box, Clock, Activity, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Representação de tendências: up, down, stable, none
type Trend = 'up' | 'down' | 'stable' | 'none';

interface BalanceMetric {
  id: string;
  label: string;
  trend: Trend;
  icon: React.ReactNode;
}

export const ZenFoodBalance: React.FC = () => {
  const { t } = useTranslation();

  // Mock initial state for Sprint 1
  const metrics: BalanceMetric[] = [
    { id: 'diversity', label: 'Diversidade', trend: 'up', icon: <Leaf className="w-5 h-5 text-green-400" /> },
    { id: 'processing', label: 'Processamento (NOVA)', trend: 'stable', icon: <Box className="w-5 h-5 text-amber-400" /> },
    { id: 'variety', label: 'Variedade', trend: 'down', icon: <Activity className="w-5 h-5 text-blue-400" /> },
    { id: 'rhythm', label: 'Ritmo Alimentar', trend: 'up', icon: <Clock className="w-5 h-5 text-purple-400" /> },
    { id: 'data', label: 'Qualidade dos Dados', trend: 'stable', icon: <Database className="w-5 h-5 text-gray-400" /> }
  ];

  const renderTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'up': return <span className="text-emerald-400 font-bold">↑</span>;
      case 'down': return <span className="text-rose-400 font-bold">↓</span>;
      case 'stable': return <span className="text-gray-400 font-bold">→</span>;
      case 'none': return <span className="text-gray-600 font-bold">—</span>;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white mb-1">
          {t('Zen Food Balance', 'Zen Food Balance')}
        </h2>
        <p className="text-xs text-gray-400">
          {t('Comparando você com sua própria baseline (N-of-1).', 'Comparando você com sua própria baseline (N-of-1).')}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-black/20">
                {metric.icon}
              </div>
              <span className="text-gray-200 text-sm font-medium">{metric.label}</span>
            </div>
            <div className="text-xl">
              {renderTrendIcon(metric.trend)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
