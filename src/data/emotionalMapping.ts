/**
 * Mapeamento Emocional Global - XZenPress
 * Baseado em: WHO 2024 + Gallup Global Emotions + MTC 5 Elementos + YNSA
 */

export interface EmotionalState {
    id: string;
    namePortuguese: string;
    nameEnglish: string;
    emoji: string;
    globalPrevalence: number; // % OMS 2024
    mtcElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'multi';
    mtcOrgan: string;
    description: string;
    primaryPoints: string[]; // IDs dos pontos principais
    recommendedProtocol?: string; // ID do protocolo recomendado
    zenFlowExerciseId?: string; // ID do exercício de Qi Gong específico
    cycle?: {
        mother: string;
        son: string;
        controller: string;
    };
}

export const emotionalStates: EmotionalState[] = [
    {
        id: 'anxiety',
        namePortuguese: 'Ansioso/Preocupado',
        nameEnglish: 'Anxious/Worried',
        emoji: '😰',
        globalPrevalence: 39,
        mtcElement: 'earth',
        mtcOrgan: 'Baço (Spleen)',
        description: 'Pensamentos acelerados, aperto no peito, preocupação constante',
        primaryPoints: [
            'yintang-ex-hn3',
            'shenmen-c7',
            'neiguan-pc6',
            'yongquan-r1-kd1',
            'ren17-danzhong', // Add: Anxiety/Chest
            'lu10-yuji'       // Add: Mental restless
        ],
        recommendedProtocol: 'harmonia-mental',
        zenFlowExerciseId: 'reg-calm', // Acalmar o Mar Interno
        cycle: {
            mother: 'fire',
            son: 'metal',
            controller: 'wood'
        }
    },
    {
        id: 'stress',
        namePortuguese: 'Estressado',
        nameEnglish: 'Stressed',
        emoji: '😣',
        globalPrevalence: 37,
        mtcElement: 'fire',
        mtcOrgan: 'Coração (Heart)',
        description: 'Tensão constante, irritabilidade, sobrecarga mental e física',
        primaryPoints: [
            'yintang-ex-hn3',
            'shenmen-c7',
            'ynsa-ponto-d',
            'anmian-extra',
            'ren17-danzhong',      // Add: Tension release
            'septicemia-hegu-li4'  // Add: General stress/pain
        ],
        recommendedProtocol: 'harmonia-mental',
        zenFlowExerciseId: 'reg-calm', // Acalmar o Fogo
        cycle: {
            mother: 'wood',
            son: 'earth',
            controller: 'water'
        }
    },
    {
        id: 'sadness',
        namePortuguese: 'Triste/Desanimado',
        nameEnglish: 'Sad/Discouraged',
        emoji: '😢',
        globalPrevalence: 26,
        mtcElement: 'metal',
        mtcOrgan: 'Pulmão (Lung)',
        description: 'Tristeza profunda, falta de motivação, sensação de peso emocional',
        primaryPoints: [
            'ht5-tongli',
            'yongquan-r1-kd1',
            'ynsa-basal-ganglia',
            'neiguan-pc6',
            'ren17-danzhong',    // Add: Anguish/Open Chest
            'baihui-basic-vg20'  // Add: Lift Spirit
        ],
        recommendedProtocol: 'harmonia-mental',
        zenFlowExerciseId: 'rel-chest', // Abrir o Coração
        cycle: {
            mother: 'earth',
            son: 'water',
            controller: 'fire'
        }
    },
    {
        id: 'anger',
        namePortuguese: 'Raiva / Irritação',
        nameEnglish: 'Anger / Irritation',
        emoji: '😡',
        globalPrevalence: 15,
        mtcElement: 'wood',
        mtcOrgan: 'Fígado',
        description: 'Frustração, pavio curto, sensação de injustiça ou explosão iminente.',
        primaryPoints: [
            'xingjian-lv2', // Add: Fire point (Effective)
            'lv3-taichong',
            'ren14-juque',
            'ynsa-zf-figado',
            'septicemia-hegu-li4' // Add: Move Qi
        ],
        recommendedProtocol: 'equilibrio-raiva',
        zenFlowExerciseId: 'rel-liver', // Grito Silencioso / Soltar a Raiva
        cycle: {
            mother: 'water', // Rim nutre Fígado
            son: 'fire',   // Fígado alimenta Coração (F2 Drena)
            controller: 'metal' // Pulmão controla Fígado
        }
    },
    {
        id: 'indecision',
        namePortuguese: 'Indecisão / Insegurança',
        nameEnglish: 'Indecision / Insecurity',
        emoji: '😕',
        globalPrevalence: 10,
        mtcElement: 'wood',
        mtcOrgan: 'Vesícula Biliar',
        description: 'Dificuldade em escolher, falta de coragem, sentir-se travado ou tímido.',
        primaryPoints: [
            'gb40-qiuxu',
            'gb34-yanglingquan',
            'ynsa-zf-vesicula',
            'baihui-basic-vg20', // Add: Mental Clarity
            'gb20-fengchi'       // Add: Clear Wind/Mind
        ],
        recommendedProtocol: 'decisao-coragem',
        zenFlowExerciseId: 'int-flow', // Fluidez / Confiança
        cycle: {
            mother: 'water', // Água dá coragem à Madeira
            son: 'fire',
            controller: 'metal'
        }
    },
    {
        id: 'fear',
        namePortuguese: 'Com Medo',
        nameEnglish: 'Fearful',
        emoji: '😨',
        globalPrevalence: 15,
        mtcElement: 'water',
        mtcOrgan: 'Rim (Kidney)',
        description: 'Medo paralisante, insegurança, pânico, pavor',
        primaryPoints: [
            'kd3-taixi', // Fonte (Terra) harmoniza
            'yongquan-r1-kd1', // Filho (Madeira) aterra
            'ynsa-zf-rim',
            'ynsa-brain-m1',
            'lu10-yuji',        // Add: Calm Spirit/Fear
            'cv4-guanyuan'      // Add: Root/Vitality
        ],
        recommendedProtocol: 'superando-medo', // ID correto do protocolo
        zenFlowExerciseId: 'reg-ground', // Raízes Profundas / Segurança
        cycle: {
            mother: 'metal', // Metal (Pulmão) gera Água -> R7
            son: 'wood',     // Água gera Madeira -> R1
            controller: 'earth' // Terra controla Água -> R3
        }
    },
    {
        id: 'loneliness',
        namePortuguese: 'Sozinho/Isolado',
        nameEnglish: 'Lonely/Isolated',
        emoji: '😶',
        globalPrevalence: 10,
        mtcElement: 'fire', // Coração sofre na solidão
        mtcOrgan: 'Coração/Baço',
        description: 'Solidão profunda, sensação de desconexão, isolamento emocional',
        primaryPoints: [
            'shenmen-c7',
            'neiguan-pc6',
            'sp6-sanyinjiao',
            'yintang-ex-hn3',
            'ren17-danzhong',   // Add: Emotional Connection
            'ynsa-ponto-d'
        ],
        recommendedProtocol: 'harmonia-mental',
        zenFlowExerciseId: 'rel-chest', // Abrir o Coração / Conexão
        cycle: {
            mother: 'wood',
            son: 'earth',
            controller: 'water'
        }
    },
    {
        id: 'insomnia',
        namePortuguese: 'Insone/Cansado',
        nameEnglish: 'Insomniac/Tired',
        emoji: '😴',
        globalPrevalence: 30,
        mtcElement: 'water', // Desarmonia Rim/Coração
        mtcOrgan: 'Coração/Rim',
        description: 'Dificuldade para dormir, pensamentos noturnos, fadiga constante',
        primaryPoints: [
            'anmian-extra',
            'shenmen-c7',
            'yintang-ex-hn3',
            'ynsa-ponto-d',
            'cerebro-cerebelo',
            'septicemia-zusanli-st36' // Add: Grounding/Stomach
        ],
        recommendedProtocol: 'sono-reparador',
        zenFlowExerciseId: 'reg-calm', // Acalmar o Mar Interno
        cycle: {
            mother: 'metal',
            son: 'wood',
            controller: 'earth'
        }
    }
];

/**
 * Busca estado emocional por ID
 */
export const getEmotionalStateById = (id: string): EmotionalState | undefined => {
    return emotionalStates.find(state => state.id === id);
};

/**
 * Retorna estados ordenados por prevalência global
 */
export const getEmotionalStatesByPrevalence = (): EmotionalState[] => {
    return [...emotionalStates].sort((a, b) => b.globalPrevalence - a.globalPrevalence);
};

/**
 * Retorna protocolo recomendado para uma emoção
 */
export const getRecommendedProtocol = (emotionId: string): string | undefined => {
    const state = getEmotionalStateById(emotionId);
    return state?.recommendedProtocol;
};

/**
 * Retorna o órgão ativo no Relógio Biológico MTC atual
 */
export const getOrganByTime = (date: Date = new Date()) => {
    const hour = date.getHours();

    if (hour >= 23 || hour < 1) return { organ: 'Vesícula Biliar', element: 'Madeira', emotion: 'Indecisão/Coragem', function: 'Hora de dormir para regenerar a energia de decisão.' };
    if (hour >= 1 && hour < 3) return { organ: 'Fígado', element: 'Madeira', emotion: 'Raiva/Planejamento', function: 'Detox profundo do sangue e emoções.' };
    if (hour >= 3 && hour < 5) return { organ: 'Pulmão', element: 'Metal', emotion: 'Tristeza/Inspiração', function: 'Distribuição do Qi e oxigenação.' };
    if (hour >= 5 && hour < 7) return { organ: 'Intestino Grosso', element: 'Metal', emotion: 'Apego/Soltar', function: 'Eliminação e "deixar ir".' };
    if (hour >= 7 && hour < 9) return { organ: 'Estômago', element: 'Terra', emotion: 'Preocupação/Nutrição', function: 'Digestão física e mental.' };
    if (hour >= 9 && hour < 11) return { organ: 'Baço-Pâncreas', element: 'Terra', emotion: 'Excesso de Pensamento', function: 'Transformação de nutrientes em energia.' };
    if (hour >= 11 && hour < 13) return { organ: 'Coração', element: 'Fogo', emotion: 'Ansiedade/Alegria', function: 'Circulação sanguínea e paz mental (Shen).' };
    if (hour >= 13 && hour < 15) return { organ: 'Intestino Delgado', element: 'Fogo', emotion: 'Clareza/Discernimento', function: 'Separação do puro do impuro.' };
    if (hour >= 15 && hour < 17) return { organ: 'Bexiga', element: 'Água', emotion: 'Medo/Zona de Conforto', function: 'Reserva de energia e eliminação líquida.' };
    if (hour >= 17 && hour < 19) return { organ: 'Rim', element: 'Água', emotion: 'Medo/Força de Vontade', function: 'Filtro essencial e vitalidade sexual.' };
    if (hour >= 19 && hour < 21) return { organ: 'Pericárdio', element: 'Fogo', emotion: 'Proteção Emocional', function: 'Proteção do coração e circulação.' };
    if (hour >= 21 && hour < 23) return { organ: 'Triplo Aquecedor', element: 'Fogo', emotion: 'Equilíbrio Geral', function: 'Regulação térmica e metabólica.' };

    return { organ: 'Desconhecido', element: 'N/A', emotion: 'Neutro', function: 'Equilíbrio' };
};
