// Native fetch available in Node 18+ (Netlify Functions runtime)
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client (Service Role for logging)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Netlify Function: AI Chat
 * Handles AI-powered conversations via LLMGateway & S14 Epistemic Kernel
 * Specialized in YNSA and Traditional Chinese Medicine
 */

// Sistema de rate limiting simples (em memória)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS_PER_HOUR = 100; // Aumentado de 20 para 100 para permitir melhor uso em produção e testes

// Read-only: checks count without registering. Used as fallback when Supabase counts are available.
function peekRateLimit(key, limit = MAX_REQUESTS_PER_HOUR) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    const allowed = recentRequests.length < limit;
    return { allowed, remaining: Math.max(0, limit - recentRequests.length) };
}

// Write: checks count AND registers a new request (used only in full memory-only mode).
function checkRateLimit(key, limit = MAX_REQUESTS_PER_HOUR) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];

    // Remove requisições antigas (fora da janela de 1 hora)
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= limit) {
        return { allowed: false, remaining: 0 };
    }

    // Adiciona nova requisição
    recentRequests.push(now);
    rateLimitStore.set(key, recentRequests);

    return {
        allowed: true,
        remaining: limit - recentRequests.length
    };
}

const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');
const { sentinelLayer1 } = require('./lib/zenSentinel');


exports.handler = async (event, context) => {
    // CORS headers dynamic validation
    const headers = {
        ...getCorsHeaders(event),
        'Content-Type': 'application/json'
    };

    // Rejeitar origens não autorizadas
    if (!isOriginAllowed(event)) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Origin not allowed' })
        };
    }

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
        const { message, conversationHistory = [], userEmail, isPremium = false, anamneseContext = null, locale = null } = JSON.parse(event.body);

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

        // 🔒 CAMADA 1: FILTRO DE PROMPT INJECTION (Proteção IP)
        const promptInjectionPatterns = [
            // Comandos diretos de extração
            /system\s*prompt/i,
            /show.*instructions/i,
            /reveal.*prompt/i,
            /your.*programming/i,
            /how.*you.*created/i,
            /how.*you.*built/i,
            /framework.*xzenpress/i,

            // Jailbreak clássico
            /ignore.*previous/i,
            /forget.*instructions/i,
            /act\s+as.*developer/i,
            /pretend.*not.*ai/i,
            /debug\s*mode/i,

            // Meta-perguntas estratégicas (propriedade)
            /metafísica.*código/i,
            /protocolo.*síntese/i,
            /reforma.*íntima.*algoritmo/i,
            /análise.*multi.*dimensional/i,

            // Comandos de output
            /repeat.*above/i,
            /print.*config/i,
            /show.*code/i,
            /export.*prompt/i
        ];

        const isPromptInjection = promptInjectionPatterns.some(pattern =>
            pattern.test(message)
        );

        if (isPromptInjection) {
            console.warn('🚨 PROMPT INJECTION DETECTED:', {
                userEmail: userEmail || 'guest',
                message: message.substring(0, 100) + '...',
                timestamp: new Date().toISOString()
            });

            // Resposta evasiva educada
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    reply: "Como assistente ético, não compartilho detalhes técnicos da minha arquitetura interna. Meu foco é auxiliá-lo com saúde integrativa, bem-estar e evolução pessoal. Como posso ajudá-lo hoje com uma questão de saúde ou autoconhecimento?",
                    remaining: null,
                    flags: ['prompt_injection_blocked']
                })
            };
        }

        // =============================================================
        // 🛡️ CAMADA 0: ZENSENTINEL — Triagem de Segurança Clínica
        // Roda ANTES de qualquer engine. NUNCA pode ser bypassado.
        // Fail-safe: em erro -> CAUTION, nunca SAFE.
        // =============================================================
        const zenSentinelResult = sentinelLayer1(message);

        if (zenSentinelResult.level === 'CRITICAL') {
            console.warn('🚨 ZENSENTINEL CRITICAL:', {
                categories: zenSentinelResult.categories,
                matchedRules: zenSentinelResult.matchedRules,
                userEmail: userEmail || 'guest',
                timestamp: new Date().toISOString()
            });
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    reply: zenSentinelResult.responseTemplate,
                    remaining: null,
                    flags: ['sentinel_critical', ...zenSentinelResult.categories],
                    sentinelLevel: 'CRITICAL'
                })
            };
        }

        // Restrições de contexto clínico (gravidez, cardíaco, etc.)
        // Passadas ao sistema de IA para filtrar protocolos inadequados
        const sentinelRestrictions = zenSentinelResult.restrictions || [];
        const sentinelCautionNote = zenSentinelResult.level === 'CAUTION'
            ? zenSentinelResult.responseTemplate
            : null;

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

        const rateLimitKey = userEmail || ("guest_ip_" + getClientIp());
        const limit = isPremium ? 100 : 3; // 100 para Premium, 3 para Gratuitos/Visitantes

        // 🔒 CONTROLE DE CUSTOS E LIMITES SEGURO (Supabase + Memory Fallback)
        let isRateLimitAllowed = true;
        let remainingMessages = limit;

        if (supabase) {
            try {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
                const { count, error: countError } = await supabase
                    .from('ai_chat_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_email', rateLimitKey)
                    .gte('created_at', oneHourAgo);

                if (!countError) {
                    const currentCount = count || 0;
                    if (currentCount >= limit) {
                        isRateLimitAllowed = false;
                    }
                    remainingMessages = Math.max(0, limit - currentCount - 1);
                } else {
                    // Supabase count query failed — use read-only memory peek as fallback
                    console.error('Supabase count error, falling back to memory rate limiting:', countError);
                    const rateLimit = peekRateLimit(rateLimitKey, limit);
                    isRateLimitAllowed = rateLimit.allowed;
                    remainingMessages = rateLimit.remaining;
                }
            } catch (err) {
                // Supabase unavailable — use read-only memory peek as fallback
                console.error('Supabase rate limiting query failed, falling back to memory:', err);
                const rateLimit = peekRateLimit(rateLimitKey, limit);
                isRateLimitAllowed = rateLimit.allowed;
                remainingMessages = rateLimit.remaining;
            }
        } else {
            const rateLimit = checkRateLimit(rateLimitKey, limit);
            isRateLimitAllowed = rateLimit.allowed;
            remainingMessages = rateLimit.remaining;
        }

        if (!isRateLimitAllowed) {
            let errorMessage = `Degustação diária concluída! 🌟\n\nVocê sabia que a consistência é a chave para moldar sua epigenética e calibrar seus Guardiões? Acessar o Zen Mentor diariamente ajuda você a se compreender, liberar tensões e otimizar sua vida de forma integral: física, mental e espiritualmente antes que as sobrecargas se transformem em sintomas.\n\nPara continuar este diálogo transformador e ter consultas ilimitadas, assine o plano Premium!`;
            if (!userEmail) {
                errorMessage = `Degustação finalizada (3 mensagens)! 🌟\n\nO Zen Mentor (Self Oracle) é apenas o início. A verdadeira transformação acontece com a prática constante: um espaço seguro sempre disponível para escutar você, ajudar a decifrar a raiz das suas dores e otimizar sua vida física, mental e espiritualmente.\n\nPara dar continuidade ao seu tratamento e liberar consultas ilimitadas, faça o seu login ou assine o plano Premium!`;
            } else if (isPremium) {
                errorMessage = 'Limite de requisições excedido. Para proteger a estabilidade do sistema, tente novamente em 1 hora.';
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

        const { SPECIFIC_PROTOCOLS } = require('./lib/knowledge');

        // ... [Protection Logic omitted for brevity, keeping existing implementation] ...

        // LÓGICA DE PROTOCOLOS ESPECÍFICOS (OVERRIDE CLÍNICO)
        let clinicalContext = "";
        if (SPECIFIC_PROTOCOLS) {
            const lowerMessage = message.toLowerCase();
            const matchedProtocol = SPECIFIC_PROTOCOLS.find(p =>
                p.keywords.some(k => lowerMessage.includes(k.toLowerCase()))
            );

            if (matchedProtocol) {
                clinicalContext = `
### 🚨 PROTOCOLO CLÍNICO ESPECÍFICO DETECTADO: ${matchedProtocol.condition}
${matchedProtocol.instructions_for_ai ? `\n**INSTRUCÃO DE RACIOCÍNIO (Processamento Lógico):**\n${matchedProtocol.instructions_for_ai}\n` : ''}
Para esta condição, você DEVE priorizar a seguinte causa metafísica e orientar o usuário a utilizar a Sessão Mestra para estimular os pontos recomendados. Importante: Você DEVE incluir a tag [ABRIR:sessao-mestra] no final da sua resposta para gerar o botão.

**Causa Metafísica Provável:**
"${matchedProtocol.metafisica}"
`;
                console.log('Clinical Protocol Applied:', matchedProtocol.condition);
            }
        }

        // 🔒 WAVE 2: Invocação da fronteira autorizada via LLMGateway server-side
        const { LLMGateway } = require('./_shared/llm');
        const gateway = LLMGateway.createDefault(undefined, undefined, isPremium);
        const gatewayResult = await gateway.process({
            userMessage: message,
            anamneseContext: [anamneseContext, clinicalContext].filter(Boolean).join('\n\n') || undefined,
            locale: locale || 'pt-BR',
            isPremium: isPremium
        });

        let reply = gatewayResult.text;
        let usageData = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };


        // 🔒 CAMADA 3: DETECÇÃO DE VAZAMENTO (Post-Processing)
        const leakedKeywords = [
            'systemPrompt',
            'system prompt',
            'Framework XZenPress',
            'Algoritmo Mental',
            'Protocolo de Síntese',
            'Valcapelli', // Nunca deve citar autor
            'Gasparetto',
            'ai-chat.js',
            'netlify function',
            'Alexandre Valente', // Criador não deve ser citado
            'propriedade intelectual'
        ];

        const hasLeakage = leakedKeywords.some(keyword =>
            reply.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasLeakage) {
            console.error('🚨 IP LEAKAGE DETECTED IN AI RESPONSE!', {
                userEmail: userEmail || 'guest',
                message: message.substring(0, 100) + '...',
                leakedContent: reply.substring(0, 200) + '...',
                timestamp: new Date().toISOString()
            });

            // Substituir resposta por mensagem segura
            reply = "Desculpe, ocorreu um erro técnico ao processar sua pergunta. Poderia reformulá-la focando em uma questão específica de saúde, bem-estar ou autoconhecimento? Estou aqui para ajudá-lo nessas áreas.";

            // TODO: Log para Supabase security_incidents quando implementado
        }

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

        // 🧩 ZENSENSE PARSER: Extrai o JSON estruturado do LLM
        let finalReply = reply;
        let zensenseData = null;
        try {
            // Remove crases de markdown caso o LLM não obedeça à regra estrita
            const jsonStr = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed.reply) {
                finalReply = parsed.reply;
                zensenseData = {
                    mentor_state: parsed.mentor_state,
                    linguistic_signals: parsed.linguistic_signals
                };
            }
        } catch (e) {
            console.warn('ZenSense Parser Warning: LLM output is not strict JSON', e.message);
            // Fallback robusto para extrair a resposta caso a formatação quebre ou seja truncada
            const match = reply.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/i) || 
                          reply.match(/'reply'\s*:\s*'((?:[^'\\]|\\.)*)(?:'|$)/i);
            if (match) {
                finalReply = match[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\'/g, "'")
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\r/g, '\r');
            }
        }

        // LOGGING TO SUPABASE (PERSISTENCE)
        if (supabase) {
            try {
                const { error: logError } = await supabase
                    .from('ai_chat_logs')
                    .insert([
                        {
                            user_email: rateLimitKey,
                            message: message,
                            response: finalReply,
                            tokens_used: usageData.totalTokens
                        }
                    ]);

                if (logError) {
                    console.error('Failed to log chat to Supabase:', logError);
                } else {
                    console.log('Chat logged successfully for:', userEmail);
                }
            } catch (loggingErr) {
                console.error('Exception logging to Supabase:', loggingErr);
            }
        } else {
            console.warn('Supabase not initialized, chat NOT logged.');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                reply: finalReply,
                remaining: remainingMessages,
                flags: qualityFlags, // Retorna flags para frontend (futuro feedback UI)
                usage: usageData,
                zensense: zensenseData
            })
        };

    } catch (error) {
        console.error('=== ERROR IN AI-CHAT FUNCTION ===');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('================================');

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro interno do servidor',
                message: error.message || 'Unknown error',
                type: error.constructor.name,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};


