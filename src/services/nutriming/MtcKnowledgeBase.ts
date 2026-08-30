/**
 * Base de Conhecimento Curada da MTC.
 * Evita "alucinações" de LLMs e padroniza a educação tradicional.
 */

export interface MtcKnowledgeEntry {
  id: string;
  foodName: string;
  nature: 'quente' | 'morno' | 'neutro' | 'fresco' | 'frio';
  flavor: ('doce' | 'salgado' | 'azedo' | 'amargo' | 'picante')[];
  traditionalCategory: string; // Ex: 'Tonifica Qi', 'Limpa Calor'
  evidenceStatus: 'traditional-text' | 'modern-adaptation';
  traditionalContext: string;
}

export const MtcKnowledgeBase: Record<string, MtcKnowledgeEntry> = {
  'cafe': {
    id: 'mtc-coffee',
    foodName: 'Café',
    nature: 'quente',
    flavor: ['amargo'],
    traditionalCategory: 'Move o Qi, Dispersa Frio',
    evidenceStatus: 'modern-adaptation',
    traditionalContext: 'O café não existia nos textos clássicos chineses, mas a dietoterapia moderna o classifica como de natureza morna/quente e sabor amargo. Ele estimula e move a energia rapidamente, mas seu uso excessivo pode esgotar o Yin e superestimular o Fogo do Coração.'
  },
  'gengibre': {
    id: 'mtc-ginger',
    foodName: 'Gengibre Fresco (Sheng Jiang)',
    nature: 'morno',
    flavor: ['picante'],
    traditionalCategory: 'Libera o Exterior, Aquece o Centro',
    evidenceStatus: 'traditional-text',
    traditionalContext: 'Usado milenarmente para aquecer o estômago, dissipar o frio e auxiliar na digestão estagnada. É uma raiz dispersante.'
  },
  'arroz_branco': {
    id: 'mtc-white-rice',
    foodName: 'Arroz Branco',
    nature: 'neutro',
    flavor: ['doce'],
    traditionalCategory: 'Tonifica o Qi do Baço/Estômago',
    evidenceStatus: 'traditional-text',
    traditionalContext: 'Considerado um alimento perfeitamente equilibrado e harmonizador. O sabor "doce" na MTC refere-se a carboidratos que nutrem profundamente o centro energético (digestão).'
  }
};
