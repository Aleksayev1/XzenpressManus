
import React, { useState, useRef, useEffect } from 'react';
import { SpineMap } from '../components/SpineMap';
import { ArrowLeft, Shield, Zap, Brain, X } from 'lucide-react';
import { acupressurePoints } from '../data/acupressurePoints';

interface ZosterMapPageProps {
    onBack: () => void;
}

// Protocol Data Structure
const PROTOCOL_BASE = [
    { id: 'zs-point', name: 'Ponto ZS', icon: '🧠', desc: 'Regulação Neuro-Hormonal (Testa)' },
    { id: 'ynsa-liver', name: 'YNSA Fígado', icon: '🔥', desc: 'Sedar a Raiva/Inflamação (Têmpora)' },
    { id: 'ynsa-nc1-rim', name: 'YNSA Rim (I)', icon: '💧', desc: 'Restaurar Vitalidade (Testa Lateral)' },
    { id: 'vc17-shanzhong', name: 'VC17 (Timo)', icon: '🛡️', desc: 'Maturação de Células T (Peito)' },
];

const DERMATOMES = [
    {
        id: 'face',
        label: 'Rosto / Cabeça',
        icon: '👤',
        levels: ['C4', 'C3'],
        ynsa: 'ynsa-nc5-estomago',
        distal: 'septicemia-hegu-li4',
        description: 'Trigêmeo ou Cervical Alta. YNSA Estômago (Face).'
    },
    {
        id: 'shoulder',
        label: 'Ombro / Braço',
        icon: '💪',
        levels: ['C6', 'C5', 'C7'],
        ynsa: 'ynsa-ypsilon-si',
        distal: 'zoster-zhigou-sj6',
        description: 'Plexo Braquial. YNSA Int. Delgado (Ombro).'
    },
    {
        id: 'chest',
        label: 'Tórax (Mamilo)',
        icon: '💬',
        levels: ['T4', 'T5'],
        ynsa: 'ynsa-e',
        distal: 'zoster-zhigou-sj6',
        description: 'Neuralgia Intercostal. YNSA Ponto E (Tórax).',
        instructions: 'BILATERAL — aplique nos dois lados simultaneamente com a ponta da unha. Aguarde "pérolas de areia se desfazendo".'
    },
    {
        id: 'waist',
        label: 'Cintura / Abdome',
        icon: '🔄',
        levels: ['T10', 'T11', 'T12'],
        ynsa: 'ynsa-liver',
        distal: 'gb41-zulinqi',
        description: 'Faixa na cintura. YNSA Fígado (Raiva).'
    },
    {
        id: 'leg',
        label: 'Lombar / Perna',
        icon: '🦵',
        levels: ['L2', 'L3', 'S1'],
        ynsa: 'ynsa-nc1-rim',
        distal: 'gb41-zulinqi',
        description: 'Irradiação para pernas. YNSA Rim (Medo).'
    }
];

const YNSA_NC = [
    { id: 'ynsa-nc1-rim', label: 'NC I - Olfatório (Rim)', icon: '💧' },
    { id: 'ynsa-nc5-estomago', label: 'NC V - Trigêmeo (Estômago)', icon: '🧠' },
    { id: 'ynsa-liver', label: 'NC X - Vago (Fígado)', icon: '🔥' },
];

export const ZosterMapPage: React.FC<ZosterMapPageProps> = ({ onBack }) => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'body' | 'head'>('body');
    const [viewingPointId, setViewingPointId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string } | null>(null);
    const [herpesType, setHerpesType] = useState<'zoster' | 'labial' | 'genital'>('zoster');

    const activeDermatome = selectedRegion ? DERMATOMES.find(d => d.id === selectedRegion) : null;
    const viewingPointData = viewingPointId ? acupressurePoints.find(p => p.id === viewingPointId) : null;

    // Therapy State
    const [isTherapyActive, setIsTherapyActive] = useState(false);
    const [currentTherapyPointIndex, setCurrentTherapyPointIndex] = useState(0);
    const [therapyQueue, setTherapyQueue] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [breathingTimeLeft, setBreathingTimeLeft] = useState(4);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const therapyQueueRef = useRef<string[]>([]);
    const currentIndexRef = useRef(0);

    const breathingPhases = {
        inhale: { duration: 4, next: 'hold' as const, color: '#1E40AF', label: 'Inspire' },
        hold: { duration: 7, next: 'exhale' as const, color: '#047857', label: 'Segure' },
        exhale: { duration: 8, next: 'inhale' as const, color: '#6B21A8', label: 'Expire' },
    };

    // Start Therapy Logic
    const startTherapy = (dermatomeId: string) => {
        const derm = DERMATOMES.find(d => d.id === dermatomeId);
        if (!derm) return;

        // Eixo Tri: Neural → Endócrino/Imune → MTC
        const rawQueue = [
            'ynsa-e',
            'ynsa-nc5-estomago',
            `zoster-huatuo-${derm.levels[0].toLowerCase()}`,
            'ynsa-nc1-rim',
            'vc17-shanzhong',
            'zs-point',
            'ynsa-liver',
            derm.ynsa,
            derm.distal
        ];
        const uniqueQueue = [...new Set(rawQueue)];
        const queue = uniqueQueue.filter(id => acupressurePoints.some(p => p.id === id));
        if (queue.length === 0) return;

        therapyQueueRef.current = queue;
        currentIndexRef.current = 0;
        setTherapyQueue(queue);
        setCurrentTherapyPointIndex(0);
        setIsTherapyActive(true);
        startPointTimer(queue[0]);
    };

    const startHSVTherapy = (type: 'labial' | 'genital') => {
        const queues = {
            labial: [
                'ynsa-sensorial-boca',
                'ynsa-nc5-estomago',
                'ynsa-nc1-rim',
                'vc17-shanzhong',
                'zs-point',
                'ynsa-liver',
            ],
            genital: [
                'ynsa-nc1-rim',
                'zs-point',
                'bp6-sanyinjiao',
                'vc17-shanzhong',
                'ynsa-liver',
                'ynsa-nc5-estomago',
            ],
        };
        const rawQueue = queues[type];
        const queue = rawQueue.filter(id => acupressurePoints.some(p => p.id === id));
        if (queue.length === 0) return;

        therapyQueueRef.current = queue;
        currentIndexRef.current = 0;
        setTherapyQueue(queue);
        setCurrentTherapyPointIndex(0);
        setIsTherapyActive(true);
        startPointTimer(queue[0]);
    };

    const startPointTimer = (pointId: string) => {
        const point = acupressurePoints.find(p => p.id === pointId);
        const duration = point?.duration || 180;

        setTimeLeft(duration);
        setBreathingPhase('inhale');
        setBreathingTimeLeft(4);

        if (timerRef.current) clearInterval(timerRef.current);
        if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    nextPoint();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        startBreathingTimer();
    };

    const startBreathingTimer = () => {
        if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);

        breathingTimerRef.current = setInterval(() => {
            setBreathingTimeLeft((prev) => {
                if (prev <= 1) {
                    setBreathingPhase((currentPhase) => {
                        const next = breathingPhases[currentPhase].next;
                        setBreathingTimeLeft(breathingPhases[next].duration);
                        return next;
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const nextPoint = () => {
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx < therapyQueueRef.current.length) {
            currentIndexRef.current = nextIdx;
            setCurrentTherapyPointIndex(nextIdx);
            startPointTimer(therapyQueueRef.current[nextIdx]);
        } else {
            endTherapy();
        }
    };

    const endTherapy = () => {
        setIsTherapyActive(false);
        setTherapyQueue([]);
        if (timerRef.current) clearInterval(timerRef.current);
        if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
        };
    }, []);

    const activeTherapyPoint = isTherapyActive ? acupressurePoints.find(p => p.id === therapyQueue[currentTherapyPointIndex]) : null;

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-12 relative font-sans safe-p-bottom">
            {/* LIGHTBOX */}
            {selectedImage && (
                <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                    <button className="absolute top-4 right-4 text-white hover:text-red-400"><X /></button>
                </div>
            )}

            {/* THERAPY OVERLAY */}
            {isTherapyActive && (
                <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto safe-p-top safe-p-bottom">
                    <button onClick={endTherapy} className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white flex items-center gap-2 z-10"><X /> Encerrar</button>
                    <div className="w-full max-w-2xl text-center space-y-4 md:space-y-8 pt-8">
                        <div>
                            <span className="text-blue-400 font-mono text-sm uppercase">Passo {currentTherapyPointIndex + 1} de {therapyQueue.length}</span>
                            <h2 className="text-2xl md:text-4xl font-bold mt-2">{activeTherapyPoint?.name}</h2>
                            <p className="text-gray-300 mt-2 md:mt-4 text-sm md:text-lg leading-relaxed">{activeTherapyPoint?.instructions}</p>
                            {activeTherapyPoint?.image && (
                                <img src={activeTherapyPoint.image} className="max-h-40 md:h-64 mx-auto mt-4 md:mt-6 rounded-xl border border-gray-700 shadow-lg object-contain" onClick={() => setSelectedImage({ src: activeTherapyPoint.image!, alt: activeTherapyPoint.name })} />
                            )}
                        </div>
                        <div className="relative w-40 h-40 md:w-64 md:h-64 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 opacity-10 animate-ping" style={{ borderColor: breathingPhases[breathingPhase].color }}></div>
                            <div className="text-center">
                                <div className="text-4xl md:text-6xl font-bold" style={{ color: breathingPhases[breathingPhase].color }}>{breathingTimeLeft}</div>
                                <div className="text-sm md:text-xl uppercase tracking-widest text-gray-500">{breathingPhases[breathingPhase].label}</div>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl inline-block mx-auto">
                            <div className="text-2xl md:text-4xl font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                        </div>
                        <div>
                            <button onClick={nextPoint} className="bg-blue-600 px-8 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-transform">Próximo Ponto</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER - STICKY FOR ACCESSIBILITY */}
            <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-[100] shadow-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center font-bold px-3 py-1 bg-gray-800 rounded-lg border border-gray-700"><ArrowLeft className="mr-2 w-4 h-4" /> Voltar</button>
                    <h1 className="text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 truncate px-2">
                        {herpesType === 'zoster' ? 'Protocolo Zoster' : herpesType === 'labial' ? 'Protocolo Labial' : 'Protocolo Genital'}
                    </h1>
                    <button onClick={onBack} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Sair do Protocolo">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-8">
                {/* SELECTOR */}
                <div className="flex justify-center">
                    <div className="bg-gray-900 p-1 rounded-full border border-gray-700 flex gap-1">
                        <button onClick={() => { setHerpesType('zoster'); setSelectedRegion(null); }} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'zoster' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'}`}>Zoster</button>
                        <button onClick={() => setHerpesType('labial')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'labial' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}>Labial</button>
                        <button onClick={() => setHerpesType('genital')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'genital' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>Genital</button>
                    </div>
                </div>

                {/* HSV CARDS */}
                {herpesType !== 'zoster' && (
                    <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{herpesType === 'labial' ? '👄' : '🔬'}</span>
                            <div>
                                <h2 className="text-xl font-bold">{herpesType === 'labial' ? 'Herpes Labial (HSV-1)' : 'Herpes Genital (HSV-2)'}</h2>
                                <p className="text-sm text-gray-400">{herpesType === 'labial' ? 'Eixo Neural Sensorial (Boca)' : 'Eixo Sacral (Rim/Jing)'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(herpesType === 'labial' ? [
                                { label: 'Sensorial Boca', role: 'Protagonista' },
                                { label: 'NC5 Trigêmeo', role: 'Modulação' },
                                { label: 'NC1 Rim', role: 'Imunidade' },
                                { label: 'VC17 Timo', role: 'Células T' },
                                { label: 'ZS Point', role: 'Reset' },
                                { label: 'YNSA Vago', role: 'Sistêmico' }
                            ] : [
                                { label: 'NC1 Rim', role: 'Protagonista' },
                                { label: 'ZS Point', role: 'Reset NK' },
                                { label: 'BP6 Sanyinjiao', role: 'Eixo Sacral' },
                                { label: 'VC17 Timo', role: 'Imunidade' },
                                { label: 'YNSA Vago', role: 'Anti-inflam.' },
                                { label: 'NC5 Trigêmeo', role: 'Gate Control' }
                            ]).map((p, i) => (
                                <div key={i} className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                                    <div className="font-bold text-xs text-blue-300">{p.label}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{p.role}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => startHSVTherapy(herpesType as 'labial' | 'genital')} className={`w-full py-4 rounded-xl font-bold text-lg ${herpesType === 'labial' ? 'bg-red-600' : 'bg-purple-600'}`}>Iniciar Sessão</button>
                    </section>
                )}

                {/* ZOSTER CONTENT */}
                {herpesType === 'zoster' && (
                    <>
                        {/* TABS */}
                        <div className="flex justify-center">
                            <div className="bg-gray-900 p-1 rounded-full border border-gray-700 flex gap-1">
                                <button onClick={() => setActiveTab('body')} className={`px-6 py-2 rounded-full text-sm font-bold ${activeTab === 'body' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Corpo</button>
                                <button onClick={() => setActiveTab('head')} className={`px-6 py-2 rounded-full text-sm font-bold ${activeTab === 'head' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Cabeça</button>
                            </div>
                        </div>

                        {/* Banner Informativo de Protocolo */}
                        <div className="bg-blue-900/40 border-l-4 border-blue-500 p-4 rounded-r-xl animate-in slide-in-from-left duration-300">
                            <div className="flex gap-3">
                                <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-100 text-sm">Como começar o tratamento?</h4>
                                    <p className="text-xs text-blue-200/80 leading-snug mt-1">
                                        Foque primeiro na <strong>Base Imunológica</strong> acima. No mapa de costas, dê prioridade absoluta aos pontos <strong><span className="text-red-400">Vermelhos (Raiz Nervosa)</span></strong> que tratam a dor no nível do nervo. Os pontos <strong><span className="text-blue-400">Azuis (Órgãos)</span></strong> são complementares para fortalecer sua vitalidade.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'body' && (
                            <section className="space-y-8 animate-in fade-in">
                                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400 font-sans"><Shield className="w-5 h-5" /> 1. Base Imunológica</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                                        {PROTOCOL_BASE.map(p => (
                                            <div key={p.id} onClick={() => setViewingPointId(p.id)} className="bg-black/40 p-6 rounded-2xl border border-gray-700 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                                <span className="text-3xl">{p.icon}</span>
                                                <div className="font-bold text-blue-300 text-base mt-2">{p.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-500"><Zap className="w-5 h-5" /> 2. Onde está a dor?</h2>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DERMATOMES.map(d => (
                                                <button key={d.id} onClick={() => setSelectedRegion(d.id)} className={`p-4 rounded-xl border text-center transition-all ${selectedRegion === d.id ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                                    <span className="text-2xl block mb-1">{d.icon}</span>
                                                    <span className="text-xs font-bold">{d.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {activeDermatome && (
                                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/50 space-y-3">
                                                <div className="font-bold text-blue-300 flex items-center gap-2"><Brain className="w-4 h-4" /> Protocolo sugerido:</div>
                                                <p className="text-xs text-gray-400 leading-relaxed">{activeDermatome.description}</p>
                                                <button onClick={() => startTherapy(activeDermatome.id)} className="w-full bg-blue-600 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors mt-2">Iniciar Sessão Interativa</button>
                                            </div>
                                        )}
                                    </div>
                                    <SpineMap
                                        highlightLevel={activeDermatome?.levels[0]}
                                        onPointSelect={setViewingPointId}
                                    />
                                </div>
                            </section>
                        )}

                        {activeTab === 'head' && (
                            <section className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center space-y-6">
                                <h2 className="text-xl font-bold">YNSA Sistêmico (Cabeça)</h2>
                                <p className="text-gray-400 max-w-lg mx-auto">Pontos Ypsilon e Nervos Cranianos que atuam em todo o corpo, reequilibrando os meridianos e estimulando o Vago.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {YNSA_NC.map(p => (
                                        <div key={p.id} onClick={() => setViewingPointId(p.id)} className="bg-black/40 p-6 rounded-2xl border border-gray-700 cursor-pointer hover:border-purple-500">
                                            <span className="text-3xl">{p.icon}</span>
                                            <h3 className="font-bold text-purple-300 mt-2">{p.label}</h3>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            {/* POINT DETAIL MODAL */}
            {viewingPointData && (
                <div className="fixed inset-0 z-[250] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewingPointId(null)}>
                    <div className="bg-gray-800 p-8 rounded-2xl border border-blue-500/50 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-2">{viewingPointData.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{viewingPointData.description}</p>
                        {viewingPointData.image && <img src={viewingPointData.image} className="rounded-xl mb-4 border border-gray-700" />}
                        <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                            <h4 className="font-bold text-blue-300 text-sm mb-1">Instruções:</h4>
                            <p className="text-xs text-gray-300 leading-relaxed">{viewingPointData.instructions}</p>
                        </div>
                        <button onClick={() => setViewingPointId(null)} className="w-full bg-blue-600 mt-6 py-3 rounded-lg font-bold">Entendi</button>
                    </div>
                </div>
            )}
        </div>
    );
};
