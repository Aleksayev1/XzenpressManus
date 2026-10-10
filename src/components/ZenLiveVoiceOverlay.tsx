import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles, Loader2, Volume2, Radio } from 'lucide-react';
import { GeminiLiveService, GeminiLiveStatus } from '../services/geminiLiveService';

interface ZenLiveVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTranscriptMessage?: (role: 'user' | 'assistant', text: string) => void;
  accentColor?: string;
}

export const ZenLiveVoiceOverlay: React.FC<ZenLiveVoiceOverlayProps> = ({
  isOpen,
  onClose,
  onAddTranscriptMessage,
  accentColor = '#6366f1',
}) => {
  const [status, setStatus] = useState<GeminiLiveStatus>('idle');
  const [userVolume, setUserVolume] = useState(0);
  const [assistantVolume, setAssistantVolume] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const serviceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        serviceRef.current = null;
      }
      setStatus('idle');
      setUserVolume(0);
      setAssistantVolume(0);
      setLiveTranscript('');
      setErrorMessage(null);
      return;
    }

    // Inicializa o serviço Live
    const service = new GeminiLiveService({
      voiceName: 'Aoede',
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onVolumeChange: (uVol, aVol) => {
        setUserVolume(uVol);
        setAssistantVolume(aVol);
      },
      onTranscript: (text, isUser) => {
        setLiveTranscript((prev) => (prev ? `${prev} ${text}` : text));
        onAddTranscriptMessage?.(isUser ? 'user' : 'assistant', text);
      },
      onError: (err) => {
        setErrorMessage(err.message || 'Erro ao conectar ao Gemini Live');
        setStatus('error');
      },
    });

    serviceRef.current = service;
    service.connect().catch((err) => {
      setErrorMessage(err.message || 'Não foi possível iniciar o diálogo por voz');
    });

    return () => {
      service.disconnect();
      serviceRef.current = null;
    };
  }, [isOpen, onAddTranscriptMessage]);

  if (!isOpen) return null;

  // Cálculo da escala da esfera zen (Orb) reativa ao som
  const activeVolume = status === 'speaking' ? assistantVolume : userVolume;
  const orbScale = Math.min(1.8, Math.max(1, 1 + activeVolume * 2.2));
  const orbGlow = Math.min(45, Math.max(15, activeVolume * 60 + 15));

  const getStatusLabel = () => {
    switch (status) {
      case 'connecting':
        return 'Conectando ao canal em tempo real...';
      case 'listening':
        return userVolume > 0.05 ? 'Ouvindo sua voz...' : 'Pode falar, estou ouvindo...';
      case 'speaking':
        return 'ZenMentor falando (fale a qualquer momento para interromper)';
      case 'error':
        return errorMessage || 'Erro na conexão';
      default:
        return 'Iniciando canal de voz...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-[fadeIn_0.25s_ease-out]">
      {/* Card Principal */}
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center overflow-hidden">
        {/* Luz Ambiente de Fundo */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ background: accentColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ background: '#38bdf8' }}
        />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-10"
          title="Encerrar chamada de voz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Superior */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Gemini 2.0 Live · Multimodal Bidi</span>
        </div>

        {/* ── Zen Voice Orb (Esfera Viva) ── */}
        <div className="relative w-48 h-48 flex items-center justify-center my-4">
          {/* Anel Externo Ondulante */}
          <div
            className="absolute inset-0 rounded-full border border-indigo-400/20 transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${orbScale * 1.15})`,
              opacity: status === 'speaking' || userVolume > 0.05 ? 0.8 : 0.3,
            }}
          />

          {/* Anel Intermediário */}
          <div
            className="absolute w-36 h-36 rounded-full border border-purple-400/30 transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${orbScale * 1.05})`,
              opacity: status === 'speaking' || userVolume > 0.05 ? 0.9 : 0.4,
            }}
          />

          {/* Núcleo Central do Orb */}
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-100 ease-out cursor-pointer"
            style={{
              transform: `scale(${orbScale})`,
              background:
                status === 'speaking'
                  ? 'radial-gradient(circle, #818cf8 0%, #4f46e5 60%, #312e81 100%)'
                  : 'radial-gradient(circle, #38bdf8 0%, #0284c7 60%, #0f172a 100%)',
              boxShadow: `0 0 ${orbGlow}px ${
                status === 'speaking' ? 'rgba(129, 140, 248, 0.6)' : 'rgba(56, 189, 248, 0.5)'
              }`,
            }}
            onClick={() => {
              if (status === 'speaking') {
                serviceRef.current?.stopAssistantAudio();
              }
            }}
          >
            {status === 'connecting' ? (
              <Loader2 className="w-8 h-8 text-white animate-spin opacity-80" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-8 h-8 text-white opacity-90" />
            )}
          </div>
        </div>

        {/* Feedback de Status */}
        <p className="text-sm font-medium text-gray-200 mt-2 px-4 transition-all min-h-[2.5rem] flex items-center justify-center">
          {getStatusLabel()}
        </p>

        {/* Transcrição Flutuante em Tempo Real */}
        {liveTranscript && (
          <div className="w-full mt-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed max-h-24 overflow-y-auto text-left">
            <span className="text-indigo-400 font-semibold block mb-1 text-[10px] uppercase tracking-wider">
              Transcrição ao vivo:
            </span>
            {liveTranscript}
          </div>
        )}

        {/* Instrução Prática */}
        <p className="text-[11px] text-gray-500 mt-4 leading-snug max-w-xs">
          {status === 'speaking'
            ? '💡 Dica: Basta falar naturalmente para interromper o Mestre.'
            : 'Fale normalmente com o microfone aberto, como em uma conversa telefônica.'}
        </p>

        {/* Controles Inferiores */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => {
              setIsMuted((m) => !m);
              // Quando mudo, corta o áudio atual
              if (!isMuted) serviceRef.current?.stopAssistantAudio();
            }}
            className={`p-3 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Desmutar microfone' : 'Mutar microfone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #6366f1)`,
              boxShadow: `0 4px 15px ${accentColor}40`,
            }}
          >
            Voltar ao Chat de Texto
          </button>
        </div>
      </div>
    </div>
  );
};
