import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Sparkles, ChevronRight, ChevronLeft, 
  Activity, Shield, Heart, Info, Clock, AlertTriangle 
} from 'lucide-react';
import { 
  ZenIntegrativeEngine, 
  ZenIntegrativeEvent, 
  ZenSafetyLayer, 
  EVIDENCE_BADGES,
  StoolAppearanceColor,
  PostPrandialSymptomType 
} from '../lib/zenIntegrativeEngine';
import { useAuth } from '../contexts/AuthContext';

interface ZenCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  linkedMeal?: { id: string; name: string; timestamp: string };
}

type CheckinTab = 'tongue' | 'stool' | 'meal';

export const ZenCheckinModal: React.FC<ZenCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  linkedMeal
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'local_zen_user';

  const [activeTab, setActiveTab] = useState<CheckinTab>(linkedMeal ? 'meal' : 'tongue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  // 1. Estado da Língua (ZenTongue)
  const [bodyColor, setBodyColor] = useState<'pale' | 'pink' | 'red' | 'purple'>('pink');
  const [coatingColor, setCoatingColor] = useState<'none' | 'white' | 'yellow'>('white');
  const [coatingThickness, setCoatingThickness] = useState<'thin' | 'thick' | 'greasy'>('thin');
  const [teethMarks, setTeethMarks] = useState<boolean>(false);
  const [redPinchTip, setRedPinchTip] = useState<boolean>(false);

  // 2. Estado das Fezes (ZenGut)
  const [bristolScale, setBristolScale] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(4);
  const [frequencyToday, setFrequencyToday] = useState<number>(1);
  const [stoolColor, setStoolColor] = useState<StoolAppearanceColor>('brown');
  const [urgency, setUrgency] = useState<boolean>(false);
  const [painOrEffort, setPainOrEffort] = useState<boolean>(false);

  // 3. Estado da Resposta Pós-Prandial (MealResponse)
  const [overallComfort, setOverallComfort] = useState<'muito_bem' | 'bem' | 'neutro' | 'nao_caiu_bem' | 'muito_desconfortavel'>('bem');
  const [timeAfterMeal, setTimeAfterMeal] = useState<'30min' | '2h' | '6h'>('2h');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<PostPrandialSymptomType, number>>({
    plenitude: 0,
    estufamento: 0,
    gases: 0,
    refluxo: 0,
    nausea: 0,
    dor_abdominal: 0,
    sonolencia: 0,
    queda_energia: 0
  });

  if (!isOpen) return null;

  // Interpretação MTC deduzida (Camada separada)
  const getMtcInterpretation = () => {
    if (coatingColor === 'yellow' && coatingThickness === 'thick') {
      return { pattern: 'Calor e Umidade no Sistema Digestivo', element: 'Terra' as const };
    }
    if (bodyColor === 'pale' && teethMarks) {
      return { pattern: 'Deficiência de Qi do Baço com Retenção de Umidade', element: 'Terra' as const };
    }
    if (redPinchTip || bodyColor === 'red') {
      return { pattern: 'Calor no Coração / Fígado em Ascensão', element: 'Fogo' as const };
    }
    if (bodyColor === 'purple') {
      return { pattern: 'Estagnação de Qi e Sangue', element: 'Madeira' as const };
    }
    return { pattern: 'Harmonia Dinâmica (Padrão Equilibrado)', element: 'Água' as const };
  };

  const mtcData = getMtcInterpretation();
  const isRedFlagTriggered = stoolColor === 'visible_bright_red_blood' || stoolColor === 'black_tarry_reported';

  const handleSaveCheckin = async () => {
    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();

      if (activeTab === 'tongue') {
        await ZenIntegrativeEngine.appendEvent({
          userId,
          timestamp: nowIso,
          provenance: { source: 'user_self_report', method: 'visual_selector', confidence: 'user_reported' },
          consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
          phenotype: {
            tongue: {
              bodyColor,
              coatingColor,
              coatingThickness,
              teethMarks,
              redPinchTip,
              mtcInterpretation: {
                traditionalPattern: mtcData.pattern,
                elementalAffiliation: mtcData.element
              }
            }
          }
        });
      } else if (activeTab === 'stool') {
        await ZenIntegrativeEngine.appendEvent({
          userId,
          timestamp: nowIso,
          provenance: { source: 'user_self_report', method: 'visual_selector', confidence: 'user_reported' },
          consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
          phenotype: {
            stool: {
              bristolScale,
              frequencyToday,
              color: stoolColor,
              hasBloodVisible: stoolColor === 'visible_bright_red_blood',
              urgency,
              painOrEffort
            }
          }
        });
      } else if (activeTab === 'meal' && linkedMeal) {
        const comfortScoreMap = {
          'muito_bem': 4,
          'bem': 3,
          'neutro': 2,
          'nao_caiu_bem': 1,
          'muito_desconfortavel': 0
        } as const;

        const minutesMap = { '30min': 30, '2h': 120, '6h': 360 };
        const activeSymptoms = Object.entries(selectedSymptoms)
          .filter(([_, sev]) => sev > 0)
          .map(([type, sev]) => ({ type: type as PostPrandialSymptomType, severity: sev as any }));

        await ZenIntegrativeEngine.appendEvent({
          userId,
          timestamp: nowIso,
          provenance: { source: 'user_self_report', confidence: 'user_reported' },
          consent: { personalUse: true, populationPooling: false, researchUse: false, consentVersion: '1.4' },
          postPrandialResponse: {
            linkedMealId: linkedMeal.id,
            timeAfterMeal,
            minutesAfterMeal: minutesMap[timeAfterMeal],
            overallComfort,
            comfortScore: comfortScoreMap[overallComfort],
            symptoms: activeSymptoms
          }
        });
      }

      setSuccessSaved(true);
      setTimeout(() => {
        setSuccessSaved(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Erro ao registrar check-in integrativo:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bristolDescriptions: Record<number, { title: string; desc: string; emoji: string }> = {
    1: { title: 'Tipo 1: Caroços duros separados', desc: 'Fezes em bolinhas endurecidas, difíceis de evacuar.', emoji: '🟤' },
    2: { title: 'Tipo 2: Forma de salsicha, segmentada', desc: 'Consistência firme com grumos visíveis.', emoji: '🥖' },
    3: { title: 'Tipo 3: Salsicha com fendas na superfície', desc: 'Consistência aceitável, padrão de boa hidratação.', emoji: '🌭' },
    4: { title: 'Tipo 4: Salsicha lisa e macia (Ideal)', desc: 'Fácil evacuação, padrão ouro de trânsito digestivo.', emoji: '✨' },
    5: { title: 'Tipo 5: Pedaços macios com contornos nítidos', desc: 'Passam com facilidade, trânsito ligeiramente acelerado.', emoji: '🍞' },
    6: { title: 'Tipo 6: Pedaços pastosos e esfarrapados', desc: 'Fezes moles e inconsistentes.', emoji: '🥣' },
    7: { title: 'Tipo 7: Líquido sem pedaços sólidos', desc: 'Evacuação totalmente aquosa.', emoji: '💧' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ZenCheckin <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">Personal Phenotyping</span>
              </h2>
              <p className="text-xs text-slate-400">Captura fisiológica & temporal em menos de 30 segundos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-slate-950 p-1.5 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tongue')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tongue' 
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👅</span> ZenTongue
          </button>
          <button
            onClick={() => setActiveTab('stool')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stool' 
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💩</span> ZenGut
          </button>
          <button
            onClick={() => setActiveTab('meal')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'meal' 
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍽️</span> MealResponse
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: ZENTONGUE */}
          {activeTab === 'tongue' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Cor do Corpo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Cor do Corpo da Língua
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: 'pale', label: 'Pálida', color: 'bg-rose-100 text-slate-900 border-rose-200' },
                    { id: 'pink', label: 'Rosada (Normal)', color: 'bg-rose-400 text-slate-950 border-rose-500 font-bold' },
                    { id: 'red', label: 'Vermelha', color: 'bg-red-600 text-white border-red-700' },
                    { id: 'purple', label: 'Púrpura / Roxa', color: 'bg-purple-700 text-white border-purple-800' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setBodyColor(c.id as any)}
                      className={`p-3 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 border transition-all ${
                        bodyColor === c.id 
                          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg' 
                          : 'opacity-70 hover:opacity-100'
                      } ${c.color}`}
                    >
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Saburra (Revestimento) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  2. Saburra (Revestimento)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Sem Saburra' },
                    { id: 'white', label: 'Saburra Branca' },
                    { id: 'yellow', label: 'Saburra Amarela' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setCoatingColor(s.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${
                        coatingColor === s.id 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {coatingColor !== 'none' && (
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {[
                      { id: 'thin', label: 'Fina' },
                      { id: 'thick', label: 'Espessa' },
                      { id: 'greasy', label: 'Gordurosa / Viscosa' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setCoatingThickness(t.id as any)}
                        className={`p-2 rounded-lg text-[11px] border transition-all ${
                          coatingThickness === t.id 
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300' 
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sinais Físicos Adicionais */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  3. Sinais Físicos Visíveis
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTeethMarks(!teethMarks)}
                    className={`p-3 rounded-2xl text-xs border text-left flex items-center justify-between transition-all ${
                      teethMarks 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>Marcas de dentes nas laterais</span>
                    <span className="text-sm font-bold">{teethMarks ? '✓' : '+'}</span>
                  </button>

                  <button
                    onClick={() => setRedPinchTip(!redPinchTip)}
                    className={`p-3 rounded-2xl text-xs border text-left flex items-center justify-between transition-all ${
                      redPinchTip 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>Ponta avermelhada / Pontos</span>
                    <span className="text-sm font-bold">{redPinchTip ? '✓' : '+'}</span>
                  </button>
                </div>
              </div>

              {/* Card MTC Segregado (Hipótese Integrativa) */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <span>{EVIDENCE_BADGES.integrative_hypothesis.icon}</span>
                  <span>{EVIDENCE_BADGES.integrative_hypothesis.label}</span>
                </div>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  <strong className="text-blue-100">{mtcData.pattern}</strong> (Elemento {mtcData.element}). 
                  <span className="text-slate-400 ml-1">Observação tradicional que não substitui exames biomédicos.</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ZENGUT (BRISTOL & FEZES) */}
          {activeTab === 'stool' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Seletor Escala de Bristol 1-7 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Consistência (Escala de Bristol)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Tipo {bristolScale} / 7
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      onClick={() => setBristolScale(num as any)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                        bristolScale === num 
                          ? 'bg-emerald-500 text-slate-950 scale-105 shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{bristolDescriptions[num].emoji}</span>
                      <span className="text-xs">{num}</span>
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="text-2xl">{bristolDescriptions[bristolScale].emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{bristolDescriptions[bristolScale].title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{bristolDescriptions[bristolScale].desc}</p>
                  </div>
                </div>
              </div>

              {/* Frequência & Coloração */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Frequência Hoje
                  </label>
                  <select
                    value={frequencyToday}
                    onChange={(e) => setFrequencyToday(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1x no dia</option>
                    <option value={2}>2x no dia</option>
                    <option value={3}>3x ou mais</option>
                    <option value={0}>Nenhuma (dia sem evacuar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Aparência / Cor Relatada
                  </label>
                  <select
                    value={stoolColor}
                    onChange={(e) => setStoolColor(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="brown">Marrom habitual</option>
                    <option value="dark_brown">Marrom escuro</option>
                    <option value="yellowish">Amarelada / Clara</option>
                    <option value="pale">Pálida / Esbranquiçada</option>
                    <option value="visible_bright_red_blood">🔴 Sangue vivo visível</option>
                    <option value="black_tarry_reported">🔴 Aspecto escuro tipo piche</option>
                  </select>
                </div>
              </div>

              {/* Red Flag Alert Guardrail */}
              {isRedFlagTriggered && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-600/50 flex items-start gap-3 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-rose-200 font-bold flex items-center gap-1.5">
                      <span>🔴</span> Sinal de Atenção Prioritário
                    </strong>
                    <p className="text-rose-300/90 leading-relaxed">
                      A presença relatada de sangue visível ou fezes tipo piche requer avaliação médica presencial para investigação adequada.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEAL RESPONSE */}
          {activeTab === 'meal' && (
            <div className="space-y-6 animate-fadeIn">
              {linkedMeal ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Refeição Vinculada:</span>
                    <h4 className="font-bold text-white mt-0.5">{linkedMeal.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    {new Date(linkedMeal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Registrando resposta pós-prandial geral (refeição recente).</span>
                </div>
              )}

              {/* Conforto Pós-Prandial */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Como você se sentiu após comer?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'muito_bem', emoji: '🌟', label: 'Excelente' },
                    { id: 'bem', emoji: '🙂', label: 'Bem' },
                    { id: 'neutro', emoji: '😐', label: 'Neutro' },
                    { id: 'nao_caiu_bem', emoji: '😕', label: 'Pesado' },
                    { id: 'muito_desconfortavel', emoji: '😣', label: 'Mal' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setOverallComfort(c.id as any)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border transition-all ${
                        overallComfort === c.id 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold scale-105 shadow-lg' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[10px]">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo decorrido (Bucket UX) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tempo após a refeição
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '30min', label: '~30 minutos' },
                    { id: '2h', label: '~2 horas' },
                    { id: '6h', label: '~6 horas' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTimeAfterMeal(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        timeAfterMeal === t.id 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sintomas com severidade */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Sintomas Digestivos Observados (opcional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'estufamento', label: 'Estufamento' },
                    { id: 'gases', label: 'Gases' },
                    { id: 'refluxo', label: 'Azia / Refluxo' },
                    { id: 'plenitude', label: 'Plenitude excessiva' },
                    { id: 'sonolencia', label: 'Sonolência pós-prandial' },
                    { id: 'queda_energia', label: 'Queda de energia' }
                  ].map(s => {
                    const sev = selectedSymptoms[s.id as PostPrandialSymptomType] || 0;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSymptoms(prev => ({
                          ...prev,
                          [s.id]: sev === 0 ? 2 : sev === 2 ? 4 : 0
                        }))}
                        className={`p-2.5 rounded-xl text-xs border text-left flex justify-between items-center transition-all ${
                          sev > 0 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold' 
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{s.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                          {sev === 0 ? 'Ausente' : sev === 2 ? 'Moderado' : 'Intenso'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gravado no RAW Event Store (LGPD/Consent)</span>
          </div>

          <button
            onClick={handleSaveCheckin}
            disabled={isSubmitting || successSaved}
            className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              successSaved
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {successSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Registrado com Sucesso!</span>
              </>
            ) : isSubmitting ? (
              <span>Gravando...</span>
            ) : (
              <>
                <span>Registrar Check-in</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
