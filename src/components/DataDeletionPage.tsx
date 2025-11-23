import React, { useState } from 'react';
import { ArrowLeft, Trash2, Shield, AlertTriangle, CheckCircle, Mail, FileText, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DataDeletionPageProps {
  onPageChange: (page: string) => void;
}

export const DataDeletionPage: React.FC<DataDeletionPageProps> = ({ onPageChange }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [requestType, setRequestType] = useState<'data' | 'account' | 'both'>('both');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simular envio da solicitação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const requestData = {
        userId: user?.id,
        userEmail: user?.email,
        requestType,
        reason,
        timestamp: new Date().toISOString()
      };

      console.log('Solicitação de exclusão enviada:', requestData);
      
      // Em produção, aqui seria enviado para o backend/Supabase
      // await supabase.from('deletion_requests').insert([requestData]);
      
      setSubmitStatus('success');
      
      // Se for exclusão de conta, fazer logout após 3 segundos
      if (requestType === 'account' || requestType === 'both') {
        setTimeout(() => {
          logout();
          onPageChange('home');
        }, 3000);
      }
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onPageChange('home')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Trash2 className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exclusão de Dados e Conta
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conforme a LGPD (Lei Geral de Proteção de Dados), você tem o direito de solicitar 
              a exclusão dos seus dados pessoais e/ou conta do XZenPress.
            </p>
          </div>

          {/* LGPD Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-800 mb-2">Seus Direitos LGPD</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• <strong>Direito ao esquecimento:</strong> Exclusão completa dos seus dados</li>
                  <li>• <strong>Portabilidade:</strong> Exportar seus dados antes da exclusão</li>
                  <li>• <strong>Transparência:</strong> Saber quais dados temos sobre você</li>
                  <li>• <strong>Prazo:</strong> Processamento em até 15 dias úteis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current User Info */}
          {user && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Dados da Conta Atual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-800 ml-2">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-semibold text-gray-800 ml-2">{user.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {user.isPremium ? 'Premium' : 'Gratuito'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Criado em:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deletion Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                O que você deseja excluir? *
              </label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    value="data"
                    checked={requestType === 'data'}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Apenas meus dados pessoais</div>
                    <div className="text-sm text-gray-600">
                      Manter a conta ativa, mas excluir histórico de sessões, preferências e dados pessoais
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    value="account"
                    checked={requestType === 'account'}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Apenas minha conta</div>
                    <div className="text-sm text-gray-600">
                      Desativar conta mas manter dados anonimizados para estatísticas
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    value="both"
                    checked={requestType === 'both'}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Conta e todos os dados</div>
                    <div className="text-sm text-gray-600">
                      Exclusão completa e permanente de todos os dados e conta
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da solicitação (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Conte-nos o motivo da sua solicitação para nos ajudar a melhorar nossos serviços..."
              />
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-red-800 mb-2">⚠️ Atenção - Ação Irreversível</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Esta ação não pode ser desfeita</li>
                    <li>• Todos os dados serão permanentemente excluídos</li>
                    <li>• Você perderá acesso a recursos Premium (se aplicável)</li>
                    <li>• Histórico de sessões será completamente removido</li>
                    <li>• Será necessário criar nova conta para usar novamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Process Timeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-800 mb-4">📋 Processo de Exclusão</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-semibold text-blue-800">Solicitação Recebida</div>
                    <div className="text-blue-700 text-sm">Confirmação automática por email</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-semibold text-blue-800">Verificação de Identidade</div>
                    <div className="text-blue-700 text-sm">Validação da solicitação (1-2 dias úteis)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-semibold text-blue-800">Processamento</div>
                    <div className="text-blue-700 text-sm">Exclusão dos dados (até 15 dias úteis)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-green-800">Confirmação Final</div>
                    <div className="text-green-700 text-sm">Email de confirmação da exclusão</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-bold text-green-800">Solicitação Enviada com Sucesso!</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Você receberá um email de confirmação em breve. O processamento será iniciado em até 24h.
                    </p>
                    {(requestType === 'account' || requestType === 'both') && (
                      <p className="text-green-700 text-sm mt-2 font-semibold">
                        Você será desconectado automaticamente em alguns segundos...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h4 className="font-bold text-red-800">Erro ao Enviar Solicitação</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Tente novamente ou entre em contato conosco diretamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => onPageChange('home')}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Enviado!</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">📞 Contato Direto</h3>
            <p className="text-gray-600 mb-4">
              Para solicitações urgentes ou dúvidas sobre o processo, entre em contato diretamente:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="mailto:aleksayevacupress@gmail.com?subject=Solicitação de Exclusão de Dados - XZenPress"
                className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-800">Email</div>
                  <div className="text-blue-700 text-sm">aleksayevacupress@gmail.com</div>
                </div>
              </a>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-800">Prazo Legal</div>
                  <div className="text-gray-700 text-sm">Até 15 dias úteis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-800 mb-3">📋 Informações Legais</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Base Legal:</strong> Lei nº 13.709/2018 (LGPD) - Art. 18, inciso VI
                </p>
                <p>
                  <strong>Controlador:</strong> XZenPress Tecnologia e Bem-estar Ltda.
                </p>
                <p>
                  <strong>DPO:</strong> aleksayevacupress@gmail.com
                </p>
                <p>
                  <strong>Dados Processados:</strong> Email, nome, histórico de sessões, preferências de uso
                </p>
                <p>
                  <strong>Retenção:</strong> Dados são mantidos enquanto a conta estiver ativa ou conforme obrigações legais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};