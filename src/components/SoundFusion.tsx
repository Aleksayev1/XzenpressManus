
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, CloudRain, Moon } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    src: string;
    icon: React.ReactNode;
    defaultVolume: number;
}

const SoundFusion: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volumes, setVolumes] = useState<{ [key: string]: number }>({
        weightless: 0.6,
        jazz: 0.4,
        rain: 0.3,
    });
    const [muted, setMuted] = useState<{ [key: string]: boolean }>({
        weightless: false,
        jazz: false,
        rain: false,
    });

    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Supabase Storage CDN URLs - arquivos hospedados no bucket 'sounds/fusion'
    const SUPABASE_AUDIO_BASE = 'https://dqjcbwjqrenubdzalicy.supabase.co/storage/v1/object/public/sounds/Fusion';

    const tracks: Track[] = [
        {
            id: 'weightless',
            name: 'Weightless (Marconi Union)',
            src: `${SUPABASE_AUDIO_BASE}/Weightless.mp3`,
            icon: <Moon className="w-6 h-6 text-purple-400" />,
            defaultVolume: 0.6
        },
        {
            id: 'jazz',
            name: 'Baby Jazz (Relax & Sleep)',
            src: `${SUPABASE_AUDIO_BASE}/jazz.mp3`,
            icon: <Music className="w-6 h-6 text-yellow-400" />,
            defaultVolume: 0.4
        },
        {
            id: 'rain',
            name: 'Relaxing Rain',
            src: `${SUPABASE_AUDIO_BASE}/rain.mp3`,
            icon: <CloudRain className="w-6 h-6 text-blue-400" />,
            defaultVolume: 0.3
        }
    ];

    // Initialize audio refs and set initial volumes
    useEffect(() => {
        tracks.forEach(track => {
            if (!audioRefs.current[track.id]) {
                const audio = new Audio(track.src);
                audio.loop = true;
                audio.volume = volumes[track.id];
                audioRefs.current[track.id] = audio;
            }
        });

        return () => {
            // Cleanup: pause all audio when leaving
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            audioRefs.current = {};
        };
    }, []);

    // Update volumes when state changes
    useEffect(() => {
        Object.keys(audioRefs.current).forEach(id => {
            const audio = audioRefs.current[id];
            if (audio) {
                audio.volume = muted[id] ? 0 : volumes[id];
            }
        });
    }, [volumes, muted]);

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        Object.values(audioRefs.current).forEach(audio => {
            if (newIsPlaying) {
                audio.play().catch(e => console.error("Error playing audio:", e));
            } else {
                audio.pause();
            }
        });
    };

    const handleVolumeChange = (id: string, value: number) => {
        setVolumes(prev => ({ ...prev, [id]: value }));
        setMuted(prev => ({ ...prev, [id]: value === 0 }));
    };

    const toggleMute = (id: string) => {
        setMuted(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="min-h-screen bg-studio-dark text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambient Effect */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
                <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl z-10 border border-white/5">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-light tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200">
                        Harmonia Perfeita
                    </h1>
                    <p className="text-gray-400 font-light text-sm tracking-widest uppercase">
                        Audio Fusion • XZenPress
                    </p>
                </header>

                <div className="space-y-8">
                    {tracks.map(track => (
                        <div key={track.id} className="bg-black/20 rounded-xl p-4 flex items-center gap-4 hover:bg-black/30 transition-all duration-300">
                            <div className="p-3 bg-white/5 rounded-full shadow-inner ring-1 ring-white/10">
                                {track.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium text-gray-200">{track.name}</h3>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {muted[track.id] ? 'Muted' : `${Math.round(volumes[track.id] * 100)}%`}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={muted[track.id] ? 0 : volumes[track.id]}
                                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 transition-colors"
                                />
                            </div>

                            <button
                                onClick={() => toggleMute(track.id)}
                                className={`p-2 rounded-full transition-colors ${muted[track.id] ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-white'}`}
                            >
                                {muted[track.id] ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={togglePlay}
                        className={`
              w-24 h-24 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105
              ${isPlaying
                                ? 'bg-amber-500/80 hover:bg-amber-600/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                                : 'bg-teal-500/80 hover:bg-teal-600/80 shadow-[0_0_30px_rgba(20,184,166,0.3)]'}
            `}
                    >
                        {isPlaying ? (
                            <Pause className="w-10 h-10 text-white fill-current" />
                        ) : (
                            <Play className="w-10 h-10 text-white fill-current ml-1" />
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 font-mono animate-pulse">
                        {isPlaying ? "Synchronizing Brainwaves..." : "Ready to Fuse"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SoundFusion;
