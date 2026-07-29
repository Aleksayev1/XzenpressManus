import { AcupressurePoint } from '../../types';

export const headachePoints: AcupressurePoint[] = [
  {
    id: 'gb20-fengchi',
    name: 'VB20 (GB20) - Fengchi - Lagoa do Vento',
    nameEn: 'GB20 - Fengchi - Wind Pool',
    description: 'Ponto mestre para dores de cabeça, tensão na nuca, vertigem e resfriados (Vento). Clareia os olhos e a mente. Excelente para hipertensão e AVC.',
    descriptionEn: 'Master point for headaches, neck tension, vertigo, and colds (Wind). Clears eyes and mind. Excellent for hypertension and stroke.',
    position: { x: 45, y: 10 },
    image: '/du20-baihui-avc.jpg',
    imageAlt: 'Localização do ponto VB20 (Fengchi) - Nuca',
    benefits: ['Alivia Dor de Cabeça/Enxaqueca', 'Relaxa Pescoço e Ombros', 'Trata Tontura/Labirintite', 'Clareia a Visão'],
    benefitsEn: ['Relieves Headache/Migraine', 'Relaxes Neck/Shoulders', 'Treats Dizziness/Vertigo', 'Clears Vision'],
    isPremium: true,
    category: 'headache',
    additionalCategories: ['neck', 'general'],
    instructions: 'Na base do crânio, nas depressões entre os músculos trapézio e esternocleidomastóideo.',
    duration: 180,
    pressure: 'moderada'
  }
];
