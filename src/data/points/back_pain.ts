import { AcupressurePoint } from '../../types';

export const back_painPoints: AcupressurePoint[] = [
  {
    id: 'bl23-shenshu',
    name: 'B23 (BL23) - Shenshu - Assentamento do Rim',
    nameEn: 'BL23 - Shenshu - Kidney Shu',
    description: 'Ponto Shu das costas do Rim. Acesso direto à energia renal. Fortalece a lombar, melhora a audição e a vitalidade sexual. Essencial para dores nas costas crônicas.',
    descriptionEn: 'Back-Shu of Kidney. Direct access to Kidney energy. Strengthens lower back, improves hearing and sexual vitality. Essential for chronic back pain.',
    position: { x: 40, y: 50 },
    image: '/BL23_Shenshu_User_Correct.png',
    imageAlt: 'Localização do ponto B23 (Shenshu) - Lombar',
    benefits: ['Fortalece a Lombar', 'Aumenta Vitalidade Sexual', 'Melhora Audição/Zumbido', 'Trata Fadiga Adrenal'],
    benefitsEn: ['Strengthens Lower Back', 'Increases Sexual Vitality', 'Improves Hearing/Tinnitus', 'Treats Adrenal Fatigue'],
    isPremium: true,
    category: 'back_pain',
    additionalCategories: ['kidney', 'sexual'],
    instructions: 'Na região lombar, 1.5 cun (2 dedos) lateral à linha média, na altura da L2 (segunda vértebra lombar).',
    duration: 180,
    pressure: 'moderada'
  }
];
