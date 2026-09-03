import { GuardViolation } from '../../../../src/kernel/types/reflection';
import { RawMeaningEvent } from '../../../../src/kernel/types/meaning';

/**
 * GatewayInputData: Strictly typed input for the LLMGateway.
 * 
 * Invariant: Caller CANNOT provide custom system prompts, arbitrary instructions,
 * provider choices, or model configurations. The caller provides only clinical/conversational data.
 */
export interface GatewayInputData {
  readonly userMessage: string;
  readonly anamneseContext?: string;
  readonly locale: 'pt-BR' | 'en-US';
  readonly isPremium?: boolean;
  readonly rawEvents?: RawMeaningEvent[];
  readonly reflectionId?: string;
}

/**
 * GatewayApplicationResponse: Strictly typed application response from the Gateway.
 * 
 * Invariant: ObservationContract remains encapsulated within the Epistemic Kernel.
 * A unified `text` field provides the approved text or the deterministic fallback.
 */
export interface GatewayApplicationResponse {
  readonly status: 'PASS' | 'REJECT' | 'INSUFFICIENT';
  readonly text: string;
  readonly isFallback: boolean;
  readonly violation?: GuardViolation;
  readonly observationId?: string;
  readonly reflectionId?: string;
}
