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
    },
    {
        id: 'semaglutida',
        name: 'Semaglutida / Tirzepatida',
        scientificName: 'Agonistas de GLP-1 / GIP',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Regulação Metabólica e Emagrecimento',
        description: 'Um dos peptídeos mais famosos do mundo (Ozempic/Wegovy). Imita o hormônio da saciedade, reduzindo drasticamente o apetite, retardando o esvaziamento gástrico e revertendo a resistência à insulina.',
        indications: ['Obesidade e sobrepeso', 'Diabetes Tipo 2', 'Compulsão alimentar', 'Síndrome Metabólica'],
        contraindications: ['Histórico de carcinoma medular de tireoide', 'Pancreatite', 'Gestantes']
    },
    {
        id: 'pt-141',
        name: 'PT-141 (Bremelanotide)',
        scientificName: 'Peptídeo Melanocortínico',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo / Nasal)',
        mainAction: 'Tratamento de Disfunção Sexual e Libido',
        description: 'Ao contrário do Viagra (que atua nos vasos sanguíneos), o PT-141 atua diretamente no sistema nervoso central para aumentar severamente a libido e a excitação, tanto em homens quanto em mulheres.',
        indications: ['Disfunção erétil refratária', 'Transtorno de desejo sexual hipoativo (TDSH)', 'Anorgasmia'],
        contraindications: ['Hipertensão não controlada (pode causar pico de pressão no uso)']
    },
    {
        id: 'selank',
        name: 'Selank',
        scientificName: 'Heptapeptídeo Nootrópico',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Nasal)',
        mainAction: 'Ansiolítico e Modulação de Humor',
        description: 'Desenvolvido na Rússia, atua nas vias de serotonina e dopamina para "desligar" a ansiedade quase instantaneamente, sem causar sono, dependência ou sedação. Excelente nootrópico para foco calmo.',
        indications: ['Ansiedade generalizada (TAG)', 'Estresse agudo', 'Dificuldade de concentração por estresse', 'Transtorno do pânico'],
        contraindications: ['Uso associado a excesso de antidepressivos IMAO']
    },
    {
        id: 'semax',
        name: 'Semax',
        scientificName: 'Análogo de ACTH',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Nasal)',
        mainAction: 'Foco Extremo e Neuroproteção',
        description: 'Poderoso nootrópico russo. Aumenta os níveis de BDNF (Fator Neurotrófico Derivado do Cérebro) no hipocampo de forma brutal, promovendo memória fotográfica, foco laser e recuperação pós-AVC.',
        indications: ['Déficit de atenção (TDAH)', 'Névoa mental (Brain fog)', 'Recuperação de danos neurológicos / AVC', 'Fadiga mental extrema'],
        contraindications: ['Hiperatividade severa aguda', 'Episódios de mania']
    },
    {
        id: 'mots-c',
        name: 'MOTS-c',
        scientificName: 'Peptídeo Derivado Mitocondrial',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Saúde Mitocondrial e Desempenho Físico',
        description: 'Um peptídeo exclusivo que atua diretamente nas mitocôndrias. Ele imita os efeitos de exercícios intensos, promovendo oxidação de ácidos graxos, prevenindo osteoporose e gerando energia celular massiva.',
        indications: ['Fadiga crônica', 'Resistência à insulina no músculo', 'Baixo rendimento esportivo', 'Obesidade induzida por dieta'],
        contraindications: ['Uso sem suporte de hidratação e minerais adequados']
    },
    {
        id: 'll-37',
        name: 'LL-37',
        scientificName: 'Catelicidina',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Imunidade e Ação Antimicrobiana',
        description: 'O único peptídeo antimicrobiano da família das catelicidinas no corpo humano. Atua como um "antibiótico natural" de amplo espectro, perfurando as membranas de bactérias, vírus, fungos e até biofilmes.',
        indications: ['Doenças autoimunes', 'Doença de Lyme crônica', 'Infecções fúngicas ou bacterianas resistentes', 'SIBO grave'],
        contraindications: ['Doenças autoimunes em fase de explosão inflamatória (flare-up) severa']
    },
    {
        id: 'tesamorelin',
        name: 'Tesamorelin',
        scientificName: 'Análogo de GHRH',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Redução de Gordura Visceral',
        description: 'Um secretagogo de GH tão potente que é o único peptídeo aprovado pela FDA (EUA) especificamente para derreter a gordura visceral (aquela perigosa ao redor dos órgãos) e melhorar marcadores de colesterol.',
        indications: ['Gordura visceral excessiva', 'Lipodistrofia', 'Recuperação de níveis ótimos de GH', 'Síndrome Metabólica'],
        contraindications: ['Câncer ativo', 'Gestação', 'Hipersensibilidade']
    },
    {
        id: 'dihexa',
        name: 'Dihexa',
        scientificName: 'PNB-0408',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Oral / Tópico / Subcutâneo)',
        mainAction: 'Neurogênese Extrema (Criação de Sinapses)',
        description: 'Criado pela Universidade de Washington para o tratamento do Alzheimer. É considerado até 10 milhões de vezes mais forte que o BDNF nativo na criação de novas conexões neurais (sinapses). O "cálice sagrado" da cognição.',
        indications: ['Declínio cognitivo', 'Doença de Alzheimer / Parkinson (pesquisa)', 'Danos cerebrais traumáticos', 'Aprimoramento cognitivo extremo'],
        contraindications: ['Histórico de tumores cerebrais (devido ao seu altíssimo fator de crescimento neuronal)']
    }
];
