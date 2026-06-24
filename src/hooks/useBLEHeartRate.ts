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
 */

import { useState, useRef, useCallback } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type BLEStatus =
  | 'idle'
  | 'requesting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'unsupported'
  | 'error';

export interface BLEMetrics {
  /** RMSSD calculado dos últimos N intervalos RR (ms) */
  rmssd: number;
  /** Batimentos por minuto instantâneos */
  bpm: number;
  /** Últimos intervalos RR brutos (ms) */
  rrIntervals: number[];
  /** Número de amostras RR coletadas */
  sampleCount: number;
  /** Timestamp da última leitura */
  lastUpdated: Date | null;
}

export interface UseBLEHeartRateReturn {
  status: BLEStatus;
  metrics: BLEMetrics;
  deviceName: string | null;
  error: string | null;
  isSupported: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Número máximo de intervalos RR mantidos na janela de cálculo */
const MAX_RR_WINDOW = 60;

/** Mínimo de intervalos para calcular RMSSD confiável */
const MIN_RR_FOR_RMSSD = 5;

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Faz parse do DataView do característico Heart Rate Measurement (0x2A37).
 * Extrai BPM e intervalos RR conforme spec Bluetooth GATT.
 */
function parseHeartRateMeasurement(view: DataView): {
  bpm: number;
  rrIntervals: number[];
} {
  const flags = view.getUint8(0);
  const is16Bit = flags & 0x01;
  const hasRR = (flags >> 4) & 0x01;

  let offset = 1;
  const bpm = is16Bit
    ? view.getUint16(offset, true)
    : view.getUint8(offset);
  offset += is16Bit ? 2 : 1;

  // Pular Energy Expended se presente
  if ((flags >> 3) & 0x01) offset += 2;

  const rrIntervals: number[] = [];
  if (hasRR) {
    while (offset + 1 < view.byteLength) {
      // RR vem em unidades de 1/1024 segundo → converter para ms
      const rrRaw = view.getUint16(offset, true);
      const rrMs = Math.round((rrRaw / 1024) * 1000);
      // Filtrar artefatos fisiologicamente impossíveis (< 300ms ou > 2000ms)
      if (rrMs >= 300 && rrMs <= 2000) {
        rrIntervals.push(rrMs);
      }
      offset += 2;
    }
  }

  return { bpm, rrIntervals };
}

/**
 * Calcula RMSSD (Root Mean Square of Successive Differences).
 * Métrica padrão-ouro para avaliação do tônus vagal / VFC parassimpática.
 */
function calculateRMSSD(rrIntervals: number[]): number {
  if (rrIntervals.length < MIN_RR_FOR_RMSSD) return 0;

  let sumSquares = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i] - rrIntervals[i - 1];
    sumSquares += diff * diff;
  }
  return Math.round(Math.sqrt(sumSquares / (rrIntervals.length - 1)));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBLEHeartRate(): UseBLEHeartRateReturn {
  const [status, setStatus] = useState<BLEStatus>('idle');
  const [metrics, setMetrics] = useState<BLEMetrics>({
    rmssd: 0,
    bpm: 0,
    rrIntervals: [],
    sampleCount: 0,
    lastUpdated: null,
  });
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const rrWindowRef = useRef<number[]>([]);

  const isSupported =
    typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // ── Handler de notificações BLE ──────────────────────────────────────────

  const handleCharacteristicChange = useCallback(
    (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const value = target.value;
      if (!value) return;

      const { bpm, rrIntervals } = parseHeartRateMeasurement(value);

      if (rrIntervals.length > 0) {
        // Acumula janela deslizante de RR
        rrWindowRef.current = [
          ...rrWindowRef.current,
          ...rrIntervals,
        ].slice(-MAX_RR_WINDOW);

        const rmssd = calculateRMSSD(rrWindowRef.current);

        setMetrics(prev => ({
          rmssd: rmssd > 0 ? rmssd : prev.rmssd,
          bpm,
          rrIntervals: [...rrWindowRef.current],
          sampleCount: prev.sampleCount + rrIntervals.length,
          lastUpdated: new Date(),
        }));
      } else {
        // Atualiza só o BPM quando não há RR nesta leitura
        setMetrics(prev => ({
          ...prev,
          bpm,
          lastUpdated: new Date(),
        }));
      }
    },
    []
  );

  // ── Conectar ─────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('Web Bluetooth não é suportado neste navegador. Use Chrome ou Edge.');
      return;
    }

    try {
      setStatus('requesting');
      setError(null);
      rrWindowRef.current = [];

      // Solicita dispositivo com serviço Heart Rate
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information'],
      });

      deviceRef.current = device;
      setDeviceName(device.name || 'Dispositivo BLE');
      setStatus('connecting');

      // Listener de desconexão inesperada
      device.addEventListener('gattserverdisconnected', () => {
        setStatus('disconnected');
        setDeviceName(null);
      });

      // Conecta ao GATT server
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic(
        'heart_rate_measurement'
      );

      characteristicRef.current = characteristic;
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleCharacteristicChange
      );
      await characteristic.startNotifications();

      setStatus('connected');
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // Usuário cancelou o seletor
        setStatus('idle');
      } else {
        setStatus('error');
        setError(err.message || 'Erro ao conectar via Bluetooth.');
        console.error('[BLE] Connection error:', err);
      }
    }
  }, [isSupported, handleCharacteristicChange]);

  // ── Desconectar ──────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    if (characteristicRef.current) {
      characteristicRef.current
        .stopNotifications()
        .catch(() => {})
        .finally(() => {
          characteristicRef.current = null;
        });
    }
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
    rrWindowRef.current = [];
    setStatus('disconnected');
    setDeviceName(null);
    setMetrics({
      rmssd: 0,
      bpm: 0,
      rrIntervals: [],
      sampleCount: 0,
      lastUpdated: null,
    });
  }, []);

  return {
    status,
    metrics,
    deviceName,
    error,
    isSupported,
    connect,
    disconnect,
  };
}
