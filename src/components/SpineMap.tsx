
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
    labelAlign?: 'start' | 'end';
}

const Point: React.FC<PointProps> = ({ cx, cy, r, color, label, onClick, isActive, labelAlign = 'start' }) => (
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
            x={labelAlign === 'start' ? cx + 18 : cx - 18}
            y={cy + 5}
            fill="white"
            fontSize="12"
            fontWeight={isActive ? 'bold' : '500'}
            textAnchor={labelAlign}
            style={{ pointerEvents: 'none', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
        >
            {label}
        </text>
    </g>
);

interface SpineMapProps {
    highlightLevel?: string | null;
    onPointSelect?: (pointId: string) => void;
}

export const SpineMap: React.FC<SpineMapProps> = ({ highlightLevel, onPointSelect }) => {
    const [internalActiveLevel, setInternalActiveLevel] = useState<string | null>(null);
    const activeLevel = highlightLevel || internalActiveLevel;

    // Anatomical Data with Database IDs
    const levels = [
        // --- CERVICAL (Face/Neck/Shoulder) ---
        {
            id: 'C4',
            huatuoId: 'huatuo-c4',
            shuId: null,
            y: 50,
            huatuo: 'Huatuo C4',
            shu: 'N/A',
            organ: 'Pescoço/Diafragma'
        },
        {
            id: 'C6',
            huatuoId: 'huatuo-c6',
            shuId: null,
            y: 70,
            huatuo: 'Huatuo C6',
            shu: 'N/A',
            organ: 'Ombro/Braço'
        },
        // --- THORACIC (Organs/Chest) ---
        {
            id: 'T3',
            huatuoId: 'huatuo-t3',
            shuId: 'bl13',
            y: 90,
            huatuo: 'Huatuo T3',
            shu: 'BL13 (Pulmão)',
            organ: 'Pulmão'
        },
        {
            id: 'T4',
            huatuoId: 'huatuo-t4',
            shuId: 'bl14',
            y: 112,
            huatuo: 'Huatuo T4',
            shu: 'BL14 (Pericárdio)',
            organ: 'Pericárdio'
        },
        {
            id: 'T5',
            huatuoId: 'huatuo-t5',
            shuId: 'bl15',
            y: 134,
            huatuo: 'Huatuo T5',
            shu: 'BL15 (Coração)',
            organ: 'Coração'
        },
        {
            id: 'T9',
            huatuoId: 'huatuo-t9',
            shuId: 'bl18',
            y: 222,
            huatuo: 'Huatuo T9',
            shu: 'BL18 (Fígado)',
            organ: 'Fígado'
        },
        // --- LOWER THORACIC (Waist) ---
        {
            id: 'T10',
            huatuoId: 'huatuo-t10',
            shuId: 'bl19',
            y: 244,
            huatuo: 'Huatuo T10',
            shu: 'BL19 (Vesícula)',
            organ: 'Vesícula/Biliar'
        },
        // --- LUMBAR (Legs) ---
        {
            id: 'L2',
            huatuoId: 'huatuo-l2',
            shuId: 'bl23',
            y: 300,
            huatuo: 'Huatuo L2',
            shu: 'BL23 (Rim)',
            organ: 'Rim'
        },
        // --- SACRAL (Pelvis) ---
        {
            id: 'S1',
            huatuoId: 'huatuo-s1',
            shuId: 'bl27',
            y: 350,
            huatuo: 'Huatuo S1',
            shu: 'BL27 (Int. Delgado)',
            organ: 'Sacro/Bexiga'
        }
    ];

    const handlePointClick = (pointId: string | null) => {
        if (pointId && onPointSelect) {
            onPointSelect(pointId);
        }
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
                                    onClick={() => handlePointClick(level.huatuoId)}
                                    isActive={activeLevel === level.id}
                                    labelAlign="end"
                                />

                                {/* Outer Line (Shu) - Blue - On Organ Line */}
                                <Point
                                    cx={245} // 1.5 cun
                                    cy={level.y}
                                    r={9}
                                    color="#3B82F6"
                                    label={level.shu === 'N/A' || level.shu.includes('N/A') ? '' : level.shu.split(' ')[0]}
                                    onClick={() => handlePointClick(level.shuId)}
                                    isActive={activeLevel === level.id}
                                    labelAlign="start"
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
        </div>
    );
};
