import { AcupressurePoint } from '../../types';

export const digestivePoints: AcupressurePoint[] = [
  {
    id: 'sp4-gongsun',
    name: 'BP4 (SP4) - Gongsun - Avô e Neto',
    nameEn: 'SP4 - Gongsun - Grandfather Grandson',
    description: 'Ponto Luo do Baço e Ponto de Abertura do Vaso Penetrador (Chong Mai). Harmoniza o Estômago, trata distúrbios menstruais e ansiedade gástrica.',
    descriptionEn: 'Luo Point of Spleen and Opening Point of Penetrating Vessel (Chong Mai). Harmonizes Stomach, treats menstrual disorders and gastric anxiety.',
    position: { x: 30, y: 95 },
    image: '/BP4_Gongsun_New.png',
    imageAlt: 'Localização do ponto BP4 (Gongsun) - Pé',
    benefits: ['Harmoniza Digestão', 'Trata Dor de Estômago', 'Regula Menstruação', 'Acalma a Mente'],
    benefitsEn: ['Harmonizes Digestion', 'Treats Stomach Pain', 'Regulates Menstruation', 'Calms Mind'],
    isPremium: true,
    category: 'digestive',
    additionalCategories: ['menstrual', 'general'],
    instructions: 'Na face interna do pé, na depressão distal à base do primeiro osso metatarsal.',
    duration: 120,
    pressure: 'moderada'
  },
  {
    id: 'sp9-yinlingquan',
    name: 'BP9 (SP9) - Yinlingquan - Fonte da Colina Yin',
    nameEn: 'SP9 - Yinlingquan - Yin Mound Spring',
    description: 'Ponto He-Mar e ponto de Água do meridiano do Baço (Elemento Terra). Principal ponto para eliminar umidade do aquecedor inferior, tratar edema, distúrbios urinários, dor ou inchaço no joelho e problemas digestivos associados ao excesso de umidade (Terra).',
    descriptionEn: 'He-Sea and Water point of Spleen meridian (Earth Element). Primary point to resolve dampness in the lower burner, treat edema, urinary disorders, knee pain or swelling, and digestive issues related to excess dampness (Earth).',
    position: { x: 32, y: 55 },
    image: '/BP9_Yinlingquan_New.png',
    imageAlt: 'Localização do ponto BP9 (Yinlingquan) - Perna',
    benefits: ['Elimina Umidade', 'Trata Edemas', 'Alivia Dor no Joelho', 'Harmoniza Vias Urinárias', 'Equilibra Elemento Terra'],
    benefitsEn: ['Resolves Dampness', 'Treats Edema', 'Relieves Knee Pain', 'Harmonizes Urinary Tract', 'Balances Earth Element'],
    isPremium: false,
    category: 'digestive',
    additionalCategories: ['general'],
    instructions: 'Na face interna da perna, na depressão localizada no ângulo formado pelo côndilo medial da tíbia e a borda posterior da tíbia.',
    duration: 120,
    pressure: 'moderada'
  }
];
