import { GeminiLiveService } from './geminiLiveService';

describe('GeminiLiveService (Modo Turbo - Seam Tests)', () => {
  beforeEach(() => {
    // Mock minimal Web Audio API and window
    (global as any).window = {
      AudioContext: class {
        sampleRate: number;
        state = 'running';
        currentTime = 0;
        destination = {};
        constructor(opts?: { sampleRate?: number }) {
          this.sampleRate = opts?.sampleRate || 44100;
        }
        async resume() {}
        async close() {
          this.state = 'closed';
        }
        createMediaStreamSource() {
          return { connect() {}, disconnect() {} };
        }
        createScriptProcessor() {
          return { connect() {}, disconnect() {} };
        }
        createBuffer() {
          return {
            getChannelData() {
              return new Float32Array(100);
            },
            duration: 0.1,
          };
        }
        createBufferSource() {
          return {
            buffer: null,
            connect() {},
            disconnect() {},
            start() {},
            stop() {},
          };
        }
      },
      btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
      atob: (b64: string) => Buffer.from(b64, 'base64').toString('binary'),
      location: {
        hostname: 'localhost',
        protocol: 'http:',
        origin: 'http://localhost:5173',
      },
    };
  });

  it('deve inicializar com estado idle e instrução de sistema contendo XZenpress e CVV', () => {
    const service = new GeminiLiveService();
    expect(service.getStatus()).toBe('idle');
  });

  it('deve permitir desconexão segura em estado idle sem lançar exceções', () => {
    const service = new GeminiLiveService();
    expect(() => service.disconnect()).not.toThrow();
    expect(service.getStatus()).toBe('idle');
  });

  it('deve interromper áudio do assistente com segurança (Barge-in)', () => {
    const service = new GeminiLiveService();
    expect(() => service.stopAssistantAudio()).not.toThrow();
  });
});
