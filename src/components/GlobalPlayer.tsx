import React, { useEffect, useRef } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

export const GlobalPlayer: React.FC = () => {
    const { currentTrack, isPlaying, volume, togglePlay } = useAudioPlayer();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Handle Volume Changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Handle Play/Pause for Local Audio
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.src) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[99999]">
            {/* LOCAL AUDIO PLAYER (Hidden but functional) */}
            {currentTrack.src && (
                <audio
                    ref={audioRef}
                    src={currentTrack.src}
                    onEnded={() => togglePlay()}
                    loop
                    className="hidden"
                />
            )}


            {/* SPOTIFY PLAYER - Visible at bottom when Spotify track is playing */}
            {currentTrack.spotifyEmbedUrl && (
                <div className="w-full bg-black shadow-2xl border-t border-gray-800">
                    <iframe
                        src={currentTrack.spotifyEmbedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="eager"
                        title="Spotify Player"
                        className="block w-full"
                    />
                </div>
            )}
        </div>
    );
};
