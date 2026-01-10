import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Waves, CloudRain } from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

interface CompactSoundPlayerProps {
  currentColor: string;
  onNavigateToLibrary: () => void;
}

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  src: string;
}

export const CompactSoundPlayer: React.FC<CompactSoundPlayerProps> = ({
  currentColor,
  onNavigateToLibrary
}) => {
  const { isPlaying, currentTrack, volume, setVolume, togglePlay, playTrack } = useAudioPlayer();
  const [isExpanded, setIsExpanded] = useState(false);

  // Define Free Sounds (Matched with Global ID if possible, but for now using local definitions mapped to global Play)
  const freeSounds: Sound[] = [
    {
      id: 'ocean-waves', // Matching the ID in SoundsLibraryPage for consistency
      name: 'Oceano',
      icon: <Waves className="w-4 h-4" />,
      src: '/sounds/ocean.mp3'
    },
    {
      id: 'gentle-rain', // Matching the ID in SoundsLibraryPage
      name: 'Chuva',
      icon: <CloudRain className="w-4 h-4" />,
      src: '/sounds/rain.mp3'
    }
  ];

  const handleSoundSelect = (sound: Sound) => {
    playTrack({
      id: sound.id,
      name: sound.name,
      src: sound.src
    });
  };



  return (
    <>
      {/* Compact Player - Fixed Position */}
      <div
        className="fixed top-20 left-4 z-40 transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}10, white)`,
          borderColor: currentColor + '40'
        }}
      >
        <div className="bg-white rounded-2xl shadow-lg border-2 p-3 backdrop-blur-sm">
          {/* Main Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: currentColor + '20',
                color: currentColor
              }}
            >
              <Music className="w-5 h-5" />
            </button>

            {/* Show controls if we have a track loaded */}
            {currentTrack && (
              <>
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: isPlaying ? '#EF4444' : currentColor,
                    color: 'white'
                  }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-1 max-w-[100px] overflow-hidden">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {currentTrack.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Expanded Controls */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-3 w-48">
              {/* Sound Selection */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">Sons Rápidos:</div>
                {freeSounds.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundSelect(sound)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-xs transition-all ${currentTrack?.id === sound.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    style={currentTrack?.id === sound.id ? {
                      backgroundColor: currentColor,
                    } : {}}
                  >
                    {sound.icon}
                    <span>{sound.name}</span>
                    {currentTrack?.id === sound.id && isPlaying && (
                      <div className="ml-auto flex space-x-1">
                        <div className="w-1 h-3 bg-white rounded animate-pulse"></div>
                        <div className="w-1 h-3 bg-white rounded animate-pulse delay-100"></div>
                        <div className="w-1 h-3 bg-white rounded animate-pulse delay-200"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <VolumeX className="w-3 h-3 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${currentColor} 0%, ${currentColor} ${volume * 100}%, #E5E7EB ${volume * 100}%, #E5E7EB 100%)`
                  }}
                />
                <Volume2 className="w-3 h-3 text-gray-500" />
              </div>

              {/* Library Access */}
              <button
                onClick={onNavigateToLibrary}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-xs font-medium transition-all hover:shadow-md"
                style={{
                  color: currentColor,
                  backgroundColor: currentColor,
                  boxShadow: `0 4px 12px ${currentColor}40`
                }}
              >
                <Music className="w-3 h-3" />
                <span>Biblioteca Completa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};