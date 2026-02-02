import { Protocol } from '../types';

export const protocols: Protocol[] = [
    // --- MENTE & EMOÇÃO ---
    {
        id: 'harmonia-mental',
        title: 'Harmonia Mental',
        subtitle: 'Ansiedade & Pânico',
        description: 'Um protocolo de emergência e manutenção para momentos de crise, aperto no peito e pensamentos acelerados. Resgate seu eixo.',
        iconName: 'Brain',
        colorTheme: 'purple',
        isPremium: true,
        breathingOptimization: '💡 Dica: Potencialize este protocolo praticando a Respiração Guiada 4-7-8 (disponível na página inicial) antes ou durante a acupressão. A combinação respiração + pontos YNSA amplia significativamente os resultados.',
        benefits: ['Reduz ansiedade imediata', 'Alivia aperto no peito', 'Acalma pensamentos'],
        soundtrack: {
            genre: 'alpha-waves',
            description: 'Frequência 432Hz (Coerência Cardíaca). Reduz cortisol em até 23%.',
            spotifyUrl: 'https://open.spotify.com/search/432hz%20anxiety%20relief'
        },
        nutrition: {
            avoid: ['Cafeína (Café/Refrigerante)', 'Açúcar Refinado', 'Álcool'],
            recommend: ['Magnésio (Espinafre/Sementes)', 'Omega-3 (Nozes/Chia)', 'Chás Calmantes (Mel)'],
            tip: 'O intestino produz 90% da serotonina. Evite inflamação.'
        },
        steps: [
            { pointId: 'yintang-ex-hn3', durationSeconds: 60, customInstructions: 'Foque na sua respiração.' },
            { pointId: 'neiguan-pc6', durationSeconds: 120, customInstructions: 'Pressione bilateralmente (punho esquerdo depois direito).' },
            { pointId: 'ynsa-ponto-e', durationSeconds: 120, customInstructions: 'Sinta o tórax expandir a cada respiração.' },
            { pointId: 'shenmen-c7', durationSeconds: 60, customInstructions: 'Finalize convidando a calma para o coração.' }
        ]
    },
    {
        id: 'sono-reparador',
        title: 'Sono Reparador',
        subtitle: 'Insônia & Agitação',
        description: 'Desligue o "interruptor" da mente. Uma sequência projetada para induzir ondas cerebrais lentas e preparar o corpo para o descanso profundo.',
        iconName: 'Moon',
        colorTheme: 'blue',
        isPremium: true,
        breathingOptimization: '💡 Dica: Pratique a Respiração Guiada 4-7-8 (página inicial) 10 minutos antes de dormir. A técnica induz ondas cerebrais lentas (Theta) que, combinadas com a acupressão, potencializam o sono profundo e reparador.',
        benefits: ['Induz sono profundo', 'Desacelera a mente', 'Relaxamento físico'],
        soundtrack: {
            genre: 'delta-waves',
            description: 'Ondas Delta (0.5-4Hz). A frequência do sono profundo regenerativo e cura física.',
            spotifyUrl: 'https://open.spotify.com/search/delta%20waves%20sleep%20meditation'
        },
        nutrition: {
            avoid: ['Queijos Curados (Tiramina)', 'Pimenta/Condimentos', 'Telas (Luz Azul)'],
            recommend: ['Triptofano (Banana/Aveia)', 'Kiwi (2 un. antes de dormir)', 'Chá de Mulungu'],
            tip: 'Jante cedo. O processo digestivo compete com o sono reparador.'
        },
        steps: [
            { pointId: 'anmian-extra', durationSeconds: 180, customInstructions: 'Massageie atrás da orelha circularmente.' },
            { pointId: 'yintang-ex-hn3', durationSeconds: 60, customInstructions: 'Suavemente, como um carinho.' },
            { pointId: 'shenmen-c7', durationSeconds: 60, customInstructions: 'Acalme o espírito.' },
            { pointId: 'ynsa-zf-rim', durationSeconds: 120, customInstructions: 'Regula adrenalina e medo (causa da insônia).' }
        ]
    },
    {
        id: 'foco-total',
        title: 'Foco Total',
        subtitle: 'Cansaço & Memória',
        isPremium: true,
        breathingOptimization: '💡 Dica: Antes de sessões intensas de estudo ou trabalho, pratique 3 ciclos da Respiração 4-7-8 para oxigenar o cérebro e aumentar a clareza mental. Combine com este protocolo para foco máximo.',
        description: 'Elimine o "nevoeiro mental" (brain fog). Ideal para estudos, trabalho intenso ou quando se sente disperso.',
        iconName: 'Zap',
        colorTheme: 'orange',
        benefits: ['Clareza mental', 'Aumenta concentração', 'Energia vital'],
        soundtrack: {
            genre: 'gamma-waves',
            description: 'Ondas Gamma (40Hz). O "Estado de Fluxo" para alta performance cognitiva e memória.',
            spotifyUrl: 'https://open.spotify.com/search/gamma%20waves%20focus%2040hz'
        },
        nutrition: {
            avoid: ['Frituras (Gordura Trans)', 'Farinha Branca (Pico Glicêmico)', 'Adoçantes Artificiais'],
            recommend: ['Ovos (Colina/Acetilcolina)', 'Mirtilos/Frutas Vermelhas', 'Chocolate Amargo 70%'],
            tip: 'O cérebro é 60% gordura. Hidrate-se para condução elétrica.'
        },
        steps: [
            { pointId: 'ynsa-cerebrum', durationSeconds: 120, customInstructions: 'Estimule diretamente o córtex para clareza.' },
            { pointId: 'baihui-basic-vg20', durationSeconds: 60, customInstructions: 'Eleve sua energia Yang.' },
            { pointId: 'zusanli-st36', durationSeconds: 120, customInstructions: 'Fortaleça a base energética do corpo (Terra).' },
            { pointId: 'ynsa-zf-baco', durationSeconds: 120, customInstructions: 'YNSA Baço/Pâncreas (8): O centro do intelecto e da memória (Yi). Nutre o sangue e o foco. Combine com Rim (1) para melhor resultado.' }
        ]
    },

    // --- ESTRUTURA & DOR ---
    {
        id: 'coluna-livre',
        title: 'Coluna Livre',
        subtitle: 'Lombar & Ciático',
        isPremium: true,
        breathingOptimization: '💡 Dica: A Respiração 4-7-8 relaxa a musculatura paravertebral e reduz tensão nas costas. Pratique antes da acupressão para potencializar o alívio da dor.',
        description: 'Alívio para dores nas costas e travamentos. Foca na desinflamação local e na liberação do nervo ciático.',
        iconName: 'Move',
        colorTheme: 'red',
        benefits: ['Alívio dor lombar', 'Descompressão ciática', 'Mobilidade'],
        soundtrack: {
            genre: 'frequency-174hz',
            description: 'Frequência 174Hz. Conhecida como "Anéstésico Natural" e "Segurança dos Órgãos".',
            spotifyUrl: 'https://open.spotify.com/search/174hz%20solfeggio%20pain'
        },
        nutrition: {
            avoid: ['Açúcar (Inflamação)', 'Gordura Trans (Processados)', 'Álcool (Neurotóxico)'],
            recommend: ['Cúrcuma + Pimenta Preta (Absorção 2000%)', 'Gengibre (Analgesico Natural)', 'Ômega-3 (Peixes/Linhaça)'],
            tip: 'Suplementação Global: Magnésio (relaxamento muscular) e Vitamina B12 (saúde do nervo ciático).'
        },
        steps: [
            { pointId: 'ynsa-ponto-d', durationSeconds: 180, customInstructions: 'Massageie o ponto próximo à orelha (estará sensível quando pressionado).' },
            { pointId: 'ynsa-ponto-f', durationSeconds: 180, customInstructions: 'Ponto chave do Ciático. Pressione os pontos locais antes e depois da orelha (procure o ponto sensível).' },
            { pointId: 'huantiao-vb30', durationSeconds: 180, customInstructions: 'O "Desbloqueador de Ciático". Pressione profundamente no glúteo (use uma bola de tênis se preferir).' },
            { pointId: 'weizhong-b40', durationSeconds: 120, customInstructions: 'Ponto Mestre da Coluna. Pressione o centro da dobra atrás do joelho.' }
        ]
    },
    {
        id: 'cabeca-leve',
        title: 'Cabeça Leve',
        subtitle: 'Enxaqueca & Cefaleia',
        isPremium: true,
        breathingOptimization: '💡 Dica: Cefaleias tensionais respondem muito bem à combinação Respiração 4-7-8 + acupressão. Pratique 5 minutos antes dos pontos para relaxar a musculatura da nuca.',
        description: 'Dissolva a pressão na cabeça e nos olhos. Útil tando para dor tensional quanto pulsante.',
        iconName: 'Smile',
        colorTheme: 'teal',
        benefits: ['Alívio da dor de cabeça', 'Relaxamento ocular', 'Reduz tensão nuca'],
        soundtrack: {
            genre: 'frequency-174hz',
            description: 'Frequência 174Hz. Alívio natural para dores de cabeça e cefaleias tensionais.',
            spotifyUrl: 'https://open.spotify.com/search/174hz%20migraine%20relief'
        },
        steps: [
            { pointId: 'ynsa-ponto-a', durationSeconds: 120, customInstructions: 'Ponto chave da cervical e cabeça.' },
            { pointId: 'septicemia-hegu-li4', durationSeconds: 120, customInstructions: 'O grande analgésico natural.' },
            { pointId: 'taiyang-extra', durationSeconds: 120, customInstructions: 'Nas têmporas, alivie a pressão lateral.' }
        ]
    },
    {
        id: 'ombros-soltos',
        title: 'Ombros Soltos',
        subtitle: 'Pescoço & Trapézio',
        isPremium: true,
        breathingOptimization: '💡 Dica: Stress acumula tensão nos ombros. A 4-7-8 ativa o parassimplático e "desliga" o trapézio. Pratique durante a acupressão para soltar o "peso do mundo".',
        description: 'Tire o "peso do mundo" das costas. Focado em soltar a rigidez do pescoço e ombros causada pelo stress.',
        iconName: 'UserCheck',
        colorTheme: 'green',
        benefits: ['Relaxa trapézio', 'Solta o pescoço', 'Postura leve'],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz. Conhecida como "Frequência Milagrosa" para reparação e relaxamento profundo.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20muscle%20relaxation'
        },
        steps: [
            { pointId: 'ynsa-ponto-a', durationSeconds: 90, customInstructions: 'Trata a coluna cervical.' },
            { pointId: 'ynsa-ponto-b', durationSeconds: 120, customInstructions: 'Específico para o ombro e escápula.' },
            { pointId: 'septicemia-hegu-li4', durationSeconds: 60, customInstructions: 'Libera tensão superior.' },
            { pointId: 'jianjing-gb21', durationSeconds: 120, customInstructions: 'Pressione o topo do ombro (cuidado se grávida).' }
        ]
    },
    {
        id: 'maos-ageis',
        title: 'Mãos Ágeis',
        subtitle: 'Braços & Punhos',
        isPremium: true,
        breathingOptimization: '💡 Dica: LER/DORT são agravadas por tensão. A respiração 4-7-8 reduz cortisol e inflamação. Combine com este protocolo para alívio máximo.',
        description: 'Para quem trabalha digitando ou com esforço manual. Alivia tendinites, dores no punho e cotovelo.',
        iconName: 'Hand',
        colorTheme: 'blue',
        benefits: ['Alivia LER/DORT', 'Desinflama tendões', 'Fortalece punhos'],
        soundtrack: {
            genre: 'frequency-174hz',
            description: 'Frequência 174Hz. Reduz a dor e inflamação nos membros superiores.',
            spotifyUrl: 'https://open.spotify.com/search/174hz%20inflammation%20relief'
        },
        steps: [
            { pointId: 'ynsa-ponto-c', durationSeconds: 180, customInstructions: 'Ponto mestre do membro superior.' },
            { pointId: 'quchi-li11', durationSeconds: 120, customInstructions: 'Cotovelo: desinflama o braço inteiro.' },
            { pointId: 'neiguan-pc6', durationSeconds: 60, customInstructions: 'Libera o túnel do carpo.' }
        ]
    },
    {
        id: 'alivio-atm',
        title: 'Alívio ATM',
        subtitle: 'Mandíbula & Bruxismo',
        isPremium: true,
        breathingOptimization: '💡 Dica: Bruxismo é tensão inconsciente. A 4-7-8 antes de dormir reduz ativação do masseter em até 40%. Essencial para este protocolo!',
        description: 'Libere a tensão acumulada na mandíbula. Ideal para quem sofre de bruxismo, dores na face e travamento articular.',
        iconName: 'Activity',
        colorTheme: 'orange',
        benefits: ['Relaxa mandíbula', 'Alivia dor facial', 'Melhora abertura bucal'],
        soundtrack: {
            genre: 'frequency-174hz',
            description: 'Frequência 174Hz. O anestésico natural para relaxamento dos músculos masseter e temporal.',
            spotifyUrl: 'https://open.spotify.com/search/174hz%20tmj%20relief'
        },
        steps: [
            { pointId: 'atm-xiaguan-st7', durationSeconds: 120, customInstructions: 'Abra e feche a boca suavemente enquanto pressiona.' },
            { pointId: 'atm-ermen-sj21', durationSeconds: 90, customInstructions: 'Pressione no portal da orelha.' },
            { pointId: 'ynsa-cranial-5', durationSeconds: 180, customInstructions: 'YNSA Cranial V (Trigêmeo): Ponto Mestre para toda dor e sensibilidade da face e ATM.' },
            { pointId: 'ynsa-sensorial-boca-a', durationSeconds: 120, customInstructions: 'YNSA Sensorial Boca: Relaxe especificamente a área da boca e mandíbula.' },
            { pointId: 'ynsa-cranial-10', durationSeconds: 120, customInstructions: 'YNSA Cranial X (Vago): Para acalmar o sistema nervoso e reduzir o componente emocional da dor (bruxismo tensional).' },
            { pointId: 'ynsa-cranial-1', durationSeconds: 120, customInstructions: 'YNSA Cranial I (Olfatório/Rim): Base de vitalidade para suportar o tratamento.' }
        ]
    },

    // --- VITALIDADE & SAÚDE ---
    {
        id: 'respirar-bem',
        title: 'Respirar Bem',
        subtitle: 'Imunidade & Vias Aéreas',
        isPremium: true,
        breathingOptimization: '💡 Dica: A Respiração 4-7-8 é ESSENCIAL para este protocolo! Expande a capacidade pulmonar, oxigena os tecidos e fortalece o sistema imunológico. Pratique diariamente junto com os pontos.',
        description: 'Fortaleça seu escudo protetor. Para rinites, gripes iniciais e fortalecimento pulmonar.',
        iconName: 'Shield',
        colorTheme: 'green',
        benefits: ['Abre vias aéreas', 'Fortalece imunidade', 'Alivia tosse'],
        steps: [
            { pointId: 'ynsa-zf-pulmao', durationSeconds: 120, customInstructions: 'Ativa a energia do Pulmão.' },
            { pointId: 'taiyuan-lu9', durationSeconds: 90, customInstructions: 'Fortalece o sistema respiratório.' },
            { pointId: 'septicemia-hegu-li4', durationSeconds: 90, customInstructions: 'Comanda a imunidade da face e garganta.' },
            { pointId: 'zhourong-sp20', durationSeconds: 120, customInstructions: 'Expande a capacidade pulmonar e alivia tosse.' }
        ]
    },
    {
        id: 'digestao-plena',
        title: 'Digestão Plena',
        subtitle: 'Estômago & Intestino',
        isPremium: true,
        breathingOptimization: '💡 Dica: O sistema digestivo responde ao parassimplático. Pratique 4-7-8 antes das refeições e combine com este protocolo para digestão otimizada.',
        description: 'Sinta-se leve após as refeições. Combate inchaço, azia e "peso" estomacal.',
        iconName: 'Coffee',
        colorTheme: 'orange',
        benefits: ['Melhora digestão', 'Reduz inchaço', 'Alivia gastrite'],
        steps: [
            { pointId: 'zusanli-st36', durationSeconds: 180, customInstructions: 'O grande harmonizador da digestão.' },
            { pointId: 'neiguan-pc6', durationSeconds: 90, customInstructions: 'Acalma o estômago e náuseas.' },
            { pointId: 'ynsa-zf-baco', durationSeconds: 90, customInstructions: 'Regula a absorção dos alimentos.' }
        ]
    },
    {
        id: 'desintoxicacao',
        title: 'Desintoxicação',
        subtitle: 'Detox & Renovação',
        isPremium: true,
        breathingOptimization: '💡 Dica: A 4-7-8 oxigena tecidos e acelera eliminação de toxinas. Pratique 3x ao dia durante o detox para amplificar a limpeza celular.',
        description: 'Limpeza profunda. Ajuda o corpo a eliminar toxinas de excessos (comida, bebida, stress).',
        iconName: 'Sparkles',
        colorTheme: 'teal',
        benefits: ['Elimina toxinas', 'Reduz retenção líquido', 'Clareza'],
        soundtrack: {
            genre: 'frequency-741hz',
            description: 'Frequência 741Hz. Ideal para limpeza celular, desintoxicação e remoção de toxinas.',
            spotifyUrl: 'https://open.spotify.com/search/741hz%20detox%20cleansing'
        },
        steps: [
            { pointId: 'ynsa-zf-figado', durationSeconds: 120, customInstructions: 'O grande laboratório de limpeza.' },
            { pointId: 'yongquan-r1-kd1', durationSeconds: 90, customInstructions: 'Filtra e purifica.' },
            { pointId: 'zusanli-st36', durationSeconds: 90, customInstructions: 'Acelera o metabolismo de eliminação.' },
            { pointId: 'ynsa-zf-baco', durationSeconds: 90, customInstructions: 'Auxilia na filtração do sangue e imunidade.' },
            { pointId: 'ynsa-zf-estomago', durationSeconds: 90, customInstructions: 'Harmoniza o centro e elimina estagnação.' },
            { pointId: 'ynsa-zf-rim', durationSeconds: 90, customInstructions: 'Filtra e purifica os líquidos corporais.' }
        ]
    },
    {
        id: 'recuperacao-burnout',
        title: 'Recuperação Burnout',
        subtitle: 'Exaustão & Eficácia',
        isPremium: true,
        breathingOptimization: '💡 Dica CRÍTICA: Burnout é "septicemia energética". A Respiração 4-7-8 ativa o sistema parassimpático (anti-stress). Pratique 5 minutos ANTES e DEPOIS deste protocolo para triplicar a eficácia na recuperação.',
        description: 'Protocolo cientificamente validado para burnout ocupacional (WHO ICD-11). Restaura energia vital, clareza mental e capacidade decisória através de 4 pontos cranianos YNSA.',
        iconName: 'Battery',
        colorTheme: 'purple',
        benefits: ['Restaura energia vital', 'Reduz cinismo e irritabilidade', 'Recupera capacidade decisória', 'Clareza mental'],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz - "Love Frequency". Reduz cortisol, repara DNA celular e promove transformação energética profunda.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20healing%20frequency'
        },
        nutrition: {
            avoid: ['Açúcar Refinado (picos de cortisol)', 'Cafeína Excessiva (fadiga adrenal)', 'Alimentos Processados'],
            recommend: ['Cúrcuma + Pimenta (2000% absorção)', 'Ashwagandha (reduz cortisol 30%)', 'Magnésio (anti-stress)', 'Rhodiola Rosea (energia sem ansiedade)'],
            tip: 'Burnout é "septicemia energética" - tratamento requer nutrição anti-inflamatória e adaptógenos.'
        },
        steps: [
            { pointId: 'ynsa-zf-rim', durationSeconds: 180, customInstructions: 'YNSA Ponto 1 (Rim): Restaura Jing (essência vital), força de vontade e combate fadiga crônica profunda.' },
            { pointId: 'ynsa-zf-baco', durationSeconds: 180, customInstructions: 'YNSA Ponto 8 (Baço-Pâncreas): Elimina "névoa cerebral", melhora concentração e reduz overthinking.' },
            { pointId: 'ynsa-zf-figado', durationSeconds: 180, customInstructions: 'YNSA Ponto 10 (Fígado): Libera irritabilidade, cinismo e raiva acumulada do trabalho.' },
            { pointId: 'ynsa-zf-vesicula', durationSeconds: 180, customInstructions: 'YNSA Ponto 11 (Vesícula Biliar): CRÍTICO para decisão e coragem. Combate indecisão paralisante e procrastinação por medo.' }
        ]
    },

    {
        id: 'saude-cardiaca',
        title: 'Saúde Cardíaca',
        subtitle: 'Coração & Circulação',
        isPremium: true,
        breathingOptimization: '💡 Dica: A Coerência Cardíaca é atingida respirando 6x por minuto. Use a Respiração 4-7-8 para baixar a frequência cardíaca e induzir relaxamento profundo dos vasos sanguíneos.',
        description: 'Fortaleça o coração e melhore a circulação. Essencial para palpitações, ansiedade cardíaca e pressão arterial (suporte).',
        iconName: 'Heart',
        colorTheme: 'red',
        benefits: ['Regula ritmo cardíaco', 'Melhora circulação', 'Reduz opressão no peito', 'Acalma Shen (Espírito)'],
        soundtrack: {
            genre: 'alpha-waves',
            description: 'Frequência 432Hz ou 528Hz. Harmoniza o chakra cardíaco e promove reparação celular.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20heart%20healing'
        },
        steps: [
            { pointId: 'ren17-danzhong', durationSeconds: 180, customInstructions: 'Centro do Peito: O Mestre do Qi. Abra o coração para a cura.' },
            { pointId: 'neiguan-pc6', durationSeconds: 120, customInstructions: 'Portão Interno: O melhor ponto para acalmar o coração e a mente.' },
            { pointId: 'ynsa-cardio-heart', durationSeconds: 120, customInstructions: 'YNSA Coração: Regulação central da função cardíaca.' },
            { pointId: 'ynsa-cardio-pericardium', durationSeconds: 120, customInstructions: 'YNSA Pericárdio: Proteção emocional e circulação.' },
            { pointId: 'bp6-sanyinjiao', durationSeconds: 180, customInstructions: 'Reunião dos 3 Yin: Melhora o retorno venoso e acalma a mente.' }
        ]
    },

    // --- LIBIDO & VITALIDADE SEXUAL ---
    {
        id: 'libido-vitalidade-sexual',
        title: '♀️♂️ Libido & Vitalidade Sexual',
        subtitle: 'Energia Vital & Hormônios (Unissex)',
        isPremium: true,
        breathingOptimization: '💡 Dica ESSENCIAL: A Respiração 4-7-8 reduz cortisol (hormônio anti-libido) e aumenta oxigenação pélvica. Pratique 5 minutos antes deste protocolo para potencializar o fluxo sanguíneo genital em até 30%.',
        description: 'Protocolo completo para aumentar libido, vitalidade sexual e energia reprodutiva. Baseado na Sequência Ren (linha abdominal) + pontos complementares. EVIDÊNCIA CIENTÍFICA: Estudos mostram eficácia de 54-69% para disfunção sexual. Aumenta óxido nítrico (NO) = mesmo mecanismo farmacológico da Tadalafila/Viagra.',
        iconName: 'Heart',
        colorTheme: 'red',
        benefits: [
            'Aumenta libido e desejo sexual',
            'Melhora circulação pélvica e genital',
            'Fortalece energia vital (Jing do Rim)',
            'Equilibra hormônios (testosterona)',
            'Trata impotência e disfunção erétil',
            'Melhora fertilidade',
            'Reduz ejaculação precoce'
        ],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz. Harmoniza sistema endócrino, equilibra hormônios reprodutivos e promove relaxamento profundo para intimidade.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20sacral%20chakra%20sexual%20energy'
        },
        nutrition: {
            avoid: [
                'Açúcar Refinado (reduz testosterona)',
                'Gordura Trans (bloqueia NO)',
                'Álcool Excessivo (disfunção erétil)',
                'Soja em excesso (fitoestrógenos)'
            ],
            recommend: [
                'ZINCO (30mg/dia): Ostras, carne magra, sementes de abóbora',
                'MACA PERUANA (1.5-3g): Aumenta desejo sem alterar testosterona',
                'L-ARGININA (3-5g): Precursor de NO (vasodilatação)',
                'ÔMEGA-3: Salmão, sardinha, linhaça (circulação)',
                'Chocolate Amargo 70%+ (flavonoides para NO)',
                'Melancia (L-citrulina → L-arginina)',
                'Beterraba (aumenta NO naturalmente)'
            ],
            tip: 'STACK COMPLETO: Zinco (manhã) + Maca (café) + Ômega-3 (almoço) + L-Arginina (1-2h pré-intimidade). Ciclar Maca/Tongkat Ali a cada 4 semanas para evitar tolerância.'
        },
        steps: [
            {
                pointId: 'cv3-zhongji',
                durationSeconds: 150,
                customInstructions: 'CV3 - INÍCIO DA SEQUÊNCIA REN: O ponto com MAIS evidência científica. Aumenta NO (óxido nítrico) nos vasos do pênis = mecanismo da Tadalafila. Pressione 1 cun acima do púbis por 2.5 min.'
            },
            {
                pointId: 'cv4-guanyuan',
                durationSeconds: 180,
                customInstructions: 'CV4 - PORTÃO DA ORIGEM: O clássico da MTC para reposição de Qi do Rim. Trata impotência, infertilidade e distúrbios menstruais. Localizado 3-4 dedos abaixo do umbigo. Movimento circular suave.'
            },
            {
                pointId: 'cv6-qihai',
                durationSeconds: 180,
                customInstructions: 'CV6 - MAR DE QI: Restaura energia vital e tonifica Yang (energia ativa sexual). Localizado 2 dedos abaixo do umbigo. Finalize a sequência Ren com pressão suave ascendente.'
            },
            {
                pointId: 'sp6-sanyinjiao',
                durationSeconds: 180,
                customInstructions: 'SP6 - CRUCIAL: Impotência, próstata, circulação pélvica. Regula 3 meridianos Yin. Pressione BILATERALMENTE 4 dedos acima tornozelo interno. ATENÇÃO: Evitar em grávidas.'
            },
            {
                pointId: 'kd3-taixi',
                durationSeconds: 180,
                customInstructions: 'KD3 - VITALIDADE DO RIM: Nutre Jing (essência vital sexual), equilibra hormônios. Depressão entre tornozelo interno e tendão de Aquiles. BILATERAL. Ideal antes de dormir ou 1-2h pré-intimidade.'
            },
            {
                pointId: 'bl23-shenshu',
                durationSeconds: 180,
                customInstructions: 'BL23 - HISTÓRICO PARA DISFUNÇÃO ERÉTIL: Fortalece sistema Rim, melhora função reprodutiva. Lombar L2-L3, 2 dedos de cada lado da coluna. BILATERAL. Melhor aplicação: massagem com óleo morno por parceiro/a.'
            }
        ]
    },

    // --- YNSA + MTC INTEGRADO FEMININO ---
    {
        id: 'menopausa-libido-feminina',
        title: '♀️ Menopausa & Libido Feminina',
        subtitle: 'Cabeça + Corpo (YNSA + MTC)',
        isPremium: true,
        breathingOptimization: '💡 Dica CRÍTICA: A Respiração 4-7-8 potencializa AMBOS os sistemas (YNSA craniano + MTC corporal). Pratique 5 minutos antes do protocolo para ativar o sistema parassimpático e amplificar a regulação hormonal.',
        description: 'APENAS MULHERES. Protocolo completo que combina pontos da cabeça (YNSA) com pontos do corpo (MTC). Regula hormônios femininos, trata menopausa, TPM e baixa libido. TÉCNICA SIMPLES: Onde você sentir mais dor/sensibilidade = ponto correto. Pressão leve. Eficácia científica: 99% (estudo 271 mulheres). MECANISMO: Cabeça → Hormônios + Corpo → Circulação.',
        iconName: 'Zap',
        colorTheme: 'purple',
        benefits: [
            'Regula hormônios femininos (99% eficácia)',
            'Alivia menopausa (fogachos, insônia)',
            'Normaliza menstruação irregular',
            'Aumenta libido feminina',
            'Reduz TPM e cólicas',
            'Estabilidade emocional',
            'Melhora fertilidade'
        ],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz. Harmoniza chakra sacral, equilibra sistema endócrino e promove conexão mente-corpo para intimidade plena.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20endocrine%20system%20balance'
        },
        nutrition: {
            avoid: [
                'Cortisol Alto = Anti-Libido: Evite cafeína excessiva após 14h',
                'Açúcar (desregula hormônios)',
                'Álcool (bloqueia hipófise)',
                'Xenoestrogênios (plásticos aquecidos)'
            ],
            recommend: [
                'ASHWAGANDHA (300-600mg): Reduz cortisol 30%, aumenta testosterona',
                'MACA PERUANA (1.5-3g): Regulação hormonal via hipotálamo',
                'ZINCO (30mg) + MAGNÉSIO (400mg): Cofatores enzimas sexuais',
                'L-TIROSINA (500mg): Precursor dopamina (desejo sexual)',
                'Ômega-3 EPA/DHA (circulação + anti-inflamatório)'
            ],
            tip: 'STACK NEUROENDÓCRINO: Ashwagandha (manhã) + Maca (café) + Zinco+Magnésio (jantar) + L-Tirosina (1h pré). Combine com protocolo para efeito máximo.'
        },
        steps: [
            {
                pointId: 'ynsa-zs-point',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA ZS POINT (Zeise-Suess): APENAS MULHERES. Localização: Região temporal, CENTRO geométrico entre 4 pontos (Pulmão, Pericárdio, Int.Delgado, Estômago). TÉCNICA DIAGNÓSTICA: Palpar suavemente a área. ONDE SENTIR MAIOR SENSIBILIDADE/DOR = PONTO CORRETO. Continue pressão circular leve 3 min bilateral no ponto mais dolorido. Trata: menopausa, amenorreia. Eficácia: 99% (estudo 271 pacientes).'
            },
            {
                pointId: 'ynsa-kidney-y1',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA RIM (Y-1 / Ypsilon 1): Região temporal inferior. TÉCNICA: Palpar temporais bilateralmente. PONTO MAIS SENSÍVEL = Rim ativo. Pressão digital suave 3 min cada lado onde houver maior resposta dolorida. Nutre Jing (essência vital sexual), regula adrenais/ovári os/testículos. Base energética para vitalidade reprodutiva.'
            },
            {
                pointId: 'ynsa-brain-m1',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA BRAIN M-1 (Gânglios Basais): Adjacente à linha média craniana frontal. TÉCNICA: Pressão bilateral simultânea com dedos indicadores. SENSIBILIDADE MAIOR INDICA DESEQUILÍBRIO EMOCIONAL - continue pressão leve ali. 3 min. Estabiliza emoções profundas, reduz ansiedade de performance sexual, acalma medo/insegurança.'
            },
            {
                pointId: 'cv3-zhongji',
                durationSeconds: 150,
                customInstructions: '⚡ MTC CV3 (Zhongji): TRANSIÇÃO CRÂNIO → CORPO. Evidência científica: aumenta NO (óxido nítrico) = vasodilatação genital (mecanismo Viagra/Tadalafila). 1 cun acima púbis. Pressão moderada 2.5 min. Eficácia: 54-69% disfunção sexual.'
            },
            {
                pointId: 'cv4-guanyuan',
                durationSeconds: 180,
                customInstructions: '⚡ MTC CV4 (Guanyuan - Portão da Origem): Clássico MTC para Qi do Rim. 3-4 dedos abaixo umbigo. Movimento circular suave ascendente. Impotência, infertilidade, menstruação irregular. Consolida energia gerada pelos pontos YNSA cranianos.'
            },
            {
                pointId: 'sp6-sanyinjiao',
                durationSeconds: 180,
                customInstructions: '⚡ MTC SP6 (Sanyinjiao): Reunião 3 Yin. BILATERAL 4 dedos acima tornozelo interno. Circulação pélvica, próstata, impotência. ATENÇÃO: Contraindicado em grávidas. Potencializa efeito vascular dos pontos Ren.'
            },
            {
                pointId: 'kd3-taixi',
                durationSeconds: 180,
                customInstructions: '⚡ MTC KD3 (Taixi): Fonte do Rim. BILATERAL depressão tornozelo interno. Vitalidade sexual, hormônios, Jing. SINCRONIZA com YNSA Rim (Y-1) para efeito máximo duplo: crânio (SNC) + corpo (meridiano). Ideal 1-2h pré-intimidade ou antes dormir.'
            }
        ]
    },

    // --- YNSA + MTC INTEGRADO MASCULINO ---
    {
        id: 'potencia-energia-masculina',
        title: '♂️ Potência & Energia Masculina',
        subtitle: 'Cabeça + Corpo (YNSA + MTC)',
        isPremium: true,
        breathingOptimization: '💡 Dica CRÍTICA: A Respiração 4-7-8 potencializa AMBOS os sistemas (YNSA craniano + MTC corporal). Pratique 5 minutos antes do protocolo para ativar o sistema parassimpático e amplificar a vitalidade sexual.',
        description: 'APENAS HOMENS. Protocolo completo que combina pontos da cabeça (YNSA) com pontos do corpo (MTC). Aumenta testosterona, melhora ereção e energia sexual. TÉCNICA SIMPLES: Onde você sentir mais dor/sensibilidade = ponto correto. Pressão leve. Validação científica: fMRI/PET-CT. MECANISMO: Cabeça → Hormônios + Corpo → Circulação.',
        iconName: 'Zap',
        colorTheme: 'blue',
        benefits: [
            'Aumenta testosterona natural',
            'Melhora ereção e potência',
            'Combate fadiga sexual',
            'Reduz ansiedade de performance',
            'Aumenta força de vontade',
            'Estabilidade emocional',
            'Melhora fertilidade masculina'
        ],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz. Harmoniza energia sexual masculina, equilibra testosterona e promove confiança para intimidade.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20masculine%20energy%20vitality'
        },
        nutrition: {
            avoid: [
                'Cortisol Alto = Anti-Libido: Evite cafeína excessiva após 14h',
                'Açúcar (reduz testosterona)',
                'Álcool excessivo (disfunção erétil)',
                'Soja em excesso (fitoestrogênios)'
            ],
            recommend: [
                'ZINCO (30mg/dia): Ostras, carne magra, sementes de abóbora',
                'TRIBULUS TERRESTRIS (500-1500mg): Aumenta testosterona natural',
                'L-ARGININA (3-5g): Precursor de NO (vasodilatação)',
                'MACA PERUANA (1.5-3g): Energia e libido',
                'Ômega-3 EPA/DHA (circulação + anti-inflamatório)',
                'Vitamina D3 (5000 UI): Essencial para testosterona'
            ],
            tip: 'STACK MASCULINO: Zinco (manhã) + Tribulus (café) + Maca (almoço) + L-Arginina (1-2h pré-intimidade). Ciclar Tribulus a cada 8 semanas.'
        },
        steps: [
            {
                pointId: 'ynsa-kidney-y1',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA RIM (Y-1): PONTO INICIAL. Região temporal (lado da cabeça). TÉCNICA SIMPLES: Palpar até sentir ponto mais dolorido = esse é o correto. Pressão leve 3 min cada lado. Aumenta energia sexual masculina, regula testículos e adrenais. Base para vitalidade reprodutiva.'
            },
            {
                pointId: 'ynsa-brain-m1',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA BRAIN M-1 (Emoções): Linha média da cabeça (centro da testa). Pressão bilateral suave com dedos indicadores. ONDE SENTIR MAIS DOR = desequilíbrio emocional. 3 min. CRUCIAL para reduzir ansiedade de performance sexual, medo de falhar, insegurança.'
            },
            {
                pointId: 'cv3-zhongji',
                durationSeconds: 150,
                customInstructions: '⚡ MTC CV3 (Zhongji): TRANSIÇÃO CABEÇA → CORPO. Evidência científica: aumenta óxido nítrico (NO) = vasodilatação peniana (mesmo mecanismo Viagra). 1 dedo acima do osso púbico. Pressão moderada 2.5 min. Eficácia: 54-69% disfunção erétil.'
            },
            {
                pointId: 'cv4-guanyuan',
                durationSeconds: 180,
                customInstructions: '⚡ MTC CV4 (Guanyuan - Portão da Origem): Clássico para energia vital masculina. 3-4 dedos abaixo umbigo. Movimento circular suave ascendente. Impotência, energia reprodutiva. Consolida efeito dos pontos da cabeça.'
            },
            {
                pointId: 'sp6-sanyinjiao',
                durationSeconds: 180,
                customInstructions: '⚡ MTC SP6 (Sanyinjiao): Reunião dos 3 Yin. BILATERAL 4 dedos acima tornozelo interno. Circulação pélvica, próstata, impotência. Potencializa efeito vascular dos pontos abdominais.'
            },
            {
                pointId: 'kd3-taixi',
                durationSeconds: 180,
                customInstructions: '⚡ MTC KD3 (Taixi): Fonte do Rim. BILATERAL depressão tornozelo interno. Vitalidade sexual, hormônios, essência vital. SINCRONIZA com YNSA Rim (Y-1) para efeito máximo DUPLO: cabeça (SNC) + corpo (meridiano). Ideal 1-2h pré-intimidade.'
            }
        ]
    }
];
