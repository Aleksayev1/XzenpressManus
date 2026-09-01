import { supabase } from '../../lib/supabase';
import { Chapter, ChapterStatus } from '../../types/evolution';

export const chaptersApi = {
  async createChapter(chapter: Chapter, userId: string): Promise<Chapter> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        id: chapter.id,
        user_id: userId,
        title: chapter.title,
        primary_virtue_id: chapter.primaryVirtueId,
        micro_behavior_id: chapter.microBehaviorId,
        created_at: chapter.createdAt,
        started_at: chapter.startedAt,
        draft_until: chapter.draftUntil,
    narrative_text: chapter.narrativeText,
    narrative_generated_at: chapter.narrativeGeneratedAt,
        status: chapter.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }

    return mapDbToChapter(data);
  },


  async fetchAllChapters(): Promise<Chapter[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all chapters:', error);
      throw error;
    }

    return data.map(mapDbToChapter);
  },

  async closeChapter(chapterId: string, newStatus: 'completed' | 'paused'): Promise<void> {
    await this.updateChapterStatus(chapterId, newStatus);
  },

  async fetchActiveChapter(): Promise<Chapter | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch the most recent non-archived, non-completed chapter
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['draft', 'active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Error fetching active chapter:', error);
      throw error;
    }

    return mapDbToChapter(data);
  },

  async updateChapterStatus(id: string, status: ChapterStatus): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const updateData: any = { status };
    if (status === 'completed' || status === 'archived') {
      updateData.ended_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('chapters')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating chapter status:', error);
      throw error;
    }
  }
};

// Helper function to map snake_case DB fields to camelCase React model
function mapDbToChapter(dbData: any): Chapter {
  return {
    id: dbData.id,
    title: dbData.title,
    primaryVirtueId: dbData.primary_virtue_id,
    microBehaviorId: dbData.micro_behavior_id,
    createdAt: dbData.created_at,
    startedAt: dbData.started_at,
    endedAt: dbData.ended_at,
    draftUntil: dbData.draft_until,
    status: dbData.status as ChapterStatus,
  };
}
