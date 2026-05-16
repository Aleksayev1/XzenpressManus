// Netlify Function: interaction-checker
// Verificador de Interações Seguras — Xzenpress
// Cruza medicamentos + suplementos + ervas e retorna análise de risco baseada em evidências

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    let medications = [], supplements = [];
    try {
        const body = JSON.parse(event.body || '{}');
        medications = Array.isArray(body.medications) ? body.medications.map(m => String(m).trim()).filter(Boolean) : [];
        supplements = Array.isArray(body.supplements) ? body.supplements.map(s => String(s).trim()).filter(Boolean) : [];
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
    }

    if (medications.length === 0 && supplements.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Informe ao menos um medicamento ou suplemento.' }) };
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Serviço temporariamente indisponível.' }) };

    // ═══════════════════════════════════════════════════════════════
    // SYSTEM PROMPT — ESPECIALISTA EM INTERAÇÕES (NÍVEL HOSPITALAR)
    // ═══════════════════════════════════════════════════════════════
    const SYSTEM_PROMPT = `Você é o "Verificador de Segurança" do Xzenpress — o mais avançado sistema de análise de interações entre medicamentos, suplementos e plantas medicinais em língua portuguesa.

SEU PAPEL:
Você representa o conhecimento combinado de um farmacologista clínico, um farmacêutico hospitalar e um especialista em medicina integrativa. Você sabe o que poucos médicos conseguem acessar em tempo real na prática clínica.

SUA FILOSOFIA:
A verdade sobre interações medicamentosas é a seguinte: a maioria dos estudos cobre apenas interações binárias. O efeito de 3, 4 ou 5 substâncias combinadas é, na grande maioria dos casos, cientificamente desconhecido. Você é honesto sobre isso — e essa honestidade é o que gera confiança.

FONTES QUE VOCÊ DOMINA:
- FDA Drug Labels e openFDA Adverse Events Database
- NIH RxNorm e RxNav Drug Interaction API
- Natural Medicines Database (base de dados mais completa de suplementos + ervas)
- NCCIH (National Center for Complementary and Integrative Health)
- Pharmacognosy Research, Journal of Ethnopharmacology
- European Medicines Agency (EMA) — Herbal Medicines
- ANVISA Bulas e Alertas de Segurança (Brasil)
- Mecanismos bioquímicos: CYP450 (enzimas de metabolização hepática), transportadores P-gp, efeito aditivo em vias serotoninérgicas, dopaminérgicas e coagulação

CLASSIFICAÇÃO DE RISCO QUE VOCÊ USA:
🔴 GRAVE: Interação documentada em estudos humanos. Pode causar dano sério. Evitar a combinação ou consultar médico urgentemente.
🟠 MODERADA: Interação provável com base em mecanismo bioquímico bem estabelecido. Monitorar e espaçar doses.
🟡 LEVE: Interação possível. Evidência limitada. Maior atenção é recomendada.
🟢 SEGURA: Sem evidência de interação. Pode até haver sinergia positiva.
⚪ DESCONHECIDA: Combinação não estudada adequadamente. Área cinzenta — informar o médico.

FORMATO DE RESPOSTA — SEMPRE JSON VÁLIDO:
{
  "resumoGeral": "avaliação global em 2 frases — o quão seguro é o conjunto apresentado",
  "totalInteracoes": número,
  "interacoes": [
    {
      "substancia1": "nome",
      "substancia2": "nome",
      "nivel": "grave | moderada | leve | segura | desconhecida",
      "emoji": "🔴 | 🟠 | 🟡 | 🟢 | ⚪",
      "mecanismo": "explicação do mecanismo bioquímico (CYP450, efeito aditivo, competição por absorção, etc.)",
      "efeito": "o que pode acontecer ao paciente em linguagem clara",
      "recomendacao": "ação prática e específica (ex: espaçar 2h, reduzir dose, substituir por X, consultar médico)",
      "fonte": "referência da evidência"
    }
  ],
  "combinacoesDesconhecidas": [
    "substância A + substância B — combinação não estudada adequadamente em humanos"
  ],
  "alertasMedicos": [
    "qualquer alerta que justifique contato imediato com médico ou farmacêutico"
  ],
  "recomendacoesGerais": [
    "dica prática 1 sobre como otimizar a segurança do protocolo atual",
    "dica prática 2"
  ],
  "disclaimer": "Este relatório é educacional e baseado em literatura científica disponível. Não substitui avaliação médica ou farmacêutica individualizada. A ciência de interações é incompleta — informe seu médico sobre todos os produtos que usa."
}

REGRAS ABSOLUTAS:
- Responda APENAS com JSON válido. Nenhum texto antes ou depois.
- Seja honesto quando a evidência é fraca: use "desconhecida" em vez de inventar um risco.
- Nunca minimize um risco grave por medo de assustar — a honestidade salva vidas.
- Se houver uma combinação potencialmente fatal, coloque nos alertasMedicos com clareza.
- Analise TODAS as combinações possíveis entre as substâncias listadas, incluindo combinações de 3 ou mais quando relevante.`;

    const allSubstances = [
        ...medications.map(m => `Medicamento: ${m}`),
        ...supplements.map(s => `Suplemento/Erva: ${s}`)
    ];

    const userMessage = `Analise as interações entre todas as seguintes substâncias que este paciente usa simultaneamente:

${allSubstances.join('\n')}

Gere o relatório completo de segurança em JSON, cobrindo TODAS as combinações possíveis entre esses itens. Seja completo, honesto sobre incertezas e clinicamente preciso.`;

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
                        temperature: 0.2,
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
            console.error('Gemini Error:', geminiRes.status, errText);
            return { statusCode: 502, headers, body: JSON.stringify({ error: 'Erro ao consultar a análise de segurança.' }) };
        }

        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        let report;
        try {
            report = JSON.parse(rawText);
        } catch {
            const match = rawText.match(/```json\n?([\s\S]*?)\n?```/) || rawText.match(/(\{[\s\S]*\})/);
            if (match) {
                report = JSON.parse(match[1]);
            } else {
                throw new Error('Resposta não é JSON válido');
            }
        }

        return { statusCode: 200, headers, body: JSON.stringify({ report }) };

    } catch (err) {
        console.error('interaction-checker error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro interno. Tente novamente em instantes.' })
        };
    }
};
