import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NutrimingSafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NutrimingSafetyModal: React.FC<NutrimingSafetyModalProps> = ({ isOpen, onClose }) => {
    const [canProceed, setCanProceed] = useState(false);
    const [checks, setChecks] = useState({
        notMedical: false,
        safetyLimits: false,
        consultPro: false
    });

    useEffect(() => {
        setCanProceed(checks.notMedical && checks.safetyLimits && checks.consultPro);
    }, [checks]);

    if (!isOpen) return null;

    const handleAccept = () => {
        if (canProceed) {
            localStorage.setItem('nutriming_legal_consent', 'accepted_v1');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border-2 border-yellow-500">

                {/* Header */}
                <div className="bg-yellow-50 p-6 border-b border-yellow-100 flex items-center space-x-4 flex-shrink-0">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Segurança em Primeiro Lugar</h2>
                        <p className="text-yellow-800">Protocolo de Conformidade Global (ANVISA / FDA / EFSA)</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 overflow-y-auto">
                    <p className="text-gray-700 text-lg leading-relaxed">
                        O Nutriming AI é uma ferramenta de <strong>análise educacional</strong>. Para garantir sua saúde e evitar a "extrapolação" de dosagens (sobredose), você precisa confirmar que entende os limites de uso desta plataforma.
                    </p>

                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${checks.notMedical ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
                                {checks.notMedical && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={checks.notMedical}
                                onChange={() => setChecks(prev => ({ ...prev, notMedical: !prev.notMedical }))}
                            />
                            <span className="text-gray-800 font-medium group-hover:text-gray-900">
                                Entendo que o Nutriming <strong>NÃO é um médico</strong> e não faz prescrições clínicas.
                            </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${checks.safetyLimits ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
                                {checks.safetyLimits && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={checks.safetyLimits}
                                onChange={() => setChecks(prev => ({ ...prev, safetyLimits: !prev.safetyLimits }))}
                            />
                            <span className="text-gray-800 font-medium group-hover:text-gray-900">
                                Entendo que os alertas de "Sobredose" são baseados em tabelas públicas (ANVISA/FDA) e servem apenas como referência de segurança.
                            </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${checks.consultPro ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
                                {checks.consultPro && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={checks.consultPro}
                                onChange={() => setChecks(prev => ({ ...prev, consultPro: !prev.consultPro }))}
                            />
                            <span className="text-gray-800 font-medium group-hover:text-gray-900">
                                Comprometo-me a validar qualquer suplementação com um <strong>profissional de saúde</strong> antes de iniciar.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
                    <button
                        onClick={handleAccept}
                        disabled={!canProceed}
                        className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center transition-all ${canProceed
                            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <ShieldCheck className="w-6 h-6 mr-2" />
                        {canProceed ? 'Concordo' : 'Marque as 3 opções'}
                    </button>
                </div>
            </div>
        </div>
    );
};
