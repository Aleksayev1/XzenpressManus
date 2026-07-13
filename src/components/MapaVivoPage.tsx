import React, { useState, useEffect } from 'react';
import { MapaVivoOnboarding } from './MapaVivoOnboarding';
import { MapaVivoIntro, hasSeenMapaVivoIntro } from './MapaVivoIntro';
import { GuardianDisplay } from './GuardianDisplay';
import { WeeklyCheckin, type WeeklyCheckinData } from './WeeklyCheckin';
import {
  fiveElements,
  calculateXLI,
  type GuardianElement,
  type GuardianScores
} from '../data/fiveElements';
import { type AnamneseProfile } from '../data/anamneseProfile';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MapaVivoStorageService } from '../services/mapaVivoStorageService';

interface MapaVivoPageProps {
  onPageChange: (page: string) => void;
  anamneseProfile?: AnamneseProfile | null;
}

interface MapaVivoState {
  hasCompletedOnboarding: boolean;
  scores: GuardianScores;
  baselineScores?: GuardianScores;
  dominantGuardianId: GuardianElement['id'] | null;
  checkins: WeeklyCheckinData[];
  lastCheckinDate: string | null;
  createdAt: string;
}

const STORAGE_KEY = 'xzenpress_mapa_vivo_v1';

const defaultScores: GuardianScores = {
  madeira: 50, fogo: 50, terra: 50, metal: 50, agua: 50
};

function buildInitialScores(anamnese?: AnamneseProfile | null): GuardianScores {
  if (anamnese?.guardianScores) {
    // Use anamnese scores but clamp them to GuardianScores type
    return {
      madeira: anamnese.guardianScores.madeira,
      fogo: anamnese.guardianScores.fogo,
      terra: anamnese.guardianScores.terra,
      metal: anamnese.guardianScores.metal,
      agua: anamnese.guardianScores.agua,
    };
  }
  return defaultScores;
}

function loadState(): MapaVivoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    hasCompletedOnboarding: false,
    scores: defaultScores,
    dominantGuardianId: null,
    checkins: [],
    lastCheckinDate: null,
    createdAt: new Date().toISOString()
  };
}

function saveState(state: MapaVivoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isCheckinDue(lastCheckinDate: string | null): boolean {
  if (!lastCheckinDate) return true;
  const last = new Date(lastCheckinDate);
  const now = new Date();
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 7;
}

function computeXLI(state: MapaVivoState): number {
  const recentCheckins = state.checkins.slice(-4);
  const consistency = state.checkins.length > 0
    ? Math.min(100, (recentCheckins.length / 4) * 100)
    : 0;
  const avgSleep = recentCheckins.length > 0
    ? recentCheckins.reduce((acc, c) => acc + c.sleepScore, 0) / recentCheckins.length
    : 50;
  const avgEnergy = recentCheckins.length > 0
    ? recentCheckins.reduce((acc, c) => acc + c.energyScore, 0) / recentCheckins.length
    : 50;

  return calculateXLI({
    guardianScores: state.scores,
    checkinConsistency: consistency,
    avgSleepScore: avgSleep,
    avgEnergyScore: avgEnergy
  });
}

export const MapaVivoPage: React.FC<MapaVivoPageProps> = ({ onPageChange, anamneseProfile }) => {
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(!hasSeenMapaVivoIntro());
  const [state, setState] = useState<MapaVivoState>({
    hasCompletedOnboarding: false,
    scores: defaultScores,
    dominantGuardianId: null,
    checkins: [],
    lastCheckinDate: null,
    createdAt: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'main' | 'checkin' | 'guardian-detail'>('main');
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianElement | null>(null);

  // Carregar dados de forma assíncrona (Supabase com fallback LocalStorage)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          // 1. Sincroniza dados locais anônimos pendentes
          await MapaVivoStorageService.syncLocalDataToCloud(user.id);

          // 2. Carrega da nuvem
          const cloudState = await MapaVivoStorageService.loadMapaVivoState(user.id);
          const checkins = await MapaVivoStorageService.loadCheckins(user.id);

          if (cloudState) {
            setState({
              ...cloudState,
              baselineScores: cloudState.baselineScores || (anamneseProfile?.guardianScores ? buildInitialScores(anamneseProfile) : undefined),
              checkins
            });
          } else if (anamneseProfile?.guardianScores) {
            const seedScores = buildInitialScores(anamneseProfile);
            const newState = {
              hasCompletedOnboarding: true,
              scores: seedScores,
              baselineScores: seedScores,
              dominantGuardianId: null,
              checkins: checkins,
              lastCheckinDate: null,
              createdAt: new Date().toISOString()
            };
            await MapaVivoStorageService.saveMapaVivoState(user.id, newState);
            setState(newState);
          }
        } else {
          // Usuário deslogado / Convidado
          const localState = loadState();
          if (!localState.hasCompletedOnboarding && anamneseProfile?.guardianScores) {
            const seedScores = buildInitialScores(anamneseProfile);
            setState({
              hasCompletedOnboarding: true,
              scores: seedScores,
              baselineScores: seedScores,
              dominantGuardianId: null,
              checkins: [],
              lastCheckinDate: null,
              createdAt: new Date().toISOString()
            });
          } else {
            // Carregar checkins locais
            const localCheckins = JSON.parse(localStorage.getItem('xzen_local_checkins') || '[]');
            setState({
              ...localState,
              baselineScores: localState.baselineScores || (anamneseProfile?.guardianScores ? buildInitialScores(anamneseProfile) : undefined),
              checkins: localCheckins
            });
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados do Mapa Vivo:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, anamneseProfile]);

  const xli = computeXLI(state);
  const checkinDue = isCheckinDue(state.lastCheckinDate);

  // ---- INTRO (first visit) ----
  if (showIntro) {
    return <MapaVivoIntro onComplete={() => setShowIntro(false)} />;
  }

  // ---- ONBOARDING handler ----
  const handleOnboardingComplete = async (scores: GuardianScores, dominantId: GuardianElement['id']) => {
    const newState = {
      ...state,
      hasCompletedOnboarding: true,
      scores,
      baselineScores: scores,
      dominantGuardianId: dominantId,
    };
    setState(newState);
    if (user?.id) {
      await MapaVivoStorageService.saveMapaVivoState(user.id, newState);
    } else {
      saveState(newState);
    }
    setView('main');
  };

  // ---- CHECK-IN handler ----
  const handleCheckinComplete = async (data: WeeklyCheckinData) => {
    const newScores = { ...state.scores };
    // Otimização de scores baseada nas respostas do checkin
    Object.keys(newScores).forEach(k => {
      newScores[k as keyof GuardianScores] = Math.min(100,
        newScores[k as keyof GuardianScores] + (data.energyScore / 200)
      );
    });
    newScores[data.emotionGuardianId] = Math.max(5,
      newScores[data.emotionGuardianId] - 5
    );

    const newState = {
      ...state,
      scores: newScores,
      checkins: [...state.checkins, data],
      lastCheckinDate: data.date,
    };

    setState(newState);

    if (user?.id) {
      await MapaVivoStorageService.saveCheckin(user.id, data);
      await MapaVivoStorageService.saveMapaVivoState(user.id, newState);
    } else {
      saveState(newState);
      const savedCheckins = JSON.parse(localStorage.getItem('xzen_local_checkins') || '[]');
      localStorage.setItem('xzen_local_checkins', JSON.stringify([...savedCheckins, data]));
    }
    setView('main');
  };

  // ---- GUARDIAN DETAIL handler ----
  const handleGuardianClick = (guardian: GuardianElement) => {
    setSelectedGuardian(guardian);
    setView('guardian-detail');
  };

  // ========================
  // GUARDS — rendered after handlers
  // ========================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400 text-sm">Carregando seu Mapa Vivo de Evolução...</p>
      </div>
    );
  }

  if (showIntro) {
    return <MapaVivoIntro onComplete={() => setShowIntro(false)} />;
  }

  if (!state.hasCompletedOnboarding) {
    return <MapaVivoOnboarding onComplete={handleOnboardingComplete} />;
  }

  // ========================
  // VIEWS
  // ========================

  if (view === 'checkin') {
    return (
      <WeeklyCheckin
        onComplete={handleCheckinComplete}
        onSkip={() => setView('main')}
      />
    );
  }

  if (view === 'guardian-detail' && selectedGuardian) {
    const el = selectedGuardian;
    const score = state.scores[el.id];
    return (
      <div className="min-h-screen bg-gray-950 text-white overflow-y-auto pb-20">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b"
          style={{ backgroundColor: '#030712', borderColor: el.color + '33' }}
        >
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{el.emoji}</span>
          <div>
            <div className="font-bold text-sm">{el.name}</div>
            <div className="text-xs" style={{ color: el.color }}>{el.organ}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">Seu estado</div>
            <div className="text-lg font-bold" style={{ color: el.color }}>{score}%</div>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* State message */}
          <div
            className="p-4 rounded-2xl"
            style={{ backgroundColor: el.color + '15', border: `1px solid ${el.color}44` }}
          >
            <p className="text-sm leading-relaxed" style={{ color: el.color }}>
              {score < 40 ? el.weakMessage : el.strongMessage}
            </p>
          </div>

          {/* AI Oracle Integration Button */}
          {score < 60 && (
            <button
              onClick={() => {
                const elementQueries: Record<string, string> = {
                  madeira: 'Deficiência do Elemento Madeira (Fígado) com sintomas de raiva, frustração, irritabilidade e tensão na nuca',
                  fogo: 'Deficiência do Elemento Fogo (Coração) com sintomas de ansiedade, agitação mental, insônia e palpitações',
                  terra: 'Deficiência do Elemento Terra (Baço e Pâncreas) com sintomas de preocupação excessiva, ruminação mental e digestão lenta',
                  metal: 'Deficiência do Elemento Metal (Pulmão) com sintomas de tristeza, melancolia, dificuldade em desapegar e pele seca',
                  agua: 'Deficiência do Elemento Água (Rim) com sintomas de medo, insegurança, dor lombar crônica e pés frios'
                };
                const query = elementQueries[el.id] || `Deficiência do Elemento ${el.element}`;
                localStorage.setItem('phyto_search_query', query);
                localStorage.setItem('phyto_auto_oracle', 'true');
                localStorage.setItem('phyto_from_mapa_vivo', 'true');
                onPageChange('plantas-medicinais');
              }}
              className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-750 hover:to-indigo-750 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 border border-purple-500/20"
            >
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span>Consultar Oráculo AI (Protocolo 360°)</span>
            </button>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Horário de Pico', value: el.peakHour, icon: '⏰' },
              { label: 'Estação', value: el.season, icon: '🌿' },
              { label: 'Sabor', value: el.flavor, icon: '👅' },
              { label: 'Fator', value: el.naturalFactor, icon: '🌀' },
              { label: 'Tecido', value: el.tissue, icon: '🔬' },
              { label: 'Sentido', value: el.sense, icon: '👁️' },
            ].map(item => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">{item.icon} {item.label}</div>
                <div className="text-sm font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Emotions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Emoções</h3>
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2">Em desequilíbrio</div>
              <div className="flex flex-wrap gap-2">
                {el.emotions.imbalanced.map(e => (
                  <span key={e} className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Em equilíbrio</div>
              <div className="flex flex-wrap gap-2">
                {el.emotions.balanced.map(e => (
                  <span key={e} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Physical signs */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Sinais Físicos de Alerta</h3>
            <ul className="space-y-2">
              {el.physicalSigns.weak.map(sign => (
                <li key={sign} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-0.5">•</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>

          {/* Foods */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">🥗 Alimentos Aliados</h3>
            <div className="flex flex-wrap gap-2">
              {el.foods.map(f => (
                <span key={f} className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Plants */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">🌿 Plantas Medicinais</h3>
            <div className="flex flex-wrap gap-2">
              {el.plants.map(p => (
                <button
                  key={p}
                  onClick={() => {
                    localStorage.setItem('phyto_search_query', p);
                    localStorage.setItem('phyto_from_mapa_vivo', 'true');
                    onPageChange('plantas-medicinais');
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-green-900/20 text-green-400 border border-green-500/20 hover:bg-green-800/35 hover:scale-105 transition-all text-left font-medium active:scale-95"
                >
                  {p} ➔
                </button>
              ))}
            </div>
          </div>

          {/* Points */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">📍 Pontos de Acupressão</h3>
            <div className="space-y-3">
              {el.points.map(pt => {
                const pointCode = pt.split(' ')[0];
                const pointDesc = pt.split(' ').slice(1).join(' ');
                return (
                  <button
                    key={pt}
                    onClick={() => {
                      localStorage.setItem('preselected_acupressure_point', pointCode);
                      localStorage.setItem('phyto_from_mapa_vivo', 'true');
                      onPageChange('acupressure');
                    }}
                    className="w-full flex items-center justify-between text-left p-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-blue-500/40 hover:scale-[1.01] transition-all group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-lg font-mono" style={{ backgroundColor: el.color + '22', color: el.color }}>
                        {pointCode}
                      </span>
                      <span className="text-xs text-gray-400">{pointDesc}</span>
                    </div>
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Ver Ponto ➔</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency */}
          <div
            onClick={() => {
              localStorage.setItem('phyto_from_mapa_vivo', 'true');
              onPageChange('sounds');
            }}
            className="p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-900 border border-transparent hover:border-indigo-500/20 transition-all group active:scale-[0.99]"
            style={{ backgroundColor: el.color + '11', border: `1px solid ${el.color}33` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎵</span>
              <div>
                <div className="text-xs text-gray-400">Frequência Sonora</div>
                <div className="text-2xl font-bold" style={{ color: el.color }}>{el.frequency} Hz</div>
                <div className="text-xs text-gray-500">Terapia sonora para este elemento</div>
              </div>
            </div>
            <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Tocar Sons ➔</span>
          </div>

          {/* Tribo CTA */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">{el.emoji}</div>
            <div className="font-semibold text-white text-sm mb-1">{el.triboName}</div>
            <div className="text-xs text-gray-400 leading-relaxed mb-3">{el.triboDescription}</div>
            <div className="text-xs text-gray-600 italic">Em breve: comunidade e jornadas coletivas</div>
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN DASHBOARD ----
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => onPageChange('home')} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-bold text-sm">Mapa Vivo de Evolução</div>
          <div className="text-xs text-gray-500">XZen Longevity Index</div>
        </div>
        <div className="w-5" />
      </div>

      <div className="overflow-y-auto pb-24">
        {!user && (
          <div className="px-4 pt-4 max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-2xl p-4 text-center space-y-3">
              <p className="text-sm text-orange-200">
                Você está no modo <strong>Convidado</strong>. Salve seu perfil e seu Mapa Vivo na nuvem para não perder o histórico!
              </p>
              <button
                onClick={() => onPageChange('login')}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                🔐 Criar Conta / Fazer Login
              </button>
            </div>
          </div>
        )}

        <GuardianDisplay
          scores={state.scores}
          baselineScores={state.baselineScores || (anamneseProfile?.guardianScores ? buildInitialScores(anamneseProfile) : undefined) || state.scores}
          xli={xli}
          onGuardianClick={handleGuardianClick}
          weeklyCheckinDue={checkinDue}
          onStartCheckin={() => setView('checkin')}
        />

        {/* History summary */}
        {state.checkins.length > 0 && (
          <div className="px-4 pb-4 max-w-lg mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                📊 Histórico — {state.checkins.length} check-in{state.checkins.length !== 1 ? 's' : ''}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {state.checkins.slice(-8).map((c, i) => {
                  const el = fiveElements.find(e => e.id === c.emotionGuardianId)!;
                  return (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: el.color + '22', border: `1px solid ${el.color}55` }}
                      >
                        {el.emoji}
                      </div>
                      <div className="w-6 bg-gray-800 rounded-full overflow-hidden" style={{ height: 40 }}>
                        <div
                          className="w-full rounded-full transition-all"
                          style={{
                            height: `${c.energyScore}%`,
                            backgroundColor: el.color,
                            marginTop: `${100 - c.energyScore}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reset onboarding (dev helper) */}
        <div className="px-4 pb-4 max-w-lg mx-auto">
          <button
            onClick={async () => {
              const resetState = {
                hasCompletedOnboarding: false,
                scores: defaultScores,
                dominantGuardianId: null,
                checkins: [],
                lastCheckinDate: null,
                createdAt: new Date().toISOString()
              };
              setState(resetState);
              if (user?.id) {
                await MapaVivoStorageService.resetUserData(user.id);
              } else {
                saveState(resetState);
                localStorage.removeItem('xzen_local_checkins');
              }
            }}
            className="w-full py-2 text-xs text-gray-700 hover:text-gray-500 transition-colors"
          >
            Refazer Despertar do Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
