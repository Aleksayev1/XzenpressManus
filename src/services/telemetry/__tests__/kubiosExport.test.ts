import { describe, it, expect } from 'vitest';
import {
  exportKubiosSession,
  canonicalizeRRSeries,
  computeSha256,
} from '../kubiosExportService';
import { RawRRSample } from '../../../hooks/useBLEHeartRate';

describe('kubiosExportService — Bateria Metrológica da Tarefa 2', () => {

  // Amostras de teste simulando aquisição real
  const makeSample = (seq: number, ms: number, contact: 'supported_contact' | 'supported_no_contact' = 'supported_contact'): RawRRSample => ({
    sequence: seq,
    raw1024: Math.round((ms / 1000) * 1024),
    ms,
    receivedAt: 1700000000000 + seq * 800,
    contactStatus: contact,
  });

  // ── 1. Proteção de Fronteira e Erro Explícito ─────────────────────────────

  it('1.1. Sessão Vazia: rejeita com erro explícito sem gerar arquivo corrompido', async () => {
    await expect(exportKubiosSession([])).rejects.toThrow(
      'Não é possível exportar uma sessão vazia'
    );
  });

  // ── 2. Formato Canônico Universal Kubios ──────────────────────────────────

  it('2.1. Formato Canônico: gera valores em ms, um por linha, com quebra LF Unix (\\n)', () => {
    const samples: RawRRSample[] = [
      makeSample(0, 800),
      makeSample(1, 812),
      makeSample(2, 795),
    ];

    const canonical = canonicalizeRRSeries(samples);
    expect(canonical).toBe('800\n812\n795\n');
    // Garante que não há carriage return (\r) do Windows poluindo o arquivo
    expect(canonical.includes('\r')).toBe(false);
  });

  it('2.2. Ordenação Monotônica: preserva e força a ordem estrita de sequence', () => {
    // Amostras fora de ordem de array
    const samples: RawRRSample[] = [
      makeSample(2, 795),
      makeSample(0, 800),
      makeSample(1, 812),
    ];

    const canonical = canonicalizeRRSeries(samples);
    expect(canonical).toBe('800\n812\n795\n');
  });

  // ── 3. Determinismo e Auditabilidade Criptográfica (SHA-256) ───────────────

  it('3.1. SHA-256 Determinístico: produz hash exato sobre os bytes UTF-8 canônicos', async () => {
    const samples: RawRRSample[] = [
      makeSample(0, 1000),
      makeSample(1, 1000),
    ];
    // Conteúdo canônico exato: "1000\n1000\n"
    const content = canonicalizeRRSeries(samples);
    const hash = await computeSha256(content);

    // O hash SHA-256 de "1000\n1000\n" é universalmente verificável via terminal / Python:
    // echo -n -e "1000\n1000\n" | sha256sum
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe('b36f81c2111c9b77fd090a20474d46035b35c0888cf80050dbf98fb35cd94250');
  });

  // ── 4. Regra de Ouro Metrológica: contactStatus NÃO é exclusão de RR ───────

  it('4.1. Preservação de contactStatus: no_contact permanece na série e NÃO é descartado', async () => {
    const samples: RawRRSample[] = [
      makeSample(0, 800, 'supported_contact'),
      makeSample(1, 810, 'supported_no_contact'), // Sem contato detectado, mas batimento emitido
      makeSample(2, 820, 'supported_contact'),
    ];

    const result = await exportKubiosSession(samples, {
      deviceName: 'Polar H10 Test',
      sessionId: 'test-session-uuid-1234',
    });

    // Ambas as séries mantêm as 3 amostras íntegras!
    expect(result.seriesContent).toBe('800\n810\n820\n');
    expect(result.cleanedContent).toBe('800\n810\n820\n');

    // Metadados registram a qualidade sem decisão arbitrária de descarte
    expect(result.manifest.quality_summary.valid_samples).toBe(3);
    expect(result.manifest.quality_summary.contact_breakdown.supported_no_contact).toBe(1);
    expect(result.manifest.quality_summary.contact_breakdown.supported_contact).toBe(2);

    const sample1 = result.manifest.samples_quality_classification[1];
    expect(sample1.validity).toBe('valid');
    expect(sample1.contact_status).toBe('supported_no_contact');
  });

  // ── 5. Série Bruta vs. Produto Analítico Filtrado (_cleaned) ──────────────

  it('5.1. Desacoplamento Raw vs Cleaned: amostras implausíveis são preservadas no raw e filtradas no cleaned', async () => {
    const samples: RawRRSample[] = [
      makeSample(0, 800),
      makeSample(1, 250),  // < 300ms: implausível
      makeSample(2, 820),
      makeSample(3, 2200), // > 2000ms: implausível
      makeSample(4, 840),
    ];

    const result = await exportKubiosSession(samples);

    // Série bruta contém 100% dos batimentos:
    expect(result.seriesContent).toBe('800\n250\n820\n2200\n840\n');

    // Série analítica limpa exclui os extremos com documentação:
    expect(result.cleanedContent).toBe('800\n820\n840\n');

    // Manifesto documenta detalhadamente as contagens:
    expect(result.manifest.quality_summary.total_raw_samples).toBe(5);
    expect(result.manifest.quality_summary.valid_samples).toBe(3);
    expect(result.manifest.quality_summary.out_of_range_samples).toBe(2);

    expect(result.manifest.cleaning.rules.length).toBe(2);
  });

  // ── 6. Conformidade com o Esquema XZEN-RR-1.0 ─────────────────────────────

  it('6.1. Manifesto XZEN-RR-1.0: estrutura completa e auditabilidade bidirecional', async () => {
    const samples: RawRRSample[] = [
      makeSample(0, 850),
      makeSample(1, 860),
    ];

    const result = await exportKubiosSession(samples, {
      sessionId: '12345678-abcd-ef01-2345-6789abcdef01',
      deviceName: 'Polar H10 1A2B3C',
      startTimeUtc: '2026-10-03T22:00:00.000Z',
      endTimeUtc: '2026-10-03T22:05:00.000Z',
      durationSeconds: 300,
    });

    const m = result.manifest;
    expect(m.export_schema).toBe('XZEN-RR-1.0');
    expect(m.software.name).toBe('XZenPress');
    expect(m.software.version).toBe('2.6.0');
    expect(m.provenance.session_id).toBe('12345678-abcd-ef01-2345-6789abcdef01');
    expect(m.provenance.device_name).toBe('Polar H10 1A2B3C');
    expect(m.provenance.duration_seconds).toBe(300);

    // Integridade bidirecional: os hashes no manifesto batem com os arquivos gerados
    expect(m.integrity.series_sha256).toBe(result.seriesSha256);
    expect(m.integrity.cleaned_sha256).toBe(result.cleanedSha256);
    expect(m.integrity.import_instructions_pt).toContain('MILISSEGUNDOS (ms)');

    // Nomenclatura metrológica contém prefixo XZEN, data e shortId
    expect(result.seriesFilename).toContain('XZEN_2026-10-03-22-00-00_12345678_rr_series_ms.txt');
    expect(result.cleanedFilename).toContain('XZEN_2026-10-03-22-00-00_12345678_rr_cleaned_ms.txt');
    expect(result.manifestFilename).toContain('XZEN_2026-10-03-22-00-00_12345678_manifest.json');
  });
});
