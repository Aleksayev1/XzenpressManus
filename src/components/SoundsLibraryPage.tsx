import React, { useState, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Sparkles, Waves, CloudRain, Wind, Flame, Star, Crown, Zap, Cloud, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSpotifyService } from '../services/spotifyService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioPlayer, Track } from '../contexts/AudioPlayerContext';
import { startGuidedMeditation, getUpgradeMessage, getAllSessions } from '../services/audioDecisionService';

interface SoundsLibraryPageProps {
  onPageChange: (page: string) => void;
}

// Mapping SESSION_MAP categories to UI categories
const categoryMapping: Record<string, string> = {
  'sleep': 'nature',
  'stress': 'mantras',
  'focus': 'binaural',
  'meditation': 'mantras'
};

// Icon mapping for sessions
const iconMapping: Record<string, React.ReactNode> = {
  'ocean-waves': <Waves className="w-6 h-6 text-blue-500" />,
  'gentle-rain': <CloudRain className="w-6 h-6 text-blue-400" />,
  'fireplace-ambience': <Flame className="w-6 h-6 text-orange-500" />,
  'sistema-nervoso-reset': <Zap className="w-6 h-6 text-purple-500" />,
  'craniopuntura-ansiedade': <Sparkles className="w-6 h-6 text-pink-500" />,
  'binaural-focus-40hz': <Star className="w-6 h-6 text-yellow-500" />,
  'foco-corporativo': <Zap className="w-6 h-6 text-indigo-500" />,
  'tigelas-tibetanas': <span className="text-2xl">🎌</span>,
  'meditacao-mindfulness': <Sparkles className="w-6 h-6 text-purple-400" />
};

// Extending local Sound interface to match Track logic
interface Sound extends Omit<Track, 'name'> {
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  duration: string;
  isPremium: boolean;
  src?: string;
  spotifyUrl?: string;
}

export const SoundsLibraryPage: React.FC<SoundsLibraryPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentTrack, isPlaying, togglePlay, playTrack, volume, setVolume } = useAudioPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpgradeHint, setShowUpgradeHint] = useState(false);

  const categories = [
    { id: 'all', name: t('sounds.category.all'), icon: <Volume2 className="w-4 h-4" /> },
    { id: 'nature', name: t('sounds.category.nature'), icon: <Cloud className="w-4 h-4" /> },
    { id: 'ambient', name: t('sounds.category.ambient'), icon: <Wind className="w-4 h-4" /> },
    { id: 'binaural', name: t('sounds.category.binaural'), icon: <Zap className="w-4 h-4" />, premium: true },
    { id: 'mantras', name: t('sounds.category.mantras'), icon: <Music className="w-4 h-4" />, premium: true },
  ];

  // ✅ SINGLE SOURCE OF TRUTH - Derive from SESSION_MAP
  const sounds: Sound[] = useMemo(() => {
    return getAllSessions().map(session => ({
      id: session.id,
      name: session.title,
      description: session.description,
      icon: iconMapping[session.id] || <Music className="w-6 h-6 text-gray-500" />,
      category: categoryMapping[session.category] || 'nature',
      duration: `${session.durationMinutes}:00`,
      isPremium: session.premium.audioUrl !== null, // Premium if has hosted audio
      src: session.premium.audioUrl || undefined,
      spotifyEmbedUrl: session.free.spotifyPlaylistUrl
    }));
  }, []);

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
    try {
      // ✅ CENTRALIZADO - Uma função, um ponto de verdade
      const decision = startGuidedMeditation(user, sound.id);

      // Mostrar hint se necessário
      if (decision.showUpgradeHint) {
        setShowUpgradeHint(true);
        setTimeout(() => setShowUpgradeHint(false), 4000);
      }

      // Play via AudioPlayer (que decidirá entre src ou spotifyEmbedUrl)
      if (currentTrack?.id === sound.id) {
        togglePlay();
      } else {
        playTrack({
          id: sound.id,
          name: sound.name,
          src: decision.type === 'internal' ? decision.url : sound.src,
          spotifyEmbedUrl: decision.type === 'spotify' ? decision.url : sound.spotifyEmbedUrl
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      // Fallback: toca Spotify mesmo se decision falhar
      if (currentTrack?.id === sound.id) {
        togglePlay();
      } else {
        playTrack({
          id: sound.id,
          name: sound.name,
          src: sound.src,
          spotifyEmbedUrl: sound.spotifyEmbedUrl
        });
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

        {/* Spotify Login Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-full">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                💡 Dica: Para Melhor Experiência
              </h3>
              <p className="text-green-800 leading-relaxed">
                Todas as jornadas sonoras foram <strong>cuidadosamente curadas</strong> para máxima eficácia terapêutica.
                Para resultados otimizados, recomendamos <strong>fazer login no Spotify</strong> antes de iniciar sua sessão.
              </p>
              <p className="text-sm text-green-700 mt-2">
                ✓ Login gratuito • ✓ Playlists exclusivas XZenPress • ✓ 100% de reciprocidade clínica
              </p>
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

      {/* Premium Upgrade Hint (for Free users) */}
      {showUpgradeHint && !user?.isPremium && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8 max-w-4xl mx-auto border-2 border-purple-200 shadow-lg animate-fade-in">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">
                💎 Sessões terapêuticas completas
              </h3>
              <p className="text-gray-700 mb-3">
                {getUpgradeMessage()}
              </p>
              <button
                onClick={() => onPageChange('premium')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
              >
                Conhecer Premium
              </button>
            </div>
            <button
              onClick={() => setShowUpgradeHint(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};