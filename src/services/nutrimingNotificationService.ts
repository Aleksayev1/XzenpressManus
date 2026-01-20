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
        morning: '08:00',
        'with-meal': '13:00',
        night: '19:00'
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
                icon: icon || '/logo192.png',
                badge: '/logo192.png',
                vibrate: [200, 100, 200],
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
            morning: [],
            'with-meal': [],
            night: [],
            anytime: []
        };

        supplements.forEach(sup => {
            const timing = sup.timing as keyof typeof supplementsByTiming;
            if (supplementsByTiming[timing]) {
                supplementsByTiming[timing].push(sup.name);
            }
        });

        // Preparar notificações
        const notifications: ScheduledNotification[] = [];

        if (supplementsByTiming.morning.length > 0) {
            notifications.push({
                id: 'morning',
                time: this.SCHEDULES.morning,
                title: '☀️ Bom dia! Hora dos suplementos da manhã',
                body: `${supplementsByTiming.morning.join(', ')}`,
                timing: 'morning'
            });
        }

        if (supplementsByTiming['with-meal'].length > 0) {
            notifications.push({
                id: 'meal',
                time: this.SCHEDULES['with-meal'],
                title: '🍽️ Hora do almoço! Lembre-se dos suplementos',
                body: `${supplementsByTiming['with-meal'].join(', ')}`,
                timing: 'with-meal'
            });
        }

        if (supplementsByTiming.night.length > 0) {
            notifications.push({
                id: 'night',
                time: this.SCHEDULES.night,
                title: '🌙 Boa noite! Hora dos suplementos noturnos',
                body: `${supplementsByTiming.night.length} (${supplementsByTiming.night.join(', ')})`,
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
    getNextNotificationTimes(): { morning: Date, meal: Date, night: Date } {
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

        return {
            morning: createTimeToday(this.SCHEDULES.morning),
            meal: createTimeToday(this.SCHEDULES['with-meal']),
            night: createTimeToday(this.SCHEDULES.night)
        };
    }
};
