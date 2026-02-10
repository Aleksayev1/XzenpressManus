import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Brain, Zap, Activity, Send, Loader2, Sparkles, X, Crown } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { emotionalStates, type EmotionalState } from '../data/emotionalMapping';
import { acupressurePoints } from '../data/acupressurePoints';
import { zenFlowExercises } from '../data/zenFlowExercises';
import { useAuth } from '../contexts/AuthContext';
import { useSessionHistory } from '../hooks/useSessionHistory';

// Internal components for the phases
import { EmotionalCheckIn } from './EmotionalCheckIn';

type SessionPhase = 'checkin' | 'insight' | 'preparation' | 'acupressure' | 'zenflow' | 'summary';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const SessaoMestraPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const { recordSession } = useSessionHistory();
    const [phase, setPhase] = useState<SessionPhase>('checkin'); // Start with Check-in
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
    const [intensity, setIntensity] = useState<number>(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    // Usage Limit State
    const [usageCount, setUsageCount] = useState(0);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const USAGE_LIMIT = 3;

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [zenFlowStepIndex, setZenFlowStepIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (phase === 'zenflow') {
                const exercise = selectedEmotion?.zenFlowExerciseId
                    ? zenFlowExercises.find(z => z.id === selectedEmotion?.zenFlowExerciseId)
                    : zenFlowExercises[0];

                if (exercise && zenFlowStepIndex < exercise.steps.length - 1) {
                    const nextStep = zenFlowStepIndex + 1;
                    setZenFlowStepIndex(nextStep);
                    setTimeLeft(exercise.steps[nextStep].durationSeconds);
                } else {
                    setIsTimerActive(false);
                }
            } else {
                setIsTimerActive(false);
            }
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft, phase, zenFlowStepIndex, selectedEmotion]);

    // Reset Timer on Phase/Step Change
    useEffect(() => {
        if (phase === 'acupressure') {
            setTimeLeft(60); // 1 minute per point
            setIsTimerActive(true);
        } else if (phase === 'zenflow') {
            const exercise = selectedEmotion?.zenFlowExerciseId
                ? zenFlowExercises.find(z => z.id === selectedEmotion?.zenFlowExerciseId)
                : zenFlowExercises[0];
            if (exercise) {
                setZenFlowStepIndex(0);
                setTimeLeft(exercise.steps[0].durationSeconds);
                setIsTimerActive(true);
            }
        } else {
            setIsTimerActive(false);
        }
    }, [phase, currentPointIndex]);

    const toggleTimer = () => setIsTimerActive(!isTimerActive);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const count = parseInt(localStorage.getItem('sessao_mestra_usage_count') || '0');
        setUsageCount(count);
    }, []);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize from LocalStorage (if navigated from Home Check-In)
    useEffect(() => {
        try {
            const saved = localStorage.getItem('last_emotional_checkin');
            if (saved) {
                const data = JSON.parse(saved);
                const checkinTime = new Date(data.timestamp).getTime();
                const now = new Date().getTime();
                // Valid for 1 hour
                if ((now - checkinTime) < 60 * 60 * 1000 && data.emotionId) {
                    const emotion = emotionalStates.find(e => e.id === data.emotionId);
                    if (emotion && !selectedEmotion) { // Only if not already selected
                        setSelectedEmotion(emotion);
                        setIntensity(data.intensity);
                        setPhase('insight');
                        initiateChat(emotion, data.intensity);
                    }
                }
            }
        } catch (e) {
            console.error("Error reading saved session", e);
        }
    }, []);

    // Handle Check-in Selection
    const handleCheckInComplete = (emotionId: string, intensityValue: number) => {
        // Check Limit for Free Users
        if (!user?.isPremium && usageCount >= USAGE_LIMIT) {
            setShowLimitModal(true);
            return;
        }

        const emotion = emotionalStates.find(e => e.id === emotionId);
        if (emotion) {
            setSelectedEmotion(emotion);
            setIntensity(intensityValue);
            setPhase('insight');

            // Seed the chat with the context
            initiateChat(emotion, intensityValue);
        }
    };

    const initiateChat = async (emotion: EmotionalState, intensity: number) => {
        setIsLoading(true);
        const seedMessage = `OLÁ. Identifiquei que estou sentindo **${emotion.namePortuguese}** (Nível ${intensity}/5). 
        Isso está ligado ao órgão **${emotion.mtcOrgan}** (${emotion.mtcElement}).
        Por favor, me ajude a encontrar a causa moral ou metafísica disso (Valcapelli/Kwitko) de forma acolhedora.`;

        // Add hidden user message to history (or just system context)
        // We simulate the AI greeting based on this context

        try {
            // Call AI Endpoint
            const response = await fetch('/.netlify/functions/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: seedMessage,
                    conversationHistory: [], // Fresh start
                    userEmail: user?.email || 'guest',
                    isPremium: user?.isPremium || false
                })
            });

            const data = await response.json();
            if (data.reply) {
                setMessages([{
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.warn("Offline/Localhost mode: AI unavailable. Using fallback.");
            // Fallback generic greeting for offline mode
            setMessages([{
                role: 'assistant',
                content: `(Modo Offline) Olá. Percebo que você está sentindo **${emotion.namePortuguese}** (Nível ${intensity}/5).\n\nComo estamos sem conexão com o servidor de IA, vamos focar no que seu corpo diz. Como essa emoção está se manifestando fisicamente agora?`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await fetch('/.netlify/functions/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    conversationHistory: history,
                    userEmail: user?.email,
                    isPremium: user?.isPremium
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
        } catch (e) {
            console.warn("Offline/Localhost mode: AI unavailable. Using fallback.");
            // Fallback for Localhost/Offline
            setTimeout(() => {
                const fallbackResponse = `(Modo Offline) Entendi. Como estamos sem conexão com o servidor de IA agora, vamos focar no tratamento prático.\n\nA acupressão vai ajudar a liberar essa tensão de **${selectedEmotion?.namePortuguese || 'sua emoção'}** diretamente no corpo.\n\nClique no botão abaixo para iniciar os pontos.`;
                setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse, timestamp: new Date() }]);
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to find specific points for the emotion
    const getRecommendedPoints = () => {
        if (!selectedEmotion) return [];

        // 1. Try to use specific primary points from the Emotional State definition
        if (selectedEmotion.primaryPoints && selectedEmotion.primaryPoints.length > 0) {
            return acupressurePoints.filter(p => selectedEmotion.primaryPoints.includes(p.id));
        }

        // 2. Fallback: Filter by organ/element keywords if no primary points defined
        return acupressurePoints.filter(p => {
            const benefitsStr = Array.isArray(p.benefits) ? p.benefits.join(' ') : String(p.benefits);
            return benefitsStr.toLowerCase().includes(selectedEmotion.mtcOrgan.toLowerCase()) ||
                benefitsStr.toLowerCase().includes(selectedEmotion.namePortuguese.toLowerCase()) ||
                p.id === 'IG4' || p.id === 'F3';
        }).slice(0, 3);
    };

    // Helper for Spotify
    const getSpotifyUrl = () => {
        // Map elements to playlists
        if (!selectedEmotion) return "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYPdgoIcn6?utm_source=generator"; // Chill default
        switch (selectedEmotion.mtcElement) {
            case 'fire': return "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYPdgoIcn6"; // Chill/Piano (Calm Anxiety)
            case 'wood': return "https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U"; // Rock Classics (Release Anger)
            case 'earth': return "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VdMW310YC7"; // Chill Vibes (Grounding)
            case 'metal': return "https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx5yEZkcJ"; // Jazz (Comfort Sadness)
            case 'water': return "https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u"; // Peaceful Piano (Safety for Fear)
            default: return "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYPdgoIcn6";
        }
    };

    const handleCompleteSession = () => {
        // Increment usage count for free users
        if (user && !user.isPremium) {
            const currentCount = parseInt(localStorage.getItem('sessao_mestra_usage_count') || '0');
            const newCount = currentCount + 1;
            localStorage.setItem('sessao_mestra_usage_count', newCount.toString());
            setUsageCount(newCount);
        }

        // Record session completion
        if (selectedEmotion && user) {
            recordSession({
                sessionType: 'integrated',
                durationSeconds: 600,
                completedAt: new Date().toISOString(),
                pointsUsed: getRecommendedPoints().map(p => p.id),
                sessionData: {
                    protocolName: `Sessão Mestra: ${selectedEmotion.namePortuguese}`,
                    originalProtocolId: 'sessao-mestra'
                }
            });
        }
        setPhase('summary');
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col overscroll-none">
            {/* Immersive Header */}
            <div className="relative h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-black/50 backdrop-blur-md">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center text-gray-300 gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">Sair da Sessão</span>
                </button>

                <div className="flex items-center space-x-2 md:space-x-6">
                    {/* Free Usage Counter */}
                    {!user?.isPremium && (
                        <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700">
                            <div className="flex gap-1">
                                {[...Array(USAGE_LIMIT)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < usageCount ? 'bg-red-500' : 'bg-green-500'} ${i === usageCount ? 'animate-pulse' : ''}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 hidden sm:inline">{usageCount}/{USAGE_LIMIT}</span>
                        </div>
                    )}

                    <div className={`flex items-center space-x-2 ${phase === 'insight' ? 'text-purple-400 font-bold' : 'text-gray-600'}`}>
                        <Brain className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider hidden md:inline">Mente</span>
                    </div>
                    <div className="w-4 md:w-8 h-px bg-gray-700"></div>
                    <div className={`flex items-center space-x-2 ${phase === 'acupressure' ? 'text-yellow-400 font-bold' : 'text-gray-600'}`}>
                        <Zap className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider hidden md:inline">Energia</span>
                    </div>
                    <div className="w-4 md:w-8 h-px bg-gray-700"></div>
                    <div className={`flex items-center space-x-2 ${phase === 'zenflow' ? 'text-blue-400 font-bold' : 'text-gray-600'}`}>
                        <Activity className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider hidden md:inline">Corpo</span>
                    </div>
                </div>

                <div className="w-10"></div>
            </div>

            {/* Limit Reached Modal */}
            {showLimitModal && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-gray-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Crown className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Limite Gratuito Atingido</h2>
                        <p className="text-gray-400 mb-6">
                            Você já utilizou suas <strong>{USAGE_LIMIT} sessoes de degustação</strong> da Sessão Mestra.
                            Para continuar harmonizando sua energia e ter acesso ilimitado, torne-se Premium.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => { /* Navigate to Premium - handled by parent usually, or we show a toast */
                                    alert("Redirecionando para Premium...");
                                    /* In a real scenario, we might trigger a navigation callback here */
                                }}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-bold text-black hover:scale-105 transition-transform"
                            >
                                Ser Premium Agora
                            </button>
                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="w-full py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">

                {/* PHASE 0: CHECK-IN */}
                {phase === 'checkin' && (
                    <EmotionalCheckIn
                        onClose={onBack} // Closing checkin exits the session
                        onSelect={handleCheckInComplete}
                        onNavigate={() => { }} // We handle nav internally
                        disableNavigation={true}
                        inline={true}
                    />
                )}

                {/* PHASE 1: INSIGHT (Chat) */}
                {phase === 'insight' && (
                    <div className="absolute inset-0 flex flex-col max-w-4xl mx-auto w-full animate-in fade-in bg-gray-900">
                        {selectedEmotion && (
                            <div className="p-4 bg-purple-900/20 border-b border-purple-500/20 text-center">
                                <h2 className="text-purple-300 text-sm">Focando em: <span className="text-white font-bold">{selectedEmotion.namePortuguese}</span> (Elemento {selectedEmotion.mtcElement})</h2>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                        <span className="text-gray-400 text-sm">Analisando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Converse com o Neo..."
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                />
                                <button onClick={handleSendMessage} className="bg-purple-600 p-3 rounded-xl hover:bg-purple-700 transition-colors">
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            <button
                                onClick={() => setPhase('preparation')}
                                className="w-full mt-3 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Entendi. Iniciar Preparação</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* PHASE 1.5: PREPARATION (Sound & Breathing) */}
                {phase === 'preparation' && (
                    <div className="absolute inset-0 flex flex-col items-center p-6 pb-32 animate-in slide-in-from-right overflow-y-auto bg-gray-900">
                        <div className="text-center mb-8 mt-4">
                            <h1 className="text-2xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
                                <Activity className="w-6 h-6" />
                                Preparação Sensorial
                            </h1>
                            <p className="text-gray-300 max-w-md mx-auto">
                                Antes de iniciarmos os pontos, vamos sintonizar sua frequência e respiração.
                            </p>
                        </div>

                        <div className="w-full max-w-md space-y-8">
                            {/* Step 1: Sound */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-purple-500/20">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Conexão Sonora
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Coloque seus fones e dê play na frequência escolhida para o elemento <strong>{selectedEmotion?.mtcElement}</strong>. O som irá guiar todo o processo.
                                </p>
                                <div className="h-20 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                                    <iframe
                                        style={{ borderRadius: '12px' }}
                                        src={`${getSpotifyUrl()}?theme=0`}
                                        width="100%"
                                        height="80"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Step 2: Breathing */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-blue-500/20">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Respiração de Aterrissagem
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Faça 3 respirações profundas. Inspire contando até 4, segure 2, solte em 6.
                                    Isso sinaliza ao seu corpo que é seguro relaxar.
                                </p>
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
                                        <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setPhase('acupressure')}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Estou Pronto para os Pontos
                            </button>
                        </div>
                    </div>
                )}

                {/* PHASE 2: GUIDED ACUPRESSURE */}
                {phase === 'acupressure' && (
                    <div className="absolute inset-0 flex flex-col items-center p-6 pb-32 animate-in slide-in-from-right overflow-y-auto">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-yellow-400 mb-1 flex items-center justify-center gap-2">
                                <Zap className="w-6 h-6" />
                                Alinhamento Energético
                            </h1>
                            <p className="text-gray-400 text-sm">Siga a respiração e o som.</p>
                        </div>

                        {/* Audio Player for Focus */}
                        <div className="w-full max-w-md mb-6 h-20 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-yellow-500/20 flex-shrink-0">
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src={`${getSpotifyUrl()}?theme=0`}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>

                        {/* Active Point Card */}
                        {(() => {
                            const points = getRecommendedPoints();
                            const point = points[currentPointIndex];

                            if (!point) return <div className="text-white">Carregando pontos...</div>;

                            return (
                                <div className="flex flex-col items-center w-full max-w-md text-center relative">
                                    {/* Breathing Circle Background - 4s Pulse */}
                                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>

                                    {/* Point Image */}
                                    <div className="relative mb-6">
                                        <button
                                            onClick={() => setSelectedImage(point.image || null)}
                                            className="w-40 h-40 bg-black rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:scale-105 transition-transform flex-shrink-0 z-10 relative"
                                        >
                                            <img src={point.image} alt={point.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                                                <span className="text-xs text-white/80">Ver Detalhe</span>
                                            </div>
                                        </button>
                                        <div className="absolute -right-4 -top-2 bg-yellow-600 text-black font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                                            {currentPointIndex + 1}/{points.length}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">{point.id} - {point.name}</h2>

                                    {/* Timer Control */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <button
                                            onClick={toggleTimer}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all ${timeLeft === 0 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-900/50 border-gray-600 text-gray-300'}`}
                                        >
                                            {timeLeft === 0 ? <Sparkles className="w-4 h-4" /> : <Activity className={`w-4 h-4 ${isTimerActive ? 'animate-pulse' : ''}`} />}
                                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                                        </button>
                                    </div>

                                    {/* Breathing Guide */}
                                    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/20 w-full mb-8 shadow-xl relative overflow-hidden group">
                                        {/* Progress Bar Background */}
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-yellow-500/50 transition-all duration-1000 ease-linear"
                                            style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                                        ></div>

                                        <p className="text-gray-300 text-lg leading-relaxed mb-4">{point.description || point.instructions}</p>

                                        <div className="flex items-center justify-center gap-3 py-3 bg-yellow-500/10 rounded-xl border border-yellow-500/10">
                                            <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
                                            <p className="text-yellow-200 font-medium animate-[pulse_4s_ease-in-out_infinite]">
                                                "Inspire profundamente... Pressione ao soltar."
                                            </p>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex gap-4 w-full z-10">
                                        <button
                                            onClick={() => currentPointIndex > 0 ? setCurrentPointIndex(prev => prev - 1) : null}
                                            disabled={currentPointIndex === 0}
                                            className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (currentPointIndex < points.length - 1) {
                                                    setCurrentPointIndex(prev => prev + 1);
                                                } else {
                                                    setPhase('zenflow');
                                                }
                                            }}
                                            className="flex-1 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all flex items-center justify-center gap-2"
                                        >
                                            {currentPointIndex < points.length - 1 ? (
                                                <>Próximo Ponto <ArrowRight className="w-5 h-5" /></>
                                            ) : (
                                                <>Concluir <Sparkles className="w-5 h-5" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* PHASE 3: ZENFLOW */}
                {phase === 'zenflow' && (
                    <div className="absolute inset-0 flex flex-col items-center p-6 pb-32 animate-in slide-in-from-right bg-black overflow-y-auto">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <MatrixRain />
                        </div>

                        {/* Retrieve specific ZenFlow exercise */}
                        {(() => {
                            const exercise = selectedEmotion?.zenFlowExerciseId
                                ? zenFlowExercises.find(z => z.id === selectedEmotion.zenFlowExerciseId)
                                : zenFlowExercises[0]; // Fallback to Regulation

                            const spotifyUrl = exercise?.spotifyEmbedUrl || getSpotifyUrl();

                            return (
                                <div className="relative z-10 w-full max-w-4xl text-center pb-20">
                                    <div className="mb-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-blue-900/30 rounded-full mb-4 ring-2 ring-blue-500/50">
                                            <Activity className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white mb-2">
                                            Movimento de Liberação
                                        </h1>
                                        <h2 className="text-xl text-blue-300 font-semibold mb-1">
                                            {exercise?.title}
                                        </h2>
                                        <p className="text-gray-400 italic">"{exercise?.intention}"</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mb-8 text-left">
                                        {/* Left: Spotify Player */}
                                        <div className="w-full aspect-square md:aspect-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 flex flex-col">
                                            <iframe
                                                style={{ borderRadius: '12px', flex: 1 }}
                                                src={`${spotifyUrl}?theme=0`}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                            ></iframe>
                                        </div>

                                        {/* Right: Instructions */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 flex flex-col justify-center">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">Qi Gong</span>
                                                Instruções do Movimento
                                            </h3>
                                            <div className="space-y-6">
                                                {exercise?.steps.map((step, idx) => (
                                                    <div
                                                        key={step.id}
                                                        className={`relative pl-6 border-l-2 transition-all duration-500 ${idx === zenFlowStepIndex ? 'border-blue-500 bg-blue-500/10 p-4 rounded-r-xl' : 'border-blue-500/30 opacity-50'}`}
                                                    >
                                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-900 border-2 transition-colors ${idx === zenFlowStepIndex ? 'border-blue-500 scale-125' : 'border-blue-500/30'} flex items-center justify-center`}>
                                                            {idx === zenFlowStepIndex && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>}
                                                        </div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className={`font-bold text-sm ${idx === zenFlowStepIndex ? 'text-blue-200' : 'text-gray-400'}`}>
                                                                {idx + 1}. {step.name}
                                                            </h4>
                                                            {idx === zenFlowStepIndex && (
                                                                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-900/50 px-2 py-1 rounded-md border border-blue-500/30">
                                                                    {formatTime(timeLeft)}
                                                                </span>
                                                            )}
                                                            {idx !== zenFlowStepIndex && (
                                                                <span className="text-xs text-gray-500">
                                                                    {step.durationSeconds}s
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm leading-relaxed ${idx === zenFlowStepIndex ? 'text-gray-300' : 'text-gray-500'}`}>{step.instruction}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 mb-8 max-w-2xl mx-auto">
                                        <p className="text-blue-200/80 text-sm">
                                            "Não controle o movimento. Deixe a música guiar o corpo.
                                            O que a mente entendeu e a agulha tocou, o corpo agora expulsa."
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCompleteSession}
                                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-2 mx-auto"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Concluir Sessão Mestra
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* PHASE 4: SUMMARY */}
                {phase === 'summary' && (
                    <div className="absolute inset-0 flex flex-col items-center p-6 pb-32 text-center animate-in zoom-in bg-gray-900 overflow-y-auto">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                            <Sparkles className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Tríade Alinhada</h1>
                        <p className="text-xl text-gray-400 mb-8">Você completou o ciclo Mente-Energia-Corpo.</p>

                        <div className="bg-gray-800 p-6 rounded-2xl max-w-md w-full mb-8 border border-gray-700">
                            <h3 className="text-gray-300 text-sm uppercase tracking-wider mb-4">Seu Diagnóstico</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Emoção</span>
                                <span className="text-white font-bold">{selectedEmotion?.namePortuguese}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Órgão</span>
                                <span className="text-purple-400 font-bold">{selectedEmotion?.mtcOrgan}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Elemento</span>
                                <span className="text-blue-400 font-bold capitalize">{selectedEmotion?.mtcElement}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                                <span className="text-gray-400">Intensidade Inicial</span>
                                <span className="text-red-400 font-bold">{intensity}/5</span>
                            </div>
                        </div>

                        <button onClick={onBack} className="px-8 py-3 border border-gray-600 hover:bg-gray-800 text-white rounded-xl transition-all">
                            Voltar ao Menu Principal
                        </button>
                    </div>
                )}
                {/* Image Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-16 right-0 md:-right-4 p-2 text-white hover:text-red-400 transition-colors z-50"
                            >
                                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                                    <span className="text-sm font-medium">Fechar</span>
                                    <X className="w-5 h-5" />
                                </div>
                            </button>
                            <img
                                src={selectedImage}
                                alt="Detalhe do ponto"
                                className="w-full h-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                            <p className="text-gray-400 text-sm mt-4 animate-pulse">Toque em qualquer lugar para fechar</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
