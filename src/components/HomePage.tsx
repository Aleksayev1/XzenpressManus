import React from 'react';
import { useState, useEffect } from 'react';
import { Play, Heart, Brain, Palette, Music, Star, ArrowRight, BarChart3, User, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PartnershipModal } from './PartnershipModal';

import { HappyNewYear2026 } from './HappyNewYear2026';


interface HomePageProps {
  onPageChange: (page: string) => void;
}

// Defines ScienceBanner component outside to keep HomePage clean
const ScienceBanner = () => (
  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-3 overflow-hidden relative">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-center text-center space-y-2 md:space-y-0 md:space-x-8 text-sm md:text-base font-medium tracking-wide">
        <div className="flex items-center">
          <span className="text-cyan-400 mr-2">🔬</span>
          <span>Tecnologia e Ciência</span>
        </div>
        <div className="hidden md:block w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="text-gray-200">
          Baseado em <span className="text-white font-bold">Regulação Autonômica</span>
        </div>
        <div className="hidden md:block w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="text-gray-200">
          <span className="text-white font-bold">Eixo HPA</span>
        </div>
        <div className="hidden md:block w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="text-gray-200">
          <span className="text-white font-bold">Teoria Polivagal</span>
        </div>
      </div>
    </div>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { t } = useLanguage();
  const [showTherapySelection, setShowTherapySelection] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);

  useEffect(() => {
    // Mostrar mensagem de boas-vindas se for primeira visita
    const hasVisited = localStorage.getItem('xzenpress_has_visited');
    if (!hasVisited) {
      setShowWelcomeMessage(true);
      localStorage.setItem('xzenpress_has_visited', 'true');
    }
  }, []);

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: t('home.feature.acupressure.title'),
      description: t('home.feature.acupressure.desc'),
      pageId: 'acupressure'
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: t('home.feature.cranio.title'),
      description: t('home.feature.cranio.desc'),
      pageId: 'acupressure'
    },
    {
      icon: <Play className="w-8 h-8 text-green-500" />,
      title: t('home.feature.breathing.title'),
      description: t('home.feature.breathing.desc'),
      pageId: 'breathing'
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-500" />,
      title: t('home.feature.chromotherapy.title'),
      description: t('home.feature.chromotherapy.desc'),
      isPremium: true,
      pageId: 'breathing'
    },
    {
      icon: <Music className="w-8 h-8 text-orange-500" />,
      title: t('home.feature.sounds.title'),
      description: t('home.feature.sounds.desc'),
      pageId: 'sounds'
    },

    {
      icon: <span className="text-2xl">🧘</span>,
      title: "Jornadas Clínicas",
      description: "Protocolos guiados para Ansiedade, Dor e Sono",
      pageId: 'protocols'
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
      isPremium: true,
      pageId: 'whatsapp-consultation'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
      title: 'Dashboard Inteligente',
      description: 'Analytics avançados e acompanhamento de progresso personalizado',
      isPremium: true,
      pageId: 'dashboard'
    },
    {
      icon: <User className="w-8 h-8 text-cyan-500" />,
      title: 'Personalização IA',
      description: 'Recomendações personalizadas baseadas no seu perfil único',
      isPremium: true,
      pageId: 'personalization'
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
                    <span>33 pontos terapêuticos (4 gratuitos + 29 premium)</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24">


      {/* Daily Practice Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 text-center shadow-lg rounded-xl transform hover:scale-[1.01] transition-transform cursor-pointer flex items-center justify-center gap-2 group"
          onClick={() => setShowTherapySelection(true)}
        >
          <span className="text-xl">🌿</span>
          <p className="font-semibold text-sm md:text-base">
            Lembrete Diário: Pratique os pontos e a respiração para manter seu equilíbrio.
          </p>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="text-center">
            {/* New Hero Banner V6 */}
            <div className="relative w-full max-w-6xl mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-duration-500 group">
              <img
                src="/hero_banner_v6.png"
                alt="XZenPress 2026: A Evolução da Performance Humana. Acupressão Digital e Neuro-regulação."
                className="w-full h-auto object-cover"
              />

              {/* Invisible Overlay Button for "ATIVAR ALÍVIO IMEDIATO" */}
              <button
                onClick={() => setShowTherapySelection(true)}
                className="absolute bottom-[8%] left-[4%] w-[42%] top-[75%] rounded-xl cursor-pointer hover:bg-white/10 transition-colors focus:ring-4 focus:ring-orange-500/50 outline-none"
                aria-label="Ativar Alívio Imediato"
              >
                <span className="sr-only">Ativar Alívio Imediato</span>
              </button>

              {/* Hidden H1 for SEO */}
              <h1 className="sr-only">XZenPress Wellness 2026: Acupressão Digital e Neuro-regulação</h1>
            </div>


            {/* Social Proof / Authority Anchors - International Compliance */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-10 opacity-80 pl-4 pr-4">
              {/* Brazilian Compliance */}
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300">
                <span className="text-2xl">🏛️</span>
                <span className="text-sm font-semibold text-gray-600">MTC Tradicional</span>
              </div>
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300">
                <span className="text-2xl">🧠</span>
                <span className="text-sm font-semibold text-gray-600">Neurociência Aplicada</span>
              </div>
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300">
                <span className="text-2xl">⚖️</span>
                <span className="text-sm font-semibold text-gray-600">Lei 14.831/2024</span>
              </div>
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300">
                <span className="text-2xl">🛡️</span>
                <span className="text-sm font-semibold text-gray-600">NR-1 Compliance</span>
              </div>

              {/* Separator */}
              <div className="hidden md:block w-px h-8 bg-gray-300"></div>

              {/* International Compliance - USA */}
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300" title="OSHA Mental Health Standards (USA)">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-sm font-semibold text-gray-600">OSHA Aligned</span>
              </div>
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300" title="ISO 45003 Psychological Health & Safety">
                <span className="text-2xl">🏅</span>
                <span className="text-sm font-semibold text-gray-600">ISO 45003</span>
              </div>

              {/* Separator */}
              <div className="hidden md:block w-px h-8 bg-gray-300"></div>

              {/* International Compliance - Europe */}
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300" title="EU-OSHA Campaign 2026-2028">
                <span className="text-2xl">🇪🇺</span>
                <span className="text-sm font-semibold text-gray-600">EU-OSHA 2026</span>
              </div>
              <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all duration-300" title="Directive 89/391/EEC - Psychosocial Risks">
                <span className="text-2xl">📋</span>
                <span className="text-sm font-semibold text-gray-600">Dir. 89/391/CEE</span>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">

              <button
                onClick={() => setShowTherapySelection(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button
                onClick={() => onPageChange('blog')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                📚 Ler Blog
              </button>
              <button
                onClick={() => onPageChange('login')}
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
              >
                🔐 Criar Conta
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Science & Technology Banner */}
      <ScienceBanner />

      {/* Clinical Journeys Premium Section */}
      <section className="py-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10"></div>

        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-cyan-400">✨</span>
              <span className="text-white font-semibold">Premium Feature</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              12 Jornadas Clínicas Completas
            </h2>

            <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-4">
              Protocolos Guiados para as <span className="text-white font-bold">Principais Dores da Humanidade</span>
            </p>

            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Sequências especializadas de acupressão otimizadas para resultados máximos em ansiedade, dor crônica, sono, burnout e muito mais
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-3">🧠</div>
              <div className="text-white font-semibold mb-1">Ansiedade</div>
              <div className="text-cyan-200 text-sm">Protocolo Completo</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-3">💆</div>
              <div className="text-white font-semibold mb-1">Dor Crônica</div>
              <div className="text-cyan-200 text-sm">Alívio Sustentável</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-3">😴</div>
              <div className="text-white font-semibold mb-1">Sono Profundo</div>
              <div className="text-cyan-200 text-sm">Qualidade Total</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-white font-semibold mb-1">Burnout</div>
              <div className="text-cyan-200 text-sm">Recuperação Rápida</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => onPageChange('protocols')}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Explorar Jornadas Clínicas</span>
            </button>
            <p className="text-cyan-200 text-sm mt-4">Ansiedade • Dor • Sono • Burnout • e mais 4 jornadas</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-2 sm:px-4 lg:px-6">
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

      {/* Legal Compliance Section - International + Brazil */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance Legal Completo
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Atendimento integral à legislação brasileira de saúde mental corporativa com abordagem integrativa e compliance internacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brazilian Compliance - Lei 14.831/2024 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all">
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

            {/* Brazilian Compliance - NR-1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all">
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

            {/* International - USA (OSHA + ISO 45003) */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🇺🇸</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">OSHA Aligned (USA) + ISO 45003</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2"><span className="text-purple-500 mt-1">✓</span><span>OSHA General Duty Clause (Mental Health)</span></li>
                <li className="flex items-start space-x-2"><span className="text-purple-500 mt-1">✓</span><span>ISO 45003: Psychological Health & Safety at Work</span></li>
                <li className="flex items-start space-x-2"><span className="text-purple-500 mt-1">✓</span><span>Proactive risk assessment and management</span></li>
                <li className="flex items-start space-x-2"><span className="text-purple-500 mt-1">✓</span><span>Evidence-based intervention protocols</span></li>
              </ul>
            </div>

            {/* International - Europe (EU-OSHA) */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">🇪🇺</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">EU-OSHA 2026 + Directive 89/391</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2"><span className="text-indigo-500 mt-1">✓</span><span>EU-OSHA Campaign 2026-2028 (Mental Health)</span></li>
                <li className="flex items-start space-x-2"><span className="text-indigo-500 mt-1">✓</span><span>Directive 89/391/EEC: Psychosocial Risk Framework</span></li>
                <li className="flex items-start space-x-2"><span className="text-indigo-500 mt-1">✓</span><span>Worker well-being and safety integration</span></li>
                <li className="flex items-start space-x-2"><span className="text-indigo-500 mt-1">✓</span><span>Preventive and adaptive intervention strategies</span></li>
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

      {/* Footer with Partnership Link */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2026 XZenPress Wellness. Todos os direitos reservados.
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