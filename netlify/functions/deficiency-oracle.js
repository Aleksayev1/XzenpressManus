// Netlify Function: deficiency-oracle
// O Oracle de Deficiências do Xzenpress — Busca Integrativa e Viva
// Retorna protocolo 360° baseado em sintoma do usuário

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let symptom = '';
    let chronicity = 'misto';
    try {
        const body = JSON.parse(event.body || '{}');
        symptom = (body.symptom || '').trim();
        chronicity = (body.chronicity || 'misto').trim();
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
    }

    if (!symptom || symptom.length < 3) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Descreva pelo menos um sintoma ou condição.' }) };
    }

    // Sanitização básica
    const sanitized = symptom.replace(/<[^>]*>/g, '').substring(0, 500);

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
        return { statusCode: 503, headers, body: JSON.stringify({ error: 'Serviço temporariamente indisponível.' }) };
    }

    // ═══════════════════════════════════════════════════════════════════
    // O PROMPT-MESTRE DO ORACLE DE DEFICIÊNCIAS XZENPRESS
    // ═══════════════════════════════════════════════════════════════════
    const SYSTEM_PROMPT = `Você é o "Oracle de Deficiências" do Xzenpress — a plataforma mais avançada do mundo em saúde integral.

SUA FILOSOFIA CENTRAL:
"Que o teu alimento seja o teu remédio" — Hipócrates.
O ser humano é um sistema vivo e indivisível: bioquímica, energia vital, emoção e alma são inseparáveis. Você não trata sintomas isolados — você enxerga padrões sistêmicos e revela as raízes mais profundas do desequilíbrio.

SEU CONHECIMENTO ABRANGE:
1. NUTRIÇÃO FUNCIONAL E EPIGENÉTICA: Deficiências de micronutrientes como causa primária de doenças crônicas. Como a alimentação ativa ou silencia genes (epigenética). Estudos recentes do NIH, WHO, Harvard e ENANI/Brasil.
2. BIOQUÍMICA CELULAR: Coenzimas, cofatores enzimáticos, cascatas metabólicas comprometidas por deficiências nutricionais. Mitocôndrias como motor da vitalidade.
3. MEDICINA TRADICIONAL CHINESA (MTC): Os 5 Elementos, os órgãos-padrão (Zang-Fu), meridianos e como os desequilíbrios energéticos se manifestam em sintomas físicos. Fitoterapia chinesa de alta precisão.
4. FITOTERAPIA BRASILEIRA: Plantas medicinais nativas com ação comprovada — Boldo, Espinheira Santa, Maracujá, Guaraná, Uncaria tomentosa (Cat's Claw) e outras.
5. BIOHACKING E PEPTÍDEOS: Peptídeos bioativos (BPC-157, CJC-1295, Ipamorelin, TB-500, Epithalamin de Khavinson) e sua ação epigenética — reativação de genes silenciados pelo envelhecimento, modulação do eixo GH/IGF-1, regeneração tecidual acelerada.
6. ACUPUNTURA CRÂNIANA YNSA (Yamamoto New Scalp Acupuncture): Pontos do couro cabeludo que correspondem a órgãos e sistemas. Protocolos específicos para cada condição.
7. ACUPRESSÃO E PONTOS MTC: Pontos de meridianos acessíveis para autopressão e acupressão.
8. PSICOSSOMÁTICA E NEUROCIÊNCIA: A emoção como fator epigenético. O eixo intestino-cérebro. Como o estado emocional crônico compromete a absorção de nutrientes específicos.

IMPORTANTE — CONTEXTO BRASIL:
- 77% dos brasileiros têm deficiência de Vitamina D
- O ferro é a carência mais prevalente no país (ENANI 2019)
- Solos brasileiros são pobres em selênio (exceto Amazônia)
- A castanha-do-pará é a maior fonte natural de selênio do mundo
- A alimentação brasileira moderna é pobre em Ômega-3 e Magnésio

FORMATO DA SUA RESPOSTA — SEMPRE JSON VÁLIDO:
{
  "titulo": "nome resumido da condição identificada",
  "visaoIntegrativa": "parágrafo de 2-3 frases revelando a raiz sistêmica do problema, conectando as dimensões física, energética e emocional",
  "deficiencias": [
    {
      "nutriente": "nome",
      "probabilidade": "alta | moderada | possível",
      "mecanismo": "como essa deficiência causa o sintoma relatado (1 frase científica precisa)",
      "evidencia": "citação resumida de estudo (autor, revista, ano)"
    }
  ],
  "protocolo": {
    "alimentacao": {
      "priorizar": ["alimento 1 com motivo", "alimento 2 com motivo"],
      "evitar": ["alimento 1 com motivo", "alimento 2 com motivo"],
      "receitaMTC": "sugestão de preparo baseado nos 5 Elementos (ex: caldo de ossos para tonificar o Rim)"
    },
    "suplementos": [
      {
        "nome": "nome do suplemento",
        "dose": "dose orientativa baseada em literatura",
        "timing": "manhã | tarde | noite | com refeição",
        "sinergia": "com qual outro suplemento potencializa o efeito"
      }
    ],
    "fitoterapia": {
      "plantasBrasileiras": ["planta + ação específica para este caso"],
      "plantasMTC": ["planta chinesa + nome em pinyin + ação no meridiano específico"]
    },
    "peptideos": {
      "indicados": ["peptídeo + mecanismo de ação epigenético relevante para este caso"],
      "nota": "uso apenas com prescrição médica e farmácia credenciada"
    },
    "pontosYNSA": ["Ponto YNSA + localização no couro cabeludo + indicação"],
    "pontosMTC": ["Ponto VG20, ID3, etc + como estimular + tempo recomendado"],
    "praticasComplementares": ["prática específica + duração + frequência"]
  },
  "epigenetica": "parágrafo sobre como essa condição está relacionada à expressão gênica e o que as pesquisas mais recentes revelam sobre reversibilidade epigenética",
  "almaEmocional": "a dimensão emocional e psicossomática deste padrão — o que a MTC e a neurociência dizem sobre o estado emocional que acompanha este desequilíbrio",
  "alertas": ["alertas de segurança relevantes"],
  "fontes": ["fonte 1", "fonte 2", "fonte 3"]
}

REGRAS ABSOLUTAS:
- Responda APENAS com o JSON. Sem texto antes ou depois.
- REGRA DE OURO YNSA (PONTOS Y / YPSILON): Sempre que sugerir Pontos Y (Ypsilons) da craniopuntura, declare e recomende explicitamente que eles são BILATERAIS (devem ser estimulados em ambos os lados da têmpora/cabeça). Por exemplo: "Ponto Ypsilon do Fígado (Bilateral - estimule em ambas as têmporas)".
- Nunca invente estudos. Se não souber a fonte exata, escreva "Literatura de nutrição funcional — consulte profissional especializado."
- Sempre inclua o aviso de que não substitui consulta médica nos alertas.
- Se o sintoma for uma emergência (dor no peito, AVC, etc.), coloque um alerta urgente como primeiro item dos alertas.
- Seja preciso, profundo e científico — mas acessível para leigos.`;

    const userMessage = `Analise este sintoma/condição e gere o Protocolo Integral 360° completo do Xzenpress:

"${sanitized}"

A condição é clinicamente descrita como: ${chronicity.toUpperCase()} (aguda, crônica ou mista).

CRITÉRIO CRUCIAL DE PRESCRIÇÃO YNSA:
- Se a condição for AGUDA (dor forte, início recente), dê prioridade absoluta aos Pontos dos Nervos Cranianos (occipital) que trazem modulação neural imediata e alívio rápido, indicando também Pontos Ypsilon como suporte.
- Se for CRÔNICA (condição que vai e vem há semanas/meses), dê prioridade aos Pontos Ypsilon bilaterais (região temporal) para reeducação orgânica profunda e somatotópica gradual, indicando Nervos Cranianos como reforço se necessário.
- Se for MISTA (crise aguda em cima de um quadro crônico), prescreva e dê igual prioridade a ambos (Pontos Ypsilon bilaterais na têmpora + Pontos de Nervos Cranianos no occipital).

Escreva a justificativa clínica dessa escolha no campo "visaoIntegrativa" e prescreva os pontos exatos em "pontosYNSA".

Responda exclusivamente em JSON válido, seguindo o formato especificado no seu sistema. Seja completo, profundo e verdadeiramente útil para o usuário.`;

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 4096,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                })
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini API Error:', geminiRes.status, errText);
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Erro ao consultar o Oracle. Tente novamente.' })
            };
        }

        const geminiData = await geminiRes.json();

        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Tenta parsear o JSON retornado pela IA
        let protocol;
        try {
            protocol = JSON.parse(rawText);
        } catch {
            // Fallback: extrai JSON de dentro do texto se vier com markdown
            const match = rawText.match(/```json\n?([\s\S]*?)\n?```/) || rawText.match(/(\{[\s\S]*\})/);
            if (match) {
                protocol = JSON.parse(match[1]);
            } else {
                throw new Error('Resposta da IA não é JSON válido');
            }
        }

        // normaliza a estrutura para garantir segurança completa no frontend
        if (protocol && protocol.protocolo) {
            // Garante que fitoterapia seja um objeto seguro
            if (!protocol.protocolo.fitoterapia) {
                protocol.protocolo.fitoterapia = { plantasBrasileiras: [], plantasMTC: [] };
            } else if (Array.isArray(protocol.protocolo.fitoterapia)) {
                const flatList = protocol.protocolo.fitoterapia;
                protocol.protocolo.fitoterapia = {
                    plantasBrasileiras: flatList.filter(p => !p.toLowerCase().includes('mtc') && !p.toLowerCase().includes('pinyin')),
                    plantasMTC: flatList.filter(p => p.toLowerCase().includes('mtc') || p.toLowerCase().includes('pinyin'))
                };
            } else {
                // Caso existam chaves alternativas ou grafias ligeiramente diferentes
                if (!protocol.protocolo.fitoterapia.plantasBrasileiras) {
                    const keys = Object.keys(protocol.protocolo.fitoterapia);
                    const brKey = keys.find(k => k.toLowerCase().includes('brasil') || k.toLowerCase().includes('br') || k.toLowerCase() === 'plantasbrasileiras');
                    protocol.protocolo.fitoterapia.plantasBrasileiras = brKey ? protocol.protocolo.fitoterapia[brKey] : [];
                }
                if (!protocol.protocolo.fitoterapia.plantasMTC) {
                    const keys = Object.keys(protocol.protocolo.fitoterapia);
                    const mtcKey = keys.find(k => k.toLowerCase().includes('mtc') || k.toLowerCase().includes('china') || k.toLowerCase() === 'plantasmtc');
                    protocol.protocolo.fitoterapia.plantasMTC = mtcKey ? protocol.protocolo.fitoterapia[mtcKey] : [];
                }
            }

            // Garante que as listas internas sejam de fato arrays
            if (!Array.isArray(protocol.protocolo.fitoterapia.plantasBrasileiras)) {
                protocol.protocolo.fitoterapia.plantasBrasileiras = [];
            }
            if (!Array.isArray(protocol.protocolo.fitoterapia.plantasMTC)) {
                protocol.protocolo.fitoterapia.plantasMTC = [];
            }

            // Garante outros arrays recomendados
            if (!Array.isArray(protocol.protocolo.pontosYNSA)) protocol.protocolo.pontosYNSA = [];
            if (!Array.isArray(protocol.protocolo.pontosMTC)) protocol.protocolo.pontosMTC = [];
            if (!Array.isArray(protocol.protocolo.suplementos)) protocol.protocolo.suplementos = [];
            
            if (!protocol.protocolo.alimentacao) {
                protocol.protocolo.alimentacao = { priorizar: [], evitar: [], receitaMTC: "" };
            } else {
                if (!Array.isArray(protocol.protocolo.alimentacao.priorizar)) protocol.protocolo.alimentacao.priorizar = [];
                if (!Array.isArray(protocol.protocolo.alimentacao.evitar)) protocol.protocolo.alimentacao.evitar = [];
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ protocol })
        };

    } catch (err) {
        console.error('deficiency-oracle error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro interno. O Oracle está meditando — tente novamente em instantes.' })
        };
    }
};
