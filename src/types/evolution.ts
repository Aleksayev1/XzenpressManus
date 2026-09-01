// src/types/evolution.ts
// Human Evolution Framework — Sprint 4 core types
// Princípio central: "Virtude não é medida. Comportamento é registrado."

/** A virtude é o nó conceitual — a direção que a pessoa escolhe cultivar. */
export interface Virtue {
  id: string;
  name: string;
  emoji: string;
  /** Frase curta que resume a intenção por trás da virtude (não um slogan de marketing). */
  essence: string;
}

/** O microcomportamento é o nó comportamental — a ação concreta e observável. */
export interface MicroBehavior {
  id: string;
  virtueId: string;
  label: string;
  description: string;
}

export type ChapterStatus =
  | 'draft' // primeiros 7 dias, período experimental — nada "some" se a pessoa desistir
  | 'active' // capítulo confirmado após o período de rascunho
  | 'paused' // pausado sem culpa, sem streak zerado
  | 'completed' // encerrado com intenção
  | 'archived'; // arquivado, permanece na história do usuário

/** A trajetória escolhida pelo usuário: uma virtude + um microcomportamento, ao longo do tempo. */
export interface Chapter {
  id: string;
  title: string;
  primaryVirtueId: string;
  microBehaviorId: string;
  
  createdAt: string; // ISO date - quando o capítulo foi criado no banco
  startedAt: string; // ISO date - quando a prática efetivamente iniciou
  endedAt?: string; // ISO date
  
  draftUntil?: string; // ISO date - Fim do período de 7 dias

  status: ChapterStatus;
}

export type PracticeOutcome =
  | 'completed'
  | 'partial'
  | 'skipped'
  | 'declined'
  | 'uncertain';

/**
 * O evento/aresta temporal que conecta usuário → comportamento → contexto.
 * Este é o "nó" que alimenta o grafo de prática — nunca um score.
 *
 *   USER ──practices──▶ MICRO_BEHAVIOR ──belongs_to──▶ VIRTUE
 *    └──────────────────────at──────────────────────▶ TIMESTAMP
 *
 * Pensado para futuramente virar um ZenEvent e alimentar o Temporal Observation
 * Engine já existente.
 */
export interface PracticeLog {
  id: string;
  
  chapterId: string;
  microBehaviorId: string;
  
  occurredAt: string; // ISO datetime
  recordedAt: string; // ISO datetime (quando foi salvo no sistema)

  /** Contexto opcional: onde/quando isso aconteceu. */
  context?: string;

  /** Reflexão opcional da própria pessoa sobre a prática. */
  userReflection?: string;

  outcome: PracticeOutcome;

  /** Vínculo com o evento universal do XZenPress (Temporal Engine). */
  zenEventId?: string;
}

/**
 * Classificação epistêmica de uma afirmação do ZenMentor.
 * Dimensão independente da lente de sentido (ver `Lens` abaixo) — nunca misturar as duas.
 */
export type EpistemicStatus =
  | 'observed' // baseado nos registros do próprio usuário
  | 'scientific' // evidência científica identificada
  | 'traditional' // referencial tradicional (MTC, Zen, etc.)
  | 'interpretive' // leitura/hipótese, ainda não deve ser tratada como fato
  | 'unknown'; // não há base suficiente para afirmar

/**
 * Lente de sentido escolhida pelo usuário.
 * Nenhuma lente vem pré-selecionada por padrão — a pessoa escolhe antes de qualquer
 * conteúdo aparecer (Lei 7 do Framework).
 */
export type Lens = 
  | 'scientific' 
  | 'philosophical' 
  | 'spiritual' 
  | 'traditional' 
  | 'personal'
  | null;

// ---------------------------------------------------------------------------
// Sementes iniciais — as três primeiras portas de entrada do Human Evolution Framework
// PERCEBER → PAUSAR → AGIR
// ---------------------------------------------------------------------------

export const INITIAL_VIRTUES: Virtue[] = [
  {
    id: 'presenca',
    name: 'Presença',
    emoji: '🌿',
    essence: 'Eu estou aqui.',
  },
  {
    id: 'paciencia',
    name: 'Paciência',
    emoji: '🕊️',
    essence: 'Eu não preciso responder imediatamente.',
  },
  {
    id: 'coragem',
    name: 'Coragem',
    emoji: '🔥',
    essence: 'Posso dar o próximo passo mesmo com medo.',
  },
];

export const INITIAL_MICRO_BEHAVIORS: MicroBehavior[] = [
  // Presença
  {
    id: 'p1-pausa-consciente',
    virtueId: 'presenca',
    label: 'Pausa consciente',
    description: 'Antes de iniciar uma atividade importante, faça 30 segundos sem outra tarefa.',
  },
  {
    id: 'p2-refeicao-presente',
    virtueId: 'presenca',
    label: 'Refeição presente',
    description: 'Uma refeição sem tela.',
  },
  {
    id: 'p3-escuta-presente',
    virtueId: 'presenca',
    label: 'Escuta presente',
    description: 'Ouvir alguém sem interromper por um minuto.',
  },
  // Paciência
  {
    id: 'pa1-pausa-antes-de-responder',
    virtueId: 'paciencia',
    label: 'Pausa antes de responder',
    description: '10 segundos antes de responder numa situação de irritação.',
  },
  {
    id: 'pa2-uma-coisa-por-vez',
    virtueId: 'paciencia',
    label: 'Uma coisa por vez',
    description: 'Concluir uma pequena tarefa sem alternar entre outras.',
  },
  {
    id: 'pa3-tolerar-a-espera',
    virtueId: 'paciencia',
    label: 'Tolerar a espera',
    description: 'Perceber a vontade de agir imediatamente e escolher esperar um pouco.',
  },
  // Coragem
  {
    id: 'c1-pequeno-passo-adiado',
    virtueId: 'coragem',
    label: 'Pequeno passo adiado',
    description: 'Fazer uma ação pequena que você vem evitando.',
  },
  {
    id: 'c2-conversa-necessaria',
    virtueId: 'coragem',
    label: 'Conversa necessária',
    description: 'Iniciar uma conversa que vem sendo adiada.',
  },
  {
    id: 'c3-pedir-ajuda',
    virtueId: 'coragem',
    label: 'Pedir ajuda',
    description: 'Reconhecer uma dificuldade e pedir apoio.',
  },
];

export function getMicroBehaviorsForVirtue(virtueId: string): MicroBehavior[] {
  return INITIAL_MICRO_BEHAVIORS.filter((mb) => mb.virtueId === virtueId);
}


export interface ChoiceRecord {
  id: string;
  chapterId: string;
  userId: string;
  occurredAt: string;
  
  // O que o usuário percebeu antes de escolher
  trigger?: string;
  
  // O que ele escolheu fazer
  choiceOutcome: 'acted_consciously' | 'continued_automatic' | 'paused' | 'uncertain';
  
  reflection?: string;
  zenEventId?: string;
}

export type EvolutionObservationType = 'recurrence' | 'change' | 'persistence' | 'disappearance' | 'variation';
export type EvolutionEvidenceStrength = 'low' | 'moderate' | 'high';

export interface EvolutionEvidence {
  chapterId: string;
  eventIds: string[];
}

export interface EvolutionObservation {
  id: string;
  userId: string;
  observationType: EvolutionObservationType;
  domain: 'practice' | 'choice' | 'emotion' | 'sleep' | 'nutrition' | 'cross_data';
  text: string;
  epistemicStatus: 'observed' | 'interpretive';
  evidenceStrength: EvolutionEvidenceStrength;
  evidence: EvolutionEvidence[];
  chapterCount: number;
  structuredPattern: Record<string, any>;
  createdAt: string;
}

export interface ChapterWithLogs {
  chapter: Chapter;
  logs: PracticeLog[];
  choices: ChoiceRecord[];
}

// ---------------------------------------------------------------------------
// S13.5 — Chapter Comparator
// ---------------------------------------------------------------------------

/**
 * Representa a comparação entre dois ou mais capítulos que compartilham
 * o mesmo microcomportamento. Não contém scores nem avaliações.
 * Apenas organiza evidências já produzidas pelo EvolutionMirrorEngine.
 */
export interface ChapterComparison {
  /** Microcomportamento que une os capítulos comparados */
  microBehaviorId: string;

  /** Capítulos deste grupo, ordenados por startedAt */
  chapters: Chapter[];

  /** Observações do EvolutionMirrorEngine que dizem respeito a este grupo */
  relatedObservations: EvolutionObservation[];

  /** IDs de todos os capítulos com evidência vinculada às observações */
  evidenceChapterIds: string[];
}
