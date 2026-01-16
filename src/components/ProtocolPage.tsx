import React, { useState, useEffect } from 'react';
import { Play, Clock, ChevronRight, ArrowLeft, CheckCircle, Info, Brain, Moon, Zap, Move, Smile, UserCheck, Hand, Shield, Coffee, Sparkles, RotateCcw, Utensils, XCircle, Home } from 'lucide-react';
import { protocols } from '../data/protocols';
import { acupressurePoints } from '../data/acupressurePoints';
import { Protocol, ProtocolStep } from '../types';

import { useAuth } from '../contexts/AuthContext';

interface ProtocolPageProps {
    onPageChange: (page: string) => void;
}

export const ProtocolPage: React.FC<ProtocolPageProps> = ({ onPageChange }) => {
    const { user } = useAuth();
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
    const [activeStepIndex, setActiveStepIndex] = useState<number>(-1); // -1 means overview, 0+ means active step
    const [timer, setTimer] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Icon mapping
    const getIcon = (name: string) => {
        switch (name) {
            case 'Brain': return <Brain className="w-12 h-12" />;
            case 'Moon': return <Moon className="w-12 h-12" />;
            case 'Zap': return <Zap className="w-12 h-12" />;
            case 'Move': return <Move className="w-12 h-12" />;
            case 'Smile': return <Smile className="w-12 h-12" />;
            case 'UserCheck': return <UserCheck className="w-12 h-12" />;
            case 'Hand': return <Hand className="w-12 h-12" />;
            case 'Shield': return <Shield className="w-12 h-12" />;
            case 'Coffee': return <Coffee className="w-12 h-12" />;
            case 'Sparkles': return <Sparkles className="w-12 h-12" />;
            default: return <Brain className="w-12 h-12" />;
        }
    };

    const getThemeColor = (color: string) => {
        const colors: Record<string, string> = {
            purple: 'from-purple-500 to-indigo-600',
            blue: 'from-blue-500 to-cyan-600',
            green: 'from-emerald-500 to-teal-600',
            orange: 'from-orange-400 to-amber-600',
            teal: 'from-teal-400 to-emerald-600',
            red: 'from-red-500 to-pink-600',
        };
        return colors[color] || colors.purple;
    };

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const startProtocol = (protocol: Protocol) => {
        setSelectedProtocol(protocol);
        setActiveStepIndex(-1); // Start at overview
    };

    const startStep = (index: number) => {
        if (!selectedProtocol) return;
        setActiveStepIndex(index);
        setTimer(selectedProtocol.steps[index].durationSeconds);
        setIsTimerRunning(true);
    };

    const nextStep = () => {
        if (!selectedProtocol) return;
        if (activeStepIndex < selectedProtocol.steps.length - 1) {
            startStep(activeStepIndex + 1);
        } else {
            // Finished
            setActiveStepIndex(selectedProtocol.steps.length); // Completion screen
        }
    };

    const prevStep = () => {
        if (activeStepIndex > 0) {
            startStep(activeStepIndex - 1);
        } else {
            setActiveStepIndex(-1);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- RENDER: LIST MDOE ---
    if (!selectedProtocol) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back to Home Button */}
                    <button
                        onClick={() => onPageChange('home')}
                        className="mb-8 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group"
                    >
                        <div className="p-2 bg-white rounded-full shadow-md group-hover:shadow-lg transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Voltar ao Início</span>
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Sessões Otimizadas</h1>
                        <p className="text-gray-600">Protocolos guiados para suas principais necessidades.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {protocols.map((protocol) => (
                            <div
                                key={protocol.id}
                                onClick={() => {
                                    if (protocol.isPremium && !user?.isPremium) {
                                        alert('Este protocolo é exclusivo para assinantes Premium.');
                                        return;
                                    }
                                    startProtocol(protocol);
                                }}
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.02] hover:shadow-xl relative ${protocol.isPremium ? 'border-2 border-yellow-400' : ''}`}
                            >
                                {protocol.isPremium && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm z-10">
                                        <span className="mr-1">🔒</span> PREMIUM
                                    </div>
                                )}
                                <div className={`h-2 bg-gradient-to-r ${getThemeColor(protocol.colorTheme)}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gray-50 text-${protocol.colorTheme}-600`}>
                                            {getIcon(protocol.iconName)}
                                        </div>
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {Math.ceil(protocol.steps.reduce((acc, step) => acc + step.durationSeconds, 0) / 60)} min
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{protocol.title}</h3>
                                    <p className="text-sm text-indigo-600 font-medium mb-3 uppercase tracking-wider">{protocol.subtitle}</p>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{protocol.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {protocol.benefits.slice(0, 2).map((benefit, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: OVERVIEW MODE ---
    if (activeStepIndex === -1) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-20 px-4">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => setSelectedProtocol(null)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
                    </button>

                    <div className="text-center mb-8">
                        <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${getThemeColor(selectedProtocol.colorTheme)} text-white mb-4 shadow-lg`}>
                            {getIcon(selectedProtocol.iconName)}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProtocol.title}</h1>
                        <p className="text-indigo-600 font-medium uppercase tracking-wide">{selectedProtocol.subtitle}</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h3 className="font-semibold text-gray-900 mb-2">Sobre esta Jornada</h3>
                        <p className="text-gray-600 mb-4">{selectedProtocol.description}</p>

                        {selectedProtocol.breathingOptimization && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-l-4 border-cyan-500">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {selectedProtocol.breathingOptimization}
                                </p>
                            </div>
                        )}

                        <h3 className="font-semibold text-gray-900 mb-2">Esta sequência ajuda com:</h3>
                        <ul className="space-y-2">
                            {selectedProtocol.benefits.map((b, i) => (
                                <li key={i} className="flex items-center text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> {b}
                                </li>
                            ))}
                        </ul>
                        {selectedProtocol.soundtrack && (
                            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="p-2 bg-indigo-100 rounded-lg mr-4 text-indigo-600">
                                        <span className="text-2xl">🎧</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-900 text-sm uppercase tracking-wide mb-1">Sugestão Sonora</h4>
                                        <p className="text-indigo-700 font-medium">{selectedProtocol.soundtrack.genre.replace('-', ' ').toUpperCase()}</p>
                                        <p className="text-gray-600 text-sm mt-1">{selectedProtocol.soundtrack.description}</p>
                                    </div>
                                </div>
                                {selectedProtocol.soundtrack.spotifyUrl && (
                                    <a
                                        href={selectedProtocol.soundtrack.spotifyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase rounded-full shadow transition-colors flex items-center"
                                    >
                                        Spotify ↗
                                    </a>
                                )}
                            </div>
                        )}
                        {selectedProtocol.nutrition && (
                            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg mr-3 text-green-600">
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-semibold text-green-900 text-sm uppercase tracking-wide">Nutrição Funcional</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center"><XCircle className="w-3 h-3 mr-1" /> Evitar</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {selectedProtocol.nutrition.avoid.map((item, i) => (
                                                <li key={i}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-600 uppercase mb-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Recomendo</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {selectedProtocol.nutrition.recommend.map((item, i) => (
                                                <li key={i}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <p className="text-xs text-green-700 italic bg-green-100/50 p-2 rounded-lg">
                                    💡 <strong>Dica da Nutri:</strong> {selectedProtocol.nutrition.tip}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => startStep(0)}
                        className={`w-full py-4 rounded-xl bg-gradient-to-r ${getThemeColor(selectedProtocol.colorTheme)} text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center`}
                    >
                        <Play className="w-6 h-6 mr-2 fill-current" /> Começar Jornada
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: COMPLETION MODE ---
    if (activeStepIndex === selectedProtocol.steps.length) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-20 px-4 flex items-center justify-center text-center">
                <div className="max-w-lg">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Jornada Concluída!</h2>
                    <p className="text-gray-600 mb-8">Você completou o protocolo <strong>{selectedProtocol.title}</strong>. Tire um momento para sentir os efeitos no seu corpo.</p>
                    <button
                        onClick={() => setSelectedProtocol(null)}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
                    >
                        Voltar para Jornadas
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: PLAYER MODE ---
    const currentStep = selectedProtocol.steps[activeStepIndex];
    const pointData = acupressurePoints.find(p => p.id === currentStep.pointId);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between">
                <button onClick={() => startProtocol(selectedProtocol)} className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="text-sm font-medium text-gray-500">
                    Passo {activeStepIndex + 1} de {selectedProtocol.steps.length}
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Point Visual */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div
                    onClick={() => pointData?.image && setZoomedImage(pointData.image)}
                    className="w-full max-w-xs aspect-square bg-white rounded-3xl overflow-hidden mb-8 relative shadow-xl border-4 border-white ring-1 ring-gray-100 cursor-zoom-in transition-transform hover:scale-105"
                >
                    {pointData?.image ? (
                        <img src={pointData.image} alt={pointData.imageAlt} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">Imagem não disponível</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 border-t border-gray-100">
                        <p className="font-bold text-lg text-gray-900 flex items-center justify-center gap-2">
                            {pointData?.name || currentStep.pointId} <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Zoom 🔍</span>
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{pointData?.name.split('(')[0]}</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md">
                    {currentStep.customInstructions || pointData?.instructions || "Pressione firmemente."}
                </p>

                {/* Timer */}
                <div className="flex flex-col items-center mb-8">
                    <div className="text-6xl font-mono font-bold tracking-wider mb-4 tabular-nums text-gray-900">
                        {formatTime(timer)}
                    </div>
                    <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`px-8 py-3 rounded-full font-bold transition-all shadow-md flex items-center gap-2 ${isTimerRunning
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isTimerRunning ? <span className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-600 rounded-sm" /> Pausar</span> : timer === 0 ? <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reiniciar</span> : <span className="flex items-center gap-2"><Play className="w-4 h-4 fill-current" /> Continuar</span>}
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-white border-t border-gray-200">
                <button
                    onClick={nextStep}
                    className={`w-full py-4 rounded-xl bg-gradient-to-r ${getThemeColor(selectedProtocol.colorTheme)} text-white font-bold text-xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-y-0.5`}
                >
                    {activeStepIndex < selectedProtocol.steps.length - 1 ? (
                        <>Próximo Passo <ChevronRight className="ml-2 w-6 h-6" /></>
                    ) : (
                        <>Concluir <CheckCircle className="ml-2 w-6 h-6" /></>
                    )}
                </button>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors z-[101]"
                        onClick={() => setZoomedImage(null)}
                    >
                        <XCircle className="w-8 h-8" />
                    </button>
                    <img
                        src={zoomedImage}
                        alt="Zoomed Point"
                        className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain cursor-zoom-out"
                    // Removed stopPropagation so clicking the image also closes it (better UX for mobile)
                    />
                    <p className="absolute bottom-10 left-0 right-0 text-center text-white/70 text-sm pointer-events-none">
                        Toque na tela para fechar
                    </p>
                </div>
            )}
        </div>
    );
};
