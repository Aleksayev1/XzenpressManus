import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Clock, Target, Brain, Heart, Zap, Calendar, Award, Download, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { acupressurePoints } from '../data/acupressurePoints';

interface DashboardPageProps {
  onPageChange: (page: string) => void;
}



export const DashboardPage: React.FC<DashboardPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { sessions, stats, loading, error } = useSessionHistory('week');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Verificar se usuário é Premium
  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <BarChart3 className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              O Dashboard com analytics avançados e insights personalizados é um recurso exclusivo para usuários Premium
            </p>
            
            {/* Premium Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Analytics Avançados</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Histórico completo de sessões</li>
                  <li>• Gráficos de progresso temporal</li>
                  <li>• Métricas de efetividade</li>
                  <li>• Tendências de melhoria</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Conquistas & Metas</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Sistema de conquistas gamificado</li>
                  <li>• Metas personalizadas</li>
                  <li>• Sequências de dias consecutivos</li>
                  <li>• Índice de bem-estar personalizado</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Insights Inteligentes</h3>
                </div>
                <ul className="text-sm text-purple-700 space-y-1 text-left">
                  <li>• Recomendações baseadas em IA</li>
                  <li>• Análise de padrões comportamentais</li>
                  <li>• Sugestões de horários otimizados</li>
                  <li>• Pontos mais eficazes para você</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Download className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Relatórios Exportáveis</h3>
                </div>
                <ul className="text-sm text-orange-700 space-y-1 text-left">
                  <li>• Exportação de dados em PDF</li>
                  <li>• Relatórios para profissionais</li>
                  <li>• Gráficos detalhados</li>
                  <li>• Histórico completo</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-8 border border-yellow-300">
              <h3 className="font-semibold text-yellow-800 mb-2">🎯 Por que Premium?</h3>
              <p className="text-yellow-700 text-sm">
                O Dashboard Premium oferece insights profundos sobre sua jornada de bem-estar, 
                permitindo otimizar suas práticas e acompanhar resultados de forma científica.
              </p>
            </div>
            
            <button
              onClick={() => onPageChange('premium')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🔓 Desbloquear Dashboard Premium
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Acesso imediato • Sem compromisso • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTypeIcon = (sessionType: string) => {
    const type = sessionType;
    switch (type) {
      case 'breathing': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'acupressure': return <Target className="w-4 h-4 text-green-500" />;
      case 'integrated': return <Zap className="w-4 h-4 text-purple-500" />;
      case 'chromotherapy': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeName = (sessionType: string) => {
    const type = sessionType;
    switch (type) {
      case 'breathing': return 'Respiração 4-7-8';
      case 'acupressure': return 'Acupressão';
      case 'integrated': return 'Terapia Integrada';
      case 'chromotherapy': return 'Cromoterapia';
      default: return type;
    }
  };

  const getFavoritePointName = (pointId: string): string => {
    if (pointId === 'Nenhum') return 'Nenhum';
    const point = acupressurePoints.find(p => p.id === pointId);
    return point ? point.name : pointId;
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Faça login para acessar seu dashboard</p>
          <button
            onClick={() => onPageChange('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Bem-estar</h1>
              <p className="text-gray-600 mt-2">Acompanhe seu progresso e insights personalizados</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="year">Último Ano</option>
              </select>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.totalSessions}</span>
              </div>
              <h3 className="font-semibold text-gray-800">Sessões Realizadas</h3>
              <p className="text-sm text-gray-600">
                {selectedPeriod === 'week' ? 'Esta semana' : 
                 selectedPeriod === 'month' ? 'Este mês' : 'Este ano'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{formatDuration(stats.totalTime)}</span>
              </div>
              <h3 className="font-semibold text-gray-800">Tempo Total</h3>
              <p className="text-sm text-gray-600">Dedicado ao bem-estar</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.averageEffectiveness > 0 ? stats.averageEffectiveness.toFixed(1) : '0.0'}/5
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">Efetividade</h3>
              <p className="text-sm text-gray-600">Avaliação média</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-orange-600">{stats.streakDays}</span>
              </div>
              <h3 className="font-semibold text-gray-800">Sequência</h3>
              <p className="text-sm text-gray-600">Dias consecutivos</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Carregando dados...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Erro ao carregar dados: {error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Sessões Recentes</h2>
                <div className="text-sm text-gray-600">
                  {sessions.length} sessões registradas
                </div>
              </div>
              
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 10).map((session, index) => (
                    <div key={session.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getTypeIcon(session.sessionType)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{getTypeName(session.sessionType)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(session.completedAt || session.createdAt || '').toLocaleDateString('pt-BR')} • 
                          {formatDuration(session.durationSeconds)}
                        </div>
                        {session.pointsUsed && (
                          <div className="text-xs text-blue-600 mt-1">
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
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor(session.effectivenessRating) ? 'bg-yellow-400' : 'bg-gray-200'
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
                  <h3 className="font-semibold text-gray-600 mb-2">Nenhuma sessão registrada</h3>
                  <p className="text-gray-500 text-sm">
                    Complete uma sessão de respiração ou acupressão para ver seu histórico aqui
                  </p>
                  <button
                    onClick={() => onPageChange('breathing')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Começar Primeira Sessão
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Weekly Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Progresso {selectedPeriod === 'week' ? 'Semanal' : selectedPeriod === 'month' ? 'Mensal' : 'Anual'}
              </h3>
              {stats ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Sessões Realizadas</span>
                      <span className="font-semibold">{stats.totalSessions}/10 meta</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (stats.totalSessions / 10) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tempo de Prática</span>
                      <span className="font-semibold">{Math.floor(stats.totalTime / 60)}/30 min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (stats.totalTime / 1800) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {stats.averageEffectiveness > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Efetividade Média</span>
                        <span className="font-semibold">{stats.averageEffectiveness.toFixed(1)}/5.0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all" 
                          style={{ width: `${(stats.averageEffectiveness / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {stats && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                Insights Personalizados
              </h3>
              <div className="space-y-3">
                {stats.totalSessions === 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">🌟 Primeira Sessão</div>
                    <div className="text-xs text-gray-600">Comece com respiração 4-7-8 por 5 minutos</div>
                  </div>
                )}
                
                {stats.totalSessions > 0 && stats.totalSessions < 5 && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">🎯 Continue Praticando</div>
                    <div className="text-xs text-gray-600">Tente fazer pelo menos 1 sessão por dia</div>
                  </div>
                )}
                
                {stats.favoritePoint !== 'Nenhum' && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">⭐ Ponto Favorito</div>
                    <div className="text-xs text-gray-600">{getFavoritePointName(stats.favoritePoint)}</div>
                  </div>
                )}
                
                {stats.improvementTrend > 0 && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">📈 Melhoria Detectada</div>
                    <div className="text-xs text-gray-600">+{stats.improvementTrend.toFixed(1)}% vs período anterior</div>
                  </div>
                )}
                
                {stats.streakDays >= 3 && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">🔥 Sequência Impressionante</div>
                    <div className="text-xs text-gray-600">{stats.streakDays} dias consecutivos!</div>
                  </div>
                )}
              </div>
              </div>
            )}

            {/* Achievement */}
            {stats && stats.totalSessions > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 text-yellow-600 mr-2" />
                Conquistas
              </h3>
              <div className="space-y-3">
                {stats.totalSessions >= 1 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">🌱</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">Primeira Sessão</div>
                      <div className="text-xs text-gray-600">Iniciou sua jornada!</div>
                    </div>
                  </div>
                )}
                
                {stats.streakDays >= 3 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600">🔥</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">Sequência de {stats.streakDays} dias</div>
                      <div className="text-xs text-gray-600">Continue assim!</div>
                    </div>
                  </div>
                )}
                
                {stats.totalSessions >= 5 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">🧘</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">Praticante Dedicado</div>
                      <div className="text-xs text-gray-600">{stats.totalSessions} sessões completas</div>
                    </div>
                  </div>
                )}
                
                {stats.totalSessions >= 10 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">🏆</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">Mestre do Bem-estar</div>
                      <div className="text-xs text-gray-600">10+ sessões realizadas</div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        {stats && stats.dailyActivity.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Atividade Semanal</h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {stats.dailyActivity.slice(-7).map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{dayName}</div>
                    <div className={`h-20 rounded-lg flex items-end justify-center ${
                      day.sessions > 0 ? 'bg-gradient-to-t from-blue-500 to-blue-300' : 'bg-gray-100'
                    }`}>
                      {day.sessions > 0 && (
                        <div className="text-white text-xs font-semibold mb-2">
                          {day.sessions}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          <div className="text-center text-sm text-gray-600">
              Sessões por dia • Meta: 1-2 sessões diárias
          </div>
          </div>
        )}

        {/* Wellness Score */}
        {stats && stats.totalSessions > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Índice de Bem-estar XZenPress</h2>
            
            {/* Calculate wellness score based on real data */}
            {(() => {
              const consistencyScore = Math.min(100, (stats.streakDays / 7) * 100);
              const effectivenessScore = stats.averageEffectiveness > 0 ? (stats.averageEffectiveness / 5) * 100 : 0;
              const activityScore = Math.min(100, (stats.totalSessions / 10) * 100);
              const overallScore = Math.round((consistencyScore + effectivenessScore + activityScore) / 3);
              
              return (
                <>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={314}
                    strokeDashoffset={314 - (314 * (overallScore / 100))}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{overallScore}</div>
                    <div className="text-xs text-gray-600">
                      {overallScore >= 80 ? 'Excelente' :
                       overallScore >= 60 ? 'Bom' :
                       overallScore >= 40 ? 'Regular' : 'Iniciante'}
                    </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
                {overallScore >= 80 ? 'Seu índice de bem-estar está excelente! Continue com a prática regular.' :
                 overallScore >= 60 ? 'Bom progresso! Tente aumentar a consistência das sessões.' :
                 overallScore >= 40 ? 'Você está no caminho certo. Continue praticando regularmente.' :
                 'Comece devagar e seja consistente. Cada sessão conta para seu bem-estar!'}
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Baseado em {stats.totalSessions} sessões reais</span>
              </div>
            </div>
                </>
              );
            })()}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};