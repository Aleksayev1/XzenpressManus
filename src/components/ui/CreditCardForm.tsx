import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useCreditCardPayment } from '../../hooks/useCreditCardPayment';

interface CreditCardFormProps {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  amount,
  description,
  orderId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<CardData>>({});

  // ✅ USAR O HOOK REAL DE PAGAMENTO
  const { processPayment: processStripePayment } = useCreditCardPayment();

  // Formatação do número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Formatação da data de expiração
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Detectar bandeira do cartão
  const getCardBrand = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6(?:011|5)/.test(num)) return 'discover';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(num)) return 'jcb';
    return 'unknown';
  };

  // Algoritmo de Luhn - Validação matemática REAL de cartão
  const validateLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validações PROFISSIONAIS
  const validateCard = () => {
    const newErrors: Partial<CardData> = {};

    // 1. VALIDAR NÚMERO DO CARTÃO COM ALGORITMO DE LUHN
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.number = 'Número do cartão inválido';
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.number = 'O número do cartão deve conter apenas dígitos';
    } else if (!validateLuhn(cardNumber)) {
      newErrors.number = 'Número do cartão inválido (falha na verificação)';
    }

    // 2. VALIDAR NOME - mínimo 3 caracteres, sem números
    const name = cardData.name.trim();
    if (!name) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (/\d/.test(name)) {
      newErrors.name = 'Nome não pode conter números';
    }

    // 3. VALIDAR DATA DE EXPIRAÇÃO - Máximo 10 anos no futuro
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Data inválida (MM/AA)';
    } else {
      const [month, year] = cardData.expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const maxYear = (currentYear + 10) % 100; // Máximo 10 anos no futuro

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = 'Mês inválido (1-12)';
      } else if (parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Cartão expirado';
      } else if (parseInt(year) > maxYear && parseInt(year) < currentYear) {
        // Verificar se o ano está muito no futuro (considera virada de século)
        newErrors.expiry = 'Data de validade muito distante (máx 10 anos)';
      }
    }

    // 4. VALIDAR CVV
    if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
      newErrors.cvv = 'CVV inválido (3-4 dígitos)';
    } else if (!/^\d+$/.test(cardData.cvv)) {
      newErrors.cvv = 'CVV deve conter apenas números';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    } else if (field === 'name') {
      formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const processPayment = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);

    try {
      console.log('🔄 Iniciando processamento de pagamento REAL via Stripe...');

      // ✅ PROCESSAR PAGAMENTO REAL COM STRIPE
      const result = await processStripePayment(
        {
          number: cardData.number,
          name: cardData.name,
          expiry: cardData.expiry,
          cvv: cardData.cvv
        },
        {
          amount,
          currency: 'usd',
          description,
          orderId,
          customerEmail,
          customerName
        }
      );

      console.log('✅ Resultado do pagamento:', result);

      if (result.status === 'approved') {
        onPaymentSuccess?.(result);
      } else {
        const errorMsg = result.errorMessage || 'Pagamento recusado';
        onPaymentError?.(errorMsg);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no processamento do pagamento';
      console.error('❌ Pagamento não processado:', errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardBrand = getCardBrand(cardData.number);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Dados do Cartão</h3>
        <div className="flex items-center space-x-1 text-green-600 text-sm">
          <Lock className="w-4 h-4" />
          <span>Stripe Secure</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Número do Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número do Cartão *
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {cardBrand !== 'unknown' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center justify-center text-white shadow-md ${cardBrand === 'visa' ? 'bg-blue-700' :
                  cardBrand === 'mastercard' ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                    cardBrand === 'amex' ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                      cardBrand === 'discover' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gray-600'
                  }`}>
                  {cardBrand === 'visa' ? '💳 Visa' :
                    cardBrand === 'mastercard' ? '💳 Mastercard' :
                      cardBrand === 'amex' ? '💎 Amex' :
                        cardBrand === 'discover' ? '🔍 Discover' : '💳'}
                </div>
              </div>
            )}
          </div>
          {errors.number && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.number}
            </p>
          )}
        </div>

        {/* Nome no Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome no Cartão *
          </label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="NOME COMO NO CARTÃO"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Data de Expiração e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validade *
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/AA"
              maxLength={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.expiry ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.expiry}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              maxLength={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.cvv}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumo do Pagamento */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Resumo do Pagamento</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Produto:</span>
            <span className="font-medium">{description}</span>
          </div>
          <div className="flex justify-between">
            <span>Valor:</span>
            <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pedido:</span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
        </div>
      </div>

      {/* Botão de Pagamento */}
      <button
        onClick={processPayment}
        disabled={isProcessing}
        className={`w-full mt-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${isProcessing
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          } text-white`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processando...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pagar ${amount.toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Cartões de Teste */}
      <div className="mt-6 bg-blue-100 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">
          💳 Cartões de Teste Stripe Oficial:
        </h5>
        <div className="text-sm text-blue-700 space-y-1">
          <div><strong>✅ Visa Sucesso:</strong> 4242 4242 4242 4242</div>
          <div><strong>❌ Visa Recusado:</strong> 4000 0000 0000 0002</div>
          <div><strong>💰 Limite Insuficiente:</strong> 4000 0000 0000 0341</div>
          <div><strong>🔒 CVV Incorreto:</strong> 4000 0000 0000 0127</div>
          <div><strong>💳 Mastercard:</strong> 5555 5555 5555 4444</div>
          <div><strong>💎 Amex:</strong> 3782 822463 10005</div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
            <strong>📅 Data:</strong> Qualquer futura (ex: 12/25) • <strong>🔒 CVV:</strong> 123
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
            <strong>🧪 Teste de Recusa:</strong> Use 4000 0000 0000 0002 para simular cartão recusado
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Seguro</span>
        </div>
        <div className="flex items-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>SSL 256-bit</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Criptografado</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🛡️</span>
          <span>Dados Protegidos</span>
        </div>
      </div>
    </div>
  );
};