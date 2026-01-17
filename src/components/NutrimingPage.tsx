import React from 'react';
import { Clock, Brain, Sparkles, ArrowLeft } from 'lucide-react';

interface NutrimingPageProps {
    onPageChange: (page: string) => void;
}

export const NutrimingPage: React.FC<NutrimingPageProps> = ({ onPageChange }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => onPageChange('home')}
                    className="flex items-center text-gray-600 hover:text-green-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar para Início
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Clock className="w-64 h-64 absolute -top-10 -left-10 animate-pulse" />
                            <Brain className="w-64 h-64 absolute -bottom-10 -right-10 animate-pulse delay-700" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                                    <Sparkles className="w-12 h-12 text-yellow-300" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 font-display">Nutriming AI</h1>
                            <p className="text-xl text-green-100 max-w-2xl mx-auto">
                                Intelgência Artificial para o timing perfeito da sua nutrição e suplementação.
                            </p>
                        </div>
                    </div>

                    <div className="p-12 text-center">
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                <h3 className="text-xl font-semibold text-green-800 mb-2">🚀 Em Breve!</h3>
                                <p className="text-gray-600">
                                    Estamos calibrando os algoritmos de cronobiologia para oferecer recomendações personalizadas
                                    sobre <strong>QUANDO</strong> tomar seus suplementos para máxima absorção.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-6 h-6 text-green-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">BioTiming Preciso</h4>
                                        <p className="text-sm text-gray-500">Sincronia com seu ritmo circadiano.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Brain className="w-6 h-6 text-purple-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Sem Conflitos</h4>
                                        <p className="text-sm text-gray-500">Evite interações negativas entre compostos.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled
                                className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed"
                            >
                                Aguarde o Lançamento
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
