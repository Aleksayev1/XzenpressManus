import { supabase } from '../../lib/supabase';
import { ChoiceRecord } from '../../types/evolution';

export const choiceRecordsApi = {
  async save(record: ChoiceRecord): Promise<ChoiceRecord> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from('choice_records')
      .insert({
        id: record.id,
        user_id: record.userId,
        chapter_id: record.chapterId,
        occurred_at: record.occurredAt,
        trigger: record.trigger,
        choice_outcome: record.choiceOutcome,
        reflection: record.reflection,
        zen_event_id: record.zenEventId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving ChoiceRecord:', error);
      throw error;
    }

    return mapDbToChoiceRecord(data);
  },


  async fetchByChapterIds(chapterIds: string[]): Promise<ChoiceRecord[]> {
    if (!supabase || chapterIds.length === 0) return [];

    const { data, error } = await supabase
      .from('choice_records')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('occurred_at', { ascending: true });

    if (error) {
      console.error('Error fetching choice records by chapter ids:', error);
      throw error;
    }

    return data.map(mapDbToChoiceRecord);
  }

  async fetchByChapter(chapterId: string): Promise<ChoiceRecord[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('choice_records')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('occurred_at', { ascending: true });

    if (error) {
      console.error('Error fetching ChoiceRecords:', error);
      throw error;
    }

    return data.map(mapDbToChoiceRecord);
  }
};

function mapDbToChoiceRecord(dbData: any): ChoiceRecord {
  return {
    id: dbData.id,
    chapterId: dbData.chapter_id,
    userId: dbData.user_id,
    occurredAt: dbData.occurred_at,
    trigger: dbData.trigger,
    choiceOutcome: dbData.choice_outcome,
    reflection: dbData.reflection,
    zenEventId: dbData.zen_event_id,
  };
}
