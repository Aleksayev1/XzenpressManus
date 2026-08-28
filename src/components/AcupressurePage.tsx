import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Target, Crown, Lock, Clock, Play, Pause, RotateCcw, Volume2, X, ZoomIn, ArrowLeft, Loader2, Home, Activity, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { acupressureService } from '../services/acupressureService';
import { trackAcupressureSession } from './GoogleAnalytics';
import { CompactSoundPlayer } from './CompactSoundPlayer';
import { AcupressurePoint } from '../types';

interface AcupressurePageProps {
  onPageChange: (page: string) => void;
}

export const AcupressurePage: React.FC<AcupressurePageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { recordSession } = useSessionHistory();

  // State for data fetching
  const [points, setPoints] = useState<AcupressurePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromMapaVivo, setFromMapaVivo] = useState(false);

  useEffect(() => {
    setFromMapaVivo(localStorage.getItem('phyto_from_mapa_vivo') === 'true');
  }, []);

  // Fetch points on mount
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const data = await acupressureService.getAllPoints();
        setPoints(data);

        // Dynamic link pre-selection from Mapa Vivo or other pages
        const preselected = localStorage.getItem('preselected_acupressure_point');
        if (preselected) {
          const cleanPre = preselected.toLowerCase().trim();
          const found = data.find(p => 
            p.id.toLowerCase() === cleanPre || 
            p.name.toLowerCase().includes(cleanPre) ||
            p.id.toLowerCase().includes(cleanPre)
          );
          if (found) {
            setSelectedPoint(found.id);
            setViewingPoint(found.id);
            // Auto switch category if valid, or default to 'all' to ensure visibility
            const validCategories = ['general', 'cranio', 'septicemia', 'immunity', 'avc', 'neuro', 'cardio', 'atm', 'zoster'];
            if (found.category && validCategories.includes(found.category)) {
              setSelectedCategory(found.category);
            } else {
              setSelectedCategory('all');
            }
          }
          localStorage.removeItem('preselected_acupressure_point');
        }
      } catch (err) {
        console.error('Failed to fetch points:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const getPointsByCategory = (category: string) => {
    if (category === 'all') return points;

    // Filter points by category (include ynsa points when cranio is selected)
    const filtered = points.filter(p =>
      p.category === category ||
      p.additionalCategories?.includes(category) ||
      (category === 'cranio' && (p.category === 'ynsa' || p.additionalCategories?.includes('ynsa')))
    );

    // Remove duplicates using Map (ensures unique IDs)
    const uniquePoints = Array.from(
      new Map(filtered.map(p => [p.id, p])).values()
    );

    return uniquePoints;
  };

  // Helper function to get translated content
  const getTranslatedField = (point: any, field: string) => {
    const langCode = currentLanguage.code;
    const langSuffix = (!langCode || langCode === 'pt') ? '' : langCode.charAt(0).toUpperCase() + langCode.slice(1);
    const translatedField = `${field}${langSuffix}`;
    return point[translatedField] || point[field];
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
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
    { id: 'immunity', name: 'Imunidade', icon: '🛡️', premium: true },
    { id: 'avc', name: 'AVC (Stroke)', icon: '🏥', premium: true },
    { id: 'neuro', name: 'Neurologia', icon: '⚡', premium: true },
    { id: 'cardio', name: 'Cardio', icon: '❤️', premium: true },
    { id: 'atm', name: 'ATM', icon: '🦷', premium: true },
    { id: 'zoster', name: 'Zoster (Herpes)', icon: '🔥', premium: true },
  ];

  const cranioSubcategories = [
    { id: 'all', name: 'Todos os Grupos', icon: '🧠', color: 'bg-gray-100 text-gray-800 border-gray-300', description: 'Todos os pontos e grupos de craniopuntura de Yamamoto (YNSA).' },
    { id: 'basic', name: 'Básicos (A-K)', icon: '🔵', color: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Tratamento de dores físicas gerais, aparelho locomotor, cervical, torcicolo, lombalgia, problemas articulares.' },
    { id: 'ypsilon', name: 'Ypsilon Bilaterais', icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', description: 'Tratamento de desequilíbrios nos órgãos internos (Zang Fu) na região temporal. Palpar bilateralmente e tratar o lado de maior sensibilidade dolorosa.' },
    { id: 'sensory', name: 'Sensoriais/Cerebrais', icon: '🟢', color: 'bg-green-100 text-green-800 border-green-300', description: 'Distúrbios de órgãos dos sentidos (olhos, nariz, boca, ouvido), bem como pontos de gânglios basais e cerebrais para regulação emocional profunda.' },
    { id: 'cranial-nerve', name: 'Nervos Cranianos', icon: '🔴', color: 'bg-red-100 text-red-800 border-red-300', description: 'Tratamento neurológico premium e avançado (I-XII), indicado para sequelas pós-AVC, paralisia fácil, neuralgia do trigêmeo e modulação central orgânica.' }
  ];

  const breathingPhases = {
    inhale: { duration: 4, next: 'hold' as const, color: '#1E40AF', label: 'Inspire' },
    hold: { duration: 7, next: 'exhale' as const, color: '#047857', label: 'Segure' },
    exhale: { duration: 8, next: 'inhale' as const, color: '#6B21A8', label: 'Expire' },
  };

  const getSubcategoryBadge = (sub: string) => {
    switch (sub) {
      case 'basic':
        return { name: 'YNSA Básico', styles: 'bg-blue-50 text-blue-800 border border-blue-200' };
      case 'ypsilon':
        return { name: 'YNSA Ypsilon', styles: 'bg-yellow-50 text-yellow-800 border border-yellow-200' };
      case 'sensory':
        return { name: 'YNSA Sensorial', styles: 'bg-green-50 text-green-800 border border-green-200' };
      case 'cranial-nerve':
        return { name: 'YNSA Nervo Craniano', styles: 'bg-red-50 text-red-800 border border-red-200' };
      case 'zs':
        return { name: 'YNSA ZS', styles: 'bg-purple-50 text-purple-800 border border-purple-200' };
      case 'brain':
        return { name: 'YNSA Cerebral', styles: 'bg-indigo-50 text-indigo-800 border border-indigo-200' };
      case 'organ':
        return { name: 'YNSA Órgão', styles: 'bg-pink-50 text-pink-800 border border-pink-200' };
      default:
        return { name: sub, styles: 'bg-gray-50 text-gray-800 border border-gray-200' };
    }
  };

  const getFilteredPoints = () => {
    let pts = getPointsByCategory(selectedCategory);
    if (selectedCategory === 'cranio' && selectedSubcategory !== 'all') {
      pts = pts.filter(p => p.subcategory === selectedSubcategory);
    }
    return pts;
  };

  const selectedPointData = selectedPoint ? points.find(p => p.id === selectedPoint) : null;
  const viewingPointData = viewingPoint ? points.find(p => p.id === viewingPoint) : null;

  // Debug log para estado do modal
  useEffect(() => {
    console.log('🎭 Estado do Modal:', { showZoomModal, zoomImageUrl });
  }, [showZoomModal, zoomImageUrl]);

  // Scroll to details when point is selected
  useEffect(() => {
    if (viewingPoint && !isTimerActive) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        const detailsElement = document.getElementById('point-details-panel');
        if (detailsElement) {
          detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  }, [viewingPoint, isTimerActive]);

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
      import('../lib/audio').then(({ playTibetanBell }) => playTibetanBell());
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
    const point = points.find(p => p.id === pointId);
    if (!point) return;

    if (point.isPremium && !user?.isPremium) {
      onPageChange('premium');
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
            className={`max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 cursor-pointer ${imageLoaded ? 'opacity-100' : 'opacity-0'
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

  const [searchQuery, setSearchQuery] = useState('');

  const zusanliPoint = points.find(p => p.id === 'st36' || p.name.toLowerCase().includes('zusanli') || p.id === 'zs');

  const cleanText = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const STOP_WORDS = new Set([
    // PT
    'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'para', 'com', 'e', 'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'que', 'se', 'me', 'meu', 'minha', 'ponto', 'pontos',
    // EN
    'the', 'in', 'of', 'to', 'for', 'and', 'or', 'a', 'an', 'on', 'at', 'with', 'by', 'from', 'is', 'point', 'points',
    // ES
    'del', 'la', 'el', 'los', 'las', 'en', 'para', 'por', 'con', 'y', 'un', 'una', 'punto', 'puntos',
    // FR
    'du', 'des', 'le', 'les', 'pour', 'avec', 'et', 'dans', 'sur',
    // IT
    'di', 'della', 'il', 'per', 'nel', 'nella',
    // DE
    'der', 'die', 'das', 'den', 'dem', 'des', 'fur', 'mit', 'und', 'im', 'in', 'ein', 'eine', 'punkt', 'punkte'
  ]);

  const GENERIC_WORDS = new Set([
    // PT
    'dor', 'dores', 'alivio', 'trata', 'tratar', 'cura', 'bom', 'melhor', 'ajuda', 'forte',
    // EN
    'pain', 'pains', 'relief', 'relieve', 'treat', 'treatment', 'cure', 'good', 'help', 'ache', 'aches',
    // ES
    'dolor', 'dolores', 'alivio', 'trata', 'tratar', 'cura', 'ayuda',
    // FR
    'douleur', 'douleurs', 'mal', 'soulagement', 'traiter', 'aide',
    // IT
    'dolore', 'dolori', 'sollievo', 'cura', 'aiuto',
    // DE
    'schmerz', 'schmerzen', 'linderung', 'behandlung', 'hilfe'
  ]);

  const CROSS_LANGUAGE_SYNONYMS: Record<string, string[]> = {
    // Back / Costas / Espalda / Dos / Schiena / Rücken / Lombar
    costa: ['costas', 'lombar', 'lombares', 'lombalgia', 'coluna', 'ciatico', 'espinha', 'vertebra', 'escapula', 'back', 'lower back', 'spine', 'spinal', 'lumbar', 'espalda', 'dos', 'lombaire', 'schiena', 'rucken', 'ruckenschmerzen'],
    costas: ['costa', 'lombar', 'lombares', 'lombalgia', 'coluna', 'ciatico', 'back', 'lower back', 'spine', 'lumbar', 'espalda', 'dos', 'schiena', 'rucken', 'ruckenschmerzen'],
    back: ['costas', 'costa', 'lombar', 'lumbar', 'lower back', 'spine', 'spinal', 'espalda', 'dos', 'schiena', 'rucken', 'ruckenschmerzen', 'sciatica', 'ciatico'],
    espalda: ['costas', 'lombar', 'lumbar', 'back', 'lower back', 'columna', 'dos', 'schiena', 'rucken', 'ciatica', 'ciatico'],
    dos: ['costas', 'lombar', 'back', 'espalda', 'schiena', 'rucken', 'lombaire'],
    schiena: ['costas', 'lombar', 'back', 'espalda', 'dos', 'rucken', 'lombare'],
    rucken: ['costas', 'lombar', 'back', 'espalda', 'dos', 'schiena', 'lumbar'],
    ruckenschmerzen: ['rucken', 'costas', 'back', 'espalda', 'lombar', 'lumbar'],
    lombar: ['lombares', 'lombalgia', 'costas', 'lumbar', 'lower back', 'lombaire', 'lombare', 'coluna'],
    lumbar: ['lombar', 'lombalgia', 'costas', 'back', 'lower back', 'lombaire'],

    // Head / Cabeça / Cabeza / Tête / Testa / Kopf
    cabeca: ['enxaqueca', 'cefaleia', 'temporal', 'frontal', 'nuca', 'cranio', 'head', 'headache', 'migraine', 'cabeza', 'cefalea', 'jaqueca', 'tete', 'testa', 'kopf', 'kopfschmerzen'],
    head: ['headache', 'migraine', 'cabeca', 'enxaqueca', 'cabeza', 'tete', 'testa', 'kopf', 'temple', 'forehead'],
    headache: ['head', 'migraine', 'cabeca', 'enxaqueca', 'cefaleia', 'cabeza', 'jaqueca', 'tete', 'testa', 'kopf', 'kopfschmerzen'],
    cabeza: ['jaqueca', 'enxaqueca', 'cabeca', 'head', 'headache', 'migraine', 'cefalea'],
    tete: ['cabeca', 'head', 'headache', 'migraine', 'cabeza'],
    testa: ['cabeca', 'head', 'headache', 'migraine', 'cabeza'],
    kopf: ['cabeca', 'head', 'headache', 'migraine', 'kopfschmerzen'],
    kopfschmerzen: ['kopf', 'cabeca', 'head', 'headache', 'migraine', 'enxaqueca', 'cabeza'],
    migraine: ['enxaqueca', 'cabeca', 'headache', 'jaqueca', 'cefalea'],
    enxaqueca: ['migraine', 'cabeca', 'headache', 'jaqueca', 'cefaleia'],

    // Stomach / Estômago / Estómago / Estomac / Stomaco / Magen
    estomago: ['digestao', 'azia', 'refluxo', 'nausea', 'gastrite', 'abdomen', 'stomach', 'digestion', 'heartburn', 'acid reflux', 'estomago', 'estomac', 'stomaco', 'magen', 'verdauung'],
    stomach: ['estomago', 'digestao', 'digestion', 'nausea', 'gastric', 'belly', 'abdomen', 'bellyache', 'estomac', 'magen', 'gastrite'],
    digestion: ['digestao', 'estomago', 'stomach', 'digestive', 'verdauung', 'digestione'],
    digestao: ['estomago', 'stomach', 'digestion', 'verdauung', 'digestione'],
    estomac: ['estomago', 'stomach', 'digestion', 'magen'],
    magen: ['estomago', 'stomach', 'digestion', 'verdauung'],
    magenschmerzen: ['magen', 'stomach', 'estomago', 'digestion'],

    // Sleep / Insomnia / Sono / Insônia / Sueño / Sommeil / Sonno / Schlaf
    sono: ['insonia', 'dormir', 'sleep', 'insomnia', 'sueno', 'insomnio', 'sommeil', 'insomnie', 'sonno', 'insonnia', 'schlaf', 'schlafstorung'],
    insonia: ['sono', 'dormir', 'sleep', 'insomnia', 'sueno', 'insomnio', 'sommeil', 'insomnie', 'sonno', 'insonnia', 'schlaf'],
    sleep: ['insomnia', 'sono', 'insonia', 'sueno', 'insomnio', 'sommeil', 'schlaf', 'sleeplessness', 'rest'],
    insomnia: ['sleep', 'sono', 'insonia', 'sueno', 'insomnio', 'sommeil', 'schlaf', 'anmian'],
    insomnio: ['sueno', 'sleep', 'insomnia', 'sono', 'insonia'],
    sueno: ['insomnio', 'sleep', 'insomnia', 'sono'],
    schlaf: ['insomnia', 'sono', 'sleep', 'schlafstorung'],
    schlafstorung: ['schlaf', 'insomnia', 'sono', 'insonia', 'sueno', 'insomnio'],

    // Stress / Anxiety / Ansiedade / Estresse / Estrés / Ansiedad / Angst
    ansiedade: ['estresse', 'stress', 'anxiety', 'calm', 'panic', 'nervousness', 'ansiedad', 'estres', 'angst', 'anxiete', 'ansia'],
    estresse: ['stress', 'ansiedade', 'anxiety', 'burnout', 'tension', 'estres', 'ansiedad', 'angst'],
    anxiety: ['stress', 'ansiedade', 'estresse', 'calm', 'relax', 'panic', 'ansiedad', 'angst', 'anxiete'],
    stress: ['anxiety', 'ansiedade', 'estresse', 'tension', 'estres', 'angst'],
    ansiedad: ['estres', 'ansiedade', 'anxiety', 'stress', 'angst'],

    // Neck / Pescoço / Cervical / Cuello / Cou / Collo / Nacken
    pescoco: ['cervical', 'torcicolo', 'nuca', 'trapezio', 'neck', 'stiff neck', 'cuello', 'cou', 'collo', 'nacken'],
    neck: ['cervical', 'stiff neck', 'pescoco', 'cuello', 'cou', 'collo', 'nacken', 'trapezius', 'throat'],
    cuello: ['cervical', 'pescoco', 'neck', 'torticolis', 'cou', 'collo', 'nacken'],
    cervical: ['pescoco', 'neck', 'cuello', 'cou', 'collo', 'nacken', 'torcicolo'],

    // Immunity / Imunidade / Inmunidad / Immunité / Immunität / Flu / Gripe
    imunidade: ['gripe', 'resfriado', 'tosse', 'febre', 'immunity', 'immune', 'cold', 'flu', 'cough', 'inmunidad', 'immunite', 'immunitat', 'immunità'],
    immunity: ['immune', 'imunidade', 'cold', 'flu', 'cough', 'inmunidad', 'immunite', 'defense', 'lung'],
    gripe: ['flu', 'cold', 'resfriado', 'tosse', 'febre', 'grippe', 'grippal', 'imunidade', 'immunity'],
    flu: ['gripe', 'cold', 'resfriado', 'cough', 'fever', 'immunity', 'grippe']
  };

  const getSmartFilteredPoints = () => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) {
      return getFilteredPoints();
    }

    const cleaned = cleanText(rawQuery);
    const rawTokens = cleaned.split(' ').filter(t => t.length > 0);
    const significantTokens = rawTokens.filter(t => !STOP_WORDS.has(t));
    const tokens = significantTokens.length > 0 ? significantTokens : rawTokens;

    const specificTokens = tokens.filter(t => !GENERIC_WORDS.has(t));
    const hasSpecificTokens = specificTokens.length > 0;

    const tokenGroups = tokens.map(token => {
      const isSpecific = !GENERIC_WORDS.has(token);
      const expansions = new Set<string>([token]);
      if (CROSS_LANGUAGE_SYNONYMS[token]) {
        CROSS_LANGUAGE_SYNONYMS[token].forEach(s => expansions.add(cleanText(s)));
      }
      if (token.endsWith('s') && token.length > 3) {
        const singular = token.slice(0, -1);
        expansions.add(singular);
        if (CROSS_LANGUAGE_SYNONYMS[singular]) CROSS_LANGUAGE_SYNONYMS[singular].forEach(s => expansions.add(cleanText(s)));
      }
      if (token.endsWith('es') && token.length > 4) {
        const singular = token.slice(0, -2);
        expansions.add(singular);
        if (CROSS_LANGUAGE_SYNONYMS[singular]) CROSS_LANGUAGE_SYNONYMS[singular].forEach(s => expansions.add(cleanText(s)));
      }
      return { token, isSpecific, list: Array.from(expansions) };
    });

    const scoredPoints: { point: AcupressurePoint; score: number }[] = [];

    for (const point of points) {
      const idClean = cleanText(point.id);
      const names = [
        point.name, point.nameEn, point.nameEs, (point as any).nameFr, (point as any).nameDe,
        (point as any).nameIt, (point as any).nameZh, (point as any).nameJa, (point as any).nameRu
      ].filter(Boolean).map(cleanText).join(' ');

      const descs = [
        point.description, point.descriptionEn, point.descriptionEs, (point as any).descriptionFr, (point as any).descriptionDe
      ].filter(Boolean).map(cleanText).join(' ');

      const benefits = [
        ...(point.benefits || []),
        ...(point.benefitsEn || []),
        ...((point as any).benefitsEs || []),
        ...((point as any).benefitsFr || []),
        ...((point as any).benefitsDe || [])
      ].map(cleanText).join(' ');

      const instructions = cleanText(point.instructions || '');
      const categories = cleanText(point.category || '') + ' ' + (point.additionalCategories || []).map(cleanText).join(' ');
      const subcats = cleanText(point.subcategory || '') + ' ' + cleanText(point.groupLabel || '');

      const fullPointText = `${names} ${idClean} ${benefits} ${descs} ${instructions} ${categories} ${subcats}`;

      let totalScore = 0;
      let matchedSpecificGroups = 0;
      let matchedAnyGroup = 0;

      for (const group of tokenGroups) {
        let groupMatched = false;
        let groupMaxScore = 0;

        for (const t of group.list) {
          let tokenScore = 0;

          if (idClean === t || idClean.split('-').includes(t) || idClean.split('_').includes(t)) tokenScore += 100;
          else if (idClean.includes(t)) tokenScore += 60;

          if (names.includes(t)) tokenScore += 50;
          if (benefits.includes(t)) tokenScore += 45;
          if (categories.includes(t) || subcats.includes(t)) tokenScore += 30;
          if (descs.includes(t)) tokenScore += 25;
          if (instructions.includes(t)) tokenScore += 15;

          if (tokenScore > groupMaxScore) {
            groupMaxScore = tokenScore;
            groupMatched = true;
          }
        }

        if (groupMatched) {
          matchedAnyGroup++;
          if (group.isSpecific) matchedSpecificGroups++;
          totalScore += groupMaxScore;
        }
      }

      if (hasSpecificTokens && matchedSpecificGroups === 0) {
        continue;
      }

      if (matchedAnyGroup > 0) {
        if (fullPointText.includes(cleaned)) {
          totalScore += 80;
        }
        if (matchedAnyGroup === tokenGroups.length) {
          totalScore += 100;
        }
        scoredPoints.push({ point, score: totalScore });
      }
    }

    scoredPoints.sort((a, b) => b.score - a.score);
    return scoredPoints.map(sp => sp.point);
  };

  const filteredPoints = getSmartFilteredPoints();

  const getSearchPlaceholder = () => {
    const lang = currentLanguage?.code || 'pt';
    switch (lang) {
      case 'en': return 'Search symptoms or points (e.g. back pain, headache, anxiety, ST36, ZS)...';
      case 'es': return 'Buscar síntomas o puntos (ej: dolor de espalda, cabeza, ansiedad, E36, ZS)...';
      case 'fr': return 'Rechercher des symptômes ou points (ex: mal de dos, tête, anxiété, E36, ZS)...';
      case 'it': return 'Cerca sintomi o punti (es: mal di schiena, mal di testa, ansia, E36, ZS)...';
      case 'de': return 'Symptome oder Punkte suchen (z.B. Rückenschmerzen, Kopfschmerzen, Angst, ST36)...';
      default: return 'Pesquisar sintomas ou pontos (ex: dor nas costas, cabeça, ansiedade, E36, ZS)...';
    }
  };

  const getLocalizedChips = () => {
    const lang = currentLanguage?.code || 'pt';
    switch (lang) {
      case 'en':
        return [
          { label: '⚡ Back Pain', term: 'back pain' },
          { label: '💆 Headache', term: 'headache' },
          { label: '🧘 Anxiety & Stress', term: 'anxiety' },
          { label: '🌙 Insomnia & Sleep', term: 'insomnia' },
          { label: '🍵 Stomach & Digestion', term: 'stomach' },
          { label: '🛡️ Immunity', term: 'immunity' },
          { label: '🦴 Neck / Cervical', term: 'neck' },
          { label: '🫴 Zusanli (ST36)', term: 'st36' },
          { label: '💎 Hegu (LI4)', term: 'li4' }
        ];
      case 'es':
        return [
          { label: '⚡ Dolor de Espalda', term: 'dolor de espalda' },
          { label: '💆 Dolor de Cabeza', term: 'dolor de cabeza' },
          { label: '🧘 Ansiedad y Estrés', term: 'ansiedad' },
          { label: '🌙 Insomnio y Sueño', term: 'insomnio' },
          { label: '🍵 Digestión y Estómago', term: 'estomago' },
          { label: '🛡️ Inmunidad', term: 'inmunidad' },
          { label: '🦴 Cervical / Cuello', term: 'cuello' },
          { label: '🫴 Zusanli (E36)', term: 'zusanli' },
          { label: '💎 Hegu (IG4)', term: 'hegu' }
        ];
      case 'fr':
        return [
          { label: '⚡ Mal de Dos', term: 'mal de dos' },
          { label: '💆 Mal de Tête', term: 'mal de tete' },
          { label: '🧘 Anxiété & Stress', term: 'anxiete' },
          { label: '🌙 Insomnie & Sommeil', term: 'insomnie' },
          { label: '🍵 Digestion & Estomac', term: 'estomac' },
          { label: '🛡️ Immunité', term: 'immunite' },
          { label: '🦴 Cervicale / Cou', term: 'cou' },
          { label: '🫴 Zusanli (E36)', term: 'zusanli' },
          { label: '💎 Hegu (GI4)', term: 'hegu' }
        ];
      case 'it':
        return [
          { label: '⚡ Mal di Schiena', term: 'mal di schiena' },
          { label: '💆 Mal di Testa', term: 'mal di testa' },
          { label: '🧘 Ansia & Stress', term: 'ansia' },
          { label: '🌙 Insonnia & Sonno', term: 'insonnia' },
          { label: '🍵 Digestione & Stomaco', term: 'stomaco' },
          { label: '🛡️ Immunità', term: 'immunita' },
          { label: '🦴 Cervicale / Collo', term: 'collo' },
          { label: '🫴 Zusanli (E36)', term: 'zusanli' },
          { label: '💎 Hegu (IG4)', term: 'hegu' }
        ];
      case 'de':
        return [
          { label: '⚡ Rückenschmerzen', term: 'ruckenschmerzen' },
          { label: '💆 Kopfschmerzen', term: 'kopfschmerzen' },
          { label: '🧘 Angst & Stress', term: 'angst' },
          { label: '🌙 Schlafstörung', term: 'schlafstorung' },
          { label: '🍵 Magen & Verdauung', term: 'magen' },
          { label: '🛡️ Immunität', term: 'immunitat' },
          { label: '🦴 Nacken', term: 'nacken' },
          { label: '🫴 Zusanli (Ma36)', term: 'zusanli' },
          { label: '💎 Hegu (Di4)', term: 'hegu' }
        ];
      default:
        return [
          { label: '⚡ Dor nas Costas', term: 'dor nas costas' },
          { label: '💆 Dor de Cabeça', term: 'dor de cabeca' },
          { label: '🧘 Ansiedade & Estresse', term: 'ansiedade' },
          { label: '🌙 Insônia & Sono', term: 'insonia' },
          { label: '🍵 Digestão & Estômago', term: 'estomago' },
          { label: '🛡️ Imunidade', term: 'imunidade' },
          { label: '🦴 Cervical / Torcicolo', term: 'cervical' },
          { label: '🫴 Zusanli (E36)', term: 'zusanli' },
          { label: '💎 Hegu (IG4)', term: 'hegu' }
        ];
    }
  };

  return (
    <div
      className="min-h-screen transition-all duration-1000 ease-in-out pt-24 relative"
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
        {/* Header Back Button */}
        {!isTimerActive && (
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                if (fromMapaVivo) {
                  localStorage.removeItem('phyto_from_mapa_vivo');
                  onPageChange('mapa-vivo');
                } else {
                  onPageChange('home');
                }
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{fromMapaVivo ? 'Voltar ao Mapa Vivo' : 'Início'}</span>
            </button>
          </div>
        )}

        {/* Header - Only show when not in active therapy */}
        {!isTimerActive && (
          <div className="relative mb-8 text-center pt-8 md:pt-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full ring-4 ring-blue-50 shadow-xl">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('acupressure.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('acupressure.subtitle')}
            </p>
          </div>
        )}

        {/* Search & Categories - Only show when not in active therapy */}
        {!isTimerActive && (
          <div className="max-w-4xl mx-auto space-y-4 mb-8">
            {/* Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="relative flex items-center bg-white border border-blue-100 rounded-2xl shadow-lg overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all"
            >
              <div className="pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <input 
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-3 pr-4 py-4 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400 text-sm md:text-base"
              />
              {/* Clear button if searchQuery is not empty */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-1"
                  title="Limpar busca"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {/* Search Action Button */}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-gray-500 font-medium mr-1 flex items-center gap-1">
                💡 {currentLanguage?.code === 'en' ? 'Suggestions:' : currentLanguage?.code === 'es' ? 'Sugerencias:' : currentLanguage?.code === 'fr' ? 'Suggestions :' : currentLanguage?.code === 'it' ? 'Suggerimenti:' : currentLanguage?.code === 'de' ? 'Vorschläge:' : 'Sugestões:'}
              </span>
              {getLocalizedChips().map((chip) => (
                <button
                  key={chip.term}
                  type="button"
                  onClick={() => setSearchQuery(chip.term)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    searchQuery.toLowerCase().includes(chip.term.toLowerCase())
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/80 hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Active Search Result Feedback */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between text-xs text-blue-900 bg-blue-50/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span>
                    Exibindo <strong>{filteredPoints.length}</strong> {filteredPoints.length === 1 ? 'ponto terapêutico' : 'pontos terapêuticos'} para "<strong>{searchQuery}</strong>" em todo o acervo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="font-bold text-blue-700 hover:text-blue-900 underline ml-3 flex-shrink-0"
                >
                  Limpar busca
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => { 
                      setSelectedCategory(category.id); 
                      setSearchQuery(''); 
                    }}
                    disabled={category.premium && !user?.isPremium}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === category.id && !searchQuery.trim()
                      ? 'bg-blue-600 text-white shadow-lg'
                      : category.premium && !user?.isPremium
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
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

            {/* Subcategory Filter for Yamamoto Craniopuntura */}
            {selectedCategory === 'cranio' && !searchQuery.trim() && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-purple-50 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wider">Subgrupos YNSA (Yamamoto)</h3>
                    <p className="text-xs text-gray-500">Selecione uma categoria clínica da Craniopuntura de Yamamoto</p>
                  </div>
                  <div className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full uppercase tracking-wider self-start md:self-center">
                    Diagnóstico Clínico
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {cranioSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedSubcategory === sub.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-[1.02]'
                          : 'bg-white text-gray-700 hover:bg-purple-50 border-purple-100'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
                {/* Banner explicativo do subgrupo selecionado */}
                {(() => {
                  const activeSub = cranioSubcategories.find(s => s.id === selectedSubcategory) || cranioSubcategories[0];
                  return (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-3.5 rounded-r-xl">
                      <div className="flex gap-2">
                        <span className="text-lg">{activeSub.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">{activeSub.name}</h4>
                          <p className="text-xs text-purple-800 mt-1 leading-relaxed">{activeSub.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ZS Highlight (if not searching) */}
            {!searchQuery.trim() && selectedCategory === 'all' && zusanliPoint && (
              <div 
                onClick={() => setViewingPoint(zusanliPoint.id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer transform hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">🧘</div>
                   <div>
                      <h3 className="text-xl font-bold">Destaque: Ponto Zusanli (ZS)</h3>
                      <p className="text-blue-100 italic">"O ponto das cem doenças" - Fundamental para longevidade e imunidade.</p>
                   </div>
                </div>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors">
                   Acessar Agora
                </button>
              </div>
            )}
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
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${breathingPhase === 'inhale'
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
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${breathingPhase === 'hold'
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
                  className={`p-4 rounded-xl transition-all duration-500 border-2 ${breathingPhase === 'exhale'
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
                      if (selectedPointData.isPremium && !user?.isPremium) {
                        alert('🔒 Esta imagem é exclusiva para usuários Premium. Faça upgrade para visualizar!');
                        onPageChange('premium');
                        return;
                      }
                      console.log('🖱️ Clique na imagem detectado!', selectedPointData.image);
                      console.log('📊 Estado antes:', { showZoomModal, zoomImageUrl });
                      setShowZoomModal(true);
                      setZoomImageUrl(selectedPointData.image || null);
                      console.log('📊 Chamando setShowZoomModal(true) e setZoomImageUrl');
                    }}
                  >
                    <img
                      src={selectedPointData.image}
                      alt={selectedPointData.imageAlt || getTranslatedField(selectedPointData, 'name')}
                      className="w-full h-56 object-contain bg-gray-900 rounded-xl shadow-lg border border-gray-800"
                      style={selectedPointData.isPremium && !user?.isPremium ? { filter: 'blur(12px)' } : {}}
                      onError={(e) => {
                        e.currentTarget.src = '/mtc_exhn3_yintang.jpg';
                      }}
                    />
                    {selectedPointData.isPremium && !user?.isPremium ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                        <div className="flex flex-col items-center gap-3">
                          <Lock className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                          <span className="text-white text-lg font-bold drop-shadow-lg">🔒 Conteúdo Premium</span>
                          <span className="text-white text-sm drop-shadow-lg">Faça upgrade para visualizar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="image-zoom-overlay rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                          <ZoomIn className="w-8 h-8 text-white drop-shadow-lg image-zoom-icon" />
                          <span className="text-white text-sm font-medium drop-shadow-lg image-zoom-text">Clique para ampliar</span>
                        </div>
                      </div>
                    )}
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
                  {getTranslatedField(selectedPointData, 'benefits').slice(0, 4).map((benefit: string, index: number) => (
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

                {/* Dica de Especialista - Continuous Movement */}
                <div className="mt-4 bg-blue-50 bg-opacity-70 rounded-lg p-3 border border-blue-200">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-lg">💡</span>
                    </div>
                    <div className="text-sm text-blue-900">
                      <strong>Dica de Especialista:</strong> Ao aplicar o ponto, não mantenha o dedo parado. Faça <strong>movimentos circulares contínuos</strong> no local.
                      <br />
                      <span className="text-xs text-blue-800 opacity-80 mt-1 block">
                        <em>Nota: É normal sentir um leve incômodo ou "dorzinha boa". Isso é seu corpo confirmando o desequilíbrio energético sendo tratado.</em>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Potencialização Neuroacústica (NOVO CARD) */}
                <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer" onClick={() => onPageChange('sounds')}>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900 text-sm uppercase tracking-wide mb-1 flex items-center">
                        Potencialize em 3x <span className="ml-2 text-[10px] bg-purple-200 text-purple-800 px-2 rounded-full">Ciência</span>
                      </h4>
                      <p className="text-xs text-purple-800 leading-relaxed mb-2">
                        <strong>Ressonância Piezoelétrica:</strong> Ouvir frequências binaurais por 2 min <em>antes</em> de tocar o ponto coloca seu cérebro em estado Alpha e reduz a resistência elétrica da pele.
                      </p>
                      <span className="text-xs font-bold text-purple-700 group-hover:underline flex items-center">
                        Escolher Frequência Sonora <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                      </span>
                    </div>
                  </div>
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
                {filteredPoints.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-md space-y-4">
                    <div className="text-4xl">🔍</div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Nenhum ponto encontrado para "{searchQuery}"
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Tente buscar por sintomas como <em>"dor nas costas"</em>, <em>"lombar"</em>, <em>"dor de cabeça"</em>, <em>"estresse"</em>, <em>"sono"</em> ou pelo código do ponto (ex: <em>B40</em>, <em>IG4</em>, <em>E36</em>).
                    </p>
                    <div className="pt-2 flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSearchQuery('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                      >
                        Ver Todos os Pontos
                      </button>
                      <button
                        onClick={() => setSearchQuery('dor nas costas')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-xl text-xs transition-all"
                      >
                        ⚡ Dor nas Costas
                      </button>
                      <button
                        onClick={() => setSearchQuery('ansiedade')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-xl text-xs transition-all"
                      >
                        🧘 Ansiedade
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredPoints.map((point) => (
                    <div
                      key={point.id}
                      onClick={() => {
                        // Iniciar terapia integrada diretamente ao clicar no ponto
                        if (!isTimerActive) {
                          startIntegratedTherapy(point.id);
                        }
                      }}
                      className={`bg-white rounded-xl shadow-lg transition-all duration-300 border-2 cursor-pointer p-4 ${selectedPoint === point.id
                        ? 'border-green-500 shadow-xl bg-green-50'
                        : viewingPoint === point.id
                          ? 'border-blue-500 shadow-xl bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                        } ${point.isPremium && !user?.isPremium
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
                                if (point.isPremium && !user?.isPremium) {
                                  alert('🔒 Esta imagem é exclusiva para usuários Premium. Faça upgrade para visualizar!');
                                  onPageChange('premium');
                                  return;
                                }
                                setShowZoomModal(true);
                                setZoomImageUrl(point.image || null);
                              }}
                            >
                              <img
                                src={point.image}
                                alt={point.imageAlt || point.name}
                                className="w-20 h-20 object-contain bg-gray-900 rounded-lg border border-gray-800"
                                style={point.isPremium && !user?.isPremium ? { filter: 'blur(8px)' } : {}}
                                onError={(e) => {
                                  e.currentTarget.src = '/mtc_exhn3_yintang.jpg';
                                }}
                              />
                              {point.isPremium && !user?.isPremium ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                                  <div className="flex flex-col items-center gap-1">
                                    <Lock className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                                    <span className="text-white text-xs font-bold drop-shadow-lg">Premium</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="image-zoom-overlay rounded-lg">
                                  <div className="flex flex-col items-center gap-1">
                                    <ZoomIn className="w-5 h-5 text-white drop-shadow-lg image-zoom-icon" />
                                    <span className="text-white text-xs font-medium drop-shadow-lg image-zoom-text">Ampliar</span>
                                  </div>
                                </div>
                              )}
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
                            <div className="flex items-center flex-wrap gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${point.category === 'general' ? 'bg-blue-100 text-blue-800' :
                                point.category === 'cranio' ? 'bg-purple-100 text-purple-800' :
                                  point.category === 'septicemia' ? 'bg-red-100 text-red-800' :
                                    point.category === 'atm' ? 'bg-orange-100 text-orange-800' :
                                      point.category === 'neuro' ? 'bg-indigo-100 text-indigo-800' :
                                        point.category === 'immunity' ? 'bg-teal-100 text-teal-800' :
                                          point.category === 'cardio' ? 'bg-pink-100 text-pink-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {point.category === 'general' ? 'MTC Geral' :
                                  point.category === 'cranio' ? 'Cranio/YNSA' :
                                    point.category === 'septicemia' ? 'Septicemia' :
                                      point.category === 'atm' ? 'ATM' :
                                        point.category === 'neuro' ? 'Neurologia' :
                                          point.category === 'immunity' ? 'Imunidade' :
                                            point.category === 'cardio' ? 'Cardiologia' :
                                              point.category}
                              </div>
                              {point.category === 'cranio' && point.subcategory && (
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getSubcategoryBadge(point.subcategory).styles}`}>
                                  {getSubcategoryBadge(point.subcategory).name}
                                </div>
                              )}
                              {point.isPremium && (
                                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                  <Crown className="w-3 h-3" />
                                  <span>Premium</span>
                                </div>
                              )}
                            </div>

                            <div className="text-green-600 text-sm font-medium flex items-center space-x-1">
                              <Play className="w-4 h-4" />
                              <span>Iniciar terapia →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
            <div className="lg:col-span-1" id="point-details-panel">
              {viewingPoint && viewingPointData ? (
                <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-24">
                  {/* Botão Voltar - Topo do painel */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewingPoint(null)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        <Target className="w-4 h-4" />
                        <span>← Voltar aos pontos</span>
                      </button>
                      <button
                        onClick={() => {
                          if (fromMapaVivo) {
                            localStorage.removeItem('phyto_from_mapa_vivo');
                            onPageChange('mapa-vivo');
                          } else {
                            onPageChange('home');
                          }
                        }}
                        className={`flex items-center space-x-2 transition-colors text-sm font-medium ${
                          fromMapaVivo ? 'text-purple-400 hover:text-purple-300 font-bold' : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {fromMapaVivo ? <Activity className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                        <span>{fromMapaVivo ? 'Voltar ao Mapa Vivo' : 'Início'}</span>
                      </button>
                    </div>
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
                          if (viewingPointData.isPremium && !user?.isPremium) {
                            alert('🔒 Esta imagem é exclusiva para usuários Premium. Faça upgrade para visualizar!');
                            onPageChange('premium');
                            return;
                          }
                          console.log('Clique na imagem do viewing point!', viewingPointData.image);
                          setShowZoomModal(true);
                          setZoomImageUrl(viewingPointData.image ? encodeURI(viewingPointData.image) : null);
                        }}
                      >
                        <img
                          src={viewingPointData.image ? encodeURI(viewingPointData.image) : ''}
                          alt={viewingPointData.imageAlt || getTranslatedField(viewingPointData, 'name')}
                          className="w-full h-56 object-contain bg-gray-900 rounded-xl shadow-lg border border-gray-800"
                          style={viewingPointData.isPremium && !user?.isPremium ? { filter: 'blur(12px)' } : {}}
                          onError={(e) => {
                            e.currentTarget.src = '/mtc_exhn3_yintang.jpg';
                          }}
                        />
                        {viewingPointData.isPremium && !user?.isPremium ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                            <div className="flex flex-col items-center gap-3">
                              <Lock className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                              <span className="text-white text-lg font-bold drop-shadow-lg">🔒 Conteúdo Premium</span>
                              <span className="text-white text-sm drop-shadow-lg">Faça upgrade para visualizar</span>
                            </div>
                          </div>
                        ) : (
                          <div className="image-zoom-overlay rounded-xl">
                            <div className="flex flex-col items-center gap-2">
                              <ZoomIn className="w-8 h-8 text-white drop-shadow-lg image-zoom-icon" />
                              <span className="text-white text-sm font-medium drop-shadow-lg image-zoom-text">Clique para ampliar</span>
                            </div>
                          </div>
                        )}
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
                      {getTranslatedField(viewingPointData, 'benefits').slice(0, 3).map((benefit: string, index: number) => (
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
            <p className="text-xl mb-2 opacity-90">
              Desbloqueie 61 pontos especializados com terapia integrada avançada
            </p>
            <p className="text-lg mb-6 opacity-80 font-semibold">
              + 22 Jornadas Clínicas Completas (Protocolos Guiados)
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

        {/* MOBILE ONLY: Sticky Action Bar when point is selected */}
        {viewingPoint && viewingPointData && !isTimerActive && !user?.isPremium && viewingPointData.isPremium ? (
          // Premium Point - Sticky Unlock Button
          <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
            <button
              onClick={() => onPageChange('premium')}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transform transition-all active:scale-95 animate-bounce-subtle border-2 border-white"
            >
              <Crown className="w-6 h-6 fill-current text-white" />
              <span>DESBLOQUEAR PREMIUM</span>
            </button>
          </div>
        ) : viewingPoint && viewingPointData && !isTimerActive && (
          // Regular Point - Sticky Start Button
          <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
            <button
              onClick={() => startIntegratedTherapy(viewingPoint)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-2xl py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transform transition-all active:scale-95 animate-pulse-slow border-2 border-white"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>INICIAR TERAPIA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
