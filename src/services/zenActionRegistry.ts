/**
 * ============================================================
 *  ZenActionRegistry v0.1 — Catálogo Controlado de Ações Permitidas
 *  XZenPress | Ações Multimodais Executáveis via ZenOrchestrator
 * ============================================================
 */

export type ActionType = 
  | 'START_BREATHING_5_5S'
  | 'PLAY_ZEN_AUDIO_432HZ'
  | 'SHOW_ACUPRESSURE_POINT'
  | 'OPEN_SESSAO_MESTRA'
  | 'REDIRECT_EMERGENCY_CVV';

export interface ActionPayload {
  type: ActionType;
  title: string;
  description: string;
  requiresConsent?: boolean;
  params?: {
    durationSec?: number;
    preset?: 'relax' | 'sleep' | 'focus' | 'down_regulation';
    pointId?: string;
    mode?: 'guided' | 'express';
  };
}

export class ZenActionRegistry {
  private static allowedActions: Record<ActionType, ActionPayload> = {
    START_BREATHING_5_5S: {
      type: 'START_BREATHING_5_5S',
      title: 'Coerência Respiratória (5,5s)',
      description: 'Ritmo Qigong de alinhamento cardiorrespiratório de 5,5 segundos.',
      params: { durationSec: 15 }
    },
    PLAY_ZEN_AUDIO_432HZ: {
      type: 'PLAY_ZEN_AUDIO_432HZ',
      title: 'Som Bioadaptativo em 432 Hz',
      description: 'Frequência sonora para desativação do estresse e indução ao relaxamento.',
      params: { preset: 'relax' }
    },
    SHOW_ACUPRESSURE_POINT: {
      type: 'SHOW_ACUPRESSURE_POINT',
      title: 'Ponto de Acupressão SOS',
      description: 'Mapa anatômico HD do ponto de alívio rápido (ex: Shenmen C7).',
      params: { pointId: 'HT7' }
    },
    OPEN_SESSAO_MESTRA: {
      type: 'OPEN_SESSAO_MESTRA',
      title: 'Sessão Mestra Completa',
      description: 'Protocolo integrativo com Insight, Acupressão e ZenFlow.',
      params: { mode: 'guided' }
    },
    REDIRECT_EMERGENCY_CVV: {
      type: 'REDIRECT_EMERGENCY_CVV',
      title: 'Acolhimento & Suporte de Emergência',
      description: 'Redirecionamento ético gratuito para o CVV (188) ou SAMU (192).',
      requiresConsent: false
    }
  };

  /**
   * Valida se uma ação solicitada está no catálogo registrado
   */
  public static getAction(type: ActionType): ActionPayload | null {
    return this.allowedActions[type] || null;
  }

  /**
   * Retorna a lista de todas as ações autorizadas para o cliente
   */
  public static getAllowedActions(): ActionPayload[] {
    return Object.values(this.allowedActions);
  }
}
