/**
 * deficiencyDatabase.ts — Xzenpress
 * Banco de dados: Deficiência → Doenças, Sintomas, Alimentos, Suplemento e Planta MTC
 * Fontes: WHO, NIH, ANVISA, ENANI (Brasil)
 */

export interface DeficiencyEntry {
  nutrient: string;
  category: 'vitamina' | 'mineral' | 'acido-graxo' | 'aminoacido' | 'outro';
  diseases: string[];          // doenças associadas à deficiência
  symptoms: string[];          // sintomas precoces / subclínicos
  foods: string[];             // alimentos ricos neste nutriente
  supplement: string;          // nome no Nutriming
  herbs?: string[];            // plantas da PhytoLibrary que auxiliam
  brazilPrevalence?: string;   // prevalência estimada no Brasil
  source: string;              // referência científica
}

export const DEFICIENCY_DATABASE: DeficiencyEntry[] = [
  // ─── VITAMINAS LIPOSSOLÚVEIS ──────────────────────────────────────
  {
    nutrient: 'Vitamina D',
    category: 'vitamina',
    diseases: ['Raquitismo', 'Osteoporose', 'Osteomalacia', 'Depressão', 'Diabetes tipo 2', 'Esclerose múltipla', 'Doenças autoimunes', 'Hipertensão', 'Câncer colorretal'],
    symptoms: ['Fadiga crônica', 'Dores ósseas', 'Fraqueza muscular', 'Humor deprimido', 'Infecções frequentes', 'Queda de cabelo'],
    foods: ['Salmão selvagem', 'Sardinha em conserva', 'Atum', 'Gema de ovo caipira', 'Fígado bovino', 'Cogumelo shitake exposto ao sol'],
    supplement: 'Vitamina D3',
    herbs: ['Reishi'],
    brazilPrevalence: '~77% da população com insuficiência (IBGE/2022)',
    source: 'NIH Office of Dietary Supplements; Holick MF, NEJM 2007',
  },
  {
    nutrient: 'Vitamina A',
    category: 'vitamina',
    diseases: ['Cegueira noturna', 'Xeroftalmia', 'Imunossupressão', 'Infecções respiratórias recorrentes', 'Atraso no crescimento infantil'],
    symptoms: ['Visão fraca no escuro', 'Pele ressecada', 'Olhos secos', 'Infecções frequentes', 'Feridas de cicatrização lenta'],
    foods: ['Fígado bovino', 'Batata-doce', 'Cenoura', 'Abóbora', 'Espinafre', 'Manga', 'Mamão papaia'],
    supplement: 'Vitamina A',
    brazilPrevalence: 'Crítica em crianças menores de 5 anos em Norte/Nordeste (MS/Brasil)',
    source: 'WHO Global Prevalence of Vitamin A Deficiency; PNAN/Brasil',
  },
  {
    nutrient: 'Vitamina E',
    category: 'vitamina',
    diseases: ['Neuropatia periférica', 'Miopatia', 'Retinopatia', 'Hemólise', 'Doenças cardiovasculares'],
    symptoms: ['Fraqueza muscular', 'Problemas de coordenação', 'Visão turva', 'Sistema imune comprometido'],
    foods: ['Azeite de oliva extra virgem', 'Amêndoas', 'Sementes de girassol', 'Abacate', 'Espinafre', 'Brócolis'],
    supplement: 'Vitamina E',
    source: 'NIH — Vitamin E Fact Sheet for Health Professionals',
  },
  {
    nutrient: 'Vitamina K',
    category: 'vitamina',
    diseases: ['Sangramento excessivo', 'Osteoporose', 'Calcificação arterial', 'Doença cardiovascular'],
    symptoms: ['Hematomas fáceis', 'Sangramento prolongado', 'Menstruação excessiva', 'Sangramento nasal'],
    foods: ['Couve', 'Espinafre', 'Brócolis', 'Natto (soja fermentada)', 'Queijo gouda', 'Gema de ovo'],
    supplement: 'Vitamina K2',
    source: 'Geleijnse JM et al., Journal of Nutrition 2004',
  },
  // ─── VITAMINAS HIDROSSOLÚVEIS ─────────────────────────────────────
  {
    nutrient: 'Vitamina C',
    category: 'vitamina',
    diseases: ['Escorbuto', 'Imunossupressão', 'Má cicatrização', 'Anemia (prejudica absorção de ferro)', 'Doença periodontal'],
    symptoms: ['Gengivas sangrando', 'Cansaço', 'Pele ressecada', 'Infecções frequentes', 'Dores nas articulações'],
    foods: ['Acerola (a mais rica do mundo)', 'Camu-camu', 'Goiaba', 'Kiwi', 'Laranja', 'Pimentão vermelho', 'Brócolis'],
    supplement: 'Vitamina C',
    herbs: ['Camu-camu', 'Acerola'],
    brazilPrevalence: 'Subestimada, mas alta em populações com baixo consumo de frutas frescas',
    source: 'Carr AC & Maggini S, Nutrients 2017',
  },
  {
    nutrient: 'Vitamina B1 (Tiamina)',
    category: 'vitamina',
    diseases: ['Beribéri', 'Síndrome de Wernicke-Korsakoff', 'Neuropatia periférica', 'Insuficiência cardíaca'],
    symptoms: ['Formigamento nos pés e mãos', 'Confusão mental', 'Fadiga', 'Perda de apetite', 'Inchaço nas pernas'],
    foods: ['Germe de trigo', 'Feijão preto', 'Semente de girassol', 'Carne suína', 'Arroz integral', 'Aspargos'],
    supplement: 'Complexo B',
    brazilPrevalence: 'Associada ao alcoolismo crônico e desnutrição severa',
    source: 'WHO; Thiamine Deficiency and its prevention — WHO/NUT/99.13',
  },
  {
    nutrient: 'Vitamina B3 (Niacina)',
    category: 'vitamina',
    diseases: ['Pelagra (3 Ds: dermatite, diarreia, demência)', 'Dislipidemia', 'Comprometimento cognitivo'],
    symptoms: ['Erupções na pele ao sol', 'Diarreia', 'Confusão mental', 'Irritabilidade', 'Língua vermelha e inchada'],
    foods: ['Atum', 'Frango', 'Peru', 'Amendoim', 'Cogumelos', 'Arroz integral', 'Abacate'],
    supplement: 'Complexo B',
    source: 'Hegyi J et al., International Journal of Dermatology 2004',
  },
  {
    nutrient: 'Vitamina B6',
    category: 'vitamina',
    diseases: ['Depressão', 'Neuropatia periférica', 'Anemia', 'Síndrome do túnel do carpo', 'Inflamação sistêmica'],
    symptoms: ['Depressão e ansiedade', 'Confusão', 'Rachadura nos lábios', 'Língua inflamada', 'Formigamento'],
    foods: ['Frango', 'Banana', 'Batata-doce', 'Atum', 'Espinafre', 'Grão-de-bico', 'Salmão'],
    supplement: 'Complexo B',
    source: 'Stover PJ, Annual Review of Nutrition 2004',
  },
  {
    nutrient: 'Vitamina B9 (Folato/Ácido Fólico)',
    category: 'vitamina',
    diseases: ['Defeitos do tubo neural (espinha bífida)', 'Anemia megaloblástica', 'Doença cardiovascular', 'Depressão', 'Câncer colorretal'],
    symptoms: ['Fadiga extrema', 'Úlceras na boca', 'Língua inflamada', 'Crescimento prejudicado', 'Irritabilidade'],
    foods: ['Fígado de frango', 'Feijão-fradinho', 'Lentilha', 'Espinafre', 'Aspargos', 'Abacate', 'Brócolis'],
    supplement: 'Complexo B',
    brazilPrevalence: 'Crítica em gestantes. Programa de fortificação de farinhas no Brasil desde 2002',
    source: 'Czeizel AE & Dudás I, NEJM 1992; MS/Brasil PNAN',
  },
  {
    nutrient: 'Vitamina B12 (Cobalamina)',
    category: 'vitamina',
    diseases: ['Anemia megaloblástica', 'Demência precoce', 'Alzheimer', 'Neuropatia periférica', 'Depressão', 'Infertilidade'],
    symptoms: ['Fadiga intensa', 'Formigamento mãos e pés', 'Perda de memória', 'Dificuldade de equilíbrio', 'Língua avermelhada', 'Palidez'],
    foods: ['Fígado bovino (mais rica fonte)', 'Mexilhão', 'Sardinha', 'Salmão', 'Ovo', 'Queijo'],
    supplement: 'Vitamina B12',
    brazilPrevalence: 'Alta em veganos/vegetarianos e idosos (absorção reduzida após 50 anos)',
    source: 'Stabler SP, NEJM 2013; NIH B12 Fact Sheet',
  },
  // ─── MINERAIS ─────────────────────────────────────────────────────
  {
    nutrient: 'Ferro',
    category: 'mineral',
    diseases: ['Anemia ferropriva', 'Comprometimento cognitivo infantil', 'Retardo no desenvolvimento', 'Parto prematuro', 'Síndrome das pernas inquietas'],
    symptoms: ['Cansaço e fraqueza', 'Palidez', 'Unhas frágeis', 'Queda de cabelo', 'Falta de ar', 'Pica (vontade de comer terra/gelo)', 'Frio nas extremidades'],
    foods: ['Fígado bovino', 'Ostra', 'Carne vermelha', 'Feijão preto + suco de laranja', 'Lentilha', 'Tofu', 'Espinafre'],
    supplement: 'Ferro',
    herbs: ['Dang Gui (Angelica sinensis)'],
    brazilPrevalence: 'Deficiência mais prevalente no Brasil: afeta 20-25% das crianças (ENANI 2019)',
    source: 'WHO Global Anaemia Estimates; ENANI-2019/Brasil',
  },
  {
    nutrient: 'Magnésio',
    category: 'mineral',
    diseases: ['Enxaqueca crônica', 'Diabetes tipo 2', 'Hipertensão', 'Fibromialgia', 'Osteoporose', 'Depressão', 'Síndrome metabólica', 'Arritmia cardíaca'],
    symptoms: ['Câimbras musculares', 'Insônia', 'Ansiedade', 'Irritabilidade', 'Formigamento', 'Tiques musculares', 'Constipação'],
    foods: ['Sementes de abóbora (mais rica fonte)', 'Cacau 70%+', 'Amêndoas', 'Espinafre cozido', 'Feijão preto', 'Abacate', 'Banana'],
    supplement: 'Magnésio',
    herbs: ['Valeriana', 'Ashwagandha'],
    brazilPrevalence: 'Estimado em 70%+ da população com ingestão insuficiente',
    source: 'Rosanoff A et al., Nutrition Reviews 2012; DiNicolantonio JJ et al., Open Heart 2018',
  },
  {
    nutrient: 'Zinco',
    category: 'mineral',
    diseases: ['Imunossupressão', 'Atraso no crescimento', 'Hipogonadismo', 'Infertilidade masculina', 'Dermatite', 'Acne severa', 'Diarreia crônica', 'Perda de paladar/olfato'],
    symptoms: ['Infecções frequentes', 'Queda de cabelo', 'Unhas com manchas brancas', 'Cicatrização lenta', 'Perda de apetite', 'Diarreia', 'Acne'],
    foods: ['Ostra (mais rica fonte)', 'Caranguejo', 'Carne bovina', 'Sementes de abóbora', 'Grão-de-bico', 'Castanha de caju'],
    supplement: 'Zinco',
    herbs: ['Reishi', 'Cordyceps'],
    brazilPrevalence: 'Relevante em crianças e adolescentes. Dieta pobre em proteína animal é fator de risco',
    source: 'Prasad AS, Journal of Trace Elements in Medicine and Biology 2014',
  },
  {
    nutrient: 'Cálcio',
    category: 'mineral',
    diseases: ['Osteoporose', 'Osteopenia', 'Raquitismo', 'Hipocalcemia', 'Hipertensão', 'Câncer de cólon (fator protetor)'],
    symptoms: ['Câimbras musculares', 'Entorpecimento', 'Formigamento', 'Unhas quebradiças', 'Memória fraca', 'Espasmos musculares'],
    foods: ['Queijo parmesão', 'Sardinha com espinha', 'Iogurte grego', 'Gergelim (tahine)', 'Couve-manteiga', 'Leite', 'Tofu com sulfato de cálcio'],
    supplement: 'Cálcio',
    brazilPrevalence: 'Inadequação em 80%+ dos adolescentes brasileiros (POF/IBGE)',
    source: 'NIH Calcium Fact Sheet; Weaver CM, Nutrition Reviews 2014',
  },
  {
    nutrient: 'Selênio',
    category: 'mineral',
    diseases: ['Tireoidite de Hashimoto', 'Hipotireoidismo', 'Infertilidade', 'Enfraquecimento imunológico', 'Doença de Keshan (cardiomiopatia)', 'Risco aumentado de câncer'],
    symptoms: ['Fadiga', 'Queda de cabelo', 'Fraqueza muscular', 'Névoa mental (brain fog)', 'Hipotireoidismo'],
    foods: ['Castanha-do-pará (1-2 unidades/dia)', 'Atum', 'Sardinha', 'Camarão', 'Frango', 'Ovo', 'Sementes de girassol'],
    supplement: 'Selênio',
    herbs: ['Astragalus'],
    brazilPrevalence: 'Solos brasileiros (exceto Amazônia) são pobres em selênio. Castanha-do-pará é solução natural',
    source: 'Rayman MP, The Lancet 2012; Thomson CD, British Journal of Nutrition 2004',
  },
  {
    nutrient: 'Iodo',
    category: 'mineral',
    diseases: ['Hipotireoidismo', 'Bócio', 'Cretinismo (deficiência gestacional)', 'Retardo mental', 'Metabolismo lento'],
    symptoms: ['Cansaço', 'Ganho de peso', 'Sensação de frio', 'Bócio (inchaço no pescoço)', 'Cabelo e pele secos', 'Depressão'],
    foods: ['Algas marinhas (kelp)', 'Peixe do mar', 'Camarão', 'Sal iodado', 'Laticínios', 'Ovos'],
    supplement: 'Iodo',
    herbs: ['Kelp (alga)'],
    brazilPrevalence: 'Controlada após iodação do sal (1953), mas ressurge em áreas sem acesso ou com sal não iodado',
    source: 'WHO; Zimmermann MB, British Journal of Nutrition 2009',
  },
  {
    nutrient: 'Potássio',
    category: 'mineral',
    diseases: ['Hipocalemia', 'Arritmia cardíaca', 'Hipertensão', 'Osteoporose', 'Cálculos renais', 'AVC'],
    symptoms: ['Câimbras', 'Fraqueza muscular', 'Fadiga', 'Constipação', 'Palpitações', 'Formigamento'],
    foods: ['Banana', 'Batata-doce', 'Abacate', 'Espinafre', 'Feijão branco', 'Salmão', 'Tomate', 'Coco'],
    supplement: 'Potássio',
    source: 'NIH Potassium Fact Sheet; Aburto NJ et al., BMJ 2013',
  },
  {
    nutrient: 'Magnésio',
    category: 'mineral',
    diseases: ['Enxaqueca crônica', 'Diabetes tipo 2', 'Hipertensão', 'Fibromialgia', 'Depressão', 'Arritmia cardíaca'],
    symptoms: ['Câimbras', 'Insônia', 'Ansiedade', 'Formigamento', 'Tiques', 'Constipação'],
    foods: ['Sementes de abóbora', 'Cacau 70%+', 'Amêndoas', 'Espinafre', 'Feijão preto', 'Abacate'],
    supplement: 'Magnésio',
    herbs: ['Valeriana', 'Ashwagandha'],
    brazilPrevalence: '~70% da população',
    source: 'Rosanoff A et al., Nutrition Reviews 2012',
  },
  // ─── ÁCIDOS GRAXOS ────────────────────────────────────────────────
  {
    nutrient: 'Ômega-3 (EPA/DHA)',
    category: 'acido-graxo',
    diseases: ['Depressão', 'Transtorno bipolar', 'TDAH', 'Doença de Alzheimer', 'Doença cardiovascular', 'Artrite reumatoide', 'Degeneração macular', 'Inflamação crônica sistêmica'],
    symptoms: ['Pele seca e descamativa', 'Depressão', 'Falta de foco e memória', 'Dor nas articulações', 'Olhos secos', 'Sono ruim'],
    foods: ['Sardinha', 'Salmão selvagem', 'Atum', 'Cavala', 'Sementes de linhaça', 'Chia', 'Nozes', 'Algas marinhas'],
    supplement: 'Ômega-3',
    herbs: ['Dan Shen (Salvia miltiorrhiza)'],
    brazilPrevalence: 'Alta: dieta brasileira média é pobre em peixes de águas profundas e frias',
    source: 'Calder PC, Nutrients 2020; Grosso G et al., European Journal of Nutrition 2014',
  },
  // ─── AMINOÁCIDOS ──────────────────────────────────────────────────
  {
    nutrient: 'Triptofano',
    category: 'aminoacido',
    diseases: ['Depressão', 'Transtornos de ansiedade', 'Insônia', 'Transtorno obsessivo-compulsivo', 'Fibromialgia'],
    symptoms: ['Humor deprimido', 'Ansiedade', 'Insônia', 'Irritabilidade', 'Compulsão por carboidratos'],
    foods: ['Peru', 'Frango', 'Ovo', 'Soja', 'Queijo', 'Abóbora', 'Gergelim', 'Chocolate amargo'],
    supplement: 'Triptofano',
    herbs: ['Ashwagandha', 'Valeriana'],
    source: 'Jenkins TA et al., Nutrients 2016',
  },
];

// ─── ÍNDICE REVERSO: Sintoma/Doença → Deficiências ───────────────────────────
export interface ReverseMatch {
  nutrient: string;
  confidence: 'alta' | 'moderada' | 'possível';
}

/**
 * Busca quais deficiências estão associadas a um sintoma ou doença.
 * Retorna lista ordenada por relevância.
 */
export function findDeficiencyBySymptom(query: string): { entry: DeficiencyEntry; confidence: 'alta' | 'moderada' | 'possível' }[] {
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const q = normalize(query);
  const results: { entry: DeficiencyEntry; score: number }[] = [];

  for (const entry of DEFICIENCY_DATABASE) {
    let score = 0;

    // Match em doenças (peso alto)
    for (const disease of entry.diseases) {
      if (normalize(disease).includes(q) || q.includes(normalize(disease))) score += 3;
    }
    // Match em sintomas (peso médio)
    for (const symptom of entry.symptoms) {
      if (normalize(symptom).includes(q) || q.includes(normalize(symptom))) score += 2;
    }
    // Match no nome do nutriente (peso baixo)
    if (normalize(entry.nutrient).includes(q)) score += 1;

    if (score > 0) results.push({ entry, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(r => ({
      entry: r.entry,
      confidence: r.score >= 3 ? 'alta' : r.score >= 2 ? 'moderada' : 'possível',
    }));
}

/**
 * Busca deficiência pelo nome do nutriente.
 */
export function findByNutrient(name: string): DeficiencyEntry | undefined {
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const q = normalize(name);
  return DEFICIENCY_DATABASE.find(e =>
    normalize(e.nutrient).includes(q) || q.includes(normalize(e.nutrient))
  );
}
