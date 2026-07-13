import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle, ArrowRight, ArrowLeft, X, Heart, Wind, Zap, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ZenFlowSequence, ZenFlowStep } from '../data/zenFlowExercises';

interface ZenFlowSessionProps {
    sequence: ZenFlowSequence;
    onClose: () => void;
    onComplete: () => void;
}

// Fases da Sessão ZenFlow
type SessionPhase =
    | 'intro'         // Tela 3: Apresentação da Sequência
    | 'preparation'   // Tela 4: Preparação do corpo
    | 'movement'      // Tela 5: Movimento Guiado
    | 'intention'     // Tela 6: Intenção Ativa
    | 'integration'   // Tela 7: Selo de Integração (O que mudou?)
    | 'finish';       // Tela 8: Retorno ao Eixo

// Helper para mapeamento de cromoterapia e fundos de natureza baseados no Elemento / Emoção
const getChromotherapySettings = (sequenceId: string = '', type: string = '') => {
    const id = sequenceId.toLowerCase();
    
    // Madeira (Fígado / Raiva) -> Verde Floresta / Imagem de Natureza
    if (id.includes('liver') || id.includes('wood') || id.includes('madeira') || id.includes('rel-liver')) {
        return {
            bg: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
            overlay: "from-emerald-950/90 to-teal-950/92",
            accent: "text-emerald-400",
            border: "border-emerald-500/30",
            buttonBg: "bg-emerald-600 hover:bg-emerald-500",
        };
    }
    
    // Fogo (Ansiedade / Estresse) -> Sedado com Ciano/Turquesa Calmo do Mar
    if (id.includes('calm') || id.includes('fire') || id.includes('ansiedade') || id.includes('reg-calm')) {
        return {
            bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            overlay: "from-cyan-950/90 to-blue-950/92",
            accent: "text-cyan-400",
            border: "border-cyan-500/30",
            buttonBg: "bg-cyan-600 hover:bg-cyan-500",
        };
    }
    
    // Terra (Preocupação / Dispersão) -> Amarelo/Dourado Quente dos Campos
    if (id.includes('ground') || id.includes('earth') || id.includes('preocupação') || id.includes('reg-ground')) {
        return {
            bg: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
            overlay: "from-amber-950/90 to-yellow-950/92",
            accent: "text-amber-400",
            border: "border-amber-500/30",
            buttonBg: "bg-amber-600 hover:bg-amber-500",
        };
    }
    
    // Metal (Tristeza / Luto) -> Tons de Névoa / Prata / Montanhas
    if (id.includes('chest') || id.includes('metal') || id.includes('tristeza') || id.includes('rel-chest')) {
        return {
            bg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
            overlay: "from-slate-900/90 to-zinc-950/92",
            accent: "text-blue-300",
            border: "border-slate-500/30",
            buttonBg: "bg-slate-700 hover:bg-slate-600",
        };
    }
    
    // Água (Medo / Insegurança) -> Azul Profundo / Oceano
    if (id.includes('kidney') || id.includes('water') || id.includes('medo') || id.includes('rel-kidney')) {
        return {
            bg: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80",
            overlay: "from-blue-950/95 to-indigo-950/95",
            accent: "text-blue-400",
            border: "border-blue-500/30",
            buttonBg: "bg-blue-600 hover:bg-blue-500",
        };
    }
    
    // Integração (Geral / Violeta para espiritualidade)
    return {
        bg: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
        overlay: "from-purple-950/90 to-indigo-950/92",
        accent: "text-purple-400",
        border: "border-purple-500/30",
        buttonBg: "bg-purple-600 hover:bg-purple-500",
    };
};

export const ZenFlowSession: React.FC<ZenFlowSessionProps> = ({ sequence, onClose, onComplete }) => {
    const { t } = useLanguage();
    const [phase, setPhase] = useState<SessionPhase>('intro');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [integrationRating, setIntegrationRating] = useState<string | null>(null);

    const currentStep = sequence.steps[currentStepIndex];
    const settings = getChromotherapySettings(sequence.id, sequence.type);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (phase === 'movement' && timeLeft > 0 && !isPaused) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleStepComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [phase, timeLeft, isPaused]);

    const handleStepComplete = () => {
        import('../lib/audio').then(({ playTibetanBell }) => playTibetanBell());

        if (currentStepIndex < sequence.steps.length - 1) {
            // Próximo passo
            setCurrentStepIndex(prev => prev + 1);
            setTimeLeft(sequence.steps[currentStepIndex + 1].durationSeconds);
        } else {
            // Fim dos movimentos -> Intenção
            setPhase('intention');
            setTimeLeft(20); // Tempo para ler/sentir a intenção
        }
    };

    const startSession = () => {
        setPhase('preparation');
        setTimeLeft(10); // 10s para preparação

        // Auto-advance prep
        setTimeout(() => {
            setPhase('movement');
            setTimeLeft(sequence.steps[0].durationSeconds);
        }, 10000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper to render wrapper with chromotherapy background & blur overlays
    const renderPageWrapper = (content: React.ReactNode) => {
        return (
            <div 
                className="fixed inset-0 z-[10000] flex flex-col justify-between animate-fade-in text-white overflow-y-auto"
                style={{ 
                    backgroundImage: `url(${settings.bg})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            >
                {/* Gradient Chromotherapy Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${settings.overlay} z-0`} />
                
                {/* Content Area */}
                <div className="relative z-10 flex-1 flex flex-col justify-between min-h-screen">
                    {content}
                </div>
            </div>
        );
    };

    // --- RENDERS ---

    // 1. INTRO (Apresentação)
    if (phase === 'intro') {
        return renderPageWrapper(
            <>
                {/* Top Nav */}
                <div className="p-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all active:scale-95"
                        title="Fechar"
                    >
                        <X className="w-5 h-5 text-white/95" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
                    <div className="w-20 h-20 bg-white/10 border border-white/15 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                        <Wind className={`w-10 h-10 ${settings.accent}`} />
                    </div>

                    <h2 className="text-4xl font-extrabold mb-3 tracking-tight">{sequence.title}</h2>
                    <p className={`text-lg font-bold uppercase tracking-wider mb-8 ${settings.accent}`}>
                        {sequence.subtitle}
                    </p>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 w-full shadow-lg">
                        <p className="text-white/80 italic text-base leading-relaxed">
                            "Este movimento ajuda seu corpo a {sequence.type === 'release' ? 'soltar cargas antigas e aliviar tensões' : 'encontrar seu eixo, centrar e equilibrar'}."
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/60 mb-8 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <span className="flex items-center gap-1">⏱️ {sequence.durationTotal}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">🧘 {sequence.steps.length} movimentos</span>
                    </div>

                    <button
                        onClick={startSession}
                        className={`text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${settings.buttonBg}`}
                    >
                        <Play className="w-5 h-5 fill-current" /> Iniciar Integração
                    </button>
                </div>

                <div className="h-16" />
            </>
        );
    }

    // 2. PREPARATION (Preparação)
    if (phase === 'preparation') {
        return renderPageWrapper(
            <>
                <div className="p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all active:scale-95"
                        title="Sair da Sessão"
                    >
                        <X className="w-5 h-5 text-white/95" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                    <h3 className="text-3xl font-extrabold mb-6">Prepare seu corpo</h3>
                    <p className="text-lg text-white/90 mb-10 leading-relaxed">
                        Encontre uma postura confortável.<br />
                        Solte o peso dos ombros.<br />
                        Deixe o chão te sustentar.
                    </p>
                    <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                </div>

                <div className="h-16" />
            </>
        );
    }

    // 3. MOVEMENT (O ZenFlow)
    if (phase === 'movement') {
        return renderPageWrapper(
            <>
                {/* Header Minimalista */}
                <div className="p-6 flex justify-between items-center bg-black/10 backdrop-blur-md border-b border-white/10">
                    <button
                        onClick={() => {
                            if (currentStepIndex > 0) {
                                setCurrentStepIndex(prev => prev - 1);
                                setTimeLeft(sequence.steps[currentStepIndex - 1].durationSeconds);
                            } else {
                                setPhase('intro');
                            }
                        }}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/90" />
                    </button>

                    <div className="text-xs font-bold text-white/60 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        Passo {currentStepIndex + 1}/{sequence.steps.length}
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsPaused(!isPaused)} 
                            className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-colors"
                        >
                            {isPaused ? <Play className="w-5 h-5 text-white/90 fill-current" /> : <Pause className="w-5 h-5 text-white/90" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 transition-colors"
                            title="Encerrar Sessão"
                        >
                            <X className="w-5 h-5 text-red-350" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo Central */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full">
                    {/* Video / Spotify Embed Container com Glassmorphism */}
                    <div className="w-full max-w-md aspect-video bg-white/5 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/10">
                        {sequence.spotifyEmbedUrl ? (
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src={sequence.spotifyEmbedUrl}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                        ) : (
                            <>
                                <div className={`w-32 h-32 bg-purple-500 rounded-full opacity-20 absolute animate-ping ${isPaused ? 'paused' : ''}`} style={{ animationDuration: '3s' }}></div>
                                <div className={`w-24 h-24 bg-purple-600 rounded-full opacity-30 absolute animate-pulse ${isPaused ? 'paused' : ''}`} style={{ animationDuration: '3s' }}></div>
                                <Play className="w-12 h-12 text-purple-400 relative z-10 opacity-50" />
                                <p className="absolute bottom-4 text-xs text-white/40 font-mono">VÍDEO EM BREVE</p>
                            </>
                        )}
                    </div>

                    <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">{currentStep.name}</h2>

                    <p className="text-lg text-white/85 leading-relaxed max-w-lg mb-8 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                        {currentStep.instruction}
                    </p>

                    <div className={`text-6xl font-mono font-bold tabular-nums drop-shadow-md ${settings.accent}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Barra de Progresso */}
                <div className="h-2 bg-white/10 w-full border-t border-white/5">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${
                            sequence.id.includes('liver') ? 'bg-emerald-400' :
                            sequence.id.includes('calm') ? 'bg-cyan-400' :
                            sequence.id.includes('ground') ? 'bg-amber-400' : 'bg-purple-400'
                        }`}
                        style={{ width: `${((sequence.steps[currentStepIndex].durationSeconds - timeLeft) / sequence.steps[currentStepIndex].durationSeconds) * 100}%` }}
                    />
                </div>
            </>
        );
    }

    // 4. INTENTION (Intenção Ativa)
    if (phase === 'intention') {
        return renderPageWrapper(
            <>
                <div className="p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                    >
                        <X className="w-5 h-5 text-white/95" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
                    <Zap className="w-12 h-12 mb-6 text-yellow-400 animate-bounce" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Intenção Ativa</h3>

                    <p className="text-3xl md:text-4xl font-serif italic leading-relaxed mb-12 drop-shadow">
                        "{sequence.intention}"
                    </p>

                    <p className="text-sm text-white/70 mb-8">Respire fundo e ancore essa sensação em seu corpo.</p>

                    <button
                        onClick={() => setPhase('integration')}
                        className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-10 py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                        Continuar
                    </button>
                </div>

                <div className="h-16" />
            </>
        );
    }

    // 5. INTEGRATION (Selo)
    if (phase === 'integration') {
        return renderPageWrapper(
            <>
                <div className="p-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                    >
                        <X className="w-5 h-5 text-white/95" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-extrabold mb-10 tracking-tight">O que mudou no seu corpo?</h2>

                    <div className="grid grid-cols-2 gap-4 w-full mb-12">
                        {['Mais Leve', 'Mais Solto', 'Mais Presente', 'Igual'].map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    setIntegrationRating(option);
                                    setTimeout(() => setPhase('finish'), 500);
                                }}
                                className={`p-4 rounded-2xl border-2 font-semibold transition-all backdrop-blur-md ${
                                    integrationRating === option
                                    ? 'border-white bg-white text-gray-900 shadow-xl scale-102'
                                    : 'border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-16" />
            </>
        );
    }

    // 6. FINISH (Retorno e Navegação do Ciclo)
    if (phase === 'finish') {
        return renderPageWrapper(
            <>
                <div className="p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                    >
                        <X className="w-5 h-5 text-white/95" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
                    <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Ciclo Fechado.</h2>
                    <p className="text-white/80 mb-10 text-base leading-relaxed">
                        Seu sistema nervoso registrou essa nova informação com sucesso.
                    </p>

                    {/* Navigation Buttons for therapeutic cycle */}
                    <div className="flex flex-col gap-3.5 w-full">
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'nutriming-ai' }));
                                onClose();
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span>🥗</span> Avançar para Nutrição (Nutriming)
                        </button>

                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'home' }));
                                onClose();
                            }}
                            className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3.5 rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Voltar ao Menu Principal
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full text-white/50 hover:text-white text-sm font-semibold transition-colors py-2"
                        >
                            Voltar às Sequências de ZenFlow
                        </button>
                    </div>
                </div>

                <div className="h-16" />
            </>
        );
    }

    return null;
};
