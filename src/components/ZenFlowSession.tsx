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

export const ZenFlowSession: React.FC<ZenFlowSessionProps> = ({ sequence, onClose, onComplete }) => {
    const { t } = useLanguage();
    const [phase, setPhase] = useState<SessionPhase>('intro');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [integrationRating, setIntegrationRating] = useState<string | null>(null);

    const currentStep = sequence.steps[currentStepIndex];

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

    // --- RENDERS ---

    // 1. INTRO (Apresentação)
    if (phase === 'intro') {
        return (
            <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <button onClick={onClose} className="absolute top-20 right-6 p-2 rounded-full hover:bg-gray-100 border border-gray-100 shadow-sm">
                    <X className="w-6 h-6 text-gray-500" />
                </button>

                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Wind className="w-10 h-10 text-purple-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">{sequence.title}</h2>
                <p className="text-xl text-purple-600 font-medium mb-6 uppercase tracking-wide">{sequence.subtitle}</p>

                <div className="bg-gray-50 rounded-xl p-6 max-w-sm mb-8">
                    <p className="text-gray-600 italic">"Este movimento ajuda seu corpo a {sequence.type === 'release' ? 'soltar cargas antigas' : 'encontrar seu eixo'}."</p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
                    <span>⏱️ {sequence.durationTotal}</span>
                    <span>•</span>
                    <span>🧘 {sequence.steps.length} movimentos</span>
                </div>

                <button
                    onClick={startSession}
                    className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center"
                >
                    <Play className="w-5 h-5 mr-2 fill-current" /> Iniciar Integração
                </button>
            </div>
        );
    }

    // 2. PREPARATION (Preparação)
    if (phase === 'preparation') {
        return (
            <div className="fixed inset-0 z-[10000] bg-purple-600 flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-20 right-6 p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Sair da Sessão"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
                <h3 className="text-2xl font-bold mb-4">Prepare seu corpo</h3>
                <p className="text-lg opacity-90 mb-8 max-w-md">
                    Encontre uma postura confortável. <br />
                    Solte o peso dos ombros.<br />
                    Deixe o chão te sustentar.
                </p>
                <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
            </div>
        );
    }

    // 3. MOVEMENT (O ZenFlow)
    if (phase === 'movement') {
        return (
            <div className="fixed inset-0 z-[10000] bg-white flex flex-col pt-12">
                {/* Header Minimalista */}
                <div className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button
                        onClick={() => {
                            if (currentStepIndex > 0) {
                                setCurrentStepIndex(prev => prev - 1);
                                setTimeLeft(sequence.steps[currentStepIndex - 1].durationSeconds);
                            } else {
                                setPhase('intro');
                            }
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Passo {currentStepIndex + 1}/{sequence.steps.length}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            {isPaused ? <Play className="w-6 h-6 text-gray-600" /> : <Pause className="w-6 h-6 text-gray-600" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors group"
                            title="Encerrar Sessão"
                        >
                            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo Central */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    {/* Visual Placeholder / Vídeo */}
                    {/* Video / Spotify Embed */}
                    <div className="w-full max-w-md aspect-video bg-gray-100 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden shadow-inner ring-1 ring-gray-200">
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
                                <Play className="w-12 h-12 text-purple-600 relative z-10 opacity-50" />
                                <p className="absolute bottom-4 text-xs text-gray-400 font-mono">VÍDEO EM BREVE</p>
                            </>
                        )}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentStep.name}</h2>

                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg mb-8">
                        {currentStep.instruction}
                    </p>

                    <div className="text-5xl font-mono font-bold text-purple-600 tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Barra de Progresso */}
                <div className="h-2 bg-gray-100 w-full">
                    <div
                        className="h-full bg-purple-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${((sequence.steps[currentStepIndex].durationSeconds - timeLeft) / sequence.steps[currentStepIndex].durationSeconds) * 100}%` }}
                    />
                </div>
            </div>
        );
    }

    // 4. INTENTION (Intenção Ativa)
    if (phase === 'intention') {
        return (
            <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-center p-8 text-center text-white animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-20 right-6 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
                <Zap className="w-12 h-12 mb-6 text-yellow-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">Intenção Ativa</h3>

                <p className="text-3xl md:text-4xl font-serif leading-relaxed mb-12 max-w-2xl">
                    "{sequence.intention}"
                </p>

                <p className="text-sm opacity-70 mb-8">Respire fundo e ancore essa sensação.</p>

                <button
                    onClick={() => setPhase('integration')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-3 rounded-full font-bold transition-all"
                >
                    Continuar
                </button>
            </div>
        );
    }

    // 5. INTEGRATION (Selo)
    if (phase === 'integration') {
        return (
            <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <button onClick={onClose} className="absolute top-20 right-6 p-2 rounded-full hover:bg-gray-100">
                    <X className="w-6 h-6 text-gray-500" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">O que mudou no seu corpo?</h2>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
                    {['Mais Leve', 'Mais Solto', 'Mais Presente', 'Igual'].map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                setIntegrationRating(option);
                                setTimeout(() => setPhase('finish'), 500);
                            }}
                            className={`p-4 rounded-xl border-2 font-medium transition-all ${integrationRating === option
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-600 hover:border-purple-300'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 6. FINISH (Retorno)
    if (phase === 'finish') {
        return (

            <div className="fixed inset-0 z-[10000] bg-green-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ciclo Fechado.</h2>
                <p className="text-gray-600 mb-8">Seu sistema nervoso registrou essa nova informação.</p>

                <button
                    onClick={onComplete}
                    className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                >
                    Voltar ao Fluxo
                </button>
            </div>
        );
    }

    return null;
};
