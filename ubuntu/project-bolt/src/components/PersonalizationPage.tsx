import React, { useState, useEffect } from 'react';
import { User, Target, Clock, Brain, Heart, Zap, Save, RefreshCw, Palette, Volume2, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PersonalizationPageProps {
  onPageChange: (page: string) => void;
}

interface UserPreferences {
  stressLevel: 'low' | 'medium' | 'high';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  mainConcerns: string[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  sessionDuration: number;
  reminderFrequency: 'none' | 'daily' | 'twice' | 'custom';
  preferredColors: string[];
  soundPreferences: string[];
  breathingPace: 'slow' | 'normal' | 'fast';
}

export const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();

  // Verificar se usuário é Premium
  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Personalização Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Configure sua experiência personalizada com recomendações baseadas em IA e preferências avançadas
            </p>
            
            {/* Premium Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">IA Personalizada</h3>
                </div>
                <ul className="text-sm text-purple-700 space-y-1 text-left">
                  <li>• Recomendações baseadas no seu perfil</li>
                  <li>• Análise de padrões comportamentais</li>
                  <li>• Sugestões de horários otimizados</li>
                  <li>• Pontos mais eficazes para você</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Palette className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Cromoterapia Avançada</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Sequências de cores personalizadas</li>
                  <li>• Perfis terapêuticos adaptativos</li>
                  <li>• Sincronização com biofeedback</li>
                  <li>• Cores baseadas no seu estado</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Volume2 className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Sons Personalizados</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Biblioteca completa de 50+ sons</li>
                  <li>• Integração com Spotify Premium</li>
                  <li>• Frequências binaurais terapêuticas</li>
                  <li>• Playlists adaptativas</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Bell className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Lembretes Inteligentes</h3>
                </div>
                <ul className="text-sm text-orange-700 space-y-1 text-left">
                  <li>• Notificações personalizadas</li>
                  <li>• Horários otimizados para você</li>
                  <li>• Lembretes baseados em humor</li>
                  <li>• Integração com calendário</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-8 border border-purple-300">
              <h3 className="font-semibold text-purple-800 mb-2">🧠 Personalização Baseada em IA</h3>
              <p className="text-purple-700 text-sm">
                Nossa IA analisa seus padrões de uso, preferências e efetividade para criar 
                uma experiência única e otimizada especificamente para o seu perfil de bem-estar.
              </p>
            </div>
            
            <button
              onClick={() => onPageChange('premium')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🔓 Desbloquear Personalização Premium
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Experiência única • IA personalizada • Recursos avançados
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [preferences, setPreferences] = useState<UserPreferences>({
    stressLevel: 'medium',
    sleepQuality: 'fair',
    mainConcerns: [],
    preferredTime: 'evening',
    experienceLevel: 'beginner',
    goals: [],
    sessionDuration: 300,
    reminderFrequency: 'daily',
    preferredColors: ['#3B82F6'],
    soundPreferences: [],
    breathingPace: 'normal'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const concernsOptions = [
    'Estresse e Ansiedade',
    'Qualidade do Sono',
    'Foco e Concentração',
    'Dores de Cabeça',
    'Tensão Muscular',
    'Fadiga Crônica',
    'Irritabilidade',
    'Depressão Leve',
    'Pressão Alta',
    'Digestão'
  ];

  const goalsOptions = [
    'Reduzir Estresse Diário',
    'Melhorar Qualidade do Sono',
    'Aumentar Foco no Trabalho',
    'Controlar Ansiedade',
    'Aliviar Dores Crônicas',
    'Aumentar Energia',
    'Equilibrar Emoções',
    'Desenvolver Mindfulness',
    'Melhorar Relacionamentos',
    'Aumentar Produtividade'
  ];

  const colorOptions = [
    { color: '#3B82F6', name: 'Azul Calmante', effect: 'Reduz ansiedade' },
    { color: '#10B981', name: 'Verde Equilibrante', effect: 'Harmoniza emoções' },
    { color: '#8B5CF6', name: 'Roxo Energizante', effect: 'Estimula criatividade' },
    { color: '#F59E0B', name: 'Amarelo Revitalizante', effect: 'Aumenta energia' },
    { color: '#EF4444', name: 'Vermelho Ativador', effect: 'Estimula ação' },
    { color: '#06B6D4', name: 'Ciano Purificador', effect: 'Limpa energias' }
  ];

  const soundOptions = [
    'Ondas do Oceano',
    'Chuva Suave',
    'Floresta',
    'Lareira',
    'Sinos Tibetanos',
    'Mantras',
    'Frequências Binaurais',
    'Música Clássica'
  ];

  const handleConcernToggle = (concern: string) => {
    setPreferences(prev => ({
      ...prev,
      mainConcerns: prev.mainConcerns.includes(concern)
        ? prev.mainConcerns.filter(c => c !== concern)
        : [...prev.mainConcerns, concern]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleColorToggle = (color: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredColors: prev.preferredColors.includes(color)
        ? prev.preferredColors.filter(c => c !== color)
        : [...prev.preferredColors, color]
    }));
  };

  const handleSoundToggle = (sound: string) => {
    setPreferences(prev => ({
      ...prev,
      soundPreferences: prev.soundPreferences.includes(sound)
        ? prev.soundPreferences.filter(s => s !== sound)
        : [...prev.soundPreferences, sound]
    }));
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Salvar no localStorage para demonstração
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPreferences = () => {
    setPreferences({
      stressLevel: 'medium',
      sleepQuality: 'fair',
      mainConcerns: [],
      preferredTime: 'evening',
      experienceLevel: 'beginner',
      goals: [],
      sessionDuration: 300,
      reminderFrequency: 'daily',
      preferredColors: ['#3B82F6'],
      soundPreferences: [],
      breathingPace: 'normal'
    });
  };

  useEffect(() => {
    // Carregar preferências salvas
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Faça login para personalizar sua experiência</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalização</h1>
          <p className="text-gray-600">Configure sua experiência para máxima efetividade</p>
        </div>

        <div className="space-y-8">
          {/* Basic Profile */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Perfil de Bem-estar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de Estresse Atual
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Baixo', color: 'green' },
                    { value: 'medium', label: 'Moderado', color: 'yellow' },
                    { value: 'high', label: 'Alto', color: 'red' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="stressLevel"
                        value={option.value}
                        checked={preferences.stressLevel === option.value}
                        onChange={(e) => setPreferences(prev => ({ ...prev, stressLevel: e.target.value as any }))}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Qualidade do Sono
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'poor', label: 'Ruim' },
                    { value: 'fair', label: 'Regular' },
                    { value: 'good', label: 'Boa' },
                    { value: 'excellent', label: 'Excelente' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sleepQuality"
                        value={option.value}
                        checked={preferences.sleepQuality === option.value}
                        onChange={(e) => setPreferences(prev => ({ ...prev, sleepQuality: e.target.value as any }))}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Concerns */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Principais Preocupações</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {concernsOptions.map((concern) => (
                <button
                  key={concern}
                  onClick={() => handleConcernToggle(concern)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    preferences.mainConcerns.includes(concern)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Objetivos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalsOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                    preferences.goals.includes(goal)
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Session Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Preferências de Sessão</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Horário Preferido
                </label>
                <select
                  value={preferences.preferredTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, preferredTime: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="morning">Manhã (6h-12h)</option>
                  <option value="afternoon">Tarde (12h-18h)</option>
                  <option value="evening">Noite (18h-22h)</option>
                  <option value="night">Madrugada (22h-6h)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duração da Sessão
                </label>
                <select
                  value={preferences.sessionDuration}
                  onChange={(e) => setPreferences(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={180}>3 minutos (Iniciante)</option>
                  <option value={300}>5 minutos (Padrão)</option>
                  <option value={600}>10 minutos (Intermediário)</option>
                  <option value={900}>15 minutos (Avançado)</option>
                  <option value={1200}>20 minutos (Expert)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de Experiência
                </label>
                <select
                  value={preferences.experienceLevel}
                  onChange={(e) => setPreferences(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ritmo de Respiração
                </label>
                <select
                  value={preferences.breathingPace}
                  onChange={(e) => setPreferences(prev => ({ ...prev, breathingPace: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="slow">Lento (5-8-10)</option>
                  <option value="normal">Normal (4-7-8)</option>
                  <option value="fast">Rápido (3-6-7)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Color Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Palette className="w-6 h-6 text-purple-600 mr-2" />
              Cores Terapêuticas Preferidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => handleColorToggle(colorOption.color)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    preferences.preferredColors.includes(colorOption.color)
                      ? 'border-gray-800 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3 shadow-md"
                    style={{ backgroundColor: colorOption.color }}
                  />
                  <div className="font-semibold text-gray-800 text-sm">{colorOption.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{colorOption.effect}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Volume2 className="w-6 h-6 text-blue-600 mr-2" />
              Sons Preferidos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {soundOptions.map((sound) => (
                <button
                  key={sound}
                  onClick={() => handleSoundToggle(sound)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    preferences.soundPreferences.includes(sound)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sound}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Bell className="w-6 h-6 text-orange-600 mr-2" />
              Lembretes e Notificações
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Frequência de Lembretes
              </label>
              <div className="space-y-2">
                {[
                  { value: 'none', label: 'Sem lembretes' },
                  { value: 'daily', label: 'Uma vez por dia' },
                  { value: 'twice', label: 'Duas vezes por dia' },
                  { value: 'custom', label: 'Personalizado' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reminderFrequency"
                      value={option.value}
                      checked={preferences.reminderFrequency === option.value}
                      onChange={(e) => setPreferences(prev => ({ ...prev, reminderFrequency: e.target.value as any }))}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              Recomendações Baseadas no seu Perfil
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🎯 Pontos Recomendados</h3>
                <div className="text-sm text-gray-600">
                  {preferences.mainConcerns.includes('Estresse e Ansiedade') && (
                    <div>• Yintang (EX-HN3) - Reduz ansiedade</div>
                  )}
                  {preferences.mainConcerns.includes('Qualidade do Sono') && (
                    <div>• Anmian - Melhora o sono</div>
                  )}
                  {preferences.mainConcerns.includes('Dores de Cabeça') && (
                    <div>• Taiyang (EX-HN5) - Alivia enxaquecas</div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">⏰ Rotina Sugerida</h3>
                <div className="text-sm text-gray-600">
                  <div>• {preferences.preferredTime === 'morning' ? 'Manhã' : preferences.preferredTime === 'evening' ? 'Noite' : 'Tarde'}: Respiração 4-7-8</div>
                  <div>• Duração: {Math.floor(preferences.sessionDuration / 60)} minutos</div>
                  <div>• Frequência: {preferences.reminderFrequency === 'daily' ? 'Diária' : 'Personalizada'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetPreferences}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Resetar</span>
              </button>
              
              <button
                onClick={savePreferences}
                disabled={isSaving}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Salvar Preferências</span>
                  </>
                )}
              </button>
            </div>

            {saveStatus === 'success' && (
              <div className="mt-4 text-center text-green-600 font-medium">
                ✅ Preferências salvas com sucesso!
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="mt-4 text-center text-red-600 font-medium">
                ❌ Erro ao salvar. Tente novamente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};