import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { emotionalStates, type EmotionalState } from '../data/emotionalMapping';
import { useNavigate } from 'react-router-dom';

interface EmotionalCheckInProps {
    onClose: () => void;
    onSelect: (emotionId: string, intensity: number) => void;
}

export const EmotionalCheckIn: React.FC<EmotionalCheckInProps> = ({ onClose, onSelect }) => {
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
    const [intensity, setIntensity] = useState<number>(3);
    const navigate = useNavigate();

    // Safety check: ensure emotional States is loaded
    if (!emotionalStates || emotionalStates.length === 0) {
        console.error('EmotionalCheckIn: emotionalStates not loaded');
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">⚠️ Erro ao carregar</h2>
                    <p className="text-gray-300 mb-6">Não foi possível carregar as opções emocionais. Por favor, recarregue a página.</p>
                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    const handleContinue = () => {
        if (selectedEmotion) {
            onSelect(selectedEmotion.id, intensity);

            // Redireciona para protocolo recomendado
            if (selectedEmotion.recommendedProtocol) {
                navigate(`/jornadas`);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm p-6 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">😊 Como você está se sentindo?</h2>
                            <p className="text-purple-200 text-sm mt-1">Escolha a emoção que melhor descreve seu estado atual</p>
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
                        <button
                            key={emotion.id}
                            onClick={() => setSelectedEmotion(emotion)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedEmotion?.id === emotion.id
                                ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-purple-500/10'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-4xl">{emotion.emoji}</span>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{emotion.namePortuguese}</h3>
                                        <p className="text-gray-400 text-sm">{emotion.description}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-purple-300">
                                                {emotion.mtcOrgan} ({emotion.mtcElement.toUpperCase()})
                                            </span>
                                            <span className="text-xs text-gray-500">• {emotion.globalPrevalence}% global</span>
                                        </div>
                                    </div>
                                </div>
                                {selectedEmotion?.id === emotion.id && (
                                    <div className="text-purple-400">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Intensity Slider (shows when emotion selected) */}
                {selectedEmotion && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-700 pt-6">
                        <div>
                            <label className="text-white font-medium block mb-3">
                                Intensidade: <span className="text-purple-400">{intensity}/5</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-400 text-sm">Leve</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <span className="text-gray-400 text-sm">Forte</span>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>⭐</span>
                                <span>⭐⭐</span>
                                <span>⭐⭐⭐</span>
                                <span>⭐⭐⭐⭐</span>
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2"
                        >
                            <span>Continuar para Protocolo Personalizado</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
