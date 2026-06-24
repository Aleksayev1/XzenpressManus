import { AcupressurePoint } from '../../types';

export const immunityPoints: AcupressurePoint[] = [
  {
    id: 'quchi-li11',
    name: 'Quchi (IG11) - Lagoa Torta',
    nameEn: 'Quchi (LI11) - Pool at the Crook',
    nameEs: 'Quchi (IG11) - Estanque en la Curva',
    nameFr: 'Quchi (GI11) - Étang de la Courbe',
    description: 'Ponto chave para desinflamar, baixar febre e tratar dores no braço/cotovelo. Fortalece o sistema imunológico.',
    descriptionEn: 'Key point to reduce inflammation, lower fever and treat arm/elbow pain. Strengthens the immune system.',
    position: { x: 70, y: 50 },
    image: '/mtc_ig11.jpg',
    imageAlt: 'Localização do ponto Quchi IG11',
    benefits: ['Reduz inflamação', 'Alivia dor no cotovelo', 'Baixa febre', 'Melhora pele'],
    benefitsEn: ['Reduces inflammation', 'Relieves elbow pain', 'Lowers fever', 'Improves skin'],
    isPremium: true,
    category: 'immunity',
    additionalCategories: ['general'],
    instructions: 'APLICAÇÃO BILATERAL: Localizado na dobra do cotovelo. Pressionar por 2 minutos.',
    duration: 120,
    pressure: 'firme'
  }
];
