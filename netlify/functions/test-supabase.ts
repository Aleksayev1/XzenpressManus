import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    console.log('🧪 TEST - Iniciando teste de salvamento no Supabase');
    console.log('🧪 SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('🧪 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `SET (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : 'MISSING');

    try {
        const testData = {
            user_id: '688916bb-c6e3-4be3-83cd-6d4b776c122b', // Seu user_id
            plan_id: 'TEST-PLAN',
            amount: 0.01,
            currency: 'BRL',
            status: 'active',
            stripe_payment_intent_id: 'TEST_' + Date.now(),
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        console.log('🧪 Tentando inserir:', JSON.stringify(testData));

        const { data, error } = await supabase
            .from('premium_subscriptions')
            .insert([testData])
            .select();

        if (error) {
            console.error('❌ ERRO ao inserir:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message,
                    details: error
                })
            };
        }

        console.log('✅ Sucesso! Dados inseridos:', data);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Teste bem-sucedido!',
                data: data
            })
        };

    } catch (err: any) {
        console.error('💥 EXCEÇÃO:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: err.message
            })
        };
    }
};
