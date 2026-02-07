
// knowledge.js - The Structured Wisdom Source (Layer 2)

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
        "emotion": "insegurança_material",
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
    }
];

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
    }
];

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
    }
];

module.exports = {
    VALCAPELLI_AXIOMS,
    KWITKO_PATTERNS,
    REFORMA_VIRTUES
};
