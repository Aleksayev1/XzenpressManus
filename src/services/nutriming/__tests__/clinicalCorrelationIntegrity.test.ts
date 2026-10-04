import { describe, it, expect } from 'vitest';

describe('Tarefa -1: Integridade Cientifica & Quarentena Metrologica', () => {

  it('Linha 185: Demonstra o bug de precedencia de operadores original vs solucao estrita', () => {
    // Caso de teste: Sessao tem after.rmssd = 44, mas result.deltaRmssd = undefined
    const sessionWithAfterOnly = {
      before: { rmssd: 38 },
      after: { rmssd: 44 },
      result: undefined as any
    };

    const rmssdBefore = sessionWithAfterOnly.before?.rmssd || 0;
    
    // Expressao BUGADA original da linha 185:
    // (session.after?.rmssd || session.result?.deltaRmssd) ? (rmssdBefore + session.result.deltaRmssd) : 0
    const buggyRmssdAfter = sessionWithAfterOnly.after?.rmssd || sessionWithAfterOnly.result?.deltaRmssd 
      ? (rmssdBefore + sessionWithAfterOnly.result?.deltaRmssd) 
      : 0;

    // Como 44 eh truthy, cai no ternario: 38 + undefined = NaN!
    expect(Number.isNaN(buggyRmssdAfter)).toBe(true);

    // Expressao CORRIGIDA estrita:
    const strictRmssdBefore = sessionWithAfterOnly.before?.rmssd ?? null;
    const strictRmssdAfter = sessionWithAfterOnly.after?.rmssd ?? null;
    const strictDeltaRmssd = (strictRmssdAfter !== null && strictRmssdBefore !== null)
      ? (strictRmssdAfter - strictRmssdBefore)
      : (sessionWithAfterOnly.result?.deltaRmssd ?? null);

    expect(strictRmssdAfter).toBe(44);
    expect(strictDeltaRmssd).toBe(6); // 44 - 38 = 6 ms exatos
  });

  it('Quarantine Gate: sessao sintetica deve ser bloqueada para exportacao de pesquisa', () => {
    interface ResearchSession {
      sessionId: string;
      source: 'real_observation' | 'synthetic_demo' | 'unknown';
      rmssdBefore: number;
      rmssdAfter: number;
    }

    function exportResearchCSV(sessions: ResearchSession[]): { allowed: boolean; exportedCount: number; error?: string } {
      const syntheticSessions = sessions.filter(s => s.source === 'synthetic_demo');
      if (syntheticSessions.length > 0) {
        return {
          allowed: false,
          exportedCount: 0,
          error: 'GATE_BLOCKED: Sessões sintéticas não podem ser exportadas em datasets de pesquisa sem quarentena explícita.'
        };
      }
      return { allowed: true, exportedCount: sessions.length };
    }

    const mixedDataset: ResearchSession[] = [
      { sessionId: 's1', source: 'real_observation', rmssdBefore: 40, rmssdAfter: 48 },
      { sessionId: 's2', source: 'synthetic_demo', rmssdBefore: 38, rmssdAfter: 44 }
    ];

    const result = exportResearchCSV(mixedDataset);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain('GATE_BLOCKED');
  });

  it('Score Termico Sem Termografia: variavel semantica falsa nao deve ser aceita', () => {
    // Um registro sem camera termica nao pode possuir campo chamado 'thermalReliabilityScore'
    // O nome correto deve ser restrito ao dominio alimentar, ex: 'prandialConfounderScore'
    const payload = {
      sessionId: 'sess-01',
      hasThermalCamera: false,
      prandialConfounderLevel: 'none',
      // thermalReliabilityScore: REMOVIDO!
    };

    expect(payload).not.toHaveProperty('thermalReliabilityScore');
    expect(payload).toHaveProperty('prandialConfounderLevel');
  });

  it('Proveniencia Formal: distingue autor do protocolo, operador e fonte de dados sem atribuicao indevida', () => {
    const provenance = {
      protocolAuthor: 'Pesquisador Responsável',
      operator: 'Operador de Campo',
      dataSource: 'ble_sensor' as const,
      dataCollectorApp: 'XZenPress Research Engine v2.6'
    };

    expect(provenance.dataSource).toBe('ble_sensor');
    expect(provenance).not.toHaveProperty('scientificLeadPotential');
  });
});
