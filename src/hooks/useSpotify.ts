import { useState, useEffect } from 'react';
import { createSpotifyService, SpotifyService, SpotifyPlaylist, SpotifyTrack } from '../services/spotifyService';

export const useSpotify = () => {
  const [spotifyService, setSpotifyService] = useState<SpotifyService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const service = createSpotifyService();
    if (service) {
      setSpotifyService(service);
      
      // Verificar se já tem token salvo
      const hasToken = service.loadSavedToken();
      setIsConnected(hasToken);
      
      // Verificar se há token na URL (callback)
      const tokenFromUrl = service.extractTokenFromUrl();
      if (tokenFromUrl) {
        setIsConnected(true);
        loadPlaylists(service);
      } else if (hasToken) {
        loadPlaylists(service);
      }
    }
  }, []);

  const loadPlaylists = async (service: SpotifyService) => {
    setLoading(true);
    setError('');
    
    try {
      const wellnessPlaylists = await service.getWellnessPlaylists();
      setPlaylists(wellnessPlaylists);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar playlists';
      setError(errorMessage);
      console.error('Erro ao carregar playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const connect = () => {
    if (spotifyService) {
      const authUrl = spotifyService.getAuthUrl();
      window.location.href = authUrl;
    }
  };

  const disconnect = () => {
    if (spotifyService) {
      spotifyService.disconnect();
      setIsConnected(false);
      setPlaylists([]);
    }
  };

  const getPlaylistTracks = async (playlistId: string): Promise<SpotifyTrack[]> => {
    if (!spotifyService) {
      throw new Error('Spotify não configurado');
    }
    
    return spotifyService.getPlaylistTracks(playlistId);
  };

  return {
    isConfigured: !!spotifyService,
    isConnected,
    playlists,
    loading,
    error,
    connect,
    disconnect,
    getPlaylistTracks,
    refetch: () => spotifyService && loadPlaylists(spotifyService)
  };
};