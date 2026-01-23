export interface NutrientLimit {
    id: string;
    names: string[]; // Variations (e.g., 'Vitamin D', 'Vitamina D', 'D3')
    maxDaily: number;
    unit: 'mg' | 'mcg' | 'UI' | 'g';
    source: string;
    warning: string;
}

export const NUTRIENT_LIMITS: NutrientLimit[] = [
    {
        id: 'vit_d',
        names: ['vitamina d', 'vitamina d3', 'colecalciferol', 'd3', 'vitamin d'],
        maxDaily: 4000, // 100mcg
        unit: 'UI',
        source: 'EFSA/FDA/ANVISA (UL)',
        warning: 'Doses acima de 4.000 UI/dia podem causar hipercalcemia e danos renais a longo prazo sem acompanhamento médico.'
    },
    {
        id: 'zinc',
        names: ['zinco', 'zinc', 'sulfato de zinco', 'zinco quelado'],
        maxDaily: 40,
        unit: 'mg',
        source: 'ANVISA IN 28/2018',
        warning: 'Excesso de Zinco pode inibir a absorção de Cobre e reduzir a imunidade.'
    },
    {
        id: 'vit_c',
        names: ['vitamina c', 'ácido ascórbico', 'vitamin c', 'ascorbic acid'],
        maxDaily: 2000,
        unit: 'mg',
        source: 'Food and Nutrition Board (IOM)',
        warning: 'Doses acima de 2g podem causar desconforto gastrointestinal e diarreia osmótica.'
    },
    {
        id: 'magnesium',
        names: ['magnésio', 'magnesium', 'cloreto de magnésio', 'magnésio dimalato'],
        maxDaily: 350, // Supplemental magnesium only
        unit: 'mg',
        source: 'NIH ODS (Suplementar)',
        warning: 'Limite para magnésio *suplementar* (não alimentar). Excesso causa efeito laxativo.'
    },
    {
        id: 'iron',
        names: ['ferro', 'iron', 'sulfato ferroso', 'ferro quelado'],
        maxDaily: 45,
        unit: 'mg',
        source: 'ANVISA / FDA',
        warning: 'Ferro em excesso é oxidante e perigoso. Nunca suplemente sem exame de ferritina.'
    },
    {
        id: 'vit_b6',
        names: ['vitamina b6', 'piridoxina', 'vitamin b6'],
        maxDaily: 100, // EFSA lower is 25mg, FDA is 100mg. Anvisa is 98mg.
        unit: 'mg',
        source: 'ANVISA (Máximo)',
        warning: 'Doses altas de B6 por longo prazo podem causar neuropatia sensorial (danos aos nervos).'
    },
    {
        id: 'selenium',
        names: ['selênio', 'selenium'],
        maxDaily: 400,
        unit: 'mcg',
        source: 'WHO / ANVISA',
        warning: 'Selênio tem "janela terapêutica" estreita. Excesso causa selenose (queda de cabelo, danos unhas).'
    },
    {
        id: 'calcium',
        names: ['cálcio', 'calcium', 'carbonato de cálcio'],
        maxDaily: 2000, // Age dependent, generally 2000-2500
        unit: 'mg',
        source: 'IOM / ANVISA',
        warning: 'Excesso de cálcio suplementar pode aumentar risco de cálculos renais e calcificação arterial.'
    },
    {
        id: 'vit_a',
        names: ['vitamina a', 'retinol', 'vitamin a'],
        maxDaily: 3000, // 10,000 UI
        unit: 'mcg',
        source: 'FDA (UL)',
        warning: 'Vitamina A (retinol) é acumulativa no fígado e teratogênica em excesso. Atenção total.'
    },
    {
        id: 'omega_3',
        names: ['ômega 3', 'omega 3', 'óleo de peixe', 'fish oil', 'epa', 'dha'],
        maxDaily: 5, // FDA safe up to 5g
        unit: 'g',
        source: 'FDA GRAS',
        warning: 'Doses muito altas podem alterar a coagulação sanguínea. Cuidado se usa anticoagulantes.'
    }
];

export const getNutrientLimit = (name: string): NutrientLimit | undefined => {
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const input = normalize(name);

    return NUTRIENT_LIMITS.find(n => n.names.some(validName => input.includes(normalize(validName))));
};
