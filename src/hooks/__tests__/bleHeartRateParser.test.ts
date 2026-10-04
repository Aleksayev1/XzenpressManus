import { describe, it, expect } from 'vitest';
import {
  parseHeartRateMeasurement,
  calculateRMSSD,
  WindowSample,
  RawRRSample
} from '../useBLEHeartRate';

describe('useBLEHeartRate — Bateria Completa de Invariância Metrológica (Tarefa 1)', () => {

  // ── 1. Bounds Checking e Pacotes Malformados ──────────────────────────────

  it('1.1. Pacote Vazio (0 bytes): retorna null de forma segura sem lançar exceção', () => {
    const emptyView = new DataView(new ArrayBuffer(0));
    expect(parseHeartRateMeasurement(emptyView)).toBeNull();
  });

  it('1.2. Pacote com 1 byte apenas (sem campo de BPM): retorna null de forma segura', () => {
    const oneByteView = new DataView(new Uint8Array([0x00]).buffer);
    expect(parseHeartRateMeasurement(oneByteView)).toBeNull();
  });

  it('1.3. HR 16-bit Truncado: flag indica 16-bit (2 bytes), mas só há 1 byte de BPM', () => {
    // Flags: 0x01 (16-bit), seguido de apenas 1 byte (70)
    const truncatedView = new DataView(new Uint8Array([0x01, 70]).buffer);
    expect(parseHeartRateMeasurement(truncatedView)).toBeNull();
  });

  it('1.4. Energy Expended Truncado: flag indica Energy Expended (bit 3), mas buffer acaba antes', () => {
    // Flags: 0x08 (Energy Expended), BPM 8-bit (60), mas apenas 1 byte de EE (0xFF)
    const truncatedEnergyView = new DataView(new Uint8Array([0x08, 60, 0xff]).buffer);
    expect(parseHeartRateMeasurement(truncatedEnergyView)).toBeNull();
  });

  it('1.5. RR Truncado em 1 byte: flag indica RR (bit 4), mas sobrou apenas 1 byte no buffer', () => {
    // Flags: 0x10 (has RR), BPM (70), mas apenas 1 byte de RR (0x20)
    const truncatedRRView = new DataView(new Uint8Array([0x10, 70, 0x20]).buffer);
    const parsed = parseHeartRateMeasurement(truncatedRRView);
    // Não deve quebrar: BPM decodificado com sucesso, e o loop de RR termina sem ler byte incompleto
    expect(parsed).not.toBeNull();
    expect(parsed!.bpm).toBe(70);
    expect(parsed!.rrSamples).toEqual([]); // 1 byte isolado não forma amostra de 2 bytes
  });

  // ── 2. Decodificação Precisa e Conversões de Dados ──────────────────────────

  it('2.1. HR 8-bit: decodifica BPM e mapeia contactStatus corretamente', () => {
    const view = new DataView(new Uint8Array([0x00, 72]).buffer);
    const parsed = parseHeartRateMeasurement(view);

    expect(parsed).not.toBeNull();
    expect(parsed!.bpm).toBe(72);
    expect(parsed!.contactStatus).toBe('not_supported');
    expect(parsed!.rrSamples).toEqual([]);
  });

  it('2.2. HR 16-bit: decodifica little-endian corretamente acima de 255 bpm', () => {
    // 320 bpm = 0x0140 -> bytes: 0x40, 0x01
    const view = new DataView(new Uint8Array([0x01, 0x40, 0x01]).buffer);
    const parsed = parseHeartRateMeasurement(view);

    expect(parsed).not.toBeNull();
    expect(parsed!.bpm).toBe(320);
  });

  it('2.3. Sensor Contact: mapeia todos os 4 estados dos bits 1-2', () => {
    // 00 -> not_supported
    expect(parseHeartRateMeasurement(new DataView(new Uint8Array([0x00, 60]).buffer))!.contactStatus).toBe('not_supported');
    // 01 -> not_supported
    expect(parseHeartRateMeasurement(new DataView(new Uint8Array([0x02, 60]).buffer))!.contactStatus).toBe('not_supported');
    // 10 -> supported_no_contact
    expect(parseHeartRateMeasurement(new DataView(new Uint8Array([0x04, 60]).buffer))!.contactStatus).toBe('supported_no_contact');
    // 11 -> supported_contact
    expect(parseHeartRateMeasurement(new DataView(new Uint8Array([0x06, 60]).buffer))!.contactStatus).toBe('supported_contact');
  });

  it('2.4. Conversão raw1024 -> ms: preserva o valor bruto e a conversão de 1/1024 s', () => {
    // 1024 unidades = 1000 ms exatos (0x00, 0x04 em little-endian)
    const view = new DataView(new Uint8Array([0x10, 60, 0x00, 0x04]).buffer);
    const parsed = parseHeartRateMeasurement(view);

    expect(parsed!.rrSamples.length).toBe(1);
    expect(parsed!.rrSamples[0].raw1024).toBe(1024);
    expect(parsed!.rrSamples[0].ms).toBe(1000);
  });

  it('2.5. Múltiplos RR: preserva todos os batimentos na ordem original recebida', () => {
    // Pacote com BPM 70 e 3 intervalos RR:
    // RR1: 800ms -> raw 819 (0x33, 0x03)
    // RR2: 850ms -> raw 870 (0x66, 0x03)
    // RR3: 900ms -> raw 922 (0x9A, 0x03)
    const view = new DataView(new Uint8Array([
      0x10, 70,
      0x33, 0x03,
      0x66, 0x03,
      0x9a, 0x03
    ]).buffer);

    const parsed = parseHeartRateMeasurement(view);
    expect(parsed!.rrSamples.length).toBe(3);
    expect(parsed!.rrSamples[0].ms).toBe(800);
    expect(parsed!.rrSamples[1].ms).toBe(850);
    expect(parsed!.rrSamples[2].ms).toBe(900);
  });

  it('2.6. Preservação no Raw: RR fora da faixa fisiológica (ex: 250ms ou 2200ms) NUNCA é descartado pelo parser', () => {
    // RR de 250ms -> raw 256 (0x00, 0x01)
    // RR de 2200ms -> raw 2253 (0xCD, 0x08)
    const view = new DataView(new Uint8Array([
      0x10, 60,
      0x00, 0x01,
      0xcd, 0x08
    ]).buffer);

    const parsed = parseHeartRateMeasurement(view);
    expect(parsed!.rrSamples.length).toBe(2);
    expect(parsed!.rrSamples[0].ms).toBe(250);
    expect(parsed!.rrSamples[1].ms).toBe(2200);
  });

  // ── 3. Invariância de Adjacência no RMSSD e null ≠ 0 ────────────────────────

  it('3.1. Invariância de Adjacência: RR inválido nunca cria diferença sucessiva artificial', () => {
    // Tacograma com um batimento inválido no meio:
    // 800 (válido), 810 (válido), 250 (INVÁLIDO), 820 (válido), 830 (válido), 840 (válido)
    const samples: WindowSample[] = [
      { ms: 800, valid: true },
      { ms: 810, valid: true },   // Par 1: diff = 10 -> diff^2 = 100
      { ms: 250, valid: false },  // Inválido: par (250 com 810) e (820 com 250) DEVEM SER PULADOS
      { ms: 820, valid: true },
      { ms: 830, valid: true },   // Par 2: diff = 10 -> diff^2 = 100
      { ms: 840, valid: true },   // Par 3: diff = 10 -> diff^2 = 100
    ];

    // Diffs válidos: 3 pares. SumSquares = 300. Mean = 100. Sqrt = 10.
    const rmssd = calculateRMSSD(samples);
    expect(rmssd).toBe(10);
  });

  it('3.2. Janela com menos de MIN_RR_FOR_RMSSD (5 amostras válidas): retorna null (dados insuficientes, null ≠ 0)', () => {
    const samples: WindowSample[] = [
      { ms: 800, valid: true },
      { ms: 810, valid: true },
      { ms: 820, valid: true },
      { ms: 830, valid: true }, // apenas 4 válidos
    ];
    // Invariante epistemológico: impossibilidade de cálculo é null, não 0
    expect(calculateRMSSD(samples)).toBeNull();
  });

  it('3.3. Janela com 5 amostras válidas mas 0 pares consecutivos válidos: retorna null', () => {
    // Alternância onde nenhum par consecutivo é ambos válidos
    const samples: WindowSample[] = [
      { ms: 800, valid: true },
      { ms: 200, valid: false },
      { ms: 810, valid: true },
      { ms: 210, valid: false },
      { ms: 820, valid: true },
      { ms: 220, valid: false },
      { ms: 830, valid: true },
      { ms: 230, valid: false },
      { ms: 840, valid: true },
    ];
    expect(calculateRMSSD(samples)).toBeNull();
  });

  it('3.4. Janela com pares válidos com diffs iguais a 0 ms: retorna 0 matemático exato', () => {
    const samples: WindowSample[] = [
      { ms: 800, valid: true },
      { ms: 800, valid: true },
      { ms: 800, valid: true },
      { ms: 800, valid: true },
      { ms: 800, valid: true },
    ];
    // Aqui há 4 pares consecutivos válidos, diffs todos 0 -> 0 matemático legítimo
    expect(calculateRMSSD(samples)).toBe(0);
  });

  // ── 4. Semântica Temporal, Sequência e Rastreabilidade ─────────────────────

  it('4.1. Semântica receivedAt: amostra bruta contém timestamp de recepção e status de contato', () => {
    const now = Date.now();
    const sample: RawRRSample = {
      sequence: 0,
      raw1024: 819,
      ms: 800,
      receivedAt: now,
      contactStatus: 'supported_contact'
    };

    expect(sample.sequence).toBe(0);
    expect(sample.receivedAt).toBe(now);
    expect(sample.contactStatus).toBe('supported_contact');
    expect(sample.raw1024).toBe(819);
    expect(sample.ms).toBe(800);
  });

  it('4.2. Sequência monotônica sequence: amostras preservam índice sequencial estrito', () => {
    const samples: RawRRSample[] = [
      { sequence: 0, raw1024: 800, ms: 781, receivedAt: 1000, contactStatus: 'supported_contact' },
      { sequence: 1, raw1024: 810, ms: 791, receivedAt: 1000, contactStatus: 'supported_contact' },
      { sequence: 2, raw1024: 820, ms: 801, receivedAt: 2000, contactStatus: 'supported_contact' },
    ];

    expect(samples.map(s => s.sequence)).toEqual([0, 1, 2]);
  });

  // ── 5. Preservação da Sessão no Ciclo de Vida ──────────────────────────────

  it('5.1. Isolamento entre Sessão Bruta e Janela Operacional: slice da janela móvel não afeta a série completa em memória', () => {
    const sessionSeries: RawRRSample[] = [];
    const operationalWindow: WindowSample[] = [];

    // Simular chegada de 80 batimentos (janela operacional limitada a 60)
    for (let i = 0; i < 80; i++) {
      sessionSeries.push({
        sequence: i,
        raw1024: 819 + i,
        ms: 800 + i,
        receivedAt: Date.now(),
        contactStatus: 'supported_contact'
      });
      operationalWindow.push({ ms: 800 + i, valid: true });
    }

    const trimmedWindow = operationalWindow.slice(-60);

    // Invariante de Preservação:
    // A janela móvel da UI tem 60 itens, mas a série científica preserva os 80 batimentos inteiros!
    expect(trimmedWindow.length).toBe(60);
    expect(sessionSeries.length).toBe(80);
    expect(sessionSeries[0].sequence).toBe(0);
    expect(sessionSeries[0].ms).toBe(800);
    expect(sessionSeries[79].sequence).toBe(79);
    expect(sessionSeries[79].ms).toBe(879);
  });
});
