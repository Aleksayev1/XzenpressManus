// Netlify Scheduled Function: weekly-knowledge-refresh
// Roda automaticamente toda segunda-feira às 03:00 UTC
// Atualiza o banco de conhecimento do Xzenpress no Supabase via Gemini AI
//
// Para agendar, adicione ao netlify.toml:
// [functions."weekly-knowledge-refresh"]
//   schedule = "0 3 * * 1"

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Tópicos que a IA deve pesquisar e atualizar semanalmente
const RESEARCH_TOPICS = [
    {
        topic: 'suplementos_novidades',
        prompt: `Você é um pesquisador de nutrição funcional e biohacking atualizando um banco de dados científico.
Liste as 5 descobertas ou estudos mais relevantes das últimas semanas sobre:
- Novos achados sobre suplementos (vitaminas, minerais, peptídeos, adaptógenos)
- Interações medicamentosas descobertas recentemente
- Atualizações sobre epigenética e nutrição
- Estudos brasileiros sobre deficiências nutricionais

Responda em JSON: { "discoveries": [ { "title": "...", "summary": "...", "nutrient": "...", "source": "...", "date": "...", "category": "suplemento|interacao|epigenetica|deficiencia" } ] }`,
    },
    {
        topic: 'interacoes_novas',
        prompt: `Você é um farmacologista clínico atualizando alertas de segurança.
Liste as 3-5 interações medicamentosas ou suplemento-medicamento mais importantes para atualizar em um banco de dados de saúde integrativa brasileiro.
Foco em interações com: Magnésio, Vitamina D, Ômega-3, Ashwagandha, probióticos, e medicamentos comuns no Brasil (captopril, losartana, metformina, fluoxetina, omeprazol).

Responda em JSON: { "interactions": [ { "substancia1": "...", "substancia2": "...", "nivel": "grave|moderada|leve", "mecanismo": "...", "efeito": "...", "recomendacao": "...", "fonte": "..." } ] }`,
    },
    {
        topic: 'deficiencias_brasil',
        prompt: `Você é um especialista em saúde pública e nutrição brasileira.
Atualize as informações mais recentes sobre deficiências nutricionais no Brasil, considerando dados do ENANI, IBGE, POF e publicações do Ministério da Saúde.
Foque em: prevalências atuais, grupos de risco, regiões mais afetadas, e novas recomendações.

Responda em JSON: { "updates": [ { "nutriente": "...", "prevalencia": "...", "gruposRisco": ["..."], "recomendacao": "...", "fonte": "..." } ] }`,
    },
    {
        topic: 'zengrowth_social_scripts',
        prompt: `Você é o ZenGrowth Engine do XZenPress.
Gere 4 roteiros de vídeo curto (30-60s) e postagens para redes sociais com base nos 4 pilares:
1. medicina (XZenPress Medicina Integrativa & VFC)
2. acupressao (Acupressão em 60 segundos)
3. sessao-mestra (Sessão Mestra de Biofeedback)
4. self-oracle (Self Oracle IA de Saúde)

Para cada pilar, inclua um gancho neurocientífico impactante de 3s, roteiro narrativo para o MoneyPrinterTurbo, copys formatadas com emojis/hashtags para Instagram, TikTok, LinkedIn e WhatsApp, e a tag utm_content recomendada.

Responda em JSON rigoroso:
{
  "queue": [
    {
      "pillar": "medicina|acupressao|sessao-mestra|self-oracle",
      "hook": "...",
      "script_mpt": "Texto contínuo de narração para voz neural do MoneyPrinterTurbo...",
      "copy_instagram": "...",
      "copy_tiktok": "...",
      "copy_linkedin": "...",
      "copy_whatsapp": "...",
      "utm_content_tag": "hook-..."
    }
  ]
}`
    }
];

async function callGemini(prompt) {
    if (GEMINI_KEY) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 2048,
                            responseMimeType: 'application/json',
                        }
                    })
                }
            );

            if (res.ok) {
                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                try {
                    return JSON.parse(text);
                } catch {
                    const match = text.match(/(\{[\s\S]*\})/);
                    return match ? JSON.parse(match[1]) : {};
                }
            }
        } catch (geminiErr) {
            console.warn('[Weekly Refresh] Gemini falhou, tentando fallback OpenAI...', geminiErr.message);
        }
    }

    if (OPENAI_KEY) {
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.2,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' }
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content || '{}';
                return JSON.parse(text);
            }
        } catch (openaiErr) {
            console.error('[Weekly Refresh] OpenAI falhou:', openaiErr.message);
        }
    }

    throw new Error('Nenhum provedor de IA (Gemini/OpenAI) disponível para Weekly Refresh.');
}

exports.handler = async (event) => {
    console.log('🔄 Xzenpress Weekly Knowledge Refresh iniciado:', new Date().toISOString());

    if (!supabaseUrl || !supabaseKey || (!GEMINI_KEY && !OPENAI_KEY)) {
        console.error('❌ Variáveis de ambiente ausentes');
        return { statusCode: 500, body: JSON.stringify({ error: 'Config incompleta' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results = [];

    for (const { topic, prompt } of RESEARCH_TOPICS) {
        try {
            console.log(`📚 Pesquisando tópico: ${topic}`);
            const aiData = await callGemini(prompt);

            if (topic === 'zengrowth_social_scripts' && aiData.queue) {
                for (const item of aiData.queue) {
                    const utmLink = `https://xzenpress.com/${item.pillar}?utm_source=social&utm_medium=video&utm_campaign=${item.pillar}&utm_content=${item.utm_content_tag || 'post'}`;
                    await supabase.from('zen_content_queue').insert({
                        topic: item.pillar,
                        pillar: item.pillar,
                        hook: item.hook || '',
                        script_mpt: item.script_mpt || '',
                        copy_instagram: item.copy_instagram || '',
                        copy_tiktok: item.copy_tiktok || '',
                        copy_linkedin: item.copy_linkedin || '',
                        copy_whatsapp: item.copy_whatsapp || '',
                        utm_link: utmLink,
                        utm_content_tag: item.utm_content_tag || '',
                        status: 'pending',
                        auto_upload_ready: false
                    });
                }
                console.log('✅ Roteiros ZenGrowth salvos na fila zen_content_queue com status PENDING');
            }

            // Salvar no Supabase na tabela xzenpress_knowledge
            const { error } = await supabase
                .from('xzenpress_knowledge')
                .upsert({
                    topic,
                    data: aiData,
                    updated_at: new Date().toISOString(),
                    version: Date.now(),
                }, { onConflict: 'topic' });

            if (error) {
                console.error(`❌ Erro ao salvar ${topic}:`, error.message);
                results.push({ topic, status: 'error', error: error.message });
            } else {
                console.log(`✅ Tópico atualizado: ${topic}`);
                results.push({ topic, status: 'updated' });
            }

            // Aguardar 2s entre chamadas para não sobrecarregar a API
            await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
            console.error(`❌ Erro no tópico ${topic}:`, err.message);
            results.push({ topic, status: 'error', error: err.message });
        }
    }

    // Registrar o log da execução
    await supabase.from('xzenpress_knowledge').upsert({
        topic: '_last_refresh_log',
        data: { results, timestamp: new Date().toISOString() },
        updated_at: new Date().toISOString(),
        version: Date.now(),
    }, { onConflict: 'topic' });

    console.log('✅ Refresh concluído:', results);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Refresh concluído', results })
    };
};
