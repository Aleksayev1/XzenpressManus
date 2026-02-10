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
  ...ynsaPoints
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
  ynsaPoints
};
