export interface Interaction {
    id: string;
    substances: string[]; // Names that trigger this interaction
    type: 'synergy' | 'conflict' | 'drug-interaction';
    title: string;
    description: string;
    severity: 'info' | 'moderate' | 'high';
    source?: string;
}

export const SUPPLEMENT_INTERACTIONS: Interaction[] = [
    // --- SYNERGIES (OTIMIZAÇÃO) ---
    {
        id: 'iron-vitc',
        substances: ['ferro', 'sulfato ferroso', 'vitamina c', 'ácido ascórbico'],
        type: 'synergy',
        title: 'Otimização de Absorção',
        description: 'Vitamina C aumenta a absorção do Ferro em até 3x quando tomados juntos. O ambiente ácido converte o ferro para uma forma mais absorvível.',
        severity: 'info',
        source: 'American Journal of Clinical Nutrition'
    },
    {
        id: 'vitd-k2',
        substances: ['vitamina d', 'vitamina d3', 'vitamina k2', 'menaquinona'],
        type: 'synergy',
        title: 'Proteção Arterial',
        description: 'Enquanto a Vitamina D aumenta a absorção de Cálcio, a K2 direciona esse cálcio para os ossos, evitando calcificação das artérias.',
        severity: 'moderate',
        source: 'Integrative Medicine Journal'
    },
    {
        id: 'magnesium-b6',
        substances: ['magnésio', 'cloreto de magnésio', 'vitamina b6', 'piridoxina'],
        type: 'synergy',
        title: 'Sinergia Celular',
        description: 'A Vitamina B6 facilita a entrada do Magnésio nas células, potencializando o efeito relaxante e ansiolítico.',
        severity: 'info'
    },
    {
        id: 'curcumin-piperine',
        substances: ['cúrcuma', 'curcumina', 'pimenta preta', 'piperina'],
        type: 'synergy',
        title: 'Biodisponibilidade Total',
        description: 'A Piperina (pimenta) aumenta a absorção da Curcumina em até 2000%, impedindo que o fígado a elimine rapidamente.',
        severity: 'high',
        source: 'Planta Medica'
    },

    // --- CONFLICTS (ANTAGONISMOS) ---
    {
        id: 'calcium-iron',
        substances: ['cálcio', 'leite', 'ferro', 'sulfato ferroso'],
        type: 'conflict',
        title: 'Bloqueio de Absorção',
        description: 'O Cálcio inibe significativamente a absorção de Ferro (ferro heme e não-heme). Tome com pelo menos 2h de intervalo.',
        severity: 'moderate',
        source: 'International Journal for Vitamin and Nutrition Research'
    },
    {
        id: 'zinc-copper',
        substances: ['zinco', 'cobre'],
        type: 'conflict',
        title: 'Deficiência Induzida',
        description: 'Suplementação de Zinco a longo prazo (>50mg/dia) bloqueia a absorção de Cobre, podendo causar anemia e neuropatia. Recomendação: proporção 15:1 (Zn:Cu).',
        severity: 'high',
        source: 'American Journal of Clinical Nutrition'
    },
    {
        id: 'calcium-magnesium',
        substances: ['cálcio', 'magnésio'],
        type: 'conflict',
        title: 'Competição de Absorção',
        description: 'Em doses terapêuticas altas (>250mg), Cálcio e Magnésio competem pelo mesmo canal de absorção intestinal. Ideal separar os horários.',
        severity: 'info'
    },

    // --- DRUG INTERACTIONS (SEGURANÇA CRÍTICA) ---
    {
        id: 'vitk-warfarin',
        substances: ['vitamina k', 'vitamina k1', 'vitamina k2', 'varfarina', 'marevan', 'anticoagulante'],
        type: 'drug-interaction',
        title: 'RISCO DE TROMBOSE/SANGRAMENTO',
        description: 'A Vitamina K anula o efeito de anticoagulantes como Varfarina. Risco grave de trombose ou desajuste de medicação. Fale com seu médico.',
        severity: 'high',
        source: 'FDA Warning'
    },
    {
        id: 'ginkgo-warfarin',
        substances: ['ginkgo biloba', 'ginkgo', 'varfarina', 'marevan', 'aspirina', 'aas', 'anticoagulante'],
        type: 'drug-interaction',
        title: 'RISCO DE HEMORRAGIA',
        description: 'O Ginkgo Biloba possui forte efeito antiplaquetário. Combinado com anticoagulantes ou aspirina, aumenta severamente o risco de sangramentos e hemorragias.',
        severity: 'high',
        source: 'Mayo Clinic'
    },
    {
        id: 'potassium-ace',
        substances: ['potássio', 'cloreto de potássio', 'losartana', 'enalapril', 'captopril'],
        type: 'drug-interaction',
        title: 'Risco Cardíaco (Hipercalemia)',
        description: 'Remédios para pressão (IECA/BRA) já retêm potássio. Suplementar potássio junto pode causar parada cardíaca.',
        severity: 'high',
        source: 'AHA (American Heart Association)'
    },
    {
        id: 'stjohn-antidepressant',
        substances: ['erva de são joão', 'st john\'s wort', 'fluoxetina', 'sertralina', 'escitalopram', 'anticoncepcional'],
        type: 'drug-interaction',
        title: 'Síndrome Serotoninérgica / Falha Contraceptiva',
        description: 'A Erva de São João altera o metabolismo de dezenas de medicamentos, cortando o efeito de pílulas anticoncepcionais e potencializando perigosamente antidepressivos.',
        severity: 'high',
        source: 'NIH / FDA'
    }
];

// Helper para encontrar interações na lista do usuário
export const analyzeInteractions = (userSupplements: string[]) => {
    const results: Interaction[] = [];
    const normalizedUserList = userSupplements.map(s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    SUPPLEMENT_INTERACTIONS.forEach(interaction => {
        // Verifica quantos itens da interação o usuário possui
        const matches = interaction.substances.filter(substance =>
            normalizedUserList.some(userItem => userItem.includes(substance) || substance.includes(userItem))
        );

        // Se o usuário tem 2 ou mais itens da lista de substâncias, ativa a interação
        // (Para interações droga-nutriente, o usuário teria que adicionar o remédio na lista, o que é um caso de uso possível se ele tratar como "o que tomo")
        if (matches.length >= 2) {
            results.push(interaction);
        }
    });

    return results;
};
