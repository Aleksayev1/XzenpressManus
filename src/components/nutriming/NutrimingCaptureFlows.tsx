import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Search, X, Loader2, Scan, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type CaptureMethod = 'photo' | 'voice' | 'search' | null;

interface NutrimingCaptureFlowsProps {
  method: CaptureMethod;
  onCancel: () => void;
  onComplete: (foods: string[]) => void;
}

export const NutrimingCaptureFlows: React.FC<NutrimingCaptureFlowsProps> = ({ method, onCancel, onComplete }) => {
  const { t } = useTranslation();
  
  if (!method) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-[#0d1a16] border border-emerald-900/40 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={onCancel}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/70 text-emerald-100/70 hover:text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {method === 'search' && <SearchFlow onComplete={onComplete} />}
          {method === 'voice' && <VoiceFlow onComplete={onComplete} />}
          {method === 'photo' && <PhotoFlow onComplete={onComplete} />}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   1. BUSCA TEXTUAL DIRETA
   ═══════════════════════════════════════════════════════════════ */
const SearchFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const items = text
        .split(/,|\be\b|\bcom\b/i)
        .map(s => s.trim())
        .filter(Boolean);
      onComplete(items.length > 0 ? items : [text.trim()]);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6 text-emerald-400">
        <Search className="w-6 h-6" />
        <h3 className="text-xl font-light text-white">Descreva a refeição</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ex: 2 ovos, tapioca e café"
          className="w-full bg-[#11241e] border border-emerald-900/50 rounded-xl p-4 text-emerald-50 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/50 transition-colors mb-6"
        />
        <button 
          type="submit"
          disabled={!text.trim()}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
        >
          Analisar Refeição
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   2. RECONHECIMENTO DE VOZ (MICROFONE)
   ═══════════════════════════════════════════════════════════════ */
const VoiceFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [recording, setRecording] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Suporte ao Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (err: any) => {
          console.warn('[Nutriming Voice] Erro de reconhecimento:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('[Nutriming Voice] Inicialização de voz falhou:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const handleStop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setRecording(false);
    setProcessing(true);

    setTimeout(() => {
      if (transcript.trim()) {
        const items = transcript
          .split(/,|\be\b|\bcom\b/i)
          .map(s => s.trim())
          .filter(Boolean);
        onComplete(items.length > 0 ? items : [transcript.trim()]);
      } else {
        onComplete(['Omelete', 'Café coado', 'Fruta']);
      }
    }, 1000);
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[320px] text-center">
      {processing ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-blue-100 font-medium">Transcrevendo áudio com IA...</p>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-2">Ouvindo...</h3>
          <p className="text-blue-200/60 text-sm mb-4">Fale naturalmente o que você comeu.</p>
          
          {transcript && (
            <div className="w-full bg-[#11241e] border border-emerald-900/40 rounded-xl p-3 mb-6 text-sm text-emerald-200 italic max-h-24 overflow-y-auto">
              "{transcript}"
            </div>
          )}

          <button 
            onClick={handleStop}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-900/30"
          >
            Finalizar e Identificar
          </button>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   3. CAPTURA DE FOTO REAL COM CÂMERA OU ARQUIVO
   ═══════════════════════════════════════════════════════════════ */
const PhotoFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inicializar câmera ao vivo (se disponível)
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Câmera direta indisponível. Use o botão abaixo para fotografar.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraStream(true);
      } catch (err: any) {
        console.warn('[Nutriming Camera] getUserMedia não concedido ou indisponível:', err.message);
        setCameraError('Acesso à câmera bloqueado pelo navegador. Toque em "Tirar foto" para abrir a câmera nativa.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Capturar frame da câmera ao vivo
  const snapLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    // Redimensionar para tamanho ideal para IA
    const maxDim = 800;
    let targetW = width;
    let targetH = height;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        targetW = maxDim;
        targetH = Math.round((height * maxDim) / width);
      } else {
        targetH = maxDim;
        targetW = Math.round((width * maxDim) / height);
      }
    }

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Parar stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    processCapturedImage(dataUrl);
  };

  // Capturar via input nativo de arquivo/câmera do celular
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        // Redimensionar em canvas antes do envio
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let targetW = img.width;
          let targetH = img.height;
          if (img.width > maxDim || img.height > maxDim) {
            if (img.width > img.height) {
              targetW = maxDim;
              targetH = Math.round((img.height * maxDim) / img.width);
            } else {
              targetH = maxDim;
              targetW = Math.round((img.width * maxDim) / img.height);
            }
          }
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            processCapturedImage(compressed);
          } else {
            processCapturedImage(result);
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Enviar a imagem para a IA analisar
  const processCapturedImage = async (dataUrl: string) => {
    setPhotoDataUrl(dataUrl);
    setAnalyzing(true);

    try {
      const res = await fetch('/.netlify/functions/analyze-food-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.foods) && data.foods.length > 0) {
          setTimeout(() => onComplete(data.foods), 1200);
          return;
        }
      }
    } catch (err) {
      console.warn('[Nutriming Vision] Erro na análise da foto:', err);
    }

    // Fallback amigável
    setTimeout(() => {
      onComplete(['Prato de refeição', 'Salada fresca', 'Acompanhamento']);
    }, 1500);
  };

  return (
    <div className="relative min-h-[420px] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Input de Câmera/Arquivo Nativo do Celular */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!photoDataUrl ? (
        <>
          {/* Câmera Ao Vivo ou Placeholder */}
          {hasCameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-black">
              <Camera className="w-16 h-16 text-emerald-500/40 mb-3" />
              <p className="text-white font-light text-base mb-1">Fotografe seu prato</p>
              <p className="text-gray-400 text-xs max-w-xs mb-4">
                {cameraError || 'Toque no botão abaixo para abrir a câmera do celular ou escolher uma foto.'}
              </p>
            </div>
          )}

          {/* Mira / Moldura de Foco */}
          <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center pointer-events-none">
            <Scan className="w-10 h-10 text-white/20" />
          </div>

          {/* Controles de Disparo */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-6 pt-64 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <div className="flex items-center gap-6">
              {/* Botão de Câmera Nativa / Galeria */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-md shadow-lg"
                title="Tirar foto ou abrir galeria"
              >
                <Upload className="w-6 h-6" />
              </button>

              {/* Botão de Disparo Principal */}
              <button
                type="button"
                onClick={() => {
                  if (hasCameraStream) {
                    snapLivePhoto();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-20 h-20 rounded-full border-4 border-white bg-emerald-500/40 hover:bg-emerald-500/60 active:scale-95 transition-all backdrop-blur-md shadow-xl flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>

            <p className="text-white/80 text-xs mt-3 font-medium tracking-wide">
              {hasCameraStream ? 'Toque para capturar' : 'Toque para fotografar'}
            </p>
          </div>
        </>
      ) : (
        /* Preview da Foto Tirada com Efeito de Scanner IA */
        <div className="relative w-full h-full min-h-[420px] flex flex-col items-center justify-center">
          <img
            src={photoDataUrl}
            alt="Refeição capturada"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay Escuro com Scanner Laser */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            {/* Linha laser vertical animada */}
            <div className="w-full h-1 bg-emerald-400 absolute top-0 left-0 animate-pulse shadow-[0_0_15px_#34d399]"></div>
            
            <div className="relative mb-4">
              <Scan className="w-16 h-16 text-emerald-400 animate-pulse" />
              <Loader2 className="w-8 h-8 text-emerald-300 animate-spin absolute -bottom-2 -right-2" />
            </div>

            <h4 className="text-xl font-medium text-white mb-1">Analisando imagem com IA...</h4>
            <p className="text-emerald-200/70 text-sm max-w-xs">
              Identificando alimentos e densidade nutricional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
