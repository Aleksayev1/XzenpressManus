import { EpistemicGuard } from '../../lib/reflection/EpistemicGuard';
import { hashOutput } from '../../lib/reflection/TelemetryUtils';
import { GuardViolation, GuardLayer, GuardTelemetryEvent, GuardResult } from '../../types/reflection';
import { MeaningObservationState } from '../../types/meaning';
import { randomUUID } from 'crypto';

describe('S14-B | Guard Telemetry', () => {
  const buildInput = (text: string) => ({
    llmOutputText: text,
    context: {
      observation: {
        observationId: randomUUID(),
        _brand: 'ObservationContract' as const,
        observationType: MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
        matrix: { n11: 5, n10: 2, n01: 1, n00: 4 },
        deltaS: 0.51,
        evidenceEventIds: [],
        evidenceChapterIds: [],
      },
      humanReflection: {
        reflectionId: randomUUID(),
        observationId: randomUUID(),
        text: 'Human text',
        createdAt: new Date().toISOString(),
        source: 'HUMAN_REFLECTION' as const,
      },
      locale: 'pt-BR' as const,
      allowedAction: 'TRANSLATE' as const,
    },
  });

  // ── Grupo 1 — Emissão correta ──────────────────────────────────────────────
  describe('Group 1: Correct Emission', () => {
    it('REJECT emits telemetry event with granular ruleId and correct fields', () => {
      const input = buildInput('Você é altruísta.'); // Violates layer4_identity_direct
      let emittedEvent: GuardTelemetryEvent | undefined;

      const result = EpistemicGuard.evaluate(input, (event) => {
        emittedEvent = event;
      });

      expect(result.status).toBe('REJECT');
      expect(emittedEvent).toBeDefined();
      expect(emittedEvent?.violation).toBe(GuardViolation.IDENTITY_CLAIM);
      expect(emittedEvent?.ruleId).toBe('layer4_identity_direct');
      expect(emittedEvent?.layer).toBe(GuardLayer.LAYER_4_SEMANTIC);
      expect(emittedEvent?.outputHash).toBe(hashOutput('Você é altruísta.'));
      expect(emittedEvent?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(emittedEvent?.schemaVersion).toBe('1.0');
      expect(emittedEvent?.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(emittedEvent?.redactedExcerpt).toBeUndefined(); // V1 decision
    });

    it('PASS does not call telemetry callback', () => {
      const input = buildInput('A diferença foi registrada corretamente.');
      let called = false;

      const result = EpistemicGuard.evaluate(input, () => {
        called = true;
      });

      expect(result.status).toBe('PASS');
      expect(called).toBe(false);
    });
  });

  // ── Grupo 2 — Isolamento da decisão ─────────────────────────────────────────
  describe('Group 2: Decision Isolation', () => {
    it('CRITICAL: Telemetry error MUST NOT alter REJECT decision', () => {
      const input = buildInput('Você é altruísta.');
      
      const faultyCallback = () => { throw new Error('Logger failure'); };

      // Evaluate should not throw, should handle the telemetry error silently
      let result: GuardResult | undefined;
      expect(() => {
        result = EpistemicGuard.evaluate(input, faultyCallback);
      }).not.toThrow();

      // The decision must remain REJECT
      expect(result?.status).toBe('REJECT');
      if (result?.status === 'REJECT') {
        expect(result.reason).toBe(GuardViolation.IDENTITY_CLAIM);
      }
    });

    it('Telemetry error MUST NOT alter PASS decision (sanity check)', () => {
      const input = buildInput('A diferença foi registrada corretamente.');
      
      const faultyCallback = () => { throw new Error('Logger failure'); };

      let result: GuardResult | undefined;
      expect(() => {
        result = EpistemicGuard.evaluate(input, faultyCallback);
      }).not.toThrow();

      expect(result?.status).toBe('PASS');
    });
  });

  // ── Grupo 3 — Integridade do evento ─────────────────────────────────────────
  describe('Group 3: Event Integrity', () => {
    it('outputHash is deterministic for the same input', () => {
      const text = 'Sua essência é puramente focada.';
      const hash1 = hashOutput(text);
      const hash2 = hashOutput(text);
      expect(hash1).toBe(hash2);
    });

    it('outputHash is different for different inputs', () => {
      const hash1 = hashOutput('Texto A');
      const hash2 = hashOutput('Texto B');
      expect(hash1).not.toBe(hash2);
    });

    it('eventId is unique for each REJECT', () => {
      const input = buildInput('Você é altruísta.');
      let event1: GuardTelemetryEvent | undefined;
      let event2: GuardTelemetryEvent | undefined;

      EpistemicGuard.evaluate(input, (e) => { event1 = e; });
      EpistemicGuard.evaluate(input, (e) => { event2 = e; });

      expect(event1?.eventId).toBeDefined();
      expect(event2?.eventId).toBeDefined();
      expect(event1?.eventId).not.toBe(event2?.eventId);
    });
  });

  // ── Grupo 4 — Comportamento sem callback ────────────────────────────────────
  describe('Group 4: Behavior without callback', () => {
    it('Guard produces the same GuardResult whether callback is provided or not (REJECT)', () => {
      const input = buildInput('Você é altruísta.');
      
      const resultWith = EpistemicGuard.evaluate(input, () => {});
      const resultWithout = EpistemicGuard.evaluate(input);

      expect(resultWith).toEqual(resultWithout);
    });

    it('Guard produces the same GuardResult whether callback is provided or not (PASS)', () => {
      const input = buildInput('Anotado.');
      
      const resultWith = EpistemicGuard.evaluate(input, () => {});
      const resultWithout = EpistemicGuard.evaluate(input);

      expect(resultWith).toEqual(resultWithout);
    });
  });
});
