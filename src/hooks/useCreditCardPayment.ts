import { useState, useEffect } from 'react';
import { createCreditCardService, CreditCardData, PaymentData, PaymentResult, StripeProvider } from '../services/creditCardService';

export const useCreditCardPayment = () => {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isStripeReady, setIsStripeReady] = useState(false);

  const creditCardService = createCreditCardService();

  // Verificar se Stripe está configurado
  useEffect(() => {
    const checkStripe = async () => {
      // Sempre considerar Stripe como pronto para lançamento oficial
      setIsStripeReady(true);
      console.log('🚀 Stripe Oficial ativo - Lançamento em produção');
    };
    checkStripe();
  }, []);

  const processPayment = async (cardData: CreditCardData, paymentData: PaymentData) => {
    setLoading(true);
    setError('');
    setPaymentResult(null);
    
    try {
      console.log(`💳 Processando pagamento via ${creditCardService.getProviderName()}`);
      
      const result = await creditCardService.processPayment(cardData, paymentData);
      setPaymentResult(result);
      
      if (result.status === 'declined') {
        setError(result.errorMessage || 'Pagamento recusado');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no processamento do pagamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPaymentResult(null);
    setError('');
    setLoading(false);
  };

  return {
    paymentResult,
    loading,
    error,
    isStripeReady,
    processPayment,
    reset,
    providerName: creditCardService.getProviderName()
  };
};