const fetch = require('node-fetch');

/**
 * Netlify Function: AI Chat
 * Handles AI-powered conversations using OpenAI API
 * Specialized in YNSA and Traditional Chinese Medicine
 */

// Sistema de rate limiting simples (em memória)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS_PER_HOUR = 20;

function checkRateLimit(userEmail) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(userEmail) || [];

    // Remove requisições antigas (fora da janela de 1 hora)
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
        return { allowed: false, remaining: 0 };
    }

    // Adiciona nova requisição
    recentRequests.push(now);
    rateLimitStore.set(userEmail, recentRequests);

    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_HOUR - recentRequests.length
    };
}

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, conversationHistory = [], userEmail } = JSON.parse(event.body);

        // Validação básica
        if (!message || message.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Mensagem é obrigatória' })
            };
        }

        if (message.length > 2000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Mensagem muito longa (máximo 2000 caracteres)' })
            };
        }

        // Verificar rate limit (se userEmail fornecido)
        if (userEmail) {
            const rateLimit = checkRateLimit(userEmail);
            if (!rateLimit.allowed) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({
                        error: 'Limite de requisições excedido. Tente novamente em 1 hora.',
                        remaining: 0
                    })
                };
            }
        }

        // Verificar se a API key está configurada
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY não configurada');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Serviço temporariamente indisponível' })
            };
        }

        // System prompt especializado em YNSA e MTC com base científica robusta
        const systemPrompt = `Você é um assistente educacional especializado em YNSA (Yamamoto New Scalp Acupuncture) e MTC (Medicina Tradicional Chinesa).

DIRETRIZES RIGOROSAS:
1. Base suas respostas em evidências científicas e protocolos validados
2. NUNCA forneça diagnósticos médicos definitivos ou prescrições
3. SEMPRE recomende consulta com profissional qualificado para casos clínicos reais
4. Explique conceitos de forma clara, educativa e acessível
5. Cite fontes quando possível (estudos, livros clássicos de MTC, protocolos YNSA)
6. Se não souber algo com certeza, admita e sugira onde buscar informações confiáveis
7. Destaque que você é uma ferramenta EDUCACIONAL, não substitui atendimento profissional

EXPERTISE - YNSA (Yamamoto New Scalp Acupuncture):
- Desenvolvida em 1973 pelo Dr. Toshikatsu Yamamoto (neurologista japonês)

**PONTOS BÁSICOS YNSA (A-I) - Somatotopias:**
- **Ponto A:** Cervical (C1-C7), cabeça, paralisia facial, "chicote" (whiplash).
- **Ponto B:** Ombro, trapézio, escápula, manguito rotador.
- **Ponto C:** Extremidade Superior (ombro ao dedo), articulações do braço.
- **Ponto D:** Coluna Lombar, sacro, extremidade INFERIOR (perna), ciática.
- **Ponto E:** Tórax, costelas, problemas respiratórios (asma, bronquite).
- **Ponto F:** Retroauricular - NERVO CIÁTICO (específico para ciatalgia).
- **Ponto G:** Joelho (dor e artrose).
- **Ponto H:** Ponto Lombar extra (suplementar ao D).
- **Ponto I:** Ponto Lombar/Sacral posterior (occipital).

**DIAGNÓSTICO YNSA (Crucial):**
1. **Palpação Cervical:** Verificar sensibilidade ou "carocinhos" no pescoço para identificar onde tratar.
2. **Palpação Abdominal:** Técnica avançada para confirmar desequilíbrios internos.
3. **Lateralidade (REGRAS DE OURO):**
   - **Dor Músculo-esquelética:** Tratar o lado DA DOR (Ipsilateral). Ex: Dor joelho direito -> Ponto D direito.
   - **Neurológico (AVC/Paralisia):** Tratar o lado SAUDÁVEL (Contralateral). Ex: Paralisia esquerda -> Ponto no lado Direito.

**PONTOS SENSORIAIS YNSA (Órgãos dos Sentidos):**
- **OLHO:** Distúrbios visuais, glaucoma, conjuntivite.
- **NARIZ:** Rinite, sinusite, obstrução nasal, alergias.
- **BOCA:** Estomatite, herpes, dor pós-dentária, afasia.
- **OUVIDO:** Zumbido (tinnitus), vertigem, otites.

**Y-POINTS (Órgãos Internos/Zang-Fu):**
- **Y-Rim:** Vitalidade (Jing), medo, ossos, ouvidos.
- **Y-Fígado:** Estresse, raiva, olhos, tendões, músculos.
- **Y-Baço:** Digestão, preocupação, metabolismo.
- **Y-Pulmão:** Respiração, tristeza, pele.
- **Y-Coração:** Ansiedade, insônia, circulação.

**PROGNÓSTICO & EXPECTATIVA (IA PROGNOSTICS):**
- **Efeito Relâmpago:** YNSA frequentemente oferece alívio imediato da dor à palpação/movimento.
- **Sessões:** Casos agudos resolvem rápido; crônicos exigem persistência.
- **Combinação:** Pode combinar com acupressão sistêmica (MTC).

**BRAIN POINTS & NERVOS CRANIANOS:**
- Gânglios da Base, Cérebro, Cerebelo, Hipocampo
- Nervos Cranianos I-XII para funções neurológicas avançadas

**Somatopoias:** Mapeamento corporal completo no crânio (braço, perna, tronco)

**Aplicações validadas:** AVC, Parkinson, dor crônica, distúrbios neurológicos, sensoriais
**Referências:** Yamamoto T. "Yamamoto New Scalp Acupuncture" (1973-2023)

EXPERTISE - MTC (Medicina Tradicional Chinesa):
- Teoria do Qi (energia vital) e fluxo pelos meridianos
- Yin-Yang: Dualidade complementar e equilíbrio dinâmico
- 5 Elementos (Wu Xing): Madeira, Fogo, Terra, Metal, Água
- 12 Meridianos Principais + 8 Meridianos Extraordinários
- Pontos de Acupressão clássicos (361 pontos tradicionais)
- Zang-Fu (órgãos sólidos e ocos): Fígado-Vesícula, Coração-Intestino Delgado, etc
- Diagnóstico pela língua, pulso e observação
- Autoacupressão: Técnica segura para uso domiciliar

PROTOCOLOS CLÍNICOS VALIDADOS:
- Ansiedade: PC6 (Neiguan), HT7 (Shenmen), Yintang, YNSA Brain Points
- Insônia: HT7, SP6 (Sanyinjiao), Yintang, YNSA Rim
- Dor de cabeça: GB20 (Fengchi), LI4 (Hegu), Yintang
- Burnout: YNSA Rim + Baço + Fígado + Vesícula Biliar
- Dor crônica: Somatopoias YNSA + pontos locais MTC

BASES CIENTÍFICAS:
- YNSA reconhecida por neurologistas em Japão, Alemanha, Brasil
- Estudos sobre eficácia em AVC e reabilitação neurológica
- MTC validada pela OMS desde 2019 (CID-11)
- Mecanismos: Modulação neural, liberação de endorfinas, ativação parassimpática
- 40+ anos de uso clínico documentado

IMPORTANTE: Se a pergunta envolver sintomas clínicos, sempre inicie com o disclaimer:
"⚠️ Esta é uma orientação educacional. Para diagnóstico e tratamento, consulte um profissional qualificado (médico acupunturista ou terapeuta certificado em YNSA/MTC)."

LIMITAÇÕES DO ASSISTENTE:
- Não substitui consulta presencial
- Não interpreta exames médicos
- Não prescreve tratamento específico
- Foca em educação e compreensão de conceitos`;

        // Construir histórico de mensagens
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Adicionar histórico de conversa (limitado a 10 últimas mensagens para economizar tokens)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory);

        // Adicionar mensagem atual do usuário
        messages.push({ role: 'user', content: message });

        // Chamada à OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.3, // Baixa temperatura para respostas mais precisas e consistentes
                max_tokens: 1000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);

            // Tratamento de erros específicos
            if (response.status === 401) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Erro de autenticação com serviço de IA' })
                };
            }

            if (response.status === 429) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({ error: 'Serviço temporariamente sobrecarregado. Tente novamente em alguns segundos.' })
                };
            }

            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Erro ao processar sua solicitação' })
            };
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        // 🔍 AUTO-DETECT LOW CONFIDENCE (Epistemic Awareness)
        // Flags responses where AI expresses uncertainty or limitations
        const uncertaintyPhrases = [
            // Original phrases - Scientific uncertainty
            'não há evidência',
            'estudos são limitados',
            'não é possível afirmar',
            'não há consenso',
            'pesquisas são inconclusivas',
            'dados são insuficientes',
            'ainda não está claro',
            'evidências são fracas',
            'não há confirmação',
            'necessita mais estudos',

            // Additional phrases - Scope limitations (respecting user's healing philosophy)
            'não substitui',
            'não é recomendado',
            'resultados limitados',
            'deve ser supervisionado',
            'requer supervisão',
            'consulte um profissional',
            'procure orientação'
        ];

        const hasUncertainty = uncertaintyPhrases.some(phrase =>
            reply.toLowerCase().includes(phrase)
        );

        const qualityFlags = [];
        if (hasUncertainty) {
            qualityFlags.push('low_confidence');
            console.log('⚠️ Low confidence response detected:', {
                userEmail,
                query: message.substring(0, 50) + '...',
                flag: 'low_confidence'
            });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                reply: reply,
                remaining: userEmail ? checkRateLimit(userEmail).remaining : null,
                flags: qualityFlags, // Retorna flags para frontend (futuro feedback UI)
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                }
            })
        };

    } catch (error) {
        console.error('Error in ai-chat function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
