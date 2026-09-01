import { supabase } from '../../lib/supabase';
import { PracticeLog } from '../../types/evolution';

export const practiceLogsApi = {
  async logPractice(log: PracticeLog): Promise<PracticeLog> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from('practice_logs')
      .insert({
        id: log.id,
        chapter_id: log.chapterId,
        micro_behavior_id: log.microBehaviorId,
        occurred_at: log.occurredAt,
        recorded_at: log.recordedAt,
        context: log.context,
        user_reflection: log.userReflection,
        outcome: log.outcome,
        zen_event_id: log.zenEventId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging practice:', error);
      throw error;
    }

    return mapDbToPracticeLog(data);
  },


  async fetchByChapterIds(chapterIds: string[]): Promise<PracticeLog[]> {
    if (!supabase || chapterIds.length === 0) return [];

    const { data, error } = await supabase
      .from('practice_logs')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('occurred_at', { ascending: true });

    if (error) {
      console.error('Error fetching practice logs by chapter ids:', error);
      throw error;
    }

    return data.map(mapDbToPracticeLog);
  }

  async fetchLogsForChapter(chapterId: string): Promise<PracticeLog[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('occurred_at', { ascending: true });

    if (error) {
      console.error('Error fetching practice logs:', error);
      throw error;
    }

    return data.map(mapDbToPracticeLog);
  }
};

function mapDbToPracticeLog(dbData: any): PracticeLog {
  return {
    id: dbData.id,
    chapterId: dbData.chapter_id,
    microBehaviorId: dbData.micro_behavior_id,
    occurredAt: dbData.occurred_at,
    recordedAt: dbData.recorded_at,
    context: dbData.context,
    userReflection: dbData.user_reflection,
    outcome: dbData.outcome,
    zenEventId: dbData.zen_event_id,
  };
}
