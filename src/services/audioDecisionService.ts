/**
 * Audio Decision Service - Diamond Standard
 * 
 * REGRA-MÃE:
 * Sessões terapêuticas guiadas completas são exclusivas do XZenPress Premium.
 * Usuários não-Premium acessam playlists curadas como apoio.
 * 
 * SESSION_MAP é o contrato entre UX, Player e Estratégia
 * 
 * APROVADO: 10/10 (Arquitetura, B2C, B2B, Estratégia)
 */

import { User } from '../contexts/AuthContext';

// ============================================
// TYPE DEFINITIONS - Contrato do Produto
// ============================================

export type SessionCategory = 'sleep' | 'stress' | 'focus' | 'meditation' | 'healing';

export type SessionConfig = {
    id: string;
    title: string;
    description: string;
    category: SessionCategory;
    durationMinutes: number;

    premium: {
        audioUrl: string | null;
        loop: boolean;
    };

    free: {
        spotifyPlaylistUrl: string;
    };
};

// ============================================
// SESSION MAP - 9 Sessões World-Class
// ============================================

export const SESSION_MAP: Record<string, SessionConfig> = {
    // ==================== SLEEP ====================

    'ocean-waves': {
        id: 'ocean-waves',
        title: 'Ondas do Oceano',
        description: 'Som contínuo de ondas para indução e manutenção do sono profundo.',
        category: 'sleep',
        durationMinutes: 30,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8'
        }
    },

    'gentle-rain': {
        id: 'gentle-rain',
        title: 'Chuva Suave',
        description: 'Ruído natural constante para relaxamento profundo e sono contínuo.',
        category: 'sleep',
        durationMinutes: 45,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWTC99MCpbjP8'
        }
    },

    'fireplace-ambience': {
        id: 'fireplace-ambience',
        title: 'Lareira Aconchegante',
        description: 'Som hipnótico de lareira para repouso profundo e relaxamento térmico.',
        category: 'sleep',
        durationMinutes: 60,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp'
        }
    },

    // ==================== STRESS ====================

    'sistema-nervoso-reset': {
        id: 'sistema-nervoso-reset',
        title: 'Reset do Sistema Nervoso',
        description: 'Respiração 4-7-8 guiada para ativação parassimpática e redução do cortisol.',
        category: 'stress',
        durationMinutes: 12,
        premium: {
            audioUrl: null,
            loop: false
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO'
        }
    },

    'craniopuntura-ansiedade': {
        id: 'craniopuntura-ansiedade',
        title: 'Craniopuntura para Ansiedade',
        description: 'Prática guiada Yamamoto para redução de ansiedade clínica e tensão muscular.',
        category: 'stress',
        durationMinutes: 15,
        premium: {
            audioUrl: null,
            loop: false
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWoMTcAERtU'
        }
    },

    // ==================== FOCUS ====================

    'binaural-focus-40hz': {
        id: 'binaural-focus-40hz',
        title: 'Foco Binaural 40Hz',
        description: 'Frequência gamma para concentração sustentada e performance cognitiva elevada.',
        category: 'focus',
        durationMinutes: 30,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX7EF893kO26A'
        }
    },

    'foco-corporativo': {
        id: 'foco-corporativo',
        title: 'Foco Corporativo Profundo',
        description: 'Ambiente sonoro otimizado para trabalho de alta demanda cognitiva e fluxo contínuo.',
        category: 'focus',
        durationMinutes: 25,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO'
        }
    },

    // ==================== MEDITATION ====================

    'tigelas-tibetanas': {
        id: 'tigelas-tibetanas',
        title: 'Tigelas Tibetanas',
        description: 'Frequências harmônicas para limpeza energética e meditação profunda.',
        category: 'meditation',
        durationMinutes: 35,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8'
        }
    },

    'meditacao-mindfulness': {
        id: 'meditacao-mindfulness',
        title: 'Meditação Mindfulness Guiada',
        description: 'Jornada de atenção plena para redução de ansiedade e clareza mental.',
        category: 'meditation',
        durationMinutes: 20,
        premium: {
            audioUrl: null,
            loop: false
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u'
        }
    },

    // ==================== HEALING ====================

    'neuropatia-174hz': {
        id: 'neuropatia-174hz',
        title: 'Alívio da Dor (174 Hz)',
        description: 'Frequência anestésica natural (174 Hz) com regulação vagal respiratória para alívio de dor neuropática.',
        category: 'healing',
        durationMinutes: 20,
        premium: {
            audioUrl: null,
            loop: true
        },
        free: {
            spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u'
        }
    }
};

// ============================================
// DECISION ENGINE - Função Única
// ============================================

export interface AudioDecisionResult {
    type: 'internal' | 'spotify';
    url: string;
    loop: boolean;
    showUpgradeHint: boolean;
}

/**
 * FUNÇÃO CENTRAL - Único ponto de decisão
 */
export function startGuidedMeditation(
    user: User | null,
    sessionId: string
): AudioDecisionResult {

    const session = SESSION_MAP[sessionId];

    if (!session) {
        throw new Error(`Session "${sessionId}" not found in SESSION_MAP`);
    }

    const isPremium = user?.isPremium || false;

    // DECISÃO
    if (isPremium && session.premium.audioUrl) {
        return {
            type: 'internal',
            url: session.premium.audioUrl,
            loop: session.premium.loop,
            showUpgradeHint: false
        };
    } else {
        const shouldShowHint = !isPremium && session.category === 'meditation';

        return {
            type: 'spotify',
            url: session.free.spotifyPlaylistUrl,
            loop: false,
            showUpgradeHint: shouldShowHint
        };
    }
}

// ============================================
// HELPERS & UTILITIES
// ============================================

export function getUpgradeMessage(): string {
    return 'Sessões guiadas completas estão disponíveis no XZenPress Premium.';
}

export function getSessionConfig(sessionId: string): SessionConfig | undefined {
    return SESSION_MAP[sessionId];
}

export function getAllSessions(): SessionConfig[] {
    return Object.values(SESSION_MAP);
}

export function getSessionsByCategory(category: SessionCategory): SessionConfig[] {
    return Object.values(SESSION_MAP).filter(s => s.category === category);
}

// ============================================
// VALIDATION - Para testes e CI/CD
// ============================================

export function validateSessionMap(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validCategories: SessionCategory[] = ['stress', 'focus', 'sleep', 'meditation', 'healing'];

    for (const [id, config] of Object.entries(SESSION_MAP)) {
        if (config.id !== id) {
            errors.push(`Session "${id}" has mismatched ID: ${config.id}`);
        }

        if (!config.title || !config.description) {
            errors.push(`Session "${id}" missing title or description`);
        }

        if (!validCategories.includes(config.category)) {
            errors.push(`Session "${id}" has invalid category: "${config.category}"`);
        }

        if (config.durationMinutes <= 0) {
            errors.push(`Session "${id}" has invalid duration: ${config.durationMinutes}`);
        }

        if (config.premium.audioUrl === undefined) {
            errors.push(`Session "${id}" uses undefined for audioUrl - use null explicitly`);
        }

        if (!config.free.spotifyPlaylistUrl) {
            errors.push(`Session "${id}" missing Spotify fallback URL`);
        }

        if (config.free.spotifyPlaylistUrl.includes('[') || config.free.spotifyPlaylistUrl.includes('](')) {
            errors.push(`Session "${id}" has markdown in Spotify URL - use clean URL only`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
