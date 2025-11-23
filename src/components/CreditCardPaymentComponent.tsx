import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { CreditCardForm } from './ui/CreditCardForm';
import { useCreditCardPayment } from '../hooks/useCreditCardPayment';

interface CreditCardPaymentComponentProps {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

export const CreditCardPaymentComponent: React.FC<CreditCardPaymentComponentProps> = ({
  amount,
  description,
  orderId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { paymentResult, loading, error, isStripeReady, providerName } = useCreditCardPayment();

  useEffect(() => {
    if (paymentResult?.status === 'approved') {
      onPaymentSuccess?.(paymentResult);
    } else if (paymentResult?.status === 'declined' || error) {
      onPaymentError?.(error || paymentResult?.errorMessage || 'Pagamento recusado');
    }
  }, [paymentResult, error]);

  if (paymentResult?.status === 'approved') {
    return (
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-green-800 font-bold text-lg">Pagamento Aprovado!</h3>
            <p className="text-green-700">Cartão processado com sucesso</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Valor:</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pedido:</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Cartão:</span>
              <span className="font-semibold">
                {paymentResult.card?.brand?.toUpperCase()} •••• {paymentResult.card?.lastFour}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-green-600">Aprovado</span>
            </div>
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono text-xs">{paymentResult.id}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentResult?.status === 'declined' || error) {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">Pagamento Recusado</h3>
            <p className="text-red-700">Não foi possível processar o pagamento</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">
            {error || paymentResult?.errorMessage || 'Cartão recusado pelo banco emissor'}
          </p>
        </div>
        <div className="text-sm text-gray-600">
          <p className="mb-2"><strong>Possíveis soluções:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verifique os dados do cartão</li>
            <li>Confirme se há limite disponível</li>
            <li>Tente outro cartão</li>
            <li>Entre em contato com seu banco</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-800 font-bold text-lg flex items-center space-x-2">
          <CreditCard className="w-6 h-6" />
          <span>💳 Stripe Oficial - Pagamento Real</span>
        </h3>
        <div className="text-sm text-blue-700 flex items-center space-x-2">
          {isStripeReady ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <span>Sistema: <span className="font-semibold text-green-600">🚀 Stripe Oficial</span></span>
        </div>
      </div>

      <CreditCardForm
        amount={amount}
        description={description}
        orderId={orderId}
        customerEmail={customerEmail}
        customerName={customerName}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />

      <div className="mt-6 bg-blue-100 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">
          {isStripeReady ? '💳 Stripe Oficial Ativo - Cartões de Teste:' : '💳 Modo Demonstração - Cartões de Teste:'}
        </h5>
        <div className="text-sm text-blue-700 space-y-1">
          {isStripeReady ? (
            <>
              <div><strong>Visa Sucesso:</strong> 4242 4242 4242 4242</div>
              <div><strong>Visa Recusado:</strong> 4000 0000 0000 0002</div>
              <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
            </>
          ) : (
            <>
              <div><strong>Sucesso:</strong> 4111 1111 1111 1111</div>
              <div><strong>Recusado:</strong> 4000 0000 0000 0002</div>
            </>
          )}
          <div><strong>Qualquer data futura e CVV 123</strong></div>
        </div>
      </div>
    </div>
  );
};