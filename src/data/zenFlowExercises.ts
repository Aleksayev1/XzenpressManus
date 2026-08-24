// ZenFlow - Farmácia de Movimentos
// Estrutura Mínima Viável (MVP): 9 Sequências Mestras
// Foco: Regulação, Liberação, Integração

export interface ZenFlowStep {
    id: string;
    name: string;
    durationSeconds: number; // Ex: 60s
    videoUrl?: string; // Placeholder para futuro
    instruction: string; // O comando de voz escrito
    lottieAnimation?: string; // Para guia visual se não houver vídeo
}

export interface ZenFlowSequence {
    id: string;
    type: 'regulation' | 'release' | 'integration';
    title: string;
    subtitle: string;
    durationTotal: string; // Ex: "6 min"
    targetEmotion?: string[]; // Tags para IA cruzar (Raiva, Medo, etc)
    steps: ZenFlowStep[];
    intention: string; // A frase-chave da Tela 6
    spotifyEmbedUrl?: string; // Link embed do Spotify "direcionado"
}

export const zenFlowExercises: ZenFlowSequence[] = [
    // --- NÍVEL 1: REGULAÇÃO (Acalmar / Centrar / Acordar) ---
    {
        id: 'reg-calm',
        type: 'regulation',
        title: 'Acalmar o Mar Interno',
        subtitle: 'Para ansiedade aguda e mente agitada',
        durationTotal: '5 min',
        targetEmotion: ['ansiedade', 'stress', 'insônia', 'fogo'],
        intention: 'Eu permito que meu corpo encontre o silêncio.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO', // Peaceful Piano (Calm/Fire)
        steps: [
            {
                id: 'shake',
                name: 'Sacudir a Poeira (Shaking)',
                durationSeconds: 60,
                instruction: 'Em pé ou sentado, comece a sacudir suavemente as mãos e ombros. Solte o maxilar. Deixe a vibração soltar a armadura muscular.'
            },
            {
                id: 'breath-descend',
                name: 'Descida do Qi',
                durationSeconds: 120,
                instruction: 'Inspire elevando as mãos até o peito. Expire empurrando as palmas para baixo, como se prensasse uma nuvem até o umbigo. Sinta a energia descer da cabeça para o centro.'
            },
            {
                id: 'face-smooth',
                name: 'Alisamento da Testa',
                durationSeconds: 60,
                instruction: 'Com os dedos médios, alise do centro da testa para as têmporas. Como se abrisse uma cortina mental. Desfaça a ruga da preocupação.'
            }
        ]
    },
    {
        id: 'reg-ground',
        type: 'regulation',
        title: 'Raízes Profundas',
        subtitle: 'Para dispersão, medo e falta de foco',
        durationTotal: '6 min',
        targetEmotion: ['medo', 'insegurança', 'água', 'terra'],
        intention: 'Estou seguro e sustentado pela terra.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWoMTcAERtU', // Nature Sounds for Meditation (Grounding/Water/Earth)
        steps: [
            {
                id: 'stomp',
                name: 'Acordar os Pés',
                durationSeconds: 60,
                instruction: 'Bata suavemente os calcanhares no chão. Sinta a vibração subir pelas pernas. Acorde sua base.'
            },
            {
                id: 'tree-stand',
                name: 'Abraçar a Árvore',
                durationSeconds: 180,
                instruction: 'Pés firmes. Joelhos micro-flexionados. Braços arredondados na altura do peito. Respire imaginando que raízes saem dos seus pés.'
            }
        ]
    },
    {
        id: 'reg-earth-center',
        type: 'regulation',
        title: 'O Centro Estável',
        subtitle: 'Para ruminação mental, preocupação e digestão lenta',
        durationTotal: '4 min',
        targetEmotion: ['preocupação', 'compulsão', 'ruminação', 'terra', 'baço', 'anxiety'],
        intention: 'Estou centrado, equilibrado e em paz com o presente.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u', // Peaceful Piano - calming & centering (Earth/Regulation)
        steps: [
            {
                id: 'belly-rub',
                name: 'Massagem do Dan Tien',
                durationSeconds: 60,
                instruction: 'Pouse as mãos sobre o abdômen e faça massagens circulares suaves no sentido horário para estimular a digestão física e mental.'
            },
            {
                id: 'heaven-earth',
                name: 'Conectar Céu e Terra',
                durationSeconds: 120,
                instruction: 'Estique uma das mãos para o céu e a outra para o chão, alternando os lados lentamente com a respiração. Sinta o alongamento das laterais do corpo.'
            },
            {
                id: 'square-breath',
                name: 'Respiração Quadrada',
                durationSeconds: 60,
                instruction: 'Inspire por 4 segundos, segure cheio por 4, expire por 4 e segure vazio por 4. Repita para centrar seus pensamentos.'
            }
        ]
    },
    {
        id: 'reg-water-vitality',
        type: 'regulation',
        title: 'A Fonte da Vitalidade',
        subtitle: 'Para esgotamento físico, cansaço mental e medo',
        durationTotal: '4 min',
        targetEmotion: ['medo', 'insegurança', 'fadiga', 'rim', 'água', 'lack_of_purpose'],
        intention: 'Minha energia vital é profunda e inesgotável.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ',
        steps: [
            {
                id: 'kidney-warm',
                name: 'Aquecer os Rins',
                durationSeconds: 60,
                instruction: 'Friccione rapidamente as palmas das mãos uma na outra até gerar calor. Em seguida, pouse as mãos aquecidas sobre a região lombar.'
            },
            {
                id: 'spine-wave',
                name: 'Ondulação da Coluna',
                durationSeconds: 120,
                instruction: 'Mova o corpo em movimentos de ondas suaves, começando nos joelhos, passando pela pelve e subindo pela coluna até a cabeça. Respire fluído.'
            },
            {
                id: 'kidney-breath',
                name: 'Respiração nos Rins',
                durationSeconds: 60,
                instruction: 'Respire direcionando o ar para a parte baixa das costas. Sinta a lombar expandir na inspiração e relaxar na expiração.'
            }
        ]
    },

    // --- NÍVEL 2: LIBERAÇÃO (Fígado / Peito / Pélvis) ---
    {
        id: 'rel-liver',
        type: 'release',
        title: 'O Grito Silencioso',
        subtitle: 'Para raiva, frustração e estagnação',
        durationTotal: '4 min',
        targetEmotion: ['raiva', 'frustração', 'madeira', 'fígado'],
        intention: 'Eu solto o que não preciso carregar.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWoMTcAERtU', // Global Groove/Drums (Active/Wood)
        steps: [
            {
                id: 'fists',
                name: 'Cerrar e Soltar',
                durationSeconds: 60,
                instruction: 'Inspire profundamente fechando os punhos com força total. Segure... Expire soltando as mãos de uma vez, como se jogasse algo fora.'
            },
            {
                id: 'lion-face',
                name: 'A Oração do Leão (Simhasana)',
                durationSeconds: 90,
                instruction: 'Inspire. Na expiração, abra a boca grande, coloque a língua para fora e arregale os olhos. Libere a tensão da garganta e do rosto.'
            },
            {
                id: 'twist',
                name: 'Torção Axial',
                durationSeconds: 90,
                instruction: 'Gire o tronco de um lado para o outro, deixando os braços baterem soltos nos rins. Olhe para trás a cada giro.'
            }
        ]
    },
    {
        id: 'rel-wood-bamboo',
        type: 'release',
        title: 'Flutuar como Bambu',
        subtitle: 'Para rigidez física, irritabilidade e estresse acumulado',
        durationTotal: '4 min',
        targetEmotion: ['raiva', 'frustração', 'mágoa', 'madeira', 'fígado', 'resentment'],
        intention: 'Eu me flexibilizo diante dos ventos da vida.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ',
        steps: [
            {
                id: 'bamboo-sway',
                name: 'O Bambu ao Vento',
                durationSeconds: 120,
                instruction: 'Fique em pé com os braços soltos. Gire o corpo suavemente deixando os braços baterem nas laterais do quadril e costas, flexibilizando a coluna.'
            },
            {
                id: 'meridian-stretch',
                name: 'Alongamento de Vesícula',
                durationSeconds: 120,
                instruction: 'Entrelace as mãos e incline o tronco lateralmente para um lado, mantendo a postura por 3 respirações, e depois mude para o outro lado.'
            }
        ]
    },
    {
        id: 'rel-chest',
        type: 'release',
        title: 'Abrir o Coração',
        subtitle: 'Para tristeza, luto e aperto no peito',
        durationTotal: '5 min',
        targetEmotion: ['tristeza', 'angústia', 'metal', 'pulmão'],
        intention: 'Meu coração tem espaço para respirar.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO', // Peaceful Piano (Metal/Air)
        steps: [
            {
                id: 'open-wings',
                name: 'Asas da Garça',
                durationSeconds: 120,
                instruction: 'Inspire abrindo os braços e o peito, olhando levemente para cima. Expire arredondando as costas e abraçando-se. Repita fluindo.'
            },
            {
                id: 'tap-thymus',
                name: 'Tamborilar do Timo',
                durationSeconds: 60,
                instruction: 'Com a ponta dos dedos, dê batidinhas leves no centro do peito (esterno). Ative sua imunidade emocional.'
            }
        ]
    },
    {
        id: 'rel-metal-breath',
        type: 'release',
        title: 'O Sopro da Liberação',
        subtitle: 'Para tristeza profunda, apego e cansaço respiratório',
        durationTotal: '3 min',
        targetEmotion: ['tristeza', 'angústia', 'luto', 'metal', 'pulmão', 'guilt'],
        intention: 'Eu me liberto do passado e me abro para o novo.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO',
        steps: [
            {
                id: 'push-palms',
                name: 'Empurrar as Montanhas',
                durationSeconds: 120,
                instruction: 'Inspire trazendo as mãos ao peito. Expire empurrando as palmas para as laterais, como se afastasse paredes, soltando toda a tristeza.'
            },
            {
                id: 'clavicle-tap',
                name: 'Tamborilar da Clavícula',
                durationSeconds: 60,
                instruction: 'Use a ponta dos dedos para dar batidinhas leves na região abaixo das clavículas, liberando o acúmulo de estresse respiratório.'
            }
        ]
    },

    // --- NÍVEL 3: INTEGRAÇÃO (Confiança / Presença / Fluidez) ---
    {
        id: 'int-flow',
        type: 'integration',
        title: 'Fluxo de Água',
        subtitle: 'Para rigidez e necessidade de controle',
        durationTotal: '5 min',
        targetEmotion: ['controle', 'rigidez', 'madeira', 'terra'],
        intention: 'Eu fluo com a vida, sem resistir.',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ', // Focus Flow (Water/Harmony)
        steps: [
            {
                id: 'water-hands',
                name: 'Mãos de Água',
                durationSeconds: 180,
                instruction: 'Mova as mãos no ar como se acariciasse a superfície de um lago. Movimentos lentos, contínuos, sem início nem fim.'
            },
            {
                id: 'rub-belly',
                name: 'Nutrir o Centro',
                durationSeconds: 60,
                instruction: 'Pouse as mãos sobre o umbigo. Sinta o calor. Sorria para seus órgãos internos.'
            }
        ]
    }
];

// Serviço Inteligente de Seleção
export const getZenFlowByEmotion = (emotion: string): ZenFlowSequence => {
    const normalize = (s: string) => s.toLowerCase().trim();
    const search = normalize(emotion);

    // 1. Tentar match exato nas tags
    const match = zenFlowExercises.find(seq =>
        seq.targetEmotion?.some(tag => search.includes(normalize(tag)))
    );

    if (match) return match;

    // 2. Fallback inteligente
    // Se for algo 'quente' (raiva, ansiedade) -> Acalmar
    if (['raiva', 'stress', 'fogo', 'calor'].some(k => search.includes(k))) return zenFlowExercises.find(s => s.id === 'reg-calm')!;

    // Se for algo 'frio' (tristeza, medo) -> Raízes (Grounding)
    if (['tristeza', 'medo', 'frio', 'depressão'].some(k => search.includes(k))) return zenFlowExercises.find(s => s.id === 'reg-ground')!;

    // Default: Regulação básica
    return zenFlowExercises[0];
};
