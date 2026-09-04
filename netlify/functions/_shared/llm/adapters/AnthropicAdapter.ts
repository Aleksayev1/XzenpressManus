import { ReflectionContext } from '../../../../../src/kernel/types/reflection';
import { ILLMProviderAdapter, ProviderAdapterConfig } from '../LLMProvider';

export class AnthropicAdapter implements ILLMProviderAdapter {
  readonly providerName = 'anthropic';
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config?: ProviderAdapterConfig) {
    this.apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.timeoutMs = config?.timeoutMs || 10000;
  }

  async generate(context: ReflectionContext): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured in server environment');
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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          system: systemPrompt,
          messages: [{ role: 'user', content: userContent }],
          max_tokens: 2048,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const content = data?.content?.[0]?.text;
      if (!content || typeof content !== 'string') {
        throw new Error('Anthropic API returned invalid or empty response payload');
      }

      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
