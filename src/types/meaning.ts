import { EpistemicStatus } from './evolution';

export interface Observation {
  id: string;
  chapterId: string;
  generatedAt: string;
  
  text: string;
  epistemicStatus: EpistemicStatus;
  
  supportingEventIds: string[];
  window: 'week' | 'chapter' | 'all-time';
  
  // Quantos eventos sustentam esta frase?
  // Abaixo de 3 eventos = não emite. Regra de dado insuficiente.
  evidenceCount: number;
}
