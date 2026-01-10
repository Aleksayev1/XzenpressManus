export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
  external_urls: {
    spotify: string;
  };
}

export class SpotifyService {
  private config: SpotifyConfig;
  private accessToken: string | null = null;

  constructor(config: SpotifyConfig) {
    this.config = config;
  }

  // Verificar se Spotify está configurado
  static isConfigured(): boolean {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const isConfigured = !!(clientId && clientId !== 'seu_spotify_client_id' && clientId.length > 10);
    
    console.log('🎵 Spotify Status:', isConfigured ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO');
    if (!isConfigured) {
      console.log('📋 Para ativar Spotify:');
      console.log('1. Acesse: https://developer.spotify.com/dashboard');
      console.log('2. Crie um app ou use existente');
      console.log('3. Copie o Client ID');
      console.log('4. Adicione no Netlify: VITE_SPOTIFY_CLIENT_ID=seu_client_id');
    }
    
    return isConfigured;
  }

  // Obter URL de autorização
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'token',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Extrair token da URL de callback
  extractTokenFromUrl(): string | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    
    if (token) {
      this.accessToken = token;
      localStorage.setItem('spotify_access_token', token);
      
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return token;
  }

  // Carregar token salvo
  loadSavedToken(): boolean {
    const saved = localStorage.getItem('spotify_access_token');
    if (saved) {
      this.accessToken = saved;
      return true;
    }
    return false;
  }

  // Buscar playlists de bem-estar
  async getWellnessPlaylists(): Promise<SpotifyPlaylist[]> {
    if (!this.accessToken) {
      throw new Error('Token de acesso não disponível');
    }

    try {
      // Buscar playlists específicas de bem-estar
      const searchQueries = [
        'meditation relaxation',
        'sleep sounds nature',
        'breathing exercises',
        'mindfulness ambient'
      ];

      const playlists: SpotifyPlaylist[] = [];

      for (const query of searchQueries) {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          playlists.push(...data.playlists.items);
        }
      }

      return playlists.slice(0, 10); // Limitar a 10 playlists
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
      throw error;
    }
  }

  // Buscar tracks de uma playlist
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    if (!this.accessToken) {
      throw new Error('Token de acesso não disponível');
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar tracks da playlist');
      }

      const data = await response.json();
      return data.items.map((item: any) => item.track);
    } catch (error) {
      console.error('Erro ao buscar tracks:', error);
      throw error;
    }
  }

  // Desconectar Spotify
  disconnect(): void {
    this.accessToken = null;
    localStorage.removeItem('spotify_access_token');
  }
}

// Factory para criar serviço Spotify
export function createSpotifyService(): SpotifyService | null {
  if (!SpotifyService.isConfigured()) {
    console.log('⚠️ Spotify não configurado');
    return null;
  }

  const config: SpotifyConfig = {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirectUri: window.location.origin + '/spotify-callback',
    scopes: [
      'playlist-read-public',
      'playlist-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ]
  };

  return new SpotifyService(config);
}