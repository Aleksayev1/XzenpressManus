/**
 * Clinical Algorithms for Physiological Health Assessment
 * 
 * Weights rationale:
 * - HRV (40%): Primary indicator of autonomic nervous system resilience and stress recovery.
 * - RHR (20%): Inverted; lower resting heart rate generally indicates better cardiovascular efficiency.
 * - Deep Sleep (20%): Critical for physical restoration and hormonal regulation.
 * - REM Sleep (20%): Essential for cognitive function and emotional regulation.
 */

export interface HealthMetrics {
  hrv: number;            // Heart Rate Variability (ms)
  rhr: number;            // Resting Heart Rate (bpm)
  deepSleepMinutes: number; // Minutes spent in Deep Sleep
  remSleepMinutes: number;  // Minutes spent in REM Sleep
}

/**
 * Calculates the Jing Index (0-100 score).
 * Normalizes inputs based on standard clinical ranges.
 */
export const calculateJingIndex = (metrics: HealthMetrics): number => {
  // 1. HRV Score: Normalized to standard clinical healthy target of 80ms
  const hrvScore = Math.min(metrics.hrv / 80, 1) * 100;

  // 2. RHR Score: 50 bpm or lower = 100%, 70 bpm or higher = 0%
  // Capped between 0 and 100 to avoid negative values or exceeding 100%
  const rhrScore = Math.min(100, Math.max(0, (70 - metrics.rhr) / 20)) * 100;

  // 3. Deep Sleep Score: Capped at clinical standard of 120 minutes (2h)
  const deepSleepScore = Math.min(metrics.deepSleepMinutes / 120, 1) * 100;

  // 4. REM Sleep Score: Capped at clinical standard of 120 minutes (2h)
  const remSleepScore = Math.min(metrics.remSleepMinutes / 120, 1) * 100;

  // Weighted combination
  const jingIndex = (
    (hrvScore * 0.4) +
    (rhrScore * 0.2) +
    (deepSleepScore * 0.2) +
    (remSleepScore * 0.2)
  );

  return Math.round(Math.max(0, Math.min(100, jingIndex)));
};

/**
 * Calculates Biological Wear (Allostatic Load multiplier).
 * Returns a multiplier where:
 * - < 1.0 is Deep Recovery (Verde)
 * - 1.0 to 1.5 is Light Overload (Amarelo)
 * - > 1.5 is Accelerated Cell Wear (Vermelho)
 * 
 * Formula: 0.5 + (1 - (JingIndex / 100)) * 2.5
 * - A score of 100 results in 0.5 (deep rejuvenation)
 * - A score of 80 results in 1.0 (baseline aging rate)
 * - A score of 60 results in 1.5 (warning threshold)
 * - A score of 0 results in 3.0 (high biological wear/accelerated aging)
 */
export const calculateBiologicalWear = (metrics: HealthMetrics): number => {
  const jingIndex = calculateJingIndex(metrics);
  const wearMultiplier = 0.5 + (1 - (jingIndex / 100)) * 2.5;
  return parseFloat(Math.max(0.1, Math.min(4.0, wearMultiplier)).toFixed(2));
};
