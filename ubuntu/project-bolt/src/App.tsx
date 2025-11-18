import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { BreathingExercise } from './components/BreathingExercise';
import { AcupressurePage } from './components/AcupressurePage';
import { PremiumPage } from './components/PremiumPage';
import { WhatsAppConsultationPage } from './components/WhatsAppConsultationPage';
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
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GoogleAnalytics } from './components/GoogleAnalytics';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showTutorial, setShowTutorial] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'login':
        return <LoginPage onPageChange={setCurrentPage} />;
      case 'breathing':
        return <BreathingExercise />;
      case 'acupressure':
        return <AcupressurePage onPageChange={setCurrentPage} />;
      case 'premium':
        return <PremiumStructure onPageChange={setCurrentPage} />;
      case 'whatsapp-consultation':
        return <WhatsAppConsultationPage onPageChange={setCurrentPage} />;
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
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <div className="min-h-screen bg-gray-50">
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
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;