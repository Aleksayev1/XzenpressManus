import { randomUUID } from 'crypto';
import { RawMeaningEvent, TemporalWindow, MeaningObservationState } from '../../types/meaning';
import { ReflectionContext, GuardTelemetryEvent, GuardViolation } from '../../types/reflection';
import { EvolutionMeaningPipeline } from '../evolution/EvolutionMeaningPipeline';
import { ObservationFactory } from '../../lib/reflection/ObservationFactory';
import { RuntimeBoundary } from '../../lib/reflection/RuntimeBoundary';
import { EpistemicGuard } from '../../lib/reflection/EpistemicGuard';

export interface LLMProvider {
  /**
   * One-shot generation strictly receiving the sanitized ReflectionContext.
   */
  generate(context: ReflectionContext): Promise<string>;
}

export interface TelemetrySink {
  /**
   * Decoupled side-channel recorder for telemetry events.
   */
  record(event: GuardTelemetryEvent): void | Promise<void>;
}

export interface E2EPipelineInput {
  readonly rawEvents: RawMeaningEvent[];
  readonly window?: TemporalWindow;
  readonly humanText: string;
  readonly locale: 'pt-BR' | 'en-US';
  readonly reflectionId?: string;
}

export type E2EPipelineResult =
  | {
      readonly status: 'PASS';
      readonly text: string;
      readonly observationId: string;
      readonly reflectionId: string;
    }
  | {
      readonly status: 'REJECT';
      readonly fallbackText: string;
      readonly violation: GuardViolation;
      readonly observationId: string;
      readonly reflectionId: string;
    }
  | {
      readonly status: 'INSUFFICIENT';
      readonly reason: string;
    };

/**
 * S14-D: E2E Pipeline integrating S13 -> S14-A -> Context Isolation -> One-Shot LLM -> S14-B Guard -> Presentation / Fallback + Telemetry
 */
export class ReflectionPipelineE2E {
  constructor(
    private readonly llm: LLMProvider,
    private readonly telemetry?: TelemetrySink
  ) {}

  async process(input: E2EPipelineInput): Promise<E2EPipelineResult> {
    // 1. S13: Temporal Engine (Deterministic Validation, Windowing, Deduplication, Recurrence)
    const pipelineResult = EvolutionMeaningPipeline.process(input.rawEvents, input.window);

    // Early exit if INSUFFICIENT: LLM is NEVER called
    if (pipelineResult.state === MeaningObservationState.INSUFFICIENT) {
      return {
        status: 'INSUFFICIENT',
        reason: pipelineResult.reason || 'UNKNOWN_INSUFFICIENT',
      };
    }

    // 2. S14-A: Mathematical Integrity Boundary & Observation Contract
    const observation = ObservationFactory.createObservation(pipelineResult);

    // 3. S14-A: Runtime Boundary (Zod strict validation & Context Isolation)
    const reflectionId = input.reflectionId || randomUUID();
    const context: ReflectionContext = RuntimeBoundary.parseReflectionContext({
      observation,
      humanReflection: {
        reflectionId,
        observationId: observation.observationId,
        text: input.humanText,
        createdAt: new Date().toISOString(),
        source: 'HUMAN_REFLECTION',
      },
      locale: input.locale,
      allowedAction: 'TRANSLATE',
    });

    // 4. One-Shot LLM Call: strictly single invocation, no retry loop, no softening bypass
    const llmOutput = await this.llm.generate(context);

    // 5. S14-B: Epistemic Guard + Lateral Telemetry
    const guardResult = EpistemicGuard.evaluate(
      { llmOutputText: llmOutput, context },
      (event) => {
        try {
          this.telemetry?.record(event);
        } catch {
          // Invariant: telemetry failure MUST NOT alter the epistemic decision
        }
      }
    );

    // 6. Resolution
    if (guardResult.status === 'PASS') {
      return {
        status: 'PASS',
        text: guardResult.text,
        observationId: observation.observationId,
        reflectionId,
      };
    }

    // REJECT: Original LLM output is NOT returned, NOT persisted, NOT sent to UI, NOT included in fallback.
    return {
      status: 'REJECT',
      fallbackText: guardResult.fallback,
      violation: guardResult.reason,
      observationId: observation.observationId,
      reflectionId,
    };
  }
}
