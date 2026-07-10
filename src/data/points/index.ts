import { AcupressurePoint } from '../../types';
import { generalPoints } from './general';
import { cranioPoints } from './cranio';
import { neuroPoints } from './neuro';
import { septicemiaPoints } from './septicemia';
import { atmPoints } from './atm';
import { cardioPoints } from './cardio';
import { sexualPoints } from './sexual';
import { kidneyPoints } from './kidney';
import { back_painPoints } from './back_pain';
import { headachePoints } from './headache';
import { digestivePoints } from './digestive';
import { immunityPoints } from './immunity';
import { ynsaPoints } from './ynsa';
import { spleenPoints } from './spleen';
import { lungPoints } from './lung';
import { largeIntestinePoints } from './large_intestine';
import { heartPoints } from './heart';
import { remainingMeridianPoints } from './remaining_meridians';

export const acupressurePoints: AcupressurePoint[] = [
  ...generalPoints,
  ...cranioPoints,
  ...neuroPoints,
  ...septicemiaPoints,
  ...atmPoints,
  ...cardioPoints,
  ...sexualPoints,
  ...kidneyPoints,
  ...back_painPoints,
  ...headachePoints,
  ...digestivePoints,
  ...immunityPoints,
  ...ynsaPoints,
  ...spleenPoints,
  ...lungPoints,
  ...largeIntestinePoints,
  ...heartPoints,
  ...remainingMeridianPoints
];

// Export individual categories for direct access if needed
export {
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
  spleenPoints,
  lungPoints,
  largeIntestinePoints,
  heartPoints,
  remainingMeridianPoints
};

// ===== QUERY HELPER FUNCTIONS =====

/** Filter points by category */
export const getPointsByCategory = (category: string, isPremium: boolean = false) => {
  if (category === 'all') {
    return isPremium ? acupressurePoints : acupressurePoints.filter(p => !p.isPremium);
  }
  if (category === 'mtc-premium') {
    const generalPremium = acupressurePoints.filter(p => p.category === 'general' && p.isPremium);
    return isPremium ? generalPremium : [];
  }
  const categoryPoints = acupressurePoints.filter(p =>
    p.category === category || (p.additionalCategories && p.additionalCategories.includes(category))
  );
  return isPremium ? categoryPoints : categoryPoints.filter(p => !p.isPremium);
};

/** Return premium points */
export const getPremiumPoints = () => acupressurePoints.filter(p => p.isPremium);

/** Return free points */
export const getFreePoints = () => acupressurePoints.filter(p => !p.isPremium);

/** Find point by ID */
export const getPointById = (id: string): AcupressurePoint | undefined =>
  acupressurePoints.find(p => p.id === id);

/** Return stats */
export const getPointsStats = () => {
  const categories = [...new Set(acupressurePoints.map(p => p.category))];
  return {
    totalPoints: acupressurePoints.length,
    premiumCount: getPremiumPoints().length,
    freeCount: getFreePoints().length,
    categoriesCount: categories.length,
    categories
  };
};
