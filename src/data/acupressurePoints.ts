import { AcupressurePoint } from '../types';

export const acupressurePoints: AcupressurePoint[] = [
  // ===== PONTOS GRATUITOS - MTC (Medicina Tradicional Chinesa) =====
  {
    id: 'yintang-ex-hn3',
    name: 'Yintang (EX-HN3)',
    nameEn: 'Third Eye Point',
    nameEs: 'Punto del Tercer Ojo',
    nameZh: '印堂穴',
    nameHi: 'तीसरी आंख बिंदु',
    nameAr: 'نقطة العين الثالثة',
    nameBn: 'তৃতীয় নেত্র বিন্দু',
    nameRu: 'Точка Третьего Глаза',
    nameJa: '第三の目のポイント',
    nameDe: 'Drittes Auge Punkt',
    nameFr: 'Point du Troisième Œil',
    description: 'Ponto principal para reduzir estresse, ansiedade e tensão diária. Localizado entre as sobrancelhas, no centro da testa (veja a marcação em destaque na imagem). Pressione suavemente com o dedo médio por 1-2 minutos, respirando profundamente.',
    descriptionEn: 'Main point for reducing stress, anxiety and daily tension. Located between eyebrows, center of forehead. Press gently with middle finger for 1-2 minutes, breathing deeply.',
    descriptionEs: 'Punto principal para reducir estrés, ansiedad y tensión diaria. Ubicado entre las cejas, centro de la frente. Presiona suavemente con el dedo medio por 1-2 minutos, respirando profundamente.',
    descriptionZh: '减少压力、焦虑和日常紧张的主要穴位。位于眉毛之间，前额中央。用中指轻轻按压1-2分钟，深呼吸。',
    descriptionHi: 'तनाव, चिंता और दैनिक तनाव को कम करने का मुख्य बिंदु। भौंहों के बीच, माथे के केंद्र में स्थित। मध्यमा अंगुली से 1-2 मिनट तक धीरे से दबाएं, गहरी सांस लेते हुए।',
    descriptionAr: 'النقطة الرئيسية لتقليل التوتر والقلق والضغط اليومي. تقع بين الحاجبين، في وسط الجبهة. اضغط برفق بالإصبع الأوسط لمدة 1-2 دقيقة، مع التنفس العميق.',
    descriptionBn: 'চাপ, উদ্বেগ এবং দৈনিক টেনশন কমানোর প্রধান বিন্দু। ভ্রুর মাঝে, কপালের কেন্দ্রে অবস্থিত। মধ্যমা আঙুল দিয়ে 1-2 মিনিট আলতো করে চাপুন, গভীর শ্বাস নিয়ে।',
    descriptionRu: 'Основная точка для снижения стресса, тревоги и ежедневного напряжения. Расположена между бровями, в центре лба. Мягко нажимайте средним пальцем 1-2 минуты, глубоко дыша.',
    descriptionJa: 'ストレス、不安、日常の緊張を軽減する主要なポイント。眉毛の間、額の中央に位置。中指で1-2分間優しく押し、深呼吸する。',
    descriptionDe: 'Hauptpunkt zur Reduzierung von Stress, Angst und täglicher Anspannung. Zwischen den Augenbrauen, in der Mitte der Stirn gelegen. Sanft mit dem Mittelfinger 1-2 Minuten drücken, dabei tief atmen.',
    descriptionFr: 'Point principal pour réduire stress, anxiété et tension quotidienne. Situé entre les sourcils, centre du front. Pressez doucement avec le majeur pendant 1-2 minutes, en respirant profondément.',
    position: { x: 50, y: 25 },
    image: '/ponto-da-acupuntura-que-tira-ex-hn-yintang-EX HN3.jpg',
    imageAlt: 'Localização do ponto Yintang (EX-HN3) entre as sobrancelhas',
    benefits: ['Reduz estresse e ansiedade diária', 'Alivia tensão mental', 'Promove relaxamento profundo', 'Acalma a mente agitada'],
    benefitsEn: ['Reduces daily stress and anxiety', 'Relieves mental tension', 'Promotes deep relaxation', 'Calms agitated mind'],
    benefitsEs: ['Reduce estrés y ansiedad diaria', 'Alivia tensión mental', 'Promueve relajación profunda', 'Calma la mente agitada'],
    benefitsFr: ['Réduit stress et anxiété quotidiens', 'Soulage tension mentale', 'Favorise relaxation profonde', 'Calme esprit agité'],
    isPremium: false,
    category: 'general',
    instructions: 'Pressione suavemente com o dedo médio por 1-2 minutos, respirando profundamente.',
    duration: 120,
    pressure: 'leve'
  },

  {
    id: 'baihui-basic-vg20',
    name: 'Baihui Básico (VG20)',
    nameEn: 'Basic Hundred Meetings',
    nameEs: 'Cien Reuniones Básico',
    nameFr: 'Cent Réunions Basique',
    description: 'Ponto para elevar a mente, combater fadiga mental leve e fortalecer energia yang. Localizado no topo da cabeça, no centro do crânio (veja a marcação em destaque na imagem). Pressione suavemente com o dedo médio por 2 minutos.',
    descriptionEn: 'Point to elevate mind, combat mild mental fatigue and strengthen yang energy. Located at top of head, center of skull. Press gently with middle finger for 2 minutes.',
    descriptionEs: 'Punto para elevar mente, combatir fatiga mental leve y fortalecer energía yang. Ubicado en la parte superior de la cabeza, centro del cráneo. Presiona suavemente con el dedo medio por 2 minutos.',
    descriptionFr: 'Point pour élever esprit, combattre fatigue mentale légère et renforcer énergie yang. Situé au sommet de la tête, centre du crâne. Pressez doucement avec le majeur pendant 2 minutes.',
    position: { x: 50, y: 15 },
    image: '/GV20 Baihui.jpg',
    imageAlt: 'Localização do ponto Baihui Básico VG20 - Técnica simples',
    benefits: ['Eleva a mente (básico)', 'Combate fadiga leve', 'Melhora clareza básica', 'Fortalece yang suavemente'],
    benefitsEn: ['Elevates mind (basic)', 'Combats mild fatigue', 'Improves basic clarity', 'Gently strengthens yang'],
    benefitsEs: ['Eleva mente (básico)', 'Combate fatiga leve', 'Mejora claridad básica', 'Fortalece yang suavemente'],
    benefitsFr: ['Élève esprit (basique)', 'Combat fatigue légère', 'Améliore clarté basique', 'Renforce yang doucement'],
    isPremium: false,
    category: 'general',
    instructions: 'Técnica básica: Pressione suavemente o topo da cabeça com o dedo médio por 2 minutos.',
    duration: 120,
    pressure: 'leve'
  },

  {
    id: 'yongquan-r1-kd1',
    name: 'Yongquan (R1/KD1) - Fonte Borbulhante',
    nameEn: 'Yongquan (R1/KD1) - Bubbling Spring',
    nameEs: 'Yongquan (R1/KD1) - Fuente Burbujeante', 
    nameFr: 'Yongquan (R1/KD1) - Source Bouillonnante',
    description: 'Ponto para acalmar a mente agitada, tratar vertigem, tontura e promover ancoragem energética. Localizado na sola do pé, na depressão que se forma quando você dobra os dedos (veja a marcação vermelha em destaque na imagem). Pressionar firmemente por 2-3 minutos.',
    descriptionEn: 'Point to calm agitated mind, treat vertigo, dizziness and promote energetic grounding. Located on sole of foot, in depression formed when you curl toes. Press firmly for 2-3 minutes.',
    descriptionEs: 'Punto para calmar mente agitada, tratar vértigo, mareos y promover anclaje energético. Ubicado en planta del pie, en depresión que se forma al doblar dedos. Presionar firmemente por 2-3 minutos.',
    descriptionFr: 'Point pour calmer esprit agité, traiter vertiges, étourdissements et favoriser ancrage énergétique. Situé sur plante du pied, dans dépression formée en pliant orteils. Presser fermement pendant 2-3 minutes.',
    position: { x: 50, y: 90 },
    image: '/R1 Acalma a mente, Vertigem, Tontura Agitação.jpg',
    imageAlt: 'Localização do ponto Yongquan R1 na sola do pé',
    benefits: ['Acalma a mente agitada', 'Trata vertigem e tontura', 'Reduz agitação e ansiedade', 'Promove ancoragem energética'],
    benefitsEn: ['Calms agitated mind', 'Treats vertigo and dizziness', 'Reduces agitation and anxiety', 'Promotes energetic grounding'],
    benefitsEs: ['Calma mente agitada', 'Trata vértigo y mareos', 'Reduce agitación y ansiedad', 'Promueve anclaje energético'],
    benefitsFr: ['Calme esprit agité', 'Traite vertiges et étourdissements', 'Réduit agitation et anxiété', 'Favorise ancrage énergétique'],
    isPremium: false,
    category: 'general',
    instructions: 'Localizar na sola do pé, na depressão que se forma quando você dobra os dedos. Pressionar firmemente por 2-3 minutos.',
    duration: 180,
    pressure: 'moderada'
  },

  {
    id: 'cranio-frontal',
    name: 'Ponto Frontal Craniano',
    nameEn: 'Cranial Frontal Point',
    nameEs: 'Punto Frontal Craneal',
    nameFr: 'Point Frontal Crânien',
    description: 'Ponto para reduzir estresse, ansiedade e acalmar o sistema nervoso através da estimulação do córtex frontal. Localizado na região frontal da cabeça (veja as marcações em destaque na imagem). Aplicar pressão suave com movimentos circulares por 2-3 minutos.',
    descriptionEn: 'Point to reduce stress, anxiety and calm nervous system through frontal cortex stimulation. Located in frontal region of head. Apply gentle pressure with circular movements for 2-3 minutes.',
    descriptionEs: 'Punto para reducir estrés, ansiedad y calmar sistema nervioso a través de estimulación del córtex frontal. Ubicado en región frontal de la cabeza. Aplicar presión suave con movimientos circulares por 2-3 minutos.',
    descriptionFr: 'Point pour réduire stress, anxiété et calmer système nerveux par stimulation du cortex frontal. Situé en région frontale de la tête. Appliquer pression douce avec mouvements circulaires pendant 2-3 minutes.',
    position: { x: 50, y: 30 },
    image: '/Ponto básico A dor de cabeça e enxaqueca copy copy copy.jpg',
    imageAlt: 'Localização do ponto frontal craniano na região frontal da cabeça',
    benefits: ['Reduz estresse e ansiedade', 'Acalma sistema nervoso', 'Promove relaxamento cerebral', 'Diminui tensão craniana'],
    benefitsEn: ['Reduces stress and anxiety', 'Calms nervous system', 'Promotes brain relaxation', 'Decreases cranial tension'],
    benefitsEs: ['Reduce estrés y ansiedad', 'Calma sistema nervioso', 'Promueve relajación cerebral', 'Disminuye tensión craneal'],
    benefitsFr: ['Réduit stress et anxiété', 'Calme système nerveux', 'Favorise relaxation cérébrale', 'Diminue tension crânienne'],
    isPremium: false,
    category: 'cranio',
    instructions: 'Aplicar pressão suave com movimentos circulares na região frontal por 2-3 minutos, focando no relaxamento.',
    duration: 180,
    pressure: 'muito leve'
  },

  {
    id: 'shenmen-c7-he7',
    name: 'Shenmen (C7/HE7) - Portal do Espírito',
    nameEn: 'Shenmen (C7/HE7) - Spirit Gate',
    nameEs: 'Shenmen (C7/HE7) - Puerta del Espíritu',
    nameFr: 'Shenmen (C7/HE7) - Porte de l\'Esprit',
    description: 'Ponto para acalmar a mente agitada, reduzir estresse emocional e promover tranquilidade interior. Localizado na dobra do punho, lado do dedo mínimo (veja a marcação em destaque na imagem). Pressionar suavemente por 2-3 minutos.',
    descriptionEn: 'Point to calm agitated mind, reduce emotional stress and promote inner tranquility. Located at wrist crease, pinky finger side. Press gently for 2-3 minutes.',
    descriptionEs: 'Punto para calmar mente agitada, reducir estrés emocional y promover tranquilidad interior. Ubicado en pliegue de muñeca, lado del dedo meñique. Presionar suavemente por 2-3 minutos.',
    descriptionFr: 'Point pour calmer esprit agité, réduire stress émotionnel et favoriser tranquillité intérieure. Situé au pli du poignet, côté auriculaire. Presser doucement pendant 2-3 minutes.',
    position: { x: 20, y: 70 },
    image: '/C 7 Shenmen Acalma a mente Estresse.jpg',
    imageAlt: 'Localização do ponto Shenmen C7 no punho',
    benefits: ['Acalma a mente agitada', 'Reduz estresse emocional', 'Promove tranquilidade', 'Melhora qualidade do sono'],
    benefitsEn: ['Calms agitated mind', 'Reduces emotional stress', 'Promotes tranquility', 'Improves sleep quality'],
    benefitsEs: ['Calma mente agitada', 'Reduce estrés emocional', 'Promueve tranquilidad', 'Mejora calidad del sueño'],
    benefitsFr: ['Calme esprit agité', 'Réduit stress émotionnel', 'Favorise tranquillité', 'Améliore qualité sommeil'],
    isPremium: false,
    category: 'general',
    instructions: 'Pressionar suavemente na dobra do punho, lado do dedo mínimo, por 2-3 minutos.',
    duration: 180,
    pressure: 'leve'
  },

  {
    id: 'laogong-pc8',
    name: 'Laogong (PC8) - Palácio do Trabalho',
    nameEn: 'Laogong (PC8) - Labor Palace',
    nameEs: 'Laogong (PC8) - Palacio del Trabajo',
    nameFr: 'Laogong (PC8) - Palais du Travail',
    description: 'Ponto para acalmar palpitações cardíacas, reduzir ansiedade aguda e equilibrar energia do coração. Localizado no centro da palma da mão (veja a marcação em destaque na imagem). Pressionar firmemente com o polegar da outra mão por 2-3 minutos.',
    descriptionEn: 'Point to calm heart palpitations, reduce acute anxiety and balance heart energy. Located in center of palm. Press firmly with thumb of other hand for 2-3 minutes.',
    descriptionEs: 'Punto para calmar palpitaciones cardíacas, reducir ansiedad aguda y equilibrar energía del corazón. Ubicado en centro de la palma. Presionar firmemente con pulgar de la otra mano por 2-3 minutos.',
    descriptionFr: 'Point pour calmer palpitations cardiaques, réduire anxiété aiguë et équilibrer énergie du cœur. Situé au centre de la paume. Presser fermement avec pouce de l\'autre main pendant 2-3 minutes.',
    position: { x: 50, y: 75 },
    image: '/PC8 Laogong Medo ansiedade boca seca.jpg',
    imageAlt: 'Localização do ponto Laogong PC8 no centro da palma da mão',
    benefits: ['Acalma palpitações cardíacas', 'Reduz ansiedade aguda', 'Equilibra energia do coração', 'Promove tranquilidade'],
    benefitsEn: ['Calms heart palpitations', 'Reduces acute anxiety', 'Balances heart energy', 'Promotes tranquility'],
    benefitsEs: ['Calma palpitaciones cardíacas', 'Reduce ansiedad aguda', 'Equilibra energía del corazón', 'Promueve tranquilidad'],
    benefitsFr: ['Calme palpitations cardiaques', 'Réduit anxiété aiguë', 'Équilibre énergie du cœur', 'Favorise tranquillité'],
    isPremium: false,
    category: 'general',
    instructions: 'Pressionar firmemente o centro da palma da mão com o polegar da outra mão por 2-3 minutos.',
    duration: 180,
    pressure: 'moderada'
  },

  {
    id: 'tiantu-ren22',
    name: 'Tiantu (Ren22) - Proeminência Celestial',
    nameEn: 'Tiantu (Ren22) - Celestial Prominence',
    nameEs: 'Tiantu (Ren22) - Prominencia Celestial',
    nameFr: 'Tiantu (Ren22) - Proéminence Céleste',
    description: 'Ponto para aliviar voz rouca, reduzir tosse seca, melhorar respiração e relaxar tensão na garganta. Localizado na base da garganta, na depressão acima do osso do peito (veja a marcação em destaque na imagem). Pressionar muito suavemente por 1-2 minutos.',
    descriptionEn: 'Point to relieve hoarse voice, reduce dry cough, improve breathing and relax throat tension. Located at base of throat, in depression above breastbone. Press very gently for 1-2 minutes.',
    descriptionEs: 'Punto para aliviar voz ronca, reducir tos seca, mejorar respiración y relajar tensión en garganta. Ubicado en base de garganta, en depresión sobre hueso del pecho. Presionar muy suavemente por 1-2 minutos.',
    descriptionFr: 'Point pour soulager voix rauque, réduire toux sèche, améliorer respiration et détendre tension gorge. Situé à la base de la gorge, dans dépression au-dessus du sternum. Presser très doucement pendant 1-2 minutes.',
    position: { x: 50, y: 40 },
    image: '/Voz rouca, tosse Ren 22 Tiantu.jpg',
    imageAlt: 'Localização do ponto Tiantu Ren22 na base da garganta',
    benefits: ['Alivia voz rouca', 'Reduz tosse seca', 'Melhora respiração', 'Relaxa tensão na garganta'],
    benefitsEn: ['Relieves hoarse voice', 'Reduces dry cough', 'Improves breathing', 'Relaxes throat tension'],
    benefitsEs: ['Alivia voz ronca', 'Reduce tos seca', 'Mejora respiración', 'Relaja tensión en garganta'],
    benefitsFr: ['Soulage voix rauque', 'Réduit toux sèche', 'Améliore respiration', 'Détend tension gorge'],
    isPremium: false,
    category: 'general',
    instructions: 'Pressionar muito suavemente na depressão da base da garganta por 1-2 minutos.',
    duration: 120,
    pressure: 'muito leve'
  },

  {
    id: 'nariz-alergia',
    name: 'Ponto Nasal Anti-Alérgico',
    nameEn: 'Anti-Allergic Nasal Point',
    nameEs: 'Punto Nasal Anti-Alérgico',
    nameFr: 'Point Nasal Anti-Allergique',
    description: 'Ponto para aliviar rinite alérgica, desobstruir vias nasais, reduzir sinusite e melhorar respiração nasal. Localizado na testa no meio dos pontos verticais (veja as setas indicando a localização exata na imagem). Massagear suavemente com movimentos circulares por 2-3 minutos.',
    descriptionEn: 'Point to relieve allergic rhinitis, unblock nasal passages, reduce sinusitis and improve nasal breathing. Located on forehead in the middle of vertical points, where there is an arrow. Massage gently with circular movements for 2-3 minutes.',
    descriptionEs: 'Punto para aliviar rinitis alérgica, desobstruir vías nasales, reducir sinusitis y mejorar respiración nasal. Ubicado en la frente en el medio de los puntos verticales, donde hay una flecha. Masajear suavemente con movimientos circulares por 2-3 minutos.',
    descriptionFr: 'Point pour soulager rhinite allergique, débloquer voies nasales, réduire sinusite et améliorer respiration nasale. Situé sur le front au milieu des points verticaux, où il y a une flèche. Masser doucement avec mouvements circulaires pendant 2-3 minutes.',
    position: { x: 50, y: 35 },
    image: '/Ponto Nariz Alergia, rinite, sinusite, obstrução.jpg',
    imageAlt: 'Localização do ponto nasal anti-alérgico na testa no meio dos pontos verticais',
    benefits: ['Alivia rinite alérgica', 'Desobstrui vias nasais', 'Reduz sinusite', 'Melhora respiração nasal'],
    benefitsEn: ['Relieves allergic rhinitis', 'Unblocks nasal passages', 'Reduces sinusitis', 'Improves nasal breathing'],
    benefitsEs: ['Alivia rinitis alérgica', 'Desobstruye vías nasales', 'Reduce sinusitis', 'Mejora respiración nasal'],
    benefitsFr: ['Soulage rhinite allergique', 'Débloque voies nasales', 'Réduit sinusite', 'Améliore respiration nasale'],
    isPremium: false,
    category: 'cranio',
    instructions: 'Massagear suavemente na testa no meio dos pontos verticais, onde tem uma seta, com movimentos circulares por 2-3 minutos.',
    duration: 180,
    pressure: 'leve'
  },

  {
    id: 'cerebro-cerebelo',
    name: 'Pontos Cérebro e Cerebelo',
    nameEn: 'Brain and Cerebellum Points',
    nameEs: 'Puntos Cerebro y Cerebelo',
    nameFr: 'Points Cerveau et Cervelet',
    description: 'Pontos para melhorar qualidade do sono, reduzir tonturas, aliviar depressão leve e equilibrar função cerebral. Localizados em pontos específicos da cabeça (veja as marcações em destaque na imagem para localizar cada ponto). Aplicar pressão muito suave por 3-5 minutos.',
    descriptionEn: 'Points to improve sleep quality, reduce dizziness, relieve mild depression and balance brain function. Located at specific points on head. Apply very gentle pressure for 3-5 minutes.',
    descriptionEs: 'Puntos para mejorar calidad del sueño, reducir mareos, aliviar depresión leve y equilibrar función cerebral. Ubicados en puntos específicos de la cabeza. Aplicar presión muy suave por 3-5 minutos.',
    descriptionFr: 'Points pour améliorer qualité sommeil, réduire vertiges, soulager dépression légère et équilibrer fonction cérébrale. Situés en points spécifiques de la tête. Appliquer pression très douce pendant 3-5 minutes.',
    position: { x: 50, y: 20 },
    image: '/Pontos Cerebro e cerebelo Sono, Tonturas, Depressão.jpg',
    imageAlt: 'Localização dos pontos do cérebro e cerebelo',
    benefits: ['Melhora qualidade do sono', 'Reduz tonturas', 'Alivia depressão leve', 'Equilibra função cerebral'],
    benefitsEn: ['Improves sleep quality', 'Reduces dizziness', 'Relieves mild depression', 'Balances brain function'],
    benefitsEs: ['Mejora calidad del sueño', 'Reduce mareos', 'Alivia depresión leve', 'Equilibra función cerebral'],
    benefitsFr: ['Améliore qualité sommeil', 'Réduit vertiges', 'Soulage dépression légère', 'Équilibre fonction cérébrale'],
    isPremium: false,
    category: 'cranio',
    instructions: 'Aplicar pressão muito suave em pontos específicos da cabeça por 3-5 minutos.',
    duration: 300,
    pressure: 'muito leve'
  },

  // ===== PONTOS PREMIUM - SEPTICEMIA =====
  {
    id: 'septicemia-quchi-li11',
    name: 'Quchi (LI11) - Anti-Séptico',
    nameEn: 'Quchi (LI11) - Anti-Septic',
    nameEs: 'Quchi (LI11) - Anti-Séptico',
    nameFr: 'Quchi (LI11) - Anti-Septique',
    description: 'Ponto para purificar o sangue, combater infecções bacterianas, fortalecer sistema imunológico e reduzir febre. Localizado na dobra externa do cotovelo (veja a marcação em destaque na imagem). Pressionar firmemente por 2-3 minutos, 4x ao dia durante infecções.',
    descriptionEn: 'Point to purify blood, fight bacterial infections, strengthen immune system and reduce fever. Located at outer elbow crease. Press firmly for 2-3 minutes, 4x daily during infections.',
    descriptionEs: 'Punto para purificar sangre, combatir infecciones bacterianas, fortalecer sistema inmunológico y reducir fiebre. Ubicado en pliegue externo del codo. Presionar firmemente por 2-3 minutos, 4x al día durante infecciones.',
    descriptionFr: 'Point pour purifier le sang, combattre infections bactériennes, renforcer système immunitaire et réduire fièvre. Situé au pli externe du coude. Presser fermement pendant 2-3 minutes, 4x par jour pendant infections.',
    position: { x: 25, y: 45 },
    image: '/IG11 febre sede herpes prurido.jpg',
    imageAlt: 'Localização do ponto Quchi LI11 para septicemia no cotovelo',
    benefits: ['Purifica o sangue', 'Combate infecções bacterianas', 'Fortalece sistema imunológico', 'Reduz febre e inflamação'],
    benefitsEn: ['Purifies blood', 'Fights bacterial infections', 'Strengthens immune system', 'Reduces fever and inflammation'],
    benefitsEs: ['Purifica sangre', 'Combate infecciones bacterianas', 'Fortalece sistema inmunológico', 'Reduce fiebre e inflamación'],
    benefitsFr: ['Purifie le sang', 'Combat infections bactériennes', 'Renforce système immunitaire', 'Réduit fièvre et inflammation'],
    isPremium: true,
    category: 'septicemia',
    instructions: 'Pressionar firmemente na dobra externa do cotovelo por 2-3 minutos, 4x ao dia durante infecções.',
    duration: 180,
    pressure: 'moderada'
  },

  {
    id: 'septicemia-hegu-li4',
    name: 'Hegu (LI4) - Vale da União',
    nameEn: 'Hegu (LI4) - Joining Valley',
    nameEs: 'Hegu (LI4) - Valle de la Unión',
    nameFr: 'Hegu (LI4) - Vallée de l\'Union',
    description: 'Ponto para fortalecer imunidade, combater infecções, reduzir inflamação sistêmica e acelerar recuperação. Localizado entre o polegar e indicador, na parte carnosa da mão (veja a marcação em destaque na imagem). Pressionar firmemente por 2-3 minutos.',
    descriptionEn: 'Point to strengthen immunity, fight infections, reduce systemic inflammation and accelerate recovery. Located between thumb and index finger, in fleshy part of hand. Press firmly for 2-3 minutes.',
    descriptionEs: 'Punto para fortalecer inmunidad, combatir infecciones, reducir inflamación sistémica y acelerar recuperación. Ubicado entre pulgar e índice, en parte carnosa de la mano. Presionar firmemente por 2-3 minutos.',
    descriptionFr: 'Point pour renforcer immunité, combattre infections, réduire inflammation systémique et accélérer récupération. Situé entre pouce et index, dans partie charnue de la main. Presser fermement pendant 2-3 minutes.',
    position: { x: 30, y: 65 },
    image: '/image.png',
    imageAlt: 'Localização do ponto Hegu LI4 entre polegar e indicador',
    benefits: ['Fortalece imunidade', 'Combate infecções', 'Reduz inflamação sistêmica', 'Acelera recuperação'],
    benefitsEn: ['Strengthens immunity', 'Fights infections', 'Reduces systemic inflammation', 'Accelerates recovery'],
    benefitsEs: ['Fortalece inmunidad', 'Combate infecciones', 'Reduce inflamación sistémica', 'Acelera recuperación'],
    benefitsFr: ['Renforce immunité', 'Combat infections', 'Réduit inflammation systémique', 'Accélère récupération'],
    isPremium: true,
    category: 'septicemia',
    instructions: 'Pressionar firmemente entre o polegar e indicador por 2-3 minutos.',
    duration: 180,
    pressure: 'moderada'
  },

  {
    id: 'septicemia-zusanli-st36',
    name: 'Zusanli (ST36) - Fortaleza Imune',
    nameEn: 'Zusanli (ST36) - Immune Fortress',
    nameEs: 'Zusanli (ST36) - Fortaleza Inmune',
    nameFr: 'Zusanli (ST36) - Forteresse Immunitaire',
    nameRu: 'Цзусаньли (ST36) - Иммунная Крепость',
    nameJa: '足三里 (ST36) - 免疫要塞',
    nameDe: 'Zusanli (ST36) - Immun-Festung',
    description: 'Ponto para fortalecer energia vital, aumentar resistência a infecções, melhorar digestão e acelerar recuperação. Localizado 4 dedos abaixo da patela, na lateral externa da tíbia (veja a marcação em destaque na imagem). Pressionar por 3-5 minutos.',
    descriptionEn: 'Point to strengthen vital energy, increase infection resistance, improve digestion and accelerate recovery. Located 4 fingers below kneecap, on outer side of tibia. Press for 3-5 minutes.',
    descriptionEs: 'Punto para fortalecer energía vital, aumentar resistencia a infecciones, mejorar digestión y acelerar recuperación. Ubicado 4 dedos debajo de la rótula, en lado externo de la tibia. Presionar por 3-5 minutos.',
    descriptionFr: 'Point pour renforcer énergie vitale, augmenter résistance infections, améliorer digestion et accélérer récupération. Situé 4 doigts sous rotule, côté externe du tibia. Presser pendant 3-5 minutes.',
    descriptionRu: 'Точка для укрепления жизненной энергии, повышения сопротивляемости инфекциям, улучшения пищеварения и ускорения восстановления. Находится на 4 пальца ниже коленной чашечки, на внешней стороне большеберцовой кости. Нажимать 3-5 минут.',
    descriptionJa: '生命エネルギーを強化し、感染への抵抗力を高め、消化を改善し、回復を加速するポイント。膝蓋骨の下4指、脛骨の外側に位置。3〜5分間押す。',
    descriptionDe: 'Punkt zur Stärkung der Lebensenergie, Erhöhung der Infektionsresistenz, Verbesserung der Verdauung und Beschleunigung der Genesung. 4 Finger unterhalb der Kniescheibe an der Außenseite des Schienbeins. 3-5 Minuten drücken.',
    position: { x: 45, y: 80 },
    image: '/st 36 Estômago imunidade a.jpg',
    imageAlt: 'Localização do ponto Zusanli ST36 abaixo do joelho',
    benefits: ['Fortalece energia vital', 'Aumenta resistência a infecções', 'Melhora digestão e absorção', 'Acelera recuperação'],
    benefitsEn: ['Strengthens vital energy', 'Increases infection resistance', 'Improves digestion and absorption', 'Accelerates recovery'],
    benefitsEs: ['Fortalece energía vital', 'Aumenta resistencia a infecciones', 'Mejora digestión y absorción', 'Acelera recuperación'],
    benefitsFr: ['Renforce énergie vitale', 'Augmente résistance infections', 'Améliore digestion et absorption', 'Accélère récupération'],
    benefitsRu: ['Укрепляет жизненную энергию', 'Повышает сопротивляемость инфекциям', 'Улучшает пищеварение и усвоение', 'Ускоряет восстановление'],
    benefitsJa: ['生命エネルギーを強化', '感染への抵抗力を高める', '消化と吸収を改善', '回復を加速'],
    benefitsDe: ['Stärkt Lebensenergie', 'Erhöht Infektionsresistenz', 'Verbessert Verdauung und Absorption', 'Beschleunigt Genesung'],
    isPremium: true,
    category: 'septicemia',
    instructions: 'Pressionar 4 dedos abaixo da patela, na lateral externa da tíbia, por 3-5 minutos.',
    duration: 300,
    pressure: 'moderada'
  },

  // ===== PONTOS PREMIUM - ATM (Articulação Temporomandibular) =====
  {
    id: 'atm-ermen-sj21',
    name: 'Ermen (SJ21) - Portal da Orelha',
    nameEn: 'Ermen (SJ21) - Ear Gate',
    nameEs: 'Ermen (SJ21) - Puerta del Oído',
    nameFr: 'Ermen (SJ21) - Porte de l\'Oreille',
    nameRu: 'Эрмэнь (SJ21) - Врата Уха',
    nameJa: '耳門 (SJ21) - 耳の門',
    nameDe: 'Ermen (SJ21) - Ohrtor',
    description: 'Ponto para aliviar dor na ATM, reduzir espasmos musculares, melhorar abertura bucal e diminuir zumbido no ouvido. Localizado na depressão em frente à orelha (veja a marcação em destaque na imagem). Pressionar suavemente enquanto abre e fecha a boca.',
    descriptionEn: 'Point to relieve TMJ pain, reduce muscle spasms, improve mouth opening and reduce ear ringing. Located in depression in front of ear. Press gently while opening and closing mouth.',
    descriptionEs: 'Punto para aliviar dolor ATM, reducir espasmos musculares, mejorar apertura bucal y disminuir zumbido en oído. Ubicado en depresión frente al oído. Presionar suavemente mientras abre y cierra la boca.',
    descriptionFr: 'Point pour soulager douleur ATM, réduire spasmes musculaires, améliorer ouverture buccale et diminuer acouphènes. Situé dans dépression devant oreille. Presser doucement en ouvrant et fermant bouche.',
    descriptionRu: 'Точка для облегчения боли в ВНЧС, уменьшения мышечных спазмов, улучшения открывания рта и уменьшения шума в ушах. Расположена во впадине перед ухом. Мягко надавливать при открывании и закрывании рта.',
    descriptionJa: '顎関節痛を和らげ、筋肉の痙攣を減らし、口の開きを改善し、耳鳴りを軽減するポイント。耳の前の窪みに位置。口を開閉しながら優しく押す。',
    descriptionDe: 'Punkt zur Linderung von Kiefergelenkschmerzen, Reduzierung von Muskelkrämpfen, Verbesserung der Mundöffnung und Verringerung von Ohrgeräuschen. In der Vertiefung vor dem Ohr. Sanft drücken beim Öffnen und Schließen des Mundes.',
    position: { x: 75, y: 30 },
    image: '/TA 21 Ermen Portal da Orelha ATM.jpg',
    imageAlt: 'Localização do ponto Ermen SJ21 na frente da orelha para ATM',
    benefits: ['Alivia dor na ATM', 'Reduz espasmos musculares', 'Melhora abertura bucal', 'Diminui zumbido no ouvido'],
    benefitsEn: ['Relieves TMJ pain', 'Reduces muscle spasms', 'Improves mouth opening', 'Reduces ear ringing'],
    benefitsEs: ['Alivia dolor ATM', 'Reduce espasmos musculares', 'Mejora apertura bucal', 'Disminuye zumbido en oído'],
    benefitsFr: ['Soulage douleur ATM', 'Réduit spasmes musculaires', 'Améliore ouverture buccale', 'Diminue acouphènes'],
    benefitsRu: ['Облегчает боль в ВНЧС', 'Уменьшает мышечные спазмы', 'Улучшает открывание рта', 'Уменьшает шум в ушах'],
    benefitsJa: ['顎関節痛を和らげる', '筋肉の痙攣を減らす', '口の開きを改善', '耳鳴りを軽減'],
    benefitsDe: ['Lindert Kiefergelenkschmerzen', 'Reduziert Muskelkrämpfe', 'Verbessert Mundöffnung', 'Verringert Ohrgeräusche'],
    isPremium: true,
    category: 'atm',
    instructions: 'Pressionar suavemente na depressão em frente à orelha enquanto abre e fecha a boca.',
    duration: 180,
    pressure: 'leve'
  },

  {
    id: 'atm-xiaguan-st7',
    name: 'Xiaguan (ST7) - Articulação Inferior',
    nameEn: 'Xiaguan (ST7) - Lower Joint',
    nameEs: 'Xiaguan (ST7) - Articulación Inferior',
    nameFr: 'Xiaguan (ST7) - Articulation Inférieure',
    nameRu: 'Сягуань (ST7) - Нижний Сустав',
    nameJa: '下関 (ST7) - 下部関節',
    nameDe: 'Xiaguan (ST7) - Unteres Gelenk',
    description: 'Ponto para aliviar travamento da mandíbula, reduzir dor articular, melhorar mobilidade e relaxar músculos mastigatórios. Localizado na depressão abaixo do arco zigomático (veja o ponto A em destaque na imagem). Pressionar enquanto movimenta a mandíbula.',
    descriptionEn: 'Point to relieve jaw locking, reduce joint pain, improve mobility and relax chewing muscles. Located in depression below zygomatic arch. Press while moving jaw.',
    descriptionEs: 'Punto para aliviar bloqueo mandibular, reducir dolor articular, mejorar movilidad y relajar músculos masticatorios. Ubicado en depresión debajo del arco cigomático. Presionar mientras mueve la mandíbula.',
    descriptionFr: 'Point pour soulager blocage mandibulaire, réduire douleur articulaire, améliorer mobilité et détendre muscles masticateurs. Situé dans dépression sous arc zygomatique. Presser en bougeant mâchoire.',
    descriptionRu: 'Точка для облегчения блокировки челюсти, уменьшения боли в суставе, улучшения подвижности и расслабления жевательных мышц. Расположена во впадине под скуловой дугой. Надавливать при движении челюстью.',
    descriptionJa: '顎のロックを緩和し、関節痛を軽減し、可動性を改善し、咀嚼筋をリラックスさせるポイント。頬骨弓の下の窪みに位置。顎を動かしながら押す。',
    descriptionDe: 'Punkt zur Linderung von Kieferblockaden, Reduzierung von Gelenkschmerzen, Verbesserung der Beweglichkeit und Entspannung der Kaumuskeln. In der Vertiefung unter dem Jochbogen. Beim Bewegen des Kiefers drücken.',
    position: { x: 70, y: 40 },
    image: '/Ponto A Dor de cabeça e ansiedade cranio.jpg',
    imageAlt: 'Localização do ponto Xiaguan ST7 na articulação da mandíbula',
    benefits: ['Alivia travamento da mandíbula', 'Reduz dor articular', 'Melhora mobilidade', 'Relaxa músculos mastigatórios'],
    benefitsEn: ['Relieves jaw locking', 'Reduces joint pain', 'Improves mobility', 'Relaxes chewing muscles'],
    benefitsEs: ['Alivia bloqueo mandibular', 'Reduce dolor articular', 'Mejora movilidad', 'Relaja músculos masticatorios'],
    benefitsFr: ['Soulage blocage mandibulaire', 'Réduit douleur articulaire', 'Améliore mobilité', 'Détend muscles masticateurs'],
    benefitsRu: ['Облегчает блокировку челюсти', 'Уменьшает боль в суставе', 'Улучшает подвижность', 'Расслабляет жевательные мышцы'],
    benefitsJa: ['顎のロックを緩和', '関節痛を軽減', '可動性を改善', '咀嚼筋をリラックス'],
    benefitsDe: ['Lindert Kieferblockaden', 'Reduziert Gelenkschmerzen', 'Verbessert Beweglichkeit', 'Entspannt Kaumuskeln'],
    isPremium: true,
    category: 'atm',
    instructions: 'Pressionar na depressão abaixo do arco zigomático enquanto movimenta a mandíbula.',
    duration: 240,
    pressure: 'leve'
  },

  {
    id: 'atm-yifeng-sj17',
    name: 'Yifeng (SJ17) - Proteção do Vento',
    nameEn: 'Yifeng (SJ17) - Wind Screen',
    nameEs: 'Yifeng (SJ17) - Protección del Viento',
    nameFr: 'Yifeng (SJ17) - Protection du Vent',
    nameRu: 'Ифэн (SJ17) - Защита от Ветра',
    nameJa: '翳風 (SJ17) - 風の防御',
    nameDe: 'Yifeng (SJ17) - Windschutz',
    description: 'Ponto para regular ATM, reduzir zumbido no ouvido, aliviar tensão mandibular e melhorar audição. Localizado atrás da orelha, na depressão entre a orelha e o osso mastoide (veja as marcações dos 3 pontos ATM no crânio na imagem). Massagear suavemente com movimentos circulares por 3-4 minutos.',
    descriptionEn: 'Point to regulate TMJ, reduce ear ringing, relieve jaw tension and improve hearing. Located behind ear, in depression between ear and mastoid bone. Massage gently with circular movements for 3-4 minutes.',
    descriptionEs: 'Punto para regular ATM, reducir zumbido en oído, aliviar tensión mandibular y mejorar audición. Ubicado detrás del oído, en depresión entre oreja y hueso mastoideo. Masajear suavemente con movimientos circulares por 3-4 minutos.',
    descriptionFr: 'Point pour réguler ATM, réduire acouphènes, soulager tension mandibulaire et améliorer audition. Situé derrière oreille, dans dépression entre oreille et os mastoïde. Masser doucement avec mouvements circulaires pendant 3-4 minutes.',
    descriptionRu: 'Точка для регуляции ВНЧС, уменьшения шума в ушах, облегчения челюстного напряжения и улучшения слуха. Расположена за ухом, во впадине между ухом и сосцевидным отростком. Мягко массировать круговыми движениями 3-4 минуты.',
    descriptionJa: '顎関節を調整し、耳鳴りを軽減し、顎の緊張を和らげ、聴力を改善するポイント。耳の後ろ、耳と乳様突起の間の窪みに位置。円を描くように優しくマッサージ3〜4分間。',
    descriptionDe: 'Punkt zur Regulierung des Kiefergelenks, Reduzierung von Ohrgeräuschen, Linderung von Kieferspannungen und Verbesserung des Gehörs. Hinter dem Ohr, in der Vertiefung zwischen Ohr und Warzenfortsatz. Sanft mit kreisenden Bewegungen 3-4 Minuten massieren.',
    position: { x: 85, y: 35 },
    image: '/ATM Premiun/Marcação 3 pontos ATM cranio.jpg',
    imageAlt: 'Localização do ponto Yifeng SJ17 atrás da orelha',
    benefits: ['Regula ATM', 'Reduz zumbido no ouvido', 'Alivia tensão mandibular', 'Melhora audição'],
    benefitsEn: ['Regulates TMJ', 'Reduces ear ringing', 'Relieves jaw tension', 'Improves hearing'],
    benefitsEs: ['Regula ATM', 'Reduce zumbido en oído', 'Alivia tensión mandibular', 'Mejora audición'],
    benefitsFr: ['Régule ATM', 'Réduit acouphènes', 'Soulage tension mandibulaire', 'Améliore audition'],
    benefitsRu: ['Регулирует ВНЧС', 'Уменьшает шум в ушах', 'Облегчает челюстное напряжение', 'Улучшает слух'],
    benefitsJa: ['顎関節を調整', '耳鳴りを軽減', '顎の緊張を和らげる', '聴力を改善'],
    benefitsDe: ['Reguliert Kiefergelenk', 'Reduziert Ohrgeräusche', 'Lindert Kieferspannung', 'Verbessert Gehör'],
    isPremium: true,
    category: 'atm',
    instructions: 'Massagear suavemente atrás da orelha com movimentos circulares por 3-4 minutos.',
    duration: 240,
    pressure: 'leve'
  },

  // ===== PONTOS PREMIUM - CRANIOPUNTURA AVANÇADA =====
  {
    id: 'cranio-memoria-ms5',
    name: 'Zona da Memória (MS5)',
    nameEn: 'Memory Zone (MS5)',
    nameEs: 'Zona de Memoria (MS5)',
    nameFr: 'Zone Mémoire (MS5)',
    description: 'Zona para melhorar memória de trabalho, aumentar capacidade de aprendizado, fortalecer conexões neurais e otimizar função cognitiva. Localizada na região parietal da cabeça (veja as marcações dos pontos Cérebro e Cerebelo na imagem). Aplicar pressão muito suave com movimentos circulares por 5 minutos.',
    descriptionEn: 'Zone to improve working memory, increase learning capacity, strengthen neural connections and optimize cognitive function. Located in parietal region of head. Apply very gentle pressure with circular movements for 5 minutes.',
    descriptionEs: 'Zona para mejorar memoria de trabajo, aumentar capacidad de aprendizaje, fortalecer conexiones neurales y optimizar función cognitiva. Ubicada en región parietal de la cabeza. Aplicar presión muy suave con movimientos circulares por 5 minutos.',
    descriptionFr: 'Zone pour améliorer mémoire de travail, augmenter capacité apprentissage, renforcer connexions neurales et optimiser fonction cognitive. Située en région pariétale de la tête. Appliquer pression très douce avec mouvements circulaires pendant 5 minutes.',
    position: { x: 60, y: 20 },
    image: '/Pontos Cerebro e cerebelo Sono, Tonturas, Depressão.jpg',
    imageAlt: 'Localização da zona da memória MS5 na região parietal',
    benefits: ['Melhora memória de trabalho', 'Aumenta capacidade de aprendizado', 'Fortalece conexões neurais', 'Otimiza função cognitiva'],
    benefitsEn: ['Improves working memory', 'Increases learning capacity', 'Strengthens neural connections', 'Optimizes cognitive function'],
    benefitsEs: ['Mejora memoria de trabajo', 'Aumenta capacidad de aprendizaje', 'Fortalece conexiones neurales', 'Optimiza función cognitiva'],
    benefitsFr: ['Améliore mémoire de travail', 'Augmente capacité apprentissage', 'Renforce connexions neurales', 'Optimise fonction cognitive'],
    isPremium: true,
    category: 'cranio',
    instructions: 'Aplicar pressão muito suave com movimentos circulares na região parietal por 5 minutos.',
    duration: 300,
    pressure: 'muito leve'
  },

  {
    id: 'cranio-concentracao-ms6',
    name: 'Zona da Concentração (MS6)',
    nameEn: 'Concentration Zone (MS6)',
    nameEs: 'Zona de Concentración (MS6)',
    nameFr: 'Zone Concentration (MS6)',
    description: 'Zona para aumentar capacidade de foco, melhorar atenção sustentada, reduzir dispersão mental e otimizar função executiva. Localizada na região frontal da cabeça (veja o ponto básico A em destaque na imagem). Pressionar suavemente com movimentos específicos por 4-5 minutos.',
    descriptionEn: 'Zone to increase focus capacity, improve sustained attention, reduce mental dispersion and optimize executive function. Located in frontal region of head. Press gently with specific movements for 4-5 minutes.',
    descriptionEs: 'Zona para aumentar capacidad de enfoque, mejorar atención sostenida, reducir dispersión mental y optimizar función ejecutiva. Ubicada en región frontal de la cabeza. Presionar suavemente con movimientos específicos por 4-5 minutos.',
    descriptionFr: 'Zone pour augmenter capacité focus, améliorer attention soutenue, réduire dispersion mentale et optimiser fonction exécutive. Située en région frontale de la tête. Presser doucement avec mouvements spécifiques pendant 4-5 minutes.',
    position: { x: 50, y: 25 },
    image: '/Ponto básico A dor de cabeça e enxaqueca.jpg',
    imageAlt: 'Localização da zona da concentração MS6 na região frontal',
    benefits: ['Aumenta capacidade de foco', 'Melhora atenção sustentada', 'Reduz dispersão mental', 'Otimiza função executiva'],
    benefitsEn: ['Increases focus capacity', 'Improves sustained attention', 'Reduces mental dispersion', 'Optimizes executive function'],
    benefitsEs: ['Aumenta capacidad de enfoque', 'Mejora atención sostenida', 'Reduce dispersión mental', 'Optimiza función ejecutiva'],
    benefitsFr: ['Augmente capacité focus', 'Améliore attention soutenue', 'Réduit dispersion mentale', 'Optimise fonction exécutive'],
    isPremium: true,
    category: 'cranio',
    instructions: 'Pressionar suavemente a região frontal com movimentos específicos por 4-5 minutos.',
    duration: 300,
    pressure: 'muito leve'
  },

  {
    id: 'cranio-ansiedade-ms8',
    name: 'Zona Anti-Ansiedade (MS8)',
    nameEn: 'Anti-Anxiety Zone (MS8)',
    nameEs: 'Zona Anti-Ansiedad (MS8)',
    nameFr: 'Zone Anti-Anxiété (MS8)',
    description: 'Zona para reduzir ansiedade crônica, regular resposta emocional, acalmar sistema nervoso e melhorar estabilidade emocional. Localizada na região temporal da cabeça (veja a marcação do ponto Taiyang em destaque na imagem). Aplicar pressão muito leve com técnica específica por 6-8 minutos.',
    descriptionEn: 'Zone to reduce chronic anxiety, regulate emotional response, calm nervous system and improve emotional stability. Located in temporal region of head. Apply very light pressure with specific technique for 6-8 minutes.',
    descriptionEs: 'Zona para reducir ansiedad crónica, regular respuesta emocional, calmar sistema nervioso y mejorar estabilidad emocional. Ubicada en región temporal de la cabeza. Aplicar presión muy ligera con técnica específica por 6-8 minutos.',
    descriptionFr: 'Zone pour réduire anxiété chronique, réguler réponse émotionnelle, calmer système nerveux et améliorer stabilité émotionnelle. Située en région temporale de la tête. Appliquer pression très légère avec technique spécifique pendant 6-8 minutes.',
    position: { x: 75, y: 35 },
    image: '/Taiyang.jpg',
    imageAlt: 'Localização da zona anti-ansiedade MS8 na região temporal',
    benefits: ['Reduz ansiedade crônica', 'Regula resposta emocional', 'Acalma sistema nervoso', 'Melhora estabilidade emocional'],
    benefitsEn: ['Reduces chronic anxiety', 'Regulates emotional response', 'Calms nervous system', 'Improves emotional stability'],
    benefitsEs: ['Reduce ansiedad crónica', 'Regula respuesta emocional', 'Calma sistema nervioso', 'Mejora estabilidad emocional'],
    benefitsFr: ['Réduit anxiété chronique', 'Régule réponse émotionnelle', 'Calme système nerveux', 'Améliore stabilité émotionnelle'],
    isPremium: true,
    category: 'cranio',
    instructions: 'Aplicar pressão muito leve na região temporal com técnica específica por 6-8 minutos.',
    duration: 480,
    pressure: 'muito leve'
  },

  // ===== PONTOS PREMIUM - NEUROLOGIA AVANÇADA =====
  {
    id: 'neuro-enxaqueca-ex-hn5',
    name: 'Taiyang (EX-HN5) - Templo Solar',
    nameEn: 'Taiyang (EX-HN5) - Solar Temple',
    nameEs: 'Taiyang (EX-HN5) - Templo Solar',
    nameFr: 'Taiyang (EX-HN5) - Temple Solaire',
    nameRu: 'Тайян (EX-HN5) - Солнечный Храм',
    nameJa: '太陽 (EX-HN5) - 太陽神殿',
    nameDe: 'Taiyang (EX-HN5) - Sonnentempel',
    description: 'Ponto para aliviar enxaquecas severas, reduzir dor neurológica, melhorar circulação cerebral e prevenir crises recorrentes. Localizado na depressão da têmpora, entre a sobrancelha e a orelha (veja a marcação em destaque na imagem). Pressionar suavemente durante crises por 3-5 minutos.',
    descriptionEn: 'Point to relieve severe migraines, reduce neurological pain, improve brain circulation and prevent recurring attacks. Located in temple depression, between eyebrow and ear. Press gently during attacks for 3-5 minutes.',
    descriptionEs: 'Punto para aliviar migrañas severas, reducir dolor neurológico, mejorar circulación cerebral y prevenir crisis recurrentes. Ubicado en depresión de la sien, entre ceja y oreja. Presionar suavemente durante crisis por 3-5 minutos.',
    descriptionFr: 'Point pour soulager migraines sévères, réduire douleur neurologique, améliorer circulation cérébrale et prévenir crises récurrentes. Situé dans dépression de la tempe, entre sourcil et oreille. Presser doucement pendant crises pendant 3-5 minutes.',
    descriptionRu: 'Точка для облегчения сильных мигреней, уменьшения неврологической боли, улучшения мозгового кровообращения и предотвращения повторяющихся приступов. Расположена во впадине виска, между бровью и ухом. Мягко нажимать во время приступов 3-5 минут.',
    descriptionJa: '重度の偏頭痛を緩和し、神経学的痛みを軽減し、脳血流を改善し、再発を予防するポイント。こめかみと耳の間の窪みに位置。発作中に優しく3〜5分間押す。',
    descriptionDe: 'Punkt zur Linderung schwerer Migräne, Reduzierung neurologischer Schmerzen, Verbesserung der Gehirndurchblutung und Vorbeugung wiederkehrender Anfälle. In der Schläfendelle zwischen Augenbraue und Ohr. Während der Anfälle sanft 3-5 Minuten drücken.',
    position: { x: 80, y: 28 },
    image: '/Taiyang.jpg',
    imageAlt: 'Localização do ponto Taiyang EX-HN5 na têmpora para enxaqueca',
    benefits: ['Alivia enxaquecas severas', 'Reduz dor neurológica', 'Melhora circulação cerebral', 'Previne crises recorrentes'],
    benefitsEn: ['Relieves severe migraines', 'Reduces neurological pain', 'Improves brain circulation', 'Prevents recurring attacks'],
    benefitsEs: ['Alivia migrañas severas', 'Reduce dolor neurológico', 'Mejora circulación cerebral', 'Previene crisis recurrentes'],
    benefitsFr: ['Soulage migraines sévères', 'Réduit douleur neurologique', 'Améliore circulation cérébrale', 'Prévient crises récurrentes'],
    benefitsRu: ['Облегчает сильные мигрени', 'Уменьшает неврологическую боль', 'Улучшает мозговое кровообращение', 'Предотвращает повторяющиеся приступы'],
    benefitsJa: ['重度の偏頭痛を緩和', '神経学的痛みを軽減', '脳血流を改善', '再発を予防'],
    benefitsDe: ['Lindert schwere Migräne', 'Reduziert neurologische Schmerzen', 'Verbessert Gehirndurchblutung', 'Beugt wiederkehrenden Anfällen vor'],
    isPremium: true,
    category: 'general',
    instructions: 'Pressionar suavemente a depressão na têmpora por 3-5 minutos durante crises.',
    duration: 300,
    pressure: 'leve'
  },

  {
    id: 'neuro-insonia-anmian',
    name: 'Anmian - Sono Pacífico',
    nameEn: 'Anmian - Peaceful Sleep',
    nameEs: 'Anmian - Sueño Pacífico',
    nameFr: 'Anmian - Sommeil Paisible',
    nameRu: 'Аньмянь - Мирный Сон',
    nameJa: '安眠 - 平和な睡眠',
    nameDe: 'Anmian - Friedlicher Schlaf',
    description: 'Ponto para induzir sono profundo, regular ciclo circadiano, reduzir ansiedade noturna e melhorar qualidade do sono. Localizado atrás da orelha, na depressão entre a orelha e a nuca (veja a marcação em destaque na imagem). Massagear suavemente por 5-10 minutos antes de dormir.',
    descriptionEn: 'Point to induce deep sleep, regulate circadian cycle, reduce nighttime anxiety and improve sleep quality. Located behind ear, in depression between ear and nape. Massage gently for 5-10 minutes before sleep.',
    descriptionEs: 'Punto para inducir sueño profundo, regular ciclo circadiano, reducir ansiedad nocturna y mejorar calidad del sueño. Ubicado detrás del oído, en depresión entre oreja y nuca. Masajear suavemente por 5-10 minutos antes de dormir.',
    descriptionFr: 'Point pour induire sommeil profond, réguler cycle circadien, réduire anxiété nocturne et améliorer qualité sommeil. Situé derrière oreille, dans dépression entre oreille et nuque. Masser doucement pendant 5-10 minutes avant coucher.',
    descriptionRu: 'Точка для вызывания глубокого сна, регулирования циркадного ритма, снижения ночной тревоги и улучшения качества сна. Расположена за ухом, во впадине между ухом и затылком. Мягко массировать 5-10 минут перед сном.',
    descriptionJa: '深い睡眠を誘発し、概日リズムを調整し、夜間不安を軽減し、睡眠の質を改善するポイント。耳の後ろ、耳とうなじの間の窪みに位置。就寝前に5〜10分間優しくマッサージ。',
    descriptionDe: 'Punkt zur Induktion von Tiefschlaf, Regulierung des zirkadianen Rhythmus, Reduzierung nächtlicher Angst und Verbesserung der Schlafqualität. Hinter dem Ohr, in der Vertiefung zwischen Ohr und Nacken. Vor dem Schlafengehen 5-10 Minuten sanft massieren.',
    position: { x: 85, y: 35 },
    image: '/ANmian sono tranquilo pesadelos.jpg',
    imageAlt: 'Localização do ponto Anmian atrás da orelha para insônia',
    benefits: ['Induz sono profundo', 'Regula ciclo circadiano', 'Reduz ansiedade noturna', 'Melhora qualidade do sono'],
    benefitsEn: ['Induces deep sleep', 'Regulates circadian cycle', 'Reduces nighttime anxiety', 'Improves sleep quality'],
    benefitsEs: ['Induce sueño profundo', 'Regula ciclo circadiano', 'Reduce ansiedad nocturna', 'Mejora calidad del sueño'],
    benefitsFr: ['Induit sommeil profond', 'Régule cycle circadien', 'Réduit anxiété nocturne', 'Améliore qualité sommeil'],
    benefitsRu: ['Вызывает глубокий сон', 'Регулирует циркадный ритм', 'Снижает ночную тревогу', 'Улучшает качество сна'],
    benefitsJa: ['深い睡眠を誘発', '概日リズムを調整', '夜間不安を軽減', '睡眠の質を改善'],
    benefitsDe: ['Induziert Tiefschlaf', 'Reguliert zirkadianen Rhythmus', 'Reduziert nächtliche Angst', 'Verbessert Schlafqualität'],
    isPremium: true,
    category: 'general',
    instructions: 'Massagear suavemente atrás da orelha por 5-10 minutos antes de dormir.',
    duration: 600,
    pressure: 'muito leve'
  }
];

// ===== FUNÇÕES OTIMIZADAS PARA CONSULTA =====

/**
 * Busca pontos por categoria com desempenho otimizado
 */
export const getPointsByCategory = (category: string, isPremium: boolean = false) => {
  if (category === 'all') {
    return isPremium ? acupressurePoints : acupressurePoints.filter(p => !p.isPremium);
  }
  
  if (category === 'mtc-premium') {
    const generalPremium = acupressurePoints.filter(p => p.category === 'general' && p.isPremium);
    return isPremium ? generalPremium : [];
  }
  
  const categoryPoints = acupressurePoints.filter(p => p.category === category);
  return isPremium ? categoryPoints : categoryPoints.filter(p => !p.isPremium);
};

/**
 * Retorna pontos premium
 */
export const getPremiumPoints = () => {
  return acupressurePoints.filter(p => p.isPremium);
};

/**
 * Retorna pontos gratuitos
 */
export const getFreePoints = () => {
  return acupressurePoints.filter(p => !p.isPremium);
};

/**
 * Busca ponto por ID
 */
export const getPointById = (id: string): AcupressurePoint | undefined => {
  return acupressurePoints.find(p => p.id === id);
};

/**
 * Retorna estatísticas dos pontos
 */
export const getPointsStats = () => {
  const premiumPoints = getPremiumPoints();
  const freePoints = getFreePoints();
  const categories = [...new Set(acupressurePoints.map(p => p.category))];
  
  return {
    totalPoints: acupressurePoints.length,
    premiumCount: premiumPoints.length,
    freeCount: freePoints.length,
    categoriesCount: categories.length,
    categories
  };
};