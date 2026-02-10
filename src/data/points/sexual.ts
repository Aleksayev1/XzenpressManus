import { AcupressurePoint } from '../../types';

export const sexualPoints: AcupressurePoint[] = [
  {
    id: 'cv3-zhongji',
    name: 'Ren 3 (CV3) - Zhongji - Polo Central',
    nameEn: 'CV3 - Zhongji - Central Pole',
    description: 'Ponto Mu (Alarme) da Bexiga. CRUCIAL para saúde urogenital. EVIDÊNCIA: Estudos mostram aumento de óxido nítrico e fluxo sanguíneo pélvico. Trata incontinência, problemas de próstata, impotência e disfunção sexual.',
    descriptionEn: 'Front-Mu Point of the Bladder. CRITICAL for urogenital health. EVIDENCE: Studies show increased nitric oxide and pelvic blood flow. Treats incontinence, prostate issues, impotence, and sexual dysfunction.',
    position: { x: 50, y: 70 },
    image: '/CV3_Zhongji.jpg',
    imageAlt: 'Localização do ponto Ren 3 (CV3) - Abdômen Inferior',
    benefits: ['Aumenta Potência Sexual (Vasodilatação)', 'Trata Próstata e Bexiga', 'Alivia Cólicas Menstruais', 'Regula Micção'],
    benefitsEn: ['Increases Sexual Potency', 'Treats Prostate/Bladder', 'Relieves Menstrual Cramps', 'Regulates Urination'],
    isPremium: true,
    category: 'sexual',
    additionalCategories: ['kidney', 'menstrual'],
    instructions: 'Localizado na linha média, 1 cun (1 dedão) acima da borda superior do osso púbico. Pressionar moderadamente.',
    duration: 180,
    pressure: 'moderada'
  },
  {
    id: 'sp6-sanyinjiao',
    name: 'BP6 (SP6) - Sanyinjiao - Reunião dos 3 Yin',
    nameEn: 'SP6 - Sanyinjiao - Three Yin Intersection',
    description: 'Fortalece o baço, tira umidade, melhora fígado, tonifica rim, esfria o sangue e promove analgesia. Acalma a mente. Indicado para dor nos órgãos genitais, insônia, timidez, irritabilidade, sudorese noturna, calor, boca seca e problemas de próstata. O ponto GINECOLÓGICO e UROLÓGICO mestre.',
    descriptionEn: 'Strengthens spleen, removes dampness, improves liver, tonifies kidney, cools blood and promotes analgesia. Calms the mind. Indicated for genital pain, insomnia, shyness, irritability, night sweating, heat, dry mouth and prostate issues. Master GYNECOLOGICAL and UROLOGICAL point.',
    position: { x: 30, y: 90 },
    image: '/BP6_Sanyinjiao.png',
    imageAlt: 'Localização do ponto BP6 (Sanyinjiao) - Perna Interna',
    benefits: ['Fortalece Baço/Fígado/Rim', 'Trata Insônia e Timidez', 'Alivia Irritabilidade/Calor', 'Saúde da Próstata e Genitais'],
    benefitsEn: ['Strengthens Spleen/Liver/Kidney', 'Treats Insomnia/Shyness', 'Relieves Irritability/Heat', 'Prostate and Genital Health'],
    isPremium: true,
    category: 'sexual',
    additionalCategories: ['menstrual', 'digestive', 'emotional', 'kidney'],
    instructions: 'Face interna da perna, 4 dedos (3 cun) acima do maléolo interno (osso do tornozelo), atrás da tíbia.',
    duration: 180,
    pressure: 'moderada'
  }
];
