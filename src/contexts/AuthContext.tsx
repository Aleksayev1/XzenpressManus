import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  upgradeToPremium: () => void;
  confirmPremiumPayment: () => void;
  isLoading: boolean;
  // New Auth Methods
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Auth State Listener
  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUserToLocalUser(session.user);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUserToLocalUser(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUserToLocalUser = async (supabaseUser: any) => {
    // ✅ LISTA VIP (Acesso Liberado Manualmente)
    const VIP_EMAILS = ['camilla.vieira19@gmail.com'];

    // ✅ SEGURO: Verificar status Premium no banco de dados
    let isPremium = false;
    let hasPaidPremium = false;
    let premiumActivatedAt: string | undefined;
    let premiumExpiresAt: string | undefined;
    let subscriptionId: string | undefined;

    try {
      if (!supabase) {
        console.warn('⚠️ Supabase client não inicializado em mapSupabaseUserToLocalUser');
        return;
      }

      // Buscar assinatura ativa do usuário
      const { data: subscription, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && subscription) {
        // Verificar se não expirou
        const now = new Date();
        const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;

        isPremium = !expiresAt || expiresAt > now;
        hasPaidPremium = isPremium;
        premiumActivatedAt = subscription.activated_at;
        premiumExpiresAt = subscription.expires_at || undefined;
        subscriptionId = subscription.id;

        console.log('✅ Status Premium verificado:', {
          isPremium,
          expiresAt: expiresAt?.toISOString() || 'lifetime',
          subscriptionId
        });
      } else {
        console.log('ℹ️ Nenhuma assinatura Premium ativa encontrada');
        if (error) {
          console.error('❌ Erro ao buscar assinatura premium para o usuário:', {
            userId: supabaseUser.id,
            email: supabaseUser.email,
            error
          });
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar Premium:', err);
      // Em caso de erro, assume que não é Premium (fail-safe)
    }

    // 🌟 VIP OVERRIDE: Forçar Premium se estiver na lista VIP
    if (supabaseUser.email && VIP_EMAILS.includes(supabaseUser.email.toLowerCase())) {
      console.log('🌟 Usuário VIP detectado! Acesso Premium liberado:', supabaseUser.email);
      isPremium = true;
      hasPaidPremium = true; // Para evitar prompts de upgrade
    }

    const newUser: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
      isPremium: isPremium, // ✅ Agora vem do banco de dados!
      hasPaidPremium,
      premiumActivatedAt,
      premiumExpiresAt,
      subscriptionId,
      isAdmin: false,
      createdAt: supabaseUser.created_at,
    };

    setUser(newUser);
    // Salvar no localStorage para cache (mas não confiar nele para validação)
    localStorage.setItem('user', JSON.stringify(newUser));
  };


  // --- Existing Methods Updated ---

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      // Supabase pode exigir confirmação de email
      if (data.user && !data.session) {
        throw new Error("✉️ Verifique seu email para confirmar o cadastro!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- New Methods ---

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      // Usar URL de produção ou fallback para origin atual
      const redirectUrl = import.meta.env.PROD
        ? 'https://xzenpress.com'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Forçar popup em mobile (melhor UX)
          skipBrowserRedirect: false
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error("Google Auth Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      // Usar URL de produção ou fallback para origin atual
      const redirectUrl = import.meta.env.PROD
        ? 'https://xzenpress.com'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Apple Auth Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const redirectUrl = import.meta.env.PROD
        ? 'https://xzenpress.com'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          // Opções adicionais
          shouldCreateUser: true, // Criar usuário automaticamente se não existir
          data: {
            // Metadata adicional
            source: 'magic_link',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOTP = async (phone: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { error } = await supabase.auth.signInWithOtp({
        phone
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // --- Premium Simulation (Keep for now, moves to Backend later) ---

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist locally for now
    }
  };

  const confirmPremiumPayment = async () => {
    // ✅ SEGURO: Re-verificar autenticação para puxar novo status do banco
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await mapSupabaseUserToLocalUser(session.user);
      console.log('✅ Status Premium atualizado após pagamento');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signUp,
      logout,
      resetPassword,
      upgradeToPremium,
      confirmPremiumPayment,
      isLoading,
      signInWithGoogle,
      signInWithApple,
      signInWithMagicLink,
      signInWithOTP,
      verifyOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};