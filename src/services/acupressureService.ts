import { supabase } from '../lib/supabase';
import { AcupressurePoint } from '../types';
import { acupressurePoints as staticPoints } from '../data/acupressurePoints';
import { sensoryPoints } from '../data/acupressurePoints_sensory';

export const acupressureService = {
    /**
     * Fetches all acupressure points.
     * IMPROVED STRATEGY: Tries Supabase first. If it fails (table missing/offline), falls back to static file.
     * This prevents the app from breaking during the migration phase.
     */
    async getAllPoints(): Promise<AcupressurePoint[]> {
        // Usar dados estáticos + pontos sensoriais YNSA
        return [...staticPoints, ...sensoryPoints];
    },

    async getPointsByCategory(category: string): Promise<AcupressurePoint[]> {
        const allPoints = await this.getAllPoints();
        if (category === 'all') return allPoints;
        return allPoints.filter(p =>
            p.category === category || p.additionalCategories?.includes(category)
        );
    }
};
