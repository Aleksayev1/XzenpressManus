/**
 * Service para notificações automáticas do Nutriming AI
 * Agenda lembretes nos horários:
 * - Manhã: 8h
 * - Almoço: 13h
 * - Noite: 19h
 */

export interface ScheduledNotification {
    id: string;
    time: string; // HH:MM
    title: string;
    body: string;
    timing: 'morning' | 'with-meal' | 'night';
}

export const NutrimingNotificationService = {
    /**
     * Horários padrão para notificações
     */
    SCHEDULES: {
        'empty-stomach': '07:30',
        morning: '08:30',
        'with-meal': '13:00',
        afternoon: '16:00',
        evening: '19:00',
        night: '22:00'
    },

    /**
     * Verificar se notificações estão habilitadas
     */
    async checkPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('⚠️ Navegador não suporta notificações');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    /**
     * Mostrar notificação imediata (para teste)
     */
    async showNotification(title: string, body: string, icon?: string) {
        const hasPermission = await this.checkPermission();
        if (!hasPermission) return false;

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body,
                icon: icon || '/Logo Xzenpress oficial.png',
                badge: '/Logo Xzenpress oficial.png',
                tag: 'nutriming-reminder',
                requireInteraction: false
            });
            return true;
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
            return false;
        }
    },

    /**
     * Agendar notificações para os horários do dia
     */
    async scheduleNotifications(supplements: Array<{ name: string, timing: string }>) {
        const hasPermission = await this.checkPermission();
        if (!hasPermission) {
            console.warn('⚠️ Permissão de notificação não concedida');
            return false;
        }

        // Agrupar suplementos por horário
        const supplementsByTiming: Record<string, string[]> = {
            'empty-stomach': [],
            morning: [],
            'with-meal': [],
            afternoon: [],
            evening: [],
            night: [],
            anytime: []
        };

        supplements.forEach(sup => {
            let timing = sup.timing as keyof typeof supplementsByTiming;
            // Fallback for legacy keys or safe defaults
            if (!supplementsByTiming[timing]) {
                timing = 'morning';
            }
            supplementsByTiming[timing].push(sup.name);
        });

        // Preparar notificações
        const notifications: ScheduledNotification[] = [];

        if (supplementsByTiming['empty-stomach'].length > 0) {
            notifications.push({
                id: 'empty-stomach',
                time: this.SCHEDULES['empty-stomach'],
                title: '⚡ Em Jejum: Hora de absorção máxima!',
                body: `${supplementsByTiming['empty-stomach'].join(', ')}`,
                timing: 'morning' // Using morning icon context
            });
        }

        if (supplementsByTiming.morning.length > 0) {
            notifications.push({
                id: 'morning',
                time: this.SCHEDULES.morning,
                title: '☀️ Bom dia! Suplementos da manhã',
                body: `${supplementsByTiming.morning.join(', ')}`,
                timing: 'morning'
            });
        }

        if (supplementsByTiming['with-meal'].length > 0) {
            notifications.push({
                id: 'meal',
                time: this.SCHEDULES['with-meal'],
                title: '🍽️ Almoço/Refeição: Potencialize a absorção',
                body: `${supplementsByTiming['with-meal'].join(', ')}`,
                timing: 'with-meal'
            });
        }

        if (supplementsByTiming.afternoon.length > 0) {
            notifications.push({
                id: 'afternoon',
                time: this.SCHEDULES.afternoon,
                title: '🌅 Tarde: Hora do reforço',
                body: `${supplementsByTiming.afternoon.join(', ')}`,
                timing: 'with-meal'
            });
        }

        if (supplementsByTiming.evening.length > 0) {
            notifications.push({
                id: 'evening',
                time: this.SCHEDULES.evening,
                title: '🌙 Noite: Preparando para descansar',
                body: `${supplementsByTiming.evening.join(', ')}`,
                timing: 'night'
            });
        }

        if (supplementsByTiming.night.length > 0) {
            notifications.push({
                id: 'night',
                time: this.SCHEDULES.night,
                title: '🛌 Hora de dormir: Recuperação noturna',
                body: `${supplementsByTiming.night.join(', ')}`,
                timing: 'night'
            });
        }

        // Enviar para Service Worker
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.active?.postMessage({
                type: 'SCHEDULE_NOTIFICATIONS',
                notifications: notifications
            });

            console.log('✅ Notificações agendadas:', notifications.length);
            return true;
        } catch (error) {
            console.error('❌ Erro ao agendar notificações:', error);
            return false;
        }
    },

    /**
     * Cancelar todas as notificações agendadas
     */
    async cancelAllNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.active?.postMessage({
                type: 'CANCEL_NOTIFICATIONS'
            });
            console.log('✅ Notificações canceladas');
            return true;
        } catch (error) {
            console.error('❌ Erro ao cancelar notificações:', error);
            return false;
        }
    },

    /**
     * Calcular próximos horários de notificação
     */
    getNextNotificationTimes(): Record<string, Date> {
        const now = new Date();
        const today = new Date(now);

        const createTimeToday = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const time = new Date(today);
            time.setHours(hours, minutes, 0, 0);

            // Se já passou, agendar para amanhã
            if (time < now) {
                time.setDate(time.getDate() + 1);
            }

            return time;
        };

        const times: Record<string, Date> = {};
        for (const [key, value] of Object.entries(this.SCHEDULES)) {
            times[key] = createTimeToday(value);
        }

        return times;
    }
};
