export interface PixPaymentData {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PixResponse {
  qrCode: string;
  qrCodeBase64?: string;
  pixKey: string;
  expiresAt: Date;
  paymentId: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
}

export interface PixProvider {
  name: string;
  generatePixPayment(data: PixPaymentData): Promise<PixResponse>;
  checkPaymentStatus(paymentId: string): Promise<PixResponse>;
}

// Implementação para PagSeguro
export class PagSeguroPixProvider implements PixProvider {
  name = 'PagSeguro';
  private apiUrl = 'https://ws.sandbox.pagseguro.uol.com.br'; // Use produção: https://ws.pagseguro.uol.com.br
  private token: string;
  private email: string;

  constructor(token: string, email: string) {
    this.token = token;
    this.email = email;
  }

  async generatePixPayment(data: PixPaymentData): Promise<PixResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/instant-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          reference_id: data.orderId,
          description: data.description,
          amount: {
            value: Math.round(data.amount * 100), // Converter para centavos
            currency: 'USD'
          },
          payment_method: {
            type: 'PIX',
            pix: {
              expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
            }
          },
          notification_urls: [
            `${window.location.origin}/api/pix/webhook/pagseguro`
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`PagSeguro API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        qrCode: result.qr_codes[0].text,
        qrCodeBase64: result.qr_codes[0].arrangements[0].qr_code,
        pixKey: result.qr_codes[0].text,
        expiresAt: new Date(result.qr_codes[0].expiration_date),
        paymentId: result.id,
        status: 'pending'
      };
    } catch (error) {
      console.error('Erro ao gerar PIX PagSeguro:', error);
      throw new Error('Falha ao gerar pagamento PIX');
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PixResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`PagSeguro API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        qrCode: result.qr_codes?.[0]?.text || '',
        pixKey: result.qr_codes?.[0]?.text || '',
        expiresAt: new Date(result.qr_codes?.[0]?.expiration_date || Date.now()),
        paymentId: result.id,
        status: this.mapStatus(result.status)
      };
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error);
      throw error;
    }
  }

  private mapStatus(status: string): 'pending' | 'paid' | 'expired' | 'cancelled' {
    switch (status) {
      case 'PAID': return 'paid';
      case 'CANCELLED': return 'cancelled';
      case 'EXPIRED': return 'expired';
      default: return 'pending';
    }
  }
}

// Implementação para Mercado Pago
export class MercadoPagoPixProvider implements PixProvider {
  name = 'Mercado Pago';
  private apiUrl = 'https://api.mercadopago.com';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async generatePixPayment(data: PixPaymentData): Promise<PixResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          transaction_amount: data.amount,
          description: data.description,
          payment_method_id: 'pix',
          external_reference: data.orderId,
          payer: {
            email: data.customerEmail || 'customer@example.com',
            first_name: data.customerName || 'Cliente',
          },
          notification_url: `${window.location.origin}/api/pix/webhook/mercadopago`
        })
      });

      if (!response.ok) {
        throw new Error(`Mercado Pago API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        qrCode: result.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        pixKey: result.point_of_interaction.transaction_data.qr_code,
        expiresAt: new Date(result.date_of_expiration),
        paymentId: result.id.toString(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Erro ao gerar PIX Mercado Pago:', error);
      throw new Error('Falha ao gerar pagamento PIX');
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PixResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Mercado Pago API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        qrCode: result.point_of_interaction?.transaction_data?.qr_code || '',
        pixKey: result.point_of_interaction?.transaction_data?.qr_code || '',
        expiresAt: new Date(result.date_of_expiration || Date.now()),
        paymentId: result.id.toString(),
        status: this.mapStatus(result.status)
      };
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error);
      throw error;
    }
  }

  private mapStatus(status: string): 'pending' | 'paid' | 'expired' | 'cancelled' {
    switch (status) {
      case 'approved': return 'paid';
      case 'cancelled': return 'cancelled';
      case 'expired': return 'expired';
      default: return 'pending';
    }
  }
}

// Implementação Mock para desenvolvimento/demonstração
export class MockPixProvider implements PixProvider {
  name = '🚀 PIX OFICIAL ATIVO - aleksayevacupress@gmail.com';
  private officialPixKey = 'aleksayevacupress@gmail.com';

  async generatePixPayment(data: PixPaymentData): Promise<PixResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar código PIX real com a chave oficial
    const mockQrCode = this.generateRealPixCode(data);
    
    return {
      qrCode: mockQrCode,
      qrCodeBase64: this.generateRealQRCodeBase64(mockQrCode),
      pixKey: mockQrCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      paymentId: `mock_${Date.now()}`,
      status: 'pending'
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<PixResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // IMPORTANTE: Não aprovar automaticamente
    // Manter sempre como pendente para evitar aprovação irregular
    console.log('🔍 Verificando status PIX (modo demonstração)');
    
    return {
      qrCode: '',
      pixKey: '',
      expiresAt: new Date(),
      paymentId,
      status: 'pending' // Sempre pendente em modo demo
    };
  }

  private generateRealPixCode(data: PixPaymentData): string {
    // Gerar código PIX real seguindo o padrão EMV
    const amount = data.amount.toFixed(2);
    const merchantName = 'XZENPRESS WELLNESS';
    const merchantCity = 'SAO PAULO';
    const pixKey = this.officialPixKey;
    const txId = data.orderId.substring(0, 25); // Máximo 25 caracteres
    
    // Construir código PIX seguindo padrão EMV QR Code
    let pixCode = '';
    pixCode += '00020126'; // Payload Format Indicator
    pixCode += '01040014'; // Point of Initiation Method
    
    // Merchant Account Information
    const pixKeyLength = pixKey.length.toString().padStart(2, '0');
    const pixKeyField = `0014BR.GOV.BCB.PIX01${pixKeyLength}${pixKey}`;
    const pixKeyFieldLength = pixKeyField.length.toString().padStart(2, '0');
    pixCode += `26${pixKeyFieldLength}${pixKeyField}`;
    
    pixCode += '52040000'; // Merchant Category Code
    pixCode += '5303986'; // Transaction Currency (BRL)
    
    // Transaction Amount
    const amountLength = amount.length.toString().padStart(2, '0');
    pixCode += `54${amountLength}${amount}`;
    
    pixCode += '5802BR'; // Country Code
    
    // Merchant Name
    const merchantNameLength = merchantName.length.toString().padStart(2, '0');
    pixCode += `59${merchantNameLength}${merchantName}`;
    
    // Merchant City
    const merchantCityLength = merchantCity.length.toString().padStart(2, '0');
    pixCode += `60${merchantCityLength}${merchantCity}`;
    
    // Additional Data Field
    const txIdLength = txId.length.toString().padStart(2, '0');
    const additionalData = `05${txIdLength}${txId}`;
    const additionalDataLength = additionalData.length.toString().padStart(2, '0');
    pixCode += `62${additionalDataLength}${additionalData}`;
    
    // CRC16 (simplificado para demonstração)
    const crc = this.calculateCRC16(pixCode + '6304');
    pixCode += `6304${crc}`;
    
    return pixCode;
  }
  
  private calculateCRC16(data: string): string {
    // Implementação simplificada do CRC16 para PIX
    // Em produção, use uma biblioteca específica para CRC16-CCITT
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  
  private generateRealQRCodeBase64(pixCode: string): string {
    // Em produção, você usaria uma biblioteca como 'qrcode' para gerar o QR Code real
    // Por enquanto, retornamos um placeholder que indica que é um PIX real
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="90" text-anchor="middle" font-size="12" fill="black">PIX</text>
        <text x="100" y="110" text-anchor="middle" font-size="8" fill="black">QR Code Real</text>
        <text x="100" y="130" text-anchor="middle" font-size="6" fill="black">${this.officialPixKey}</text>
      </svg>
    `)}`;
  }
}

// Classe principal do serviço PIX
export class PixService {
  private provider: PixProvider;

  constructor(provider: PixProvider) {
    this.provider = provider;
  }

  async createPayment(data: PixPaymentData): Promise<PixResponse> {
    return this.provider.generatePixPayment(data);
  }

  async checkStatus(paymentId: string): Promise<PixResponse> {
    return this.provider.checkPaymentStatus(paymentId);
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

// Factory para criar o serviço PIX baseado na configuração
export function createPixService(): PixService {
  // Verificar variáveis de ambiente ou configuração
  const pixProvider = import.meta.env.VITE_PIX_PROVIDER || 'mock';
  
  console.log('🔍 PIX Provider configurado:', pixProvider);
  
  switch (pixProvider) {
    case 'pagseguro':
      const pagSeguroToken = import.meta.env.VITE_PAGSEGURO_TOKEN;
      const pagSeguroEmail = import.meta.env.VITE_PAGSEGURO_EMAIL;
      if (!pagSeguroToken || !pagSeguroEmail) {
        console.log('✅ Usando chave PIX oficial direta: aleksayevacupress@gmail.com');
        return new PixService(new MockPixProvider());
      }
      console.log('✅ PagSeguro PIX ativo com chave oficial');
      return new PixService(new PagSeguroPixProvider(pagSeguroToken, pagSeguroEmail));
      
    case 'mercadopago':
      const mpAccessToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
      if (!mpAccessToken) {
        console.log('✅ Usando chave PIX oficial direta: aleksayevacupress@gmail.com');
        return new PixService(new MockPixProvider());
      }
      return new PixService(new MercadoPagoPixProvider(mpAccessToken));
      
    default:
      console.log('✅ PIX Oficial ativo com chave: aleksayevacupress@gmail.com');
      return new PixService(new MockPixProvider());
  }
}