import React from 'react';
import { ArrowLeft, Shield, ChevronRight } from 'lucide-react';

interface HerpesHubPageProps {
    onBack: () => void;
    onPageChange: (page: string) => void;
    onProtocol?: (id: string) => void;
}

const OPTIONS = [
    {
        id: 'herpes-labial-hsv1',
        icon: '💋',
        title: 'Herpes Labial',
        subtitle: 'HSV-1 — Boca & Lábios',
        description: 'Reduz duração do surto, alivia queimação e fortalece a imunidade da pele (Wei Qi). 5 pontos: YNSA + MTC.',
        color: 'from-orange-600 to-red-600',
        border: 'border-orange-500/40',
        bg: 'bg-orange-950/30',
        badge: 'Premium · 14 min',
        type: 'protocol',
    },
    {
        id: 'herpes-genital-hsv2',
        icon: '🔒',
        title: 'Herpes Genital',
        subtitle: 'HSV-2 — Pélvico & Emocional',
        description: 'Age em 3 camadas: dor local, imunidade pélvica e eixo emocional (vergonha/medo = gatilhos documentados).',
        color: 'from-purple-600 to-indigo-600',
        border: 'border-purple-500/40',
        bg: 'bg-purple-950/30',
        badge: 'Premium · 17 min',
        type: 'protocol',
    },
    {
        id: 'zoster-map',
        icon: '🔥',
        title: 'Herpes Zoster',
        subtitle: 'Cobreiro — Neural & Dermátomos',
        description: 'Mapa neural interativo por região da dor. Protocolo Huatuo + YNSA por dermátomo. Sessão guiada com timer.',
        color: 'from-red-600 to-pink-600',
        border: 'border-red-500/40',
        bg: 'bg-red-950/30',
        badge: 'Premium · Mapa Interativo',
        type: 'page',
    },
];

export const HerpesHubPage: React.FC<HerpesHubPageProps> = ({ onBack, onPageChange, onProtocol }) => {
    const handleSelect = (option: typeof OPTIONS[0]) => {
        if (option.type === 'page') {
            onPageChange(option.id);
        } else if (onProtocol) {
            onProtocol(option.id);
        } else {
            // Fallback: navigate to protocols page (filter by id via state would be ideal)
            onPageChange('protocols');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-16">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
                        🦠 Família Herpes
                    </h1>
                    <div className="w-8" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

                {/* Intro Banner */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        O vírus herpes é <strong className="text-white">latente</strong> — reside nos gânglios nervosos e reativa quando a imunidade cai. A MTC e YNSA atuam na <strong className="text-white">raiz</strong>: fortalecem Wei Qi, eliminam Calor-Umidade e dissolvem os estados emocionais (estresse, vergonha, medo) que ativam o eixo neuroendócrino responsável pelo surto.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="bg-black/30 rounded-lg p-3">
                            <div className="text-2xl mb-1">🦠</div>
                            <div className="text-gray-400">Vírus Latente</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <div className="text-2xl mb-1">🧠</div>
                            <div className="text-gray-400">Gatilho Emocional</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <div className="text-2xl mb-1">🛡️</div>
                            <div className="text-gray-400">Wei Qi Protetor</div>
                        </div>
                    </div>
                </div>

                {/* Journey Cards */}
                <h2 className="text-lg font-bold text-gray-200 mt-2">Escolha sua Jornada</h2>

                {OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left ${option.bg} border ${option.border} rounded-2xl p-5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg group`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{option.icon}</span>
                                    <div>
                                        <h3 className={`font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r ${option.color}`}>
                                            {option.title}
                                        </h3>
                                        <p className="text-xs text-gray-400">{option.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {option.description}
                                </p>
                                <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${option.color} text-white`}>
                                    {option.badge}
                                </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors mt-1 flex-shrink-0" />
                        </div>
                    </button>
                ))}

                {/* Common Triggers */}
                <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-5 mt-4">
                    <h3 className="font-bold text-gray-200 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        Gatilhos Universais — Evite sempre:
                    </h3>
                    <ul className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        {[
                            '😰 Estresse agudo',
                            '😴 Privação de sono',
                            '☀️ Exposição solar excessiva',
                            '🍷 Álcool',
                            '🍫 Arginina (amendoim, chocolate)',
                            '🤒 Gripes e infecções',
                            '💊 Corticoides sistêmicos',
                            '🩸 Ciclo menstrual (HSV-2)',
                        ].map((t) => (
                            <li key={t} className="flex items-center gap-1">
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-center text-xs text-gray-600 pt-4">
                    Baseado em protocolos de MTC (Calor-Imunidade) e YNSA (Yamamoto). Não substitui acompanhamento médico.
                </p>
            </main>
        </div>
    );
};
