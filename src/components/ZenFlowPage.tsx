import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wind, Activity, Zap, Play, Info, Sparkles } from 'lucide-react';
import { ZenFlowSession } from './ZenFlowSession';
import { ZenFlowSequence, zenFlowExercises } from '../data/zenFlowExercises';
import { emotionalStates } from '../data/emotionalMapping';

interface ZenFlowPageProps {
    onBack: () => void;
}

export const ZenFlowPage: React.FC<ZenFlowPageProps> = ({ onBack }) => {
    const [activeSession, setActiveSession] = useState<ZenFlowSequence | null>(null);
    const [contextBanner, setContextBanner] = useState<{
        emotionName: string;
        element: string;
        recommendedExercise: string | null;
        seq: ZenFlowSequence | null;
    } | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('zenflow_context');
            if (raw) {
                const context = JSON.parse(raw);
                localStorage.removeItem('zenflow_context'); // Clear it immediately

                const seq = zenFlowExercises.find(s => s.id === context.zenFlowExerciseId) || null;
                const emotionObj = emotionalStates.find(e => e.id === context.emotionId);
                const emotionName = emotionObj?.namePortuguese || context.emotionId || '';

                setContextBanner({
                    emotionName,
                    element: context.element || '',
                    recommendedExercise: seq?.title || null,
                    seq
                });

                // Auto-initiate the sequence if found
                if (seq) {
                    setActiveSession(seq);
                }
            }
        } catch (e) {
            console.error("Error reading zenflow_context:", e);
        }
    }, []);

    const categories = [
        {
            id: 'regulation',
            title: 'Regulação',
            subtitle: 'Para Ansiedade e Caos',
            icon: <Wind className="w-8 h-8 text-blue-500" />,
            color: 'bg-blue-50',
            borderColor: 'border-blue-200',
            description: 'Acalme o sistema nervoso quando tudo parece demais.',
            sequences: zenFlowExercises.filter(s => s.type === 'regulation')
        },
        {
            id: 'release',
            title: 'Liberação',
            subtitle: 'Para Raiva e Trava',
            icon: <Activity className="w-8 h-8 text-red-500" />,
            color: 'bg-red-50',
            borderColor: 'border-red-200',
            description: 'Expulse a energia estagnada (fígado/peito) que te sufoca.',
            sequences: zenFlowExercises.filter(s => s.type === 'release')
        },
        {
            id: 'integration',
            title: 'Integração',
            subtitle: 'Para Rigidez e Controle',
            icon: <Zap className="w-8 h-8 text-purple-500" />,
            color: 'bg-purple-50',
            borderColor: 'border-purple-200',
            description: 'Reensine seu corpo a fluir e confiar novamente.',
            sequences: zenFlowExercises.filter(s => s.type === 'integration')
        }
    ];

    if (activeSession) {
        return (
            <ZenFlowSession
                sequence={activeSession}
                onClose={() => setActiveSession(null)}
                onComplete={() => setActiveSession(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-20 px-4">
            {/* Header */}
            <div className="flex items-center absolute left-0 top-1">
                <button
                    onClick={onBack}
                    className="p-2 mr-4 bg-white/80 hover:bg-white rounded-full shadow-sm hover:shadow transition-all group border border-gray-100"
                    title="Voltar ao Menu Principal"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </button>
                {/* Visual Cue - Drawing */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-purple-400 font-handwriting opacity-80 animate-fade-in select-none">
                    <span>↵ Menu Principal</span>
                </div>
            </div>

            <div className="text-center pt-2">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4 ring-4 ring-purple-50 shadow-inner">
                    <Wind className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">ZenFlow™</h1>
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Movimento Intencional para reprogramar o que a mente não alcança.
                </p>
            </div>

            {/* Contextual Onboarding/Oficina Banner */}
            {contextBanner && (
                <div className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl shrink-0 text-purple-600 text-xl font-bold">
                            ✨
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-purple-900 text-sm">Oficina Terapêutica — Conexão Ativa</h4>
                            <p className="text-xs text-gray-650 mt-0.5">
                                Identificamos que você concluiu o trabalho de <strong>{contextBanner.emotionName}</strong> (Elemento {contextBanner.element}).
                            </p>
                        </div>
                    </div>
                    {contextBanner.seq && (
                        <button
                            onClick={() => setActiveSession(contextBanner.seq)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            Refazer Sequência Recomendada →
                        </button>
                    )}
                </div>
            )}

            {/* Educational Banner */}
            <div className="max-w-4xl mx-auto mb-12 bg-white rounded-2xl p-6 shadow-sm border border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-32 h-32 text-purple-900" />
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="mt-1">
                        <Info className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-purple-900 mb-2">Por que se mover?</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            O corpo guarda "memórias musculares" de traumas. A acupressão desbloqueia a energia, mas é o <strong>movimento consciente</strong> que ensina ao seu sistema nervoso que o perigo já passou.
                        </p>
                        <div className="flex gap-2 text-xs font-semibold text-purple-700">
                            <span className="px-2 py-1 bg-purple-50 rounded-lg">Qi Gong Medicinal</span>
                            <span className="px-2 py-1 bg-purple-50 rounded-lg">Yoga Facial</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Grid */}
            <div className="max-w-4xl mx-auto grid gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:scale-[1.01] ${cat.borderColor}`}>
                        <div className="flex items-start gap-4 mb-6">
                            <div className={`p-3 rounded-xl ${cat.color} shrink-0`}>
                                {cat.icon}
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                                <p className="text-sm font-semibold uppercase tracking-wide opacity-60 mb-2">{cat.subtitle}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{cat.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-[4.5rem]">
                            {cat.sequences.map((seq) => (
                                <button
                                    key={seq.id}
                                    onClick={() => setActiveSession(seq)}
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group text-left"
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                            {seq.title}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            ⏱️ {seq.durationTotal} • {seq.steps.length} movimentos
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-purple-300 group-hover:bg-purple-50">
                                        <Play className="w-3 h-3 text-gray-400 group-hover:text-purple-600 pl-0.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};
