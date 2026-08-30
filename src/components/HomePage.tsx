import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Brain, Palette, Music, Star, ArrowRight, BarChart3, User, Share2, Volume2, Sparkles, Activity, Search, MessageCircle, Compass, Leaf, Apple, LineChart, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PartnershipModal } from './PartnershipModal';
import { ZenStoriesWall } from './ZenStoriesWall';
import { ZenStoriesCaptureModal } from './ZenStoriesCaptureModal';

import { startQigongRhythm, stopAllZenAudio, ZenAudioSession } from '../services/zenAudioEngine';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { t } = useLanguage();
  const [showTherapySelection, setShowTherapySelection] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [showStoriesCaptureModal, setShowStoriesCaptureModal] = useState(false);

  // ── Isca Imersiva 15s (ZenAudio Engine 2.0 Hero Teaser) ─────────────────────
  const [isTeaserActive, setIsTeaserActive] = useState(false);
  const [teaserPhase, setTeaserPhase] = useState<'inspire' | 'expire'>('inspire');
  const [teaserTimeLeft, setTeaserTimeLeft] = useState(15);
  const teaserSessionRef = useRef<ZenAudioSession | null>(null);
  const teaserTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startHeroTeaser = () => {
    if (isTeaserActive) {
      stopHeroTeaser();
      return;
    }

    stopAllZenAudio();
    setIsTeaserActive(true);
    setTeaserTimeLeft(15);
    setTeaserPhase('inspire');

    const session = startQigongRhythm((phase) => {
      setTeaserPhase(phase);
    }, 0.2);

    teaserSessionRef.current = session;

    const interval = setInterval(() => {
      setTeaserTimeLeft((prev) => {
        if (prev <= 1) {
          stopHeroTeaser();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    teaserTimerRef.current = interval;
  };

  const stopHeroTeaser = () => {
    setIsTeaserActive(false);
    if (teaserTimerRef.current) clearInterval(teaserTimerRef.current);
    if (teaserSessionRef.current) {
      teaserSessionRef.current.stop(0.5);
      teaserSessionRef.current = null;
    }
    stopAllZenAudio();
  };

  useEffect(() => {
    return () => {
      if (teaserTimerRef.current) clearInterval(teaserTimerRef.current);
      if (teaserSessionRef.current) teaserSessionRef.current.stop(0.1);
    };
  }, []);

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: t('home.feature.acupressure.title'),
      description: t('home.feature.acupressure.desc'),
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: t('home.feature.cranio.title'),
      description: t('home.feature.cranio.desc'),
    },
    {
      icon: <Play className="w-8 h-8 text-green-500" />,
      title: t('home.feature.breathing.title'),
      description: t('home.feature.breathing.desc'),
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-500" />,
      title: t('home.feature.chromotherapy.title'),
      description: t('home.feature.chromotherapy.desc'),
      isPremium: true
    },
    {
      icon: <Music className="w-8 h-8 text-orange-500" />,
      title: t('home.feature.sounds.title'),
      description: t('home.feature.sounds.desc'),
      isPremium: true
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: t('home.feature.consultation.title'),
      description: (
        <span className="flex items-center">
          {t('home.feature.consultation.title')}
          <svg className="w-5 h-5 ml-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </span>
      ),
      isPremium: true
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
      title: 'Dashboard Inteligente',
      description: 'Analytics avançados e acompanhamento de progresso personalizado',
      isPremium: true
    },
    {
      icon: <User className="w-8 h-8 text-cyan-500" />,
      title: 'Personalização IA',
      description: 'Recomendações personalizadas baseadas no seu perfil único',
      isPremium: true
    }
  ];

  // Se mostrar seleção de terapia, renderizar interface de escolha
  if (showTherapySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Escolha sua Terapia
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Selecione a modalidade que melhor atende suas necessidades no momento
            </p>
          </div>

          {/* Therapy Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Respiração 4-7-8 */}
            <div
              onClick={() => onPageChange('breathing')}
              className="group bg-white rounded-3xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                    <Brain className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Respiração 4-7-8
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Técnica científica de respiração com cromoterapia integrada.
                  Reduz ansiedade, melhora o sono e ativa o sistema parassimpático.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>4 segundos: Inspiração (Azul Calmante)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>7 segundos: Retenção (Verde Equilibrante)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>8 segundos: Expiração (Roxo Energizante)</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-blue-800">
                    <strong>Ideal para:</strong> Estresse, ansiedade, insônia, pressão alta
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Começar Respiração</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Terapia Integrada (Acupressão) */}
            <div
              onClick={() => onPageChange('acupressure')}
              className="group bg-white rounded-3xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-300"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:from-green-600 group-hover:to-emerald-600 transition-all">
                    <Heart className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Terapia Integrada
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Acupressão + Respiração + Cromoterapia + Sons harmonizantes.
                  Experiência completa de bem-estar integrativo.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>20 pontos terapêuticos (9 gratuitos + 11 premium)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Respiração 4-7-8 sincronizada</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Cromoterapia + Sons harmonizantes</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-green-800">
                    <strong>Ideal para:</strong> Dores específicas, problemas crônicos, bem-estar completo
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold group-hover:text-green-700">
                  <span>Explorar Pontos</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => setShowTherapySelection(false)}
              className="text-gray-600 hover:text-gray-800 font-medium underline"
            >
              ← Voltar à página inicial
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-slate-950 pt-16">

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Fundo Estrelado Escuro */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full flex flex-col items-center">
          
          {/* Top Logo - Discreto no canto */}
          <div className="absolute top-0 left-4 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
            <img src="/logo_zp.jpg" alt="XZenPress" className="w-12 h-12 rounded-full border border-white/20 shadow-lg object-cover bg-white p-1" />
            <span className="text-white/60 font-medium text-sm tracking-widest uppercase">Wellness</span>
          </div>

          <div className="text-center w-full mt-12 md:mt-0">
            {/* Imagem Conceito Ampulheta */}
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-75"></div>
              <img
                src="/hero_hourglass.jpg"
                alt="Equilíbrio Universal XZenPress"
                className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-[3rem] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)] hover:shadow-[0_0_80px_rgba(6,182,212,0.4)] transition-all duration-700 hover:scale-105"
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Mais <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">equilíbrio</span>
              <br/> para o seu dia
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
              Tecnologia, ciência e sabedoria milenar em harmonia para o seu bem-estar.
            </p>

            {/* Botoes em Glassmorfismo e CTA Vibrante */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowTherapySelection(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                Comece Agora
              </button>
              
              <button
                onClick={startHeroTeaser}
                className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 border backdrop-blur-md ${
                  isTeaserActive
                    ? 'bg-cyan-900/40 text-cyan-200 border-cyan-500/50 animate-pulse'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isTeaserActive ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span>
                  {isTeaserActive
                    ? `Respirando... (${teaserTimeLeft}s)`
                    : 'Ouça 15 segundos'}
                </span>
              </button>

              <button
                onClick={() => onPageChange('login')}
                className="text-slate-400 px-6 py-4 rounded-full font-medium hover:text-white transition-all duration-200 underline decoration-white/20 underline-offset-4"
              >
                Saiba Mais
              </button>
            </div>
            {isTeaserActive && (
              <div className="mt-4 text-sm font-medium text-cyan-400 animate-fade-in">
                🌿 5,5s Ritmo de Coerência Cardiorrespiratória 
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ecosystem Journey Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-50 to-transparent rounded-full opacity-50 blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-purple-50 to-transparent rounded-full opacity-50 blur-3xl -translate-x-1/3 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
              Muito mais que uma experiência de bem-estar.<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Um ecossistema que aprende com você.</span>
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              Do primeiro check-in ao acompanhamento dos seus padrões, o XZenPress conecta inteligência artificial, conhecimento integrativo, experiências sonoras e nutrição em uma jornada personalizada.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Linha Vertical Conectora (Timeline Loop) */}
            <div className="hidden md:block absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-500 to-slate-400 rounded-full opacity-30"></div>

            {/* FASE 1: PERCEBA */}
            <div className="relative mb-20 md:pl-24">
              <div className="hidden md:flex absolute left-4 top-6 w-8 h-8 rounded-full bg-emerald-100 border-4 border-white shadow-sm items-center justify-center z-10 -translate-x-1/2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm tracking-wider">01</span>
                  🌱 PERCEBA
                </h4>
                <p className="text-slate-500 mt-2 font-medium">Registre sinais vitais e observe seu estado presente.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all">
                  <Activity className="w-8 h-8 text-emerald-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Zen Check-in</h5>
                  <p className="text-sm text-slate-600">Registro diário em menos de 30s. Observação de sinais vitais e referenciais MTC.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all">
                  <Search className="w-8 h-8 text-pink-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Busca Semântica</h5>
                  <p className="text-sm text-slate-600">Pesquise pelo que sente e encontre recursos e conteúdos rapidamente.</p>
                </div>
                <div 
                  onClick={() => onPageChange('nutriming')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <Apple className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    Nutriming Integrativo
                    <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h5>
                  <p className="text-sm text-slate-600">Explore alimentos, registre suas refeições e observe como suas experiências se relacionam com seus padrões ao longo do tempo.</p>
                </div>
              </div>
            </div>

            {/* FASE 2: COMPREENDA */}
            <div className="relative mb-20 md:pl-24">
              <div className="hidden md:flex absolute left-4 top-6 w-8 h-8 rounded-full bg-blue-100 border-4 border-white shadow-sm items-center justify-center z-10 -translate-x-1/2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm tracking-wider">02</span>
                  🧠 COMPREENDA
                </h4>
                <p className="text-slate-500 mt-2 font-medium">Observe seus padrões ao longo do tempo.</p>
              </div>

              {/* Temporal Engine Destaque Principal */}
              <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white hover:scale-[1.01] transition-transform mb-6 border border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <LineChart className="w-10 h-10 text-blue-400" />
                  <h5 className="text-2xl font-bold">Temporal Observation Engine</h5>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg">
                  O XZenPress organiza seus registros em uma linha temporal para identificar recorrências e associações entre experiências, hábitos e sinais observados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
                  <MessageCircle className="w-8 h-8 text-violet-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">ZenMentor IA</h5>
                  <p className="text-sm text-slate-600">Assistente 24/7 para explorar padrões e práticas personalizadas de bem-estar.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
                  <Leaf className="w-8 h-8 text-green-600 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Mapa Vivo & Botânica</h5>
                  <p className="text-sm text-slate-600">Explore visualmente o mapa corporal, plantas e conhecimento tradicional.</p>
                </div>
              </div>
            </div>

            {/* FASE 3: PRATIQUE */}
            <div className="relative mb-20 md:pl-24">
              <div className="hidden md:flex absolute left-4 top-6 w-8 h-8 rounded-full bg-amber-100 border-4 border-white shadow-sm items-center justify-center z-10 -translate-x-1/2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm tracking-wider">03</span>
                  ☯️ PRATIQUE
                </h4>
                <p className="text-slate-500 mt-2 font-medium">Experimente práticas integrativas alinhadas aos seus dados.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all">
                  <Compass className="w-8 h-8 text-amber-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Sessão Mestra</h5>
                  <p className="text-sm text-slate-600">Jornada guiada que conecta seus registros, padrões e objetivos.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all">
                  <Volume2 className="w-8 h-8 text-orange-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">ZenAudio Engine</h5>
                  <p className="text-sm text-slate-600">Experiências sonoras inteligentes, binaural beats e ritmos respiratórios.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all">
                  <Heart className="w-8 h-8 text-red-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Acupressão Clínica</h5>
                  <p className="text-sm text-slate-600">Mapa interativo de pontos e craniopuntura com visualização avançada.</p>
                </div>
              </div>
            </div>

            {/* FASE 4: ACOMPANHE */}
            <div className="relative md:pl-24">
              <div className="hidden md:flex absolute left-4 top-6 w-8 h-8 rounded-full bg-slate-200 border-4 border-white shadow-sm items-center justify-center z-10 -translate-x-1/2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm tracking-wider">04</span>
                  📈 ACOMPANHE
                </h4>
                <p className="text-slate-500 mt-2 font-medium">Observe sua evolução e a resposta do seu corpo ao longo do tempo.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-300 transition-all">
                  <BarChart3 className="w-8 h-8 text-indigo-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Dashboard Integrado</h5>
                  <p className="text-sm text-slate-600">Tenha visão unificada do seu histórico e evolução das suas práticas.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-300 transition-all">
                  <Heart className="w-8 h-8 text-rose-500 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">Coerência & HRV</h5>
                  <p className="text-sm text-slate-600">Acompanhe métricas de coerência cardíaca e observe sua resposta biológica ao longo do tempo.</p>
                </div>
              </div>
            </div>

            {/* Retorno do Ciclo (Loop de Volta para Fase 1) */}
            <div className="mt-16 flex flex-col items-center justify-center text-slate-400 group relative">
              <div className="absolute w-0.5 h-16 bg-gradient-to-t from-transparent to-slate-300 bottom-full mb-4"></div>
              <span className="bg-slate-100 px-4 py-2 rounded-full font-bold tracking-widest text-xs flex items-center gap-2 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors cursor-default shadow-sm border border-slate-200">
                <ArrowRight className="w-4 h-4 -rotate-90" />
                CICLO CONTÍNUO
              </span>
            </div>

          </div>
        </div>
      </section>
{/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            {t('home.cta.subtitle')}
          </p>

          {/* Launch Status */}
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-white">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">🚀 Plataforma Oficial Lançada!</span>
            </div>
            <p className="text-blue-100 text-sm mt-2">
              PIX real ativo • Cartão real ativo • Todos os recursos funcionais
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">⚖️</span>
                <span><strong>Compliance Legal:</strong> Atendimento integral à NR-1</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">🎯</span>
                <span><strong>ROI Comprovado:</strong> Retorno em 6 meses</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">📊</span>
                <span><strong>Métricas:</strong> Dashboard de acompanhamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">🏆</span>
                <span><strong>Certificação:</strong> Objetivo do Selo de qualidade</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowTherapySelection(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {t('home.cta.demo')}
            </button>
            <button
              onClick={() => onPageChange('premium')}
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200"
            >
              {t('home.cta.corporate')}
            </button>
          </div>
        </div>
      </section>

      {/* Legal Compliance Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.compliance.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('home.compliance.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Lei 14.831/2024</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2"><span className="text-green-500 mt-1">✓</span><span>Certificação como Empresa Promotora da Saúde Mental</span></li>
                <li className="flex items-start space-x-2"><span className="text-green-500 mt-1">✓</span><span>Práticas baseadas em evidências científicas</span></li>
                <li className="flex items-start space-x-2"><span className="text-green-500 mt-1">✓</span><span>Programas de prevenção e promoção da saúde mental</span></li>
                <li className="flex items-start space-x-2"><span className="text-green-500 mt-1">✓</span><span>Acompanhamento e métricas de efetividade</span></li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">NR-1 Compliance</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2"><span className="text-blue-500 mt-1">✓</span><span>Avaliação de riscos psicossociais no trabalho</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-500 mt-1">✓</span><span>Medidas de prevenção e controle de estresse ocupacional</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-500 mt-1">✓</span><span>Treinamento e capacitação de colaboradores</span></li>
                <li className="flex items-start space-x-2"><span className="text-blue-500 mt-1">✓</span><span>Documentação e relatórios de conformidade</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🏆 Objetiva Wellness Corporativo
              </h3>
              <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                Foco na Promoção da Saúde integrativa e Mental
              </p>
              <div className="inline-flex items-center space-x-2 bg-yellow-100 border border-yellow-300 rounded-full px-6 py-3">
                <span className="text-yellow-700 font-semibold">📊 Análise Gratuita:</span>
                <span className="text-yellow-800">Experimentação dos pontos gratuitos (sem login)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* XZenPress Stories — Mural Vivo de Prova Social */}
      <div className="bg-slate-950 py-8">
        <ZenStoriesWall onOpenCaptureModal={() => setShowStoriesCaptureModal(true)} />
      </div>

      {/* XZenPress Stories Capture Modal */}
      <ZenStoriesCaptureModal
        isOpen={showStoriesCaptureModal}
        onClose={() => setShowStoriesCaptureModal(false)}
        context={{
          sessionName: "Sessão Mestra XZen",
          beforeScore: 8,
          afterScore: 2,
          guardianElement: "Fogo",
          organAffected: "Coração"
        }}
      />

      {/* Footer with Partnership Link */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 XZenPress Wellness. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowPartnershipModal(true)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{t('partnership.title')}</span>
              </button>
              <a
                href="mailto:alexandre@xzenpress.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Partnership Modal */}
      <PartnershipModal
        isOpen={showPartnershipModal}
        onClose={() => setShowPartnershipModal(false)}
      />
    </div>
  );
};