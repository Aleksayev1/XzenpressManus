import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, Crown, BookOpen, Globe, ChevronDown, Zap, Activity, Waves, Database, MessageSquare, Briefcase, Brain, Wind, TrendingUp, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPageView } from './GoogleAnalytics';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onShowTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePageChange = (page: string) => {
    if (page === 'ai-assistant') {
      onPageChange('triad-session');
      trackPageView('triad-session', 'Sessão Mestra');
      return;
    }
    onPageChange(page);
    trackPageView(page, t(`nav.${page}`) || page);
  };

  const handleLogout = () => {
    logout();
    onPageChange('home');
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Nav configuration
  const headerNavItems: NavItem[] = [
    { id: 'home', label: t('nav.home') },
    { id: 'ai-assistant', label: 'Self Oracle' },
    { id: 'triad-session', label: t('nav.triad-session') },
  ];

  const libraryItems: NavItem[] = [
    { id: 'mapa-vivo', label: '🗺️ Mapa Vivo', icon: <span className="text-base">🌳</span> },
    { id: 'acupressure', label: t('nav.acupressure'), icon: <Zap className="w-4 h-4" /> },
    { id: 'breathing', label: t('nav.breathing'), icon: <Activity className="w-4 h-4" /> },
    { id: 'sounds', label: t('nav.sounds'), icon: <Waves className="w-4 h-4" /> },
    { id: 'zenflow', label: 'ZenFlow', icon: <Wind className="w-4 h-4 text-purple-600" /> },
    { id: 'nutriming-ai', label: 'Nutriming', icon: <Zap className="w-4 h-4 text-green-500" /> },
    { id: 'plantas-medicinais', label: 'Plantas Medicinais', icon: <BookOpen className="w-4 h-4 text-emerald-600" /> },
    { id: 'protocols', label: t('nav.protocols'), icon: <Database className="w-4 h-4" /> },
    { id: 'zoster-map', label: 'Mapa Zoster', icon: <Activity className="w-4 h-4 text-red-400" /> },
    { id: 'hormonal-research', label: 'Estudo ZS', icon: <Brain className="w-4 h-4 text-purple-500" /> },
    { id: 'fusion', label: 'Fusão de Sons', icon: <Music className="w-4 h-4 text-pink-400" /> },
    { id: 'progress', label: 'Monitoramento', icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
    { id: 'device-sync', label: 'Dispositivos (VFC)', icon: <Activity className="w-4 h-4 text-cyan-500" /> },
  ];

  const communityItems: NavItem[] = [
    { id: 'blog', label: 'Blog', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'corporate', label: 'Corporativo', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'pricing', label: 'Planos', icon: <Globe className="w-4 h-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
  ];

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end">
          <div id="google_translate_element"></div>
        </div>
      </div>

      <header className="bg-white shadow-lg sticky top-[55px] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4" ref={dropdownRef}>
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => handlePageChange('home')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/Logo Xzenpress oficial.png"
                  alt="XZenPress Logo"
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hidden xl:block">
                  XZenPress
                </h1>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 items-center">
              {headerNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                    currentPage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Biblioteca Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('library')}
                  className={`px-3 py-2 rounded-md text-sm font-bold flex items-center gap-1 transition-all ${
                    activeDropdown === 'library' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>Biblioteca</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'library' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'library' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[60]">
                    {libraryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { handlePageChange(item.id); setActiveDropdown(null); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <span className="text-blue-400">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Explorar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('community')}
                  className={`px-3 py-2 rounded-md text-sm font-bold flex items-center gap-1 transition-all ${
                    activeDropdown === 'community' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>Explorar</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'community' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'community' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[60]">
                    {communityItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { handlePageChange(item.id); setActiveDropdown(null); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <span className="text-purple-400">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('profile')}
                    className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'profile' && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl py-3 z-[60]">
                      <div className="px-4 pb-3 border-b border-gray-100 mb-2">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.isPremium && (
                          <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" /> PREMIUM
                          </span>
                        )}
                      </div>
                      <button onClick={() => { handlePageChange('dashboard'); setActiveDropdown(null); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 group transition-colors">
                        <User className="w-4 h-4 text-gray-400 group-hover:text-blue-600" /> <span>{t('nav.dashboard')}</span>
                      </button>
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold mt-2 pt-2 border-t border-gray-100 transition-colors">
                        <LogOut className="w-4 h-4" /> <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handlePageChange('login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 p-2">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden pb-6 animate-in fade-in slide-in-from-top-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-2xl mt-2 border border-gray-100 shadow-inner">
                {([...headerNavItems, ...libraryItems, ...communityItems] as NavItem[]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { handlePageChange(item.id); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-bold transition-all ${
                      currentPage === item.id ? 'text-blue-600 bg-blue-100/50' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon && <span className="text-gray-400">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                ))}
                {user ? (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button onClick={() => { handlePageChange('dashboard'); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700">
                      <User className="w-4 h-4" /> <span>Painel</span>
                    </button>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600">
                      <LogOut className="w-4 h-4" /> <span>Sair</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4">
                    <button onClick={() => { handlePageChange('login'); setIsMenuOpen(false); }} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold">
                      {t('nav.login')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AIRecommendationsPanel isVisible={showAIPanel} onClose={() => setShowAIPanel(false)} />
    </>
  );
};