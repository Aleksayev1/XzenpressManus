export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  hasPaidPremium?: boolean;
  premiumActivatedAt?: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface AcupressurePoint {
  id: string;
  name: string;
  nameEn: string;
  nameEs: string;
  nameFr: string;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionFr: string;
  position: {
    x: number;
    y: number;
  };
  image?: string;
  imageAlt?: string;
  benefits: string[];
  benefitsEn: string[];
  benefitsEs: string[];
  benefitsFr: string[];
  isPremium: boolean;
  category: 'general' | 'septicemia' | 'atm' | 'cranio';
  instructions?: string;
  duration?: number;
  pressure?: 'muito leve' | 'leve' | 'moderada' | 'firme';
}

export interface BreathingSession {
  id: string;
  userId: string;
  duration: number;
  completedAt: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface PaymentMethod {
  type: 'pix' | 'credit' | 'crypto';
  details: any;
}

export interface UserProfile {
  id: string;
  stressLevel: 'low' | 'medium' | 'high';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  mainConcerns: string[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  usageHistory: SessionHistory[];
}

export interface SessionHistory {
  date: string;
  type: 'breathing' | 'acupressure' | 'chromotherapy';
  duration: number;
  pointsUsed?: string[];
  effectiveness: number; // 1-5 rating
}

export interface AIRecommendation {
  id: string;
  type: 'point' | 'breathing' | 'routine' | 'timing';
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high';
  estimatedBenefit: string;
  pointId?: string;
  duration?: number;
  schedule?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  authorEmail?: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  views: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  // Traduções
  titleEn?: string;
  contentEn?: string;
  excerptEn?: string;
  titleEs?: string;
  contentEs?: string;
  excerptEs?: string;
  titleIt?: string;
  contentIt?: string;
  excerptIt?: string;
  titleFr?: string;
  contentFr?: string;
  excerptFr?: string;
  titleDe?: string;
  contentDe?: string;
  excerptDe?: string;
  titleZh?: string;
  contentZh?: string;
  excerptZh?: string;
  titleJa?: string;
  contentJa?: string;
  excerptJa?: string;
  titleRu?: string;
  contentRu?: string;
  excerptRu?: string;
  titleHi?: string;
  contentHi?: string;
  excerptHi?: string;
  titleAr?: string;
  contentAr?: string;
  excerptAr?: string;
  titleBn?: string;
  contentBn?: string;
  excerptBn?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
}