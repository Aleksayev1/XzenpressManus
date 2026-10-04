/**
 * useBLEHeartRate — Web Bluetooth API Hook
 * =========================================
 * Conecta diretamente a wearables via Bluetooth Low Energy usando o
 * perfil padrão Heart Rate (GATT 0x180D / 0x2A37) e extrai intervalos
 * RR brutos para calcular VFC (RMSSD) em tempo real no browser.
 *
 * Dispositivos compatíveis: Polar H10, Polar H9, Garmin HRM-Pro,
 * Wahoo TICKR X, Moov HR.
 * ⚠️  Não funciona em Safari/iOS (Apple bloqueia Web Bluetooth).
 *
 * ---------------------------------------------------------------------------
 * PATCH CIENTÍFICO MULTI-IA v2.6 (Auditado e Aprovado por Claude Sonnet & ChatGPT)
 *
 * 1. Sensor Contact Status (bits 1–2): decodificado e rastreado no payload.
 * 2. Invariância de Adjacência: pares que atravessam amostras inválidas
 *    são descartados para evitar artefatos de batimentos falsos no RMSSD.
 * 3. Bounds Checking Campo a Campo: verificação defensiva de cada offset
 *    antes de ler BPM, Energy Expended e intervalos RR.
 * 4. Trava Síncrona de Reentrância: useRef(connectInFlightRef) impede
 *    chamadas concorrentes síncronas antes do ciclo de render do React.
 * 5. Ciclo de Vida e Memória: remoção de listeners em disconnect(),
 *    handleDisconnected() e unmount, com preservação de sessionRRRef em memória.
 * 6. Semântica Temporal e Sequência: receivedAt (timestamp do pacote BLE)
 *    e sequence monotônica para auditoria metrológica do tacograma.
 * 7. Invariante null ≠ 0 ≠ synthetic: RMSSD retorna null quando faltam
 *    dados válidos (< 5 amostras ou 0 pares consecutivos); 0 é apenas
 *    o resultado matemático real quando diff = 0 ms.
 * ---------------------------------------------------------------------------
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type BLEStatus =
  | 'idle'
  | 'requesting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'unsupported'
  | 'error';

/**
 * Status de contato do sensor com a pele (Bluetooth SIG 0x2A37):
 * - 'not_supported': o dispositivo não suporta detecção de contato.
 * - 'supported_no_contact': suportado, mas sem contato detectado no momento.
 * - 'supported_contact': suportado e com contato firme com a pele.
 */
export type ContactStatus =
  | 'not_supported'
  | 'supported_no_contact'
  | 'supported_contact';

export interface BLEMetrics {
  /** RMSSD calculado da janela operacional de RR válidos e consecutivos (ms), ou null se dados insuficientes */
  rmssd: number | null;
  /** Último RMSSD válido calculado (para conveniência de exibição na UI sem mascarar dados insuficientes) */
  lastValidRmssd: number | null;
  /** Batimentos por minuto instantâneos */
  bpm: number;
  /** Status de contato do sensor na última leitura */
  contactStatus: ContactStatus | null;
  /** Janela operacional de RR válidos (ms), usada na UI */
  rrIntervals: number[];
  /** Número total de amostras RR recebidas do sensor na sessão */
  sampleCount: number;
  /** Número de amostras fisiologicamente plausíveis (300–2000ms) */
  validSampleCount: number;
  /** Timestamp da última leitura */
  lastUpdated: Date | null;
}

/** Amostra RR bruta preservada em memória para a trilha de pesquisa científica (Kubios). */
export interface RawRRSample {
  /** Índice monotônico sequencial da amostra na sessão (0, 1, 2, ...) */
  sequence: number;
  /** Valor bruto recebido do sensor em unidades de 1/1024 segundo */
  raw1024: number;
  /** Valor convertido para milissegundos */
  ms: number;
  /** Timestamp (epoch ms) de recepção do pacote BLE no navegador */
  receivedAt: number;
  /** Status de contato no pacote */
  contactStatus: ContactStatus;
}

export interface UseBLEHeartRateReturn {
  status: BLEStatus;
  metrics: BLEMetrics;
  deviceName: string | null;
  error: string | null;
  isSupported: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  /**
   * Retorna a série temporal integral e não filtrada de intervalos RR
   * capturados na sessão atual, preservada em memória para exportação científica.
   */
  getSessionRR: () => RawRRSample[];
}

/** Amostra dentro da janela operacional, com validade preservada. */
export interface WindowSample {
  ms: number;
  valid: boolean;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Tamanho máximo da janela móvel operacional para cálculo de RMSSD em tempo real */
const MAX_RR_WINDOW = 60;

/** Mínimo de intervalos válidos na janela para calcular RMSSD */
const MIN_RR_FOR_RMSSD = 5;

/** Faixa de plausibilidade fisiológica para a janela operacional (30–200 bpm) */
const MIN_PLAUSIBLE_RR_MS = 300;
const MAX_PLAUSIBLE_RR_MS = 2000;

// ─── Utilitários de Decodificação e Métricas ──────────────────────────────────

/**
 * Decodificador defensivo do característico Heart Rate Measurement (0x2A37).
 * Garante que pacotes truncados de qualquer tamanho retornem null sem disparar RangeError.
 */
export function parseHeartRateMeasurement(view: DataView): {
  bpm: number;
  contactStatus: ContactStatus;
  rrSamples: { raw1024: number; ms: number }[];
} | null {
  // Mínimo metrológico: 1 byte de flags + pelo menos 1 byte de BPM (8-bit)
  if (!view || view.byteLength < 2) return null;

  const flags = view.getUint8(0);
  const is16Bit = (flags & 0x01) !== 0;

  // Bits 1–2: Sensor Contact Status (Bluetooth SIG)
  const contactRaw = (flags >> 1) & 0x03;
  const contactStatus: ContactStatus =
    contactRaw < 2
      ? 'not_supported'
      : contactRaw === 3
        ? 'supported_contact'
        : 'supported_no_contact';

  const hasEnergyExpended = (flags & 0x08) !== 0;
  const hasRR = (flags & 0x10) !== 0;

  let offset = 1;
  const bpmBytesNeeded = is16Bit ? 2 : 1;
  if (offset + bpmBytesNeeded > view.byteLength) return null;

  const bpm = is16Bit ? view.getUint16(offset, true) : view.getUint8(offset);
  offset += bpmBytesNeeded;

  if (hasEnergyExpended) {
    if (offset + 2 > view.byteLength) return null;
    offset += 2;
  }

  const rrSamples: { raw1024: number; ms: number }[] = [];
  if (hasRR) {
    while (offset + 1 < view.byteLength) {
      const raw1024 = view.getUint16(offset, true);
      const ms = Math.round((raw1024 / 1024) * 1000);
      rrSamples.push({ raw1024, ms });
      offset += 2;
    }
  }

  return { bpm, contactStatus, rrSamples };
}

/**
 * Calcula o RMSSD (Root Mean Square of Successive Differences).
 * Preserva o invariante de adjacência: só calcula (diff)^2 entre amostras
 * que sejam AMBAS válidas e consecutivas no tempo.
 *
 * Invariante Metrológico:
 * - null: dados insuficientes (< MIN_RR_FOR_RMSSD ou 0 pares consecutivos válidos).
 * - 0: resultado matemático exato (diffs válidos todos iguais a 0 ms).
 */
export function calculateRMSSD(samples: WindowSample[]): number | null {
  const validCount = samples.filter(s => s.valid).length;
  if (validCount < MIN_RR_FOR_RMSSD) return null;

  let sumSquares = 0;
  let diffCount = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].valid && samples[i - 1].valid) {
      const diff = samples[i].ms - samples[i - 1].ms;
      sumSquares += diff * diff;
      diffCount++;
    }
  }
  if (diffCount === 0) return null;
  return Math.round(Math.sqrt(sumSquares / diffCount));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBLEHeartRate(): UseBLEHeartRateReturn {
  const [status, setStatus] = useState<BLEStatus>('idle');
  const [metrics, setMetrics] = useState<BLEMetrics>({
    rmssd: null,
    lastValidRmssd: null,
    bpm: 0,
    contactStatus: null,
    rrIntervals: [],
    sampleCount: 0,
    validSampleCount: 0,
    lastUpdated: null,
  });
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const rrWindowRef = useRef<WindowSample[]>([]);
  const sessionRRRef = useRef<RawRRSample[]>([]);
  const connectInFlightRef = useRef<boolean>(false);

  const isSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // ── Tratamento de Desconexão Inesperada (Queda de Sinal/Bateria) ───────────
  const handleDisconnected = useCallback(() => {
    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener?.('characteristicvaluechanged', handleCharacteristicChange);
      characteristicRef.current = null;
    }
    if (deviceRef.current) {
      deviceRef.current.removeEventListener?.('gattserverdisconnected', handleDisconnected);
      deviceRef.current = null;
    }
    connectInFlightRef.current = false;
    rrWindowRef.current = [];
    // A série científica sessionRRRef.current é PRESERVADA integralmente em memória para getSessionRR()
    setStatus('disconnected');
    setDeviceName(null);
    setMetrics(prev => ({
      ...prev,
      bpm: 0,
      contactStatus: null,
      rrIntervals: [],
      // Mantém sampleCount, validSampleCount, rmssd e lastValidRmssd da sessão recém-encerrada
    }));
  }, []);

  const handleCharacteristicChange = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const parsed = parseHeartRateMeasurement(value);
    if (!parsed) return;

    const { bpm, contactStatus, rrSamples } = parsed;
    const now = Date.now();

    if (rrSamples.length > 0) {
      // 1. Trilha Científica: armazena todos os batimentos brutos com sequência monotônica
      const baseSeq = sessionRRRef.current.length;
      const newRawSamples: RawRRSample[] = rrSamples.map((s, idx) => ({
        sequence: baseSeq + idx,
        raw1024: s.raw1024,
        ms: s.ms,
        receivedAt: now,
        contactStatus,
      }));
      sessionRRRef.current = [...sessionRRRef.current, ...newRawSamples];

      // 2. Trilha Operacional (UI): preserva a posição de amostras válidas/inválidas
      const windowSamples: WindowSample[] = rrSamples.map(s => ({
        ms: s.ms,
        valid: s.ms >= MIN_PLAUSIBLE_RR_MS && s.ms <= MAX_PLAUSIBLE_RR_MS,
      }));

      rrWindowRef.current = [...rrWindowRef.current, ...windowSamples].slice(-MAX_RR_WINDOW);
      const rmssd = calculateRMSSD(rrWindowRef.current);
      const validInThisPacket = windowSamples.filter(s => s.valid).length;

      setMetrics(prev => ({
        rmssd,
        lastValidRmssd: rmssd !== null ? rmssd : prev.lastValidRmssd,
        bpm,
        contactStatus,
        rrIntervals: rrWindowRef.current.filter(s => s.valid).map(s => s.ms),
        sampleCount: prev.sampleCount + rrSamples.length,
        validSampleCount: prev.validSampleCount + validInThisPacket,
        lastUpdated: new Date(),
      }));
    } else {
      setMetrics(prev => ({
        ...prev,
        bpm,
        contactStatus,
        lastUpdated: new Date(),
      }));
    }
  }, []);

  // ── Conectar (com trava síncrona de reentrância) ─────────────────────────

  const connect = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('Web Bluetooth não é suportado neste navegador. Use Chrome ou Edge.');
      return;
    }

    // Trava síncrona impermeável a concorrência: impede múltiplas conexões em paralelo
    if (connectInFlightRef.current || status === 'connected') {
      return;
    }
    connectInFlightRef.current = true;

    try {
      setStatus('requesting');
      setError(null);

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information'],
      });

      // Reinicializa estado de sessão SOMENTE após a seleção efetiva do dispositivo
      rrWindowRef.current = [];
      sessionRRRef.current = [];
      setMetrics({
        rmssd: null,
        lastValidRmssd: null,
        bpm: 0,
        contactStatus: null,
        rrIntervals: [],
        sampleCount: 0,
        validSampleCount: 0,
        lastUpdated: null,
      });

      deviceRef.current = device;
      setDeviceName(device.name || 'Dispositivo BLE');
      setStatus('connecting');

      device.addEventListener('gattserverdisconnected', handleDisconnected);

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      characteristicRef.current = characteristic;
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
      await characteristic.startNotifications();

      setStatus('connected');
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setStatus('idle');
      } else {
        setStatus('error');
        setError(err.message || 'Erro ao conectar via Bluetooth.');
      }
    } finally {
      connectInFlightRef.current = false;
    }
  }, [isSupported, status, handleCharacteristicChange, handleDisconnected]);

  // ── Desconectar Manualmente ──────────────────────────────────────────────

  const disconnect = useCallback(() => {
    if (characteristicRef.current) {
      characteristicRef.current.stopNotifications().catch(() => {});
      characteristicRef.current.removeEventListener?.('characteristicvaluechanged', handleCharacteristicChange);
      characteristicRef.current = null;
    }
    if (deviceRef.current) {
      deviceRef.current.removeEventListener?.('gattserverdisconnected', handleDisconnected);
      if (deviceRef.current.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
      deviceRef.current = null;
    }
    connectInFlightRef.current = false;
    rrWindowRef.current = [];
    // sessionRRRef.current permanece preservado integralmente em memória para exportação científica!
    setStatus('disconnected');
    setDeviceName(null);
    setMetrics(prev => ({
      ...prev,
      bpm: 0,
      contactStatus: null,
      rrIntervals: [],
    }));
  }, [handleCharacteristicChange, handleDisconnected]);

  // ── Limpeza no Unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (characteristicRef.current) {
        characteristicRef.current.stopNotifications().catch(() => {});
        characteristicRef.current.removeEventListener?.('characteristicvaluechanged', handleCharacteristicChange);
        characteristicRef.current = null;
      }
      if (deviceRef.current) {
        deviceRef.current.removeEventListener('gattserverdisconnected', handleDisconnected);
        if (deviceRef.current.gatt?.connected) {
          deviceRef.current.gatt.disconnect();
        }
        deviceRef.current = null;
      }
      connectInFlightRef.current = false;
    };
  }, [handleCharacteristicChange, handleDisconnected]);

  // ── Exportação da Sessão Bruta ───────────────────────────────────────────

  const getSessionRR = useCallback(() => [...sessionRRRef.current], []);

  return {
    status,
    metrics,
    deviceName,
    error,
    isSupported,
    connect,
    disconnect,
    getSessionRR,
  };
}
