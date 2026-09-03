import { createHash } from 'crypto';

/**
 * Derives a deterministic SHA-256 hash from the LLM output.
 * Used for telemetry correlation without storing the raw output.
 */
export function hashOutput(text: string): string {
  if (typeof text !== 'string') return '';
  return createHash('sha256').update(text).digest('hex');
}
