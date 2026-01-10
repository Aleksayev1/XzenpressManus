import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Sparkles, Waves, CloudRain, Wind, Flame, Leaf, Star, Crown, Zap, Cloud, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioPlayer, Track } from '../contexts/AudioPlayerContext';

interface SoundsLibraryPageProps {
  onPageChange: (page: string) => void;
}

// Extending local Sound interface to match Track logic
interface Sound extends Omit<Track, 'name'> {
  name: string; // Ensuring name is present
  description: string;
  icon: React.ReactNode;
  category: 'nature' | 'ambient' | 'binaural' | 'mantras';
  duration: string;
  isPremium: boolean;
  src?: string;
  spotifyEmbedUrl?: string;
}

export const SoundsLibraryPage: React.FC<SoundsLibraryPageProps> = ({ onPageChange }) => {
  const { t } = useLanguage();
  const { currentTrack, isPlaying, togglePlay, playTrack, volume, setVolume } = useAudioPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: t('sounds.category.all'), icon: <Volume2 className="w-4 h-4" /> },
    { id: 'nature', name: t('sounds.category.nature'), icon: <Cloud className="w-4 h-4" /> },
    { id: 'ambient', name: t('sounds.category.ambient'), icon: <Wind className="w-4 h-4" /> },
    { id: 'binaural', name: t('sounds.category.binaural'), icon: <Zap className="w-4 h-4" /> },
    { id: 'mantras', name: t('sounds.category.mantras'), icon: <Music className="w-4 h-4" /> },
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

    // Sons Premium - Com Spotify
    {
      id: 'forest-ambience',
      name: 'Floresta Encantada',
      description: 'Sons da floresta com pássaros e vento suave',
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      category: 'nature',
      duration: '60:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8ymr6UES7vc?utm_source=generator' // Nature Sounds (Official)
    },
    {
      id: 'fireplace-crackle',
      name: 'Lareira Aconchegante',
      description: 'Som de lareira crepitando para ambiente acolhedor',
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      category: 'ambient',
      duration: '120:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZmwS63ON8g7?utm_source=generator' // Calm Vibes (Official)
    },
    {
      id: 'wind-chimes',
      name: 'Sinos do Vento',
      description: 'Melodia suave de sinos de vento para harmonização',
      icon: <Wind className="w-6 h-6 text-purple-400" />,
      category: 'ambient',
      duration: '40:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1n9whBbBKoL?utm_source=generator' // Peaceful Piano (Official)
    },
    {
      id: 'binaural-focus',
      name: 'Foco Binaural 40Hz',
      description: 'Frequência binaural para concentração e foco mental',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      category: 'binaural',
      duration: '30:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator' // Peaceful Piano (Official)
    },
    {
      id: 'guided-meditation',
      name: 'Meditação Guiada',
      description: 'Jornada de paz interior para reduzir ansiedade e estresse',
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      category: 'mantras', // Mudando para mantras/meditação
      duration: '20:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVS1recTqXqO?utm_source=generator' // Guided Meditation (Official)
    },
    {
      id: 'om-mantra',
      name: 'Mantra OM Sagrado',
      description: 'Vibração primordial para meditação transcendental',
      icon: <span className="text-2xl">🕉️</span>,
      category: 'mantras',
      duration: '21:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator' // Yoga & Meditation (Official)
    },
    {
      id: 'tibetan-bowls',
      name: 'Tigelas Tibetanas',
      description: 'Sons de tigelas tibetanas para limpeza energética',
      icon: <span className="text-2xl">🎌</span>,
      category: 'mantras',
      duration: '35:00',
      isPremium: false,
      spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator' // Yoga & Meditation (Official)
    }
  ];

  const filteredSounds = sounds.filter(sound => {
    const categoryMatch = selectedCategory === 'all' || sound.category === selectedCategory;
    return categoryMatch;
  });

  const handleSoundSelect = (sound: Sound) => {
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
  };

  // Find the full sound data object for the currently playing track
  const currentSoundData = sounds.find(s => s.id === currentTrack?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onPageChange('home')}
          className="mb-8 flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors group"
        >
          <div className="p-2 bg-white rounded-full shadow-md group-hover:shadow-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Voltar ao Início</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
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

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Playing (Using Global State) */}
        {currentTrack && currentSoundData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto border-2 border-purple-100">
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

            {/* Content: Local Player Controls OR Spotify Embed Placeholder */}
            {currentSoundData.src ? (
              // Local Player Controls
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className={`p-3 rounded-full transition-all ${isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                </div>

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
                </div>
              </div>
            ) : currentSoundData.spotifyEmbedUrl ? (
              // Spotify Player Message
              <div className="w-full text-center p-4 bg-green-50 rounded-xl">
                <p className="text-green-800 font-medium mb-2">
                  🎵 Tocando via Spotify
                </p>
                <p className="text-sm text-green-700">
                  O player aparecerá na parte inferior da tela.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Continue navegando - o som não vai parar!
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Sounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 ${currentTrack?.id === sound.id
                ? 'border-purple-500 shadow-xl'
                : 'border-gray-200 hover:border-gray-300'
                } hover:shadow-xl cursor-pointer`}
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
                  {/* Indicator for Active Sound */}
                  {currentTrack?.id === sound.id && isPlaying && (
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
            </div>
          ))}
        </div>

        {/* Global Player Info Footer */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎵 Player Global Ativo</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Agora você pode navegar para a página de Acupressão ou qualquer outra área do app sem que a música pare!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};