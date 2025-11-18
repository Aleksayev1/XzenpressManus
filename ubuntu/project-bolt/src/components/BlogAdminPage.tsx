import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Calendar, Clock, Tag, Image as ImageIcon, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BlogAdminService } from '../services/blogAdminService';
import { BlogPost } from '../types';

interface BlogAdminPageProps {
  onPageChange: (page: string) => void;
}

export const BlogAdminPage: React.FC<BlogAdminPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'acupressao',
    tags: '',
    imageUrl: '',
    published: false
  });

  useEffect(() => {
    if (!user) {
      onPageChange('login');
      return;
    }
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const allPosts = await BlogAdminService.getAllPosts();
      setPosts(allPosts);
    } catch (err) {
      setError('Erro ao carregar posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'acupressao',
      tags: '',
      imageUrl: '',
      published: false
    });
  };

  const handleEdit = (post: BlogPost) => {
    setIsCreating(false);
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      imageUrl: post.imageUrl || '',
      published: post.published
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: tagsArray,
        imageUrl: formData.imageUrl,
        published: formData.published
      };

      if (isCreating) {
        await BlogAdminService.createPost(postData);
      } else if (editingPost) {
        await BlogAdminService.updatePost(editingPost.id, postData);
      }

      setIsCreating(false);
      setEditingPost(null);
      loadPosts();
    } catch (err) {
      setError('Erro ao salvar post');
      console.error(err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) {
      return;
    }

    try {
      await BlogAdminService.deletePost(postId);
      loadPosts();
    } catch (err) {
      setError('Erro ao deletar post');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado para acessar o admin</p>
          <button
            onClick={() => onPageChange('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administração do Blog</h1>
              <p className="text-gray-600">Gerencie seus artigos e conteúdos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onPageChange('blog')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Ver Blog Público
            </button>
            {!isCreating && !editingPost && (
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Post</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Editor Form */}
        {(isCreating || editingPost) && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreating ? 'Criar Novo Post' : 'Editar Post'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título do post..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Categoria e Imagem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="acupressao">Acupressão</option>
                    <option value="respiracao">Respiração</option>
                    <option value="cromoterapia">Cromoterapia</option>
                    <option value="bem-estar-corporativo">Bem-estar Corporativo</option>
                    <option value="medicina-tradicional-chinesa">Medicina Tradicional Chinesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da Imagem
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="/caminho/imagem.jpg"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resumo (Excerpt)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Digite um breve resumo do post..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conteúdo * (Markdown suportado)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo completo do post..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="acupressão, bem-estar, saúde..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Publicar */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Publicar imediatamente
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar Post</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {!isCreating && !editingPost && (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar posts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Carregando posts...</span>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {!loading && (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {post.published ? (
                              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                <Eye className="w-3 h-3" />
                                <span>Publicado</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                                <EyeOff className="w-3 h-3" />
                                <span>Rascunho</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500">{post.category}</span>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.readingTime} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views} views</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nenhum post encontrado
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Tente pesquisar com outros termos' : 'Comece criando seu primeiro post'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
