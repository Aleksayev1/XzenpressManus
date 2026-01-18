import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Sparkles, Send } from 'lucide-react';
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
  const { login, signUp, isLoading, resetPassword, signInWithGoogle, signInWithMagicLink } = useAuth();
  const { t } = useLanguage();

  type LoginMethod = 'password' | 'magic';
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // isLogin affects visuals ("Criar conta" vs "Login") mostly for Password flow
  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 1. Password Flow
      if (loginMethod === 'password') {
        if (isLogin) {
          // LOGIN
          await login(formData.email, formData.password);
          onPageChange('home');
        } else {
          // CADASTRO
          if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem!');
            return;
          }
          if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres!');
            return;
          }
          await signUp(formData.email, formData.password, formData.name);
          setSuccess('✅ Cadastro realizado! Verifique seu email para confirmar.');
        }
      }
      // 2. Magic Link Flow
      else if (loginMethod === 'magic') {
        await signInWithMagicLink(formData.email);
        setSuccess('✨ Link mágico enviado! Verifique seu email para entrar.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Verifique seus dados.');
    }
  };



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

        {/* Google Login Button */}
        <button
          onClick={async () => {
            try {
              setError('');
              await signInWithGoogle();
            } catch (err: any) {
              setError(err.message || 'Erro ao fazer login com Google');
            }
          }}
          disabled={isLoading}
          className="w-full mb-6 flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all hover:shadow-md disabled:opacity-50"
        >
          <GoogleIcon />
          <span>Continuar com Google</span>
        </button>

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

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* PASSWORD METHOD */}
          {loginMethod === 'password' && (
            <>
              {/* Nome (apenas no cadastro) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>
              )}

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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
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

              {/* Forgot Password Link (apenas no login) */}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Confirmar Senha (apenas no cadastro) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
          )}




          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="text-green-600 bg-green-50 border border-green-200 p-4 rounded-xl text-sm">
              <div className="flex items-start gap-3 mb-2">
                <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
                <div>
                  <div className="font-semibold mb-1">{success}</div>
                  {loginMethod === 'magic' && formData.email && (
                    <div className="text-xs text-green-700 space-y-1 mt-2">
                      <p>📬 Enviamos para: <strong>{formData.email}</strong></p>
                      <p>⏰ O link expira em 1 hora</p>
                      <p>🔍 Verifique também a pasta de spam</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (success.length > 0 && (loginMethod === 'magic' || !isLogin))}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>
              {isLoading
                ? 'Processando...'
                : loginMethod === 'magic'
                  ? 'Enviar Link Mágico'
                  : isLogin
                    ? 'Entrar'
                    : 'Cadastrar'
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

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h3>
              <p className="text-gray-600 mb-6">Digite seu email e enviaremos um link para redefinir sua senha</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="text-green-600 bg-green-50 border border-green-200 p-4 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setError('');
                      setSuccess('');
                      if (!resetEmail) {
                        setError('Digite seu email');
                        return;
                      }
                      try {
                        await resetPassword(resetEmail);
                        setSuccess('✅ Email de recuperação enviado! Verifique sua caixa de entrada.');
                        setTimeout(() => {
                          setShowForgotPassword(false);
                          setResetEmail('');
                          setSuccess('');
                        }, 3000);
                      } catch (err: any) {
                        setError(err.message || 'Erro ao enviar email de recuperação');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
