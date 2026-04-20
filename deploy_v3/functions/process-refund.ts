import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Netlify Function: Process Refund
 * Handles refund requests with CDC compliance (7-day guarantee)
 */
export const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

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
            userId,
            subscriptionId,
            reason,
            amount, // Optional: partial refund
        } = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!userId || !subscriptionId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: userId, subscriptionId',
                }),
            };
        }

        console.log('🔄 Processing refund request:', {
            userId,
            subscriptionId,
            reason,
        });

        // 1. Get subscription details
        const { data: subscription, error: subError } = await supabase
            .from('premium_subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', userId)
            .single();

        if (subError || !subscription) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Subscription not found',
                }),
            };
        }

        // 2. Check if already refunded
        if (subscription.status === 'refunded') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'This subscription has already been refunded',
                }),
            };
        }

        // 3. Validate 7-day window (CDC compliance)
        const activatedAt = new Date(subscription.activated_at);
        const now = new Date();
        const daysSinceActivation = Math.floor(
            (now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivation > 7) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Refund period expired. Refunds are only available within 7 days of purchase (CDC).',
                    daysSinceActivation,
                }),
            };
        }

        // 4. Check if payment_intent_id exists
        if (!subscription.stripe_payment_intent_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'No payment intent found for this subscription',
                }),
            };
        }

        // 5. Get PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(
            subscription.stripe_payment_intent_id
        );

        if (!paymentIntent.charges?.data[0]?.id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'No charge found for this payment',
                }),
            };
        }

        // 6. Process refund via Stripe
        const refundAmount = amount
            ? Math.round(amount * 100) // Partial refund
            : undefined; // Full refund

        const refund = await stripe.refunds.create({
            charge: paymentIntent.charges.data[0].id,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
                user_id: userId,
                subscription_id: subscriptionId,
                reason: reason || 'Customer request',
            },
        });

        console.log('✅ Refund processed:', refund.id);

        // 7. Update database
        const refundedAmount = refund.amount / 100;
        const { error: updateError } = await supabase
            .from('premium_subscriptions')
            .update({
                status: 'refunded',
                refund_amount: refundedAmount,
                refund_reason: reason || 'Customer request',
                refunded_at: new Date().toISOString(),
            })
            .eq('id', subscriptionId);

        if (updateError) {
            console.error('❌ Error updating database:', updateError);
            // Refund was processed but DB update failed
            // Log for manual intervention
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Refund processed but database update failed',
                    refund_id: refund.id,
                }),
            };
        }

        // 8. Send confirmation email (optional - implement later)
        // await sendRefundConfirmationEmail(userId, refundedAmount);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                refund_id: refund.id,
                amount: refundedAmount,
                currency: subscription.currency,
                status: refund.status,
                message: 'Refund processed successfully. Amount will be credited to your account within 5-10 business days.',
            }),
        };
    } catch (error: any) {
        console.error('❌ Refund processing error:', error);

        // Handle Stripe errors
        if (error.type === 'StripeCardError') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message,
                }),
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error processing refund',
                details: error.message,
            }),
        };
    }
};
