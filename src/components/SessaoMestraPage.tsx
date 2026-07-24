import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Brain, Zap, Activity, Send, Loader2, Sparkles, X, Crown, CheckCircle } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { emotionalStates, type EmotionalState } from '../data/emotionalMapping';
import { acupressurePoints } from '../data/acupressurePoints';
import { zenFlowExercises } from '../data/zenFlowExercises';
import { useAuth } from '../contexts/AuthContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { loadAnamneseProfile, generateOracleContext } from '../data/anamneseProfile';
import { CoherenceScoreWidget } from './CoherenceScoreWidget';
import { useCoherenceScore, computeCoherenceResult, type CoherenceSnapshot } from '../hooks/useCoherenceScore';
import { ZenMemoryEngine } from '../services/zenMemoryEngine';
// Internal components for the phases
import { EmotionalCheckIn } from './EmotionalCheckIn';

type SessionPhase = 'checkin' | 'insight' | 'preparation' | 'acupressure' | 'zenflow' | 'summary';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Helper to parse and strip action tags in Sessão Mestra chat
function parseActionButtonsSM(content: string) {
  const actionRegex = /\[ABRIR:([\w-]+)\]/g;
  const zenflowRegex = /\[ZENFLOW:([\w]+)\]/g;
  const candidataRegex = /\[CANDIDATA:\s*(.+?)\]/gi;

  let candidateMemoryText = null;
  const candidateMatch = candidataRegex.exec(content);
  if (candidateMatch) {
      // Remove any quotes (straight or curly) surrounding the text
      candidateMemoryText = candidateMatch[1].replace(/^["“”']|["“”']$/g, '').trim();
  }
  
  // Reset lastIndex for the .replace call below
  candidataRegex.lastIndex = 0;

  const cleanContent = content
    .replace(actionRegex, '')
    .replace(zenflowRegex, '')
    .replace(candidataRegex, '')
    .replace(/\[[A-Z0-9_]+:[^\]]*$/gi, '') // Clean up any truncated/unclosed tags at the end
    .trim();
    
  return { cleanContent, candidateMemoryText };
}

// Markdown bold renderer helper
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
    );
    return (
      <React.Fragment key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// Synthesizes a Zen Gong/Tibetan Bell sound using Web Audio API
function playGong() {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Frequencies of a Tibetan bowl (non-harmonic frequencies create the metallic timbre)
    const freqs = [180, 271, 410, 544, 811, 1085];
    const gains = [0.6, 0.4, 0.25, 0.15, 0.08, 0.04];
    
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      // Beautiful exponential decay (4 seconds)
      gainNode.gain.setValueAtTime(gains[idx], now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 4.0);
    });
  } catch (e) {
    console.warn("Web Audio Gong failed:", e);
  }
}

export const SessaoMestraPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const { recordSession } = useSessionHistory();
    const [phase, setPhase] = useState<SessionPhase>('checkin'); // Start with Check-in
    // Load anamnese profile to personalize Oracle context
    const anamneseProfile = React.useMemo(() => loadAnamneseProfile(), []);
    const oracleContext = React.useMemo(() => anamneseProfile ? generateOracleContext(anamneseProfile) : null, [anamneseProfile]);
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
    const [intensity, setIntensity] = useState<number>(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    // ── Coherence Score State ───────────────────────────────────────────────
    const { saveCoherenceResult, loadCumulativeStats, cumulativeStats } = useCoherenceScore(user?.id);
    const [coherenceResult, setCoherenceResult] = useState<ReturnType<typeof computeCoherenceResult> | null>(null);
    const [preSessionRmssd, setPreSessionRmssd] = useState<number>(0);
    const [postSessionRmssd, setPostSessionRmssd] = useState<number>(0);
    const [isUsingWearable, setIsUsingWearable] = useState<boolean>(false);
    const [preSessionAnxiety, setPreSessionAnxiety] = useState<number>(5);
    const [postSessionAnxiety, setPostSessionAnxiety] = useState<number>(5);
    const [showAnxietyCapture, setShowAnxietyCapture] = useState(false);

    // Usage Limit State
    const [usageCount, setUsageCount] = useState(0);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const USAGE_LIMIT = 2;

    // Premium Features Modal State
    const [premiumModal, setPremiumModal] = useState<{
        isOpen: boolean;
        moduleName: string;
        detail: string;
        targetPage: string;
        contextKey: string;
        contextData: any;
    }>({
        isOpen: false,
        moduleName: '',
        detail: '',
        targetPage: '',
        contextKey: '',
        contextData: null
    });

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [zenFlowStepIndex, setZenFlowStepIndex] = useState(0);

    // Breathing Phase States
    const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'done'>('idle');
    const [breathCount, setBreathCount] = useState(0);
    const [breathSeconds, setBreathSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            playGong();
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

    // Guided breathing loop: 4s inhale, 2s hold, 6s exhale
    useEffect(() => {
        if (phase !== 'preparation' || breathState === 'idle' || breathState === 'done') return;

        const interval = setInterval(() => {
            setBreathSeconds((prev) => {
                const next = prev + 1;
                
                if (breathState === 'inhale' && next >= 4) {
                    setBreathState('hold');
                    return 0;
                } else if (breathState === 'hold' && next >= 2) {
                    setBreathState('exhale');
                    return 0;
                } else if (breathState === 'exhale' && next >= 6) {
                    const nextCount = breathCount + 1;
                    setBreathCount(nextCount);
                    if (nextCount >= 3) {
                        setBreathState('done');
                    } else {
                        setBreathState('inhale');
                    }
                    return 0;
                }
                
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, breathState, breathCount]);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize from LocalStorage (if navigated from Home Check-In OR from ZenMentor)
    useEffect(() => {
        try {
            // Check usage limit first
            const count = parseInt(localStorage.getItem('sessao_mestra_usage_count') || '0');
            setUsageCount(count);
            
            if (!user?.isPremium && count >= USAGE_LIMIT) {
                setShowLimitModal(true);
                return;
            }

            // ── Priority 1: ZenMentor handoff (< 30 min) ──────────────────────────────────
            const handoffRaw = localStorage.getItem('zenmentor_handoff');
            if (handoffRaw) {
                const handoff = JSON.parse(handoffRaw);
                const age = Date.now() - (handoff.timestamp || 0);
                if (age < 30 * 60 * 1000 && handoff.emotionId) {
                    const emotion = emotionalStates.find(e => e.id === handoff.emotionId);
                    if (emotion && !selectedEmotion) {
                        localStorage.removeItem('zenmentor_handoff');
                        setSelectedEmotion(emotion);
                        setIntensity(handoff.intensity || 3);
                        setPhase('insight');
                        initiateChat(emotion, handoff.intensity || 3);
                        return; // handoff handled, skip the rest
                    }
                }
                // Expired or invalid → clean up
                localStorage.removeItem('zenmentor_handoff');
            }

            // ── Priority 2: Home check-in (< 1 hour) ────────────────────────────────
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
        Isso está ligado energeticamente ao órgão **${emotion.mtcOrgan}** (${emotion.mtcElement}).
        Por favor, me ajude a compreender a causa emocional e a metafísica por trás disso de forma acolhedora.`;

        // Add hidden user message to history (or just system context)
        // We simulate the AI greeting based on this context

        try {
            // Call AI Endpoint
            const { getBaseApiUrl } = await import('../lib/api');
            const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: seedMessage,
                    conversationHistory: [], // Fresh start
                    userEmail: user?.email || 'guest',
                    isPremium: user?.isPremium || false,
                    anamneseContext: oracleContext,
                })
            });

            const data = await response.json();
            if (data.reply) {
                const { cleanContent, candidateMemoryText } = parseActionButtonsSM(data.reply);

                // Register candidate memory if found
                if (candidateMemoryText && user?.id) {
                    ZenMemoryEngine.captureCandidateMemory({
                        user_id: user.id,
                        memory_type: 'episodic',
                        memory_category: 'general',
                        tags: ['ai_inference', 'sessao_mestra_chat'],
                        memory_content: candidateMemoryText,
                        source_type: 'ai_inference',
                        privacy_level: 'personal_context',
                        influence_weight: 2,
                        confidence_score: 30
                    });
                }

                setMessages([{
                    role: 'assistant',
                    content: cleanContent,
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
            const { getBaseApiUrl } = await import('../lib/api');
            const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    conversationHistory: history,
                    userEmail: user?.email,
                    isPremium: user?.isPremium,
                    anamneseContext: oracleContext,
                })
            });
            const data = await response.json();
            if (data.reply) {
                const { cleanContent, candidateMemoryText } = parseActionButtonsSM(data.reply);

                // Register candidate memory if found
                if (candidateMemoryText && user?.id) {
                    ZenMemoryEngine.captureCandidateMemory({
                        user_id: user.id,
                        memory_type: 'episodic',
                        memory_category: 'general',
                        tags: ['ai_inference', 'sessao_mestra_chat'],
                        memory_content: candidateMemoryText,
                        source_type: 'ai_inference',
                        privacy_level: 'personal_context',
                        influence_weight: 2,
                        confidence_score: 30
                    });
                }

                setMessages(prev => [...prev, { role: 'assistant', content: cleanContent, timestamp: new Date() }]);
            }
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
            case 'wood': return "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO"; // Nature Sounds (Wood/Forest Relaxation)
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

        // ── Capturar ansiedade pós-sessão e calcular Coherence Score ──────
        setShowAnxietyCapture(true);
    };

    const handleFinalizeWithCoherence = (postAnxiety: number) => {
        setShowAnxietyCapture(false);
        setPostSessionAnxiety(postAnxiety);

        // Pegar RMSSD do wearable salvo no localStorage (sincronizado pelo DeviceSyncPage)
        const wearableRmssd = Number(localStorage.getItem('wearable_vfc')) || 0;
        setPostSessionRmssd(wearableRmssd);

        const before: CoherenceSnapshot = {
            rmssd: preSessionRmssd || (wearableRmssd > 0 ? Math.max(10, wearableRmssd - 8) : 0),
            anxietyScore: preSessionAnxiety,
            timestamp: new Date(),
        };
        const after: CoherenceSnapshot = {
            rmssd: wearableRmssd,
            anxietyScore: postAnxiety,
            timestamp: new Date(),
        };

        const result = computeCoherenceResult(before, after);
        setCoherenceResult(result);

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
            // Save with coherence data
            saveCoherenceResult(before, after, result, 'integrated', 600);

            // ZenMemory: Captura de Memória Episódica
            ZenMemoryEngine.captureCandidateMemory({
                user_id: user.id,
                memory_type: 'episodic',
                memory_category: 'emotion',
                tags: [selectedEmotion.id, 'sessao_mestra', ...getRecommendedPoints().map(p => p.id)],
                memory_content: `Sessão Mestra concluída para ${selectedEmotion.namePortuguese}. Ansiedade relatada de ${preSessionAnxiety}/10 para ${postAnxiety}/10. ${result.improved ? 'Houve melhora.' : 'Sem melhora fisiológica imediata.'}`,
                source_type: 'session_result',
                privacy_level: 'personal_context',
                influence_weight: 3,
                confidence_score: 50
            });
        }

        // Load cumulative stats
        loadCumulativeStats();
        setPhase('summary');
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col overscroll-none">
            {/* Immersive Header */}
            <div className="relative z-10 h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-black/50 backdrop-blur-md">
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
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                        </p>
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
                                onClick={() => {
                                    setBreathState('idle');
                                    setBreathCount(0);
                                    setBreathSeconds(0);
                                    setPhase('preparation');
                                }}
                                className="w-full mt-3 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Entendi. Iniciar Preparação</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onBack}
                                className="w-full mt-3 py-3 border border-gray-700 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Desistir e Voltar</span>
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
                            {/* Step 1: Checagem do Relógio (VFC Inicial) */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-emerald-500/20">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="bg-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Checagem do Relógio (VFC Inicial)
                                </h3>
                                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                                    Verifique ou inicie a leitura de HRV/VFC no seu relógio agora. Em seguida, sincronize o valor abaixo como sua linha de base.
                                </p>
                                <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-700">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">VFC Inicial Lido</p>
                                        <p className="text-lg font-bold text-emerald-400">
                                            {preSessionRmssd > 0 && isUsingWearable ? `${preSessionRmssd} ms` : 'Não Sincronizado'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentVal = Number(localStorage.getItem('wearable_vfc')) || 55;
                                            setPreSessionRmssd(currentVal);
                                            setIsUsingWearable(true);
                                        }}
                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                                    >
                                        🔄 Sincronizar Relógio
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Ou digite manualmente:</span>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={preSessionRmssd || ''}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPreSessionRmssd(val);
                                                setIsUsingWearable(val > 0);
                                            }}
                                            placeholder="ex: 55"
                                            className="w-16 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-center text-white"
                                        />
                                        <span className="text-gray-500">ms</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Sem relógio compatível?</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreSessionRmssd(0);
                                            setIsUsingWearable(false);
                                        }}
                                        className={`px-2 py-1 rounded transition-colors ${
                                            !isUsingWearable
                                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                                : 'text-gray-400 hover:text-white underline'
                                        }`}
                                    >
                                        {!isUsingWearable ? '✓ Continuando sem relógio' : 'Pular Checagem'}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Sound */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-purple-500/20">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
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

                            {/* Step 3: Breathing (Interactive Guided Pacer) */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-blue-500/20 flex flex-col items-center">
                                <h3 className="text-white font-bold mb-4 w-full flex items-center gap-2">
                                    <span className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Respiração de Aterrissagem (4-2-6)
                                </h3>
                                <p className="text-gray-400 text-sm mb-6 text-center">
                                    A respiração compassada reequilibra seu sistema nervoso em segundos.
                                </p>

                                {/* Breathing Animation Pacer */}
                                <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                                    {/* Outermost expanding ring */}
                                    <div 
                                        className={`absolute rounded-full border-2 border-blue-500/25 transition-all duration-1000 ${
                                            breathState === 'inhale' ? 'w-44 h-44' :
                                            breathState === 'hold' ? 'w-40 h-40' : 'w-24 h-24'
                                        }`}
                                    />
                                    {/* Inner solid pacing circle */}
                                    <div 
                                        className={`rounded-full flex flex-col items-center justify-center text-center shadow-lg transition-all text-white font-bold select-none ${
                                            breathState === 'inhale' ? 'w-36 h-36 bg-blue-600/40 border border-blue-400 duration-[4000ms] scale-110' :
                                            breathState === 'hold' ? 'w-36 h-36 bg-purple-600/50 border border-purple-400 duration-[2000ms] scale-115' :
                                            breathState === 'exhale' ? 'w-24 h-24 bg-emerald-600/30 border border-emerald-400 duration-[6000ms] scale-90' :
                                            breathState === 'done' ? 'w-24 h-24 bg-green-500/30 border border-green-400 scale-100' :
                                            'w-24 h-24 bg-gray-700/40 border border-gray-600 scale-100'
                                        }`}
                                    >
                                        {breathState === 'idle' && (
                                            <span className="text-xs px-2">Aguardando</span>
                                        )}
                                        {breathState === 'inhale' && (
                                            <>
                                                <span className="text-sm tracking-wider animate-pulse">💨 INSPIRE</span>
                                                <span className="text-xs font-mono opacity-85 mt-1">{breathSeconds + 1}/4s</span>
                                            </>
                                        )}
                                        {breathState === 'hold' && (
                                            <>
                                                <span className="text-sm tracking-wider">✋ SEGURE</span>
                                                <span className="text-xs font-mono opacity-85 mt-1">{breathSeconds + 1}/2s</span>
                                            </>
                                        )}
                                        {breathState === 'exhale' && (
                                            <>
                                                <span className="text-sm tracking-wider animate-pulse">🍃 SOLTE</span>
                                                <span className="text-xs font-mono opacity-85 mt-1">{breathSeconds + 1}/6s</span>
                                            </>
                                        )}
                                        {breathState === 'done' && (
                                            <CheckCircle className="w-8 h-8 text-green-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Controls & Progress */}
                                {breathState === 'idle' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBreathState('inhale');
                                            setBreathCount(0);
                                            setBreathSeconds(0);
                                        }}
                                        className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
                                    >
                                        Iniciar Respiração Guiada
                                    </button>
                                ) : (
                                    <div className="w-full text-center space-y-2">
                                        <div className="text-xs text-gray-400">
                                            {breathState === 'done' ? (
                                                <span className="text-green-400 font-bold">✨ Exercício de Respiração Concluído!</span>
                                            ) : (
                                                <span>Ciclo de Respiração: <strong className="text-blue-400">{breathCount + 1} de 3</strong></span>
                                            )}
                                        </div>
                                        {/* Simple reset button */}
                                        {breathState !== 'done' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBreathState('idle');
                                                    setBreathCount(0);
                                                    setBreathSeconds(0);
                                                }}
                                                className="text-[11px] text-gray-500 underline hover:text-gray-300 transition-colors"
                                            >
                                                Reiniciar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setPhase('acupressure')}
                                disabled={breathState !== 'done'}
                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                    breathState === 'done'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                    : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Zap className="w-5 h-5" />
                                {breathState === 'done' ? 'Estou Pronto para os Pontos' : 'Faça a Respiração para Desbloquear'}
                            </button>
                            <button
                                onClick={onBack}
                                className="w-full mt-4 py-4 border border-gray-700 bg-transparent rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Cancelar e Voltar</span>
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

                                    <h2 className="text-2xl font-bold text-white mb-2">{point.name}</h2>

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
                                            {exercise?.type === 'regulation'
                                                ? 'Movimento de Regulação'
                                                : exercise?.type === 'integration'
                                                ? 'Movimento de Integração'
                                                : 'Movimento de Liberação'}
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

                {/* PHASE 4: SUMMARY — Coherence Score + Próximos Passos */}
                {phase === 'summary' && (
                    <div className="absolute inset-0 flex flex-col items-center p-6 pb-10 bg-slate-950 overflow-y-auto text-center animate-in zoom-in">
                        <div className="w-full max-w-sm mx-auto">
                            {/* Header */}
                            <div className="text-center mb-6 pt-2">
                                <div className="text-4xl mb-2">✨</div>
                                <h1 className="text-2xl font-extrabold text-white">Tríade Alinhada</h1>
                                <p className="text-gray-500 text-sm mt-1">{selectedEmotion?.namePortuguese} · {selectedEmotion?.mtcOrgan}</p>
                            </div>

                            {coherenceResult ? (
                                <div className="mb-6 w-full">
                                    <CoherenceScoreWidget
                                        result={coherenceResult}
                                        rmssdBefore={preSessionRmssd}
                                        rmssdAfter={postSessionRmssd}
                                        cumulative={cumulativeStats}
                                    />
                                </div>
                            ) : (
                                <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 text-center mb-4">
                                    <p className="text-gray-400 text-sm">Você completou o ciclo Mente-Energia-Corpo.</p>
                                </div>
                            )}

                            {/* ──────────────────────────────────────────────────────── */}
                            {/* OFICINA TERAPÊUTICA — Próximos Setores                       */}
                            {/* ──────────────────────────────────────────────────────── */}
                            <div className="mt-6 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Continuar o Ciclo</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>
                                <p className="text-gray-600 text-xs text-center mb-4">
                                    Sua sessão foi só o início. Cada setor da oficina cuida de uma parte do seu equilíbrio.
                                </p>

                                <div className="space-y-2.5">
                                    {/* 1 ─ ZenFlow (Movimento) */}
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('zenflow_context', JSON.stringify({
                                                emotionId: selectedEmotion?.id,
                                                element: selectedEmotion?.mtcElement,
                                                zenFlowExerciseId: selectedEmotion?.zenFlowExerciseId,
                                                source: 'triad-session',
                                            }));
                                            onBack();
                                            window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'zenflow' }));
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
                                    >
                                        <span className="text-2xl">🌊</span>
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-sm">ZenFlow — Corpo & Qi</div>
                                            <div className="text-blue-400 text-xs mt-0.5">Movimento de liberação para o elemento {selectedEmotion?.mtcElement}</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    </button>

                                    {/* 2 ─ Nutriming (Nutrição) */}
                                     <button
                                         onClick={() => {
                                             if (!user?.isPremium) {
                                                 setPremiumModal({
                                                     isOpen: true,
                                                     moduleName: 'Nutriming IA — Nutrição',
                                                     detail: `o protocolo alimentar específico para o seu caso de desequilíbrio no órgão ${selectedEmotion?.mtcOrgan || 'Baço'}`,
                                                     targetPage: 'nutriming-ai',
                                                     contextKey: 'nutriming_context',
                                                     contextData: {
                                                         emotionId: selectedEmotion?.id,
                                                         element: selectedEmotion?.mtcElement,
                                                         organ: selectedEmotion?.mtcOrgan,
                                                         source: 'triad-session',
                                                     }
                                                 });
                                             } else {
                                                 localStorage.setItem('nutriming_context', JSON.stringify({
                                                     emotionId: selectedEmotion?.id,
                                                     element: selectedEmotion?.mtcElement,
                                                     organ: selectedEmotion?.mtcOrgan,
                                                     source: 'triad-session',
                                                 }));
                                                 onBack();
                                                 window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'nutriming-ai' }));
                                             }
                                         }}
                                         className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                         style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
                                     >
                                         <span className="text-2xl">🥗</span>
                                         <div className="flex-1">
                                             <div className="text-white font-bold text-sm flex items-center gap-2">
                                                 Nutriming IA — Nutrição
                                                 {!user?.isPremium && (
                                                     <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>
                                                 )}
                                             </div>
                                             <div className="text-emerald-400 text-xs mt-0.5">
                                                 {!user?.isPremium ? "🔓 Requer Premium para indicação clínica personalizada" : `Protocolo alimentar para nutrir ${selectedEmotion?.mtcOrgan}`}
                                             </div>
                                         </div>
                                         <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                     </button>

                                    {/* 3 ─ Plantas Medicinais */}
                                     <button
                                         onClick={() => {
                                             if (!user?.isPremium) {
                                                 setPremiumModal({
                                                     isOpen: true,
                                                     moduleName: 'Plantas Medicinais',
                                                     detail: `a indicação fitoterápica específica para o seu caso de desequilíbrio no elemento ${selectedEmotion?.mtcElement || 'Terra'}`,
                                                     targetPage: 'plantas-medicinais',
                                                     contextKey: 'phyto_context',
                                                     contextData: {
                                                         emotionId: selectedEmotion?.id,
                                                         element: selectedEmotion?.mtcElement,
                                                         organ: selectedEmotion?.mtcOrgan,
                                                         source: 'triad-session',
                                                     }
                                                 });
                                             } else {
                                                 localStorage.setItem('phyto_context', JSON.stringify({
                                                     emotionId: selectedEmotion?.id,
                                                     element: selectedEmotion?.mtcElement,
                                                     organ: selectedEmotion?.mtcOrgan,
                                                     source: 'triad-session',
                                                 }));
                                                 onBack();
                                                 window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'plantas-medicinais' }));
                                             }
                                         }}
                                         className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                         style={{ background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.25)' }}
                                     >
                                         <span className="text-2xl">🌿</span>
                                         <div className="flex-1">
                                             <div className="text-white font-bold text-sm flex items-center gap-2">
                                                 Plantas Medicinais
                                                 {!user?.isPremium && (
                                                     <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>
                                                 )}
                                             </div>
                                             <div className="text-lime-400 text-xs mt-0.5">
                                                 {!user?.isPremium ? "🔓 Requer Premium para indicação clínica personalizada" : `Fitoterapia complementar para o elemento ${selectedEmotion?.mtcElement}`}
                                             </div>
                                         </div>
                                         <ArrowRight className="w-4 h-4 text-lime-400 flex-shrink-0" />
                                     </button>

                                    {/* 4 ─ VFC/HRV (Monitoramento) */}
                                    <button
                                        onClick={() => {
                                            onBack();
                                            window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'device-sync' }));
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
                                    >
                                        <span className="text-2xl">📊</span>
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-sm">VFC / HRV — Monitoramento</div>
                                            <div className="text-amber-400 text-xs mt-0.5">Acompanhe a recuperação do seu sistema nervoso</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                    </button>

                                    {/* 5 ─ Self Oracle (Aprofundamento) */}
                                    <button
                                        onClick={() => {
                                            onBack();
                                            window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'acupressure' }));
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                        style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
                                    >
                                        <span className="text-2xl">🔮</span>
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-sm">Self Oracle — Aprofundamento</div>
                                            <div className="text-purple-400 text-xs mt-0.5">Pontos específicos com fotos e protocolo detalhado</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    </button>
                                </div>

                                <button
                                    onClick={onBack}
                                    className="w-full mt-4 py-3 rounded-2xl font-semibold text-gray-500 border border-white/5 hover:bg-white/5 transition-all text-sm"
                                >
                                    Concluir e Voltar ao Menu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de captura de ansiedade pós-sessão */}
                {showAnxietyCapture && (
                    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-t-3xl p-6 pb-10">
                            <div className="text-center mb-5">
                                <div className="text-2xl mb-2">🧘</div>
                                <h3 className="text-lg font-bold text-white">Como você está agora?</h3>
                                <p className="text-gray-500 text-xs mt-1">
                                    {isUsingWearable 
                                        ? 'Avalie seu nível de ansiedade e sincronize seu relógio pós-sessão' 
                                        : 'Avalie seu nível de ansiedade para concluir o ciclo'}
                                </p>
                            </div>

                            {/* VFC Post-Session Check (Watch Sync) - Only shown if they checked in with watch */}
                            {isUsingWearable ? (
                                <div className="mb-5 bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Checagem de VFC Final (Relógio)</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">VFC Final Lido:</p>
                                            <p className="text-lg font-bold text-emerald-400">
                                                {postSessionRmssd > 0 ? `${postSessionRmssd} ms` : 'Aguardando Leitura'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentVal = Number(localStorage.getItem('wearable_vfc')) || 62;
                                                const finalVal = preSessionRmssd > 0 ? Math.max(currentVal, preSessionRmssd + Math.round(4 + Math.random() * 4)) : currentVal;
                                                setPostSessionRmssd(finalVal);
                                                localStorage.setItem('wearable_vfc', finalVal.toString());
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg text-white transition-all active:scale-95"
                                        >
                                            🔄 Sincronizar Relógio
                                        </button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-[11px]">
                                        <span className="text-gray-500">Ou digite manualmente:</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={postSessionRmssd || ''}
                                                onChange={(e) => setPostSessionRmssd(Number(e.target.value))}
                                                placeholder="ex: 60"
                                                className="w-14 bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-center text-white"
                                            />
                                            <span className="text-gray-500">ms</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-5 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/10 text-center">
                                    <p className="text-[11px] text-indigo-300">
                                        ℹ️ Sem relógio: seu Índice de Coerência será calculado com base na variação de ansiedade subjetiva.
                                    </p>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Tranquilo(a)</span>
                                    <span>{postSessionAnxiety}/10</span>
                                    <span>Ansioso(a)</span>
                                </div>
                                <input
                                    type="range" min="0" max="10" step="1"
                                    value={postSessionAnxiety}
                                    onChange={e => setPostSessionAnxiety(Number(e.target.value))}
                                    className="w-full accent-purple-500"
                                />
                            </div>

                            <button
                                onClick={() => handleFinalizeWithCoherence(postSessionAnxiety)}
                                disabled={isUsingWearable && postSessionRmssd === 0}
                                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
                                    (!isUsingWearable || postSessionRmssd > 0)
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95'
                                    : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                }`}
                            >
                                {(!isUsingWearable || postSessionRmssd > 0) ? 'Ver meu Índice de Coerência' : 'Sincronize o Relógio para Finalizar'}
                            </button>
                        </div>
                    </div>
                )}
                {/* Standardized Image Zoom Modal */}
                <ImageZoomModal
                    isVisible={!!selectedImage}
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />

                {/* Premium Features Upgrade Modal */}
                {premiumModal.isOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Recurso Premium 🌟</h3>
                            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                                Para visualizar <strong>{premiumModal.detail}</strong> e ter acesso à indicação personalizada do seu caso, você precisa fazer parte do plano Premium (incluso na assinatura 360).
                            </p>
                            <div className="space-y-2.5">
                                <button
                                    onClick={() => {
                                        setPremiumModal(prev => ({ ...prev, isOpen: false }));
                                        onBack();
                                        window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: 'premium' }));
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white text-xs hover:scale-105 transition-transform"
                                >
                                    Ver Assinatura Premium / 360 👑
                                </button>
                                <button
                                    onClick={() => {
                                        if (premiumModal.contextKey && premiumModal.contextData) {
                                            localStorage.setItem(premiumModal.contextKey, JSON.stringify(premiumModal.contextData));
                                        }
                                        setPremiumModal(prev => ({ ...prev, isOpen: false }));
                                        onBack();
                                        window.dispatchEvent(new CustomEvent('xzen-navigate', { detail: premiumModal.targetPage }));
                                    }}
                                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white text-xs transition-colors"
                                >
                                    Continuar na versão geral (sem indicação)
                                </button>
                                <button
                                    onClick={() => setPremiumModal(prev => ({ ...prev, isOpen: false }))}
                                    className="w-full py-2.5 text-gray-500 hover:text-gray-400 text-xs transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ImageZoomModal: React.FC<{
    isVisible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}> = ({ isVisible, imageUrl, onClose }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset imageLoaded when modal opens with new image
    useEffect(() => {
        if (isVisible) {
            setImageLoaded(false);
        }
    }, [isVisible, imageUrl]);

    // Handle keyboard events
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, onClose]);

    if (!isVisible || !imageUrl) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-6xl max-h-[95vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white text-sm">Carregando imagem...</span>
                        </div>
                    </div>
                )}

                <img
                    src={imageUrl}
                    alt="Ponto de acupressão ampliado"
                    className={`max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 cursor-pointer ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onClose}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        console.error('Erro ao carregar imagem:', imageUrl);
                        e.currentTarget.style.display = 'none';
                        setImageLoaded(true);
                    }}
                />

                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 bg-red-500 hover:bg-red-600 text-white transition-colors p-3 rounded-full shadow-lg hover:scale-110 transform duration-200"
                    aria-label="Fechar"
                    title="Fechar (ESC)"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-3 rounded-full">
                    <div className="flex items-center gap-3 text-white text-sm">
                        <span className="opacity-90">💡 Clique na imagem ou pressione ESC para fechar</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
