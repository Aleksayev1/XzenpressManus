import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, ChevronDown, RotateCcw, Volume2, VolumeX, Play, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadAnamneseProfile } from '../data/anamneseProfile';
import { fiveElements } from '../data/fiveElements';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ZenMentorChatProps {
  onNavigate?: (page: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
function parseActionButtons(content: string, onNavigate?: (page: string) => void) {
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
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stripMarkdown = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[🌿🧬📊⚠️💡🎯✅❌🌳🌊🔥⛰️💧]/gu, '')
      .trim();

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    const utter = new SpeechSynthesisUtterance(clean);

    // Detecta o idioma do navegador automaticamente
    // Ex: pt-BR, en-US, es-ES, fr-FR, zh-CN, etc.
    const browserLang = navigator.language || 'pt-BR';
    utter.lang = browserLang;
    utter.rate = 0.95;
    utter.pitch = 1.05;

    // Escolhe a melhor voz feminina disponível para o idioma detectado
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return; // ainda carregando

      const langPrefix = browserLang.split('-')[0]; // ex: 'pt', 'en', 'es'

      // 1. Voz feminina no idioma exato (ex: pt-BR)
      const exactFemale = voices.find(v =>
        v.lang === browserLang && /female|femi|woman|luciana|francisca|samantha|karen|moira|amelie|ines/i.test(v.name)
      );
      // 2. Qualquer voz no idioma exato
      const exactAny = voices.find(v => v.lang === browserLang);
      // 3. Voz feminina no mesmo idioma-base (ex: pt-PT)
      const baseFemale = voices.find(v =>
        v.lang.startsWith(langPrefix) && /female|femi|woman|luciana|francisca|samantha|karen/i.test(v.name)
      );
      // 4. Qualquer voz no mesmo idioma-base
      const baseAny = voices.find(v => v.lang.startsWith(langPrefix));

      const chosen = exactFemale || exactAny || baseFemale || baseAny;
      if (chosen) utter.voice = chosen;
    };

    // Vozes podem não estar carregadas ainda — tenta agora e no evento
    loadVoices();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    }

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  return { speak, stop, speaking };
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
  const [autoRead, setAutoRead] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const { speak, stop, speaking } = useTTS();
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

      const anamneseContext = buildAnamneseContext();

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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }]);
      // Auto-leitura se ativada
      if (autoRead) {
        const { cleanContent } = parseActionButtons(data.reply, undefined);
        speak(cleanContent);
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
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollBehavior: 'auto' }}>
            {messages.map((msg, i) => {
              const { cleanContent, actions } = parseActionButtons(msg.content, onNavigate);

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
                          if (speaking && playingIndex === i) {
                            stop();
                            setPlayingIndex(null);
                          } else {
                            stop();
                            setPlayingIndex(i);
                            speak(cleanContent);
                          }
                        }}
                        className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] transition-all hover:opacity-80"
                        style={{
                          color: speaking && playingIndex === i ? accentColor : '#4b5563',
                          background: speaking && playingIndex === i ? `${accentColor}15` : 'transparent',
                        }}
                      >
                        {speaking && playingIndex === i
                          ? <><Square className="w-2.5 h-2.5" /> Parar</>
                          : <><Play className="w-2.5 h-2.5" /> Ouvir</>
                        }
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
                  </div>
                </div>
              );
            })}

            {isLoading && (
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

          {/* Suggestions (shown when chat is empty after greeting) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                'Como está meu equilíbrio hoje?',
                'Protocolo para ansiedade',
                'Pontos para insônia',
                'Reforma íntima',
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] text-gray-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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
