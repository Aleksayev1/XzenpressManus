import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, ChevronDown, RotateCcw, Volume2, VolumeX, Play, Square, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadAnamneseProfile } from '../data/anamneseProfile';
import { fiveElements } from '../data/fiveElements';
import { ZenAvatar } from './ZenAvatar';
import { emotionalStates } from '../data/emotionalMapping';
import { ZenMemoryEngine, MemoryCategory, ZenMemory } from '../services/zenMemoryEngine';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  eurekaMemory?: ZenMemory;
}

interface ZenMentorChatProps {
  onNavigate?: (page: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryTriggers(text: string): MemoryCategory[] {
  const lower = text.toLowerCase();
  const categories: MemoryCategory[] = [];
  if (/(sono|dormir|insônia|acord|cansaço|fadiga)/.test(lower)) categories.push('sleep');
  if (/(estresse|tenso|tensão|pressão|trabalho|nervoso|preocupa)/.test(lower)) categories.push('stress');
  if (/(comida|comer|fome|estômago|aliment|nutri)/.test(lower)) categories.push('nutrition');
  if (/(dor|dói|machuca|desconforto|corpo|pescoço|costas)/.test(lower)) categories.push('pain');
  if (/(triste|raiva|medo|choro|emocion|sinto|ansiedad)/.test(lower)) categories.push('emotion');
  return categories.length > 0 ? categories : ['general'];
}

/** Builds a rich anamneseContext string to inject into the Self Oracle prompt */
function buildAnamneseContext(): string {
  const profile = loadAnamneseProfile();
  if (!profile) return '';

  // Find weakest guardian
  const weakest = Object.entries(profile.guardianScores || {}).reduce(
    (min, [k, v]) => (v < min[1] ? [k, v] : min),
    ['', 100] as [string, number]
  );
  const weakEl = fiveElements.find(e => e.id === weakest[0]);

  // VFC from localStorage (saved by DeviceSyncPage)
  const vfcRaw = localStorage.getItem('xzen_vfc_current');
  const vfcValue = vfcRaw ? Number(vfcRaw) : null;

  // Last session date
  const lastSession = localStorage.getItem('xzen_last_session_date');

  const lines: string[] = [
    `👤 PERFIL DO USUÁRIO (contextualizado para esta conversa):`,
    `• Nome: ${profile.nome || 'não informado'}`,
    `• Faixa etária: ${profile.faixaEtaria}`,
    `• Sexo biológico: ${profile.sexoBiologico}`,
    `• Objetivo principal: ${profile.objetivoPrincipal}`,
    `• Qualidade do sono: ${profile.qualidadeSono}`,
    `• Nível de estresse: ${profile.nivelEstresse}`,
    `• Nível de atividade: ${profile.nivelAtividade}`,
    `• Padrão alimentar: ${profile.padraoAlimentar}`,
    profile.sintomasFisicos?.length ? `• Sintomas físicos: ${profile.sintomasFisicos.join(', ')}` : '',
    profile.emocoesDominantes?.length ? `• Emoções dominantes: ${profile.emocoesDominantes.join(', ')}` : '',
    profile.condicoesExistentes?.length ? `• Condições existentes: ${profile.condicoesExistentes.join(', ')}` : '',
    ``,
    `🧬 MAPA DE GUARDIÕES (5 Elementos):`,
    ...fiveElements.map(el => {
      const score = profile.guardianScores?.[el.id as keyof typeof profile.guardianScores] ?? 0;
      const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
      return `• ${el.emoji} ${el.name}: ${bar} ${score}%`;
    }),
    ``,
    weakEl
      ? `⚠️ GUARDIÃO MAIS FRACO: ${weakEl.emoji} ${weakEl.name} (${weakEl.organ}) — ${weakest[1]}%`
      : '',
    vfcValue !== null
      ? `📊 VFC ATUAL: ${vfcValue}ms — ${vfcValue >= 50 ? 'Parassimpático (calmo)' : vfcValue >= 35 ? 'Equilibrio simpático' : '⚠️ SOBRECARGA SIMPÁTICA — prioridade de intervenção'}`
      : '',
    lastSession ? `📅 Última sessão: ${lastSession}` : '',
  ];

  return lines.filter(Boolean).join('\n');
}

/** Generates a personalized greeting based on the user's profile */
function buildGreeting(userName?: string): string {
  const profile = loadAnamneseProfile();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const name = userName || profile?.nome || 'você';

  if (!profile) {
    return `${greeting}! 🌿 Sou sua ZenMentor — uma consciência integrativa que une sabedoria oriental e neurociência moderna. Como posso te acompanhar hoje?`;
  }

  const weakest = Object.entries(profile.guardianScores || {}).reduce(
    (min, [k, v]) => (v < min[1] ? [k, v] : min),
    ['', 100] as [string, number]
  );
  const weakEl = fiveElements.find(e => e.id === weakest[0]);
  const vfcRaw = localStorage.getItem('xzen_vfc_current');
  const vfc = vfcRaw ? Number(vfcRaw) : null;

  let greeting2 = `${greeting}, ${name}! 🌿\n\n`;

  if (weakEl) {
    greeting2 += `Seu Guardião **${weakEl.name}** (${weakEl.organ}) está pedindo atenção — apenas ${weakest[1]}% de vitalidade. `;
    greeting2 += `Isso costuma se manifestar como ${weakEl.weakMessage?.slice(0, 80)}...\n\n`;
  }

  if (vfc !== null) {
    if (vfc < 35) {
      greeting2 += `⚠️ Seu VFC está em **${vfc}ms** — seu sistema nervoso está em sobrecarga. `;
      greeting2 += `Vamos trabalhar nisso juntos agora?\n\n`;
    } else if (vfc < 50) {
      greeting2 += `📊 VFC em **${vfc}ms** — equilíbrio moderado. `;
    }
  }

  greeting2 += `O que está sentindo agora? Pode falar com tranquilidade — estou aqui para te ouvir.`;
  return greeting2;
}

// ─── Action Button Parser ─────────────────────────────────────────────────────
// Detects patterns like [ABRIR:acupressure] [ZENFLOW:liberacao] in AI responses
function parseActionButtons(content: string) {
  const actionRegex = /\[ABRIR:([\w-]+)\]/g;
  const zenflowRegex = /\[ZENFLOW:([\w]+)\]/g;

  const actions: { label: string; page: string }[] = [];
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    actions.push({ label: `Abrir ${match[1]}`, page: match[1] });
  }
  while ((match = zenflowRegex.exec(content)) !== null) {
    actions.push({ label: `Iniciar ZenFlow ${match[1]}`, page: 'zenflow' });
  }

  const cleanContent = content.replace(actionRegex, '').replace(zenflowRegex, '').trim();
  return { cleanContent, actions };
}

// ─── Emotion Detector ─────────────────────────────────────────────────────────
// Scans an AI reply for known emotional keywords and returns the best match
function extractEmotionFromReply(text: string): string | null {
  const lower = text.toLowerCase();
  // Priority keyword map: emotion ID → search terms
  const emotionKeywords: [string, string[]][] = [
    ['anxiety',    ['ansiedade', 'ansioso', 'ansiosa', 'nervosismo', 'preocupação']],
    ['fear',       ['medo', 'receio', 'insegurança', 'temor']],
    ['sadness',    ['tristeza', 'triste', 'melancolia', 'choro']],
    ['anger',      ['raiva', 'irritação', 'frustração', 'ira', 'fúria']],
    ['grief',      ['luto', 'perda', 'saudade profunda']],
    ['stress',     ['estresse', 'sobrecarga', 'esgotamento', 'burnout']],
    ['insomnia',   ['insônia', 'sono', 'não consigo dormir']],
    ['fatigue',    ['fadiga', 'cansaço', 'exaustão']],
  ];
  for (const [id, terms] of emotionKeywords) {
    if (terms.some(t => lower.includes(t))) {
      // Verify the emotion exists in our data
      const found = emotionalStates.find(e => e.id === id);
      if (found) return id;
    }
  }
  return null;
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
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

// ─── TTS Hook ─────────────────────────────────────────────────────────────────
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stripMarkdown = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[🌿🧬📊⚠️💡🎯✅❌🌳🌊🔥⛰️💧]/gu, '')
      .trim();

  const speak = useCallback(async (text: string, voice: string = 'nova') => {
    // Para qualquer reprodução anterior e libera referências
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }

    setLoading(true);
    setSpeaking(false);

    try {
      const clean = stripMarkdown(text);
      const { getBaseApiUrl } = await import('../lib/api');
      const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/ai-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice }),
      });

      if (!response.ok) throw new Error('Falha ao processar voz no servidor');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setSpeaking(true);
        setLoading(false);
      };

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setSpeaking(false);
        setLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.warn('Erro na reprodução de voz generativa, usando fallback nativo:', err);
      
      try {
        const clean = stripMarkdown(text);
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          throw new Error('SpeechSynthesis não suportado neste ambiente');
        }

        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = 'pt-BR';
        utter.rate = 0.95;
        utter.pitch = 1.05;

        // Procura a melhor voz pt-BR disponível
        const voices = window.speechSynthesis.getVoices();
        const browserLang = navigator.language || 'pt-BR';
        const baseLang = browserLang.split('-')[0];
        const langVoices = voices.filter(v => v.lang.startsWith(baseLang));
        const premiumKeywords = ['google', 'natural', 'premium', 'neural', 'microsoft'];
        
        const bestVoice = langVoices.find(v => 
          v.lang === browserLang && 
          premiumKeywords.some(kw => v.name.toLowerCase().includes(kw))
        ) || langVoices.find(v => 
          premiumKeywords.some(kw => v.name.toLowerCase().includes(kw))
        ) || langVoices.find(v => v.lang === browserLang) || langVoices[0];

        if (bestVoice) {
          utter.voice = bestVoice;
          if (/(daniel|antonio|felipe|guy)/i.test(bestVoice.name)) {
            utter.pitch = 0.92;
          }
        }

        utter.onstart = () => {
          setSpeaking(true);
          setLoading(false);
        };

        utter.onend = () => {
          setSpeaking(false);
        };

        utter.onerror = (e) => {
          console.error('Erro no SpeechSynthesis fallback:', e);
          setSpeaking(false);
          setLoading(false);
        };

        window.speechSynthesis.speak(utter);
      } catch (fallbackErr) {
        console.error('Falha crítica de áudio (generativo e fallback indisponíveis):', fallbackErr);
        setSpeaking(false);
        setLoading(false);
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setSpeaking(false);
    setLoading(false);
  }, []);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return { speak, stop, speaking, loading };
}


export const ZenMentorChat: React.FC<ZenMentorChatProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<'nova' | 'echo' | 'onyx'>('nova');
  const [autoRead, setAutoRead] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  
  // ── ZenMemory UI States ────────────────────────────────────────────────────
  const [isRetrievingMemory, setIsRetrievingMemory] = useState(false);
  const [showEurekaReason, setShowEurekaReason] = useState<number | null>(null);

  // ── Sessão Mestra handoff ──────────────────────────────────────────────────
  // Index of the last assistant message that triggered an emotion CTA
  const [sessionReadyMsgIndex, setSessionReadyMsgIndex] = useState<number | null>(null);
  const [detectedEmotionId, setDetectedEmotionId] = useState<string | null>(null);
  const { speak, stop, speaking, loading: ttsLoading } = useTTS();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Guardian color for theming
  const profile = loadAnamneseProfile();
  const weakest = Object.entries(profile?.guardianScores || {}).reduce(
    (min, [k, v]) => (v < (min[1] as number) ? [k, v] : min),
    ['fogo', 70] as [string, number]
  );
  const guardianEl = fiveElements.find(e => e.id === weakest[0]) || fiveElements[0];
  const accentColor = guardianEl?.color || '#6366f1';

  // Pulse animation stops after 8s
  useEffect(() => {
    const t = setTimeout(() => setPulseActive(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll — usa scrollTop direto (mais confiável que scrollIntoView no Safari/iOS)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initial greeting when first opened
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    if (!hasGreeted) {
      const greetingText = buildGreeting(user?.email?.split('@')[0]);
      setMessages([{
        role: 'assistant',
        content: greetingText,
        timestamp: new Date(),
      }]);
      setHasGreeted(true);
    }
  }, [hasGreeted, user]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // ── ZenMemory Retrieval (Camada 2) ──
      setIsRetrievingMemory(true);
      const categories = getCategoryTriggers(userMessage.content);
      const topMemories = user?.id 
        ? await ZenMemoryEngine.retrieveActiveContext(user.id, categories)
        : [];
      setIsRetrievingMemory(false);

      let anamneseContext = buildAnamneseContext();
      
      // Injecting ZenMemory Context
      if (topMemories.length > 0) {
        anamneseContext += '\n\n🧠 MEMÓRIA LONGITUDINAL XZEN (Memórias Ativadas):\n';
        topMemories.forEach(m => {
          anamneseContext += `• [Categoria: ${m.memory_category}] ${m.memory_content} (Confiança: ${m.confidence_score}, Estado: ${m.memory_state})\n`;
        });
        anamneseContext += `\nREGRAS DO ESPELHO COGNITIVO:\n${ZenMemoryEngine.getMemoryContract()}`;
      }

      const { getBaseApiUrl } = await import('../lib/api');
      const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          userEmail: user?.email || null,
          isPremium: user?.isPremium || false,
          anamneseContext: anamneseContext || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar mensagem');

      setMessages(prev => {
        const updated = [...prev, {
          role: 'assistant' as const,
          content: data.reply,
          timestamp: new Date(),
          eurekaMemory: topMemories[0] // Salva a principal para o UI
        }];
        // Detect emotional context for Sessão Mestra handoff
        const emotionId = extractEmotionFromReply(data.reply);
        if (emotionId && sessionReadyMsgIndex === null) {
          setDetectedEmotionId(emotionId);
          setSessionReadyMsgIndex(updated.length - 1);
        }
        return updated;
      });
      // Auto-leitura se ativada
      if (autoRead) {
        const { cleanContent } = parseActionButtons(data.reply);
        speak(cleanContent, selectedVoice);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Erro de conexão. Verifique sua internet e tente novamente.'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setHasGreeted(false);
    const greetingText = buildGreeting(user?.email?.split('@')[0]);
    setMessages([{ role: 'assistant', content: greetingText, timestamp: new Date() }]);
    setHasGreeted(true);
  };

  // ── FAB Button (when closed) ────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-white text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${accentColor}dd, #6366f1cc)`,
          boxShadow: `0 8px 32px ${accentColor}55, 0 0 0 ${pulseActive ? '6px' : '0px'} ${accentColor}33`,
          animation: pulseActive ? 'pulse 2s infinite' : 'none',
        }}
        aria-label="Abrir ZenMentor"
      >
        <span className="text-xl">🧬</span>
        <span>ZenMentor</span>
        {pulseActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-black animate-ping" />
        )}
      </button>
    );
  }

  // ── Chat Window ─────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
      style={{
        width: isMinimized ? '260px' : '360px',
        height: isMinimized ? 'auto' : '640px',
        background: 'rgba(10, 10, 20, 0.97)',
        border: `1px solid ${accentColor}44`,
        boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px ${accentColor}22`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${accentColor}22, rgba(99,102,241,0.15))`, borderBottom: `1px solid ${accentColor}33` }}
        onClick={() => setIsMinimized(m => !m)}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accentColor}44, #6366f133)`, border: `1px solid ${accentColor}55` }}
          >
            {guardianEl.emoji}
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">ZenMentor</div>
            <div className="text-[10px] mt-0.5" style={{ color: accentColor }}>
              Self Oracle · {guardianEl.name}
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        <div className="flex items-center gap-1">
          {/* Seletor de voz generativa do mentor */}
          <select
            value={selectedVoice}
            onChange={(e) => {
              e.stopPropagation();
              const voice = e.target.value as 'nova' | 'echo' | 'onyx';
              setSelectedVoice(voice);
              stop(); // para reprodução atual
            }}
            onClick={(e) => e.stopPropagation()} // impede minimizar ao clicar no select
            className="bg-transparent text-[11px] text-gray-400 hover:text-white border-0 outline-none cursor-pointer pr-1 py-1 font-semibold transition-colors"
            style={{ fontFamily: 'inherit' }}
            title="Escolher Voz do Mentor"
          >
            <option value="nova" className="bg-[#0a0a14] text-white">👩 Nova (Empática)</option>
            <option value="echo" className="bg-[#0a0a14] text-white">👨 Echo (Amigável)</option>
            <option value="onyx" className="bg-[#0a0a14] text-white">👨 Onyx (Sábio)</option>
          </select>

          <button
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
            title="Nova conversa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {/* Toggle auto-leitura */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (autoRead) { stop(); }
              setAutoRead(r => !r);
            }}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: autoRead ? accentColor : '#6b7280' }}
            title={autoRead ? 'Desativar voz' : 'Ativar voz'}
          >
            {autoRead ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(m => !m); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body (hidden when minimized) ── */}
      {!isMinimized && (
        <>
          {/* Alerta de Anamnese Pendente */}
          {!profile && (
            <div 
              className="bg-amber-500/10 px-4 py-2.5 flex items-center justify-between text-xs border-b animate-[fadeIn_0.3s_ease-out]"
              style={{ borderColor: `${accentColor}22`, color: '#f59e0b' }}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Deseja diagnósticos 100% personalizados?
              </span>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate('anamnese');
                }}
                className="font-bold underline text-amber-300 hover:text-amber-200 transition-colors ml-1"
              >
                Fazer Anamnese
              </button>
            </div>
          )}

          {/* ZenAvatar Visualization Center */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-950/30 border-b border-white/5 flex-shrink-0">
            <ZenAvatar state={speaking || ttsLoading ? 'speaking' : isLoading ? 'listening' : 'idle'} />
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollBehavior: 'auto' }}>
            {messages.map((msg, i) => {
              const { cleanContent, actions } = parseActionButtons(msg.content);

              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5"
                      style={{ background: `${accentColor}33`, border: `1px solid ${accentColor}44` }}
                    >
                      {guardianEl.emoji}
                    </div>
                  )}
                  <div className="max-w-[82%]">
                    <div
                      className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={msg.role === 'user'
                        ? { background: `linear-gradient(135deg, ${accentColor}cc, #6366f1aa)`, color: 'white', borderBottomRightRadius: '6px' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: '6px' }
                      }
                    >
                      {msg.role === 'assistant' ? renderMarkdown(cleanContent) : msg.content}
                    </div>
                    {/* Play button for assistant messages */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => {
                          if ((speaking || ttsLoading) && playingIndex === i) {
                            stop();
                            setPlayingIndex(null);
                          } else {
                            stop();
                            setPlayingIndex(i);
                            speak(cleanContent, selectedVoice);
                          }
                        }}
                        className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                        style={{
                          color: (speaking || ttsLoading) && playingIndex === i ? accentColor : '#9ca3af',
                          background: (speaking || ttsLoading) && playingIndex === i ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${(speaking || ttsLoading) && playingIndex === i ? accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        {speaking && playingIndex === i ? (
                          <><Square className="w-3 h-3" /> Parar áudio</>
                        ) : ttsLoading && playingIndex === i ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</>
                        ) : (
                          <><Play className="w-3 h-3" /> 🔊 Ouvir resposta</>
                        )}
                      </button>
                    )}
                    {/* Action buttons */}
                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {actions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => onNavigate?.(action.page)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
                            style={{
                              background: `${accentColor}22`,
                              border: `1px solid ${accentColor}55`,
                              color: accentColor,
                            }}
                          >
                            {action.label} →
                          </button>
                        ))}
                      </div>
                    )}
                    {/* ── Sessão Mestra CTA — aparece na msg que detectou a emoção ── */}
                    {msg.role === 'assistant' && i === sessionReadyMsgIndex && detectedEmotionId && (
                      <button
                        onClick={() => {
                          // Salva handoff: emoção detectada + resumo dos últimos 3 msgs
                          const lastMsgs = messages.slice(-3).map(m => ({ role: m.role, content: m.content }));
                          localStorage.setItem('zenmentor_handoff', JSON.stringify({
                            emotionId: detectedEmotionId,
                            intensity: 3, // intensidade padrão moderada
                            summary: lastMsgs,
                            timestamp: Date.now(),
                          }));
                          setIsOpen(false);
                          onNavigate?.('triad-session');
                        }}
                        className="mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 w-full justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}33, #6366f122)`,
                          border: `1px solid ${accentColor}66`,
                          color: 'white',
                          boxShadow: `0 0 12px ${accentColor}22`,
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        Iniciar Sessão Integrativa
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      </button>
                    )}
                    
                    {/* ── Eureka UI — aparece na msg do assistente se houver memória ── */}
                    {msg.role === 'assistant' && msg.eurekaMemory && (
                      <div className="mt-2.5 p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 text-sm">🌱</span>
                          <div className="flex-1">
                            <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                              Encontrei uma experiência anterior que pode ajudar nesta reflexão.
                            </p>
                            <button 
                              onClick={() => setShowEurekaReason(prev => prev === i ? null : i)}
                              className="mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                            >
                              Por que isso apareceu?
                            </button>
                            
                            {showEurekaReason === i && (
                              <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/10 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                                <p className="text-[11px] text-gray-300 leading-relaxed">
                                  Esta conexão apareceu porque você relatou algo semelhante antes: <br/>
                                  <span className="italic text-gray-400 mt-1 inline-block">"{msg.eurekaMemory.memory_content}"</span>
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                                   <button 
                                      onClick={() => ZenMemoryEngine.applyMemoryFeedback(msg.eurekaMemory!.id!, 'confirmed')}
                                      className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors"
                                   >
                                     👍 Faz sentido
                                   </button>
                                   <button 
                                      onClick={() => ZenMemoryEngine.applyMemoryFeedback(msg.eurekaMemory!.id!, 'rejected')}
                                      className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold hover:bg-red-500/20 transition-colors"
                                   >
                                     👎 Não representa minha experiência
                                   </button>
                                   <button className="px-2.5 py-1 rounded bg-white/5 text-gray-300 text-[10px] font-semibold hover:bg-white/10 transition-colors">
                                     ✏️ Corrigir
                                   </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Conectando UI ── */}
            {isRetrievingMemory && (
              <div className="flex justify-start opacity-80 mb-2">
                 <div className="px-4 py-2 rounded-2xl text-xs font-medium flex items-center gap-2" style={{ background: `${accentColor}22`, color: accentColor }}>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Conectando com sua jornada...
                 </div>
              </div>
            )}

            {isLoading && !isRetrievingMemory && (
              <div className="flex justify-start">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5"
                  style={{ background: `${accentColor}33`, border: `1px solid ${accentColor}44` }}
                >
                  {guardianEl.emoji}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(j => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: accentColor, animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions — visíveis até o usuário enviar a primeira mensagem */}
          {messages.filter(m => m.role === 'user').length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                '🔍 Buscar pontos no Self Oracle',
                'Como está meu equilíbrio hoje?',
                'Protocolo para ansiedade',
                'Pontos para insônia',
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s.replace(/^[\p{Emoji}\s]+/u, '').trim()); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-gray-300 transition-all hover:text-white font-medium"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="p-3 flex items-end gap-2"
            style={{ borderTop: `1px solid ${accentColor}22` }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Fale o que está sentindo..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none outline-none leading-relaxed max-h-24 overflow-y-auto"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30"
              style={{
                background: input.trim() && !isLoading
                  ? `linear-gradient(135deg, ${accentColor}, #6366f1)`
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 pb-2 text-[10px] text-gray-700 text-center">
            Self Oracle · YNSA + MTC + Metafísica · Não substitui cuidado médico
          </div>
        </>
      )}
    </div>
  );
};
