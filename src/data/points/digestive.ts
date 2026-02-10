import { AcupressurePoint } from '../../types';

export const digestivePoints: AcupressurePoint[] = [
  {
    id: 'sp4-gongsun',
    name: 'BP4 (SP4) - Gongsun - Avô e Neto',
    nameEn: 'SP4 - Gongsun - Grandfather Grandson',
    description: 'Ponto Luo do Baço e Ponto de Abertura do Vaso Penetrador (Chong Mai). Harmoniza o Estômago, trata distúrbios menstruais e ansiedade gástrica.',
    descriptionEn: 'Luo Point of Spleen and Opening Point of Penetrating Vessel (Chong Mai). Harmonizes Stomach, treats menstrual disorders and gastric anxiety.',
    position: { x: 30, y: 95 },
    image: '/BP4_Gongsun.jpg',
    imageAlt: 'Localização do ponto BP4 (Gongsun) - Pé',
    benefits: ['Harmoniza Digestão', 'Trata Dor de Estômago', 'Regula Menstruação', 'Acalma a Mente'],
    benefitsEn: ['Harmonizes Digestion', 'Treats Stomach Pain', 'Regulates Menstruation', 'Calms Mind'],
    isPremium: true,
    category: 'digestive',
    additionalCategories: ['menstrual'],
    instructions: 'Na face interna do pé, na depressão distal à base do primeiro osso metatarsal.',
    duration: 120,
    pressure: 'moderada'
  }
];
