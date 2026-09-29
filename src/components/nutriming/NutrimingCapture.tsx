import React, { useState } from 'react';
import { Camera, Mic, Search, Star, Scan } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface NutrimingCaptureProps {
  onCaptureInitiated: (method: 'photo' | 'voice' | 'search' | 'favorite' | 'barcode') => void;
}

export const NutrimingCapture: React.FC<NutrimingCaptureProps> = ({ onCaptureInitiated }) => {
  const { t } = useTranslation();
  
  // Animação de entrada suave e premium
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-white mb-2">
          {t('O que alimentou você agora?', 'O que alimentou você agora?')}
        </h2>
        <p className="text-sm text-gray-400">
          {t('Registre em segundos, sem calcular nada.', 'Registre em segundos, sem calcular nada.')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Código de Barras / Rótulo Instantâneo */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onCaptureInitiated('barcode')}
          className="col-span-2 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/30 via-teal-700/20 to-emerald-900/30 hover:from-emerald-500/40 hover:to-teal-600/40 border border-emerald-500/40 rounded-2xl transition-all shadow-lg shadow-emerald-950/30 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-base">Escanear Código de Barras</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Open Food Facts
                </span>
              </div>
              <p className="text-xs text-emerald-200/70">Leitura contínua na câmera do celular</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCaptureInitiated('photo')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-violet-600/20 to-purple-800/20 hover:from-violet-500/30 hover:to-purple-700/30 border border-violet-500/30 rounded-2xl transition-all"
        >
          <Camera className="w-8 h-8 text-violet-400 mb-2" />
          <span className="text-white font-medium text-sm">Fotografar Prato</span>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCaptureInitiated('voice')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-600/20 to-cyan-800/20 hover:from-blue-500/30 hover:to-cyan-700/30 border border-blue-500/30 rounded-2xl transition-all"
        >
          <Mic className="w-8 h-8 text-blue-400 mb-2" />
          <span className="text-white font-medium text-sm">Falar Alimentos</span>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCaptureInitiated('search')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-teal-600/20 to-emerald-800/20 hover:from-teal-500/30 hover:to-emerald-700/30 border border-teal-500/30 rounded-2xl transition-all"
        >
          <Search className="w-8 h-8 text-teal-400 mb-2" />
          <span className="text-white font-medium text-sm">Buscar / Digitar</span>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCaptureInitiated('favorite')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-amber-600/20 to-orange-800/20 hover:from-amber-500/30 hover:to-orange-700/30 border border-amber-500/30 rounded-2xl transition-all relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </div>
          <Star className="w-8 h-8 text-amber-400 mb-2" />
          <span className="text-white font-medium text-sm">Refeição Habitual</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

