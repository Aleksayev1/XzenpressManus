import React, { useState } from 'react';
import { Menu, X, User, LogOut, Crown, Trash2, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { trackPageView } from './GoogleAnalytics';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onShowTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const { user, logout } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const handlePageChange = (page: string) => {
    if (page === 'ai-assistant') {
      setShowAIPanel(true);
      trackPageView('ai-assistant', t('nav.ai-assistant'));
      return;
    }
    onPageChange(page);
    trackPageView(page, t(`nav.${page}`));
  };

  const navItems = [
    { id: 'home' },
    { id: 'ai-assistant' }, // 🚀 NOVO: Acesso direto ao Self-Oráculo
    { id: 'triad-session' }, // ✨ SESSÃO MESTRA
    { id: 'acupressure' },
    { id: 'protocols' },
    { id: 'breathing' },
    { id: 'sounds' }, // 🎵 Restored
    { id: 'nutriming-ai' }, // ⚠️ TEMPORÁRIO: Liberado para testes (sem Premium)
    { id: 'pricing' }, // 💰 NOVO: Página de preços
    { id: 'premium' },
    { id: 'corporate' },
    { id: 'blog' },
    { id: 'dashboard' }, // Added explicit dashboard item
  ];

  // Adicionar itens premium apenas para usuários premium
  const premiumNavItems = [
    { id: 'sounds' },
    { id: 'progress' },
    { id: 'personalization' },
  ];

  // Logic for Premium Users:
  // 1. Home, AI
  // 2. Nutriming (Prioritized)
  // 3. Standard Features (Acupressure, Protocols, Breathing)
  // 4. Premium Features (Sounds, Progress, Personalization)
  // 5. Blog
  // REMOVED: 'premium' link (redundant), 'corporate' (irrelevant)

  const allNavItems = user?.isPremium
    ? [
      navItems[0], // Home
      navItems[1], // AI
      navItems.find(i => i.id === 'nutriming-ai') || { id: 'nutriming-ai' }, // Nutriming (Explicit)
      navItems[2], // Triad (Sessão Mestra)
      navItems[3], // Acupressure
      navItems[4], // Protocols
      navItems[5], // Breathing
      navItems.find(i => i.id === 'dashboard') || { id: 'dashboard' }, // Dashboard (Explicit)
      ...premiumNavItems,
      navItems[11]  // Blog (was 9 before insertion of triad and pricing? No, pricing was at 8. Original was 9. New size? 0..12. Blog is 11)
    ]
    : navItems;

  // Filter out 'corporate' for logged in users to save space (Standard users)
  const displayNavItems = user && !user.isPremium
    ? allNavItems.filter(item => item.id !== 'corporate')
    : allNavItems;

  const handleLogout = () => {
    logout();
    onPageChange('home');
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
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center flex-shrink-0">
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
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hidden xl:block">
                  XZenPress
                </h1>
              </button>
            </div>

            {/* Desktop Navigation - Condensed */}
            <nav className="hidden md:flex space-x-1 items-center overflow-x-auto no-scrollbar">
              {displayNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  <span>
                    {item.id === 'nutriming-ai' ? 'Nutriming' :
                      item.id === 'personalization' ? 'Personal' :
                        t(`nav.${item.id}`)}
                  </span>
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
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-gray-700" title={user.name}>
                        {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    {user.isPremium && (
                      <button
                        onClick={() => onPageChange('premium')}
                        className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                        title="Acessar Menu Premium"
                      >
                        <Crown className="w-5 h-5 text-yellow-500" />
                        {/* <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1 hidden lg:inline">PREMIUM</span> */}
                      </button>
                    )}
                  </div>

                  {/* Data Deletion Link - Desktop */}
                  <button
                    onClick={() => onPageChange('data-deletion')}
                    className="flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors"
                    title="Solicitar exclusão de dados (LGPD)"
                  >
                    <Trash2 className="w-5 h-5" />
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
                      handlePageChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPage === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {item.id === 'nutriming-ai' ? 'Nutriming' :
                          item.id === 'personalization' ? 'Personal' :
                            t(`nav.${item.id}`)}
                      </span>
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
                        {user.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                        {user.isAdmin && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full ml-2">ADMIN</span>
                        )}
                      </div>

                      {/* Tutorial Button Removed */}

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

      {/* 🤖 Assistente IA (Self-Oráculo) */}
      <AIRecommendationsPanel
        isVisible={showAIPanel}
        onClose={() => setShowAIPanel(false)}
      />
    </>
  );
};