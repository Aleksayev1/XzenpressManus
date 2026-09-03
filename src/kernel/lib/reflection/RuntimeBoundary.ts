import { z } from 'zod';
import { MeaningObservationState } from '../../types/meaning';
import { ObservationContract, HumanReflectionContract, ReflectionContext } from '../../types/reflection';

/**
 * Strict Zod Schema for MeaningMatrix
 */
const MeaningMatrixSchema = z.object({
  n11: z.number(),
  n10: z.number(),
  n01: z.number(),
  n00: z.number(),
}).strict(); // REJECTS unknown keys!

/**
 * Strict Zod Schema for ObservationContract
 */
const ObservationContractSchema = z.object({
  observationId: z.string().uuid(),
  _brand: z.literal('ObservationContract'),
  observationType: z.enum([
    MeaningObservationState.OBSERVED_DIFFERENCE_POSITIVE,
    MeaningObservationState.OBSERVED_DIFFERENCE_NEGATIVE,
    MeaningObservationState.NO_OBSERVED_DIFFERENCE,
    MeaningObservationState.INSUFFICIENT,
  ]),
  matrix: MeaningMatrixSchema,
  deltaS: z.number().nullable(),
  evidenceEventIds: z.array(z.string()),
  evidenceChapterIds: z.array(z.string()),
}).strict();

/**
 * Strict Zod Schema for HumanReflectionContract
 */
const HumanReflectionContractSchema = z.object({
  reflectionId: z.string().uuid(),
  observationId: z.string().uuid(),
  text: z.string(),
  createdAt: z.string().datetime(),
  previousReflectionId: z.string().uuid().optional(),
  source: z.literal('HUMAN_REFLECTION'),
}).strict();

/**
 * Strict Zod Schema for ReflectionContext
 */
export const ReflectionContextSchema = z.object({
  observation: ObservationContractSchema,
  humanReflection: HumanReflectionContractSchema,
  locale: z.enum(['pt-BR', 'en-US']),
  allowedAction: z.enum(['TRANSLATE', 'ACKNOWLEDGE', 'PRESERVE_AMBIGUITY']),
}).strict();

/**
 * Boundary Layer: Validates untrusted data entering the system.
 */
export class RuntimeBoundary {
  /**
   * Safely parses any untrusted input into a ReflectionContext.
   * Throws an error (or returns safe union) if ANY unknown fields exist.
   */
  static parseReflectionContext(data: unknown): ReflectionContext {
    return ReflectionContextSchema.parse(data);
  }
}
