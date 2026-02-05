import React from 'react';
import { Heart, BarChart3, ArrowRight } from 'lucide-react';

interface HeroHybridProps {
    onShowTherapySelection: () => void;
    onPageChange: (page: string) => void;
}

export const HeroHybrid: React.FC<HeroHybridProps> = ({ onShowTherapySelection, onPageChange }) => {
    return (
        <section className="relative overflow-hidden py-16">
            {/* Background Image com Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-background-b2b-b2c.jpg"
                    alt="XZenPress - Bem-estar Individual e Corporativo"
                    className="w-full h-full object-cover"
                />
                {/* Overlay gradiente para melhor legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/90"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Robô Zen no Topo */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-purple-300 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                            <img
                                src="/robo-zen-meditando.png"
                                alt="Robo Zen - Guia de Bem-estar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-600 bg-clip-text text-transparent">
                            Sua Biologia é um Milagre
                        </span>
                    </h2>

                    <p className="text-xl md:text-2xl text-gray-800 max-w-4xl mx-auto leading-relaxed drop-shadow-md bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        Na XZenPress, unimos a <strong>sabedoria milenar da Medicina Tradicional Chinesa</strong>{' '}
                        com a <strong>ciência moderna da neurociência</strong> para um bem-estar integral.
                    </p>
                </div>

                {/* Cards B2C | Logo | B2B */}
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 mb-12">

                        {/* Card B2C */}
                        <div className="group bg-gradient-to-br from-purple-100/95 to-pink-100/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-300">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Heart className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-6">Para Você</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                            <span className="text-2xl">🌿</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Alívio do estresse</p>
                                            <p className="text-gray-500 text-sm">Técnicas validadas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                            <span className="text-2xl">☯️</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Paz interior</p>
                                            <p className="text-gray-500 text-sm">Equilíbrio mente-corpo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shadow border border-purple-200">
                                            <span className="text-xl animate-pulse">🌬️</span>
                                        </div>
                                        <div>
                                            <p className="text-purple-900 font-bold flex items-center gap-2">
                                                ZenFlow (Movimento)
                                                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wide">Novo</span>
                                            </p>
                                            <p className="text-purple-700 text-sm">Liberação de Trauma</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onShowTherapySelection}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <span>✨</span>
                                    <span>Começar Gratuitamente</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-gray-500 text-sm mt-3">Sem cadastro • 4 pontos gratuitos</p>
                            </div>
                        </div>

                        {/* Card B2B */}
                        <div className="group bg-gradient-to-br from-cyan-100/95 to-blue-100/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-cyan-200 hover:border-cyan-300">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <BarChart3 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-6">Para Sua Empresa</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                            <span className="text-2xl">🛡️</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Conformidade</p>
                                            <p className="text-gray-500 text-sm">NR-1 + Lei 14.831/2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                            <span className="text-2xl">💰</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">ROI Comprovado</p>
                                            <p className="text-gray-500 text-sm">Retorno em 6 meses</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Produtividade</p>
                                            <p className="text-gray-500 text-sm">Redução de absenteísmo</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onPageChange('premium')}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <span>📊</span>
                                    <span>Soluções Corporativas</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-gray-500 text-sm mt-3">Demo gratuita • Análise de ROI</p>
                            </div>
                        </div>
                    </div>

                    {/* Logo XZenPress no Centro */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-green-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative w-28 h-28 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center p-3">
                                <img
                                    src="/Logo Xzenpress oficial.png"
                                    alt="XZenPress Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center items-center gap-6 opacity-80 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🏛️</span>
                        <span className="text-sm font-semibold text-gray-700">MTC Tradicional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🧠</span>
                        <span className="text-sm font-semibold text-gray-700">Neurociência</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">⚖️</span>
                        <span className="text-sm font-semibold text-gray-700">Lei 14.831/2024</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🌍</span>
                        <span className="text-sm font-semibold text-gray-700">ISO 45003</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
