import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Music, Heart, Play, Sparkles } from 'lucide-react';


export const BuddhistGuideWidget = () => {
    const [isExpanded, setIsExpanded] = useState(() => {
        // Auto-expand for first-time users
        const hasSeenGuide = localStorage.getItem('xzenpress_guide_seen');
        return !hasSeenGuide;
    });

    const [isDismissed, setIsDismissed] = useState(() => {
        const dismissedDate = localStorage.getItem('guide_widget_dismissed');
        const today = new Date().toDateString();
        return dismissedDate === today;
    });

    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            icon: <Music className="w-6 h-6 text-green-500" />,
            title: "1️⃣ Som Terapêutico",
            description: "Adeque o Spotify livre de dezembro para potencializar sua experiência",
            color: "from-green-500 to-emerald-500",
            emoji: "🎵"
        },
        {
            icon: <Heart className="w-6 h-6 text-purple-500" />,
            title: "2️⃣ Escolha sua Técnica",
            description: "Acupressão Integrada (pontos) ou Respiração Guiada (4-7-8)",
            color: "from-purple-500 to-pink-500",
            emoji: "🧘"
        },
        {
            icon: <Sparkles className="w-6 h-6 text-blue-500" />,
            title: "3️⃣ Adeque seu Objetivo",
            description: "Escolha o ponto de acupressão ideal para sua necessidade atual",
            color: "from-blue-500 to-cyan-500",
            emoji: "🎯"
        },
        {
            icon: <Play className="w-6 h-6 text-orange-500" />,
            title: "4️⃣ Inicie a Terapia",
            description: "Relaxe e deixe a energia fluir. Namastê! 🙏",
            color: "from-orange-500 to-red-500",
            emoji: "✨"
        },
        {
            icon: <Heart className="w-6 h-6 text-fuchsia-600" />,
            title: "5️⃣ Seja Grato",
            description: "Seja grato pela experiência humana vivida, oferecemos uma reconexão...",
            color: "from-fuchsia-600 to-pink-600",
            emoji: "🙏"
        }
    ];

    const handleDismiss = () => {
        const today = new Date().toDateString();
        localStorage.setItem('guide_widget_dismissed', today);
        localStorage.setItem('xzenpress_guide_seen', 'true');
        setIsDismissed(true);
    };

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            localStorage.setItem('xzenpress_guide_seen', 'true');
        }
    };

    if (isDismissed) return null;

    return (
        <>
            {/* Mobile Version - Bottom Sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <div className={`bg-gradient-to-br from-purple-50 to-blue-50 border-t-4 border-purple-500 shadow-2xl transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-16'
                    }`}>
                    {/* Header - Always Visible */}
                    <div
                        onClick={handleToggle}
                        className="flex items-center justify-between p-4 cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                            {/* Buddhist Robot Avatar */}
                            <div className="relative">
                                <img
                                    src="/buddhist-robot.png"
                                    alt="Robô Budista Zen"
                                    className="w-10 h-10 rounded-full object-cover shadow-lg"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-xs">
                                    🙏
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Guia Zen</p>
                                <p className="text-xs text-gray-600">5 passos simples</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isExpanded && (
                                <span className="text-xs text-purple-600 font-semibold animate-pulse">
                                    Toque aqui
                                </span>
                            )}
                            <button className="text-purple-600 p-1">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-80">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all ${currentStep === index
                                        ? 'bg-white shadow-lg scale-105 border-2 border-purple-400'
                                        : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-1">{step.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-sm mb-1">{step.title}</h4>
                                            <p className="text-xs text-gray-600">{step.description}</p>
                                        </div>
                                        <span className="text-2xl">{step.emoji}</span>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleDismiss}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-full text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                                Entendi! ✨
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Version - Floating Widget */}
            <div className="hidden lg:block fixed bottom-6 left-6 z-50">
                <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-2xl transition-all duration-300 ${isExpanded ? 'w-96' : 'w-64'
                    }`}>
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl p-4">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center space-x-3">
                            {/* Buddhist Robot Avatar - Animated */}
                            <div className="relative">
                                <img
                                    src="/buddhist-robot.png"
                                    alt="Robô Budista Zen"
                                    className="w-12 h-12 rounded-full object-cover shadow-lg animate-bounce"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <span className="text-xs">🙏</span>
                                </div>
                            </div>
                            <div className="text-white">
                                <h3 className="font-bold text-lg">Guia Zen</h3>
                                <p className="text-xs text-white/90">Seu assistente de bem-estar</p>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={handleToggle}
                        className="w-full bg-purple-100 hover:bg-purple-200 py-2 text-center text-sm font-semibold text-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <span>{isExpanded ? 'Minimizar' : 'Como Começar'}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>

                    {/* Steps Content */}
                    {isExpanded && (
                        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600 italic">
                                    "O caminho para o bem-estar tem 5 passos simples..."
                                </p>
                            </div>

                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${currentStep === index
                                        ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-xl scale-105'
                                        : 'bg-white hover:bg-gray-50 text-gray-800'
                                        }`}
                                >
                                    {currentStep === index && (
                                        <div className="absolute -right-2 -top-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                            <span className="text-xs">✨</span>
                                        </div>
                                    )}

                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-1 ${currentStep === index ? 'text-white' : ''}`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-sm mb-1 ${currentStep === index ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                {step.title}
                                            </h4>
                                            <p className={`text-xs ${currentStep === index ? 'text-white/90' : 'text-gray-600'
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>
                                        <span className="text-2xl">{step.emoji}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center space-x-2 py-3">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setCurrentStep(index)}
                                        className={`h-2 rounded-full cursor-pointer transition-all ${currentStep === index
                                            ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleDismiss}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                                Começar Jornada ✨
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-2">
                                🙏 Namastê
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
