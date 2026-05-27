/**
 * Banco de Dados de Suplementos - Xzenpress Nutriming AI
 * Padrão: equivalente ao herbLibrary.ts, com Ação Principal, Indicações e Categoria.
 */

export interface SupplementInfo {
    mainAction: string;
    indications: string[];
    category: 'vitamina' | 'mineral' | 'aminoacido' | 'adaptogeno' | 'omega' | 'peptideo' | 'probiotico' | 'antioxidante' | 'hormonal' | 'outro';
    warnings?: string;
}

// Chaves normalizadas (lowercase sem acento) para matching robusto
export const SUPPLEMENT_INFO_DATABASE: Record<string, SupplementInfo> = {

    // === VITAMINAS ===
    'vitamina d': {
        mainAction: 'Imunidade, saúde óssea e regulação do humor',
        indications: ['Imunidade baixa', 'Depressão sazonal', 'Osteoporose', 'Fadiga'],
        category: 'vitamina',
    },
    'vitamina d3': {
        mainAction: 'Imunidade, saúde óssea e regulação do humor',
        indications: ['Imunidade baixa', 'Depressão sazonal', 'Osteoporose', 'Fadiga'],
        category: 'vitamina',
    },
    'd3': {
        mainAction: 'Imunidade, saúde óssea e regulação do humor',
        indications: ['Imunidade baixa', 'Depressão sazonal', 'Osteoporose'],
        category: 'vitamina',
    },
    'vitamina c': {
        mainAction: 'Antioxidante potente e modulador imunológico',
        indications: ['Gripes e resfriados', 'Estresse oxidativo', 'Cicatrização', 'Fadiga'],
        category: 'vitamina',
    },
    'vitamina b12': {
        mainAction: 'Produção de energia celular e saúde neurológica',
        indications: ['Fadiga extrema', 'Formigamento', 'Memória', 'Depressão'],
        category: 'vitamina',
    },
    'b12': {
        mainAction: 'Produção de energia celular e saúde neurológica',
        indications: ['Fadiga extrema', 'Formigamento', 'Memória'],
        category: 'vitamina',
    },
    'complexo b': {
        mainAction: 'Energia, função nervosa e metabolismo celular',
        indications: ['Estresse', 'Fadiga', 'Saúde da pele', 'Memória e foco'],
        category: 'vitamina',
    },
    'vitamina k2': {
        mainAction: 'Direciona o cálcio para ossos e evita calcificação arterial',
        indications: ['Saúde cardiovascular', 'Osteoporose', 'Uso com Vitamina D3'],
        category: 'vitamina',
        warnings: 'Consulte médico se usar anticoagulantes (varfarina).',
    },
    'vitamina e': {
        mainAction: 'Proteção celular antioxidante e saúde cardiovascular',
        indications: ['Envelhecimento precoce', 'Saúde da pele', 'Inflamação crônica'],
        category: 'vitamina',
    },
    'vitamina a': {
        mainAction: 'Saúde ocular, imunidade e integridade da pele',
        indications: ['Visão noturna', 'Imunidade', 'Pele ressecada'],
        category: 'vitamina',
        warnings: 'Evitar altas doses sem orientação médica (lipossolúvel, acumula no organismo).',
    },

    // === MINERAIS ===
    'magnesio': {
        mainAction: 'Relaxamento muscular, qualidade do sono e equilíbrio do sistema nervoso',
        indications: ['Insônia', 'Cãibras', 'Ansiedade', 'Enxaqueca', 'Tensão muscular'],
        category: 'mineral',
    },
    'magnésio': {
        mainAction: 'Relaxamento muscular, qualidade do sono e equilíbrio do sistema nervoso',
        indications: ['Insônia', 'Cãibras', 'Ansiedade', 'Enxaqueca', 'Tensão muscular'],
        category: 'mineral',
    },
    'zinco': {
        mainAction: 'Imunidade, testosterona e regeneração celular',
        indications: ['Imunidade baixa', 'Queda de cabelo', 'Libido', 'Cicatrização', 'Acne'],
        category: 'mineral',
    },
    'calcio': {
        mainAction: 'Saúde óssea, contração muscular e transmissão nervosa',
        indications: ['Osteoporose', 'Cãibras', 'Saúde dos dentes', 'Menopausa'],
        category: 'mineral',
        warnings: 'Tomar separado do Ferro. Preferir Citrato de Cálcio para melhor absorção.',
    },
    'ferro': {
        mainAction: 'Prevenção e tratamento da anemia e transporte de oxigênio',
        indications: ['Anemia', 'Fadiga', 'Palidez', 'Queda de cabelo'],
        category: 'mineral',
        warnings: 'Tomar longe do Cálcio e Zinco. Pode causar constipação.',
    },
    'selenio': {
        mainAction: 'Antioxidante tireoidiano e proteção contra danos ao DNA',
        indications: ['Hipotireoidismo', 'Tireoidite de Hashimoto', 'Imunidade', 'Fertilidade'],
        category: 'mineral',
    },
    'potassio': {
        mainAction: 'Equilíbrio eletrolítico, saúde cardíaca e função muscular',
        indications: ['Câimbras', 'Pressão alta', 'Fadiga muscular'],
        category: 'mineral',
    },
    'iodo': {
        mainAction: 'Função tireoidiana e metabolismo energético',
        indications: ['Hipotireoidismo', 'Metabolismo lento', 'Fadiga'],
        category: 'mineral',
    },

    // === ÔMEGA E GORDURAS BOAS ===
    'omega-3': {
        mainAction: 'Anti-inflamatório sistêmico e saúde cardiovascular e cerebral',
        indications: ['Inflamação crônica', 'Triglicérides elevados', 'Memória', 'Depressão', 'Dor articular'],
        category: 'omega',
    },
    'omega 3': {
        mainAction: 'Anti-inflamatório sistêmico e saúde cardiovascular e cerebral',
        indications: ['Inflamação crônica', 'Triglicérides elevados', 'Memória', 'Depressão'],
        category: 'omega',
    },
    'oleo de peixe': {
        mainAction: 'Anti-inflamatório sistêmico e saúde cardiovascular e cerebral',
        indications: ['Inflamação crônica', 'Triglicérides elevados', 'Memória'],
        category: 'omega',
    },

    // === ANTIOXIDANTES ===
    'coenzima q10': {
        mainAction: 'Energia mitocondrial e proteção cardiovascular',
        indications: ['Fadiga', 'Saúde do coração', 'Anti-envelhecimento', 'Uso de estatinas'],
        category: 'antioxidante',
    },
    'coq10': {
        mainAction: 'Energia mitocondrial e proteção cardiovascular',
        indications: ['Fadiga', 'Saúde do coração', 'Anti-envelhecimento'],
        category: 'antioxidante',
    },
    'curcumina': {
        mainAction: 'Anti-inflamatório e antioxidante de amplo espectro',
        indications: ['Dor articular', 'Inflamação crônica', 'Saúde intestinal', 'Neuroprotecção'],
        category: 'antioxidante',
    },
    'curcuma': {
        mainAction: 'Anti-inflamatório e antioxidante de amplo espectro',
        indications: ['Dor articular', 'Inflamação crônica', 'Saúde intestinal'],
        category: 'antioxidante',
    },
    'resveratrol': {
        mainAction: 'Ativação de genes de longevidade (sirtuínas) e proteção cardiovascular',
        indications: ['Longevidade', 'Anti-envelhecimento', 'Saúde cardiovascular', 'Biohacking'],
        category: 'antioxidante',
    },
    'astaxantina': {
        mainAction: 'Antioxidante 6000x mais potente que a Vitamina C',
        indications: ['Saúde ocular', 'Anti-envelhecimento', 'Performance esportiva', 'Pele'],
        category: 'antioxidante',
    },
    'nac': {
        mainAction: 'Precursor da Glutationa: desintoxicação hepática e pulmonar',
        indications: ['Saúde do fígado', 'Detox', 'Ansiedade', 'Saúde respiratória'],
        category: 'antioxidante',
    },
    'n-acetilcisteina': {
        mainAction: 'Precursor da Glutationa: desintoxicação hepática e pulmonar',
        indications: ['Saúde do fígado', 'Detox', 'Ansiedade', 'Saúde respiratória'],
        category: 'antioxidante',
    },
    'glutationa': {
        mainAction: 'O maior antioxidante intracelular do corpo humano',
        indications: ['Envelhecimento', 'Saúde hepática', 'Imunidade', 'Clareza mental'],
        category: 'antioxidante',
    },

    // === AMINOÁCIDOS ===
    'l-teanina': {
        mainAction: 'Calma sem sedação: ansiolítico natural que potencializa o foco',
        indications: ['Ansiedade', 'Estresse', 'Foco', 'Qualidade do sono'],
        category: 'aminoacido',
    },
    'glicina': {
        mainAction: 'Qualidade do sono, síntese de colágeno e saúde intestinal',
        indications: ['Insônia', 'Saúde articular', 'Pele', 'Intestino permeável'],
        category: 'aminoacido',
    },
    'creatina': {
        mainAction: 'Força muscular, cognição e reserva energética celular',
        indications: ['Performance esportiva', 'Ganho muscular', 'Memória', 'Fadiga'],
        category: 'aminoacido',
    },
    'triptofano': {
        mainAction: 'Precursor da serotonina e melatonina: humor e sono',
        indications: ['Insônia', 'Depressão', 'Ansiedade', 'Compulsão alimentar'],
        category: 'aminoacido',
    },
    'tirosina': {
        mainAction: 'Precursor de dopamina e adrenalina: foco e motivação',
        indications: ['Falta de foco', 'Baixa motivação', 'Fadiga mental', 'TDAH'],
        category: 'aminoacido',
    },
    'lisina': {
        mainAction: 'Síntese de colágeno e imunidade antiviral',
        indications: ['Herpes labial', 'Imunidade', 'Saúde da pele', 'Cicatrização'],
        category: 'aminoacido',
    },

    // === ADAPTÓGENOS ===
    'ashwagandha': {
        mainAction: 'Redução do cortisol, energia vital e equilíbrio do sistema nervoso',
        indications: ['Estresse crônico', 'Ansiedade', 'Baixa libido', 'Fadiga adrenal', 'Testosterona'],
        category: 'adaptogeno',
    },
    'rhodiola': {
        mainAction: 'Resistência ao estresse físico e mental, energia e cognição',
        indications: ['Estresse', 'Fadiga', 'Foco', 'Performance cognitiva'],
        category: 'adaptogeno',
    },
    'ginseng': {
        mainAction: 'Energia, imunidade e adaptação ao estresse (Qi Tônico em MTC)',
        indications: ['Fadiga', 'Imunidade', 'Libido', 'Foco', 'Longevidade'],
        category: 'adaptogeno',
    },
    'panax ginseng': {
        mainAction: 'Energia, imunidade e adaptação ao estresse (Qi Tônico em MTC)',
        indications: ['Fadiga', 'Imunidade', 'Libido', 'Foco'],
        category: 'adaptogeno',
    },
    'reishi': {
        mainAction: 'Imunidade, sono profundo e equilíbrio espiritual (MTC: Cogumelo da Imortalidade)',
        indications: ['Imunidade', 'Insônia', 'Ansiedade', 'Longevidade', 'Saúde hepática'],
        category: 'adaptogeno',
    },
    'cordyceps': {
        mainAction: 'Energia mitocondrial, oxigenação celular e performance sexual',
        indications: ['Fadiga', 'Performance esportiva', 'Libido', 'Saúde pulmonar'],
        category: 'adaptogeno',
    },
    'lion\'s mane': {
        mainAction: 'Neurogênese, memória e proteção contra doenças neurodegenerativas',
        indications: ['Alzheimer', 'Foco', 'Memória', 'Depressão', 'Nervos periféricos'],
        category: 'adaptogeno',
    },
    'lions mane': {
        mainAction: 'Neurogênese, memória e proteção contra doenças neurodegenerativas',
        indications: ['Alzheimer', 'Foco', 'Memória', 'Depressão'],
        category: 'adaptogeno',
    },

    // === PEPTÍDEOS (BIOHACKING) ===
    'bpc-157': {
        mainAction: 'Regeneração acelerada de tecidos, tendões e mucosa intestinal',
        indications: ['Lesões musculares', 'Intestino permeável', 'Inflamação crônica', 'Cicatrização'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica. Consulte farmácia credenciada.',
    },
    'cjc-1295': {
        mainAction: 'Estimulação da produção natural de GH (Hormônio do Crescimento)',
        indications: ['Anti-envelhecimento', 'Ganho muscular', 'Queima de gordura', 'Sono profundo'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica. Consulte farmácia credenciada.',
    },
    'ipamorelin': {
        mainAction: 'Secretagogo de GH seletivo com mínimos efeitos colaterais',
        indications: ['Anti-envelhecimento', 'Composição corporal', 'Sono profundo', 'Longevidade'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica. Consulte farmácia credenciada.',
    },
    'tb-500': {
        mainAction: 'Regeneração tecidual e anti-inflamatório sistêmico',
        indications: ['Lesões crônicas', 'Inflamação', 'Recuperação pós-operatória'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica. Consulte farmácia credenciada.',
    },
    'semaglutida': {
        mainAction: 'Controle glicêmico, saciedade e perda de peso',
        indications: ['Diabetes tipo 2', 'Obesidade', 'Síndrome metabólica'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica.',
    },
    '5-amino-1mq': {
        mainAction: 'Inibição do NNMT: queima de gordura e energia mitocondrial',
        indications: ['Emagrecimento', 'Biohacking metabólico', 'Energia', 'Anti-envelhecimento'],
        category: 'peptideo',
        warnings: 'Uso exclusivamente com prescrição médica. Consulte farmácia credenciada.',
    },

    // === PROBIÓTICOS ===
    'probiotico': {
        mainAction: 'Equilíbrio da microbiota intestinal e imunidade do trato digestivo',
        indications: ['Intestino preso', 'Diarréia', 'Imunidade', 'Intolerância alimentar', 'Uso de antibióticos'],
        category: 'probiotico',
    },
    'probiótico': {
        mainAction: 'Equilíbrio da microbiota intestinal e imunidade do trato digestivo',
        indications: ['Intestino preso', 'Diarréia', 'Imunidade', 'Intolerância alimentar'],
        category: 'probiotico',
    },
    'lactobacillus': {
        mainAction: 'Reequilíbrio da flora intestinal e modulação imunológica',
        indications: ['Intestino preso', 'Imunidade', 'Infecções vaginais', 'Pós-antibiótico'],
        category: 'probiotico',
    },

    // === HORMONAL / LONGEVIDADE ===
    'melatonina': {
        mainAction: 'Regulação do ciclo circadiano e antioxidante cerebral noturno',
        indications: ['Insônia', 'Jet lag', 'Trabalho noturno', 'Longevidade'],
        category: 'hormonal',
    },
    'dhea': {
        mainAction: 'Precursor hormonal: libido, energia e anti-envelhecimento',
        indications: ['Baixa libido', 'Fadiga', 'Anti-envelhecimento', 'Menopausa'],
        category: 'hormonal',
        warnings: 'Uso exclusivamente com prescrição e acompanhamento médico.',
    },
    'nmn': {
        mainAction: 'Precursor do NAD+: energia celular e longevidade',
        indications: ['Anti-envelhecimento', 'Energia', 'Clareza mental', 'Biohacking'],
        category: 'antioxidante',
    },
    'nad+': {
        mainAction: 'Cofator essencial para energia celular e reparo do DNA',
        indications: ['Longevidade', 'Fadiga crônica', 'Neuroproteção', 'Biohacking'],
        category: 'antioxidante',
    },
    'colágeno': {
        mainAction: 'Estrutura de pele, articulações, tendões e ossos',
        indications: ['Pele flácida', 'Dor articular', 'Saúde dos cabelos e unhas', 'Permeabilidade intestinal'],
        category: 'aminoacido',
    },
    'colageno': {
        mainAction: 'Estrutura de pele, articulações, tendões e ossos',
        indications: ['Pele flácida', 'Dor articular', 'Saúde dos cabelos e unhas'],
        category: 'aminoacido',
    },

    // === OUTROS ===
    'berberina': {
        mainAction: 'Controle glicêmico, metabolismo e microbiota (similar à metformina)',
        indications: ['Diabetes', 'Resistência à insulina', 'Colesterol', 'Síndrome do ovário policístico'],
        category: 'outro',
    },
    'quercetina': {
        mainAction: 'Anti-histamínico natural e antioxidante anti-inflamatório',
        indications: ['Alergias', 'Inflamação', 'Sinusite', 'Saúde cardiovascular'],
        category: 'outro',
    },
    'ginkgo biloba': {
        mainAction: 'Circulação cerebral, memória e clareza mental',
        indications: ['Memória', 'Foco', 'Zumbido no ouvido', 'Circulação'],
        category: 'adaptogeno',
    },
};

// Mapeamento de categorias para cores e ícones (para uso no UI)
export const SUPPLEMENT_CATEGORY_STYLE: Record<SupplementInfo['category'], { color: string; bg: string; label: string }> = {
    vitamina:    { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', label: 'Vitamina' },
    mineral:     { color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200',   label: 'Mineral' },
    aminoacido:  { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     label: 'Aminoácido' },
    adaptogeno:  { color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200', label: 'Adaptógeno' },
    omega:       { color: 'text-cyan-700',   bg: 'bg-cyan-50 border-cyan-200',     label: 'Ômega/Lipídio' },
    peptideo:    { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Peptídeo' },
    probiotico:  { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   label: 'Probiótico' },
    antioxidante:{ color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'Antioxidante' },
    hormonal:    { color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200',     label: 'Hormonal' },
    outro:       { color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',     label: 'Outro' },
};

/**
 * Busca as informações de um suplemento pelo nome (tolerante a variações e acentos).
 */
export function findSupplementInfo(name: string): SupplementInfo | null {
    const normalize = (str: string) =>
        str.toLowerCase()
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '')
           .trim();

    const normalizedInput = normalize(name);

    // 1. Busca exata normalizada
    if (SUPPLEMENT_INFO_DATABASE[normalizedInput]) {
        return SUPPLEMENT_INFO_DATABASE[normalizedInput];
    }

    // 2. Busca parcial (ex: "Cloreto de Magnésio" encontra "magnésio")
    for (const [key, value] of Object.entries(SUPPLEMENT_INFO_DATABASE)) {
        const normalizedKey = normalize(key);
        if (normalizedInput.includes(normalizedKey) || normalizedKey.includes(normalizedInput)) {
            return value;
        }
    }

    return null;
}
