import { Protocol } from '../types';

export const protocols: Protocol[] = [
    // --- MENTE & EMOÇÃO ---
    // --- PROTOCOLOS EMOCIONAIS ESPECÍFICOS ---
    {
        id: 'equilibrio-raiva',
        title: 'Gerenciamento da Raiva',
        subtitle: 'Irritabilidade & Frustração',
        description: 'Dissolva a raiva antes que ela exploda. Protocolo focado em circular a energia estagnada do Fígado e acalmar o "Fogo" emocional.',
        iconName: 'Shield',
        colorTheme: 'red',
        isPremium: true,
        breathingOptimization: '💡 Dica: A raiva gera calor e tensão. Use a Respiração 4-7-8 para "resfriar" o sistema e soltar a mandíbula antes de iniciar os pontos.',
        benefits: ['Reduz irritabilidade', 'Acalma explosões emocionais', 'Alivia tensão muscular'],
        soundtrack: {
            genre: 'frequency-396hz',
            description: 'Frequência 396Hz. Libera culpa e medo, bases profundas da raiva defensiva.',
            spotifyUrl: 'https://open.spotify.com/search/396hz%20liberation%20frequency'
        },
        nutrition: {
            avoid: ['Álcool (estressa o Fígado)', 'Pimentas fortes', 'Cafeína em excesso'],
            recommend: ['Chá de Hortelã (move o Qi do Fígado)', 'Vegetais verdes escuros', 'Limão/Água com limão'],
            tip: 'O Fígado odeia estagnação. Movimente-se ou grite em uma almofada para liberar a energia travada.'
        },
        steps: [
            { pointId: 'xingjian-lv2', durationSeconds: 120, customInstructions: 'Ponto DE FOGO (Filho). Dispersa o calor da raiva explosiva. "Apague o incêndio" pressionando firmemente.' },
            { pointId: 'lv3-taichong', durationSeconds: 120, customInstructions: 'Ponto FONTE (Terra). Harmoniza o fluxo do Qi após apagar o fogo. Transforme a tensão em planejamento.' },
            { pointId: 'ren14-juque', durationSeconds: 120, customInstructions: 'Ponto de Alarme do Coração. Acalma a agitação e a ansiedade gerada pela raiva.' },
            { pointId: 'lu10-yuji', durationSeconds: 90, customInstructions: 'Dissipa o calor (raiva) que sobe para o peito e garganta.' }
        ]
    },
    {
        id: 'acolhimento-tristeza',
        title: 'Acolhimento da Tristeza',
        subtitle: 'Luto & Desânimo',
        description: 'Para momentos de "coração apertado" e falta de ar. Fortaleça a energia do Pulmão (sede da tristeza na MTC) e permita que a emoção flua.',
        iconName: 'CloudRain',
        colorTheme: 'teal',
        isPremium: true,
        breathingOptimization: '💡 Dica: A tristeza ataca os pulmões. Respire fundo e visualize uma luz branca preenchendo o peito a cada inspiração.',
        benefits: ['Alivia aperto no peito', 'Processamento do luto', 'Restaura a esperança'],
        soundtrack: {
            genre: 'frequency-417hz',
            description: 'Frequência 417Hz. Facilita a mudança e desfaz situações traumáticas/emocionais.',
            spotifyUrl: 'https://open.spotify.com/search/417hz%20healing%20trauma'
        },
        steps: [
            { pointId: 'ren17-danzhong', durationSeconds: 180, customInstructions: 'Centro do peito. Massagem suave para soltar a angústia acumulada.' },
            { pointId: 'taiyuan-lu9', durationSeconds: 120, customInstructions: 'Ponto MÃE (Terra). Terra gera Metal. Tonifique para preencher o vazio da perda e fortalecer o Pulmão.' },
            { pointId: 'ht5-tongli', durationSeconds: 120, customInstructions: 'Conecta Coração e Fala. Ajuda a verbalizar ou expressar o que está preso.' },
            { pointId: 'zusanli-st36', durationSeconds: 120, customInstructions: 'Terra (Estômago) nutre Metal (Pulmão). Dá base física para suportar a emoção.' }
        ]
    },
    {
        id: 'superando-medo',
        title: 'Coragem & Segurança',
        subtitle: 'Medo & Insegurança',
        description: 'Quando o medo paralisa. Tonifique a energia dos Rins (sede da vontade/Zhi) para transformar medo em prudência e coragem.',
        iconName: 'Shield',
        colorTheme: 'blue',
        isPremium: true,
        breathingOptimization: '💡 Dica: O medo congela. A respiração rítmica (4-7-8) avisa ao cérebro reptiliano que você está seguro agora.',
        benefits: ['Reduz insegurança', 'Aterramento (Grounding)', 'Fortalece a vontade'],
        soundtrack: {
            genre: 'frequency-396hz',
            description: 'Frequência 396Hz. A frequência raiz para liberar o medo fundamental e a culpa.',
            spotifyUrl: 'https://open.spotify.com/search/396hz%20remove%20fear'
        },
        steps: [
            { pointId: 'kd3-taixi', durationSeconds: 180, customInstructions: 'Ponto FONTE (Terra). A base da bateria. Harmoniza a energia vital.' },
            { pointId: 'fuliu-kd7', durationSeconds: 180, customInstructions: 'Ponto MÃE (Metal). Metal gera Água. Tonifique este ponto para "encher o tanque" de coragem e força de vontade.' },
            { pointId: 'kd1-yongquan', durationSeconds: 120, customInstructions: 'Ponto FILHO (Madeira). Aterre o excesso de ansiedade e puxe a energia para o chão.' },
            { pointId: 'baihui-vg20', durationSeconds: 90, customInstructions: 'Topo da cabeça. Eleva o espírito para ver além do medo.' }
        ]
    },
    {
        id: 'decisao-coragem',
        title: 'Decisão & Ação',
        subtitle: 'Indecisão & Procrastinação',
        description: 'Para quando você sabe o que fazer, mas não consegue começar. Fortaleça a Vesícula Biliar (o "General da Decisão") para transformar planos em ação.',
        iconName: 'Zap',
        colorTheme: 'orange',
        isPremium: true,
        breathingOptimization: '💡 Dica: A indecisão trava a respiração. Inspire profundamente imaginando a cor verde (madeira) expandindo suas opções e expire a dúvida.',
        benefits: ['Clareza para decidir', 'Coragem para agir', 'Reduz procrastinação'],
        soundtrack: {
            genre: 'frequency-528hz',
            description: 'Frequência 528Hz. Transformação e milagres (reparo de DNA), ideal para desbloquear potencial de ação.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20action%20motivation'
        },
        steps: [
            { pointId: 'gb40-qiuxu', durationSeconds: 120, customInstructions: 'Ponto Fonte da Vesícula Biliar. Clareia a mente para tomadas de decisão difíceis.' },
            { pointId: 'gb34-yanglingquan', durationSeconds: 180, customInstructions: 'Ponto Mestre dos Tendões e da Ação. Flexibilidade para escolher e se mover.' },
            { pointId: 'ynsa-zf-vesicula', durationSeconds: 120, customInstructions: 'YNSA Z. Frontal (Vesícula). O "Botão da Decisão" no crânio. Pressione onde for mais sensível na testa lateral.' },
            { pointId: 'lv3-taichong', durationSeconds: 120, customInstructions: 'Parceiro do Fígado. Garante que o fluxo de energia para a decisão seja suave.' }
        ]
    },
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
            { pointId: 'shenmen-c7', durationSeconds: 120, customInstructions: 'Ponto FILHO (Terra). Fogo gera Terra. Drena o excesso de agitação mental e ancora o espírito.' },
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
    },

    // --- HERPES (HSV-1 / HSV-2 / ZOSTER) ---
    {
        id: 'herpes-labial-hsv1',
        title: '💋 Herpes Labial',
        subtitle: 'Surto Agudo & Prevenção HSV-1',
        isPremium: true,
        description: 'Protocolo para reduzir duração e intensidade do surto labial e fortalecer a imunidade anti-viral. Atua na raiz energética: Calor-Vento do Pulmão com Deficiência de Wei Qi (imunidade de superfície).',
        iconName: 'Shield',
        colorTheme: 'orange',
        breathingOptimization: '💡 Surto ativo? A Respiração 4-7-8 reduz cortisol (principal gatilho do herpes) e ativa o sistema parassimpático anti-inflamatório. Pratique 5 min ANTES dos pontos para potencializar o resultado.',
        benefits: ['Reduz duração e intensidade do surto', 'Alivia queimação e coceira labial', 'Fortalece imunidade anti-viral (Wei Qi)', 'Previne recidivas com uso contínuo'],
        soundtrack: {
            genre: 'frequency-528hz',
            description: '528Hz — Frequência de reparação celular, amplifica a resposta imune e reduz inflamação viral.',
            spotifyUrl: 'https://open.spotify.com/search/528hz%20immune%20healing'
        },
        nutrition: {
            avoid: ['Arginina: Amendoim, chocolate, sementes de uva/girassol (alimentam o vírus)', 'Álcool (suprime imunidade em até 70% por 24h)', 'Açúcar refinado (prolonga o surto)'],
            recommend: ['LISINA 1-3g/dia: Carnes brancas, laticínios, leguminosas (compete com Arginina)', 'ZINCO 30mg: Sementes de abóbora, ostras (antiviral direto)', 'PRÓPOLIS VERDE: antiviral natural de amplo espectro', 'VITAMINA C 1g + D3 5000UI: ativação imune'],
            tip: 'Stack anti-surto: Lisina 3g ao acordar + Zinco à noite. Iniciar ao primeiro sinal (pródromo: formigamento). Estudo JAMA: reduz surtos em 87%.'
        },
        steps: [
            {
                pointId: 'ynsa-sensorial-boca',
                durationSeconds: 120,
                customInstructions: '🧠 YNSA Sensorial Boca (Couro Cabeludo): Ponto direto para herpes labial no crânio. Palpe suavemente a região da boca na frente do couro cabeludo. ONDE SENTIR MAIS DOR/SENSIBILIDADE = ponto correto. Pressão leve circular 2 min. Acalma o nervo trigêmeo que hospeda o vírus.'
            },
            {
                pointId: 'septicemia-hegu-li4',
                durationSeconds: 120,
                customInstructions: '⚡ IG4 (Hegu): O grande imunomodulador da face. Controla toda a região da boca e lábios. Pressão firme no ponto entre polegar e indicador, bilateral. Dispersa Calor-Vento (energia do vírus).'
            },
            {
                pointId: 'quchi-li11',
                durationSeconds: 120,
                customInstructions: '⚡ IG11 (Quchi): Dispersa Calor sistêmico e Vento (a "energia" do vírus). Excelente para febre associada ao surto. Cotovelo dobrado a 90°, ponto no fim da prega do cotovelo. Bilateral.'
            },
            {
                pointId: 'zusanli-st36',
                durationSeconds: 180,
                customInstructions: '⚡ E36 (Zusanli): O Grande Fortalecedor. Aumenta células NK (Natural Killer) e Wei Qi (imunidade protetora). Base do tratamento preventivo. Pressão firme 4 dedos abaixo da patela, bilateral. Use diariamente para prevenir recidivas.'
            },
            {
                pointId: 'ynsa-zf-pulmao',
                durationSeconds: 120,
                customInstructions: '🧠 YNSA Pulmão (Testa): O Pulmão governa a pele e a imunidade de superfície (Wei Qi) na MTC. Trata a raiz energética do herpes labial. Palpe a região do Pulmão na testa até sentir o ponto mais sensível. Pressão leve 2 min bilateral.'
            }
        ]
    },
    {
        id: 'herpes-genital-hsv2',
        title: '🔒 Herpes Genital',
        subtitle: 'Surto Agudo & Eixo Emocional HSV-2',
        isPremium: true,
        description: 'Protocolo em 3 camadas: (1) Alívio da dor e queimação do surto ativo, (2) Fortalecimento imune pélvico e (3) Processamento emocional — vergonha e medo da rejeição são gatilhos documentados de recidiva do HSV-2.',
        iconName: 'Heart',
        colorTheme: 'purple',
        breathingOptimization: '💡 CRÍTICO: O estresse é o principal gatilho do HSV-2 (cortisol suprime células T específicas para o vírus). A Respiração 4-7-8 interrompe esse ciclo. Pratique DIARIAMENTE — não só no surto — para aumentar o intervalo entre recidivas.',
        benefits: ['Reduz duração e intensidade do surto', 'Alivia dor, queimação e coceira genital', 'Regula imunidade pélvica (Wei Qi)', 'Processa vergonha e medo (gatilhos emocionais)', 'Fortalece Jing (essência vital do Rim)', 'Aumenta intervalo entre surtos'],
        soundtrack: {
            genre: 'frequency-396hz',
            description: '396Hz — Libera culpa, vergonha e medo (as bases emocionais que retroalimentam o HSV-2 via eixo neuroendócrino).',
            spotifyUrl: 'https://open.spotify.com/search/396hz%20liberate%20guilt%20fear'
        },
        nutrition: {
            avoid: ['Arginina: Amendoim, chocolate amargo, nozes, aveia (alimentam replicação viral)', 'Açúcar refinado (inflamação pélvica e supressão imune)', 'Álcool (suprime linfócitos CD4 — os guardiões do HSV-2)'],
            recommend: ['LISINA 1-3g/dia: 3g no surto ativo, 1g na prevenção', 'ZINCO 30mg + VITAMINA C 1g (antiviral sinérgico)', 'ASHWAGANDHA 300-600mg: reduz cortisol 30% (anti-gatilho)', 'VITAMINA D3 5000UI: ativa resposta imune específica ao herpes', 'PRÓPOLIS + EXTRATO FOLHA DE OLIVEIRA: antivirais naturais'],
            tip: 'Stack pró-ativo: Lisina (manhã) + Zinco + D3 (noite) + Ashwagandha (adaptógeno anti-estresse). Iniciar no PRÓDROMO (formigamento, pressão, ardor). Estudos: reduz surtos em 50-80%.'
        },
        steps: [
            {
                pointId: 'ynsa-zf-rim',
                durationSeconds: 180,
                customInstructions: '🧠 YNSA Rim (Temporal): Na MTC, o Rim é a sede do Medo e da Vergonha — as emoções que retroalimentam o HSV-2. Palpe a têmpora lateralmente até sentir o ponto mais sensível/dolorido = Rim ativo. PRESSÃO LEVE circular, 3 min bilateral. Restaura Jing (essência vital), fortalece imunidade pélvica no nível craniano e dissolve o medo de rejeição.'
            },
            {
                pointId: 'bp6-sanyinjiao',
                durationSeconds: 180,
                customInstructions: '⚡ BP6 (Sanyinjiao) — Reunião dos 3 Yin: O ponto mais estratégico para HSV-2. Regula imunidade pélvica, elimina Umidade-Calor (ambiente onde o vírus prospera), equilibra hormônios e melhora circulação genital. BILATERAL: 4 dedos acima do maléolo interno. ATENÇÃO: Contraindicado em grávidas.'
            },
            {
                pointId: 'zusanli-st36',
                durationSeconds: 180,
                customInstructions: '⚡ E36 (Zusanli): Fortalece Wei Qi global e aumenta células NK (Natural Killer) que combatem o vírus. Pressão firme bilateral abaixo do joelho. Use diariamente na prevenção — é a base do sistema imune na MTC.'
            },
            {
                pointId: 'kd3-taixi',
                durationSeconds: 180,
                customInstructions: '⚡ R3 (Taixi) — Fonte do Rim: Trata o medo e a insegurança (raiz emocional do HSV-2). Nutre Yin do Rim, reduz Calor-Deficiência que alimenta surtos crônicos. Localizado entre o maléolo interno e o tendão de Aquiles. Bilateral. Complementa YNSA Rim para efeito duplo: crânio + corpo.'
            },
            {
                pointId: 'lv3-taichong',
                durationSeconds: 120,
                customInstructions: '⚡ F3 (Taichong): Dispersa Calor do Fígado — a raiva, frustração e ressentimento reprimidos que frequentemente antecedem surtos. O Fígado governa a região genital e o fluxo de Qi pélvico. Dorso do pé entre 1º e 2º metatarsos. Bilateral. Finaliza a sequência promovendo fluxo livre de energia.'
            }
        ]
    }
];

