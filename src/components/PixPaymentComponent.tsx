import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { PixPaymentData } from '../services/pixService';
import { usePixPayment } from '../hooks/usePixPayment';
import { PaymentTimer } from './ui/PaymentTimer';
import { QRCodeDisplay } from './ui/QRCodeDisplay';
import { PixCodeCopy } from './ui/PixCodeCopy';

interface PixPaymentComponentProps {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

export const PixPaymentComponent: React.FC<PixPaymentComponentProps> = ({
  amount,
  description,
  orderId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { 
    pixData, 
    loading, 
    error, 
    timeLeft, 
    checkingStatus, 
    generatePayment, 
    providerName 
  } = usePixPayment();

  useEffect(() => {
    const paymentData: PixPaymentData = {
      amount,
      description,
      orderId,
      customerEmail,
      customerName
    };
    generatePayment(paymentData);
  }, []);

  useEffect(() => {
    if (pixData?.status === 'paid') {
      onPaymentSuccess?.(pixData);
    } else if (error) {
      onPaymentError?.(error);
    }
  }, [pixData?.status, error]);

  if (loading) {
    return (
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
          <span className="text-green-800 font-medium">Gerando PIX...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <span className="text-red-800 font-medium">Erro no PIX</span>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => generatePayment({ amount, description, orderId, customerEmail, customerName })}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (pixData?.status === 'paid') {
    return (
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-green-800 font-bold text-lg">Pagamento Confirmado!</h3>
            <p className="text-green-700">PIX recebido com sucesso</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600">
            <div>Valor: <span className="font-semibold">${amount.toFixed(2)}</span></div>
            <div>Pedido: <span className="font-semibold">{orderId}</span></div>
            <div>Status: <span className="font-semibold text-green-600">Pago</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pixData) return null;

  return (
    <div className="bg-green-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-800 font-bold text-lg">Pagamento via PIX</h3>
        <div className="flex items-center space-x-2">
          {checkingStatus && <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />}
          <div className="text-sm text-green-700">
            Provedor: <span className="font-semibold">{providerName}</span>
          </div>
        </div>
      </div>

      <PaymentTimer timeLeft={timeLeft} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QRCodeDisplay qrCodeBase64={pixData.qrCodeBase64} pixKey={pixData.pixKey} />

        <div>
          <h4 className="font-semibold text-green-800 mb-3">
            Ou copie o código PIX:
          </h4>
          <PixCodeCopy pixKey={pixData.pixKey} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h5 className="font-semibold text-blue-800 mb-2">Chave PIX Oficial:</h5>
            <div className="text-sm text-blue-700">
              <div className="font-mono bg-white rounded px-2 py-1 border flex items-center justify-between">
                aleksayevacupress@gmail.com
                <div className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✅ ATIVO
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-2">Detalhes:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Valor: <span className="font-semibold">${amount.toFixed(2)}</span></div>
              <div>Descrição: <span className="font-semibold">{description}</span></div>
              <div>Pedido: <span className="font-semibold">{orderId}</span></div>
              <div>Status: <span className="font-semibold text-yellow-600">Aguardando pagamento</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">Como pagar:</h5>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Abra o app do seu banco</li>
          <li>2. Procure pela opção PIX</li>
          <li>3. Escaneie o QR Code ou cole o código copiado</li>
          <li>4. Ou use a chave PIX: <strong>aleksayevacupress@gmail.com</strong></li>
          <li>5. Confirme o pagamento</li>
          <li>6. Aguarde a confirmação automática</li>
        </ol>
      </div>
    </div>
  );
};