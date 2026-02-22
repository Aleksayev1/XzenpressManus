
/**
 * SpineMap Component
 * High-fidelity anatomical visualization for Zoster Neuro-Anatomy.
 * 
 * Features:
 * - Supports Custom Background Image (user-provided) or Vector Fallback
 * - Realistic Vertebrae Rendering (C7-L5)
 * - Scapula and Rib hints for location reference
 * - Interactive Huatuo (Nerve Root) and Back-Shu (Organ) points
 * - Detail Modal for layperson guidance
 */

import React, { useState } from 'react';

interface PointProps {
    cx: number;
    cy: number;
    r: number;
    color: string;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}

const Point: React.FC<PointProps> = ({ cx, cy, r, color, label, onClick, isActive }) => (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
        <circle
            cx={cx}
            cy={cy}
            r={isActive ? r * 1.5 : r}
            fill={isActive ? '#FFD700' : color}
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-300 shadow-lg"
        />
        {/* Glow effect for active point */}
        {isActive && (
            <circle cx={cx} cy={cy} r={r * 2.5} fill={color} opacity="0.3" className="animate-pulse" />
        )}
        <text
            x={cx + 18}
            y={cy + 5}
            fill="white"
            fontSize="12"
            fontWeight={isActive ? 'bold' : '500'}
            style={{ pointerEvents: 'none', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
        >
            {label}
        </text>
    </g>
);

interface SpineMapProps {
    highlightLevel?: string | null;
}

export const SpineMap: React.FC<SpineMapProps> = ({ highlightLevel }) => {
    const [internalActiveLevel, setInternalActiveLevel] = useState<string | null>(null);
    const activeLevel = highlightLevel || internalActiveLevel;

    // Anatomical Data
    const levels = [
        // --- CERVICAL (Face/Neck/Shoulder) ---
        {
            id: 'C4', // Representative for C3-C4
            y: 50,
            huatuo: 'Huatuo C4',
            shu: 'N/A (Cervical)',
            organ: 'Pescoço/Diafragma',
            description: 'Controle do pescoço e respiração alta.',
            location_huatuo: 'Meio do pescoço, lateral à espinha.',
            location_shu: 'Musculatura lateral do pescoço.',
            action: 'Massagem suave para relaxar trapézio superior.'
        },
        {
            id: 'C6', // Representative for C5-C7
            y: 70,
            huatuo: 'Huatuo C6',
            shu: 'N/A (Braquial)',
            organ: 'Ombro/Braço',
            description: 'Raiz do Plexo Braquial. Irradia para o polegar.',
            location_huatuo: 'Base do pescoço.',
            location_shu: 'Topo do ombro.',
            action: 'Pressionar para aliviar dor no braço.'
        },
        // --- THORACIC (Organs/Chest) ---
        {
            id: 'T3',
            y: 90,
            huatuo: 'Huatuo T3',
            shu: 'BL13 (Pulmão)',
            organ: 'Pulmão',
            description: 'Centro da respiração e da tristeza acumulada.',
            location_huatuo: 'Topo das escápulas. Bem na raiz do nervo.',
            location_shu: 'Entre as escápulas, na altura da "espinha" da omoplata.',
            action: 'Massagem circular suave para "soltar" o peito.'
        },
        {
            id: 'T4',
            y: 112,
            huatuo: 'Huatuo T4',
            shu: 'BL14 (Pericárdio)',
            organ: 'Pericárdio',
            description: 'Onde guardamos emoções reprimidas. Alvo do Zoster emocional.',
            location_huatuo: 'Um dedo abaixo de T3.',
            location_shu: 'Linha média das escápulas. Ponto sensível.',
            action: 'Pressione por 10s e solte. Repita 3x.'
        },
        {
            id: 'T5',
            y: 134,
            huatuo: 'Huatuo T5',
            shu: 'BL15 (Coração)',
            organ: 'Coração',
            description: 'A casa da mente e da ansiedade.',
            location_huatuo: 'Abaixo de T4, centro das costas.',
            location_shu: 'Logo abaixo da linha média das escápulas.',
            action: 'Toque leve, respire visualizando luz rosa.'
        },
        {
            id: 'T9',
            y: 222,
            huatuo: 'Huatuo T9',
            shu: 'BL18 (Fígado)',
            organ: 'Fígado',
            description: 'Raiva, estresse e desintoxicação.',
            location_huatuo: 'Abaixo das escápulas (linha do sutiã/coração).',
            location_shu: 'Região muscular mais densa no meio das costas.',
            action: 'Fricção vigorosa para esquentar.'
        },
        // --- LOWER THORACIC (Waist) ---
        {
            id: 'T10', // Representative for T10-T12
            y: 244,
            huatuo: 'Huatuo T10',
            shu: 'BL19 (Vesícula)',
            organ: 'Vesícula/Biliar',
            description: 'Decisões e coragem. Faixa da cintura.',
            location_huatuo: 'Meio das costas inferiores.',
            location_shu: 'Lateral da espinha, zona muscular.',
            action: 'Massagem firme.'
        },
        // --- LUMBAR (Legs) ---
        {
            id: 'L2', // Representative for L2-L3
            y: 300,
            huatuo: 'Huatuo L2',
            shu: 'BL23 (Rim)',
            organ: 'Rim (Vitalidade)',
            description: 'Bateria da vida. Medo e insegurança.',
            location_huatuo: 'Cintura, nível do umbigo (atrás).',
            location_shu: 'Músculo forte da lombar.',
            action: 'Aquecer com a mão ou bolsa térmica.'
        },
        // --- SACRAL (Pelvis) ---
        {
            id: 'S1', // Representative for S1-S5
            y: 350,
            huatuo: 'Huatuo S1',
            shu: 'BL27 (Int. Delgado)',
            organ: 'Sacro/Bexiga',
            description: 'Base da coluna. Questões de sobrevivência/sexualidade.',
            location_huatuo: 'Nos forames sacrais (buraquinhos do sacro).',
            location_shu: 'Sobre o sacro.',
            action: 'Friccionar até esquentar o osso.'
        }
    ];

    const [selectedPoint, setSelectedPoint] = useState<{ level: typeof levels[0], type: 'huatuo' | 'shu' } | null>(null);

    const handlePointClick = (level: typeof levels[0], type: 'huatuo' | 'shu') => {
        setSelectedPoint({ level, type });
    };

    // Helper to render rudimentary vertebrae
    const renderVertebrae = () => {
        const vertebrae = [];
        for (let i = 0; i < 15; i++) {
            vertebrae.push(
                <rect
                    key={`v-${i}`}
                    x="165"
                    y={40 + (i * 22)}
                    width="20"
                    height="18"
                    rx="2"
                    fill="#374151" // Dark gray bone
                    stroke="#4B5563"
                    strokeWidth="1"
                />
            );
        }
        return vertebrae;
    };

    return (
        <div className="flex flex-col items-center relative">
            <div className="flex flex-col items-center bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6">
                    Neuro-Anatomia Funcional
                </h3>

                <div className="relative w-[360px] h-[450px] bg-gray-800 rounded-xl overflow-hidden shadow-inner">
                    {/* Background Image (User Custom) - Fades in/out */}
                    <img
                        src="/mapa_zoster_fundo.jpg"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'; // Hide if not found, showing SVG fallback
                        }}
                        alt="Anatomia Zoster"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity duration-500 z-0"
                    />

                    <svg width="360" height="450" viewBox="0 0 360 450" className="relative z-10 select-none">

                        <defs>
                            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#374151" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#1F2937" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>

                        {/* Fallback Silhouette (Only visible if image bg is transparent or missing) */}
                        <path
                            d="M80 40 Q50 60 40 120 Q35 250 50 380 L310 380 Q325 250 320 120 Q310 60 280 40 Q180 30 80 40"
                            fill="url(#bodyGrad)"
                            className="bg-fallback"
                            style={{ mixBlendMode: 'multiply' }}
                        />

                        {/* Spine Column (Vertebrae) - Semi-transparent context */}
                        <g opacity="0.6">
                            {renderVertebrae()}
                        </g>

                        {/* Scapula Hints */}
                        <path d="M110 80 L 90 90 L 100 160 L 130 140 Z" fill="none" stroke="#6B7280" strokeWidth="2" opacity="0.3" />
                        <path d="M250 80 L 270 90 L 260 160 L 230 140 Z" fill="none" stroke="#6B7280" strokeWidth="2" opacity="0.3" />

                        {/* Rib Hints */}
                        <path d="M165 100 Q100 110 60 130" stroke="#4B5563" strokeWidth="1" opacity="0.3" fill="none" />
                        <path d="M195 100 Q260 110 300 130" stroke="#4B5563" strokeWidth="1" opacity="0.3" fill="none" />
                        <path d="M165 140 Q100 150 60 170" stroke="#4B5563" strokeWidth="1" opacity="0.3" fill="none" />
                        <path d="M195 140 Q260 150 300 170" stroke="#4B5563" strokeWidth="1" opacity="0.3" fill="none" />

                        {/* Treatment Lines (Guides) */}
                        <line x1="175" y1="400" x2="175" y2="40" stroke="#60A5FA" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />

                        {/* Points & Interactions */}
                        {levels.map((level) => (
                            <g key={level.id} onMouseEnter={() => setInternalActiveLevel(level.id)} onMouseLeave={() => setInternalActiveLevel(null)}>

                                {/* Neural Connection Line */}
                                <path
                                    d={`M175 ${level.y} C 200 ${level.y}, 220 ${level.y}, 250 ${level.y}`}
                                    stroke={activeLevel === level.id ? '#FCD34D' : '#4B5563'}
                                    strokeWidth={activeLevel === level.id ? 2 : 1}
                                    strokeDasharray={activeLevel === level.id ? "0" : "2,2"}
                                    fill="none"
                                />

                                {/* Inner Line (Huatuo) - Red - On Nerve Root */}
                                <Point
                                    cx={195} // 0.5 cun
                                    cy={level.y}
                                    r={7}
                                    color="#EF4444"
                                    label={activeLevel === level.id ? 'Huatuo' : ''}
                                    onClick={() => handlePointClick(level, 'huatuo')}
                                    isActive={activeLevel === level.id || selectedPoint?.level.id === level.id}
                                />

                                {/* Outer Line (Shu) - Blue - On Organ Line */}
                                <Point
                                    cx={245} // 1.5 cun
                                    cy={level.y}
                                    r={9}
                                    color="#3B82F6"
                                    label={level.shu.split(' ')[0]}
                                    onClick={() => handlePointClick(level, 'shu')}
                                    isActive={activeLevel === level.id || selectedPoint?.level.id === level.id}
                                />
                            </g>
                        ))}

                        {/* Floating Labels for Context */}
                        <text x="50" y="30" fill="#9CA3AF" fontSize="10" className="opacity-50">Ombro Esq.</text>
                        <text x="310" y="30" fill="#9CA3AF" fontSize="10" textAnchor="end" className="opacity-50">Ombro Dir.</text>
                    </svg>
                </div>

                <div className="mt-4 flex gap-4 text-xs font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Raiz Nervosa (0.5 cun)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Órgão (1.5 cun)</span>
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL (Overlay) */}
            {selectedPoint && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedPoint(null)}>
                    <div
                        className="bg-gray-800 border-l-4 p-6 rounded-r-2xl rounded-l-md shadow-2xl relative w-full max-w-sm max-h-[90vh] overflow-y-auto"
                        style={{ borderColor: selectedPoint.type === 'huatuo' ? '#EF4444' : '#3B82F6' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedPoint(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-opacity-20 ${selectedPoint.type === 'huatuo' ? 'bg-red-500 text-red-400' : 'bg-blue-500 text-blue-400'}`}>
                                {selectedPoint.type === 'huatuo' ? 'Nível Medular' : 'Ponto de Assentimento'}
                            </span>
                            <h4 className="text-2xl font-bold text-white mt-2">
                                {selectedPoint.level.organ}
                            </h4>
                            <p className="text-gray-400 text-sm">{selectedPoint.level.shu} / {selectedPoint.level.huatuo}</p>
                        </div>

                        <div className="space-y-6">
                            {/* Psycho-Emotional Aspect */}
                            <div className="relative">
                                <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">🧠</div>
                                <h5 className="font-semibold text-purple-300 mb-1">Psico-Emocional</h5>
                                <p className="text-sm text-gray-300 italic">"{selectedPoint.level.description}"</p>
                            </div>

                            {/* Location Guide */}
                            <div className="relative">
                                <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">📍</div>
                                <h5 className="font-semibold text-gray-300 mb-1">Localização Exata</h5>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {selectedPoint.type === 'huatuo' ? selectedPoint.level.location_huatuo : selectedPoint.level.location_shu}
                                </p>
                            </div>

                            {/* Action Item */}
                            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
                                <h5 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                    <span>⚡</span> Ação Terapêutica
                                </h5>
                                <p className="text-sm text-white">
                                    {selectedPoint.level.action}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedPoint(null)}
                            className="w-full mt-8 bg-white text-gray-900 hover:bg-gray-200 py-3 rounded-lg font-bold transition-all shadow-lg transform active:scale-95"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
