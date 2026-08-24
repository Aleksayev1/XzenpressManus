import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Video, FileText, Play, Square, RefreshCw, Star, CheckCircle, Shield, Heart, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { StoryMediaType, ZenStoryContext, StorySubmissionPayload } from '../data/zenStoriesTypes';
import { ZenStoriesService } from '../services/zenStoriesService';

interface ZenStoriesCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ZenStoryContext;
  defaultAuthorName?: string;
  onSuccess?: () => void;
}

export const ZenStoriesCaptureModal: React.FC<ZenStoriesCaptureModalProps> = ({
  isOpen,
  onClose,
  context,
  defaultAuthorName = '',
  onSuccess
}) => {
  // Padrão flexível: Começa em 'text' ou 'audio', mas sem travar o usuário
  const [mediaType, setMediaType] = useState<StoryMediaType>('text');
  const [authorName, setAuthorName] = useState(defaultAuthorName || 'Praticante Zen');
  const [authorLocation, setAuthorLocation] = useState('Brasil');
  const [authorRole, setAuthorRole] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  
  // Consentimentos LGPD
  const [consentPublic, setConsentPublic] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Estados de Gravação de Áudio / Vídeo
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Limpa streams e timers ao fechar
  useEffect(() => {
    return () => {
      stopAllMediaStreams();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopAllMediaStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Iniciar Gravação de Áudio
  const startAudioRecording = async () => {
    setErrorMessage(null);
    setRecordedBlob(null);
    setPreviewUrl(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta gravação direta');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        stopAllMediaStreams();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microfone bloqueado ou indisponível:', err);
      setErrorMessage('Microfone não autorizado ou indisponível no navegador. Você pode escrever seu relato em texto!');
    }
  };

  // Iniciar Gravação de Vídeo
  const startVideoRecording = async () => {
    setErrorMessage(null);
    setRecordedBlob(null);
    setPreviewUrl(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta gravação direta');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopAllMediaStreams();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Câmera indisponível:', err);
      setErrorMessage('Câmera não autorizada ou indisponível. Você pode escrever seu relato em texto!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resetRecording = () => {
    stopRecording();
    stopAllMediaStreams();
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    setIsPlayingPreview(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consentPublic) {
      setErrorMessage('Por favor, confirme a autorização de exibição para compartilhar sua história.');
      return;
    }

    // Auto-correção inteligente: Se estava em áudio/vídeo mas digitou texto sem gravar áudio, envia como texto!
    let finalMediaType: StoryMediaType = mediaType;
    if ((mediaType === 'audio' || mediaType === 'video') && !recordedBlob) {
      if (text.trim().length > 0) {
        finalMediaType = 'text';
      } else {
        setErrorMessage('Por favor, grave seu áudio/vídeo ou digite algumas palavras no campo de texto.');
        return;
      }
    }

    const finalText = text.trim() || (finalMediaType === 'audio' ? 'Relato em áudio gravado pós-sessão.' : 'Relato gravado pós-sessão.');

    setIsSubmitting(true);

    const payload: StorySubmissionPayload = {
      authorName: authorName.trim() || 'Praticante Zen',
      authorLocation: authorLocation.trim() || 'Brasil',
      authorRole: authorRole.trim(),
      mediaType: finalMediaType,
      mediaBlob: (finalMediaType !== 'text' && recordedBlob) ? recordedBlob : undefined,
      durationSeconds: recordingTime > 0 ? recordingTime : undefined,
      text: finalText,
      rating,
      context,
      consent: {
        publicDisplay: consentPublic,
        marketingUse: consentMarketing,
        isAnonymous,
        termsAcceptedAt: new Date().toISOString()
      }
    };

    try {
      await ZenStoriesService.submitStory(payload);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao enviar depoimento:', err);
      setErrorMessage('Erro ao enviar depoimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white animate-scaleUp my-4 sm:my-8 pb-12 sm:pb-8">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-white">Experiência Enviada! 🌿</h3>
            <p className="text-gray-300 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Obrigado por compartilhar seu alívio. Seu relato já está salvo e ajudará outros praticantes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {/* Cabeçalho */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-semibold">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>XZenPress Stories — Experiências Reais</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Como foi sua experiência?</h2>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Seu relato inspira novas pessoas a encontrarem alívio e bem-estar.
              </p>
            </div>

            {/* Pill de Contexto Clínico */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Sessão Concluída</span>
                <span className="text-white font-semibold text-xs">{context.sessionName || 'Sessão Mestra XZen'}</span>
              </div>
              {context.beforeScore !== undefined && context.afterScore !== undefined && (
                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 text-[11px]">
                  <span className="text-red-400 font-bold">Antes {context.beforeScore}/10</span>
                  <span className="text-gray-500">➔</span>
                  <span className="text-emerald-400 font-bold">Depois {context.afterScore}/10</span>
                </div>
              )}
            </div>

            {/* Seleção do Formato (Texto / Áudio / Vídeo) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => { resetRecording(); setMediaType('text'); }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  mediaType === 'text'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>✍️ Texto</span>
              </button>

              <button
                type="button"
                onClick={() => { resetRecording(); setMediaType('audio'); }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  mediaType === 'audio'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>🎙️ Áudio (Voz)</span>
              </button>
              
              <button
                type="button"
                onClick={() => { resetRecording(); setMediaType('video'); }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  mediaType === 'video'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>📹 Vídeo</span>
              </button>
            </div>

            {/* GRAVAÇÃO DE ÁUDIO */}
            {mediaType === 'audio' && (
              <div className="p-4 rounded-2xl bg-black/30 border border-purple-500/20 text-center space-y-3">
                {!recordedBlob ? (
                  <>
                    <p className="text-[11px] text-purple-300">
                      Grave até 60 segundos contando como você se sentiu:
                    </p>
                    
                    <div className="text-2xl font-mono font-bold text-white">
                      00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 01:00
                    </div>

                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startAudioRecording}
                        className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-90 rounded-full font-bold text-xs text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Iniciar Gravação</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-full font-bold text-xs text-white shadow-lg transition-all animate-pulse flex items-center gap-2 mx-auto"
                      >
                        <Square className="w-4 h-4" />
                        <span>Concluir Áudio ({60 - recordingTime}s)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-semibold">✅ Áudio gravado com sucesso ({recordingTime}s)</p>
                    <audio ref={audioPreviewRef} src={previewUrl || ''} onEnded={() => setIsPlayingPreview(false)} className="hidden" />
                    
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (audioPreviewRef.current) {
                            if (isPlayingPreview) {
                              audioPreviewRef.current.pause();
                              setIsPlayingPreview(false);
                            } else {
                              audioPreviewRef.current.play();
                              setIsPlayingPreview(true);
                            }
                          }
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        <span>{isPlayingPreview ? 'Pausar' : 'Ouvir'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={resetRecording}
                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs text-gray-300 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Gravar de Novo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRAVAÇÃO DE VÍDEO */}
            {mediaType === 'video' && (
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-center space-y-3">
                <div className="aspect-[4/3] max-w-xs mx-auto rounded-2xl overflow-hidden bg-gray-950 relative border border-white/10">
                  {!recordedBlob ? (
                    <video ref={videoPreviewRef} muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <video src={previewUrl || ''} controls playsInline className="w-full h-full object-cover" />
                  )}
                  {isRecording && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span>00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}</span>
                    </div>
                  )}
                </div>

                {!recordedBlob ? (
                  !isRecording ? (
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-full font-bold text-xs text-white shadow-lg mx-auto flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Abrir Câmera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-full font-bold text-xs text-white shadow-lg mx-auto flex items-center gap-2 animate-pulse"
                    >
                      <Square className="w-4 h-4" />
                      <span>Parar Vídeo</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs text-gray-300 flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gravar Outro</span>
                  </button>
                )}
              </div>
            )}

            {/* TEXTO / COMENTÁRIO */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                {mediaType === 'text' ? 'Seu Relato / O que você sentiu:' : 'Mensagem Adicional (Opcional):'}
              </label>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setErrorMessage(null); }}
                placeholder="Ex: Cheguei muito tenso do trabalho. Após a sessão o alívio foi imediato e me sinto muito mais tranquilo..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Avaliação em Estrelas & Identificação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Sua Avaliação:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 text-yellow-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'opacity-30'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Seu Nome / Cidade:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Nome"
                    className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={authorLocation}
                    onChange={(e) => setAuthorLocation(e.target.value)}
                    placeholder="Cidade/UF"
                    className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Termos e Consentimentos Jurídicos / LGPD */}
            <div className="p-3 bg-black/30 rounded-2xl border border-white/5 space-y-1.5 text-[10px] sm:text-[11px]">
              <label className="flex items-start gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPublic}
                  onChange={(e) => setConsentPublic(e.target.checked)}
                  className="mt-0.5 accent-purple-500 rounded"
                />
                <span>Autorizo o XZenPress a exibir meu relato no Mural de Experiências da plataforma.</span>
              </label>

              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="accent-purple-500 rounded"
                />
                <span>Quero aparecer em modo anônimo (apenas iniciais e cidade).</span>
              </label>
            </div>

            {/* Mensagem de Erro / Alerta com Botão de Ação Rápida */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
                {mediaType !== 'text' && (
                  <button
                    type="button"
                    onClick={() => { resetRecording(); setMediaType('text'); }}
                    className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Escrever em Texto em vez disso ✍️</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Botão de Envio (Destacado e Sempre Acessível) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs sm:text-sm rounded-2xl text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando sua História...' : 'Publicar no XZenPress Stories 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};