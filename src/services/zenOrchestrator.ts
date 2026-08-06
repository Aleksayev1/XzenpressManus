/**
 * ============================================================
 *  ZenOrchestrator v0.1 — Maestro de Coordenação Única
 *  XZenPress | Orquestra Percepção, Segurança, Políticas e Ações
 * ============================================================
 */

import { ZenSenseEngine, EmotionalState } from './zenSenseEngine';
import { checkContentSafety, ZenSentinelResult } from './zenSentinel';
import { ZenPolicyEngine, ZenPolicyContext, ZenPolicyDecision, UserTier } from './zenPolicy';
import { zenMemory } from './zenMemoryEngine';
import { ZenActionRegistry, ActionPayload } from './zenActionRegistry';
import { createZenSession } from './zenAudioEngine';

export interface OrchestrationRequest {
  userMessage: string;
  userTier: UserTier;
  dailySessionsCount: number;
  userConsentedMemory: boolean;
  userId?: string;
}

export interface OrchestrationResponse {
  sentinelResult: ZenSentinelResult;
  policyDecision: ZenPolicyDecision;
  emotionalState?: EmotionalState;
  suggestedAction?: ActionPayload;
  responseText: string;
}

export class ZenOrchestrator {
  /**
   * Processa a mensagem do usuário executando o Trilho Rápido de Risco + Trilho Profundo de Ação
   */
  public static async processUserMessage(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const { userMessage, userTier, dailySessionsCount, userConsentedMemory, userId } = request;

    // 1. TRILHO RÁPIDO: Verificação de Segurança (ZenSentinel)
    const sentinelResult = checkContentSafety(userMessage);

    // 2. AVALIAÇÃO DE POLÍTICA (ZenPolicy)
    const policyContext: ZenPolicyContext = {
      userTier,
      dailySessionsCount,
      currentState: sentinelResult.isCrisis ? 'RISCO_DETECTADO' : 'NORMAL',
      sentinelResult,
      userConsentedMemory
    };

    const policyDecision = ZenPolicyEngine.evaluate(policyContext);

    // Se for risco grave/emergência: corta qualquer ação comercial e retorna acolhimento
    if (policyDecision.redirectToEmergency) {
      return {
        sentinelResult,
        policyDecision,
        responseText: 'Sinto muito que você esteja passando por um momento tão difícil. Sua vida tem um valor inestimável. Por favor, entre em contato imediatamente com o CVV pelo número 188 (ligação gratuita 24h) ou com o SAMU no 192.'
      };
    }

    // 3. TRILHO PROFUNDO: Percepção Emocional & MTC (ZenSense & Memory)
    let emotionalState: EmotionalState | undefined;
    let suggestedAction: ActionPayload | undefined;

    try {
      emotionalState = await ZenSenseEngine.analyzeState(userMessage);
    } catch (e) {
      console.warn('ZenOrchestrator: Falha na análise emocional, usando fallback suave.');
    }

    // 4. MAPEAMENTO DE AÇÕES AUTORIZADAS (ZenActionRegistry)
    if (policyDecision.allowActionExecution && emotionalState) {
      if (emotionalState.primaryEmotion === 'anxiety' || emotionalState.primaryEmotion === 'stress') {
        suggestedAction = ZenActionRegistry.getAction('START_BREATHING_5_5S') || undefined;
      } else if (emotionalState.primaryEmotion === 'insomnia') {
        suggestedAction = ZenActionRegistry.getAction('PLAY_ZEN_AUDIO_432HZ') || undefined;
      }
    }

    // 5. SE COTA EXCEDIDA (ZenGate Contextual)
    if (policyDecision.applyZenGateQuota) {
      const promptDirective = ZenPolicyEngine.getZenGatePrompt(userTier, emotionalState?.primaryEmotion);
      return {
        sentinelResult,
        policyDecision,
        emotionalState,
        suggestedAction: ZenActionRegistry.getAction('START_BREATHING_5_5S') || undefined, // Libera 15s de respiração gratuita
        responseText: promptDirective
      };
    }

    // 6. RESPOSTA PADRÃO ACOLHEDORA
    const defaultResponse = `Estou aqui com você. Percebi um estado de ${emotionalState?.primaryEmotion || 'agitação'}. Podemos realizar agora uma regulação respiratória rápida de 5,5 segundos para equilibrar seu sistema nervoso.`;

    return {
      sentinelResult,
      policyDecision,
      emotionalState,
      suggestedAction,
      responseText: defaultResponse
    };
  }
}
