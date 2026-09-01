import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Search, X, Loader2, Scan } from 'lucide-react';
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
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-emerald-100/50 hover:text-white rounded-full transition-colors"
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

const SearchFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      // Fake extraction
      onComplete(text.split(/,| e /i).map(s => s.trim()).filter(Boolean));
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
          placeholder="Ex: 2 ovos, pão de queijo e café"
          className="w-full bg-[#11241e] border border-emerald-900/50 rounded-xl p-4 text-emerald-50 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/50 transition-colors mb-6"
        />
        <button 
          type="submit"
          disabled={!text.trim()}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
        >
          Analisar
        </button>
      </form>
    </div>
  );
};

const VoiceFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Auto-start recording
    setRecording(true);
  }, []);

  const handleStop = () => {
    setRecording(false);
    setProcessing(true);
    // Fake processing time
    setTimeout(() => {
      onComplete(['Omelete', 'Suco de laranja']);
    }, 1500);
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
      {processing ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-blue-100 font-medium">Transcrevendo áudio...</p>
        </div>
      ) : (
        <>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-2">Ouvindo...</h3>
          <p className="text-blue-200/50 text-sm mb-8">Fale o que você está prestes a comer.</p>
          <button 
            onClick={handleStop}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-medium border border-white/10"
          >
            Finalizar Gravação
          </button>
        </>
      )}
    </div>
  );
};

const PhotoFlow: React.FC<{ onComplete: (f: string[]) => void }> = ({ onComplete }) => {
  const [captured, setCaptured] = useState(false);
  
  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => {
      onComplete(['Prato de salada', 'Frango grelhado', 'Arroz']);
    }, 2000);
  };

  return (
    <div className="relative h-[400px] bg-black flex flex-col items-center justify-center overflow-hidden">
      {!captured ? (
        <>
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-4 border-2 border-white/20 rounded-2xl flex items-center justify-center">
            <Scan className="w-12 h-12 text-white/30" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-8">
            <button 
              onClick={handleCapture}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
            ></button>
            <p className="text-white/60 text-xs mt-4 uppercase tracking-widest">Alinhe a refeição</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center z-10">
          <div className="w-full h-1 bg-violet-500/20 absolute top-0 left-0 overflow-hidden">
             <div className="w-1/2 h-full bg-violet-500 animate-pulse"></div>
          </div>
          <Scan className="w-12 h-12 text-violet-400 animate-pulse mb-4" />
          <p className="text-violet-100 font-medium">Analisando imagem com IA...</p>
        </div>
      )}
    </div>
  );
};
