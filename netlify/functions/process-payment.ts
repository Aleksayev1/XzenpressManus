import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Inicializar Stripe com a SECRET KEY (não a publishable!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

export const handler: Handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { paymentMethodId, amount, currency, description, orderId, customerEmail } = JSON.parse(event.body || '{}');

        console.log('🔍 Dados recebidos:', {
            paymentMethodId: paymentMethodId?.substring(0, 10) + '...',
            amount,
            currency,
            orderId,
            customerEmail
        });

        if (!paymentMethodId || !amount) {
            console.error('❌ Dados inválidos:', { hasPaymentMethod: !!paymentMethodId, amount });
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'invalid_request',
                    message: 'PaymentMethod e amount são obrigatórios'
                }),
            };
        }

        console.log('💳 Processando pagamento:', { amount, currency, orderId });

        // ✅ CRIAR PAYMENT INTENT (API moderna do Stripe)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Converter para centavos
            currency: currency || 'usd',
            payment_method: paymentMethodId,
            confirm: true, // Confirmar imediatamente
            description: description || 'XZenPress Premium',
            receipt_email: customerEmail,
            metadata: {
                orderId: orderId || `order_${Date.now()}`,
                customerEmail: customerEmail || 'N/A',
            },
            return_url: 'https://xzenpress.com/payment-success', // Necessário para alguns métodos
        });

        console.log('✅ Pagamento processado:', {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100
        });

        // Retornar resultado
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                id: paymentIntent.id,
                status: paymentIntent.status === 'succeeded' ? 'approved' : 'pending',
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                orderId: paymentIntent.metadata.orderId,
                card: {
                    brand: paymentIntent.payment_method?.card?.brand || 'unknown',
                    lastFour: paymentIntent.payment_method?.card?.last4 || '0000',
                },
                processedAt: new Date(paymentIntent.created * 1000).toISOString(),
            }),
        };

    } catch (error: any) {
        console.error('❌ Erro completo no pagamento:', {
            type: error.type,
            code: error.code,
            message: error.message,
            decline_code: error.decline_code,
            raw: error.raw
        });

        // Tratar erros específicos do Stripe
        if (error.type === 'StripeCardError') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'card_declined',
                    message: error.message || 'Cartão recusado',
                    decline_code: error.decline_code,
                }),
            };
        }

        if (error.type === 'StripeInvalidRequestError') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'invalid_request',
                    message: error.message || 'Requisição inválida',
                }),
            };
        }

        // Erro genérico
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'payment_failed',
                message: error.message || 'Erro no processamento do pagamento',
            }),
        };
    }
};
