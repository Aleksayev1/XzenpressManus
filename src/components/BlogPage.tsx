import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, Eye, Clock, Search, Filter, ArrowRight, Tag, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BlogService } from '../services/blogService';
import { BlogPost } from '../types';

interface BlogPageProps {
  onPageChange: (page: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onPageChange }) => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Helper function to get translated content
  const getTranslatedField = (post: BlogPost, field: 'title' | 'content' | 'excerpt'): string => {
    if (!language || language === 'pt') return post[field] || '';
    const langSuffix = (!language || language === 'pt') ? '' : language.charAt(0).toUpperCase() + language.slice(1);
    const translatedField = `${field}${langSuffix}` as keyof BlogPost;
    return (post[translatedField] as string) || post[field] || '';
  };

  useEffect(() => {
    loadBlogData();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      loadBlogData();
    }
  }, [searchTerm]);

  const loadBlogData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [postsData, categoriesData] = await Promise.all([
        BlogService.getPublishedPosts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          limit: 20
        }),
        BlogService.getCategories()
      ]);
      
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar blog';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBlogData();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await BlogService.searchPosts(searchTerm);
      setPosts(searchResults);
    } catch (err) {
      setError('Erro na pesquisa');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (post: BlogPost) => {
    setSelectedPost(post);
    
    // Carregar posts relacionados
    try {
      const related = await BlogService.getRelatedPosts(post.slug, post.category, 3);
      setRelatedPosts(related);
    } catch (err) {
      console.error('Erro ao carregar posts relacionados:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'acupressao': 'Acupressão',
      'respiracao': 'Respiração',
      'cromoterapia': 'Cromoterapia',
      'bem-estar-corporativo': 'Bem-estar Corporativo',
      'medicina-tradicional-chinesa': 'Medicina Tradicional Chinesa',
      'Saúde Mental': 'Saúde Mental',
      'saude-mental': 'Saúde Mental'
    };
    return categoryNames[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'acupressao': 'bg-green-100 text-green-800',
      'respiracao': 'bg-blue-100 text-blue-800',
      'cromoterapia': 'bg-purple-100 text-purple-800',
      'bem-estar-corporativo': 'bg-orange-100 text-orange-800',
      'medicina-tradicional-chinesa': 'bg-indigo-100 text-indigo-800',
      'Saúde Mental': 'bg-teal-100 text-teal-800',
      'saude-mental': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Visualização de post individual
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Voltar ao blog</span>
          </button>

          {/* Post Header */}
          <article className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {selectedPost.imageUrl && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={selectedPost.imageUrl}
                  alt={getTranslatedField(selectedPost, 'title')}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedPost.category)}`}>
                  {getCategoryName(selectedPost.category)}
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedPost.publishedAt || selectedPost.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{selectedPost.readingTime} min de leitura</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{selectedPost.views} visualizações</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {getTranslatedField(selectedPost, 'title')}
              </h1>

              {/* Author */}
              <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{selectedPost.author}</div>
                  <div className="text-sm text-gray-600">Especialista em Bem-estar Holístico</div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  style={{ whiteSpace: 'pre-line', textAlign: 'justify' }}
                >
                  {getTranslatedField(selectedPost, 'content')}
                </div>
              </div>

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Artigos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {post.imageUrl && (
                      <div
                        className="h-40 overflow-hidden cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <img
                          src={post.imageUrl}
                          alt={getTranslatedField(post, 'title')}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(post.category)}`}>
                        {getCategoryName(post.category)}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{getTranslatedField(post, 'title')}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{getTranslatedField(post, 'excerpt')}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        <span>{post.readingTime} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Experimente na Prática</h2>
            <p className="text-blue-100 mb-6">
              Coloque em prática o que aprendeu com nossa plataforma interativa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onPageChange('breathing')}
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Respiração 4-7-8
              </button>
              <button
                onClick={() => onPageChange('acupressure')}
                className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Pontos de Acupressão
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Blog XZenPress
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conteúdo especializado sobre bem-estar holístico, acupressão, respiração e saúde mental
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar artigos..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Carregando artigos...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-700">Erro ao carregar blog: {error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && (
          <>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    {/* Featured Image */}
                    {post.imageUrl && (
                      <div
                        className="h-48 overflow-hidden cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <img
                          src={post.imageUrl}
                          alt={getTranslatedField(post, 'title')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getCategoryColor(post.category)}`}>
                        {getCategoryName(post.category)}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {getTranslatedField(post, 'title')}
                      </h2>

                      {/* Excerpt */}
                      {getTranslatedField(post, 'excerpt') && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {getTranslatedField(post, 'excerpt')}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readingTime} min</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read More */}
                      <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                        <span>Ler artigo completo</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'Nenhum artigo encontrado' : 'Nenhum artigo disponível'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Tente pesquisar com outros termos ou explore diferentes categorias'
                    : 'Em breve teremos conteúdo incrível sobre bem-estar holístico'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Limpar Pesquisa
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">📧 Receba Conteúdo Exclusivo</h2>
          <p className="text-xl mb-6 opacity-90">
            Artigos semanais sobre bem-estar holístico direto no seu email
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Inscrever-se
            </button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Sem spam • Cancele quando quiser • Conteúdo de qualidade garantido
          </p>
        </div>

        {/* Featured Categories */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { category: 'acupressao', icon: '🫴', title: 'Acupressão', desc: 'Pontos terapêuticos MTC' },
            { category: 'respiracao', icon: '🧘', title: 'Respiração', desc: 'Técnicas de respiração' },
            { category: 'cromoterapia', icon: '🎨', title: 'Cromoterapia', desc: 'Terapia das cores' },
            { category: 'bem-estar-corporativo', icon: '🏢', title: 'Corporativo', desc: 'Bem-estar empresarial' }
          ].map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-gray-600 text-sm">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};