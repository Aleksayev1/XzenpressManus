import React, { useState } from 'react';
import { Menu, X, User, LogOut, Crown, Trash2, BookOpen, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPageView } from './GoogleAnalytics';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handlePageChange = (page: string) => {
    onPageChange(page);
    trackPageView(page, t(`nav.${page}`));
  };

  const navItems = [
    { id: 'home' },
    { id: 'acupressure' },
    { id: 'breathing' },
    { id: 'premium' },
    { id: 'corporate' },
    { id: 'blog' },
  ];

  // Adicionar itens premium apenas para usuários premium
  const premiumNavItems = [
    { id: 'dashboard' },
    { id: 'sounds' },
    { id: 'progress' },
    { id: 'personalization' },
  ];

  const allNavItems = user?.isPremium
    ? [...navItems.slice(0, 3), ...premiumNavItems, ...navItems.slice(3)]
    : navItems;

  const handleLogout = () => {
    logout();
    onPageChange('home');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange('home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/Logo Xzenpress oficial.png"
                alt="XZenPress Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback se a imagem não carregar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full items-center justify-center hidden">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                XZenPress
              </h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {allNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${currentPage === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                <span>{t(`nav.${item.id}`)}</span>
                {premiumNavItems.some(p => p.id === item.id) && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* WhatsApp Consultation Button - Only for users who paid Premium */}
            {user?.isPremium && user?.hasPaidPremium && (
              <button
                onClick={() => onPageChange('whatsapp-consultation')}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <span>Consulta</span>
              </button>
            )}





            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Tutorial Button for logged users */}
                <button
                  onClick={() => {
                    localStorage.removeItem('xzenpress_tutorial_seen');
                    localStorage.removeItem('xzenpress_banner_dismissed');
                    window.location.reload();
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Rever tutorial"
                >
                  <Play className="w-4 h-4" />
                  <span>Tutorial</span>
                </button>

                {/* Blog Admin Link - For authenticated users */}
                <button
                  onClick={() => onPageChange('blog-admin')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Administrar Blog"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Admin Blog</span>
                </button>

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  {user.isPremium && (
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1">PREMIUM</span>
                    </div>
                  )}
                </div>

                {/* Data Deletion Link - Desktop */}
                <button
                  onClick={() => onPageChange('data-deletion')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="Solicitar exclusão de dados (LGPD)"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Dados</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onPageChange('login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {allNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <span>{t(`nav.${item.id}`)}</span>
                  {premiumNavItems.some(p => p.id === item.id) && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </button>
              ))}



              {/* Mobile User Actions */}
              {user ? (
                <div className="px-3 py-2 border-t border-gray-200">
                  {/* WhatsApp Button for users who paid Premium */}
                  {user.isPremium && user.hasPaidPremium && (
                    <button
                      onClick={() => {
                        onPageChange('whatsapp-consultation');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 mb-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      <span>Consulta WhatsApp</span>
                    </button>
                  )}

                  {/* User Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    {user.isPremium && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {user.isAdmin && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full ml-2">ADMIN</span>
                    )}
                  </div>

                  {/* Data Deletion Link - Mobile */}
                  <button
                    onClick={() => {
                      onPageChange('data-deletion');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md mb-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Dados</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handlePageChange('login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {t('nav.login')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};