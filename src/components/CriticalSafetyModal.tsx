import React, { useEffect } from 'react';
import { AlertOctagon, XCircle, AlertTriangle } from 'lucide-react';

interface CriticalSafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
    alertType: 'dosage' | 'interaction';
    title: string;
    message: string;
    details?: string;
}

export const CriticalSafetyModal: React.FC<CriticalSafetyModalProps> = ({
    isOpen,
    onClose,
    alertType,
    title,
    message,
    details
}) => {
    useEffect(() => {
        if (isOpen) {
            // Tocar som de alerta
            const audio = new Audio('/sounds/alert.mp3'); // Fallback se não existir
            // Usar oscilador se arquivo não existir (mais garantido)
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.value = 200;
                gain.gain.value = 0.1;
                osc.start();

                // Modulação de sirene
                const now = ctx.currentTime;
                osc.frequency.linearRampToValueAtTime(800, now + 0.1);
                osc.frequency.linearRampToValueAtTime(200, now + 0.2);
                osc.frequency.linearRampToValueAtTime(800, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.stop(now + 0.5);
            } catch (e) {
                console.error('Audio context error', e);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-xl animate-in fade-in duration-200">
            {/* Overlay piscante */}
            <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-8 border-red-600 animate-in zoom-in-95 duration-200 relative z-10 transform hover:scale-[1.02] transition-transform">

                {/* Header Vermelho */}
                <div className="bg-red-600 p-6 flex items-center justify-center flex-col text-white">
                    <div className="bg-white/20 p-4 rounded-full mb-3 animate-pulse">
                        <AlertOctagon className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-wider">
                        {alertType === 'dosage' ? 'SOBREDOSE DETECTADA' : 'INTERAÇÃO PERIGOSA'}
                    </h2>
                </div>

                {/* Conteúdo */}
                <div className="p-8 text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {title}
                    </h3>

                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-left">
                        <p className="text-red-800 font-medium text-lg mb-2">
                            ⚠️ Ação Necessária:
                        </p>
                        <p className="text-gray-800 text-base leading-relaxed">
                            {message}
                        </p>
                        {details && (
                            <p className="text-sm text-gray-600 mt-2 border-t border-red-100 pt-2 italic">
                                "{details}"
                            </p>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">
                        O Nutriming bloqueou esta ação para sua segurança baseada nas diretrizes da ANVISA/FDA.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all transform hover:scale-105"
                    >
                        Entendi o Risco
                    </button>
                </div>
            </div>
        </div>
    );
};
