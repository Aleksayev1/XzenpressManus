import React, { useEffect } from 'react';
import { createSpotifyService } from '../services/spotifyService';

interface SpotifyCallbackProps {
    onConnect: () => void;
}

export const SpotifyCallback: React.FC<SpotifyCallbackProps> = ({ onConnect }) => {
    useEffect(() => {
        const spotifyService = createSpotifyService();
        if (spotifyService) {
            const token = spotifyService.extractTokenFromUrl();
            if (token) {
                console.log('✅ Spotify conectado com sucesso!');
                onConnect();
            } else {
                console.error('❌ Falha ao conectar Spotify: Token não encontrado');
                onConnect(); // Redireciona de qualquer forma
            }
        } else {
            onConnect();
        }
    }, [onConnect]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-2">Conectando ao Spotify...</h2>
                <p className="text-gray-400">Por favor, aguarde um momento.</p>
            </div>
        </div>
    );
};
