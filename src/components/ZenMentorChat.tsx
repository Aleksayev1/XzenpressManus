import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, ChevronDown, RotateCcw, Volume2, VolumeX, Play, Square, Sparkles, ArrowRight, Mic, MicOff, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadAnamneseProfile } from '../data/anamneseProfile';
import { fiveElements } from '../data/fiveElements';
import { ZenAvatar } from './ZenAvatar';
import { emotionalStates } from '../data/emotionalMapping';
import { ZenMemoryEngine, MemoryCategory, ZenMemory } from '../services/zenMemoryEngine';
import {
  playMtcElement, startBinauralBeats, startQigongRhythm, startDownRegulationProtocol, stopAllZenAudio,
  type MtcElement, type BinauralState, type ZenAudioSession
} from '../services/zenAudioEngine';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  eurekaMemory?: ZenMemory;
  zenSomProtocols?: string[];
  actions?: { label: string; page: string }[];
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
    greeting2 += `Seu **${weakEl.name}** (${weakEl.organ}) está pedindo atenção — apenas ${weakest[1]}% de vitalidade. `;
    greeting2 += `${weakEl.weakMessage}\n\n`;
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

/**
 * PRINCÍPIO DA RETOMADA — ZenCognitive Architecture v2
 * Verifica se há contexto de sessão anterior salvo e constrói
 * uma abertura que referencia o que foi dito antes.
 * Isso é o que transforma um chatbot em um terapeuta que lembra.
 */
async function buildRetomadaGreeting(
  userId: string | undefined,
  userName?: string
): Promise<string> {
  const profile = loadAnamneseProfile();
  const hour = new Date().getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const name = userName || profile?.nome || 'você';

  // 1. Verificar contexto da última sessão salvo no localStorage
  const lastSessionRaw = localStorage.getItem('xzen_last_session_context');
  const lastSessionDate = localStorage.getItem('xzen_last_session_date');

  let lastContext: { queixa?: string; protocolo?: string; topMemory?: string } | null = null;
  if (lastSessionRaw) {
    try { lastContext = JSON.parse(lastSessionRaw); } catch {}
  }

  // 2. Se há memórias longitudinais e userId, buscar a mais recente ativa
  let topMemoryContent: string | null = lastContext?.topMemory || null;
  if (userId && !topMemoryContent) {
    try {
      const memories = await ZenMemoryEngine.retrieveActiveContext(userId, ['general', 'emotion', 'stress', 'sleep']);
      if (memories.length > 0) {
        topMemoryContent = memories[0].memory_content;
      }
    } catch {}
  }

  // 3. Calcular dias desde a última sessão
  let diasDesdeUltima: number | null = null;
  if (lastSessionDate) {
    const diff = Date.now() - new Date(lastSessionDate).getTime();
    diasDesdeUltima = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // 4. Construir a abertura com Princípio da Retomada
  // Casos: nunca usou | voltou hoje | voltou após dias | voltou com memória ativa

  // CASO A: Nunca usou — saudação de boas-vindas padrão
  if (!lastSessionDate && !topMemoryContent) {
    return buildGreeting(userName);
  }

  let retomada = `${saudacao}, ${name}! 🌿\n\n`;

  // CASO B: Tem memória longitudinal ativa — referencia diretamente
  if (topMemoryContent) {
    retomada += `Estive lembrando de você. `;
    if (diasDesdeUltima !== null && diasDesdeUltima > 0) {
      retomada += `Faz ${diasDesdeUltima === 1 ? '1 dia' : `${diasDesdeUltima} dias`} desde nossa última conversa. `;
    }
    retomada += `\n\nNa nossa última sessão, observei que **${topMemoryContent}** — `;
    retomada += `como está isso hoje?`;
    return retomada;
  }

  // CASO C: Tem contexto de queixa anterior mas sem memória formal
  if (lastContext?.queixa) {
    retomada += `Fico feliz em te ver de novo. `;
    if (diasDesdeUltima !== null && diasDesdeUltima > 0) {
      retomada += `Faz ${diasDesdeUltima === 1 ? '1 dia' : `${diasDesdeUltima} dias`} desde nossa última conversa. `;
    }
    retomada += `\n\nNa última vez você mencionou **${lastContext.queixa}**. Como está isso agora?`;
    if (lastContext.protocolo) {
      retomada += ` A prática de **${lastContext.protocolo}** fez alguma diferença?`;
    }
    return retomada;
  }

  // CASO D: Voltou mas sem contexto específico
  if (diasDesdeUltima !== null) {
    retomada += diasDesdeUltima === 0
      ? `Que bom que voltou hoje. O que está sentindo agora?`
      : `Que bom ter você de volta após ${diasDesdeUltima === 1 ? '1 dia' : `${diasDesdeUltima} dias`}. Como está se sentindo?`;
    return retomada;
  }

  return buildGreeting(userName);
}

/** Salva o contexto da sessão atual para ser usado na próxima abertura (Princípio da Retomada) */
function saveSessionContext(messages: { role: string; content: string }[]): void {
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  if (userMessages.length === 0) return;

  // Extrai a queixa principal da primeira mensagem do usuário
  const queixa = userMessages[0]?.content?.substring(0, 150) || '';

  // Tenta extrair protocolo mencionado pela IA (respiração, acupressão, etc.)
  const allAssistantText = assistantMessages.map(m => m.content).join(' ');
  let protocolo: string | undefined;
  const protocolMatch = allAssistantText.match(/(respiração [\w-]+|ponto [\w\d]+|4-7-8|técnica [\w]+)/i);
  if (protocolMatch) protocolo = protocolMatch[0];

  const context = { queixa, protocolo, savedAt: new Date().toISOString() };
  localStorage.setItem('xzen_last_session_context', JSON.stringify(context));
  localStorage.setItem('xzen_last_session_date', new Date().toISOString());
}

// ─── ZenSom Protocol Config ──────────────────────────────────────────────────
// Maps tag IDs used by AI to human-readable info and engine function keys
const ZEN_SOM_PROTOCOLS: Record<string, {
  label: string; emoji: string; description: string;
  type: 'mtc' | 'binaural' | 'qigong' | 'downreg';
  param?: MtcElement | BinauralState;
}> = {
  'down-regulation': {
    label: 'Down Regulation',   emoji: '🏥',
    description: 'Rampa BPM 80→58 · Grounding 174Hz · 8 min',
    type: 'downreg'
  },
  'binaural-alpha': {
    label: 'Alpha 10Hz',  emoji: '😌',
    description: 'Relaxamento e foco suave',
    type: 'binaural', param: 'alpha' as BinauralState
  },
  'binaural-theta': {
    label: 'Theta 6Hz',   emoji: '🎯',
    description: 'Meditação e criatividade',
    type: 'binaural', param: 'theta' as BinauralState
  },
  'binaural-delta': {
    label: 'Delta 2Hz',   emoji: '😴',
    description: 'Indução ao sono profundo',
    type: 'binaural', param: 'delta' as BinauralState
  },
  'binaural-gamma': {
    label: 'Gamma 40Hz',  emoji: '🧠',
    description: 'Cognição máxima · Foco',
    type: 'binaural', param: 'gamma' as BinauralState
  },
  'mtc-wood':  { label: 'MTC Madeira', emoji: '🌿', description: 'Fígado/Vesícula · Jiao 288Hz', type: 'mtc', param: 'wood' as MtcElement },
  'mtc-fire':  { label: 'MTC Fogo',    emoji: '🔥', description: 'Coração · Zhi 384Hz',        type: 'mtc', param: 'fire' as MtcElement },
  'mtc-earth': { label: 'MTC Terra',   emoji: '🌍', description: 'Baço/Estômago · Gong 432Hz', type: 'mtc', param: 'earth' as MtcElement },
  'mtc-metal': { label: 'MTC Metal',   emoji: '⚙️', description: 'Pulmão · Shang 480Hz',       type: 'mtc', param: 'metal' as MtcElement },
  'mtc-water': { label: 'MTC Água',    emoji: '💧', description: 'Rim/Bexiga · Yu 324Hz',      type: 'mtc', param: 'water' as MtcElement },
  'qigong':    { label: 'Qigong',      emoji: '🌬️', description: 'Âncora respiratória 5.5s/fase', type: 'qigong' },
};

// ─── Action Button Parser ─────────────────────────────────────────────────────
// Detects patterns like [ABRIR:acupressure] [ZENFLOW:liberacao] [ZENSOM:protocol] and [CANDIDATA: "text"] in AI responses
function parseActionButtons(content: string) {
  const actionRegex = /\[ABRIR:([\w-]+)\]/g;
  const zenflowRegex = /\[ZENFLOW:([\w]+)\]/g;
  const zenSomRegex = /\[ZENSOM:([\w-]+)\]/g;
  const candidataRegex = /\[CANDIDATA:\s*(.+?)\]/gi;

  const actions: { label: string; page: string }[] = [];
  const zenSomProtocols: string[] = [];
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    const page = match[1];
    let label = `Abrir ${page}`;
    let targetPage = page;
    if (page === 'sessao-mestra') {
      label = '🧘 Iniciar Sessão Mestra';
      targetPage = 'triad-session';
    }
    if (page === 'acupressure') label = '💆 Mapa de Acupressão';
    if (page === 'breathing') label = '🌬️ Exercício de Respiração';
    actions.push({ label, page: targetPage });
  }

  // Fallback: Se a IA falar do botão mas não colocar a tag
  const contentLower = content.toLowerCase();
  if ((contentLower.includes('botão abaixo') || contentLower.includes('ciclo terapêutico')) && !actions.some(a => a.page === 'triad-session')) {
    actions.push({ label: '🧘 Iniciar Sessão Mestra', page: 'triad-session' });
  }
  while ((match = zenflowRegex.exec(content)) !== null) {
    actions.push({ label: `Iniciar ZenFlow ${match[1]}`, page: 'zenflow' });
  }

  // ZenSom protocol tags
  while ((match = zenSomRegex.exec(content)) !== null) {
    if (ZEN_SOM_PROTOCOLS[match[1]]) zenSomProtocols.push(match[1]);
  }

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
    .replace(zenSomRegex, '')
    .replace(candidataRegex, '')
    .replace(/\[[A-Z0-9_]+:[^\]]*$/gi, '') // Clean up any truncated/unclosed tags at the end
    .trim();
    
  return { cleanContent, actions, zenSomProtocols, candidateMemoryText };
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
  const [memoryFeedbackStatus, setMemoryFeedbackStatus] = useState<Record<string, 'confirmed' | 'rejected'>>({});

  const handleMemoryFeedback = async (memoryId: string, feedbackType: 'confirmed' | 'rejected') => {
    setMemoryFeedbackStatus(prev => ({ ...prev, [memoryId]: feedbackType }));
    try {
      await ZenMemoryEngine.applyMemoryFeedback(memoryId, feedbackType);
    } catch (err) {
      console.error('Error applying memory feedback', err);
    }
  };

  // ── ZenSom (sound engine inside chat) ─────────────────────────────────
  const [zenSomActive, setZenSomActive] = useState<string | null>(null); // protocolId active
  const [zenSomBpm, setZenSomBpm] = useState<number>(80);
  const [zenSomPhase, setZenSomPhase] = useState<'inspire' | 'expire'>('inspire');
  const zenSomRef = useRef<ZenAudioSession | null>(null);

  const stopZenSom = useCallback(() => {
    zenSomRef.current?.stop();
    zenSomRef.current = null;
    setZenSomActive(null);
  }, []);

  const launchZenSom = useCallback((protocolId: string) => {
    const proto = ZEN_SOM_PROTOCOLS[protocolId];
    if (!proto) return;
    if (zenSomActive === protocolId) { stopZenSom(); return; }
    stopZenSom();
    let session: ZenAudioSession | null = null;
    if (proto.type === 'downreg') {
      session = startDownRegulationProtocol((bpm) => setZenSomBpm(bpm), 0.2);
    } else if (proto.type === 'binaural') {
      session = startBinauralBeats(proto.param as BinauralState, 0.18);
    } else if (proto.type === 'mtc') {
      session = playMtcElement(proto.param as MtcElement, 0.22);
    } else if (proto.type === 'qigong') {
      session = startQigongRhythm((phase) => setZenSomPhase(phase), 0.15);
    }
    if (session) { zenSomRef.current = session; setZenSomActive(protocolId); }
  }, [zenSomActive, stopZenSom]);

  // Cleanup on unmount
  useEffect(() => () => { zenSomRef.current?.stop(); }, []);

  // ── Speech Recognition ─────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'pt-BR';
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            text += event.results[i][0].transcript;
          }
        }
        if (text) {
          setInput(prev => (prev + ' ' + text).trim());
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Gravação de voz não suportada neste navegador. Por favor, digite sua resposta.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };
  
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

  // Initial greeting when first opened — Princípio da Retomada (ZenCognitive Architecture v2)
  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (!hasGreeted) {
      // Usa o Princípio da Retomada: referencia sessão anterior se existir
      const greetingText = await buildRetomadaGreeting(
        user?.id,
        user?.email?.split('@')[0]
      );
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

    // 🔒 Controle de Custos: Rate Limit no Frontend para usuários gratuitos
    const isUserPremium = user?.isPremium || false;
    if (!isUserPremium) {
      const now = Date.now();
      const usageRaw = localStorage.getItem('zenmentor_usage_timestamps');
      let timestamps: number[] = [];
      if (usageRaw) {
        try {
          timestamps = JSON.parse(usageRaw);
        } catch (e) {}
      }
      // Filtra requisições das últimas 1 hora
      timestamps = timestamps.filter(t => now - t < 60 * 60 * 1000);

      if (timestamps.length >= 3) {
        const limitMessage = user ? 
          `Degustação diária concluída! 🌟\n\nVocê sabia que a consistência é a chave para moldar sua epigenética e calibrar seus Guardiões? Acessar o Zen Mentor diariamente ajuda você a se compreender de forma integral.\n\nPara continuar este diálogo transformador e ter consultas ilimitadas, assine o plano Premium!` :
          `Degustação finalizada (3 mensagens)! 🌟\n\nO Zen Mentor é apenas o início. Para dar continuidade ao seu tratamento e liberar consultas ilimitadas, faça o seu login ou assine o plano Premium!`;

        setMessages(prev => [...prev, 
          { role: 'user', content: input.trim(), timestamp: new Date() },
          { 
            role: 'assistant', 
            content: limitMessage, 
            timestamp: new Date() 
          }
        ]);
        setInput('');
        return;
      }

      // Salva novo timestamp
      timestamps.push(now);
      localStorage.setItem('zenmentor_usage_timestamps', JSON.stringify(timestamps));
    }

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

      // ── ZenSom Instructions ── informa a IA sobre os protocolos sonoros disponíveis
      anamneseContext += `

🔊 ZENSOM — PROTOCOLOS SONOROS CLÍNICOS DISPONÍVEIS:
Você pode prescrever um protocolo sonoro terapêutico adicionando uma tag [ZENSOM:id] ao final da sua resposta.
Use apenas quando identificar claramente que o usuário se beneficiaria de intervenção sonora.
Protocolos disponíveis:
• [ZENSOM:down-regulation] → Alta ativação simpática, ansiedade aguda, estresse severo, pânico. Rampa BPM 80→58 + Grounding 174Hz (8 min).
• [ZENSOM:binaural-alpha] → Tensão moderada, dificuldade de focar, mente agitada. Alpha 10Hz — relaxamento com clareza.
• [ZENSOM:binaural-theta] → Bloqueio criativo, meditação, introspecção profunda. Theta 6Hz.
• [ZENSOM:binaural-delta] → Insônia, sono fragmentado, exaustão. Delta 2Hz — indução ao sono.
• [ZENSOM:binaural-gamma] → Baixo desempenho cognitivo, falta de foco para trabalho intelectual. Gamma 40Hz.
• [ZENSOM:qigong] → Dificuldade com respiração, ansiedade leve, tensão muscular. Âncora respiratória 5.5s.
• [ZENSOM:mtc-wood] → Irritabilidade, raiva, tensão no pescoço/ombros, problemas de fígado. MTC Madeira 288Hz.
• [ZENSOM:mtc-fire] → Palpitações, excesso de calor, ansiedade cardíaca. MTC Fogo 384Hz.
• [ZENSOM:mtc-earth] → Preocupação excessiva, ruminação, problemas digestivos. MTC Terra 432Hz.
• [ZENSOM:mtc-metal] → Tristeza, luto, problemas respiratórios, aperto no peito. MTC Metal 480Hz.
• [ZENSOM:mtc-water] → Medo, insegurança, fadiga renal, dores lombares. MTC Água 324Hz.
EXEMPLO: Se o usuário relatar alta ansiedade: responda normalmente e adicione [ZENSOM:down-regulation] no final.
Não mencione a tag no texto, ela é invisível ao usuário. Máximo 1 tag por resposta.`;

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
        const { cleanContent, actions, zenSomProtocols, candidateMemoryText } = parseActionButtons(data.reply);
        
        // Se a IA gerou uma memória candidata, registramos silenciosamente
        if (candidateMemoryText && user?.id) {
            ZenMemoryEngine.captureCandidateMemory({
                user_id: user.id,
                memory_type: 'episodic',
                memory_category: 'general',
                tags: ['ai_inference'],
                memory_content: candidateMemoryText,
                source_type: 'ai_inference',
                privacy_level: 'personal_context',
                influence_weight: 2,
                confidence_score: 30 // baixa confiança inicial, aguarda usuário confirmar na próxima que aparecer
            });
        }

        const updated = [...prev, {
          role: 'assistant' as const,
          content: cleanContent,
          timestamp: new Date(),
          eurekaMemory: topMemories[0], // Salva a principal para o UI
          zenSomProtocols,              // Salva protocolos sonoros para renderizar
          actions,                      // Salva as ações detectadas para renderizar
        }];
        // Detect emotional context for Sessão Mestra handoff
        const emotionId = extractEmotionFromReply(cleanContent);
        if (emotionId && sessionReadyMsgIndex === null) {
          setDetectedEmotionId(emotionId);
          setSessionReadyMsgIndex(updated.length - 1);
        }
        // Auto-launch ZenSom if protocol recommended
        if (zenSomProtocols.length > 0) {
          setTimeout(() => launchZenSom(zenSomProtocols[0]), 800);
        }
        return updated;
      });
      // Auto-leitura se ativada
      if (autoRead) {
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
    stopAllZenAudio();
    try { stop(); } catch {}
    // Princípio da Retomada — salva contexto antes de resetar
    saveSessionContext(messages.map(m => ({ role: m.role, content: m.content })));
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
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(m => {
                const next = !m;
                if (next) { stopAllZenAudio(); try { stop(); } catch {} }
                return next;
              });
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              stopZenSom();
              // Princípio da Retomada — salva contexto da sessão antes de fechar
              saveSessionContext(messages.map(m => ({ role: m.role, content: m.content })));
              setIsOpen(false);
            }}
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
                  stopZenSom();
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
              const cleanContent = msg.content;
              const msgActions = msg.actions || [];
              const msgZenSom = msg.zenSomProtocols || [];

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
                    {msgActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {msgActions.map((action, ai) => (
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
                    {/* ZenSom active protocol mini-player card */}
                    {msg.role === 'assistant' && msgZenSom.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {msgZenSom.map((protoId) => {
                          const proto = ZEN_SOM_PROTOCOLS[protoId];
                          if (!proto) return null;
                          const isActive = zenSomActive === protoId;
                          return (
                            <div
                              key={protoId}
                              className="p-2 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 bg-white/5 border-white/10"
                              style={{
                                background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-base flex-shrink-0">{proto.emoji}</span>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-gray-200 truncate">{proto.label}</p>
                                  <p className="text-[9px] text-gray-500 truncate">{proto.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isActive && proto.type === 'downreg' && (
                                  <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full animate-pulse">BPM: {zenSomBpm}</span>
                                )}
                                {isActive && proto.type === 'qigong' && (
                                  <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full animate-pulse">
                                    {zenSomPhase === 'inspire' ? '↑ Inspire' : '↓ Expire'}
                                  </span>
                                )}
                                <button
                                  onClick={() => launchZenSom(protoId)}
                                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                                    isActive
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                                  }`}
                                >
                                  {isActive ? <Square className="w-3 h-3 fill-red-400" /> : <Play className="w-3 h-3 fill-indigo-300" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* ── Sessão Mestra + Integrativa CTAs — aparecem na msg que detectou a emoção ── */}
                    {msg.role === 'assistant' && i === sessionReadyMsgIndex && detectedEmotionId && (
                      <div className="mt-3 flex flex-col gap-2">

                        {/* ── SESSÃO MESTRA — Primária ── */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"
                            style={{ color: accentColor }}>
                            <Sparkles className="w-3 h-3" /> Recomendado para você agora
                          </p>
                          <button
                            onClick={() => {
                              const lastMsgs = messages.slice(-3).map(m => ({ role: m.role, content: m.content }));
                              localStorage.setItem('zenmentor_handoff', JSON.stringify({
                                emotionId: detectedEmotionId,
                                intensity: 3,
                                summary: lastMsgs,
                                timestamp: Date.now(),
                              }));
                              stopZenSom();
                              setIsOpen(false);
                              onNavigate?.('triad-session');
                            }}
                            className="w-full flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] hover:brightness-110"
                            style={{
                              background: `linear-gradient(135deg, ${accentColor}, #6366f1)`,
                              boxShadow: `0 4px 20px ${accentColor}55`,
                              color: 'white',
                              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                            }}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <Sparkles className="w-4 h-4" />
                              ✨ Iniciar Sessão Mestra
                              <ArrowRight className="w-4 h-4" />
                            </span>
                            <span className="text-[10px] font-normal opacity-80">
                              Protocolo 100% personalizado — a IA montou para você agora
                            </span>
                          </button>
                        </div>

                        {/* ── Divisor ── */}
                        <div className="flex items-center gap-2 px-1">
                          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                          <span className="text-[10px] text-gray-600 font-medium">ou</span>
                          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* ── SESSÃO INTEGRATIVA — Secundária ── */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-gray-500">
                            ⚡ Acesso rápido
                          </p>
                          <button
                            onClick={() => {
                              stopZenSom();
                              setIsOpen(false);
                              onNavigate?.('triad-session');
                            }}
                            className="w-full flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.01]"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#9ca3af',
                            }}
                          >
                            <span className="flex items-center gap-2 text-xs">
                              <Zap className="w-3.5 h-3.5" />
                              Iniciar Sessão Integrativa
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] font-normal opacity-70">
                              Sessão padrão rápida — sem diagnóstico prévio
                            </span>
                          </button>
                        </div>

                      </div>
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
                                      onClick={() => handleMemoryFeedback(msg.eurekaMemory!.id!, 'confirmed')}
                                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                                        memoryFeedbackStatus[msg.eurekaMemory!.id!] === 'confirmed'
                                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                      }`}
                                   >
                                     {memoryFeedbackStatus[msg.eurekaMemory!.id!] === 'confirmed' ? '✅ Confirmado' : '👍 Faz sentido'}
                                   </button>
                                   <button 
                                      onClick={() => handleMemoryFeedback(msg.eurekaMemory!.id!, 'rejected')}
                                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                                        memoryFeedbackStatus[msg.eurekaMemory!.id!] === 'rejected'
                                          ? 'bg-red-500/30 text-red-300 border border-red-400'
                                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                      }`}
                                   >
                                     {memoryFeedbackStatus[msg.eurekaMemory!.id!] === 'rejected' ? '❌ Descartado' : '👎 Não representa minha experiência'}
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
            {/* Mic Toggle Button */}
            <button
              onClick={toggleRecording}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                ${isRecording 
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                  : 'bg-white/10 hover:bg-white/15 text-gray-300'
                }
              `}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
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
          <div className="px-4 pb-1">
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-1.5 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400 opacity-70" />
              <span className="text-[10px] text-indigo-300/80 font-medium leading-tight">
                Seus insights ficam salvos automaticamente no Mapa Vivo (Premium)
              </span>
            </div>
          </div>
          <div className="px-4 pb-2 pt-1 text-[9px] text-gray-700 text-center">
            Self Oracle · YNSA + MTC + Metafísica · Não substitui cuidado médico
          </div>
        </>
      )}
    </div>
  );
};
