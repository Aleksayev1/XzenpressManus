import { supabase } from './supabaseClient';

/**
 * GDPR Data Service
 * Handle user data export and deletion requests
 */

export interface DataExportResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface DataDeletionResult {
    success: boolean;
    message?: string;
    deletionResults?: any;
    error?: string;
}

/**
 * Export all user data (GDPR Article 20)
 */
export async function exportUserData(): Promise<DataExportResult> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Call Netlify Function to export data
        const response = await fetch('/.netlify/functions/export-user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.error || 'Failed to export data',
            };
        }

        const data = await response.json();

        // Trigger download
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xzenpress-data-${user.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        console.error('Data export error:', error);
        return {
            success: false,
            error: error.message || 'Failed to export data',
        };
    }
}

/**
 * Delete all user data (GDPR Article 17 - Right to be Forgotten)
 * PERMANENT AND IRREVERSIBLE
 */
export async function deleteUserData(
    confirmationCode: string
): Promise<DataDeletionResult> {
    try {
        if (confirmationCode !== 'DELETE_MY_DATA_PERMANENTLY') {
            return {
                success: false,
                error: 'Invalid confirmation code',
            };
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Call Netlify Function to delete data
        const response = await fetch('/.netlify/functions/delete-user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                confirmationCode,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Failed to delete data',
                deletionResults: result.partialDeletion,
            };
        }

        // Sign out user
        await supabase.auth.signOut();

        return {
            success: true,
            message: result.message,
            deletionResults: result.deletionResults,
        };
    } catch (error: any) {
        console.error('Data deletion error:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete data',
        };
    }
}
