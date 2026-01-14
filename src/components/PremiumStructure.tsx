import React, { useState, useEffect } from 'react';
import { Crown, Star, Lock, Zap, MessageCircle, Target, Brain, Shield, CheckCircle, Clock, ArrowRight, CreditCard, Smartphone, Bitcoin, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { PixPaymentComponent } from './PixPaymentComponent';
import { CreditCardPaymentComponent } from './CreditCardPaymentComponent';
import { trackPremiumUpgrade } from './GoogleAnalytics';
import { getRegionalPricing, formatPrice, calculateDiscount, type RegionalPrice } from '../services/regionalPricingService';

interface PremiumStructureProps {
  onPageChange: (page: string) => void;
}

export const PremiumStructure: React.FC<PremiumStructureProps> = ({ onPageChange }) => {
  const { user, upgradeToPremium, confirmPremiumPayment } = useAuth();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'crypto'>('pix');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<{
    amount: number;
    description: string;
    orderId: string;
  } | null>(null);

  // 🌍 Preços regionalizados
  const [regionalPricing, setRegionalPricing] = useState<RegionalPrice | null>(null);

  // Carregar preços baseado no país do usuário
  useEffect(() => {
    const loadPricing = async () => {
      const pricing = await getRegionalPricing();
      setRegionalPricing(pricing);
      console.log('💰 Preços carregados:', pricing.currency, pricing.countryName);
    };
    loadPricing();
  }, []);

  // Se o usuário já é premium, mostrar dashboard premium
  if (user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Premium Dashboard Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-500 rounded-full">
                <Crown className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-green-800">
              Bem-vindo, Premium! 🎉
            </h1>
            <p className="text-xl text-green-700 mb-8">
              Você tem acesso completo a todos os recursos exclusivos
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-semibold">Status: Premium Ativo</span>
            </div>
          </div>

          {/* Premium Features Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* AI Assistant - ACTIVE */}
            <div
              onClick={() => setShowAIPanel(true)}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-purple-200 hover:border-purple-300"
            >
              <div className="flex items-center mb-6">
                {/* AI Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 shadow-lg">
                    <img
                      src="/buddhist-robot.png"
                      alt="Robo Zen - Assistente IA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">🤖 Assistente IA Especializado</h3>
                  <p className="font-medium text-green-600">
                    DISPONÍVEL - 24/7
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Chatbot inteligente baseado em protocolos YNSA e MTC validados cientificamente. Orientação personalizada 100% automatizada.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>⚡ Ativo agora:</strong> Sistema IA que combina YNSA, MTC e tecnologia de ponta para oferecer suporte educacional contínuo.
                </p>
              </div>
              <div className="flex items-center font-medium text-purple-600 group-hover:text-purple-700">
                <span>Abrir Assistente</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Premium Points */}
            <div
              onClick={() => onPageChange('acupressure')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-purple-200 hover:border-purple-300"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Pontos Exclusivos</h3>
                  <p className="text-purple-600 font-medium">66 Pontos Premium</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                <strong>66 pontos especializados</strong> para casos específicos:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">🔬</span>
                  <span><strong>Septicemia:</strong> 7 pontos para purificação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🦷</span>
                  <span><strong>ATM:</strong> 5 pontos para articulação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🧠</span>
                  <span><strong>Cranio:</strong> 15 pontos para sistema nervoso</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">💊</span>
                  <span><strong>MTC Geral:</strong> 34+ pontos avançados</span>
                </li>
              </ul>
              <p className="text-gray-600 mb-4">
                <strong className="text-purple-700">+ 12 Jornadas Clínicas Completas</strong><br />
                <span className="text-sm">Protocolos guiados para Ansiedade, Dor, Sono e mais</span>
              </p>
              <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                <span>Explorar pontos</span>
                <Zap className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Recomendações IA</h3>
                  <p className="text-purple-600 font-medium">Demonstração Disponível</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Inteligência artificial que analisa seus padrões e sugere terapias personalizadas
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <button
                  onClick={() => setShowAIPanel(true)}
                  className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Ver Demonstração</span>
                </button>
              </div>
            </div>
          </div>

          {/* Premium Stats */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Seus Benefícios Premium
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">66</div>
                <div className="text-sm text-gray-600">Pontos Exclusivos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-600">Assistente IA 24/7</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">∞</div>
                <div className="text-sm text-gray-600">Uso Ilimitado</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">🔜</div>
                <div className="text-sm text-gray-600">Novos Recursos</div>
              </div>
            </div>
          </div>

          {/* Clinical Journeys Banner - Early Intervention Focus */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl p-12 border border-purple-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                Jornadas Clínicas: Prevenção que Paga Dividendos
              </h2>

              <p className="text-cyan-100 text-lg text-center mb-8 max-w-3xl mx-auto leading-relaxed">
                <strong className="text-white">Intervenção precoce</strong> não é apenas eficaz — é <strong className="text-white">financeiramente estratégica</strong>. Nossas 12 Jornadas Clínicas trabalham os sinais iniciais antes que se tornem crises custosas.
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
                  <div className="text-white font-medium">Potencial de Resiliência</div>
                  <div className="text-cyan-200 text-sm mt-1">Quando tratado na Fase 1 (Alarme)</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-green-400 mb-2">70%</div>
                  <div className="text-white font-medium">Recuperação Sustentável</div>
                  <div className="text-cyan-200 text-sm mt-1">Na Fase 2 (Resistência)</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-red-400 mb-2">&lt;30%</div>
                  <div className="text-white font-medium">Reversibilidade Natural</div>
                  <div className="text-cyan-200 text-sm mt-1">Fase 3 (Exaustão) = Alto Custo</div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/30 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">O ROI da Prevenção</h3>
                    <p className="text-cyan-100 text-sm leading-relaxed">
                      <strong className="text-white">Investimento anual:</strong> $50-100 por funcionário em acompanhamento preventivo<br />
                      <strong className="text-white">vs.</strong><br />
                      <strong className="text-red-300">Custo da crise:</strong> $15,000-50,000 (licença médica + reposição + queda de produtividade)
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={() => onPageChange('protocols')}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Explorar as 12 Jornadas Clínicas</span>
                </button>
                <p className="text-cyan-200 text-sm mt-4">Ansiedade • Dor Crônica • Sono • Burnout • e mais</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <AIRecommendationsPanel
          isVisible={showAIPanel}
          onClose={() => setShowAIPanel(false)}
        />
      </div>
    );
  }
  const premiumFeatures = [
    // ✅ SUBSTITUÍDO: WhatsApp → Assistente IA (Segurança)
    {
      id: 'ai-assistant',
      icon: (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-200">
          <img
            src="/buddhist-robot.png"
            alt="Robo Zen"
            className="w-full h-full object-cover"
          />
        </div>
      ),
      title: '🤖 Assistente IA Especializado',
      description: 'Chatbot inteligente baseado em protocolos YNSA e MTC validados cientificamente',
      benefits: [
        'Disponível 24/7 para orientação',
        'Respostas baseadas em evidências científicas',
        'Protocolos YNSA e MTC integrados',
        'Orientação personalizada automatizada'
      ],
      status: 'active',
      action: () => setShowAIPanel(true)
    },
    {
      id: 'premium-points',
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: t('premium.features.points.title'),
      description: t('premium.features.points.description'),
      benefits: [
        t('premium.features.points.benefit1'),
        t('premium.features.points.benefit2'),
        t('premium.features.points.benefit3'),
        t('premium.features.points.benefit4')
      ],
      status: 'active',
      action: () => onPageChange('acupressure')
    },
    {
      id: 'advanced-chromotherapy',
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: t('premium.features.chromotherapy.title'),
      description: t('premium.features.chromotherapy.description'),
      benefits: [
        t('premium.features.chromotherapy.benefit1'),
        t('premium.features.chromotherapy.benefit2'),
        t('premium.features.chromotherapy.benefit3'),
        t('premium.features.chromotherapy.benefit4')
      ],
      status: 'coming-soon',
      action: () => { }
    },
    {
      id: 'sound-library',
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: t('premium.features.sounds.title'),
      description: t('premium.features.sounds.description'),
      benefits: [
        t('premium.features.sounds.benefit1'),
        t('premium.features.sounds.benefit2'),
        t('premium.features.sounds.benefit3'),
        t('premium.features.sounds.benefit4')
      ],
      status: 'active',
      action: () => onPageChange('sounds')
    },
    {
      id: 'ai-recommendations',
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: t('premium.features.ai.title'),
      description: t('premium.features.ai.description'),
      benefits: [
        t('premium.features.ai.benefit1'),
        t('premium.features.ai.benefit2'),
        t('premium.features.ai.benefit3'),
        t('premium.features.ai.benefit4')
      ],
      status: 'coming-soon',
      action: () => { }
    },
    {
      id: 'offline-mode',
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: t('premium.features.offline.title'),
      description: t('premium.features.offline.description'),
      benefits: [
        t('premium.features.offline.benefit1'),
        t('premium.features.offline.benefit2'),
        t('premium.features.offline.benefit3'),
        t('premium.features.offline.benefit4')
      ],
      status: 'coming-soon',
      action: () => { }
    }
  ];

  // 🌍 Preços dinâmicos baseados no país
  const pricingPlans = regionalPricing ? [
    {
      id: 'monthly',
      name: t('premium.plans.monthly.name'),
      price: formatPrice(regionalPricing.monthly, regionalPricing.currency),
      period: t('premium.plans.monthly.period'),
      features: [
        t('premium.plans.monthly.feature1'),
        t('premium.plans.monthly.feature2'),
        t('premium.plans.monthly.feature3'),
        t('premium.plans.monthly.feature4'),
        t('premium.plans.monthly.feature5')
      ],
      popular: false,
      savings: null,
      isPromotional: regionalPricing.isPromotional
    },
    {
      id: 'annual',
      name: t('premium.plans.annual.name'),
      price: formatPrice(regionalPricing.annual, regionalPricing.currency),
      period: t('premium.plans.annual.period'),
      originalPrice: formatPrice(regionalPricing.annualOriginal, regionalPricing.currency),
      discount: `${calculateDiscount(regionalPricing.annualOriginal, regionalPricing.annual)}% OFF`,
      features: [
        t('premium.plans.annual.feature1'),
        t('premium.plans.annual.feature2'),
        t('premium.plans.annual.feature3'),
        t('premium.plans.annual.feature4'),
        t('premium.plans.annual.feature5')
      ],
      popular: true,
      savings: formatPrice(regionalPricing.annualOriginal - regionalPricing.annual, regionalPricing.currency),
      isPromotional: regionalPricing.isPromotional
    },
    {
      id: 'lifetime',
      name: t('premium.plans.lifetime.name'),
      price: formatPrice(regionalPricing.lifetime, regionalPricing.currency),
      period: t('premium.plans.lifetime.period'),
      originalPrice: formatPrice(regionalPricing.lifetimeOriginal, regionalPricing.currency),
      discount: `${calculateDiscount(regionalPricing.lifetimeOriginal, regionalPricing.lifetime)}% OFF`,
      features: [
        t('premium.plans.lifetime.feature1'),
        t('premium.plans.lifetime.feature2'),
        t('premium.plans.lifetime.feature3'),
        t('premium.plans.lifetime.feature4'),
        t('premium.plans.lifetime.feature5')
      ],
      popular: false,
      savings: formatPrice(regionalPricing.lifetimeOriginal - regionalPricing.lifetime, regionalPricing.currency),
      isPromotional: regionalPricing.isPromotional
    }
  ] : [];

  const testimonials = [
    {
      name: 'Maria S.',
      location: 'São Paulo',
      rating: 5,
      text: t('premium.testimonials.maria')
    },
    {
      name: 'João M.',
      location: 'Rio de Janeiro',
      rating: 5,
      text: t('premium.testimonials.joao')
    },
    {
      name: 'Ana L.',
      location: 'Belo Horizonte',
      rating: 5,
      text: t('premium.testimonials.ana')
    }
  ];

  const handlePlanSelect = (planId: string) => {
    // 🔒 Proteção: Exige login antes de pagar
    if (!user) {
      alert('Por favor, faça login ou crie uma conta para assinar o Premium.');
      onPageChange('login');
      return;
    }

    setSelectedPlan(planId);

    // Preparar dados do pagamento
    const plan = pricingPlans.find(p => p.id === planId);
    if (plan) {
      // Remove TODOS os símbolos de moeda (R$, $, etc) e converte para número
      const amount = parseFloat(plan.price.replace(/[R$\s]/g, ''));

      console.log('💰 Plano selecionado:', {
        planId,
        priceString: plan.price,
        amountParsed: amount,
        currency: regionalPricing?.currency
      });

      setPixPaymentData({
        amount,
        description: `XZenPress Premium - ${plan.name}`,
        orderId: `XZP-${Date.now()}-${planId.toUpperCase()}`
      });
    }

    setShowPayment(true);
  };

  const handlePayment = () => {
    // REMOVIDO: Não processar pagamento automaticamente
    // O pagamento deve ser confirmado apenas pelos componentes específicos (PIX/Cartão)
    console.log('⚠️ Use os métodos de pagamento específicos (PIX ou Cartão)');
  };

  const handlePixPaymentSuccess = (paymentData: any) => {
    console.log('🎯 PIX confirmado:', paymentData);
    trackPremiumUpgrade(selectedPlan, 'pix');
    alert('Pagamento PIX confirmado! Bem-vindo ao Premium!');
    confirmPremiumPayment();
    setShowPayment(false);
  };

  const handlePixPaymentError = (error: string) => {
    console.error('Erro no pagamento PIX:', error);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('premium.payment.title')}
              </h1>
              <p className="text-gray-600">
                {pricingPlans.find(p => p.id === selectedPlan)?.name} - {pricingPlans.find(p => p.id === selectedPlan)?.price}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('premium.payment.methods')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'pix'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Smartphone className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="font-semibold text-gray-800">PIX</div>
                    <div className="text-sm text-gray-600">{t('premium.payment.pix.desc')}</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'credit'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-semibold text-gray-800">{t('premium.payment.credit')}</div>
                    <div className="text-sm text-gray-600">{t('premium.payment.credit.desc')}</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'crypto'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bitcoin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="font-semibold text-gray-800">Crypto</div>
                    <div className="text-sm text-gray-600">{t('premium.payment.crypto.desc')}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'pix' && (
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-green-800 mb-4">{t('premium.payment.pix.title')}</h4>
                <div className="bg-white rounded-lg p-3 mb-4 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">✅ PIX OFICIAL ATIVO - aleksayevacupress@gmail.com</span>
                  </div>
                </div>
                {pixPaymentData && (
                  <PixPaymentComponent
                    amount={pixPaymentData.amount}
                    description={pixPaymentData.description}
                    orderId={pixPaymentData.orderId}
                    customerEmail={user?.email}
                    customerName={user?.name}
                    onPaymentSuccess={handlePixPaymentSuccess}
                    onPaymentError={handlePixPaymentError}
                  />
                )}
              </div>
            )}

            {paymentMethod === 'credit' && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-blue-800 mb-4">💳 Pagamento com Cartão - Stripe Oficial</h4>
                <div className="bg-white rounded-lg p-3 mb-4 border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">🚀 Stripe Oficial Ativo - Processamento Real</span>
                  </div>
                </div>
                {pixPaymentData && (
                  <CreditCardPaymentComponent
                    amount={pixPaymentData.amount}
                    currency={regionalPricing?.currency || 'USD'} // ✅ Passando moeda para BRL/USD
                    description={pixPaymentData.description}
                    orderId={pixPaymentData.orderId}
                    customerEmail={user?.email}
                    customerName={user?.name}
                    onPaymentSuccess={(paymentData) => {
                      console.log('💳 Cartão aprovado:', paymentData);
                      alert('Pagamento com cartão aprovado! Bem-vindo ao Premium!');
                      confirmPremiumPayment();
                      setShowPayment(false);
                    }}
                    onPaymentError={(error) => {
                      console.error('Erro no pagamento com cartão:', error);
                    }}
                  />
                )}
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-orange-800 mb-4">{t('premium.payment.crypto.title')}</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white rounded-lg gap-3">
                    <span className="font-semibold min-w-fit">Bitcoin (BTC)</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
                      <span className="font-mono text-sm break-all text-gray-600 bg-gray-50 p-2 rounded w-full sm:w-auto">14FeWjYmfdKx7fwhvuvpBzbga9LNyjwiXq</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('14FeWjYmfdKx7fwhvuvpBzbga9LNyjwiXq');
                          alert('Endereço BTC copiado!');
                        }}
                        className="p-2 hover:bg-orange-100 rounded-full text-orange-600 transition-colors shrink-0"
                        title="Copiar endereço"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white rounded-lg gap-3">
                    <span className="font-semibold min-w-fit">Ethereum (ETH)</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
                      <span className="font-mono text-sm break-all text-gray-600 bg-gray-50 p-2 rounded w-full sm:w-auto">0x560125021f13f256f3c4c53da07d2798c290636a</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('0x560125021f13f256f3c4c53da07d2798c290636a');
                          alert('Endereço ETH copiado!');
                        }}
                        className="p-2 hover:bg-orange-100 rounded-full text-orange-600 transition-colors shrink-0"
                        title="Copiar endereço"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('premium.payment.back')}
              </button>
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-800 text-sm font-medium">
                  💳 Use o método de pagamento acima para confirmar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown className="w-16 h-16 text-yellow-200" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('premium.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-yellow-100">
              {t('premium.hero.subtitle')}
            </p>
            {user?.isPremium ? (
              <div className="inline-flex items-center px-6 py-3 bg-green-500 rounded-full backdrop-blur-sm">
                <Crown className="w-5 h-5 mr-2 text-yellow-200" />
                <span className="font-semibold">{t('premium.hero.active')}</span>
              </div>
            ) : (
              <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown className="w-5 h-5 mr-2 text-yellow-200" />
                <span className="font-semibold">{t('premium.hero.upgrade')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Premium Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('premium.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${feature.status === 'active'
                  ? 'border-green-200 hover:border-green-300 cursor-pointer'
                  : 'border-gray-200'
                  }`}
                onClick={feature.status === 'active' ? feature.action : undefined}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl">
                    {feature.icon}
                  </div>
                  {feature.status === 'active' ? (
                    user?.hasPaidPremium ? (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span>{t('premium.features.available')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>Requer Premium Pago</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{t('premium.features.coming')}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        {!user?.isPremium && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              {t('premium.plans.title')}
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {t('premium.plans.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-8 shadow-lg relative ${plan.popular
                    ? 'border-2 border-orange-500 transform scale-105'
                    : 'border border-gray-200'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {t('premium.plans.popular')}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>

                    {/* 🎁 Badge PROMOÇÃO */}
                    {plan.isPromotional && (
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse shadow-lg">
                        <span>🎁</span>
                        <span>PROMOÇÃO - Oferta Limitada</span>
                        <span>🎁</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-gray-500 line-through">{plan.originalPrice}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                          {plan.discount}
                        </span>
                      </div>
                    )}
                    {plan.savings && (
                      <div className="text-green-600 font-semibold text-sm">
                        {t('premium.plans.save')} {plan.savings}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span>{t('premium.plans.choose')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('premium.testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="text-sm text-gray-600">
                  {testimonial.name}, {testimonial.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {t('premium.faq.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('premium.faq.q1')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('premium.faq.a1')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('premium.faq.q2')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('premium.faq.a2')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('premium.faq.q3')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('premium.faq.a3')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('premium.faq.q4')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('premium.faq.a4')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};