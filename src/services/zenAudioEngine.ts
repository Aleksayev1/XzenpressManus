/**
 * ============================================================
 *  ZenAudioEngine 2.0 — Motor de Áudio Bioadaptativo Nativo
 *  XZenPress | Web Audio API | Zero arquivos externos (0 KB MP3)
 * ============================================================
 *
 *  Arquitetura em 7 Camadas Modulares Sincronizadas ao Relógio Respiratório:
 *  1. 🌬️  BREATHING   — Âncora 5,5s (Relógio Mestre de Coerência Cardiorrespiratória)
 *  2. 🌿  AMBIENT     — Texturas sintéticas de natureza (chuva/vento/ondas)
 *  3. 🎲  NOISE       — Ruído rosa/marrom filtrado para mascaramento
 *  4. ☯️  MUSIC       — Paisagens Pentatônicas MTC 432 Hz (Madeira, Fogo, Terra, Metal, Água)
 *  5. 🧠  BINAURAL    — Batidas Binaurais L/R (Theta, Alpha, Delta, Beta, Gamma)
 *  6. 🔊  SPATIAL     — Panning estéreo e espacialização lenta (StereoPannerNode)
 *  7. 💓  ADAPTIVE    — Protocolo de Down Regulation (80→58 BPM + 174 Hz grounding)
 *
 *  Conformidade Legal (Anvisa/CFM):
 *  - Frequências: "Paisagens sonoras inspiradas nos Elementos da tradição"
 *  - 432 Hz: "Assinatura estética em 432 Hz — afinação alternativa inspirada na tradição"
 *  - Binaural: "Faixas associadas a estados de relaxamento; efeitos variam entre indivíduos"
 *  - Respiração: "Ritmo de 5,5s — base da coerência cardiorrespiratória"
 */

export const DISCLAIMER_BINAURAL = "Uso de fones de ouvido recomendado. Efeitos variam entre indivíduos.";

// ─── Tipos & Interfaces ────────────────────────────────────────────────────────

export type BinauralState = 'theta' | 'alpha' | 'delta' | 'beta' | 'gamma';
export type MtcElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type ZenPreset = 'relax' | 'sleep' | 'focus' | 'down_regulation' | 'meditation';

export interface ZenLayerConfig {
  breathing?: { enabled: boolean; volume?: number };
  ambient?: { enabled: boolean; type?: 'rain' | 'waves' | 'wind'; volume?: number };
  noise?: { enabled: boolean; type?: 'pink' | 'brown'; volume?: number };
  music?: { enabled: boolean; element?: MtcElement; volume?: number };
  binaural?: { enabled: boolean; state?: BinauralState; volume?: number };
  spatial?: { enabled: boolean; speedHz?: number };
  adaptive?: { enabled: boolean; startBpm?: number; volume?: number };
}

export interface ZenSessionConfig {
  preset?: ZenPreset;
  layers?: ZenLayerConfig;
  masterVolume?: number;
  onPhaseChange?: (phase: 'inspire' | 'expire') => void;
  onBpmChange?: (bpm: number) => void;
}

export interface ZenAudioSession {
  stop: (fadeDuration?: number) => void;
  setMasterVolume: (volume: number) => void;
  setLayerVolume: (layer: keyof ZenLayerConfig, volume: number) => void;
  getBpm?: () => number;
}

// ─── Configurações de Presets JSON ──────────────────────────────────────────────

export const ZEN_PRESETS: Record<ZenPreset, ZenLayerConfig> = {
  relax: {
    breathing: { enabled: true, volume: 0.2 },
    ambient: { enabled: true, type: 'waves', volume: 0.15 },
    music: { enabled: true, element: 'earth', volume: 0.25 },
    binaural: { enabled: true, state: 'alpha', volume: 0.15 },
    spatial: { enabled: true, speedHz: 0.05 },
  },
  sleep: {
    breathing: { enabled: true, volume: 0.15 },
    noise: { enabled: true, type: 'brown', volume: 0.12 },
    music: { enabled: true, element: 'water', volume: 0.2 },
    binaural: { enabled: true, state: 'delta', volume: 0.18 },
    spatial: { enabled: true, speedHz: 0.03 },
  },
  focus: {
    breathing: { enabled: true, volume: 0.1 },
    noise: { enabled: true, type: 'pink', volume: 0.1 },
    music: { enabled: true, element: 'metal', volume: 0.2 },
    binaural: { enabled: true, state: 'gamma', volume: 0.2 },
  },
  down_regulation: {
    breathing: { enabled: true, volume: 0.2 },
    ambient: { enabled: true, type: 'rain', volume: 0.15 },
    music: { enabled: true, element: 'water', volume: 0.2 },
    binaural: { enabled: true, state: 'theta', volume: 0.15 },
    adaptive: { enabled: true, startBpm: 80, volume: 0.2 },
  },
  meditation: {
    breathing: { enabled: true, volume: 0.25 },
    music: { enabled: true, element: 'wood', volume: 0.3 },
    binaural: { enabled: true, state: 'theta', volume: 0.18 },
    spatial: { enabled: true, speedHz: 0.04 },
  },
};

// ─── Constantes MTC & Binaural ────────────────────────────────────────────────

export const MTC_FREQUENCIES: Record<MtcElement, number[]> = {
  wood:  [288, 576, 144],       // Jiao  — 288 Hz (Ré em afinação 432 Hz)
  fire:  [384, 768, 192],       // Zhi   — 384 Hz (Sol em afinação 432 Hz)
  earth: [432, 864, 216],       // Gong  — 432 Hz (Lá em afinação 432 Hz)
  metal: [480, 960, 240],       // Shang — 480 Hz (Si em afinação 432 Hz)
  water: [324, 648, 162],       // Yu    — 324 Hz (Mi em afinação 432 Hz)
};

export const MTC_ELEMENT_NAMES: Record<MtcElement, string> = {
  wood:  '🌿 Elemento Madeira (Jiao) — 288 Hz',
  fire:  '🔥 Elemento Fogo (Zhi) — 384 Hz',
  earth: '🌍 Elemento Terra (Gong) — 432 Hz',
  metal: '⚙️ Elemento Metal (Shang) — 480 Hz',
  water: '💧 Elemento Água (Yu) — 324 Hz',
};

export const BINAURAL_OFFSETS: Record<BinauralState, number> = {
  theta: 6,   // 6 Hz  — Meditação e relaxamento profundo
  alpha: 10,  // 10 Hz — Relaxamento leve e foco tranquilo
  delta: 2,   // 2 Hz  — Indução a descanso profundo
  beta:  18,  // 18 Hz — Alerta e atenção ativa
  gamma: 40,  // 40 Hz — Alta cognição e concentração
};

export const BINAURAL_LABELS: Record<BinauralState, string> = {
  theta: '🎯 Theta 6 Hz — Meditação & Relaxamento Profundo',
  alpha: '😌 Alpha 10 Hz — Relaxamento & Foco Suave',
  delta: '😴 Delta 2 Hz — Indução ao Sono Reparador',
  beta:  '⚡ Beta 18 Hz — Alerta & Concentração',
  gamma: '🧠 Gamma 40 Hz — Alta Atividade Cognitiva',
};

// ─── Global Audio Context & Cleanup Manager ────────────────────────────────────

let activeContexts: AudioContext[] = [];
let activeSessions: (() => void)[] = [];

export function registerSessionCleanup(cleanupFn: () => void): void {
  activeSessions.push(cleanupFn);
}

/**
 * Encerra IMEDIATAMENTE todos os AudioContexts e osciladores ativos no sistema com fade-out limpo.
 * Impede zunidos contínuos, acúmulo de processamento ou vazamento de memória.
 */
export function stopAllZenAudio(): void {
  activeSessions.forEach(cleanup => {
    try { cleanup(); } catch (e) {}
  });
  activeSessions = [];

  activeContexts.forEach(ctx => {
    try {
      if (ctx.state !== 'closed') {
        ctx.suspend();
        ctx.close();
      }
    } catch (e) {
      console.warn('ZenAudioEngine: Erro ao fechar AudioContext:', e);
    }
  });
  activeContexts = [];
}

if (typeof window !== 'undefined') {
  (window as any).stopAllZenAudio = stopAllZenAudio;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  stopAllZenAudio();

  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  
  const ctx = new AC();
  activeContexts.push(ctx);
  return ctx;
}

/**
 * Cria Master Compressor (DynamicsCompressorNode) para evitar clipping e estalos
 * quando múltiplas camadas sonoras tocam simultaneamente.
 */
function createMasterCompressor(ctx: AudioContext): DynamicsCompressorNode {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, ctx.currentTime);
  compressor.knee.setValueAtTime(12, ctx.currentTime);
  compressor.ratio.setValueAtTime(4, ctx.currentTime);
  compressor.attack.setValueAtTime(0.005, ctx.currentTime);
  compressor.release.setValueAtTime(0.1, ctx.currentTime);
  compressor.connect(ctx.destination);
  return compressor;
}

function createSmoothGain(ctx: AudioContext, targetGain: number, fadeTime = 0.5): GainNode {
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(targetGain, 0.0001), ctx.currentTime + fadeTime);
  return gainNode;
}

// ─── Geradores Sintéticos de Ruído & Ambiente (Zero MP3s) ──────────────────────

function createPinkNoiseBuffer(ctx: AudioContext, durationSec = 4): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
    b6 = white * 0.115926;
  }
  return buffer;
}

// Helper para manter áudio ativo com tela bloqueada/desligada (iOS Safari PWA & Android)
function enableBackgroundAudioMode(title = 'XZenPress — Sessão Mestra 432 Hz'): { stop: () => void } {
  if (typeof window === 'undefined') return { stop: () => {} };

  let silentAudio: HTMLAudioElement | null = null;
  try {
    silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    silentAudio.play().catch(() => {});
  } catch (e) {}

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: 'XZenPress',
        album: 'Regulação Fisiológica 432 Hz',
      });
      navigator.mediaSession.setActionHandler('play', () => {
        if (silentAudio) silentAudio.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (silentAudio) silentAudio.pause();
      });
    } catch (e) {}
  }

  return {
    stop: () => {
      try {
        if (silentAudio) {
          silentAudio.pause();
          silentAudio.src = '';
        }
      } catch (e) {}
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOTOR BIOADAPTATIVO DE 7 CAMADAS (ZenAudioEngine 2.0)
// ─────────────────────────────────────────────────────────────────────────────

export function createZenSession(config: ZenSessionConfig): ZenAudioSession | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const bgAudio = enableBackgroundAudioMode();

  const masterCompressor = createMasterCompressor(ctx);
  const masterGain = ctx.createGain();
  const masterVol = config.masterVolume ?? 0.8;
  masterGain.gain.setValueAtTime(masterVol, ctx.currentTime);
  masterGain.connect(masterCompressor);

  // Combina configuração de preset com overrides customizados
  const presetConfig = config.preset ? ZEN_PRESETS[config.preset] : {};
  const layersConfig: ZenLayerConfig = {
    ...presetConfig,
    ...config.layers,
  };

  const layerGains: Record<string, GainNode> = {};
  const activeNodes: { stop: () => void }[] = [];
  let isStopped = false;

  // Spatial Panner Node
  let pannerNode: StereoPannerNode | null = null;
  if (layersConfig.spatial?.enabled && 'createStereoPanner' in ctx) {
    pannerNode = ctx.createStereoPanner();
    pannerNode.connect(masterGain);
    
    // Modulação lenta de panning L/R (0.04 Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(layersConfig.spatial.speedHz || 0.04, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.75, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(pannerNode.pan);
    lfo.start();
    activeNodes.push({ stop: () => { try { lfo.stop(); } catch {} } });
  }

  const getDestination = (): AudioNode => (pannerNode ? pannerNode : masterGain);

  // ── CAMADA 1: 🌬️ BREATHING (Âncora 5,5s — Relógio Mestre) ──────────────────
  if (layersConfig.breathing?.enabled) {
    const vol = layersConfig.breathing.volume ?? 0.2;
    const gainNode = createSmoothGain(ctx, vol);
    gainNode.connect(getDestination());
    layerGains['breathing'] = gainNode;

    let active = true;
    let phaseState: 'inspire' | 'expire' = 'inspire';
    
    const playBell = (freq: number) => {
      if (!active || ctx.state === 'closed' || isStopped) return;
      const osc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      bellGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.15);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      osc.connect(bellGain);
      bellGain.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    };

    playBell(220); // Inspire inicial
    if (config.onPhaseChange) config.onPhaseChange('inspire');

    const intervalId = setInterval(() => {
      if (!active || isStopped) return;
      phaseState = phaseState === 'inspire' ? 'expire' : 'inspire';
      playBell(phaseState === 'inspire' ? 220 : 165);
      if (config.onPhaseChange) config.onPhaseChange(phaseState);
    }, 5500);

    activeNodes.push({ stop: () => { active = false; clearInterval(intervalId); } });
  }

  // ── CAMADA 2 & 3: 🌿 AMBIENT & 🎲 NOISE (Texturas Sintéticas) ─────────────
  if (layersConfig.ambient?.enabled || layersConfig.noise?.enabled) {
    const vol = (layersConfig.ambient?.volume || layersConfig.noise?.volume) ?? 0.15;
    const gainNode = createSmoothGain(ctx, vol);
    gainNode.connect(getDestination());
    layerGains['ambient'] = gainNode;
    layerGains['noise'] = gainNode;

    const noiseBuffer = createPinkNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = layersConfig.ambient?.type === 'waves' ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(layersConfig.ambient?.type === 'waves' ? 400 : 800, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    noiseSource.start();
    activeNodes.push({ stop: () => { try { noiseSource.stop(); } catch {} } });
  }

  // ── CAMADA 4: ☯️ MUSIC (MTC Pentatônica 432 Hz) ───────────────────────────
  if (layersConfig.music?.enabled) {
    const element = layersConfig.music.element || 'earth';
    const freqs = MTC_FREQUENCIES[element];
    const vol = layersConfig.music.volume ?? 0.25;
    const gainNode = createSmoothGain(ctx, vol);
    gainNode.connect(getDestination());
    layerGains['music'] = gainNode;

    const oscillators: OscillatorNode[] = [];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const harmonicLevel = 1 / (idx + 1);
      harmonicGain.gain.setValueAtTime(harmonicLevel, ctx.currentTime);
      osc.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      osc.start();
      oscillators.push(osc);
    });

    // Vibrato orgânico a 0.5 Hz
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(0.5, ctx.currentTime);
    vibratoGain.gain.setValueAtTime(1.5, ctx.currentTime);
    vibrato.start();
    vibrato.connect(vibratoGain);
    oscillators.forEach(osc => vibratoGain.connect(osc.frequency));

    activeNodes.push({
      stop: () => {
        oscillators.forEach(o => { try { o.stop(); } catch {} });
        try { vibrato.stop(); } catch {}
      }
    });
  }

  // ── CAMADA 5: 🧠 BINAURAL (Batidas Binaurais L/R Preciso) ──────────────────
  if (layersConfig.binaural?.enabled) {
    const state = layersConfig.binaural.state || 'alpha';
    const carrier = 200;
    const offset = BINAURAL_OFFSETS[state];
    const vol = layersConfig.binaural.volume ?? 0.18;

    const gainNode = createSmoothGain(ctx, vol);
    layerGains['binaural'] = gainNode;

    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscRight.type = 'sine';
    oscLeft.frequency.setValueAtTime(carrier, ctx.currentTime);
    oscRight.frequency.setValueAtTime(carrier + offset, ctx.currentTime);

    const merger = ctx.createChannelMerger(2);
    const gainLeft = ctx.createGain();
    const gainRight = ctx.createGain();

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);
    gainLeft.connect(merger, 0, 0);
    gainRight.connect(merger, 0, 1);
    merger.connect(gainNode);
    gainNode.connect(getDestination());

    oscLeft.start();
    oscRight.start();

    activeNodes.push({
      stop: () => {
        try { oscLeft.stop(); oscRight.stop(); } catch {}
      }
    });
  }

  // ── CAMADA 7: 💓 ADAPTIVE (Down Regulation / Batimentos Cardiacos) ────────
  let currentBpm = layersConfig.adaptive?.startBpm || 80;
  if (layersConfig.adaptive?.enabled) {
    const vol = layersConfig.adaptive.volume ?? 0.2;
    const gainNode = createSmoothGain(ctx, vol);
    gainNode.connect(getDestination());
    layerGains['adaptive'] = gainNode;

    // Nota grave de grounding (174 Hz)
    const groundingOsc = ctx.createOscillator();
    const groundingGain = ctx.createGain();
    groundingOsc.type = 'sine';
    groundingOsc.frequency.setValueAtTime(174, ctx.currentTime);
    groundingGain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    groundingOsc.connect(groundingGain);
    groundingGain.connect(gainNode);
    groundingOsc.start();

    const bpmStages = [
      { bpm: 80, duration: 120 },
      { bpm: 72, duration: 120 },
      { bpm: 64, duration: 120 },
      { bpm: 58, duration: 120 },
    ];

    let stageIndex = 0;
    let beatTimeout: ReturnType<typeof setTimeout> | null = null;
    let stageTimeout: ReturnType<typeof setTimeout> | null = null;

    const playPulse = (bpm: number) => {
      if (isStopped || ctx.state === 'closed') return;
      const osc = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      pulseGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      pulseGain.gain.exponentialRampToValueAtTime(vol * 0.5, ctx.currentTime + 0.05);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(pulseGain);
      pulseGain.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      const intervalMs = (60 / bpm) * 1000;
      beatTimeout = setTimeout(() => playPulse(bpm), intervalMs);
    };

    const advanceStage = () => {
      if (isStopped || stageIndex >= bpmStages.length) return;
      const stage = bpmStages[stageIndex];
      currentBpm = stage.bpm;
      if (config.onBpmChange) config.onBpmChange(stage.bpm);
      if (beatTimeout) clearTimeout(beatTimeout);
      playPulse(stage.bpm);
      stageIndex++;
      if (stageIndex < bpmStages.length) {
        stageTimeout = setTimeout(advanceStage, stage.duration * 1000);
      }
    };

    advanceStage();

    activeNodes.push({
      stop: () => {
        if (beatTimeout) clearTimeout(beatTimeout);
        if (stageTimeout) clearTimeout(stageTimeout);
        try { groundingOsc.stop(); } catch {}
      }
    });
  }

  // Registra a limpeza completa para o stopAllZenAudio
  const cleanupAll = () => {
    isStopped = true;
    try { bgAudio.stop(); } catch {}
    activeNodes.forEach(node => node.stop());
  };
  registerSessionCleanup(cleanupAll);

  return {
    stop: (fadeDuration = 1.5) => {
      if (isStopped) return;
      isStopped = true;
      try {
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fadeDuration);
        setTimeout(() => {
          cleanupAll();
          try { ctx.close(); } catch {}
        }, (fadeDuration + 0.1) * 1000);
      } catch (e) {
        cleanupAll();
      }
    },
    setMasterVolume: (v: number) => {
      try {
        masterGain.gain.linearRampToValueAtTime(Math.max(v, 0.0001), ctx.currentTime + 0.2);
      } catch {}
    },
    setLayerVolume: (layer: keyof ZenLayerConfig, v: number) => {
      const g = layerGains[layer as string];
      if (g) {
        try {
          g.gain.linearRampToValueAtTime(Math.max(v, 0.0001), ctx.currentTime + 0.2);
        } catch {}
      }
    },
    getBpm: () => currentBpm,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  WRAPPERS COMPATÍVEIS COM V1.0 (Retrocompatibilidade 100%)
// ─────────────────────────────────────────────────────────────────────────────

export function playMtcElement(element: MtcElement, volumeLevel = 0.25): ZenAudioSession | null {
  return createZenSession({
    layers: {
      music: { enabled: true, element, volume: volumeLevel },
      spatial: { enabled: true, speedHz: 0.04 },
    },
  });
}

export function startQigongRhythm(
  onPhase: (phase: 'inspire' | 'expire') => void,
  volumeLevel = 0.15,
): ZenAudioSession | null {
  return createZenSession({
    layers: {
      breathing: { enabled: true, volume: volumeLevel },
    },
    onPhaseChange: onPhase,
  });
}

export function startBinauralBeats(state: BinauralState, volumeLevel = 0.18): ZenAudioSession | null {
  return createZenSession({
    layers: {
      binaural: { enabled: true, state, volume: volumeLevel },
    },
  });
}

export function startDownRegulationProtocol(
  onBpmChange: (bpm: number) => void,
  volumeLevel = 0.2
): ZenAudioSession | null {
  return createZenSession({
    layers: {
      adaptive: { enabled: true, startBpm: 80, volume: volumeLevel },
      breathing: { enabled: true, volume: volumeLevel * 0.7 },
    },
    onBpmChange,
  });
}
