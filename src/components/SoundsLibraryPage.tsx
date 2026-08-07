import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Heart, Waves, CloudRain, Wind, Flame, Leaf, Star, Lock, Crown, ExternalLink, Zap, Cloud, ArrowLeft, Home, Activity, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSpotifyService } from '../services/spotifyService';
import { useLanguage } from '../contexts/LanguageContext';
import {
  playMtcElement, startBinauralBeats, startQigongRhythm, startDownRegulationProtocol,
  MTC_ELEMENT_NAMES, BINAURAL_LABELS,
  type MtcElement, type BinauralState, type ZenAudioSession
} from '../services/zenAudioEngine';

interface SoundsLibraryPageProps {
  onPageChange: (page: string) => void;
}

interface Sound {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'nature' | 'ambient' | 'binaural' | 'mantras';
  duration: string;
  isPremium: boolean;
  src?: string;
  spotifyUrl?: string;
}

export const SoundsLibraryPage: React.FC<SoundsLibraryPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fromMapaVivo, setFromMapaVivo] = useState(false);
  useEffect(() => {
    setFromMapaVivo(localStorage.getItem('phyto_from_mapa_vivo') === 'true');
  }, []);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Native ZenAudioEngine state ──────────────────────────────────────────
  const [activePillar, setActivePillar] = useState<'mtc' | 'qigong' | 'binaural' | 'downreg' | null>(null);
  const [activeMtc, setActiveMtc] = useState<MtcElement>('wood');
  const [activeBinaural, setActiveBinaural] = useState<BinauralState>('alpha');
  const [qigongPhase, setQigongPhase] = useState<'inspire' | 'expire'>('inspire');
  const [downRegBpm, setDownRegBpm] = useState<number>(80);
  const zenSessionRef = useRef<ZenAudioSession | null>(null);

  const stopZenSession = useCallback(() => {
    if (zenSessionRef.current) {
      zenSessionRef.current.stop();
      zenSessionRef.current = null;
    }
    setActivePillar(null);
  }, []);

  const toggleMtc = useCallback((element: MtcElement) => {
    if (activePillar === 'mtc' && activeMtc === element) { stopZenSession(); return; }
    stopZenSession();
    const session = playMtcElement(element, 0.22);
    if (session) { zenSessionRef.current = session; setActiveMtc(element); setActivePillar('mtc'); }
  }, [activePillar, activeMtc, stopZenSession]);

  const toggleBinaural = useCallback((state: BinauralState) => {
    if (activePillar === 'binaural' && activeBinaural === state) { stopZenSession(); return; }
    stopZenSession();
    const session = startBinauralBeats(state, 0.18);
    if (session) { zenSessionRef.current = session; setActiveBinaural(state); setActivePillar('binaural'); }
  }, [activePillar, activeBinaural, stopZenSession]);

  const toggleQigong = useCallback(() => {
    if (activePillar === 'qigong') { stopZenSession(); return; }
    stopZenSession();
    const session = startQigongRhythm((phase) => setQigongPhase(phase), 0.15);
    if (session) { zenSessionRef.current = session; setActivePillar('qigong'); }
  }, [activePillar, stopZenSession]);

  const toggleDownReg = useCallback(() => {
    if (activePillar === 'downreg') { stopZenSession(); return; }
    stopZenSession();
    const session = startDownRegulationProtocol((bpm) => setDownRegBpm(bpm), 0.2);
    if (session) { zenSessionRef.current = session; setActivePillar('downreg'); }
  }, [activePillar, stopZenSession]);

  // Cleanup on unmount
  useEffect(() => () => { zenSessionRef.current?.stop(); }, []);

  // Spotify sempre disponível via links diretos
  useEffect(() => {
    console.log('🎵 Spotify: Links diretos sempre ativos');
    console.log('✅ Playlists oficiais do Spotify funcionando');
  }, []);

  const categories = [
    { id: 'all', name: t('sounds.category.all'), icon: <Volume2 className="w-4 h-4" /> },
    { id: 'nature', name: t('sounds.category.nature'), icon: <Cloud className="w-4 h-4" /> },
    { id: 'ambient', name: t('sounds.category.ambient'), icon: <Wind className="w-4 h-4" /> },
    { id: 'binaural', name: t('sounds.category.binaural'), icon: <Zap className="w-4 h-4" />, premium: true },
    { id: 'mantras', name: t('sounds.category.mantras'), icon: <Music className="w-4 h-4" />, premium: true },
  ];

  const sounds: Sound[] = [
    // Sons Gratuitos
    {
      id: 'ocean-waves',
      name: 'Ondas do Oceano',
      description: 'Som relaxante das ondas do mar para meditação profunda',
      icon: <Waves className="w-6 h-6 text-blue-500" />,
      category: 'nature',
      duration: '30:00',
      isPremium: false,
      src: '/sounds/ocean.mp3',
      spotifyUrl: 'https://open.spotify.com/search/ocean%20waves%20sounds'
    },
    {
      id: 'gentle-rain',
      name: 'Chuva Suave',
      description: 'Som calmante de chuva para relaxamento e sono',
      icon: <CloudRain className="w-6 h-6 text-blue-400" />,
      category: 'nature',
      duration: '45:00',
      isPremium: false,
      src: '/sounds/rain.mp3',
      spotifyUrl: 'https://open.spotify.com/search/rain%20sounds%20sleep'
    },

    // Sons Premium
    {
      id: 'forest-ambience',
      name: 'Floresta Encantada',
      description: 'Sons da floresta com pássaros e vento suave',
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      category: 'nature',
      duration: '60:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/forest%20sounds%20meditation'
    },
    {
      id: 'fireplace-crackle',
      name: 'Lareira Aconchegante',
      description: 'Som de lareira crepitando para ambiente acolhedor',
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      category: 'ambient',
      duration: '120:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/fireplace%20sounds'
    },
    {
      id: 'wind-chimes',
      name: 'Sinos do Vento',
      description: 'Melodia suave de sinos de vento para harmonização',
      icon: <Wind className="w-6 h-6 text-purple-400" />,
      category: 'ambient',
      duration: '40:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/wind%20chimes%20meditation'
    },
    {
      id: 'binaural-focus',
      name: 'Foco Binaural 40Hz',
      description: 'Frequência binaural para concentração e foco mental',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      category: 'binaural',
      duration: '30:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/binaural%20beats%2040hz%20focus'
    },
    {
      id: 'binaural-sleep',
      name: 'Sono Profundo 2Hz',
      description: 'Frequência delta para induzir sono reparador',
      icon: <Heart className="w-6 h-6 text-indigo-500" />,
      category: 'binaural',
      duration: '480:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/delta%20waves%20sleep%20meditation'
    },
    {
      id: 'om-mantra',
      name: 'Mantra OM Sagrado',
      description: 'Vibração primordial para meditação transcendental',
      icon: <span className="text-2xl">🕉️</span>,
      category: 'mantras',
      duration: '21:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/om%20mantra%20meditation'
    },
    {
      id: 'tibetan-bowls',
      name: 'Tigelas Tibetanas',
      description: 'Sons de tigelas tibetanas para limpeza energética',
      icon: <span className="text-2xl">🎌</span>,
      category: 'mantras',
      duration: '35:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/tibetan%20singing%20bowls'
    },
    {
      id: 'reset-nervous-system',
      name: 'Reset do Sistema Nervoso',
      description: 'Respiração 4-7-8 guiada para ativação parassimpática e redução do cortisol.',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      category: 'mantras',
      duration: '12:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/4-7-8%20breathing%20guided%20meditation'
    },
    {
      id: 'cranio-anxiety',
      name: 'Craniopuntura para Ansiedade',
      description: 'Prática guiada Yamamoto para redução de ansiedade clínica e tensão muscular.',
      icon: <Star className="w-6 h-6 text-pink-500" />,
      category: 'mantras',
      duration: '15:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/binaural%20beats%2040hz%20focus'
    },
    {
      id: 'corporate-focus',
      name: 'Foco Corporativo Profundo',
      description: 'Ambiente sonoro otimizado para trabalho de alta demanda cognitiva e fluxo contínuo.',
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      category: 'binaural',
      duration: '25:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/foco%20corporativo%20profundo'
    },
    {
      id: 'mindfulness-guided',
      name: 'Meditação Mindfulness Guiada',
      description: 'Jornada de atenção plena para redução de ansiedade e clareza mental.',
      icon: <Star className="w-6 h-6 text-purple-400" />,
      category: 'mantras',
      duration: '20:00',
      isPremium: true,
      spotifyUrl: 'https://open.spotify.com/search/guided%20mindfulness%20meditation'
    }
  ];

  const filteredSounds = sounds.filter(sound => {
    const categoryMatch = selectedCategory === 'all' || sound.category === selectedCategory;
    const accessMatch = !sound.isPremium || (user && user.isPremium);
    return categoryMatch && accessMatch;
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSound]);

  const handleSoundSelect = (sound: Sound) => {
    if (sound.isPremium && !user?.isPremium) {
      return;
    }

    if (currentSound === sound.id) {
      togglePlayback();
    } else {
      setCurrentSound(sound.id);
      if (sound.src) {
        setIsPlaying(true);
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSoundData = sounds.find(s => s.id === currentSound);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">
      {/* Audio Element */}
      {currentSound && currentSoundData?.src && (
        <audio
          ref={audioRef}
          src={currentSoundData.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            console.warn('Erro ao carregar áudio');
            setIsPlaying(false);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Back Button */}
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

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('sounds.title')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('sounds.subtitle')}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
             🎯  GUIA DE ORIENTAÇÃO & SONS BIOADAPTATIVOS
             Geradores nativos via Web Audio API · Zero arquivos externos
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-10">
          
          {/* GUIA DO CLIENTE: O QUE FAZER E COMO USAR */}
          <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🧭</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Guia Rápido: Qual som escolher agora?</h2>
                <p className="text-purple-200 text-xs md:text-sm">
                  Escolha <strong>1 opção por vez</strong> de acordo com o seu objetivo no momento. Usar fones de ouvido enriquece a experiência.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">😰 Estresse ou Agitação</div>
                <div className="text-sm font-semibold text-white">Down-Regulation ou Âncora Respiratória</div>
                <div className="text-xs text-purple-200 mt-1">Conduz o ritmo respiratório para acalmar o sistema nervoso em minutos.</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">😴 Relaxar ou Preparar o Sono</div>
                <div className="text-sm font-semibold text-white">Paisagem Sonora Água ou Binaural Delta</div>
                <div className="text-xs text-purple-200 mt-1">Frequências suaves para descompressão e indução ao descanso profundo.</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">🎯 Foco no Trabalho / Estudo</div>
                <div className="text-sm font-semibold text-white">Binaural Alpha / Gamma ou Elemento Madeira</div>
                <div className="text-xs text-purple-200 mt-1">Sons que favorecem a concentração mantendo a mente calma e atenta.</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">🌿 Equilíbrio do Dia a Dia</div>
                <div className="text-sm font-semibold text-white">Paisagens Pentatônicas (432 Hz)</div>
                <div className="text-xs text-purple-200 mt-1">Harmozações de 5 elementos inspiradas na tradição milenar oriental.</div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-2">
              🔬 Motor de Síntese Bioadaptativo Nativo
            </span>
            <h2 className="text-2xl font-bold text-gray-800">Sons de Síntese em Tempo Real</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-xl mx-auto">
              Gerados diretamente no seu dispositivo sem consumo de internet · Ative apenas um som por vez
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ── PILAR 1: MTC PENTATÔNICA ──────────────────────────────── */}
            <div className={`rounded-2xl p-5 border-2 transition-all ${
              activePillar === 'mtc'
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">☯️</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Paisagens Pentatônicas</h3>
                  <p className="text-xs text-gray-500">5 Elementos · Afinação em 432 Hz</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Arranjos em afinação estética de 432 Hz inspirados nos elementos da Medicina Tradicional Chinesa.
              </p>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {([
                  { el: 'wood' as MtcElement, label: '🌿', name: 'Madeira', tip: 'Foco' },
                  { el: 'fire' as MtcElement, label: '🔥', name: 'Fogo', tip: 'Conexão' },
                  { el: 'earth' as MtcElement, label: '🌍', name: 'Terra', tip: 'Centro' },
                  { el: 'metal' as MtcElement, label: '⚙️', name: 'Metal', tip: 'Respirar' },
                  { el: 'water' as MtcElement, label: '💧', name: 'Água', tip: 'Calma' },
                ]).map(({ el, label, name, tip }) => (
                  <button
                    key={el}
                    onClick={() => toggleMtc(el)}
                    title={`${MTC_ELEMENT_NAMES[el]} — ${tip}`}
                    className={`flex flex-col items-center p-2 rounded-xl text-[11px] font-semibold transition-all ${
                      activePillar === 'mtc' && activeMtc === el
                        ? 'bg-emerald-500 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="text-sm">{label}</span>
                    <span className="mt-0.5 font-bold">{name}</span>
                    <span className="text-[9px] opacity-75 font-normal">{tip}</span>
                  </button>
                ))}
              </div>
              {activePillar === 'mtc' && (
                <div className="text-center">
                  <p className="text-xs text-emerald-700 font-semibold animate-pulse mb-2">
                    🔊 {MTC_ELEMENT_NAMES[activeMtc]}
                  </p>
                  <button onClick={stopZenSession} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto">
                    <Square className="w-3 h-3" /> Parar Som
                  </button>
                </div>
              )}
            </div>

            {/* ── PILAR 2: QIGONG RHYTHM ────────────────────────────────── */}
            <div className={`rounded-2xl p-5 border-2 transition-all ${
              activePillar === 'qigong'
                ? 'border-sky-400 bg-gradient-to-br from-sky-50 to-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-sky-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌬️</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Âncora Respiratória</h3>
                  <p className="text-xs text-gray-500">Qigong Rhythm · 5,5s por fase</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Guia sonoro suave para conduzir sua respiração na frequência de coerência cardiorrespiratória.
              </p>
              {activePillar === 'qigong' ? (
                <div className="text-center">
                  <div className={`text-4xl mb-2 transition-all duration-500 ${
                    qigongPhase === 'inspire' ? 'scale-110' : 'scale-90'
                  }`}>
                    {qigongPhase === 'inspire' ? '🫧' : '🍃'}
                  </div>
                  <p className={`text-sm font-bold mb-1 ${
                    qigongPhase === 'inspire' ? 'text-sky-600' : 'text-blue-800'
                  }`}>
                    {qigongPhase === 'inspire' ? '↑ Inspire profundamente' : '↓ Expire devagar'}
                  </p>
                  <button onClick={stopZenSession} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto mt-2">
                    <Square className="w-3 h-3" /> Parar Âncora
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleQigong}
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Iniciar Âncora (5,5s)
                </button>
              )}
            </div>

            {/* ── PILAR 3: BINAURAL / NEUROCIÊNCIA ─────────────────────── */}
            <div className={`rounded-2xl p-5 border-2 transition-all ${
              activePillar === 'binaural'
                ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-violet-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Faixas Binaurais</h3>
                  <p className="text-xs text-gray-500">Uso com fones recomendado</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Padrões estéreo opcionais associados a relaxamento e foco. Os efeitos variam entre indivíduos.
              </p>
              <div className="space-y-1.5 mb-3">
                {([
                  { state: 'alpha' as BinauralState, color: 'bg-violet-500' },
                  { state: 'theta' as BinauralState, color: 'bg-purple-600' },
                  { state: 'delta' as BinauralState, color: 'bg-indigo-700' },
                  { state: 'beta'  as BinauralState, color: 'bg-blue-500' },
                  { state: 'gamma' as BinauralState, color: 'bg-pink-500' },
                ]).map(({ state, color }) => (
                  <button
                    key={state}
                    onClick={() => toggleBinaural(state)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      activePillar === 'binaural' && activeBinaural === state
                        ? `${color} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-violet-100'
                    }`}
                  >
                    {BINAURAL_LABELS[state]}
                  </button>
                ))}
              </div>
              {activePillar === 'binaural' && (
                <button onClick={stopZenSession} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto mt-1">
                  <Square className="w-3 h-3" /> Parar
                </button>
              )}
            </div>
          </div>

          {/* ── PROTOCOLO CLÍNICO: Down Regulation ──────────────────────── */}
          <div className={`mt-5 rounded-2xl p-5 border-2 transition-all ${
            activePillar === 'downreg'
              ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <h3 className="font-bold text-gray-800">Protocolo Down Regulation <span className="text-xs font-normal bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">8 min</span></h3>
                  <p className="text-xs text-gray-500">Rampa BPM 80→72→64→58 · Grounding 174 Hz · Descompressão simpática</p>
                </div>
              </div>
              {activePillar === 'downreg' ? (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-orange-600">{downRegBpm}</span>
                    <p className="text-xs text-gray-500">BPM atual</p>
                  </div>
                  <button
                    onClick={stopZenSession}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                  >
                    <Square className="w-4 h-4" /> Parar
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleDownReg}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Play className="w-4 h-4" /> Iniciar Protocolo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                disabled={(category as any).premium && !user?.isPremium}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : (category as any).premium && !user?.isPremium
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {(category as any).premium && !user?.isPremium && (
                  <Lock className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Playing */}
        {currentSound && currentSoundData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                {currentSoundData.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{currentSoundData.name}</h3>
                <p className="text-sm text-gray-600">{currentSoundData.description}</p>
              </div>
              {currentSoundData.isPremium && (
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={togglePlayback}
                  className={`p-3 rounded-full transition-all ${isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                {currentSoundData.spotifyUrl && (
                  <a
                    href={currentSoundData.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir no Spotify</span>
                  </a>
                )}
              </div>

              {/* Progress Bar */}
              {currentSoundData.src && duration > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <VolumeX className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <Volume2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600 min-w-[3rem]">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 ${currentSound === sound.id
                ? 'border-purple-500 shadow-xl'
                : 'border-gray-200 hover:border-gray-300'
                } ${sound.isPremium && !user?.isPremium
                  ? 'opacity-60'
                  : 'hover:shadow-xl cursor-pointer'
                }`}
              onClick={() => handleSoundSelect(sound)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {sound.icon}
                </div>
                <div className="flex items-center space-x-2">
                  {sound.isPremium && (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      <Crown className="w-3 h-3" />
                      <span>Premium</span>
                    </div>
                  )}
                  {currentSound === sound.id && isPlaying && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-purple-500 rounded animate-pulse"></div>
                      <div className="w-1 h-4 bg-purple-500 rounded animate-pulse delay-100"></div>
                      <div className="w-1 h-4 bg-purple-500 rounded animate-pulse delay-200"></div>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">{sound.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{sound.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize">{sound.category}</span>
                <span>{sound.duration}</span>
              </div>

              {sound.isPremium && !user?.isPremium && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Premium</span>
                  </div>
                </div>
              )}

              {sound.spotifyUrl && (user?.isPremium || !sound.isPremium) && (
                <div className="mt-4">
                  <a
                    href={sound.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Spotify</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('sounds.premium.title')}</h2>
            <p className="text-xl mb-6 opacity-90">
              {t('sounds.premium.subtitle')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-semibold">{t('sounds.category.binaural')}</div>
                <div className="text-sm opacity-80">Frequências terapêuticas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🕉️</div>
                <div className="font-semibold">{t('sounds.category.mantras')}</div>
                <div className="text-sm opacity-80">Vibrações sagradas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🌿</div>
                <div className="font-semibold">{t('sounds.category.nature')}</div>
                <div className="text-sm opacity-80">Alta qualidade</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🎵</div>
                <div className="font-semibold">Spotify</div>
                <div className="text-sm opacity-80">Integração completa</div>
              </div>
            </div>
            <button
              onClick={() => onPageChange('premium')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {t('sounds.premium.unlock')}
            </button>
          </div>
        )}

        {/* Spotify Integration */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎵 {t('sounds.spotify.title')}</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('sounds.spotify.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <a
                href="https://open.spotify.com/search/meditation%20relaxation"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-4 hover:shadow-lg transition-all border border-green-200"
              >
                <div className="text-2xl mb-2">🧘</div>
                <div className="font-semibold text-gray-800">Meditação</div>
                <div className="text-sm text-gray-600">Busca no Spotify</div>
              </a>
              <a
                href="https://open.spotify.com/search/sleep%20sounds%20nature"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-4 hover:shadow-lg transition-all border border-green-200"
              >
                <div className="text-2xl mb-2">😴</div>
                <div className="font-semibold text-gray-800">Sono</div>
                <div className="text-sm text-gray-600">Sons para dormir</div>
              </a>
              <a
                href="https://open.spotify.com/search/focus%20concentration%20music"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-4 hover:shadow-lg transition-all border border-green-200"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-800">Foco</div>
                <div className="text-sm text-gray-600">Concentração</div>
              </a>
            </div>
          </div>
          {createSpotifyService() ? (
            <button
              onClick={() => {
                const service = createSpotifyService();
                if (service) window.location.href = service.getAuthUrl();
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center mx-auto space-x-2"
            >
              <Music className="w-5 h-5" />
              <span>{t('sounds.spotify.connect')}</span>
            </button>
          ) : (
            <button className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors">
              ✅ {t('sounds.spotify.active')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};