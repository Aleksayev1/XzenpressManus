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
            'yongquan-r1-kd1'
        ],
        recommendedProtocol: 'harmonia-mental'
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
            'anmian-extra'
        ],
        recommendedProtocol: 'harmonia-mental'
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
            'ynsa-ganglios-base',
            'neiguan-pc6'
        ],
        recommendedProtocol: 'harmonia-mental'
    },
    {
        id: 'anger',
        namePortuguese: 'Com Raiva/Irritado',
        nameEnglish: 'Angry/Irritated',
        emoji: '😠',
        globalPrevalence: 22,
        mtcElement: 'wood',
        mtcOrgan: 'Fígado (Liver)',
        description: 'Raiva explosiva, irritabilidade, vontade de gritar, frustração',
        primaryPoints: [
            'ren14-juque',
            'lu10-yuji',
            'ht5-tongli',
            'taichong-lv3',
            'ynsa-zf-figado'
        ],
        recommendedProtocol: 'harmonia-mental'
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
            'yongquan-r1-kd1',
            'lu10-yuji',
            'ht5-tongli',
            'laogong-pc8',
            'ynsa-zf-rim'
        ],
        recommendedProtocol: 'harmonia-mental'
    },
    {
        id: 'loneliness',
        namePortuguese: 'Sozinho/Isolado',
        nameEnglish: 'Lonely/Isolated',
        emoji: '😶',
        globalPrevalence: 10,
        mtcElement: 'multi',
        mtcOrgan: 'Coração/Baço',
        description: 'Solidão profunda, sensação de desconexão, isolamento emocional',
        primaryPoints: [
            'shenmen-c7',
            'neiguan-pc6',
            'sanyinjiao-sp6',
            'yintang-ex-hn3',
            'ynsa-ponto-d'
        ],
        recommendedProtocol: 'harmonia-mental'
    },
    {
        id: 'insomnia',
        namePortuguese: 'Insone/Cansado',
        nameEnglish: 'Insomniac/Tired',
        emoji: '😴',
        globalPrevalence: 30,
        mtcElement: 'multi',
        mtcOrgan: 'Coração/Rim',
        description: 'Dificuldade para dormir, pensamentos noturnos, fadiga constante',
        primaryPoints: [
            'anmian-extra',
            'shenmen-c7',
            'yintang-ex-hn3',
            'ynsa-ponto-d',
            'ynsa-cerebro-cerebelo'
        ],
        recommendedProtocol: 'sono-reparador'
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
