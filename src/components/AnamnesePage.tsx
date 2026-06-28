import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Lock, UserPlus } from 'lucide-react';
import {
  AnamneseProfile,
  FaixaEtaria,
  SexoBiologico,
  ObjetivoPrincipal,
  QualidadeSono,
  NivelEstresse,
  NivelAtividade,
  CondicaoExistente,
  MedicamentoPotencial,
  OBJETIVOS_CONFIG,
  SINTOMAS_CONFIG,
  EMOCOES_CONFIG,
  CONDICOES_CONFIG,
  MEDICAMENTOS_CONFIG,
  calcularGuardianScores,
  saveAnamneseProfile,
} from '../data/anamneseProfile';
import { fiveElements } from '../data/fiveElements';

interface AnamnesePageProps {
  onComplete: (profile: AnamneseProfile) => void;
  onRegister?: () => void;
  isGuest?: boolean;
}

const TOTAL_STEPS = 7;

// ---- Helpers ----
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-widest">Pilar 0 · Anamnese</span>
        <span className="text-xs text-gray-500">{step} de {TOTAL_STEPS}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1">
        <div
          className="h-1 rounded-full transition-all duration-700"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
        />
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  color = '#6366f1',
  children,
}: {
  selected: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group"
      style={{
        borderColor: selected ? color : '#374151',
        backgroundColor: selected ? `${color}18` : '#111827',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {selected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      {children}
    </button>
  );
}

// ---- REVEALING SCREEN ----
function RevealScreen({ profile, onDone, onRegister, isGuest }: {
  profile: AnamneseProfile;
  onDone: () => void;
  onRegister?: () => void;
  isGuest?: boolean;
}) {
  const guardianFraco = Object.entries(profile.guardianScores).reduce(
    (min, [k, v]) => (v < min[1] ? [k, v] : min),
    ['', 100]
  );
  const el = fiveElements.find(e => e.id === guardianFraco[0])!;
  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');
  const [showPopup, setShowPopup] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [animate, setAnimate] = useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setPhase('reveal'), 2200);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (phase === 'reveal') {
      const t = setTimeout(() => setAnimate(true), 150);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6 animate-pulse">🧬</div>
        <h2 className="text-xl font-bold text-white mb-2">Analisando seu perfil...</h2>
        <p className="text-gray-400 text-sm mb-8">O Longevity OS está calculando seu estado vital</p>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#cbd5e1', '#3b82f6'][i], animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at center, ${el.color}55 0%, transparent 70%)`
        }}
      />

      <div className="max-w-sm w-full text-center z-10">
        {/* Guardian reveal */}
        <div
          className="text-8xl mb-6 animate-bounce"
          style={{ filter: `drop-shadow(0 0 30px ${el.color})` }}
        >
          {el.emoji}
        </div>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Seu Guardião Primário</div>
        <h2 className="text-3xl font-bold text-white mb-1">{el.name}</h2>
        <p className="text-sm mb-6" style={{ color: el.color }}>{el.organ} · {el.frequency} Hz</p>
        <p className="text-gray-300 text-sm leading-relaxed mb-8">{el.weakMessage}</p>

        {/* Mini scores preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8 text-left">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Seus Guardiões</div>
          {fiveElements.map(elem => (
            <div key={elem.id} className="flex items-center gap-3 mb-2">
              <span className="text-lg">{elem.emoji}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${profile.guardianScores[elem.id as keyof typeof profile.guardianScores]}%`,
                    backgroundColor: elem.color,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">
                {profile.guardianScores[elem.id as keyof typeof profile.guardianScores]}%
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${el.color}cc, ${el.color}66)`,
            boxShadow: `0 8px 32px ${el.color}44`,
          }}
        >
          <Sparkles className="w-5 h-5" />
          Entrar no meu Longevity OS
        </button>
      </div>

      {/* POP-UP MODAL OVERLAY: SEU CORPO FALOU. AGORA, VEJA! */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div 
            className="relative w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl overflow-hidden transition-all duration-500 transform scale-100"
            style={{
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${el.color}15`
            }}
          >
            {/* Ambient light inside modal */}
            <div 
              className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: el.color }}
            />

            {/* Glowing Header */}
            <h3 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent mb-6 tracking-wide animate-pulse">
              SEU CORPO FALOU. AGORA, VEJA!
            </h3>

            {/* 5 Elements Pre-filling animation */}
            <div className="grid grid-cols-5 gap-1.5 mb-6">
              {fiveElements.map(elem => {
                const score = profile.guardianScores[elem.id as keyof typeof profile.guardianScores] || 0;
                return (
                  <div 
                    key={elem.id} 
                    className="flex flex-col items-center p-1.5 rounded-xl bg-gray-950/60 border border-gray-800/80"
                  >
                    <span className="text-2xl mb-1 filter drop-shadow-md animate-bounce" style={{ animationDelay: `${fiveElements.indexOf(elem) * 0.1}s`, animationDuration: '2s' }}>
                      {elem.emoji}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      {elem.name.split(' ')[0]}
                    </span>
                    <div className="w-full bg-gray-800 h-16 rounded-full flex flex-col justify-end overflow-hidden p-0.5">
                      <div 
                        className="w-full rounded-full transition-all duration-[1500ms] ease-out"
                        style={{
                          height: animate ? `${score}%` : '0%',
                          backgroundColor: elem.color,
                          boxShadow: `0 0 10px ${elem.color}80`
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-gray-300">
                      {animate ? `${score}%` : '0%'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Empowerment & Prevention Text */}
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed text-left bg-gray-950/50 border border-gray-800/60 p-4 rounded-2xl mb-6">
              <strong>Este é o seu Mapa Vivo de Evolução</strong>, um espelho visual único da sua saúde física, energética e emocional, pelos olhos da sabedoria milenar oriental. Ele não é um diagnóstico médico, mas um <strong>guia pessoal</strong> para você entender os primeiros sinais do seu corpo e, <strong>com o apoio de profissionais</strong>, agir proativamente para reescrever sua história de bem-estar. Bem-vindo à sua jornada de autoconhecimento e prevenção inteligente.
            </p>

            {/* Close CTA */}
            <button
              onClick={() => {
                setShowPopup(false);
                if (isGuest) setShowRegisterModal(true);
              }}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${el.color}ee, ${el.color}99)`,
                boxShadow: `0 6px 20px ${el.color}33`
              }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Visualizar Meu Guardião Primário
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONVERSÃO: SALVAR PERFIL (só para visitantes) ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div
            className="relative w-full max-w-sm bg-gray-900 border border-purple-800/50 rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(99,102,241,0.3)' }}
          >
            {/* Glow background */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25" style={{ backgroundColor: el.color }} />

            {/* Lock icon */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${el.color}44, #6366f144)`, border: `2px solid ${el.color}66` }}>
              <Lock className="w-7 h-7" style={{ color: el.color }} />
            </div>

            {/* Headline */}
            <h3 className="text-xl font-extrabold text-white mb-2 leading-tight">
              Seu perfil foi mapeado.<br />
              <span style={{ color: el.color }}>Salve sua jornada!</span>
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Crie sua conta gratuita para <strong className="text-gray-200">salvar seu Mapa Vivo</strong>, acompanhar sua evolução ao longo do tempo e acessar as recomendações personalizadas do Longevity OS.
            </p>

            {/* Benefit list */}
            <ul className="text-left text-sm text-gray-300 space-y-2 mb-6">
              {[
                '🧬 Perfil de Guardiões salvo na nuvem',
                '📈 Histórico de evolução do seu Avatar',
                '🤖 Assistente IA YNSA/MTC personalizado',
                '🔔 Alertas de desequilíbrio em tempo real',
              ].map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: el.color }} />
                  {b}
                </li>
              ))}
            </ul>

            {/* Primary CTA */}
            <button
              onClick={() => { onRegister?.(); }}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
              style={{
                background: `linear-gradient(135deg, ${el.color}, #6366f1)`,
                boxShadow: `0 8px 28px ${el.color}44`,
              }}
            >
              <UserPlus className="w-5 h-5" />
              Criar Conta Gratuita
            </button>

            {/* Skip CTA */}
            <button
              onClick={() => { setShowRegisterModal(false); onDone(); }}
              className="w-full py-2 text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              Continuar sem salvar (dados serão perdidos)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const AnamnesePage: React.FC<AnamnesePageProps> = ({ onComplete, onRegister, isGuest }) => {
  const [step, setStep] = useState(1);
  const [revealing, setRevealing] = useState(false);

  // Step 1 — Identidade
  const [nome, setNome] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState<FaixaEtaria | null>(null);
  const [sexo, setSexo] = useState<SexoBiologico | null>(null);

  // Step 2 — Objetivo
  const [objetivo, setObjetivo] = useState<ObjetivoPrincipal | null>(null);

  // Step 3 — Sono & Estresse
  const [sono, setSono] = useState<QualidadeSono | null>(null);
  const [estresse, setEstresse] = useState<NivelEstresse | null>(null);

  // Step 4 — Atividade & Alimentação
  const [atividade, setAtividade] = useState<NivelAtividade | null>(null);
  const [alimentacao, setAlimentacao] = useState<'processados' | 'misto' | 'natural' | 'organico_integral' | null>(null);

  // Step 5 — Sintomas físicos
  const [sintomas, setSintomas] = useState<string[]>([]);

  // Step 6 — Emoções dominantes
  const [emocoes, setEmocoes] = useState<string[]>([]);

  // Step 7 — Saúde declarada
  const [condicoes, setCondicoes] = useState<CondicaoExistente[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoPotencial[]>([]);

  // Final profile
  const [finalProfile, setFinalProfile] = useState<AnamneseProfile | null>(null);

  const canProceed = () => {
    switch (step) {
      case 1: return faixaEtaria !== null && sexo !== null;
      case 2: return objetivo !== null;
      case 3: return sono !== null && estresse !== null;
      case 4: return atividade !== null && alimentacao !== null;
      case 5: return true; // sintomas são opcionais
      case 6: return emocoes.length > 0;
      case 7: return condicoes.length > 0 || medicamentos.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      finalizar();
    }
  };

  const toggleMulti = <T extends string>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    value: T,
    exclusiveValues?: T[]
  ) => {
    if (exclusiveValues && exclusiveValues.includes(value)) {
      setList([value]);
      return;
    }
    setList(prev => {
      const filtered = prev.filter(v => !exclusiveValues?.includes(v));
      return filtered.includes(value)
        ? filtered.filter(v => v !== value)
        : [...filtered, value];
    });
  };

  const finalizar = () => {
    const partialProfile = {
      sintomasFisicos: sintomas,
      emocoesDominantes: emocoes,
      qualidadeSono: sono!,
      nivelEstresse: estresse!,
    };

    const scores = calcularGuardianScores(partialProfile);

    const profile: AnamneseProfile = {
      nome: nome.trim() || undefined,
      faixaEtaria: faixaEtaria!,
      sexoBiologico: sexo!,
      objetivoPrincipal: objetivo!,
      qualidadeSono: sono!,
      nivelEnergia: 50,
      nivelEstresse: estresse!,
      nivelAtividade: atividade!,
      padraoAlimentar: alimentacao!,
      sintomasFisicos: sintomas,
      emocoesDominantes: emocoes,
      condicoesExistentes: condicoes,
      medicamentosEmUso: medicamentos,
      guardianScores: scores,
      completedAt: new Date().toISOString(),
      version: 1,
    };

    saveAnamneseProfile(profile);
    setFinalProfile(profile);
    setRevealing(true);
  };

  if (revealing && finalProfile) {
    return (
      <RevealScreen
        profile={finalProfile}
        onDone={() => onComplete(finalProfile)}
        onRegister={onRegister}
        isGuest={isGuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <ProgressBar step={step} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="max-w-lg mx-auto">

          {/* ---- STEP 1: Identidade ---- */}
          {step === 1 && (
            <div>
              <StepTitle
                title="Bem-vindo ao seu Longevity OS"
                subtitle="Antes de tudo, quero entender quem é você. Isso tornará cada recomendação única para seu perfil."
              />
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Seu nome (opcional)</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Como posso te chamar?"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-3">Faixa etária</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['18-29', '30-44', '45-59', '60+'] as FaixaEtaria[]).map(f => (
                    <SelectCard key={f} selected={faixaEtaria === f} onClick={() => setFaixaEtaria(f)}>
                      <div className="text-white font-semibold">{f} anos</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Sexo biológico</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'masculino', label: 'Masculino', emoji: '♂️' },
                    { id: 'feminino', label: 'Feminino', emoji: '♀️' },
                    { id: 'nao_informar', label: 'Prefiro não informar', emoji: '⚪' },
                  ].map(s => (
                    <SelectCard key={s.id} selected={sexo === s.id as SexoBiologico} onClick={() => setSexo(s.id as SexoBiologico)}>
                      <div className="text-2xl mb-1">{s.emoji}</div>
                      <div className="text-xs text-gray-300">{s.label}</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 2: Objetivo ---- */}
          {step === 2 && (
            <div>
              <StepTitle
                title="Qual é o seu maior desejo agora?"
                subtitle="Seu objetivo orienta quais protocolos e guardiões serão priorizados para você."
              />
              <div className="grid grid-cols-1 gap-3">
                {OBJETIVOS_CONFIG.map(obj => (
                  <SelectCard key={obj.id} selected={objetivo === obj.id} onClick={() => setObjetivo(obj.id)}>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{obj.emoji}</span>
                      <div>
                        <div className="font-semibold text-white">{obj.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{obj.desc}</div>
                      </div>
                    </div>
                  </SelectCard>
                ))}
              </div>
            </div>
          )}

          {/* ---- STEP 3: Sono & Estresse ---- */}
          {step === 3 && (
            <div>
              <StepTitle
                title="Como estão sono e estresse?"
                subtitle="Sono e estresse são os maiores reguladores dos seus Guardiões elementais."
              />
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">🌙 Qualidade do sono</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'pessimo', label: 'Péssimo', desc: 'Acordo várias vezes, muito cansado de manhã', emoji: '😵' },
                    { id: 'ruim', label: 'Ruim', desc: 'Durmo pouco ou com muita dificuldade', emoji: '😟' },
                    { id: 'regular', label: 'Regular', desc: 'Durmo, mas não me sinto descansado', emoji: '😐' },
                    { id: 'bom', label: 'Bom', desc: 'Durmo razoavelmente bem', emoji: '🙂' },
                    { id: 'otimo', label: 'Ótimo', desc: 'Sono profundo e reparador', emoji: '😴' },
                  ].map(s => (
                    <SelectCard key={s.id} selected={sono === s.id as QualidadeSono} onClick={() => setSono(s.id as QualidadeSono)}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{s.emoji}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">{s.label}</div>
                          <div className="text-xs text-gray-400">{s.desc}</div>
                        </div>
                      </div>
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">🔥 Nível de estresse</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'muito_baixo', label: 'Muito baixo', desc: 'Vida tranquila, poucas pressões', emoji: '😌' },
                    { id: 'baixo', label: 'Baixo', desc: 'Estresses pontuais, mas bem gerenciados', emoji: '🙂' },
                    { id: 'moderado', label: 'Moderado', desc: 'Às vezes me sinto sobrecarregado', emoji: '😐' },
                    { id: 'alto', label: 'Alto', desc: 'Muita pressão frequente, difícil relaxar', emoji: '😰' },
                    { id: 'critico', label: 'Crítico', desc: 'Estresse crônico, sinto que não aguento', emoji: '🆘' },
                  ].map(e => (
                    <SelectCard key={e.id} selected={estresse === e.id as NivelEstresse} onClick={() => setEstresse(e.id as NivelEstresse)}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{e.emoji}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">{e.label}</div>
                          <div className="text-xs text-gray-400">{e.desc}</div>
                        </div>
                      </div>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 4: Atividade & Alimentação ---- */}
          {step === 4 && (
            <div>
              <StepTitle
                title="Estilo de vida"
                subtitle="Como você se move e o que você come define a base energética dos seus Guardiões."
              />
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">🏃 Nível de atividade física</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'sedentario', label: 'Sedentário', desc: 'Quase nenhum exercício', emoji: '🛋️' },
                    { id: 'leve', label: 'Leve', desc: 'Caminhadas eventuais', emoji: '🚶' },
                    { id: 'moderado', label: 'Moderado', desc: '2-4x por semana', emoji: '🚴' },
                    { id: 'intenso', label: 'Intenso', desc: '5+ vezes por semana', emoji: '🏋️' },
                  ].map(a => (
                    <SelectCard key={a.id} selected={atividade === a.id as NivelAtividade} onClick={() => setAtividade(a.id as NivelAtividade)}>
                      <div className="text-3xl mb-1">{a.emoji}</div>
                      <div className="font-semibold text-white text-sm">{a.label}</div>
                      <div className="text-xs text-gray-400">{a.desc}</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">🥗 Padrão alimentar</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'processados', label: 'Muito processado', desc: 'Fast food frequente', emoji: '🍟' },
                    { id: 'misto', label: 'Misto', desc: 'Equilíbrio variável', emoji: '🥙' },
                    { id: 'natural', label: 'Natural', desc: 'Priorizo alimentos frescos', emoji: '🥦' },
                    { id: 'organico_integral', label: 'Orgânico integral', desc: 'Muito consciente', emoji: '🌱' },
                  ].map(al => (
                    <SelectCard key={al.id} selected={alimentacao === al.id as any} onClick={() => setAlimentacao(al.id as any)}>
                      <div className="text-3xl mb-1">{al.emoji}</div>
                      <div className="font-semibold text-white text-sm">{al.label}</div>
                      <div className="text-xs text-gray-400">{al.desc}</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- STEP 5: Sintomas físicos ---- */}
          {step === 5 && (
            <div>
              <StepTitle
                title="Sinais físicos do seu corpo"
                subtitle="Selecione todos que se aplicam a você. Podem ser 0 ou vários — seja honesto."
              />
              <div className="grid grid-cols-1 gap-2">
                {SINTOMAS_CONFIG.map(s => (
                  <SelectCard
                    key={s.id}
                    selected={sintomas.includes(s.id)}
                    onClick={() => toggleMulti(sintomas, setSintomas, s.id)}
                    color="#6366f1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-sm text-white">{s.label}</span>
                    </div>
                  </SelectCard>
                ))}
              </div>
              {sintomas.length === 0 && (
                <p className="text-center text-xs text-gray-600 mt-4">Nenhum selecionado — tudo bem, pode avançar</p>
              )}
            </div>
          )}

          {/* ---- STEP 6: Emoções dominantes ---- */}
          {step === 6 && (
            <div>
              <StepTitle
                title="Como está seu campo emocional?"
                subtitle="Na MTC, cada emoção está ligada a um órgão. Selecione o que predomina em você."
              />
              <div className="grid grid-cols-1 gap-3">
                {EMOCOES_CONFIG.map(em => {
                  const el = fiveElements.find(e => e.id === em.guardianImpact);
                  return (
                    <SelectCard
                      key={em.id}
                      selected={emocoes.includes(em.id)}
                      onClick={() => toggleMulti(emocoes, setEmocoes, em.id)}
                      color={el?.color || '#6366f1'}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{em.emoji}</span>
                        <div>
                          <div className="font-semibold text-white text-sm">{em.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: el?.color || '#9ca3af' }}>
                            {el?.organ}
                          </div>
                        </div>
                      </div>
                    </SelectCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- STEP 7: Saúde declarada ---- */}
          {step === 7 && (
            <div>
              <StepTitle
                title="Saúde declarada"
                subtitle="Esta informação é confidencial e ajuda a personalizar as sugestões de plantas medicinais com segurança."
              />
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Condições de saúde conhecidas</label>
                <div className="grid grid-cols-1 gap-2">
                  {CONDICOES_CONFIG.map(c => (
                    <SelectCard
                      key={c.id}
                      selected={condicoes.includes(c.id)}
                      onClick={() => toggleMulti(condicoes, setCondicoes, c.id, ['nenhuma'] as CondicaoExistente[])}
                      color="#f59e0b"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.emoji}</span>
                        <span className="text-sm text-white">{c.label}</span>
                      </div>
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Medicamentos de uso contínuo</label>
                <div className="grid grid-cols-1 gap-2">
                  {MEDICAMENTOS_CONFIG.map(m => (
                    <SelectCard
                      key={m.id}
                      selected={medicamentos.includes(m.id)}
                      onClick={() => toggleMulti(medicamentos, setMedicamentos, m.id, ['nenhum'] as MedicamentoPotencial[])}
                      color="#ef4444"
                    >
                      <span className="text-sm text-white">{m.label}</span>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-3 transition-all duration-300"
            style={{
              background: canProceed()
                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                : '#1f2937',
              opacity: canProceed() ? 1 : 0.5,
              boxShadow: canProceed() ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
              transform: canProceed() ? 'scale(1)' : 'scale(0.98)',
            }}
          >
            {step < TOTAL_STEPS ? (
              <>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Revelar meu perfil vital
              </>
            )}
          </button>
          {step === 5 && sintomas.length === 0 && (
            <p className="text-center text-xs text-gray-600 mt-2">Sem sintomas? Pode avançar normalmente.</p>
          )}
        </div>
      </div>
    </div>
  );
};
