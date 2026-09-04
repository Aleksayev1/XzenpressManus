"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAdapter = void 0;
class OpenAIAdapter {
    providerName = 'openai';
    apiKey;
    timeoutMs;
    constructor(config) {
        this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || '';
        this.timeoutMs = config?.timeoutMs || 10000;
    }
    async generate(context) {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY is not configured in server environment');
        }
        const systemPrompt = `Você é uma inteligência integrativa rigorosa. Sua tarefa é acolher a reflexão humana e contextualizá-la estritamente em termos da observação matemática realizada. NUNCA faça afirmações categóricas de identidade (quem a pessoa é), NUNCA imponha teleologia ou desígnio evolutivo, e NUNCA declare causalidade determinística sem evidência.
REGRA DE IDIOMA MULTILÍNGUE: Responda SEMPRE e exclusivamente no mesmo idioma que o usuário utilizar na mensagem ou no idioma solicitado pelo locale (${context.locale || 'pt-BR'}). Se o usuário falar em inglês, responda nativamente em inglês. Se falar em espanhol, responda em espanhol. Adapte o seu tom terapêutico acolhedor nativamente para a língua do usuário.`;
        const userContent = JSON.stringify({
            humanReflection: context.humanReflection.text,
            observationMetric: {
                deltaS: context.observation.deltaS,
                matrix: context.observation.matrix,
            },
            locale: context.locale,
            action: context.allowedAction,
        });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContent },
                    ],
                    temperature: 0.3,
                    max_tokens: 2048,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`OpenAI API Error ${res.status}: ${errText}`);
            }
            const data = await res.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content || typeof content !== 'string') {
                throw new Error('OpenAI API returned invalid or empty response payload');
            }
            return content;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}
exports.OpenAIAdapter = OpenAIAdapter;
