/**
 * acupressurePoints.ts
 *
 * Single source of truth for all acupressure point data.
 * All points are defined in src/data/points/*.ts (one file per category).
 * This file simply re-exports from the composed index so that all existing
 * component imports (from '../data/acupressurePoints') continue to work
 * without any changes.
 *
 * To ADD or EDIT a point: modify the correct file inside src/data/points/
 *   - General / MTC Geral:  points/general.ts
 *   - Septicemia / Zoster:  points/septicemia.ts
 *   - Immunity:             points/immunity.ts
 *   - ATM:                  points/atm.ts
 *   - Cardio:               points/cardio.ts
 *   - Sexual / Hormonal:    points/sexual.ts
 *   - Kidney:               points/kidney.ts
 *   - Back Pain:            points/back_pain.ts
 *   - Headache:             points/headache.ts
 *   - Digestive:            points/digestive.ts
 *   - Neuro:                points/neuro.ts
 *   - Cranio / YNSA Basic:  points/cranio.ts
 *   - YNSA Scalp:           points/ynsa.ts
 */

export {
  acupressurePoints,
  generalPoints,
  cranioPoints,
  neuroPoints,
  septicemiaPoints,
  atmPoints,
  cardioPoints,
  sexualPoints,
  kidneyPoints,
  back_painPoints,
  headachePoints,
  digestivePoints,
  immunityPoints,
  ynsaPoints,
  getPointsByCategory,
  getPremiumPoints,
  getFreePoints,
  getPointById,
  getPointsStats,
} from './points/index';

// Also re-export the AcupressurePoint type for convenience
export type { AcupressurePoint } from '../types';
