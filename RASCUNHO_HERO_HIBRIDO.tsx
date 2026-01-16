// 🎨 RASCUNHO: Nova Hero Section Híbrida B2B + B2C
// Para ser inserida no HomePage.tsx ANTES do banner atual

{/* ========================================
    NOVA HERO SECTION - DUAL MESSAGE B2B+B2C
    ======================================== */}

<section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-cyan-50 py-16">
    {/* Decorative Elements */}
    <div className="absolute top-10 left-10 w-20 h-20 opacity-10">
        <svg viewBox="0 0 100 100" className="text-purple-400">
            <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
    </div>
    <div className="absolute bottom-10 right-10 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" className="text-cyan-400">
            <path d="M50 10 L90 90 L10 90 Z" fill="currentColor" />
        </svg>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Headline - Emotional Hook */}
        <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
                <span className="text-6xl">🌟</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-600 bg-clip-text text-transparent">
                    Sua Biologia é um Milagre
                </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Na XZenPress, unimos a <strong>sabedoria milenar da Medicina Tradicional Chinesa</strong>
                com a <strong>ciência moderna da neurociência</strong> para um bem-estar integral.
            </p>
        </div>

        {/* Dual Message Cards - B2C | B2B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

            {/* ========== B2C CARD ========== */}
            <div className="group bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-300">
                <div className="text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <Heart className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Para Você
                    </h2>

                    {/* Benefits */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center space-x-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">Alívio do estresse</p>
                                <p className="text-gray-500 text-sm">Técnicas validadas cientificamente</p>
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
                            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                <span className="text-2xl">🧘</span>
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">Equilíbrio total</p>
                                <p className="text-gray-500 text-sm">Transformação duradoura</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => setShowTherapySelection(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                    >
                        <span>✨</span>
                        <span>Começar Gratuitamente</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-gray-500 text-sm mt-3">
                        Sem cadastro necessário • 4 pontos gratuitos
                    </p>
                </div>
            </div>

            {/* ========== B2B CARD ========== */}
            <div className="group bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-cyan-200 hover:border-cyan-300">
                <div className="text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <BarChart3 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Para Sua Empresa
                    </h2>

                    {/* Benefits */}
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

                    {/* CTA */}
                    <button
                        onClick={() => onPageChange('corporate')}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                    >
                        <span>📊</span>
                        <span>Soluções Corporativas</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-gray-500 text-sm mt-3">
                        Demo gratuita • Análise de ROI personalizada
                    </p>
                </div>
            </div>

        </div>

        {/* Trust Badges - Minimal */}
        <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <div className="flex items-center space-x-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-sm font-semibold text-gray-600">MTC Tradicional</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span className="text-sm font-semibold text-gray-600">Neurociência</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-2xl">⚖️</span>
                <span className="text-sm font-semibold text-gray-600">Lei 14.831/2024</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-semibold text-gray-600">ISO 45003</span>
            </div>
        </div>

    </div>
</section>

{/* ========================================
    FIM DA NOVA HERO SECTION
    
    DEPOIS DISSO, MANTER:
    - Banner Hero V6 atual (pode ser secundário)
    - Science Banner
    - Resto da página
    ======================================== */}
