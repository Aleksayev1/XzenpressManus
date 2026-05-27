import Stripe from 'stripe';
import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para admin access
);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Netlify Function: Stripe Webhook Handler
 * Processa eventos do Stripe de forma assíncrona
 */
export const handler: Handler = async (event: HandlerEvent) => {
    // Apenas aceitar POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    const sig = event.headers['stripe-signature'];

    if (!sig) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No signature' }),
        };
    }

    let stripeEvent: Stripe.Event;

    try {
        // Verificar assinatura do webhook
        stripeEvent = stripe.webhooks.constructEvent(
            event.body!,
            sig,
            WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        };
    }

    // Logar evento recebido
    console.log('✅ Webhook recebido:', stripeEvent.type);

    try {
        // Salvar log do webhook
        await logWebhookEvent(stripeEvent);

        // Processar evento baseado no tipo
        switch (stripeEvent.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(stripeEvent.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent);
                break;

            case 'charge.refunded':
                await handleRefund(stripeEvent.data.object as Stripe.Charge);
                break;

            case 'charge.dispute.created':
                await handleChargeback(stripeEvent.data.object as Stripe.Dispute);
                break;

            default:
                console.log(`⚠️ Evento não tratado: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true }),
        };
    } catch (error: any) {
        console.error('❌ Erro ao processar webhook:', error);

        // Atualizar log com erro
        await updateWebhookLog(stripeEvent.id, false, error.message);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

/**
 * Logar evento de webhook no banco
 */
async function logWebhookEvent(event: Stripe.Event) {
    const paymentIntent = event.data.object as any;

    await supabase.from('stripe_webhook_logs').insert({
        event_id: event.id,
        event_type: event.type,
        payment_intent_id: paymentIntent.id,
        customer_id: paymentIntent.customer,
        amount: paymentIntent.amount ? paymentIntent.amount / 100 : null,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        raw_event: event,
    });
}

/**
 * Atualizar status de processamento do log
 */
async function updateWebhookLog(eventId: string, processed: boolean, errorMessage?: string) {
    await supabase
        .from('stripe_webhook_logs')
        .update({
            processed,
            error_message: errorMessage,
            processed_at: new Date().toISOString(),
        })
        .eq('event_id', eventId);
}

/**
 * Processar pagamento bem-sucedido
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    console.log('💰 Pagamento confirmado:', paymentIntent.id);

    // Verificar se já foi processado (idempotência)
    const { data: existing } = await supabase
        .from('premium_subscriptions')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .eq('webhook_processed', true)
        .single();

    if (existing) {
        console.log('⚠️ Webhook já processado anteriormente');
        return;
    }

    // Buscar ou criar assinatura
    const { data: subscription, error: fetchError } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar assinatura: ${fetchError.message}`);
    }

    const now = new Date();
    const expiresAt = new Date(now);

    // Determinar data de expiração baseado no valor
    const amount = paymentIntent.amount / 100;
    if (amount >= 500) {
        // Plano vitalício
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    } else {
        // Plano anual
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    if (subscription) {
        // Atualizar existente
        await supabase
            .from('premium_subscriptions')
            .update({
                status: 'active',
                webhook_processed: true,
                last_webhook_at: now.toISOString(),
                webhook_events: [...(subscription.webhook_events || []), {
                    type: 'payment_intent.succeeded',
                    timestamp: now.toISOString(),
                }],
            })
            .eq('id', subscription.id);
    } else {
        // Criar nova (fallback caso não exista)
        const metadata = paymentIntent.metadata || {};
        const userId = metadata.user_id || metadata.userId; // Suporte a ambos os formatos

        if (!userId) {
            console.error('❌ Erro: Webhook recebido sem user_id nos metadados', paymentIntent.id);
            return;
        }

        await supabase.from('premium_subscriptions').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer as string,
            status: 'active',
            payment_method: 'stripe',
            amount: amount,
            currency: paymentIntent.currency.toUpperCase(),
            activated_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            webhook_processed: true,
            last_webhook_at: now.toISOString(),
            webhook_events: [{
                type: 'payment_intent.succeeded',
                timestamp: now.toISOString(),
            }],
        });
    }

    console.log('✅ Assinatura ativada via webhook');
}

/**
 * Processar falha de pagamento
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('❌ Pagamento falhou:', paymentIntent.id);

    await supabase
        .from('premium_subscriptions')
        .update({
            status: 'payment_failed',
            webhook_processed: true,
            last_webhook_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);
}

/**
 * Processar reembolso
 */
async function handleRefund(charge: Stripe.Charge) {
    console.log('💸 Reembolso processado:', charge.id);

    const paymentIntentId = charge.payment_intent as string;

    await supabase
        .from('premium_subscriptions')
        .update({
            status: 'refunded',
            refund_amount: charge.amount_refunded / 100,
            refunded_at: new Date().toISOString(),
            webhook_processed: true,
            last_webhook_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntentId);
}

/**
 * Processar chargeback/dispute
 */
async function handleChargeback(dispute: Stripe.Dispute) {
    console.log('⚠️ Chargeback detectado:', dispute.id);

    const paymentIntentId = dispute.payment_intent as string;

    await supabase
        .from('premium_subscriptions')
        .update({
            status: 'disputed',
            webhook_processed: true,
            last_webhook_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntentId);
}
