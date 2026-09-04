// Netlify Function: deficiency-oracle
// O Oracle de DeficiÃªncias do Xzenpress â€” Busca Integrativa e Viva
// Retorna protocolo 360Â° baseado em sintoma do usuÃ¡rio

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');

// Sistema de rate limiting simples (em memória)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS_PER_HOUR = 100;

function checkRateLimit(userEmail, limit = MAX_REQUESTS_PER_HOUR) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(userEmail) || [];

    // Remove requisições antigas (fora da janela de 1 hora)
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= limit) {
        return { allowed: false, remaining: 0 };
    }

    // Adiciona nova requisição
    recentRequests.push(now);
    rateLimitStore.set(userEmail, recentRequests);

    return {
        allowed: true,
        remaining: limit - recentRequests.length
    };
}

exports.handler = async (event) => {
    const headers = {
        ...getCorsHeaders(event),
        'Content-Type': 'application/json'
    };

    if (!isOriginAllowed(event)) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Origin not allowed' })
        };
    }

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let symptom = '';
    let chronicity = 'misto';
    let geneticMarkers = null;
    let organClock = null;
    let anamnese = null;
    let userEmail = null;
    let isPremium = false;
    try {
        const body = JSON.parse(event.body || '{}');
        symptom = (body.symptom || '').trim();
        chronicity = (body.chronicity || 'misto').trim();
        geneticMarkers = body.geneticMarkers || null;
        organClock = body.organClock || null;
        anamnese = body.anamnese || null;
        userEmail = body.userEmail || null;
        isPremium = body.isPremium || false;
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invÃ¡lido' }) };
    }

    // Determinar chave e limite para controle de requisições (Rate Limit)
    const getClientIp = () => {
        if (!event || !event.headers) return 'guest-fallback';
        const ipHeader = event.headers['client-ip'] || 
                         event.headers['x-nf-client-connection-ip'] || 
                         event.headers['x-forwarded-for'];
        if (ipHeader) {
            return ipHeader.split(',')[0].trim();
        }
        return 'guest-fallback';
    };

    const isDeveloper = userEmail && (userEmail.toLowerCase().includes('aleksayev') || userEmail.toLowerCase().includes('alexandre'));
    const rateLimitKey = userEmail || getClientIp();
    const limit = (isPremium || isDeveloper) ? 100 : 3; // 100 para Premium/Dev, 3 para Gratuitos/Visitantes
    const rateLimit = checkRateLimit(rateLimitKey, limit);

    if (!rateLimit.allowed) {
        let errorMessage = `Degustação diária do Oráculo de Deficiências concluída! 🌟\n\nPara continuar fazendo consultas ilimitadas ao oráculo e receber protocolos personalizados, assine o plano Premium ou faça o login!`;
        if (isPremium) {
            errorMessage = 'Limite de requisições excedido. Tente novamente em 1 hora.';
        }
        return {
            statusCode: 429,
            headers,
            body: JSON.stringify({
                error: errorMessage,
                remaining: 0
            })
        };
    }

    if (!symptom || symptom.length < 3) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Descreva pelo menos um sintoma ou condiÃ§Ã£o.' }) };
    }

    // SanitizaÃ§Ã£o bÃ¡sica
    const sanitized = symptom.replace(/<[^>]*>/g, '').substring(0, 500);
    
    // Chave de cache composta
    let queryKey = symptom.toLowerCase().trim();
    if (geneticMarkers && organClock) {
        const detox = geneticMarkers.detoxHepatico || 'normal';
        const inflam = geneticMarkers.sensibilidadeInflamacao || 'normal';
        const organName = organClock.organ || 'geral';
        queryKey = `${queryKey}_${detox}_${inflam}_${organName.toLowerCase().replace(/\s+/g, '')}`;
    }

    try {
        const { data: cachedData } = await supabase
            .from('xzen_oracle_protocols')
            .select('protocol')
            .eq('query', queryKey)
            .maybeSingle();

        if (cachedData && cachedData.protocol) {
            console.log(`â„¹ï¸� [OrÃ¡culo Cache] Retornando dados em cache para: "${queryKey}"`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ protocol: cachedData.protocol })
            };
        }
    } catch (cacheErr) {
        console.error('Erro ao consultar cache do Supabase:', cacheErr);
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!GEMINI_KEY && !OPENAI_KEY) {
        return { statusCode: 503, headers, body: JSON.stringify({ error: 'Serviço temporariamente indisponível.' }) };
    }

    // ══════════════════════════════════════════════════════════════
    const SYSTEM_PROMPT = `VocÃª Ã© o "Oracle de DeficiÃªncias" do Xzenpress â€” a plataforma mais avanÃ§ada do mundo em saÃºde integral.

SUA FILOSOFIA CENTRAL:
"Que o teu alimento seja o teu remÃ©dio" â€” HipÃ³crates. O ser humano Ã© um sistema vivo e indivisÃ­vel: bioquÃ­mica, energia vital, emoÃ§Ã£o e alma sÃ£o inseparÃ¡veis. VocÃª nÃ£o trata sintomas isolados â€” vocÃª enxerga padrÃµes sistÃªmicos e revela as raÃ­zes mais profundas do desequilÃ­brio.
VocÃª cruzarÃ¡ as queixas com predisposiÃ§Ãµes genÃ©ticas (DNA), histÃ³rico metabÃ³lico e o relÃ³gio de Ã³rgÃ£os da Medicina Tradicional Chinesa (MTC).

SEU CONHECIMENTO ABRANGE:
1. NUTRIÃ‡ÃƒO FUNCIONAL E EPIGENÃ‰TICA: DeficiÃªncias de micronutrientes como causa primÃ¡ria de doenÃ§as crÃ´nicas. Como a alimentaÃ§Ã£o ativa ou silencia genes (epigenÃ©tica). Estudos recentes do NIH, WHO, Harvard e ENANI/Brasil.
2. BIOQUÃ�MICA CELULAR: Coenzimas, cofatores enzimÃ¡ticos, cascatas metabÃ³licas comprometidas por deficiÃªncias nutricionais. MitocÃ´ndrias como motor da vitalidade.
3. MEDICINA TRADICIONAL CHINESA (MTC): Os 5 Elementos, os Ã³rgÃ£os-padrÃ£o (Zang-Fu), meridianos e como os desequilÃ­brios energÃ©ticos se manifestam em sintomas fÃ­sicos. Fitoterapia chinesa de alta precisÃ£o.
4. FITOTERAPIA BRASILEIRA: Plantas medicinais nativas com aÃ§Ã£o comprovada â€” Boldo, Espinheira Santa, MaracujÃ¡, GuaranÃ¡, Uncaria tomentosa (Cat's Claw) e outras.
5. BIOHACKING E PEPTÃ�DEOS: PeptÃ­deos bioativos (BPC-157, CJC-1295, Ipamorelin, TB-500, Epithalamin de Khavinson) e sua aÃ§Ã£o epigenÃ©tica â€” reativaÃ§Ã£o de genes silenciados pelo envelhecimento, modulaÃ§Ã£o do eixo GH/IGF-1, regeneraÃ§Ã£o tecidual acelerada.
6. ACUPUNTURA CRÃ‚NIANA YNSA (Yamamoto New Scalp Acupuncture): Pontos do couro cabeludo que correspondem a Ã³rgÃ£os e sistemas. Protocolos especÃ­ficos para cada condiÃ§Ã£o.
7. ACUPRESSÃƒO E PONTOS MTC: Pontos de meridianos acessÃ­veis para autopressÃ£o e acupressÃ£o.
8. PSICOSSOMÃ�TICA E NEUROCIÃŠNCIA: A emoÃ§Ã£o como fator epigenÃ©tico. O eixo intestino-cÃ©rebro. Como o estado emocional crÃ´nico compromete a absorÃ§Ã£o de nutrientes especÃ­ficos.

IMPORTANTE â€” CONTEXTO BRASIL:
- 77% dos brasileiros tÃªm deficiÃªncia de Vitamina D
- O ferro Ã© a carÃªncia mais prevalente no paÃ­s (ENANI 2019)
- Solos brasileiros sÃ£o pobres em selÃªnio (exceto AmazÃ´nia)
- A castanha-do-parÃ¡ Ã© a maior fonte natural de selÃªnio do mundo
- A alimentaÃ§Ã£o brasileira moderna Ã© pobre em Ã”mega-3 e MagnÃ©sio

REGRAS DE CONCISÃƒO ABSOLUTA PARA EVITAR TRUNCAÃ‡ÃƒO:
- Limite todas as explicaÃ§Ãµes, parÃ¡grafos e justificativas a no mÃ¡ximo 2 frases curtas, objetivas e cientÃ­ficas.
- "deficiencias": Retorne no mÃ¡ximo 2 a 3 nutrientes fundamentais.
- "suplementos": Retorne no mÃ¡ximo 3 suplementos mais relevantes.
- "priorizar" e "evitar": Max 3 itens curtos.
- "plantasBrasileiras" e "plantasMTC": Max 2 plantas cada.
- "peptideos.indicados": Max 1 a 2 peptÃ­deos.
- "pontosYNSA": Max 3 pontos YNSA mais relevantes. Declare e recomende explicitamente que os pontos Y (Ypsilon) sÃ£o BILATERAIS.
- "pontosMTC": Max 2 a 3 pontos MTC.
- "praticasComplementares": Max 2 prÃ¡ticas.
- "fontes": Max 2 fontes cientÃ­ficas reais.

FORMATO DA SUA RESPOSTA â€” SEMPRE JSON VÃ�LIDO:
{
  "titulo": "nome resumido da condiÃ§Ã£o identificada",
  "visaoIntegrativa": "Justificativa resumida conectando as dimensÃµes fÃ­sica, energÃ©tica e emocional (max 2 frases)",
  "deficiencias": [
    {
      "nutriente": "nome",
      "probabilidade": "alta | moderada | possÃ­vel",
      "mecanismo": "como essa deficiÃªncia causa o sintoma relatado (1 frase curta)",
      "evidencia": "citaÃ§Ã£o resumida de estudo (autor, ano)"
    }
  ],
  "protocolo": {
    "alimentacao": {
      "priorizar": ["alimento 1 com motivo curto", "alimento 2 com motivo curto"],
      "evitar": ["alimento 1 com motivo curto", "alimento 2 com motivo curto"],
      "receitaMTC": "sugestÃ£o de preparo baseado nos 5 Elementos (max 2 frases)"
    },
    "suplementos": [
      {
        "nome": "nome do suplemento",
        "dose": "dose orientativa",
        "timing": "momento de tomar",
        "sinergia": "sinergia relevante"
      }
    ],
    "fitoterapia": {
      "plantasBrasileiras": ["planta + aÃ§Ã£o curta"],
      "plantasMTC": ["planta + nome pinyin + aÃ§Ã£o curta"]
    },
    "peptideos": {
      "indicados": ["peptÃ­deo + mecanismo curto"],
      "nota": "uso apenas com prescriÃ§Ã£o mÃ©dica e farmÃ¡cia credenciada"
    },
    "pontosYNSA": ["Ponto YNSA + localizaÃ§Ã£o + indicaÃ§Ã£o"],
    "pontosMTC": ["Ponto + como estimular + tempo"],
    "praticasComplementares": ["prÃ¡tica + duraÃ§Ã£o + frequÃªncia"]
  },
  "epigenetica": "reversibilidade epigenÃ©tica resumida (max 2 frases)",
  "recPrecisao": "Para o seu perfil metabÃ³lico e horÃ¡rio do Ã³rgÃ£o do [Ã“rgÃ£o], a planta [Planta X] terÃ¡ uma absorÃ§Ã£o de [90-99]% e bloquearÃ¡ o gene da [inflamaÃ§Ã£o celular / desintoxicaÃ§Ã£o hepÃ¡tica lenta / estresse oxidativo]. Seguido de explicaÃ§Ã£o bioquÃ­mica concisa (max 2 frases).",
  "almaEmocional": "dimensÃ£o emocional e psicossomÃ¡tica resumida (max 2 frases)",
  "alertas": ["aviso de que nÃ£o substitui consulta mÃ©dica", "outros alertas importantes"],
  "fontes": ["fonte 1", "fonte 2"]
}

REGRAS ABSOLUTAS:
- Responda APENAS com o JSON. Sem texto antes ou depois.
- REGRA DE OURO YNSA (PONTOS Y / YPSILON): Sempre que sugerir Pontos Y (Ypsilons) da craniopuntura, declare e recomende explicitamente que eles sÃ£o BILATERAIS (devem ser estimulados em ambos os lados da tÃªmpora/cabeÃ§a). Por exemplo: "Ponto Ypsilon do FÃ­gado (Bilateral - estimule em ambas as tÃªmporas)".
- Nunca invente estudos. Se nÃ£o souber a fonte exata, escreva "Literatura de nutriÃ§Ã£o funcional â€” consulte profissional especializado."
- Sempre inclua o aviso de que nÃ£o substitui consulta mÃ©dica nos alertas.
- Se o sintoma for uma emergÃªncia (dor no peito, AVC, etc.), coloque um alerta urgente como primeiro item dos alertas.
- Seja preciso, profundo e cientÃ­fico â€” mas extremamente conciso e breve.`;

    let userMessage = `Analise este sintoma/condiÃ§Ã£o e gere o Protocolo Integral 360Â° completo do Xzenpress:

"${sanitized}"

A condiÃ§Ã£o Ã© clinicamente descrita como: ${chronicity.toUpperCase()} (aguda, crÃ´nica ou mista).`;

    if (anamnese) {
        userMessage += `\n\nHISTÃ“RICO CLÃ�NICO/METABÃ“LICO DO USUÃ�RIO (Anamnese):\n`;
        userMessage += `- CondiÃ§Ãµes declaradas: ${anamnese.condicoesExistentes?.join(', ') || 'Nenhuma'}\n`;
        userMessage += `- Medicamentos em uso: ${anamnese.medicamentosEmUso?.join(', ') || 'Nenhum'}\n`;
        userMessage += `- Sintomas fÃ­sicos: ${anamnese.sintomasFisicos?.join(', ') || 'Nenhum'}\n`;
        if (anamnese.guardianScores) {
            userMessage += `- DesequilÃ­brio energÃ©tico (MTC Guardian Scores): Madeira ${anamnese.guardianScores.madeira}%, Fogo ${anamnese.guardianScores.fogo}%, Terra ${anamnese.guardianScores.terra}%, Metal ${anamnese.guardianScores.metal}%, Ã�gua ${anamnese.guardianScores.agua}%\n`;
        }
    }

    if (geneticMarkers) {
        userMessage += `\n\nPREDISPOSIÃ‡Ã•ES GENÃ‰TICAS DO USUÃ�RIO (DNA):\n`;
        userMessage += `- Capacidade de DesintoxicaÃ§Ã£o HepÃ¡tica (FÃ­gado): ${geneticMarkers.detoxHepatico || 'normal'}\n`;
        userMessage += `- Sensibilidade Ã  InflamaÃ§Ã£o Celular: ${geneticMarkers.sensibilidadeInflamacao || 'normal'}\n`;
        userMessage += `- Estresse Celular Oxidativo: ${geneticMarkers.estresseOxidativo || 'normal'}\n`;
    }

    if (organClock) {
        userMessage += `\n\nRELÃ“GIO DE Ã“RGÃƒOS MTC:\n`;
        userMessage += `- Ã“rgÃ£o correspondente ativo na consulta: ${organClock.organ} (HorÃ¡rio do pico: ${organClock.timeRange}, Elemento: ${organClock.element})\n`;
        userMessage += `- DescriÃ§Ã£o do Ã³rgÃ£o: ${organClock.description}\n`;
    }

    userMessage += `\n\nCRITÃ‰RIO CRUCIAL DE PRESCRIÃ‡ÃƒO YNSA:
- Se a condiÃ§Ã£o for AGUDA (dor forte, inÃ­cio recente), dÃª prioridade absoluta aos Pontos dos Nervos Cranianos (occipital) que trazem modulaÃ§Ã£o neural imediata e alÃ­vio rÃ¡pido, indicando tambÃ©m Pontos Ypsilon como suporte.
- Se for CRÃ”NICA (condiÃ§Ã£o que vai e vem hÃ¡ semanas/meses), dÃª prioridade aos Pontos Ypsilon bilaterais (regiÃ£o temporal) para reeducaÃ§Ã£o orgÃ¢nica profunda e somatotÃ³pica gradual, indicando Nervos Cranianos como reforÃ§o se necessÃ¡rio.
- Se for MISTA (crise aguda em cima de um quadro crÃ´nico), prescreva e dÃª igual prioridade a ambos (Pontos Ypsilon bilaterais na tÃªmpora + Pontos de Nervos Cranianos no occipital).

Escreva a justificativa clÃ­nica dessa escolha no campo "visaoIntegrativa" e prescreva os pontos exatos em "pontosYNSA".

Responda exclusivamente em JSON vÃ¡lido, seguindo o formato especificado no seu sistema. Seja completo, profundo e verdadeiramente Ãºtil para o usuÃ¡rio.`;

    try {
        let rawText = '';

        // 1. Tentar Gemini primeiro se houver chave configurada
        if (GEMINI_KEY) {
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
                                maxOutputTokens: 8192,
                                responseMimeType: "application/json"
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

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                } else {
                    console.warn('[Oráculo] Gemini retornou status:', geminiRes.status, await geminiRes.text().catch(() => ''));
                }
            } catch (geminiErr) {
                console.warn('[Oráculo] Erro ao consultar Gemini:', geminiErr.message);
            }
        }

        // 2. Fallback resiliente para OpenAI (gpt-4o-mini) se Gemini falhou ou não tiver chave
        if (!rawText && OPENAI_KEY) {
            try {
                console.log('[Oráculo] Acionando fallback OpenAI (gpt-4o-mini)...');
                const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        temperature: 0.3,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userMessage }
                        ],
                        response_format: { type: 'json_object' }
                    })
                });

                if (openaiRes.ok) {
                    const openaiData = await openaiRes.json();
                    rawText = openaiData?.choices?.[0]?.message?.content || '';
                    console.log('✅ [Oráculo] Protocolo gerado via OpenAI gpt-4o-mini com sucesso.');
                } else {
                    console.error('[Oráculo] OpenAI retornou erro:', openaiRes.status, await openaiRes.text().catch(() => ''));
                }
            } catch (openaiErr) {
                console.error('[Oráculo] Erro ao chamar OpenAI:', openaiErr.message);
            }
        }

        if (!rawText) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Erro ao consultar o Oracle. Tente novamente.' })
            };
        }

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
                throw new Error('Resposta da IA nÃ£o Ã© JSON vÃ¡lido');
            }
        }

        // normaliza a estrutura para garantir seguranÃ§a completa no frontend
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

        // Salvar no cache em background para agilizar a resposta ao usuÃ¡rio
        supabase
            .from('xzen_oracle_protocols')
            .upsert({ query: queryKey, protocol: protocol })
            .then(({ error }) => {
                if (error) console.error('Erro ao salvar no cache do Supabase:', error);
                else console.log(`âœ… [OrÃ¡culo Cache] Termo "${queryKey}" salvo no banco.`);
            })
            .catch(err => console.error('Erro inesperado ao salvar no cache:', err));

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
            body: JSON.stringify({ error: 'Erro interno. O Oracle estÃ¡ meditando â€” tente novamente em instantes.' })
        };
    }
};
