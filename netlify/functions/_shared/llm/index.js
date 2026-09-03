var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/_shared/llm/index.ts
var index_exports = {};
__export(index_exports, {
  AnthropicAdapter: () => AnthropicAdapter,
  GeminiAdapter: () => GeminiAdapter,
  LLMGateway: () => LLMGateway,
  OpenAIAdapter: () => OpenAIAdapter
});
module.exports = __toCommonJS(index_exports);

// src/kernel/services/reflection/ReflectionPipelineE2E.ts
var import_crypto4 = require("crypto");

// src/kernel/lib/meaning/MeaningTemporalValidator.ts
var ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
var MeaningTemporalValidator = class {
  /**
   * Checks if a given string is a valid ISO 8601 date string.
   * Two-phase validation: regex structure first, then semantic validity via Date parsing.
   */
  static isValidOccurredAt(dateStr) {
    if (!dateStr || dateStr.trim() === "") return false;
    if (!ISO_8601_REGEX.test(dateStr.trim())) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  /**
   * Filters an array of RawMeaningEvent, returning only those with a strictly valid occurredAt.
   * The returned array is typed as MeaningEvent[], guaranteeing occurredAt is a string.
   */
  static filterValidEvents(rawEvents) {
    return rawEvents.filter((event) => this.isValidOccurredAt(event.occurredAt));
  }
  /**
   * Validates if a TemporalWindow is well-formed and logically sound (start <= end).
   */
  static isWindowValid(window) {
    if (!this.isValidOccurredAt(window.start) || !this.isValidOccurredAt(window.end)) return false;
    const startTime = new Date(window.start).getTime();
    const endTime = new Date(window.end).getTime();
    return startTime <= endTime;
  }
  /**
   * Filters an array of MeaningEvent to only include those within the given inclusive TemporalWindow.
   * Assumes the window has already been validated via isWindowValid.
   */
  static filterWithinWindow(events, window) {
    if (!window) return events;
    const startTime = new Date(window.start).getTime();
    const endTime = new Date(window.end).getTime();
    return events.filter((event) => {
      const eventTime = new Date(event.occurredAt).getTime();
      return eventTime >= startTime && eventTime <= endTime;
    });
  }
  /**
   * Deduplicates events by practiceLogId.
   * If two events have the same practiceLogId but divergent payloads (contribution, feltMeaningful, chapterId),
   * returns hasConflict = true. Otherwise, collapses into a single event.
   */
  static deduplicateEvents(events) {
    const map = /* @__PURE__ */ new Map();
    for (const event of events) {
      if (map.has(event.practiceLogId)) {
        const existing = map.get(event.practiceLogId);
        if (existing.contribution !== event.contribution || existing.feltMeaningful !== event.feltMeaningful || existing.chapterId !== event.chapterId) {
          return { events: [], hasConflict: true };
        }
      } else {
        map.set(event.practiceLogId, event);
      }
    }
    return { events: Array.from(map.values()), hasConflict: false };
  }
  /**
   * Sorts events chronologically (ascending) by their occurredAt timestamp.
   * Deterministic ordering.
   */
  static sortEvents(events) {
    return [...events].sort((a, b) => {
      const timeDiff = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.practiceLogId.localeCompare(b.practiceLogId);
    });
  }
};

// src/kernel/lib/meaning/MeaningRecurrenceEngine.ts
var MeaningRecurrenceEngine = class {
  static validateSampleThreshold(events) {
    const chapters = new Set(events.map((e) => e.chapterId));
    if (chapters.size < 3) {
      return false;
    }
    const contributionCount = events.filter((e) => e.contribution).length;
    if (contributionCount < 5) {
      return false;
    }
    const noContributionCount = events.filter((e) => !e.contribution).length;
    if (noContributionCount < 2) {
      return false;
    }
    return true;
  }
};

// src/kernel/lib/meaning/MeaningAssociationEngine.ts
var MeaningAssociationEngine = class {
  static calculateMatrix(events) {
    let n11 = 0;
    let n10 = 0;
    let n01 = 0;
    let n00 = 0;
    for (const event of events) {
      if (event.contribution && event.feltMeaningful) {
        n11++;
      } else if (event.contribution && !event.feltMeaningful) {
        n10++;
      } else if (!event.contribution && event.feltMeaningful) {
        n01++;
      } else {
        n00++;
      }
    }
    return { n11, n10, n01, n00 };
  }
};

// src/kernel/lib/meaning/MeaningDivergenceEngine.ts
var MeaningDivergenceEngine = class {
  static evaluateMatrix(matrix, events) {
    const totalContribution = matrix.n11 + matrix.n10;
    const totalNoContribution = matrix.n01 + matrix.n00;
    const p_S_given_C = totalContribution > 0 ? matrix.n11 / totalContribution : null;
    const p_S_given_not_C = totalNoContribution > 0 ? matrix.n01 / totalNoContribution : null;
    const deltaS = p_S_given_C !== null && p_S_given_not_C !== null ? p_S_given_C - p_S_given_not_C : null;
    const probabilities = {
      p_S_given_C,
      p_S_given_not_C,
      deltaS
    };
    let state = "NO_OBSERVED_DIFFERENCE" /* NO_OBSERVED_DIFFERENCE */;
    let description = "Aus\xEAncia de diferen\xE7a observada (deltaS = 0).";
    if (p_S_given_C !== null && p_S_given_not_C !== null) {
      if (deltaS > 0) {
        state = "OBSERVED_DIFFERENCE_POSITIVE" /* OBSERVED_DIFFERENCE_POSITIVE */;
        description = "Diferen\xE7a matem\xE1tica positiva observada.";
      } else if (deltaS < 0) {
        state = "OBSERVED_DIFFERENCE_NEGATIVE" /* OBSERVED_DIFFERENCE_NEGATIVE */;
        description = "Diferen\xE7a matem\xE1tica negativa observada (predomin\xE2ncia na aus\xEAncia).";
      } else {
        state = "NO_OBSERVED_DIFFERENCE" /* NO_OBSERVED_DIFFERENCE */;
        description = "Aus\xEAncia de diferen\xE7a observada (deltaS = 0).";
      }
    }
    const evidenceEventIds = events.map((e) => e.practiceLogId);
    const evidenceChapterIds = Array.from(new Set(events.map((e) => e.chapterId)));
    return {
      state,
      matrix,
      probabilities,
      description,
      evidenceEventIds,
      evidenceChapterIds
    };
  }
};

// src/kernel/services/evolution/EvolutionMeaningPipeline.ts
var EvolutionMeaningPipeline = class {
  static process(rawEvents, window) {
    if (window && !MeaningTemporalValidator.isWindowValid(window)) {
      return { state: "INSUFFICIENT" /* INSUFFICIENT */, reason: "INVALID_WINDOW" };
    }
    const validEvents = MeaningTemporalValidator.filterValidEvents(rawEvents);
    const windowedEvents = MeaningTemporalValidator.filterWithinWindow(validEvents, window);
    const { events: dedupedEvents, hasConflict } = MeaningTemporalValidator.deduplicateEvents(windowedEvents);
    if (hasConflict) {
      return { state: "INSUFFICIENT" /* INSUFFICIENT */, reason: "DUPLICATE_CONFLICT" };
    }
    const sortedEvents = MeaningTemporalValidator.sortEvents(dedupedEvents);
    const hasEnoughData = MeaningRecurrenceEngine.validateSampleThreshold(sortedEvents);
    if (!hasEnoughData) {
      return { state: "INSUFFICIENT" /* INSUFFICIENT */, reason: "SAMPLE_TOO_SMALL" };
    }
    const matrix = MeaningAssociationEngine.calculateMatrix(sortedEvents);
    const result = MeaningDivergenceEngine.evaluateMatrix(matrix, sortedEvents);
    return result;
  }
};

// src/kernel/lib/reflection/ObservationFactory.ts
var import_crypto = require("crypto");
var ObservationFactory = class {
  /**
   * Validates that a matrix cell value is a valid event count:
   *   - finite (rejects NaN, Infinity, -Infinity)
   *   - integer (rejects 1.5, 0.1, etc.)
   *   - non-negative (rejects -1, -999, etc.)
   */
  static isValidMatrixCell(value) {
    return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
  }
  /**
   * Asserts all four matrix cells pass integrity checks.
   * Throws if any field is invalid — ObservationContract is NOT emitted.
   */
  static assertMatrixIntegrity(matrix, context) {
    const fields = ["n11", "n10", "n01", "n00"];
    for (const field of fields) {
      const value = matrix[field];
      if (!this.isValidMatrixCell(value)) {
        throw new Error(
          `[ObservationFactory] Matrix integrity violation in ${context}: field '${field}' has invalid value '${value}'. Expected: non-negative, finite integer.`
        );
      }
    }
  }
  /**
   * Safely creates an ObservationContract from a verified PipelineResult.
   * Acts as a trust boundary: validates mathematical invariants before promoting
   * any result to an ObservationContract.
   */
  static createObservation(result) {
    const observationId = (0, import_crypto.randomUUID)();
    if (result.state === "INSUFFICIENT" /* INSUFFICIENT */) {
      const zeroMatrix = { n11: 0, n10: 0, n01: 0, n00: 0 };
      return {
        observationId,
        _brand: "ObservationContract",
        observationType: "INSUFFICIENT" /* INSUFFICIENT */,
        matrix: zeroMatrix,
        deltaS: null,
        evidenceEventIds: [],
        evidenceChapterIds: []
      };
    }
    this.assertMatrixIntegrity(result.matrix, "PipelineResult.matrix");
    return {
      observationId,
      _brand: "ObservationContract",
      observationType: result.state,
      matrix: {
        n11: result.matrix.n11,
        n10: result.matrix.n10,
        n01: result.matrix.n01,
        n00: result.matrix.n00
      },
      deltaS: result.probabilities.deltaS,
      evidenceEventIds: [...result.evidenceEventIds],
      evidenceChapterIds: [...result.evidenceChapterIds]
    };
  }
};

// src/kernel/lib/reflection/RuntimeBoundary.ts
var import_zod = require("zod");
var MeaningMatrixSchema = import_zod.z.object({
  n11: import_zod.z.number(),
  n10: import_zod.z.number(),
  n01: import_zod.z.number(),
  n00: import_zod.z.number()
}).strict();
var ObservationContractSchema = import_zod.z.object({
  observationId: import_zod.z.string().uuid(),
  _brand: import_zod.z.literal("ObservationContract"),
  observationType: import_zod.z.enum([
    "OBSERVED_DIFFERENCE_POSITIVE" /* OBSERVED_DIFFERENCE_POSITIVE */,
    "OBSERVED_DIFFERENCE_NEGATIVE" /* OBSERVED_DIFFERENCE_NEGATIVE */,
    "NO_OBSERVED_DIFFERENCE" /* NO_OBSERVED_DIFFERENCE */,
    "INSUFFICIENT" /* INSUFFICIENT */
  ]),
  matrix: MeaningMatrixSchema,
  deltaS: import_zod.z.number().nullable(),
  evidenceEventIds: import_zod.z.array(import_zod.z.string()),
  evidenceChapterIds: import_zod.z.array(import_zod.z.string())
}).strict();
var HumanReflectionContractSchema = import_zod.z.object({
  reflectionId: import_zod.z.string().uuid(),
  observationId: import_zod.z.string().uuid(),
  text: import_zod.z.string(),
  createdAt: import_zod.z.string().datetime(),
  previousReflectionId: import_zod.z.string().uuid().optional(),
  source: import_zod.z.literal("HUMAN_REFLECTION")
}).strict();
var ReflectionContextSchema = import_zod.z.object({
  observation: ObservationContractSchema,
  humanReflection: HumanReflectionContractSchema,
  locale: import_zod.z.enum(["pt-BR", "en-US"]),
  allowedAction: import_zod.z.enum(["TRANSLATE", "ACKNOWLEDGE", "PRESERVE_AMBIGUITY"])
}).strict();
var RuntimeBoundary = class {
  /**
   * Safely parses any untrusted input into a ReflectionContext.
   * Throws an error (or returns safe union) if ANY unknown fields exist.
   */
  static parseReflectionContext(data) {
    return ReflectionContextSchema.parse(data);
  }
};

// src/kernel/lib/reflection/EpistemicGuard.ts
var import_crypto3 = require("crypto");

// src/kernel/lib/reflection/TelemetryUtils.ts
var import_crypto2 = require("crypto");
function hashOutput(text) {
  if (typeof text !== "string") return "";
  return (0, import_crypto2.createHash)("sha256").update(text).digest("hex");
}

// src/kernel/lib/reflection/EpistemicGuard.ts
var NEGATION_CONTEXT_PT = /(?:não deve(?:ria)? (?:dizer|afirmar|usar)|evite? dizer|não pode(?:ria)? (?:dizer|afirmar)|o sistema não|a ia não)/i;
var NEGATION_CONTEXT_EN = /(?:should not say|must not say|avoid saying|cannot say|the system should not|the ai must not)/i;
var QUOTATION_WRAP = /[""]([^""]+)[""]/g;
function isQuotedOrNegated(text, matchedSnippet, locale) {
  if (!matchedSnippet) return false;
  let m;
  while ((m = QUOTATION_WRAP.exec(text)) !== null) {
    if (m[1].toLowerCase().includes(matchedSnippet.toLowerCase())) return true;
  }
  QUOTATION_WRAP.lastIndex = 0;
  const sentences = text.split(/[.!?]/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(matchedSnippet.toLowerCase())) {
      const neg = locale === "en-US" ? NEGATION_CONTEXT_EN : NEGATION_CONTEXT_PT;
      if (neg.test(sentence)) return true;
    }
  }
  return false;
}
var RULES_PT_BR = {
  layer0_provenance: /(^|\s)(eu refleti|eu percebi|meu diário|eu notei)(\s|$|[.,])/i,
  layer0_invented_evidence: /evento de ontem/i,
  layer1_structural: /(\[system alert\]|```json)/i,
  layer1_allowedAction: /(allowedaction|allowed action)/i,
  layer2_epistemic: /(causou|causalidade|diagnosticou|motivo do seu|aconselho)/i,
  layer2_aggregation: /(está provado|prova que)/i,
  layer2_aggregation_alt: /(está provado)/i,
  layer3_lexical: ["evolu", "progresso", "personalidade", "amadureciment", "cresciment", "maturidad", "empatia", "solidariedad", "caridoso"],
  layer3_teleology_verbs: ["floresceu", "despertou", "expandiu", "transformou", "renasceu", "amadureceu", "germinan", "germin"],
  layer4_semantic: /(torna(m)? claro que|fica evidente|prova que)/i,
  layer4_temporal: /(melhor agora|piora na sua|piorou)/i,
  layer4_invalidation: /(você disse que.*mas os dados mostram|embora você não tenha notado)/i,
  // S14-C
  // S14-C & S14-D
  layer4_identity_direct: /(você (é|age de forma).{0,30}(pessoa |\w+ista|compassivo|generoso|altruísta|caridoso)|sua (essência|natureza|alma|disposição|inclinação) (é|representa|focada|parece ser)|uma disposição \S+ parece|você (nasceu para|tem uma alma|representa quem)|comportamento de alguém com|semente de propósito)/i,
  layer4_identity_conditional: /(talvez você (seja|pareça)|você parece ser|pode ser que você|posso estar errado.{0,40}você (parece|é)|inclinação.*(enraizada|estrutural)|(característica|traço).*vai além)/i,
  layer4_teleology_pattern: /(você (está se tornando|finalmente encontrou|encontrou seu|está se aproximando de|alcançou)|uma versão melhor de si|não sou especialista.{0,40}(amadureceu|evoluiu|cresceu))/i,
  layer4_causality_new: /((ajudar|meditar|praticar|hábito|meditação|prática).{0,60}(produziu|despertou|fez você|trouxe)|(tudo indica|parece) que.{0,60}(fez você|despertou|produziu))/i,
  layer4_discovery: /(agora eu (entendi|compreendi|descobri)|talvez eu tenha (descoberto|entendido)|(ficou|torna-se) claro|consegui identificar|percebi o (padrão|que está)|padrão.*sugerir uma)/i,
  layer4_persuasion: /(em breve (você|perceberá|entenderá)|você (vai|irá) perceber|logo (você|verá|perceberá)|não quero impor.{0,60}você (entenderá|perceberá)|continue (observando|praticando).{0,40}perceberá)/i,
  layer4_evidence_escalation: /((seus|os)? ?(registros|dados).*(confirmam|provam|revelam|indicam|sugerem|mostram).*(quem você é|propósito|traço|oposto|característica)|(podemos|posso) concluir que.*(é seu propósito|quem você é)|a resposta é (positiva|sim))/i,
  fallbackTemplate: (t) => `A diferen\xE7a matem\xE1tica foi registrada. A sua reflex\xE3o anotou: "${t}".`
};
var RULES_EN_US = {
  layer0_provenance: /(^|\s)(i reflected|i realized|my journal|i noticed)(\s|$|[.,])/i,
  layer0_invented_evidence: /yesterday's event/i,
  layer1_structural: /(\[system alert\]|```json)/i,
  layer1_allowedAction: /(allowedaction|allowed action)/i,
  layer2_epistemic: /(caused|causality|diagnosed|reason for your|advise|recommend)/i,
  layer2_aggregation: /(is proven|proves that)/i,
  layer2_aggregation_alt: /(is proven)/i,
  layer3_lexical: ["evolut", "progress", "personalit", "maturit", "growth", "empath", "solidarity", "charitab"],
  // Fixed stems
  layer3_teleology_verbs: ["blossomed", "awakened", "expanded", "transformed", "reborn", "matur", "emerg"],
  layer4_semantic: /(makes it clear|it is evident|proves that)/i,
  layer4_temporal: /(better now|worse in your|worsened)/i,
  layer4_invalidation: /(you said that.*but the data|although you didn't notice)/i,
  // S14-C & S14-D
  layer4_identity_direct: /(you (are|consistently demonstrate|act in a way) (a(n)? )?(altruistic|compassionate|generous|altruism|someone who)|your (essence|nature|soul|disposition) (is|represents|focused|appears to be)|you were born to|you have (a(n)? )?(enlightened|pure) soul|an altruistic disposition|light seems to be emerging)/i,
  layer4_identity_conditional: /(maybe you are|perhaps you (are|seem)|you seem to be|it may be that you are|i might be wrong.{0,30}you (seem|appear|are)|underlying trait|trait.*beyond)/i,
  layer4_teleology_pattern: /(you are becoming (a )?better|tendency toward becoming|you finally found|a better version of yourself|i am no expert.{0,40}(matured|evolved|grew))/i,
  layer4_causality_new: /((helping|meditating|practicing|habit|practice).{0,60}(produced|awakened|made you|brought)|everything indicates.{0,60}(made you|awakened|produced))/i,
  layer4_discovery: /(now i (understood|realized|discovered)|maybe i (have )?discovered|it became clear|i (managed to|could) identify|i see the pattern)/i,
  layer4_persuasion: /(soon you (will|are going to) (realize|understand|see)|you will (realize|understand).*soon|i do not want to impose.{0,60}(soon|you will)|keep (observing|watching).{0,40}you will)/i,
  layer4_evidence_escalation: /((your|the)? ?(logs|records|data).*(confirm|prove|reveal|suggests?|shows?).*(who you are|purpose|trait|opposite)|(we|i) can conclude.{0,60}(your purpose|who you are)|the answer is (yes|positive))/i,
  fallbackTemplate: (t) => `The mathematical difference was recorded. Your reflection noted: "${t}".`
};
var EpistemicGuard = class {
  static evaluate(input, telemetryCallback) {
    const rawText = Array.isArray(input.llmOutputText) ? input.llmOutputText.join(" ") : input.llmOutputText;
    const text = rawText;
    const lowerText = text.toLowerCase();
    const locale = input.context.locale;
    const rules = locale === "en-US" ? RULES_EN_US : RULES_PT_BR;
    const reject = (reason, ruleId, layer) => {
      const result = {
        status: "REJECT",
        reason,
        fallback: rules.fallbackTemplate(input.context.humanReflection.text)
      };
      try {
        telemetryCallback?.({
          schemaVersion: "1.0",
          eventId: (0, import_crypto3.randomUUID)(),
          violation: reason,
          ruleId,
          layer,
          outputHash: hashOutput(rawText),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch {
      }
      return result;
    };
    if (rules.layer0_provenance.test(lowerText)) return reject("AUTHORSHIP_VIOLATION" /* AUTHORSHIP_VIOLATION */, "layer0_provenance", "Layer 0: Provenance" /* LAYER_0_PROVENANCE */);
    if (rules.layer0_invented_evidence.test(lowerText)) return reject("AUTHORSHIP_VIOLATION" /* AUTHORSHIP_VIOLATION */, "layer0_invented_evidence", "Layer 0: Provenance" /* LAYER_0_PROVENANCE */);
    if (rules.layer1_structural.test(lowerText)) return reject("STRUCTURAL" /* STRUCTURAL */, "layer1_structural", "Layer 1: Structural Contract" /* LAYER_1_STRUCTURAL */);
    if (rules.layer1_allowedAction.test(lowerText)) return reject("STRUCTURAL" /* STRUCTURAL */, "layer1_allowedAction", "Layer 1: Structural Contract" /* LAYER_1_STRUCTURAL */);
    if (rules.layer2_epistemic.test(lowerText)) return reject("EPISTEMIC_ESCALATION" /* EPISTEMIC_ESCALATION */, "layer2_epistemic", "Layer 2: Epistemic Monotonicity" /* LAYER_2_EPISTEMIC */);
    if (rules.layer2_aggregation.test(lowerText) && /times|vezes/i.test(lowerText)) return reject("AGGREGATION_OVERREACH" /* AGGREGATION_OVERREACH */, "layer2_aggregation", "Layer 2: Epistemic Monotonicity" /* LAYER_2_EPISTEMIC */);
    if (rules.layer2_aggregation_alt.test(lowerText)) return reject("AGGREGATION_OVERREACH" /* AGGREGATION_OVERREACH */, "layer2_aggregation_alt", "Layer 2: Epistemic Monotonicity" /* LAYER_2_EPISTEMIC */);
    for (const word of rules.layer3_lexical) {
      if (lowerText.includes(word) && !isQuotedOrNegated(text, word, locale)) {
        return reject("LEXICAL_IMPOSITION" /* LEXICAL_IMPOSITION */, `layer3_lexical:${word}`, "Layer 3: Lexical Imposition" /* LAYER_3_LEXICAL */);
      }
    }
    for (const verb of rules.layer3_teleology_verbs) {
      if (lowerText.includes(verb) && !isQuotedOrNegated(text, verb, locale)) {
        return reject("TELEOLOGY_IMPOSITION" /* TELEOLOGY_IMPOSITION */, `layer3_teleology_verbs:${verb}`, "Layer 3: Lexical Imposition" /* LAYER_3_LEXICAL */);
      }
    }
    if (rules.layer4_semantic.test(lowerText)) return reject("SEMANTIC_CONCLUSION" /* SEMANTIC_CONCLUSION */, "layer4_semantic", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    if (rules.layer4_temporal.test(lowerText)) return reject("TEMPORAL_NORMATIVITY" /* TEMPORAL_NORMATIVITY */, "layer4_temporal", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    if (rules.layer4_invalidation.test(lowerText)) return reject("HUMAN_REFLECTION_INVALIDATION" /* HUMAN_REFLECTION_INVALIDATION */, "layer4_invalidation", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    if (rules.layer4_identity_direct.test(lowerText) && !isQuotedOrNegated(text, "", locale)) {
      const m = lowerText.match(rules.layer4_identity_direct);
      if (m && !isQuotedOrNegated(text, m[0], locale)) return reject("IDENTITY_CLAIM" /* IDENTITY_CLAIM */, "layer4_identity_direct", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    }
    if (rules.layer4_identity_conditional.test(lowerText)) {
      const m = lowerText.match(rules.layer4_identity_conditional);
      if (m && !isQuotedOrNegated(text, m[0], locale)) return reject("IDENTITY_CLAIM" /* IDENTITY_CLAIM */, "layer4_identity_conditional", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    }
    if (rules.layer4_teleology_pattern.test(lowerText)) {
      const m = lowerText.match(rules.layer4_teleology_pattern);
      if (m && !isQuotedOrNegated(text, m[0], locale)) return reject("TELEOLOGY_IMPOSITION" /* TELEOLOGY_IMPOSITION */, "layer4_teleology_pattern", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    }
    if (rules.layer4_causality_new.test(lowerText)) return reject("CAUSALITY_OVERREACH" /* CAUSALITY_OVERREACH */, "layer4_causality_new", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    if (rules.layer4_discovery.test(lowerText)) {
      const m = lowerText.match(rules.layer4_discovery);
      if (m && !isQuotedOrNegated(text, m[0], locale)) return reject("DISCOVERY_CLAIM" /* DISCOVERY_CLAIM */, "layer4_discovery", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    }
    if (rules.layer4_persuasion.test(lowerText)) return reject("BENEVOLENT_PERSUASION" /* BENEVOLENT_PERSUASION */, "layer4_persuasion", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    if (rules.layer4_evidence_escalation.test(lowerText)) return reject("EVIDENCE_ESCALATION" /* EVIDENCE_ESCALATION */, "layer4_evidence_escalation", "Layer 4: Semantic Patterns" /* LAYER_4_SEMANTIC */);
    return { status: "PASS", text };
  }
};

// src/kernel/services/reflection/ReflectionPipelineE2E.ts
var ReflectionPipelineE2E = class {
  constructor(llm, telemetry) {
    this.llm = llm;
    this.telemetry = telemetry;
  }
  llm;
  telemetry;
  async process(input) {
    const pipelineResult = EvolutionMeaningPipeline.process(input.rawEvents, input.window);
    if (pipelineResult.state === "INSUFFICIENT" /* INSUFFICIENT */) {
      return {
        status: "INSUFFICIENT",
        reason: pipelineResult.reason || "UNKNOWN_INSUFFICIENT"
      };
    }
    const observation = ObservationFactory.createObservation(pipelineResult);
    const reflectionId = input.reflectionId || (0, import_crypto4.randomUUID)();
    const context = RuntimeBoundary.parseReflectionContext({
      observation,
      humanReflection: {
        reflectionId,
        observationId: observation.observationId,
        text: input.humanText,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        source: "HUMAN_REFLECTION"
      },
      locale: input.locale,
      allowedAction: "TRANSLATE"
    });
    const llmOutput = await this.llm.generate(context);
    const guardResult = EpistemicGuard.evaluate(
      { llmOutputText: llmOutput, context },
      (event) => {
        try {
          this.telemetry?.record(event);
        } catch {
        }
      }
    );
    if (guardResult.status === "PASS") {
      return {
        status: "PASS",
        text: guardResult.text,
        observationId: observation.observationId,
        reflectionId
      };
    }
    return {
      status: "REJECT",
      fallbackText: guardResult.fallback,
      violation: guardResult.reason,
      observationId: observation.observationId,
      reflectionId
    };
  }
};

// netlify/functions/_shared/llm/adapters/GeminiAdapter.ts
var GeminiAdapter = class {
  providerName = "gemini";
  apiKey;
  timeoutMs;
  constructor(config) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || "";
    this.timeoutMs = config?.timeoutMs || 1e4;
  }
  async generate(context) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server environment");
    }
    const systemPrompt = `Voc\xEA \xE9 uma intelig\xEAncia integrativa rigorosa. Sua tarefa \xE9 acolher a reflex\xE3o humana e contextualiz\xE1-la estritamente em termos da observa\xE7\xE3o matem\xE1tica realizada. NUNCA fa\xE7a afirma\xE7\xF5es categ\xF3ricas de identidade (quem a pessoa \xE9), NUNCA imponha teleologia ou des\xEDgnio evolutivo, e NUNCA declare causalidade determin\xEDstica sem evid\xEAncia.`;
    const userContent = JSON.stringify({
      humanReflection: context.humanReflection.text,
      observationMetric: {
        deltaS: context.observation.deltaS,
        matrix: context.observation.matrix
      },
      locale: context.locale,
      action: context.allowedAction
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048
          }
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText || typeof candidateText !== "string") {
        throw new Error("Gemini API returned invalid or empty response payload");
      }
      return candidateText;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};

// netlify/functions/_shared/llm/adapters/OpenAIAdapter.ts
var OpenAIAdapter = class {
  providerName = "openai";
  apiKey;
  timeoutMs;
  constructor(config) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || "";
    this.timeoutMs = config?.timeoutMs || 1e4;
  }
  async generate(context) {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured in server environment");
    }
    const systemPrompt = `Voc\xEA \xE9 uma intelig\xEAncia integrativa rigorosa. Sua tarefa \xE9 acolher a reflex\xE3o humana e contextualiz\xE1-la estritamente em termos da observa\xE7\xE3o matem\xE1tica realizada. NUNCA fa\xE7a afirma\xE7\xF5es categ\xF3ricas de identidade (quem a pessoa \xE9), NUNCA imponha teleologia ou des\xEDgnio evolutivo, e NUNCA declare causalidade determin\xEDstica sem evid\xEAncia.`;
    const userContent = JSON.stringify({
      humanReflection: context.humanReflection.text,
      observationMetric: {
        deltaS: context.observation.deltaS,
        matrix: context.observation.matrix
      },
      locale: context.locale,
      action: context.allowedAction
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          temperature: 0.3,
          max_tokens: 2048
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API Error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("OpenAI API returned invalid or empty response payload");
      }
      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};

// netlify/functions/_shared/llm/adapters/AnthropicAdapter.ts
var AnthropicAdapter = class {
  providerName = "anthropic";
  apiKey;
  timeoutMs;
  constructor(config) {
    this.apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.timeoutMs = config?.timeoutMs || 1e4;
  }
  async generate(context) {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured in server environment");
    }
    const systemPrompt = `Voc\xEA \xE9 uma intelig\xEAncia integrativa rigorosa. Sua tarefa \xE9 acolher a reflex\xE3o humana e contextualiz\xE1-la estritamente em termos da observa\xE7\xE3o matem\xE1tica realizada. NUNCA fa\xE7a afirma\xE7\xF5es categ\xF3ricas de identidade (quem a pessoa \xE9), NUNCA imponha teleologia ou des\xEDgnio evolutivo, e NUNCA declare causalidade determin\xEDstica sem evid\xEAncia.`;
    const userContent = JSON.stringify({
      humanReflection: context.humanReflection.text,
      observationMetric: {
        deltaS: context.observation.deltaS,
        matrix: context.observation.matrix
      },
      locale: context.locale,
      action: context.allowedAction
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
          max_tokens: 2048,
          temperature: 0.3
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API Error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const content = data?.content?.[0]?.text;
      if (!content || typeof content !== "string") {
        throw new Error("Anthropic API returned invalid or empty response payload");
      }
      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
};

// netlify/functions/_shared/llm/LLMGateway.ts
var ResilientCompositeProvider = class {
  anthropic = new AnthropicAdapter();
  gemini = new GeminiAdapter();
  openai = new OpenAIAdapter();
  isPremium = false;
  constructor(isPremium = false) {
    this.isPremium = isPremium;
  }
  setPremium(premium) {
    this.isPremium = premium;
  }
  async generate(context) {
    const errors = [];
    if (this.isPremium && process.env.ANTHROPIC_API_KEY) {
      try {
        return await this.anthropic.generate(context);
      } catch (err) {
        errors.push(`Anthropic: ${err.message}`);
      }
    }
    if (process.env.GEMINI_API_KEY) {
      try {
        return await this.gemini.generate(context);
      } catch (err) {
        errors.push(`Gemini: ${err.message}`);
      }
    }
    if (process.env.OPENAI_API_KEY) {
      try {
        return await this.openai.generate(context);
      } catch (err) {
        errors.push(`OpenAI: ${err.message}`);
      }
    }
    throw new Error(`All LLM providers failed: ${errors.join("; ")}`);
  }
};
function createBaselineMeaningEvents() {
  const events = [];
  const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1e3;
  const chapters = ["c1_presence", "c2_breath", "c3_integration"];
  for (let i = 0; i < 5; i++) {
    events.push({
      practiceLogId: `baseline_c_${i}`,
      chapterId: chapters[i % chapters.length],
      occurredAt: new Date(baseTime + i * 36e5).toISOString(),
      contribution: true,
      feltMeaningful: true
    });
  }
  for (let i = 0; i < 2; i++) {
    events.push({
      practiceLogId: `baseline_nc_${i}`,
      chapterId: chapters[i % chapters.length],
      occurredAt: new Date(baseTime + (5 + i) * 36e5).toISOString(),
      contribution: false,
      feltMeaningful: false
    });
  }
  return events;
}
var LLMGateway = class _LLMGateway {
  constructor(pipeline, compositeProvider) {
    this.pipeline = pipeline;
    this.compositeProvider = compositeProvider;
  }
  pipeline;
  compositeProvider;
  static createDefault(customProvider, telemetry, isPremium = false) {
    const composite = customProvider ? void 0 : new ResilientCompositeProvider(isPremium);
    const provider = customProvider || composite;
    const pipeline = new ReflectionPipelineE2E(provider, telemetry);
    return new _LLMGateway(pipeline, composite);
  }
  async process(input) {
    try {
      if (this.compositeProvider && typeof input.isPremium === "boolean") {
        this.compositeProvider.setPremium(input.isPremium);
      }
      const rawText = (input.userMessage || "").trim();
      if (!rawText) {
        return {
          status: "REJECT",
          text: "Mensagem vazia n\xE3o pode ser processada pelo portal reflexivo.",
          isFallback: true
        };
      }
      const humanText = input.anamneseContext && input.anamneseContext.trim().length > 0 ? `${rawText}

[Contexto Cl\xEDnico]:
${input.anamneseContext.trim()}` : rawText;
      const rawEvents = input.rawEvents && input.rawEvents.length > 0 ? input.rawEvents : createBaselineMeaningEvents();
      const pipelineInput = {
        rawEvents,
        humanText,
        locale: input.locale || "pt-BR",
        reflectionId: input.reflectionId
      };
      const result = await this.pipeline.process(pipelineInput);
      if (result.status === "PASS") {
        return {
          status: "PASS",
          text: result.text,
          isFallback: false,
          observationId: result.observationId,
          reflectionId: result.reflectionId
        };
      }
      if (result.status === "REJECT") {
        return {
          status: "REJECT",
          text: result.fallbackText,
          isFallback: true,
          violation: result.violation,
          observationId: result.observationId,
          reflectionId: result.reflectionId
        };
      }
      return {
        status: "INSUFFICIENT",
        text: "Aguardando maior n\xFAmero de sess\xF5es para observa\xE7\xE3o matem\xE1tica com relev\xE2ncia estat\xEDstica.",
        isFallback: true
      };
    } catch (err) {
      return {
        status: "REJECT",
        text: "O servi\xE7o de reflex\xE3o est\xE1 temporariamente indispon\xEDvel. Por favor, tente novamente em instantes.",
        isFallback: true
      };
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnthropicAdapter,
  GeminiAdapter,
  LLMGateway,
  OpenAIAdapter
});
