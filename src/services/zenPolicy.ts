/**
 * ============================================================
 *  ZenPolicy v0.1 — Tabela Determinística de Governança & ZenGate
 *  XZenPress | Regras Clínicas, Privacidade LGPD & Monetização Ética
 * ============================================================
 */

import { ZenSentinelResult } from './zenSentinel';

export type UserTier = 'guest' | 'free_logged' | 'premium_360';

export type ZenMentorState = 
  | 'NORMAL'
  | 'ESCUTA_ATIVA'
  | 'SUGESTÃO_DE_TÉCNICA'
  | 'AÇÃO_EM_EXECUÇÃO'
  | 'PÓS_AÇÃO'
  | 'RISCO_DETECTADO'
  | 'ENCAMINHAMENTO'
  | 'COTA_EXCEDIDA'
  | 'FALLBACK';

export interface ZenPolicyContext {
  userTier: UserTier;
  dailySessionsCount: number;
  currentState: ZenMentorState;
  sentinelResult?: ZenSentinelResult;
  userConsentedMemory: boolean;
}

export interface ZenPolicyDecision {
  allowActionExecution: boolean;
  allowMemoryStorage: boolean;
  applyZenGateQuota: boolean;
  redirectToEmergency: boolean;
  nextMentorState: ZenMentorState;
  suggestedPromptDirective: string;
}

export class ZenPolicyEngine {
  /**
   * Avalia a política de segurança, privacidade e limites comerciais sem violar a ética.
   */
  public static evaluate(context: ZenPolicyContext): ZenPolicyDecision {
    const { userTier, dailySessionsCount, currentState, sentinelResult, userConsentedMemory } = context;

    // 1. REGRA ABSOLUTA DE SEGURANÇA (ADR-02): Crise ou risco detectado cancela monetização
    if (sentinelResult && (sentinelResult.isCrisis || sentinelResult.isHighRisk)) {
      return {
        allowActionExecution: false,
        allowMemoryStorage: false, // Não armazena dados de crise sensíveis por padrão (LGPD)
        applyZenGateQuota: false, // NUNCA monetiza crise
        redirectToEmergency: true,
        nextMentorState: 'RISCO_DETECTADO',
        suggestedPromptDirective: 'ACOLHIMENTO_EMERGENCIA_CVV_188'
      };
    }

    // 2. VERIFICAÇÃO DE COTA (ZenGate) — Válida APENAS nos estados NORMAL e PÓS_AÇÃO (ADR-07)
    const isQuotaAllowedState = currentState === 'NORMAL' || currentState === 'PÓS_AÇÃO';
    let isQuotaExceeded = false;

    if (isQuotaAllowedState && userTier !== 'premium_360') {
      const maxLimit = userTier === 'guest' ? 1 : 2;
      if (dailySessionsCount >= maxLimit) {
        isQuotaExceeded = true;
      }
    }

    // 3. SE COTA EXCEDIDA E EM ESTADO PERMITIDO: Aplica ZenGate Acolhedor (ADR-03)
    if (isQuotaExceeded) {
      return {
        allowActionExecution: false,
        allowMemoryStorage: userConsentedMemory,
        applyZenGateQuota: true,
        redirectToEmergency: false,
        nextMentorState: 'COTA_EXCEDIDA',
        suggestedPromptDirective: 'CONVITE_CONTEXTUAL_FREEMIUM_ACOLHEDOR'
      };
    }

    // 4. FLUXO NORMAL PERMITIDO
    return {
      allowActionExecution: true,
      allowMemoryStorage: userConsentedMemory,
      applyZenGateQuota: false,
      redirectToEmergency: false,
      nextMentorState: currentState === 'NORMAL' ? 'ESCUTA_ATIVA' : currentState,
      suggestedPromptDirective: 'ORIENTACAO_REGULACAO_FISIOLOGICA'
    };
  }

  /**
   * Formata a instrução contextual do ZenGate (Não punitivo, focado em alívio prévio)
   */
  public static getZenGatePrompt(userTier: UserTier, userNeed?: string): string {
    const needText = userNeed ? `para aliviar ${userNeed}` : 'para sua recuperação fisiológica';
    
    if (userTier === 'guest') {
      return `Consegui liberar uma regulação rápida de 15 segundos agora ${needText}. Para mantermos seu histórico e liberar seu protocolo personalizado com pontos de acupressão e som 432 Hz, crie sua conta gratuita em 30 segundos. Quer experimentar a respiração rápida primeiro?`;
    }

    return `Notei que você atingiu suas 2 sessões gratuitas de hoje. Consegui liberar uma respiração rápida de 15s ${needText}. Para acessar o Plano 360 com sessões ilimitadas, áudio de indução ao sono e gráficos de VFC em tempo real, conheça nossa assinatura por R$ 19,90/mês.`;
  }
}
