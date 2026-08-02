/**
 * ============================================================
 *  ZenAudioEngine 2.0 — Motor de Áudio Bioadaptativo Nativo
 *  XZenPress | Web Audio API | Zero arquivos externos
 * ============================================================
 *
 *  3 Pilares Científicos e Culturais:
 *  1. ☯️  MTC Pentatônica (Afinação Cultural em 432 Hz) — 5 paisagens sonoras inspiradas na tradição dos 5 Elementos
 *  2. 🌬️  Qigong Rhythm — Âncora sonora que conduz o ritmo respiratório de 5,5s (Respiração de Coerência Cardiorrespiratória)
 *  3. 🧠  Binaural Beats — Arrastamento estéreo associado a estados de relaxamento e foco (Uso com fones recomendado)
 *
 *  Nota Científica & Regulatória:
 *  - As frequências e arranjos MTC em 432 Hz entram como camada cultural e estética de relaxamento.
 *  - A âncora de 5,5s é o mecanismo fisiológico principal (frequência de ressonância de VFC).
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type BinauralState = 'theta' | 'alpha' | 'delta' | 'beta' | 'gamma';

export type MtcElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface ZenAudioSession {
  stop: () => void;
  setVolume: (v: number) => void;
}

// ─── Global Audio Registry & Safety Manager ──────────────────────────────────
let activeContexts: AudioContext[] = [];
let activeSessions: (() => void)[] = [];

export function registerSessionCleanup(cleanupFn: () => void): void {
  activeSessions.push(cleanupFn);
}

/**
 * Encerra IMEDIATAMENTE todos os AudioContexts, osciladores e intervalos ativos no sistema.
 * Impede zunidos contínuos ou acúmulo de áudio em segundo plano.
 */
export function stopAllZenAudio(): void {
  // Executa callbacks de limpeza registradas (intervalos, timeouts, osciladores)
  activeSessions.forEach(cleanup => {
    try { cleanup(); } catch (e) {}
  });
  activeSessions = [];

  // Fecha instantaneamente todos os AudioContexts da Web Audio API
  activeContexts.forEach(ctx => {
    try {
      if (ctx.state !== 'closed') {
        ctx.suspend();
        ctx.close();
      }
    } catch (e) {
      console.warn('Erro ao fechar AudioContext:', e);
    }
  });
  activeContexts = [];
}

// Expõe no objeto global window para permitir encerramento imediato via console ou botões globais
if (typeof window !== 'undefined') {
  (window as any).stopAllZenAudio = stopAllZenAudio;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  // Para qualquer áudio prévio antes de instanciar um novo motor
  stopAllZenAudio();

  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  
  const ctx = new AC();
  activeContexts.push(ctx);
  return ctx;
}

function createFadeGain(ctx: AudioContext, targetGain: number, fadeDuration = 0.5): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + fadeDuration);
  return gain;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PILAR 1: ☯️  MTC PENTATÔNICA (Tradição dos 5 Elementos)
//
//  Escala pentatônica inspirada na tradição oriental em afinação alternativa de 432 Hz.
//
//  Elemento  | Nota MTC | Paisagem Sonora     | Frequência Fundamental
//  ----------|----------|---------------------|-----------------------
//  Madeira   | Jiao     | Elemento Madeira    | 288 Hz (Ré)
//  Fogo      | Zhi      | Elemento Fogo       | 384 Hz (Sol)
//  Terra     | Gong     | Elemento Terra      | 432 Hz (Lá)
//  Metal     | Shang    | Elemento Metal      | 480 Hz (Si)
//  Água      | Yu       | Elemento Água       | 324 Hz (Mi)
// ─────────────────────────────────────────────────────────────────────────────

const MTC_FREQUENCIES: Record<MtcElement, number[]> = {
  wood:  [288, 576, 144],       // Jiao — Paisagem Sonora Elemento Madeira
  fire:  [384, 768, 192],       // Zhi  — Paisagem Sonora Elemento Fogo
  earth: [432, 864, 216],       // Gong — Paisagem Sonora Elemento Terra
  metal: [480, 960, 240],       // Shang— Paisagem Sonora Elemento Metal
  water: [324, 648, 162],       // Yu   — Paisagem Sonora Elemento Água
};

const MTC_ELEMENT_NAMES: Record<MtcElement, string> = {
  wood:  '🌿 Paisagem Sonora Madeira (Jiao)',
  fire:  '🔥 Paisagem Sonora Fogo (Zhi)',
  earth: '🌍 Paisagem Sonora Terra (Gong)',
  metal: '⚙️ Paisagem Sonora Metal (Shang)',
  water: '💧 Paisagem Sonora Água (Yu)',
};

/**
 * Toca a assinatura sonora de um Elemento da MTC.
 * Gera a nota fundamental + 2 harmônicos naturais em senoides puras.
 */
export function playMtcElement(element: MtcElement, volumeLevel = 0.25): ZenAudioSession | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const freqs = MTC_FREQUENCIES[element];
  const oscillators: OscillatorNode[] = [];
  const masterGain = createFadeGain(ctx, volumeLevel);
  masterGain.connect(ctx.destination);

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Harmônicos progressivamente mais suaves
    const harmonicLevel = 1 / (idx + 1);
    harmonicGain.gain.setValueAtTime(harmonicLevel, ctx.currentTime);

    osc.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    osc.start();
    oscillators.push(osc);
  });

  // Vibrato suave (0.5 Hz, ±2 Hz de desvio) para calor orgânico
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  vibrato.frequency.setValueAtTime(0.5, ctx.currentTime);
  vibratoGain.gain.setValueAtTime(2, ctx.currentTime);
  vibrato.start();
  vibrato.connect(vibratoGain);
  oscillators.forEach(osc => vibratoGain.connect(osc.frequency));

  return {
    stop: () => {
      const fadeTime = 1.0;
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
      setTimeout(() => {
        oscillators.forEach(o => { try { o.stop(); } catch {} });
        vibrato.stop();
        ctx.close();
      }, (fadeTime + 0.1) * 1000);
    },
    setVolume: (v: number) => {
      masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.3);
    },
  };
}

export { MTC_ELEMENT_NAMES };

// ─────────────────────────────────────────────────────────────────────────────
//  PILAR 2: 🌬️  QIGONG RHYTHM (Âncora Respiratória)
//
//  Produz dois sons — inspiração e expiração — sincronizados com o
//  ritmo de 5.5 segundos da Respiração de Coerência Cardíaca (Qigong).
//  Isso elimina a necessidade de narração de voz.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicia o metrônomo de Qigong com dois tons distintos:
 * - Tom INSPIRE (220 Hz suave): sobe durante 5.5s
 * - Tom EXPIRE (165 Hz grave): desce durante 5.5s
 */
export function startQigongRhythm(
  onPhase: (phase: 'inspire' | 'expire') => void,
  volumeLevel = 0.15,
): ZenAudioSession | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  let active = true;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let phaseState: 'inspire' | 'expire' = 'inspire';

  const playBell = (freq: number) => {
    if (!active || ctx.state === 'closed') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volumeLevel, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.6);
  };

  // Inicia imediatamente
  playBell(220); // inspire
  onPhase('inspire');

  intervalId = setInterval(() => {
    if (!active) return;
    phaseState = phaseState === 'inspire' ? 'expire' : 'inspire';
    playBell(phaseState === 'inspire' ? 220 : 165);
    onPhase(phaseState);
  }, 5500); // 5.5 segundos por fase = 11s por ciclo completo

  return {
    stop: () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      try { ctx.close(); } catch {}
    },
    setVolume: (v: number) => {
      volumeLevel = v;
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PILAR 3: 🧠  BINAURAL BEATS (Neurociência — Arrastamento Neural)
//
//  Dois osciladores em canais L/R com diferença de frequência = onda alvo.
//  O cérebro "percebe" a diferença e sincroniza (entrainment).
//
//  Estado   | Carrier | Offset  | Resultado  | Efeito clínico
//  ---------|---------|---------|------------|-----------------------------
//  Theta    | 200 Hz  |  6 Hz   | 200/206 Hz | Meditação, criatividade
//  Alpha    | 200 Hz  | 10 Hz   | 200/210 Hz | Relaxamento, foco suave
//  Delta    | 200 Hz  |  2 Hz   | 200/202 Hz | Sono profundo
//  Beta     | 200 Hz  | 18 Hz   | 200/218 Hz | Alerta, concentração
//  Gamma    | 200 Hz  | 40 Hz   | 200/240 Hz | Cognição de alta freq.
// ─────────────────────────────────────────────────────────────────────────────

const BINAURAL_OFFSETS: Record<BinauralState, number> = {
  theta: 6,
  alpha: 10,
  delta: 2,
  beta:  18,
  gamma: 40,
};

const BINAURAL_LABELS: Record<BinauralState, string> = {
  theta: '🎯 Theta 6 Hz — Meditação & Criatividade',
  alpha: '😌 Alpha 10 Hz — Relaxamento & Foco',
  delta: '😴 Delta 2 Hz — Sono Profundo',
  beta:  '⚡ Beta 18 Hz — Alerta & Concentração',
  gamma: '🧠 Gamma 40 Hz — Cognição Máxima',
};

/**
 * Inicia batidas binaurais de alta precisão.
 * IMPORTANTE: Requer fones de ouvido para funcionar corretamente.
 */
export function startBinauralBeats(state: BinauralState, volumeLevel = 0.18): ZenAudioSession | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const carrier = 200; // Hz — frequência portadora base
  const offset = BINAURAL_OFFSETS[state];

  // Canal ESQUERDO (frequência base)
  const oscLeft = ctx.createOscillator();
  const gainLeft = ctx.createGain();
  const mergerLeft = ctx.createChannelMerger(2);

  oscLeft.type = 'sine';
  oscLeft.frequency.setValueAtTime(carrier, ctx.currentTime);

  // Canal DIREITO (frequência + offset = beat percebido)
  const oscRight = ctx.createOscillator();
  const gainRight = ctx.createGain();

  oscRight.type = 'sine';
  oscRight.frequency.setValueAtTime(carrier + offset, ctx.currentTime);

  // Master gain com fade in
  const masterGain = createFadeGain(ctx, volumeLevel, 1.5);

  // Roteamento estéreo L/R correto
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);

  // Configura canal esquerdo
  gainLeft.gain.setValueAtTime(1, ctx.currentTime);
  oscLeft.connect(gainLeft);

  // Configura canal direito
  gainRight.gain.setValueAtTime(1, ctx.currentTime);
  oscRight.connect(gainRight);

  // Conecta ao merger estéreo
  gainLeft.connect(merger, 0, 0);
  gainRight.connect(merger, 0, 1);
  merger.connect(masterGain);
  masterGain.connect(ctx.destination);

  oscLeft.start();
  oscRight.start();

  return {
    stop: () => {
      const fadeTime = 1.5;
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
      setTimeout(() => {
        try { oscLeft.stop(); oscRight.stop(); ctx.close(); } catch {}
      }, (fadeTime + 0.1) * 1000);
    },
    setVolume: (v: number) => {
      masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.3);
    },
  };
}

export { BINAURAL_LABELS, BINAURAL_OFFSETS };

// ─────────────────────────────────────────────────────────────────────────────
//  PROTOCOLO CLÍNICO: Down Regulation (Rampa de BPM)
//
//  Protocolo 1 do XZen Audio Lab:
//  Rampa de BPM descendente (80 → 58) sincronizada com tom grave de grounding.
//  Objetivo: Reduzir a hiperatividade simpática em 8 minutos.
// ─────────────────────────────────────────────────────────────────────────────

export function startDownRegulationProtocol(
  onBpmChange: (bpm: number) => void,
  volumeLevel = 0.2
): ZenAudioSession | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  // Frequência grave de grounding (174 Hz — redução de dor e estresse)
  const groundingOsc = ctx.createOscillator();
  const groundingGain = createFadeGain(ctx, volumeLevel * 0.4, 2);
  groundingOsc.type = 'sine';
  groundingOsc.frequency.setValueAtTime(174, ctx.currentTime);
  groundingOsc.connect(groundingGain);
  groundingGain.connect(ctx.destination);
  groundingOsc.start();

  // Rampa de BPM: 80 → 72 → 64 → 58 em 8 minutos
  const bpmStages = [
    { bpm: 80, duration: 120 },  // 2 min
    { bpm: 72, duration: 120 },  // 2 min
    { bpm: 64, duration: 120 },  // 2 min
    { bpm: 58, duration: 120 },  // 2 min
  ];

  let active = true;
  let stageIndex = 0;
  let beatTimeout: ReturnType<typeof setTimeout> | null = null;
  let stageTimeout: ReturnType<typeof setTimeout> | null = null;

  const playHeartbeat = (bpm: number) => {
    if (!active || ctx.state === 'closed') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime); // batida grave
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volumeLevel * 0.6, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);

    const interval = (60 / bpm) * 1000;
    beatTimeout = setTimeout(() => playHeartbeat(bpm), interval);
  };

  const advanceStage = () => {
    if (!active || stageIndex >= bpmStages.length) return;
    const stage = bpmStages[stageIndex];
    onBpmChange(stage.bpm);
    if (beatTimeout) clearTimeout(beatTimeout);
    playHeartbeat(stage.bpm);
    stageIndex++;
    if (stageIndex < bpmStages.length) {
      stageTimeout = setTimeout(advanceStage, stage.duration * 1000);
    }
  };

  advanceStage();

  return {
    stop: () => {
      active = false;
      if (beatTimeout) clearTimeout(beatTimeout);
      if (stageTimeout) clearTimeout(stageTimeout);
      const fadeTime = 2;
      groundingGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
      setTimeout(() => {
        try { groundingOsc.stop(); ctx.close(); } catch {}
      }, (fadeTime + 0.1) * 1000);
    },
    setVolume: (v: number) => {
      groundingGain.gain.linearRampToValueAtTime(v * 0.4, ctx.currentTime + 0.3);
    },
  };
}
