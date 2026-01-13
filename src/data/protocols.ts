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
            genre: 'theta-waves',
            description: 'Ondas Theta (4-7Hz). Induzem o estado hipnagógico (pré-sono).',
            spotifyUrl: 'https://open.spotify.com/search/theta%20waves%20sleep'
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
            genre: 'binaural',
            description: 'Batidas Binaurais Beta (14Hz+). Sincronizam os hemisférios para foco.',
            spotifyUrl: 'https://open.spotify.com/search/binaural%20beta%20focus'
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
            genre: 'solfeggio',
            description: 'Frequência 174Hz. Conhecida como "Anéstésico Natural" (Solfeggio) para alívio da dor e segurança dos órgãos.',
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
            genre: 'solfeggio',
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
            genre: 'solfeggio',
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
            genre: 'solfeggio',
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
            genre: 'solfeggio',
            description: 'Frequência 174Hz. O anestésico natural para relaxamento dos músculos masseter e temporal.',
            spotifyUrl: 'https://open.spotify.com/search/174hz%20tmj%20relief'
        },
        steps: [
            { pointId: 'atm-xiaguan-st7', durationSeconds: 120, customInstructions: 'Abra e feche a boca suavemente enquanto pressiona.' },
            { pointId: 'atm-ermen-sj21', durationSeconds: 90, customInstructions: 'Pressione no portal da orelha.' },
            { pointId: 'atm-jiache-st6', durationSeconds: 120, customInstructions: 'Foque no relaxamento do músculo masseter.' },
            { pointId: 'ynsa-cranial-5', durationSeconds: 120, customInstructions: 'YNSA Trigêmeo: Controle neural da face.' },
            { pointId: 'ynsa-sensorial-boca-a', durationSeconds: 90, customInstructions: 'Relaxamento profundo do assoalho bucal.' },
            { pointId: 'ynsa-cranial-10', durationSeconds: 120, customInstructions: 'YNSA Vago: Controle de stress e inflamação.' }
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
            genre: 'solfeggio',
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
            genre: 'solfeggio',
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
    }
];
