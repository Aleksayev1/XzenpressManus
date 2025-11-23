import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GoogleAnalytics = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Configurar propriedades do usuário para analytics
    if (typeof window !== 'undefined' && window.gtag) {
      // Configurar ID do usuário (se logado)
      if (user) {
        window.gtag('config', 'G-Y74MT1V5JC', {
          user_id: user.id,
          custom_map: {
            'dimension1': 'user_type'
          }
        });

        // Definir propriedades customizadas
        window.gtag('set', {
          'user_type': user.isPremium ? 'premium' : 'free',
          'user_properties': {
            'account_type': user.isPremium ? 'premium' : 'free',
            'is_admin': user.isAdmin || false
          }
        });
      }
    }
  }, [user]);

  return null; // Este componente não renderiza nada
};

// Funções utilitárias para tracking de eventos
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: eventName,
      ...parameters
    });
  }
};

export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      custom_page_name: pageName
    });
  }
};

export const trackBreathingSession = (duration: number, completed: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'breathing_session', {
      event_category: 'wellness',
      event_label: completed ? 'completed' : 'started',
      value: duration,
      custom_parameters: {
        session_type: 'breathing_4_7_8',
        duration_seconds: duration,
        completed: completed
      }
    });
  }
};

export const trackAcupressureSession = (pointId: string, duration: number, isIntegrated: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'acupressure_session', {
      event_category: 'wellness',
      event_label: pointId,
      value: duration,
      custom_parameters: {
        point_id: pointId,
        session_type: isIntegrated ? 'integrated_therapy' : 'acupressure_only',
        duration_seconds: duration
      }
    });
  }
};

export const trackPremiumUpgrade = (planType: string, paymentMethod: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `upgrade_${Date.now()}`,
      value: planType === 'monthly' ? 5.99 : planType === 'annual' ? 59.99 : 199.99,
      currency: 'USD',
      items: [{
        item_id: `xzenpress_premium_${planType}`,
        item_name: `XZenPress Premium ${planType}`,
        category: 'subscription',
        quantity: 1,
        price: planType === 'monthly' ? 5.99 : planType === 'annual' ? 59.99 : 199.99
      }],
      custom_parameters: {
        plan_type: planType,
        payment_method: paymentMethod
      }
    });
  }
};

export const trackCorporateLead = (planType: string, employeeCount: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'business',
      event_label: `corporate_${planType}`,
      value: 1,
      custom_parameters: {
        lead_type: 'corporate',
        plan_type: planType,
        employee_count: employeeCount
      }
    });
  }
};

export const trackLanguageChange = (fromLanguage: string, toLanguage: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'language_change', {
      event_category: 'user_preference',
      event_label: `${fromLanguage}_to_${toLanguage}`,
      custom_parameters: {
        from_language: fromLanguage,
        to_language: toLanguage
      }
    });
  }
};