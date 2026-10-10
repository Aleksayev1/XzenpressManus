/**
 * ============================================================
 *  GeminiLiveService — Motor de Diálogo Multimodal em Tempo Real
 *  XZenpress | Gemini 2.0 Multimodal Live API (WebSockets)
 *  Zero latência perceptiva | Barge-in nativo | Web Audio API
 * ============================================================
 */

import { getBaseApiUrl } from '../lib/api';

export type GeminiLiveStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'error'
  | 'disconnected';

export interface GeminiLiveConfig {
  apiKey?: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  systemInstruction?: string;
  onStatusChange?: (status: GeminiLiveStatus) => void;
  onVolumeChange?: (userVolume: number, assistantVolume: number) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
  onError?: (error: Error) => void;
}

// Glossário Fonético e Regras de Ouro de Domínio
const DEFAULT_SYSTEM_INSTRUCTION = `Você é o ZenMentor, mentor conversacional de bem-estar integral e saúde mente-corpo da plataforma oficial XZenpress (pronuncia-se "X-Zen-press", NUNCA pronuncie "ximpress" ou "sem press").

DIRETRIZES DE FALA E DIÁLOGO NATURAL:
1. Respostas orais, concisas e acolhedoras (máximo 1 a 3 frases por turno). Fale de forma humana, pausada e empática, como um terapeuta presente.
2. Pratique escuta ativa: valide as emoções e sintomas do usuário antes de propor qualquer prática.
3. Vocabulário de domínio: XZenpress, acupressão, pontos de bioacústica (Shenmen, Zusanli, YNSA, Yintang, Baihui, Neiguan), coerência cardiorrespiratória, modulação vagal e respiração consciente de 5,5 segundos.
4. PROTOCOLO DE SEGURANÇA E VIDA: Se o usuário expressar sofrimento extremo, desesperança profunda ou ideação suicida, acolha com imensa serenidade e recomende imediatamente o apoio gratuito do CVV (Ligue 188 ou acesse cvv.org.br).`;

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private audioInputContext: AudioContext | null = null;
  private audioOutputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private status: GeminiLiveStatus = 'idle';
  private config: GeminiLiveConfig;

  // Gerenciamento da fila de reprodução de áudio contínuo (PCM 24kHz)
  private nextPlayTime = 0;
  private activeAudioSources: AudioBufferSourceNode[] = [];
  private isAssistantSpeaking = false;

  constructor(config: GeminiLiveConfig = {}) {
    this.config = {
      voiceName: 'Aoede', // Voz feminina suave e empática
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      ...config,
    };
  }

  public getStatus(): GeminiLiveStatus {
    return this.status;
  }

  private setStatus(status: GeminiLiveStatus) {
    this.status = status;
    this.config.onStatusChange?.(status);
  }

  /**
   * Conecta à Live API via WebSocket e inicializa canais de áudio
   */
  public async connect(): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') return;

    this.setStatus('connecting');

    try {
      // 1. Obter credenciais de sessão
      let apiKey = this.config.apiKey;
      let model = 'models/gemini-2.0-flash-exp';
      let wsEndpoint =
        'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

      if (!apiKey) {
        const tokenRes = await fetch(`${getBaseApiUrl()}/.netlify/functions/gemini-live-token`, {
          method: 'POST',
        });
        if (!tokenRes.ok) {
          throw new Error('Falha ao obter credenciais para sessão Live do servidor');
        }
        const data = await tokenRes.json();
        apiKey = data.apiKey;
        if (data.model) model = data.model;
        if (data.wsUrl) wsEndpoint = data.wsUrl;
      }

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY ausente');
      }

      // 2. Inicializar áudio do navegador
      await this.initAudioContexts();

      // 3. Abrir WebSocket
      const fullWsUrl = `${wsEndpoint}?key=${apiKey}`;
      this.ws = new WebSocket(fullWsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.sendSetupMessage(model);
        this.startMicrophoneCapture();
      };

      this.ws.onmessage = async (event: MessageEvent) => {
        await this.handleServerMessage(event.data);
      };

      this.ws.onerror = (ev: Event) => {
        console.error('[GeminiLiveService] Erro no WebSocket:', ev);
        const err = new Error('Erro na conexão do WebSocket Gemini Live');
        this.config.onError?.(err);
        this.setStatus('error');
      };

      this.ws.onclose = () => {
        this.cleanupAudio();
        this.setStatus('disconnected');
      };
    } catch (err: any) {
      console.error('[GeminiLiveService] Erro na inicialização:', err);
      this.config.onError?.(err);
      this.setStatus('error');
      this.disconnect();
      throw err;
    }
  }

  /**
   * Inicializa AudioContexts de entrada e saída
   */
  private async initAudioContexts(): Promise<void> {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API não suportada');

    // Contexto de entrada em 16kHz nativo para a API
    this.audioInputContext = new AudioCtx({ sampleRate: 16000 });
    // Contexto de saída em 24kHz (padrão de retorno do Gemini)
    this.audioOutputContext = new AudioCtx({ sampleRate: 24000 });

    if (this.audioInputContext.state === 'suspended') {
      await this.audioInputContext.resume();
    }
    if (this.audioOutputContext.state === 'suspended') {
      await this.audioOutputContext.resume();
    }
  }

  /**
   * Envia o handshake de setup com as instruções fonéticas e voz do ZenMentor
   */
  private sendSetupMessage(model: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupPayload = {
      setup: {
        model,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName || 'Aoede',
              },
            },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: this.config.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
            },
          ],
        },
      },
    };

    this.ws.send(JSON.stringify(setupPayload));
  }

  /**
   * Inicia a captação do microfone e streaming de PCM 16kHz
   */
  private async startMicrophoneCapture() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!this.audioInputContext) return;

      this.inputSource = this.audioInputContext.createMediaStreamSource(this.mediaStream);
      // Buffer de 2048 amostras (~128ms por chunk em 16kHz)
      this.inputProcessor = this.audioInputContext.createScriptProcessor(2048, 1, 1);

      this.inputProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;

        // Converter Float32 (-1.0 a 1.0) para Int16 PCM little-endian
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          sum += Math.abs(s);
        }

        const avgVolume = sum / inputData.length;
        this.config.onVolumeChange?.(avgVolume, this.isAssistantSpeaking ? 0.6 : 0);

        // Barge-in do lado do cliente: se o usuário falar com volume relevante enquanto o assistente fala
        if (avgVolume > 0.08 && this.isAssistantSpeaking) {
          this.stopAssistantAudio();
        }

        // Enviar chunk Base64 pelo WebSocket
        const base64Chunk = this.arrayBufferToBase64(pcm16.buffer);
        const realtimeMessage = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Chunk,
              },
            ],
          },
        };

        this.ws.send(JSON.stringify(realtimeMessage));
      };

      this.inputSource.connect(this.inputProcessor);
      this.inputProcessor.connect(this.audioInputContext.destination);

      this.setStatus('listening');
    } catch (err: any) {
      console.error('[GeminiLiveService] Erro ao acessar microfone:', err);
      this.config.onError?.(err);
      this.setStatus('error');
    }
  }

  /**
   * Processa mensagens recebidas do Gemini Live
   */
  private async handleServerMessage(data: any) {
    try {
      let messageText = '';
      if (typeof data === 'string') {
        messageText = data;
      } else if (data instanceof Blob) {
        messageText = await data.text();
      } else if (data instanceof ArrayBuffer) {
        messageText = new TextDecoder().decode(data);
      }

      if (!messageText) return;
      const parsed = JSON.parse(messageText);

      // 1. Interrupção disparada pelo servidor (barge-in do Gemini)
      if (parsed.serverContent?.interrupted) {
        this.stopAssistantAudio();
        this.setStatus('listening');
        return;
      }

      // 2. Chunks de áudio do modelo
      const parts = parsed.serverContent?.modelTurn?.parts;
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (part.mimeType?.startsWith('audio/pcm') && part.data) {
            this.playPcmAudioChunk(part.data);
          }
          if (part.text) {
            this.config.onTranscript?.(part.text, false);
          }
        }
      }

      // 3. Fim de turno
      if (parsed.serverContent?.turnComplete) {
        this.isAssistantSpeaking = false;
        this.setStatus('listening');
      }
    } catch (e) {
      console.warn('[GeminiLiveService] Erro ao interpretar pacote do servidor:', e);
    }
  }

  /**
   * Decodifica e agenda a reprodução de áudio PCM 24kHz contínuo
   */
  private playPcmAudioChunk(base64Data: string) {
    if (!this.audioOutputContext) return;

    this.isAssistantSpeaking = true;
    this.setStatus('speaking');

    const arrayBuffer = this.base64ToArrayBuffer(base64Data);
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.audioOutputContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioOutputContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioOutputContext.destination);

    const currentTime = this.audioOutputContext.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.02; // Pequeno lookahead de segurança (20ms)
    }

    source.start(this.nextPlayTime);
    this.activeAudioSources.push(source);
    this.nextPlayTime += audioBuffer.duration;

    source.onended = () => {
      const idx = this.activeAudioSources.indexOf(source);
      if (idx !== -1) this.activeAudioSources.splice(idx, 1);
      if (this.activeAudioSources.length === 0) {
        this.isAssistantSpeaking = false;
        if (this.status === 'speaking') {
          this.setStatus('listening');
        }
      }
    };
  }

  /**
   * Interrompe imediatamente qualquer áudio em reprodução (Barge-in)
   */
  public stopAssistantAudio() {
    this.activeAudioSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    this.activeAudioSources = [];
    this.isAssistantSpeaking = false;
    if (this.audioOutputContext) {
      this.nextPlayTime = this.audioOutputContext.currentTime;
    }
  }

  /**
   * Encerra a conexão e libera todos os recursos de hardware
   */
  public disconnect() {
    this.stopAssistantAudio();

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.cleanupAudio();
    this.setStatus('idle');
  }

  private cleanupAudio() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.inputProcessor) {
      try {
        this.inputProcessor.disconnect();
      } catch {}
      this.inputProcessor = null;
    }

    if (this.inputSource) {
      try {
        this.inputSource.disconnect();
      } catch {}
      this.inputSource = null;
    }

    if (this.audioInputContext && this.audioInputContext.state !== 'closed') {
      try {
        this.audioInputContext.close();
      } catch {}
      this.audioInputContext = null;
    }

    if (this.audioOutputContext && this.audioOutputContext.state !== 'closed') {
      try {
        this.audioOutputContext.close();
      } catch {}
      this.audioOutputContext = null;
    }
  }

  // Helpers de conversão binária Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
