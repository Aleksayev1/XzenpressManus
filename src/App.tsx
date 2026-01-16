import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { BreathingExercise } from './components/BreathingExercise';
import { AcupressurePage } from './components/AcupressurePage';

import { PremiumStructure } from './components/PremiumStructure';
import { CorporatePlansPage } from './components/CorporatePlansPage';
import { DashboardPage } from './components/DashboardPage';
import { SoundsLibraryPage } from './components/SoundsLibraryPage';
import { ProgressTrackingPage } from './components/ProgressTrackingPage';
import { PersonalizationPage } from './components/PersonalizationPage';
import { DataDeletionPage } from './components/DataDeletionPage';
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

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showTutorial, setShowTutorial] = useState(false);
  const { user } = useAuth();

  const [isImpactMode, setIsImpactMode] = useState(false);

  // Monitorar login do usuário e redirecionar
  React.useEffect(() => {
    // Se usuário acabou de fazer login e está na página de login, redirecionar para home
    if (user) {
      if (currentPage === 'login') {
        setCurrentPage('home');
      }

      // Se tiver hash de access_token na URL e o usuário já estiver logado, limpar a URL
      // Isso evita o problema de "loop" onde o hash era limpo antes do login completar
      if (window.location.hash.includes('access_token')) {
        console.log('✅ Usuário autenticado - limpando hash da URL de forma segura');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [user, currentPage]);

  // Detectar callbacks OAuth e Spotify
  React.useEffect(() => {
    const hash = window.location.hash;

    // ✅ Verificar se é callback do Spotify (tem 'token_type=Bearer' no hash)
    const isSpotifyCallback = hash.includes('access_token') && hash.includes('token_type=Bearer');

    // Callback do Spotify tem prioridade
    if (isSpotifyCallback) {
      console.log('🟢 Spotify callback detectado - redirecionando para spotify-callback');
      setCurrentPage('spotify-callback');
      return;
    }

    // OAuth callback (Google/Supabase) - detecta pelo hash #access_token
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      console.log('🔵 OAuth callback detectado - aguardando processamento do Supabase...');

      // TENTATIVA FORÇADA DE RECUPERAR SESSÃO
      import('./lib/supabase').then(({ supabase }) => {
        if (supabase) {
          console.log('🔄 Forçando verificação de sessão...');
          supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.error('❌ Erro no getSession forçado:', error);
            if (data.session) console.log('✅ Sessão recuperada via getSession forçado:', data.session.user.email);
            else console.log('⚠️ Nenhuma sessão encontrada no getSession forçado.');
          });
        }
      });

      // NÃO limpar o hash imediatamente. O AuthContext/Supabase precisa dele.
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
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Institutional Mode Bypass
  if (isImpactMode) {
    return <ImpactPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'login':
        return <LoginPage onPageChange={setCurrentPage} />;
      case 'breathing':
        return <BreathingExercise onPageChange={setCurrentPage} />;
      case 'acupressure':
        return <AcupressurePage onPageChange={setCurrentPage} />;
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
      default:
        return <HomePage onPageChange={setCurrentPage} />;
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
      <div className="aurora-overlay"></div>
      <GlobalPlayer />

      {/* SYSTEM ERROR BANNER */}
      {sysError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000, background: 'red', color: 'white', padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          🛑 ERRO CRÍTICO: CONEXÃO COM BANCO DE DADOS (SUPABASE) NÃO CONFIGURADA. VERIFIQUE AS VARIÁVEIS DE AMBIENTE.
        </div>
      )}

      {/* Google Translate Widget */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        padding: '10px',
        textAlign: 'center',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minHeight: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginRight: '12px' }}>
          🌐 Tradutor:
        </div>
        <div style={{ backgroundColor: 'white', padding: '4px 12px', borderRadius: '6px', minWidth: '150px' }}>
          <GoogleTranslateWidget />
        </div>
      </div>

      {/* Add top margin to account for fixed translate bar */}
      <div style={{ marginTop: '55px' }}>
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />

        {renderPage()}

        {/* First Time Banner */}
        <FirstTimeBanner onStartTutorial={() => setShowTutorial(true)} />

        {/* Tutorial Modal */}
        <TutorialModal
          isVisible={showTutorial}
          onClose={() => setShowTutorial(false)}
          onPageChange={setCurrentPage}
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