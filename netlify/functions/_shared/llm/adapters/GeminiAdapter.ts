import { ReflectionContext } from '../../../../../src/kernel/types/reflection';
import { ILLMProviderAdapter, ProviderAdapterConfig } from '../LLMProvider';

export class GeminiAdapter implements ILLMProviderAdapter {
  readonly providerName = 'gemini';
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config?: ProviderAdapterConfig) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
    this.timeoutMs = config?.timeoutMs || 10000;
  }

  async generate(context: ReflectionContext): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in server environment');
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText || typeof candidateText !== 'string') {
        throw new Error('Gemini API returned invalid or empty response payload');
      }

      return candidateText;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
