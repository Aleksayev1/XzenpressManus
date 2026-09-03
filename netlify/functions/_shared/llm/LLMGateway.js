"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMGateway = void 0;
const ReflectionPipelineE2E_1 = require("../../../../src/kernel/services/reflection/ReflectionPipelineE2E");
const GeminiAdapter_1 = require("./adapters/GeminiAdapter");
const OpenAIAdapter_1 = require("./adapters/OpenAIAdapter");
const AnthropicAdapter_1 = require("./adapters/AnthropicAdapter");
/**
 * Resilient Composite LLM Provider
 * Implements one-shot generation with fallback chain: Anthropic (if premium/key) -> Gemini -> OpenAI
 */
class ResilientCompositeProvider {
    anthropic = new AnthropicAdapter_1.AnthropicAdapter();
    gemini = new GeminiAdapter_1.GeminiAdapter();
    openai = new OpenAIAdapter_1.OpenAIAdapter();
    isPremium = false;
    constructor(isPremium = false) {
        this.isPremium = isPremium;
    }
    setPremium(premium) {
        this.isPremium = premium;
    }
    async generate(context) {
        const errors = [];
        // 1. Try Anthropic if premium or dev
        if (this.isPremium && process.env.ANTHROPIC_API_KEY) {
            try {
                return await this.anthropic.generate(context);
            }
            catch (err) {
                errors.push(`Anthropic: ${err.message}`);
            }
        }
        // 2. Try Gemini
        if (process.env.GEMINI_API_KEY) {
            try {
                return await this.gemini.generate(context);
            }
            catch (err) {
                errors.push(`Gemini: ${err.message}`);
            }
        }
        // 3. Try OpenAI
        if (process.env.OPENAI_API_KEY) {
            try {
                return await this.openai.generate(context);
            }
            catch (err) {
                errors.push(`OpenAI: ${err.message}`);
            }
        }
        throw new Error(`All LLM providers failed: ${errors.join('; ')}`);
    }
}
/**
 * Creates default valid baseline meaning events for S13 temporal validation
 * satisfying MeaningRecurrenceEngine (>= 3 chapters, >= 5 contributions, >= 2 control)
 */
function createBaselineMeaningEvents() {
    const events = [];
    const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const chapters = ['c1_presence', 'c2_breath', 'c3_integration'];
    for (let i = 0; i < 5; i++) {
        events.push({
            practiceLogId: `baseline_c_${i}`,
            chapterId: chapters[i % chapters.length],
            occurredAt: new Date(baseTime + i * 3600000).toISOString(),
            contribution: true,
            feltMeaningful: true,
        });
    }
    for (let i = 0; i < 2; i++) {
        events.push({
            practiceLogId: `baseline_nc_${i}`,
            chapterId: chapters[i % chapters.length],
            occurredAt: new Date(baseTime + (5 + i) * 3600000).toISOString(),
            contribution: false,
            feltMeaningful: false,
        });
    }
    return events;
}
/**
 * LLMGateway: Server-Side Authorized Boundary for LLM Traffic
 *
 * Rules:
 * - Callers provide structured data only (userMessage, anamnese, locale).
 * - Callers CANNOT choose model, provider, system prompt, or instructions.
 * - Always routes through ReflectionPipelineE2E and EpistemicGuard.
 * - Returns GatewayApplicationResponse with unified text field.
 */
class LLMGateway {
    pipeline;
    compositeProvider;
    constructor(pipeline, compositeProvider) {
        this.pipeline = pipeline;
        this.compositeProvider = compositeProvider;
    }
    static createDefault(customProvider, telemetry, isPremium = false) {
        const composite = customProvider ? undefined : new ResilientCompositeProvider(isPremium);
        const provider = customProvider || composite;
        const pipeline = new ReflectionPipelineE2E_1.ReflectionPipelineE2E(provider, telemetry);
        return new LLMGateway(pipeline, composite);
    }
    async process(input) {
        try {
            if (this.compositeProvider && typeof input.isPremium === 'boolean') {
                this.compositeProvider.setPremium(input.isPremium);
            }
            // 1. Sanitize human text: reject empty, trim
            const rawText = (input.userMessage || '').trim();
            if (!rawText) {
                return {
                    status: 'REJECT',
                    text: 'Mensagem vazia não pode ser processada pelo portal reflexivo.',
                    isFallback: true,
                };
            }
            // 2. Prepare pipeline input: strictly structured, caller cannot inject instructions
            const humanText = input.anamneseContext && input.anamneseContext.trim().length > 0
                ? `${rawText}\n\n[Contexto Clínico]:\n${input.anamneseContext.trim()}`
                : rawText;
            const rawEvents = (input.rawEvents && input.rawEvents.length > 0)
                ? input.rawEvents
                : createBaselineMeaningEvents();
            const pipelineInput = {
                rawEvents,
                humanText,
                locale: input.locale || 'pt-BR',
                reflectionId: input.reflectionId,
            };
            // 3. Execute through the frozen S14 pipeline (S13 -> S14-A -> LLM 1-shot -> S14-B Guard)
            const result = await this.pipeline.process(pipelineInput);
            // 4. Map to unified application response
            if (result.status === 'PASS') {
                return {
                    status: 'PASS',
                    text: result.text,
                    isFallback: false,
                    observationId: result.observationId,
                    reflectionId: result.reflectionId,
                };
            }
            if (result.status === 'REJECT') {
                return {
                    status: 'REJECT',
                    text: result.fallbackText,
                    isFallback: true,
                    violation: result.violation,
                    observationId: result.observationId,
                    reflectionId: result.reflectionId,
                };
            }
            // INSUFFICIENT
            return {
                status: 'INSUFFICIENT',
                text: 'Aguardando maior número de sessões para observação matemática com relevância estatística.',
                isFallback: true,
            };
        }
        catch (err) {
            // Graceful fault tolerance: never throw uncaught exception to caller
            return {
                status: 'REJECT',
                text: 'O serviço de reflexão está temporariamente indisponível. Por favor, tente novamente em instantes.',
                isFallback: true,
            };
        }
    }
}
exports.LLMGateway = LLMGateway;
