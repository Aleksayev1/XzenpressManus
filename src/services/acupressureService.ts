import { supabase } from '../lib/supabase';
import { AcupressurePoint } from '../types';
import { acupressurePoints as staticPoints } from '../data/points/index';

export const acupressureService = {
    /**
     * Fetches all acupressure points.
     * IMPROVED STRATEGY: Tries Supabase first. If it fails (table missing/offline), falls back to static file.
     * This prevents the app from breaking during the migration phase.
     */
    async getAllPoints(): Promise<AcupressurePoint[]> {
        // Usar apenas dados estáticos (sensoryPoints file does not exist)
        return staticPoints;
    },

    async getPointsByCategory(category: string): Promise<AcupressurePoint[]> {
        const allPoints = await this.getAllPoints();
        if (category === 'all') return allPoints;
        return allPoints.filter(p =>
            p.category === category || p.additionalCategories?.includes(category)
        );
    }
};
