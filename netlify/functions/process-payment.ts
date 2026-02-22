import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 🔍 VERSION MARKER - Para debug
const DEPLOY_VERSION = '2026-01-19-11:42-DB-FIX';

// Inicializar Stripe com a SECRET KEY (não a publishable!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// ✅ Inicializar Supabase com SERVICE ROLE KEY (acesso total ao banco)
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // ⚠️ Adicionar no Netlify!
);

// 🔍 Debug: Verificar se variáveis estão carregadas
console.log('🔍 DEPLOY VERSION:', DEPLOY_VERSION);
console.log('🔍 SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('🔍 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'MISSING');

// Função para calcular data de expiração baseada no plano
function calculateExpirationDate(planId: string): Date | null {
    const now = new Date();

    switch (planId) {
        case 'monthly':
            now.setMonth(now.getMonth() + 1);
            return now;
        case 'annual':
            now.setFullYear(now.getFullYear() + 1);
            return now;
        case 'lifetime':
            return null; // Sem expiração
        default:
            return null;
    }
}

// Extrair plan_id do orderId (formato: XZP-timestamp-PLANID)
function extractPlanId(orderId: string): string {
    const parts = orderId.split('-');
    const planPart = parts[parts.length - 1]?.toLowerCase();

    if (planPart === 'monthly' || planPart === 'annual' || planPart === 'lifetime') {
        return planPart;
    }

    // Fallback: tentar inferir pelo valor
    return 'monthly'; // Default seguro
}

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
        const {
            paymentMethodId,
            amount,
            currency,
            description,
            orderId,
            customerEmail,
            customerName,
            userId // ✅ NOVO: Receber userId do frontend
        } = JSON.parse(event.body || '{}');

        console.log('🔍 Dados recebidos:', {
            paymentMethodId: paymentMethodId?.substring(0, 10) + '...',
            amount,
            currency,
            orderId,
            customerEmail,
            userId
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

        if (!userId) {
            console.error('❌ userId não fornecido');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'invalid_request',
                    message: 'userId é obrigatório para processar pagamento'
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
                user_id: userId
            },
            return_url: 'https://xzenpress.com/payment-success',
        });

        console.log('✅ Pagamento Stripe processado:', {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100
        });

        // ✅ SALVAR NO SUPABASE (se pagamento foi aprovado)
        if (paymentIntent.status === 'succeeded') {
            const planId = extractPlanId(orderId);
            const expiresAt = calculateExpirationDate(planId);

            console.log('💾 Salvando assinatura no Supabase:', {
                userId,
                planId,
                expiresAt: expiresAt?.toISOString() || 'lifetime'
            });

            const { data: subscription, error: dbError } = await supabase
                .from('premium_subscriptions')
                .insert({
                    user_id: userId,
                    stripe_payment_intent_id: paymentIntent.id,
                    stripe_customer_id: paymentIntent.customer as string || null,
                    payment_method: 'stripe',
                    plan_id: planId,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency.toUpperCase(),
                    status: 'active',
                    activated_at: new Date().toISOString(),
                    expires_at: expiresAt?.toISOString() || null,
                    webhook_processed: false, // Will be set to true by webhook
                    metadata: {
                        customerEmail,
                        customerName,
                        orderId
                    }
                })
                .select()
                .single();

            if (dbError) {
                console.error('❌ Erro ao salvar no Supabase:', dbError);
                // ⚠️ Pagamento foi aprovado, mas não salvou no DB
                // Decisão: retornar sucesso mas logar erro para investigação manual
                console.error('🚨 CRÍTICO: Pagamento aprovado mas não registrado no DB!', {
                    paymentIntentId: paymentIntent.id,
                    error: dbError
                });
            } else {
                console.log('✅ Assinatura salva com sucesso:', subscription?.id);
            }
        }

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
