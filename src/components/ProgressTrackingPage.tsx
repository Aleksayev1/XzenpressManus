import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, BarChart3, Activity, Zap, Brain, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { acupressurePoints } from '../data/acupressurePoints';
import { useLanguage } from '../contexts/LanguageContext';
import { loadAnamneseProfile } from '../data/anamneseProfile';
import { MapaVivoStorageService } from '../services/mapaVivoStorageService';
import { fiveElements } from '../data/fiveElements';
import { type WeeklyCheckinData } from './WeeklyCheckin';
import { supabase } from '../lib/supabase';

interface ProgressTrackingPageProps {
  onPageChange: (page: string) => void;
}


interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'daily' | 'weekly' | 'monthly';
  icon: React.ReactNode;
  color: string;
}

const emotionalEngineMetadata: Record<string, {
  patternLabel: string;
  reformaIntima: string;
  meditacao: string;
  acupressao: string;
  frequenciaHz: number;
  frequenciaDesc: string;
}> = {
  madeira: {
    patternLabel: 'Ressentimento e Frustração (Eixo Fígado-Madeira)',
    reformaIntima: 'Praticar o autoperdão e a flexibilidade perante as imperfeições alheias. Soltar mágoas antigas para liberar o fluxo de criatividade.',
    meditacao: 'Meditação do Grito Silencioso com expirações profundas para expulsar a energia estagnada do peito e do abdômen.',
    acupressao: 'Estímulo bilateral do ponto LV3 (Tai Chong) + GB34 (Yang Ling Quan) para dispersar a raiva e mover o Qi estagnado.',
    frequenciaHz: 528,
    frequenciaDesc: 'Reparação Celular & Transformação de Ressentimento em Mansidão'
  },
  fogo: {
    patternLabel: 'Ansiedade, Agitação e Orgulho (Eixo Coração-Fogo)',
    reformaIntima: 'Praticar o silêncio interno e a humildade. Combater o orgulho espiritual e a pressa mental através da caridade silenciosa e desinteressada.',
    meditacao: 'Coerência Cardíaca (respiração guiada 5s inspiração / 5s expiração) para sincronizar o ritmo do coração.',
    acupressao: 'Estímulo do ponto HT7 (Shen Men) + PC6 (Nei Guan) para acalmar a mente (Shen) e aliviar palpitações e angústia.',
    frequenciaHz: 639,
    frequenciaDesc: 'Harmonização de Conexões Sociais & Cura do Orgulho/Ego'
  },
  terra: {
    patternLabel: 'Preocupação e Ruminação Mental (Eixo Baço-Terra)',
    reformaIntima: 'Praticar a entrega e a aceitação. Compreender que você não tem o controle de tudo. Confiar no fluxo natural da vida e do tempo.',
    meditacao: 'Meditação Mindfulness na respiração abdominal consciente e atenção plena aos sentidos físicos no momento presente.',
    acupressao: 'Estímulo do ponto SP6 (San Yin Jiao) + ST36 (Zu San Li) para tonificar o centro e estabilizar os pensamentos.',
    frequenciaHz: 174,
    frequenciaDesc: 'Aterramento & Alívio de Tensão Mental e Preocupação Crônica'
  },
  metal: {
    patternLabel: 'Tristeza, Apego e Culpa (Eixo Pulmão-Metal)',
    reformaIntima: 'Praticar o desapego e aceitar as perdas como parte do ciclo evolutivo. Libertar-se de culpas antigas e autopunições inúteis.',
    meditacao: 'Meditação do Desapego (Visualização de folhas secas sendo levadas pelo vento, simbolizando o fluxo natural da vida).',
    acupressao: 'Estímulo do ponto LU7 (Lie Que) + LI4 (He Gu) para promover a liberação emocional e fortalecer a barreira defensiva (Wei Qi).',
    frequenciaHz: 741,
    frequenciaDesc: 'Desintoxicação Celular & Cura de Culpa e Tristeza Profunda'
  },
  agua: {
    patternLabel: 'Medo, Insegurança e Falta de Propósito (Eixo Rim-Água)',
    reformaIntima: 'Fortalecer a coragem moral e a fé na sua jornada. Conectar-se com sua ancestralidade para resgatar a força vital e o senso de direção.',
    meditacao: 'Meditação de Aterramento (Visualização de Raízes profundas descendo dos pés até o centro da Terra).',
    acupressao: 'Estímulo do ponto KD3 (Tai Xi) + KD1 (Yong Quan) para nutrir a essência (Jing) e ancorar a mente.',
    frequenciaHz: 396,
    frequenciaDesc: 'Liberação de Medos Subconscientes & Ativação da Coragem e Propósito'
  }
};

export const ProgressTrackingPage: React.FC<ProgressTrackingPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { sessions, stats, loading, error } = useSessionHistory(selectedPeriod);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkins, setCheckins] = useState<WeeklyCheckinData[]>([]);
  const [dbTelemetryLoaded, setDbTelemetryLoaded] = useState(false);

  useEffect(() => {
    const fetchCheckins = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const data = await MapaVivoStorageService.loadCheckins(user.id);
        setCheckins(data || []);
      } catch (err) {
        console.error("Erro ao carregar check-ins no Dashboard:", err);
      }
    };
    fetchCheckins();
  }, [user?.id]);

  useEffect(() => {
    const fetchCloudTelemetry = async () => {
      if (!user?.id) return;
      try {
        const { data: telemetryData, error: telemetryError } = await supabase
          .from('xzen_user_telemetry')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (telemetryData && telemetryData.length > 0 && !telemetryError) {
          const latest = telemetryData[0];
          localStorage.setItem('wearable_vfc', latest.wearable_vfc.toString());
          if (latest.wearable_rhr) {
            localStorage.setItem('wearable_rhr', latest.wearable_rhr.toString());
          }
          if (latest.wearable_sleep) {
            localStorage.setItem('wearable_sleep', latest.wearable_sleep);
          }
          if (latest.active_device_id) {
            localStorage.setItem('active_device_id', latest.active_device_id);
          }
        }

        const { data: statusData, error: statusError } = await supabase
          .from('xzen_user_telemetry_status')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statusData && !statusError) {
          localStorage.setItem('active_device_id', statusData.active_device_id || '');
        }

        setDbTelemetryLoaded(true);
      } catch (err) {
        console.error('Erro ao sincronizar telemetria da nuvem:', err);
      }
    };
    fetchCloudTelemetry();
  }, [user?.id]);

  // Load Anamnese profile for chronological age calculation
  const profile = React.useMemo(() => loadAnamneseProfile(), []);

  // Emotional AI Engine calculations
  const { activeCounts, totalRecentCount, isSimulated, dominantElementId, dominantCount, dominantElement } = React.useMemo(() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentEmotionalCheckins = checkins.filter(c => new Date(c.date) >= sixtyDaysAgo);

    const emotionalCounts: Record<string, number> = {
      madeira: 0,
      fogo: 0,
      terra: 0,
      metal: 0,
      agua: 0
    };

    recentEmotionalCheckins.forEach(c => {
      if (c.emotionGuardianId && emotionalCounts[c.emotionGuardianId] !== undefined) {
        emotionalCounts[c.emotionGuardianId]++;
      }
    });

    const isSim = checkins.length < 3;
    const activeCountsMap = { ...emotionalCounts };
    let totalCount = recentEmotionalCheckins.length;

    if (isSim) {
      // Seed mock counts based on weakest guardian score or default emotions
      const weakestElement = profile?.guardianScores
        ? (Object.entries(profile.guardianScores) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0]
        : 'fogo'; // Fallback to fogo
      
      activeCountsMap[weakestElement] = 18;
      const otherElements = Object.keys(activeCountsMap).filter(k => k !== weakestElement);
      activeCountsMap[otherElements[0]] = 8;
      activeCountsMap[otherElements[1]] = 5;
      activeCountsMap[otherElements[2]] = 3;
      activeCountsMap[otherElements[3]] = 1;
      totalCount = 35; // Total simulated episodes
    }

    const sortedElements = (Object.keys(activeCountsMap) as Array<keyof typeof activeCountsMap>)
      .sort((a, b) => activeCountsMap[b] - activeCountsMap[a]);
    const dominantId = sortedElements[0];
    const domCount = activeCountsMap[dominantId];
    const domElement = fiveElements.find(e => e.id === dominantId)!;

    return {
      activeCounts: activeCountsMap,
      totalRecentCount: totalCount,
      isSimulated: isSim,
      dominantElementId: dominantId,
      dominantCount: domCount,
      dominantElement: domElement
    };
  }, [checkins, profile]);
  
  const chronologicalAge = React.useMemo(() => {
    if (!profile) return 40;
    const mapping: Record<string, number> = {
      '18-29': 24,
      '30-44': 37,
      '45-59': 52,
      '60+': 68
    };
    return mapping[profile.faixaEtaria] || 40;
  }, [profile]);

  // Retrieve wearable telemetry from localStorage
  const wearableVfc = Number(localStorage.getItem('wearable_vfc')) || 55;

  const wearableSleep = localStorage.getItem('wearable_sleep') || '1h 30m';

  // Convert sleep string to minutes
  const sleepMinutes = React.useMemo(() => {
    const hoursMatch = wearableSleep.match(/(\d+)\s*h/);
    const minutesMatch = wearableSleep.match(/(\d+)\s*m/);
    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
  }, [wearableSleep]);

  // Compute dynamic Jing Index and Biological Age Recoil
  const { jingIndex, biologicalAge, recoil } = React.useMemo(() => {
    const sessionsCount = sessions?.length || 0;
    const vfcScore = Math.min(100, (wearableVfc / 80) * 100);
    const sleepScore = Math.min(100, (sleepMinutes / 120) * 100);
    const acupressureScore = Math.min(100, (sessionsCount / 8) * 100);
    const nutrimingScore = 85; // Default consistency index

    const index = Math.min(100, Math.max(15, Math.round(
      vfcScore * 0.35 + sleepScore * 0.25 + acupressureScore * 0.25 + nutrimingScore * 0.15
    )));

    const maxRecoil = 6.5;
    const computedRecoil = Number(((index / 100) * maxRecoil).toFixed(1));
    const computedBioAge = Number((chronologicalAge - computedRecoil).toFixed(1));

    return {
      jingIndex: index,
      recoil: computedRecoil,
      biologicalAge: computedBioAge
    };
  }, [sessions, wearableVfc, sleepMinutes, chronologicalAge]);

  // Progression chart points over 6 weeks
  const chartPoints = React.useMemo(() => {
    const p1 = chronologicalAge;
    const p2 = chronologicalAge - (recoil * 0.15);
    const p3 = chronologicalAge - (recoil * 0.35);
    const p4 = chronologicalAge - (recoil * 0.6);
    const p5 = chronologicalAge - (recoil * 0.8);
    const p6 = biologicalAge;
    return [
      Number(p1.toFixed(1)),
      Number(p2.toFixed(1)),
      Number(p3.toFixed(1)),
      Number(p4.toFixed(1)),
      Number(p5.toFixed(1)),
      Number(p6.toFixed(1))
    ];
  }, [chronologicalAge, recoil, biologicalAge]);

  // Verificar se usuário é Premium
  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <TrendingUp className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('progress.premium.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('progress.premium.subtitle')}
            </p>

            {/* Premium Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Métricas Avançadas</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• {t('dashboard.premium.features.history')}</li>
                  <li>• {t('dashboard.premium.features.charts')}</li>
                  <li>• {t('dashboard.premium.features.analytics')}</li>
                  <li>• {t('dashboard.premium.features.comparison')}</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Metas Inteligentes</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Metas adaptativas baseadas no perfil</li>
                  <li>• Acompanhamento de consistência</li>
                  <li>• Alertas de progresso</li>
                  <li>• Recomendações de melhoria</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Sistema de Conquistas</h3>
                </div>
                <ul className="text-sm text-purple-700 space-y-1 text-left">
                  <li>• Badges de progresso</li>
                  <li>• Sequências de dias consecutivos</li>
                  <li>• Marcos de bem-estar</li>
                  <li>• Certificados de conquistas</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-800">Insights de IA</h3>
                </div>
                <ul className="text-sm text-indigo-700 space-y-1 text-left">
                  <li>• Análise preditiva de bem-estar</li>
                  <li>• Recomendações personalizadas</li>
                  <li>• Detecção de padrões</li>
                  <li>• Otimização automática</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-8 border border-green-300">
              <h3 className="font-semibold text-green-800 mb-2">📊 Acompanhamento Científico</h3>
              <p className="text-green-700 text-sm">
                Transforme sua prática em dados científicos. Monitore tendências,
                identifique o que funciona melhor e otimize seus resultados de bem-estar.
              </p>
            </div>

            <button
              onClick={() => onPageChange('premium')}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              📈 {t('progress.premium.activate')}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Analytics profissionais • Dados seguros • Insights únicos
            </p>
          </div>
        </div>
      </div>
    );
  }
  useEffect(() => {
    // Atualizar metas baseadas nas estatísticas reais
    if (stats) {
      const updatedGoals: Goal[] = [
        {
          id: 'daily-breathing',
          title: t('progress.goals.daily_breathing'),
          description: 'Praticar respiração 4-7-8 todos os dias',
          target: 1,
          current: stats.sessionsByType['breathing'] || 0,
          unit: 'sessão/dia',
          category: 'daily',
          icon: <Brain className="w-5 h-5" />,
          color: 'blue'
        },
        {
          id: 'weekly-acupressure',
          title: t('progress.goals.weekly_acupressure'),
          description: 'Aplicar pontos de acupressão regularmente',
          target: 7,
          current: (stats.sessionsByType['acupressure'] || 0) + (stats.sessionsByType['integrated'] || 0),
          unit: 'sessões/semana',
          category: 'weekly',
          icon: <Target className="w-5 h-5" />,
          color: 'green'
        },
        {
          id: 'total-time',
          title: t('progress.goals.total_time'),
          description: 'Meta de tempo semanal de prática',
          target: 1800, // 30 minutos
          current: stats.totalTime,
          unit: 'segundos/semana',
          category: 'weekly',
          icon: <Heart className="w-5 h-5" />,
          color: 'purple'
        },
        {
          id: 'effectiveness',
          title: t('progress.goals.effectiveness'),
          description: 'Manter avaliação média acima de 4.0',
          target: 4.0,
          current: stats.averageEffectiveness,
          unit: 'pontos',
          category: 'daily',
          icon: <Zap className="w-5 h-5" />,
          color: 'indigo'
        }
      ];
      setGoals(updatedGoals);
    } else {
      // Metas padrão quando não há dados
      const defaultGoals: Goal[] = [
        {
          id: 'daily-breathing',
          title: t('progress.goals.daily_breathing'),
          description: 'Praticar respiração 4-7-8 todos os dias',
          target: 1,
          current: 0,
          unit: 'sessão/dia',
          category: 'daily',
          icon: <Brain className="w-5 h-5" />,
          color: 'blue'
        },
        {
          id: 'weekly-acupressure',
          title: t('progress.goals.weekly_acupressure'),
          description: 'Aplicar pontos de acupressão regularmente',
          target: 7,
          current: 0,
          unit: 'sessões/semana',
          category: 'weekly',
          icon: <Target className="w-5 h-5" />,
          color: 'green'
        },
        {
          id: 'total-time',
          title: t('progress.goals.total_time'),
          description: 'Meta de tempo semanal de prática',
          target: 1800,
          current: 0,
          unit: 'segundos/semana',
          category: 'weekly',
          icon: <Heart className="w-5 h-5" />,
          color: 'purple'
        },
        {
          id: 'effectiveness',
          title: t('progress.goals.effectiveness'),
          description: 'Manter avaliação média acima de 4.0',
          target: 4.0,
          current: 0,
          unit: 'pontos',
          category: 'daily',
          icon: <Zap className="w-5 h-5" />,
          color: 'indigo'
        }
      ];
      setGoals(defaultGoals);
    }
  }, [stats]);

  const getFavoritePointName = (pointId: string): string => {
    const point = acupressurePoints.find(p => p.id === pointId);
    return point ? point.name : pointId;
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.id === 'total-time') {
      // Para tempo, mostrar progresso normal
      return Math.min(100, (goal.current / goal.target) * 100);
    }
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50 border-blue-200',
      green: 'bg-green-500 text-green-600 bg-green-50 border-green-200',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50 border-indigo-200',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('progress.restricted.title')}</h2>
          <p className="text-gray-600 mb-6">{t('progress.restricted.subtitle')}</p>
          <button
            onClick={() => onPageChange('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('progress.restricted.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('progress.title')}</h1>
              <p className="text-gray-600 mt-2">{t('progress.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">{t('progress.period.week')}</option>
                <option value="month">{t('progress.period.month')}</option>
                <option value="year">{t('progress.period.year') || 'Anual'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading && (
            <div className="col-span-full text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">{t('progress.loading')}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{t('progress.error')}: {error}</p>
            </div>
          )}

          {goals.map((goal) => {
            const percentage = getProgressPercentage(goal);
            const colorClasses = getColorClasses(goal.color).split(' ');

            return (
              <div key={goal.id} className={`bg-white rounded-2xl p-6 shadow-lg border ${colorClasses[3]}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 ${colorClasses[2]} rounded-lg`}>
                    <div className={colorClasses[1]}>{goal.icon}</div>
                  </div>
                  <div className={`px-2 py-1 ${colorClasses[2]} rounded-full text-xs font-semibold ${colorClasses[1]}`}>
                    {goal.category}
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{goal.description}</p>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-semibold">{goal.current}/{goal.target} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colorClasses[0]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <span className={`text-lg font-bold ${colorClasses[1]}`}>
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Histórico de Sessões</h2>

            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.slice(0, 10).map((session, index) => (
                  <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${session.sessionType === 'breathing' ? 'bg-blue-500' :
                        session.sessionType === 'acupressure' ? 'bg-green-500' :
                          session.sessionType === 'integrated' ? 'bg-purple-500' :
                            'bg-gray-500'
                        }`}></div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {session.sessionType === 'breathing' ? 'Respiração 4-7-8' :
                            session.sessionType === 'acupressure' ? 'Acupressão' :
                              session.sessionType === 'integrated' ? 'Terapia Integrada' :
                                'Cromoterapia'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(session.completedAt || session.createdAt || '').toLocaleDateString('pt-BR')} •
                          {Math.floor(session.durationSeconds / 60)}min {session.durationSeconds % 60}s
                        </div>
                        {session.pointsUsed && session.pointsUsed.length > 0 && (
                          <div className="text-xs text-blue-600">
                            Pontos: {session.pointsUsed.map(pointId => {
                              const point = acupressurePoints.find(p => p.id === pointId);
                              return point ? point.name.split(' ')[0] : pointId;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {session.effectivenessRating && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${i < Math.floor(session.effectivenessRating || 0) ? 'bg-yellow-400' : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      )}
                      {session.effectivenessRating && (
                        <div className="text-sm text-gray-600 mt-1">{session.effectivenessRating}/5</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-600 mb-2">{t('progress.no_sessions.title')}</h3>
                <p className="text-gray-500 text-sm">
                  {t('progress.no_sessions.subtitle')}
                </p>
              </div>
            )}
          </div>

          {/* Real-time Statistics */}
          <div className="space-y-6">
            {/* Current Period Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Resumo {selectedPeriod === 'week' ? 'Semanal' : selectedPeriod === 'month' ? 'Mensal' : 'Anual'}
              </h3>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">{t('progress.stats.total_sessions')}</span>
                    </div>
                    <span className="text-blue-600 font-bold">{stats.totalSessions}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">{t('progress.stats.total_time')}</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      {Math.floor(stats.totalTime / 60)}min
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">{t('progress.stats.favorite_point')}</span>
                    </div>
                    <span className="text-purple-600 font-bold text-sm">
                      {getFavoritePointName(stats.favoritePoint)}
                    </span>
                  </div>

                  {stats.averageEffectiveness > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">{t('progress.stats.effectiveness')}</span>
                      </div>
                      <span className="text-yellow-600 font-bold">
                        {stats.averageEffectiveness.toFixed(1)}/5.0
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nenhum dado disponível para este período</p>
                </div>
              )}
            </div>


            {/* Achievements */}
            {stats && stats.totalSessions > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 text-yellow-600 mr-2" />
                  {t('progress.achievements.title')}
                </h3>
                <div className="space-y-3">
                  {stats.totalSessions >= 1 && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-lg">🌱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Primeira Sessão</div>
                        <div className="text-xs text-gray-600">Iniciou sua jornada de bem-estar</div>
                      </div>
                    </div>
                  )}

                  {stats.totalSessions >= 5 && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-lg">🎯</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Praticante Dedicado</div>
                        <div className="text-xs text-gray-600">Completou 5+ sessões</div>
                      </div>
                    </div>
                  )}

                  {stats.streakDays >= 3 && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-lg">🔥</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Sequência de {stats.streakDays} dias</div>
                        <div className="text-xs text-gray-600">Consistência impressionante!</div>
                      </div>
                    </div>
                  )}

                  {stats.totalSessions >= 10 && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-lg">🏆</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Mestre do Bem-estar</div>
                        <div className="text-xs text-gray-600">Completou 10+ sessões</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Recommendations */}
            {stats && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Brain className="w-5 h-5 text-purple-600 mr-2" />
                  {t('progress.recommendations.title')}
                </h3>
                <div className="space-y-3">
                  {stats.totalSessions === 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-sm text-gray-800">🌟 Comece Agora</div>
                      <div className="text-xs text-gray-600">Faça sua primeira sessão de respiração 4-7-8</div>
                    </div>
                  )}

                  {stats.totalSessions > 0 && stats.totalSessions < 5 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-sm text-gray-800">🎯 Continue Praticando</div>
                      <div className="text-xs text-gray-600">Tente fazer pelo menos 1 sessão por dia</div>
                    </div>
                  )}

                  {stats.sessionsByType['breathing'] > 0 && !stats.sessionsByType['acupressure'] && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-sm text-gray-800">🫴 Explore Acupressão</div>
                      <div className="text-xs text-gray-600">Experimente o ponto Yintang para potencializar os resultados</div>
                    </div>
                  )}

                  {stats.averageEffectiveness > 0 && stats.averageEffectiveness < 4.0 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-sm text-gray-800">📈 Melhore a Efetividade</div>
                      <div className="text-xs text-gray-600">Tente sessões mais longas ou combine técnicas</div>
                    </div>
                  )}

                  {stats.streakDays >= 3 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-sm text-gray-800">🔥 Excelente Consistência!</div>
                      <div className="text-xs text-gray-600">Você está no caminho certo, continue assim!</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pilar 2: Bateria Vital (Índice de Jing) e Idade Biológica */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-40 h-40 text-blue-900" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">PILAR 2 — Longevidade & Senescência</span>
              <h2 className="text-2xl font-extrabold text-gray-950 mt-1 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
                Rastreamento da Bateria Vital (Índice de Jing)
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Monitoramento integrado do seu envelhecimento celular cruzando telemetria em tempo real, sono profundo e consistência terapêutica.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              
              {/* Col 1: Liquid Jing Battery */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-lg flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent pointer-events-none"></div>
                
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 font-sans">Capacidade de Jing</h3>
                
                {/* Liquid battery visual */}
                <div className="w-20 h-36 border-4 border-slate-700 rounded-2xl relative p-1 flex items-end overflow-hidden mb-4 shadow-inner">
                  {/* Battery tip */}
                  <div className="absolute top-[-8px] left-[50%] translate-x-[-50%] w-6 h-2 bg-slate-700 rounded-t-sm"></div>
                  
                  {/* Liquid fill */}
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 via-cyan-450 to-teal-400 rounded-xl transition-all duration-1000 ease-out relative"
                    style={{ height: `${jingIndex}%` }}
                  >
                    {/* Bubbles effect */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_10%,_transparent_11%)] bg-[length:12px_12px] animate-[pulse_2s_infinite]"></div>
                  </div>
                  
                  {/* Text indicator overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white">
                      {jingIndex}%
                    </span>
                  </div>
                </div>
                
                {/* Submetrics list */}
                <div className="w-full grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                  <button
                    type="button"
                    onClick={() => onPageChange('device-sync')}
                    className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-center hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50 group"
                  >
                    <span className="block text-[11px] font-bold text-cyan-400 font-mono group-hover:scale-105 transition-transform">{wearableVfc}ms</span>
                    <span className="group-hover:text-cyan-300 transition-colors">Tónus Vago (VFC) ⚙️</span>
                  </button>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-center">
                    <span className="block text-[11px] font-bold text-indigo-400 font-mono">{wearableSleep}</span>
                    <span>Sono Profundo</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-center col-span-2">
                    <span className="block text-[11px] font-bold text-emerald-400 font-mono">{sessions?.length || 0} sessões</span>
                    <span>Consistência Terapêutica (Este Ciclo)</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Biological Age Regression */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Recuo de Envelhecimento</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
                      <span className="text-sm text-gray-600 font-medium">Idade Cronológica</span>
                      <span className="text-lg font-bold text-gray-700">{chronologicalAge} anos</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
                      <span className="text-sm text-gray-600 font-medium">Idade Biológica</span>
                      <span className="text-2xl font-black text-blue-600 font-mono">{biologicalAge} anos</span>
                    </div>

                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                      <span className="text-xs text-blue-700 font-bold">Diferencial / Rejuvenescimento</span>
                      <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-mono font-extrabold">
                        -{recoil} anos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 leading-relaxed mt-4 bg-white p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-1">💡 Diagnóstico do Oráculo:</span>
                  {jingIndex >= 70 ? (
                    <span>Sua consistência na craniopuntura e a modulação ativa da VFC estão reduzindo a senescência celular. Sua "bateria vital" (Jing) está em nível de alta regeneração, desacelerando o relógio biológico.</span>
                  ) : jingIndex >= 45 ? (
                    <span>Seu índice de Jing está moderado. Aumentar a frequência de sessões de respiração e acupressão ajudará a acionar o sistema parassimpático com mais consistência, acelerando o recuo de idade.</span>
                  ) : (
                    <span>Sua bateria de Jing está sob sobrecarga (estresse crônico ou sono inadequado). Estimule o ponto YNSA Fígado (N. Vago) e melhore a regularidade do Nutriming para iniciar o recuo biológico.</span>
                  )}
                </div>
              </div>

              {/* Col 3: SVG Progression Line Chart */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Curva de Regressão Semanal</h3>
                  <span className="text-[10px] text-gray-400 block mb-4">Idade Biológica estimada nas últimas 6 semanas</span>
                  
                  {/* SVG Chart */}
                  <div className="w-full h-36 flex items-center justify-center">
                    <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      <line x1="0" y1="10" x2="300" y2="10" stroke="rgba(0,0,0,0.05)" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0,0,0,0.05)" />
                      <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(0,0,0,0.05)" />

                      {/* Area under the line */}
                      <path 
                        d={`M 0,110 L 0,${10 + (chronologicalAge - chartPoints[0]) * 10} 
                            L 60,${10 + (chronologicalAge - chartPoints[1]) * 10} 
                            L 120,${10 + (chronologicalAge - chartPoints[2]) * 10} 
                            L 180,${10 + (chronologicalAge - chartPoints[3]) * 10} 
                            L 240,${10 + (chronologicalAge - chartPoints[4]) * 10} 
                            L 300,${10 + (chronologicalAge - chartPoints[5]) * 10} 
                            L 300,110 Z`} 
                        fill="url(#chartGrad)" 
                      />

                      {/* Line chart path */}
                      <polyline 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="2.5" 
                        points={`0,${10 + (chronologicalAge - chartPoints[0]) * 10} 
                                 60,${10 + (chronologicalAge - chartPoints[1]) * 10} 
                                 120,${10 + (chronologicalAge - chartPoints[2]) * 10} 
                                 180,${10 + (chronologicalAge - chartPoints[3]) * 10} 
                                 240,${10 + (chronologicalAge - chartPoints[4]) * 10} 
                                 300,${10 + (chronologicalAge - chartPoints[5]) * 10}`} 
                      />

                      {/* Dots and Tooltips */}
                      {chartPoints.map((val, idx) => {
                        const x = idx * 60;
                        const y = 10 + (chronologicalAge - val) * 10;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="4" fill="#2563EB" stroke="white" strokeWidth="1.5" />
                            {idx === 5 && (
                              <g>
                                <circle cx={x} cy={y} r="8" fill="none" stroke="#2563EB" strokeWidth="1" className="animate-ping" />
                                <rect x={x - 25} y={y - 25} width="40" height="16" rx="3" fill="#1E293B" />
                                <text x={x - 5} y={y - 14} fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{val}</text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-gray-400 font-mono mt-2">
                  <span>Sem 1</span>
                  <span>Sem 2</span>
                  <span>Sem 3</span>
                  <span>Sem 4</span>
                  <span>Sem 5</span>
                  <span>Atual</span>
                </div>
              </div>

            </div>
          </div>

          {/* Pilar 3: Corpo Emocional (Emotional AI Engine) */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Brain className="w-40 h-40 text-purple-900" />
            </div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest text-purple-600 font-bold">PILAR 3 — Inteligência Emocional & IA</span>
                <h2 className="text-2xl font-extrabold text-gray-950 mt-1 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500 fill-purple-200 animate-pulse" />
                  Emotional AI Engine — Análise de Padrões Subconscientes
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Mapeamento de comportamentos recorrentes nos últimos 60 dias com base no histórico de check-ins e direcionamento terapêutico integrado.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Col 1: Gráfico de Distorção Emocional */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Frequência por Elemento (60d)</h3>
                    
                    <div className="space-y-4">
                      {fiveElements.map(el => {
                        const count = activeCounts[el.id] || 0;
                        const pct = totalRecentCount > 0 ? (count / totalRecentCount) * 100 : 0;
                        return (
                          <div key={el.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="flex items-center gap-1.5 text-gray-750">
                                <span>{el.emoji}</span>
                                <span className="capitalize">{el.element}</span>
                              </span>
                              <span className="text-gray-500">{count} registro{count !== 1 ? 's' : ''} ({Math.round(pct)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%`, backgroundColor: el.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isSimulated && (
                    <div className="mt-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-[10px] text-yellow-750 font-medium">
                      ⚠️ <strong>Telemetria Simulada:</strong> Exibindo estimativa baseada no seu perfil de onboarding. Realize mais check-ins no Mapa Vivo para obter dados 100% reais.
                    </div>
                  )}
                </div>

                {/* Col 2: Insights e Padrão Detectado */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xs uppercase tracking-wider text-purple-300 font-bold mb-4 font-sans">Insights da Inteligência Emocional</h3>
                    
                    <div className="space-y-3">
                      <div className="text-xs text-slate-400">Padrão Primário Detectado:</div>
                      <div className="text-lg font-extrabold text-white flex items-center gap-2">
                        <span className="text-2xl">{dominantElement.emoji}</span>
                        <span>{emotionalEngineMetadata[dominantElementId].patternLabel}</span>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mt-2">
                        <p className="text-xs text-purple-200 italic leading-relaxed">
                          "Nos últimos 60 dias, identificamos {dominantCount} episódios associados ao elemento {dominantElement.element}. Isso sugere uma sobrecarga energética no meridiano do {dominantElement.organ}, refletindo comportamentos de {dominantElement.emotions.imbalanced.slice(0, 3).join(', ')}."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 text-[10px] text-slate-400 font-sans border-t border-slate-800/80 pt-3 mt-4">
                    💡 <strong>Frequência de Ressonância:</strong> {dominantElement.frequency} Hz • {dominantElement.sound}
                  </div>
                </div>

                {/* Col 3: Recomendações e Prescrição */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Prescrição Recomendada</h3>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-start gap-2.5 shadow-sm">
                        <span className="text-base mt-0.5">🧘</span>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-gray-400">Reforma Íntima e Conduta</div>
                          <div className="text-xs text-gray-700 leading-relaxed font-medium">
                            {emotionalEngineMetadata[dominantElementId].reformaIntima}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-start gap-2.5 shadow-sm">
                        <span className="text-base mt-0.5">🌬️</span>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-gray-400">Prática Respiratória / Meditação</div>
                          <div className="text-xs text-gray-700 leading-relaxed font-medium">
                            {emotionalEngineMetadata[dominantElementId].meditacao}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-start gap-2.5 shadow-sm">
                        <span className="text-base mt-0.5">📍</span>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-gray-400">Acupressão Corretiva</div>
                          <div className="text-xs text-gray-700 leading-relaxed font-medium">
                            {emotionalEngineMetadata[dominantElementId].acupressao}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onPageChange('acupressure')}
                      className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-sm"
                    >
                      Acessar Pontos
                    </button>
                    <button
                      onClick={() => onPageChange('sounds')}
                      className="flex-1 py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold text-center transition-colors"
                    >
                      Tocar {dominantElement.frequency}Hz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};