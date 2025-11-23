import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Target, Crown, Lock, Star, Clock, Play, Pause, RotateCcw, Info, CheckCircle, Timer, Brain, Heart, Volume2, VolumeX, ExternalLink, X, ZoomIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { acupressurePoints, getPointsByCategory, getFreePoints, getPremiumPoints } from '../data/acupressurePoints';
import { trackAcupressureSession } from './GoogleAnalytics';
import { CompactSoundPlayer } from './CompactSoundPlayer';

interface AcupressurePageProps {
  onPageChange: (page: string) => void;
}

export const AcupressurePage: React.FC<AcupressurePageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { recordSession } = useSessionHistory();

  // Helper function to get translated content
  const getTranslatedField = (point: any, field: string) => {
    const langSuffix = (!language || language === 'pt') ? '' : language.charAt(0).toUpperCase() + language.slice(1);
    const translatedField = `${field}${langSuffix}`;
    return point[translatedField] || point[field];
  };
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(4);
  const [usedPoints, setUsedPoints] = useState<string[]>([]);
  const [viewingPoint, setViewingPoint] = useState<string | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const expectedPhaseTimeRef = useRef<number>(0);
  const expectedTotalTimeRef = useRef<number>(0);
  const expectedBreathingTimeRef = useRef<number>(0);

  const categories = [
    { id: 'all', name: 'Todos os Pontos', icon: '🎯' },
    { id: 'general', name: 'MTC Geral', icon: '🫴' },
    { id: 'cranio', name: 'Craniopuntura', icon: '🧠' },
    { id: 'septicemia', name: 'Septicemia', icon: '🩸', premium: true },
    { id: 'atm', name: 'ATM', icon: '🦷', premium: true },
  ];

  const breathingPhases = {
    inhale: { duration: 4, next: 'hold' as const, color: '#1E40AF', label: 'Inspire' },
    hold: { duration: 7, next: 'exhale' as const, color: '#047857', label: 'Segure' },
    exhale: { duration: 8, next: 'inhale' as const, color: '#6B21A8', label: 'Expire' },
  };

  const filteredPoints = getPointsByCategory(selectedCategory, user?.isPremium || false);
  const selectedPointData = selectedPoint ? acupressurePoints.find(p => p.id === selectedPoint) : null;
  const viewingPointData = viewingPoint ? acupressurePoints.find(p => p.id === viewingPoint) : null;

  // Debug log para estado do modal
  useEffect(() => {
    console.log('🎭 Estado do Modal:', { showZoomModal, zoomImageUrl });
  }, [showZoomModal, zoomImageUrl]);

  // Timer principal para duração do ponto
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const startTime = Date.now();
      expectedPhaseTimeRef.current = startTime + 1000;
      
      const tick = () => {
        const now = Date.now();
        const drift = now - expectedPhaseTimeRef.current;
        
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
        
        if (timeLeft > 1) {
          expectedPhaseTimeRef.current += 1000;
          const nextDelay = Math.max(0, 1000 - drift);
          timerRef.current = setTimeout(tick, nextDelay);
        }
      };
      
      timerRef.current = setTimeout(tick, 1000);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else if (timeLeft === 0 && isTimerActive) {
      stopTimer();
    }
  }, [isTimerActive, timeLeft]);

  // Timer total da sessão
  useEffect(() => {
    if (isTimerActive) {
      const startTime = Date.now();
      expectedTotalTimeRef.current = startTime + 1000;
      
      const totalTick = () => {
        const now = Date.now();
        const drift = now - expectedTotalTimeRef.current;
        
        setTotalSessionTime(prev => prev + 1);
        
        expectedTotalTimeRef.current += 1000;
        const nextDelay = Math.max(0, 1000 - drift);
        
        if (isTimerActive) {
          totalTimeRef.current = setTimeout(totalTick, nextDelay);
        }
      };
      
      totalTimeRef.current = setTimeout(totalTick, 1000);
      
      return () => {
        if (totalTimeRef.current) {
          clearTimeout(totalTimeRef.current);
          totalTimeRef.current = null;
        }
      };
    }
  }, [isTimerActive]);

  // Timer de respiração 4-7-8 (sempre ativo quando timer principal está ativo)
  useEffect(() => {
    if (isTimerActive) {
      const startTime = Date.now();
      expectedBreathingTimeRef.current = startTime + 1000;
      
      const breathingTick = () => {
        const now = Date.now();
        const drift = now - expectedBreathingTimeRef.current;
        
        setBreathingTimeLeft(prev => {
          if (prev <= 1) {
            const currentPhase = breathingPhases[breathingPhase];
            const nextPhase = currentPhase.next;
            setBreathingPhase(nextPhase);
            setCurrentColor(breathingPhases[nextPhase].color);
            return breathingPhases[nextPhase].duration;
          }
          return prev - 1;
        });
        
        expectedBreathingTimeRef.current += 1000;
        const nextDelay = Math.max(0, 1000 - drift);
        
        if (isTimerActive) {
          breathingTimerRef.current = setTimeout(breathingTick, nextDelay);
        }
      };
      
      breathingTimerRef.current = setTimeout(breathingTick, 1000);
      
      return () => {
        if (breathingTimerRef.current) {
          clearTimeout(breathingTimerRef.current);
          breathingTimerRef.current = null;
        }
      };
    }
  }, [isTimerActive, breathingPhase, breathingTimeLeft]);

  // Função única para iniciar terapia integrada
  const startIntegratedTherapy = (pointId: string) => {
    const point = acupressurePoints.find(p => p.id === pointId);
    if (!point) return;

    if (point.isPremium && !user?.isPremium) {
      alert('Este ponto é exclusivo para usuários Premium. Faça upgrade para acessar!');
      return;
    }

    setSelectedPoint(pointId);
    setViewingPoint(pointId);
    setTimeLeft(point.duration || 120);
    setIsTimerActive(true);
    setTotalSessionTime(0);
    setBreathingPhase('inhale');
    setBreathingTimeLeft(4);
    setCurrentColor('#1E40AF');
    sessionStartTime.current = Date.now();
    
    trackAcupressureSession(pointId, point.duration || 120, true);
    
    if (!usedPoints.includes(pointId)) {
      setUsedPoints(prev => [...prev, pointId]);
    }
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (totalTimeRef.current) {
      clearTimeout(totalTimeRef.current);
      totalTimeRef.current = null;
    }
    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }
    
    if (user && sessionStartTime.current && totalSessionTime > 30) {
      recordSessionData();
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setSelectedPoint(null);
    setTimeLeft(0);
    setTotalSessionTime(0);
    setBreathingPhase('inhale');
    setBreathingTimeLeft(4);
    setCurrentColor('#1E40AF');
    sessionStartTime.current = null;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (totalTimeRef.current) {
      clearTimeout(totalTimeRef.current);
      totalTimeRef.current = null;
    }
    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }
  };

  const recordSessionData = async () => {
    if (!user || !sessionStartTime.current) return;

    try {
      await recordSession({
        sessionType: 'integrated',
        durationSeconds: totalSessionTime,
        pointsUsed: usedPoints,
        effectivenessRating: 4.0,
        sessionData: {
          integratedTherapy: true,
          chromotherapyUsed: true,
          selectedPoint: selectedPoint,
          completedCycles: Math.floor(totalSessionTime / 19)
        },
        completedAt: new Date().toISOString()
      });
      
      console.log('✅ Sessão de terapia integrada registrada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar sessão de terapia integrada:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate pulse scale for breathing circle
  const getPulseScale = () => {
    const phaseProgress = (breathingPhases[breathingPhase].duration - breathingTimeLeft) / breathingPhases[breathingPhase].duration;
    if (breathingPhase === 'inhale') {
      return 60 + (30 * phaseProgress); // Expand from 60 to 90
    } else if (breathingPhase === 'hold') {
      return 90; // Stay at maximum
    } else {
      return 90 - (30 * phaseProgress); // Contract from 90 to 60
    }
  };

  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  const breathingProgress = ((breathingPhases[breathingPhase].duration - breathingTimeLeft) / breathingPhases[breathingPhase].duration) * circumference;

  const ImageZoomModal: React.FC<{
    isVisible: boolean;
    imageUrl: string | null;
    onClose: () => void;
  }> = ({ isVisible, imageUrl, onClose }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    console.log('🔍 ImageZoomModal render:', { isVisible, imageUrl, imageLoaded });

    // Reset imageLoaded when modal opens with new image
    useEffect(() => {
      if (isVisible) {
        console.log('✅ Modal está visível, resetando imageLoaded');
        setImageLoaded(false);
      }
    }, [isVisible, imageUrl]);

    // Handle keyboard events
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isVisible) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isVisible, onClose]);

    if (!isVisible || !imageUrl) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white text-sm">Carregando imagem...</span>
              </div>
            </div>
          )}

          <img
            src={imageUrl}
            alt="Ponto de acupressão ampliado"
            className={`max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 cursor-pointer ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={onClose}
            onLoad={() => {
              console.log('Imagem carregada com sucesso!');
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', imageUrl);
              e.currentTarget.style.display = 'none';
              setImageLoaded(true);
            }}
          />

          <button
            onClick={onClose}
            className="absolute -top-14 right-0 bg-red-500 hover:bg-red-600 text-white transition-colors p-3 rounded-full shadow-lg hover:scale-110 transform duration-200"
            aria-label="Fechar"
            title="Fechar (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-3 rounded-full">
            <div className="flex items-center gap-3 text-white text-sm">
              <span className="opacity-90">💡 Clique na imagem ou pressione ESC para fechar</span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div 
      className="min-h-screen transition-all duration-1000 ease-in-out pt-16 relative"
      style={{ 
        background: isTimerActive
          ? `radial-gradient(circle at center, ${currentColor}40, ${currentColor}20, ${currentColor}10, white)`
          : 'linear-gradient(135deg, #f0f9ff, #e0f2fe, white)'
      }}
    >
      {/* Compact Sound Player - Fixed Position */}
      <CompactSoundPlayer 
        currentColor={currentColor}
        onNavigateToLibrary={() => onPageChange('sounds')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Only show when not in active therapy */}
        {!isTimerActive && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('acupressure.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('acupressure.subtitle')}
            </p>
          </div>
        )}

        {/* Category Filter - Only show when not in active therapy */}
        {!isTimerActive && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={category.premium && !user?.isPremium}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : category.premium && !user?.isPremium
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{t(`acupressure.categories.${category.id}`)}</span>
                  {category.premium && !user?.isPremium && (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE THERAPY VIEW - Optimized Layout with Maximum Color Harmony */}
        {isTimerActive && selectedPointData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* LEFT COLUMN: Breathing Circle & Timers - CORES DINÂMICAS */}
            <div 
              className="rounded-3xl shadow-2xl p-6 border-2 transition-all duration-1000"
              style={{ 
                borderColor: currentColor + '60',
                background: `linear-gradient(135deg, ${currentColor}25, ${currentColor}15, ${currentColor}08, white)`
              }}
            >
              {/* Compact Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Terapia Integrada Ativa</h2>
                <div 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ 
                    backgroundColor: currentColor + '30',
                    color: currentColor,
                    borderColor: currentColor + '50'
                  }}
                >
                  <div className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: currentColor }}></div>
                  {getTranslatedField(selectedPointData, 'name')}
                </div>
              </div>

              {/* Breathing Circle - Smaller for mobile */}
              <div className="relative mb-6">
                <svg className="w-64 h-64 mx-auto transform -rotate-90" viewBox="0 0 240 240">
                  {/* Background circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r={circleRadius}
                    stroke="#E5E7EB"
                    strokeWidth="6"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r={circleRadius}
                    stroke={currentColor}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - breathingProgress}
                    className="transition-all duration-1000 ease-in-out"
                  />
                  {/* Inner breathing circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r={getPulseScale() * 0.8}
                    fill={currentColor}
                    fillOpacity="0.3"
                    className="transition-all duration-500 ease-in-out"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div 
                    className="text-5xl font-bold mb-2 transition-colors duration-500"
                    style={{ color: currentColor }}
                  >
                    {breathingTimeLeft}
                  </div>
                  <div 
                    className="text-xl font-semibold uppercase tracking-wider transition-colors duration-500"
                    style={{ color: currentColor }}
                  >
                    {breathingPhases[breathingPhase].label}
                  </div>
                </div>
              </div>

              {/* Breathing Phase Indicators - CORES HARMONIOSAS */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div 
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${
                    breathingPhase === 'inhale' 
                      ? 'text-white shadow-xl transform scale-110' 
                      : 'border-2'
                  }`}
                  style={breathingPhase === 'inhale' ? {
                    backgroundColor: '#1E40AF',
                    borderColor: '#1E40AF'
                  } : {
                    backgroundColor: '#1E40AF80',
                    borderColor: '#1E40AF',
                    color: '#1E3A8A'
                  }}
                >
                  <div className="text-xl font-bold mb-1">4s</div>
                  <div className="text-sm">Inspire</div>
                  <div className="text-xs mt-1 font-bold">Azul Intenso</div>
                </div>
                <div 
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${
                    breathingPhase === 'hold' 
                      ? 'text-white shadow-xl transform scale-110' 
                      : 'border-2'
                  }`}
                  style={breathingPhase === 'hold' ? {
                    backgroundColor: '#047857',
                    borderColor: '#047857'
                  } : {
                    backgroundColor: '#04785780',
                    borderColor: '#047857',
                    color: '#065F46'
                  }}
                >
                  <div className="text-xl font-bold mb-1">7s</div>
                  <div className="text-sm">Segure</div>
                  <div className="text-xs mt-1 font-bold">Verde Intenso</div>
                </div>
                <div 
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${
                    breathingPhase === 'exhale' 
                      ? 'text-white shadow-xl transform scale-110' 
                      : 'border-2'
                  }`}
                  style={breathingPhase === 'exhale' ? {
                    backgroundColor: '#6B21A8',
                    borderColor: '#6B21A8'
                  } : {
                    backgroundColor: '#6B21A880',
                    borderColor: '#6B21A8',
                    color: '#581C87'
                  }}
                >
                  <div className="text-xl font-bold mb-1">8s</div>
                  <div className="text-sm">Expire</div>
                  <div className="text-xs mt-1 font-bold">Roxo Intenso</div>
                </div>
              </div>

              {/* Timer Info - CORES DINÂMICAS */}
              <div className="text-center mb-6">
                <div 
                  className="text-4xl font-bold mb-2 transition-colors duration-500"
                  style={{ color: currentColor }}
                >
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600 mb-1">Tempo do Ponto</div>
                <div className="text-sm text-gray-500">Total: {formatTime(totalSessionTime)}</div>
              </div>

              {/* Controls - CORES HARMONIOSAS */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={stopTimer}
                  className="flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg"
                >
                  <Pause className="w-5 h-5" />
                  <span>Parar</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition-all shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reiniciar</span>
                </button>
                <button
                  onClick={() => onPageChange('sounds')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
                  style={{ 
                    backgroundColor: currentColor,
                    color: 'white'
                  }}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Biblioteca</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Point Details - CORES HARMONIOSAS */}
            <div 
              className="rounded-3xl shadow-2xl p-6 border-2 transition-all duration-1000"
              style={{ 
                borderColor: currentColor + '40',
                background: `linear-gradient(135deg, ${currentColor}15, ${currentColor}08, ${currentColor}05, white)`
              }}
            >
              {/* Point Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTranslatedField(selectedPointData, 'name')}</h2>
                {selectedPointData.isPremium && (
                  <div className="inline-flex items-center space-x-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Crown className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                )}
              </div>

              {/* Point Image */}
              {selectedPointData.image && (
                <div className="mb-6">
                  <div
                    className="image-zoom-wrapper w-full rounded-xl cursor-pointer relative"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ Clique na imagem detectado!', selectedPointData.image);
                      console.log('📊 Estado antes:', { showZoomModal, zoomImageUrl });
                      setShowZoomModal(true);
                      setZoomImageUrl(selectedPointData.image);
                      console.log('📊 Chamando setShowZoomModal(true) e setZoomImageUrl');
                    }}
                  >
                    <img
                      src={selectedPointData.image}
                      alt={selectedPointData.imageAlt || getTranslatedField(selectedPointData, 'name')}
                      className="w-full h-56 object-contain bg-gray-50 rounded-xl shadow-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="image-zoom-overlay rounded-xl">
                      <div className="flex flex-col items-center gap-2">
                        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg image-zoom-icon" />
                        <span className="text-white text-sm font-medium drop-shadow-lg image-zoom-text">Clique para ampliar</span>
                      </div>
                    </div>
                    {/* Overlay com informações do ponto */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-lg pointer-events-none">
                      <div className="text-xs font-medium">
                        📍 {getTranslatedField(selectedPointData, 'name')} • ⏱️ {Math.floor((selectedPointData.duration || 120) / 60)}min
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Point Benefits - PRIMEIRO */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Para que serve:</h3>
                <div className="space-y-2 mb-4">
                  {getTranslatedField(selectedPointData, 'benefits').slice(0, 4).map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: currentColor }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Point Description - SEGUNDO */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Localização & Como aplicar:</h4>
                <div 
                  className="rounded-lg p-3 border"
                  style={{ 
                    backgroundColor: currentColor + '15',
                    borderColor: currentColor + '40'
                  }}
                >
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {getTranslatedField(selectedPointData, 'description')}
                  </p>
                </div>
              </div>

              {/* Active Session Status - CORES HARMONIOSAS */}
              <div 
                className="text-center p-4 rounded-xl border-2"
                style={{ 
                  backgroundColor: currentColor + '20',
                  borderColor: currentColor + '50'
                }}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentColor }}></div>
                  <span 
                    className="font-semibold"
                    style={{ color: currentColor }}
                  >
                    Terapia em Andamento
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Respiração 4-7-8 + Acupressão + Cromoterapia
                </div>
                
                {/* Botão para voltar aos pontos */}
                <button
                  onClick={() => {
                    // Reset completo do estado para evitar página em branco
                    setViewingPoint(null);
                    setSelectedPoint(null);
                    setIsTimerActive(false);
                    setTimeLeft(0);
                    setTotalSessionTime(0);
                    setBreathingPhase('inhale');
                    setBreathingTimeLeft(4);
                    setCurrentColor('#1E40AF');
                    sessionStartTime.current = null;
                    
                    // Limpar todos os timers
                    if (timerRef.current) {
                      clearTimeout(timerRef.current);
                      timerRef.current = null;
                    }
                    if (totalTimeRef.current) {
                      clearTimeout(totalTimeRef.current);
                      totalTimeRef.current = null;
                    }
                    if (breathingTimerRef.current) {
                      clearTimeout(breathingTimerRef.current);
                      breathingTimerRef.current = null;
                    }
                  }}
                  className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all border-2"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: currentColor + '40',
                    color: currentColor
                  }}
                >
                  <Target className="w-4 h-4" />
                  <span>Ver Outros Pontos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT VIEW: Points List + Details Panel */}
        {!isTimerActive && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            {/* COLUNA ESQUERDA: Lista de Pontos */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pontos Terapêuticos</h2>
            
              {/* Points Grid */}
              <div className="space-y-4">
                {filteredPoints.map((point) => (
                  <div
                    key={point.id}
                    onClick={() => {
                      if (!isTimerActive) {
                        setViewingPoint(point.id);
                      } else {
                        setViewingPoint(point.id);
                      }
                    }}
                    className={`bg-white rounded-xl shadow-lg transition-all duration-300 border-2 cursor-pointer p-4 ${
                      selectedPoint === point.id
                        ? 'border-green-500 shadow-xl bg-green-50'
                      : viewingPoint === point.id
                        ? 'border-blue-500 shadow-xl bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                    } ${
                      point.isPremium && !user?.isPremium
                        ? 'opacity-60'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Point Image */}
                      {point.image && (
                        <div className="relative flex-shrink-0">
                          <div
                            className="image-zoom-wrapper w-20 h-20 rounded-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowZoomModal(true);
                              setZoomImageUrl(point.image);
                            }}
                          >
                            <img
                              src={point.image}
                              alt={point.imageAlt || point.name}
                              className="w-20 h-20 object-contain bg-gray-50 rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="image-zoom-overlay rounded-lg">
                              <div className="flex flex-col items-center gap-1">
                                <ZoomIn className="w-5 h-5 text-white drop-shadow-lg image-zoom-icon" />
                                <span className="text-white text-xs font-medium drop-shadow-lg image-zoom-text">Ampliar</span>
                              </div>
                            </div>
                          </div>
                          {point.isPremium && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="bg-yellow-500 text-white p-1 rounded-full">
                                <Crown className="w-3 h-3" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Point Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{getTranslatedField(point, 'name')}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{Math.floor((point.duration || 120) / 60)}:00</span>
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {point.pressure || 'Leve'}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {getTranslatedField(point, 'benefits')[0]} • {getTranslatedField(point, 'benefits')[1]}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              point.category === 'general' ? 'bg-blue-100 text-blue-800' :
                              point.category === 'cranio' ? 'bg-purple-100 text-purple-800' :
                              point.category === 'septicemia' ? 'bg-red-100 text-red-800' :
                              point.category === 'atm' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {point.category === 'general' ? 'MTC Geral' : 
                               point.category === 'cranio' ? 'Cranio' :
                               point.category === 'septicemia' ? 'Septicemia' :
                               point.category === 'atm' ? 'ATM' : point.category}
                            </div>
                            {point.isPremium && (
                              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                <Crown className="w-3 h-3" />
                                <span>Premium</span>
                              </div>
                            )}
                          </div>
                        
                          <div className="text-green-600 text-sm font-medium">
                            Ver detalhes →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pontos Gratuitos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pontos Premium</span>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: Painel de Detalhes */}
            <div className="lg:col-span-1">
              {viewingPoint && viewingPointData ? (
                <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-24">
                  {/* Botão Voltar - Topo do painel */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setViewingPoint(null)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      <Target className="w-4 h-4" />
                      <span>← Voltar aos pontos</span>
                    </button>
                    {viewingPointData.isPremium && (
                      <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        <Crown className="w-3 h-3" />
                        <span>Premium</span>
                      </div>
                    )}
                  </div>

                  {/* Header do Ponto */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{getTranslatedField(viewingPointData, 'name')}</h2>
                  </div>

                  {/* Botão de Ação - ACIMA DA IMAGEM */}
                  {viewingPointData.isPremium && !user?.isPremium ? (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center space-x-2 text-yellow-600 bg-yellow-50 py-3 rounded-xl border border-yellow-200">
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">Ponto Premium</span>
                      </div>
                      <button
                        onClick={() => onPageChange('premium')}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl text-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
                      >
                        🔓 Desbloquear Premium
                      </button>
                    </div>
                  ) : !isTimerActive ? (
                    <button
                      onClick={() => startIntegratedTherapy(viewingPoint)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all shadow-lg flex items-center justify-center space-x-2 mb-6"
                    >
                      <Play className="w-5 h-5" />
                      <span>🧘 {t('acupressure.timer.start')}</span>
                    </button>
                  ) : selectedPoint === viewingPoint ? (
                    <div className="text-center mb-6">
                      <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                        <div className="flex items-center justify-center space-x-2 text-green-700">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold">{t('acupressure.timer.active')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startIntegratedTherapy(viewingPoint)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg mb-6"
                    >
                      {t('acupressure.timer.switch')}
                    </button>
                  )}

                  {/* Imagem do Ponto */}
                  {viewingPointData.image && (
                    <div className="mb-6">
                      <div
                        className="image-zoom-wrapper w-full rounded-xl cursor-pointer relative"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Clique na imagem do viewing point!', viewingPointData.image);
                          setShowZoomModal(true);
                          setZoomImageUrl(viewingPointData.image);
                        }}
                      >
                        <img
                          src={viewingPointData.image}
                          alt={viewingPointData.imageAlt || getTranslatedField(viewingPointData, 'name')}
                          className="w-full h-56 object-contain bg-gray-50 rounded-xl shadow-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="image-zoom-overlay rounded-xl">
                          <div className="flex flex-col items-center gap-2">
                            <ZoomIn className="w-8 h-8 text-white drop-shadow-lg image-zoom-icon" />
                            <span className="text-white text-sm font-medium drop-shadow-lg image-zoom-text">Clique para ampliar</span>
                          </div>
                        </div>
                        {/* Overlay com nome do ponto */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-lg pointer-events-none">
                          <div className="text-xs font-medium text-center">
                            📍 {getTranslatedField(viewingPointData, 'name')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Para que serve - PRIMEIRO */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Para que serve:</h3>
                    <div className="space-y-2 mb-4">
                      {getTranslatedField(viewingPointData, 'benefits').slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-700 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Localização & Como aplicar - SEGUNDO */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Localização & Como aplicar:</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {getTranslatedField(viewingPointData, 'description')}
                      </p>
                    </div>
                  </div>

                  {/* Instruções */}
                  {viewingPointData.instructions && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Instruções específicas:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {viewingPointData.instructions}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center sticky top-24">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Target className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    {t('acupressure.select.title')}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {t('acupressure.select.subtitle')}
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold mb-2">💡 Como usar:</div>
                      <div className="space-y-1 text-xs text-left">
                        <div>1. Clique em um ponto para ver detalhes</div>
                        <div>2. Leia as instruções e benefícios</div>
                        <div>3. Clique "Iniciar Terapia" para começar</div>
                        <div>4. Siga a respiração 4-7-8 + cromoterapia</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold mb-2">🧘 {t('acupressure.title')}:</div>
                      <div className="space-y-1 text-xs">
                        <div>• Acupressão + Respiração 4-7-8</div>
                        <div>• Cromoterapia sincronizada</div>
                        <div>• Sons harmonizantes</div>
                        <div>• Timer inteligente</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium CTA - Only show when not in active therapy */}
        {!user?.isPremium && !isTimerActive && (
          <div className="mt-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">🔒 Pontos Premium</h2>
            <p className="text-xl mb-6 opacity-90">
              Desbloqueie {getPremiumPoints().length} pontos especializados com terapia integrada avançada
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🩸</div>
                <div className="font-semibold">Septicemia</div>
                <div className="text-sm opacity-80">3 pontos</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🦷</div>
                <div className="font-semibold">ATM</div>
                <div className="text-sm opacity-80">3 pontos</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-semibold">Cranio Premium</div>
                <div className="text-sm opacity-80">3 pontos</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Terapia Integrada</div>
                <div className="text-sm opacity-80">Sempre Ativa</div>
              </div>
            </div>
            <button 
              onClick={() => onPageChange('premium')}
              className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🔓 Desbloquear Pontos Premium
            </button>
          </div>
        )}

        <ImageZoomModal
          isVisible={showZoomModal}
          imageUrl={zoomImageUrl}
          onClose={() => {
            console.log('🚪 Fechando modal');
            setShowZoomModal(false);
            setZoomImageUrl(null);
          }}
        />
      </div>
    </div>
  );
};