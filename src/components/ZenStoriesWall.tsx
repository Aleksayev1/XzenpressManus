import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Star, Mic, Video, FileText, CheckCircle2, Heart, Sparkles, Plus, Filter, Volume2, Shield } from 'lucide-react';
import { ZenStory } from '../data/zenStoriesTypes';
import { ZenStoriesService } from '../services/zenStoriesService';

interface ZenStoriesWallProps {
  onOpenCaptureModal?: () => void;
  title?: string;
  subtitle?: string;
}

export const ZenStoriesWall: React.FC<ZenStoriesWallProps> = ({
  onOpenCaptureModal,
  title = "XZenPress Stories — Transformações Reais",
  subtitle = "Veja e ouça como a estimulação de pontos e o som respiratório reduziram o estresse na prática"
}) => {
  const [stories, setStories] = useState<ZenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
  const [likedStories, setLikedStories] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadStories();
    const storedLikes = localStorage.getItem('xzen_stories_helpful_likes');
    if (storedLikes) {
      try { setLikedStories(JSON.parse(storedLikes)); } catch (e) {}
    }
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await ZenStoriesService.getApprovedStories();
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao carregar histórias:', e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (story: ZenStory) => {
    if (!story.mediaUrl) return;

    if (playingStoryId === story.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingStoryId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(story.mediaUrl);
      audioRef.current = audio;
      audio.play().catch(err => console.warn('Erro ao tocar áudio:', err));
      setPlayingStoryId(story.id);

      audio.onended = () => {
        setPlayingStoryId(null);
      };
    }
  };

  const handleLike = (storyId: string) => {
    const isNew = ZenStoriesService.toggleHelpful(storyId);
    if (isNew) {
      setLikedStories(prev => [...prev, storyId]);
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, helpfulCount: (s.helpfulCount || 0) + 1 } : s));
    }
  };

  const filteredStories = stories.filter(story => {
    if (!story) return false;
    const sessionName = (story.context?.sessionName || '').toLowerCase();
    const guardian = story.context?.guardianElement || '';

    if (activeFilter === 'audio') return story.mediaType === 'audio';
    if (activeFilter === 'video') return story.mediaType === 'video';
    if (activeFilter === 'text') return story.mediaType === 'text';
    if (activeFilter === 'nervous') return sessionName.includes('nervoso') || sessionName.includes('ansiedade') || guardian === 'Fogo';
    if (activeFilter === 'sleep') return sessionName.includes('sono') || sessionName.includes('insônia') || guardian === 'Madeira';
    return true;
  });

  return (
    <section className="px-6 md:px-12 max-w-[1600px] mx-auto py-16">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Relatos Auditáveis com Contexto Clínico</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            {subtitle}
          </p>
        </div>

        {onOpenCaptureModal && (
          <button
            onClick={onOpenCaptureModal}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all active:scale-95 flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Compartilhar Minha História</span>
          </button>
        )}
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
        {[
          { id: 'all', label: '🌟 Todos os Relatos' },
          { id: 'audio', label: '🎙️ Em Áudio (Voz)' },
          { id: 'text', label: '✍️ Escritos' },
          { id: 'nervous', label: '⚡ Ansiedade & Reset Nervoso' },
          { id: 'sleep', label: '🌙 Sono & Insônia' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === f.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de Cards dos Depoimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => {
          const isLiked = likedStories.includes(story.id);
          const isPlaying = playingStoryId === story.id;
          const authorName = story.authorName || 'Praticante Zen';

          return (
            <div
              key={story.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg group hover:scale-[1.01]"
            >
              <div className="space-y-4">
                
                {/* 1. Header do Card: Autor + Badge Verificado */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=7c3aed&color=fff`}
                      alt={authorName}
                      className="w-11 h-11 rounded-2xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                        {authorName}
                        {story.verifiedTransformation && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" title="Sessão Verificada" />
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {story.authorRole ? `${story.authorRole} • ` : ''}{story.authorLocation || 'Brasil'}
                      </p>
                    </div>
                  </div>

                  {/* Estrelas */}
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(story.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* 2. Contexto Clínico (Antes x Depois) */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">SESSÃO</span>
                    <span className="text-purple-300 font-bold text-xs">{story.context?.sessionName || 'Sessão Mestra XZen'}</span>
                  </div>

                  {story.context?.beforeScore !== undefined && story.context?.afterScore !== undefined && (
                    <div className="flex items-center gap-2 bg-purple-950/40 px-2.5 py-1 rounded-xl border border-purple-500/20">
                      <span className="text-red-400 font-bold">{story.context.beforeScore}</span>
                      <span className="text-gray-500">➔</span>
                      <span className="text-emerald-400 font-bold">{story.context.afterScore}/10</span>
                    </div>
                  )}
                </div>

                {/* 3. Player de Áudio Embutido (Se o depoimento for de voz) */}
                {story.mediaType === 'audio' && story.mediaUrl && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(story)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95 ${
                        isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-500'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isPlaying ? 'Ouvindo Depoimento...' : 'Ouvir Relato em Voz'}</span>
                        </span>
                        <span>{story.durationSeconds || 24}s</span>
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full bg-purple-400 rounded-full transition-all ${isPlaying ? 'w-full duration-[24000ms]' : 'w-1/3'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Texto / Transcrição */}
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">
                  "{story.text || 'Experiência transformadora com alívio comprovado.'}"
                </p>
              </div>

              {/* 5. Rodapé do Card: Data & Curtidas */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Resultado Comprovado</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleLike(story.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isLiked 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-white/5 text-gray-400 hover:text-white border-white/5'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                  <span>{story.helpfulCount || 0} me inspirou</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};