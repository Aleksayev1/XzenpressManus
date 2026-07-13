import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';
import { 
  AnamneseProfile, 
  FaixaEtaria, 
  SexoBiologico, 
  calcularGuardianScores 
} from '../data/anamneseProfile';
import { ZenAvatar } from './ZenAvatar';
import { fiveElements } from '../data/fiveElements';

interface ConversationalOnboardingProps {
  onComplete: (profile: AnamneseProfile) => void;
  userEmail?: string | null;
}

interface QuestionStep {
  text: string;
  fieldPrompt: string;
}

const STEPS: QuestionStep[] = [
  {
    // Bloco 1 — OBJETIVO + CRENÇA (Maiêutica)
    // A crença sobre a causa é a primeira informação maiêutica.
    // O ZenMentor captura o que o usuário ACHA que está causando o problema.
    text: "Olá! Sou a sua ZenMentor. Estou aqui para criar um mapa completo e personalizado da sua saúde — esse mapa vai guiar todas as recomendações que você receberá no XZenPress. Cada detalhe que você compartilhar tem valor clínico real.\n\nVamos começar pelo mais essencial: qual é o seu objetivo central de bem-estar neste momento? E na sua percepção, o que você acredita estar causando ou alimentando esse estado? Não existe resposta errada — sua intuição sobre o próprio corpo é a primeira pista que vou registrar.",
    fieldPrompt: "Objetivo Central de Bem-Estar e Percepção da Causa (Maiêutica)"
  },
  {
    // Bloco 2 — ÁGUA + CRONICICIDADE (Epigenética + MTC)
    // Quanto tempo o padrão existe determina a profundidade epigenética e o nível Ben/Biao.
    text: "Obrigada. Agora quero entender o seu combustível vital — na Medicina Tradicional Chinesa, chamamos de Jing, a energia primordial armazenada nos rins.\n\nComo está a sua energia ao longo do dia? Você acorda descansado ou já se levanta sentindo cansaço? Essa fadiga é física, mental ou as duas? Você percebe medo específico, insegurança profunda ou sensação de que lhe falta 'chão'? Dores na região lombar ou nos joelhos também fazem parte dessa pergunta.\n\nUma pergunta fundamental: há quanto tempo você carrega esse padrão — dias, semanas, meses, anos, ou desde sempre? Isso é clinicamente muito importante.",
    fieldPrompt: "Energia Vital, Lombalgias, Segurança e Cronicicidade do Padrão (Elemento Água + Epigenética)"
  },
  {
    // Bloco 3 — MADEIRA (Fígado, Tensões, Planejamento)
    text: "Importante. Agora o sistema de movimento e planejamento — na MTC, ligado ao Fígado, que governa os tendões, a visão e a fluidez das nossas decisões e emoções.\n\nVocê sente tensão ou rigidez muscular com frequência, especialmente no pescoço, ombros, nuca ou coluna? Como está a sua visão — cansaço visual, ardência, visão turva? E emocionalmente: você percebe irritabilidade, impaciência, raiva que surge rapidamente, ou dificuldade em deixar ir situações e mágoas? Se for o caso, inclua também irregularidades no ciclo menstrual, TPM intensa ou dores.",
    fieldPrompt: "Tensões Musculares, Visão, Irritabilidade e Ciclo (Elemento Madeira — Fígado)"
  },
  {
    // Bloco 4 — FOGO + HORÁRIO DO SINTOMA (MTC: Relógio dos Órgãos)
    // O horário em que o sintoma aparece ou piora revela diretamente o meridiano comprometido.
    text: "Muito bem. Agora o centro — na MTC, o Coração é o Imperador do corpo e o guardião da mente e das emoções.\n\nComo está a qualidade do seu sono? Você demora para pegar no sono, acorda no meio da noite ou acorda mais cedo do que gostaria com a mente acelerada? Você sente palpitações ou coração acelerado em repouso? E em relação à memória e concentração: você tem dificuldade em lembrar coisas recentes ou em manter o foco?\n\nUma pergunta precisa: em que horário do dia o seu sintoma principal costuma aparecer ou piorar? Isso revela qual órgão está mais comprometido no ciclo de 24 horas.",
    fieldPrompt: "Sono, Coração, Ansiedade, Memória e Horário do Sintoma (Elemento Fogo + Relógio dos Órgãos MTC)"
  },
  {
    // Bloco 5 — TERRA (Digestão, Preocupação, Apetite)
    text: "Anotei. Agora o centro da nutrição física e mental — o elemento Terra, associado ao Baço e Estômago na MTC.\n\nComo está a sua digestão? Você sente inchaço, gases, peso após as refeições, refluxo, ou alterna entre constipação e diarreia? Qual é o seu apetite — você come nos horários certos, pula refeições, ou sente compulsão por doces em momentos de estresse? E mentalmente: você se pega ruminando os mesmos pensamentos repetidamente, preocupado com situações que ainda não aconteceram?",
    fieldPrompt: "Digestão, Apetite, Compulsão Alimentar e Ruminação Mental (Elemento Terra — Baço)"
  },
  {
    // Bloco 6 — METAL (Pulmão, Respiração, Pele, Tristeza)
    text: "Importante. O elemento Metal — associado ao Pulmão e ao Intestino Grosso, que governam a capacidade de receber o novo e de soltar o que não serve mais.\n\nComo está a sua respiração no cotidiano? Você respira de forma superficial, sente aperto no peito, ou tem histórico de bronquite, sinusite ou alergias respiratórias? A sua pele apresenta ressecamento, coceira, acne ou outros problemas? E emocionalmente: você carrega tristeza, melancolia, ou tem dificuldade em se desapegar de pessoas, situações ou do passado?",
    fieldPrompt: "Respiração, Pele, Intestino Grosso e Capacidade de Soltar (Elemento Metal — Pulmão)"
  },
  {
    // Bloco 7 — HISTÓRICO CLÍNICO (Segurança clínica)
    text: "Estamos quase concluindo o seu mapa. Este ponto é fundamental para a sua segurança — preciso conhecer o seu histórico clínico para que nenhuma recomendação entre em conflito com a sua situação de saúde.\n\nVocê possui alguma condição diagnosticada por um médico? Por exemplo: hipertensão, diabetes, hipotireoidismo, transtornos de ansiedade ou depressão, doenças autoimunes, cardiopatias, problemas renais ou hepáticos. Faz uso contínuo de algum medicamento ou suplemento? Se houver cirurgias recentes ou histórico familiar relevante, este é o momento.",
    fieldPrompt: "Histórico Clínico, Diagnósticos Médicos e Medicamentos Contínuos"
  },
  {
    // Bloco 8 — CONFIRMAÇÃO ATIVA (Fechamento de Gaps)
    text: "Obrigada pela confiança em compartilhar tudo isso comigo. Antes de finalizar o seu Mapa de Guardiões, quero garantir que nenhum detalhe importante ficou de fora.\n\nHá algo sobre a sua saúde, o seu corpo ou a sua história que você considera relevante e que ainda não mencionou? Pode ser um padrão que você nota em si mesmo há muito tempo, um sintoma que parece pequeno mas te incomoda, uma sensação que você tem dificuldade de nomear — tudo isso tem valor clínico. Este espaço é seu.",
    fieldPrompt: "Informações Complementares e Fechamento de Gaps Clínicos"
  }
];

export const ConversationalOnboarding: React.FC<ConversationalOnboardingProps> = ({ onComplete, userEmail }) => {
  // Demographic Info
  const [nome, setNome] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState<FaixaEtaria>('30-44');
  const [sexoBiologico, setSexoBiologico] = useState<SexoBiologico>('feminino');
  const [screen, setScreen] = useState<'setup' | 'chat' | 'parsing' | 'reveal'>('setup');

  // Conversational Onboarding Chat State
  const [currentStep, setCurrentStep] = useState(0);
  const [chatTranscript, setChatTranscript] = useState<{ role: 'assistant' | 'user'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<AnamneseProfile | null>(null);

  // Web Speech API
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition
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

  // Voice narration of ZenMentor questions
  const speakQuestion = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);

    try {
      const cleanText = text.replace(/[🌿🧬📊⚠️💡🎯✅❌🌳🌊🔥⛰️💧]/gu, '');
      const { getBaseApiUrl } = await import('../lib/api');
      const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/ai-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: 'nova' }),
      });

      if (!response.ok) throw new Error('TTS server error');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.warn('Fallback to native SpeechSynthesis:', err);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pt-BR';
        utter.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  // Start the chat interface
  const handleStartChat = () => {
    if (!nome.trim()) return;
    setScreen('chat');
    setChatTranscript([
      { role: 'assistant', content: STEPS[0].text }
    ]);
    speakQuestion(STEPS[0].text);
  };

  // Mic Toggle
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

  // Submit Answer for Current Question
  const handleNextQuestion = () => {
    if (!input.trim()) return;

    if (isRecording) {
      recognitionRef.current.stop();
    }

    const nextTranscript = [
      ...chatTranscript,
      { role: 'user' as const, content: input.trim() }
    ];

    setChatTranscript(nextTranscript);
    setInput('');

    const nextIndex = currentStep + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(nextIndex);
      setTimeout(() => {
        setChatTranscript(prev => [
          ...prev,
          { role: 'assistant', content: STEPS[nextIndex].text }
        ]);
        speakQuestion(STEPS[nextIndex].text);
      }, 800);
    } else {
      // Process and Parse the full conversation
      processDialogue(nextTranscript);
    }
  };

  // Send full chat transcription to OpenAI/Gemini to extract clean clinical JSON
  const processDialogue = async (transcript: { role: 'assistant' | 'user'; content: string }[]) => {
    setScreen('parsing');
    setIsParsing(true);

    try {
      const { getBaseApiUrl } = await import('../lib/api');
      const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/process-onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error('Falha ao extrair dados de anamnese');

      const data = await response.json();

      // Ensure fallback structures exist and no gaps remain
      const finalProfile: AnamneseProfile = {
        nome,
        faixaEtaria,
        sexoBiologico,
        objetivoPrincipal: data.objetivoPrincipal || 'reduzir_estresse',
        qualidadeSono: data.qualidadeSono || 'regular',
        nivelEnergia: data.nivelEnergia ?? 50,
        nivelEstresse: data.nivelEstresse || 'moderado',
        nivelAtividade: data.nivelAtividade || 'moderado',
        padraoAlimentar: data.padraoAlimentar || 'misto',
        sintomasFisicos: Array.isArray(data.sintomasFisicos) ? data.sintomasFisicos : [],
        emocoesDominantes: Array.isArray(data.emocoesDominantes) ? data.emocoesDominantes : [],
        condicoesExistentes: Array.isArray(data.condicoesExistentes) ? data.condicoesExistentes : ['nenhuma'],
        medicamentosEmUso: Array.isArray(data.medicamentosEmUso) ? data.medicamentosEmUso : ['nenhum'],
        cronicicidade: data.cronicicidade || undefined,
        horarioSintoma: data.horarioSintoma || undefined,
        crencaLimitante: data.crencaLimitante || undefined,
        guardianScores: { madeira: 60, fogo: 60, terra: 60, metal: 60, agua: 60 },
        completedAt: new Date().toISOString(),
        version: 1
      };

      // Calculate Element vital scores using calculations
      finalProfile.guardianScores = calcularGuardianScores(finalProfile);

      setParsedProfile(finalProfile);
      setScreen('reveal');
    } catch (err) {
      console.error(err);
      // Fail-safe default profile in case AI connection drops (Zero-gap fallback)
      const fallback: AnamneseProfile = {
        nome,
        faixaEtaria,
        sexoBiologico,
        objetivoPrincipal: 'reduzir_estresse',
        qualidadeSono: 'regular',
        nivelEnergia: 60,
        nivelEstresse: 'moderado',
        nivelAtividade: 'moderado',
        padraoAlimentar: 'misto',
        sintomasFisicos: [],
        emocoesDominantes: [],
        condicoesExistentes: ['nenhuma'],
        medicamentosEmUso: ['nenhum'],
        cronicicidade: undefined,
        horarioSintoma: undefined,
        crencaLimitante: undefined,
        guardianScores: { madeira: 60, fogo: 60, terra: 60, metal: 60, agua: 60 },
        completedAt: new Date().toISOString(),
        version: 1
      };
      fallback.guardianScores = calcularGuardianScores(fallback);
      setParsedProfile(fallback);
      setScreen('reveal');
    } finally {
      setIsParsing(false);
    }
  };

  // Clean Audio on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, []);

  // Renders
  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center">
            <span className="text-5xl mb-4 block animate-bounce">🌱</span>
            <h1 className="text-3xl font-extrabold text-white">Retrato Integrativo</h1>
            <p className="text-gray-400 text-sm mt-2">Identidade Biopsíquica · Pilar 0</p>
          </div>

          <div className="space-y-5 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Qual seu nome?</label>
              <input 
                type="text" 
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Alexandre"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sua Faixa Etária?</label>
              <div className="grid grid-cols-2 gap-2">
                {(['18-29', '30-44', '45-59', '60+'] as FaixaEtaria[]).map(val => (
                  <button
                    key={val}
                    onClick={() => setFaixaEtaria(val)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all
                      ${faixaEtaria === val ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-950 border-white/5 text-gray-400'}
                    `}
                  >
                    {val} anos
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sexo Biológico?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['masculino', 'feminino', 'nao_informar'] as SexoBiologico[]).map(val => (
                  <button
                    key={val}
                    onClick={() => setSexoBiologico(val)}
                    className={`py-3 rounded-xl border text-xs font-semibold transition-all
                      ${sexoBiologico === val ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-gray-400'}
                    `}
                  >
                    {val === 'masculino' ? 'Masc' : val === 'feminino' ? 'Fem' : 'N/A'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartChat}
            disabled={!nome.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            Iniciar Consulta por Voz
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'chat') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6">
        {/* Top Header */}
        <div className="max-w-md mx-auto w-full flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-white">Consulta ZenMentor</span>
          </div>
          <span className="text-xs text-gray-500">Passo {currentStep + 1} de {STEPS.length}</span>
        </div>

        {/* Mid Avatar & Audio Animation */}
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center py-6">
          <ZenAvatar state={isSpeaking ? 'speaking' : isRecording ? 'listening' : 'idle'} />
          <p className="text-gray-400 text-xs text-center px-6 mt-4 leading-relaxed italic">
            {isSpeaking 
              ? "ZenMentor explicando o diagnóstico..." 
              : isRecording 
                ? "Gravando sua resposta... Fale livremente." 
                : "Aperte no microfone e responda em voz alta."
            }
          </p>
        </div>

        {/* User Inputs & Transcript View */}
        <div className="max-w-md mx-auto w-full space-y-4">
          {/* Conversational Box */}
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-4 max-h-48 overflow-y-auto space-y-3">
            {chatTranscript.slice(-2).map((m, idx) => (
              <div key={idx} className={`text-sm leading-relaxed ${m.role === 'assistant' ? 'text-purple-300 font-medium' : 'text-white bg-white/5 p-3 rounded-2xl border border-white/5'}`}>
                <strong>{m.role === 'assistant' ? 'ZenMentor' : nome}:</strong> {m.content}
              </div>
            ))}
          </div>

          {/* Voice & Keyboard Inputs */}
          <div className="flex gap-2.5 items-center">
            {/* Record Voice Button */}
            <button
              onClick={toggleRecording}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg
                ${isRecording 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/20' 
                  : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/10'
                }
              `}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Input Text Box */}
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite ou fale sua resposta..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-all"
              onKeyDown={e => e.key === 'Enter' && handleNextQuestion()}
            />

            {/* Send Button */}
            <button
              onClick={handleNextQuestion}
              disabled={!input.trim()}
              className="w-14 h-14 rounded-2xl bg-indigo-600 disabled:opacity-30 disabled:pointer-events-none hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'parsing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <ZenAvatar state="listening" />
        <h2 className="text-xl font-bold text-white mb-2 mt-6">Estruturando Retrato Integrativo...</h2>
        <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
          O ZenCore AI está consolidando seu Mapa de Guardiões e cruzando os 5 Elementos sem lacunas de dados.
        </p>
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (screen === 'reveal' && parsedProfile) {
    const scores = parsedProfile.guardianScores;
    const weakestEntry = Object.entries(scores).reduce(
      (min, [k, v]) => (v < min[1] ? [k, v] : min),
      ['', 100]
    );
    const weakEl = fiveElements.find(e => e.id === weakestEntry[0])!;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-25"
          style={{ background: `radial-gradient(circle at center, ${weakEl.color}55 0%, transparent 70%)` }}
        />

        <div className="max-w-sm w-full z-10 space-y-6">
          <div className="text-8xl animate-bounce" style={{ filter: `drop-shadow(0 0 32px ${weakEl.color})` }}>
            {weakEl.emoji}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Seu Guardião Primário</div>
            <h2 className="text-3xl font-extrabold text-white">{weakEl.name}</h2>
            <p className="text-sm mt-1" style={{ color: weakEl.color }}>{weakEl.organ} · {weakEl.frequency} Hz</p>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed px-4">{weakEl.weakMessage}</p>

          {/* Scores Breakdown */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 text-left space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Seus Guardiões</div>
            {fiveElements.map(el => (
              <div key={el.id} className="flex items-center gap-3">
                <span className="text-lg">{el.emoji}</span>
                <div className="flex-1 bg-slate-850 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${scores[el.id as keyof typeof scores]}%`,
                      backgroundColor: el.color
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right font-medium">
                  {scores[el.id as keyof typeof scores]}%
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(parsedProfile)}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${weakEl.color}cc, ${weakEl.color}66)`,
              boxShadow: `0 8px 32px ${weakEl.color}44`
            }}
          >
            <Sparkles className="w-5 h-5" />
            Entrar no meu XZenPress V2.0
          </button>
        </div>
      </div>
    );
  }

  return null;
};
export default ConversationalOnboarding;
