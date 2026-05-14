import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { BreathingExercise } from './components/BreathingExercise';
import { AcupressurePage } from './components/AcupressurePage';
import { PricingPage } from './components/PricingPage';

import { PremiumStructure } from './components/PremiumStructure';
import { CorporatePlansPage } from './components/CorporatePlansPage';
import { DashboardPage } from './components/DashboardPage';
import { SoundsLibraryPage } from './components/SoundsLibraryPage';
import { ProgressTrackingPage } from './components/ProgressTrackingPage';
import { PersonalizationPage } from './components/PersonalizationPage';
import { DataDeletionPage } from './components/DataDeletionPage';
import { NutrimingPage } from './components/NutrimingPage';
import { BlogPage } from './components/BlogPage';
import { BlogAdminPage } from './components/BlogAdminPage';
import { FirstTimeBanner } from './components/FirstTimeBanner';
import { TutorialModal } from './components/TutorialModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { GoogleTranslateWidget } from './components/GoogleTranslateWidget';
import { SpotifyCallback } from './components/SpotifyCallback';
import PrivacyPolicy from './components/PrivacyPolicy';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { GlobalPlayer } from './components/GlobalPlayer';
import SoundFusion from './components/SoundFusion';
import { ProtocolPage } from './components/ProtocolPage';
import { ImpactPage } from './components/ImpactPage';
import { DebugAuth } from './components/DebugAuth';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { RefundPolicyPage } from './components/RefundPolicyPage';
import { YNSAStudyPage } from './pages/YNSAStudyPage';
import HormonalResearchPage from './components/HormonalResearchPage';
import { ZSResearchFloating } from './components/ZSResearchFloating';
import { ZenFlowPage } from './components/ZenFlowPage';
import { SessaoMestraPage } from './components/SessaoMestraPage';
import { ZosterMapPage } from './pages/ZosterMapPage';
import { HerpesHubPage } from './pages/HerpesHubPage';
import { PhytoLibraryPage } from './pages/PhytoLibraryPage';
import LandingPage from './components/LandingPage';
import { FeedbackPage } from './components/FeedbackPage';

import { PremiumPartnerPitch } from './pages/PremiumPartnerPitch';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [showTutorial, setShowTutorial] = useState(false);
  const { user } = useAuth();
  console.log('App Loaded vZenFlow'); // Debug loading

  const [isImpactMode, setIsImpactMode] = useState(false);

  // Monitorar login do usuário e redirecionar
  React.useEffect(() => {
    // Se usuário acabou de fazer login e está na página de login ou landing, redirecionar para home
    if (user && (currentPage === 'login' || currentPage === 'landing')) {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  // Deep Linking Support (e.g. ?page=pricing)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      setCurrentPage(pageParam);
      // Optional: Clean URL after navigation
      // window.history.replaceState({}, '', window.location.pathname); 
    }
  }, []);

  // Detectar callbacks OAuth e Spotify
  React.useEffect(() => {
    const hash = window.location.hash;

    // ✅ Verificar se é callback do Spotify (tem 'token_type=Bearer' no hash)
    const isSpotifyCallback = hash.includes('access_token') && hash.includes('token_type=Bearer');

    // Rota de Debug
    if (hash === '#debug-auth') {
      setCurrentPage('debug-auth');
    }

    // Callback do Spotify tem prioridade
    if (isSpotifyCallback) {
      console.log('🟢 Spotify callback detectado - redirecionando para spotify-callback');
      setCurrentPage('spotify-callback');
      return;
    }

    // OAuth callback (Google/Supabase) - detecta pelo hash #access_token
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      console.log('🔵 OAuth callback detectado - Tentando processamento manual...');

      const processHash = async () => {
        try {
          // 1. Extrair tokens do hash manualmente
          const params = new URLSearchParams(hash.substring(1)); // Remove o '#'
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('🗝️ Tokens encontrados manualmente no hash. Tentando setSession...');

            // Dynamic import para garantir que temos o client
            const { supabase } = await import('./lib/supabase');
            if (!supabase) throw new Error('Cliente Supabase não inicializado');

            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('❌ Erro ao definir sessão manualmente:', error);
              alert('Erro de Autenticação: ' + error.message);
            } else if (data.session) {
              console.log('✅ Sessão definida com sucesso!', data.user);
              // AGORA SIM limpa o hash, pois sessão está estabelecida
              window.history.replaceState(null, '', window.location.pathname);
              setCurrentPage('home');
              return;
            }
          }
        } catch (err: any) {
          console.error('💥 Exceção no processamento do hash:', err);
          alert('Erro crítico no login: ' + err.message);
        }
      };

      processHash();

      // NÃO limpar o hash ainda.
      return;
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const shouldBeImpact = hash === '#impact' || search.includes('page=impact');

      setIsImpactMode(prev => {
        if (prev !== shouldBeImpact) return shouldBeImpact;
        return prev;
      });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // 🛡️ Global Copy Protection
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P
      if ((e.ctrlKey || e.metaKey) && ['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Institutional Mode Bypass
  if (isImpactMode) {
    return <ImpactPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onStart={() => setCurrentPage('login')} />;
      case 'feedback':
        return <FeedbackPage onPageChange={setCurrentPage} />;
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'login':
        return <LoginPage onPageChange={setCurrentPage} />;
      case 'breathing':
        return <BreathingExercise onPageChange={setCurrentPage} />;
      case 'acupressure':
        return <AcupressurePage onPageChange={setCurrentPage} />;
      case 'pricing':
        return <PricingPage onPageChange={setCurrentPage} />;
      case 'premium':
        return <PremiumStructure onPageChange={setCurrentPage} />;
      case 'whatsapp-consultation':
        // REMOVIDO: Proteção institucional - sem consultas pessoais
        return <HomePage onPageChange={setCurrentPage} />;
      case 'corporate':
        return <CorporatePlansPage onPageChange={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onPageChange={setCurrentPage} />;
      case 'sounds':
        return <SoundsLibraryPage onPageChange={setCurrentPage} />;
      case 'progress':
        return <ProgressTrackingPage onPageChange={setCurrentPage} />;
      case 'personalization':
        return <PersonalizationPage onPageChange={setCurrentPage} />;
      case 'data-deletion':
        return <DataDeletionPage onPageChange={setCurrentPage} />;
      case 'blog':
        return <BlogPage onPageChange={setCurrentPage} />;
      case 'blog-admin':
        return <BlogAdminPage onPageChange={setCurrentPage} />;
      case 'spotify-callback':
        return <SpotifyCallback onConnect={() => setCurrentPage('sounds')} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'fusion':
        return <SoundFusion />;
      case 'protocols':
        return <ProtocolPage onPageChange={setCurrentPage} />;
      case 'debug-auth':
        return <DebugAuth />;
      case 'nutriming-ai':
        return <NutrimingPage onPageChange={setCurrentPage} />;
      case 'terms-of-service':
        return <TermsOfServicePage onPageChange={setCurrentPage} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onPageChange={setCurrentPage} />;
      case 'refund-policy':
        return <RefundPolicyPage onPageChange={setCurrentPage} />;
      case 'hormonal-research':
        return <HormonalResearchPage />;
      case 'ynsa-study':
        return <YNSAStudyPage />;
      case 'zenflow':
        return <ZenFlowPage onBack={() => setCurrentPage('home')} />;
      case 'triad-session':
        return <SessaoMestraPage onBack={() => setCurrentPage('home')} />;
      case 'zoster-map':
        return <ZosterMapPage onBack={() => setCurrentPage('home')} />;
      case 'herpes-hub':
        return <HerpesHubPage onBack={() => setCurrentPage('home')} onPageChange={setCurrentPage} />;
      case 'plantas-medicinais':
        return <PhytoLibraryPage onPageChange={setCurrentPage} />;
      case 'premium-partner':
        return <PremiumPartnerPitch onPageChange={setCurrentPage} />;
      default:
        return <LandingPage onStart={() => setCurrentPage('login')} />;
    }
  };

  // Check for configuration error
  const [sysError, setSysError] = useState(false);
  React.useEffect(() => {
    import('./lib/supabase').then(({ supabase }) => {
      if (!supabase) setSysError(true);
    });
  }, []);

  return (
    <AudioPlayerProvider>
      <GoogleAnalytics />
      <div className="aurora-overlay fixed inset-0 z-0 pointer-events-none opacity-40"></div>
      <GlobalPlayer />

      {/* SYSTEM ERROR BANNER */}
      {sysError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000, background: 'red', color: 'white', padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          🛑 ERRO CRÍTICO: CONEXÃO COM BANCO DE DADOS (SUPABASE) NÃO CONFIGURADA. VERIFIQUE AS VARIÁVEIS DE AMBIENTE.
        </div>
      )}

      {/* Google Translate Premium Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '45px'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '500', marginRight: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe className="w-4 h-4" />
          <span>Traduzir página</span>
        </div>
        <div className="premium-translate-wrapper">
          <GoogleTranslateWidget />
        </div>
      </div>

      {/* Add top margin to account for fixed translate bar */}
      <div style={{ marginTop: '55px' }}>
        {currentPage !== 'landing' && (
          <Header
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onShowTutorial={() => setShowTutorial(true)}
          />
        )}

        {renderPage()}

        {/* First Time Banner */}
        <FirstTimeBanner onStartTutorial={() => setShowTutorial(true)} />

        {/* Tutorial Modal */}
        <TutorialModal
          isVisible={showTutorial}
          onClose={() => setShowTutorial(false)}
          onPageChange={setCurrentPage}
        />

        {/* ZS Research Floating Button */}
        <ZSResearchFloating
          onEnroll={() => setCurrentPage('hormonal-research')}
        />
      </div>
    </AudioPlayerProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;