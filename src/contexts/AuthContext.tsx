import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  upgradeToPremium: () => void;
  confirmPremiumPayment: () => void;
  isLoading: boolean;
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

  const mapSupabaseUserToLocalUser = (supabaseUser: any) => {
    // Check if we have local overrides (like premium status saved locally for dev)
    const localData = localStorage.getItem('user');
    let isPremium = false;

    if (localData) {
      const parsed = JSON.parse(localData);
      // Only keep premium status if emails match
      if (parsed.email === supabaseUser.email) {
        isPremium = parsed.isPremium;
      }
    }

    const newUser: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
      isPremium: isPremium, // In real app, this should come from DB/Supabase claims
      isAdmin: false,
      createdAt: supabaseUser.created_at,
    };

    setUser(newUser);
    // Optimization: Don't constantly overwrite if not changed, but for now it's safe
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

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    // Não faça setIsLoading(false) aqui, pois a página vai redirecionar
  };

  // --- Premium Simulation (Keep for now, moves to Backend later) ---

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist locally for now
    }
  };

  const confirmPremiumPayment = () => {
    if (user) {
      const updatedUser = {
        ...user,
        isPremium: true,
        hasPaidPremium: true,
        premiumActivatedAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signUp,
      signInWithGoogle,
      logout,
      resetPassword,
      upgradeToPremium,
      confirmPremiumPayment,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};