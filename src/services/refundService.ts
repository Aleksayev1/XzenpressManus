import { supabase } from './supabaseClient';
import { getBaseApiUrl } from '../lib/api';

export interface RefundRequest {
    subscriptionId: string;
    reason?: string;
    amount?: number; // Optional: for partial refunds
}

export interface RefundResult {
    success: boolean;
    refund_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    message?: string;
    error?: string;
    daysSinceActivation?: number;
}

/**
 * Request a refund for a Premium subscription
 * CDC Compliance: 7-day guarantee window
 */
export async function requestRefund(
    request: RefundRequest
): Promise<RefundResult> {
    try {
        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Call Netlify Function to process refund
        const response = await fetch(`${getBaseApiUrl()}/.netlify/functions/process-refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                subscriptionId: request.subscriptionId,
                reason: request.reason,
                amount: request.amount,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Failed to process refund',
                daysSinceActivation: result.daysSinceActivation,
            };
        }

        return result;
    } catch (error) {
        console.error('Refund request error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
}

/**
 * Get refund eligibility for a subscription
 */
export async function checkRefundEligibility(
    subscriptionId: string
): Promise<{
    eligible: boolean;
    reason?: string;
    daysRemaining?: number;
}> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                eligible: false,
                reason: 'Not authenticated',
            };
        }

        // Get subscription
        const { data: subscription, error } = await supabase
            .from('premium_subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', user.id)
            .single();

        if (error || !subscription) {
            return {
                eligible: false,
                reason: 'Subscription not found',
            };
        }

        // Check if already refunded
        if (subscription.status === 'refunded') {
            return {
                eligible: false,
                reason: 'Already refunded',
            };
        }

        // Check 7-day window
        const activatedAt = new Date(subscription.activated_at);
        const now = new Date();
        const daysSinceActivation = Math.floor(
            (now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        const daysRemaining = 7 - daysSinceActivation;

        if (daysRemaining <= 0) {
            return {
                eligible: false,
                reason: 'Refund period expired (7 days)',
                daysRemaining: 0,
            };
        }

        return {
            eligible: true,
            daysRemaining,
        };
    } catch (error) {
        console.error('Eligibility check error:', error);
        return {
            eligible: false,
            reason: 'Error checking eligibility',
        };
    }
}
