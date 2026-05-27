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
    },

    // --- FITOTERAPIA BRASILEIRA (EXPANSÃO) ---
    {
        id: 'curcuma',
        name: 'Cúrcuma (Açafrão-da-terra)',
        scientificName: 'Curcuma longa',
        origin: 'Brasil',
        partUsed: 'Rizoma (raiz)',
        mainAction: 'Anti-inflamatório e Antioxidante Sistêmico',
        description: 'Considerada o anti-inflamatório natural mais estudado do mundo. A curcumina (seu princípio ativo) inibe a mesma via inflamatória (NF-kB) que os anti-inflamatórios químicos, sem os efeitos colaterais. Amplamente cultivada no Brasil.',
        indications: ['Artrite e artrose', 'Doenças inflamatórias intestinais', 'Prevenção de Alzheimer', 'Síndrome Metabólica', 'Câncer (adjuvante)'],
        contraindications: ['Cálculos biliares (estimula contração da vesícula)', 'Uso em altas doses com anticoagulantes']
    },
    {
        id: 'erva-de-sao-joao',
        name: 'Erva-de-São-João (Hypericum)',
        scientificName: 'Hypericum perforatum',
        origin: 'Brasil',
        partUsed: 'Parte aérea florida',
        mainAction: 'Antidepressivo Natural e Ansiolítico',
        description: 'Um dos fitoterápicos mais pesquisados do mundo. Possui eficácia comprovada em estudos clínicos para depressão leve a moderada, comparável a antidepressivos sintéticos. Atua inibindo a recaptação de serotonina, dopamina e norepinefrina.',
        indications: ['Depressão leve a moderada', 'Ansiedade', 'Distúrbios do sono', 'TPM'],
        contraindications: ['Interação grave com antidepressivos ISRS (risco de Síndrome Serotoninérgica)', 'Fotossensibilidade (evitar sol após uso)', 'Anticoagulantes e pílula anticoncepcional (reduz eficácia)']
    },
    {
        id: 'valeriana',
        name: 'Valeriana',
        scientificName: 'Valeriana officinalis',
        origin: 'Brasil',
        partUsed: 'Raízes e Rizoma',
        mainAction: 'Sedativo Natural e Regulador do Sono',
        description: 'O sedativo vegetal mais utilizado no mundo ocidental. Atua nos receptores GABA (os mesmos dos benzodiazepínicos) sem criar dependência química. Amplamente cultivada no Sul do Brasil.',
        indications: ['Insônia', 'Ansiedade generalizada', 'Espasmos musculares', 'Cólicas intestinais'],
        contraindications: ['Crianças menores de 3 anos', 'Uso concomitante com sedativos/álcool (potencializa efeito)']
    },
    {
        id: 'calendula',
        name: 'Calêndula',
        scientificName: 'Calendula officinalis',
        origin: 'Brasil',
        partUsed: 'Flores',
        mainAction: 'Cicatrizante, Anti-inflamatório e Antifúngico Tópico',
        description: 'A rainha das flores medicinais para uso externo. Possui flavonoides que promovem cicatrização, reduzem inflamação e combatem fungos. Usada em pomadas, cremes e cosméticos naturais de grau farmacêutico em todo o mundo.',
        indications: ['Dermatite', 'Queimaduras leves', 'Eczema', 'Candidíase cutânea', 'Cicatrizes'],
        contraindications: ['Alergia a plantas da família Asteraceae']
    },
    {
        id: 'copaiba',
        name: 'Copaíba',
        scientificName: 'Copaifera langsdorffii',
        origin: 'Brasil',
        partUsed: 'Óleo-resina do tronco',
        mainAction: 'Anti-inflamatório Amazônico de Alta Potência',
        description: 'O "óleo sagrado" da Amazônia. O beta-cariofileno presente na copaíba é um canabinóide vegetal que se liga aos receptores CB2 (sistema endocanabinóide), gerando potente ação anti-inflamatória sem efeito psicoativo.',
        indications: ['Dores musculares e articulares', 'Inflamações de pele e mucosas', 'Sinusite', 'Infecções urinárias'],
        contraindications: ['Gestantes (abortivo em doses altas)', 'Doenças renais (uso interno prolongado)']
    },
    {
        id: 'pau-darco',
        name: 'Pau-d\'Arco (Ipê-Roxo)',
        scientificName: 'Tabebuia impetiginosa',
        origin: 'Brasil',
        partUsed: 'Casca interna',
        mainAction: 'Antifúngico, Antibacteriano e Imunomodulador',
        description: 'Árvore sagrada dos índios Incas. A lapachona e o lapachol (princípios ativos) possuem comprovada ação antifúngica (inclusive contra Candida), antibacteriana e são estudados como agentes anticancerígenos.',
        indications: ['Candidíase sistêmica', 'Infecções bacterianas', 'Leucemia (pesquisa)', 'Artrite reumatoide'],
        contraindications: ['Gestantes', 'Uso de anticoagulantes', 'Doses altas podem ser hepatotóxicas']
    },
    {
        id: 'jatoba',
        name: 'Jatobá',
        scientificName: 'Hymenaea courbaril',
        origin: 'Brasil',
        partUsed: 'Casca, resina e fruto',
        mainAction: 'Energizante Natural e Antifúngico Pulmonar',
        description: 'Conhecida como a "Árvore da Energia" do Cerrado. Possui ação antifúngica comprovada, especialmente no trato respiratório, além de ser um potente revigorante físico usado por indígenas antes de longas caçadas.',
        indications: ['Bronquite fúngica', 'Anemia', 'Fadiga física profunda', 'Infecções respiratórias de repetição'],
        contraindications: ['Gastrite severa (a resina pode irritar o estômago em jejum)']
    },
    {
        id: 'garra-do-diabo',
        name: 'Garra-do-Diabo',
        scientificName: 'Harpagophytum procumbens',
        origin: 'Brasil',
        partUsed: 'Raiz secundária',
        mainAction: 'Analgésico Natural e Anti-inflamatório Articular',
        description: 'Um dos analgésicos naturais mais potentes conhecidos pela fitoterapia. Inibe as enzimas COX-1 e COX-2 (as mesmas da Aspirina e Ibuprofeno) sem agressão gástrica, sendo especialmente eficaz para dores lombares e articulares crônicas.',
        indications: ['Lombalgia crônica', 'Osteoartrite', 'Tendinite', 'Gota'],
        contraindications: ['Úlcera péptica ativa', 'Cálculos biliares', 'Gestantes']
    },
    {
        id: 'passiflora',
        name: 'Maracujá (Passiflora)',
        scientificName: 'Passiflora incarnata',
        origin: 'Brasil',
        partUsed: 'Folhas e flores',
        mainAction: 'Ansiolítico e Hipnótico (Indutor do Sono)',
        description: 'O ansiolítico vegetal brasileiro por excelência. Amplamente estudado e reconhecido pela Anvisa. Atua nos receptores GABA-A, promovendo relaxamento profundo e sono reparador sem efeito de dependência ou ressaca matinal.',
        indications: ['Ansiedade', 'Insônia leve a moderada', 'Palpitações por nervosismo', 'Síndrome do intestino irritável por estresse'],
        contraindications: ['Gestantes', 'Uso concomitante com sedativos potentes']
    },

    // --- PEPTÍDEOS & MOLÉCULAS DE BIOHACKING (EXPANSÃO) ---
    {
        id: 'nad-plus',
        name: 'NAD+ (Nicotinamida Adenina Dinucleotídeo)',
        scientificName: 'NAD+ / NMN / NR',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (IV / Subcutâneo / Oral - NMN/NR)',
        mainAction: 'Longevidade Celular e Energia Mitocondrial',
        description: 'A molécula mais estudada na ciência da longevidade atualmente. Ativa as sirtuínas (proteínas da longevidade) e os genes PARP (reparo do DNA). Seus precursores (NMN e NR) são as formas orais mais populares no mundo do biohacking.',
        indications: ['Envelhecimento acelerado', 'Fadiga crônica', 'Prevenção de doenças neurodegenerativas', 'Recuperação de dependência química'],
        contraindications: ['Câncer ativo (as sirtuínas podem proteger células tumorais também)']
    },
    {
        id: 'akg',
        name: 'AKG (Alfa-Cetoglutarato de Cálcio)',
        scientificName: 'Calcium Alpha-Ketoglutarate',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Oral)',
        mainAction: 'Reversão do Envelhecimento Biológico e Metilação do DNA',
        description: 'Um metabólito do Ciclo de Krebs que, em estudo clínico da Universidade da Califórnia, reduziu a idade biológica média de participantes em 8 anos em apenas 7 meses. Regula a metilação do DNA (epigenética) e inibe o mTOR (o acelerador do envelhecimento).',
        indications: ['Antienvelhecimento epigenético', 'Sarcopenia (perda muscular)', 'Longevidade', 'Performance esportiva'],
        contraindications: ['Gestantes', 'Uso com cautela em doença renal crônica avançada']
    },
    {
        id: '5-amino-1mq',
        name: '5-Amino-1MQ',
        scientificName: '5-Amino-1-Methylquinolinium',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Oral)',
        mainAction: 'Queima de Gordura e Regeneração de Células-Tronco',
        description: 'Inibe a enzima NNMT (que "guarda" gordura em células adormecidas), forçando as células adiposas a se tornarem metabolicamente ativas novamente. Considerado um dos mais potentes lipolíticos (queimadores de gordura) sem efeito estimulante.',
        indications: ['Obesidade resistente a dieta', 'Gordura localizada resistente', 'Regeneração de células musculares', 'Metabolismo lento'],
        contraindications: ['Pesquisa ainda em fase inicial para uso humano — cautela máxima']
    },
    {
        id: 'humanin',
        name: 'Humanin',
        scientificName: 'Mitocondrial Peptide Humanin',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Proteção Neuronal e Resistência à Insulina',
        description: 'Um peptídeo produzido nas mitocôndrias com uma capacidade protetora neuronal extraordinária. Níveis mais altos de Humanin estão correlacionados com maior longevidade em estudos com centenários. Protege neurônios contra o beta-amilóide do Alzheimer.',
        indications: ['Prevenção de Alzheimer', 'Resistência à insulina cerebral', 'Longevidade', 'Infertilidade masculina (melhora qualidade do esperma)'],
        contraindications: ['Dados clínicos em humanos ainda limitados — uso experimental']
    },
    {
        id: 'ss-31',
        name: 'SS-31 (Elamipretide)',
        scientificName: 'D-Arg-Dmt-Lys-Phe-NH2',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo / IV)',
        mainAction: 'Reparo Mitocondrial e Antienvelhescimento Cardíaco',
        description: 'Peptídeo de última geração que penetra diretamente na membrana interna da mitocôndria e se liga à cardiolipina, restaurando a produção de ATP em células envelhecidas. Considerado um dos maiores avanços em medicina regenerativa mitocondrial.',
        indications: ['Insuficiência cardíaca', 'Doenças mitocondriais raras', 'Longevidade de alta performance', 'Envelhecimento muscular acelerado'],
        contraindications: ['Uso experimental — sem dados robustos de segurança de longo prazo em humanos']
    },
    {
        id: 'aod-9604',
        name: 'AOD-9604',
        scientificName: 'Fragmento 176-191 do GH',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Lipólise (Queima de Gordura) Seletiva e Regeneração Cartilaginosa',
        description: 'Fragmento isolado da extremidade do GH (hormônio do crescimento) responsável exclusivamente pelo efeito lipolítico. Queima gordura localizada sem os efeitos colaterais do GH completo (sem retenção, sem resistência à insulina). Aprovado como alimento seguro pela FDA.',
        indications: ['Gordura abdominal resistente', 'Osteoartrite (regeneração de cartilagem)', 'Emagrecimento sem perda de massa muscular'],
        contraindications: ['Câncer ativo', 'Gestantes']
    },
    {
        id: 'pinealon',
        name: 'Pinealon',
        scientificName: 'Tripeptídeo Glu-Asp-Arg',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Oral / Nasal)',
        mainAction: 'Regulação da Glândula Pineal e Neuroproteção',
        description: 'Peptídeo biorregulatório desenvolvido na Rússia para otimizar a função da glândula pineal. Demonstrou capacidade de restaurar o ritmo circadiano em idosos, melhorar a produção de melatonina e proteger neurônios contra hipóxia (falta de oxigênio).',
        indications: ['Distúrbios graves do ciclo circadiano', 'Declínio cognitivo por envelhecimento', 'Recuperação pós-AVC', 'Jet lag severo e crônico'],
        contraindications: ['Gestantes', 'Crianças (glândula pineal ainda em formação)']
    },
    {
        id: 'foxo4-dri',
        name: 'FOXO4-DRI (Peptídeo Senolítico)',
        scientificName: 'FOXO4-p53 Disrupting Peptide',
        origin: 'Peptídeo (Sintético/Bio-idêntico)',
        partUsed: 'Laboratorial (Subcutâneo)',
        mainAction: 'Eliminação de Células Senescentes (Rejuvenescimento Celular)',
        description: 'Um dos peptídeos mais revolucionários da medicina da longevidade. Mata seletivamente apenas as "células zumbi" (células senescentes) — aquelas que param de funcionar mas se recusam a morrer e liberam toxinas inflamatórias. Em estudos com camundongos, restaurou pelos e capacidade física em animais velhos.',
        indications: ['Antienvelhecimento avançado', 'Doenças inflamatórias crônicas', 'Fibrose tecidual', 'Longevidade extrema'],
        contraindications: ['Pesquisa ainda em fase pré-clínica/inicial em humanos — uso experimental de alto nível']
    }
];
