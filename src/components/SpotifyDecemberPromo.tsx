import React, { useState } from 'react';
import { X, Music, Sparkles, HeadphonesIcon } from 'lucide-react';

export const SpotifyDecemberPromo = () => {
    const [isVisible, setIsVisible] = useState(() => {
        // Check if user has dismissed this promo today
        const dismissedDate = localStorage.getItem('spotify_promo_dismissed');
        const today = new Date().toDateString();
        return dismissedDate !== today;
    });

    const handleDismiss = () => {
        const today = new Date().toDateString();
        localStorage.setItem('spotify_promo_dismissed', today);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Mobile Version - Sticky Top Banner */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-40 animate-slideDown">
                <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-4 py-3 shadow-lg">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-white/80 hover:text-white p-1"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center space-x-2 pr-8">
                        <Music className="w-5 h-5 text-white animate-bounce" />
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                                <Sparkles className="w-3 h-3 text-yellow-300" />
                                <p className="text-white font-bold text-sm">
                                    🎵 Spotify Terapêutico GRÁTIS
                                </p>
                                <Sparkles className="w-3 h-3 text-yellow-300" />
                            </div>
                            <p className="text-white/90 text-xs mt-0.5">
                                Dez/2024 • Potencialize sua acupressão!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Version - Floating Card */}
            <div className="hidden lg:block fixed bottom-6 right-6 z-50 animate-slideIn">
                <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 max-w-sm transform hover:scale-105 transition-all duration-300">
                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Animated Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                            <div className="relative bg-white/30 backdrop-blur-sm rounded-full p-4">
                                <HeadphonesIcon className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center text-white">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                            <h3 className="text-xl font-bold">
                                Spotify Terapêutico
                            </h3>
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
                            <p className="text-2xl font-bold text-yellow-300">
                                LIVRE em Dezembro!
                            </p>
                        </div>

                        <p className="text-sm text-white/95 mb-4 leading-relaxed">
                            <strong>A música ambiente otimiza a experiência e resultados da imersão</strong> com os pontos de acupressão.
                        </p>

                        <div className="bg-white/10 rounded-lg p-3 mb-4">
                            <p className="text-xs text-white/90">
                                ✅ Potencializa os efeitos terapêuticos<br />
                                ✅ Playlists curadas de meditação<br />
                                ✅ Sincronização perfeita com sessões
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                handleDismiss();
                                // Scroll to feature or open sounds page
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full bg-white text-green-600 font-bold py-3 px-6 rounded-full hover:bg-green-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                        >
                            <Music className="w-5 h-5" />
                            <span>Experimentar Agora</span>
                        </button>

                        <p className="text-xs text-white/70 mt-3">
                            🎁 Oferta limitada ao mês de dezembro
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

// Keyframes for animations (add to your global CSS or Tailwind config)
const styles = `
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.4s ease-out;
}
`;
