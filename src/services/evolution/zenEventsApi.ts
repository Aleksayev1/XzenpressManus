import { supabase } from '../../lib/supabase';
import { ZenEvent } from '../../types/nutriming';

export const zenEventsApi = {
  async save(event: ZenEvent, userId: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase
      .from('zen_events')
      .insert({
        id: event.id,
        user_id: userId,
        type: event.type,
        timestamp: event.timestamp,
        timezone: event.timezone,
        data: event.data,
        provenance: event.provenance,
        created_at: event.createdAt
      });

    if (error) {
      console.error('Error saving ZenEvent:', error);
      throw error;
    }
  },

  async fetchByChapter(chapterId: string): Promise<ZenEvent[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('zen_events')
      .select('*')
      .eq('data->>chapterId', chapterId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching ZenEvents:', error);
      throw error;
    }

    return data.map(dbData => ({
      id: dbData.id,
      userId: dbData.user_id,
      type: dbData.type,
      timestamp: dbData.timestamp,
      timezone: dbData.timezone,
      data: dbData.data,
      provenance: dbData.provenance,
      createdAt: dbData.created_at
    })) as ZenEvent[];
  }
  async fetchAllUserEvents(userId: string): Promise<ZenEvent[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('zen_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching all user ZenEvents:', error);
      throw error;
    }

    return data.map(dbData => ({
      id: dbData.id,
      userId: dbData.user_id,
      type: dbData.type,
      timestamp: dbData.timestamp,
      timezone: dbData.timezone,
      data: dbData.data,
      provenance: dbData.provenance,
      createdAt: dbData.created_at
    })) as ZenEvent[];
  }
};
