import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GDPR Compliance: Delete all user data
 * PERMANENT AND IRREVERSIBLE
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
        const { userId, confirmationCode } = JSON.parse(event.body || '{}');

        if (!userId || confirmationCode !== 'DELETE_MY_DATA_PERMANENTLY') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid confirmation code',
                    required: 'DELETE_MY_DATA_PERMANENTLY',
                }),
            };
        }

        console.log('🗑️ Deleting all data for user:', userId);

        // Delete from all tables (in order due to foreign keys)
        const deletionResults = {
            breathingSessions: 0,
            userHistory: 0,
            nutrimingSupplements: 0,
            premiumSubscriptions: 0,
            errorLogs: 0,
        };

        // Delete breathing sessions
        const { count: breathingCount } = await supabase
            .from('breathing_sessions')
            .delete()
            .eq('user_id', userId);
        deletionResults.breathingSessions = breathingCount || 0;

        // Delete user history
        const { count: historyCount } = await supabase
            .from('user_history')
            .delete()
            .eq('user_id', userId);
        deletionResults.userHistory = historyCount || 0;

        // Delete nutriming supplements
        const { count: nutrimingCount } = await supabase
            .from('nutriming_supplements')
            .delete()
            .eq('user_id', userId);
        deletionResults.nutrimingSupplements = nutrimingCount || 0;

        // Delete premium subscriptions
        const { count: subsCount } = await supabase
            .from('premium_subscriptions')
            .delete()
            .eq('user_id', userId);
        deletionResults.premiumSubscriptions = subsCount || 0;

        // Delete error logs
        const { count: errorCount } = await supabase
            .from('error_logs')
            .delete()
            .eq('user_id', userId);
        deletionResults.errorLogs = errorCount || 0;

        // Delete auth user (cascades to remaining data)
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('❌ Error deleting auth user:', authError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Failed to delete user account',
                    details: authError.message,
                    partialDeletion: deletionResults,
                }),
            };
        }

        console.log('✅ User data deleted:', deletionResults);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'All user data has been permanently deleted',
                deletionResults,
            }),
        };
    } catch (error: any) {
        console.error('❌ Data deletion error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to delete user data',
                details: error.message,
            }),
        };
    }
};
