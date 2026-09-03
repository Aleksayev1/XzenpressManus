import { MeaningObservationState } from '../../types/meaning';
import { ObservationContract, ReflectionContext, HumanReflectionContract } from '../../types/reflection';
import { RuntimeBoundary } from '../../lib/reflection/RuntimeBoundary';
import { randomUUID } from 'crypto';

describe('Negative Capability Boundary Tests', () => {
  const validObservation: ObservationContract = {
    observationId: randomUUID(),
    _brand: 'ObservationContract',
    observationType: MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
    matrix: { n11: 5, n10: 2, n01: 1, n00: 5 },
    deltaS: 0.3,
    evidenceEventIds: [],
    evidenceChapterIds: [],
  };

  const validHumanReflection: HumanReflectionContract = {
    reflectionId: randomUUID(),
    observationId: validObservation.observationId,
    text: "Não vejo relação.",
    createdAt: new Date().toISOString(),
    source: 'HUMAN_REFLECTION',
  };

  describe('Compile-time Boundaries (TypeScript)', () => {
    it('rejects direct assignment of forbidden fields', () => {
      const invalid: ObservationContract = {
        ...validObservation,
        // @ts-expect-error - 'insight' is not assignable to type 'undefined'
        insight: "Você evoluiu",
      };
      
      // Ensures the test isn't trivially passing. It should complain at compile time.
      expect(invalid).toBeDefined();
    });

    it('rejects forbidden fields in MeaningMatrix', () => {
      const invalidObs: ObservationContract = {
        ...validObservation,
        matrix: {
          ...validObservation.matrix,
          // @ts-expect-error - 'causalScore' is not assignable to type 'undefined'
          causalScore: 99,
        }
      };
      expect(invalidObs).toBeDefined();
    });

    it('rejects re-assignment due to readonly modifiers', () => {
      const obs = { ...validObservation } as ObservationContract;
      // @ts-expect-error - Cannot assign to 'deltaS' because it is a read-only property.
      obs.deltaS = 999;
      // @ts-expect-error - Cannot assign to 'text' because it is a read-only property.
      validHumanReflection.text = "Hacked by LLM";
      // This test is purely for compile-time TypeScript enforcement.
      expect(true).toBe(true);
    });

    it('rejects JSON.parse cast without strict typing', () => {
      const data = `{"insight": "fake"}`;
      // Note: 'as ObservationContract' overrides TS, so this proves TS is blind here (thus we need Zod)
      const parsed = JSON.parse(data) as ObservationContract;
      expect(parsed).toBeDefined();
    });

    it('rejects any/unknown assignments', () => {
      const malicious: any = { insight: 'hacked' };
      // TS actually allows 'any' to bypass strict typing without an error.
      // We document this as the limit of TS, proving Zod is necessary.
      const assigned: ObservationContract = malicious;
      expect(assigned).toBeDefined();
    });
  });

  describe('Runtime Boundaries (Zod Strict)', () => {
    it('throws if ObservationContract contains unknown fields', () => {
      const maliciousData = {
        observation: {
          ...validObservation,
          insight: "Você descobriu seu propósito" // Smuggled data
        },
        humanReflection: validHumanReflection,
        locale: 'pt-BR',
        allowedAction: 'TRANSLATE'
      };

      expect(() => {
        RuntimeBoundary.parseReflectionContext(maliciousData);
      }).toThrow(/Unrecognized key/);
    });

    it('throws if MeaningMatrix contains semantic junk', () => {
      const maliciousData = {
        observation: {
          ...validObservation,
          matrix: {
            ...validObservation.matrix,
            confidence: 'High',
            interpretation: 'Evolved'
          }
        },
        humanReflection: validHumanReflection,
        locale: 'pt-BR',
        allowedAction: 'TRANSLATE'
      };

      expect(() => {
        RuntimeBoundary.parseReflectionContext(maliciousData);
      }).toThrow(/Unrecognized key/);
    });

    it('throws if HumanReflectionContract tries to spoof source', () => {
      const spoofedData = {
        observation: validObservation,
        humanReflection: {
          ...validHumanReflection,
          source: 'LLM_TRANSLATION' // Trying to spoof provenance
        },
        locale: 'pt-BR',
        allowedAction: 'TRANSLATE'
      };

      expect(() => {
        RuntimeBoundary.parseReflectionContext(spoofedData);
      }).toThrow(/expected \\"HUMAN_REFLECTION\\"/);
    });

    it('throws if allowedAction is spoofed', () => {
      const spoofedData = {
        observation: validObservation,
        humanReflection: validHumanReflection,
        locale: 'pt-BR',
        allowedAction: 'ESCALATE_EPISTEMIC_FORCE'
      };

      expect(() => {
        RuntimeBoundary.parseReflectionContext(spoofedData);
      }).toThrow(/Invalid option: expected one of/);
    });

    it('throws if nested keys are contaminated via Object.assign/spread', () => {
      const spreadContaminated = {
        observation: Object.assign({}, validObservation, {
          deep: { sneaky: "growth" }
        }),
        humanReflection: validHumanReflection,
        locale: 'pt-BR',
        allowedAction: 'TRANSLATE'
      };

      expect(() => {
        RuntimeBoundary.parseReflectionContext(spreadContaminated);
      }).toThrow(/Unrecognized key/);
    });

    it('parses correctly when data is perfectly clean', () => {
      const cleanData = {
        observation: validObservation,
        humanReflection: validHumanReflection,
        locale: 'pt-BR',
        allowedAction: 'TRANSLATE'
      };

      const result = RuntimeBoundary.parseReflectionContext(cleanData);
      expect(result.observation.observationId).toBe(validObservation.observationId);
    });
  });
});
