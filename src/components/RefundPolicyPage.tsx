import React from 'react';
import { ArrowLeft, Euro, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface RefundPolicyPageProps {
    onPageChange: (page: string) => void;
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onPageChange }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                    onClick={() => onPageChange('home')}
                    className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group"
                >
                    <div className="p-2 bg-white rounded-full shadow-md group-hover:shadow-lg transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Voltar ao Início</span>
                </button>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                            <Euro className="w-12 h-12" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-center mb-4">Política de Reembolso</h1>
                    <p className="text-green-100 text-center text-lg">
                        Garantia de satisfação - 7 dias para reembolso total
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
                        <div className="flex items-start">
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-green-900 mb-2">
                                    ✓ Garantia de 7 Dias - Teste sem risco!
                                </h3>
                                <p className="text-green-800">
                                    Se você não ficar completamente satisfeito com o XZenPress Premium,
                                    reembolsamos 100% do seu pagamento dentro de 7 dias da compra.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Período de Garantia</h2>
                        <p className="text-gray-700 mb-6">
                            Você tem <strong>7 (sete) dias corridos</strong> a partir da data da compra para solicitar reembolso total.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Solicitar Reembolso</h2>
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <p className="mb-4">Envie um email para: <a href="mailto:contato@xzenpress.com" className="text-green-600 hover:underline font-bold">contato@xzenpress.com</a></p>
                            <p className="text-sm text-gray-600">
                                Processamos reembolsos em até <strong>5 dias úteis</strong>.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Direitos do Consumidor</h2>
                        <p className="text-gray-700 mb-4">
                            Esta política está em conformidade com o Código de Defesa do Consumidor (CDC) brasileiro e regulamentações internacionais.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            <span>Sua satisfação é nossa prioridade. Teste sem riscos!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
