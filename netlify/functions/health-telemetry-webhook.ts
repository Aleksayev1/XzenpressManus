import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HEALTH_WEBHOOK_SECRET = process.env.HEALTH_WEBHOOK_SECRET;

export const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, terra-signature, x-vital-signature',
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
        const bodyText = event.body || '';
        const payload = JSON.parse(bodyText);

        // Determine provider based on headers or payload shape
        const terraSignatureHeader = event.headers['terra-signature'] || event.headers['Terra-Signature'];
        const vitalSignatureHeader = event.headers['x-vital-signature'] || event.headers['X-Vital-Signature'];
        const provider = terraSignatureHeader ? 'terra' : (vitalSignatureHeader ? 'vital' : 'unknown');

        // Signature Verification
        if (HEALTH_WEBHOOK_SECRET) {
            let isValid = false;
            if (provider === 'terra' && terraSignatureHeader) {
                // Terra signature: t=1234567,v1=abcde...
                const parts = terraSignatureHeader.split(',');
                const tPart = parts.find(p => p.startsWith('t='));
                const vPart = parts.find(p => p.startsWith('v1='));
                if (tPart && vPart) {
                    const timestamp = tPart.substring(2);
                    const signature = vPart.substring(3);
                    const computedSignature = crypto
                        .createHmac('sha256', HEALTH_WEBHOOK_SECRET)
                        .update(`${timestamp}.${bodyText}`)
                        .digest('hex');
                    isValid = (signature === computedSignature);
                }
            } else if (provider === 'vital' && vitalSignatureHeader) {
                const computedSignature = crypto
                    .createHmac('sha256', HEALTH_WEBHOOK_SECRET)
                    .update(bodyText)
                    .digest('hex');
                isValid = (vitalSignatureHeader === computedSignature);
            }

            if (!isValid) {
                console.error('❌ Webhook verification failed. Invalid signature.');
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Unauthorized: Invalid signature verification' }),
                };
            }
        } else {
            console.warn('⚠️ HEALTH_WEBHOOK_SECRET is not configured. Skipping signature verification.');
        }

        // Parse user identifier & biometric metrics
        let userId: string | null = null;
        let vfcValue: number | null = null;
        let rhrValue: number | null = null;
        let sleepValue: string | null = null;
        let deviceId: string | null = null;
        let isDisconnectionEvent = false;

        if (provider === 'terra') {
            const user = payload.user || {};
            userId = user.reference_id || user.external_user_id || null;
            deviceId = payload.device_data?.name || payload.device_data?.model || 'Wearable';
            
            const eventType = payload.type;

            if (eventType === 'connection_deleted' || eventType === 'user_disconnected') {
                isDisconnectionEvent = true;
            } else if (eventType === 'sleep') {
                const sleepData = payload.sleep_data || {};
                vfcValue = sleepData.hrv_data?.summary?.rmssd_ms || sleepData.hrv_data?.summary?.sdnn_ms || null;
                rhrValue = sleepData.heart_rate_data?.summary?.resting_hr_bpm || null;
                const durationSeconds = sleepData.sleep_durations_data?.asleep_seconds || 0;
                if (durationSeconds > 0) {
                    const h = Math.floor(durationSeconds / 3600);
                    const m = Math.floor((durationSeconds % 3600) / 60);
                    sleepValue = `${h}h ${m}m`;
                }
            } else if (eventType === 'body') {
                const bodyData = payload.body_data || {};
                vfcValue = bodyData.heart_rate_data?.summary?.hrv_rmssd_ms || null;
                rhrValue = bodyData.heart_rate_data?.summary?.resting_hr_bpm || null;
            }
        } else if (provider === 'vital' || provider === 'unknown') {
            // Vital / Standard payload
            userId = payload.client_user_id || payload.user_key || payload.userId || null;
            deviceId = payload.device || 'Wearable';
            
            if (payload.event_type === 'user.disconnected') {
                isDisconnectionEvent = true;
            } else {
                vfcValue = payload.vfc || payload.hrv || payload.data?.hrv || null;
                rhrValue = payload.rhr || payload.resting_hr || payload.data?.resting_heart_rate || null;
                sleepValue = payload.sleep || payload.data?.sleep_duration || null;
            }
        }

        if (!userId) {
            console.error('❌ User ID could not be identified in webhook payload');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Bad Request: Missing user identifier mapping' }),
            };
        }

        console.log(`📦 Webhook received for user ${userId}. Provider: ${provider}. Disconnect: ${isDisconnectionEvent}`);

        if (isDisconnectionEvent) {
            // Update connection status
            await supabase
                .from('xzen_user_telemetry_status')
                .upsert({
                    user_id: userId,
                    sync_status: 'disconnected',
                    last_sync_at: new Date().toISOString(),
                    provider
                });
            
            console.log(`🔌 Device disconnected for user: ${userId}`);
        } else {
            // Write biometric data if available
            if (vfcValue !== null || rhrValue !== null || sleepValue !== null) {
                // 1. Insert time-series entry
                await supabase
                    .from('xzen_user_telemetry')
                    .insert({
                        user_id: userId,
                        wearable_vfc: vfcValue || 55, // Fallback default
                        wearable_rhr: rhrValue,
                        wearable_sleep: sleepValue,
                        active_device_id: deviceId,
                        provider
                    });

                // 2. Update connection status to active
                await supabase
                    .from('xzen_user_telemetry_status')
                    .upsert({
                        user_id: userId,
                        sync_status: 'active',
                        last_sync_at: new Date().toISOString(),
                        active_device_id: deviceId,
                        provider
                    });

                console.log(`📈 Biometric data synchronized in Supabase for user: ${userId}. VFC: ${vfcValue}ms, RHR: ${rhrValue}bpm`);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (err: any) {
        console.error('❌ Webhook error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: err.message }),
        };
    }
};
