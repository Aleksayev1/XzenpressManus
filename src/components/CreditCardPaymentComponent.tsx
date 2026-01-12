import React, { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCardForm } from './ui/StripeCardForm';
import { AlertCircle } from 'lucide-react';

interface CreditCardPaymentComponentProps {
  amount: number;
  currency?: string; // ✅ Adicionado
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

export const CreditCardPaymentComponent: React.FC<CreditCardPaymentComponentProps> = (props) => {
  // Carregar Stripe uma vez
  const stripePromise = useMemo(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    console.log('🔑 Carregando Stripe:', {
      hasKey: !!publishableKey,
      keyPrefix: publishableKey?.substring(0, 7)
    });

    if (!publishableKey || publishableKey === 'undefined') {
      console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY não configurada!');
      return null;
    }

    return loadStripe(publishableKey);
  }, []);

  // Se não tem chave, mostrar erro
  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">
              Stripe não configurado
            </h4>
            <p className="text-sm text-red-700">
              A chave pública do Stripe não foi encontrada.
              Configure VITE_STRIPE_PUBLISHABLE_KEY nas variáveis de ambiente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar formulário dentro do Elements provider
  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm
        {...props}
        currency={props.currency || 'USD'} // ✅ Passando moeda
      />
    </Elements>
  );
};