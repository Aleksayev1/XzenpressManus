import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export class BlogAdminService {
  /**
   * Cria um novo post
   */
  static async createPost(post: Partial<BlogPost>): Promise<BlogPost> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const readingTime = this.calculateReadingTime(post.content || '');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: this.generateSlug(post.title || ''),
        content: post.content,
        excerpt: post.excerpt || this.generateExcerpt(post.content || ''),
        author: post.author || user.user.email || 'XZenPress Team',
        author_email: post.authorEmail || user.user.email,
        author_id: user.user.id,
        image_url: post.imageUrl || '',
        category: post.category || 'geral',
        tags: post.tags || [],
        published: post.published || false,
        published_at: post.published ? new Date().toISOString() : null,
        reading_time: readingTime
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }

    return this.mapDatabaseToPost(data);
  }

  /**
   * Atualiza um post existente
   */
  static async updatePost(postId: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.content) {
      updateData.reading_time = this.calculateReadingTime(updates.content);
    }

    if (updates.published && !updates.publishedAt) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar post:', error);
      throw error;
    }

    return this.mapDatabaseToPost(data);
  }

  /**
   * Deleta um post
   */
  static async deletePost(postId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  }

  /**
   * Busca todos os posts (incluindo não publicados) para admin
   */
  static async getAllPosts(): Promise<BlogPost[]> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      throw error;
    }

    return (data || []).map(this.mapDatabaseToPost);
  }

  /**
   * Busca post por ID
   */
  static async getPostById(postId: string): Promise<BlogPost | null> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDatabaseToPost(data);
  }

  /**
   * Gera um slug a partir do título
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Gera um excerpt a partir do conteúdo
   */
  private static generateExcerpt(content: string, maxLength: number = 200): string {
    const cleanContent = content.replace(/[#*_`]/g, '').trim();
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    return cleanContent.substring(0, maxLength).trim() + '...';
  }

  /**
   * Calcula tempo de leitura baseado no conteúdo (200 palavras por minuto)
   */
  private static calculateReadingTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  /**
   * Mapeia dados do banco para o tipo BlogPost
   */
  private static mapDatabaseToPost(data: any): BlogPost {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      authorEmail: data.author_email,
      imageUrl: data.image_url,
      category: data.category,
      tags: data.tags || [],
      published: data.published,
      publishedAt: data.published_at,
      views: data.views || 0,
      readingTime: data.reading_time || 5,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
