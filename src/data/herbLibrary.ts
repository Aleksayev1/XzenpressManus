export interface Herb {
    id: string;
    name: string;
    scientificName: string;
    origin: 'Brasil' | 'China (MTC)' | 'Peptídeo (Sintético/Bio-idêntico)';
    partUsed: string;
    mainAction: string;
    description: string;
    // MTC specific
    flavor?: string[];
    nature?: 'Fria' | 'Fresca' | 'Neutra' | 'Morna' | 'Quente';
    tropism?: string[];
    // Clinical
    indications: string[];
    contraindications: string[];
}

export const HERB_DATABASE: Herb[] = [
    // --- FITOTERAPIA BRASILEIRA (RENISUS / POPULAR) ---
    {
        id: 'espinheira-santa',
        name: 'Espinheira-Santa',
        scientificName: 'Maytenus ilicifolia',
        origin: 'Brasil',
        partUsed: 'Folhas',
        mainAction: 'Gastrite e Úlcera (Protetor Gástrico)',
        description: 'Poderosa planta nativa brasileira reconhecida cientificamente por sua eficácia no tratamento de gastrites, úlceras gástricas e problemas digestivos em geral.',
        indications: ['Gastrite', 'Úlcera péptica', 'Má digestão', 'Azia'],
        contraindications: ['Gestantes (até 3º mês)', 'Lactantes']
    },
    {
        id: 'guaco',
        name: 'Guaco',
        scientificName: 'Mikania glomerata',
        origin: 'Brasil',
        partUsed: 'Folhas',
        mainAction: 'Expectorante e Broncodilatador',
        description: 'O xarope mais famoso do Brasil. Possui forte ação broncodilatadora e expectorante, sendo amplamente utilizado em problemas respiratórios.',
        indications: ['Bronquite', 'Asma', 'Tosse', 'Gripe'],
        contraindications: ['Uso prolongado', 'Pacientes com doenças hepáticas severas']
    },
    {
        id: 'boldo-brasil',
        name: 'Boldo Brasileiro',
        scientificName: 'Plectranthus barbatus',
        origin: 'Brasil',
        partUsed: 'Folhas',
        mainAction: 'Hepatoprotetor e Digestivo',
        description: 'Clássico remédio caseiro para o fígado. Estimula a produção de bile e facilita a digestão, especialmente após refeições pesadas.',
        indications: ['Má digestão', 'Ressaca', 'Gordura no fígado', 'Azia'],
        contraindications: ['Gestantes', 'Obstrução de vias biliares']
    },
    {
        id: 'aroeira',
        name: 'Aroeira',
        scientificName: 'Schinus terebinthifolius',
        origin: 'Brasil',
        partUsed: 'Casca e Folhas',
        mainAction: 'Cicatrizante e Anti-inflamatório',
        description: 'Planta adstringente e altamente cicatrizante. Muito usada em banhos de assento e tratamentos ginecológicos, além de cicatrização de feridas.',
        indications: ['Feridas', 'Inflamações ginecológicas', 'Candidíase', 'Gengivite'],
        contraindications: ['Pessoas sensíveis (pode causar dermatite de contato)']
    },
    {
        id: 'barbatimao',
        name: 'Barbatimão',
        scientificName: 'Stryphnodendron adstringens',
        origin: 'Brasil',
        partUsed: 'Casca do tronco',
        mainAction: 'Adstringente e Cicatrizante Forte',
        description: 'Conhecida popularmente como a "árvore que aperta", é um dos mais fortes cicatrizantes do cerrado brasileiro.',
        indications: ['Feridas profundas', 'Hemorragias', 'Corrimento vaginal'],
        contraindications: ['Uso interno prolongado', 'Gestantes (abortivo)']
    },
    {
        id: 'marapuama',
        name: 'Marapuama',
        scientificName: 'Ptychopetalum olacoides',
        origin: 'Brasil',
        partUsed: 'Raízes e Cascas',
        mainAction: 'Estimulante Físico e Mental',
        description: 'Conhecida como o Viagra da Amazônia, melhora a circulação sanguínea, combate a fadiga física e atua como tônico nervoso.',
        indications: ['Fadiga física', 'Cansaço mental', 'Baixa libido', 'Estresse crônico'],
        contraindications: ['Hipertensão severa não controlada', 'Insônia aguda']
    },

    // --- MEDICINA TRADICIONAL CHINESA (MTC) ---
    {
        id: 'dang-gui',
        name: 'Dang Gui',
        scientificName: 'Angelica sinensis',
        origin: 'China (MTC)',
        partUsed: 'Raiz',
        mainAction: 'Tonificar e Mover o Sangue (Xue)',
        description: 'A "Ginseng Feminina". Fundamental na MTC para tonificar o sangue, regular a menstruação e aliviar dores.',
        flavor: ['Doce', 'Picante', 'Amargo'],
        nature: 'Morna',
        tropism: ['Fígado', 'Coração', 'Baço'],
        indications: ['Deficiência de Sangue', 'Dismenorreia', 'Anemia', 'Palpitações'],
        contraindications: ['Diarreia crônica por deficiência do Baço', 'Gestação (usar com cautela)']
    },
    {
        id: 'huang-qi',
        name: 'Huang Qi (Astragalus)',
        scientificName: 'Astragalus membranaceus',
        origin: 'China (MTC)',
        partUsed: 'Raiz',
        mainAction: 'Tonificar o Qi (Energia Vital)',
        description: 'Uma das ervas mais poderosas para fortalecer a energia (Qi) e o sistema imunológico, além de levantar órgãos prolapsados.',
        flavor: ['Doce'],
        nature: 'Morna',
        tropism: ['Pulmão', 'Baço'],
        indications: ['Fadiga', 'Imunidade baixa', 'Prolapso de órgãos', 'Transpiração espontânea'],
        contraindications: ['Fases agudas de resfriados', 'Excesso de calor']
    },
    {
        id: 'gan-cao',
        name: 'Gan Cao (Alcaçuz Chinês)',
        scientificName: 'Glycyrrhiza uralensis',
        origin: 'China (MTC)',
        partUsed: 'Raiz e Rizoma',
        mainAction: 'Harmonizar outras ervas',
        description: 'Conhecido como o "pacificador", é incluído em quase todas as fórmulas chinesas para harmonizar os ingredientes e proteger o estômago.',
        flavor: ['Doce'],
        nature: 'Neutra',
        tropism: ['Coração', 'Pulmão', 'Baço', 'Estômago'],
        indications: ['Espasmos', 'Dores agudas', 'Tosse', 'Falta de ar'],
        contraindications: ['Retenção de líquidos', 'Hipertensão arterial grave']
    },
    {
        id: 'bai-shao',
        name: 'Bai Shao (Peônia Branca)',
        scientificName: 'Paeonia lactiflora',
        origin: 'China (MTC)',
        partUsed: 'Raiz s/ casca',
        mainAction: 'Nutrir o Sangue e Suavizar o Fígado',
        description: 'Excelente para nutrir o sangue do Fígado, aliviando espasmos, cólicas e acalmando a irritabilidade e tensão excessiva.',
        flavor: ['Amargo', 'Ácido'],
        nature: 'Fresca',
        tropism: ['Fígado', 'Baço'],
        indications: ['Cólicas menstruais', 'Cãibras musculares', 'Dor de cabeça tensional'],
        contraindications: ['Frio no estômago', 'Diarreia por frio']
    },
    {
        id: 'ren-shen',
        name: 'Ren Shen (Panax Ginseng)',
        scientificName: 'Panax ginseng',
        origin: 'China (MTC)',
        partUsed: 'Raiz',
        mainAction: 'Tonificar fortemente o Qi Original',
        description: 'O rei das ervas tônico. Restaura a vitalidade profundamente esgotada, fortalece o Baço e o Pulmão e acalma o espírito.',
        flavor: ['Doce', 'Levemente Amargo'],
        nature: 'Morna',
        tropism: ['Baço', 'Pulmão', 'Coração'],
        indications: ['Fadiga extrema', 'Respiração curta', 'Palpitações', 'Impotência'],
        contraindications: ['Febre alta', 'Sinais de calor excessivo (hipertensão não controlada)']
    },

    // --- PEPTÍDEOS (BIOHACKING & LONGEVIDADE) ---
    {
        id: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound)',
        scientificName: 'Pentadecapeptídeo Gástrico',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Oral / Subcutâneo)',
        mainAction: 'Cura Acelerada de Tecidos e Intestino',
        description: 'Um peptídeo derivado do suco gástrico humano. Conhecido por acelerar incrivelmente a cura de tendões, ligamentos, músculos e reparar a barreira intestinal (Leaky Gut).',
        indications: ['Lesões articulares e tendíneas', 'Síndrome do Intestino Irritável', 'Úlceras', 'Inflamação sistêmica'],
        contraindications: ['Histórico de câncer (estimula angiogênese - formação de novos vasos)']
    },
    {
        id: 'tb-500',
        name: 'TB-500 (Thymosin Beta-4)',
        scientificName: 'Timosina Beta-4',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Regeneração Muscular e Flexibilidade',
        description: 'Proteína presente em todas as células animais. Atua sinergicamente com o BPC-157, focando principalmente na recuperação de fibras musculares, aumento de flexibilidade e redução de espasmos.',
        indications: ['Lesões musculares graves', 'Recuperação pós-treino extrema', 'Cãibras crônicas', 'Queda de cabelo'],
        contraindications: ['Histórico de câncer (devido à proliferação celular)']
    },
    {
        id: 'epitalon',
        name: 'Epitalon (Epithalon)',
        scientificName: 'Tetrapeptídeo Pineal',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Longevidade e Alongamento de Telômeros',
        description: 'Considerado a "Fonte da Juventude" russa. Estimula a glândula pineal a produzir melatonina naturalmente e tem a capacidade comprovada de reativar a telomerase, alongando os telômeros (revertendo o envelhecimento celular).',
        indications: ['Antienvelhecimento', 'Regulação avançada do ciclo circadiano', 'Prevenção de doenças senis'],
        contraindications: ['Uso contínuo (deve ser ciclado, ex: 10-20 dias por ano)']
    },
    {
        id: 'ghk-cu',
        name: 'GHK-Cu (Peptídeo de Cobre)',
        scientificName: 'Glicil-L-histidil-L-lisina',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Tópico / Subcutâneo)',
        mainAction: 'Rejuvenescimento da Pele e Cicatrização',
        description: 'Peptídeo natural que se liga ao cobre. Conhecido na dermatologia por reduzir rugas, manchas, inflamações e estimular o crescimento capilar ao reativar células-tronco do folículo.',
        indications: ['Rugas e flacidez', 'Alopecia (Queda de cabelo)', 'Cicatrizes profundas', 'Danos UV'],
        contraindications: ['Excesso (pode causar toxicidade por acúmulo de cobre se não houver pausas)']
    },
    {
        id: 'cjc-1295-ipamorelin',
        name: 'CJC-1295 / Ipamorelin',
        scientificName: 'Secretagogos de GH',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Estímulo do Hormônio do Crescimento (GH)',
        description: 'Blend sinérgico que estimula a hipófise a produzir seu próprio GH de forma natural e pulsátil, evitando os colaterais do GH sintético. Melhora sono, queima de gordura e recuperação.',
        indications: ['Deficiência de GH', 'Composição corporal (perda de gordura)', 'Insônia grave', 'Recuperação lenta'],
        contraindications: ['Câncer ativo', 'Resistência severa à insulina', 'Uso sem jejum prévio (corta o efeito)']
    }
];
