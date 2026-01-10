import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface HappyNewYear2026Props {
    onDismiss?: () => void;
    onExploreClick?: () => void;
}

export const HappyNewYear2026: React.FC<HappyNewYear2026Props> = ({ onDismiss, onExploreClick }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-indigo-500/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative px-6 py-12 md:px-12 md:py-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-medium text-yellow-100">Novidade 2026</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight filter drop-shadow-lg">
                        A Evolução da Performance Humana <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">começa pelo Alívio.</span>
                    </h2>

                    <p className="text-lg md:text-xl text-blue-100 font-light leading-relaxed">
                        Acupressão Digital e Neuro-regulação por apenas <span className="font-bold text-yellow-300 text-2xl">$10/mês</span>.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button
                            onClick={onExploreClick}
                            className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                        >
                            ATIVAR ALÍVIO IMEDIATO
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Optional: Right side illustration or extra content */}
                <div className="hidden md:block">
                    <div className="relative w-64 h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full border border-white/10 backdrop-blur-sm flex items-center justify-center animate-pulse">
                        <div className="text-center">
                            <span className="text-6xl">🧘</span>
                            <div className="mt-2 text-white/80 font-medium">Harmonia Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Close Button */}
            {onDismiss && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all z-10"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};
