import { AcupressurePoint } from '../../types';

export const kidneyPoints: AcupressurePoint[] = [
  {
    id: 'cv4-guanyuan',
    name: 'Ren 4 (CV4) - Guanyuan - Portal da Origem',
    nameEn: 'CV4 - Guanyuan - Gate of Origin',
    description: 'Ponto Mu do Intestino Delgado. O local onde o Qi Original (Yuan Qi) é armazenado. Tonifica profundamente o Yang do Rim e o Qi vital. Indicado para exaustão profunda, infertilidade e fraqueza geral.',
    descriptionEn: 'Front-Mu Point of Small Intestine. Where Original Qi (Yuan Qi) is stored. Deeply tonifies Kidney Yang and vital Qi. Indicated for deep exhaustion, infertility, and general weakness.',
    position: { x: 50, y: 65 },
    image: '/CV4_Guanyuan.jpg',
    imageAlt: 'Localização do ponto Ren 4 (CV4) - Abdômen Inferior',
    benefits: ['Restaura Energia Vital Profunda', 'Trata Infertilidade/Impotência', 'Combate Fadiga Crônica', 'Fortalece o "Core" Energético'],
    benefitsEn: ['Restores Deep Vital Energy', 'Treats Infertility/Impotence', 'Combats Chronic Fatigue', 'Strengthens Energy Core'],
    isPremium: true,
    category: 'kidney',
    additionalCategories: ['sexual', 'immunity'],
    instructions: 'Localizado na linha média, 3 cun (4 dedos) abaixo do umbigo. Massagem circular suave gera calor.',
    duration: 180,
    pressure: 'leve'
  },
  {
    id: 'kd3-taixi',
    name: 'R3 (KD3) - Taixi - Riacho Supremo',
    nameEn: 'KD3 - Taixi - Supreme Stream',
    description: 'Acalma a mente, fortalece lombar e joelho, regula o útero. Trata dor lombar, tontura, fraqueza, sudorese noturna, tosse, respiração difícil/ruidosa, falta de ar, insônia, memória fraca, impotência, menstruação irregular e diabetes.',
    descriptionEn: 'Calms the mind, strengthens lumbar and knee, regulates uterus. Treats back pain, dizziness, weakness, night sweating, cough, difficult/noisy breathing, shortness of breath, insomnia, weak memory, impotence, irregular menstruation and diabetes.',
    position: { x: 35, y: 92 },
    image: '/KD3_Taixi.png',
    imageAlt: 'Localização do ponto R3 (Taixi) - Tornozelo Interno',
    benefits: ['Fortalece Lombar e Joelho', 'Trata Impotência/Menstruação', 'Melhora Memória e Sono', 'Combate Falta de Ar/Tosse'],
    benefitsEn: ['Strengthens Lumbar/Knee', 'Treats Impotence/Menstruation', 'Improves Memory/Sleep', 'Fights Shortness of Breath'],
    isPremium: true,
    category: 'kidney',
    additionalCategories: ['sexual', 'back_pain', 'lung'],
    instructions: 'Na depressão entre o maléolo interno (osso do tornozelo) e o tendão de Aquiles.',
    duration: 180,
    pressure: 'moderada'
  }
];
