import React, { useState } from 'react';
import { Crown, Star, Lock, Zap, MessageCircle, Target, Brain, Shield, CheckCircle, Clock, ArrowRight, CreditCard, Smartphone, Bitcoin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { PixPaymentComponent } from './PixPaymentComponent';
import { CreditCardPaymentComponent } from './CreditCardPaymentComponent';
import { trackPremiumUpgrade } from './GoogleAnalytics';

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
            {/* WhatsApp Consultation */}
            <div 
              onClick={() => onPageChange('whatsapp-consultation')}
              className={`group bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 border-2 ${
                user?.hasPaidPremium 
                  ? 'hover:shadow-xl cursor-pointer border-green-200 hover:border-green-300' 
                  : 'border-gray-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Consulta Especializada</h3>
                  <p className={`font-medium ${user?.hasPaidPremium ? 'text-green-600' : 'text-gray-500'}`}>
                    {user?.hasPaidPremium ? 'Disponível Agora' : 'Após Pagamento'}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Formulário detalhado para casos complexos com atendimento personalizado via WhatsApp
              </p>
              <div className={`flex items-center font-medium ${
                user?.hasPaidPremium 
                  ? 'text-green-600 group-hover:text-green-700' 
                  : 'text-gray-500'
              }`}>
                <span>{user?.hasPaidPremium ? 'Acessar formulário' : 'Faça o pagamento para desbloquear'}</span>
                {user?.hasPaidPremium && (
                  <Zap className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
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
                  <p className="text-purple-600 font-medium">11 Pontos Premium</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Acesso completo a pontos especializados: Septicemia, ATM, Cranioterapia e Neurologia
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
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">11</div>
                <div className="text-sm text-gray-600">Pontos Exclusivos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-600">Suporte WhatsApp</div>
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
    {
      id: 'whatsapp-consultation',
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      title: t('premium.features.whatsapp.title'),
      description: t('premium.features.whatsapp.description'),
      benefits: [
        t('premium.features.whatsapp.benefit1'),
        t('premium.features.whatsapp.benefit2'),
        t('premium.features.whatsapp.benefit3'),
        t('premium.features.whatsapp.benefit4')
      ],
      status: 'active',
      action: () => onPageChange('whatsapp-consultation')
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
      action: () => {}
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
      status: 'coming-soon',
      action: () => {}
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
      action: () => {}
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
      action: () => {}
    }
  ];

  const pricingPlans = [
    {
      id: 'monthly',
      name: t('premium.plans.monthly.name'),
      price: '$5.99',
      period: t('premium.plans.monthly.period'),
      features: [
        t('premium.plans.monthly.feature1'),
        t('premium.plans.monthly.feature2'),
        t('premium.plans.monthly.feature3'),
        t('premium.plans.monthly.feature4'),
        t('premium.plans.monthly.feature5')
      ],
      popular: false,
      savings: null
    },
    {
      id: 'annual',
      name: t('premium.plans.annual.name'),
      price: '$59.99',
      period: t('premium.plans.annual.period'),
      originalPrice: '$71.99',
      discount: '17% OFF',
      features: [
        t('premium.plans.annual.feature1'),
        t('premium.plans.annual.feature2'),
        t('premium.plans.annual.feature3'),
        t('premium.plans.annual.feature4'),
        t('premium.plans.annual.feature5')
      ],
      popular: true,
      savings: '$12.00'
    },
    {
      id: 'lifetime',
      name: t('premium.plans.lifetime.name'),
      price: '$199.99',
      period: t('premium.plans.lifetime.period'),
      originalPrice: '$359.99',
      discount: '44% OFF',
      features: [
        t('premium.plans.lifetime.feature1'),
        t('premium.plans.lifetime.feature2'),
        t('premium.plans.lifetime.feature3'),
        t('premium.plans.lifetime.feature4'),
        t('premium.plans.lifetime.feature5')
      ],
      popular: false,
      savings: '$160.00'
    }
  ];

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
    setSelectedPlan(planId);
    
    // Preparar dados do pagamento PIX
    const plan = pricingPlans.find(p => p.id === planId);
    if (plan) {
      const amount = parseFloat(plan.price.replace('$', ''));
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
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'pix' 
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
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'credit' 
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
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'crypto' 
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
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>Bitcoin (BTC)</span>
                    <span className="font-mono text-sm">14FeWjYmfdKx7fwhvuvpBzbga9LNyjwiXq</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>Ethereum (ETH)</span>
                    <span className="font-mono text-sm">0x560125021f13f256f3c4c53da07d2798c290636a</span>
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
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  feature.status === 'active' 
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
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('premium.features.available')}</span>
                    </div>
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
                  className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                    plan.popular 
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
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      plan.popular
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