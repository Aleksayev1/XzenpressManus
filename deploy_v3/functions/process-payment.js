const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { paymentMethodId, amount, currency, description, orderId, customerEmail } = JSON.parse(event.body);

        console.log('🔥 Processing payment:', { amount, currency, orderId });

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe usa centavos
            currency: currency.toLowerCase(),
            payment_method: paymentMethodId,
            description: description || 'XZenPress Premium Payment',
            receipt_email: customerEmail,
            metadata: {
                orderId: orderId,
                platform: 'xzenpress-web'
            },
            confirm: true,
            return_url: `${process.env.URL || 'https://xzenpress.com'}/payment-success`
        });

        console.log('✅ Payment Intent created:', paymentIntent.id);

        // Check payment status
        if (paymentIntent.status === 'succeeded') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    id: paymentIntent.id,
                    status: 'approved',
                    amount: amount,
                    currency: currency,
                    orderId: orderId,
                    card: {
                        brand: paymentIntent.charges?.data[0]?.payment_method_details?.card?.brand || 'unknown',
                        lastFour: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4 || '0000'
                    },
                    processedAt: new Date().toISOString()
                })
            };
        } else if (paymentIntent.status === 'requires_action') {
            // 3D Secure ou similar
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    requiresAction: true,
                    clientSecret: paymentIntent.client_secret,
                    message: 'Additional authentication required'
                })
            };
        } else {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Payment failed',
                    status: paymentIntent.status
                })
            };
        }

    } catch (error) {
        console.error('❌ Payment error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message || 'Payment processing failed',
                error: error.type || 'payment_error'
            })
        };
    }
};
