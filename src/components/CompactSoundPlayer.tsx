import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Waves, CloudRain } from 'lucide-react';

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
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const freeSounds: Sound[] = [
    {
      id: 'ocean',
      name: 'Oceano',
      icon: <Waves className="w-4 h-4" />,
      src: '/sounds/ocean.mp3'
    },
    {
      id: 'rain',
      name: 'Chuva',
      icon: <CloudRain className="w-4 h-4" />,
      src: '/sounds/rain.mp3'
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && selectedSoundId) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, selectedSoundId]);

  const handleSoundSelect = (soundId: string) => {
    if (selectedSoundId === soundId) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedSoundId(soundId);
      setIsPlaying(true);
    }
  };

  const togglePlayback = () => {
    if (selectedSoundId) {
      setIsPlaying(!isPlaying);
    }
  };

  const currentSound = freeSounds.find(s => s.id === selectedSoundId);

  return (
    <>
      {/* Audio Element */}
      {selectedSoundId && (
        <audio
          ref={audioRef}
          src={freeSounds.find(sound => sound.id === selectedSoundId)?.src}
          loop
          preload="auto"
          onError={() => {
            setSelectedSoundId(null);
            setIsPlaying(false);
          }}
        />
      )}

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

            {selectedSoundId && (
              <>
                <button
                  onClick={togglePlayback}
                  className="p-2 rounded-full transition-all duration-200"
                  style={{ 
                    backgroundColor: isPlaying ? '#EF4444' : currentColor,
                    color: 'white'
                  }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-1">
                  {currentSound?.icon}
                  <span className="text-xs font-medium text-gray-700">
                    {currentSound?.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Expanded Controls */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
              {/* Sound Selection */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">Sons Gratuitos:</div>
                {freeSounds.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundSelect(sound.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-xs transition-all ${
                      selectedSoundId === sound.id
                        ? 'text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                    style={selectedSoundId === sound.id ? {
                      backgroundColor: currentColor,
                    } : {}}
                  >
                    {sound.icon}
                    <span>{sound.name}</span>
                    {selectedSoundId === sound.id && isPlaying && (
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
              {selectedSoundId && (
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
              )}

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