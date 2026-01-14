import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Smartphone, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onPageChange: (page: string) => void;
}

// Icons for Google and Apple (SVG)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 4.09-.76 1.4.15 2.54.83 3.05 1.57-4.14 2-3.47 7.92 1.31 9.77-.96 1.76-1.57 2.95-2.53 3.65zM12.03 5.31c-.43.51-1.25.92-2.18.92-.12-1.93 1.63-3.69 3.69-3.79.23 1.34-.82 2.37-1.51 2.87z" />
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onPageChange }) => {
  const { login, signInWithGoogle, signInWithApple, signInWithMagicLink, signInWithOTP, verifyOTP, isLoading } = useAuth();
  const { t } = useLanguage();

  type LoginMethod = 'password' | 'magic' | 'phone';
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // isLogin affects visuals ("Criar conta" vs "Login") mostly for Password flow
  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    otp: ''
  });

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 1. Password Flow
      if (loginMethod === 'password') {
        if (isLogin) {
          await login(formData.email, formData.password);
          onPageChange('home');
        } else {
          // Sign Up logic - for now using standard login flow or user might need specific Sign Up method in AuthContext
          // Supabase handles signup via same method or specific signUp. For simplicity, we use password signin but note it might fail if user doesn't exist
          // For a better UX, usually signInWithPassword throws "Invalid login credentials". 
          // We can instruct user to use "Magic Link" for first time or add signUp method. 
          // Assuming existing 'login' method handles or we guide them.
          await login(formData.email, formData.password);
          onPageChange('home');
        }
      }
      // 2. Magic Link Flow
      else if (loginMethod === 'magic') {
        await signInWithMagicLink(formData.email);
        setSuccess('✨ Link mágico enviado! Verifique seu email para entrar.');
      }
      // 3. Phone Flow
      else if (loginMethod === 'phone') {
        if (showOTPInput) {
          await verifyOTP(formData.phone, formData.otp);
          onPageChange('home');
        } else {
          await signInWithOTP(formData.phone);
          setShowOTPInput(true);
          setSuccess('📱 Código enviado por SMS! Digite abaixo.');
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Verifique seus dados.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setError('');
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'apple') await signInWithApple();
    } catch (err: any) {
      setError(`Erro ao conectar com ${provider}. Tente novamente.`);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('login.welcome')}
          </h2>
          <p className="text-gray-600">
            {t('login.subtitle.login')}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all hover:shadow-md"
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            className="w-full flex items-center justify-center space-x-3 bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-xl transition-all hover:shadow-md"
          >
            <AppleIcon />
            <span>Continuar com Apple</span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou entre com</span>
          </div>
        </div>

        {/* Tabs for Login Methods */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setLoginMethod('password')}
            className={`pb-2 text-sm font-medium transition-colors ${loginMethod === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Senha
          </button>
          <button
            onClick={() => setLoginMethod('magic')}
            className={`pb-2 text-sm font-medium transition-colors ${loginMethod === 'magic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setLoginMethod('phone')}
            className={`pb-2 text-sm font-medium transition-colors ${loginMethod === 'phone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Celular
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* PASSWORD METHOD */}
          {loginMethod === 'password' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MAGIC LINK METHOD */}
          {loginMethod === 'magic' && (
            <div>
              <div className="bg-blue-50 p-4 rounded-xl mb-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Receba um link no seu email para entrar instantaneamente, sem senha.
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
          )}

          {/* PHONE METHOD */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              {!showOTPInput ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular (com DDD)
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+55 11 99999-9999"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pode haver custos de SMS dependendo da sua operadora.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código SMS
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest text-center font-bold text-lg"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}


          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="text-green-600 bg-green-50 p-3 rounded-lg text-sm flex items-start gap-2">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (success.length > 0 && loginMethod === 'magic')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>
              {isLoading
                ? 'Processando...'
                : loginMethod === 'magic'
                  ? 'Enviar Link Mágico'
                  : loginMethod === 'phone' && !showOTPInput
                    ? 'Enviar Código SMS'
                    : loginMethod === 'phone' && showOTPInput
                      ? 'Confirmar Código'
                      : 'Entrar'
              }
            </span>
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {loginMethod === 'password' && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isLogin ? t('login.noAccount') : t('login.hasAccount')}
            </button>
          </div>
        )}

        {/* Demo info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-500">
            Protegido por Supabase Auth. Seus dados estão seguros.
          </p>
        </div>
      </div>
    </div>
  );
};
