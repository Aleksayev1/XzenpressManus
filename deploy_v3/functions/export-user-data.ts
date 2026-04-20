import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GDPR Compliance: Export all user data
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
        const { userId } = JSON.parse(event.body || '{}');

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing userId' }),
            };
        }

        console.log('📦 Exporting data for user:', userId);

        // Get user data from auth
        const { data: authData } = await supabase.auth.admin.getUserById(userId);

        // Get all user data from various tables
        const [
            premiumSubscriptions,
            breathingSessions,
            userHistory,
            nutrimingSupplements,
        ] = await Promise.all([
            supabase.from('premium_subscriptions').select('*').eq('user_id', userId),
            supabase.from('breathing_sessions').select('*').eq('user_id', userId),
            supabase.from('user_history').select('*').eq('user_id', userId),
            supabase.from('nutriming_supplements').select('*').eq('user_id', userId),
        ]);

        // Compile all data
        const exportData = {
            exportDate: new Date().toISOString(),
            userId,
            personalInfo: {
                email: authData?.user?.email,
                createdAt: authData?.user?.created_at,
                lastSignIn: authData?.user?.last_sign_in_at,
            },
            subscriptions: premiumSubscriptions.data || [],
            breathingSessions: breathingSessions.data || [],
            history: userHistory.data || [],
            nutrimingSupplements: nutrimingSupplements.data || [],
        };

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="xzenpress-data-${userId}.json"`,
            },
            body: JSON.stringify(exportData, null, 2),
        };
    } catch (error: any) {
        console.error('❌ Data export error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to export data',
                details: error.message,
            }),
        };
    }
};
