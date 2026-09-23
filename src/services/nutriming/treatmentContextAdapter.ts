import { UserStateVector, TreatmentContext } from '../../types/nutriming';

export class TreatmentContextAdapter {
  /**
   * Constrói o vetor de estado do usuário (UserStateVector) a partir dos dados do ZenCheckin,
   * VFC e anamnese já armazenados no dispositivo.
   */
  public static getUserStateVector(): UserStateVector {
    let heat = 1;
    let cold = 1;
    let qiDeficiency = 1;
    let yinDeficiency = 1;
    let dampness = 1;
    let stagnation = 1;
    let tension = 1;
    let sleepDebt = 1;

    try {
      // 1. Ler último ZenCheckin
      const checkinRaw = localStorage.getItem('xzen_latest_zencheckin') || localStorage.getItem('last_checkin_data');
      if (checkinRaw) {
        const checkin = JSON.parse(checkinRaw);
        if (checkin.stressLevel >= 4 || checkin.mood === 'irritated' || checkin.mood === 'anxious') {
          heat += 2;
          tension += 2;
        }
        if (checkin.energyLevel <= 2 || checkin.fatigue) {
          qiDeficiency += 2;
        }
        if (checkin.sleepQuality <= 2 || checkin.sleepHours < 6) {
          sleepDebt += 3;
          yinDeficiency += 1;
        }
        if (checkin.bloated || checkin.digestion === 'heavy') {
          dampness += 2;
        }
      }

      // 2. Ler VFC atual
      const vfcRaw = localStorage.getItem('xzen_vfc_current');
      if (vfcRaw) {
        const vfc = Number(vfcRaw);
        if (vfc < 35) { // VFC baixo = sistema simpático/luta ou fuga ativado
          tension += 2;
          heat += 1;
        }
      }
    } catch (e) {
      // Fallback seguro em caso de parse error
    }

    return {
      heat: Math.min(5, heat),
      cold: Math.min(5, cold),
      qiDeficiency: Math.min(5, qiDeficiency),
      yinDeficiency: Math.min(5, yinDeficiency),
      dampness: Math.min(5, dampness),
      stagnation: Math.min(5, stagnation),
      tension: Math.min(5, tension),
      sleepDebt: Math.min(5, sleepDebt)
    };
  }

  /**
   * Constrói o TreatmentContext a partir de protocolos ativos do ZenMentor ou Acupressão.
   */
  public static getTreatmentContext(): TreatmentContext {
    const activeTreatments: string[] = [];
    const activeAcupoints: string[] = [];
    const avoidFlags: string[] = [];

    try {
      // 1. Protocolo de Acupressão ativo ou sessão do ZenMentor
      const activeProto = localStorage.getItem('xzen_active_protocol');
      if (activeProto) {
        const parsed = JSON.parse(activeProto);
        if (parsed.name) activeTreatments.push(parsed.name);
        if (parsed.points && Array.isArray(parsed.points)) {
          activeAcupoints.push(...parsed.points);
        }
      }

      // 1.1 Ler última queixa/protocolo do ZenMentor (Princípio da Retomada)
      const lastSessionCtxRaw = localStorage.getItem('xzen_last_session_context');
      if (lastSessionCtxRaw) {
        const lastCtx = JSON.parse(lastSessionCtxRaw);
        if (lastCtx.queixa) {
          const q = lastCtx.queixa.toLowerCase();
          if (q.includes('ansiedade') || q.includes('estresse') || q.includes('insônia') || q.includes('sono') || q.includes('nervos')) {
            activeTreatments.push('Controle de Ansiedade e Sono (ZenMentor)');
            avoidFlags.push('evitar_estimulantes');
            activeAcupoints.push('F3', 'PC6');
          } else if (q.includes('estômago') || q.includes('digest') || q.includes('barriga') || q.includes('estufad') || q.includes('peso')) {
            activeTreatments.push('Harmonização Digestiva (ZenMentor)');
            avoidFlags.push('evitar_gelados', 'evitar_laticinios');
            activeAcupoints.push('E36', 'BP6');
          }
        }
      }

      // 2. Anamnese dos 5 Guardiões (se houver elemento fraco)
      const anamneseRaw = localStorage.getItem('xzen_anamnese_profile');
      if (anamneseRaw) {
        const profile = JSON.parse(anamneseRaw);
        if (profile.weakGuardian) {
          if (profile.weakGuardian === 'fire') {
            activeTreatments.push('Harmonização do Coração / Ansiedade');
            avoidFlags.push('evitar_estimulantes');
          } else if (profile.weakGuardian === 'wood') {
            activeTreatments.push('Acalmar o Fogo do Fígado / Tensão');
            avoidFlags.push('evitar_picantes', 'evitar_alcool');
          } else if (profile.weakGuardian === 'earth') {
            activeTreatments.push('Tonificação do Baço / Digestão');
            avoidFlags.push('evitar_gelados', 'evitar_laticinios');
          }
        }
      }
    } catch {
      // Fallback seguro
    }

    // Se nenhum tratamento foi registrado, adicionar padrão de bem-estar geral
    if (activeTreatments.length === 0) {
      activeTreatments.push('Equilíbrio Geral e Vitalidade');
    }

    return {
      activeTreatments,
      activeAcupoints,
      avoidFlags
    };
  }
}
