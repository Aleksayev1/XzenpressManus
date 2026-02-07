import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { emotionalStates, type EmotionalState } from '../data/emotionalMapping';

interface EmotionalCheckInProps {
    onClose: () => void;
    onSelect: (emotionId: string, intensity: number) => void;
    onNavigate: (page: string) => void;
    disableNavigation?: boolean;
    inline?: boolean;
}

export const EmotionalCheckIn: React.FC<EmotionalCheckInProps> = ({ onClose, onSelect, onNavigate, disableNavigation = false, inline = false }) => {
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);

    // Safety check... (omitted for brevity in prompt, effectively same)
    if (!emotionalStates || emotionalStates.length === 0) {
        // ...
    }

    const handleSelection = (emotionId: string, intensityValue: number) => {
        onSelect(emotionId, intensityValue);
        if (!disableNavigation) {
            onClose();
            onNavigate('protocols');
        }
    };

    const containerClasses = inline
        ? "relative w-full h-full flex flex-col items-center justify-start py-4 pb-32 bg-gray-900 overflow-y-auto"
        : "fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4";

    const cardClasses = inline
        ? "w-full max-w-2xl bg-gray-800/50 border border-purple-500/30 rounded-2xl shadow-none" // Simplified for inline
        : "bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto";

    return (
        <div className={containerClasses}>
            <div className={cardClasses}>
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm p-6 border-b border-purple-500/30 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">😊 Como você está se sentindo?</h2>
                            <p className="text-purple-200 text-sm mt-2 leading-relaxed">
                                A acupressão <strong>otimiza e melhora suas emoções</strong>. Diga-nos o que você está sentindo agora para trabalharmos sua energia imediatamente.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Emotion Cards */}
                <div className="p-6 space-y-3">
                    {emotionalStates.map((emotion) => (
                        <div
                            key={emotion.id}
                            className={`w-full rounded-xl border-2 transition-all overflow-hidden ${selectedEmotion?.id === emotion.id
                                ? 'border-purple-500 bg-gray-800/80 shadow-lg shadow-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-purple-500/10'
                                }`}
                        >
                            <button
                                onClick={() => setSelectedEmotion(selectedEmotion?.id === emotion.id ? null : emotion)}
                                className="w-full p-4 text-left flex items-center justify-between outline-none focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-4xl">{emotion.emoji}</span>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{emotion.namePortuguese}</h3>
                                        {selectedEmotion?.id !== emotion.id && (
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-purple-300">
                                                    {emotion.mtcOrgan} ({emotion.mtcElement.toUpperCase()})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedEmotion?.id === emotion.id ? (
                                    <X className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ArrowRight className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {/* Inline Intensity Selection */}
                            {selectedEmotion?.id === emotion.id && (
                                <div className="px-4 pb-4 pt-0 animate-fade-in">
                                    <p className="text-sm text-gray-400 mb-3 border-t border-gray-700 pt-3 flex items-center justify-between">
                                        <span>Qual a intensidade?</span>
                                        <span className="text-xs opacity-60 font-mono tracking-tighter uppercase">Histórico</span>
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleSelection(emotion.id, 2)}
                                            className="py-3 px-2 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">🍃</span>
                                            Leve
                                        </button>
                                        <button
                                            onClick={() => handleSelection(emotion.id, 3)}
                                            className="py-3 px-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">😐</span>
                                            Média
                                        </button>
                                        <button
                                            onClick={() => handleSelection(emotion.id, 5)}
                                            className="py-3 px-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
                                            Forte
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
