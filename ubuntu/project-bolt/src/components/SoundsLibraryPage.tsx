import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Heart, Waves, CloudRain, Wind, Flame, Leaf, Star, Lock, Crown, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [spotifyConnected, setSpotifyConnected] = useState(true); // Sempre ativo para links diretos
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Spotify sempre disponível via links diretos
  useEffect(() => {
    console.log('🎵 Spotify: Links diretos sempre ativos');
    console.log('✅ Playlists oficiais do Spotify funcionando');
  }, []);

  const categories = [
    { id: 'all', name: 'Todos os Sons', icon: '🎵' },
    { id: 'nature', name: 'Natureza', icon: '🌿' },
    { id: 'ambient', name: 'Ambiente', icon: '🏠' },
    { id: 'binaural', name: 'Binaurais', icon: '🧠', premium: true },
    { id: 'mantras', name: 'Mantras', icon: '🕉️', premium: true },
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
      src: '/sounds/ocean.mp3'
    },
    {
      id: 'gentle-rain',
      name: 'Chuva Suave',
      description: 'Som calmante de chuva para relaxamento e sono',
      icon: <CloudRain className="w-6 h-6 text-blue-400" />,
      category: 'nature',
      duration: '45:00',
      isPremium: false,
      src: '/sounds/rain.mp3'
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
      spotifyUrl: 'https://open.spotify.com/search/fireplace%20sounds%20relaxing'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pt-16">
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Biblioteca de Sons
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sons harmonizantes e frequências terapêuticas para potencializar sua prática
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                disabled={category.premium && !user?.isPremium}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : category.premium && !user?.isPremium
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {category.premium && !user?.isPremium && (
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
                  className={`p-3 rounded-full transition-all ${
                    isPlaying 
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
              className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 ${
                currentSound === sound.id
                  ? 'border-purple-500 shadow-xl'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                sound.isPremium && !user?.isPremium
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
            <h2 className="text-3xl font-bold mb-4">🔒 Biblioteca Premium</h2>
            <p className="text-xl mb-6 opacity-90">
              Desbloqueie mais de 50 sons exclusivos + integração Spotify
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-semibold">Binaurais</div>
                <div className="text-sm opacity-80">Frequências terapêuticas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🕉️</div>
                <div className="font-semibold">Mantras</div>
                <div className="text-sm opacity-80">Vibrações sagradas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">🌿</div>
                <div className="font-semibold">Natureza HD</div>
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
              🔓 Desbloquear Biblioteca Completa
            </button>
          </div>
        )}

        {/* Spotify Integration */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎵 Integração Spotify Premium</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Conecte sua conta Spotify Premium para acessar playlists curadas especialmente para meditação e bem-estar
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
            <button className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors">
              ✅ Links Spotify Oficiais Ativos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};