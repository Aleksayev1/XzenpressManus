import { ReflectionContext } from '../../../../src/kernel/types/reflection';
import { LLMProvider as KernelLLMProvider } from '../../../../src/kernel/services/reflection/ReflectionPipelineE2E';

export type LLMProvider = KernelLLMProvider;

export interface ProviderAdapterConfig {
  readonly apiKey?: string;
  readonly timeoutMs?: number;
}

export interface ILLMProviderAdapter extends LLMProvider {
  readonly providerName: 'anthropic' | 'gemini' | 'openai';
  generate(context: ReflectionContext): Promise<string>;
}
