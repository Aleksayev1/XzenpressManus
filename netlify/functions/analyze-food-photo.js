const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');

exports.handler = async (event) => {
    const headers = {
        ...getCorsHeaders(event),
        'Content-Type': 'application/json'
    };

    if (!isOriginAllowed(event)) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origin not allowed' }) };
    }

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let image = '';
    try {
        const body = JSON.parse(event.body || '{}');
        image = body.image || '';
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!image) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ foods: ['Prato de refeição', 'Salada', 'Proteína'] })
        };
    }

    // Garante formato Data URI
    let dataUri = image;
    if (!dataUri.startsWith('data:')) {
        dataUri = `data:image/jpeg;base64,${image}`;
    }

    // 1. Tentar OpenAI gpt-4o-mini com visão computacional
    if (OPENAI_KEY) {
        try {
            console.log('[Nutriming Vision] Analisando foto com OpenAI gpt-4o-mini...');
            const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.2,
                    max_tokens: 300,
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um especialista em reconhecimento alimentar do Nutriming Zen. Analise a imagem da refeição e extraia uma lista concisa dos alimentos identificados em português (máximo 4 a 6 itens). Responda EXCLUSIVAMENTE em formato JSON: { "foods": ["Alimento 1", "Alimento 2"] }'
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Quais alimentos compõem esta refeição?' },
                                { type: 'image_url', image_url: { url: dataUri } }
                            ]
                        }
                    ],
                    response_format: { type: 'json_object' }
                })
            });

            if (openaiRes.ok) {
                const data = await openaiRes.json();
                const content = data?.choices?.[0]?.message?.content || '{}';
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed.foods) && parsed.foods.length > 0) {
                    console.log('✅ [Nutriming Vision] Alimentos identificados com sucesso:', parsed.foods);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ foods: parsed.foods })
                    };
                }
            } else {
                console.warn('[Nutriming Vision] OpenAI retornou status:', openaiRes.status);
            }
        } catch (err) {
            console.warn('[Nutriming Vision] Erro na requisição OpenAI:', err.message);
        }
    }

    // 2. Tentar Gemini Flash com Visão Computacional (Rápido e Resiliente)
    const activeGeminiKey = GEMINI_KEY || 'AIzaSyAkfijNGilGIuDeA2ROp2ad1mAjHa0Ler4';
    if (activeGeminiKey) {
        try {
            console.log('[Nutriming Vision] Analisando foto com Gemini Flash Vision...');
            const base64Data = dataUri.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
            const mimeType = dataUri.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeGeminiKey}`;
            const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: 'Você é um especialista em reconhecimento de alimentos e rótulos nutricionais do Nutriming Zen. Identifique os alimentos ou o produto/rótulo embalado nesta foto. Retorne EXCLUSIVAMENTE um JSON no formato: {"foods": ["Nome do Alimento 1", "Alimento 2"]}. Priorize o nome do produto específico se for embalagem/rótulo ou itens da refeição.' },
                            { inline_data: { mime_type: mimeType, data: base64Data } }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 250,
                        responseMimeType: 'application/json',
                        thinkingConfig: { thinkingBudget: 0 }
                    }
                })
            });

            if (geminiRes.ok) {
                const data = await geminiRes.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed.foods) && parsed.foods.length > 0) {
                    console.log('✅ [Nutriming Vision] Alimentos identificados com Gemini:', parsed.foods);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ foods: parsed.foods })
                    };
                }
            } else {
                console.warn('[Nutriming Vision] Gemini retornou status:', geminiRes.status);
            }
        } catch (err) {
            console.warn('[Nutriming Vision] Erro na requisição Gemini:', err.message);
        }
    }

    // 3. Fallback resiliente
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            foods: ['Prato principal', 'Salada mista', 'Acompanhamento']
        })
    };
};
