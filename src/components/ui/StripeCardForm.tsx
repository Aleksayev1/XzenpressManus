import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface StripeCardFormProps {
    amount: number;
    currency?: string; // ✅ Nova prop
    description: string;
    orderId: string;
    customerEmail?: string;
    customerName?: string;
    onPaymentSuccess?: (paymentData: any) => void;
    onPaymentError?: (error: string) => void;
}

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
    amount,
    currency = 'USD',
    description,
    orderId,
    customerEmail,
    customerName,
    onPaymentSuccess,
    onPaymentError
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Formatter
    const formatAmount = (val: number) => {
        return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: currency
        }).format(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe não foi carregado. Aguarde...');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError('Erro ao carregar formulário de cartão');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            console.log('💳 Criando PaymentMethod...');

            // 1. Criar PaymentMethod
            const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: customerName || 'Cliente XZenPress',
                    email: customerEmail
                }
            });

            if (pmError) {
                // Se for erro do Stripe (validação, etc), repassa mensagem
                throw new Error(pmError.message);
            }

            console.log('✅ PaymentMethod criado:', paymentMethod?.id);

            // 2. Obter userId do contexto de autenticação
            // ⚠️ IMPORTANTE: Precisamos adicionar prop userId ao componente
            const authUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = authUser.id;

            if (!userId) {
                throw new Error('Erro: Usuário não autenticado. Faça login antes de pagar.');
            }

            // 3. Enviar para backend processar
            console.log('📡 Enviando para backend...', { amount, currency, userId });
            const response = await fetch('/.netlify/functions/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod?.id,
                    amount,
                    currency: currency, // ✅ Usando moeda dinâmica
                    description,
                    orderId,
                    customerEmail,
                    customerName,
                    userId // ✅ NOVO: Enviando userId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || 'Erro ao processar pagamento');
            }

            if (result.success === false) {
                throw new Error(result.message || 'Pagamento recusado');
            }

            console.log('✅ Pagamento processado:', result);
            setSuccess(true);
            onPaymentSuccess?.(result);

        } catch (err: any) {
            console.error('❌ Erro no pagamento:', err);
            const errorMessage = err.message || 'Erro desconhecido no pagamento';
            setError(errorMessage);
            onPaymentError?.(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                    Pagamento Aprovado!
                </h3>
                <p className="text-green-700">
                    Bem-vindo ao XZenPress Premium!
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Element Container */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dados do Cartão
                </label>
                <CardElement options={cardElementOptions} />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-900">Erro no Pagamento</h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Amount Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Total a Pagar:</span>
                    <span className="text-2xl font-bold text-gray-900">
                        {formatAmount(amount)}
                    </span>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${!stripe || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processando...</span>
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        <span>Pagar {formatAmount(amount)}</span>
                    </>
                )}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Pagamento 100% seguro via Stripe</span>
            </div>
        </form>
    );
};
