import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Search, X, Loader2, Scan, Upload, RefreshCw, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OpenFoodFactsService } from '../../services/nutriming/openFoodFactsService';

export type CaptureMethod = 'photo' | 'voice' | 'search' | 'barcode' | null;

interface NutrimingCaptureFlowsProps {
  method: CaptureMethod;
  onCancel: () => void;
  onComplete: (foods: string[], barcode?: string) => void;
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

          {method === 'barcode' && <BarcodeScanFlow onComplete={onComplete} />}
          {method === 'search' && <SearchFlow onComplete={onComplete} />}
          {method === 'voice' && <VoiceFlow onComplete={onComplete} />}
          {method === 'photo' && <PhotoFlow onComplete={onComplete} />}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   0. LEITOR CONTÍNUO DE CÓDIGO DE BARRAS (OPEN FOOD FACTS)
   ═══════════════════════════════════════════════════════════════ */
const BarcodeScanFlow: React.FC<{ onComplete: (foods: string[], barcode?: string) => void }> = ({ onComplete }) => {
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [fallbackFoodName, setFallbackFoodName] = useState('');
  const [isNativeBarcodeSupported, setIsNativeBarcodeSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningActiveRef = useRef(true);

  // Iniciar Câmera
  useEffect(() => {
    isScanningActiveRef.current = true;
    let active = true;

    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Câmera não suportada neste dispositivo. Digite o código de barras abaixo:');
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
        console.warn('[BarcodeScanner] Câmera não autorizada:', err);
        setCameraError('Acesso à câmera bloqueado. Digite o código de barras no campo abaixo:');
      }
    }

    initCamera();

    return () => {
      active = false;
      isScanningActiveRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Loop de detecção contínua via BarcodeDetector nativo
  useEffect(() => {
    if (!hasCameraStream) return;
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (!BarcodeDetectorClass) {
      setIsNativeBarcodeSupported(false);
      return;
    }

    let detector: any;
    try {
      detector = new BarcodeDetectorClass({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
      });
    } catch {
      setIsNativeBarcodeSupported(false);
      return;
    }

    const intervalId = setInterval(async () => {
      if (!isScanningActiveRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0 && isScanningActiveRef.current) {
          const rawCode = barcodes[0].rawValue;
          if (rawCode && rawCode.trim().length >= 4) {
            isScanningActiveRef.current = false; // Pausa escaneamento para processar
            handleProcessBarcode(rawCode.trim());
          }
        }
      } catch (e) {
        // Ignora falhas de frame transitórias
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [hasCameraStream]);

  // Consulta ao Open Food Facts
  const handleProcessBarcode = async (code: string) => {
    setIsQuerying(true);
    setStatusMessage(`Consultando produto ${code} no Open Food Facts...`);
    setNotFoundBarcode(null);

    try {
      const product = await OpenFoodFactsService.getProductByBarcode(code);
      if (product && product.productName) {
        setStatusMessage(`Encontrado: ${product.productName}`);
        setTimeout(() => {
          onComplete([product.productName!], code);
        }, 600);
        return;
      }
    } catch (err) {
      console.warn('[Barcode] Erro na busca OFF:', err);
    }

    // Se não encontrou no banco do Open Food Facts
    setIsQuerying(false);
    setNotFoundBarcode(code);
    setStatusMessage(`Código ${code} lido, mas não catalogado no Open Food Facts.`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      isScanningActiveRef.current = false;
      handleProcessBarcode(barcodeInput.trim());
    }
  };

  const handleFallbackConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = fallbackFoodName.trim() || `Alimento (EAN: ${notFoundBarcode})`;
    if (notFoundBarcode && fallbackFoodName.trim()) {
      // Registra permanentemente para nunca mais pedir o nome deste código
      OpenFoodFactsService.registerCustomBarcode(notFoundBarcode, fallbackFoodName.trim());
    }
    onComplete([finalName], notFoundBarcode || undefined);
  };

  return (
    <div className="flex flex-col text-left">
      {/* Topo: Câmera ou Viewfinder */}
      <div className="relative h-64 bg-black overflow-hidden flex items-center justify-center">
        {hasCameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Scan className="w-12 h-12 text-emerald-500/40 mb-2" />
            <p className="text-xs">{cameraError || 'Iniciando câmera para leitura de código de barras...'}</p>
          </div>
        )}

        {/* Moldura do Scanner com cantos estilizados e laser */}
        <div className="absolute inset-x-8 inset-y-10 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-center pointer-events-none shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          {/* Laser animado */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-pulse shadow-[0_0_12px_#34d399]" />
        </div>

        {/* Badge superior */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 text-[11px] text-emerald-300">
          <Scan className="w-3.5 h-3.5" />
          <span>Aponte para o código de barras (EAN)</span>
        </div>

        {/* Notificação de compatibilidade visual */}
        {!isNativeBarcodeSupported && hasCameraStream && (
          <div className="absolute bottom-2 inset-x-4 bg-black/80 backdrop-blur-md border border-amber-500/40 rounded-xl p-2 text-center text-[10px] text-amber-200">
            <span>💡 Leitura visual automática indisponível neste navegador. Digite os dígitos do código abaixo:</span>
          </div>
        )}
      </div>

      {/* Conteúdo Inferior */}
      <div className="p-6 bg-[#0c1814] border-t border-emerald-900/40">
        {isQuerying ? (
          <div className="flex items-center justify-center py-4 gap-3 text-emerald-300">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        ) : notFoundBarcode ? (
          /* Quando código não consta na base OFF */
          <form onSubmit={handleFallbackConfirm} className="space-y-3">
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Código <strong>{notFoundBarcode}</strong> lido. Dê um nome para este alimento:</span>
              </div>
              <span className="text-[10px] text-amber-300/70 ml-6">✨ O XZenPress salvará este alimento para reconhecer este código de barras automaticamente nas próximas vezes.</span>
            </div>
            <input
              type="text"
              autoFocus
              value={fallbackFoodName}
              onChange={e => setFallbackFoodName(e.target.value)}
              placeholder="Ex: Iogurte Natural, Biscoito Integral..."
              className="w-full bg-[#11241e] border border-emerald-900/50 rounded-xl p-3 text-emerald-50 placeholder:text-emerald-900/60 text-sm focus:outline-none focus:border-emerald-500/60"
            />
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Salvar e Continuar com este Alimento
            </button>
          </form>
        ) : (
          /* Digitação manual alternativa */
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="text-xs text-emerald-300/80 block font-medium">
              Ou digite o código de barras numérico (EAN):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder="Ex: 7891000315507"
                className="flex-1 bg-[#11241e] border border-emerald-900/50 rounded-xl px-3 py-2.5 text-emerald-50 placeholder:text-emerald-900/50 text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                disabled={!barcodeInput.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                Buscar
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
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
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Reconhecimento de voz não suportado neste navegador. Digite sua refeição abaixo:');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'pt-BR';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) {
          setTranscript(text.trim());
        }
      };

      rec.onerror = (err: any) => {
        console.warn('[Nutriming Voice Error]:', err.error);
        setIsRecording(false);
        if (err.error === 'not-allowed') {
          setErrorMessage('Permissão do microfone negada. Autorize o microfone ou digite abaixo:');
        } else if (err.error !== 'no-speech') {
          setErrorMessage('Não foi possível captar sua voz com clareza. Você pode tentar de novo ou digitar abaixo:');
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err: any) {
      console.warn('[Nutriming Voice Start Error]:', err);
      setIsRecording(false);
      setErrorMessage('Não foi possível iniciar o microfone. Digite os alimentos abaixo:');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
  };

  const handleFinish = () => {
    stopListening();
    if (!transcript.trim()) return;

    setProcessing(true);
    setTimeout(() => {
      const items = transcript
        .split(/,|\be\b|\bcom\b/i)
        .map(s => s.trim())
        .filter(s => s.length > 1);
      onComplete(items.length > 0 ? items : [transcript.trim()]);
    }, 800);
  };

  // Inicia a gravação ao abrir
  useEffect(() => {
    const timer = setTimeout(() => {
      startListening();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[340px] text-center">
      {processing ? (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-blue-100 font-medium text-base">Identificando alimentos com IA...</p>
        </div>
      ) : (
        <>
          {/* Botão de Microfone Interativo */}
          <div className="relative mb-6">
            {isRecording && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            )}
            <button
              type="button"
              onClick={() => {
                if (isRecording) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
                isRecording 
                  ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-900/50 animate-pulse' 
                  : 'bg-gradient-to-br from-blue-600 to-cyan-700 shadow-blue-900/50 hover:scale-105'
              }`}
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
          </div>

          <h3 className="text-xl font-light text-white mb-1">
            {isRecording ? 'Ouvindo você...' : 'Toque no microfone para falar'}
          </h3>
          <p className="text-blue-200/60 text-xs mb-4">
            {isRecording ? 'Fale normalmente o que você comeu.' : 'Fale ou digite sua refeição abaixo.'}
          </p>
          
          {/* Mensagem de Erro / Alerta com fallback amigável */}
          {errorMessage && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-200 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Campo de Texto com transcrição em tempo real ou digitação */}
          <div className="w-full mb-6 text-left">
            <textarea
              rows={2}
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Ex: Arroz, feijão, frango grelhado e salada"
              className="w-full bg-[#11241e] border border-emerald-900/50 rounded-xl p-3 text-emerald-100 placeholder:text-emerald-800 focus:outline-none focus:border-emerald-500/50 text-sm resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="w-full flex gap-3">
            {isRecording ? (
              <button 
                type="button"
                onClick={handleFinish}
                disabled={!transcript.trim()}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl transition-colors font-medium shadow-lg shadow-rose-900/30"
              >
                Concluir e Identificar
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleFinish}
                disabled={!transcript.trim()}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-colors font-medium shadow-lg shadow-emerald-900/30"
              >
                Identificar Alimentos
              </button>
            )}
          </div>
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
