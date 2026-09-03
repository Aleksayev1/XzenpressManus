/**
 * S14-A — ObservationContract Contamination Attack Suite
 *
 * Methodology:
 *   - compile-time rejection: @ts-expect-error probes
 *   - runtime rejection: Zod strict parseReflectionContext()
 *   - factory boundary rejection: ObservationFactory.createObservation()
 *   - schema rejection: raw Zod parse without the pipeline
 *
 * Rule: Tests MUST NOT modify the contract to pass.
 * If an attack traverses the boundary, we report it as a VULNERABILITY,
 * then fix architecture, then write a regression.
 */

import { randomUUID } from 'crypto';
import { MeaningObservationState } from '../../types/meaning';
import { ObservationContract, HumanReflectionContract } from '../../types/reflection';
import { RuntimeBoundary } from '../../lib/reflection/RuntimeBoundary';
import { ObservationFactory } from '../../lib/reflection/ObservationFactory';
import { ZodError } from 'zod';

// ─── FIXTURE ────────────────────────────────────────────────────────────────
const buildValidObservation = (): ObservationContract =>
  ObservationFactory.createObservation({
    state: MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
    matrix: { n11: 5, n10: 2, n01: 1, n00: 4 },
    probabilities: { p_S_given_C: 0.71, p_S_given_not_C: 0.2, deltaS: 0.51 },
    description: 'Diferença matemática positiva observada.',
    evidenceEventIds: ['ev1', 'ev2', 'ev3'],
    evidenceChapterIds: ['c1', 'c2'],
  });

const buildValidReflection = (observationId: string): HumanReflectionContract => ({
  reflectionId: randomUUID(),
  observationId,
  text: 'Não vejo relação.',
  createdAt: new Date().toISOString(),
  source: 'HUMAN_REFLECTION',
});

const buildCleanContext = (obs: ObservationContract) => ({
  observation: obs,
  humanReflection: buildValidReflection(obs.observationId),
  locale: 'pt-BR',
  allowedAction: 'TRANSLATE',
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const expectRuntimeReject = (data: unknown) => {
  expect(() => RuntimeBoundary.parseReflectionContext(data)).toThrow(ZodError);
};

const expectRuntimePass = (data: unknown) => {
  expect(() => RuntimeBoundary.parseReflectionContext(data)).not.toThrow();
};

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY 1 — Compile-time Probes
// Goal: Confirm TypeScript rejects forbidden fields at authoring time.
// ─────────────────────────────────────────────────────────────────────────────
describe('S14-A | Family 1: Compile-time Rejection', () => {
  let obs: ObservationContract;
  beforeEach(() => { obs = buildValidObservation(); });

  it('[CT-01] spread + forbidden field: insight', () => {
    const attempt: ObservationContract = {
      ...obs,
      // @ts-expect-error — 'insight' is 'never' in the contract
      insight: 'Você encontrou seu propósito',
    };
    // TS caught it at compile-time. Runtime object exists but is epistemically invisible via type.
    expect(attempt).toBeDefined();
  });

  it('[CT-02] spread + forbidden field: meaning', () => {
    const attempt: ObservationContract = {
      ...obs,
      // @ts-expect-error — 'meaning' is 'never' in the contract
      meaning: 'Deep pattern found',
    };
    expect(attempt).toBeDefined();
  });

  it('[CT-03] spread + forbidden field: growth', () => {
    const attempt: ObservationContract = {
      ...obs,
      // @ts-expect-error — 'growth' is 'never' in the contract
      growth: true,
    };
    expect(attempt).toBeDefined();
  });

  it('[CT-04] readonly mutation: deltaS', () => {
    // @ts-expect-error — Cannot assign to 'deltaS' because it is a read-only property.
    obs.deltaS = 999;
    expect(true).toBe(true);
  });

  it('[CT-05] readonly mutation: _brand', () => {
    // @ts-expect-error — Cannot assign to '_brand' because it is a read-only property.
    obs._brand = 'FakeContract';
    expect(true).toBe(true);
  });

  it('[CT-06] any bypass is documented — TS is blind to any', () => {
    const malicious: any = { hidden_meaning: 'You have grown', insight: 'trajectory detected' };
    // NOTE: This COMPILES without error. TS cannot protect against 'any'.
    // This is the documented limitation: runtime Zod is the true gate.
    const coerced: ObservationContract = malicious;
    expect(coerced).toBeDefined();
  });

  it('[CT-07] unknown → ObservationContract requires explicit assertion (TS is partially protective)', () => {
    const raw: unknown = { fake: 'data' };
    // @ts-expect-error — 'unknown' is not directly assignable to ObservationContract without assertion
    const attempt: ObservationContract = raw;
    expect(attempt).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY 2 — Runtime Rejection (Zod strict boundary)
// Goal: Prove that contaminated objects cannot cross RuntimeBoundary.
// ─────────────────────────────────────────────────────────────────────────────
describe('S14-A | Family 2: Runtime Rejection via Zod', () => {
  let obs: ObservationContract;
  let cleanCtx: ReturnType<typeof buildCleanContext>;
  beforeEach(() => {
    obs = buildValidObservation();
    cleanCtx = buildCleanContext(obs);
  });

  it('[RT-01] spread contamination on observation: unknown top-level field', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: { ...obs, secretIntent: 'persuade' },
    });
  });

  it('[RT-02] spread contamination on observation: forbidden semantic field', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: { ...obs, insight: 'found your purpose' },
    });
  });

  it('[RT-03] Object.assign on observation with contamination', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: Object.assign({}, obs, { hiddenMeaning: 'pattern = identity' }),
    });
  });

  it('[RT-04] JSON.parse + runtime boundary: contaminated JSON is rejected', () => {
    const evil = JSON.parse(
      JSON.stringify({ ...obs, teleologicalClaim: 'you are becoming better' })
    );
    expectRuntimeReject({ ...cleanCtx, observation: evil });
  });

  it('[RT-05] JSON.parse of completely fabricated observation is rejected', () => {
    const fabricated = JSON.parse(
      `{"observationId": "fake-uuid", "_brand": "ObservationContract",
        "observationType": "OBSERVED_DIFFERENCE_POSITIVE",
        "matrix": {"n11":1,"n10":0,"n01":0,"n00":0},
        "deltaS": 1.0, "evidenceEventIds": [], "evidenceChapterIds": [],
        "insight": "you have improved"}`
    );
    expectRuntimeReject({ ...cleanCtx, observation: fabricated });
  });

  it('[RT-06] _brand spoofing: wrong brand value', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: { ...obs, _brand: 'HackedContract' },
    });
  });

  it('[RT-07] _brand spoofing: brand removed entirely', () => {
    const { _brand, ...withoutBrand } = obs as any;
    expectRuntimeReject({ ...cleanCtx, observation: withoutBrand });
  });

  it('[RT-08] nested matrix contamination via spread', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: {
        ...obs,
        matrix: { ...obs.matrix, confidence: 'high', causalScore: 0.99 },
      },
    });
  });

  it('[RT-09] array contamination: evidenceEventIds contains object instead of string', () => {
    expectRuntimeReject({
      ...cleanCtx,
      observation: {
        ...obs,
        evidenceEventIds: [{ id: 'ev1', meaning: 'growth' }],
      },
    });
  });

  it('[RT-10] double-spread: legitimate + contaminated context', () => {
    const contaminated = { ...obs, persuasionScore: 0.9 };
    const merged = { ...obs, ...contaminated };
    expectRuntimeReject({ ...cleanCtx, observation: merged });
  });

  it('[RT-11] allowedAction spoofing: escalate', () => {
    expectRuntimeReject({ ...cleanCtx, allowedAction: 'ESCALATE_EPISTEMIC_FORCE' });
  });

  it('[RT-12] source spoofing on humanReflection', () => {
    expectRuntimeReject({
      ...cleanCtx,
      humanReflection: {
        ...buildValidReflection(obs.observationId),
        source: 'LLM_TRANSLATION',
      },
    });
  });

  it('[RT-13] humanReflection contamination: injected field', () => {
    expectRuntimeReject({
      ...cleanCtx,
      humanReflection: {
        ...buildValidReflection(obs.observationId),
        analysis: 'system analyzed your growth pattern',
      },
    });
  });

  it('[RT-14] locale spoofing: unsupported locale', () => {
    expectRuntimeReject({ ...cleanCtx, locale: 'zh-CN' });
  });

  it('[RT-15] clean context passes (sanity check)', () => {
    expectRuntimePass(cleanCtx);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY 3 — Factory Boundary
// Goal: Prove ObservationFactory is a trust boundary that rejects corrupt
//       PipelineResults before emitting any ObservationContract.
// ─────────────────────────────────────────────────────────────────────────────
describe('S14-A | Family 3: Factory Boundary Rejection', () => {
  // Helper to build a corrupt result with one bad field
  const buildCorruptResult = (overrides: Partial<Record<'n11'|'n10'|'n01'|'n00', unknown>>) =>
    ({
      state: MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
      matrix: { n11: 5, n10: 2, n01: 1, n00: 4, ...overrides },
      probabilities: { p_S_given_C: 0.71, p_S_given_not_C: 0.2, deltaS: 0.51 },
      description: 'test',
      evidenceEventIds: [],
      evidenceChapterIds: [],
    } as any);

  it('[FB-01] factory produces only known fields — no extras from input', () => {
    const result = ObservationFactory.createObservation({
      state: MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
      matrix: { n11: 5, n10: 2, n01: 1, n00: 4 },
      probabilities: { p_S_given_C: 0.71, p_S_given_not_C: 0.2, deltaS: 0.51 },
      description: 'Diferença matemática positiva observada.',
      evidenceEventIds: ['ev1', 'ev2'],
      evidenceChapterIds: ['c1'],
    });

    const keys = Object.keys(result);
    const allowed = ['observationId', '_brand', 'observationType', 'matrix', 'deltaS', 'evidenceEventIds', 'evidenceChapterIds'];
    expect(keys.filter(k => !allowed.includes(k))).toHaveLength(0);
  });

  it('[FB-02] factory result passes RuntimeBoundary (factory → boundary chain works)', () => {
    const obs = buildValidObservation();
    const ctx = buildCleanContext(obs);
    expectRuntimePass(ctx);
  });

  it('[FB-03] factory for INSUFFICIENT result also passes boundary cleanly', () => {
    const obs = ObservationFactory.createObservation({
      state: MeaningObservationState.INSUFFICIENT,
      reason: 'SAMPLE_TOO_SMALL',
    });
    const ctx = buildCleanContext(obs);
    expectRuntimePass(ctx);
  });

  // ── Sub-vector: negative values ────────────────────────────────────────────
  it('[FB-04a] n11 = -999 is rejected — ObservationContract NOT emitted', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: -999 }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-04b] n10 = -1 is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n10: -1 }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-04c] n01 = -1 is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n01: -1 }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-04d] n00 = -1 is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n00: -1 }))).toThrow(/Matrix integrity violation/);
  });

  // ── Sub-vector: NaN ────────────────────────────────────────────────────────
  it('[FB-05a] n11 = NaN is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: NaN }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-05b] n00 = NaN is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n00: NaN }))).toThrow(/Matrix integrity violation/);
  });

  // ── Sub-vector: Infinity ───────────────────────────────────────────────────
  it('[FB-06a] n11 = Infinity is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: Infinity }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-06b] n11 = -Infinity is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: -Infinity }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-06c] n10 = Infinity is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n10: Infinity }))).toThrow(/Matrix integrity violation/);
  });

  // ── Sub-vector: decimals ───────────────────────────────────────────────────
  it('[FB-07a] n11 = 1.5 is rejected (matrix cells must be integers)', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: 1.5 }))).toThrow(/Matrix integrity violation/);
  });
  it('[FB-07b] n01 = 0.1 is rejected', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n01: 0.1 }))).toThrow(/Matrix integrity violation/);
  });

  // ── Sub-vector: valid boundary values (must NOT throw) ────────────────────
  it('[FB-08a] n11 = 0 is accepted (zero is valid — no events in this cell)', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: 0 }))).not.toThrow();
  });
  it('[FB-08b] n11 = 1 is accepted', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: 1 }))).not.toThrow();
  });
  it('[FB-08c] large valid count is accepted', () => {
    expect(() => ObservationFactory.createObservation(buildCorruptResult({ n11: 10000 }))).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY 4 — Post-Factory Mutation
// Goal: Prove that an already-valid ObservationContract cannot be mutated.
// ─────────────────────────────────────────────────────────────────────────────
describe('S14-A | Family 4: Post-Factory Mutation', () => {
  it('[PF-01] spreading a valid observation produces a new object — original is untouched', () => {
    const obs = buildValidObservation();
    const originalId = obs.observationId;

    // Attempt to create a "mutated" version
    const mutated = { ...obs, insight: 'added after creation' };
    
    // The original is clean
    expect((obs as any).insight).toBeUndefined();
    expect(obs.observationId).toBe(originalId);
    // The mutated version CARRIES the contamination in JS memory
    // but CANNOT cross the RuntimeBoundary
    expect(() => RuntimeBoundary.parseReflectionContext(buildCleanContext(mutated as any))).toThrow(ZodError);
  });

  it('[PF-02] post-creation Object.assign on result cannot cross boundary', () => {
    const obs = buildValidObservation();
    const tampered = Object.assign({}, obs, { hiddenPurpose: 'trajectory' });

    expect(() => RuntimeBoundary.parseReflectionContext(buildCleanContext(tampered))).toThrow(ZodError);
  });
});
