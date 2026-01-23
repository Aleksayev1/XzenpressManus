import React, { useState } from 'react';
import { Menu, X, User, LogOut, Crown, Trash2, BookOpen, Play, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { trackPageView } from './GoogleAnalytics';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onShowTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange, onShowTutorial }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const handlePageChange = (page: string) => {
    onPageChange(page);
    trackPageView(page, t(`nav.${page}`));
  };

  const navItems = [
    { id: 'home' },
    { id: 'acupressure' },
    { id: 'protocols' },
    { id: 'breathing' },
    { id: 'nutriming-ai' }, // ⚠️ TEMPORÁRIO: Liberado para testes (sem Premium)
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
    ? [...navItems.slice(0, 5), ...premiumNavItems, ...navItems.slice(6)] // Remove 'premium' (index 5)
    : navItems;

  // Filter out 'corporate' for logged in users to save space
  const displayNavItems = user
    ? allNavItems.filter(item => item.id !== 'corporate')
    : allNavItems;

  const handleLogout = () => {
    logout();
    onPageChange('home');
  };

  const handleTutorialClick = () => {
    if (onShowTutorial) {
      onShowTutorial();
    } else {
      // Fallback for restart if prop not provided (shouldn't happen in updated App)
      localStorage.removeItem('xzenpress_tutorial_seen');
      localStorage.removeItem('xzenpress_banner_dismissed');
      window.location.reload();
    }
  };

  return (
    <>
      {/* Google Translate Widget - Top Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end">
          <div id="google_translate_element"></div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-[55px] z-50">
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
              {displayNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  <span>{item.id === 'nutriming-ai' ? 'Nutriming AI' : t(`nav.${item.id}`)}</span>
                  {premiumNavItems.some(p => p.id === item.id) && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">





              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Tutorial Button for logged users */}
                  <button
                    onClick={handleTutorialClick}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Rever tutorial"
                  >
                    <Play className="w-4 h-4" />
                    <span>Tutorial</span>
                  </button>

                  {/* Blog Admin Link - Only for admin users */}
                  {user.isAdmin && (
                    <button
                      onClick={() => onPageChange('blog-admin')}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Administrar Blog"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Admin Blog</span>
                    </button>
                  )}

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
                {displayNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPage === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.id === 'nutriming-ai' ? 'Nutriming AI' : t(`nav.${item.id}`)}</span>
                      {premiumNavItems.some(p => p.id === item.id) && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </button>
                ))}

                <div className="border-t border-gray-200 mt-4 pt-4">
                  {user ? (
                    <>
                      <div className="flex items-center px-3 mb-4">
                        <User className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="text-gray-700 font-medium">{user.name}</span>
                      </div>

                      <button
                        onClick={() => {
                          handleTutorialClick();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Rever Tutorial</span>
                        </div>
                      </button>

                      {/* Blog Admin Link - Only for admin users (Mobile) */}
                      {user.isAdmin && (
                        <button
                          onClick={() => {
                            onPageChange('blog-admin');
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50"
                        >
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Admin Blog</span>
                          </div>
                        </button>
                      )}

                      {/* WhatsApp Button removed */}

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
                    </>
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
            </div>
          )}
        </div>
      </header>
    </>
  );
};