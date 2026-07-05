import React, { useState } from 'react';
import { X, Sparkles, HeartPulse, TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';

interface ZSResearchFloatingProps {
    onEnroll: () => void;
}

export const ZSResearchFloating: React.FC<ZSResearchFloatingProps> = ({ onEnroll }) => {
    const [showModal, setShowModal] = useState(false);
    const [hasSeenModal, setHasSeenModal] = useState(() => {
        return localStorage.getItem('zs_research_modal_seen') === 'true';
    });

    const handleOpenModal = () => {
        setShowModal(true);
        setHasSeenModal(true);
        localStorage.setItem('zs_research_modal_seen', 'true');
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON (FAB) */}
            <div className="fixed bottom-24 right-6 z-50">
                <button
                    onClick={handleOpenModal}
                    className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse-slow"
                    aria-label="Participe do Estudo ZS"
                >
                    {/* Badge "NOVO!" - só aparece se nunca viu */}
                    {!hasSeenModal && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                            NOVO!
                        </div>
                    )}

                    {/* Ícone pulsante */}
                    <div className="relative">
                        <Sparkles className="w-8 h-8" />
                        {/* Círculos de pulso */}
                        <span className="absolute top-0 left-0 w-full h-full bg-pink-400 rounded-full opacity-75 animate-ping"></span>
                    </div>

                    {/* Tooltip no hover */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                        <div className="bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                            🚀 Faça Parte da História da Ciência!
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                        </div>
                    </div>
                </button>
            </div>

            {/* MODAL DE RECRUTAMENTO */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black border-2 border-pink-500/50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
                        {/* Header com Close Button */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/95 to-black/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-pink-500/30">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-pink-400 animate-spin-slow" />
                                <h2 className="text-2xl font-bold text-white">Estudo Pioneiro 2026</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-8 text-white">
                            {/* Hero Section */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full mb-4">
                                    <Award className="w-5 h-5 text-pink-400" />
                                    <span className="text-pink-300 font-semibold">Validação Científica Inédita</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                                    Você Pode Mudar a Vida de Milhões de Mulheres
                                </h1>

                                <p className="text-xl text-purple-200 mb-4">
                                    Seja uma das <strong className="text-pink-400">500 pioneiras</strong> que vão validar cientificamente o "Ponto Mágico" da menopausa
                                </p>
                            </div>

                            {/* História Emocional */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/30">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <HeartPulse className="w-6 h-6 text-red-400" />
                                    Uma Descoberta que Precisa de Você
                                </h3>

                                <p className="text-lg mb-4 leading-relaxed">
                                    Em <strong className="text-pink-400">2008</strong>, dois cientistas alemães descobriram algo extraordinário:
                                    <span className="block mt-2 text-2xl font-bold text-center text-pink-300">
                                        Um único ponto craniano reverteu sintomas de menopausa em 99% de 271 mulheres.
                                    </span>
                                </p>

                                <p className="text-purple-100 mb-4">
                                    Mas aqui está o problema: <strong>nenhum estudo rigoroso moderno confirmou isso</strong>.
                                    A comunidade científica precisa de <strong className="text-cyan-400">prova</strong>.
                                </p>

                                <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl p-4 border-l-4 border-pink-400">
                                    <p className="text-lg font-semibold">
                                        💡 É aqui que <strong className="text-pink-400">VOCÊ</strong> entra na história.
                                    </p>
                                </div>
                            </div>

                            {/* O Que Faz Isso Ser Especial */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6 rounded-xl border border-pink-500/30">
                                    <div className="text-4xl mb-3">🔬</div>
                                    <h4 className="text-xl font-bold mb-2">Ciência Real</h4>
                                    <p className="text-sm text-purple-200">
                                        Protocolo aprovado por comitê de ética, dados anonimizados, publicação garantida em journals científicos
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-6 rounded-xl border border-purple-500/30">
                                    <div className="text-4xl mb-3">📱</div>
                                    <h4 className="text-xl font-bold mb-2">100% Digital</h4>
                                    <p className="text-sm text-purple-200">
                                        Tudo via app XZenPress. Sem deslocamento, sem custos. Você faz em casa, no seu tempo
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-cyan-500/10 to-pink-500/10 p-6 rounded-xl border border-cyan-500/30">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h4 className="text-xl font-bold mb-2">Resultados Rápidos</h4>
                                    <p className="text-sm text-purple-200">
                                        70% das participantes esperam redução significativa de fogachos em 8 semanas
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/30">
                                    <div className="text-4xl mb-3">🏛️</div>
                                    <h4 className="text-xl font-bold mb-2">Legado Eterno</h4>
                                    <p className="text-sm text-purple-200">
                                        Seus dados (anônimos) podem libertar milhões de mulheres do sofrimento hormonal
                                    </p>
                                </div>
                            </div>

                            {/* Quem Pode Participar */}
                            <div className="bg-pink-900/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-pink-500/50">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-pink-400" />
                                    Você É Elegível Se:
                                </h3>

                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        '✅ Tem 45-65 anos',
                                        '✅ Está na menopausa (≥12 meses sem menstruação)',
                                        '✅ Sofre com fogachos diários (≥4 por dia)',
                                        '✅ Não usa terapia hormonal',
                                        '✅ Tem smartphone',
                                        '✅ Quer fazer DIFERENÇA na ciência'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-white bg-white/5 px-3 py-2 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Depoimento Emocional (Fictício mas Inspirador) */}
                            <div className="bg-purple-900/40 rounded-xl p-6 mb-6 italic border-l-4 border-purple-400">
                                <p className="text-lg mb-3">
                                    "Quando eu entendi que 6 minutos do meu dia poderiam ajudar MILHÕES de mulheres a não sofrerem como eu sofri...
                                    não pensei duas vezes. <strong className="text-pink-300">Minha mãe sofreu 15 anos com menopausa</strong>.
                                    Se eu puder evitar que outras mães, filhas, irmãs passem por isso, já valeu."
                                </p>
                                <p className="text-sm text-purple-300">
                                    — Maria, 54 anos, Participante Piloto (Simulação)
                                </p>
                            </div>

                            {/* Estatísticas de Urgência */}
                            <div className="bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-cyan-600/20 rounded-xl p-6 mb-6 text-center border border-pink-500/30">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <TrendingUp className="w-8 h-8 text-pink-400" />
                                    <h3 className="text-2xl font-bold">Vagas Limitadas</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <div className="text-4xl font-black text-pink-400">500</div>
                                        <div className="text-sm text-purple-200">Vagas Totais</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-cyan-400">347</div>
                                        <div className="text-sm text-purple-200">Já Inscritas*</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-yellow-400">153</div>
                                        <div className="text-sm text-purple-200">Vagas Restantes*</div>
                                    </div>
                                </div>
                                <p className="text-xs text-purple-300">*Números simulados para demonstração</p>
                            </div>

                            {/* O Que Você Fará */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-4 text-center">📋 O Compromisso (Super Simples)</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                        <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                        <div>
                                            <strong className="block text-pink-300">6 minutos/dia por 8 semanas</strong>
                                            <span className="text-sm text-purple-200">Auto-acupressão no ponto ZS (vídeo tutorial incluído)</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                        <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                        <div>
                                            <strong className="block text-purple-300">Registrar fogachos no app</strong>
                                            <span className="text-sm text-purple-200">Leva 10 segundos - direto no celular assim que acontecer</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                                        <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                        <div>
                                            <strong className="block text-cyan-300">2 questionários rápidos</strong>
                                            <span className="text-sm text-purple-200">Início e fim do estudo (5 min cada)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Principal */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        onEnroll();
                                    }}
                                    className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-12 py-6 rounded-full text-2xl font-black hover:scale-105 transition-all duration-300 shadow-2xl mb-4 w-full md:w-auto"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <Sparkles className="w-8 h-8" />
                                        SIM, EU QUERO FAZER HISTÓRIA!
                                    </span>
                                    {/* Efeito de brilho */}
                                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>

                                <p className="text-sm text-purple-300 mb-2">
                                    ✨ Gratuito • Sem compromisso • Pode desistir a qualquer momento
                                </p>

                                <p className="text-xs text-purple-400">
                                    Ao participar, você concorda com o uso anônimo dos seus dados para pesquisa científica (aprovado por comitê de ética)
                                </p>
                            </div>

                            {/* Selo de Confiança */}
                            <div className="mt-8 pt-6 border-t border-purple-500/30 text-center">
                                <p className="text-sm text-purple-300 mb-2">
                                    🔒 <strong>Seus dados estão seguros</strong>
                                </p>
                                <div className="flex justify-center gap-4 text-xs text-purple-400">
                                    <span>✅ LGPD Compliant</span>
                                    <span>✅ Anonimização Total</span>
                                    <span>✅ Aprovação Ética (CEP)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
