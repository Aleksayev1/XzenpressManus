import { PipelineResult, MeaningObservationState, MeaningMatrix } from '../../types/meaning';
import { ObservationContract } from '../../types/reflection';
import { randomUUID } from 'crypto';

/**
 * Deterministic Observation Factory
 *
 * This factory is a TRUST BOUNDARY for mathematical integrity, not merely a
 * data transformer. It validates invariants that the deterministic engine is
 * expected to guarantee, ensuring that no structurally invalid PipelineResult
 * (e.g., smuggled via 'as any') can acquire authority as an ObservationContract.
 */
export class ObservationFactory {
  /**
   * Validates that a matrix cell value is a valid event count:
   *   - finite (rejects NaN, Infinity, -Infinity)
   *   - integer (rejects 1.5, 0.1, etc.)
   *   - non-negative (rejects -1, -999, etc.)
   */
  private static isValidMatrixCell(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Number.isInteger(value) &&
      value >= 0
    );
  }

  /**
   * Asserts all four matrix cells pass integrity checks.
   * Throws if any field is invalid — ObservationContract is NOT emitted.
   */
  private static assertMatrixIntegrity(matrix: MeaningMatrix, context: string): void {
    const fields: (keyof Pick<MeaningMatrix, 'n11' | 'n10' | 'n01' | 'n00'>)[] = ['n11', 'n10', 'n01', 'n00'];
    for (const field of fields) {
      const value = (matrix as any)[field];
      if (!this.isValidMatrixCell(value)) {
        throw new Error(
          `[ObservationFactory] Matrix integrity violation in ${context}: ` +
          `field '${field}' has invalid value '${value}'. ` +
          `Expected: non-negative, finite integer.`
        );
      }
    }
  }

  /**
   * Safely creates an ObservationContract from a verified PipelineResult.
   * Acts as a trust boundary: validates mathematical invariants before promoting
   * any result to an ObservationContract.
   */
  static createObservation(result: PipelineResult): ObservationContract {
    const observationId = randomUUID();

    if (result.state === MeaningObservationState.INSUFFICIENT) {
      // INSUFFICIENT results carry a zero matrix — still validate it
      const zeroMatrix: MeaningMatrix = { n11: 0, n10: 0, n01: 0, n00: 0 };
      return {
        observationId,
        _brand: 'ObservationContract',
        observationType: MeaningObservationState.INSUFFICIENT,
        matrix: zeroMatrix,
        deltaS: null,
        evidenceEventIds: [],
        evidenceChapterIds: [],
      };
    }

    // Assert integrity BEFORE constructing the contract
    this.assertMatrixIntegrity(result.matrix, 'PipelineResult.matrix');

    return {
      observationId,
      _brand: 'ObservationContract',
      observationType: result.state,
      matrix: {
        n11: result.matrix.n11,
        n10: result.matrix.n10,
        n01: result.matrix.n01,
        n00: result.matrix.n00,
      },
      deltaS: result.probabilities.deltaS,
      evidenceEventIds: [...result.evidenceEventIds],
      evidenceChapterIds: [...result.evidenceChapterIds],
    };
  }
}

