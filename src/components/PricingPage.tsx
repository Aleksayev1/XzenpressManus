import React, { useState } from 'react';
import { Check, Crown, Sparkles, Zap, Brain, Heart, Clock, TrendingUp, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PricingPageProps {
    onPageChange: (page: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onPageChange }) => {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    // Se já é premium, redirecionar
    if (user?.isPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-16 flex items-center justify-center">
                <div className="text-center px-4">
                    <Crown className="w-20 h-20 text-green-600 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Você já é Premium! 🎉</h1>
                    <p className="text-xl text-gray-600 mb-8">Aproveite todos os recursos do sistema</p>
                    <button
                        onClick={() => onPageChange('home')}
                        className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>Sistema vivo de autocuidado</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                    Não trate sintomas.
                    <br />
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Entenda padrões.
                    </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    Um sistema vivo que integra <strong>corpo, mente, tempo e emoção</strong> para autocuidado guiado, consciente e contínuo.
                </p>

                {/* Medical Disclaimer - COMPLIANCE */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-4xl mx-auto mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Importante:</strong> XZenPress é uma ferramenta de bem-estar e <strong>não substitui</strong> orientação médica, diagnóstico ou tratamento profissional. Consulte sempre um profissional de saúde qualificado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">XZenPress vs Concorrentes</h3>
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-700">Concorrentes</p>
                                    <p className="text-sm text-gray-600">Pontos genéricos</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-600">Conteúdo estático</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-600">Nutrição genérica</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-600">Uso pontual</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">XZenPress</p>
                                    <p className="text-sm text-green-700">Mapa inteligente YNSA+MTC</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-green-700">Self Oracle (insights ao vivo)</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-green-700">Nutriming (cronobiologia)</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-green-700">Acompanhamento contínuo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Journey Section */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-12">Sua Jornada de Transformação</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Step 1 */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">1. Entenda-se</h3>
                            <p className="text-purple-200 text-sm">Self Oracle descobre seus padrões emocionais e físicos</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">2. Alimente-se</h3>
                            <p className="text-purple-200 text-sm">Nutriming otimiza quando tomar cada suplemento</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">3. Ative-se</h3>
                            <p className="text-purple-200 text-sm">66 pontos de acupressão para o momento certo</p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">4. Integre</h3>
                            <p className="text-purple-200 text-sm">Som sincronizado com seu estado emocional</p>
                        </div>

                        {/* Step 5 */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">5. Acompanhe</h3>
                            <p className="text-purple-200 text-sm">Dashboard de evolução ao longo do tempo</p>
                        </div>
                    </div>

                    <p className="text-center mt-12 text-2xl font-semibold text-cyan-200">
                        Clareza + Autonomia + Ritual = Vida equilibrada
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Escolha Sua Experiência</h2>
                    <p className="text-xl text-gray-600">Investimento em você mesmo</p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-8 space-x-4">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full font-medium transition-all relative ${billingCycle === 'annual'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Anual
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                -33%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Tier */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Experimente</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-2">Grátis</div>
                            <p className="text-gray-600">Para sempre</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">4 pontos essenciais selecionados</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">1 jornada clínica</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Respiração 4-7-8 guiada</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-500">Self Oracle completo</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-500">Nutriming ilimitado</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-500">Dashboard completo</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => onPageChange('login')}
                            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        >
                            Começar Grátis
                        </button>
                    </div>

                    {/* Premium Tier - DESTAQUE */}
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-400 transform md:scale-105 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold">
                            MAIS POPULAR
                        </div>

                        <div className="text-center mb-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <div className="text-5xl font-bold mb-2">
                                {billingCycle === 'monthly' ? 'R$ 49' : 'R$ 399'}
                            </div>
                            <p className="text-purple-200">
                                {billingCycle === 'monthly' ? 'por mês' : 'por ano'}
                            </p>
                            {billingCycle === 'annual' && (
                                <p className="text-sm text-yellow-300 mt-2">Economize R$ 189/ano</p>
                            )}
                        </div>

                        <ul className="space-y-4 mb-8 text-white">
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span><strong>Self Oracle completo</strong> - Monitore padrões e tendências emocionais</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span><strong>Nutriming ilimitado</strong> - Timing otimizado cronobiológico</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span><strong>66 Pontos + 12 Jornadas</strong> - Biblioteca YNSA+MTC completa</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span><strong>Dashboard de Evolução</strong> - Acompanhe seus padrões</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span><strong>Spotify Integrado</strong> - Som por estado emocional</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span>Suporte prioritário</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => onPageChange('premium')}
                            className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>Desbloquear Sistema Completo</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className="text-center text-purple-200 text-sm mt-4">
                            ✨ 7 dias grátis • Cancele quando quiser
                        </p>
                    </div>

                    {/* Lifetime Tier */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-yellow-400">
                        <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                            <Crown className="w-4 h-4" />
                            <span>MELHOR VALOR</span>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifetime</h3>
                            <div className="text-5xl font-bold text-gray-900 mb-2">R$ 999</div>
                            <p className="text-gray-600">Pagamento único</p>
                            <p className="text-sm text-green-600 font-semibold mt-2">
                                Até 60% mais acessível que apps internacionais similares
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700"><strong>Tudo do Premium</strong> para sempre</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Atualizações vitalícias</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Early access a novos recursos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Suporte VIP dedicado</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Badge exclusivo "Founding Member"</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => onPageChange('premium')}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
                        >
                            Garantir Acesso Vitalício
                        </button>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            🔒 Proteção total • Sem mensalidades
                        </p>
                    </div>
                </div>

                {/* Value Proposition Below */}
                <div className="mt-16 text-center">
                    <p className="text-2xl text-gray-700 font-semibold mb-4">
                        💎 Otimize o timing dos seus suplementos
                    </p>
                    <p className="text-lg text-gray-600">
                        Nutriming ajuda você a aproveitar melhor cada nutriente*
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        *Resultados podem variar. Consulte um nutricionista para orientação personalizada.
                    </p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Perguntas Frequentes</h2>

                    <div className="space-y-6">
                        <details className="bg-white rounded-lg p-6 shadow-md">
                            <summary className="font-semibold text-gray-900 cursor-pointer">
                                O que torna o XZenPress diferente de apps como Headspace ou Calm?
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Enquanto apps de meditação focam apenas em mindfulness, nós integramos <strong>ação física (acupressão YNSA+MTC), assistente de evolução humana (Self Oracle) e cronobiologia (Nutriming)</strong> em um sistema completo de autocuidado.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg p-6 shadow-md">
                            <summary className="font-semibold text-gray-900 cursor-pointer">
                                Como funciona o Self Oracle?
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Self Oracle analisa seus padrões de uso, estados emocionais e histórico para <strong>identificar tendências que podem indicar desconforto futuro</strong>. Acompanhamento preventivo baseado em seus próprios dados.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg p-6 shadow-md">
                            <summary className="font-semibold text-gray-900 cursor-pointer">
                                O Nutriming realmente aumenta absorção de suplementos?
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Sim. Baseado em estudos de cronobiologia, o timing correto pode otimizar significativamente a absorção de nutrientes (ex: Vitamina D pela manhã com exposição solar). Também identificamos conflitos conhecidos entre nutrientes (ex: café pode reduzir absorção de ferro).
                            </p>
                        </details>

                        <details className="bg-white rounded-lg p-6 shadow-md">
                            <summary className="font-semibold text-gray-900 cursor-pointer">
                                Posso cancelar quando quiser?
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Sim, sem burocracia. Premium mensal/anual pode ser cancelado a qualquer momento. Lifetime é pagamento único sem recorrência.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg p-6 shadow-md">
                            <summary className="font-semibold text-gray-900 cursor-pointer">
                                Tem teste grátis?
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Sim! Premium tem <strong>7 dias grátis</strong>. Cancele antes e não paga nada. Ou use a versão gratuita para sempre com 4 pontos.
                            </p>
                        </details>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Comece Sua Jornada de Autocuidado Hoje
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        5 minutos por dia. Sistema completo. Jornada de bem-estar.
                    </p>
                    <button
                        onClick={() => onPageChange('premium')}
                        className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-2xl inline-flex items-center space-x-3"
                    >
                        <span>Desbloquear Agora</span>
                        <Crown className="w-6 h-6" />
                    </button>
                    <p className="text-purple-200 mt-6 text-sm">
                        ✨ Sem cartão para teste grátis • Cancele quando quiser
                    </p>
                </div>
            </div>
        </div>
    );
};
