import React, { createContext, useContext, useState, useRef } from 'react';

export interface Track {
    id: string;
    name: string;
    src?: string;
    spotifyEmbedUrl?: string;
}

interface AudioPlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    setVolume: (vol: number) => void;
    stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);

    const playTrack = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const stop = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    return (
        <AudioPlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            volume,
            playTrack,
            togglePlay,
            setVolume,
            stop
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};
