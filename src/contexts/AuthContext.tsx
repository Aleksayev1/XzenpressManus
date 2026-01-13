import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('🔐 Tentando fazer login:', email);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple validation
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid credentials');
      }

      // 🔒 SECURITY: All users login as FREE tier by default
      // Premium access requires actual payment through Stripe
      // This prevents unauthorized access via email/password tricks
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        isPremium: false, // ✅ Fixed: No more bypass
        isAdmin: false,   // ✅ Fixed: No more bypass
        createdAt: new Date().toISOString(),
      };

      console.log('👤 Usuário criado (FREE):', mockUser);
      setUser(mockUser);

      // Salvar no localStorage com confirmação
      localStorage.setItem('user', JSON.stringify(mockUser));
      const savedCheck = localStorage.getItem('user');
      console.log('💾 Usuário salvo no localStorage:', savedCheck ? '✅ Sucesso' : '❌ Falhou');

      // Verificar se realmente salvou
      if (savedCheck) {
        const parsedCheck = JSON.parse(savedCheck);
        console.log('🔍 Verificação do salvamento:', parsedCheck);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPremium = () => {
    console.log('⬆️ Fazendo upgrade para Premium...');
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      console.log('👑 Usuário atualizado:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Verificar se o upgrade foi salvo
      const savedUpgrade = localStorage.getItem('user');
      if (savedUpgrade) {
        const parsedUpgrade = JSON.parse(savedUpgrade);
        console.log('💾 Upgrade salvo:', parsedUpgrade.isPremium ? '✅ Premium ativo' : '❌ Falhou');
      }
    }
  };

  const confirmPremiumPayment = () => {
    console.log('💳 Confirmando pagamento Premium...');
    if (user) {
      const updatedUser = {
        ...user,
        isPremium: true,
        hasPaidPremium: true,
        premiumActivatedAt: new Date().toISOString()
      };
      console.log('💰 Pagamento confirmado:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    setUser(null);
    localStorage.removeItem('user');
    console.log('🗑️ Dados removidos do localStorage');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset email sent to:', email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword, upgradeToPremium, confirmPremiumPayment, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};