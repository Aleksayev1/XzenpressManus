import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NutrimingConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
  extractedFoods: string[];
}

export const NutrimingConfirmationModal: React.FC<NutrimingConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onReject,
  extractedFoods
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onReject}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gray-900 border border-gray-700 rounded-3xl p-6 shadow-2xl z-10 w-full max-w-md"
          >
            <h3 className="text-xl font-medium text-white mb-4 text-center">
              É isso que você comeu?
            </h3>
            
            <div className="bg-gray-800 rounded-2xl p-4 mb-6">
              <ul className="space-y-2">
                {extractedFoods.map((food, index) => (
                  <li key={index} className="text-gray-300 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                    {food}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={onReject}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors flex justify-center items-center font-medium"
              >
                <X className="w-5 h-5 mr-2" />
                Editar
              </button>
              
              <button 
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex justify-center items-center font-medium shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
