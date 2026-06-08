// knowledge.js - The Structured Wisdom Source (Layer 2)
// v2.0 — Expandido com 9 protocolos específicos + tabela YNSA completa

// =============================================================================
// 1. METAFÍSICA DA SAÚDE (Causa Moral por Órgão)
// =============================================================================
const VALCAPELLI_AXIOMS = [
    {
        "organ": "estomago",
        "element": "terra",
        "emotion": "preocupacao",
        "causality": "Não 'digerir' os fatos da vida. Crítica excessiva. Querer que o mundo seja do seu jeito, não como é.",
        "symptom": "Gastrite, Refluxo, Queimação",
        "virtue_needed": "Aceitação"
    },
    {
        "organ": "figado",
        "element": "madeira",
        "emotion": "raiva",
        "causality": "Resistência à mudança. Amargura crônica. Sentimento de injustiça. Agressividade represada.",
        "symptom": "Enxaqueca, Tensão Muscular, Problemas Visuais",
        "virtue_needed": "Mansuetude / Flexibilidade"
    },
    {
        "organ": "pulmao",
        "element": "metal",
        "emotion": "tristeza",
        "causality": "Cansaço da vida. Feridas emocionais profundas não curadas. Sentimento de sufoco ou abandono.",
        "symptom": "Asma, Bronquite, Alergias Respiratórias",
        "virtue_needed": "Alegria de Viver / Gratidão"
    },
    {
        "organ": "rim",
        "element": "agua",
        "emotion": "medo",
        "causality": "Medo do futuro. Insegurança existencial. Apego a mágoas antigas (pedras). Falta de apoio.",
        "symptom": "Cálculo Renal, Dor Lombar, Cansaço Crônico",
        "virtue_needed": "Fé / Coragem"
    },
    {
        "organ": "coracao",
        "element": "fogo",
        "emotion": "ansiedade",
        "causality": "Desconexão com a própria essência. Autoritarismo que sufoca o amor. Pressa de viver.",
        "symptom": "Taquicardia, Insônia, Pressão Alta",
        "virtue_needed": "Serenidade / Amor Incondicional"
    },
    {
        "organ": "coluna_cervical",
        "element": "estrutura",
        "emotion": "teimosia",
        "causality": "Inflexibilidade. Não querer olhar para os lados (outras opiniões). Orgulho mental.",
        "symptom": "Torcicolo, Rigidez no pescoço",
        "virtue_needed": "Humildade Intelectual"
    },
    {
        "organ": "coluna_lombar",
        "element": "estrutura",
        "emotion": "inseguranca_material",
        "causality": "Medo da falta. Preocupação excessiva com dinheiro/sustento. Sentir-se sem suporte.",
        "symptom": "Hérnia de Disco, Travamento Lombar",
        "virtue_needed": "Confiança na Providência"
    },
    {
        "organ": "joelhos",
        "element": "estrutura",
        "emotion": "orgulho",
        "causality": "Dificuldade em se dobrar (ceder). Ego rígido. Não aceitar autoridade ou mudanças.",
        "symptom": "Dor nos Joelhos, Menisco",
        "virtue_needed": "Reverência / Flexibilidade"
    },
    {
        "organ": "intestino_grosso",
        "element": "metal",
        "emotion": "apego",
        "causality": "Dificuldade em 'soltar' o passado, pessoas, situações. Controle excessivo. Perfeccionismo.",
        "symptom": "Constipação, Síndrome do Intestino Irritável",
        "virtue_needed": "Desapego / Confiança"
    },
    {
        "organ": "pele",
        "element": "metal",
        "emotion": "isolamento",
        "causality": "Sentir-se separado do mundo. Dificuldade de contato emocional. Medo de ser tocado (emocionalmente).",
        "symptom": "Dermatite, Psoríase, Eczema, Urticária",
        "virtue_needed": "Pertencimento / Amor Próprio"
    },
    {
        "organ": "cabeca_enxaqueca",
        "element": "madeira_fogo",
        "emotion": "controle_perfeccionismo",
        "causality": "Exigência excessiva de si mesmo e dos outros. 'Minha cabeça está explodindo' de tanto pensar/controlar.",
        "symptom": "Enxaqueca Crônica, Cefaleia Tensional",
        "virtue_needed": "Leveza / Confiança no Processo"
    },
    {
        "organ": "tireoide",
        "element": "comunicacao",
        "emotion": "expressao_bloqueada",
        "causality": "Engolir palavras. Não poder se expressar. Criatividade reprimida. 'O que eu digo não importa.'",
        "symptom": "Hipotireoidismo, Hipertireoidismo, Nódulos",
        "virtue_needed": "Expressão Autêntica / Voz Própria"
    }
];

// =============================================================================
// 2. PADRÕES DE VIDA (Causa Recorrente / Kármica)
// =============================================================================
const KWITKO_PATTERNS = [
    {
        "pattern_id": "vitima",
        "name": "O Padrão da Vítima",
        "trigger_question": "Você sente que o mundo/família é injusto com você?",
        "insight": "Você não é vítima da sua família. Você escolheu este cenário exato para evoluir uma virtude que lhe faltava.",
        "action": "Assuma Radical Autorresponsabilidade. O que VOCÊ pode fazer hoje, sem depender de ninguém?"
    },
    {
        "pattern_id": "controlador",
        "name": "O Padrão do Controlador",
        "trigger_question": "Você se irrita quando as coisas saem do seu planejamento?",
        "insight": "Sua tentativa de controlar tudo é medo disfarçado. A vida é fluxo, não arquitetura rígida.",
        "action": "Pratique a entrega. Deixe um pequeno detalhe do dia 'errado' de propósito e observe sua reação."
    },
    {
        "pattern_id": "salvador",
        "name": "O Padrão do Salvador",
        "trigger_question": "Você se sente exausto cuidando dos problemas dos outros?",
        "insight": "Ajudar quem não pediu ajuda é invasão, não caridade. Você está buscando validação externa.",
        "action": "Recolha sua energia. Diga 'não' hoje para uma demanda que não é sua."
    },
    {
        "pattern_id": "rejeitado",
        "name": "O Padrão da Rejeição",
        "trigger_question": "Você se sente excluído ou não amado com frequência?",
        "insight": "Você rejeita a si mesmo antes que os outros o façam. O mundo é um espelho.",
        "action": "Faça algo de bom APENAS para você hoje. Nutra sua criança ferida."
    },
    {
        "pattern_id": "autocritico",
        "name": "O Padrão do Autocrítico",
        "trigger_question": "Você sente que nunca é bom o suficiente?",
        "insight": "O crítico interno é a voz dos que não acreditaram em você. Mas você não é mais aquela criança.",
        "action": "Escreva 3 coisas que você fez BEM hoje. Sem 'mas'. Sem ressalvas."
    }
];

// =============================================================================
// 3. REFORMA ÍNTIMA (Vícios → Virtudes)
// =============================================================================
const REFORMA_VIRTUES = [
    {
        "vice": "orgulho",
        "virtue": "humildade",
        "definition": "Reconhecer que não se sabe tudo; aceitar ajuda; ceder o lugar de fala.",
        "mantra": "Eu me curvo diante da sabedoria maior que habita em todos."
    },
    {
        "vice": "egoismo",
        "virtue": "caridade",
        "definition": "Sair da órbita do 'Eu' e perceber a necessidade real do Outro.",
        "mantra": "Hoje minha alegria virá de servir, não de ser servido."
    },
    {
        "vice": "raiva",
        "virtue": "mansuetude",
        "definition": "A força contida e serena. Responder, não reagir. Compreender a dor por trás do ataque.",
        "mantra": "Minha paz é inegociável. Eu escolho a serenidade."
    },
    {
        "vice": "medo",
        "virtue": "fe_racional",
        "definition": "Certeza raciocinada de que não há acaso no universo e que sou capaz de lidar com o que vier.",
        "mantra": "Tudo o que vem é para o meu bem (Gam Zu L'Tovah)."
    },
    {
        "vice": "preguica",
        "virtue": "trabalho_util",
        "definition": "Movimentar a energia vital para gerar valor. Sair da inércia.",
        "mantra": "Eu sou co-criador da minha realidade através da ação."
    },
    {
        "vice": "gula",
        "virtue": "temperanca",
        "definition": "O domínio do espírito sobre a matéria. O equilíbrio no nutrir.",
        "mantra": "Meu corpo é um templo sagrado, não um depósito."
    },
    {
        "vice": "luxuria",
        "virtue": "castidade_mental",
        "definition": "Pureza de intenção. Ver o outro como alma, não como objeto de prazer.",
        "mantra": "Eu honro a divindade no outro."
    },
    {
        "vice": "inveja",
        "virtue": "admiracao_generosa",
        "definition": "Transformar o desejo pelo bem alheio em inspiração para o próprio crescimento.",
        "mantra": "O sucesso do outro não diminui o meu. Existe abundância para todos."
    }
];

// =============================================================================
// 4. REFERÊNCIA YNSA — PONTOS BÁSICOS E INDICAÇÕES
// =============================================================================
const YNSA_POINTS_REFERENCE = [
    {
        "point": "Ponto A (Somatotopo Básico A)",
        "location": "Linha frontal do couro cabeludo, região central superior",
        "indication": "Dor de cabeça, enxaqueca, ansiedade, insônia, pressão alta, clareza mental",
        "side_rule": "Bilateral para condições sistêmicas; ipsilateral para dor local"
    },
    {
        "point": "Ponto B (Somatotopo Básico B)",
        "location": "Região temporal, anterior à orelha",
        "indication": "Pescoço, cervical, ombro, braquialgia, tensão muscular superior",
        "side_rule": "Ipsilateral para dor ortopédica"
    },
    {
        "point": "Ponto C (Somatotopo Básico C)",
        "location": "Região temporal posterior",
        "indication": "Braço, cotovelo, punho, mão (membro superior)",
        "side_rule": "Ipsilateral para dor; contralateral para neurológico"
    },
    {
        "point": "Ponto D (Somatotopo Básico D)",
        "location": "Região parietal lateral",
        "indication": "Lombar, coluna dorsal, quadril, sacro",
        "side_rule": "Ipsilateral para dor musculoesquelética"
    },
    {
        "point": "Ponto E (Somatotopo Básico E)",
        "location": "Região parieto-occipital",
        "indication": "Joelho, coxa, perna, tornozelo, pé (membro inferior)",
        "side_rule": "Ipsilateral para dor; contralateral para AVC e paralisia"
    },
    {
        "point": "Ponto ZS (Yamamoto Sensei Special)",
        "location": "Região frontal paramediana, 2-3 cm da linha média",
        "indication": "Ponto universal de equilíbrio do SNC. Indicado para: AVC, paralisias, distúrbios neurológicos, tremores, Parkinson",
        "side_rule": "SEMPRE contralateral ao lado afetado"
    },
    {
        "point": "Ypsilon Fígado",
        "location": "Mapeamento Ypsilon na região temporal-parietal",
        "indication": "Inflamação, processos virais, detox, raiva, hipertensão, dor intensa",
        "side_rule": "Bilateral na maioria dos casos inflamatórios"
    },
    {
        "point": "Ypsilon Rim",
        "location": "Mapeamento Ypsilon região posterior",
        "indication": "Medo, insegurança, fadiga crônica, dor lombar profunda, questões urológicas",
        "side_rule": "Bilateral"
    },
    {
        "point": "Ypsilon Coração",
        "location": "Mapeamento Ypsilon região frontal esquerda",
        "indication": "Ansiedade, palpitação, insônia, trauma emocional, luto",
        "side_rule": "Predominantemente esquerdo"
    },
    {
        "point": "Nervos Cranianos (NC I-XII)",
        "location": "Linha frontal do couro cabeludo, cada nervo tem ponto específico",
        "indication": "NC I=Olfato; NC II=Visão; NC V=Trigêmeo/dor facial/ATM; NC VII=Paralisia facial; NC VIII=Zumbido/vertigem; NC X=Vagal/digestivo",
        "side_rule": "Ipsilateral para nervos periféricos; bilateral para funções vegetativas"
    }
];

// =============================================================================
// 5. PROTOCOLOS CLÍNICOS ESPECÍFICOS
// =============================================================================
const SPECIFIC_PROTOCOLS = [
    {
        "condition": "Neuropatia Diabética / Dor nas Pernas / Queimação Periférica",
        "keywords": ["neuropatia", "pé diabético", "dor nas pernas", "queimação nos pés", "formigamento nas pernas", "diabete", "diabética", "perna dormente", "dor neuropática"],
        "instructions_for_ai": "Neuropatia diabética requer foco REGENERATIVO. Recomende explicitamente a combinação de Suplementação Otimizada (PEA Micronizada e Ácido Alfa-Lipóico) com Fotobiomodulação (Luz Infravermelha nos pés). CUIDADO: Sugira Banhos de Contraste térmico (quente/frio), mas AVISANDO RIGOROSAMENTE a paciente para testar a temperatura da água com as MÃOS primeiro, devido à insensibilidade térmica nos pés. Indique as Frequências Analgésicas (174 Hz).",
        "protocol_mtc": [
            "Bafeng (Extra): Estimulação vigorosa entre as teias dos dedos dos pés para acordar a microcirculação",
            "ST36 (Zusanli) + GB34 (Yanglingquan): Nutrição profunda de tendões e nervos periféricos",
            "SP6 (Sanyinjiao): Ponto mestre para acalmar o Shen e irrigar as pernas"
        ],
        "protocol_ynsa": [
            "Ponto E: Específico para o membro inferior (Perna e Pé)",
            "Ponto C: Auxilia na liberação sistêmica da dor periférica"
        ],
        "metafisica": "Neuropatia Diabética = A doçura da vida se perdeu e os passos em direção ao futuro (pernas) geram dor e dormência. Virtude: Doçura Interior + Aceitação do Caminho."
    },
    {
        "condition": "Herpes Zoster (Cobreiro) / Neuralgia Pós-Herpética",
        "keywords": ["zoster", "herpes", "cobreiro", "neuralgia", "intercostal", "queimação na pele", "dermátomo"],
        "instructions_for_ai": "A Zoster ataca um NERVO específico (Dermátomo). 1. IDENTIFIQUE A REGIÃO no relato do usuário. 2. DEDUZA O DERMÁTOMO (ex: Mamilo=T4, Umbigo=T10, Pescoço=C3, Rosto=Trigêmeo). 3. PRESCREVA os pontos para AQUELE nível vertebral.",
        "protocol_mtc": [
            "REGRA 1 - A RAIZ (Coluna): Huatuojiaji na vértebra afetada",
            "REGRA 2 - O TRAJETO (Meridiano): Lateral=SJ6+GB34; Costas=BL40+BL60; Face=ST36+LI4",
            "REGRA 3 - O DESBLOQUEIO: GB41 (Zulinqi) se dor em faixa",
            "REGRA 4 - A INFLAMAÇÃO: LI11 + SP10 para calor/fogo viral"
        ],
        "protocol_ynsa": [
            "Ponto Básico correspondente à anatomia: A(cabeça), B(cervical), C(braço), D(lombar), E(perna)",
            "Ypsilon Fígado: sempre para apagar inflamação viral (Calor/Vento)"
        ],
        "metafisica": "Zoster = Raiva/Conflito reprimido que 'queima' a pele. Local indica COM QUEM: Peito=afeto; Braço=trabalho; Perna=futuro; Rosto=identidade."
    },
    {
        "condition": "Ansiedade / Transtorno Ansioso / Síndrome do Pânico",
        "keywords": ["ansiedade", "ansioso", "angústia", "pânico", "ataque de pânico", "preocupação excessiva", "nervoso", "agitação", "inquietação", "coração acelerado de nervoso"],
        "instructions_for_ai": "Ansiedade é sempre Fogo do Coração + Madeira do Fígado em desequilíbrio. Pergunte PRIMEIRO sobre o contexto (trabalho, relacionamento, futuro) para identificar a causa raiz emocional antes de prescrever.",
        "protocol_mtc": [
            "HT7 (Shenmen - Portão do Espírito): ponto mestre da mente, acalma o Shen",
            "PC6 (Neiguan): regula o coração, alivia palpitações e ansiedade",
            "LV3 (Taichong): libera o estagnamento do Fígado/raiva reprimida",
            "SP6 (Sanyinjiao): acalma a mente, nutre o Yin, harmoniza 3 meridianos"
        ],
        "protocol_ynsa": [
            "Ypsilon Coração: âncora emocional principal para ansiedade",
            "Ponto A: equilíbrio do SNC e clareza mental"
        ],
        "metafisica": "Ansiedade = Desconfiança no futuro + falta de presença. 'Viver no amanhã que ainda não veio.' Causa: coração desconectado da essência. Virtude: Fé Racional + Serenidade."
    },
    {
        "condition": "Hipertensão Arterial / Pressão Alta",
        "keywords": ["pressão alta", "hipertensão", "hipertenso", "pressão elevada", "pressão arterial", "PA alta"],
        "instructions_for_ai": "Hipertensão em MTC = Ascensão do Yang do Fígado + Deficiência do Yin do Rim. Pergunte sobre estresse, raiva reprimida e qualidade do sono. Nunca oriente a parar medicação.",
        "protocol_mtc": [
            "LV3 (Taichong) + LI4 (Hegu): combinação 'Quatro Portões' — baixa pressão e libera estagnamento",
            "KD1 (Yongquan): ancora energia para baixo, equilibra Yang ascendente",
            "PC6 (Neiguan): regula coração e pressão",
            "GB20 (Fengchi): libera tensão cervical, melhora circulação cerebral"
        ],
        "protocol_ynsa": [
            "Ypsilon Fígado: libera Yang ascendente e raiva represada",
            "Ypsilon Rim: fortalece o Yin para ancorar o Yang"
        ],
        "metafisica": "Pressão Alta = 'Pressão interna' não expressa. Carga emocional sem válvula de escape. Raiva engolida ao longo do tempo. Virtude: Expressão Saudável + Mansuetude."
    },
    {
        "condition": "Depressão / Tristeza Profunda / Melancolia",
        "keywords": ["depressão", "deprimido", "tristeza", "melancolia", "vazio", "sem energia", "sem vontade", "anedonia", "choro sem motivo", "apatia"],
        "instructions_for_ai": "Depressão em MTC = Estagnamento do Qi do Fígado + Deficiência do Yang do Baço/Coração. Diferencie: depressão por estagnamento (irritabilidade + tristeza) vs deficiência (frio, lentidão, vazio). Conduza com muita acolhida.",
        "protocol_mtc": [
            "LV3 (Taichong): move o Qi estagnado do Fígado",
            "ST36 (Zusanli): tonifica o Baço, gera energia vital",
            "GV20 (Baihui): eleva o Yang, clareia a mente",
            "HT7 (Shenmen): acalma e nutre o Shen (espírito)"
        ],
        "protocol_ynsa": [
            "Ypsilon Coração: reconecta com a essência e alegria de viver",
            "Ponto A: levanta o Yang e ilumina o espírito"
        ],
        "metafisica": "Depressão = Luto não processado de algo que era esperado e não veio (amor, reconhecimento, justiça). O Pulmão guarda a tristeza. Virtude: Gratidão pelo que É + Alegria de Viver."
    },
    {
        "condition": "Insônia / Distúrbios do Sono",
        "keywords": ["insônia", "não consigo dormir", "dificuldade para dormir", "sono agitado", "acorda de madrugada", "pesadelos", "sono ruim", "dormir mal"],
        "instructions_for_ai": "Insônia em MTC tem PADRÕES diferentes: acorda às 23h-1h=Vesícula Biliar/decisões; 1h-3h=Fígado/raiva; 3h-5h=Pulmão/tristeza; 5h-7h=Intestino Grosso/retenção. Pergunte o HORÁRIO em que acorda.",
        "protocol_mtc": [
            "HT7 (Shenmen): acalma o Shen, principal ponto de insônia",
            "SP6 (Sanyinjiao): nutre o Yin, acalma a mente",
            "KD6 (Zhaohai): abre o Vaso Yin Chiao, promove sono",
            "An Mian (ponto extra): ponto específico para insônia, atrás da orelha"
        ],
        "protocol_ynsa": [
            "Ypsilon Coração: acalma o fogo mental noturno",
            "Ponto A: desacelera o sistema nervoso"
        ],
        "metafisica": "Insônia = A mente não para porque o coração não se sente seguro. 'E se...?' O futuro invade o presente. Virtude: Fé + Presença. Prática: Escrever 3 gratidões antes de dormir."
    },
    {
        "condition": "Dor Crônica / Fibromialgia / Dor Difusa",
        "keywords": ["dor crônica", "fibromialgia", "dor no corpo todo", "dor difusa", "dor muscular", "dor generalizada", "sensação de queimação", "hipersensibilidade à dor"],
        "instructions_for_ai": "Dor crônica sem causa física clara = Qi e Sangue estagnados + Vento-Frio-Umidade obstruindo os meridianos. Pergunte sobre traumas emocionais passados — fibromialgia é frequentemente 'dor que não podia ser expressa'.",
        "protocol_mtc": [
            "GB34 (Yanglingquan): mestre dos tendões e músculos",
            "SP21 (Dabao): ponto mestre de toda dor muscular difusa",
            "LI4 + LV3 (Quatro Portões): move o Qi em todo o corpo",
            "BL17 (Geshu): tonifica e move o Sangue"
        ],
        "protocol_ynsa": [
            "Ponto ZS: recalibra o sistema nervoso central",
            "Ponto correspondente à área de maior dor (A, B, C, D ou E)"
        ],
        "metafisica": "Fibromialgia = Dor que não tinha permissão de existir emocionalmente. O corpo vira o receptáculo da dor psíquica não expressa. Virtude: Auto-compaixão radical + Permissão para sentir."
    },
    {
        "condition": "Burnout / Esgotamento / Estresse Crônico",
        "keywords": ["burnout", "esgotamento", "estresse", "cansaço extremo", "não aguentar mais", "sobrecarga", "exaustão", "sem energia", "trabalho demais"],
        "instructions_for_ai": "Burnout = Deficiência profunda do Qi do Rim + Fígado sobrecarregado. É uma crise espiritual disfarçada de crise física. Pergunte: 'O que você está fazendo que não tem mais sentido para você?'",
        "protocol_mtc": [
            "KD3 (Taixi): tonifica a essência renal — ponto raiz de toda energia vital",
            "ST36 (Zusanli): recupera o Qi da Terra, gera força",
            "CV4 (Guanyuan): tonifica o Yang original, reservatório de energia",
            "SP6 (Sanyinjiao): nutre Rim, Fígado e Baço simultaneamente"
        ],
        "protocol_ynsa": [
            "Ypsilon Rim: recarrega a bateria fundamental (Jing)",
            "Ponto D: ancora e estabiliza a energia"
        ],
        "metafisica": "Burnout = Trair o próprio propósito por tempo demais. 'Fazer o que os outros esperam' vs 'o que a alma exige'. Virtude: Coragem de Dizer Não + Autorrespeito."
    },
    {
        "condition": "Luto / Perda / Elaboração de Perdas",
        "keywords": ["luto", "perda", "morte", "falecimento", "morreu", "perdi", "saudade", "trauma de perda", "separação", "divórcio", "fim de relacionamento"],
        "instructions_for_ai": "O luto é o processo natural do Pulmão (Metal). Não patologize. Acolha primeiro. Pergunte: 'Você está conseguindo deixar essa dor sair — chorar, falar, expressar?' Luto retido vira doença no Pulmão.",
        "protocol_mtc": [
            "LU7 (Lieque): abre o Pulmão, libera a tristeza retida",
            "KD6 (Zhaohai): par de LU7, equilibra Metal e Água",
            "PC6 (Neiguan): protege o coração emocional",
            "CV17 (Shanzhong): centro do coração, libera o bloqueio emocional no peito"
        ],
        "protocol_ynsa": [
            "Ypsilon Coração + Ypsilon Pulmão: trabalha a dupla Metal-Fogo do luto",
            "Ponto A: centra e estabiliza durante a tempestade emocional"
        ],
        "metafisica": "Luto = A alma aprendendo que o amor não morre com o corpo. O vínculo muda de forma, não desaparece. Virtude: Gratidão pelo que foi + Coragem de continuar amando."
    },
    {
        "condition": "ATM / Dor de Mandíbula / Bruxismo",
        "keywords": ["atm", "mandíbula", "bruxismo", "apertar os dentes", "ranger os dentes", "dor na mandíbula", "dor no rosto", "trava na mandíbula", "clique na mandíbula"],
        "instructions_for_ai": "ATM em MTC = SJ (San Jiao) + Vesícula Biliar bloqueados na região lateral da face. O bruxismo é raiva/decisões não tomadas que 'rangi' os dentes durante o sono.",
        "protocol_mtc": [
            "ST6 (Jiache): ponto local principal para ATM",
            "ST7 (Xiaguan): libera a articulação temporomandibular",
            "SJ21 (Ermen): acima da orelha, ponto específico de ATM",
            "LI4 (Hegu): analgésico geral da face e cabeça"
        ],
        "protocol_ynsa": [
            "NC V (Trigêmeo): ponto dos nervos cranianos para dor facial",
            "Ponto B: cervical e mandíbula, relaxa a musculatura"
        ],
        "metafisica": "Bruxismo/ATM = Raiva e decisões represadas. 'Engolir sapo' cronicamente. Dificuldade de 'morder' a vida e tomar decisões firmes. Virtude: Assertividade + Expressão da Raiva Saudável."
    }
];

// =============================================================================
// 6. DIRETRIZES FILOSÓFICO-CIENTÍFICAS (CONCEITOS DAS PALESTRAS)
// =============================================================================
const LECTURE_KNOWLEDGE = {
    "PESAR_FLOW": {
        "name": "O Mnemônico P.E.S.A.R. (Pensamento, Emoção, Sentimento, Ação, Reencarnação)",
        "P": "Pensamento: A raiz de tudo. Combater pensamentos nocivos na fonte (técnica do 'Conte até 10') impede que ganhem força e se transformem em ação.",
        "E": "Emoção: A 'flecha de fora'. Reações reativas, súbitas, passageiras e violentas (ira, medo, euforia) — indicativos de imperfeição/vício.",
        "S": "Sentimento: A 'luz de dentro'. Estados estáveis, duradouros, serenos e irradiantes (amor, mansuetude, compaixão) — indicativos de virtude.",
        "A": "Ação/Hábito: A manifestação no mundo físico. A repetição de escolhas define nosso padrão de vibração. 'O hábito faz o monge'.",
        "R": "Reencarnação: O processo e a escola. 'Não somos matéria, estamos matéria'. Assim como a água muda de estado físico, o espírito passa temporariamente pela densidade da matéria para evoluir."
    },
    "PREVENTIVE_FORGIVENESS": {
        "name": "O Perdão Antecipado",
        "concept": "Pedir perdão e perdoar de antemão por débitos inconscientes ou mágoas de vidas passadas. Isso alivia instantaneamente a densidade cármica e os reflexos somáticos no corpo físico."
    },
    "AURA_GAPS_AND_BIOENERGY": {
        "name": "Bioenergia e Lacunas na Aura",
        "gaps": "Vícios e hábitos nocivos (álcool, drogas, gula, abusos) abrem lacunas (gaps) na aura humana (demonstráveis por bioelectrography/GDV), servindo de porta de entrada para que entidades espirituais drenem a energia vital.",
        "water": "Sendo o corpo feito de 78% de água, nossos pensamentos e intenções ordenam a energia celular (comprovado pelos experimentos dos cristais de Masaru Emoto e dos potes de arroz).",
        "restoration": "Interagir com parques, matas e a natureza reorganiza e expande a aura/energia vital."
    },
    "REFORMA_INTIMA_LIGHT": {
        "name": "Reforma Íntima Sem Peso (Leveza)",
        "concept": "A evolução não deve ser punitiva ou cheia de culpa. Devemos ser nossos melhores amigos no processo. Aceitar que temos limitações (se estamos 60% alinhados, já é uma vitória) e focar na melhoria diária gradual, sem autocrítica destrutiva."
    },
    "CHAKRAS_AND_MENTORS": {
        "name": "Crop Circles, Chakras e Mentores",
        "concept": "Geometrias sagradas (como Crop Circles que replicam os chakras) mostram a ordem cósmica. Lembrar que nunca estamos sozinhos: mentores e guias estão a postos para ajudar toda vez que sintonizamos com o alto (viramos o copo para cima)."
    }
};

module.exports = {
    VALCAPELLI_AXIOMS,
    KWITKO_PATTERNS,
    REFORMA_VIRTUES,
    YNSA_POINTS_REFERENCE,
    SPECIFIC_PROTOCOLS,
    LECTURE_KNOWLEDGE
};

