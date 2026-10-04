/**
 * kubiosExportService — Serviço Metrológico de Exportação Kubios HRV & Manifesto SHA-256
 * ======================================================================================
 * Arquitetura de 4 Camadas (Auditada por Claude Sonnet, ChatGPT e Grok 4.1 Reasoning):
 *
 * 1. Camada A (Raw): Consome RawRRSample[] do useBLEHeartRate sem alterar ou filtrar a aquisição.
 * 2. Camada B (Provenance): Metadados formais de sessão, sensor, software (2.6.0) e timestamps UTC.
 * 3. Camada C (Quality Metadata): Classificação de validade fisiológica (300–2000 ms) e status de contato.
 *    Regra de Ouro: contactStatus é metadado contextual e NUNCA exclusão automática de RR.
 * 4. Camada D (Exportação Dual e Canônica):
 *    - <session>_rr_series_ms.txt: 100% da série bruta em ms, uma por linha (LF \n universal).
 *    - <session>_rr_cleaned_ms.txt: série filtrada documentada (produto analítico secundário).
 *    - <session>_manifest.json: manifesto XZEN-RR-1.0 com SHA-256 determinístico dos bytes UTF-8.
 *
 * Invariante Metrológico: O exportador NUNCA altera, interpola ou reordena a aquisição.
 * Ele apenas representa, classifica e exporta o que o hardware entregou.
 */

import { RawRRSample, ContactStatus } from '../../hooks/useBLEHeartRate';

// ─── Tipos e Interfaces ───────────────────────────────────────────────────────

export interface ExportProvenance {
  sessionId?: string;
  deviceName?: string | null;
  startTimeUtc?: string;
  endTimeUtc?: string;
  durationSeconds?: number;
}

export interface SampleQualityClassification {
  sequence: number;
  raw1024: number;
  rr_ms: number;
  validity: 'valid' | 'out_of_range';
  contact_status: ContactStatus;
  received_at: number;
}

export interface XzenRRManifest {
  export_schema: 'XZEN-RR-1.0';
  software: {
    name: 'XZenPress';
    version: string;
  };
  provenance: {
    session_id: string;
    device_name: string | null;
    start_time_utc: string | null;
    end_time_utc: string | null;
    duration_seconds: number | null;
    exported_at_utc: string;
  };
  integrity: {
    algorithm: 'SHA-256';
    canonical_format: 'utf8_single_column_ms_newline_separated';
    series_sha256: string;
    cleaned_sha256: string | null;
    import_instructions_pt: string;
  };
  quality_summary: {
    total_raw_samples: number;
    valid_samples: number;
    out_of_range_samples: number;
    contact_breakdown: {
      supported_contact: number;
      supported_no_contact: number;
      not_supported: number;
    };
  };
  cleaning: {
    performed: boolean;
    method: 'XZEN-RR-QC-1.0';
    rules: string[];
  };
  samples_quality_classification: SampleQualityClassification[];
}

export interface KubiosExportResult {
  seriesFilename: string;
  seriesContent: string;
  seriesSha256: string;
  cleanedFilename: string;
  cleanedContent: string;
  cleanedSha256: string | null;
  manifestFilename: string;
  manifestContent: string;
  manifest: XzenRRManifest;
}

// ─── Utilitários Criptográficos e Canônicos ───────────────────────────────────

/**
 * Converte a série RR para formato canônico de texto puro em milissegundos.
 * Formato universal para Kubios HRV, Python e R:
 * - 1 valor inteiro em ms por linha
 * - Terminação estrita com '\n' Unix (LF)
 */
export function canonicalizeRRSeries(samples: RawRRSample[]): string {
  if (samples.length === 0) return '';
  // Garante ordenação monotônica por sequence
  const sorted = [...samples].sort((a, b) => a.sequence - b.sequence);
  return sorted.map(s => `${Math.round(s.ms)}\n`).join('');
}

/**
 * Calcula o hash SHA-256 em formato hexadecimal de 64 caracteres em minúsculas
 * diretamente sobre os bytes UTF-8 exatos do texto.
 */
export async function computeSha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  try {
    const cryptoModule = await import('crypto');
    return cryptoModule.createHash('sha256').update(data).digest('hex');
  } catch {
    throw new Error('Ambiente criptográfico seguro (Web Crypto / Node Crypto) não disponível para cálculo de SHA-256.');
  }
}

/**
 * Gera um identificador único de sessão (UUID v4) seguro.
 */
export function generateSessionId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Serviço de Exportação ───────────────────────────────────────────────────

/**
 * Exporta a sessão capturada para o padrão Kubios HRV e gera o manifesto de integridade.
 *
 * @param samples Série contínua de amostras brutas obtida de getSessionRR()
 * @param provenance Metadados opcionais de proveniência da sessão
 * @throws Error se a lista de amostras for vazia (rejeita exportação corrompida)
 */
export async function exportKubiosSession(
  samples: RawRRSample[],
  provenance?: ExportProvenance
): Promise<KubiosExportResult> {
  if (!samples || samples.length === 0) {
    throw new Error('Não é possível exportar uma sessão vazia: nenhuma amostra RR foi capturada.');
  }

  // 1. Ordenação segura monotônica
  const orderedSamples = [...samples].sort((a, b) => a.sequence - b.sequence);

  // 2. Camada D: Geração da Série RR Canônica Completa (100% dos batimentos)
  const seriesContent = canonicalizeRRSeries(orderedSamples);
  const seriesSha256 = await computeSha256(seriesContent);

  // 3. Camada C: Classificação de Qualidade Amostra por Amostra
  // Regra metrológica: contactStatus é metadado, NÃO exclusão fisiológica.
  let validCount = 0;
  let outOfRangeCount = 0;
  let supportedContactCount = 0;
  let supportedNoContactCount = 0;
  let notSupportedContactCount = 0;

  const validCleanedSamples: RawRRSample[] = [];
  const samplesClassification: SampleQualityClassification[] = orderedSamples.map(sample => {
    const isValid = sample.ms >= 300 && sample.ms <= 2000;
    if (isValid) {
      validCount++;
      validCleanedSamples.push(sample);
    } else {
      outOfRangeCount++;
    }

    if (sample.contactStatus === 'supported_contact') {
      supportedContactCount++;
    } else if (sample.contactStatus === 'supported_no_contact') {
      supportedNoContactCount++;
    } else {
      notSupportedContactCount++;
    }

    return {
      sequence: sample.sequence,
      raw1024: sample.raw1024,
      rr_ms: sample.ms,
      validity: isValid ? 'valid' : 'out_of_range',
      contact_status: sample.contactStatus,
      received_at: sample.receivedAt,
    };
  });

  // 4. Camada D: Série Filtrada (Produto Analítico Secundário)
  const cleanedContent = canonicalizeRRSeries(validCleanedSamples);
  const cleanedSha256 = cleanedContent.length > 0 ? await computeSha256(cleanedContent) : null;

  // 5. Camada B: Proveniência e Identificação
  const sessionId = provenance?.sessionId || generateSessionId();
  const safeIdShort = sessionId.slice(0, 8);
  const startTime = provenance?.startTimeUtc || new Date(orderedSamples[0].receivedAt).toISOString();
  const endTime = provenance?.endTimeUtc || new Date(orderedSamples[orderedSamples.length - 1].receivedAt).toISOString();

  const startEpoch = new Date(startTime).getTime();
  const endEpoch = new Date(endTime).getTime();
  const durationSeconds =
    provenance?.durationSeconds ??
    (endEpoch > startEpoch ? Math.round((endEpoch - startEpoch) / 1000) : 0);

  const exportedAtUtc = new Date().toISOString();

  // Nomenclatura metrológica recomendada pelo ChatGPT e Grok:
  // prefixo XZEN + data ISO sanitizada + shortId + sufixo
  const datePrefix = startTime.slice(0, 19).replace(/[:T]/g, '-');
  const seriesFilename = `XZEN_${datePrefix}_${safeIdShort}_rr_series_ms.txt`;
  const cleanedFilename = `XZEN_${datePrefix}_${safeIdShort}_rr_cleaned_ms.txt`;
  const manifestFilename = `XZEN_${datePrefix}_${safeIdShort}_manifest.json`;

  // 6. Manifesto Criptográfico XZEN-RR-1.0
  const manifest: XzenRRManifest = {
    export_schema: 'XZEN-RR-1.0',
    software: {
      name: 'XZenPress',
      version: '2.6.0',
    },
    provenance: {
      session_id: sessionId,
      device_name: provenance?.deviceName ?? null,
      start_time_utc: startTime,
      end_time_utc: endTime,
      duration_seconds: durationSeconds,
      exported_at_utc: exportedAtUtc,
    },
    integrity: {
      algorithm: 'SHA-256',
      canonical_format: 'utf8_single_column_ms_newline_separated',
      series_sha256: seriesSha256,
      cleaned_sha256: cleanedSha256,
      import_instructions_pt:
        'Ao abrir este arquivo no Kubios HRV, use File > Open > Custom Type. Na caixa de diálogo de importação, defina manualmente a unidade da coluna como MILISSEGUNDOS (ms). O carregamento rápido/padrão do Kubios assume segundos por padrão (ex.: 0.812) e, se a unidade não for ajustada, o tacograma resultante estará incorreto por um fator de 1000.',
    },
    quality_summary: {
      total_raw_samples: orderedSamples.length,
      valid_samples: validCount,
      out_of_range_samples: outOfRangeCount,
      contact_breakdown: {
        supported_contact: supportedContactCount,
        supported_no_contact: supportedNoContactCount,
        not_supported: notSupportedContactCount,
      },
    },
    cleaning: {
      performed: true,
      method: 'XZEN-RR-QC-1.0',
      rules: [
        'RR < 300 ms excluded (physiologically implausible tachycardia/artifact)',
        'RR > 2000 ms excluded (physiologically implausible bradycardia/pause/dropped packet)',
      ],
    },
    samples_quality_classification: samplesClassification,
  };

  const manifestContent = JSON.stringify(manifest, null, 2);

  return {
    seriesFilename,
    seriesContent,
    seriesSha256,
    cleanedFilename,
    cleanedContent,
    cleanedSha256,
    manifestFilename,
    manifestContent,
    manifest,
  };
}
