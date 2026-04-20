import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Log errors to database for monitoring
 */
export const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        const errorLog = JSON.parse(event.body || '{}');

        // Store in Supabase (optional - create error_logs table if needed)
        // For now, just log to console
        console.error('[CLIENT ERROR]', {
            timestamp: errorLog.timestamp,
            level: errorLog.level,
            message: errorLog.message,
            context: errorLog.context,
            userId: errorLog.userId,
            url: errorLog.url,
            userAgent: errorLog.userAgent,
        });

        // TODO: Store in database table 'error_logs'
        // const { error } = await supabase.from('error_logs').insert(errorLog);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (error: any) {
        console.error('Error logging error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to log error' }),
        };
    }
};
