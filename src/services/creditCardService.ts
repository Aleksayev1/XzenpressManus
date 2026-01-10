export interface CreditCardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResult {
  id: string;
  status: 'approved' | 'declined' | 'pending' | 'error';
  amount: number;
  currency: string;
  orderId: string;
  paymentMethod: string;
  card?: {
    brand: string;
    lastFour: string;
    name: string;
  };
  processedAt: string;
  errorMessage?: string;
}

export interface CreditCardProvider {
  name: string;
  processPayment(cardData: CreditCardData, paymentData: PaymentData): Promise<PaymentResult>;
}

// Implementação para Stripe OFICIAL - ATIVADA
export class StripeProvider implements CreditCardProvider {
  name = '🚀 Stripe Oficial - PRODUÇÃO ATIVA';
  private stripe: any;
  private isInitialized: boolean = false;

  constructor(publishableKey: string) {
    this.initializeStripe(publishableKey);
  }

  private async initializeStripe(publishableKey: string) {
    if (typeof window !== 'undefined') {
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(publishableKey);
      this.isInitialized = true;
      console.log('🎯 Stripe OFICIAL inicializado com sucesso!');
    }
  }

  async processPayment(cardData: CreditCardData, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      console.log('💳 Processando pagamento com Stripe oficial...');

      if (!this.stripe || !this.isInitialized) {
        throw new Error('Stripe ainda não foi inicializado. Aguarde alguns segundos.');
      }

      // Verificar cartão de teste para recusa ANTES de processar
      const cardNumber = cardData.number.replace(/\s/g, '');
      console.log('🔍 Verificando cartão:', cardNumber);

      // Cartões de teste para diferentes cenários
      if (cardNumber === '4000000000000002' || cardNumber === '4000000000000069') {
        console.log('❌ Cartão de teste para recusa detectado');
        return {
          id: `stripe_declined_${Date.now()}`,
          status: 'declined',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          paymentMethod: 'credit_card',
          processedAt: new Date().toISOString(),
          errorMessage: 'Seu cartão foi recusado pelo banco emissor. Código: card_declined'
        };
      }

      // Cartão para teste de limite insuficiente
      if (cardNumber === '4000000000000341') {
        console.log('❌ Cartão de teste para limite insuficiente');
        return {
          id: `stripe_declined_${Date.now()}`,
          status: 'declined',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          paymentMethod: 'credit_card',
          processedAt: new Date().toISOString(),
          errorMessage: 'Limite insuficiente. Entre em contato com seu banco.'
        };
      }

      // Cartão para teste de CVV incorreto
      if (cardNumber === '4000000000000127') {
        console.log('❌ Cartão de teste para CVV incorreto');
        return {
          id: `stripe_declined_${Date.now()}`,
          status: 'declined',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          paymentMethod: 'credit_card',
          processedAt: new Date().toISOString(),
          errorMessage: 'CVV incorreto. Verifique o código de segurança.'
        };
      }

      // Criar PaymentMethod do cartão (API moderna do Stripe)
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardData.number.replace(/\s/g, ''),
          exp_month: parseInt(cardData.expiry.split('/')[0]),
          exp_year: parseInt('20' + cardData.expiry.split('/')[1]),
          cvc: cardData.cvv,
        },
        billing_details: {
          name: cardData.name,
        },
      });

      if (error) {
        console.error('❌ Erro Stripe:', error);
        return {
          id: `stripe_error_${Date.now()}`,
          status: 'declined',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          paymentMethod: 'credit_card',
          processedAt: new Date().toISOString(),
          errorMessage: error.message
        };
      }

      // ✅ PROCESSAR PAGAMENTO REAL VIA NETLIFY FUNCTION
      console.log('🎯 PaymentMethod Stripe criado:', paymentMethod.id);
      console.log('📡 Enviando para backend processar pagamento REAL...');

      // Chamar Netlify Function para processar o charge
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description,
          orderId: paymentData.orderId,
          customerEmail: paymentData.customerEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ Pagamento recusado:', result.message);
        return {
          id: result.id || `stripe_declined_${Date.now()}`,
          status: 'declined',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          paymentMethod: 'credit_card',
          processedAt: new Date().toISOString(),
          errorMessage: result.message || 'Pagamento recusado'
        };
      }

      // ✅ PAGAMENTO APROVADO!
      console.log('✅ Pagamento processado com sucesso!', result.id);
      return {
        id: result.id,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        orderId: result.orderId,
        paymentMethod: 'credit_card',
        card: {
          brand: result.card?.brand || paymentMethod.card?.brand || 'unknown',
          lastFour: result.card?.lastFour || paymentMethod.card?.last4 || '0000',
          name: cardData.name
        },
        processedAt: result.processedAt
      };

    } catch (error) {
      console.error('Erro no pagamento Stripe:', error);
      throw new Error('Falha no processamento do pagamento');
    }
  }
}

// Implementação para PagSeguro
export class PagSeguroProvider implements CreditCardProvider {
  name = 'PagSeguro';

  constructor(token: string, email: string) {
  }

  async processPayment(cardData: CreditCardData, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simular delay e SEMPRE retornar erro para evitar aprovação automática
      await new Promise(resolve => setTimeout(resolve, 2000));

      // SEMPRE retornar erro em modo demonstração
      return {
        id: `mock_demo_${Date.now()}`,
        status: 'declined',
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        paymentMethod: 'credit_card',
        processedAt: new Date().toISOString(),
        errorMessage: 'Modo demonstração ativo - Configure Stripe para processar pagamentos reais'
      };


    } catch (error) {
      console.error('PagSeguro payment error:', error);
      throw new Error('Falha no processamento do pagamento');
    }
  }

  private getCardBrand(number: string): string {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    return 'unknown';
  }
}

// Implementação Mock para desenvolvimento
export class MockCreditCardProvider implements CreditCardProvider {
  name = 'Processamento Seguro (Demonstração)';

  async processPayment(cardData: CreditCardData, paymentData: PaymentData): Promise<PaymentResult> {
    console.log('⚠️ MOCK PAYMENT - NÃO PROCESSAR EM PRODUÇÃO', {
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      cardBrand: this.getCardBrand(cardData.number)
    });

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // APENAS cartões de teste oficiais do Stripe podem ser aprovados
    const cardNumber = cardData.number.replace(/\s/g, '');

    console.log('🔍 Verificando cartão em modo MOCK:', cardNumber);

    // ✅ CARTÕES DE TESTE OFICIAIS STRIPE - PERMITIDOS
    const stripeTestCards = [
      '4242424242424242', // Visa Sucesso
      '5555555555554444', // Mastercard Sucesso
      '378282246310005',  // Amex Sucesso
      '371449635398431',  // Amex Sucesso
      '6011111111111117', // Discover Sucesso
      '3056930009020004', // Diners Club Sucesso
      '3566002020360505'  // JCB Sucesso
    ];

    // ❌ CARTÕES DE TESTE PARA RECUSA
    const stripeDeclinedCards = [
      '4000000000000002', // Generic decline
      '4000000000000069', // Expired card
      '4000000000000127', // Incorrect CVV
      '4000000000000341', // Insufficient funds
      '4000000000009995', // Declined (insufficient funds)
      '4000000000009987', // Lost card
      '4000000000009979'  // Stolen card
    ];

    // Verificar cartão de recusa
    if (stripeDeclinedCards.includes(cardNumber)) {
      console.log('❌ Cartão de teste para RECUSA detectado');
      return {
        id: `mock_declined_${Date.now()}`,
        status: 'declined',
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        paymentMethod: 'credit_card',
        processedAt: new Date().toISOString(),
        errorMessage: this.getDeclineMessage(cardNumber)
      };
    }

    // Verificar cartão de sucesso
    if (stripeTestCards.includes(cardNumber)) {
      console.log('✅ Cartão de teste OFICIAL detectado - Aprovando em MOCK');
      return {
        id: `mock_approved_${Date.now()}`,
        status: 'approved',
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        paymentMethod: 'credit_card',
        card: {
          brand: this.getCardBrand(cardData.number),
          lastFour: cardData.number.slice(-4),
          name: cardData.name
        },
        processedAt: new Date().toISOString()
      };
    }

    // 🚨 QUALQUER OUTRO CARTÃO É RECUSADO EM MODO MOCK
    console.log('🚨 Cartão NÃO É DE TESTE OFICIAL - RECUSANDO por segurança');
    return {
      id: `mock_declined_${Date.now()}`,
      status: 'declined',
      amount: paymentData.amount,
      currency: paymentData.currency,
      orderId: paymentData.orderId,
      paymentMethod: 'credit_card',
      processedAt: new Date().toISOString(),
      errorMessage: '⚠️ Modo Demonstração: Use apenas cartões de teste oficiais do Stripe. Configure sua chave Stripe para aceitar pagamentos reais.'
    };
  }

  private getDeclineMessage(cardNumber: string): string {
    const messages: Record<string, string> = {
      '4000000000000002': 'Cartão recusado pelo banco emissor.',
      '4000000000000069': 'Cartão expirado.',
      '4000000000000127': 'CVV incorreto.',
      '4000000000000341': 'Limite insuficiente.',
      '4000000000009995': 'Fundos insuficientes.',
      '4000000000009987': 'Cartão reportado como perdido.',
      '4000000000009979': 'Cartão reportado como roubado.'
    };
    return messages[cardNumber] || 'Cartão recusado.';
  }

  private getCardBrand(number: string): string {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6(?:011|5)/.test(num)) return 'discover';
    return 'unknown';
  }
}

// Classe principal do serviço de cartão de crédito
export class CreditCardService {
  private provider: CreditCardProvider;

  constructor(provider: CreditCardProvider) {
    this.provider = provider;
  }

  async processPayment(cardData: CreditCardData, paymentData: PaymentData): Promise<PaymentResult> {
    return this.provider.processPayment(cardData, paymentData);
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

// Factory para criar o serviço de cartão baseado na configuração
export function createCreditCardService(): CreditCardService {
  const provider = import.meta.env.VITE_CREDIT_CARD_PROVIDER || 'stripe';

  // DEBUG: Log de TODAS as variáveis de ambiente disponíveis
  console.log('🔍 Variáveis de ambiente disponíveis:', {
    VITE_CREDIT_CARD_PROVIDER: import.meta.env.VITE_CREDIT_CARD_PROVIDER,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...' :
      'UNDEFINED',
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });

  console.log('🔍 Credit Card Provider configurado:', provider);

  switch (provider) {
    case 'stripe':
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      // Log detalhado sobre a chave
      console.log('🔑 Verificando chave Stripe:', {
        exists: !!stripeKey,
        type: typeof stripeKey,
        length: stripeKey?.length,
        prefix: stripeKey?.substring(0, 7)
      });

      if (!stripeKey || stripeKey === 'undefined' || stripeKey.trim() === '') {
        console.error('❌ ERRO CRÍTICO: VITE_STRIPE_PUBLISHABLE_KEY não configurada!');
        console.error('📋 Valor recebido:', stripeKey);
        console.error('🔧 SOLUÇÃO: Configure a chave no Netlify Environment Variables');
        console.error('⚠️ IMPORTANTE: Após configurar, faça um novo deploy para incluir no bundle');

        // FALLBACK TEMPORÁRIO: usando Mock para desenvolvimento
        console.warn('⚠️ Usando Mock Provider como fallback');
        return new CreditCardService(new MockCreditCardProvider());
      }

      console.log('✅ Stripe configurado com chave:', stripeKey.substring(0, 20) + '...');
      return new CreditCardService(new StripeProvider(stripeKey));

    case 'pagseguro':
      const pagSeguroToken = import.meta.env.VITE_PAGSEGURO_TOKEN;
      const pagSeguroEmail = import.meta.env.VITE_PAGSEGURO_EMAIL;
      if (!pagSeguroToken || !pagSeguroEmail) {
        console.warn('PagSeguro credentials not found, using Mock provider');
        return new CreditCardService(new MockCreditCardProvider());
      }
      return new CreditCardService(new PagSeguroProvider(pagSeguroToken, pagSeguroEmail));

    default:
      console.warn('Provider desconhecido, usando Mock provider');
      return new CreditCardService(new MockCreditCardProvider());
  }
}