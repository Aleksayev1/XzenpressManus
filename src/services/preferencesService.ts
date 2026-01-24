import { supabase } from '../lib/supabase';

export interface UserPreferences {
    stressLevel: 'low' | 'medium' | 'high';
    sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
    mainConcerns: string[];
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    sessionDuration: number;
    reminderFrequency: 'none' | 'daily' | 'twice' | 'custom';
    preferredColors: string[];
    soundPreferences: string[];
    breathingPace: 'slow' | 'normal' | 'fast';
}

export const PreferencesService = {
    async getUserPreferences(userId: string): Promise<UserPreferences | null> {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            // Transform snake_case to camelCase
            return {
                stressLevel: data.stress_level,
                sleepQuality: data.sleep_quality,
                mainConcerns: data.main_concerns || [],
                preferredTime: data.preferred_time,
                experienceLevel: data.experience_level,
                goals: data.goals || [],
                sessionDuration: data.session_duration,
                reminderFrequency: data.reminder_frequency,
                preferredColors: data.preferred_colors || [],
                soundPreferences: data.sound_preferences || [],
                breathingPace: data.breathing_pace
            };
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return null;
        }
    },

    async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
        if (!supabase) return false;
        try {
            const dbData = {
                user_id: userId,
                stress_level: preferences.stressLevel,
                sleep_quality: preferences.sleepQuality,
                main_concerns: preferences.mainConcerns,
                preferred_time: preferences.preferredTime,
                experience_level: preferences.experienceLevel,
                goals: preferences.goals,
                session_duration: preferences.sessionDuration,
                reminder_frequency: preferences.reminderFrequency,
                preferred_colors: preferences.preferredColors,
                sound_preferences: preferences.soundPreferences,
                breathing_pace: preferences.breathingPace,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('user_preferences')
                .upsert(dbData);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    }
};
