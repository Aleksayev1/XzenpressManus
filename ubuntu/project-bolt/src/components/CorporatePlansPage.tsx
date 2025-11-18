import React, { useState } from 'react';
import { Building2, Users, BarChart3, Shield, CheckCircle, Star, Crown, TrendingUp, FileText, Phone, Mail, ArrowRight, Target, Zap, Award, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { submitCorporateLead, CorporateLeadData } from '../lib/supabase';
import { trackCorporateLead } from './GoogleAnalytics';

interface CorporatePlansPageProps {
  onPageChange: (page: string) => void;
}

export const CorporatePlansPage: React.FC<CorporatePlansPageProps> = ({ onPageChange }) => {
  const { t } = useLanguage();
  const [selectedPlanType, setSelectedPlanType] = useState<'corporate' | 'analytics'>('corporate');
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    cnpj: '',
    email: '',
    phone: '',
    employees_count: '',
    sector: '',
    specific_needs: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const corporatePlans = [
    {
      id: 'starter',
      name: 'Plano Corporativo Starter',
      price: '$150.00',
      period: '/mês',
      description: 'Ideal para pequenas empresas (até 50 funcionários)',
      employees: 'Até 50 funcionários',
      features: [
        'Acesso completo à plataforma para todos os funcionários',
        'Pontos de acupressão básicos e avançados',
        'Respiração 4-7-8 com cromoterapia',
        'Acompanhamento de uso da plataforma',
        'Suporte por email',
        'Suporte para início rápido'
      ],
      compliance: [
        'Atendimento à Lei 14.831/2024',
        'Certificação de Empresa Promotora da Saúde Mental'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'business',
      name: 'Plano Corporativo Business',
      price: '$480.00',
      period: '/mês',
      description: 'Para médias empresas (51-200 funcionários)',
      employees: '51-200 funcionários',
      features: [
        'Tudo do plano Starter',
        'Relatórios avançados de engajamento',
        'Opções de integração para grandes empresas',
        'Suporte prioritário',
        'Conteúdo exclusivo de bem-estar',
        'Atendimento dedicado'
      ],
      compliance: [
        'Tudo do plano Starter',
        'Relatórios de conformidade simplificados'
      ],
      popular: true,
      color: 'green'
    },
    {
      id: 'enterprise',
      name: 'Plano Corporativo Enterprise',
      price: '$1,000.00',
      period: '/mês',
      description: 'Para grandes corporações (200+ funcionários)',
      employees: '200+ funcionários',
      features: [
        'Tudo do plano Business',
        'Customização completa da plataforma',
        'White-label com marca da empresa',
        'Recomendações personalizadas (via IA em desenvolvimento)',
        'Integração avançada com sistemas existentes',
        'Consultoria estratégica de bem-estar',
        'Treinamento para líderes internos',
        'Alta disponibilidade da plataforma',
        'Suporte especializado'
      ],
      compliance: [
        'Tudo do plano Business',
        'Suporte completo à conformidade'
      ],
      popular: false,
      color: 'purple'
    }
  ];

  const analyticsPlans = [
    {
      id: 'basic',
      name: 'Analytics Básico',
      price: '$100.00',
      period: '/mês',
      description: 'Métricas essenciais de bem-estar corporativo',
      features: [
        'Dashboard básico de uso',
        'Relatórios mensais de uso',
        'Métricas básicas de uso e engajamento',
        'Exportação de dados',
        'Suporte por email'
      ],
      metrics: [
        'Taxa de uso da plataforma',
        'Sessões de respiração realizadas',
        'Pontos de acupressão mais utilizados',
        'Horários de maior atividade'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Analytics Profissional',
      price: '$240.00',
      period: '/mês',
      description: 'Analytics avançados com insights comportamentais',
      features: [
        'Tudo do plano Básico',
        'Dashboard e relatórios detalhados',
        'Insights de tendências de bem-estar',
        'Segmentação por departamento/cargo',
        'Integração com ferramentas de BI',
        'Alertas sobre padrões de uso',
        'Suporte prioritário'
      ],
      metrics: [
        'Tudo do plano Básico',
        'Análise de impacto no bem-estar',
        'Padrões de uso por perfil demográfico',
        'Eficácia das intervenções de bem-estar'
      ],
      popular: true,
      color: 'green'
    },
    {
      id: 'complete',
      name: 'Analytics Completo',
      price: '$400.00',
      period: '/mês',
      description: 'Suite completa de inteligência em bem-estar',
      features: [
        'Tudo do plano Profissional',
        'Insights avançados com IA',
        'Comparativo de mercado',
        'Consultoria de dados',
        'Relatórios executivos customizados',
        'Preparado para integração com wearables',
        'Análise de feedback',
        'Especialista em dados dedicado'
      ],
      metrics: [
        'Tudo do plano Profissional',
        'Métricas estratégicas de bem-estar'
      ],
      popular: false,
      color: 'purple'
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Compliance Legal Completo',
      description: 'Atendimento integral à Lei 14.831/2024 e NR-1 com certificação oficial'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: 'ROI Comprovado em 6 Meses',
      description: 'Retorno garantido do investimento com métricas mensuráveis'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: 'Engajamento dos Funcionários',
      description: 'Aumento comprovado de 60% no bem-estar e produtividade'
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: 'Certificação Oficial',
      description: 'Selo de Empresa Promotora da Saúde Mental reconhecido pelo governo'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowContactForm(true);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const leadData: CorporateLeadData = {
        ...formData,
        plan_type: selectedPlanType,
        selected_plan: selectedPlan
      };

      await submitCorporateLead(leadData);
      setSubmitStatus('success');
      
      // Track corporate lead
      trackCorporateLead(selectedPlanType, formData.employees_count);
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowContactForm(false);
        setFormData({
          name: '',
          position: '',
          company: '',
          cnpj: '',
          email: '',
          phone: '',
          employees_count: '',
          sector: '',
          specific_needs: ''
        });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setSubmitStatus('error');
      setErrorMessage('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlans = selectedPlanType === 'corporate' ? corporatePlans : analyticsPlans;

  if (showContactForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h1>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Gerente de RH"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome da empresa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@empresa.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Funcionários *
                  </label>
                  <select 
                    name="employees_count"
                    value={formData.employees_count}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="1-50">1-50 funcionários</option>
                    <option value="51-200">51-200 funcionários</option>
                    <option value="201-500">201-500 funcionários</option>
                    <option value="500+">500+ funcionários</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setor da Empresa
                  </label>
                  <select 
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="industria">Indústria</option>
                    <option value="servicos">Serviços</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Necessidades Específicas
                </label>
                <textarea
                  name="specific_needs"
                  value={formData.specific_needs}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descreva suas necessidades específicas, desafios atuais com bem-estar corporativo, integrações necessárias, etc."
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Proposta enviada com sucesso! Nossa equipe entrará em contato em até 24h.
                    </span>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-red-800 font-medium">
                      {errorMessage}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-4">O que acontece depois?</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Análise das suas necessidades em até 24h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Proposta comercial personalizada</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Demonstração da plataforma</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Consultoria gratuita de implementação</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Solicitar Proposta</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Building2 className="w-16 h-16 text-blue-200" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('corporate.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t('corporate.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSelectedPlanType('corporate')}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all ${
                  selectedPlanType === 'corporate'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🏢 {t('corporate.plans.title')}
              </button>
              <button
                onClick={() => setSelectedPlanType('analytics')}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all ${
                  selectedPlanType === 'analytics'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                📊 {t('corporate.analytics.title')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher XZenPress B2B?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedPlanType === 'corporate' ? '🏢 Planos Corporativos' : '📊 Analytics Empresariais'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {selectedPlanType === 'corporate' 
                ? 'Soluções completas de bem-estar para empresas de todos os tamanhos'
                : 'Insights avançados e métricas de bem-estar para tomada de decisão estratégica'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  plan.popular 
                    ? 'border-2 border-green-500 transform scale-105' 
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  {selectedPlanType === 'corporate' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">{plan.employees}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">Recursos Inclusos:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedPlanType === 'corporate' && plan.compliance && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Compliance Legal:</h4>
                    <ul className="space-y-2">
                      {plan.compliance.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPlanType === 'analytics' && plan.metrics && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Métricas Disponíveis:</h4>
                    <ul className="space-y-2">
                      {plan.metrics.map((metric, metricIndex) => (
                        <li key={metricIndex} className="flex items-start space-x-2">
                          <BarChart3 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>Solicitar Proposta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📈 {t('corporate.roi.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('corporate.roi.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">40%</div>
              <div className="text-gray-700">{t('corporate.roi.stress')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-700">{t('corporate.roi.absences')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">60%</div>
              <div className="text-gray-700">{t('corporate.roi.engagement')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">6 meses</div>
              <div className="text-gray-700">{t('corporate.roi.return')}</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Entre em Contato Conosco
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Nossa equipe está pronta para criar uma solução personalizada para sua empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:AleksayevAcupress@gmail.com"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>AleksayevAcupress@gmail.com</span>
            </a>
            <a
              href="tel:+5562983216363"
              className="inline-flex items-center space-x-2 bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>(62) 98321-6363</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
