/**
 * Error Monitoring and Logging Service
 * Centralized error tracking and monitoring
 */

import { getBaseApiUrl } from '../lib/api';

interface ErrorLog {
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    context?: any;
    userId?: string;
    url?: string;
    userAgent?: string;
}

class MonitoringService {
    private static instance: MonitoringService;
    private errorLogs: ErrorLog[] = [];
    private maxLogs = 100;

    private constructor() {
        this.setupGlobalErrorHandlers();
    }

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    /**
     * Setup global error handlers
     */
    private setupGlobalErrorHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.logError('Uncaught Error', {
                message: event.error?.message || event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise,
            });
        });
    }

    /**
     * Log an error
     */
    logError(message: string, context?: any, userId?: string) {
        const errorLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message,
            context,
            userId,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        this.errorLogs.push(errorLog);
        this.trimLogs();

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('[ERROR]', message, context);
        }

        // Send to monitoring service (e.g., Sentry)
        this.sendToMonitoring(errorLog);

        // Store in localStorage for debugging
        this.persistLogs();
    }

    /**
     * Log a warning
     */
    logWarning(message: string, context?: any) {
        const warningLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            level: 'warning',
            message,
            context,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        this.errorLogs.push(warningLog);
        this.trimLogs();

        if (import.meta.env.DEV) {
            console.warn('[WARNING]', message, context);
        }

        this.persistLogs();
    }

    /**
     * Log info
     */
    logInfo(message: string, context?: any) {
        const infoLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message,
            context,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        this.errorLogs.push(infoLog);
        this.trimLogs();

        if (import.meta.env.DEV) {
            console.info('[INFO]', message, context);
        }

        this.persistLogs();
    }

    /**
     * Send error to monitoring service
     */
    private sendToMonitoring(errorLog: ErrorLog) {
        // TODO: Integrate with Sentry or similar service
        // For now, just log to console in production
        if (!import.meta.env.DEV) {
            console.error('[PRODUCTION ERROR]', errorLog);
        }

        // Optional: Send to Netlify Function for server-side logging
        if (errorLog.level === 'error') {
            this.sendToServer(errorLog);
        }
    }

    /**
     * Send error to server for persistence
     */
    private async sendToServer(errorLog: ErrorLog) {
        try {
            await fetch(`${getBaseApiUrl()}/.netlify/functions/log-error`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorLog),
            });
        } catch (error) {
            console.error('Failed to send error to server:', error);
        }
    }

    /**
     * Trim logs to max size
     */
    private trimLogs() {
        if (this.errorLogs.length > this.maxLogs) {
            this.errorLogs = this.errorLogs.slice(-this.maxLogs);
        }
    }

    /**
     * Persist logs to localStorage
     */
    private persistLogs() {
        try {
            localStorage.setItem('xzenpress_error_logs', JSON.stringify(this.errorLogs));
        } catch (error) {
            console.error('Failed to persist logs:', error);
        }
    }

    /**
     * Get all logs
     */
    getLogs(): ErrorLog[] {
        return [...this.errorLogs];
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.errorLogs = [];
        localStorage.removeItem('xzenpress_error_logs');
    }

    /**
     * Track page view
     */
    trackPageView(pageName: string) {
        this.logInfo('Page View', { pageName });
    }

    /**
     * Track user action
     */
    trackAction(action: string, context?: any) {
        this.logInfo('User Action', { action, ...context });
    }

    /**
     * Track performance metric
     */
    trackPerformance(metric: string, value: number) {
        this.logInfo('Performance', { metric, value });
    }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Helper functions
export const logError = (message: string, context?: any, userId?: string) =>
    monitoring.logError(message, context, userId);

export const logWarning = (message: string, context?: any) =>
    monitoring.logWarning(message, context);

export const logInfo = (message: string, context?: any) =>
    monitoring.logInfo(message, context);

export const trackPageView = (pageName: string) =>
    monitoring.trackPageView(pageName);

export const trackAction = (action: string, context?: any) =>
    monitoring.trackAction(action, context);

export const trackPerformance = (metric: string, value: number) =>
    monitoring.trackPerformance(metric, value);
