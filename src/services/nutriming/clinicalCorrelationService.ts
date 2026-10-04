/**
 * ClinicalCorrelationService
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo de correlação entre eventos alimentares (Nutriming) e sessões de
 * autorregulação autonômica (RMSSD/VFC via Polar H10).
 *
 * O QUE ESTE MÓDULO FAZ: classifica cada sessão fisiológica pelo tempo
 * decorrido até a refeição mais próxima e por características declaradas
 * dessa refeição (autenticidade, adulteração), produzindo um contexto
 * alimentar/prandial qualitativo.
 *
 * O QUE ESTE MÓDULO NÃO FAZ: não lê, recebe ou deriva nenhuma medida de
 * termografia (sem câmera IR conectada, sem ΔT, sem ROI, sem temperatura).
 * Qualquer menção a "térmico" em versões anteriores deste arquivo descrevia
 * uma aspiração do projeto, não uma capacidade existente — foi removida.
 *
 * Referências metodológicas formais (ex.: um protocolo específico, um
 * parceiro de pesquisa nomeado) pertencem a um documento de protocolo
 * versionado fora do código, não a este serviço — ver campo `provenance`
 * nas funções de exportação.
 * ---------------------------------------------------------------------------
 */
import { MealEventsApi } from './mealEventsApi';
import { MealEvent } from '../../types/nutriming';

export type ThermalPrandialStatus =
  | 'fasting_baseline'      // > 180 min sem alimento: linha de base pura
  | 'prandial_early'        // 0 a 45 min: fase cefálica/gástrica, ativação simpática/vagal mista
  | 'prandial_active'       // 45 a 120 min: absorção ativa e dispersão endotelial
  | 'post_prandial_late';   // 120 a 180 min: clareamento fisiológico

export type ThermalConfounderLevel =
  | 'none'                  // Ruído zero (jejum ou refeição neutra)
  | 'low'                   // Alimento autêntico leve
  | 'moderate'              // Alimento com desarmonia declarada ou suspeito
  | 'critical_adulteration'; // Alimento fraudado/adulterado com gordura vegetal ou aditivos

/** Origem do registro — nunca deve ser inferida, sempre explícita. */
export type DataSource = 'real' | 'synthetic_demo';

/**
 * Proveniência do dataset, para preencher apenas quando houver vínculo
 * formal e autorizado. Vazio por padrão — nunca inferir nomes aqui.
 */
export interface Provenance {
  protocolAuthor?: string;
  dataCollectorApp?: string;
  operator?: string;
}

export interface PairedClinicalSession {
  sessionId: string;
  timestamp: string;
  sessionType: string;
  durationSeconds: number;

  /** Origem do registro. Nunca omitir; nunca inferir no consumidor. */
  dataSource: DataSource;

  // Dados Autonômicos (VFC / RMSSD Polar H10).
  // null = não observado/calculável. NUNCA usar 0 como substituto de dado
  // ausente — 0 ms é um valor fisiológico possível, null não é a mesma coisa.
  rmssdBefore: number | null;
  rmssdAfter: number | null;
  deltaRmssd: number | null;
  anxietyBefore: number | null;
  anxietyAfter: number | null;

  // Cruzamento Nutriming
  lastMeal?: {
    mealId: string;
    productName: string;
    consumedAt: string;
    /**
     * Minutos entre a refeição e a sessão. Pode ser um valor pequeno
     * negativo (até -5) dentro da tolerância de sincronização de relógio
     * entre os dois registros — isso significa que a refeição foi
     * registrada muito perto da sessão, possivelmente alguns instantes
     * depois dela, não necessariamente antes. Não é clampado para 0: um
     * valor negativo real é informação, não ruído a esconder.
     */
    minutesRelativeToSession: number;
    compass: 'green' | 'yellow' | 'red';
    headline: string;
    thermalNature: string;
    isAdulterated: boolean;
    fraudTerms: string[];
  };
  prandialStatus: ThermalPrandialStatus;
  /**
   * Classificação de ruído alimentar/contextual. NÃO é uma medida de
   * qualidade termográfica — não existe termografia neste pipeline.
   */
  confounderLevel: ThermalConfounderLevel;
  methodologicalNote: string;
}

export class ClinicalCorrelationService {
  public static getPairedClinicalSessions(userId?: string): PairedClinicalSession[] {
    const mealEvents = MealEventsApi.getAllMealEvents();

    // 1. Tentar ler histórico real de sessões fisiológicas do localStorage
    let rawSessions: any[] = [];
    try {
      const storageKey = `coherence_history_${userId || 'guest'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        rawSessions = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar sessões de coerência:', e);
    }

    // 2. Se não houver histórico real, gerar sessões de DEMONSTRAÇÃO.
    // dataSource é marcado explicitamente abaixo e nunca é opcional —
    // é o que impede essas sessões de atravessar o gate de exportação
    // científica sem marca.
    let isSyntheticBatch = false;
    if (!rawSessions || rawSessions.length === 0) {
      isSyntheticBatch = true;
      const now = Date.now();
      rawSessions = [
        {
          timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
          sessionType: 'integrated',
          durationSeconds: 600,
          before: { rmssd: 38, anxietyScore: 6, timestamp: new Date(now - 25 * 60 * 1000).toISOString() },
          after: { rmssd: 44, anxietyScore: 3, timestamp: new Date(now - 15 * 60 * 1000).toISOString() },
          result: { score: 72, deltaRmssd: 6, deltaAnxiety: -3, improved: true }
        },
        {
          timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
          sessionType: 'integrated',
          durationSeconds: 600,
          before: { rmssd: 52, anxietyScore: 4, timestamp: new Date(now - 3.2 * 60 * 60 * 1000).toISOString() },
          after: { rmssd: 68, anxietyScore: 1, timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString() },
          result: { score: 94, deltaRmssd: 16, deltaAnxiety: -3, improved: true }
        },
        {
          timestamp: new Date(now - 23.5 * 60 * 60 * 1000).toISOString(),
          sessionType: 'integrated',
          durationSeconds: 600,
          before: { rmssd: 34, anxietyScore: 7, timestamp: new Date(now - 23.8 * 60 * 60 * 1000).toISOString() },
          after: { rmssd: 39, anxietyScore: 5, timestamp: new Date(now - 23.5 * 60 * 60 * 1000).toISOString() },
          result: { score: 60, deltaRmssd: 5, deltaAnxiety: -2, improved: true }
        }
      ];
    }
    const dataSource: DataSource = isSyntheticBatch ? 'synthetic_demo' : 'real';

    // 3. Pareamento Temporal (janela de até 4h antes da sessão, com
    // tolerância de -5min para dessincronia de relógio entre os dois
    // registros — ver comentário em `minutesRelativeToSession`).
    return rawSessions.map((session, index) => {
      const sessionTime = new Date(session.timestamp || session.after?.timestamp || Date.now()).getTime();
      let nearestMeal: MealEvent | undefined;
      let minDiffMinutes = Infinity;
      for (const meal of mealEvents) {
        const mealTime = new Date(meal.createdAt).getTime();
        const diffMinutes = Math.round((sessionTime - mealTime) / (1000 * 60));
        if (diffMinutes >= -5 && diffMinutes < minDiffMinutes && diffMinutes <= 240) {
          minDiffMinutes = diffMinutes;
          nearestMeal = meal;
        }
      }

      let prandialStatus: ThermalPrandialStatus = 'fasting_baseline';
      let confounderLevel: ThermalConfounderLevel = 'none';
      let note = 'Linha de base: > 3 horas sem aporte nutricional registrado antes da sessão.';
      let lastMealData: PairedClinicalSession['lastMeal'] = undefined;

      if (nearestMeal && minDiffMinutes < 180) {
        const isRed = nearestMeal.stateResult.personal.compass === 'red';
        const isYellow = nearestMeal.stateResult.personal.compass === 'yellow';
        const isAdulterated = nearestMeal.stateResult.personal.headline.includes('ADULTERADO') ||
                              nearestMeal.stateResult.personal.headline.includes('ANÁLOGO');

        lastMealData = {
          mealId: nearestMeal.id,
          productName: nearestMeal.product.name,
          consumedAt: nearestMeal.createdAt,
          minutesRelativeToSession: minDiffMinutes,
          compass: nearestMeal.stateResult.personal.compass,
          headline: nearestMeal.stateResult.personal.headline,
          thermalNature: nearestMeal.stateResult.tcmProfile?.thermalNature || 'neutral',
          isAdulterated,
          fraudTerms: nearestMeal.stateResult.western.bullets || []
        };

        if (minDiffMinutes <= 45) {
          prandialStatus = 'prandial_early';
        } else if (minDiffMinutes <= 120) {
          prandialStatus = 'prandial_active';
        } else {
          prandialStatus = 'post_prandial_late';
        }

        if (isAdulterated) {
          confounderLevel = 'critical_adulteration';
          note = `⚠️ Alimento com adulteração/extensores declarada (${nearestMeal.product.name}) registrado ${minDiffMinutes} min antes da sessão. Possível confundidor metabólico sobre a VFC.`;
        } else if (isRed || isYellow) {
          confounderLevel = 'moderate';
          note = `Alimento com desarmonia declarada ${minDiffMinutes} min antes da sessão.`;
        } else {
          confounderLevel = 'low';
          note = `Refeição declarada como autêntica e balanceada ${minDiffMinutes} min antes da sessão.`;
        }
      }

      // ── Cálculo de RMSSD pré/pós/delta ──────────────────────────────────
      // Regra: o valor MEDIDO (session.after.rmssd) sempre tem prioridade
      // sobre qualquer valor derivado. Nenhum acesso a session.result é
      // feito sem optional chaining — a versão anterior deste código podia
      // lançar TypeError quando session.result era undefined mas
      // session.after.rmssd existia (o `||`/ternário entrava no ramo que
      // lia session.result.deltaRmssd sem o `?.`).
      const rmssdBefore: number | null = session.before?.rmssd ?? null;
      const measuredAfter: number | null = session.after?.rmssd ?? null;
      const reportedDelta: number | null = session.result?.deltaRmssd ?? null;

      const rmssdAfter: number | null =
        measuredAfter !== null
          ? measuredAfter
          : rmssdBefore !== null && reportedDelta !== null
            ? rmssdBefore + reportedDelta
            : null;

      const deltaRmssd: number | null =
        measuredAfter !== null && rmssdBefore !== null
          ? measuredAfter - rmssdBefore
          : reportedDelta;

      const anxietyBefore: number | null = session.before?.anxietyScore ?? null;
      const anxietyAfter: number | null = session.after?.anxietyScore ?? null;

      return {
        sessionId: `session-n1-${index + 1}`,
        timestamp: new Date(sessionTime).toISOString(),
        sessionType: session.sessionType || 'integrated',
        durationSeconds: session.durationSeconds || 600,
        dataSource,
        rmssdBefore,
        rmssdAfter,
        deltaRmssd,
        anxietyBefore,
        anxietyAfter,
        lastMeal: lastMealData,
        prandialStatus,
        confounderLevel,
        methodologicalNote: note
      };
    });
  }

  /**
   * Garante que nenhuma sessão sintética atravesse para um artefato de
   * exportação sem autorização explícita. Lança erro em vez de exportar
   * silenciosamente — a quarentena é o comportamento padrão.
   */
  private static assertExportable(
    sessions: PairedClinicalSession[],
    allowSynthetic: boolean
  ): void {
    const synthetic = sessions.filter(s => s.dataSource !== 'real');
    if (synthetic.length > 0 && !allowSynthetic) {
      throw new Error(
        `Exportação bloqueada: ${synthetic.length} sessão(ões) com dataSource !== 'real' ` +
        `(ex.: 'synthetic_demo') não podem ser exportadas como dataset de pesquisa. ` +
        `Se esta é intencionalmente uma exportação de demonstração, chame esta função ` +
        `com { allowSynthetic: true } — o arquivo resultante ainda incluirá a coluna/campo ` +
        `de origem em cada registro.`
      );
    }
  }

  public static exportToCSV(
    sessions: PairedClinicalSession[],
    options: { allowSynthetic?: boolean } = {}
  ): string {
    this.assertExportable(sessions, options.allowSynthetic ?? false);

    const headers = [
      'session_id', 'data_source', 'timestamp_iso', 'session_type', 'duration_sec',
      'rmssd_pre_ms', 'rmssd_post_ms', 'delta_rmssd_ms',
      'anxiety_pre_0_10', 'anxiety_post_0_10', 'has_pre_meal',
      'meal_product_name', 'minutes_relative_to_session', 'meal_authenticity_compass',
      'is_meal_adulterated', 'prandial_status', 'confounder_level',
      'methodological_note'
    ];
    const rows = sessions.map(s => [
      s.sessionId, s.dataSource, s.timestamp, s.sessionType, s.durationSeconds,
      s.rmssdBefore ?? 'NA', s.rmssdAfter ?? 'NA', s.deltaRmssd ?? 'NA',
      s.anxietyBefore ?? 'NA', s.anxietyAfter ?? 'NA',
      s.lastMeal ? '1' : '0',
      s.lastMeal ? `"${s.lastMeal.productName.replace(/"/g, '""')}"` : '""',
      s.lastMeal ? s.lastMeal.minutesRelativeToSession : 'NA',
      s.lastMeal ? s.lastMeal.compass : 'NA',
      s.lastMeal ? (s.lastMeal.isAdulterated ? '1' : '0') : '0',
      s.prandialStatus, s.confounderLevel,
      `"${s.methodologicalNote.replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public static exportToJSON(
    sessions: PairedClinicalSession[],
    options: { allowSynthetic?: boolean; provenance?: Provenance } = {}
  ): string {
    this.assertExportable(sessions, options.allowSynthetic ?? false);

    const payload = {
      protocol: 'XZenPress — Correlação Prandial/Autonômica N-of-1',
      // Preenchido apenas quando fornecido explicitamente pelo chamador.
      // Nunca hardcoded com nome de pessoa ou instituição não formalizada.
      provenance: options.provenance ?? {},
      generatedAt: new Date().toISOString(),
      standards: ['FAIR Data Principles', 'LGPD Art. 20'],
      summary: {
        totalSessions: sessions.length,
        syntheticSessionsCount: sessions.filter(s => s.dataSource !== 'real').length,
        cleanBaselineSessions: sessions.filter(s => s.prandialStatus === 'fasting_baseline').length,
        confoundedSessions: sessions.filter(s => s.confounderLevel === 'critical_adulteration').length
      },
      sessions
    };
    return JSON.stringify(payload, null, 2);
  }

  public static exportDossierReport(
    sessions: PairedClinicalSession[],
    options: { allowSynthetic?: boolean } = {}
  ): string {
    this.assertExportable(sessions, options.allowSynthetic ?? false);

    const cleanCount = sessions.filter(s => s.prandialStatus === 'fasting_baseline').length;
    const syntheticCount = sessions.filter(s => s.dataSource !== 'real').length;

    return `# Correlação Prandial/Autonômica N-of-1
**Data de Emissão:** ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
${syntheticCount > 0 ? `\n⚠️ **${syntheticCount} de ${sessions.length} sessões são dados de DEMONSTRAÇÃO (dataSource: synthetic_demo), não observações reais.**\n` : ''}
---
### 1. Resumo Executivo da Série
* **Total de Sessões:** ${sessions.length}
* **Sessões em Linha de Base (jejum >3h):** ${cleanCount} de ${sessions.length}
* **Sessões Sintéticas/Demo:** ${syntheticCount}
### 2. Tabela de Sessões Pareadas
| Sessão | Origem | Data/Hora | Δ RMSSD (ms) | Ansiedade (Pré→Pós) | Refeição Próxima | Janela Prandial | Confundidor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${sessions.map(s => `| ${s.sessionId} | ${s.dataSource} | ${new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} | ${s.deltaRmssd === null ? 'NA' : (s.deltaRmssd >= 0 ? '+' : '') + s.deltaRmssd + ' ms'} | ${s.anxietyBefore ?? 'NA'} → ${s.anxietyAfter ?? 'NA'} | ${s.lastMeal ? s.lastMeal.productName : 'Jejum (>3h)'} | ${s.prandialStatus} | ${s.confounderLevel} |`).join('\n')}
---
*Emitido por XZenPress — ver campo \`provenance\` em exportToJSON para atribuição formal.*
`;
  }
}
