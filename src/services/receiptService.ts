/**
 * Receipt Service
 * Handles receipt generation and download
 */

import { getBaseApiUrl } from '../lib/api';

export interface ReceiptData {
    subscriptionId: string;
}

/**
 * Generate and download receipt as PDF
 */
export async function downloadReceipt(subscriptionId: string): Promise<void> {
    try {
        // Open receipt in new window for printing/saving as PDF
        const receiptURL = `${getBaseApiUrl()}/.netlify/functions/generate-receipt?subscriptionId=${subscriptionId}`;

        const receiptWindow = window.open(receiptURL, '_blank');

        if (!receiptWindow) {
            throw new Error('Pop-up bloqueado. Por favor, permita pop-ups para baixar o recibo.');
        }

        // Auto-print after load (user can save as PDF)
        receiptWindow.onload = () => {
            setTimeout(() => {
                receiptWindow.print();
            }, 500);
        };
    } catch (error) {
        console.error('Error downloading receipt:', error);
        throw error;
    }
}

/**
 * Get receipt HTML (for preview)
 */
export async function getReceiptHTML(subscriptionId: string): Promise<string> {
    try {
        const response = await fetch(
            `${getBaseApiUrl()}/.netlify/functions/generate-receipt?subscriptionId=${subscriptionId}`
        );

        if (!response.ok) {
            throw new Error('Failed to generate receipt');
        }

        return await response.text();
    } catch (error) {
        console.error('Error getting receipt:', error);
        throw error;
    }
}

/**
 * Email receipt to user
 * Note: This requires email service integration (e.g., SendGrid)
 */
export async function emailReceipt(subscriptionId: string): Promise<boolean> {
    try {
        // TODO: Implement email sending via Netlify Function
        // For now, just download
        await downloadReceipt(subscriptionId);
        return true;
    } catch (error) {
        console.error('Error emailing receipt:', error);
        return false;
    }
}
