/**
 * zenStoriesTypes.ts
 * ==================
 * Tipos e contratos de dados para o XZenPress Stories (Depoimentos e Prova Social com Contexto Clínico).
 */

export type StoryMediaType = 'audio' | 'video' | 'text';

export type StoryModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ZenStoryContext {
  sessionId?: string;
  sessionName: string;          // Ex: "Reset do Sistema Nervoso", "Alívio Zusanli (ST36)"
  beforeScore?: number;         // 0 a 10 (ex: 8)
  afterScore?: number;          // 0 a 10 (ex: 2)
  coherenceGainMs?: number;     // Ganho de VFC/HRV (ex: +16 ms)
  guardianElement?: string;     // 'Fogo' | 'Madeira' | 'Terra' | 'Metal' | 'Água'
  organAffected?: string;       // 'Coração' | 'Fígado' | 'Estômago' | 'Pulmão' | 'Rins'
}

export interface ZenStoryConsent {
  publicDisplay: boolean;       // Autorização para exibição pública na plataforma
  marketingUse: boolean;        // Autorização para materiais de conscientização/divulgação
  isAnonymous: boolean;         // Exibir apenas iniciais/cidade em vez do nome completo
  termsAcceptedAt: string;      // ISO Timestamp do aceite
}

export interface ZenStory {
  id: string;
  userId?: string;
  authorName: string;
  authorLocation?: string;      // Ex: "São Paulo, SP" | "Brasília, DF"
  authorRole?: string;          // Ex: "Servidora Pública", "Empresário", "Professora"
  avatarUrl?: string;
  
  // Tipo e Mídia
  mediaType: StoryMediaType;
  mediaUrl?: string;            // URL do áudio ou vídeo no Supabase Storage / Blob
  durationSeconds?: number;     // Duração do áudio/vídeo (ex: 28s)
  
  // Conteúdo textual ou transcrição
  text: string;                 // Depoimento escrito ou transcrição gerada por IA
  rating: number;               // 1 a 5 estrelas
  
  // Contexto da Transformação
  context: ZenStoryContext;
  
  // Consentimento & Moderação
  consent: ZenStoryConsent;
  status: StoryModerationStatus;
  
  // Métricas de Engajamento
  helpfulCount: number;         // "Esse relato me inspirou"
  verifiedTransformation: boolean; // Selo de sessão real verificada
  createdAt: string;            // ISO Timestamp
}

export interface StorySubmissionPayload {
  authorName: string;
  authorLocation?: string;
  authorRole?: string;
  mediaType: StoryMediaType;
  mediaBlob?: Blob;
  durationSeconds?: number;
  text: string;
  rating: number;
  context: ZenStoryContext;
  consent: ZenStoryConsent;
}